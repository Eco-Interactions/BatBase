/**
 * Resets the interactions form leaving only the pinned values. Displays a
 * success message. Disables submit button until any field is changed.
 *
 * Export
 *     resetInteractionForm
 *
 * TOC
 *     RESET FIELD DATA
 *         GET PINNED FIELD-DATA
 *         CLEAR FIELD DATA
 *         HANDLE PERSISTED FIELDS
 *     RESET FORM UI
 */
import { _cmbx } from '~util';
import { _state, _elems, _panel } from '~form';
import * as iForm from '../int-form-main.js';

let fields;

export function resetInteractionForm() {                            /*dbug-log*///console.log('resetInteractionForm')
    _elems('toggleFormStatusMsg', ['New Interaction successfully created.']);
    resetIntFields();
    resetFormUi();
}
/* ==================== RESET FIELD DATA ==================================== */
/**
 * Resets the top-form in preparation for another entry. Pinned field values are
 * persisted. All other fields will be reset.
 */
function resetIntFields() {
    fields = _state('getFormState', ['top', 'fields']);
    Object.values(fields).map(handleFieldDataReset);
}
function handleFieldDataReset(field) {
    if (!field.shown) { return; }
    if (!$(`#${field.name}_pin`).prop('checked')) {
        clearField(field);
    } else {
        handePersistedField(field);
    }
}
/* --------------------- HANDLE PERSISTED FIELDS ---------------------------- */
function handePersistedField(field) {
    const map = {
        Publication: fillPubDetails,
        InteractionType: setFieldInitVal,
        InteractionTags: setFieldInitVal
    }
    if (!map[field.name]) { return; }
    map[field.name](field);
}
function fillPubDetails(pField) {
    _panel('updateSrcDetails', ['pub']);
}
function setFieldInitVal(field) {
    $('#sel-'+field.name).data('init-val', field.value);
}
/* ------------------------ CLEAR FIELD DATA -------------------------------- */
function clearField(field) {
    if (field.name === 'InteractionTags') { return setFieldInitVal(field); }
    field.value = null;
    if (field.name === 'Note') { return $('#Note_f .f-input').val(""); }
    _panel('clearFieldDetails', [field.name]);
    _cmbx('resetCombobox', [field.name]);
    handleClearedField(field);
}
function handleClearedField(field) {
    const map = {
        InteractionType: clearTypeAndTags,
        Location: syncWithCountryField,
        Object: clearTaxonField,
        Publication: iForm.clearCitationCombo,
        Subject: clearTaxonField,
    }
    if (!map[field.name]) { return $(`#${field.name}_pin`).prop('checked', false); }
    map[field.name](field);
}
function clearTypeAndTags(field) {
    iForm.onTypeSelection(null);
}
function clearTaxonField(field) {
    if (['Subject', 'Object'].indexOf(field.name) === -1) { return; }
    _cmbx('replaceSelOpts', [field.name, []]);
    _cmbx('enableCombobox', ['InteractionType', false]);
    $('#sel-'+field.name).data('selTaxon', false);
}
function syncWithCountryField(field) {
    const cntryId = fields['Country-Region'].value;
    const cntry = cntryId ? _state('getRcrd', ['location', cntryId]) : null;
    iForm.resetLocCombo(cntry);
}
/* ==================== RESET FORM UI ======================================= */
function resetFormUi() {
    $('#top-cancel').val(' Close ');
    _elems('toggleSubmitBttn', ['top', false]);
    _state('setFormState', ['top', 'unchanged', true]);
}