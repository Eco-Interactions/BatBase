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
import * as idb from 'idb-keyval'; //set, get, del, clear, Store
import * as _u from '../util.js';
import * as db_page from '../db-page.js';

import { syncLocalDbWithServer, initStoredData, replaceUserData } from './db-sync.js';

const _db = {
    geoJson: null, 
    v: .029
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
export function downloadFullDb(reset) {                                         //console.log('   --DOWNLOADING FULL DB');
    if (reset) { return clearAndDownload(true); }
    getAllStoredData().then(data => {
        reset = Object.keys(data).length;
        clearAndDownload(reset);
    });
}
function clearAndDownload(reset) {
    idb.clear();     
    initStoredData(reset).then(() => idb.set(_db.v, true));
}
/**
 * On page load, syncs local database with sever data. 
 * If there they system data has updates more recent than the last sync, the 
 * updated data is ajaxed and stored @syncUpdatedData. Once the database is ready,
 * db_sync calls @initSearchPage. 
 */
function checkForServerUpdates() {
    _u.getData('lclDataUpdtdAt').then(syncLocalDbWithServer);
    // debugUpdate();
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
export function getAllStoredData() {  //console.log('idb = %O', idb);
    const data = {};
    return Promise.all([idb.getAll(), idb.keys()])
        .then(dbData => {
            const vals = dbData[0]; 
            const keys = dbData[1];   //console.log('data = %O, vals = %O, keys = %O', dbData, vals, keys)
            $(keys).each((i, k) => {
                data[k] = { value: vals[i], changed: false }
            });
            return data;
        });
    // return idb.Store()._withIDBStore('readonly', store => {
    //     req = store.getAll(query, count);
    // }).then(() => req.result);
}
/**
 * Gets data from Indexed DB for each key passed. If an array
 * is passed, an object with each prop as the key for it's data is returned. 
 * If a property is not found, false is returned. 
 */
export function getData(keys, returnUndefined) {                                //console.log('     GET [%O]', keys);
    if (!Array.isArray(keys)) { return getStoredData(keys, returnUndefined); }
    return getStoredDataObj(keys, returnUndefined);
}
function getStoredData(key, returnUndefined) {
    return idb.get(key).then(d => returnStoredData(d, key, returnUndefined));
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
// 
function debugUpdate() {
    const testDataState = {
        Author: "2019-11-11 22:53:58",
        Authority: "2017-02-04 11:24:08",
        Citation: "2019-11-11 22:07:52",
        CitationType: "2017-05-18 14:27:27",
        ContentBlock: "2017-02-04 11:24:08",
        Contribution: "2017-02-04 11:24:08",
        Domain: "2017-02-04 11:24:08",
        Feedback: "2017-02-04 11:24:08",
        GeoJson: "2019-09-26 08:33:17",
        HabitatType: "2017-02-04 11:24:08",
        ImageUpload: "2017-02-04 11:24:08",
        Interaction: "2019-11-11 00:40:46",
        InteractionType: "2017-02-04 11:24:08",
        Level: "2017-02-04 11:24:08",
        Location: "2019-11-11 22:59:09",
        LocationType: "2017-05-18 14:27:27",
        Naming: "2017-02-04 11:24:08",
        NamingType: "2017-02-04 11:24:08",
        Publication: "2019-11-11 22:07:15",
        PublicationType: "2017-02-04 11:24:08",
        Source: "2019-11-11 22:07:52",
        SourceType: "2017-02-04 11:24:08",
        System: "2019-11-11 22:07:52",
        Tag: "2017-02-04 11:24:08",
        Taxon: "2019-11-11 21:56:27",
        Taxonym: "2017-02-04 11:24:08"
    };
    syncLocalDbWithServer(testDataState);
}