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
import { _u } from '~db';
import { _state, _elems, _panel } from '~form';
import * as sForm from '../src-form-main.js';
/* -------------------------- PUBLICATION CREATE ---------------------------- */
export function initPubForm(value) {                                /*perm-log*/console.log('       /--initPubForm [%s]', value);
    const val = value === 'create' ? '' : value;
    initPubMemory();
    _u('resetCombobox', ['CitationTitle']);
    _panel('clearFieldDetails', ['CitationTitle']);
    return buildAndAppendPubForm(val);
}
function initPubMemory() {
    _state('addEntityFormState', ['publication', 'sub', '#sel-Publication', 'create']);
}
function buildAndAppendPubForm(val) {
    return _elems('initSubForm',
        ['sub', 'med-sub-form', {'Title': val}, '#sel-Publication'])
    .then(form => appendPubFormAndFinishBuild(form));
}
function appendPubFormAndFinishBuild(form) {
    $('#CitationTitle_row')[0].parentNode.after(form);
    sForm.initFormCombos('publication', 'sub');
    sForm.addConfirmationBeforeSubmit('publication', 'sub');
    $('#Title_row input').focus();
    _elems('setCoreRowStyles', ['#publication_Rows', '.sub-row']);
    $('#PublicationType-lbl').css('min-width', '125px');
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
        setPubComboLabelWidth();
        ifBookAddAuthEdNote();
        _elems('setCoreRowStyles', ['#publication_Rows', '.sub-row']);
        ifThesisDissertationModifyLabel();
    }
}
function setPubComboLabelWidth() {
    const rowW = $('#PublicationType_row').width() - 14;
    $('#PublicationType_row, #Publisher_row, #Editors_row').css('max-width', rowW);
    $('#PublicationType-lbl, #Publisher-lbl, #Editors-lbl').css('min-width', '125px');
    $('#Authors-lbl').css('min-width', '109px');
}
function ifThesisDissertationModifyLabel() {
    const type = _u('getSelTxt', ['PublicationType']);
    if (type !== 'Thesis/Dissertation') { return; }
    $('#Publisher-lbl').css({'flex': '0 0 157px'});
}
/** Shows the user a note above the author and editor elems. */
function ifBookAddAuthEdNote() {
    if (_u('getSelTxt', ['PublicationType']) !== 'Book') { return; }
    const note = _u('buildElem', ['div', { class: 'skipFormData' }]);
    $(note).html('<i>Note: there must be at least one author OR editor ' +
        'selected for book publications.</i>')
    $(note).css({'margin': 'auto'});
    $('#Authors_row')[0].parentNode.before(note);
}
/* --------------------- FINISH EDIT-FORM ----------------------------------- */
export function finishPublicationEditForm() {
    $('#PublicationType-lbl').css('min-width', '125px');
    ifBookAddAuthEdNote();
}