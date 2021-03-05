/**
 * Author-form code.
 * When a user enters a new author|editor into the combobox, the create form is built
 * and appended to the field's row. When an author is selected, a new author combobox
 * is initialized underneath the last author combobox, unless the last is empty.
 *
 * Export (External use)
 *     initAuthOrEdForm
 *     onAuthAndEdSelection
 *     selectExistingAuthsOrEds
 *
 * TOC
 *     BUILD FORM
 *     SELECT AUTHORS|EDITORS
 *     ON FIELD CHANGE
 *     DYNAMIC FIELDS
 *     INTERNAL HELPERS
 */
import { _cmbx } from '~util';
import * as build from './auth-form-build.js';
import * as update from './on-auth-change.js';
import * as fill from './auth-field-fill.js';
import * as field from './auth-dynamic-build.js';
/* ========================= BUILD FORM ===================================== */
export function initAuthOrEdForm() {
    return build.initAuthOrEdForm(...arguments);
}
/* =================== SELECT AUTHORS|EDITORS =============================== */
/** Loops through author object and adds each author/editor to the form. */
export function selectExistingAuthsOrEds() {
    return fill.selectExistingAuthsOrEds(...arguments);
}
/* ========================= ON FIELD CHANGE ================================ */
export function onAuthAndEdSelection() {
    update.onAuthAndEdSelection(...arguments);
}
/* _____________________ INTERNAL HELPERS ___________________________________ */
export function buildNewAuthorSelect() {
    return field.buildNewAuthorSelect(...arguments);
}
export function removeAuthField() {
    return field.removeAuthField(...arguments);
}
export function isDynamicFieldEmpty(aType, cnt) {                     /*dbug-log*///console.log('isDynamicFieldEmpty [%s][%s]', aType, cnt);
    return !_cmbx('getSelVal', [aType+cnt]);
}
export function enableOtherField() {
    update.enableOtherField(...arguments);
}
export function ifNoneStillSelectedEnableOtherType() {
    update.ifNoneStillSelectedEnableOtherType(...arguments);
}
