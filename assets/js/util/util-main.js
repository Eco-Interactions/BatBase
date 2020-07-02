/**
 * App util methods.
 *
 * Exports:
 *     getElem
 *     getDiv
 *
 * TOC:
 *     ELEMS
 */
import * as elems from './elems/elems-main.js';

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


export function ucfirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}