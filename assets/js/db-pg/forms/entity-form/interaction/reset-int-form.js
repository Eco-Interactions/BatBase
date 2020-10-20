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
import { _state, _elems, _panel, _cmbx } from '../../forms-main.js';
import * as iForm from './interaction-form-main.js';

export function resetInteractionForm() {                            /*dbug-log*///console.log('resetInteractionForm')
    _elems('showSuccessMsg', ['New Interaction successfully created.']);
    resetIntFields();
    resetFormUi();
    _state('setOnFormCloseHandler', ['top', resetInteractionForm]);
}
/* ==================== RESET FIELD DATA ==================================== */
/**
 * Resets the top-form in preparation for another entry. Pinned field values are
 * persisted. All other fields will be reset.
 */
function resetIntFields() {
    const vals = getPinnedFieldVals();                              /*dbug-log*///console.log("   --resetInFields = %O", vals);
    _elems('toggleSubmitBttn', ['#top-submit', false]);
    handleFieldDataReset(vals);
}
function handleFieldDataReset(vals) {
    const persisted = [];
    handleFieldClearing();
    handlePersistedFields();

    function handleFieldClearing() {
        for (let field in vals) {                                   /*dbug-log*///console.log("field %s val %s", field, vals[field]);
            if (!vals[field]) { clearField(field, vals);
            } else { persisted.push(field); }
        }
    }
    function handlePersistedFields() {
        persisted.forEach(f => handePersistedField(f, vals[f]));
    }
}
/* ------------------ GET PINNED FIELD DATA --------------------------------- */
/** Returns an obj with the form fields and either their pinned values or false. */
function getPinnedFieldVals() {
    const pins = $('form[name="top"] [id$="_pin"]').toArray();
    const vals = {};
    pins.forEach(pin => {
        if (pin.checked) { getFieldVal(pin.id.split("_pin")[0]);
        } else { addFalseValue(pin.id.split("_pin")[0]); }
    });
    return vals;

    function getFieldVal(fieldName) {
        const suffx = fieldName === 'Note' ? '-txt' : '-sel';
        vals[fieldName] = $('#'+fieldName+suffx).val();
    }
    function addFalseValue(fieldName) {
        vals[fieldName] = false;
    }
}
/* ------------------------ CLEAR FIELD DATA -------------------------------- */
function clearField(field, vals) {
    _state('setFormFieldData', ['top', field, null]);
    if (field === 'Note') { return $('#Note-txt').val(""); }
    _panel('clearFieldDetails', [field]);
    _cmbx('clearCombobox', ['#'+field+'-sel']);
    handleClearedField(field, vals);
}
function handleClearedField(field, vals) {
    const map = {
        'Location': syncWithCountryField.bind(null, vals['Country-Region']),
        'Subject': clearTaxonField,
        'Object': clearTaxonField,
        'Publication': iForm.onPubClear
    }
    if (!map[field]) { return; }
    map[field](field);
}
function clearTaxonField(field) {
    if (['Subject', 'Object'].indexOf(field) === -1) { return; }
    _cmbx('updateComboboxOptions', ['#'+field+'-sel', []]);
    $('#'+field+'-sel').data('selTaxon', false);
}
function syncWithCountryField(cntryId, field) {
    const cntry = cntryId ? getRcrd('location', cntryId) : null;
    iForm.fillLocCombo(cntry);
}
/* --------------------- HANDLE PERSISTED FIELDS ---------------------------- */
function handePersistedField(field, data) {
    const map = {
        'Publication': fillPubDetails,
        'InteractionType': setFieldInitVal,
        'InteractionTags': setFieldInitVal
    }
    if (!map[field]) { return; }
    map[field](field, data);
}
function fillPubDetails(pub) {
    if (pub) { _panel('updateSrcDetails', ['pub']);
    } else { _cmbx('enableCombobox', ['#CitationTitle-sel', false]); }
}
function setFieldInitVal(field, data) {
    $(`#${field}-sel`).data('init-val', data);
}
/* ==================== RESET FORM UI ======================================= */
function resetFormUi() {
    $('#top-cancel').val(' Close ');
    _elems('toggleSubmitBttn', ['#top-submit', false]);
    _state('setFormProp', ['top', 'unchanged', true]);
}