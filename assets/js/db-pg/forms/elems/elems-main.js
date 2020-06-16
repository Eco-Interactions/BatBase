/**
 * Sub-forms, form rows, fiele elements, etc.
 *
 * Exports:         
 *     buildAndAppendForm
 *     getExitButton
 *     getFormFooter       
 *     initSubForm                  
 *     buildFormRows                
 *     getFormFieldRows     
 *     buildFieldInput        
 *     checkReqFieldsAndToggleSubmitBttn    
 *     ifAllRequiredFieldsFilled    
 *     getLocationOpts               
 *     buildFormRow   
 *     buildLongTextArea
 *     getRcrdOpts      
 *     getTaxonOpts     
 *     buildMultiSelectElems
 * 
 */
import * as _f from '../forms-main.js';
import * as _pnl from './detail-panel/detail-panel.js';

import * as _cmbx from './form/fields/combobox-util.js';
import * as _base from './form/base-form.js';
import * as _fields from './form/fields/fields-main.js';
import * as _rows from './form/rows/rows-main.js';


export function buildAndAppendForm(fields, id) {
    return _base.buildAndAppendRootForm(fields, id);
}
export function getExitButton() {
    return _base.getExitButton();
}
export function getFormFooter() {
    return require('./form/footer/form-footer.js').default(...arguments);
}
export function initSubForm() {
    return require('./form/sub-form.js').default(...arguments);
}
export function buildFormRows() {
    return _rows.buildFormRows(...arguments);
}
export function getFormFieldRows() {
    return _rows.getFormFieldRows(...arguments);
}
export function buildFieldInput() {
    return _fields.buildFieldInput(...arguments);
}
export function ifAllRequiredFieldsFilled() {
    return _fields.ifAllRequiredFieldsFilled(...arguments);
}
export function getLocationOpts() {
    return _fields.getLocationOpts();
}
export function getTaxonOpts() {
    return _fields.getTaxonOpts(...arguments);
}
export function getRcrdOpts() {
    return _fields.getRcrdOpts(...arguments);
}
export function buildMultiSelectElem() {
    return _fields.buildMultiSelectElem(...arguments);
}
/**
 * Note: The 'unchanged' property exists only after the create interaction form 
 * has been submitted and before any changes have been made.
 */
export function checkReqFieldsAndToggleSubmitBttn(fLvl) {                       
    const reqFieldsFilled = ifNoOpenSubFormAndAllRequiredFieldsFilled(fLvl);
    _f.elems('toggleSubmitBttn', ['#'+fLvl+'-submit', reqFieldsFilled]); 
    return reqFieldsFilled;
}
function ifNoOpenSubFormAndAllRequiredFieldsFilled(fLvl) {  
    return _fields.ifAllRequiredFieldsFilled(fLvl) && 
        !hasOpenSubForm(fLvl) && !locHasGpsData(fLvl);
}
/** Returns true if the next sub-level form exists in the dom. */
function hasOpenSubForm(fLvl) {
    const childFormLvl = _f.getNextFormLevel('child', fLvl);
    return $('#'+childFormLvl+'-form').length > 0;
}
/** Prevents the location form's submit button from enabling when GPS data entered.*/
function locHasGpsData(fLvl) {
    if (_f.state('getFormProp', [fLvl, 'entity']) !== 'location') { return false; }
    if (_f.state('getFormProp', [fLvl, 'action']) === 'edit') { return false; }
    return ['Latitude', 'Longitude'].some(field => {
        return $(`#${field}_row input`).val();
    });
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
export function showSuccessMsg(msg, color = 'green') {
    const cntnr = _f.util('buildElem', ['div', { id: 'success' }]);
    cntnr.append(getSuccessMsgHtml(msg));
    $(cntnr).css('border-color', (color));
    $('#top-hdr').after(cntnr); 
    $(cntnr).fadeTo('400', .8);
}
function getSuccessMsgHtml(msg) {
    const div = _f.util('buildElem', ['div', { class: 'flex-row' }]);
    const p = _f.util('buildElem', ['p', { text: msg }]);
    const bttn = getSuccessMsgExitBttn();
    div.append(p, bttn);
    return div;
}
function getSuccessMsgExitBttn() {
    const attr = { 'id': 'sucess-exit', 'class': 'exit-bttn', 
        'type': 'button', 'value': 'X' }
    const bttn = _f.util('buildElem', ['input', attr]);
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
export function exitSubForm(fLvl, focus, onExit, data) {                           
    const exitFunc = onExit || _f.state('getFormProp', [fLvl, 'onFormClose']);   console.log("               --exitForm fLvl = %s, onExit = %O", fLvl, exitFunc);      
    $('#'+fLvl+'-form').remove();  
    _cmbx.resetFormCombobox(fLvl, focus);
    ifParentFormValidEnableSubmit(fLvl);
    // if (fLvl !== 'top') { ifParentFormValidEnableSubmit(fLvl); }
    if (exitFunc) { exitFunc(data); }
}
/** Returns popup and overlay to their original/default state. */
export function exitFormPopup(e, skipReset) {                                   console.log('           --exitFormPopup')
    hideSearchFormPopup();
    if (!skipReset) { refocusTableIfFormWasSubmitted(); }
    $('#b-overlay').removeClass('form-ovrly');
    $('#b-overlay-popup').removeClass('form-popup');
    $('#b-overlay-popup').empty();
    _f.clearFormMemory();
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
function refocusTableIfFormWasSubmitted() {                                     
    const submitData = _f.state('getStateProp', ['submit']);                    //console.log('refocusTableIfFormWasSubmitted. submitData = %O', submitData);
    if (!submitData) { return; }
    if (submitData.entity === 'interaction') { return refocusAndShowUpdates(submitData); }   
    _f.loadDataTableAfterFormClose();
}
function refocusAndShowUpdates(submitData) {                                    //console.log('refocusAndShowUpdates.')
    if (_f.state('getFormProp', ['top', 'action']) === 'create') {
        _f.showTodaysUpdates('srcs');   
    } else {
        _f.loadDataTableAfterFormClose();
    }
}
/** -------------- sort! --------------- */
export function setToggleFieldsEvent(elem, entity, fLvl) {
    $(elem).click(toggleShowAllFields.bind(elem, entity, fLvl));
}
/**
 * Toggles between displaying all fields for the entity and only showing the 
 * default (required and suggested) fields.
 */
function toggleShowAllFields(entity, fLvl) {                                    //console.log('--- Showing all Fields [%s] -------', this.checked);
    if (ifOpenSubForm(fLvl)) { return showOpenSubFormErr(fLvl); }
    updateFormMemoryOnFieldToggle(this.checked, fLvl);
    const fVals = getCurrentFormFieldVals(fLvl);                                //console.log('vals before fill = %O', _f.util('snapshot', [fVals]));
    $('#'+entity+'_Rows').empty();
    _rows.getFormFieldRows(entity, fVals, fLvl)
    .then(appendAndFinishRebuild);

    function appendAndFinishRebuild(rows) {
        $('#'+entity+'_Rows').append(rows);
        _f.forms('initFormCombos', [_f.util('lcfirst', [entity]), fLvl]);
        fillComplexFormFields(fLvl)
        .then(finishComplexForms);
    }
    function finishComplexForms() {
        if (['citation', 'publication', 'location'].indexOf(entity) === -1) { return; }
        if (entity !== 'location') { _f.forms('onSrcToggleFields', [entity, fVals, fLvl]); }
        setCoreRowStyles('#'+entity+'_Rows', '.'+fLvl+'-row');
    }
} /* End toggleShowAllFields */
function updateFormMemoryOnFieldToggle(isChecked, fLvl) {
    _f.state('setFormProp', [fLvl, 'expanded', isChecked]);
    _f.state('setFormProp', [fLvl, 'reqElems', []]);
}
function ifOpenSubForm(fLvl) {
    const subLvl = _f.getNextFormLevel('child', fLvl);
    return $('#'+subLvl+'-form').length !== 0;
}
function showOpenSubFormErr(fLvl) {
    const subLvl = _f.getNextFormLevel('child', fLvl);
    let entity = _f.util('ucfirst', [_f.state('getFormProp', [fLvl, entity])]);
    if (entity === 'Author' || entity === 'Editor') { entity += 's'; }
    _f.val('openSubFormErr', [entity, null, subLvl, true]);   
    $('#sub-all-fields')[0].checked = !$('#sub-all-fields')[0].checked;
}
/*--------------------------- Misc Form Helpers ------------------------------*/
/*--------------------------- Fill Form Fields -------------------------------*/
/** Returns an object with field names(k) and values(v) of all form fields*/
export function getCurrentFormFieldVals(fLvl) { 
    const fieldData = _f.state('getFormProp', [fLvl, 'fieldData']);       
    const vals = {};
    for (let field in fieldData) {
        vals[field] = fieldData[field].val;
    }
    return vals;
}
/**
 * When either source-type fields are regenerated or the form fields are toggled 
 * between all available fields and the default shown, the fields that can 
 * not be reset as easily as simply setting a value in the form input during 
 * reinitiation are handled here.
 */
export function fillComplexFormFields(fLvl) {
    const fieldData = _f.state('getFormProp', [fLvl, 'fieldData']);                       
    const fieldHndlrs = { 'multiSelect': getMultiSelectHandler() };
    const fields = Object.keys(fieldData).filter(f => fieldData[f].type in fieldHndlrs); 
    return fields.reduce(fillAllComplexFieldsWithData, Promise.resolve());

    function fillAllComplexFieldsWithData(p, field) { 
        const type = fieldData[field].type;
        const val = fieldData[field].val;
        return p.then(() => fieldHndlrs[type]([field, val, fLvl]));
    }
} /* End fillComplexFormFields */
function getMultiSelectHandler() {
    return _f.forms.bind(null, 'selectExistingAuthors');
}
export function ifFieldIsDisplayed(field, fLvl) {
    return !!_f.state('getFormFieldData', [fLvl, field]);
}
/** Enables the parent form's submit button if all required fields have values. */
export function ifParentFormValidEnableSubmit(fLvl) {
    const parentLvl = _f.getNextFormLevel('parent', fLvl);  
    _f.elems('checkReqFieldsAndToggleSubmitBttn', [parentLvl]);
}
export function toggleSubmitBttn(bttnId, enable = true) {
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
/* used by form-errors & submit-main */
export function toggleWaitOverlay(waiting) {                                           //console.log("toggling wait overlay")
    if (waiting) { appendWaitingOverlay();
    } else { $('#c-overlay').remove(); }  
}
function appendWaitingOverlay() {
    const attr = { class: 'overlay waiting', id: 'c-overlay'}
    $('#b-overlay').append(_f.util('buildElem', ['div', attr]));
    $('#c-overlay').css({'z-index': '1000', 'display': 'block'});
}