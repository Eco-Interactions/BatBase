/**
 * miscellaneous util methods.
 *
 * TOC
 *    CITATION
 *    AJAX
 *    STRINGS
 *    MISC
 */
import * as cite from './generate-citation.js';
import * as uAjax from './ajax-util.js';

/* =========================== CITATION ===================================== */
export function generateCitationText(params) {
    return cite.generateCitationText(...arguments);
}
/* =========================== AJAX ========================================= */
export function sendAjaxQuery() {
    return uAjax.sendAjaxQuery(...arguments);
}
export function logAjaxData() {
    return uAjax.logAjaxData(...arguments);
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
export function addSpaceBetweenCamelCaseUnlessHyphen(string) {
    if (string.includes('-')) { return string; }
    return string.replace(/([A-Z])/g, ' $1');
}
/* ========================= MISC =========================================== */
export function logInDevEnv() {
    if ($('body').data('env') === 'prod') { return; }
    console.log(...arguments);
}
export function logInProdEnv() {
    if ($('body').data('env') !== 'prod') { return; }
    console.log(...arguments);
}
export function snapshot(obj) {                                     /*dbug-log*///console.log('snapshot [%O]', obj);
    return JSON.parse(JSON.stringify(obj));
}
export function isObj(v) {
    return v.constructor.name === 'Object';
}
/* ========================= ELEM =========================================== */
export function addEnterKeypressClick(elem) {
    $(elem).keypress(function(e){ //Enter
        if((e.keyCode || e.which) == 13){ $(this).trigger('click'); }
    });
}
export function getInnerWidthInEm(pxW) {
    return pxW / parseFloat($('html').css('font-size'));
}