/**
 * Downloads all relevant data from the server and stores data locally using IDB.
 *
 * Export:
 *     initLocalData
 *
 * Code Sections:
 *     DOWNLOAD DATA
 *     DERIVE DATA
 *         TAXON DATA
 *         LOCATION DATA
 *         SOURCE DATA
 *         INTERACTION DATA
 *         USER LIST DATA
 *         HELPERS
 *    STORE DATA
 */
import * as _u from '../util.js';
import { resetDataTable } from '../db-page.js';

const localData = {};
/* ======================= DOWNLOAD DATA ==================================== */
/**
 * The first time a browser visits the search page all entity data is downloaded
 * from the server and stored locally @storeEntityData. Database search page 
 * table build begins @initSearchState.
 * Entities downloaded with each ajax call:
 *   /taxon - Taxon, Realm, Level 
 *   /location - HabitatType, Location, LocationType, GeoJson
 *   /source - Author, Citation, CitationType, Publication, PublicationType, 
 *       Source, SourceType, Tag
 *   /interaction - Interaction, InteractionType  
 */
export default function initLocalData(reset) {                                  console.log("   --initLocalData");
    return $.when(
        $.ajax("ajax/taxon"), $.ajax("ajax/location"), 
        $.ajax("ajax/source"), $.ajax("ajax/interaction"),
        $.ajax("ajax/lists"),  $.ajax("ajax/data-state")
    ).then((a1, a2, a3, a4, a5, a6) => {                                        console.log("       --Ajax success: args = %O", arguments); 
        $.each([a1, a2, a3, a4, a5], (idx, a) => storeServerData(a[0]));
        deriveAndStoreAdditionalData([a1[0], a2[0], a3[0], a4[0], a5[0]]);
        addDataToLocalDb(a6[0])
        .then(loadDatabaseTable)
    });

    function loadDatabaseTable() {
        if (reset) { resetDataTable('taxa'); 
        } else { initSearchState(); }
        // return Promise.resolve();
    }
}
/**
 * Loops through the data object returned from the server, parsing and storing
 * the entity data.
 */
function storeServerData(data) {                                                //console.log("data received = %O", data);
    for (let entity in data) {                                                  //console.log("entity = %s, data = %O", entity, rcrdData);
        storeData(entity, parseData(data[entity]));
    }
}
/**
 * Loops through the passed data object to parse the nested objects. This is 
 * because the data comes back from the server having been double JSON-encoded,
 * due to the 'serialize' library and the JSONResponse object. 
 */
function parseData(data) {  //shared. refact
    for (let k in data) { data[k] = JSON.parse(data[k]); }
    return data;
}
/* ======================= DERIVE DATA ====================================== */
/** Stores data arranged as needed for use throughout the database features. */
function deriveAndStoreAdditionalData(data) {
    deriveTaxonData(data[0]);
    deriveLocationData(data[1]);
    deriveSourceData(data[2]);
    deriveInteractionData(data[3]);
    deriveUserNamedListData(data[4]);
    storeData('user', $('body').data('user-name'));
}
/* -------------------------- TAXON DATA ------------------------------------ */
/** 
 * objectRealmNames - an object with each object realm (k) and id.
 * levelNames - an object with each level name (k) and it's id and ordinal (v).
 * [realm][level]Names - object with all taxa in realm at the level: name (k) id (v)
 * *realm - resaved with 'uiLevelsShown' filled with the level display names. 
 */ 
/** Stores an object of taxon names and ids for each level in each realm. */
function deriveTaxonData(data) {                                                //console.log("deriveTaxonData called. data = %O", data);
    storeData('objectRealmNames', getObjectRealmNames(data.realm));
    storeLevelNames(data.level);
    storeTaxaByLevelAndRealm(data.taxon);
    storeRealmLevelData(data.realm);
}
function getObjectRealmNames(realms) {                                          //console.log('getObjectRealmNames. [%s] realms = %O',Object.keys(realms).length, realms);
    const data = {};
    Object.keys(realms).forEach(i => {
        if (realms[i].displayName === 'Bat') { return; }  
        data[realms[i].displayName] = realms[i].id;
    });
    return data;
}
function storeLevelNames(levelData) {
    const levels = {};
    const order = Object.keys(levelData).sort(orderLevels);                     
    $(order).each(addLevelData);   
    storeData('levelNames', levels);
    
    function orderLevels(a, b) {
        const x = levelData[a].ordinal;
        const y = levelData[b].ordinal;
        return x<y ? -1 : x>y ? 1 : 0;
    }
    function addLevelData(i, id) {
        return levels[levelData[id].displayName] = {id: id, ord: i+1};
    }
}
function storeTaxaByLevelAndRealm(taxa) {
    const realmData = separateTaxaByLevelAndRealm(taxa);                          //console.log("taxonym realmData = %O", realmData);
    for (let realm in realmData) {  
        storeTaxaByLvl(realm, realmData[realm]);
    }
}
function storeTaxaByLvl(realm, taxonObj) {
    for (let level in taxonObj) {                                               //console.log("storing as [%s] = %O", realm+level+'Names', taxonObj[level]);
        storeData(realm+level+'Names', taxonObj[level]);
    }
}
/** Each taxon is sorted by realm and then level. 'Animalia' is skipped. */
function separateTaxaByLevelAndRealm(taxa) {  
    const data = {};
    Object.keys(taxa).forEach(id => addTaxonData(taxa[id], id));
    return data;
    /** Adds the taxon's name (k) and id to it's level's obj. */
    function addTaxonData(taxon, id) {
        if (taxon.slug === 'animalia') { return delete taxa[id]; } //not shown anywhere
        const realmObj = getRealmObj(taxon);
        const level = taxon.level.displayName;  
        addToRealmLevel(taxon, realmObj, level);
    }
    function addToRealmLevel(taxon, realmObj, level) {
        if (!realmObj[level]) { realmObj[level] = {}; }; 
        realmObj[level][taxon.displayName] = taxon.id;
    }
    function getRealmObj(taxon) {
        const realm = taxon.realm.displayName
        if (!data[realm]) { data[realm] = {}; }
        return data[realm];
    }
} /* End separateTaxaByLevelAndRealm */
function storeRealmLevelData(realms) {                                          //console.log('realms = %O', realms);
    addRealmLevelData(Object.keys(realms));
    storeData('realm', realms);  
    
    function addRealmLevelData(realmIds) {
        for (let i = 0; i < realmIds.length; i++) {
            const realm = realms[realmIds[i]];
            const lvlIdAry = JSON.parse(realm.uiLevelsShown);
            realm.uiLevelsShown = lvlIdAry.map(getLevelDisplayName);
        }
    }
    function getLevelDisplayName(id) {
        return localData.level[id].displayName;
    }
}
/* ----------------------- LOCATION DATA ------------------------------------ */
/** 
 * [entity]Names - an object with each entity's displayName(k) and id.
 * *location - resaved locations with an additional data point for countries. 
 */
function deriveLocationData(data) {                                     //console.log('loc data to store = %O', data);
    const regns = getTypeObj(data.locationType, 'region', 'locations');
    const cntries = getTypeObj(data.locationType, 'country', 'locations');       //console.log('reg = %O, cntry = %O', regns, cntries);
    storeData('countryNames', getNameDataObj(cntries, data.location));
    storeData('countryCodes', getCodeNameDataObj(cntries, data.location));
    storeData('regionNames', getNameDataObj(regns, data.location));
    storeData('topRegionNames', getTopRegionNameData(data, regns));
    storeData('habTypeNames', getTypeNameData(data.habitatType));
    storeData('locTypeNames', getTypeNameData(data.locationType));
    storeData('location', addInteractionTotalsToLocs(data.location));
}
/** Return an obj with the 2-letter ISO-country-code (k) and the country id (v).*/
function getCodeNameDataObj(ids, rcrds) { 
    const data = {};
    ids.forEach(id => data[rcrds[id].isoCode] = id);                            //console.log("codeNameDataObj = %O", data);
    return data;
}
function getTopRegionNameData(locData, regns) {  
    const data = {};
    const rcrds = getEntityRcrds(regns, locData.location);
    for (const id in rcrds) { 
        if (!rcrds[id].parent) { data[rcrds[id].displayName] = id; }
    }
    return data;
}
/** Adds the total interaction count of the location and it's children. */
function addInteractionTotalsToLocs(locs) {  
    for (let id in locs) {  
        locs[id].totalInts = getTotalInteractionCount(locs[id]);                //console.log('[%s] total = [%s]', locs[id].displayName, locs[id].totalInts);
    }
    return locs;

    function getTotalInteractionCount(loc) {    
        let ttl = loc.interactions.length;
        if (!loc.children.length) { return ttl; }
        loc.children.forEach(function(id) {
            let child = locs[id];
            ttl += getTotalInteractionCount(child);
        });
        return ttl;
    }
} /* End addInteractionTotalsToLocs */
/* ------------------------- SOURCE DATA ------------------------------------ */
/** Note: Top regions are the trunk of the location data tree. */
/**
 * [entity]Names - an object with each entity's displayName(k) and id.
 * [entity]Sources - an array with of all source records for the entity type.
 */
function deriveSourceData(data) {                                       //console.log("source data = %O", data);
    const authSrcs = getTypeObj(data.sourceType, 'author', 'sources');
    const pubSrcs = getTypeObj(data.sourceType, 'publication', 'sources');
    const publSrcs = getTypeObj(data.sourceType, 'publisher', 'sources'); 
    storeData('authSrcs', authSrcs);         
    storeData('pubSrcs', pubSrcs);              
    storeData('publSrcs', publSrcs);
    storeData('citTypeNames', getTypeNameData(data.citationType));        
    storeData('pubTypeNames', getTypeNameData(data.publicationType));        
}
/* -------------------- INTERACTION DATA ------------------------------------ */
/**
 * [entity]Names - an object with each entity's displayName(k) and id.
 * [entity]Tags - an object with each entity tag's displayName and id.
 */
function deriveInteractionData(data) {
    storeData('intTypeNames', getTypeNameData(data.interactionType));
    storeData('interactionTags', getTagData(data.tag, "Interaction"));        
}   
/** Returns an object with a record (value) for each id (key) in passed array.*/
function getEntityRcrds(ids, rcrds) {
    const data = {};
    ids.forEach(function(id) { data[id] = rcrds[id]; });        
    return data;
}
/** Returns an object with each entity record's displayName (key) and id. */
function getNameDataObj(ids, rcrds) {                                           //console.log('ids = %O, rcrds = %O', ids, rcrds);
    const data = {};
    ids.forEach(function(id) { data[rcrds[id].displayName] = id; });            //console.log("nameDataObj = %O", data);
    return data;
}
/** Returns an object with each entity types's displayName (key) and id. */
function getTypeNameData(typeObj) {
    const data = {};
    for (var id in typeObj) {
        data[typeObj[id].displayName] = id;
    }  
    return data;
}
/** Returns an object with each entity tag's displayName (key) and id. */
function getTagData(tags, entity) {
    const data = {};
    for (var id in tags) {
        if ( tags[id].constrainedToEntity === entity ) {
            data[tags[id].displayName] = id;
        }
    }  
    return data;
}
/* ---------------------- USER LIST DATA ------------------------------------ */
/** 
 * [type] - array of user created interaction and filter sets.
 * [type]Names - an object with each set item's displayName(k) and id.
 */
function deriveUserNamedListData(data) {                                        //console.log('list data = %O', data)
    const filters = {};
    const filterIds = [];
    const int_sets = {};
    const int_setIds = [];

    data.lists.forEach(addToDataObjs);
    storeData('savedFilters', filters);
    storeData('savedFilterNames', getFilterOptionGroupObj(filterIds, filters));
    storeData('dataLists', int_sets);
    storeData('dataListNames', getNameDataObj(int_setIds, int_sets));

    function addToDataObjs(l) {
        const entities = l.type == 'filter' ? filters : int_sets;
        const idAry = l.type == 'filter' ? filterIds : int_setIds;
        entities[l.id] = l;
        idAry.push(l.id);
    }
}
function getFilterOptionGroupObj(ids, filters) {                                //console.log('getFilterOptionGroupObj ids = %O, filters = %O', ids, filters);
    const data = {};
    ids.forEach(buildOptObj);                                                         //console.log("nameDataObj = %O", data);
    return data;

    function buildOptObj(id) {
        return data[filters[id].displayName] = { 
            value: id, group: getFocusAndViewOptionGroupString(filters[id]) 
        }
    }
}
function getFocusAndViewOptionGroupString(list) {
    list.details = JSON.parse(list.details);                                    //console.log('getFocusAndViewOptionGroupString. list = %O', list)
    const map = {
        'srcs': 'Source', 'auths': 'Author', 'pubs': 'Publication', 'publ': 'Publisher',
        'taxa': 'Taxon', '2': 'Bats', '3': 'Plants', '4': 'Arthropod'
    };
    return list.details.focus === 'locs' ? 'Location' : 
        map[list.details.focus] + ' - ' + map[list.details.view];
}
/* ---------------------- HELPERS ------------------------------------------- */
function getTypeObj(types, type, collection) { 
    for (let t in types) {
        if (types[t].slug === type) { return types[t][collection]; }
    }
}
/* ======================= STORE DATA ======================================= */
function storeData(key, data) {
    localData[key] = data;
}
function addDataToLocalDb(serverUpdatedAt) {
    return storeAllLocalData()
    .then(() => _u.setData('lclDataUpdtdAt', serverUpdatedAt.state));
}
function storeAllLocalData() {
    return Object.keys(localData).reduce((p, prop) => {                         console.log('       --setting [%s] = [%O]', prop, localData[prop]);
        return p.then(() => _u.setData(prop, localData[prop]));
    }, Promise.resolve());
}
