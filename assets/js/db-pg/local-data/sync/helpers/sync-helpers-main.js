/**
 * Helper methods for local-data sync.
 *
 * TOC
 *     ADD DATA
 *     REMOVE DATA
 *     FAILURES
 */
import * as add from './add/add-main.js';
import * as rmv from './rmv/rmv-main.js';
import * as x from './execute-update';
/* ------------------------- ADD DATA --------------------------------------- */
export function addCoreEntityData() {
    return add.addCoreEntityData(...arguments);
}
export function addDetailEntityData() {
    return add.addDetailEntityData(...arguments);
}
/* ---------------------- REMOVE DATA --------------------------------------- */
export function removeInvalidatedData() {
    return rmv.removeInvalidatedData(...arguments);
}
/* ------------------------- FAILURES --------------------------------------- */
export function clearFailedMmry() {
    x.clearFailedMmry();
}
export function reportDataSyncFailures() {
    return x.reportDataSyncFailures(...arguments);
}
export function retryFailedUpdates() {
    return x.retryFailedUpdates(...arguments);
}