/**
 * Initiates and appends the main entity form.
 *
 * Exports:
 *     buildAndAppendRootForm       elems-main
 *     getExitButton                form-errs, interaction-form
 *
 * CODE SECTIONS
 *     BUILD ROOT FORM
 *         TOP CORNER EXIT BUTTON
 *         MAIN FORM CONTAINER
 *             HEADER
 *             FORM
 *    APPEND AND STYLE
 */
import { _u } from '../../../db-main.js';
import { _elems, _panel, _state } from '../../forms-main.js';

let entity;
let action;

export function buildAndAppendRootForm(fields, id) {
    setScopeParams(_state('getFormState'));
    const form = buildForm(id, fields);
    appendAndStyleForm(form, entity);
    return Promise.resolve();
}
function setScopeParams(state) {
    entity = state.entity;
    action = state.action;
}
/* ======================== BUILD ROOT FORM ================================== */
/**
 * Returns the form window elements - the form and the detail panel.
 * section>(div#form-main(header, form), div#form-details(hdr, pub, cit, loc), footer)
 */
function buildForm(id, fields) {
    return [getExitButtonRow(), getMainFormAndDetailPanelHtml(id, fields)];
}
function getMainFormAndDetailPanelHtml(id, fields) {
    const cntnr = _u('buildElem', ['div', { class: 'flex-row' }]);
    const detailPanelHtml = _panel('getDetailPanelElems', [entity, id, action]);
    $(cntnr).append([buildMainForm(fields), detailPanelHtml]);
    return cntnr;
}
/* ----------------------- TOP CORNER EXIT BUTTON --------------------------- */
function getExitButtonRow() {
    const  row = _u('buildElem', ['div', { class: 'exit-row' }]);
    $(row).append(getExitButton());
    return row;
}
export function getExitButton() {
    const attr = { 'id': 'exit-form', 'class': 'exit-bttn', 'type': 'button', 'value': 'X' }
    const bttn = _u('buildElem', ['input', attr]);
    $(bttn).click(_elems.bind(null, 'exitFormPopup'));
    return bttn;
}
/* ------------------ MAIN FORM CONTAINER ----------------------------------- */
function buildMainForm(fields) {
    const formWin = _u('buildElem', ['div', { id: 'form-main', class: action }]);
    $(formWin).append([getHeader(), getForm(fields)]);
    return formWin;
}
/* ------------------ HEADER --------------------------------- */
function getHeader() {
    const title = (action == 'create' ? 'New ' : 'Editing ') + _u('ucfirst', [entity]);
    return _u('buildElem', ['h1', { 'id': 'top-hdr', 'text': title }]);
}
/* ------------------------- FORM --------------------------------------- */
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
    form.className = 'flex-row';
    form.id = 'top-form';
    return form;
}
function buildEntityFieldContainer(fields) {
    const attr = { id: entity+'_Rows', class: 'flex-row flex-wrap' };
    const div = _u('buildElem', ['div', attr]);
    $(div).append(fields);
    return div;
}
/* ======================= APPEND AND STYLE ================================= */
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