/**
 * Entry point for entity-specific code.
 *
 * Note - required form methods: initCreateForm, initEditForm
 *
 * TOC
 *     INIT FORM
 *         IF OPEN SUB-FORM ISSUE
 *         FORM COMBOS
 *         EDIT FORMS
 *     ENTITY FACADE
 *         INTERACTION
 *         LOCATION
 *         TAXON
 *         SOURCE TYPES
 *             AUTHOR
 *             CITATION
 */
import { _u } from '~util';
import { _elems, _state, _val } from '~form';
import * as build from './build/entity-build-main.js'
import * as edit from './edit/edit-form-main.js';
import * as confg from './confg/confg-main.js';
/* =================== FORM CONFG =========================================== */
export function _confg(funcName, params) {
    return confg[funcName](...params);
}
/* =================== INIT FORM ============================================ */
export function createEntity() {
    return build.createEntity(...arguments);
}
/* ------------------------- EDIT FORM -------------------------------------- */
export function editEntity() {
    return build.editEntity(...arguments);
}
export function setEditFieldValues() {
    return edit.setEditFieldValues(...arguments);
}
/* =================== ENTITY FACADE ======================================== */
export function clearEntityFormMemory() {
    build.clearEntityFormMemory(...arguments);
}
/** ------------------------ INTERACTION ------------------------------------ */
export function fillCitationCombo() {
    build.fillCitationCombo(...arguments);
}
export function selectIntLoc(id) {
    build.selectIntLoc(id);
}
export function enableCountryRegionField() {
    build.enableCountryRegionField();
}
/** --------------------------- LOCATION ------------------------------------ */
export function addMapToLocForm(elem, mapType) {
    return build.addMapToLocForm(elem, mapType);
}
export function focusParentAndShowChildLocs(mapType, val) {
    return build.focusParentAndShowChildLocs(mapType, val);
}
export function autofillCoordinateFields() {
    build.autofillCoordinateFields(...arguments);
}
/** ------------------------ TAXON ------------------------------------------ */
export function selectFieldTaxon() {
    return build.selectFieldTaxon(...arguments);
}
export function enableTaxonFieldCombos() {
    return build.enableTaxonFieldCombos(...arguments);
}
export function getSelectedTaxon() {
    return build.getSelectedTaxon();
}
export function initFieldTaxonSelect() {
    return build.initFieldTaxonSelect(...arguments);
}
/** ------------------------ SOURCE TYPES ----------------------------------- */
export function finishSrcFieldLoad() {
    build.finishSrcFieldLoad(...arguments);
}
/** ---------------- AUTHOR ------------------- */
/* edit-form, form-ui */
export function selectExistingAuthsOrEds() {
    return build.selectExistingAuthsOrEds(...arguments);
}
/** ---------- CITATION ------------------------- */
export function handleCitText(formLvl) {
    build.handleCitText(formLvl);
}