/**
 * Entry point for entity-specific code.
 *
 * Note - required form methods: initCreateForm
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
import * as int from './interaction/int-form-main.js';
import * as loc from './location/location-form.js';
import * as src from './source/src-form-main.js';
import * as txn from './taxon/txn-form-main.js';

const forms = {
    int: { ent: ['interaction', 'object', 'subject'], mod: int },
    loc: { ent: ['location'], mod: loc },
    src: { ent: ['author', 'citation', 'editor', 'publication', 'publisher'], mod: src },
    txn: { ent: ['taxon', 'species', 'genus', 'family', 'order', 'class'], mod: txn }
};
function getEntityModule(entity) {
    const lc = _u('lcfirst', [entity]);
    const key = Object.keys(forms).find(m => forms[m].ent.indexOf(lc) !== -1);
    return forms[key].mod;
}
export function clearEntityFormMemory(entity) {
    const map = {
        'interaction': int.clearFormMemory
    };
    if (!map[entity]) { return; }
    map[entity]();
}
/* =================== INIT FORM ============================================ */
export function createEntity(entity, val) {
    return getEntityModule(entity).initCreateForm(...arguments);
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
export function getSelectedTaxon() {
    return txn.getSelectedTaxon();
}
export function getTaxonEditFields(entity, id) {
    return txn.getTaxonEditFields(id);
}
export function initRoleTaxonSelect() {
    return txn.initRoleTaxonSelect(...arguments);
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
/** ---------------- AUTHOR ------------------- */
/* edit-form, form-ui */
export function selectExistingAuthsOrEds() {
    return src.selectExistingAuthsOrEds(...arguments);
}
/** ---------- CITATION ------------------------- */
export function handleCitText(formLvl) {
    src.handleCitText(formLvl);
}