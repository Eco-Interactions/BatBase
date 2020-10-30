/**
 * Modifies location-data for local storage:
 * - [entity]Names - an object with each entity's displayName(k) and id.
 * * location - resaved locations with an additional data point for countries.
 *
 * Export
 *     modifyLocDataForLocalDb
 */
import * as db from '../../local-data-main.js';
import { getRcrds, getNameObj, getTypeObj, getType } from '../init-helpers.js';

export function modifyLocDataForLocalDb(data) {                     /*dbug-log*///console.log("modifyLocDataForLocalDb called. data = %O", data);
    const regns = getType(data.locationType, 'region', 'locations');
    const cntries = getType(data.locationType, 'country', 'locations');/*dbug-log*///console.log('reg = %O, cntry = %O', regns, cntries);
    db.setDataInMemory('countryNames', getNameObj(cntries, data.location));
    db.setDataInMemory('countryCodes', getCodeNameDataObj(cntries, data.location));
    db.setDataInMemory('regionNames', getNameObj(regns, data.location));
    db.setDataInMemory('topRegionNames', getTopRegionNameData(data, regns));
    db.setDataInMemory('habTypeNames', getTypeObj(data.habitatType));
    db.setDataInMemory('locTypeNames', getTypeObj(data.locationType));
    db.setDataInMemory('location', addInteractionTotalsToLocs(data.location));
    ['locationType', 'habitatType'].forEach(k => db.deleteMmryData(k));
}
/** Return an obj with the 2-letter ISO-country-code (k) and the country id (v).*/
function getCodeNameDataObj(ids, rcrds) {
    const data = {};
    ids.forEach(id => data[rcrds[id].isoCode] = id);
    return data;
}
function getTopRegionNameData(locData, regns) {
    const data = {};
    const rcrds = getRcrds(regns, locData.location);
    for (const id in rcrds) {
        if (!rcrds[id].parent) { data[rcrds[id].displayName] = id; }
    }
    return data;
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