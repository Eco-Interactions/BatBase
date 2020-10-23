/**
 *
 *
 * Export
 *
 *
 * TOC
 *
 *
 */
import * as form from './form-container.js';
import * as rows from './rows-main.js';


export function buildAndAppendForm(fields, id) {
    return form.buildAndAppendRootForm(fields, id);
}
export function getExitButton() {
    return form.getExitButton();
}
export function initSubForm() {
    return form.initSubForm(...arguments);
}
export function buildFormRows() {
    return rows.buildFormRows(...arguments);
}
export function getFormFieldRows() {
    return rows.getFormFieldRows(...arguments);
}