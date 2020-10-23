/**
 * Contains code specific to the interaction form. From within many of the fields
 * the editor can create new entities of the field-type by selecting the 'add...'
 * option from the field's combobox and completing the appended sub-form.
 *
 * TOC
 *     BUILD FORM
 *         FORM COMBOBOXES
 *     FORM-FIELD HELPERS
 *         CITATION
 *         LOCATION
 *         SUBJECT|OBJECT
 *     MODULE INTERNAL-USAGE
 *         CREATE SUB-ENTITY
 *             IF OPEN SUB-FORM ISSUE
 *         FORM-FIELD HELPERS
 *             PUBLICATION
 *             LOCATION
 *             SUBJECT|OBJECT
 *         HELPERS
 */
import { _u } from '../../../db-main.js';
import { _state, _elems, _cmbx, _form, _val } from '../../forms-main.js';
import * as build from './build/int-build-main.js';
import * as fields from './fields/int-fields-main.js';
/** ======================= BUILD FORM ====================================== */
export function initCreateForm(entity) {
    return build.initCreateForm();
}
export function finishEditFormBuild(entity) {
    build.finishInteractionFormBuild();
}
/** ------------------ FORM COMBOBOXES -------------------------------------- */
export function initFormCombos(entity) {
    return entity === 'interaction' ? initFormFieldCombos() : fields.initRankCombos();
}
function initFormFieldCombos() {
    const events = fields.getIntFormFieldComboEvents();
    _cmbx('initFormCombos', ['interaction', 'top', events]);
}
/** ====================== FORM-FIELD HELPERS =============================== */
/*------------------ CITATION ------------------------------------------------*/
export function fillCitationCombo() {
    return fields.fillCitationCombo(...arguments);
}
/* ------------------ LOCATION ---------------------------------------------- */
export function selectLoc() {
    return fields.selectLoc(...arguments);
}
/** When the Location sub-form is exited, the Country/Region combo is reenabled. */
export function enableCountryRegionField() {
    return fields.enableCountryRegionField(...arguments);
}
/* -------------- SUBJECT|OBJECT -------------------------------------------- */
export function onRankSelection() {
    fields.onRankSelection.bind(this)(...arguments);
}
export function getSelectedTaxon() {
    return fields.getSelectedTaxon(...arguments);
}
export function onSubGroupSelection() {
    return fields.onSubGroupSelection(...arguments);
}
/* *********************** MODULE INTERNAL-USAGE **************************** */
/* ==================== CREATE SUB-ENTITY =================================== */
export function create(entity, fLvl) {
    return createSubEntity.bind(null, entity, fLvl);
}
export function resetInteractionForm() {                            /*dbug-log*///console.log('resetInteractionForm')
    return build.resetInteractionForm();
}
export function createSubEntity(entity, fLvl, val) {
    if (ifFormAlreadyOpenAtLevel(fLvl)) { return handleOpenSubFormAlert(entity, fLvl); }
    _form('createEntity', [entity, val]);
}
/* ----------------- IF OPEN SUB-FORM ISSUE --------------------------------- */
export function ifFormAlreadyOpenAtLevel(fLvl) {
    return fLvl ? $('#'+fLvl+'-form').length !== 0 : false;
}
export function handleOpenSubFormAlert(entity, fLvl) {
    return openSubFormAlert(entity, fLvl)
    // .catch(() => {});
}
function openSubFormAlert(ent, fLvl) {
    const entity = ent === 'citation' ? 'citationTitle' : ent;
    const ucEntity = _u('ucfirst', [entity]);
    _val('openSubFormAlert', [ucEntity, null, fLvl]);
    // return Promise.reject();
}
/** ====================== FORM-FIELD HELPERS =============================== */
export function initTypeField() {
    return fields.initTypeField(...arguments);
}
/* ------------------------ PUBLICATION ------------------------------------- */
export function onPubClear() {
    fields.onPubClear();
}
/* -------------------------- LOCATION -------------------------------------- */
export function fillLocCombo() {
    return fields.fillLocCombo(...arguments);
}
export function addLocationSelectionMethodsNote() {
    return fields.addLocationSelectionMethodsNote(...arguments);
}
/* --------------------- SUBJECT|OBJECT ------------------------------------- */
export function selectRoleTaxon() {
    return fields.selectRoleTaxon(...arguments);
}
export function onGroupSelection() {
    return fields.onGroupSelection(...arguments);
}
export function onTaxonRoleSelection() {
    return fields.onTaxonRoleSelection(...arguments);
}
export function addRoleTaxonFocusListeners() {
    return fields.addRoleTaxonFocusListeners(...arguments);
}
export function enableRoleTaxonFieldCombos() {
    _cmbx('enableCombobox', ['#Subject-sel']);
    _cmbx('enableCombobox', ['#Object-sel']);
}
function enableTaxonRanks(enable = true) {
    $.each($('#sub-form select'), (i, sel) => {
        _cmbx('enableCombobox', ['#'+sel.id, enable])
    });
}
/* ========================== HELPERS ======================================= */
export function focusPinAndEnableSubmitIfFormValid(field) {
    const editing = _state('getFormProp', ['top', 'action']) === 'edit';
    if (!editing) { $('#'+field+'_pin').focus(); }
    checkIntFieldsAndEnableSubmit();
}
/**
 * After the interaction form is submitted, the submit button is disabled to
 * eliminate accidently creating duplicate interactions. This change event is
 * added to the non-required fields of the form to enable to submit as soon as
 * any change happens in the form, if the required fields are filled. Also
 * removes the success message from the form.
 */
export function checkIntFieldsAndEnableSubmit() {
    _elems('checkReqFieldsAndToggleSubmitBttn', ['top']);
    resetIfFormWaitingOnChanges();
}
/**
 * After an interaction is created, the form can not be submitted until changes
 * are made. This removes the change listeners from non-required elems and the
 * flag tracking the state of the new interaction form.
 */
function resetIfFormWaitingOnChanges() {
    if (!_state('getFormProp', ['top', 'unchanged'])) { return; }
    _elems('exitSuccessMsg');
    _state('setFormProp', ['top', 'unchanged', false]);
}