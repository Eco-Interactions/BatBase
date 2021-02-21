/**
 * Builds and manages the form fields.
 *
 * Export
= *    buildMultiSelectInput
 *     fillComplexFormFields
 *     ifAllRequiredFieldsFilled
 *     initFormCombos
 *     resetFormCombobox
 *     toggleFormFields
 *
 * TOC
 *     INIT FORM-FIELDS
 *         BUILD FIELD-ROWS
 *     TOGGLE FORM-FIELDS
 *     GET FIELD-DATA
 *     SET FORM-FIELD DATA
 *     IF REQUIRED FIELDS FILLED
 */
import { _el } from '~util';
import * as build from './build-field.js';
import * as combo from './combo-field.js';
import * as fill from './complex-fields.js';
import * as style from './style-field.js';
import * as toggle from './toggle-fields.js';
import * as req from './required-fields.js';

/* ======================== FORM COMBOS ===================================== */
export function resetFormCombobox() {
    combo.resetFormCombobox(...arguments);
}
export function setSilentVal() {
    combo.setSilentVal(...arguments);
}
export function initFormCombos() {
    combo.initFormCombos(...arguments);
}
/* ==================== INIT FORM-FIELDS ================================== */
export function buildFormField() {
    return build.buildFormField(...arguments);
}
export function buildMultiSelectInput() {
    const input = _el('buildMultiSelectInput', [...arguments]);
    build.setOnMultiSelectChangeListener(input);
    return input;
}
export function setDynamicFieldStyles() {
    style.setDynamicFieldStyles(...arguments);
}
/* ------------------- BUILD FIELD-ROWS ------------------------------------- */
export function getFormFieldRows() {
    return row.getFormFieldRows(...arguments);
}
export function getFormRows() {
    return row.getFormRows(...arguments);
}
/* ==================== TOGGLE FORM-FIELDS ================================== */
export function toggleFormFields() {
    return toggle.toggleFormFields(...arguments);
}
/* =================== SET FORM-FIELD DATA ================================== */
/**
 * When either source-type fields are regenerated or the form fields are toggled
 * between all available fields and the default shown, the fields that can
 * not be reset as easily as simply setting a value in the form input during
 * reinitiation are handled here.
 */
export function fillComplexFormFields() {
    return fill.fillComplexFormFields(...arguments);
}
/* ================== IF REQUIRED FIELDS FILLED ============================= */
/** Returns true if all the required elements for the current form have a value. */
export function ifAllRequiredFieldsFilled(fLvl) {
    return req.ifAllRequiredFieldsFilled(...arguments);
}