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
import { _state } from '../forms-main.js';
import * as core from './core/elems-core-main.js';
import * as row from './row/form-row-main.js';
import * as eUtil from './util/form-elems-util-main.js';
import * as panel from './core/detail-panel/detail-panel.js';
import * as fields from './field/form-fields-main.js';
/* -------------------- SUB-EXECUTOR ---------------------------------------- */
export function _panel(funcName, params = []) {
    return executeMethod(funcName, panel, 'panel', 'elems-main', params);
}
/* =================== STRUCTURE ============================================ */
/* ---------------------------- ROOT-FORM ----------------------------------- */
export function initForm() {
    return core.initForm(...arguments);
}
export function exitRootForm() {
    core.exitRootForm(...arguments);
}
/* ---------------------------- SUB-FORM ------------------------------------ */
export function initSubForm(params) {
    return core.initSubForm(...arguments);
}
/** Returns true if the next sub-rank form exists in the dom. */
export function hasOpenSubForm(fLvl) {
    const childFormLvl = _state('getFormLevel', ['child', fLvl]);
    return $('#'+childFormLvl+'-form').length > 0;
}
export function exitSubForm(fLvl, focus, onExit, data) {
    core.exitSubForm(fLvl, focus, onExit, data);
    ifParentFormValidEnableSubmit(fLvl);
}
/* --------------------------- SUBMIT|EXIT BUTTON --------------------------- */
export function getExitButton() {
    return core.getExitButton();
}
export function toggleSubmitBttn() {
    return eUtil.toggleSubmitBttn(...arguments);
}
/** Enables the parent form's submit button if all required fields have values. */
export function ifParentFormValidEnableSubmit(fLvl) {
    const parentLvl = _state('getFormLevel', ['parent', fLvl]);
    checkReqFieldsAndToggleSubmitBttn(parentLvl);
}
export function checkReqFieldsAndToggleSubmitBttn(fLvl, entity = false) {   /*dbug-log*///console.log('--checkReqFieldsAndToggleSubmitBttn fLvl?[%s] entity?[%s]', fLvl, entity);
    if (!fLvl) { fLvl = _state('getEntityFormLevel', [entity]); }
    const reqFieldsFilled = ifNoOpenSubFormAndAllRequiredFieldsFilled(fLvl);
    toggleSubmitBttn(fLvl, reqFieldsFilled);
    return reqFieldsFilled;
}
/* --------------------- FORM-STATUS MESSAGES ------------------------------- */
export function toggleFormStatusMsg() {
    eUtil.toggleFormStatusMsg(...arguments);
}
/* ============================== FIELDS ==================================== */
/* ------------------------- COMPLETE FIELDS -------------------------------- */
export function getFormRows(entity, fLvl) {
    return row.getFormRows(entity, fLvl);
}
export function getFormFieldRows() {
    return row.getFormFieldRows(...arguments);
}
export function finishFieldRebuild(fLvl, entity) {
    const initCombos = _state('getFormState', [fLvl, 'initCombos']);
    core.finishFormBuild(initCombos, entity);
}
export function setDynamicFormStyles() {
    fields.setDynamicFieldStyles(...arguments);
}
export function buildFormField() {
    return fields.buildFormField(...arguments);
}
export function onFormConfgChanged(fLvl, entity) {
    toggleSubmitBttn(fLvl, false);
    return fields.rebuildFieldsOnFormConfgChanged(fLvl, entity);
}
/* -------------------------- COMBOBOXES ------------------------------------ */
export function initFormCombos() {
    return fields.initFormCombos(...arguments);
}
export function resetFormCombobox() {
    return fields.resetFormCombobox(...arguments);
}
export function buildDynamicFormField() {
    return fields.buildDynamicFormField(...arguments);
}
export function setSilentVal() {
    fields.setSilentVal(...arguments);
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
    return _state('getFieldState', [fLvl, field, 'shown']);
}
/* -------------------- TOGGLE FORM-FIELDS ---------------------------------- */
export function ifMutlipleDisplaysGetToggle() {
    return fields.ifMutlipleDisplaysGetToggle(...arguments);
}