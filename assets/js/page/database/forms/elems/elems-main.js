/**
 * Sub-forms, form rows, field elements, etc.
 *
 * TOC
 *     SUB-EXECUTOR
 *     STRUCTURE
 *         ROOT-FORM
 *         SUB-FORM
 *         FOOTER
 *         SUBMIT|EXIT BUTTON
 *         FORM-STATUS MESSAGES
 *     FIELDS
 *         COMPLETE FIELDS
 *         COMBOBOXES
 *         REQUIRED FIELDS
 *         FILL FORM-DATA
 *         TOGGLE FORM-FIELDS
 */
import { _el, executeMethod } from '~util';
import { _state, getNextFormLevel } from '../forms-main.js';
import * as footer from './footer/form-footer.js';
import * as row from './row/form-row-main.js';
import * as cntnr from './container/form-container-main.js';
import * as elemUtil from './util/form-elems-util-main.js';
import * as panel from './detail-panel/detail-panel.js';
import * as fields from './field/form-fields-main.js';
/* -------------------- SUB-EXECUTOR ---------------------------------------- */
export function _panel(funcName, params = []) {
    return executeMethod(funcName, panel, 'panel', 'elems-main', params);
}
/* =================== STRUCTURE ============================================ */
/* ---------------------------- ROOT-FORM ----------------------------------- */
export function buildAndAppendRootForm() {
    return cntnr.buildAndAppendRootForm(...arguments);
}
export function exitRootForm() {
    cntnr.exitRootForm(...arguments);
}
/* ---------------------------- SUB-FORM ------------------------------------ */
export function getSubForm() {
    return cntnr.getSubForm(...arguments);
}
/** Returns true if the next sub-rank form exists in the dom. */
export function hasOpenSubForm(fLvl) {
    const childFormLvl = getNextFormLevel('child', fLvl);
    return $('#'+childFormLvl+'-form').length > 0;
}
export function exitSubForm(fLvl, focus, onExit, data) {
    cntnr.exitSubForm(fLvl, focus, onExit, data);
    ifParentFormValidEnableSubmit(fLvl);
}
/* ------------------------------ FOOTER ------------------------------------ */
export function getFormFooter() {
    return footer.getFormFooter(...arguments);
}
/* --------------------------- SUBMIT|EXIT BUTTON --------------------------- */
export function getExitButton() {
    return cntnr.getExitButton();
}
export function toggleSubmitBttn() {
    return elemUtil.toggleSubmitBttn(...arguments);
}
/** Enables the parent form's submit button if all required fields have values. */
export function ifParentFormValidEnableSubmit(fLvl) {
    const parentLvl = getNextFormLevel('parent', fLvl);
    checkReqFieldsAndToggleSubmitBttn(parentLvl);
}
export function checkReqFieldsAndToggleSubmitBttn(fLvl) {
    const reqFieldsFilled = ifNoOpenSubFormAndAllRequiredFieldsFilled(fLvl);
    toggleSubmitBttn('#'+fLvl+'-submit', reqFieldsFilled);
    return reqFieldsFilled;
}
/* --------------------- FORM-STATUS MESSAGES ------------------------------- */
/** Shows a form-submit success message at the top of the interaction form. */
export function showSuccessMsg() {
    elemUtil.showSuccessMsg(...arguments);
}
export function exitSuccessMsg() {
    elemUtil.exitSuccessMsg(...arguments);
}
/* ============================== FIELDS ==================================== */
/* ------------------------- COMPLETE FIELDS -------------------------------- */
export function getFormRows(entity, fVals, fLvl) {
    const rowCntnr = cntnr.getRowContainer(entity, fLvl)
    return row.getFormRows(entity, fVals, fLvl, rowCntnr);
}
export function getFormFieldRows() {
    return row.getFormFieldRows(...arguments);
}
export function setDynamicFormStyles() {
    fields.setDynamicFieldStyles(...arguments);
}
export function buildFormField(fConfg) {
    return _el('getFieldInput', [fConfg])
        .then(fields.buildFormField);
}
/* -------------------------- COMBOBOXES ------------------------------------ */
export function initFormCombos() {
    return fields.initFormCombos(...arguments);
}
export function resetFormCombobox() {
    return fields.resetFormCombobox(...arguments);
}
export function buildMultiSelectInput() {
    return fields.buildMultiSelectInput(...arguments);
}
/* -------------------- REQUIRED FIELDS ------------------------------------- */
export function ifAllRequiredFieldsFilled() {
    return fields.ifAllRequiredFieldsFilled(...arguments);
}
export function ifNoOpenSubFormAndAllRequiredFieldsFilled(fLvl) {
    return fields.ifAllRequiredFieldsFilled(fLvl) && !hasOpenSubForm(fLvl);
}
/*---------------------- FILL FORM-DATA --------------------------------------*/
export function fillComplexFormFields() {
    return fields.fillComplexFormFields(...arguments);
}
export function ifFieldIsDisplayed(field, fLvl) {
    return !!_state('getFormFieldData', [fLvl, field]);
}
/* -------------------- TOGGLE FORM-FIELDS ---------------------------------- */
export function ifMutlipleDisplaysGetToggle() {
    return fields.ifMutlipleDisplaysGetToggle(...arguments);
}