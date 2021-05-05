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
import { _elems, _panel, _state, _val } from '~form';
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
    const key = Object.keys(forms).find(m => forms[m].ent.indexOf(lc) !== -1);/*dbug-log*///console.log('--getEntityModule entity[%s] key[%s]', entity, key);
    return forms[key].mod;
}
export function clearEntityFormMemory(entity) {
    const map = {
        interaction: int.clearFormMemory
    };
    if (!map[entity]) { return; }
    map[entity]();
}
/* =================== INIT FORM ============================================ */
export function createEntity(entity, val) {
    return getEntityModule(entity).initCreateForm(...arguments);
}
/* ------------------------- EDIT FORM -------------------------------------- */
export function editEntity(entity, id) {
    const mod = getEntityModule(entity);
    return mod.initEditForm(...arguments)
        .then(() => fillEntityDetailPanel(entity, id))
        .then(() => _elems('checkReqFieldsAndToggleSubmitBttn', ['top']));
}
function fillEntityDetailPanel(entity, id) {
    if (entity === 'Interaction') { return; }
    _panel('fillEditEntityDetailPanel', [id]);
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
/** --------------------------- LOCATION ------------------------------------ */
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
export function initFieldTaxonSelect() {
    return txn.initFieldTaxonSelect(...arguments);
}
export function selectFieldTaxon() {
    return int.selectFieldTaxon(...arguments);
}
export function enableTaxonFieldCombos() {
    return int.enableTaxonFieldCombos(...arguments);
}
export function getSelectedTaxon() {
    return txn.getSelectedTaxon();
}
/** ------------------------ SOURCE TYPES ----------------------------------- */
export function finishSrcFieldLoad() {
    src.finishSrcFieldLoad(...arguments);
}
/** ---------------- AUTHOR ------------------- */
export function selectExistingAuthsOrEds() {
    return src.selectExistingAuthsOrEds(...arguments);
}
/** ---------- CITATION ------------------------- */
export function handleCitText(formLvl) {
    src.handleCitText(formLvl);
}