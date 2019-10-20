/**
 * IndexedDB
 *
 * CODE SECTIONS:
 *     INIT
 *     GETTERS
 *     SETTERS
 *         
 * Exports:             Imported by:
 *     downloadFullDb       db-sync
 *     getData              util 
 *     setData              util
 */
import * as idb from 'idb-keyval'; //set, get, del, clear
import * as _u from './util.js';
import * as db_page from './db-page.js';

import { syncLocalDbWithServer, initStoredData, replaceUserData } from './db-sync.js';

const _db = {
    geoJson: null, 
    v: .009
};
initDb();
/** ----------------------- INIT -------------------------------------------- */
/** 
 * Checks whether the dataKey exists in indexDB cache. 
 * If it is, the stored geoJson is fetched and stored in the global variable. 
 * If not, the db is cleared and geoJson is redownloaded. 
 * Note: Testing clears idb on load, except as needed for data-entry testing. @addNewDataToStorage
 */
function initDb() {
    getData(_db.v, true).then(resetDbIfNeeded);
}
function resetDbIfNeeded(noResetNeeded) {                                       console.log('Download DB? ', !noResetNeeded);
    return noResetNeeded ? checkForServerUpdates() : downloadFullDb();
}
export function downloadFullDb() {                                              console.log('   --DOWNLOADING FULL DB');
    idb.clear();     
    initStoredData().then(() => idb.set(_db.v, true));
}
/**
 * On page load, syncs local database with sever data. 
 * If there they system data has updates more recent than the last sync, the 
 * updated data is ajaxed and stored @syncUpdatedData. Once the database is ready,
 * db_sync calls @initSearchPage. 
 */
function checkForServerUpdates() {
    _u.getData('lclDataUpdtdAt').then(syncLocalDbWithServer);
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
function getStoredDataObj(keys, returnUndefined) {
    const promises = [];
    $(keys).each((i, key) => promises.push(getStoredData(key, returnUndefined)));
    return Promise.all(promises).then(data => {  
        const obj = {};
        $(data).each((i, d) => { obj[keys[i]] = d});
        return obj;
    });
} 
function logAndAlert(key) {
    console.log(`Error loading [${key}] data.`); console.trace();
    if ($('body').data('env') === 'test') { return; }
    alert(getAlertMsg(key));
}
function getAlertMsg(key) {
    return `Error loading [${key}] data. Try reloading the page. If error persists, ${_u.getErrMsgForUserRole()}`;
}

/** ----------------------- SETTERS ----------------------------------------- */
export function setData(k, v) {                                                 //console.log('         SET [%s] => [%O]', k, v);
    return idb.set(k, v);
}
// function removeData(k) {
//     idb.del(k);
// }