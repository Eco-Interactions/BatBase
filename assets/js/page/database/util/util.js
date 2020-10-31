/**
 * Helpful utility methods used throughout the database search page.
 *
 * TOC
 *     GENERATE CITATION TEXT
 *     CORE-UTIL FACADE
 *     UTIL FACADE
 *         SELECTIZE COMBOBOXES
 *         IDB STORAGE METHODS
 *         HTML ELEMENT HELPERS
 *         AJAX
 *     MISC
 *         DATA
 *         STRING HELPERS
 *         OBJECT HELPERS
 */
import { _db, _util } from '~db';
import * as cmbx from './combos.js';
import * as cite from './generate-citation.js';
/** ================ GENERATE CITATION TEXT ================================= */
export function generateCitationText() {
    return cite.generateCitationText(...arguments);
}
/** =================== CORE-UTIL FACADE ==================================== */
export function sendAjaxQuery() {
    return _util('sendAjaxQuery', [...arguments]);
}
export function logAjaxData() {
    return _util('logAjaxData', [...arguments]);
}
/** Handles issues without javascript error/exception objects. */
export function alertIssue() {
    return _util('alertIssue', [...arguments]);
}
/** Sends Error object to Sentry, issue tracker. */
export function reportErr() {
    return _util('reportErr', [...arguments]);
}
/** ==================== UTIL FACADE ======================================== */
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
/* -------------- HTML ELEMENT HELPERS  ------------------------------------- */
export function addEnterKeypressClick(elem) {
    $(elem).keypress(function(e){ //Enter
        if((e.keyCode || e.which) == 13){ $(this).trigger('click'); }
    });
}
/* -------------------- LOGS ------------------------------------------------ */
/* ================== MISC UTIL METHODS ============================================================================= */
/* ------------------ DATA -------------------------------------------------- */
/**  Returns a copy of the record detached from the original. */
export function getDetachedRcrd(rcrdKey, rcrds, entity) {                       //console.log("getDetachedRcrd. key = %s, rcrds = %O", rcrdKey, rcrds);
    if (rcrds[rcrdKey]) { return snapshot(rcrds[rcrdKey]); }                    _util('logInDevEnv', ["#########-ERROR- couldn't get record [%s] from %O", rcrdKey, rcrds]);
    alertIssue('noRcrdFound', {id: rcrdKey, entity: entity });
    return false;
}
/* ------------ STRING HELPERS ---------------------------------------------- */
export function ucfirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
export function lcfirst(str) {
    const f = str.charAt(0).toLowerCase();
    return f + str.substr(1);
}
/** Removes white space at beginning and end, and any ending period. */
export function stripString(text) {
    const str = text.trim();
    return str.charAt(str.length-1) === '.' ? str.slice(0, -1) : str;
}
/* ------------ OBJECT HELPERS ---------------------------------------------- */
export function snapshot(obj) {
    return JSON.parse(JSON.stringify(obj));
}