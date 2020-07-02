/**
 * Stores data temporarily while updating to reduce async db calls.
 *
 * Exports:
 *     setUpdatedDataInLocalDb
 *     setDataInMemory
 *     clearTempMmry
 */
import { setData } from './local-data-main.js';

let mmryData;

export function getMmryData(key) {
    return mmryData ? (mmryData[key] ? mmryData[key].value : null) : null;
}
export function deleteMmryData(key) {
    delete mmryData[key];
}
export function setMmryDataObj(obj) {
    mmryData = obj;
}
/** Stores passed data under the key in dataStorage. */
export function setDataInMemory(key, data) {                                    //console.log('Adding to mmryData [%s] = [%O]', key, data);
    if (!mmryData) { mmryData = {} }
    if (!mmryData[key]) { mmryData[key] = {} }
    mmryData[key].value = data;
    mmryData[key].changed = true;
}
export function setUpdatedDataInLocalDb() {
    return Object.keys(mmryData).reduce((p, prop) => {
        if (!mmryData[prop].changed) { return p; }                              //console.log('               --setting [%s] data = [%O]', prop, mmryData[prop].value);
        mmryData[prop].changed = false;
        return p.then(() => setData(prop, mmryData[prop].value));
    }, Promise.resolve());
}
export function clearTempMmry(dataUpdatedAt) {
    mmryData = null;
}