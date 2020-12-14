/**
 * On form submit success, the new and edited data is updated in the local database.
 *
 * Export
 *     afterServerDataUpdateSyncLocalDatabase
 *     updateUserNamedList
 *     updateLocalEntityData
 *
 * TOC
 *     ENTITY UPDATES
 *         USER-NAMED LISTS
 *     UPDATE DATA AFTER FORM SUBMIT
 *         PARSE SERVER JSON
 *     UPDATE ENTITY DATA
 *         COMPLETE UPDATE
 */
import * as db from '../../local-data-main.js';
import * as sync from '../db-sync-main.js';
import * as list from './user-named-sync.js';
import ifSourceDataEditedUpdatedCitations from './citation-sync.js';
/* ===================== ENTITY UPDATES ===================================== */
/* ----------------------- USER-NAMED LIST ---------------------------------- */
export function updateUserNamedList() {
    return list.updateUserNamedList(...arguments);
}
/* ============= UPDATE DATA AFTER FORM SUBMIT ============================== */
export function afterServerDataUpdateSyncLocalDatabase(data) {      /*perm-log*/console.log("   /--afterServerDataUpdateSyncLocalDatabase data recieved = %O", data);
    return db.getAllStoredData()
        .then(storeMmryAndUpdate);

    function storeMmryAndUpdate(mmry) {
        db.setMmryDataObj(mmry);
        return updateLocalEntityData(data)
            .then(() => handleFailuresAndReturnData(data));
    }
}
export function updateLocalEntityData(data) {
    parseEntityData(data);
    return updateEntityData(data)
        .then(db.setUpdatedDataInLocalDb);
}
/* ------------------ PARSE SERVER JSON ------------------------------------- */
function parseEntityData(data) {
    for (let prop in data) {
        try {
            data[prop] = JSON.parse(data[prop]);
        } catch (e) { /* Fails on string values */ }
    }
}
/* =================== UPDATE ENTITY DATA =================================== */
function updateEntityData(data) {                                   /*dbug-log*///console.log('updateEntityData = %O', data);
    sync.addCoreEntityData(data.core, data.coreEntity);
    updateDetailEntityData(data)
    sync.removeInvalidatedData(data)
    sync.retryFailedUpdates();
    return ifSourceDataEditedUpdatedCitations(data);
}
function updateDetailEntityData(data) {
    if (!data.detailEntity) { return; }
    return sync.addDetailEntityData(data.detail, data.detailEntity);
}
/* --------------------- COMPLETE UPDATE ------------------------------------ */
function handleFailuresAndReturnData(data) {
    sync.reportDataSyncFailures(data)
    db.clearTempMemory();
    return data;
}