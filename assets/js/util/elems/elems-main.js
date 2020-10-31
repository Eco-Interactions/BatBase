/**
 * @module app/util/elem
 * Html element methods.
 *
 * TOC
 *    HTML ELEMS
 *    FIELD ROW
 *    FORM FOOTER
 */
import * as basic from './basic-elem-build.js';
import * as row from './basic-field-row.js';
import * as footer from './basic-form-footer.js';
/* ------------------------ FIELD ROW --------------------------------------- */
export function getFieldRow() {
    return row.getFieldRow(...arguments);
}
/* ---------------------- FORM FOOTER --------------------------------------- */
export function getFormFooter() {
    return footer.getFormFooter(...arguments);
}
/* ===================== GET ELEMS ========================================== */
export function getElem() {
    return basic.getElem(...arguments);
}
export function getSelect() {
    return basic.getSelect(...arguments);
}
export function getOptsFromStoredData() {
    return opts.getOptsFromStoredData(...arguments);
}
export function buildOptsObj() {
    return opts.buildOptsObj(...arguments);
}
export function alphabetizeOpts() {
    return opts.alphabetizeOpts(...arguments);
}
