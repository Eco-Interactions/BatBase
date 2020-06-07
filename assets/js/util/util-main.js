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
    return elems.getDiv();
}
export function getElem(tag, attrs) {  
    return elems.getElem(tag, attrs);
}
export function getLabel (text) {
    return elems.getLabel(text);
}