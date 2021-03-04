/**
 * Publication-form code.
 * When a user enters a new publication into the combobox, the create form is built
 * and appended to the field's row.
 *
 * Export
 *     finishPublicationEditForm
 *     initPubForm
 *     loadPubTypeFields
 *
 * TOC
 *     PUBLICATION CREATE
 *     PUBLICATION-TYPE FIELDS
 *     FINISH EDIT-FORM
 */
import { _cmbx, _el } from '~util';
import { _elems, _form, _panel, _state } from '~form';
import * as sForm from '../../src-form-main.js';
/* -------------------------- PUBLICATION CREATE ---------------------------- */
export function initPubForm(v) {                                    /*perm-log*/console.log('       /--initPubForm [%s]', v);
    if (_form('ifFormInUse', ['sub'])) { return _form('alertInUse', ['sub']); }
    clearCitationFormData();
    _state('addEntityFormState', getPubInitParams(v));
    return buildAndAppendPubForm();
}
function getPubInitParams(v) {
    const val = { Title: v === 'create' ? '' : v };
    return ['publication', 'sub', '#sel-Publication', 'create', val];
}
function clearCitationFormData() {
    _cmbx('resetCombobox', ['CitationTitle']);
    _panel('clearFieldDetails', ['CitationTitle']);
}
function buildAndAppendPubForm() {
    return _elems('getSubForm', ['sub', 'med-sub-form', '#sel-Publication'])
        .then(form => appendPubFormAndFinishBuild(form));
}
function appendPubFormAndFinishBuild(form) {
    $('#CitationTitle_f')[0].parentNode.after(form);
    sForm.initCombos('sub', 'publication');
    sForm.addConfirmationBeforeSubmit('publication', 'sub');
    $('#Title_f input').focus();
    _elems('setDynamicFormStyles', ['publication']);
}
/* --------------------- PUBLICATION-TYPE FIELDS ---------------------------- */
/**
 * Loads the deafult fields for the selected Publication Type. Clears any
 * previous type-fields and initializes the selectized dropdowns.
 */
export function loadPubTypeFields(fLvl, typeId) {                   /*dbug-log*/console.log('   @--loadPubTypeFields [%s] tId[%s]', fLvl, typeId);
    return sForm.loadSrcTypeFields('publication', typeId)
        .then(finishPubTypeFields);

    function finishPubTypeFields() {
        showNoteIfBothEditorAndAuthorFieldsAvailable(fLvl);
        _elems('setDynamicFormStyles', ['publication']);
    }
}
/** Shows the user a note above the author and editor elems. */
function showNoteIfBothEditorAndAuthorFieldsAvailable(fLvl) {
    if (!isBothEditorAndAuthorFieldsAvailable(fLvl)) { return; }
    const note =`<div class="i g";>Note: This publication type can have either authors OR editors.</div>`;
    $(note).insertBefore($('#Author_f-cntnr')[0].parentNode);
}
function isBothEditorAndAuthorFieldsAvailable(fLvl) {
     return _state('areFieldsShown', [fLvl, ['Author', 'Editor']]);
}
/* --------------------- FINISH EDIT-FORM ----------------------------------- */
export function finishPublicationEditForm() {
    showNoteIfBothEditorAndAuthorFieldsAvailable('top');
}