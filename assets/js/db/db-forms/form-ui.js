/**
 * Form UI Code
 * 
 * CODE SECTIONS:
 *     INIT FORM HTML
 *         APPEND FIELDS AND FORM
 *     AFTER FORM INIT COMPLETE
 *         INTERACTION CREATE FORM
 *         EDIT FORMS
 *         ENTITY FORMS
 *     EXIT FORM
 *     HELPERS
 *         
 * Exports:             Imported by:
 *     finishCreateFormBuild    db-forms
 *     finishIntFormBuild       db-forms
 *     finishEntityFormBuild    db-forms
 *     setCoreRowStyles         db-forms
 *     exitFormPopup            db-forms
 *     getExitButton            db-forms, f-errs
 */
import * as _u from '../util.js';
import * as _cmbx from './combobox-util.js';
import * as db_map from '../db-map/db-map.js';
import * as db_page from '../db-page.js';
import * as db_forms from './db-forms.js';
import { showTodaysUpdates } from '../db-table/db-filters.js';
import { buildFormBttns } from './form-ui/save-exit-bttns.js';

let fP;
/* ======================== INIT FORM HTML ================================== */
/** Builds and shows the popup form's structural elements. */
function showFormPopup(action, entity, id) {
    $('#b-overlay').addClass('form-ovrly');
    $('#b-overlay-popup').addClass('form-popup');
    $('#b-overlay-popup').append(getFormWindowElems(entity, id, action));
    addFormStyleClass(entity);
}
/** Adds the width to both the popup window and the form element for each entity. */
function addFormStyleClass(entity, remove) {
    const map = {
        'interaction': 'lrg-form',  'publication': 'med-form',
        'publisher': 'sml-form',    'citation': 'med-form',
        'author': 'sml-form',       'location': 'med-form',
        'taxon': 'sml-form'
    };
    $('#form-main, .form-popup').removeClass(['lrg-form', 'med-form', 'sml-form']);
    $('#form-main, .form-popup').addClass(map[entity]);
}
/**
 * Returns the form window elements - the form and the detail panel.
 * section>(div#form-main(header, form), div#form-details(hdr, pub, cit, loc), footer)
 */
function getFormWindowElems(entity, id, action) {
    return [getExitButtonRow(), getFormHtml(entity, id, action)];
}
function getExitButtonRow() {
    var row = _u.buildElem('div', { class: 'exit-row' });
    $(row).append(getExitButton());
    return row;        
}
export function getExitButton() {
    const bttn = _u.buildElem('input', { 'id': 'exit-form', 
        'class': 'tbl-bttn exit-bttn', 'type': 'button', 'value': 'X' });
    $(bttn).click(exitFormPopup);
    return bttn;
}
function getFormHtml(entity, id, action) {
    const cntnr = _u.buildElem('div', { class: 'flex-row' });
    $(cntnr).append([getMainFormHtml(entity, action), getDetailPanelElems(entity, id)]);
    return cntnr;
}
function getMainFormHtml(entity, action) { 
    const formWin = _u.buildElem('div', { id: 'form-main', class: fP.action });
    $(formWin).append(getHeaderHtml(entity, action));
    return formWin;
}
function getHeaderHtml(entity, action) {
    const title = (action == 'New' ? 'New ' : 'Editing ') + entity;    
    return _u.buildElem('h1', { 'id': 'top-hdr', 'text': title });
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
function getSubEntityEditDetailElems(entity, id, cntnr) {                       console.log("getSubEntityEditDetailElems for [%s]", entity);
    var refEnts = {
        'author': [ 'cit', 'int' ],     'citation': [ 'int' ],
        'location': [ 'int' ],          'publication': ['cit', 'int' ],
        'taxon': [ 'ord', 'fam', 'gen', 'spc', 'int' ],   
        'publisher': [ 'pub', 'int']  
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
/* -------------------- APPEND FIELDS AND FORM ------------------------------ */
export function buildAndAppendForm(params, fLvl, fields, id) {  //console.log('params = %O', params);
    fP = params;
    showFormPopup(fP.action, fP.entity, id);
    const form = buildFormElem();  
    const fieldContainer = buildEntityFieldContainer(params.entity, fields);
    $(form).append([fieldContainer, buildFormBttns(params.entity, fLvl, params.action, null, fP)]);
    $('#form-main').append(form);  
    return Promise.resolve();
}
/** Builds the form elem container. */
function buildFormElem() {
    var form = document.createElement("form");
    $(form).attr({"action": "", "method": "POST", "name": "top"});
    form.className = "flex-row";
    form.id = "top-form";
    return form;
}
function buildEntityFieldContainer(entity, fields) {
    const div = _u.buildElem('div', { id: entity+'_Rows', class: 'flex-row flex-wrap' });
    $(div).append(fields); 
    return div;
}
/* ==================== AFTER FORM INIT COMPLETE ============================ */
/**
 * 
 */
export function finishEntityFormBuild(entity, action) {
    const hndlrs = {
        'interaction': finishIntFormBuild, 
        // 'citation': finishCitEditFormBuild, 
        // 'location': finishLocEditFormBuild, 'taxon': finishTaxonEditFormBuild,
    };
    if (entity in hndlrs) { hndlrs[entity]()  
    } else {
        // _cmbx.initFormCombos(entity, 'top'); 
        // $('#top-cancel').unbind('click').click(form_ui.exitFormPopup);
        // $('.all-fields-cntnr').hide();
    }
}
/* --------- INTERACTION CREATE FORM ------------------ */
export function finishCreateFormBuild() {
    setCoreRowStyles('#form-main', '.top-row');
    _cmbx.focusCombobox('#Publication-sel', false);
    _cmbx.enableCombobox('#CitationTitle-sel', false);
}
/**
 * Inits the selectize comboboxes, adds/modifies event listeners, and adds 
 * required field elems to the form's config object.  
 */
export function finishIntFormBuild() {                                                 console.log('           --finishIntFormBuild');
    _cmbx.initFormCombos('interaction', 'top', fP.forms.top.selElems);
    ['Subject', 'Object'].forEach(addTaxonFocusListener);
    $('#top-cancel').unbind('click').click(exitFormPopup);
    $('#Note_row label')[0].innerText += 's';
    $('#Country-Region_row label')[0].innerText = 'Country/Region';
    addLocationSelectionMethodsNote();
    addReqElemsToConfg();    
    $('.all-fields-cntnr').hide();
    _cmbx.focusCombobox('#Publication-sel', true);
}
/** Displays the [Role] Taxon select form when the field gains focus. */ 
function addTaxonFocusListener(role) {
    const func = { 'Subject': db_forms.initSubjectSelect, 'Object': db_forms.initObjectSelect };
    $('#form-main').on('focus', '#'+role+'-sel + div div.selectize-input', func[role]);
}
/** Adds a message above the location fields in interaction forms. */
function addLocationSelectionMethodsNote() {
    const cntnr = _u.buildElem('div', {id: 'loc-note', class: 'skipFormData'});
    const mapText = _u.buildElem('span', {class:'map-link', 
        text: 'click here to use the map interface.'});
    $(mapText).click(db_forms.showInteractionFormMap);
    const note = [`<span>Select or create a location using the fields below or </span>`,
        mapText];
    $(cntnr).append(note);
    $('#Country-Region_row').before(cntnr);
}
function addReqElemsToConfg() {
    const reqFields = ["Publication", "CitationTitle", "Subject", "Object", 
        "InteractionType"];
    fP.forms.top.reqElems = reqFields.map(function(field) {
        return $('#'+field+'-sel')[0];
    });
}
/* ---------- EDIT FORMS ------------------- */
/* --------- ENTITY FORMS ------------------ */
/* ============================ EXIT FORM =================================== */
/** Returns popup and overlay to their original/default state. */
export function exitFormPopup(e, skipReset) {                                   console.log('           --exitFormPopup')
    fP = db_forms.getFormParams();
    hideSearchFormPopup();
    if (!skipReset) { refocusTableIfFormWasSubmitted(); }
    $("#b-overlay").removeClass("form-ovrly");
    $("#b-overlay-popup").removeClass("form-popup");
    $("#b-overlay-popup").empty();
    db_map.clearMemory();
    db_forms.clearFormMemory();
    fP = null;
}
function hideSearchFormPopup() {
    $('#b-overlay').css({display: 'none'});
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
/* =============================== HELPERS ================================== */
export function setCoreRowStyles(formId, rowClass) {
    const w = $(formId).innerWidth() / 2 - 3;  
    $(rowClass).css({'flex': '0 1 '+w+'px', 'max-width': w});
}
