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
import { _cmbx, _u } from '~util';
import { _state, _elems, _panel } from '~form';
import * as iForm from '../int-form-main.js';

let fields;

export function resetInteractionForm() {
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
    fields = _state('getFormState', ['top', 'fields']);             /*dbug-log*///console.log('--resetInteractionForm fields[%O]', fields);
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
    if (field.name === 'InteractionTags') { return handleClearedTags(field); }
    clearFieldValue(field);
    if (field.name === 'Note') { return $('#Note_f .f-input').val(""); }
    _cmbx('resetCombobox', [field.name]);
    handleClearedField(field);
    _panel('clearFieldDetails', [field.name]);
}
function clearFieldValue(field) {
    $(`#${field.name}_pin`).prop('checked', false);
    field.value = null;
}
function handleClearedTags(field) {
    const typeTags = fields.InteractionTags.misc.typeTags;
    const clear = fields.InteractionTags.misc.defaultTags;          /*dbug-log*///console.log('--handleClearedTags current[%O] tags[%O]', _u('snapshot', [field.value]), clear);
    const nTags = field.value.filter(i => !clear.find(t => t.value == i));/*dbug-log*///console.log('   new tags[%O]', nTags);
    field.value = typeTags && typeTags.length > 1 ? [] : nTags;
    _cmbx('setSelVal', [field.name, field.value, 'silent']);
}
function handleClearedField(field) {
    const map = {
        InteractionType: clearTypeAndTags,
        Location: syncWithCountryField,
        Object: clearTaxonField,
        Publication: iForm.clearCitationCombo,
        Subject: clearTaxonField,
    }
    if (!map[field.name]) { return; }
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