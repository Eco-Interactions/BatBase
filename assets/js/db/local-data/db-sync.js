/**
 * Handles adding, updating, and removing data from local Indexed DB storage.
 * 
 * Exports:                 Imported by:
 *     addNewDataToStorage          idb-util
 *     initStoredData               idb-util
 *     replaceUserData              idb-util
 *     resetStoredData              db-forms
 *     updateLocalDb                db-forms
 *     updateUserNamedList          save-ints
 *
 * Code Sections:
 *     DATABASE SYNC
 *     AFTER FORM SUBMIT
 *         ADD DATA
 *         REMOVE DATA
 *         UPDATE RELATED DATA
 *     INIT DATABASE
 *     HELPERS
 *         ERRS
 * 
 */
import * as _u from '../util.js';
import { err as _errs, entity as _entity } from '../data-entry/forms/forms-main.js';
import { initSearchState, showIntroAndLoadingMsg } from '../db-page.js';
import initLocalData from './init-data.js';

let failed = { errors: [], updates: {}};
/** Stores entity data while updating to reduce async db calls. */
let mmryData;

/* ========================= DATABASE SYNC ================================== */
/**
 * On search page load, the system updatedAt flag is compared against the page's. 
 * If there they system data has updates more recent than the last sync, the 
 * updated data is ajaxed and stored @syncUpdatedData. 
 * On a browser's first visit to the page, all data is downloaded and the 
 * search page ui is initialized @initStoredData.
 */
export function syncLocalDbWithServer(lclUpdtdAt) {                             console.log("   /--syncLocalDbWithServer. lclUpdtdAt = %O", lclUpdtdAt);
    _u.sendAjaxQuery({}, "ajax/data-state", checkAgainstLocalDataState);
    
    function checkAgainstLocalDataState(srvrUpdtdAt) {                          //console.log('checkEachEntityForUpdates. srvrUpdtdAt = %O, lcl = %O', srvrUpdtdAt, lclUpdtdAt);
        if (ifTestEnvDbNeedsReset(srvrUpdtdAt.state.System)) { return _u.downloadFullDb(); }
        const entities = checkEachEntityForUpdates(srvrUpdtdAt.state);
        return entities.length ? syncDb(entities, srvrUpdtdAt.state) : initSearchPage();
    }
    function checkEachEntityForUpdates(srvrUpdtdAt) {                           //console.log('checkEachEntityForUpdates. srvrUpdtdAt = %O, lcl = %O', srvrUpdtdAt.state, lclUpdtdAt);
        return Object.keys(srvrUpdtdAt).map(entity => {                         //console.log('   --[%s] updates ? ', entity, entityHasUpdates(srvrUpdtdAt[entity], lclUpdtdAt[entity]));
            if (entity === 'System') { return false; }
            return entityHasUpdates(srvrUpdtdAt[entity], lclUpdtdAt[entity]) ? 
                { name: entity, updated: lclUpdtdAt[entity] } : false;
        }).filter(e => e);
    }
}
/** Db is reset unless testing suite did not reload database. */
function ifTestEnvDbNeedsReset(systemUpdateAt) { 
    return systemUpdateAt == "2017-09-17 23:56:43";
}
/**
 * Returns true if the first datetime is more recent than the second. 
 * Note: for cross-browser date comparisson, dashes must be replaced with slashes.
 */
function entityHasUpdates(timeOne, timeTwo) {  
    var time1 = timeOne.replace(/-/g,'/');  
    var time2 = timeTwo.replace(/-/g,'/');                                      //console.log("firstTimeMoreRecent? ", Date.parse(time1) > Date.parse(time2))
    return Date.parse(time1) > Date.parse(time2);
}
function initSearchPage() {
    if (mmryData && mmryData.curFocus) { return initSearchState(mmryData.curFocus); }
    _u.getData('curFocus', true).then(f => initSearchState(f));
}
function syncDb(entities, dataUpdatedAt) {
    _u.getAllStoredData().then(data => { mmryData = data; })
    .then(() => downloadAndStoreNewData(entities))
    .then(addUpdatedDataToLocalDb)
    .then(() => clearMemoryAndLoadTable(dataUpdatedAt));
}
function trackTimeUpdated(entity, rcrd) {
    _u.getData('lclDataUpdtdAt').then(stateObj => {
        stateObj[entity] = rcrd.serverUpdatedAt;
        return _u.setData('lclDataUpdtdAt', stateObj);  
    }); 
    return Promise.resolve()
}
/** 
 * Sends an ajax call for each entity with updates. On return, the new data 
 * is stored @processUpdatedData. Any failed updates are retried and then the 
 * search page is reloaded.
 * TODO: Add 'fail' callback for server errors. Send back any errors and 
 * describe them to the user. 
 */ 
function downloadAndStoreNewData(entities) {                                    console.log('   --downloadAndStoreNewData. entities = %O', entities);
    const intUpdate = hasInteractionUpdates(entities);
    const promises = entities.map(e => getNewData(e)); 
    return Promise.all(promises)
        .then(processUpdatedData)
        .then(downloadIntUpdates)
        .then(retryFailedUpdates);
    
    function downloadIntUpdates() {
        return !intUpdate ? Promise.resolve() : 
            getNewData(intUpdate).then(processUpdatedEntityData);
    }
} 
function hasInteractionUpdates(entities) {                                      
    for (let i = entities.length - 1; i >= 0; i--) {
        if (entities[i].name == 'Interaction') {
            const intObj = Object.assign({}, entities[i]);
            entities.splice(i, 1);
            return intObj;
        }
    }
    return false;
}
function getNewData(entity) {                                                   //console.log('getting new data for ', entity); 
    let data = { entity: entity.name, updatedAt: entity.updated }; 
    return _u.sendAjaxQuery(data, "ajax/sync-data"); 
} 
/** Sends each entity's ajax return to be processed and stored. */
function processUpdatedData(data) {                                             //console.log('processUpdatedData = %O', data);
    return data.forEach(processUpdatedEntityData);
} 
/** Parses and sends the returned data to @storeUpdatedData. */ 
function processUpdatedEntityData(data) {                                       
    const entity = Object.keys(data)[0];                                        console.log("       --processUpdatedEntityData [%s] = %O", entity, data[entity]); 
    return storeUpdatedData(parseData(data[entity]), entity); 
}
/**
 * Loops through the passed data object to parse the nested objects. This is 
 * because the data comes back from the server having been double JSON-encoded,
 * due to the 'serialize' library and the JSONResponse object. 
 */
function parseData(data) {  //shared with init-data. refact
    for (let k in data) { data[k] = JSON.parse(data[k]); }
    return data;
}
/** Sends the each updated record to the update handler for the entity. */ 
function storeUpdatedData(rcrds, entity) {  
    const coreEntities = ['Interaction', 'Location', 'Source', 'Taxon']; 
    const entityHndlr = coreEntities.indexOf(entity) !== -1 ?  
        addCoreEntityData : addDetailEntityData; 
    Object.keys(rcrds).forEach(id => {
        entityHndlr(_u.lcfirst(entity), rcrds[id]);
    });
    return Promise.resolve();
} 
function clearMemoryAndLoadTable(dataUpdatedAt) {                                              //console.log('clearMemoryAndLoadTable')
    const errs = addErrsToReturnData({});                                       if (Object.keys(errs).length) {console.log('errs = %O', errs)}
    clearMemory();
    _u.setData('lclDataUpdtdAt', dataUpdatedAt);  
    initSearchPage(); //TODO: send errors during init update to search page and show error message to user.
}
/* ======================== AFTER FORM SUBMIT =============================== */
/**
 * On crud-form submit success, the returned data is added to, or updated in, 
 * all relevant stored data @updateEntityData. Local storage state is stored and 
 * the data, along with any errors or messages, is returned.
 */
export function updateLocalDb(data) {                                           console.log("   /--updateLocalDb data recieved = %O", data);
    return _u.getAllStoredData()
        .then(storeMmryAndUpdate);

    function storeMmryAndUpdate(mmry) {
        mmryData = mmry;
        parseEntityData(data);
        updateEntityData(data);
        return addUpdatedDataToLocalDb()
            .then(() => {
                addErrsToReturnData(data);
                clearMemory();
                return data;
            });
    }
}
function parseEntityData(data) {
    for (let prop in data) {
        try {
            data[prop] = JSON.parse(data[prop]);
        } catch (e) {}
    }
}
/** Stores both core and detail entity data, and updates data affected by edits. */
function updateEntityData(data) {
    addCoreEntityData(data.core, data.coreEntity);
    updateDetailEntityData(data)
    updateAffectedData(data)
    retryFailedUpdates();
}
function updateDetailEntityData(data) {
    if (!data.detailEntity) { return Promise.resolve(); }
    return addDetailEntityData(data.detail, data.detailEntity);
}
/* ------------------------------ ADD DATA ---------------------------------- */
/** Updates stored-data props related to a core-entity record with new data. */
function addCoreEntityData(entity, rcrd) {                                      console.log("       --Updating Core entity. %s. %O", entity, rcrd);
    updateCoreData(entity, rcrd);
    updateCoreDataProps(entity, rcrd);
}
/** 
 * Updates the stored core-records array and the stored entityType array. 
 * Note: Taxa are the only core entity without 'types'.
 */
function updateCoreData(entity, rcrd) {                                         //console.log("           --Updating Record data", entity);
    addToRcrdProp(entity, rcrd);
    addToCoreTypeProp(entity, rcrd);
} 
function addToCoreTypeProp(entity, rcrd) {    
    if (entity === "taxon") { return Promise.resolve(); }
    return addToTypeProp(entity+"Type", rcrd, entity);
}
function updateCoreDataProps(entity, rcrd) {
    const updateFuncs = getRelDataHndlrs(entity, rcrd);                         //console.log('updatedatahandlers = %O', updateFuncs);
    return updateDataProps(entity, rcrd, updateFuncs)
}
/** Returns an object of relational data properties and their update methods. */
function getRelDataHndlrs(entity, rcrd) {
    var type = entity === "source" ? getSourceType(entity, rcrd) : false;       //console.log("type = ", type);
    var update = {
        'source': {
            'author': { 'authSrcs': addToRcrdAryProp },
            'citation': { 'authors': addContribData, 'source': addToParentRcrd,
                'tag': addToTagProp },
            'publication': { 'pubSrcs': addToRcrdAryProp, 'authors': addContribData, 
                'source': addToParentRcrd, 'editors': addContribData },
            'publisher': { 'publSrcs': addToRcrdAryProp },

        },
        'interaction': {
            'location': addInteractionToEntity, 'source': addInteractionToEntity, 
            'subject': addInteractionRole, 'object': addInteractionRole, 
            'interactionType': addToTypeProp, 'tag': addToTagProp
        },
        'location': {
            'location': addToParentRcrd, 'habitatType': addToTypeProp, 
            'locationType': addToTypeProp
        },
        'taxon': { 'taxon': addToParentRcrd, 'taxonNames': addToTaxonNames 
        },
    };
    return type ? update[entity][type] : update[entity];
}
/** Returns the records source-type. */
function getSourceType(entity, rcrd) {                                          //console.log('getSourceType. [%s] = %O', entity, rcrd);
    var type = _u.lcfirst(entity)+"Type";
    return _u.lcfirst(rcrd[type].displayName); 
}
/** Sends entity-record data to each storage property-type handler. */
function updateDataProps(entity, rcrd, updateFuncs) {                           //console.log("           --updateDataProps [%s]. %O. updateFuncs = %O", entity, rcrd, updateFuncs);
    const params = { entity: entity, rcrd: rcrd, stage: 'addData' };
    Object.keys(updateFuncs).forEach(prop => {
        updateData(updateFuncs[prop], prop, params);
    });
}
/** Updates stored-data props related to a detail-entity record with new data. */
function addDetailEntityData(entity, rcrd) {                                    console.log("       --Updating Detail: [%s] %O", entity, rcrd);
    return updateDetailData(entity, rcrd)
}
function updateDetailData(entity, rcrd) {
    var update = {
        'author': { 'author': addToRcrdProp },
        'citation': { 'citation': addToRcrdProp }, //Not necessary to add to citation type object.
        'publication': { 'publication': addToRcrdProp, 'publicationType': addToTypeProp },
        'publisher': { 'publisher': addToRcrdProp },
        'geoJson': { 'geoJson': addToRcrdProp } 
    };
    return updateDataProps(entity, rcrd, update[entity]);
}
/** Add the new record to the prop's stored records object.  */
function addToRcrdProp(prop, rcrd, entity) {  
    const rcrds = mmryData[prop].value;                                         //console.log("               --addToRcrdProp. [%s] = %O. rcrd = %O", prop, _u.snapshot(rcrds), _u.snapshot(rcrd));
    rcrds[rcrd.id] = rcrd;
    storeData(prop, rcrds);
}
/** Add the new record to the prop's stored records object.  */
function addToRcrdAryProp(prop, rcrd, entity) {  
    const rcrds = mmryData[prop].value;                                         //console.log("               --addToRcrdAryProp. [%s] = %O. rcrd = %O", prop, rcrds, rcrd);
    if (!ifNewRcrd(rcrds, rcrd.id)) { return; }
    rcrds.push(rcrd.id);
    storeData(prop, rcrds);
}
/** Add the new entity's display name and id to the prop's stored names object.  */
function addToNameProp(prop, rcrd, entity) {
    const nameObj = mmryData[prop].value;
    nameObj[rcrd.displayName] = rcrd.id;
    storeData(prop, nameObj);
}
/** Add the new record's id to the entity-type's stored id array.  */
function addToTypeProp(prop, rcrd, entity) {                                    
    const typeId = rcrd[prop] ? rcrd[prop].id : false;
    if (!typeId) { return; }
    const typeObj = mmryData[prop].value;
    if (!ifNewRcrd(typeObj[typeId][entity+'s'], rcrd.id)) { return; }
    typeObj[typeId][entity+'s'].push(rcrd.id);
    storeData(prop, typeObj);
}
function ifNewRcrd(ary, id) {
    return ary.indexOf(id) === -1;
}
/** Adds a new child record's id to it's parent's 'children' array. */ 
function addToParentRcrd(prop, rcrd, entity) {                              
    if (!rcrd.parent) { return; }
    const rcrds = mmryData[prop].value;                                         //console.log("               --addToParentRcrd. [%s] = %O. rcrd = %O", prop, rcrds, rcrd);
    const parent = rcrds[rcrd.parent];
    if (!ifNewRcrd(parent.children, rcrd.id)) { return; }
    parent.children.push(rcrd.id);
    storeData(prop, rcrds);
}
/** Adds a new tagged record to the tag's array of record ids. */
function addToTagProp(prop, rcrd, entity) {                                 
    if (!rcrd.tags.length) { return; }  
    const tagObj = mmryData[prop].value;                                        //console.log("               --addToTagProp. [%s] = %O. rcrd = %O", prop, tagObj, rcrd);
    const toAdd = rcrd.tags.filter(tag => ifNewRcrd(tagObj[tag.id][entity+'s'], rcrd.id));
    if (!toAdd) { return; }
    toAdd.forEach(tag => tagObj[tag.id][entity+'s'].push(rcrd.id));
    storeData(prop, tagObj);
}
/** Adds the Taxon's name to the stored names for it's realm and level.  */
function addToTaxonNames(prop, rcrd, entity) {
    const realm = rcrd.realm.displayName;
    const level = rcrd.level.displayName;  
    const nameProp = realm+level+"Names";
    if (!mmryData[nameProp]) { mmryData[nameProp] = { value:{} }; }
    addToNameProp(nameProp, rcrd, entity);
}
/** Adds the Interaction to the stored entity's collection.  */
function addInteractionToEntity(prop, rcrd, entity) {                           //console.log('addInteractionToEntity. prop = [%s] rcrd = %O', prop, rcrd);
    if (!rcrd[prop]) { return; }
    const rcrds = mmryData[prop].value;
    const storedEntity = rcrds[rcrd[prop]];
    if (!ifNewRcrd(storedEntity.interactions, rcrd.id)) { return; }
    storedEntity.interactions.push(rcrd.id);
    if (prop === 'source') { storedEntity.isDirect = true; }
    storeData(prop, rcrds);
}
/** Adds the Interaction to the taxon's subject/objectRole collection.  */
function addInteractionRole(prop, rcrd, entity) {  
    const taxa = mmryData.taxon.value;
    const taxon = taxa[rcrd[prop]];
    if (!ifNewRcrd(taxon[prop+"Roles"], rcrd.id)) { return; }
    taxon[prop+"Roles"].push(rcrd.id);
    storeData("taxon", taxa);   
}
/** When a Publication/Citation has been updated, add new author contributions. */
function addContribData(prop, rcrd, entity) {                                   //console.log("               --addContribData. [%s] [%s]. rcrd = %O", prop, entity, rcrd);
    if (!rcrd[prop]) { return; }
    const changes = false;
    const srcObj = mmryData.source.value;
    addNewContribData();
    if (changes) { storeData('source', srcObj); }

    function addNewContribData() {
        for (let ord in rcrd[prop]) {
            const authId = rcrd[prop][ord];
            if (!ifNewRcrd(srcObj[authId].contributions, rcrd.id)) { continue; }
            srcObj[authId].contributions.push(rcrd.id);
        }
    }
}
/* ---------------------------- REMOVE DATA --------------------------------- */
/** Updates any stored data that was affected during editing. */
function updateAffectedData(data) {                                             console.log("           --updateAffectedData called. data = %O", data);
    updateRelatedCoreData(data, data.coreEdits);
    updateRelatedDetailData(data);
}
function updateRelatedCoreData(data, edits) {
    if (!hasEdits(edits)) { return; }
    updateAffectedDataProps(data.core, data.coreEntity, edits);
}
function updateRelatedDetailData(data) {
    if (!hasEdits(data.detailEdits)) { return; }
    updateAffectedDataProps(data.detail, data.detailEntity, data.detailEdits);
}
function hasEdits(editObj) {
    return editObj && Object.keys(editObj).length > 0;
}
/** Updates relational storage props for the entity. */
function updateAffectedDataProps(entity, rcrd, edits) {                         console.log("               --updateAffectedDataProps called for [%s]. edits = %O", entity, edits);
    const params = { entity: entity, rcrd: rcrd, stage: 'rmvData' };
    const hndlrs = getRmvDataPropHndlrs(entity);                                
    return Object.keys(edits).forEach(prop => {  
        if (!hndlrs[prop]) { return ; }
        updateData(hndlrs[prop], prop, params, edits);
    });
}
/** Returns an object with relational properties and their removal handlers. */
function getRmvDataPropHndlrs(entity) {
    return {
        'author': {},
        'citation': { 'citationType': rmvFromTypeProp,  },
        'geoJson': {},
        'interaction': {
            'location': rmvIntAndAdjustTotalCnts, 'source': rmvIntFromEntity, 
            'subject': rmvIntFromTaxon, 'object': rmvIntFromTaxon, 
            'interactionType': rmvFromTypeProp, 'tag': rmvFromTagProp },
        'publication': { 'publicationType': rmvFromTypeProp },
        'publisher': {},
        'location': { 'parentLoc': rmvFromParent, 'locationType': rmvFromTypeProp },
        'source': { 'contributor': rmvContrib, 'parentSource': rmvFromParent, 
            'tag': rmvFromTagProp },
        'taxon': { 'parentTaxon': rmvFromParent, 'level': rmvFromNameProp,
            'displayName': rmvFromNameProp }
    }[entity];
}
/** Removes the id from the ary. */
function rmvIdFromAry(ary, id) {
    ary.splice(ary.indexOf(id), 1);  
}
/** Removes a record's id from the previous parent's 'children' array. */ 
function rmvFromParent(prop, rcrd, entity, edits) {  
    if (!edits[prop].old) { return; }
    const rcrds = mmryData[entity].value;
    rmvIdFromAry(rcrds[edits[prop].old].children, rcrd.id);
    storeData(entity, rcrds);
}
/** Removes the Interaction from the stored entity's collection. */
function rmvIntFromEntity(prop, rcrd, entity, edits) {   
    const rcrds = mmryData[prop].value;                                         //console.log("               --rmvIntFromEntity. [%s] = %O. rcrd = %O, edits = %O", prop, rcrds, rcrd, edits);
    const storedEntity = rcrds[edits[prop].old]; 
    rmvIdFromAry(storedEntity.interactions, rcrd.id);
    storeData(prop, rcrds);
}
/** Removes the Interaction and updates parent location total counts.  */
function rmvIntAndAdjustTotalCnts(prop, rcrd, entity, edits) {
    const rcrds = mmryData[prop].value;                                         //console.log("               --rmvIntFromLocation. [%s] = %O. rcrd = %O, edits = %O", prop, rcrds, rcrd, edits);
    const oldLoc = rcrds[edits[prop].old];
    const newLoc = rcrds[edits[prop].new];
    rmvIdFromAry(oldLoc.interactions, rcrd.id);
    adjustLocCnts(oldLoc, newLoc, rcrds);
    storeData(prop, rcrds);
} 
function adjustLocCnts(oldLoc, newLoc, rcrds) {
    adjustLocAndParentCnts(oldLoc, false);
    adjustLocAndParentCnts(newLoc, true);
    
    function adjustLocAndParentCnts(loc, addTo) {                               //console.log('adjustLocAndParentCnts. args = %O', arguments);
        addTo ? ++loc.totalInts : --loc.totalInts; 
        if (loc.parent) { adjustLocAndParentCnts(rcrds[loc.parent], addTo); }
    }
}
/** Removes the Interaction from the taxon's subject/objectRole collection. */
function rmvIntFromTaxon(prop, rcrd, entity, edits) {  
    const taxa = mmryData.taxon.value;                                          //console.log("               --rmvIntFromTaxon. [%s] = %O. taxa = %O", prop, taxa, rcrd);
    const taxon = taxa[edits[prop].old];      
    rmvIdFromAry(taxon[prop+"Roles"], rcrd.id);
    storeData("taxon", taxa);   
}
/** Removes the record from the entity-type's stored array. */
function rmvFromTypeProp(prop, rcrd, entity, edits) { 
    if (!edits[prop].old) { return; }
    const typeObj = mmryData[prop].value;
    const type = typeObj[edits[prop].old];
    rmvIdFromAry(type[entity+'s'], rcrd.id);
    storeData(prop, typeObj);
}
/** Removes a record from the tag's array of record ids. */
function rmvFromTagProp(prop, rcrd, entity, edits) {                                 
    if (!edits.tag.removed) { return; }
    const tagObj = mmryData[prop].value;
    edits.tag.removed.forEach(tagId => {
        rmvIdFromAry(tagObj[tagId][entity+'s'], rcrd.id);                
    });
    storeData(prop, tagObj);
}
function rmvContrib(prop, rcrd, entity, edits) {                                //console.log("               --rmvContrib. edits = %O. rcrd = %O", edits, rcrd)
    const srcObj = mmryData.source.value;
    edits.contributor.removed.forEach(id => {
        rmvIdFromAry(srcObj[id].contributions, rcrd.id)
    });
    storeData('source', srcObj);
}
function rmvFromNameProp(prop, rcrd, entity, edits) { 
    const taxonName = getTaxonName(edits.displayName, rcrd); 
    const nameProp = getNameProp(edits, rcrd);
    const nameObj = mmryData[nameProp].value;
    delete nameObj[taxonName];
    storeData(nameProp, nameObj);  
}
function getTaxonName(nameEdits, rcrd) {
    return nameEdits ? nameEdits.old : rcrd.displayName;
}
function getNameProp(edits, rcrd) {
    const level = getLevel(edits.level, rcrd);
    return rcrd.realm.displayName + level + 'Names';
}
function getLevel(lvlEdits, rcrd) {  
    return !lvlEdits ? 
        rcrd.level.displayName : mmryData.level.value[lvlEdits.old].displayName;
}
/** ---------------------- UPDATE RELATED DATA ------------------------------ */
function ifEditedSourceDataUpdatedCitations(data) {
    if (!isSrcDataEdited(data)) { return Promise.resolve(); }
    return updateRelatedCitations(data);
}
function isSrcDataEdited(data) {
    return data.core == 'source' && (hasEdits(data.coreEdits) || hasEdits(data.detailEdits));
}
/** Updates the citations for edited Authors, Publications or Publishers. */
function updateRelatedCitations(data) {                                         //console.log('updateRelatedCitations. data = %O', data);
    const srcData = data.coreEntity;
    const srcType = srcData.sourceType.displayName;
    const cites = srcType == 'Author' ? getChildCites(srcData.contributions) : 
        srcType == 'Publication' ? srcData.children : 
        srcType == 'Publisher' ? getChildCites(srcData.children) : false;
    if (!cites) { return; }
    return Promise.all(['author', 'citation', 'publisher'].map(e => getStoredData(e)))
        .then(rcrds => updateCitations(rcrds, cites));  

    function getChildCites(srcs) {  
        const cites = [];
        srcs.forEach(id => {
            const src = mmryData['source'][id]; 
            if (src.citation) { return cites.push(id); }
            src.children.forEach(cId => cites.push(cId))
        });
        return cites;
    }
} /* End updateRelatedCitations */
function updateCitations(rcrds, cites) {                                        //console.log('updateCitations. rcrds = %O cites = %O', rcrds, cites);
    const proms = [];
    cites.forEach(id => proms.push(updateCitText(id)));
    return Promise.all(proms).then(onUpdateSuccess)
    
    function updateCitText(id) {
        const citSrc = mmryData['source'][id];
        const params = {
            authRcrds: rcrds[0],
            cit: rcrds[1][citSrc.citation],
            citRcrds: rcrds[1],
            citSrc: citSrc,
            pub: mmryData['source'][citSrc.parent],
            publisherRcrds: rcrds[2],
            srcRcrds: mmryData['source']
        };
        const citText = _entity('rebuildCitationText', [params]);       
        return updateCitationData(citSrc, citText);
    }
}
/** Sends ajax data to update citation and source entities. */
function updateCitationData(citSrc, text) { 
    const data = { srcId: citSrc.id, text: text };
    return _u.sendAjaxQuery(
        data, 'crud/citation/edit', Function.prototype, _errs.formSubmitError);
}
function onUpdateSuccess(ajaxData) { 
    return Promise.all(ajaxData.map(data => handledUpdatedSrcData(data)));
}
function handledUpdatedSrcData(data) {                                          
    if (data.errors) { return Promise.resolve(_errs.errUpdatingData(data.errors)); }
    // parseEntityData(data.results);
    return updateEntityData(data.results);
}
/*---------------- Update User Named Lists -----------------------------------*/
export function updateUserNamedList(data, action) {                             console.log('   --Updating [%s] stored list data. %O', action, data);
    let rcrds, names;
    const list = action == 'delete' ? data : JSON.parse(data.entity);  
    const rcrdKey = list.type == 'filter' ? 'savedFilters' : 'dataLists';
    const nameKey = list.type == 'filter' ? 'savedFilterNames' : 'dataListNames';  
    
    return _u.getData([rcrdKey, nameKey])
        .then(storedData => syncListData(storedData))
        .then(trackTimeUpdated.bind(null, 'UserNamed', list));

    function syncListData(storedData) {                                         //console.log('syncListData = %O', storedData);
        rcrds = storedData[rcrdKey];
        names = storedData[nameKey];

        if (action == 'delete') { removeListData(); 
        } else { updateListData(); }

        _u.setData(rcrdKey, rcrds);
        _u.setData(nameKey, names);
    }
    function removeListData() {  
        delete rcrds[list.id];  
        delete names[list.displayName];  
    }
    function updateListData() {
        rcrds[list.id] = list;
        names[list.displayName] = list.type !== 'filter' ? list.id :
            {value: list.id, group: getFocusAndViewOptionGroupString(list)};
        if (data.edits && data.edits.displayName) { delete names[data.edits.displayName.old]; }
    }
} /* End updateUserNamedList */
/* ====================== INIT DATABASE ===================================== */
/** When there is an error while storing data, all data is redownloaded. */
export function resetStoredData() {
    db_ui.showLoadingDataPopUp();
    _u.downloadFullDb();
}
/**
 * The first time a browser visits the search page all entity data is downloaded
 * from the server and stored locally @initLocalData. A data-loading popup message 
 * and intro-walkthrough are shown on the Search page.
 */
export function initStoredData(reset) {
    showIntroAndLoadingMsg(reset);
    return initLocalData(reset);
}
export function replaceUserData(userName, data) {                               //console.log('replaceUserData. [%s] = %O', userName, data);
    data.lists = data.lists.map(l => JSON.parse(l));
    deriveUserNamedListData(data);
    storeData('user', userName);
}
/* =========================== HELPERS ====================================== */
/** Stores passed data under the key in dataStorage. */
function storeData(key, data) {                                                 //console.log('Adding to mmryData [%s] = [%O]', key, data);
    if (!mmryData) { mmryData = {} }
    if (!mmryData[key]) { mmryData[key] = {} }
    mmryData[key].value = data;
    mmryData[key].changed = true;
}
/**
 * Attempts to update the data and catches any errors.
 * @param  {func} updateFunc  To update the entity's data.
 * @param  {str}  prop   Entity prop to update     
 * @param  {obj}  params Has props shown, as well as the current update stage. 
 * @param  {obj}  edits  Edit obj returned from server 
 */
function updateData(updateFunc, prop, params, edits) {                          //console.log('prop [%s] -> params [%O], updateFunc = %O', prop, params, updateFunc);
    try {
        updateFunc(prop, params.rcrd, params.entity, edits)    
    } catch (e) { console.log('###### Error with [%s] params = [%O] e = %O', prop, params, e);
        handleFailedUpdate(prop, updateFunc, params, edits);
    }
}
/** Returns the current date time in the format: Y-m-d H:i:s */
function getCurrentDate() {
    return new Date().today() + " " + new Date().timeNow();
}
/*------------------------------ ERRS ----------------------------------------*/
/**
 * If this is the first failure, it is added to other failed updates to be 
 * retried at the end of the update process. If this is the second error, 
 * the error is reported to the user. (<--todo for onPageLoad sync) 
 */
function handleFailedUpdate(prop, updateFunc, params, edits) {                  //console.log('handleFailedUpdate [%s]. params = %O edits = %O, failed = %O',prop, params, edits, failed);
    if (failed.twice) { 
        reportDataUpdateErr(edits, prop, params.rcrd, params.entity, params.stage);
    } else {
        addToFailedUpdates(updateFunc, prop, params, edits);       
    }
    return Promise.resolve();
}
function addToFailedUpdates(updateFunc, prop, params, edits) {                  //console.log('addToFailedUpdates. edits = %O', edits);
    if (!failed.updates[params.entity]) { failed.updates[params.entity] = {}; }
    failed.updates[params.entity][prop] = {
        edits: edits, entity: params.entity, rcrd: params.rcrd, 
        stage: params.stage, updateFunc: updateFunc
    };
}
/** Retries any updates that failed in the first pass. */
function retryFailedUpdates() {                                                 console.log('           --retryFailedUpdates. failed = %O', _u.snapshot(failed));
    if (!Object.keys(failed.updates).length) { return Promise.resolve(); }
    failed.twice = true;   
    Object.keys(failed.updates).forEach(retryEntityUpdates);
    return Promise.resolve();
}
function retryEntityUpdates(entity) {
    Object.keys(failed.updates[entity]).forEach(prop => {
        let params = failed.updates[entity][prop];  
        updateData(params.updateFunc, prop, params, params.edits);
    });
}
function addUpdatedDataToLocalDb() {
    return Object.keys(mmryData).reduce((p, prop) => {
        if (!mmryData[prop].changed) { return p; }                              console.log('setting [%s] data = [%O]', prop, mmryData[prop].value);
        return p.then(() => _u.setData(prop, mmryData[prop].value));
    }, Promise.resolve());
}
function addErrsToReturnData(data) {
    if (failed.errors.length) {
        data.errors = { msg: failed.errors[0][0], tag: failed.errors[0][1] };
    }
    return data;
}
function clearMemory() {
    mmryData = {};
    failed = { errors: [], updates: {}};
}
/** Sends a message and error tag back to the form to be displayed to the user. */
function reportDataUpdateErr(edits, prop, rcrd, entity, stage) {                //console.log('--------reportDataUpdateErr = %O', arguments)
    var trans = {
        'addData': 'adding to', 'rmvData': 'removing from'
    };
    var msg = 'There was an error while '+trans[stage]+' the '+ entity +
        '\'s stored data.';
    var errTag = stage + ':' +  prop + ':' + entity + ':' + rcrd.id;
    failed.errors.push([ msg, errTag ]);
}