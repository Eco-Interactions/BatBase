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
import * as _autoCite from './auto-citation.js';

const forms = {
    'author': _src, 'citation': _src, 'interaction': _int, 'location': _loc,
    'publication': _src, 'publisher': _src, 'taxon': _txn, 'subject': _int, 'object': _int
};

export function createEntity(entity, name) {                                    //console.log('createEntity. args = %O', arguments)
    return forms[entity] === _src ? 
        _src.initCreateForm(entity, name) : forms[entity].initCreateForm(name);    
}
export function initFormCombos(entity, fLvl) {
    forms[entity].initFormCombos(entity, fLvl);
}
/** --------------------------- AUTHOR -------------------------------------- */
/* edit-form, form-ui */
export function selectExistingAuthors() {
    return _src.selectExistingAuthors(...arguments);
}
/** --------------------------- CITATION ------------------------------------ */
export function handleCitText(formLvl) {
    // if (_i.mmry('getFormProp', [formLvl, 'entity']) !== 'citation') { return; }
    _src.handleCitText(formLvl);
}
export function getCitationText(fLvl) {
    return _autoCite.getCitationText(fLvl);
}
/** ------------------------ INTERACTION ------------------------------------ */
export function fillCitationField() {
    _int.fillCitationField(...arguments);
}
export function selectIntLoc(id) {
    _int.selectLoc(id);
}
export function enableCountryRegionField() {
    _int.enableCountryRegionField();
}
/** --------------------------- LOCATION ------------------------------------ */
export function addMapToLocationEditForm() {
    return _loc.addMapToLocationEditForm(...arguments);
}
export function addMapToLocForm(elem, mapType) {
    return _loc.addMapToLocForm(elem, mapType);
}
export function focusParentAndShowChildLocs(mapType, val) {
    return _loc.focusParentAndShowChildLocs(mapType, val);
}
export function addNewLocationWithGps() {
    _loc.addNewLocationWithGps();
}
/** ------------------------ TAXON ------------------------------------------ */
export function initNewTaxonForm(level, val) {
    return _txn.initCreateForm(level, val);
}
export function getSelectedTaxon() {
    return _int.getSelectedTaxon();
}
/** ------------------------ SOURCE TYPES ----------------------------------- */
export function getSrcTypeRows(entity, typeId, fLvl, type) {
    return _src.getSrcTypeRows(entity, typeId, fLvl, type)
}
export function handleSpecialCaseTypeUpdates(elem, fLvl) {
    _src.handleSpecialCaseTypeUpdates(elem, fLvl);
}
export function loadSrcTypeFields(subEntity, typeId, elem, typeName) {
    return _src.loadSrcTypeFields(subEntity, typeId, elem, typeName);
}
export function onSrcToggleFields() {
    _src.finishSourceToggleAllFields(...arguments);
}