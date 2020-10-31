/**
 * @module app/util/elem
 * Html element methods.
 *
 * TOC
 *    GET ELEMS
 *        FIELD ROW
 *        FORM FOOTER
 */
import * as basic from './basic-elem-build.js';
import * as row from './basic-field-row.js';
import * as footer from './basic-form-footer.js';
/* ===================== GET ELEMS ========================================== */
export function getElem() {
    return basic.getElem(...arguments);
}
/* ------------------------ FIELD ROW --------------------------------------- */
export function getFieldRow() {
    return row.getFieldRow(...arguments);
}
/* ---------------------- FORM FOOTER --------------------------------------- */
export function getFormFooter() {
    return footer.getFormFooter(...arguments);
}
