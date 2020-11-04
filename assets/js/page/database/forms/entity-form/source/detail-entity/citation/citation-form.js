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
 *     CITATION CREATE
 *     AUTOGENERATE CITATION
 *     HIGHTLIGHT EMPTY CITATION-FIELDS
 *     CITATION EDIT
 */
import { _db } from '~util';
import { _u } from '~db';
import { _form, _state, _elems } from '~form';
import * as sForm from '../../src-form-main.js';
import * as types from './cit-type-fields.js';
import * as cite from './regen-citation.js';

let timeout = null; //Prevents citation text being generated multiple times.

export function loadCitTypeFields() {
    return types.loadCitTypeFields.bind(this)(...arguments);
}
/* -------------------------- CITATION CREATE ------------------------------- */
/** Shows the Citation  sub-form and disables the publication combobox. */
export function initCitForm(v) {                                    /*perm-log*/console.log("       /--initCitForm [%s]", v);
    const val = v === 'create' ? '' : v;
    timeout = null;
    return _db('getData', [['author', 'publication']])
    .then(data => initCitFormMemory(data))
    .then(() => buildAndAppendCitForm(val));
}
function initCitFormMemory(data) {
    addSourceDataToMemory(data);
    _state('addEntityFormState', ['citation', 'sub', '#sel-CitationTitle', 'create']);
    _state('setOnFormCloseHandler', ['sub', enablePubField]);
    addPubRcrdsToMemory(data.publication);
    return Promise.resolve();
}
function addSourceDataToMemory(data) {
    const records = _state('getStateProp', ['records']);
    if (!records) { return; } //form was closed.
    Object.keys(data).forEach(k => records[k] = data[k]);
    _state('setStateProp', ['records', records]);
}
/** When the Citation sub-form is exited, the Publication combo is reenabled. */
function enablePubField() {
    _u('enableCombobox', ['Publication']);
    _form('fillCitationCombo', [$('#sel-Publication').val()]);
}
function addPubRcrdsToMemory(pubRcrds) {
    const pubSrc = _state('getRcrd', ['source', $('#sel-Publication').val()]);
    const pub = pubRcrds[pubSrc.publication];
    _state('setFormProp', ['sub', 'rcrds', { pub: pub, src: pubSrc}]);
}
function buildAndAppendCitForm(val) {
    return initCitSubForm(val)
    .then(form => appendCitFormAndFinishBuild(form));
}
function initCitSubForm(val) {
    return _elems('initSubForm',
        ['sub', 'med-sub-form', {'Title': val}, '#sel-CitationTitle']);
}
function appendCitFormAndFinishBuild(form) {                        /*dbug-log*///console.log('           --appendCitFormAndFinishBuild');
    $('#CitationText_row textarea').attr('disabled', true);
    $('#CitationTitle_row')[0].parentNode.after(form);
    sForm.initFormCombos('citation', 'sub');
    sForm.addConfirmationBeforeSubmit('citation', 'sub');
    return types.selectDefaultCitType()
        .then(() => finishCitFormUiLoad());
}
function finishCitFormUiLoad() {
    _u('enableCombobox', ['Publication', false]);
    $('#Abstract_row textarea').focus();
    _elems('setCoreRowStyles', ['#citation_Rows', '.sub-row']);
}
/* ----------------------- AUTO-GENERATE CITATION --------------------------- */
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
/* ---------------- HIGHTLIGHT EMPTY CITATION-FIELDS ------------------------ */
/**
 * Highlights field continer if citation field is empty once all required fields
 * are filled. Removes hightlights when filled.
 */
function ifReqFieldsFilledHighlightEmptyAndPrompt(fLvl) {
    if (!_elems('ifAllRequiredFieldsFilled', [fLvl])) { return; }
    const empty = $('#citation_Rows div.field-row').filter(hightlightIfEmpty);
    if (!empty.length && $('.warn-msg').length) { return $('.warn-msg').remove(); }
    if ($('.warn-msg').length) { return; }
    $('#'+fLvl+'-submit').before('<div class="warn-msg warn">Please add highlighted data if available.</div>')
}
function hightlightIfEmpty(i, el) {
    const input = el.children[1];
    if (ifFieldShouldBeSkipped(el, ...el.children)) { return false; }
    $(el).addClass('warn');
    return true;
}
function ifFieldShouldBeSkipped (el, label, input) {
    const ignore = ['Authors'];
    const skip = $(input).val() || ignore.indexOf(label.id.split('-')[0]) !== -1;
    if (skip && el.className.includes('warn')) { $(el).removeClass('warn'); }
    return skip;
}
/* ---------------- CITATION EDIT ------------------------------------------- */
export function finishCitationEditForm() {
    types.handleSpecialCaseTypeUpdates(_u('getSelTxt', ['CitationType']), 'top');
    handleCitText('top');
}