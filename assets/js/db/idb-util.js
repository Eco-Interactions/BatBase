/**
 * IndexedDB
 *
 * CODE SECTIONS:
 *     INIT
 *     GETTERS
 *     SETTERS
 *         
 * Exports:             Imported by:
 *     getGeoJsonEntity
 *     initDb
 *     isGeoJsonDataAvailable
 *     updateGeoJsonData
 */
import * as idb from 'idb-keyval'; //set, get, del, clear
import * as _u from './util.js';
import * as db_page from './db-page.js';

import { addNewDataToStorage, initStoredData, replaceUserData } from './db-sync.js';


const _db = {
    geoJson: null, 
    v: .003
};
initDb();
/** ----------------------- INIT -------------------------------------------- */
/** 
 * Checks whether the dataKey exists in indexDB cache. 
 * If it is, the stored geoJson is fetched and stored in the global variable. 
 * If not, the db is cleared and geoJson is redownloaded. 
 */
export function initDb() {
    getData(_db.v).then(updateDbIfNeeded);
}
function updateDbIfNeeded(dbCurrent) {                                          console.log('Download DB? ', !dbCurrent);                                          //console.log('clearing Idb? ', storedKey === undefined);
    if (dbCurrent) { return checkForDbDataChanges() } 
    idb.clear();     
    idb.set(_db.v, true);
    initStoredData();
}
function checkForDbDataChanges() {
    getData('pgDataUpdatedAt').then(pgUpdatedAt => {                            //console.log('pgUpdatedAt = ', pgUpdatedAt)
        if (!pgUpdatedAt) { return updateDbIfNeeded(false); }
        getData('user').then(checkUserData);
        _u.sendAjaxQuery({}, "ajax/data-state", 
            addNewDataToStorage.bind(null, pgUpdatedAt));
    });
}
/**
 * Updates user specific data in local storage. Useful when the user changes on the
 * same machine, or when the search page is first visited before a user logged in.
 */
function checkUserData(dbUser) {
    if (dbUser == $('body').data('user-name')) { return; }
    _u.sendAjaxQuery({}, "ajax/lists", 
        replaceUserData.bind(null, $('body').data('user-name')));
}
/** ----------------------- GETTERS ----------------------------------------- */
/**
 * Gets data from Indexed DB for each key passed. If an array
 * is passed, an object with each prop as the key for it's data is returned. 
 * If a property is not found, false is returned. 
 */
export function getData(keys, returnUndefined) {                                //console.log('     GET [%O]', keys);
    if (!Array.isArray(keys)) { return getStoredData(keys, returnUndefined); }
    return Promise.resolve(getStoredDataObj(keys, returnUndefined));
}
function getStoredData(key, returnUndefined) {
    return Promise.resolve(idb.get(key).then(d => returnStoredData(d, key, returnUndefined)));
}
function returnStoredData(data, key, returnUndefined) {                         //console.log('[%s] = %O (returnUndefined ? [%s])', key, data, returnUndefined);
    if (data == undefined && !returnUndefined) { return logAndAlert(key); }  
    return data;
}
function logAndAlert() {
    alert(`Error loading [${key}] data. Try reloading the page.`);
    console.log(`Error loading [${key}] data.`);
}
function getStoredDataObj(keys, returnUndefined) {
    const promises = [];
    $(keys).each((i, key) => promises.push(getStoredData(key, returnUndefined)));
    return Promise.all(promises).then(data => {  
        const obj = {};
        $(data).each((i, d) => { obj[keys[i]] = d});
        return obj;
    });
} 
/** ----------------------- SETTERS ----------------------------------------- */
export function setData(k, v) {                                                 //console.log('         SET [%s] => [%O]', k, v);
    idb.set(k, v);
}
export function removeData(k) {
    idb.del(k);
}














export function isGeoJsonDataAvailable() {
    return !!_db.geoJson;
}
export function updateGeoJsonData(cb) {                                         //console.log('------ updateGeoJsonData')
    _db.geoJson = false;
    downloadGeoJson(cb);
}
export function getGeoJsonEntity(id) {                                          //console.log('        geoJson = %O', geoJson);
    return isGeoJsonDataAvailable() ?  JSON.parse(_db.geoJson[id]) :
        updateGeoJsonData(getGeoJsonEntity.bind(null, id));
}