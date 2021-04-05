/**
 * Inits the interaction form with all fields displayed and the first field,
 * publication, in focus. From within many of the fields the user can create
 * new entities of the field-type by selecting the 'add...' option from the
 * field's combobox and completing the appended sub-form.
 *
 * Export
 *     initCreateForm
 *     initEditForm
 *     finishInteractionFormBuild
 *
 * TOC
 *     INIT FORM
 *         CREATE
 *         EDIT
 *         SHARED
 *     FINISH BUILD
 *         REFERENCE-GUIDE BUTTON
 *         FORM COMBOBOXES
 *         ON-SUBMIT CONFIRMATION MODAL
 */
import { _cmbx, _el, _modal } from '~util';
import { _state, _elems, _form, handleFormSubmit } from '~form';
import * as iForm from '../int-form-main.js';
/* ======================= INIT FORM ======================================== */
/* --------------------------- CREATE --------------------------------------- */
export function initCreateForm(entity) {                            /*perm-log*/console.log('   //Building New Interaction Form');
    if (_state('getStateProp')) { return; } //Form is already opened.
    return _elems('initForm', [getIntFormParams('create')])
        .then(finishInteractionFormBuild);
}
/* ---------------------------- EDIT ---------------------------------------- */
export function initEditForm(entity, id) {                          /*perm-log*/console.log('   //Building EDIT Interaction Form id[%s]', id);
    return _elems('initForm', [getIntFormParams('edit', id)])
        .then(finishInteractionFormBuild);
}
/* --------------------------- SHARED --------------------------------------- */
function getIntFormParams(action, id) {
    const onClose = action === 'create' ? iForm.resetInteractionForm : null;
    return {
        action: action,
        id: id,
        initCombos: iForm.initCombos.bind(null, 'top'),
        name: 'Interaction',
        onFormClose: onClose,
        submit: showSubmitModal,
    };
}
/* ======================= FINISH BUILD ===================================== */
/**
 * Inits the selectize comboboxes, adds/modifies event listeners, and adds
 * required field elems to the form's config object.
 */
export function finishInteractionFormBuild() {                      /*dbug-log*///console.log('           --finishIntFormBuild');
    $('#txt-Note').change(iForm.focusPinAndEnableSubmitIfFormValid.bind(null, 'Note'));
    modifyFormDisplay();
    iForm.addLocationSelectionMethodsNote();
    finishComboboxInit();
}
function modifyFormDisplay() {
    _elems('setDynamicFormStyles', ['interaction']);
    addReferenceGuideButton();
}
/* ----------------------- REFERENCE-GUIDE BUTTON --------------------------- */
function addReferenceGuideButton() {
    const attr = { type: 'button', value: 'Reference Guide' };
    const bttn = _el('getElem', ['input', attr]);
    $(bttn).click(openReferenceGuideInNewTab);
    $('#top-help').prepend(bttn);
}
function openReferenceGuideInNewTab() {
    return window.open(referenceGuide,'_blank');
}
/* -------------------------- FORM COMBOBOXES ------------------------------- */
function finishComboboxInit() {
    _cmbx('enableCombobox', ['CitationTitle', false]);
    iForm.addRoleTaxonFocusListeners();
    _cmbx('enableCombobox', ['InteractionType', false]);
    iForm.initTagField();
    focusPubFieldIfNewRecord();
}
function focusPubFieldIfNewRecord() {
    const action = _state('getFormState', ['top', 'action']);
    _cmbx('focusCombobox', ['Publication', action === 'create']);
}
/* -------------------- ON-SUBMIT CONFIRMATION MODAL ------------------------ */
function showSubmitModal() {
    const modalConfg = {
        html: buildConfirmationModalHtml(),
        selector: '#top-submit',
        dir: 'left',
        submit: handleFormSubmit.bind(null, 'top'),
        bttn: 'SUBMIT INTERACTION'
    };
    _modal('showSaveModal', [ modalConfg ]);
    $('#top-submit').css({'opacity': .5, cursor: 'not-allowed'})
    window.setTimeout(() => $('.modal-msg').css({width: 'max-content'}), 500);
}
function buildConfirmationModalHtml() {
    const subj = _cmbx('getSelTxt', ['Subject']);
    const obj = _cmbx('getSelTxt', ['Object']);
    const typeVerb = getIntTypeVerbForm();
    return `${subj} <i><b>${typeVerb}</b></i> ${obj}`;
}
function getIntTypeVerbForm() {
    const typeId = _state('getFieldState', ['top', 'InteractionType']);
    const types = _state('getEntityRcrds', ['interactionType']);  /*dbug-log*///console.log('--getIntTypeVerbForm typeId[%s] types[%O]', typeId, types);
    return types[typeId].activeForm;
}