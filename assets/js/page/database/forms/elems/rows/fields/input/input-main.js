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
    field.class = getFieldClass(fLvl)
    return isComboField(field) ?
        buildCombobox(...arguments) : basic.buildFieldInput(...arguments);
}
function getFieldClass(fLvl) {
    return {
        top: 'lrg-field', sub: 'med-field', sub2: 'med-field'
    }[fLvl];
}
/* ----------------------------- COMBOBOX ----------------------------------- */
function isComboField(field) {
    const comboTypes = ['select', 'multiSelect', 'tags'];
    return comboTypes.indexOf(field.type) !== -1;
}
function buildCombobox(field, entity, fLvl) {
    return combo.buildComboInput(field, entity, fLvl);
}
export function buildMultiSelectElem(entity, fieldName, fLvl, cnt) {
    const field = { class: getFieldClass(fLvl), name: fieldName };
    return combo.buildMultiSelectElem(entity, field, fLvl, cnt);
}
/* ====================== COMBO UTIL ========================================= */
export function initFormCombos() {
    combo.initFormCombos(...arguments);
}
export function resetFormCombobox() {
    combo.resetFormCombobox(...arguments);
}