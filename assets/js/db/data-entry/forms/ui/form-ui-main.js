/**
 *
 *
 *
 * 
 */
import * as _forms from '../forms-main.js';
import * as _cmbx from './combobox-util.js';
import * as _elems from './form-elems.js';
import * as _pnl from './detail-panel.js';

const _u = _forms._util;

export function elems(funcName, params) {
    return _elems[funcName](...params);
}
export function combos(funcName, params) {
    return _cmbx[funcName](...params);
}
export function panel(funcName, params) {
    return _pnl[funcName](...params);
}

/* =============================== HELPERS ================================== */
export function setCoreRowStyles(formId, rowClass) {
    const w = $(formId).innerWidth() / 2 - 3;  
    $(rowClass).css({'flex': '0 1 '+w+'px', 'max-width': w});
}
/** Shows a form-submit success message at the top of the interaction form. */
export function showSuccessMsg(msg, color) {
    const cntnr = _u('buildElem', ['div', { id: 'success' }]);
    const msgHtml = getSuccessMsgHtml(msg);
    cntnr.append(div);
    $(cntnr).css('border-color', (color ? color : 'greem'));
    $('#top-hdr').after(cntnr); 
    $(cntnr).fadeTo('400', .8);
}
function getSuccessMsgHtml(msg) {
    const div = _u('buildElem', ['div', { class: 'flex-row' }]);
    const p = _u('buildElem', ['p', { text: msg }]);
    const bttn = getSuccessMsgExitBttn();
    div.append(p, bttn);
    return div;
}
function getSuccessMsgExitBttn() {
    const attr = { 'id': 'sucess-exit', 'class': 'tbl-bttn exit-bttn', 
        'type': 'button', 'value': 'X' }
    const bttn = _u('buildElem', ['input', attr]);
    $(bttn).click(exitSuccessMsg);
    return bttn;
}
export function exitSuccessMsg() {
    $('#success').fadeTo('400', 0, () => $('#success').remove());
}
/* ============================ EXIT FORM =================================== */
/**
 * Removes the form container with the passed id, clears and enables the combobox,
 * and contextually enables to parent form's submit button. Calls the exit 
 * handler stored in the form's params object.
 */
export function exitForm(formId, fLvl, focus, onExit, data) {                   //console.log("               --exitForm id = %s, fLvl = %s, onFormClose = %O", formId, fLvl, fP.forms[fLvl].onFormClose);      
    const exitFunc = onExit || _mmry('getFormProp', ['onFormClose']);
    $(formId).remove();  
    _cmbx.resetFormCombobox(fLvl, focus);
    if (fLvl !== 'top') { ifParentFormValidEnableSubmit(fLvl); }
    if (exitFunc) { exitFunc(data); }
}
/** Returns popup and overlay to their original/default state. */
export function exitFormPopup(e, skipReset) {                                   console.log('           --exitFormPopup')
    hideSearchFormPopup();
    if (!skipReset) { refocusTableIfFormWasSubmitted(); }
    $("#b-overlay").removeClass("form-ovrly");
    $("#b-overlay-popup").removeClass("form-popup");
    $("#b-overlay-popup").empty();
    _forms.clearFormMemory();
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
    const formFocus = _forms.memory('getMemoryProp', ['submitFocus']);
    if (!formFocus) { return; }
    if (formFocus == 'int') { return refocusAndShowUpdates(); }   
    _forms.loadDataTableAfterFormClose(formFocus);
}
function refocusAndShowUpdates() {                                              //console.log('refocusAndShowUpdates.')
    const tableFocus  = fP.action === 'create' ? 'srcs' : getCurFocus();
    showTodaysUpdates(tableFocus);   
}
function getCurFocus() {
    return _forms.memory('getMemoryProp', ['curFocus']);
}
/*--------------------- After Sub-Entity Created -----------------------------*/
/**
 * Exits the successfully submitted form @exitForm. Adds and selects the new 
 * entity in the form's parent elem @addAndSelectEntity.
 */
function exitFormAndSelectNewEntity(data) {                                     console.log('           --exitFormAndSelectNewEntity. data = %O', data);
    const fLvl = _forms.memory('getMemoryProp', ['ajaxFormLvl']);  
    const formParent = _forms.memory('getFormParentId', [fLvl]);         
    exitForm('#'+fLvl+'-form', fLvl); 
    if (formParent) { addAndSelectEntity(data, formParent); 
    } else { _forms.memory('clearMemory'); }
}
/** Adds and option for the new entity to the form's parent elem, and selects it. */
function addAndSelectEntity(data, formParent) {
    const selApi = $(formParent)[0].selectize;        
    selApi.addOption({ 
        'value': data.coreEntity.id, 'text': data.coreEntity.displayName 
    });
    selApi.addItem(data.coreEntity.id);
}
/** -------------- sort! --------------- */
export function setToggleFieldsEvent(elem, entity, fLvl) {
    $(elem).click(toggleShowAllFields.bind(elem, entity, fLvl));
}
/**
 * Toggles between displaying all fields for the entity and only showing the 
 * default (required and suggested) fields.
 */
function toggleShowAllFields(entity, fLvl) {                             //console.log('--- Showing all Fields [%s] -------', this.checked);
    if (ifOpenSubForm(fLvl)) { return showOpenSubFormErr(fLvl); }
    _forms.memory('setFormProp', ['expanded', this.checked]);
    _forms.memory('setFormProp', ['reqElems', []]);
    const fVals = getCurrentFormFieldVals(fLvl);                                //console.log('vals before fill = %O', JSON.parse(JSON.stringify(fVals)));
    const fConfg = _fCnfg.getFormConfg(entity);                                 
    const tConfg = fP.forms[fLvl].typeConfg;
    $('#'+entity+'_Rows').empty();
    // fP.forms[fLvl].reqElems = [];
    _elems.getFormFieldRows(entity, fConfg, tConfg, fVals, fLvl, fP)
    .then(appendAndFinishRebuild);

    function appendAndFinishRebuild(rows) {
        $('#'+entity+'_Rows').append(rows);
        _cmbx('initFormCombos', [entity, fLvl]);
        fillComplexFormFields(fLvl);
        finishComplexForms();
    }
    function finishComplexForms() {
        if (['citation', 'publication', 'location'].indexOf(entity) === -1) { return; }
        if (entity === 'publication') { ifBookAddAuthEdNote(fVals.PublicationType)}
        if (entity === 'citation') { 
            handleSpecialCaseTypeUpdates($('#CitationType-sel')[0], fLvl);
            if (!fP.citTimeout) { handleCitText(fLvl); }
        }
        if (entity !== 'location') {
            updateFieldLabelsForType(entity, fLvl);
        }
        _forms.ui('setCoreRowStyles', ['#'+entity+'_Rows', '.'+fLvl+'-row']);
    }
} /* End toggleShowAllFields */
function ifOpenSubForm(fLvl) {
    const subLvl = _forms.getNextFormLevel('child', fLvl);
    return $('#'+subLvl+'-form').length !== 0;
}
function showOpenSubFormErr(fLvl) {
    const subLvl = _forms.getNextFormLevel('child', fLvl);
    let entity = _u('ucfirst', [fP.forms[subLvl].entity]);
    if (entity === 'Author' || entity === 'Editor') { entity += 's'; }
    _forms.err('openSubFormErr', [entity, null, subLvl, true]);   
    $('#sub-all-fields')[0].checked = !$('#sub-all-fields')[0].checked;
}
/*--------------------------- Misc Form Helpers ------------------------------*/
/*--------------------------- Fill Form Fields -------------------------------*/
/** Returns an object with field names(k) and values(v) of all form fields*/
function getCurrentFormFieldVals(fLvl) {
    const vals = fP.forms[fLvl].fieldConfg.vals;                                //console.log('getCurrentFormFieldVals. vals = %O', JSON.parse(JSON.stringify(vals)));
    const valObj = {};
    for (let field in vals) {
        valObj[field] = vals[field].val;
    }
    return valObj;
}
/**
 * When either source-type fields are regenerated or the form fields are toggled 
 * between all available fields and the default shown, the fields that can 
 * not be reset as easily as simply setting a value in the form input during 
 * reinitiation are handled here.
 */
function fillComplexFormFields(fLvl) {
    const vals = fP.forms[fLvl].fieldConfg.vals;                                //console.log('fillComplexFormFields. vals = %O, curFields = %O', JSON.parse(JSON.stringify(vals)),fP.forms[fLvl].fieldConfg.fields);
    const fieldHndlrs = { 'multiSelect': selectExistingAuthors };

    for (let field in vals) {                                                   //console.log('field = [%s] type = [%s], types = %O', field, vals[field].type, Object.keys(fieldHndlrs));
        if (!vals[field].val) { continue; } 
        if (Object.keys(fieldHndlrs).indexOf(vals[field].type) == -1) {continue;}
        addValueIfFieldShown(field, vals[field].val, fLvl);
    }
    function addValueIfFieldShown(field, val, fLvl) {                           //console.log('addValueIfFieldShown [%s] field, val = %O', field, val);
        if (!fieldIsDisplayed(field, fLvl)) { return; }
        fieldHndlrs[vals[field].type](field, val, fLvl);        
    }
} /* End fillComplexFormFields */
export function fieldIsDisplayed(field, fLvl) {
    const curFields = fP.forms[fLvl].fieldConfg.fields;                         //console.log('field [%s] is displayed? ', field, Object.keys(curFields).indexOf(field) !== -1);
    return Object.keys(curFields).indexOf(field) !== -1;
}
/** Enables the parent form's submit button if all required fields have values. */
export function ifParentFormValidEnableSubmit(fLvl) {
    const parentLvl = _forms.getNextFormLevel('parent', fLvl);
    if (_elems.ifAllRequiredFieldsFilled(parentLvl)) {
        toggleSubmitBttn('#'+parentLvl+'-submit', true);
    }
}
export function toggleSubmitBttn(bttnId, enable) {
    return enable ? enableSubmitBttn(bttnId) : disableSubmitBttn(bttnId);
}
/** Enables passed submit button */
export function enableSubmitBttn(bttnId) {  
    $(bttnId).attr("disabled", false).css({"opacity": "1", "cursor": "pointer"}); 
}  
/** Enables passed submit button */
export function disableSubmitBttn(bttnId) {                                            //console.log('disabling bttn = ', bttnId)
    $(bttnId).attr("disabled", true).css({"opacity": ".6", "cursor": "initial"}); 
}  
function toggleWaitOverlay(waiting) {                                           //console.log("toggling wait overlay")
    if (waiting) { appendWaitingOverlay();
    } else { $('#c-overlay').remove(); }  
}
function appendWaitingOverlay() {
    const attr = { class: 'overlay waiting', id: 'c-overlay'}
    $('#b-overlay').append(_u('buildElem', ['div', attr]));
    $('#c-overlay').css({'z-index': '1000', 'display': 'block'});
}