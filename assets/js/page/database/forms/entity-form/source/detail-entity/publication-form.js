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
import { _state, _elems, _panel } from '~form';
import * as sForm from '../src-form-main.js';
/* -------------------------- PUBLICATION CREATE ---------------------------- */
export function initPubForm(value) {                                /*perm-log*/console.log('       /--initPubForm [%s]', value);
    const val = value === 'create' ? '' : value;
    initPubMemory();
    _cmbx('resetCombobox', ['CitationTitle']);
    _panel('clearFieldDetails', ['CitationTitle']);
    return buildAndAppendPubForm(val);
}
function initPubMemory() {
    _state('addEntityFormState', ['publication', 'sub', '#sel-Publication', 'create']);
}
function buildAndAppendPubForm(val) {
    return _elems('getSubForm',
        ['sub', 'med-sub-form', {'Title': val}, '#sel-Publication'])
    .then(form => appendPubFormAndFinishBuild(form));
}
function appendPubFormAndFinishBuild(form) {
    $('#CitationTitle_f')[0].parentNode.after(form);
    sForm.initFormCombos('publication', 'sub');
    sForm.addConfirmationBeforeSubmit('publication', 'sub');
    $('#Title_f input').focus();
    _elems('setDynamicFormStyles', ['publication']);
}
/* --------------------- PUBLICATION-TYPE FIELDS ---------------------------- */
/**
 * Loads the deafult fields for the selected Publication Type. Clears any
 * previous type-fields and initializes the selectized dropdowns.
 */
export function loadPubTypeFields(typeId) {                         /*dbug-log*///console.log('           /--loadPubTypeFields');
    return sForm.loadSrcTypeFields('publication', typeId)
        .then(finishPubTypeFields);

    function finishPubTypeFields() {
        ifBookAddAuthEdNote();
        _elems('setDynamicFormStyles', ['publication']);
    }
}
/** Shows the user a note above the author and editor elems. */
function ifBookAddAuthEdNote() {
    if (_cmbx('getSelTxt', ['PublicationType']) !== 'Book') { return; }
    const note = _el('getElem', ['div', { class: 'skipFormData' }]);
    $(note).html('<i>Note: there must be at least one author OR editor ' +
        'selected for book publications.</i>')
    $(note).css({'margin': 'auto'});
    $('#Authors_f')[0].parentNode.before(note);
}
/* --------------------- FINISH EDIT-FORM ----------------------------------- */
export function finishPublicationEditForm() {
    ifBookAddAuthEdNote();
}