/**
 * Form UI Code
 * 
 * CODE SECTIONS:
 *     INIT FORM HTML
 *     HELPERS
 *         
 * Exports:             Imported by:
 *     setCoreRowStyles         db-forms
 *     showFormPopup            db-forms
 *     exitFormPopup            db-forms
 */
import * as _u from '../util.js';
import * as db_map from '../db-map/db-map.js';
import * as db_page from '../db-page.js';
import * as db_forms from './db-forms.js';
// import { accessFormState as fState } from './db-forms.js';

// fState = {};
let fP;
/* ======================== INIT FORM HTML ================================== */
/** Builds and shows the popup form's structural elements. */
export function showFormPopup(action, entity, id, params) {
    fP = params;  console.log('fP = %O', fP);
    const title = getFormTitle(action, entity);
    $('#b-overlay').addClass('form-ovrly');
    $('#b-overlay-popup').addClass('form-popup');
    $('#b-overlay-popup').append(getFormWindowElems(entity, id, title, action));
    addFormStyleClass(entity);
}
function getFormTitle(action, entity) { 
    return (action == 'New' ? 'New ' : 'Editing ') + entity;
}
/** Adds the width to both the popup window and the form element for each entity. */
function addFormStyleClass(entity, remove) {
    const map = {
        'Interaction': 'lrg-form',  'Publication': 'med-form',
        'Publisher': 'sml-form',    'Citation': 'med-form',
        'Author': 'sml-form',       'Location': 'med-form',
        'Taxon': 'sml-form'
    };
    $('#form-main, .form-popup').removeClass(['lrg-form', 'med-form', 'sml-form']);
    $('#form-main, .form-popup').addClass(map[entity]);
}
/**
 * Returns the form window elements - the form and the detail panel.
 * section>(div#form-main(header, form), div#form-details(hdr, pub, cit, loc), footer)
 */
function getFormWindowElems(entity, id, title, action) {
    return [getExitButtonRow(), getFormHtml(entity, id, title, action)];
}
function getExitButtonRow() {
    var row = _u.buildElem('div', { class: 'exit-row' });
    $(row).append(getExitButton());
    return row;        
}
function getExitButton() {
    const bttn = _u.buildElem('input', { 'id': 'exit-form', 
        'class': 'tbl-bttn exit-bttn', 'type': 'button', 'value': 'X' });
    $(bttn).click(exitFormPopup);
    return bttn;
}
function getFormHtml(entity, id, title, action) {
    const cntnr = _u.buildElem('div', { class: 'flex-row' });
    $(cntnr).append([getMainFormHtml(title, action), getDetailPanelElems(entity, id)]);
    return cntnr;
}
function getMainFormHtml(title, action) { console.log('fP = %O', fP);
    const formWin = _u.buildElem('div', { id: 'form-main', class: fP.action });
    $(formWin).append(getHeaderHtml(title));
    return formWin;
}
function getHeaderHtml(title) {
    return _u.buildElem('h1', { 'id': 'top-hdr', 'text': title });
}
/** Returns popup and overlay to their original/default state. */
export function exitFormPopup(e, skipReset) {                                   console.log('           --exitFormPopup')
    hideSearchFormPopup();
    if (!skipReset) { refocusTableIfFormWasSubmitted(); }
    $("#b-overlay").removeClass("form-ovrly");
    $("#b-overlay-popup").removeClass("form-popup");
    $("#b-overlay-popup").empty();
    db_map.clearMemory();
    db_forms.clearFormMemory();
}
/**
 * If the form was not submitted the table does not reload. Otherwise, if exiting 
 * the edit-forms, the table will reload with the current focus; or, after creating 
 * an interaction, the table will refocus into source-view. Exiting the interaction
 * forms also sets the 'int-updated-at' filter to 'today'.
 */
function refocusTableIfFormWasSubmitted() {                                     //console.log('refocusTableIfFormWasSubmitted. submitFocus = [%s]', fP.submitFocus);
    if (!fP.submitFocus) { return; }
    if (fP.submitFocus == 'int') { return refocusAndShowUpdates(); }   
    db_page.initDataTable(fP.submitFocus);
}
function refocusAndShowUpdates() {                                              //console.log('refocusAndShowUpdates.')
    var focus  = fP.action === 'create' ? 'srcs' : getCurFocus();
    showTodaysUpdates(focus);   
}
function getCurFocus() {
    return db_page.accessTableState().get('curFocus');
}
function hideSearchFormPopup() {
    $('#b-overlay').css({display: 'none'});
}
function getDetailPanelElems(entity, id) {                                      //console.log("getDetailPanelElems. action = %s, entity = %s", fP.action, fP.entity)
    var getDetailElemFunc = fP.action === 'edit' && fP.entity !== 'interaction' ?
        getSubEntityEditDetailElems : getInteractionDetailElems;
    var cntnr = _u.buildElem('div', { 'id': 'form-details' });
    var intIdStr = id ? 'Id:  ' + id : '';
    $(cntnr).append(_u.buildElem('h3', { 'text': entity + ' Details' }));
    $(cntnr).append(getDetailElemFunc(entity, id, cntnr));
    $(cntnr).append(_u.buildElem('p', { id: 'ent-id',  'text': intIdStr }));
    return cntnr;
}
function getInteractionDetailElems(entity, id, cntnr) {
    return ['src','loc'].map(en => initDetailDiv(en));
}
function initDetailDiv(ent) {
    var entities = {'src': 'Source', 'loc': 'Location'};
    var div = _u.buildElem('div', { 'id': ent+'-det', 'class': 'det-div' });
    $(div).append(_u.buildElem('h5', { 'text': entities[ent]+':' }));        
    $(div).append(_u.buildElem('div', { 'text': 'None selected.' }));
    return div;
}
/** Returns the elems that will display the count of references to the entity. */
function getSubEntityEditDetailElems(entity, id, cntnr) {                       //console.log("getSubEntityEditDetailElems for [%s]", entity);
    var refEnts = {
        'Author': [ 'cit', 'int' ],     'Citation': [ 'int' ],
        'Location': [ 'int' ],          'Publication': ['cit', 'int' ],
        'Taxon': [ 'ord', 'fam', 'gen', 'spc', 'int' ],   
        'Publisher': [ 'pub', 'int']  
    };
    var div = _u.buildElem('div', { 'id': 'det-cnt-cntnr' });
    $(div).append(_u.buildElem('span'));        
    $(div).append(refEnts[entity].map(en => initCountDiv(en)));
    return div;
}
function initCountDiv(ent) { 
    var entities = { 'cit': 'Citations', 'fam': 'Families', 'gen': 'Genera', 
        'int': 'Interactions', 'loc': 'Locations', 'ord': 'Orders',
        'pub': 'Publications', 'spc': 'Species', 'txn': 'Taxa', 
    };
    var div = _u.buildElem('div', { 'id': ent+'-det', 'class': 'cnt-div flex-row' });
    $(div).append(_u.buildElem('div', {'text': '0' }));
    $(div).append(_u.buildElem('span', {'text': entities[ent] }));
    return div;
}
/* =============================== HELPERS ================================== */

export function setCoreRowStyles(formId, rowClass) {
    const w = $(formId).innerWidth() / 2 - 3;  
    $(rowClass).css({'flex': '0 1 '+w+'px', 'max-width': w});
}
