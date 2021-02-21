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
import * as base from './form-container/form-container-main.js';
import * as elemUtil from './util/form-elems-util-main.js';
import * as panel from './detail-panel/detail-panel.js';
import * as fields from './fields/form-fields-main.js';
/* -------------------- SUB-EXECUTOR ---------------------------------------- */
export function _panel(funcName, params = []) {
    return executeMethod(funcName, panel, 'panel', 'elems-main', params);
}
/* =================== STRUCTURE ============================================ */
/* ---------------------------- ROOT-FORM ----------------------------------- */
export function buildAndAppendRootForm() {
    return base.buildAndAppendRootForm(...arguments);
}
export function exitRootForm() {
    base.exitRootForm(...arguments);
}
/* ---------------------------- SUB-FORM ------------------------------------ */
export function getSubForm() {
    return base.getSubForm(...arguments);
}
/** Returns true if the next sub-rank form exists in the dom. */
export function hasOpenSubForm(fLvl) {
    const childFormLvl = getNextFormLevel('child', fLvl);
    return $('#'+childFormLvl+'-form').length > 0;
}
export function exitSubForm(fLvl, focus, onExit, data) {
    base.exitSubForm(fLvl, focus, onExit, data);
    ifParentFormValidEnableSubmit(fLvl);
}
/* ------------------------------ FOOTER ------------------------------------ */
export function getFormFooter() {
    return footer.getFormFooter(...arguments);
}
/* --------------------------- SUBMIT|EXIT BUTTON --------------------------- */
export function getExitButton() {
    return base.getExitButton();
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
export function getFormRows() {
    return fields.getFormRows(...arguments);
}
export function getFormFieldRows() {
    return fields.getFormFieldRows(...arguments);
}
export function setCoreRowStyles() {
    fields.setCoreRowStyles(...arguments);
}
export function buildFormField(fConfg) {
    return _el('getFieldInput', [fConfg])
        .then(fields.buildFormField.bind(null, fConfg));
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
export function getCurrentFormFieldVals() {
    return fields.getCurrentFormFieldVals(...arguments);
}
export function fillComplexFormFields() {
    return fields.fillComplexFormFields(...arguments);
}
export function ifFieldIsDisplayed(field, fLvl) {
    return !!_state('getFormFieldData', [fLvl, field]);
}
/* -------------------- TOGGLE FORM-FIELDS ---------------------------------- */
export function setToggleFieldsEvent(elem, entity, fLvl) {
    $(elem).click(handleToggleFields);

    function handleToggleFields() {
        if (ifOpenSubForm(fLvl)) { return showOpenSubFormAlert(fLvl); }
        const fVals = getCurrentFormFieldVals(fLvl);
        fields.toggleFormFields(entity, fLvl, fVals);
    }
}/** Returns true if the next sub-rank form exists in the dom. */
function ifOpenSubForm(fLvl) {
    const childFormLvl = getNextFormLevel('child', fLvl);
    return $('#'+childFormLvl+'-form').length > 0;
}