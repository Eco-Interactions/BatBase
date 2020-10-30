/**
 * Modifies source-data for local storage.
 * - [entity]Names - an object with each entity's displayName(k) and id.
 * - [entity]Sources - an array with of all source records for the entity type.
 *
 * Export
 *     modifySrcDataForLocalDb
 */
import * as db from '../../local-data-main.js';
import { getTypeObj, getType } from '../init-helpers.js';

export function modifySrcDataForLocalDb(data) {                     /*dbug-log*///console.log("modifySrcDataForLocalDb called. data = %O", data);
    const authSrcs = getType(data.sourceType, 'author', 'sources');
    const pubSrcs = getType(data.sourceType, 'publication', 'sources');
    const publSrcs = getType(data.sourceType, 'publisher', 'sources');
    db.setDataInMemory('authSrcs', authSrcs);
    db.setDataInMemory('pubSrcs', pubSrcs);
    db.setDataInMemory('publSrcs', publSrcs);
    db.setDataInMemory('citTypeNames', getTypeObj(data.citationType));
    db.setDataInMemory('pubTypeNames', getTypeObj(data.publicationType));
    ['citationType', 'publicationType', 'sourceType'].forEach(k => db.deleteMmryData(k));
}