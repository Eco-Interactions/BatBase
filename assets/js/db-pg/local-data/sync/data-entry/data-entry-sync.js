/**
 * On form submit success, the new and edited data is updated in the local database.
 *
 * Export
 *     updateLocalDb
 *     updateUserNamedList
 *
 * TOC
 *     ENTITY UPDATES
 *         USER-NAMED LISTS
 *     UPDATE DATA AFTER FORM SUBMIT
 *         PARSE SERVER JSON
 *         UPDATE LOCAL DATA
 *         COMPLETE UPDATE
 */
import * as db from '../../local-data-main.js';
import * as sync from '../db-sync-main.js';
import * as list from './user-named-sync.js';
/* ===================== ENTITY UPDATES ===================================== */
/* ----------------------- USER-NAMED LIST ---------------------------------- */
export function updateUserNamedList() {
    return list.updateUserNamedList(...arguments);
}
/* ============= UPDATE DATA AFTER FORM SUBMIT ============================== */
export function afterFormSubmitUpdateLocalDatabase(data) {          /*perm-log*/console.log("   /--afterFormSubmitUpdateLocalDatabase data recieved = %O", data);
    return db.getAllStoredData()
        .then(storeMmryAndUpdate);

    function storeMmryAndUpdate(mmry) {
        db.setMmryDataObj(mmry);
        parseEntityData(data);
        updateEntityData(data);
        return db.setUpdatedDataInLocalDb()
            .then(() => handleFailuresAndReturnData(data));
    }
}
/* ------------------ PARSE SERVER JSON ------------------------------------- */
function parseEntityData(data) {
    for (let prop in data) {
        try {
            data[prop] = JSON.parse(data[prop]);
        } catch (e) { /* Fails on string values */ }
    }
}
/* ------------------- UPDATE LOCAL DATA ------------------------------------ */
function updateEntityData(data) {
    sync.addCoreEntityData(data.core, data.coreEntity);
    updateDetailEntityData(data)
    sync.removeInvalidatedData(data)
    sync.retryFailedUpdates();
}
function updateDetailEntityData(data) {
    if (!data.detailEntity) { return Promise.resolve(); }
    return sync.addDetailEntityData(data.detail, data.detailEntity);
}
/* --------------------- COMPLETE UPDATE ------------------------------------ */
function handleFailuresAndReturnData(data) {
    sync.reportDataSyncFailures(data)
    db.clearTempMemory();
    return data;
}