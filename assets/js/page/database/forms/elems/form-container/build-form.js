/**
 * Initiates and appends the entity forms.
 *
 * Export
 *     buildAndAppendRootForm
 *     getExitButton
 *     getSubForm
 *
 * TOC
 *     ROOT FORM
 *         TOP CORNER EXIT BUTTON
 *         MAIN FORM CONTAINER
 *             HELP ELEMS
 *             HEADER
 *             FORM
 *         APPEND AND STYLE
 *     SUB FORM
 */
import { _cmbx, _el, _modal, _u } from '~util';
import { _confg, _elems, _panel, _state } from '~form';

let action, entity, fLvl;
/* ============================== ROOT FORM ================================= */
export function buildAndAppendRootForm(fields, id) {
    const state = _state('getFormState');
    setFormScopeParams(state.action, state.entity, 'top');
    const form = buildForm(id, fields);
    appendAndStyleForm(form, entity);
    return Promise.resolve();
}
/**
 * Returns the form window elements - the form and the detail panel.
 * section>(div#form-main(header, form), div#form-details(hdr, pub, cit, loc), footer)
 */
function buildForm(id, fields) {
    return [getExitButtonRow(), getMainFormAndDetailPanelHtml(id, fields)];
}
function getMainFormAndDetailPanelHtml(id, fields) {
    const cntnr = _el('getElem', ['div', { class: 'flex-row' }]);
    const detailPanelHtml = _panel('getDetailPanelElems', [entity, id, action]);
    $(cntnr).append([buildMainForm(fields), detailPanelHtml]);
    return cntnr;
}
/* ----------------------- TOP CORNER EXIT BUTTON --------------------------- */
function getExitButtonRow() {
    const  row = _el('getElem', ['div', { class: 'exit-row' }]);
    $(row).append(getExitButton());
    return row;
}
export function getExitButton() {
    const attr = { 'id': 'exit-form', 'class': 'exit-bttn', 'type': 'button', 'value': 'X' }
    const bttn = _el('getElem', ['input', attr]);
    $(bttn).click(_elems.bind(null, 'exitRootForm'));
    return bttn;
}
/* ------------------ MAIN FORM CONTAINER ----------------------------------- */
function buildMainForm(fields) {
    const formWin = _el('getElem', ['div', { id: 'form-main', class: action }]);
    $(formWin).append([getFormHelpElems('top'), getHeader(), getValMsgCntnr('top'), getForm(fields)]);
    return formWin;
}
/* ------------------------------ HEADER ------------------------------------ */
function getHeader() {
    const title = (action == 'create' ? 'New ' : 'Editing ') + _u('ucfirst', [entity]);
    return _el('getElem', ['h1', { 'id': 'top-hdr', 'text': title }]);
}
/** Container for custom form-validation messages. */
function getValMsgCntnr(fLvl) {
    return _el('getElem', ['div', { id: fLvl+'_alert' }]);
}
/* ----------------------------- FORM --------------------------------------- */
function getForm(fields) {
    const form = buildFormElem();
    $(form).append([
        buildEntityFieldContainer(fields),
        _elems('getFormFooter', [entity, 'top', action])
    ]);
    return form;
}
/** Builds the form elem container. */
function buildFormElem() {
    const form = document.createElement('form');
    $(form).attr({'action': '', 'method': 'POST', 'name': 'top'});
    $(form).submit(e => e.preventDefault());
    form.className = 'flex-row';
    form.id = 'top-form';
    return form;
}
function buildEntityFieldContainer(fields) {
    const attr = { id: entity+'_fields', class: 'flex-row flex-wrap' };
    const div = _el('getElem', ['div', attr]);
    $(div).append(fields);
    return div;
}
/* ----------------------- APPEND AND STYLE --------------------------------- */
/** Builds and shows the popup form's structural elements. */
function appendAndStyleForm(form) {
    $('#b-overlay').addClass('form-ovrly');
    $('#b-overlay-popup').addClass('form-popup');
    $('#b-overlay-popup').append(form);
    addFormStyleClass();
}
/** Adds the width to both the popup window and the form element for each entity. */
function addFormStyleClass() {
    const map = {
        'interaction': 'lrg-form',  'publication': 'med-form',
        'publisher': 'sml-form',    'citation': 'med-form',
        'author': 'sml-form',       'location': 'med-form',
        'taxon': 'sml-form'
    };
    $('#form-main, .form-popup').removeClass(['lrg-form', 'med-form', 'sml-form']);
    $('#form-main, .form-popup').addClass(map[entity]);
}
/* ============================== SUB FORM ================================== */
export function getSubForm(fLvl, fClasses, fVals, sId) {
    entity = _state('getFormProp', [fLvl, 'entity']);
    setFormScopeParams('create', entity, fLvl);
    return _elems('getFormRows', [entity, fVals, fLvl])
        .then(rows => buildSubFormContainer(rows, fClasses))
        .then(subForm => finishSubFormInit(subForm, sId));
}
function buildSubFormContainer(rows, fClasses) {
    const subFormContainer = buildSubFormCntnr(fClasses);
    const helpBttn = getFormHelpElems();
    const hdr = buildSubFormHdr();
    const valMsg = getValMsgCntnr(fLvl);
    const footer = _elems('getFormFooter', [entity, fLvl, 'create']);
    $(subFormContainer).append([helpBttn, hdr, valMsg, rows, footer]);
    $(subFormContainer).submit(e => e.preventDefault());
    return subFormContainer;
}
function buildSubFormCntnr(fClasses) {
    const attr = {id: fLvl+'-form', class: fClasses };
    return _el('getElem', ['form', attr]);
}
function buildSubFormHdr() {
    const attr = { text: 'New '+_u('ucfirst', [entity]), id: fLvl+'-hdr' };
    return _el('getElem', ['p', attr]);
}
function finishSubFormInit(subForm, sId) {
    _state('setFormProp', [fLvl, 'pSelId', sId]);
    _cmbx('enableCombobox', [sId.split('sel-').pop(), false]);
    return subForm;
}
/* ============================== SHARED ==================================== */
function setFormScopeParams(a, e, l) {
    entity = e,
    action = a,
    fLvl = l;
}
/* ----------------------- HELP ELEMS --------------------------------------- */
function getFormHelpElems() {
    const cntnr = _el('getElem', ['div', { id: fLvl+'-help', class: 'flex-row'}]);
    $(cntnr).append(getFormWalkthroughBttn());
    return cntnr;
}
function getFormWalkthroughBttn() {
    let formInfoStepCount = getFormInfoStepCount();
    if (!formInfoStepCount) { return; }
    const titleInfo = "Hover your mouse over any field and it's help popup will show, if it has one.";
    const bttn = buildWalkthroughButton(titleInfo);
    $(bttn).click(_modal.bind(null, 'showTutorialModal', [fLvl]));
    setIntroWalkthroughAttrs(bttn, titleInfo, ++formInfoStepCount);
    return bttn;
}
function buildWalkthroughButton(titleInfo) {
    const attr = {
        id: fLvl + '-walkthrough',
        title: titleInfo,
        type: 'button',
        value: 'Walkthrough',
    };
    return _el('getElem', ['input', attr]);
}
function getFormInfoStepCount() {
    const formInfoConfg = _confg('getFormConfg', [entity]).info;
    return formInfoConfg ? Object.keys(formInfoConfg).length : false;
}
function setIntroWalkthroughAttrs(bttn, titleInfo, formInfoStepCount) {
    $(bttn).attr({
        'data-intro': titleInfo,
        'data-intro-group': fLvl+'-intro',
        'data-step': formInfoStepCount
    });
}