/**
 * Publication-form code.
 * When a user enters a new publication into the combobox, the create form is built
 * and appended to the field's row.
 *
 * Export
 *     finishPublicationEditForm
 *     initCreateForm
 *     initEditForm
 *     loadPubTypeFields
 *
 * TOC
 *     INIT FORM
 *         CREATE
 *         EDIT
 *         SHARED
 *     PUBLICATION-TYPE FIELDS
 *         SHOW NOTE
 *     FINISH BUILD
 */
import { _cmbx, _el } from '~util';
import { _elems, _form, _panel, _state } from '~form';
import * as sForm from '../../src-form-main.js';
/* ========================= INIT FORM ====================================== */
/* --------------------------- CREATE --------------------------------------- */
export function initCreateForm(v) {                                 /*perm-log*/console.log('       /--initCreateForm [%s]', v);
    clearCitationFormData();
    return _elems('initSubForm', [getCreateFormParams(v)])
        .then(finishPubFormInit);
}
function getCreateFormParams(v) {
    const createParams = {
        appendForm: form => $('#CitationTitle_f')[0].parentNode.after(form),
        combo: 'Publication',
        style: 'med-sub-form',
        vals: { DisplayName: v === 'create' ? '' : v }
    };
    return { ...createParams, ...getFormParams('sub', 'create') };
}
function clearCitationFormData() {
    _cmbx('resetCombobox', ['CitationTitle']);
    _panel('clearFieldDetails', ['CitationTitle']);
}
/* ---------------------------- EDIT ---------------------------------------- */
export function initEditForm(id) {
    return _elems('initForm', [getEditFormParams(id)])
        .then(finishPubFormInit);
}
function getEditFormParams(id) {
    const editParams = {
        id: id,
        style: 'lrg-form'
    };
    return { ...editParams, ...getFormParams('top', 'edit') };
}
/* --------------------------- SHARED --------------------------------------- */
function getFormParams(fLvl, action) {
    return {
        action: action,
        name: 'Publication',
        group: fLvl,
        submit: sForm.showSubmitModal.bind(null, fLvl),
        initCombos: sForm.initCombos.bind(null, fLvl, 'Publication'),
    };
}
/* ======================= FINISH BUILD ===================================== */
function finishPubFormInit(status) {
    if (!status) { return; } //Error handled elsewhere
    $('#DisplayName_f .f-input').focus();
}
/* ===================== PUBLICATION-TYPE FIELDS ============================ */
/**
 * Loads the deafult fields for the selected Publication Type. Clears any
 * previous type-fields and initializes the selectized dropdowns.
 */
export function loadPubTypeFields(fLvl, typeId) {                   /*dbug-log*///console.log('   @--loadPubTypeFields [%s] tId[%s]', fLvl, typeId);
    return sForm.loadSrcTypeFields('Publication', typeId)
        .then(finishPubTypeFields);

    function finishPubTypeFields() {
        showNoteIfBothEditorAndAuthorFieldsAvailable(fLvl);
        _elems('setDynamicFormStyles', ['Publication']);
    }
}
/* -------------------------- SHOW NOTE ------------------------------------- */
export function finishFieldLoad(fLvl) {
    showNoteIfBothEditorAndAuthorFieldsAvailable(fLvl);
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