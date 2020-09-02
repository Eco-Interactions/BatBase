/**
 * App util methods.
 *
 * Exports:
 *     getElem
 *     getDiv
 *
 * TOC:
 * 	   AJAX
 *     ELEMS
 *     STRINGS
 */
import * as elems from './elems/elems-main.js';
import * as uAjax from './ajax-util.js';

/* =========================== AJAX ========================================= */
export function sendAjaxQuery() {
    return uAjax.sendAjaxQuery(...arguments);
}
export function logAjaxData() {
    return uAjax.logAjaxData(...arguments);
}
/* =========================== ELEMS ======================================== */
export function getDiv() {
    return elems.getDiv(...arguments);
}
export function getElem() {
    return elems.getElem(...arguments);
}
export function getLabel () {
    return elems.getLabel(...arguments);
}
/* ========================= STRINGS ======================================== */
export function ucfirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}