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
    v: .002
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
function checkUserData(dbUser) {
    if (dbUser == $('body').data('user-name')) { return; }
    _u.sendAjaxQuery({}, "ajax/lists", 
        replaceUserData.bind(null, $('body').data('user-name')));
}
/** ----------------------- GETTERS ----------------------------------------- */
export async function getData(props) {                                          console.log('     GET [%O]', props);
    if (!Array.isArray(props)) { return idb.get(props); }
    return await getStoredDataObj(props);
}
async function getStoredDataObj(props) {
    const promises = [];
    $(props).each((i, prop) => promises.push(idb.get(prop)));
    return Promise.all(promises).then(data => {  
        const obj = {};
        $(data).each((i, d) => { obj[props[i]] = data[i]});
        return obj;
    });
} 
/** ----------------------- SETTERS ----------------------------------------- */
export function setData(k, v) {                                                 console.log('         SET [%s] => [%O]', k, v);
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