/**
 * Downloads all data for each entity updated since the last local-data update.
 * TODO: Add 'fail' callback for server errors. Send back any errors and
 * describe them to the user.
 *
 * Export
 *     downloadAndStoreNewData
 *
 * TOC
 *     DATA DOWNLOAD
 *     SYNC LOCAL DATA
 */
import { _u } from '~util';
import * as db from '../../local-data-main.js';
import { addCoreEntityData, addDetailEntityData, retryFailedUpdates } from '../db-sync-main.js';

export function downloadAndStoreUpdatedData(entities) {             /*perm-log*/console.log('   --downloadAndStoreNewData. entities = %O', entities);
    const intUpdate = hasInteractionUpdates(entities);
    const promises = entities.map(e => getNewData(e));
    return Promise.all(promises)
        .then(processUpdatedData)
        .then(downloadIntUpdates)
        .then(retryFailedUpdates);

    function downloadIntUpdates() {
        return !intUpdate ? Promise.resolve() :
            getNewData(intUpdate).then(processUpdatedEntityData);
    }
}
function hasInteractionUpdates(entities) {
    for (let i = entities.length - 1; i >= 0; i--) {
        if (entities[i].name == 'Interaction') {
            const intObj = { ...entities[i] };
            entities.splice(i, 1);
            return intObj;
        }
    }
    return false;
}
/* ---------------------------- DATA DOWNLOAD ------------------------------- */
function getNewData(entity) {                                       /*dbug-log*///console.log('getting new data for ', entity);
    let data = { entity: entity.name, updatedAt: entity.updated };
    const fetchOpts = { method: 'POST', body: JSON.stringify(data)};
    return db.fetchServerData('sync-data', fetchOpts);
}
/** Sends each entity's ajax return to be processed and stored. */
function processUpdatedData(data) {                                 /*dbug-log*///console.log('processUpdatedData = %O', data);
    return data.forEach(processUpdatedEntityData);
}
/** Parses and sends the returned data to @storeUpdatedData. */
function processUpdatedEntityData(data) {
    const entity = Object.keys(data)[0];                            /*perm-log*/logBasedOnEnv(entity, data[entity]);
    return storeUpdatedData(db.parseData(data[entity]), entity)
        .then(db.setUpdatedDataInLocalDb);
}
function logBasedOnEnv(entity, entityData) {
    const env = $('body').data('env');
    if (env === 'prod') {
        console.log("       --processUpdatedEntityData [%s][%s]", Object.keys(entityData).length, entity);
    } else {
        console.log("       --processUpdatedEntityData [%s][%s] = %O", Object.keys(entityData).length, entity, entityData);
    }
}
/* ---------------------- SYNC LOCAL DATA ----------------------------------- */
/** Sends the each updated record to the update handler for the entity. */
function storeUpdatedData(rcrds, entity) {
    Object.keys(rcrds).forEach(storeUpdatedDataRecord);
    return Promise.resolve();

    function storeUpdatedDataRecord(id) {
        if (ifUpdatedByCurUser(rcrds[id])) { return; }
        const syncRecordData = getEntityUpdateFunc(entity);
        syncRecordData(_u('lcfirst', [entity]), rcrds[id]);
    }
}
function ifUpdatedByCurUser(record) {
    return db.getMmryData('user') === record.updatedBy;
}
function getEntityUpdateFunc(entity) {
    const coreEntities = ['Interaction', 'Location', 'Source', 'Taxon'];
    return coreEntities.indexOf(entity) !== -1 ?
        addCoreEntityData : addDetailEntityData;
}