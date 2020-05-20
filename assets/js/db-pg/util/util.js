/**
 * Helpful utility methods used throughout the database search page.
 *
 * Exports:                     Imported by:
 *     (IDB Storage Methods)
 *         getData
 *         setData
 *   addEnterKeypressClick
 *   alphaOptionObjs
 *   buildElem
 *   buildSelectElem
 *   buildSimpleOpts
 *   buildOptsObj
 *   getDataFromStorage
 *   getDetachedRcrd
 *   getOptsFromStoredData
 *   getSelVal
 *   initCombobox
 *   initComboboxes
 *   init_db
 *   lcfirst 
 *   replaceSelOpts
 *   sendAjaxQuery
 *   setSelVal
 *   stripString
 *   snapshot
 *   triggerComboChangeReturnPromise
 *   ucfirst
 *
 * TOC:
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
import * as _pg from '../db-main.js';
import * as _get from './ajax-util.js';
import * as _cmbx from './combos.js';
import * as _db from '../local-data/local-data-main.js';
import * as _elems from './elems-util.js';
import extendPrototypes from './extend.js';

extendPrototypes();
/** ==================== UTIL FACADE ======================================== */
/* ---------------------- SELECTIZE COMBOBOXES ------------------------------ */
export function initCombobox() {
    return _cmbx.initCombobox(...arguments);
} 
export function initComboboxes(fieldAry) {
    return _cmbx.initComboboxes(fieldAry);
} 
export function getSelVal(field) {
    return _cmbx.getSelVal(field);
} 
export function setSelVal() {
    return _cmbx.setSelVal(...arguments);
} 
export function updatePlaceholderText() {
    return _cmbx.updatePlaceholderText(...arguments);
} 
export function replaceSelOpts() {
    return _cmbx.replaceSelOpts(...arguments);
} 
export function triggerComboChangeReturnPromise() {
    return _cmbx.triggerComboChangeReturnPromise(...arguments);
} 
/* ----------------------- IDB STORAGE METHODS -----------------------------------------------------------------------*/

/**
 * Gets data from data storage for each storage property passed. If an array
 * is passed, an object with each prop as the key for it's data is returned. 
 * If a property is not found, false is returned. 
 */
export function getData(props, returnUndefined) {  //breakpoint  //bp
    return _db.getData(props, returnUndefined);
}
export function setData(k, v) {
    return _db.setData(k, v);
}
/* -------------- HTML ELEMENT HELPERS  ------------------------------------- */
export function buildElem() {
    return _elems.buildElem(...arguments);
}
export function buildSelectElem() {
    return _elems.buildSelectElem(...arguments);
}
export function buildSimpleOpts() {
    return _elems.buildSimpleOpts(...arguments);
}
export function alphaOptionObjs() {
    return _elems.alphaOptionObjs(...arguments);
}
export function getOptsFromStoredData(prop) {
    return _elems.getOptsFromStoredData(prop);
}
export function buildOptsObj() {
    return _elems.buildOptsObj(...arguments);
}
export function addEnterKeypressClick() {
    return _elems.addEnterKeypressClick(...arguments);
}
/* --------------- AJAX ----------------------------------------------------- */
export function sendAjaxQuery() {
    return _get.sendAjaxQuery(...arguments);
}
export function logAjaxData() {
    return _get.logAjaxData(...arguments);
}
/* ================== MISC UTIL METHODS ============================================================================= */
/* ------------------ DATA -------------------------------------------------- */
/**  Returns a copy of the record detached from the original. */
export function getDetachedRcrd(rcrdKey, rcrds, entity) {                       //console.log("getDetachedRcrd. key = %s, rcrds = %O", rcrdKey, rcrds);
    if (rcrds[rcrdKey]) { return snapshot(rcrds[rcrdKey]); }                    //console.log("#########-ERROR- couldn't get record [%s] from %O", rcrdKey, rcrds);
    _pg.alertIssue('noRcrdFound', {id: rcrdKey, entity: entity });
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