/**
 * Entry point for all entity specific form methods.
 *
 *
 * Exports:             Imported by: 
 *     createSubEntity          interaction-form, db-forms
 *     finishTaxonSelectUi      interaction-form
 *     getFormFields            interaction-form
 *     getSrcTypeRows           edit-forms
 *     getSubFormLvl            interaction-form
 *     handleSpecialCaseTypeUpdates         edit-forms
 *     handleCitText            form-elems
 *     initEntitySubForm        interaction-form
 *     initEntityFormMemory     interaction-form, edit-forms
 *     setOnSubmitSuccessHandler    interaction-form
 *     
 */
import * as _u from '../../util.js';
import * as _mmry from './etc/form-memory.js';
import * as db_forms from '../db-forms.js';
import * as form_util from './etc/form-util.js';
import * as _int from './entity/interaction-form.js';
import * as _loc from './entity/location-form.js';
import * as _src from './entity/source-forms.js';
import * as _txn from './entity/taxon-form.js';
import * as _ui from './ui/form-ui-main.js';

const forms = {
        'author': _src, 'citation': _src, 'interaction': _int, 'location': _loc,
        'publication': _src, 'publisher': _src, 'taxon': _txn
    };

/** -------------------  DATABASE PAGE UTILITY ------------------------------ */
export function pgUtil(funcName, params) {
    return _u[funcName](...params);
}
/** -------------------  FORM UTILITY ------------------------------ */
export function util(funcName, params) {
    return form_util[funcName](...params);
}
/** --------------------------- FORM UI ---------------------------------- */
// export function ui(funcName, params) {
//     return _ui[funcName](...params);
// }
export function uiElems(funcName, params) {
    return _ui.elems(funcName, params);
}
export function uiCombos(funcName, params) {
    return _ui.combos(funcName, params);
}
export function uiPanel(funcName, params) {
    return _ui.panel(funcName, params);
}
/** ------------------------ STATE MANAGMENT -------------------------------- */
// How to call a function with the string name passed? Including all methods seems super redundant
export function memory(funcName, params) {
    return _mmry[funcName](...params);
}
export function initFormMemory(action, entity, id) {
    return _mmry.initFormMemory(action, entity, id);
}
export function initEntityFormMemory(entity, level, pSel, action) {
    return _mmry.initEntityFormMemory(entity, level, pSel, action)
}
export function setOnSubmitSuccessHandler(formField, fLvl) {
    const hndlrs = {
        'location': _int.enableCountryRegionField,
        'object': _int.enableTaxonCombos,
        'subject': _int.enableTaxonCombos,
        'taxon': _txn.enableTaxonLvls
    };
    _mmry.setOnSubmitSuccessHandler(fLvl, hndlrs[formField]);
}
export function getFormMemory() {
    return _mmry.getAllFormMemory();
}
/** ------------------------ INIT FORMS ------------------------------------- */
export function initNewDataForm() {
    _int.initNewInteractionForm();
}
export function createSubEntity(ent, cnt) {
    const entity = ent == 'Citation' ? 'CitationTitle' : ent;
    const selId = cnt ? '#'+entity+'-sel'+cnt : '#'+entity+'-sel';
     $(selId)[0].selectize.createItem('create'); 
}
export function initEntitySubForm(entity, fLvl, fClasses, fVals, pSel) {
    initEntityFormMemory(entity, fLvl, pSel, 'create');        
    return _elems.initSubForm(fP, fLvl, fClasses, fVals, pSel);
}
/** --------- ON FORM INIT COMPLETE ------------- */
export function onFormInitComplete(entity) {
    forms[entity].onInitComplete();
}
/** --------- EXIT HANDLERS ------------- */
// edit form default handler: form_ui.exitFormPopup
export function onFormSubmitSuccess(entity, action) {
    const defaultHandlr = action === 'edit' ? form_ui.exitFormPopup : Function.prototype;
    return forms[entity].onSubmitSuccess || defaultHandlr; 
}
export function submitForm(formId, fLvl, entity) {
    db_forms.getFormValuesAndSubmit(formId, fLvl, entity);
}
/** ------------------------ FORM ELEMENTS ---------------------------------- */
export function getFormFields(entity, params) {
    const map = {
        'interaction': _int.getIntFormFields
    };
    return map[entity](params);
}
/** ------------------------ FORM SPECIFIC ---------------------------------- */
export function finishTaxonSelectUi(role) {
    _txn.finishTaxonSelectUi(role);
}
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
export function selectInteractionLocation(id) {
    _int.selectLoc(id);
}
export function getFormFunc(entity, funcName) {
    return forms[entity][funcName];
}
export function newCitation() {
    return _src.initCitForm();
}
/** --------------------------- HELPERS ------------------------------------- */
/** Returns the 'next' form level- either the parent or child. */
export function getNextFormLevel(next, curLvl) {
    return _fUtil.getNextFormLevel(next, curLvl);
}
export function getSubFormLvl(intFormLvl) {  
    return _fUtil.getSubFormLvl(intFormLvl);
}

export function getComboboxEvents(entity) {
    return forms[entity].getComboEvents(entity);
}

export function onCitSelection(val) {
    _int.onCitSelection(val);
}