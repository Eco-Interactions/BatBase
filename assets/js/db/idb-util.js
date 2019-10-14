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
 * Note: Testing clears idb on load, except as needed for data-entry testing. @addNewDataToStorage
 */
function initDb() {
    getData(_db.v, true).then(updateDbIfNeeded);
}
function handleTestDbInit() {
    updateDbIfNeeded(false);
}
function updateDbIfNeeded(dbCurrent) {                                          console.log('Download DB? ', !dbCurrent);
    return dbCurrent ? checkForServerUpdates() : downloadFullDb();
}
export function downloadFullDb() {                                              console.log('   --DOWNLOADING FULL DB');
    idb.clear();     
    idb.set(_db.v, true);
    initStoredData();
}
function checkForServerUpdates() {
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
    alert(getAlertMsg(key));
}
function getAlertMsg(key) {
    return `Error loading [${key}] data. Try reloading the page.\n\n${getUserLvlAlert()}`;
}
function getUserLvlAlert() {
    const userRole = $('body').data('user-role');
    const msgs = {
        visitor: getVisitorErrMsg, user: getUserErrMsg, editor: getEditorErrMsg
    };
    return msgs[userRole]();
}
function getVisitorErrMsg() {
    return `If the problem persists, please contact us at info@batplant.org and let us know.`;
}
function getUserErrMsg() {
    return `If the problem persists, please contact us by Leaving Feedback on this page (from the user menu).`;
}
function getEditorErrMsg() {
    return `If the problem persists, please open the browser logs, take a screen shot, and email to the developer.

Open Chrome menu -> More Tools -> Developer Tools.

Please include a description of the steps to reproduce this error and any useful information or additional screenshots.`;
}
/** ----------------------- SETTERS ----------------------------------------- */
export function setData(k, v) {                                                 //console.log('         SET [%s] => [%O]', k, v);
    return idb.set(k, v);
}
// function removeData(k) {
//     idb.del(k);
// }