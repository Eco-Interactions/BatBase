/**
 * Entry point for entity-specific code.
 *
 * Note - required form methods: initCreateForm, initFormCombos
 *
 * TOC
 *     CREATE ENTITY
 *     EDIT FORMS
 *     INTERACTION
 *     LOCATION
 *     TAXON
 *     SOURCE TYPES
 *         AUTHOR
 *         CITATION
 */
import * as int from './interaction/int-form-main.js';
import * as loc from './location/location-form.js';
import * as src from './source/src-form-main.js';
import * as txn from './taxon/taxon-form.js';

const forms = {
    'interaction': int, 'object': int, 'subject': int,
    'location': loc,
    'author': src, 'citation': src, 'editor': src, 'publication': src, 'publisher': src,
    'taxon': txn,'species': txn, 'genus': txn, 'family': txn, 'order': txn, 'class': txn
};

export function createEntity(entity) {
    return forms[entity].initCreateForm(...arguments);
}
export function initFormCombos(entity, fLvl) {                      /*dbug-log*///console.log('initFormCombos [%s][%s]', fLvl, entity)
    forms[entity].initFormCombos(...arguments);
}
/* -------------------------- EDIT FORMS ------------------------------------ */
/** Used by complex forms: citation, interaction, location, taxon. */
export function finishEntityEditFormBuild(entity) {
    return Promise.resolve(
        forms[entity].finishEditFormBuild(entity));
}
export function finishEditFormInit(entity, id) {
    const cmplxFnshrs = {
        'citation': src.setSrcEditRowStyle,
        'publication': src.setSrcEditRowStyle,
        'location': addMapToLocationEditForm,
    };
    if (!cmplxFnshrs[entity]) { return Promise.resolve(); }
    return Promise.resolve(cmplxFnshrs[entity](id));
}
/** ------------------------ INTERACTION ------------------------------------ */
export function fillCitationCombo() {
    int.fillCitationCombo(...arguments);
}
export function selectIntLoc(id) {
    int.selectLoc(id);
}
export function enableCountryRegionField() {
    int.enableCountryRegionField();
}
export function onRankSelection() {
    int.onRankSelection(...arguments);
}
export function onSubGroupSelection() {
    return int.onSubGroupSelection(...arguments);
}
/** --------------------------- LOCATION ------------------------------------ */
export function addMapToLocationEditForm() {
    return loc.addMapToLocationEditForm(...arguments);
}
export function addMapToLocForm(elem, mapType) {
    return loc.addMapToLocForm(elem, mapType);
}
export function focusParentAndShowChildLocs(mapType, val) {
    return loc.focusParentAndShowChildLocs(mapType, val);
}
export function autofillCoordinateFields() {
    loc.autofillCoordinateFields(...arguments);
}
/** ------------------------ TAXON ------------------------------------------ */
export function createTaxon(rank, val) {
    return txn.initCreateForm(rank, val);
}
export function getSelectedTaxon() {
    return int.getSelectedTaxon();
}
export function getTaxonEditFields(entity, id) {
    return txn.getTaxonEditFields(id);
}
export function selectParentTaxon(id) {
    return txn.selectParentTaxon(id);
}
/** ------------------------ SOURCE TYPES ----------------------------------- */
export function onSrcToggleFields() {
    src.finishSourceToggleAllFields(...arguments);
}
export function getSrcTypeFields() {
    return src.getSrcTypeFields(...arguments);
}
/** ---------------- AUTHOR ------------------- */
/* edit-form, form-ui */
export function selectExistingAuthsOrEds() {
    return src.selectExistingAuthsOrEds(...arguments);
}
/** ---------- CITATION ------------------------- */
export function handleCitText(formLvl) {
    src.handleCitText(formLvl);
}