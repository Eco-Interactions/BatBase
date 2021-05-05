/**
 * Citation-form code.
 *
 * Export
 *     finishFieldLoad
 *     handleCitText
 *     initCreateForm
 *     initEditForm
 *     loadCitTypeFields
 *
 * TOC
 *     ON SELECTION
 *     INIT FORM
 *         CREATE
 *             ON CLOSE
 *         EDIT
 *         SHARED
 *     FINISH BUILD
 *         FINISH REBUILD
 *     AUTOGENERATE CITATION
 *     HIGHTLIGHT EMPTY CITATION-FIELDS
 */
import { _db, _cmbx, _u } from '~util';
import { _form, _state, _elems } from '~form';
import * as sForm from '../../src-form-main.js';
import * as types from './cit-type-fields.js';
import * as cite from './regen-citation.js';

let timeout = null; //Prevents citation text being generated multiple times.

export function loadCitTypeFields() {
    return types.loadCitTypeFields(...arguments);
}
/* ========================= INIT FORM ====================================== */
/* --------------------------- CREATE --------------------------------------- */
/** Init form when a new citation title is entered into the combobox. */
export function initCreateForm(v) {                                 /*perm-log*/console.log("       /--initCreateForm [%s]", v);
    timeout = null;
    return _elems('initSubForm', [getCreateFormParams(v)])
        .then(() => _cmbx('enableCombobox', ['Publication', false]))
        .then(() => finishCitFormInit('success'));
}
function getCreateFormParams(v) {
    const createParams = {
        appendForm: form => $('#CitationTitle_f')[0].parentNode.after(form),
        onFormClose: enablePubField,
        combo: 'CitationTitle',
        style: 'med-sub-form',
        vals: {
            ParentSource: _cmbx('getSelVal', ['Publication']),
            DisplayName: (v === 'create' ? '' : v),
        }
    };
    return { ...createParams, ...getFormParams('sub', 'create') };
}
/* ______________________ ON CLOSE __________________________________________ */
/** When the Citation sub-form is exited, the Publication combo is reenabled. */
function enablePubField() {
    _cmbx('enableCombobox', ['Publication']);
    _form('fillCitationCombo', [$('#sel-Publication').val()]);
}
/* ---------------------------- EDIT ---------------------------------------- */
/** Shows the Citation  sub-form and disables the publication combobox. */
export function initEditForm(id) {                                  /*perm-log*/console.log("       /--initCit EDIT Form [%s]", id);
    timeout = null;
    return _elems('initForm', [getEditFormParams(id)])
        .then(finishCitFormInit);
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
        name: 'Citation',
        group: fLvl,
        initCombos: sForm.initCombos.bind(null, fLvl, 'Citation'),
        submit: sForm.showSubmitModal.bind(null, fLvl),
    }
}
/* ======================== FINISH BUILD ==================================== */
function finishCitFormInit(status) {                                /*dbug-log*///console.log('           --finishCitFormInit status[%s]', status);
    if (!status) { return; } //Error handled elsewhere
    $('#CitationText_f textarea').attr('disabled', true);
    return types.selectDefaultCitType()
        .then(disableCitationTypeFieldIfOnlyOneTypeAvailable)
        .then(() => $('#Abstract_f textarea').focus());
}
function disableCitationTypeFieldIfOnlyOneTypeAvailable() {
    const typeCnt = _cmbx('getOptionTotal', ['CitationType']);
    if (typeCnt > 1) { return; }
    _cmbx('enableCombobox', ['CitationType', false]);
}
/* --------------------- FINISH REBUILD ------------------------------------- */
export function finishFieldLoad(fLvl) {
    types.handleSpecialCaseTypeUpdates(_cmbx('getSelTxt', ['CitationType']), fLvl);
    handleCitText(fLvl);
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
function ifReqFieldsFilledHighlightEmptyAndPrompt(fLvl) {           /*dbug-log*///console.log('   --ifReqFieldsFilledHighlightEmptyAndPrompt fLvl[%s]', fLvl);
    if (!_elems('ifAllRequiredFieldsFilled', [fLvl])) { return; }
    const empty = $(`#Citation_fields div.${fLvl}_f`).filter(hightlightIfEmpty);/*dbug-log*///console.log('    --empty? [%O]', empty);
    if (!empty.length && $('.warn-msg').length) { return $('.warn-msg').remove(); }
    if ($('.warn-msg').length) { return; }
    $(`#${fLvl}-submit`).before('<div class="warn-msg warn">Please add highlighted data if available.</div>')
}
function hightlightIfEmpty(i, fContainer) {
    const field = fContainer.children[1];
    if (ifFieldShouldBeSkipped(field, ...field.children)) { return false; }
    $(field).addClass('warn');
    return true;
}
function ifFieldShouldBeSkipped (el, label, input) {
    const ignore = ['Author'];
    const skip = $(input).val() || ignore.find(f => label.innerText.indexOf(f) !== -1);
    if (skip && el.className.includes('warn')) { $(el).removeClass('warn'); }
    return skip;
}
