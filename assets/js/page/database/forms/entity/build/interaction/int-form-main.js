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
 *     MODULE INTERNAL-USAGE
 *         CREATE SUB-ENTITY
 *             IF OPEN SUB-FORM ISSUE
 *         FORM-FIELD HELPERS
 *             PUBLICATION
 *             LOCATION
 *             SUBJECT|OBJECT
 *         HELPERS
 */
import { _u } from '~util';
import { _state, _elems, _val } from '~form';
import * as build from './build/int-build-main.js';
import * as fields from './fields/int-fields-main.js';
/** ======================= BUILD FORM ====================================== */
export function initCreateForm() {
    return build.initCreateForm(...arguments);
}
export function initEditForm(entity, id) {
    return build.initEditForm(...arguments);
}
export function clearFormMemory() {
    fields.clearFormFieldModuleMemory();
}
/** ------------------ FORM COMBOBOXES -------------------------------------- */
export function initCombos(entity) {
    const events = fields.getIntComboConfg();
    _elems('initFormCombos', ['top', events]);
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
/* *********************** MODULE INTERNAL-USAGE **************************** */
export function resetInteractionForm() {                            /*dbug-log*///console.log('resetInteractionForm')
    return build.resetInteractionForm();
}
/** ====================== FORM-FIELD FACADE ================================ */
/* ------------------------ PUBLICATION ------------------------------------- */
export function clearCitationCombo() {
    fields.clearCitationCombo();
}
/* -------------------------- LOCATION -------------------------------------- */
export function resetLocCombo() {
    return fields.resetLocCombo(...arguments);
}
export function addLocationSelectionMethodsNote() {
    return fields.addLocationSelectionMethodsNote(...arguments);
}
/* --------------------- SUBJECT|OBJECT ------------------------------------- */
export function selectFieldTaxon() {
    return fields.selectFieldTaxon(...arguments);
}
export function buildOptAndUpdateCombo() {
    return fields.buildOptAndUpdateCombo(...arguments);
}
export function onTaxonFieldSelection() {
    return fields.onTaxonFieldSelection(...arguments);
}
export function addRoleTaxonFocusListeners() {
    return fields.addRoleTaxonFocusListeners(...arguments);
}
export function enableTaxonFieldCombos() {
    return fields.enableTaxonFieldCombos(...arguments);
}
/* --------------------- INTERACTION TYPE ----------------------------------- */
export function initTypeFieldIfBothTaxonRolesFilled() {
    return fields.initTypeFieldIfBothTaxonRolesFilled();
}
export function initTypeField() {
    return fields.initTypeField(...arguments);
}
export function onTypeSelection() {
    fields.onTypeSelection(...arguments);
}
export function setTypeEditVal() {
    return fields.setTypeEditVal(...arguments);
}
/* --------------------------- TAGS ----------------------------------------- */
export function clearTypeTagData() {
    return fields.clearTypeTagData(...arguments);
}
export function initTagField() {
    return fields.initTagField(...arguments);
}
export function loadInteractionTypeTags() {
    return fields.loadInteractionTypeTags(...arguments);
}
/* ========================== HELPERS ======================================= */
export function focusPinAndEnableSubmitIfFormValid(field) {
    checkIntFieldsAndEnableSubmit();
    if (_state('isEditForm', ['top'])) { return; }
    $('#'+field+'_pin').focus();
}
/**
 * After the interaction form is submitted, the submit button is disabled to
 * eliminate accidently creating duplicate interactions. As soon as any change
 * happens in the form, the success message is removed and the 'unchanged' flag removed.
 */
function checkIntFieldsAndEnableSubmit() {                          /*dbug-log*///console.log('--checkIntFieldsAndEnableSubmit')
    _elems('checkReqFieldsAndToggleSubmitBttn', ['top']);
    resetIfFormWaitingOnChanges();
}
function resetIfFormWaitingOnChanges() {                            /*dbug-log*///console.log('--resetIfFormWaitingOnChanges')
    if (!_state('getFormState', ['top', 'unchanged'])) { return; }  /*dbug-log*///console.log('--resetting')
    _elems('toggleFormStatusMsg', [false]);
    _state('setFormState', ['top', 'unchanged', false]);
}