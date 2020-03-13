/**
 * Downloads all relevant data from the server and stores data locally using IDB.
 *
 * TOC:
 *     DOWNLOAD DATA
 *         INIT BASE TABLE
 *         DOWNLOAD REMAINING TABLE DATA
 *         DOWNLOAD REMAINING DATA
 *         HELPERS
 *     DERIVE DATA
 *         TAXON DATA
 *         LOCATION DATA
 *         SOURCE DATA
 *         INTERACTION DATA
 *         USER LIST DATA
 *         HELPERS
 */
import * as _db from './local-data-main.js';

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
 *       Source, SourceType
 *   /interaction - Interaction, InteractionType, Tag
 */
export default function (reset) {                                               console.log("   +-initLocalData");
    return _db.fetchServerData('data-state')
        .then(data => _db.setDataInMemory('lclDataUpdtdAt', data.state))
        .then(() => initBaseDataAndLoadBatTable(reset))
        // .then(downloadInteractionDataAndFillTable)
        // .then(downloadRemainingTableTreeData)
        // .then(downloadGeoJsonDataAndEnableMaps)
        // .then(_db.setUpdatedDataInLocalDb)
        // .then(loadDatabaseTable);
        // .then(downloadBatchedServerData)
        // .then(_db.setUpdatedDataInLocalDb)
        // .then(loadDatabaseTable);
}
// function downloadBatchedServerData() {                                          //console.log('       --downloading Taxon and Source Data');
//     return $.when(getAndSetData('taxon'), getAndSetData('lists'))
//         .then(() => getAndSetData('source'))
//         .then(() => getAndSetData('location'))
//         .then(() => getAndSetData('interaction'));
// }
/* ---------------- INIT BASE TABLE ----------------------------------------- */
function initBaseDataAndLoadBatTable(reset) {
    return downloadBaseTableDataAndLoadTable(reset)
}
function downloadBaseTableDataAndLoadTable(reset) {
    return getAndSetData('init')
        .then(() => getAndSetData('lists'))
        .then(() => loadDatabaseTable(reset))
}
function loadDatabaseTable(reset) {
    if (reset) { _db.pg('resetDataTable', ['taxa']); 
    } else { _db.pg('initSearchState'); }
}
function downloadInteractionDataAndFillTable() {
    return getAndSetData('interaction')
        .then(_db.pg('fillTableWithInteractions'));
}
/* -------------- DOWNLOAD REMAINING TABLE DATA ----------------------------- */
function downloadRemainingTaxaData() {
    return getAndSetData('taxa')
}
function downloadRemainingTableTreeData() {
    return downloadRemainingTaxaData()
        .then(() => downloadDataAndEnableTableView('source', 'src'))
        .then(() => downloadDataAndEnableTableView('location', 'loc'));
}
function downloadDataAndEnableTableView(entity, key) {
    return getAndSetData(entity)
        .then(() => enableTableView(entity, key));
}
function enableTableView(entity, key) {
    //add focus to combobox
}
/* -------------- DOWNLOAD REMAINING DATA ----------------------------------- */
function downloadGeoJsonDataAndEnableMaps() {
    // body...
}
/* -------------------------- HELPERS --------------------------------------- */
function getAndSetData(url) {
    return _db.fetchServerData(url).then(setData.bind(null, url));
}
function setData(url, data) {                                                   console.log('               --storing [%s] data = %O', url, data);
    const setDataFunc = {
        'init': deriveBaseTaxonData,
        'interaction': deriveInteractionData, 'lists': deriveUserData, 
        'location': deriveLocationData,       'source': deriveSourceData,
        'taxa': deriveRemainingTaxonData
    };
    if (!data) { return console.log('!data'); }
    storeServerData(data);
    setDataFunc[url](data);
    return _db.setUpdatedDataInLocalDb();
}
/**
 * Loops through the data object returned from the server, parsing and storing
 * the entity data.
 */
function storeServerData(data) {                                                //console.log("data received = %O", data);
    for (let entity in data) {                                                  //console.log("entity = %s, data = %O", entity, data[entity]);
        _db.setDataInMemory(entity, parseData(data[entity]));
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
/* -------------------------- TAXON DATA ------------------------------------ */
/** 
 * levelNames - an object with each level name (k) and it's id and ordinal (v).
 * realmNames - an object with each realm name (k) and it's id, role, and levels (v).
 * [realm][level]Names - object with all taxa in realm at the level: name (k) id (v)
 * *realm - resaved with 'uiLevelsShown' filled with the level display names. 
 */ 
/** Stores an object of taxon names and ids for each level in each realm. */
function deriveBaseTaxonData(data) {                                            console.log("deriveBaseTaxonData called. data = %O", data);
    _db.setDataInMemory('realmNames', getNameDataObj(Object.keys(data.realm), data.realm));
    storeTaxaByLevelAndRealm(data.taxon);
    modifyRealmData(data.realm);
    storeLevelData(data.level);
}
function deriveRemainingTaxonData(data) {
    storeTaxaByLevelAndRealm(data.taxa);
}
/* --------------- Levels ------------------ */
function storeLevelData(levelData) {
    const levels = {};
    const order = Object.keys(levelData).sort(orderLevels);                     
    $(order).each(addLevelData);   
    _db.setDataInMemory('levelNames', levels);
    
    function orderLevels(a, b) {
        const x = levelData[a].ordinal;
        const y = levelData[b].ordinal;
        return x<y ? -1 : x>y ? 1 : 0;
    }
    function addLevelData(i, id) {
        return levels[levelData[id].displayName] = {id: id, ord: i+1};
    }
}
/* --------- Taxa by Realm & Level ------------- */
function storeTaxaByLevelAndRealm(taxa) {
    const realmData = separateTaxaByLevelAndRealm(taxa);                          //console.log("taxonym realmData = %O", realmData);
    for (let realm in realmData) {  
        storeTaxaByLvl(realm, realmData[realm]);
    }
}
function storeTaxaByLvl(realm, taxonObj) {
    for (let level in taxonObj) {                                               //console.log("storing as [%s] = %O", realm+level+'Names', taxonObj[level]);
        _db.setDataInMemory(realm+level+'Names', taxonObj[level]);
    }
}
/** Each taxon is sorted by realm and then level. 'Animalia' is skipped. */
function separateTaxaByLevelAndRealm(taxa) {
    const data = {};
    Object.keys(taxa).forEach(id => addTaxonData(taxa[id], id));
    return data;
    /** Adds the taxon's name (k) and id to it's level's obj. */
    function addTaxonData(taxon, id) {  
        if (taxon.name === 'Animalia') { return delete taxa[id]; } //not shown anywhere
        const realmObj = getRealmObj(taxon);
        const level = taxon.level.displayName;  
        addToRealmLevel(taxon, realmObj, level);
        if (taxon.isRoot) { addRootToRealmEntity(taxon); }
    }
    function getRealmObj(taxon) {
        const realm = taxon.realm.displayName
        if (!data[realm]) { data[realm] = {}; }
        return data[realm];
    }
    function addToRealmLevel(taxon, realmObj, level) {
        if (!realmObj[level]) { realmObj[level] = {}; }; 
        realmObj[level][taxon.name] = taxon.id;
    }
} /* End separateTaxaByLevelAndRealm */
function addRootToRealmEntity(taxon) {
    const realms = _db.getMmryData('realm');  
    realms[taxon.realm.id].taxon = taxon.id;
    _db.setDataInMemory('realm', realms);
}
/* ---------- Modify Realm Data -------------- */
function modifyRealmData(realms) {                                              //console.log('realms = %O', realms);
    modifyRealms(Object.keys(realms));
    _db.setDataInMemory('realm', realms);  
    
    function modifyRealms(ids) {
        ids.forEach(id => {
            let realm = realms[id]
            realm.uiLevelsShown = fillLevelNames(JSON.parse(realm.uiLevelsShown));
        });
    }
    function fillLevelNames(lvlAry) {
        const levels = _db.getMmryData('level');
        return lvlAry.map(id => levels[id].displayName);
    }
}
/* ----------------------- LOCATION DATA ------------------------------------ */
/** 
 * [entity]Names - an object with each entity's displayName(k) and id.
 * *location - resaved locations with an additional data point for countries. 
 */
function deriveLocationData(data) {                                             //console.log('loc data to store = %O', data);
    const regns = getTypeObj(data.locationType, 'region', 'locations');
    const cntries = getTypeObj(data.locationType, 'country', 'locations');       //console.log('reg = %O, cntry = %O', regns, cntries);
    _db.setDataInMemory('countryNames', getNameDataObj(cntries, data.location));
    _db.setDataInMemory('countryCodes', getCodeNameDataObj(cntries, data.location));
    _db.setDataInMemory('regionNames', getNameDataObj(regns, data.location));
    _db.setDataInMemory('topRegionNames', getTopRegionNameData(data, regns));
    _db.setDataInMemory('habTypeNames', getTypeNameData(data.habitatType));
    _db.setDataInMemory('locTypeNames', getTypeNameData(data.locationType));
    _db.setDataInMemory('location', addInteractionTotalsToLocs(data.location));
    ['locationType', 'habitatType'].forEach(k => _db.deleteMmryData(k));    
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
function deriveSourceData(data) {                                               //console.log("source data = %O", data);
    const authSrcs = getTypeObj(data.sourceType, 'author', 'sources');
    const pubSrcs = getTypeObj(data.sourceType, 'publication', 'sources');
    const publSrcs = getTypeObj(data.sourceType, 'publisher', 'sources'); 
    _db.setDataInMemory('authSrcs', authSrcs);         
    _db.setDataInMemory('pubSrcs', pubSrcs);              
    _db.setDataInMemory('publSrcs', publSrcs);
    _db.setDataInMemory('citTypeNames', getTypeNameData(data.citationType));        
    _db.setDataInMemory('pubTypeNames', getTypeNameData(data.publicationType));  
    ['citationType', 'publicationType', 'sourceType'].forEach(k => _db.deleteMmryData(k));
}
/* -------------------- INTERACTION DATA ------------------------------------ */
/**
 * [entity]Names - an object with each entity's displayName(k) and id.
 */
function deriveInteractionData(data) {
    _db.setDataInMemory('intTypeNames', getTypeNameData(data.interactionType));
    _db.setDataInMemory('tagNames', getNameDataObj(Object.keys(data.tag), data.tag));  
    _db.deleteMmryData('tag');
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
// --> SAVE FOR A TIME WHEN MULTIPLE ENTITIES ARE USING TAGS IN THIS WAY <---
// /** Returns an object with each entity tag's displayName (key) and id. */
// function getTagData(tags, entity) {
//     const data = {};
//     for (var id in tags) {
//         if ( tags[id].constrainedToEntity === entity ) {
//             data[tags[id].displayName] = id;
//         }
//     }  
//     return data;
// }
/* ---------------------- USER LIST DATA ------------------------------------ */
/** 
 * [type] - array of user created interaction and filter sets.
 * [type]Names - an object with each set item's displayName(k) and id.
 */
export function deriveUserData(data) {                                                 //console.log('list data = %O', data)
    const filters = {};
    const filterIds = [];
    const int_sets = {};
    const int_setIds = [];

    data.lists.forEach(addToDataObjs);
    _db.setDataInMemory('savedFilters', filters);
    _db.setDataInMemory('savedFilterNames', getFilterOptionGroupObj(filterIds, filters));
    _db.setDataInMemory('dataLists', int_sets);
    _db.setDataInMemory('dataListNames', getNameDataObj(int_setIds, int_sets));
    _db.setDataInMemory('user', $('body').data('user-name'));

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
function getFocusAndViewOptionGroupString(list) {  //copy. refact away
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