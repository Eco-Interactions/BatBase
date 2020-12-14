/**
 * Manages IndexedDB, the Local Storage database.
 *
 * Export
 *     initDb
 *     downloadFullDb
 *     getData
 *     setData
 *
 * TOC
 *     INIT
 *     GETTERS
 *     SETTERS
 */
import { _alert } from '~util';
import { initStoredData, syncLocalDbWithServer } from '../local-data-main.js';
import * as idb from 'idb-keyval'; //set, get, del, clear, Store

const db_v = '.54'; //prod: .54
/** ----------------------- INIT -------------------------------------------- */
/**
 * Checks whether the dataKey exists in indexDB cache and downloads full DB if not.
 * Note: Testing clears idb on load, except as needed for data-entry testing. @addNewDataToStorage
 */
export function initDb() {
    getData(db_v, true).then(resetDbIfNeeded);
}
function resetDbIfNeeded(noResetNeeded) {                            /*perm-log*/console.log('Download DB? ', !noResetNeeded);
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
    initStoredData(reset).then(() => idb.set(db_v, true));
}
/**
 * On page load, syncs local database with sever data.
 * If there they system data has updates more recent than the last sync, the
 * updated data is ajaxed and stored @syncUpdatedData. Once the database is ready,
 * db_sync calls @initSearchPage.
 */
function checkForServerUpdates() {
    getData('lclDataUpdtdAt').then(syncLocalDbWithServer);
    // debugUpdate();
}
/** ----------------------- GETTERS ----------------------------------------- */
export function getAllStoredData() {
    const data = {};
    return Promise.all([idb.getAll(), idb.keys()])
        .then(dbData => {
            const vals = dbData[0];
            const keys = dbData[1];
            $(keys).each((i, k) => {
                data[k] = { value: vals[i], changed: false }
            });
            return data;
        });
}
/**
 * Gets data from Indexed DB for each key passed. If an array
 * is passed, an object with each prop as the key for it's data is returned.
 * If a property is not found, false is returned.
 */
export function getData(keys, returnUndefined) {                                //console.log('     GET [%O]', keys);
    if (Array.isArray(keys)) { return getStoredDataObj(keys, returnUndefined); }
    return getStoredData(keys, returnUndefined);

}
function getStoredData(key, returnUndefined) {                                  //console.log('               getData = [%s]', key)
    if (!key) { return handleMissingDataKey(key); }
    if (typeof key !== 'string') { return handleInvalidKeyType(key); }
    return idb.get(key).then(d => returnStoredData(d, key, returnUndefined));
}
function returnStoredData(data, key, returnUndefined) {                         //console.log('[%s] = %O (returnUndefined ? [%s])', key, data, returnUndefined);
    if (data == undefined && !returnUndefined) { return handleExpectedDataNotFound(key); }
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
/* ----------------------- ERROR HANDLING ----------------------------------- */
function handleMissingDataKey(key) {                                /*dbug-log*///console.log('       !!!!getData: key missing [%s]', key); console.trace();
    _alert('alertIssue', ['undefiendDataKey', {key: key}]);
}
function handleInvalidKeyType(key) {                                /*dbug-log*///console.log('       !!!!getData: Non-string key passed = [%O]', key); console.trace();
    _alert('alertIssue', ['invalidDataKeyType', {
        key: JSON.stringify(key), type: typeof key }]);
}
function handleExpectedDataNotFound(key) {                          /*dbug-log*///console.log('       !!!!getData: [%s] Not Found', key); console.trace();
    _alert('alertIssue', ['expectedDataNotFound', {key: key}]);
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
        Rank: "2017-02-04 11:24:08",
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