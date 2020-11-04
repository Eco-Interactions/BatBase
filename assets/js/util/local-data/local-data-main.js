/**
 * Entry point for all local data-storage methods.
 *
 * EXPORT:
 *     fetchData
 *     parseData
 *
 * TOC:
 *     FACADE
 *         IDB
 *         DATA SYNC
 *         DATA INIT
 *     LOCAL-DATA INTERNAL FACADE
 *         DATA INIT
 *         DATA SYNC
 *         TEMP DATA
 */
import { _alert, _modal } from '~util';
import { showIntroAndLoadingMsg } from '~db';
import * as idb from './etc/idb-util.js';
import * as sync from './sync/db-sync-main.js';
import * as temp from './etc/temp-data.js';
import { initLocalDatabase } from './init/db-init-main.js';

/* ========================== FACADE ======================================== */
export function initDb(argument) {
    idb.initDb();
}
export function setData(prop, data) {
    idb.setData(prop, data);
}
export function getData(props, returnUndefined) {
    return idb.getData(props, returnUndefined);
}
/* -------------------------- DATA SYNC ------------------------------------- */
export function afterServerDataUpdateSyncLocalDatabase(data) {
    return sync.afterServerDataUpdateSyncLocalDatabase(data);
}
export function updateUserNamedList() {
    return sync.updateUserNamedList(...arguments);
}
/* -------------------------- DATA INIT ------------------------------------- */
export function resetStoredData(reset) {
    idb.downloadFullDb(reset);
}
export function resetLocalDb() {
    const confg = {
        html: '<center>Click "Reset" to redownload all data.</center>',
        selector: '#data-help', dir: 'left', submit: resetDb, bttn: 'Reset'
    }
    _modal('showSaveModal', [confg]);

    function resetDb() {
        _modal('exitModal');
        idb.downloadFullDb(true);
    }
}
/* ================ LOCAL-DATA INTERNAL FACADE ============================== */
export function fetchServerData(url, options = {}, n = 9) {         /*dbug-log*///console.log('       *-fetchServerData [%s] with params = %O', url, Object.keys(options).length ? options : null);
    return fetch('fetch/'+url, options).then(response => {
        if (!!response.ok) { return response.json(); }
        if (n === 1) { return alertFetchIssue(url, response.json()); }
        return fetchServerData(url, options, n - 1);
    });
};
function alertFetchIssue(url, responseText) {
    _alert('alertIssue', ['fetchIssue', { url: url, response: responseText }]);
    return Promise.reject();
}
export function getAllStoredData() {
    return idb.getAllStoredData();
}
/**
 * Loops through the passed data object to parse the nested objects. This is
 * because the data comes back from the server having been double JSON-encoded,
 * due to the 'serialize' library and the JSONResponse object.
 */
export function parseData(data) {
    for (let k in data) { data[k] = JSON.parse(data[k]); }
    return data;
}
/* -------------------------- DATA SYNC ------------------------------------- */
export function syncLocalDbWithServer(lclDataUpdatedAt) {
    sync.syncLocalDbWithServer(lclDataUpdatedAt);
}
/* -------------------------- DATA INIT ------------------------------------- */
/**
 * The first time a browser visits the search page all entity data is downloaded
 * from the server and stored locally @initLocalData. A data-loading popup message
 * and intro-walkthrough are shown on the Search page.
 */
export function initStoredData(reset) {
    showIntroAndLoadingMsg(reset);
    return initLocalDatabase(reset);
}
export function deriveUserData() {
    return init.deriveUserData(...arguments);
}
/** ----------------------- TEMP DATA --------------------------------------- */
export function getMmryData() {
    return temp.getMmryData(...arguments);
}
export function setDataInMemory() {
    temp.setDataInMemory(...arguments);
}
export function setUpdatedDataInLocalDb() {
    return temp.setUpdatedDataInLocalDb();
}
export function setMmryDataObj() {
    return temp.setMmryDataObj(...arguments);
}
export function deleteMmryData() {
    return temp.deleteMmryData(...arguments);
}
export function clearTempMemory() {
    sync.clearFailedMmry();
    temp.clearTempMmry();
}