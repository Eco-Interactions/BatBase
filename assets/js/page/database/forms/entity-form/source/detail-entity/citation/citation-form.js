/**
 * Citation-form code.
 * When a user enters a new citation into the combobox, the create form is built
 * and appended to the field's row.
 *
 * Export
 *     initCitForm
 *     handleCitText
 *     loadCitTypeFields
 *
 * TOC
 *     CREATE FORM
 *         INIT STATE MEMORY
 *         ON CREATE-FORM CLOSE
 *         BUILD FORM
 *     AUTOGENERATE CITATION
 *     HIGHTLIGHT EMPTY CITATION-FIELDS
 *     EDIT FORM
 */
import { _db, _cmbx } from '~util';
import { _form, _state, _elems } from '~form';
import * as sForm from '../../src-form-main.js';
import * as types from './cit-type-fields.js';
import * as cite from './regen-citation.js';

let timeout = null; //Prevents citation text being generated multiple times.

export function loadCitTypeFields() {
    return types.loadCitTypeFields.bind(this)(...arguments);
}
/* -============================ CREATE FORM ================================ */
/** Shows the Citation  sub-form and disables the publication combobox. */
export function initCitForm(v) {                                    /*perm-log*/console.log("       /--initCitForm [%s]", v);
    timeout = null;
    initCitFormMemory(v);
    return buildAndAppendCitForm();
}
/* ------------------------- INIT STATE MEMORY ------------------------------ */
function initCitFormMemory(v) {
    const p = ['citation', 'sub', '#sel-CitationTitle', 'create', { Title: (v === 'create' ? '' : v)}]
    _state('addEntityFormState', p);
    addParentPubToFormState(_cmbx('getSelVal', ['Publication']));
    //get default cit type from pub config
    _state('setOnFormCloseHandler', ['sub', enablePubField]);
}
function addParentPubToFormState(pId) {
    const pSrc = _state('getRcrd', ['source', pId]);                /*dbug-log*/console.log('addParentPubToFormState  [%s][%O]', pId, pSrc);
    const pub = _state('getRcrd', ['publication', pSrc.publication]);
    const data = { pub: pub, pubType: pub.publicationType, src: pSrc };/*dbug-log*/console.log('addParentPubToFormState[%O]', data);
    _state('setFieldState', ['sub', 'ParentSource', data, 'misc']);
}
/* -------------------------- BUILD FORM ------------------------------------ */
function buildAndAppendCitForm() {
    return _elems('getSubForm', ['sub', 'med-sub-form', '#sel-CitationTitle'])
        .then(form => appendCitFormAndFinishBuild(form));
}
function appendCitFormAndFinishBuild(form) {                        /*dbug-log*///console.log('           --appendCitFormAndFinishBuild');
    $('#CitationText_f textarea').attr('disabled', true);
    $('#CitationTitle_f')[0].parentNode.after(form);
    sForm.initCombos('sub', 'citation');
    sForm.addConfirmationBeforeSubmit('citation', 'sub');
    return types.selectDefaultCitType()
        .then(() => finishCitFormUiLoad());
}
function finishCitFormUiLoad() {
    _cmbx('enableCombobox', ['Publication', false]);
    $('#Abstract_f textarea').focus();
    _elems('setDynamicFormStyles', ['citation']);
}
/* ---------------------- ON CREATE-FORM CLOSE ------------------------------ */
/** When the Citation sub-form is exited, the Publication combo is reenabled. */
function enablePubField() {
    _cmbx('enableCombobox', ['Publication']);
    _form('fillCitationCombo', [$('#sel-Publication').val()]);
}
/* ======================= AUTO-GENERATE CITATION =========================== */
/** Note: to prevent multiple rebuilds, a timeout is used. */
export function handleCitText(fLvl) {                               /*dbug-log*///console.log('   --handleCitText [%s] timeout? [%s]', fLvl, !!timeout);
    if (timeout) { return; }
    timeout = window.setTimeout(buildCitTextAndUpdateField.bind(null, fLvl), 750);
}
function buildCitTextAndUpdateField(fLvl) {                         /*dbug-log*///console.log('           /--buildCitTextAndUpdateField [%s]', fLvl);console.trace();
    cite.buildCitTextAndUpdateField(fLvl)
    .then(() => ifReqFieldsFilledHighlightEmptyAndPrompt(fLvl))
    .then(() => {timeout = null;});
}
/* ================ HIGHTLIGHT EMPTY FIELDS ================================= */
/**
 * Highlights field continer if citation field is empty once all required fields
 * are filled. Removes hightlights when filled.
 */
function ifReqFieldsFilledHighlightEmptyAndPrompt(fLvl) {
    if (!_elems('ifAllRequiredFieldsFilled', [fLvl])) { return; }
    const empty = $('#citation_fields div.form-field').filter(hightlightIfEmpty);
    if (!empty.length && $('.warn-msg').length) { return $('.warn-msg').remove(); }
    if ($('.warn-msg').length) { return; }
    $(`#${fLvl}-submit`).before('<div class="warn-msg warn">Please add highlighted data if available.</div>')
}
function hightlightIfEmpty(i, el) {
    const input = el.children[1];
    if (ifFieldShouldBeSkipped(el, ...el.children)) { return false; }
    $(el).addClass('warn');
    return true;
}
function ifFieldShouldBeSkipped (el, label, input) {
    const ignore = ['Author'];
    const skip = $(input).val() || ignore.indexOf(label.id.split('-')[0]) !== -1;
    if (skip && el.className.includes('warn')) { $(el).removeClass('warn'); }
    return skip;
}
/* ========================= EDIT FORM ====================================== */
export function finishCitationEditForm() {
    types.handleSpecialCaseTypeUpdates(_cmbx('getSelTxt', ['CitationType']), 'top');
    handleCitText('top');
}