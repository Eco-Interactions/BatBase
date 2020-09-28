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
import * as db from './local-data-main.js';
import { initSearchStateAndTable, _ui } from '../db-main.js';

/* ======================= DOWNLOAD DATA ==================================== */
/**
 * The first time a browser visits the search page all entity data is downloaded
 * from the server and stored locally @storeEntityData. Database search page
 * table build begins @initSearchStateAndTable.
 * Entities downloaded with each ajax call:
 *   /taxon - Taxon, Realm, Level
 *   /location - HabitatType, Location, LocationType, GeoJson
 *   /source - Author, Citation, CitationType, Publication, PublicationType,
 *       Source, SourceType
 *   /interaction - Interaction, InteractionType, Tag
 */
export default function (reset) {                                               console.log("   *-initLocalData");
    return db.fetchServerData('data-state')
        .then(data => db.setDataInMemory('lclDataUpdtdAt', data.state))
        .then(() => initTaxonDataAndLoadTable(reset))
        .then(downloadRemainingTableData)
        .then(downloadRemainingDataAndFullyEnableDb)
        .then(db.clearTempMmry);
}
/* ---------------- INIT BASE TABLE ----------------------------------------- */
function initTaxonDataAndLoadTable(reset) {
    return getAndSetData('taxon')
        .then(() => db.setUpdatedDataInLocalDb())
        .then(() => initSearchStateAndTable('taxa', false));
}
/* -------------- DOWNLOAD REMAINING TABLE DATA ----------------------------- */
function downloadRemainingTableData() {
    return getAndSetData('source')
        .then(() => getAndSetData('location'))
        .then(() => getAndSetData('interaction'))
        .then(() => db.setUpdatedDataInLocalDb())
        .then(() => initSearchStateAndTable());
}
/* ------------------- DOWNLOAD MAP DATA ------------------------------------ */
function downloadRemainingDataAndFullyEnableDb() {
    return getAndSetData('geoJson')
        .then(() => getAndSetData('lists'))
        .then(() => db.setUpdatedDataInLocalDb())
        .then(() => _ui('onDataDownloadCompleteEnableUiFeatures'));
}
/* -------------------------- HELPERS --------------------------------------- */
function getAndSetData(url) {
    return db.fetchServerData(url)
        .then(data => setData(url, data))
}
function setData(url, data) {                                                   console.log('           *-storing [%s] data = %O', url, data);
    const setDataFunc = {
        'interaction': deriveInteractionData, 'lists': deriveUserData,
        'location': deriveLocationData,       'source': deriveSourceData,
        'taxon': deriveTaxonData,             'geoJson': Function.prototype,
    };
    return storeServerData(data)
        .then(() => setDataFunc[url](data));
}
/**
 * Loops through the data object returned from the server, parsing and storing
 * the entity data.
 */
function storeServerData(data) {                                                //console.log("storeServerData = %O", data);
    const ents = Object.keys(data);
    return ents.reduce((p, entity) => {                                         //console.log("     entity = %s, data = %O", entity, data[entity]);
        return p.then(p => db.setDataInMemory(entity, parseData(data[entity])));
    }, Promise.resolve());
}
/**
 * Loops through the passed data object to parse the nested objects. This is
 * because the data comes back from the server having been double JSON-encoded,
 * due to the 'serialize' library and the JSONResponse object.
 */
function parseData(data) {
    for (let k in data) {                                                       //console.log('parse[%s]Data = %O', k, data);
        data[k] = JSON.parse(data[k]);
    }
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
function deriveTaxonData(data) {                                                //console.log("deriveTaxonData called. data = %O", data);
    db.setDataInMemory('realmNames', getNameDataObj(Object.keys(data.realm), data.realm));
    storeTaxaByLevelAndRealm(data.taxon, data.realm, data.realmRoot);
    modifyRealmData(data.realm, data.level);
    storeLevelData(data.level);
    db.deleteMmryData('realmRoot');
}
/* --------------- Levels ------------------ */
function storeLevelData(levelData) {
    const levels = {};
    const order = Object.keys(levelData).sort(orderLevels);
    $(order).each(addLevelData);
    db.setDataInMemory('levelNames', levels);

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
function storeTaxaByLevelAndRealm(taxa, realms, roots) {
    for (let rootId in roots) {
        const root = roots[rootId];
        const realm = realms[root.realm];
        const taxon = taxa[root.taxon];
        realm.taxon = root.taxon;
        addRealmDataToTaxon(taxon, realm);
        separateAndStoreRealmTaxa(taxon, realm);
    }
    db.setDataInMemory('realm', realms);
    db.setDataInMemory('taxon', taxa);

    function separateAndStoreRealmTaxa(taxon, realm) {
        const data = {};
        separateRealmTaxaByLevel(taxon.children, data, realm, taxa);
        storeTaxaByLvl(realm.displayName, data);
    }
}
function separateRealmTaxaByLevel(taxa, data, realm, rcrds) {
    taxa.forEach(separateTaxonAndChildren);
    return data;

    function separateTaxonAndChildren(id) {
        const taxon = rcrds[id];
        addToRealmLevel(taxon, taxon.level.displayName);
        addRealmDataToTaxon(taxon, realm);
        taxon.children.forEach(separateTaxonAndChildren);
    }
    function addToRealmLevel(taxon, level) {
        if (!data[level]) { data[level] = {}; };
        data[level][taxon.name] = taxon.id;
    }
}
function addRealmDataToTaxon(taxon, realm) {
    taxon.realm = {
        id: realm.id, displayName: realm.displayName, pluralName: realm.pluralName
    };
}
function storeTaxaByLvl(realm, taxonObj) {
    for (let level in taxonObj) {                                               //console.log("storing as [%s] = %O", realm+level+'Names', taxonObj[level]);
        db.setDataInMemory(realm+level+'Names', taxonObj[level]);
        //TODO: Check for previously sorted taxa for realms with multiple roots
    }
}
/* ---------- Modify Realm Data -------------- */
function modifyRealmData(realms, levels) {                                              //console.log('realms = %O', realms);
    modifyRealms(Object.keys(realms));
    db.setDataInMemory('realm', realms);

    function modifyRealms(ids) {
        ids.forEach(id => {
            let realm = realms[id]
            realm.uiLevelsShown = fillLevelNames(JSON.parse(realm.uiLevelsShown));
        });
    }
    function fillLevelNames(lvlAry) {
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
    db.setDataInMemory('countryNames', getNameDataObj(cntries, data.location));
    db.setDataInMemory('countryCodes', getCodeNameDataObj(cntries, data.location));
    db.setDataInMemory('regionNames', getNameDataObj(regns, data.location));
    db.setDataInMemory('topRegionNames', getTopRegionNameData(data, regns));
    db.setDataInMemory('habTypeNames', getTypeNameData(data.habitatType));
    db.setDataInMemory('locTypeNames', getTypeNameData(data.locationType));
    db.setDataInMemory('location', addInteractionTotalsToLocs(data.location));
    ['locationType', 'habitatType'].forEach(k => db.deleteMmryData(k));
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
/**
 * [entity]Names - an object with each entity's displayName(k) and id.
 * [entity]Sources - an array with of all source records for the entity type.
 */
function deriveSourceData(data) {                                               //console.log("source data = %O", data);
    const authSrcs = getTypeObj(data.sourceType, 'author', 'sources');
    const pubSrcs = getTypeObj(data.sourceType, 'publication', 'sources');
    const publSrcs = getTypeObj(data.sourceType, 'publisher', 'sources');
    db.setDataInMemory('authSrcs', authSrcs);
    db.setDataInMemory('pubSrcs', pubSrcs);
    db.setDataInMemory('publSrcs', publSrcs);
    db.setDataInMemory('citTypeNames', getTypeNameData(data.citationType));
    db.setDataInMemory('pubTypeNames', getTypeNameData(data.publicationType));
    ['citationType', 'publicationType', 'sourceType'].forEach(k => db.deleteMmryData(k));
}
/* -------------------- INTERACTION DATA ------------------------------------ */
/**
 * [entity]Names - an object with each entity's displayName(k) and id.
 * Adds the object realm to each interaction record.
 * Handles required tags and tags restricted to a specific object realm.
 */
function deriveInteractionData(data) {
    db.setDataInMemory('intTypeNames', getTypeNameData(data.interactionType));
    db.setDataInMemory('tagNames', getNameDataObj(Object.keys(data.tag), data.tag));
    db.deleteMmryData('tag');
    addObjRealmIdProp(data.interaction);
    modifyInteractionTypeTagData(data.interactionType);
}
function addObjRealmIdProp(ints) {
    const taxa = db.getMmryData('taxon');
    Object.keys(ints).forEach(i => addObjectRealmId(ints[i]));
    db.setDataInMemory('interaction', ints);

    function addObjectRealmId(int) {
        int.objRealm = taxa[int.object].realm.id.toString();
    }
}
function modifyInteractionTypeTagData(intTypes) {
    for (let type in intTypes) {
        handleTagDataModification(intTypes[type]);
    }
}
function handleTagDataModification(intType) {
    handleRequiredTag(intType);
    handleRealmRestrictions(intType);
}
function handleRequiredTag(intType) {
    const map = {
        'Visitation': ['Flower'],
        'Transport': ['Arthropod', 'Bryophyte Fragment']
    };
    if (!map[intType.displayName]) { return; }
    intType.tags = intType.tags.map(t => {
        if (map[intType.displayName].indexOf(t.displayName) !== -1) { t.required = true; }
        return t;
    })
}
function handleRealmRestrictions(intType) {
    const map = {
        'Bryophyte Fragment': 'Plant',
        'Arthropod': 'Arthropod'
    };
    intType.tags = intType.tags.map(t => {
        if (map[t.displayName]) { t.realm = map[t.displayName]; }
        return t;
    })
}
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
    db.setDataInMemory('savedFilters', filters);
    db.setDataInMemory('savedFilterNames', getFilterOptionGroupObj(filterIds, filters));
    db.setDataInMemory('dataLists', int_sets);
    db.setDataInMemory('dataListNames', getNameDataObj(int_setIds, int_sets));
    db.setDataInMemory('user', getUserName());

    function addToDataObjs(l) {
        const entities = l.type == 'filter' ? filters : int_sets;
        const idAry = l.type == 'filter' ? filterIds : int_setIds;
        entities[l.id] = l;
        idAry.push(l.id);
    }
}
function getUserName() {
    return $('body').data('user-name') ? $('body').data('user-name') : 'visitor';
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
/** Returns an object with a record (value) for each id (key) in passed array.*/
function getEntityRcrds(ids, rcrds) {
    const data = {};
    ids.forEach(id => data[id] = rcrds[id]);
    return data;
}
/** Returns an object with each entity record's displayName (key) and id. */
function getNameDataObj(ids, rcrds) {                                           //console.log('ids = %O, rcrds = %O', ids, rcrds);
    const data = {};
    ids.forEach(id => data[rcrds[id].displayName] = id);            //console.log("nameDataObj = %O", data);
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