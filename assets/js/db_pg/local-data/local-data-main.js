/**
 * Entry point for all local data-storage methods. 
 *
 * EXPORT:
 *     fetchData
 *
 *
 * TOC:
 *     FACADE
 *         IDB
 *         DATA SYNC
 *         DATA INIT
 *     DATA UTIL 
 */
import * as _pg from '../db-main.js';
import * as _idb from './idb-util.js';
import * as _sync from './db-sync.js';

_idb.initDb();

/* ========================== FACADE ======================================== */
export function pg(funcName, params = []) {                                     //console.log('func = [%s], agrs = %O', funcName, params);
    return _pg[funcName](...params);
}
/* -------------------------- IDB ------------------------------------------- */
export function setData(prop, data) {
    _idb.setData(prop, data);
}
export function getData(props, returnUndefined) {  //breakpoint  //bp
    return _idb.getData(props, returnUndefined);
}
//refactoring data init and all local data methods to using this -main file. 
/* -------------------------- DATA SYNC ------------------------------------- */
export function syncLocalDbWithServer(lclDataUpdatedAt) {
    _sync.syncLocalDbWithServer(lclDataUpdatedAt);
}
export function updateLocalDb(data) {
    return _sync.updateLocalDb(data);
}
/* -------------------------- DATA INIT ------------------------------------- */
/** When there is an error while storing data, all data is redownloaded. */
export function resetStoredData() {
    _pg.ui('showLoadingDataPopUp');
    _u.downloadFullDb();
}
/**
 * The first time a browser visits the search page all entity data is downloaded
 * from the server and stored locally @initLocalData. A data-loading popup message 
 * and intro-walkthrough are shown on the Search page.
 */
export function initStoredData(reset) {
    _pg.showIntroAndLoadingMsg(reset);
    return require('./init-data.js').default(reset);
}
/* ======================= DATA UTIL ======================================== */
export function fetchData(url, options, n) {                                    console.log('           --downloading [%s] data. ([%s] tries remaining)', url, n);
    // return fetch(url, options).then(response => {
    return fetch('ajax/'+url, options).then(response => {
        if (!!response.ok) { return response.json(); }
        if (n === 1) { return Promise.reject(console.log("[%s] download error = %O", url, response)); }
        return fetchData(url, options, n - 1);
    });
};
