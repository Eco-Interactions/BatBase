/**
 * Entry point for entity-specific code.
 *
 * Note - required form methods: initCreateForm, initFormCombos
 *
 * CODE SECTIONS
 *     CREATE ENTITY
 *     AUTHOR
 *     CITATION
 *     LOCATION
 *     PUBLICATION
 *     PUBLISHER
 *     TAXON
 */
import * as _i from '../forms-main.js'; 
import * as _int from './interaction-form.js';
import * as _loc from './location-form.js';
import * as _src from './source-forms.js';
import * as _txn from './taxon-form.js';

const forms = {
    'author': _src, 'citation': _src, 'interaction': _int, 'location': _loc,
    'publication': _src, 'publisher': _src, 'taxon': _txn, 'subject': _int, 'object': _int
};

export function createEntity(entity) {
    return forms[entity] === _src ? 
        _src.initCreateForm(entity) : forms[entity].initCreateForm();    
}
export function createSubEntity(ent, cnt) {                                     console.log('createSubEntity. args = %O', arguments);
    const entity = ent == 'Citation' ? 'CitationTitle' : ent;
    const selId = cnt ? '#'+entity+'-sel'+cnt : '#'+entity+'-sel';
     $(selId)[0].selectize.createItem('create'); 
}
export function initFormCombos(entity, fLvl) {
    forms[entity].initFormCombos(entity, fLvl);
}
/** ------------------------ AUTHOR FORM ------------------------------------ */
/* edit-form, form-ui */
export function selectExistingAuthors() {
    return _src.selectExistingAuthors(...arguments);
}
/** ------------------------ TAXON FORM ------------------------------------- */
export function initNewTaxonForm(level, val) {
    return _txn.initCreateForm(level, val);
}
/** ------------------------ FORM SPECIFIC ---------------------------------- */
export function getSrcTypeRows(entity, typeId, fLvl, type) {
    return _src.getSrcTypeRows(entity, typeId, fLvl, type)
}
export function handleCitText(formLvl) {
    if (_i.mmry('getFormProp', ['entity', formLvl]) !== 'citation') { return; }
    _src.handleCitText(formLvl);
}
export function handleSpecialCaseTypeUpdates(elem, fLvl) {
    _src.handleSpecialCaseTypeUpdates(elem, fLvl);
}
export function loadSrcTypeFields(subEntity, typeId, elem, typeName) {
    return _src.loadSrcTypeFields(subEntity, typeId, elem, typeName);
}
// export function getFormFunc(entity, funcName) {
//     return forms[entity][funcName];
// }
// export function callFormFunc(entity, funcName, params = []) {  console.log('args = %O, forms = %O', arguments, forms);
//     return forms[entity][funcName](...params);
// }
export function getSelectedTaxon() {
    return _int.getSelectedTaxon();
}
// export function locCoordErr() {
//     return _loc.locCoordErr(...arguments);
// }
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