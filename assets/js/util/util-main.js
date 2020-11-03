/**
 * @module app/util
 * App util methods.
 *
 * TOC
 *     APP ALERTS
 *     APP MODALS
 * 	   AJAX
 *     HTML ELEMS
 *     FIELDS AND ROWS
 *     STRINGS
 *     MISC
 */
import * as elems from './elems/elems-main.js';
import * as uAjax from './ajax-util.js';
import * as alert from './alert-issue.js';
import * as modal from './intro-modals.js';
import extendPrototypes from './extend.js';

export function initUtil() {
    extendPrototypes();
}
/** ===================== MODULE-EXECUTOR =================================== */
export function executeMethod(funcName, mod, modName, caller, params = []) {
    if (!Array.isArray(params)) { params = [params]; }  //Catches events typically.
    try {
        return mod[funcName](...params);
    } catch(e) {
        alertIssue('facadeErr', {module: modName, caller: caller, called: funcName, error: e.toString(), errMsg: e.message});
        if ($('body').data('env') === 'prod') { return; }
        console.error('[%s][%s] module: [%s] call failed.  params = %O, err = %O', caller, modName, funcName, params, e);
    }
}
function moduleMethod(funcName, mod, modName, params) {
    return executeMethod(funcName, mod, modName, 'app-main', params);
}
export function _elems(funcName, params = []) {
    return moduleMethod(funcName, elems, 'app-elems', params);
}
/* ==================== APP ALERTS ========================================== */
export function initSentry() {
    return alert.initSentry(...arguments);
}
export function reportErr() {
    return alert.reportErr(...arguments);
}
export function alertIssue() {
    return alert.alertIssue(...arguments);
}
/* ==================== APP MODALS ========================================== */
export function showInfoModal() {
    return modal.showInfoModal(...arguments);
}
export function showSaveModal() {
    return modal.showInfoModal(...arguments);
}
export function showTutorialModal() {
    return modal.showTutorialModal(...arguments);
}
/* =========================== AJAX ========================================= */
export function sendAjaxQuery() {
    return uAjax.sendAjaxQuery(...arguments);
}
export function logAjaxData() {
    return uAjax.logAjaxData(...arguments);
}
/* ======================== HTML ELEMS ====================================== */
export function getElem() {
    return elems.getElem(...arguments);
}
export function getSelect() {
    return elems.getSelect(...arguments);
}
/* ===================== FIELDS & ROWS ====================================== */
export function getFieldRow() {
    return elems.getFieldRow(...arguments);
}
export function getFormFooter() {
    return elems.getFormFooter(...arguments);
}
/* ========================= STRINGS ======================================== */
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
/* ========================= MISC =========================================== */
export function logInDevEnv() {
    if ($('body').data('env') === 'prod') { return; }
    console.log(...arguments);
}
export function snapshot(obj) {
    return JSON.parse(JSON.stringify(obj));
}
export function addEnterKeypressClick(elem) {
    $(elem).keypress(function(e){ //Enter
        if((e.keyCode || e.which) == 13){ $(this).trigger('click'); }
    });
}