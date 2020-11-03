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
 *         REQUIRED FIELDS
 *         FILL FORM-DATA
 *         TOGGLE FORM-FIELDS
 */
import { _u, executeMethod } from '~db';
import { _state, getNextFormLevel } from '../forms-main.js';
import * as panel from './detail-panel/detail-panel.js';
import * as base from './form-container.js';
import * as rows from './rows/rows-main.js';
import buildFormFooter from './footer/form-footer.js';
import * as elemUtil from './util/form-elems-util-main.js';

import * as cmbx from './rows/fields/input/combobox-input.js';
/* -------------------- SUB-EXECUTOR ---------------------------------------- */
export function _cmbx(funcName, params = []) {
    if (cmbx[funcName]) {
        return executeMethod(funcName, cmbx, 'db-cmbx', 'elems-main', params);
    }
    _u('_dbCmbx', [funcName, [...params]]);
}
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
export function buildFieldInput() {
    return rows.buildFieldInput(...arguments);
}
/* -------------------- REQUIRED FIELDS ------------------------------------- */
export function ifAllRequiredFieldsFilled() {
    return rows.ifAllRequiredFieldsFilled(...arguments);
}
export function ifNoOpenSubFormAndAllRequiredFieldsFilled(fLvl) {
    return rows.ifAllRequiredFieldsFilled(fLvl) && !hasOpenSubForm(fLvl);
}
/*---------------------- FILL FORM-DATA --------------------------------------*/
export function getCurrentFormFieldVals(fLvl) {
    return rows.getCurrentFormFieldVals(fLvl);
}
export function fillComplexFormFields(fLvl) {
    return rows.fillComplexFormFields(fLvl);
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