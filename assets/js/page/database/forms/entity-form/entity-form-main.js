/**
 * Entry point for entity-specific code.
 *
 * Note - required form methods: initCreateForm, initCombos
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
import { _state, _val } from '~form';
import * as int from './interaction/int-form-main.js';
import * as loc from './location/location-form.js';
import * as src from './source/src-form-main.js';
import * as txn from './taxon/txn-form-main.js';

const forms = {
    'interaction': int, 'object': int, 'subject': int,
    'location': loc,
    'author': src, 'citation': src, 'editor': src, 'publication': src, 'publisher': src,
    'taxon': txn,'species': txn, 'genus': txn, 'family': txn, 'order': txn, 'class': txn
};
export function clearEntityFormMemory(entity) {
    const map = {
        'interaction': int.clearFormMemory
    };
    if (!map[entity]) { return; }
    map[entity]();
}
/* =================== INIT FORM ============================================ */
export function createEntity(entity, val) {
    return forms[entity].initCreateForm(...arguments);
}
export function createSubEntity(entity, fLvl, val) {                /*dbug-log*///console.log('createSubEntity [%s][%s] ?[%s]', fLvl, entity, val);
    if (ifFormAlreadyOpenAtLevel(fLvl)) { return handleOpenSubFormAlert(entity, fLvl); }
    createEntity(entity, val);
}
/* ----------------- IF OPEN SUB-FORM ISSUE --------------------------------- */
export function ifFormAlreadyOpenAtLevel(fLvl) {
    return fLvl ? $('#'+fLvl+'-form').length !== 0 : false;
}
export function handleOpenSubFormAlert(entity, fLvl) {
    return openSubFormAlert(entity, fLvl)
}
function openSubFormAlert(ent, fLvl) {
    const entity = ent === 'citation' ? 'citationTitle' : ent;
    _val('openSubFormAlert', [_u('ucfirst', [entity]), fLvl]);
}
/* ------------------------- FORM COMBOS ------------------------------------ */
export function initCombos(fLvl) {                                  /*dbug-log*/console.log('initCombos [%s]', fLvl)
    const entity = _state('getFormData', [fLvl, 'entity']);
    forms[entity].initCombos(fLvl, entity);
}
/* -------------------------- EDIT FORMS ------------------------------------ */
/**
 * [finishEditFormInit description]
 * @param  {[type]} entity [description]
 * @param  {[type]} id     [description]
 * @return {[type]}        [description]
 */
export function finishEditFormInit(entity, id) {
    forms[entity].initCombos('top', entity);
    return finishCmplxFormBuilds(entity, id);
}
function finishCmplxFormBuilds(entity, id) {
    const map = {
        'citation': src.setSrcEditRowStyle.bind(null, 'citation'),
        'publication': src.setSrcEditRowStyle.bind(null, 'publication'),
        'location': addMapToLocationEditForm,
    };
    return !map[entity] ? Promise.resolve() : Promise.resolve(map[entity](id));
}
/* =================== ENTITY FACADE ======================================== */
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
export function selectRoleTaxon() {
    return int.selectRoleTaxon(...arguments);
}
export function enableRoleTaxonFieldCombos() {
    return int.enableRoleTaxonFieldCombos(...arguments);
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
    return txn.getSelectedTaxon();
}
export function getTaxonEditFields(entity, id) {
    return txn.getTaxonEditFields(id);
}
export function initRoleTaxonSelect() {
    return txn.initRoleTaxonSelect(...arguments);
}
export function selectParentTaxon(id) {
    return txn.selectParentTaxon(id);
}
export function onGroupSelection() {
    return txn.onGroupSelection(...arguments);
}
export function onSubGroupSelection() {
    return txn.onSubGroupSelection(...arguments);
}
/** ------------------------ SOURCE TYPES ----------------------------------- */
export function finishSrcFieldLoad() {
    src.finishSrcFieldLoad(...arguments);
}
export function getPubOrCitEditFields() {
    return src.getPubOrCitEditFields(...arguments);
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