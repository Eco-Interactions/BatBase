/**
 * @module app/util
 * App util methods.
 *
 * TOC
 * 	   AJAX
 *     ELEMS
 *     STRINGS
 */
import * as elems from './elems/elems-main.js';
import * as uAjax from './ajax-util.js';
import * as alert from './alert-issue.js';
import * as modal from './intro-modals.js';
import extendPrototypes from './extend.js';

extendPrototypes();

export function logInDevEnv() {
    if ($('body').data('env') === 'prod') { return; }
    console.log(...arguments);
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
/* -------------------- SELECT OPTIONS -------------------------------------- */
export function getOptsFromStoredData() {
    return elems.getOptsFromStoredData(...arguments);
}
export function buildOptsObj() {
    return elems.buildOptsObj(...arguments);
}
export function alphabetizeOpts() {
    return elems.alphabetizeOpts(...arguments);
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