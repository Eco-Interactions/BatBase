/**
 * Builds form inputs and manages form combboboxes.
 *
 * Export
 *     getFieldInput
 *     buildMultiSelectElem
 *     initFormCombos
 *     resetFormCombobox
 *
 * TOC
 *     GET INPUT
 *     COMBO UTIL
 */
import * as basic from './input-builder.js';
import * as combo from './input-combobox.js';
import * as val from './input-validation.js';
/* ====================== GET INPUT ========================================= */
export function getFieldInput(field, entity, fLvl) {
    return Promise.resolve(getInput(field, entity, fLvl))
        .then(input => basic.finishFieldBuild(input, field, entity, fLvl))
        .then(input => val.handleFieldValidation(input, field, fLvl));
}
function getInput(field, entity, fLvl) {
    return isComboField(field) ?
        buildCombobox(...arguments) : basic.buildFieldInput(...arguments);
}
/* ----------------------------- COMBOBOX ----------------------------------- */
function isComboField(field) {
    const comboTypes = ['select', 'multiSelect', 'tags'];
    return comboTypes.indexOf(field.type) !== -1;
}
function buildCombobox(field, entity, fLvl) {
    return combo.buildComboInput(field.type, entity, field.name, fLvl);
}
export function buildMultiSelectElem() {
    combo.buildMultiSelectElem(...arguments);
}
/* ====================== COMBO UTIL ========================================= */
export function initFormCombos() {
    combo.initFormCombos(...arguments);
}
export function resetFormCombobox() {
    combo.resetFormCombobox(...arguments);
}