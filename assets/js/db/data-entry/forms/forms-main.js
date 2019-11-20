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
import * as _errs from './validation/form-errors.js'
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
    'publication': _src, 'publisher': _src, 'taxon': _txn, 'subject': _txn, 'object': _txn
};
/** -------------------  DATABASE PAGE UTILITY ------------------------------ */
export function _util(funcName, params = []) {
    return _u[funcName](...params);
}
/** ------------------------  FORM UTILITY ---------------------------------- */
export function util(funcName, params = []) {
    return form_util[funcName](...params);
}
/** ----------------------  ERROR HANDLERS ---------------------------------- */
export function err(funcName, params = []) {
    return _errs[funcName](...params);
}
/** --------------------------- FORM UI ---------------------------------- */
// export function ui(funcName, params) {
//     return _ui[funcName](...params);
// }
export function uiElems(funcName, params = []) {
    return _ui.elems(funcName, params);
}
export function uiCombos(funcName, params = []) {
    return _ui.combos(funcName, params);
}
export function uiPanel(funcName, params = []) {
    return _ui.panel(funcName, params);
}
export function ui(funcName, params = []) {
    return _ui[funcName](...params);
}
/** ------------------------ STATE MANAGMENT -------------------------------- */
// How to call a function with the string name passed? Including all methods seems super redundant
export function memory(funcName, params = []) {
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
    forms.interaction.initCreateForm();
}
export function createSubEntity(ent, cnt) {
    const entity = ent == 'Citation' ? 'CitationTitle' : ent;
    const selId = cnt ? '#'+entity+'-sel'+cnt : '#'+entity+'-sel';
     $(selId)[0].selectize.createItem('create'); 
}
export function initEntitySubForm(entity, fLvl, fClasses, fVals, pSel) {
    _mmry.initEntityFormMemory(entity, fLvl, pSel, 'create');       
    return _ui.elems.initSubForm(fLvl, fClasses, fVals, pSel);
}
export function buildTaxonSelectForm(role, realm, fLvl) {  console.log('-------------buildTaxonSelectForm. args = %O', arguments);
    _mmry.initEntityFormMemory(_u.lcfirst(role), fLvl, '#'+role+'-sel', 'create');
    return _mmry.initTaxonMemory(role, realm)
    .then(() => _ui.elems('initSubForm', [fLvl, 'sml-sub-form', {}, '#'+role+'-sel']));
}
/** --------- ON FORM INIT COMPLETE ------------- */
export function onFormInitComplete(entity) {
    forms[_u.lcfirst(entity)].onInitComplete();
}
/** --------- EXIT HANDLERS ------------- */
// edit form default handler: form_ui.exitFormPopup
export function onFormSubmitSuccess(entity, action) {
    const defaultHandlr = action === 'edit' ? form_ui.exitFormPopup : Function.prototype;
    return forms[_u.lcfirst(entity)].onSubmitSuccess || defaultHandlr; 
}
export function submitForm(formId, fLvl, entity) {
    db_forms.getFormValuesAndSubmit(formId, fLvl, entity);
}
/** ------------------------ FORM ELEMENTS ---------------------------------- */
export function getFormFields(entity, params = []) {
    const map = {
        'interaction': _int.getInteractionFormFields
    };
    return map[entity](params);
}
/** ------------------------ CREATE FORMS ----------------------------------- */
export function create(entity) {
    forms[_u.lcfirst(entity)].initCreateForm(entity);
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
export function callFormFunc(entity, funcName, params = []) {  console.log('args = %O, forms = %O', arguments, forms);
    return forms[entity][funcName](...params);
}
export function getSelectedTaxon() {
    return _txn.getSelectedTaxon();
}
// export function finishIntFormBuild() {
//     _int.finishInteractionFormBuild();
// }
/** --------------------------- HELPERS ------------------------------------- */
/** Returns the 'next' form level- either the parent or child. */
export function getNextFormLevel(next, curLvl) {
    return util('getNextFormLevel', [next, curLvl]);
}
export function getSubFormLvl(intFormLvl) {  
    return util('getSubFormLvl', [intFormLvl]);
}
export function getComboboxEvents(entity) {  console.log('entity = ', entity)
    return forms[entity].getComboEvents();
}


/* ------- sort --------- */
export function getTaxonDisplayName(taxon) { 
    return taxon.level.displayName === 'Species' ? 
        taxon.displayName : taxon.level.displayName +' '+ taxon.displayName;
}
export function getRealmTaxon(realm) {  
    const lvls = { 'Arthropod': 'Phylum', 'Bat': 'Order', 'Plant': 'Kingdom' };
    const realmName = realm || _mmry.getObjectRealm();
    const dataProp = realmName + lvls[realmName] + 'Names'; console.log('dataProp = %O', dataProp)
    return _u.getData(dataProp).then(returnRealmTaxon);
}
function returnRealmTaxon(realmRcrds) { console.log('---realmTaxonRcrds = %O', realmRcrds);
    const realmId = realmRcrds[Object.keys(realmRcrds)[0]]
    return _mmry.getEntityRcrds('taxon')[realmId];  
}


/* ============================ EXIT FORM =================================== */
/** Returns popup and overlay to their original/default state. */
export function exitFormPopup(e, skipReset) {                                   console.log('           --exitFormPopup')
    fP = db_forms.getFormParams();
    hideSearchFormPopup();
    if (!skipReset) { refocusTableIfFormWasSubmitted(); }
    $("#b-overlay").removeClass("form-ovrly");
    $("#b-overlay-popup").removeClass("form-popup");
    $("#b-overlay-popup").empty();
    db_map.clearMemory();
    db_forms.clearFormMemory();
    fP = null;
}
function hideSearchFormPopup() {
    $('#b-overlay').css({display: 'none'});
}
/**
 * If the form was not submitted the table does not reload. Otherwise, if exiting 
 * the edit-forms, the table will reload with the current focus; or, after creating 
 * an interaction, the table will refocus into source-view. Exiting the interaction
 * forms also sets the 'int-updated-at' filter to 'today'.
 */
function refocusTableIfFormWasSubmitted() {                                     //console.log('refocusTableIfFormWasSubmitted. submitFocus = [%s]', fP.submitFocus);
    if (!fP.submitFocus) { return; }
    if (fP.submitFocus == 'int') { return refocusAndShowUpdates(); }   
    db_page.initDataTable(fP.submitFocus);
}
function refocusAndShowUpdates() {                                              //console.log('refocusAndShowUpdates.')
    var focus  = fP.action === 'create' ? 'srcs' : getCurFocus();
    showTodaysUpdates(focus);   
}
function getCurFocus() {
    return db_page.accessTableState().get('curFocus');
}