/**
 * Sub-forms, form rows, field elements, etc.
 *
 * TOC
 *     SUB-EXECUTOR
 *     STRUCTURE
 *         ROOT-FORM
 *         SUB-FORM
 *         ROWS
 *         FOOTER
 *         SUBMIT|EXIT BUTTON
 *         FORM-STATUS MESSAGES
 *     FIELDS
 *         COMBOBOXES
 *         REQUIRED FIELDS
 *         FILL FORM-DATA
 *         TOGGLE FORM-FIELDS
 */
import { executeMethod } from '~util';
import { _state, getNextFormLevel } from '../forms-main.js';
import buildFormFooter from './footer/form-footer.js';
import * as base from './form-container.js';
import * as elemUtil from './util/form-elems-util-main.js';
import * as panel from './detail-panel/detail-panel.js';
import * as rows from './rows/rows-main.js';
/* -------------------- SUB-EXECUTOR ---------------------------------------- */
export function _panel(funcName, params = []) {
    return executeMethod(funcName, panel, 'panel', 'elems-main', params);
}
/* =================== STRUCTURE ============================================ */
/* ---------------------------- ROOT-FORM ----------------------------------- */
export function buildAndAppendRootForm(fields, id) {
    return base.buildAndAppendRootForm(fields, id);
}
export function exitRootForm() {
    elemUtil.exitRootForm(...arguments);
}
/* ---------------------------- SUB-FORM ------------------------------------ */
export function initSubForm() {
    return base.initSubForm(...arguments);
}
/** Returns true if the next sub-rank form exists in the dom. */
export function hasOpenSubForm(fLvl) {
    const childFormLvl = getNextFormLevel('child', fLvl);
    return $('#'+childFormLvl+'-form').length > 0;
}
export function exitSubForm(fLvl, focus, onExit, data) {
    elemUtil.exitSubForm(fLvl, focus, onExit, data);
    ifParentFormValidEnableSubmit(fLvl);
}
/* -------------------------------- ROWS ------------------------------------ */
export function buildFormRows() {
    return rows.buildFormRows(...arguments);
}
export function getFormFieldRows() {
    return rows.getFormFieldRows(...arguments);
}
export function setCoreRowStyles() {
    rows.setCoreRowStyles(...arguments);
}
/* ------------------------------ FOOTER ------------------------------------ */
export function getFormFooter() {
    return buildFormFooter(...arguments);
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
export function getFieldInput() {
    return rows.getFieldInput(...arguments);
}
/* -------------------------- COMBOBOXES ------------------------------------ */
export function initFormCombos() {
    return rows.initFormCombos(...arguments);
}
export function resetFormCombobox() {
    return rows.resetFormCombobox(...arguments);
}
export function buildMultiSelectElem() {
    return rows.buildMultiSelectElem(...arguments);
}
/* -------------------- REQUIRED FIELDS ------------------------------------- */
export function ifAllRequiredFieldsFilled() {
    return rows.ifAllRequiredFieldsFilled(...arguments);
}
export function ifNoOpenSubFormAndAllRequiredFieldsFilled(fLvl) {
    return rows.ifAllRequiredFieldsFilled(fLvl) && !hasOpenSubForm(fLvl);
}
/*---------------------- FILL FORM-DATA --------------------------------------*/
export function getCurrentFormFieldVals() {
    return rows.getCurrentFormFieldVals(...arguments);
}
export function fillComplexFormFields() {
    return rows.fillComplexFormFields(...arguments);
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
        rows.toggleFormFields(entity, fLvl, fVals);
    }
}/** Returns true if the next sub-rank form exists in the dom. */
function ifOpenSubForm(fLvl) {
    const childFormLvl = getNextFormLevel('child', fLvl);
    return $('#'+childFormLvl+'-form').length > 0;
}