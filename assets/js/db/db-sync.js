/**
 * Handles adding, updating, and removing data from local storage.
 * Exports:                 Imported by:
 *     addNewDataToStorage          idb-util
 *     initStoredData
 *     replaceUserData              util
 *     resetStoredData
 *     updateEditedData
 *     updateUserNamedList
 */
import * as _u from './util.js';
import { initDataTable, initSearchState, showIntroAndLoadingMsg } from './db-page.js';
import * as idb from 'idb-keyval'; //set, get, del, clear

let failed = { errors: [], updates: {}};
let allRcrds = {};

/** Returns the current date time in the format: Y-m-d H:i:s */
function getCurrentDate() {
    return new Date().today() + " " + new Date().timeNow();
}
/*------------------ Page Load Data Sync ---------------------------------*/
/**
 * On search page load, the system updatedAt flag is compared against the page's. 
 * If there they system data has updates more recent than the last sync, the 
 * updated data is ajaxed and stored @syncUpdatedData. 
 * On a browser's first visit to the page, all data is downloaded and the 
 * search page ui is initialized @initStoredData.
 */
export function addNewDataToStorage(pgUpdatedAt, data) {                 console.log("pgDataUpdatedAt = [%s], serverState = [%O]", pgUpdatedAt, data.state);
    if (!ifEntityUpdates(data.state.System, pgUpdatedAt)) { return initSearchPage(); }
    delete data.state.System;  //System updatedAt is no longer needed.
    syncUpdatedData(data.state, pgUpdatedAt);
     // var pgUpdatedAt = reset ? false : _u.getDataFromStorage('pgDataUpdatedAt'); console.log("pgDataUpdatedAt = [%s], sysUpdatedAt = [%s]", pgUpdatedAt, dataUpdatedAt.System);
    // if (!pgUpdatedAt) { return initStoredData(); } 
    // if (!ifEntityUpdates(dataUpdatedAt.System, pgUpdatedAt)) { 
    //    return getUserSpecificUpdates(); 
    // }
    // delete dataUpdatedAt.System;  //System updatedAt is no longer needed.
    // syncUpdatedData(dataUpdatedAt, pgUpdatedAt);
}
function initSearchPage() {
    _u.getData('curFocus').then(f => initSearchState(f));
}
/**
 * Returns true if the first datetime is more recent than the second. 
 * Note: for cross-browser date comparisson, dashes must be replaced with slashes.
 */
function ifEntityUpdates(timeOne, timeTwo) {  
    var time1 = timeOne.replace(/-/g,'/');  
    var time2 = timeTwo.replace(/-/g,'/');                                      //console.log("firstTimeMoreRecent? ", Date.parse(time1) > Date.parse(time2))
    return Date.parse(time1) > Date.parse(time2);
}
/**
 * Updates user specific data in local storage. Useful when the user changes on the
 * same machine, or when the search page is first visited before a user logged in.
 */
// function getUserSpecificUpdates() {
//     _u.sendAjaxQuery(null, "ajax/lists", storeUserSpecificData);                //console.log('Data updated.');
// }
function storeUserSpecificData(data) {
    data.lists = data.lists.map(l => JSON.parse(l));
    deriveUserNamedListData(data);
}
/** Filter updatedAt entities and send those with updates to @ajaxNewData. */
function syncUpdatedData(updatedAt, pgUpdatedAt) {                              console.log("Synching data updated since - ", pgUpdatedAt);
    var withUpdates = Object.keys(updatedAt).filter(function(entity){
        return ifEntityUpdates(updatedAt[entity], pgUpdatedAt);
    });                                                                         console.log("entities with updates = %O", JSON.parse(JSON.stringify(withUpdates)));
    if (!withUpdates) { console.log("No updated entities found when system flagged as updated."); return; }
    ajaxNewData(withUpdates, pgUpdatedAt);
}
/** 
 * Sends an ajax call for each entity with updates. On return, the new data 
 * is stored @processUpdatedData. Interactions are sent after all other entity
 * updates. Finally, any failed updates are retried and then the search page 
 * is reloaded.
 * TODO: Add 'fail' callback for server errors. Send back any errors and 
 * describe them to the user. 
 */ 
function ajaxNewData(entities, lastUpdated) { 
    const ints = entities.indexOf('Interaction') !== -1 ?  
        entities.splice(entities.indexOf('Interaction'), 1) : false;    
    const promises = entities.map(e => getNewData(e)); 
    $.when(...promises).then(processUpdatedData).then(updateInteractions)
        .done(retryFailedUpdatesAndLoadTable);
     
    function getNewData(entity, func) {                                         //console.log('getting new data for ', entity); 
        let data = { entity: entity, updatedAt: lastUpdated }; 
        const hndlr = func || null;
        return _u.sendAjaxQuery(data, "ajax/sync-data", hndlr); 
    } 
    function updateInteractions() {                                         
        return ints ? getNewData('Interaction', processUpdatedEntityData) : null;
    }
} /* End ajaxNewData */ 
/** Sends each entity's ajax return to be processed and stored. */
function processUpdatedData() {    
    if (arguments[1] === "success") { return processUpdatedEntityData(...arguments); }
    for (let data in arguments) { 
        processUpdatedEntityData(arguments[data][0]);
    }
} 
/** Parses and sends the returned data to @storeUpdatedData. */ 
function processUpdatedEntityData() { 
    const results = arguments[0]; 
    const entity = Object.keys(results)[0];                                     //console.log("[%s] data returned from server = %O", entity, results); 
    const data = parseData(results[entity]); 
    storeUpdatedData(data, entity); 
}
/** Sends the each updated record to the update handler for the entity. */ 
function storeUpdatedData(rcrds, entity) { 
    const coreEntities = ['Interaction', 'Location', 'Source', 'Taxon']; 
    const entityHndlr = coreEntities.indexOf(entity) !== -1 ?  
        addCoreEntityData : addDetailEntityData; 
    for (let id in rcrds) { 
        entityHndlr(_u.lcfirst(entity), rcrds[id]); 
    } 
} 
/** Stores interaction data and inits the search-page table.*/ 
function storeDataAndRetryFailedUpdates(results) { 
    processUpdatedData(results); 
    retryFailedUpdatesAndLoadTable();
} 
function retryFailedUpdatesAndLoadTable() {                                     //console.log('retryFailedUpdatesAndLoadTable')
    retryFailedUpdates();
    loadDataTable(); //TODO: send errors during init update to search page and show error message to user.
}
/**
 * Updates the stored data's updatedAt flag, and initializes the search-page 
 * table with the updated data @initDataTable. 
 */
function loadDataTable() {                                                      //console.log('Finished updating! Loading search table.')
    storeData('pgDataUpdatedAt', getCurrentDate()); 
    initDataTable(); 
}
/*------------------ Update Submitted Form Data --------------------------*/
export function updateEditedData(data, cb) {
    updateStoredData(data, cb);
}
/**
 * On crud-form submit success, the returned data is added to, or updated in, 
 * all relevant stored data @updateEntityData. The stored data's lastUpdated 
 * flag, 'pgDataUpdatedAt', is updated. The callback returns to db_forms.
 */
function updateStoredData(data, cb) {                                           //console.log("updateStoredData data recieved = %O", data);
    updateEntityData(data);
    storeData('pgDataUpdatedAt', getCurrentDate());                             //console.log('pgDataUpdatedAt = ', getCurrentDate())
    retryFailedUpdates();
    sendDataUpdateStatus(data, cb);
}
function sendDataUpdateStatus(data, onDataSynced) {                             //console.log('sendDataUpdateStatus. data = %O, errs = %O', data, failed.errors);  
    const errs = failed.errors;  
    const msg = errs.length ? errs[0][0] : null;
    const tag = errs.length ? errs[0][1] : null;
    data.errors = errs.length ? errs : false;
    onDataSynced(data, msg, tag);
}
/** Stores both core and detail entity data, and updates data affected by edits. */
function updateEntityData(data) {
    addCoreEntityData(data.core, data.coreEntity);
    if (data.detailEntity) { 
        addDetailEntityData(data.detail, data.detailEntity);
    }
    updateAffectedData(data);
}
/*------------------ Add-to-Storage Methods ------------------------------*/
/** Updates stored-data props related to a core-entity record with new data. */
function addCoreEntityData(entity, rcrd) {                                      //console.log("Updating Core entity. %s. %O", entity, rcrd);
    var propHndlrs = getAddDataHndlrs(entity, rcrd);
    updateDataProps(propHndlrs, entity, rcrd);
    updateCoreData(entity, rcrd);
}
/** Returns an object of related data properties and their update methods. */
function getAddDataHndlrs(entity, rcrd) {
    var type = getEntityType(entity, rcrd);                                     //console.log("type = ", type);
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
/** 
 * Returns the record's entity'Type' for entities with stored data related to 
 * a 'type'. Eg, the sourceTypes author, publication, etc.
 */
function getEntityType(entity, rcrd) {
    if (entity === "source") { return getSourceType(entity, rcrd); }
    return false;
}
/** Returns the records source-type. */
function getSourceType(entity, rcrd) {
    var type = _u.lcfirst(entity)+"Type";
    return _u.lcfirst(rcrd[type].displayName);
}
/** Sends entity-record data to each storage property-type handler. */
function updateDataProps(propHndlrs, entity, rcrd) {                            //console.log("updateDataProps %O. [%s]. %O", propHndlrs, entity, rcrd);
    var params = { entity: entity, rcrd: rcrd, stage: 'addData' };
    for (var prop in propHndlrs) {
        updateData(propHndlrs[prop], prop, params);
    }
}
/** 
 * Updates the stored core-records array and the stored entityType array. 
 * Note: Taxa are the only core entity without 'types'.
 */
function updateCoreData(entity, rcrd) {                                         //console.log("Updating [%s] Core data", entity);
    addToRcrdProp(entity, rcrd);
    if (entity === "taxon") { return; }
    addToTypeProp(entity+"Type", rcrd, entity); 
} 
/** Updates stored-data props related to a detail-entity record with new data. */
function addDetailEntityData(entity, rcrd) {                                    //console.log("Updating Detail entity. %s. %O", entity, rcrd);
    var update = {
        'author': { 'author': addToRcrdProp },
        'citation': { 'citation': addToRcrdProp }, //Not necessary to add to citation type object.
        'publication': { 'publication': addToRcrdProp, 'publicationType': addToTypeProp },
        'publisher': { 'publisher': addToRcrdProp },
        'geoJson': { 'geoJson': addGeoJson } 
    };
    updateDataProps(update[entity], entity, rcrd)
}
/** Add the new record to the prop's stored records object.  */
function addToRcrdProp(prop, rcrd, entity) {  
    var rcrdObj = allRcrds[prop] || getDataFromLocalStorage(prop);              //console.log("addToRcrdProp. [%s] = %O. rcrd = %O", prop, rcrdObj, rcrd);
    rcrdObj[rcrd.id] = rcrd;
    storeData(prop, rcrdObj);
}
/** Add the new record to the prop's stored records object.  */
function addToRcrdAryProp(prop, rcrd, entity) {  
    var rcrdAry = allRcrds[prop] || getDataFromLocalStorage(prop);              //console.log("addToRcrdAryProp. [%s] = %O. rcrd = %O", prop, rcrdAry, rcrd);
    addIfNewRcrd(rcrdAry, rcrd.id);
    storeData(prop, rcrdAry);
}
/** Add the new entity's display name and id to the prop's stored names object.  */
function addToNameProp(prop, rcrd, entity) {
    var nameObj =  allRcrds[prop] || getDataFromLocalStorage(prop);             //console.log("addToNameProp. [%s] = %O. rcrd = %O", prop, nameObj, rcrd);
    nameObj[rcrd.displayName] = rcrd.id;
    storeData(prop, nameObj);
}
/** Add the new record's id to the entity-type's stored id array.  */
function addToTypeProp(prop, rcrd, entity) {
    var typeObj =  allRcrds[prop] || getDataFromLocalStorage(prop);             //console.log("addToTypeProp. [%s] = %O. rcrd = %O", prop, typeObj, rcrd);
    var typeId = rcrd[prop] ? rcrd[prop].id : false;
    if (!typeId) { return; }
    typeObj[typeId][entity+'s'].push(rcrd.id);
    storeData(prop, typeObj);
}
function addIfNewRcrd(ary, id) {
    if (ary.indexOf(id) === -1) { ary.push(id); }                               //console.log("Pushing id %s to array.", id);
}
/** Adds a new child record's id to it's parent's 'children' array. */ 
function addToParentRcrd(prop, rcrd, entity) {                              
    if (!rcrd.parent) { return; }
    var parentObj = allRcrds[prop] || getDataFromLocalStorage(prop);           //console.log("addToParentRcrd. [%s] = %O. rcrd = %O", prop, parentObj, rcrd);
    var parent = parentObj[rcrd.parent];
    addIfNewRcrd(parent.children, rcrd.id);
    storeData(prop, parentObj);
}
/** Adds a new tagged record to the tag's array of record ids. */
function addToTagProp(prop, rcrd, entity) {                                 
    if (rcrd.tags.length > 0) {
        var tagObj = allRcrds[prop] || getDataFromLocalStorage(prop);           //console.log("addToTagProp. [%s] = %O. rcrd = %O", prop, tagObj, rcrd);
        rcrd.tags.forEach(function(tag){
            addIfNewRcrd(tagObj[tag.id][entity+'s'], rcrd.id);                
        });
    }
}
/** Adds the Taxon's name to the stored names for it's realm and level.  */
function addToTaxonNames(prop, rcrd, entity) {
    const realm = rcrd.realm.displayName;
    const level = rcrd.level.displayName;  
    const nameProp = realm+level+"Names";
    addPropIfNewLevel(nameProp);
    addToNameProp(realm+level+"Names", rcrd, entity);
}
/** Creates the level property if no taxa have been saved at this level and realm.  */
function addPropIfNewLevel(nameProp) {
    var lvlObj = allRcrds[nameProp] || getDataFromLocalStorage(nameProp);
    if (lvlObj) { return; }                                                     //console.log(`creating new level for [${nameProp}]`);
    storeData(nameProp, {});
}
/** Adds the Interaction to the stored entity's collection.  */
function addInteractionToEntity(prop, rcrd, entity) {
    if (!rcrd[prop]) {return;}
    var rcrds = allRcrds[prop] || getDataFromLocalStorage(prop);                //console.log("addInteractionToEntity. [%s] = %O. rcrd = %O", prop, rcrds, rcrd);
    var storedEntity = rcrds[rcrd[prop]];
    addIfNewRcrd(storedEntity.interactions, rcrd.id);
    if (prop === 'source') { storedEntity.isDirect = true; }
    storeData(prop, rcrds);
}
/** Adds the Interaction to the taxon's subject/objectRole collection.  */
function addInteractionRole(prop, rcrd, entity) {  
    var taxa = allRcrds['taxon'] || getDataFromLocalStorage('taxon');           //console.log("addInteractionRole. [%s] = %O. taxa = %O", prop, taxa, rcrd);
    var taxon = taxa[rcrd[prop]];
    addIfNewRcrd(taxon[prop+"Roles"], rcrd.id);
    storeData("taxon", taxa);        
}
/** When a Publication/Citation has been updated, add new author contributions. */
function addContribData(prop, rcrd, entity) {                                   //console.log("-----addContribData. [%s] [%s]. rcrd = %O", prop, entity, rcrd);
    if (!rcrd[prop]) { return; }
    const srcObj = allRcrds['source'] || getDataFromLocalStorage('source');
    for (let ord in rcrd[prop]) {
        let authId = rcrd[prop][ord];
        addIfNewRcrd(srcObj[authId].contributions, rcrd.id);
    }
    storeData('source', srcObj);
}
/**
 * As IDB is only used for geoJson at this point, the geoJson prob is set to false
 * so that all geoJson will be fetched from the server fresh the next time it is
 * used. This is to reduce the number of calls to the server.
 */
function addGeoJson(prop, rcrd, entity) {                                       //console.log('addGeoJson. prop = [%s], rcrd = %O, entity = [%s]', prop, rcrd, entity); //'geoJson', obvi, 'location'
    idb.set('geoJson', false);
}
/*------------ Remove-from-Storage Methods -------------------------------*/
/** Updates any stored data that was affected during editing. */
function updateAffectedData(data) {                                             //console.log("updateAffectedData called. data = %O", data);
    if (data.coreEdits && hasEdits(data.coreEdits)) { 
        updateAffectedDataProps(data.core, data.coreEntity, data.coreEdits);
    }
    if (data.detailEdits && hasEdits(data.detailEdits)) { 
        updateAffectedDataProps(data.detail, data.detailEntity, data.detailEdits);
    }  
}
function hasEdits(editObj) {
    return Object.keys(editObj).length > 0;
}
/** Updates relational storage props for the entity. */
function updateAffectedDataProps(entity, rcrd, edits) {                         //console.log("updateAffectedDataProps called for [%s]. edits = %O", entity, edits);
    var propHndlrs = getRmvDataPropHndlrs(entity);
    var params = { entity: entity, rcrd: rcrd, stage: 'rmvData' };
    for (var prop in edits) {                                               
        if (prop in propHndlrs) {
            updateData(propHndlrs[prop], prop, params, edits);
        }
    }
}
/** Returns an object with relational properties and their removal handlers. */
function getRmvDataPropHndlrs(entity) {
    var hndlrs = {
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
    }
    return hndlrs[entity];
}
/** Removes the id from the ary. */
function rmvIdFromAry(ary, id) {
    ary.splice(ary.indexOf(id), 1);  
}
/** Removes a record's id from the previous parent's 'children' array. */ 
function rmvFromParent(prop, rcrd, entity, edits) {  
    if (!edits[prop].old) { return; }
    var rcrds = allRcrds[entity] || getDataFromLocalStorage(entity);            //console.log("rmvFromParent. [%s] = %O. rcrd = %O", prop, rcrds, rcrd);  
    rmvIdFromAry(rcrds[edits[prop].old].children, rcrd.id);                
    storeData(entity, rcrds);
}
/** Removes the Interaction from the stored entity's collection. */
function rmvIntFromEntity(prop, rcrd, entity, edits) {   
    var rcrds = allRcrds[prop] || getDataFromLocalStorage(prop);                //console.log("rmvIntFromEntity. [%s] = %O. rcrd = %O, edits = %O", prop, rcrds, rcrd, edits);
    var storedEntity = rcrds[edits[prop].old];
    rmvIdFromAry(storedEntity.interactions, rcrd.id);
    storeData(prop, rcrds);
}
/** Removes the Interaction and updates parent location total counts.  */
function rmvIntAndAdjustTotalCnts(prop, rcrd, entity, edits) {
    const rcrds = allRcrds[prop] || getDataFromLocalStorage(prop);              //console.log("rmvIntFromEntity. [%s] = %O. rcrd = %O, edits = %O", prop, rcrds, rcrd, edits);
    const oldLoc = rcrds[edits[prop].old];
    const newLoc = rcrds[edits[prop].new];
    rmvIdFromAry(oldLoc.interactions, rcrd.id);
    adjustLocAndParentCnts(oldLoc, false);
    adjustLocAndParentCnts(newLoc, true);
    storeData('location', rcrds);

    function adjustLocAndParentCnts(loc, addTo) {
        addTo ? ++loc.totalInts : --loc.totalInts; 
        if (loc.parent) { adjustLocAndParentCnts(rcrds[loc.parent], addTo); }
    }
} /* End rmvIntAndAdjustTotalCnts */
/** Removes the Interaction from the taxon's subject/objectRole collection. */
function rmvIntFromTaxon(prop, rcrd, entity, edits) {  
    var taxa = allRcrds['taxon'] || getDataFromLocalStorage('taxon');           //console.log("rmvIntFromTaxon. [%s] = %O. taxa = %O", prop, taxa, rcrd);
    var taxon = taxa[edits[prop].old];      
    rmvIdFromAry(taxon[prop+"Roles"], rcrd.id);
    storeData("taxon", taxa);           
}
/** Removes the record from the entity-type's stored array. */
function rmvFromTypeProp(prop, rcrd, entity, edits) { 
    if (!edits[prop].old) { return; }
    var typeObj = allRcrds[prop] || getDataFromLocalStorage(prop);              //console.log("rmvFromTypeProp. [%s] = %O. rcrd = %O", prop, typeObj, rcrd);
    var type = typeObj[edits[prop].old];
    rmvIdFromAry(type[entity+'s'], rcrd.id);
    storeData(prop, typeObj);
}
/** Removes a record from the tag's array of record ids. */
function rmvFromTagProp(prop, rcrd, entity, edits) {                                 
    if (!edits.tag.removed) { return; }
    var tagObj = allRcrds[prop] || getDataFromLocalStorage(prop);               //console.log("rmvFromTagProp. [%s] = %O. rcrd = %O", prop, tagObj, rcrd);
    edits.tag.removed.forEach(function(tagId){
        rmvIdFromAry(tagObj[tagId][entity+'s'], rcrd.id);                
    });
    storeData(prop, tagObj);
}
function rmvContrib(prop, rcrd, entity, edits) {                                //console.log("rmvContrib. edits = %O. rcrd = %O", edits, rcrd)
    const srcObj = allRcrds['source'] || getDataFromLocalStorage('source');
    edits.contributor.removed.forEach(id => 
        rmvIdFromAry(srcObj[id].contributions, rcrd.id));
    storeData('source', srcObj);
}
function rmvFromNameProp(prop, rcrd, entity, edits) { 
    var lvls = ["Kingdom", "Phylum", "Class", "Order", "Family", "Genus", "Species"];
    var realm = rcrd.realm.displayName;
    var level = edits.level ? lvls[edits.level.old-1] : rcrd.level.displayName;
    var taxonName = edits.displayName ? edits.displayName.old : rcrd.displayName;
    var nameObj =  allRcrds[realm+level+'Names'] || getDataFromLocalStorage(realm+level+'Names');                //console.log("nameObj [%s] = %O, rcrd = %O, edits = %O",realm+level+'Names', nameObj, rcrd, edits)
    delete nameObj[taxonName];
    storeData(realm+level+'Names', nameObj);
}

/*---------------- Update User Named Lists -----------------------------------*/
export function updateUserNamedList(data, action, cb) {                             //console.log('updating [%s] stored list data. %O', action, data);
    let rcrds, names;
    const list = action == 'delete' ? data : JSON.parse(data.entity);  
    const rcrdKey = list.type == 'filter' ? 'savedFilters' : 'dataLists';
    const nameKey = list.type == 'filter' ? 'savedFilterNames' : 'dataListNames';  
    _u.getData([rcrdKey, nameKey]).then(data => syncListData(data));

    function syncListData(data) {
        rcrds = data[rcrdKey];
        names = data[nameKey];

        if (action == 'delete') { removeListData(); 
        } else { updateListData(); }
        
        storeData(rcrdKey, rcrds);
        storeData(nameKey, names);
        cb();
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
/*------------------ Init Stored Data Methods --------------------------------*/
export function replaceUserData(userName, data) {                               //console.log('replaceUserData. [%s] = %O', userName, data);
    data.lists = data.lists.map(l => JSON.parse(l));
    deriveUserNamedListData(data);
    storeData('user', userName);
}
/** When there is an error while storing data, all data is redownloaded. */
export function resetStoredData() {
    const prevFocus = window.localStorage.getItem('curFocus');
    db_ui.showLoadingDataPopUp();
    idb.clear();
    storeData('curFocus', prevFocus);
    ajaxAndStoreAllEntityData();
}
/**
 * The first time a browser visits the search page all entity data is downloaded
 * from the server and stored locally @ajaxAndStoreAllEntityData. The stored 
 * data's lastUpdated flag, 'pgDataUpdatedAt', is created. A data-loading 
 * popup message and intro-walkthrough are shown on the Search page.
 */
export function initStoredData() {
    ajaxAndStoreAllEntityData();
    showIntroAndLoadingMsg();
}
/**
 * The first time a browser visits the search page all entity data is downloaded
 * from the server and stored locally @storeEntityData. The stored data's 
 * lastUpdated flag, 'pgDataUpdatedAt', is created. Then the Database search page 
 * table build begins @initSearchState.
 * Entities downloaded with each ajax call:
 *   /taxon - Taxon, Realm, Level 
 *   /location - HabitatType, Location, LocationType, 'noLocIntIds' 
 *   /source - Author, Citation, CitationType, Publication, PublicationType, 
 *       Source, SourceType, Tag
 *   /interaction - Interaction, InteractionType  
 */
function ajaxAndStoreAllEntityData() {                                          console.log("ajaxAndStoreAllEntityData");
    $.when(
        $.ajax("ajax/taxon"), $.ajax("ajax/location"), 
        $.ajax("ajax/source"), $.ajax("ajax/interaction"),
        $.ajax("ajax/lists"),  $.ajax("ajax/geojson")
    ).then(function(a1, a2, a3, a4, a5, a6) {                                   console.log("Ajax success: args = %O", arguments); 
        $.each([a1, a2, a3, a4, a5, a6], (idx, a) => storeServerData(a[0]));
        deriveAndStoreData([a1[0], a2[0], a3[0], a4[0], a5[0]]);
        storeData('user', $('body').data('user-name'));
        storeData('pgDataUpdatedAt', getCurrentDate());  
        initSearchState();
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
    var realmData = separateTaxaByLevelAndRealm(taxa);                          //console.log("taxonym name data = %O", nameData);
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
/*--------------- Shared Helpers -----------------------------*/
/** Stores passed data under the key in dataStorage. */
function storeData(key, data) {
    _u.setData(key, data);
}
/**
 * Attempts to update the data and catches any errors.
 * @param  {func} updateFunc  To update the entity's data.
 * @param  {str}  prop   Entity prop to update     
 * @param  {obj}  params Has props shown, as well as the current update stage. 
 * @param  {obj}  edits  Edit obj returned from server 
 */
function updateData(updateFunc, prop, params, edits) {                          //console.log('prop [%s] -> params [%O]', prop, params);
    try {
        updateFunc(prop, params.rcrd, params.entity, edits);
    } catch (e) {   console.log('###### Error with [%s] params = [%O] e = %O', prop, params, e);
        handleFailedUpdate(prop, updateFunc, params, edits);
    }
}
function getDataFromLocalStorage(prop) {
    const data = _u.getDataFromStorage(prop);
    allRcrds[prop] = data;
    return data;
}
/*----------------- Errs ---------------------------------------*/
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
}
function addToFailedUpdates(updateFunc, prop, params, edits) {                  //console.log('addToFailedUpdates. edits = %O', edits);
    if (!failed.updates[params.entity]) { failed.updates[params.entity] = {}; }
    failed.updates[params.entity][prop] = {
        edits: edits, entity: params.entity, rcrd: params.rcrd, 
        stage: params.stage, updateFunc: updateFunc
    };
}
/** Retries any updates that failed in the first pass. */
function retryFailedUpdates() {                                                 //console.log('retryFailedUpdates. failed = %O', failed);
    failed.twice = true;                                                    
    for (let entity in failed.updates) {  
        for (let prop in failed.updates[entity]) {
            let params = failed.updates[entity][prop];   
            updateData(params.updateFunc, prop, params, params.edits);
        }            
    }
    delete failed.twice;
}
/** Sends a message and error tag back to the form to be displayed to the user. */
function reportDataUpdateErr(edits, prop, rcrd, entity, stage) {
    var trans = {
        'addData': 'adding to', 'rmvData': 'removing from'
    };
    var msg = 'There was an error while '+trans[stage]+' the '+ entity +
        '\'s stored data.';
    var errTag = stage + ':' +  prop + ':' + entity + ':' + rcrd.id;
    failed.errors.push([ msg, errTag ]);
}