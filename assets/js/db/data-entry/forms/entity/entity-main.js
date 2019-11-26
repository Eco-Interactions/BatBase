/**
 *
 *
 * 
 */
import * as _main from '../forms-main.js'; 
import * as _int from './interaction-form.js';
import * as _loc from './location-form.js';
import * as _src from './source-forms.js';
import * as _txn from './taxon-form.js';

const _u = _main._util;    STOPPED WITH UPDATING THIS FILE _MAIN
const forms = {
    'author': _src, 'citation': _src, 'interaction': _int, 'location': _loc,
    'publication': _src, 'publisher': _src, 'taxon': _txn, 'subject': _int, 'object': _int
};

export function createEntity(entity) {
    forms[_u('lcfirst', [entity])].initCreateForm();
}
export function createSub(ent, cnt) {  
    const entity = ent == 'Citation' ? 'CitationTitle' : ent;
    const selId = cnt ? '#'+entity+'-sel'+cnt : '#'+entity+'-sel';
     $(selId)[0].selectize.createItem('create'); 
}
/** ------------------------ AUTHOR FORM ------------------------------------ */
/* edit-form, form-ui */
export function selectExistingAuthors() {
    return _src.selectExistingAuthors(...arguments);
}

/** ------------------------ TAXON FORM ------------------------------------- */
export function buildTaxonSelectForm(role, realm, realmTaxon, fLvl) {           //console.log('-------------buildTaxonSelectForm. args = %O', arguments);
    _mmry.initEntityFormMemory(_u.lcfirst(role), fLvl, '#'+role+'-sel', 'create');
    return _mmry.initTaxonMemory(role, realm, realmTaxon)
        .then(() => _ui.elems('initSubForm', [fLvl, 'sml-sub-form', {}, '#'+role+'-sel']));
}
/** ------------------------ FORM SPECIFIC ---------------------------------- */
export function getSrcTypeRows(entity, typeId, fLvl, type) {
    return _src.getSrcTypeRows(entity, typeId, fLvl, type)
}
export function handleCitText(formLvl) {
    if (_mmry.getFormProp('entity', formLvl) !== 'citation') { return; }
    _src.handleCitText(formLvl);
}
export function handleSpecialCaseTypeUpdates(elem, fLvl) {
    _src.handleSpecialCaseTypeUpdates(elem, fLvl);
}
export function loadSrcTypeFields(subEntity, typeId, elem, typeName) {
    return _src.loadSrcTypeFields(subEntity, typeId, elem, typeName);
}
export function getFormFunc(entity, funcName) {
    return forms[entity][funcName];
}
export function callFormFunc(entity, funcName, params = []) {  console.log('args = %O, forms = %O', arguments, forms);
    return forms[entity][funcName](...params);
}
export function getSelectedTaxon() {
    return _int.getSelectedTaxon();
}
export function locCoordErr() {
    return _loc.locCoordErr(...arguments);
}
export function addMapToLocationEditForm() {
    return _loc.addMapToLocationEditForm(...arguments);
}
export function addMapToLocForm() {
    return _loc.addMapToLocForm(...arguments);
}
export function focusParentAndShowChildLocs() {
    return _loc.focusParentAndShowChildLocs(...arguments);
}
export function onSrcToggleFields() {
    _src.finishSourceToggleAllFields(...arguments);
}
export function buildCitationText(fLvl) {
    return require('../features/generate-citation.js').buildCitationText(fLvl);
}
export function initNewTaxonForm(level, val) {
    return _txn.initCreateForm(level, val);
}