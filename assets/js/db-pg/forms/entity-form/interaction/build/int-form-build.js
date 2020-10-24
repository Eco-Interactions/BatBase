/**
 * Inits the interaction form with all fields displayed and the first field,
 * publication, in focus. From within many of the fields the user can create
 * new entities of the field-type by selecting the 'add...' option from the
 * field's combobox and completing the appended sub-form.
 *
 * Export
 *     initCreateForm
 *     finishInteractionFormBuild
 *
 * TOC
 *     CREATE-FORM BUILD
 *     FINISH FORM DISPLAY
 *         REFERENCE-GUIDE BUTTON
 *         FORM COMBOBOXES
 */
import { _modal, _u } from '../../../../db-main.js';
import { _state, _elems, _cmbx, submitForm } from '../../../forms-main.js';
import * as iForm from '../int-form-main.js';

/* ======================= CREATE-FORM BUILD ================================ */
export function initCreateForm(entity) {                            /*perm-log*/console.log('   //Building New Interaction Form');
    if (_state('getFormState')) { return; } //Form is already opened.
    return _state('initFormState', ['create', 'interaction'])
    .then(getInteractionFormFields)
    .then(fields => _elems('buildAndAppendRootForm', [fields]))
    .then(finishInteractionFormBuild)
    .then(addConfirmationBeforeSubmit)
    .then(() => _state('setOnFormCloseHandler', ['top', iForm.resetInteractionForm]));
}
/** Builds and returns all interaction-form elements. */
function getInteractionFormFields() {
    return _elems('getFormFieldRows', ['Interaction', {}, 'top']);
}
/* ======================= FINISH FORM DISPLAY ============================== */
/**
 * Inits the selectize comboboxes, adds/modifies event listeners, and adds
 * required field elems to the form's config object.
 */
export function finishInteractionFormBuild() {                      /*dbug-log*///console.log('           --finishIntFormBuild');
    $('#Note-txt').change(iForm.focusPinAndEnableSubmitIfFormValid.bind(null, 'Note'));
    modifyFormDisplay();
    iForm.addLocationSelectionMethodsNote();
    finishComboboxInit();
}
function modifyFormDisplay() {
    $('#Note_row label')[0].innerText += 's';
    $('#Country-Region_row label')[0].innerText = 'Country/Region';
    $('.all-fields-cntnr').hide();
    $('#Subject-lbl').text('Subject (Bat)');
    _elems('setCoreRowStyles', ['#form-main', '.top-row']);
    addReferenceGuideButton();
}
/* ----------------------- REFERENCE-GUIDE BUTTON --------------------------- */
function addReferenceGuideButton() {
    const attr = { class: 'ag-fresh', type: 'button', value: 'Reference Guide' };
    const bttn = _u('buildElem', ['input', attr]);
    $(bttn).click(openReferenceGuideInNewTab);
    $('#top-help').prepend(bttn);
}
function openReferenceGuideInNewTab() {
    return window.open(referenceGuide,'_blank');
}
/* -------------------------- FORM COMBOBOXES ------------------------------- */
function finishComboboxInit() {
    iForm.initFormCombos('interaction', 'top');
    _u('enableCombobox', ['#CitationTitle-sel', false]);
    iForm.addRoleTaxonFocusListeners();
    _u('enableCombobox', ['#InteractionType-sel', false]);
    _u('enableCombobox', ['#InteractionTags-sel', false]);
    focusPubFieldIfNewRecord();
}
function focusPubFieldIfNewRecord() {
    const action = _state('getFormProp', ['top', 'action']);
    _u('focusCombobox', ['#Publication-sel', action === 'create']);
}
/* -------------------- ON-SUBMIT CONFIRMATION MODAL ------------------------ */
function addConfirmationBeforeSubmit() {
    $('#top-submit').off('click').click(showSubmitModal);
}
function showSubmitModal() {
    const modalConfg = {
        html: buildConfirmationModalHtml(),
        selector: '#top-submit',
        dir: 'left',
        submit: submitForm.bind(null, '#top-form', 'top', 'interaction'),
        bttn: 'SUBMIT INTERACTION'
    };
    _modal('showSaveModal', [ modalConfg ]);
    $('#top-submit').css({'opacity': .5, cursor: 'not-allowed'})
    window.setTimeout(() => $('.modal-msg').css({width: 'max-content'}), 500);
}
function buildConfirmationModalHtml() {
    const subj = $('#Subject-sel')[0].innerText;
    const obj = $('#Object-sel')[0].innerText;
    const typeVerb = getIntTypeVerbForm(_cmbx('getSelVal', ['#InteractionType-sel']));
    return `${subj} <i><b>${typeVerb}</b></i> ${obj}`;
}
function getIntTypeVerbForm(typeId) {
    const types = _state('getEntityRcrds', ['interactionType']);
    return types[typeId].activeForm;
}