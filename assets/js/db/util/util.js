/**
 * Helpful utility methods used throughout the database search page.
 *
 * Exports:                     Imported by:
 *     (IDB Storage Methods)
 *         downloadFullDb           db-sync
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
 *         IDB STORAGE METHODS
 *         SELECTIZE COMBOBOXES
 *         HTML ELEMENT HELPERS
 *         AJAX
 *         ERROR HANDLING
 *     MISC
 *         DATA
 *         STRING HELPERS
 *         OBJECT HELPERS
 */
import * as _ajax from './ajax-util.js';
import * as _cmbx from './combos.js';
import * as _db from '../local-data/idb-util';
import * as _elems from './elems-util.js';
import * as _err from './err-handling/err-main.js';
import { exitModal, showSaveModal } from '../../misc/intro-core.js';
import extendPrototypes from './extend.js';

extendPrototypes();
/** ==================== UTIL FACADE ======================================== */
/* ---------------------- SELECTIZE COMBOBOXES ------------------------------ */
export function initCombobox() {
    return _cmbx.initCombobox(...arguments);
} 
export function initComboboxes() {
    return _cmbx.initComboboxes(...arguments);
} 
export function getSelVal() {
    return _cmbx.getSelVal(...arguments);
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
export function downloadFullDb() {
    _db.downloadFullDb();
}
export function resetLocalDb() {
    const msg = 'Are you sure you want to reset all local data?';
    showSaveModal(msg, '#rst-data', 'left', resetDb, Function.prototype, 'Yes');
    function resetDb() {
        exitModal();
        _db.downloadFullDb(true);
    }
}
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
export function getAllStoredData() {
    return _db.getAllStoredData();
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
export function getOptsFromStoredData() {
    return _elems.getOptsFromStoredData(...arguments);
}
export function buildOptsObj() {
    return _elems.buildOptsObj(...arguments);
}
export function addEnterKeypressClick() {
    return _elems.addEnterKeypressClick(...arguments);
}
/* --------------- AJAX ----------------------------------------------------- */
export function sendAjaxQuery() {
    return _ajax.sendAjaxQuery(...arguments);
}
export function logAjaxData() {
    return _ajax.logAjaxData(...arguments);
}
/* --------------- ERROR HANDLING ------------------------------------------- */
export function logToConsole() {
    _err.logToConsole(...arguments);
}
export function errorHandling(funcName, params = []) {
    return _err(funcName, params = []);
}
export function alertErr() {                                                    
    return _err.alertErr(...arguments);
}
export function getErrMsgForUserRole() {                                                 
    return _err.getErrMsgForUserRole(...arguments);
}
/* ================== MISC UTIL METHODS ============================================================================= */
export function getTaxonName(taxon) {                                           
    const lvl = taxon.level.displayName;  
    return lvl === "Species" ? taxon.displayName : lvl+' '+taxon.displayName;
}
/* ------------------ DATA -------------------------------------------------- */
/**  Returns a copy of the record detached from the original. */
export function getDetachedRcrd(rcrdKey, rcrds, entity) {                               //console.log("getDetachedRcrd. key = %s, rcrds = %O", rcrdKey, rcrds);
    try {
        // _err.reportErr('noRcrd', {id: rcrdKey, entity: entity});
        return snapshot(rcrds[rcrdKey]);
    }
    catch (e) {                                                                 //console.log("#########-ERROR- couldn't get record [%s] from %O", rcrdKey, rcrds);
        _err.reportErr('noRcrd', {id: rcrdKey, entity: entity});
        return false;
    }
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