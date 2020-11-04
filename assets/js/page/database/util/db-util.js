/**
 * Helpful utility methods used throughout the database search page.
 *
 * TOC
 *     UTIL FACADE
 *         SELECT OPTIONS
 *         SELECTIZE COMBOBOXES
 *         IDB STORAGE METHODS
 *         HTML ELEMENT HELPERS
 *         AJAX
 *     MISC
 *         DATA
 *     CORE-UTIL FACADE
 */
import { _db } from '~util';
import { _util, executeMethod } from '~db';
import * as cmbx from './combos.js';
/* -------------------- SUB-EXECUTOR ---------------------------------------- */
export function _dbCmbx(funcName, params = []) {                                  console.log('args = %O', arguments);
    return executeMethod(funcName, cmbx, 'db-cmbx', 'elems-main', params);
}
/** ==================== UTIL FACADE ======================================== */
/* -------------------- SELECT OPTIONS -------------------------------------- */
export function getOptsFromStoredData() {
    return cmbx.getOptsFromStoredData(...arguments);
}
export function getOptions() {
    return cmbx.getOptions(...arguments);
}
export function alphabetizeOpts() {
    return cmbx.alphabetizeOpts(...arguments);
}
/* ---------------------- SELECTIZE COMBOBOXES ------------------------------ */
export function initCombobox() {
    return cmbx.initCombobox(...arguments);
}
export function resetCombobox() {
    return cmbx.resetCombobox(...arguments);
}
export function destroySelectizeInstance() {
    return cmbx.destroySelectizeInstance(...arguments);
}
/* ----------------- (EN|DIS)ABLE ------------------------------------------- */
export function enableCombobox() {
    return cmbx.enableCombobox(...arguments);
}
export function enableComboboxes() {
    return cmbx.enableComboboxes(...arguments);
}
export function enableFirstCombobox() {
    return cmbx.enableFirstCombobox(...arguments);
}
/* ------------------------- FOCUS COMBOBOX --------------------------------- */
export function focusCombobox() {
    return cmbx.focusCombobox(...arguments);
}
export function focusFirstCombobox() {
    return cmbx.focusFirstCombobox(...arguments);
}
/* ---------------------- GET|SET COMBO DATA -------------------------------- */
export function getSelVal(field) {
    return cmbx.getSelVal(field);
}
export function getSelTxt(field) {
    return cmbx.getSelTxt(field);
}
export function setSelVal() {
    return cmbx.setSelVal(...arguments);
}
export function updatePlaceholderText() {
    return cmbx.updatePlaceholderText(...arguments);
}
export function replaceSelOpts() {
    return cmbx.replaceSelOpts(...arguments);
}
export function removeOpt() {
    return cmbx.removeOpt(...arguments);
}
export function triggerComboChangeReturnPromise() {
    return cmbx.triggerComboChangeReturnPromise(...arguments);
}
/* ----------------------- IDB STORAGE METHODS -----------------------------------------------------------------------*/
/**
 * Gets data from data storage for each storage property passed. If an array
 * is passed, an object with each prop as the key for it's data is returned.
 * If a property is not found, false is returned.
 */
export function getData(props, returnUndefined) {  //breakpoint  //bp
    return _db('getData', [props, returnUndefined]);
}
export function setData(k, v) {
    return _db('setData', [k, v]);
}
/* ------------------ DATA -------------------------------------------------- */
/**  Returns a copy of the record detached from the original. */
export function getDetachedRcrd(rcrdKey, rcrds, entity) {           /*dbug-log*///console.log("getDetachedRcrd. key = %s, rcrds = %O", rcrdKey, rcrds);
    if (rcrds[rcrdKey]) { return _util('snapshot', [rcrds[rcrdKey]]); }/*perm-log*/_util('logInDevEnv', ["#########-ERROR- couldn't get record [%s] from %O", rcrdKey, rcrds]);
    alertIssue('noRcrdFound', {id: rcrdKey, entity: entity });
    return false;
}