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
import * as _u from './util.js';
import * as _errs from './data-entry/forms/validation/form-errors.js';
import { rebuildCitationText } from './data-entry/forms/features/generate-citation.js';
import { initDataTable, initSearchState, showIntroAndLoadingMsg } from './db-page.js';

let failed = { errors: [], updates: {}};
/** Stores entity data while updating to reduce async db calls. */
let mmryData = {};
/* ========================= DATABASE SYNC ================================== */
/**
 * On search page load, the system updatedAt flag is compared against the page's. 
 * If there they system data has updates more recent than the last sync, the 
 * updated data is ajaxed and stored @syncUpdatedData. 
 * On a browser's first visit to the page, all data is downloaded and the 
 * search page ui is initialized @initStoredData.
 */
export function syncLocalDbWithServer(lclUpdtdAt) {                             console.log("   /--syncLocalDbWithServer");
    _u.sendAjaxQuery({}, "ajax/data-state", checkAgainstLocalDataState);
    
    function checkAgainstLocalDataState(srvrUpdtdAt) {  
        if (ifTestEnvDbNeedsReset(srvrUpdtdAt.state.System)) { return _u.downloadFullDb(); }
        const entities = checkEachEntityForUpdates(srvrUpdtdAt.state);
        return entities.length ? syncDb(entities) : initSearchPage();
    }
    function checkEachEntityForUpdates(srvrUpdtdAt) {                           //console.log('checkEachEntityForUpdates. srvrUpdtdAt = %O, lcl = %O', srvrUpdtdAt.state, lclUpdtdAt);
        delete srvrUpdtdAt.System;
        return Object.keys(srvrUpdtdAt).map(entity => {                         //console.log('   --[%s] updates ? ', entity, entityHasUpdates(srvrUpdtdAt[entity], lclUpdtdAt[entity]));
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
    _u.getData('curFocus', true).then(f => initSearchState(f));
}
function syncDb(entities) {
    downloadAndStoreNewData(entities)
    .then(retryFailedUpdatesAndLoadTable)
    .then(storeLocalDataState);
}
function storeLocalDataState() {
    _u.sendAjaxQuery({}, "ajax/data-state").then(srvrState => {
        storeData('lclDataUpdtdAt', srvrState.state);  
    }); 
}
function trackTimeUpdated(entity, rcrd) {
    return _u.getData('lclDataUpdtdAt').then(stateObj => {
        stateObj[entity] = rcrd.serverUpdatedAt;
        return storeData('lclDataUpdtdAt', stateObj);  
    }); 
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
    return Promise.all(promises).then(processUpdatedData).then(downloadIntUpdates);
    
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
    return data.reduce((p, entData) => {                                        
        const updateFunc = processUpdatedEntityData.bind(null, entData);
        return p.then(updateFunc);
    }, Promise.resolve());
} 
/** Parses and sends the returned data to @storeUpdatedData. */ 
function processUpdatedEntityData(data) {                                       
    const entity = Object.keys(data)[0];                                        console.log("       --processUpdatedEntityData [%s] = %O", entity, data[entity]); 
    return storeUpdatedData(parseData(data[entity]), entity); 
}
/** Sends the each updated record to the update handler for the entity. */ 
function storeUpdatedData(rcrds, entity) {  
    const coreEntities = ['Interaction', 'Location', 'Source', 'Taxon']; 
    const entityHndlr = coreEntities.indexOf(entity) !== -1 ?  
        addCoreEntityData : addDetailEntityData; 
    return Object.keys(rcrds).reduce((p, id) => {
        const updateFunc = entityHndlr.bind(null, _u.lcfirst(entity), rcrds[id]);
        return p.then(updateFunc);
    }, Promise.resolve());
} 
function retryFailedUpdatesAndLoadTable() {                                     //console.log('retryFailedUpdatesAndLoadTable')
    return retryFailedUpdates()
    .then(addErrsToReturnDataAndClearMemory.bind(null, {}))
    .then(errs => {                                                             if (Object.keys(errs).length) {console.log('errs = %O', errs)}
        initSearchPage(); //TODO: send errors during init update to search page and show error message to user.
    });
}
/**
 * Updates the stored data's updatedAt flag, and initializes the search-page 
 * table with the updated data @initDataTable. 
 */
function loadDataTable() {    
    storeLocalDataState();
    initDataTable();                                                            //console.log('Finished updating! Loading search table.')
}
/* ======================== AFTER FORM SUBMIT =============================== */
/**
 * On crud-form submit success, the returned data is added to, or updated in, 
 * all relevant stored data @updateEntityData. Local storage state is stored and 
 * the data, along with any errors or messages, is returned.
 */
export function updateLocalDb(data) {                                           console.log("   /--updateLocalDb data recieved = %O", data);
    parseEntityData(data);
    return updateEntityData(data)
    .then(retryFailedUpdates)
    .then(addErrsToReturnDataAndClearMemory.bind(null, data))
    .then(storeLocalDataState)
    .then(() => data);
}
/** Stores both core and detail entity data, and updates data affected by edits. */
function updateEntityData(data) {
    return addCoreEntityData(data.core, data.coreEntity)
    .then(updateDetailEntityData.bind(null, data))
    .then(updateAffectedData.bind(null, data))
    .then(d => d);
}
function updateDetailEntityData(data) {
    if (!data.detailEntity) { return Promise.resolve(); }
    return addDetailEntityData(data.detail, data.detailEntity);
}
/* ------------------------------ ADD DATA ---------------------------------- */
/** Updates stored-data props related to a core-entity record with new data. */
function addCoreEntityData(entity, rcrd) {                                      console.log("       --Updating Core entity. %s. %O", entity, rcrd);
    return updateCoreData(entity, rcrd)
    .then(updateCoreDataProps.bind(null, entity, rcrd))
    .then(trackTimeUpdated.bind(null, entity, rcrd));
}
/** 
 * Updates the stored core-records array and the stored entityType array. 
 * Note: Taxa are the only core entity without 'types'.
 */
function updateCoreData(entity, rcrd) {                                         //console.log("           --Updating Record data", entity);
    return addToRcrdProp(entity, rcrd)
    .then(addToCoreTypeProp.bind(null, entity, rcrd));
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
function getSourceType(entity, rcrd) {
    var type = _u.lcfirst(entity)+"Type";
    return _u.lcfirst(rcrd[type].displayName);
}
/** Sends entity-record data to each storage property-type handler. */
function updateDataProps(entity, rcrd, updateFuncs) {                           //console.log("           --updateDataProps [%s]. %O. updateFuncs = %O", entity, rcrd, updateFuncs);
    const params = { entity: entity, rcrd: rcrd, stage: 'addData' };
    return Object.keys(updateFuncs).reduce((promise, prop) => {
        const updateFunc = updateData.bind(null, updateFuncs[prop], prop, params);
        return promise.then(updateFunc);
    }, Promise.resolve());
}
/** Updates stored-data props related to a detail-entity record with new data. */
function addDetailEntityData(entity, rcrd) {                                    console.log("Updating Detail entity. %s. %O", entity, rcrd);
    return updateDetailData(entity, rcrd)
    .then(trackTimeUpdated.bind(null, entity, rcrd));
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
    return getStoredData(prop).then(rcrds => {                                  //console.log("               --addToRcrdProp. [%s] = %O. rcrd = %O", prop, rcrds, rcrd);
        rcrds[rcrd.id] = rcrd;
        return storeData(prop, rcrds);
    });
}
/** Add the new record to the prop's stored records object.  */
function addToRcrdAryProp(prop, rcrd, entity) {  
    return getStoredData(prop).then(rcrds => {                                  //console.log("               --addToRcrdAryProp. [%s] = %O. rcrd = %O", prop, rcrds, rcrd);
        addIfNewRcrd(rcrds, rcrd.id);
        return storeData(prop, rcrds);
    });
}
/** Add the new entity's display name and id to the prop's stored names object.  */
function addToNameProp(prop, rcrd, entity) {
    return getStoredData(prop).then(nameObj => {                                   //console.log("               --addToNameProp. [%s] = %O. rcrd = %O", prop, nameObj, rcrd);
        nameObj[rcrd.displayName] = rcrd.id;
        return storeData(prop, nameObj);
    });
}
/** Add the new record's id to the entity-type's stored id array.  */
function addToTypeProp(prop, rcrd, entity) {                                    
    const typeId = rcrd[prop] ? rcrd[prop].id : false;
    if (!typeId) { return Promise.resolve(); }
    return getStoredData(prop).then(typeObj => {                                   //console.log("               --addToTypeProp. [%s] = %O. rcrd = %O", prop, typeObj, rcrd);
        typeObj[typeId][entity+'s'].push(rcrd.id);
        return storeData(prop, typeObj);
    });
}
function addIfNewRcrd(ary, id) {
    if (ary.indexOf(id) === -1) { ary.push(id); }                               //console.log("Pushing id %s to array.", id);
}
/** Adds a new child record's id to it's parent's 'children' array. */ 
function addToParentRcrd(prop, rcrd, entity) {                              
    if (!rcrd.parent) { return Promise.resolve(); }
    return getStoredData(prop).then(parentObj => {                                 //console.log("               --addToParentRcrd. [%s] = %O. rcrd = %O", prop, parentObj, rcrd);
        const parent = parentObj[rcrd.parent];
        addIfNewRcrd(parent.children, rcrd.id);
        return storeData(prop, parentObj);
    });
}
/** Adds a new tagged record to the tag's array of record ids. */
function addToTagProp(prop, rcrd, entity) {                                 
    if (rcrd.tags.length > 0) {
        return getStoredData(prop).then(tagObj => {                                //console.log("               --addToTagProp. [%s] = %O. rcrd = %O", prop, tagObj, rcrd);
            rcrd.tags.forEach((tag) => {
                addIfNewRcrd(tagObj[tag.id][entity+'s'], rcrd.id);         
            });
            return storeData(prop, tagObj);
        });
    }
    return Promise.resolve();
}
/** Adds the Taxon's name to the stored names for it's realm and level.  */
function addToTaxonNames(prop, rcrd, entity) {
    const realm = rcrd.realm.displayName;
    const level = rcrd.level.displayName;  
    const nameProp = realm+level+"Names";
    const addFunc = addToNameProp.bind(null, nameProp, rcrd, entity);
    return getStoredData(nameProp, true).then(nameObj => {                         //console.log('addToTaxonNames. [%s] = %O', nameProp, nameObj);                    
/** Creates the level property if no taxa have been saved at this level and realm.  */
        return nameObj ? addFunc() : storeData(nameProp, {}).then(addFunc);
    });
}
/** Adds the Interaction to the stored entity's collection.  */
function addInteractionToEntity(prop, rcrd, entity) {                           //console.log('addInteractionToEntity. prop = [%s] rcrd = %O', prop, rcrd);
    if (!rcrd[prop]) {return;}
    return getStoredData(prop).then(rcrds => {                                     //console.log("               --addInteractionToEntity. [%s] = %O. rcrd = %O", prop, rcrds, rcrd);
        const storedEntity = rcrds[rcrd[prop]];
        addIfNewRcrd(storedEntity.interactions, rcrd.id);
        if (prop === 'source') { storedEntity.isDirect = true; }
        return storeData(prop, rcrds);
    });
}
/** Adds the Interaction to the taxon's subject/objectRole collection.  */
function addInteractionRole(prop, rcrd, entity) {  
    return getStoredData('taxon').then(taxa => {                                   //console.log("               --addInteractionRole. [%s] = %O. taxa = %O", prop, taxa, rcrd);
        const taxon = taxa[rcrd[prop]];
        // if (!taxon) {  }
        addIfNewRcrd(taxon[prop+"Roles"], rcrd.id);
        return storeData("taxon", taxa);            
    });     
}
/** When a Publication/Citation has been updated, add new author contributions. */
function addContribData(prop, rcrd, entity) {                                   //console.log("               --addContribData. [%s] [%s]. rcrd = %O", prop, entity, rcrd);
    if (!rcrd[prop]) { return Promise.resolve(); }
    return getStoredData('source').then(srcObj => {
        for (let ord in rcrd[prop]) {
            const authId = rcrd[prop][ord];
            addIfNewRcrd(srcObj[authId].contributions, rcrd.id);
        }
        return storeData('source', srcObj);
    });
}
/* ---------------------------- REMOVE DATA --------------------------------- */
/** Updates any stored data that was affected during editing. */
function updateAffectedData(data) {                                             console.log("           --updateAffectedData called. data = %O", data);
    return updateRelatedCoreData(data, data.coreEdits)
    .then(updateRelatedDetailData.bind(null, data))
    .then(ifEditedSourceDataUpdatedCitations.bind(null, data));
}
function updateRelatedCoreData(data, edits) {
    return !hasEdits(edits) ? Promise.resolve() :
        updateAffectedDataProps(data.core, data.coreEntity, edits);
}
function updateRelatedDetailData(data) {
    return !hasEdits(data.detailEdits) ? Promise.resolve() :
        updateAffectedDataProps(data.detail, data.detailEntity, data.detailEdits);
}
function hasEdits(editObj) {
    return editObj && Object.keys(editObj).length > 0;
}
/** Updates relational storage props for the entity. */
function updateAffectedDataProps(entity, rcrd, edits) {                         console.log("               --updateAffectedDataProps called for [%s]. edits = %O", entity, edits);
    const params = { entity: entity, rcrd: rcrd, stage: 'rmvData' };
    const hndlrs = getRmvDataPropHndlrs(entity);                                
    return Object.keys(edits).reduce((promise, prop) => {  
        if (!hndlrs[prop]) { return promise.then(); }
        const update = updateData.bind(null, hndlrs[prop], prop, params, edits);
        return promise.then(update);
    }, Promise.resolve());
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
    if (!edits[prop].old) { return Promise.resolve(); }
    return getStoredData(entity).then(rcrds => {                                   //console.log("               --rmvFromParent. [%s] = %O. rcrd = %O", prop, rcrds, rcrd);  
        rmvIdFromAry(rcrds[edits[prop].old].children, rcrd.id);                
        return storeData(entity, rcrds);
    });
}
/** Removes the Interaction from the stored entity's collection. */
function rmvIntFromEntity(prop, rcrd, entity, edits) {   
    return getStoredData(prop).then(rcrds => {                                     //console.log("               --rmvIntFromEntity. [%s] = %O. rcrd = %O, edits = %O", prop, rcrds, rcrd, edits);
        const storedEntity = rcrds[edits[prop].old];
        rmvIdFromAry(storedEntity.interactions, rcrd.id);
        return storeData(prop, rcrds);
    });
}
/** Removes the Interaction and updates parent location total counts.  */
function rmvIntAndAdjustTotalCnts(prop, rcrd, entity, edits) {
    return getStoredData(prop).then(removeIntAndUpdateLoc);

    function removeIntAndUpdateLoc(rcrds) {                                     //console.log("               --rmvIntFromLocation. [%s] = %O. rcrd = %O, edits = %O", prop, rcrds, rcrd, edits);
        const oldLoc = rcrds[edits[prop].old];
        const newLoc = rcrds[edits[prop].new];
        rmvIdFromAry(oldLoc.interactions, rcrd.id);
        adjustLocCnts(oldLoc, newLoc, rcrds);
        return storeData('location', rcrds);
    }
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
    return getStoredData('taxon').then(taxa => {                                   //console.log("               --rmvIntFromTaxon. [%s] = %O. taxa = %O", prop, taxa, rcrd);
        const taxon = taxa[edits[prop].old];      
        rmvIdFromAry(taxon[prop+"Roles"], rcrd.id);
        return storeData("taxon", taxa);   
    });  
}
/** Removes the record from the entity-type's stored array. */
function rmvFromTypeProp(prop, rcrd, entity, edits) { 
    if (!edits[prop].old) { return Promise.resolve(); }
    return getStoredData(prop).then(typeObj => {                                   //console.log("               --rmvFromTypeProp. [%s] = %O. rcrd = %O", prop, typeObj, rcrd);
        const type = typeObj[edits[prop].old];
        rmvIdFromAry(type[entity+'s'], rcrd.id);
        return storeData(prop, typeObj);
    });
}
/** Removes a record from the tag's array of record ids. */
function rmvFromTagProp(prop, rcrd, entity, edits) {                                 
    if (!edits.tag.removed) { return Promise.resolve(); }
    return getStoredData(prop).then(tagObj => {                                    //console.log("               --rmvFromTagProp. [%s] = %O. rcrd = %O", prop, tagObj, rcrd);
        edits.tag.removed.forEach(function(tagId){
            rmvIdFromAry(tagObj[tagId][entity+'s'], rcrd.id);                
        });
        return storeData(prop, tagObj);
    });
}
function rmvContrib(prop, rcrd, entity, edits) {                                //console.log("               --rmvContrib. edits = %O. rcrd = %O", edits, rcrd)
    return getStoredData('source').then(srcObj => {                                       
        edits.contributor.removed.forEach(id => 
            rmvIdFromAry(srcObj[id].contributions, rcrd.id));
        return storeData('source', srcObj);
    });
}
function rmvFromNameProp(prop, rcrd, entity, edits) { 
    const lvls = ["Kingdom", "Phylum", "Class", "Order", "Family", "Genus", "Species"];
    const realm = rcrd.realm.displayName;
    const level = edits.level ? lvls[edits.level.old-1] : rcrd.level.displayName;
    const taxonName = edits.displayName ? edits.displayName.old : rcrd.displayName;
    return getStoredData(realm+level+'Names', true).then(nameObj => {              //console.log("               --rmvFromNameProp [%s] = %O, rcrd = %O, edits = %O",realm+level+'Names', nameObj, rcrd, edits)
        delete nameObj[taxonName];
        return storeData(realm+level+'Names', nameObj);  
    }); 
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
        .then(rcrds => updateCitations(rcrds));  

    function getChildCites(srcs) {  
        const cites = [];
        srcs.forEach(id => {
            const src = mmryData['source'][id]; 
            if (src.citation) { return cites.push(id); }
            src.children.forEach(cId => cites.push(cId))
        });
        return cites;
    }
    function updateCitations(rcrds) {                                           //console.log('updateCitations. rcrds = %O cites = %O', rcrds, cites);
        const proms = [];
        cites.forEach(id => proms.push(updateCitText(id)));
        return Promise.all(proms).then(onUpdateSuccess)
        
        function updateCitText(id) {
            const citSrc = mmryData['source'][id];
            const pub = mmryData['source'][citSrc.parent];
            const cit = rcrds[1][citSrc.citation];                              
            const citText = rebuildCitationText(citSrc, cit, pub, rcrds, mmryData['source']);       
            return updateCitationData(citSrc, citText);
        }
    }
} /* End updateRelatedCitations */
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
    parseEntityData(data.results);
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
        
        storeData(rcrdKey, rcrds);
        storeData(nameKey, names);
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
    _u.getData('curFocus')
    .then(focus => {
        db_ui.showLoadingDataPopUp();
        _u.downloadFullDb();
    });
}
/**
 * The first time a browser visits the search page all entity data is downloaded
 * from the server and stored locally @ajaxAndStoreAllEntityData. A data-loading 
 * popup message and intro-walkthrough are shown on the Search page.
 */
export function initStoredData(reset) {
    showIntroAndLoadingMsg(reset);
    return ajaxAndStoreAllEntityData(reset);
}
/**
 * The first time a browser visits the search page all entity data is downloaded
 * from the server and stored locally @storeEntityData. Database search page 
 * table build begins @initSearchState.
 * Entities downloaded with each ajax call:
 *   /taxon - Taxon, Realm, Level 
 *   /location - HabitatType, Location, LocationType, 'noLocIntIds' 
 *   /source - Author, Citation, CitationType, Publication, PublicationType, 
 *       Source, SourceType, Tag
 *   /interaction - Interaction, InteractionType  
 */
function ajaxAndStoreAllEntityData(reset) {                                     console.log("   --ajaxAndStoreAllEntityData");
    return $.when(
        $.ajax("ajax/taxon"), $.ajax("ajax/location"), 
        $.ajax("ajax/source"), $.ajax("ajax/interaction"),
        $.ajax("ajax/lists"),  $.ajax("ajax/geojson")
    ).then(function(a1, a2, a3, a4, a5, a6) {                                   console.log("       --Ajax success: args = %O", arguments); 
        $.each([a1, a2, a3, a4, a5, a6], (idx, a) => storeServerData(a[0]));
        deriveAndStoreData([a1[0], a2[0], a3[0], a4[0], a5[0]]);
        storeData('user', $('body').data('user-name'));
        if (reset) { initDataTable(); 
        } else { initSearchState(); }
        storeLocalDataState();
    });
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
function parseData(data) {
    for (var id in data) { data[id] = JSON.parse(data[id]); }
    return data;
}
/** Adds the data derived from the serialized entity data to data storage. */
function deriveAndStoreData(data) {
    deriveAndStoreTaxonData(data[0]);
    deriveAndStoreLocationData(data[1]);
    deriveAndStoreSourceData(data[2]);
    deriveInteractionData(data[3]);
    deriveUserNamedListData(data[4]);
}
/** Stores an object of taxon names and ids for each level in each realm. */
function deriveAndStoreTaxonData(data) {                                        //console.log("deriveAndStoreTaxonData called. data = %O", data);
    storeData('levelNames', getNameDataObj(Object.keys(data.level), data.level));
    storeData('objectRealmNames', getObjectRealmNames(data.realm));
    storeTaxaByLevelAndRealm(data.taxon);
}
function getObjectRealmNames(realms) {                                          //console.log('getObjectRealmNames. [%s] realms = %O',Object.keys(realms).length, realms);
    let data = {};
    Object.keys(realms).forEach(i => {
        if (realms[i].displayName === 'Bat') { return; }  
        data[realms[i].displayName] = realms[i].id;
    });
    return data;
}
function storeTaxaByLevelAndRealm(taxa) {
    var realmData = separateTaxaByLevelAndRealm(taxa);                          //console.log("taxonym realmData = %O", realmData);
    for (var realm in realmData) {  
        storeTaxaByLvl(realm, realmData[realm]);
    }
}
function storeTaxaByLvl(realm, taxonObj) {
    for (var level in taxonObj) {                                               //console.log("storing as [%s] = %O", realm+level+'Names', taxonObj[level]);
        storeData(realm+level+'Names', taxonObj[level]);
    }
}
/** Each taxon is sorted by realm and then level. 'Animalia' is skipped. */
function separateTaxaByLevelAndRealm(taxa) {  
    const data = { "Bat": {}, "Plant": {}, "Arthropod": {} };
    Object.keys(taxa).forEach(id => {
        if (undefined == taxa[id] || 'animalia' == taxa[id].slug) { return; }
        addTaxonData(taxa[id]);
    })
    return data;
    /** Adds the taxon's name (k) and id to it's level's obj. */
    function addTaxonData(taxon) {
        const realmObj = getRealmObj(taxon);
        const level = taxon.level.displayName;  
        if (!realmObj[level]) { realmObj[level] = {}; }; 
        realmObj[level][taxon.displayName] = taxon.id;
    }
    function getRealmObj(taxon) {
        const realm = taxon.realm.displayName
        const key = realm === 'Animalia' ? 'Bat' : realm;
        return data[key];
    }
} /* End separateTaxaByLevelAndRealm */
/** 
 * [entity]Names - an object with each entity's displayName(k) and id.
 * location - resaved locations with an additional data point for countries. 
 */
function deriveAndStoreLocationData(data) {                                     //console.log('loc data to store = %O', data);
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
/** Note: Top regions are the trunk of the location data tree. */
/**
 * [entity]Names - an object with each entity's displayName(k) and id.
 * [entity]Sources - an array with of all source records for the entity type.
 */
function deriveAndStoreSourceData(data) {                                       //console.log("source data = %O", data);
    const authSrcs = getTypeObj(data.sourceType, 'author', 'sources');
    const pubSrcs = getTypeObj(data.sourceType, 'publication', 'sources');
    const publSrcs = getTypeObj(data.sourceType, 'publisher', 'sources'); 
    storeData('authSrcs', authSrcs);         
    storeData('pubSrcs', pubSrcs);              
    storeData('publSrcs', publSrcs);
    storeData('citTypeNames', getTypeNameData(data.citationType));        
    storeData('pubTypeNames', getTypeNameData(data.publicationType));        
}
function getTypeObj(types, type, collection) { 
    for (const t in types) {
        if (types[t].slug === type) { return types[t][collection]; }
    }
}
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
    var data = {};
    ids.forEach(function(id) { data[id] = rcrds[id]; });        
    return data;
}
/** Returns an object with each entity record's displayName (key) and id. */
function getNameDataObj(ids, rcrds) {                                           //console.log('ids = %O, rcrds = %O', ids, rcrds);
    var data = {};
    ids.forEach(function(id) { data[rcrds[id].displayName] = id; });            //console.log("nameDataObj = %O", data);
    return data;
}
/** Returns an object with each entity types's displayName (key) and id. */
function getTypeNameData(typeObj) {
    var data = {};
    for (var id in typeObj) {
        data[typeObj[id].displayName] = id;
    }  
    return data;
}
/** Returns an object with each entity tag's displayName (key) and id. */
function getTagData(tags, entity) {
    var data = {};
    for (var id in tags) {
        if ( tags[id].constrainedToEntity === entity ) {
            data[tags[id].displayName] = id;
        }
    }  
    return data;
}
/** 
 * [type] - array of user created interaction and filter sets.
 * [type]Names - an object with each set item's displayName(k) and id.
 */
function deriveUserNamedListData(data) {                                        //console.log('list data = %O', data)
    const filters = {};
    const filterIds = [];
    const int_sets = {};
    const int_setIds = [];

    data.lists.forEach(l => { 
        let entities = l.type == 'filter' ? filters : int_sets;
        let idAry = l.type == 'filter' ? filterIds : int_setIds;
        entities[l.id] = l;
        idAry.push(l.id);
    });

    storeData('savedFilters', filters);
    storeData('savedFilterNames', getFilterOptionGroupObj(filterIds, filters));
    storeData('dataLists', int_sets);
    storeData('dataListNames', getNameDataObj(int_setIds, int_sets));
}
function getFilterOptionGroupObj(ids, filters) {                                //console.log('getFilterOptionGroupObj ids = %O, filters = %O', ids, filters);
    const data = {};
    ids.forEach(function(id) { 
        data[filters[id].displayName] = { 
            value: id, group: getFocusAndViewOptionGroupString(filters[id]) }
    });                                                                         //console.log("nameDataObj = %O", data);
    return data;
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
export function replaceUserData(userName, data) {                               //console.log('replaceUserData. [%s] = %O', userName, data);
    data.lists = data.lists.map(l => JSON.parse(l));
    deriveUserNamedListData(data);
    storeData('user', userName);
}
/* =========================== HELPERS ====================================== */
/**
 * Parses the nested objects in the returned JSON data. This is because the 
 * data comes back from the server having been double JSON-encoded, due to the 
 * 'serialize' library and the JSONResponse object. 
 */
function parseEntityData(data) {  
    data.coreEntity = JSON.parse(data.coreEntity);
    data.detailEntity = JSON.parse(data.detailEntity);
}
function getStoredData(prop, returnUndefined) {
    if (mmryData[prop]) { return Promise.resolve(mmryData[prop]); }
    return _u.getData(prop, returnUndefined).then(data => {
        mmryData[prop] = data;
        return data;
    });
}
/** Stores passed data under the key in dataStorage. */
function storeData(key, data) {
    mmryData[key] = data;
    return _u.setData(key, data);
}
/**
 * Attempts to update the data and catches any errors.
 * @param  {func} updateFunc  To update the entity's data.
 * @param  {str}  prop   Entity prop to update     
 * @param  {obj}  params Has props shown, as well as the current update stage. 
 * @param  {obj}  edits  Edit obj returned from server 
 */
function updateData(updateFunc, prop, params, edits) {                          //console.log('prop [%s] -> params [%O], updateFunc = %O', prop, params, updateFunc);
    return updateFunc(prop, params.rcrd, params.entity, edits)
    .catch((e) => {                                                             console.log('###### Error with [%s] params = [%O] e = %O', prop, params, e);
        return handleFailedUpdate(prop, updateFunc, params, edits);
    });
    // try {
    //     return ;
    // } catch (e) {   
    // }
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
function retryFailedUpdates() {                                                 console.log('           --retryFailedUpdates. failed = %O', failed);
    if (!Object.keys(failed.updates).length) { return Promise.resolve(); }
    failed.twice = true;   
    return Promise.all(Object.keys(failed.updates).reduce(retryEntityUpdates));
}
function retryEntityUpdates(entity) {
    return Object.keys(failed.updates[entity]).reduce((p, prop) => {
        let params = failed.updates[entity][prop];  
        let updateFunc = updateData.bind(null, params.updateFunc, prop, params, params.edits);
        return p.then(updateFunc);
    }, Promise.resolve());
}
function addErrsToReturnDataAndClearMemory(data) {                              //console.log('       --addErrsToReturnDataAndClearMemory. data = %O, errs = %O', data, failed.errors);  
    if (failed.errors.length) {
        data.errors = { msg: failed.errors[0][0], tag: failed.errors[0][1] };
    }
    clearMemory();
    return Promise.resolve(data);
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