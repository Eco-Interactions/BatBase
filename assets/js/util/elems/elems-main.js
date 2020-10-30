/**
 * @module app/util/elem
 * Html element methods.
 *
 * Export
 *     buildElem
 *     getDiv
 *
 * TOC
 *    GET ELEMS
 *    GET ELEM FULL
 */
import * as basic from './basic-elem-build.js';
import * as row from './field-row.js';
/* ===================== GET ELEMS ========================================== */
export function buildElem() {
    return basic.buildElem(...arguments);
}
export function getDiv(attrs) {
    return basic.buildElem('div', attrs);
}
export function getLabel(text, attrs = {}) {
    return basic.buildElem('label', Object.assign(attrs, { text: text }));
}
/* ------------------------ FIELD ROW --------------------------------------- */
export default function buildFieldRow() {
    return row.buildFieldRow(...arguments);
}