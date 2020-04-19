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
import * as _temp from './temp-data.js';
import * as _init from './init-data.js';
import { exitModal, showSaveModal } from '../../misc/intro-core.js';

_idb.initDb();
/* ========================== FACADE ======================================== */
export function setData(prop, data) {
    _idb.setData(prop, data);
}
export function getData(props, returnUndefined) {  //breakpoint  //bp
    return _idb.getData(props, returnUndefined);
}
/* -------------------------- DATA SYNC ------------------------------------- */
export function updateLocalDb(data) {
    return _sync.updateLocalDb(data);
}
export function updateUserNamedList() {
    return _sync.updateUserNamedList(...arguments);
}
/* -------------------------- DATA INIT ------------------------------------- */
export function resetStoredData(reset) {
    _idb.downloadFullDb(reset);
}
export function resetLocalDb() {
    const confg = {
        html: '<center>Click "Reset" to redownload all data.</center>',
        elem: '#data-help', dir: 'left', submit: resetDb, bttn: 'Reset'
    }
    showSaveModal(confg); 

    function resetDb() {
        exitModal();
        _idb.downloadFullDb(true);
    }
}
/* ================ LOCAL-DATA INTERNAL FACADE ============================== */
export function pg(funcName, params = []) {                                     //console.log('func = [%s], agrs = %O', funcName, params);
    return _pg[funcName](...params);
}
export function fetchServerData(url, options = {}, n = 3) {                     console.log('       *-fetchServerData [%s] with params = %O', url, Object.keys(options).length ? options : null);
    return fetch('fetch/'+url, options).then(response => {
        if (!!response.ok) { return response.json(); }
        if (n === 1) { return alertFetchIssue(use, response.json()); }
        return fetchServerData(url, options, n - 1);
    });
};
function alertFetchIssue(url, responseText) {
     _pg.alertIssue('fetchIssue', { url: url, response: responseText });
    return Promise.reject();
}
export function getAllStoredData() {
    return _idb.getAllStoredData();
}
/* -------------------------- DATA SYNC ------------------------------------- */
export function syncLocalDbWithServer(lclDataUpdatedAt) {
    _sync.syncLocalDbWithServer(lclDataUpdatedAt);
}
/* -------------------------- DATA INIT ------------------------------------- */
/**
 * The first time a browser visits the search page all entity data is downloaded
 * from the server and stored locally @initLocalData. A data-loading popup message 
 * and intro-walkthrough are shown on the Search page.
 */
export function initStoredData(reset) {
    _pg.showIntroAndLoadingMsg(reset);
    return require('./init-data.js').default(reset);
}
export function deriveUserData() {
    return _init.deriveUserData(...arguments);
}
/** ------------------- DATA IN MEMORY -------------------------------------- */
export function getMmryData() {
    return _temp.getMmryData(...arguments);
}
export function setDataInMemory() {
    _temp.setDataInMemory(...arguments);
}
export function setUpdatedDataInLocalDb() {
    return _temp.setUpdatedDataInLocalDb();
}
export function setMmryDataObj() {
    return _temp.setMmryDataObj(...arguments);
}
export function deleteMmryData() {
    return _temp.deleteMmryData(...arguments);
}
export function clearTempMmry() {
    return _temp.clearTempMmry();
}