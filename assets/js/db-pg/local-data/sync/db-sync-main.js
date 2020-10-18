/**
 * Handles adding, updating, and removing data from local Indexed DB storage.
 *
 * TOC
 *     DATA-ENTRY SYNC
 *     PAGE-LOAD SYNC
 *     INTERNAL FACADE
 */
import * as h from './helpers/sync-helpers-main.js';
import * as entry from './data-entry/data-entry-sync.js';
import * as pgLoad from './pg-load/pg-load-main.js';

/* ========================= DATA-ENTRY SYNC ================================ */
export function updateUserNamedList() {
    return entry.updateUserNamedList(...arguments);
}
export function afterFormSubmitUpdateLocalDatabase() {
    return entry.afterFormSubmitUpdateLocalDatabase(...arguments);
}
/* ========================= PAGE-LOAD SYNC ================================= */
export function syncLocalDbWithServer() {
    return pgLoad.syncLocalDbWithServer(...arguments);
}
/* ========================= INTERNAL FACADE ================================ */
export function addCoreEntityData() {
    return h.addCoreEntityData(...arguments);
}
export function addDetailEntityData() {
    return h.addDetailEntityData(...arguments);
}
export function reportDataSyncFailures() {
    return h.reportDataSyncFailures(...arguments);
}
export function removeInvalidatedData() {
    return h.removeInvalidatedData(...arguments);
}
export function retryFailedUpdates() {
    return h.retryFailedUpdates(...arguments);
}
export function clearFailedMmry() {
    h.clearFailedMmry();
}