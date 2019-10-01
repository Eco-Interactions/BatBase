/**
 * IndexedDB
 *
 * Exports:             Imported by:
 *     getGeoJsonEntity
 *     initGeoJsonData
 *     isGeoJsonDataAvailable
 *     updateGeoJsonData
 */
import * as idb from 'idb-keyval'; //set, get, del, clear
import * as _u from './util.js';

const _db = {
    geoJson: null, 
    v: .001
};

initGeoJsonData();

/** 
 * Checks whether the dataKey exists in indexDB cache. 
 * If it is, the stored geoJson is fetched and stored in the global variable. 
 * If not, the db is cleared and geoJson is redownloaded. 
 */
export function initGeoJsonData() {  
    idb.get(_db.v).then(clearIdbCheck);
}
function clearIdbCheck(storedKey) {                                             console.log('clearing Idb? ', storedKey === undefined);
    if (storedKey) { return getGeoJsonData(); } 
    idb.clear();                                                                //console.log('actually clearing');
    downloadGeoJson();
}
function getGeoJsonData() {                                                     //console.log('getGeoJsonData')
    idb.get('geoJson').then(storeGeoJson);
}
function storeGeoJson(geoData) {                                                //console.log('stor(ing)GeoJson. geoData ? ', !geoData);
    if (!geoData) { return downloadGeoJson(); }
    _db.geoJson = geoData; 
}
function downloadGeoJson(cb) { 
    return downloadGeoJsonAfterLocalDbInit(cb);                                                 
    // return dataStorage.getItem('interaction') ?
    //     downloadGeoJsonAfterLocalDbInit(cb) :
    //     window.setTimeout(downloadGeoJson, 800);   
}
function downloadGeoJsonAfterLocalDbInit(cb) {                                  console.log('downloading all geoJson data!');
    _u.sendAjaxQuery({}, 'ajax/geo-json', storeServerGeoJson);                     
    
    function storeServerGeoJson(data) {                                         //console.log('server geoJson = %O', data.geoJson);
        idb.set('geoJson', data.geoJson);
        storeGeoJson(data.geoJson);
        idb.set(_db.v, true);
        if (cb) { cb(); }
    }
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