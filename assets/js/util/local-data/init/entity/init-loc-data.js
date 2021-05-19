/**
 * Modifies location-data for local storage:
 * - [entity]Names - an object with each entity's displayName(k) and id.
 * * location - resaved locations with an additional data point for countries.
 *
 * TOC
 *     REGION
 *     COUNTRY
 *     TYPES
 *     MODIFY RECORDS
 *
 * Export
 *     modifyLocDataForLocalDb
 */
import * as db from '../../local-data-main.js';
import { getRcrds, getNameObj, getTypeObj, getType } from '../init-helpers.js';

export function modifyLocDataForLocalDb(data) {                     /*dbug-log*///console.log("modifyLocDataForLocalDb called. data = %O", data);
    handleRegionData(data.location, data.locationType);
    handleCountryData(data.location, data.locationType);
    handleTypeData(data.habitatType, data.locationType);
    modifyLocationRecords(data.location);
}
/* =================== REGION =============================================== */
function handleRegionData(locs, locTypes) {
    const regns = getType(locTypes, 'region', 'locations');         /*dbug-log*///console.log('--handleRegionData[%O]', regns);
    db.setDataInMemory('regionNames', getNameObj(regns, locs));
    db.setDataInMemory('topRegionNames', getTopRegionNameData(locs, regns));
}
function getTopRegionNameData(locs, regns) {
    const data = {};
    const rcrds = getRcrds(regns, locs);
    for (const id in rcrds) {
        if (!rcrds[id].parent) { data[rcrds[id].displayName] = id; }
    }
    return data;
}
/* ================== COUNTRY =============================================== */
function handleCountryData(locs, locTypes) {
    const cntrys = getType(locTypes, 'country', 'locations');       /*dbug-log*///console.log('--handleCountryData[%O]', cntrys);
    db.setDataInMemory('countryNames', getNameObj(cntrys, locs));
    db.setDataInMemory('countryCodes', getCodeNameDataObj(cntrys, locs));
}
/** Return an obj with the 2-letter ISO-country-code (k) and the country id (v).*/
function getCodeNameDataObj(ids, rcrds) {
    const data = {};
    ids.forEach(id => data[rcrds[id].isoCode] = id);
    return data;
}
/* ==================== TYPES =============================================== */
function handleTypeData(habTypes, locTypes) {
    db.setDataInMemory('habTypeNames', getTypeObj(habTypes));
    db.setDataInMemory('locTypeNames', getTypeObj(locTypes));
    ['locationType', 'habitatType'].forEach(k => db.deleteMmryData(k));
}
/* ==================== MODIFY RECORDS ====================================== */
function modifyLocationRecords(locations) {
    db.setDataInMemory('location', addInteractionTotalsToLocs(locations));
}
/** Adds the total interaction count of the location and it's children. */
function addInteractionTotalsToLocs(locs) {
    for (let id in locs) {
        locs[id].totalInts = getTotalInteractionCount(locs[id]);    /*dbug-log*///console.log('[%s] total = [%s]', locs[id].displayName, locs[id].totalInts);
    }
    return locs;

    function getTotalInteractionCount(loc) {
        let ttl = loc.interactions.length;
        if (!loc.children.length) { return ttl; }
        loc.children.forEach(function(id) {
            let child = locs[id];
            ttl += getTotalInteractionCount(child);
        });
        return ttl;
    }
}