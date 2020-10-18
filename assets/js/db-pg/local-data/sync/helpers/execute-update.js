/**
 * Executes the passed update function. If there is an error, the update is added
 * to the 'retryQueue'. After the initial updates complete, those in the retryQueue
 * are attempted again. Those that fail a second time are reported.
 *
 * Exports
 *     clearFailedMmry
 *     reportDataSyncFailures
 *     retryFailedUpdates
 *     updateData
 *
 * TOC
 *     EXECUTE UPDATE
 *     FAILURES
 *         RETRY QUEUE
 *         REPORT FAILURES
 */
import * as db from '../../local-data-main.js';
import { _u, alertIssue } from '../../../db-main.js';

let failed = { data: [], retryQueue: {}};

export function clearFailedMmry() {
    failed = { data: [], retryQueue: {}};
}
/* ======================== EXECUTE UPDATE ================================== */
/**
 * @param  {func} updateFunc  To update the entity's data.
 * @param  {str}  prop   Prop to update
 * @param  {obj}  params Entity, rcrd, stage (add|rmvData)
 * @param  {obj}  edits  Edit obj returned from server
 */
export function updateData(updateFunc, prop, params, edits) {       /*dbug-log*///console.log('prop [%s] -> params [%O], updateFunc = %O', prop, params, updateFunc);
    try {
        updateFunc(prop, params.rcrd, params.entity, edits)
    } catch (e) {
        if (failed.final) { return trackDataSyncFailure(e, prop, params); }
        addToRetryQueue(updateFunc, prop, params, edits);
    }
}
/** Returns the current date time in the format: Y-m-d H:i:s */
function getCurrentDate() {
    return new Date().today() + " " + new Date().timeNow();
}
/* ========================= FAILURES ======================================= */
/* -------------------------- RETRY QUEUE ----------------------------------- */
/**
 * If this is the first failure, it is added to other failed updates to be
 * retried at the end of the update process. If this is the second error,
 * the error is reported to the user. (<--todo for onPageLoad sync)
 */
function addToRetryQueue(updateFunc, prop, params, edits) {         /*dbug-log*///console.log('addToRetryQueue. edits = %O', edits);
    if (!failed.retryQueue[params.entity]) { failed.retryQueue[params.entity] = {}; }
    failed.retryQueue[params.entity][prop] = {
        edits: edits, entity: params.entity, rcrd: params.rcrd,
        stage: params.stage, updateFunc: updateFunc
    };
}
/** Retries any updates that failed in the first pass. */
export function retryFailedUpdates() {                              /*perm-log*/console.log('           --retrying[%s]FailedUpdates = %O', Object.keys(failed.retryQueue).length, _u('snapshot', [failed]));
    if (!Object.keys(failed.retryQueue).length) { return Promise.resolve(); }
    failed.final = true;
    Object.keys(failed.retryQueue).forEach(retryEntityUpdates);
    return Promise.resolve();
}
function retryEntityUpdates(entity) {
    Object.keys(failed.retryQueue[entity]).forEach(prop => {
        let params = failed.retryQueue[entity][prop];
        updateData(params.updateFunc, prop, params, params.edits);
    });
}
/* ----------------------- REPORT FAILURES ---------------------------------- */
export function reportDataSyncFailures(obj) {
    const data = obj || {};
    addFailedUpdatesToObj(data);
    if (!data.fails) { return data; }                               /*perm-log*/console.log('           !!Reporting failures = %O', data.fails)
    alertIssue('dataSyncFailure', { fails: getFailureReport(data.fails) });
    return data
}
function getFailureReport (failures) {
    const data = failures.map(f => { return { err: f.errMsg, tag: f.tag}});
    return JSON.stringify(data);
}
function addFailedUpdatesToObj(data) {
    data.fails = failed.data.length ? failed.data : null;
    return data;
}
/** Sends a message and error tag back to the form to be displayed to the user. */
function trackDataSyncFailure(e, prop, params) {
    logSyncFailure(e, prop, params);
    failed.data.push(getFailDataObj(e, prop, params));
}
function logSyncFailure(e, prop, params) {
    console.log('               !!Tracking failure: [%s][%s]->[%s] [func = %s] [params = %O] [e = %O], [rcrd = %s]', params.entity, params.rcrd.id, prop, params.updateFunc.name, params, e, JSON.stringify(params.rcrd));
}
function getFailDataObj(e, prop, params) {
    return {
        errMsg: e.name + ': ' + e.message,
        msg: getDataSyncFailureMsg(params.entity, params.stage),
        tag: params.entity + ':' + prop + ':' + params.rcrd.id
    };
}
function getDataSyncFailureMsg(entity, stage) {
    const trans = { 'addData': 'adding to', 'rmvData': 'removing from' };
    return 'There was an error while '+trans[stage]+' the '+ entity +'\'s stored data.';
}