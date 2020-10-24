/**
 * Helpful utility methods used throughout the database search page.
 *
 * TOC:
 *     GENERATE CITATION TEXT
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
import * as coreUtil from '../../app/util/util-main.js';
import { alertIssue as _alertIssue, _db } from '../db-main.js';
import * as cmbx from './combos.js';
import * as elems from './elems-util.js';
import * as cite from './generate-citation.js';
import extendPrototypes from './extend.js';

extendPrototypes();
/** ================ GENERATE CITATION TEXT ================================= */
export function generateCitationText() {
    return cite.generateCitationText(...arguments);
}
/** ==================== CORE APP FACADE ==================================== */
export function sendAjaxQuery() {
    return coreUtil.sendAjaxQuery(...arguments);
}
export function logAjaxData() {
    return coreUtil.logAjaxData(...arguments);
}
/** ==================== UTIL FACADE ======================================== */
/* ---------------------- SELECTIZE COMBOBOXES ------------------------------ */
export function initCombobox() {
    return cmbx.initCombobox(...arguments);
}
export function initComboboxN() {
    return cmbx.initComboboxN(...arguments);
}
export function initComboboxes(fields) {
    return cmbx.initComboboxes(fields);
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
export function buildElem() {
    return elems.buildElem(...arguments);
}
export function buildSelectElem() {
    return elems.buildSelectElem(...arguments);
}
export function buildSimpleOpts() {
    return elems.buildSimpleOpts(...arguments);
}
export function alphaOptionObjs() {
    return elems.alphaOptionObjs(...arguments);
}
export function getOptsFromStoredData(prop) {
    return elems.getOptsFromStoredData(prop);
}
export function buildOptsObj() {
    return elems.buildOptsObj(...arguments);
}
export function addEnterKeypressClick() {
    return elems.addEnterKeypressClick(...arguments);
}
/* -------------------- LOGS ------------------------------------------------ */
export function logInDevEnv() {
    if ($('body').data('env') === 'prod') { return; }
    console.log(...arguments);
}
/* ================== MISC UTIL METHODS ============================================================================= */
/* ------------------ DATA -------------------------------------------------- */
/**  Returns a copy of the record detached from the original. */
export function getDetachedRcrd(rcrdKey, rcrds, entity) {                       //console.log("getDetachedRcrd. key = %s, rcrds = %O", rcrdKey, rcrds);
    if (rcrds[rcrdKey]) { return snapshot(rcrds[rcrdKey]); }                    logInDevEnv("#########-ERROR- couldn't get record [%s] from %O", rcrdKey, rcrds);
    _alertIssue('noRcrdFound', {id: rcrdKey, entity: entity });
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