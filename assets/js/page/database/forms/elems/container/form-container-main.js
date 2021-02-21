/**
 * Initiates and appends the main entity form.
 * TOC
 *     BUILD FORM
 *     EXIT FORM
 */
import * as build from './build-form.js';
import * as row from './form-row-container.js';
import * as exit from './exit-form.js';
/* ============================= BUILD FORM ================================= */
export function buildAndAppendRootForm() {
    build.buildAndAppendRootForm(...arguments);
    return Promise.resolve();
}
export function getExitButton(fields, id) {
    return build.getExitButton(...arguments);
}
export function getSubForm(fields, id) {
    return build.getSubForm(...arguments);
}
/* =============================== ROW ====================================== */
export function getRowContainer() {
    return row.getRowContainer(...arguments);
}
/* ============================== EXIT FORM ================================= */
/**
 * Removes the form container with the passed id, clears and enables the combobox,
 * and contextually enables to parent form's submit button. Calls the exit
 * handler stored in the form's params object.
 */
export function exitSubForm() {
    exit.exitSubForm(...arguments);
}
/** Returns popup and overlay to their original/default state. */
export function exitRootForm() {
    exit.exitRootForm(...arguments);
}