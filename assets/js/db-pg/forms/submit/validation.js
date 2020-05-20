/**
 *
 * Exports:             Imported by:
 *     errUpdatingData          db-forms
 *     formInitErr              db-forms
 *     formSubmitError          db-forms
 *     openSubFormErr           db-forms
 *     clearErrElemAndEnableSubmit      edit-forms
 *     clrNeedsHigherLvl        edit-forms
 *     clrContribFieldErr       db-forms
 */
import * as _f from '../forms-main.js';

let _fs;
/*------------------- Form Error Handlers --------------------------------*/
/**------------- Form Submit-Errors --------------*/
/** Builds and appends an error elem that displays the error to the user. */
export function formSubmitError(jqXHR, textStatus) {                            console.log("   !!!ajaxError. jqXHR: %O, responseText = [%O], textStatus = [%s]", jqXHR, jqXHR.responseText, textStatus);
    const fLvl = _f.state('getStateProp', ['submit']).fLvl;         
    const elem = getFormErrElem(fLvl);                              
    const errTag = getFormErrTag(jqXHR.responseText);   
    const msg = getFormErrMsg(errTag);                              
    _f.elems('toggleWaitOverlay', [false]);
    setErrElemAndExitBttn(elem, msg, errTag, fLvl);
    _f.elems('toggleSubmitBttn', ['#'+fLvl+'-submit', false]);
}
/**
 * Returns an error tag based on the server error text. Reports duplicated 
 * authors or editors, non-unique display names, or returns a generic 
 * form-error message.
 */
function getFormErrTag(errTxt) {                                                //console.log("errTxt = %O", errTxt) 
    return isDuplicateAuthorErr(errTxt) ? 'dupSelAuth' : 
        errTxt.includes("Duplicate entry") ? 'dupEnt'  : 'genSubmitErr';
}
function isDuplicateAuthorErr(errTxt) {
    return errTxt.includes("Duplicate entry") && errTxt.includes("contribution");
}
function getFormErrMsg(errTag) {
    var msg = {
        'dupSelAuth': 'An author is selected multiple times.',
        'dupEnt' : 'A record with this name already exists.',
        'genSubmitErr': "An Error occured and the developer has been notified."
    };
    return '<span>' + msg[errTag] + '</span>'; 
}
/**------------- Data Storage Errors --------------*/
export function errUpdatingData(errTag) {                                       console.log('           !!!errUpdatingData [%s]', errTag);
    const cntnr = _f.util('buildElem', ['div', { class: 'flex-col', id:'data_errs' }]);
    $(cntnr).append([buildErrMsg(), buildResetDataButton()]);
    $('#top-hdr').after(cntnr);
    $('#top-submit, #top-cancel, #exit-form').off('click').css('disabled', 'disabled')
        .fadeTo('400', 0.5);
}
function buildErrMsg() {
    return `<span>An error occured and the developer has been notified.
        <br>All stored data will be redownloaded.</span>`;
}
function buildResetDataButton() {
    const confirm = _f.util('buildElem', ['span', { class: 'flex-row', 
            'text': `Please click "OK" to continue.` }]);
    const bttn = _f.util('buildElem', ['input', { type: 'button', value: 'OK', 
            class: 'exit-bttn' }]);
    $(bttn).click(reloadAndRedownloadData);
    $(confirm).append(bttn);
    return confirm;
}
function reloadAndRedownloadData() {                                            
    _f.exitFormWindow(null, 'skipTableReset');
    _f.resetStoredData(true);
}
/**
 * When the user attempts to create an entity that uses the sub-form and there 
 * is already an instance using that form, show the user an error message and 
 * reset the select elem. 
 */
export function openSubFormErr(field, id, fLvl, skipClear) {                    //console.log("selId = %s, _fs = %O ", selId, _fs)
    const selId = id || '#'+field+'-sel';
    return formInitErr(field, 'openSubForm', fLvl, selId, skipClear);
}
/** 
 * When an error prevents a form init, this method shows an error to the user
 * and resets the combobox that triggered the form. 
 */
export function formInitErr(field, errTag, fLvl, id, skipClear) {               console.log("       !!!formInitErr: [%s]. field = [%s] at [%s], id = %s", errTag, field, fLvl, id)
    const selId = id || '#'+field+'-sel';
    reportFormFieldErr(field, errTag, fLvl);
    if (skipClear) { return; }
    window.setTimeout(function() {_f.cmbx('clearCombobox', [selId])}, 10);
    return { 'value': '', 'text': 'Select ' + field };
}
/**
 * Shows the user an error message above the field row. The user can clear the 
 * error manually with the close button, or automatically by resolving the error.
 */
export function reportFormFieldErr(fieldName, errTag, fLvl) {                   console.log("       !!!formFieldError- '%s' for '%s' @ '%s'", errTag, fieldName, fLvl);  
    _fs = _f.state('getFormState');
    const errMsgMap = {
        'dupAuth': handleDupAuth,
        'fillAuthBlanks': handleAuthBlanks,
        'fillEdBlanks': handleEdBlanks,
        'isGenusPrnt': handleIsGenusPrnt,
        'invalidCoords': handleInvalidCoords,
        'needsGenusName': handleNeedsGenusName,
        'needsGenusPrnt': handleNeedsGenusParent, 
        'needsHigherLvlPrnt': handleNeedsHigherLvlPrnt,
        'needsHigherLvl': handleNeedsHigherLvl,
        'needsLocData': handleNeedsLocData,
        'needsName': handleNeedsName,
        'noGenus': handleNoGenus,
        'openSubForm': handleOpenSubForm,
    };
    const errElem = getFieldErrElem(fieldName, fLvl);
    errMsgMap[errTag](errElem, errTag, fLvl, fieldName);
}
/* ----------- Field-Error Handlers --------------------------------------*/
function handleDupAuth(elem, errTag, fLvl, fieldName) {  
    const msg = `<span>An author with this name already exists in the database.\n
        If you are sure this is a new author, add initials or modify their name 
        and submit again. </span>`;
    setErrElemAndExitBttn(elem, msg, errTag, fLvl);
}
function clrDupAuth(elem, fLvl, e) { 
    clearErrElemAndEnableSubmit(elem, fLvl);
}
/** Note: error for the edit-taxon form. */
function handleIsGenusPrnt(elem, errTag, fLvl, fieldName) {  
    const msg = "<span>Genus' with species children must remain at genus.</span>";
    setErrElemAndExitBttn(elem, msg, errTag, 'top');
}
function clrIsGenusPrnt(elem, fLvl, e) { 
    _f.cmbx('setSelVal', ['#txn-lvl', $('#txn-lvl').data('lvl')]);
    clearErrElemAndEnableSubmit(elem, 'top');
}
/** Note: error used for the location form. */
function handleInvalidCoords(elem, errTag, fLvl, fieldName) {
    const msg = `<span>Invalid coordinate format.</span>`;
    $(`#${fieldName}_row input[type="text"]`).on('input', 
        clrInvalidCoords.bind(null, elem, fLvl, null, fieldName)); 
    setErrElemAndExitBttn(elem, msg, errTag, fLvl);
    $('.err-exit').hide();
}
function clrInvalidCoords(elem, fLvl, e, fieldName) {
    clearErrElemAndEnableSubmit(elem, fLvl);
    if (fieldName) { $(`#${fieldName}_Row input[type="text"]`).off('input'); }
}
function handleNeedsGenusName(elem, errTag, fLvl, fieldName) {
    const genus = _f.cmbx('getSelTxt', ['#Genus-sel']);
    const msg = `<span>Species must begin with the Genus name "${genus}".</span>`;
    $('#DisplayName_row input').change(clearErrElemAndEnableSubmit.bind(null, elem, fLvl));
    setErrElemAndExitBttn(elem, msg, errTag, fLvl);
}
function clrNeedsGenusName(elem, fLvl, e) {
    // $('#DisplayName_row input')[0].value = '';
    clearErrElemAndEnableSubmit(elem, fLvl);
}
/** Note: error for the edit-taxon form. */
function handleNeedsGenusParent(elem, errTag, fLvl, fieldName) {  
    const msg = '<span>Please select a genus parent for the species taxon.</span>';
    setErrElemAndExitBttn(elem, msg, errTag, 'top');
}
function clrNeedsGenusPrntErr(elem, fLvl, e) {            
    _f.cmbx('setSelVal', ['#txn-lvl', $('#txn-lvl').data('lvl')]);
    clearErrElemAndEnableSubmit(elem, 'top');
}
/** Note: error for the create-taxon form. */
function handleNoGenus(elem, errTag, fLvl, fieldName) {  
    const msg = '<span>Please select a genus before creating a species.</span>';
    setErrElemAndExitBttn(elem, msg, errTag, fLvl);
    // $('#'+fieldName+'-sel')[0].selectize.refreshItems();
    $('#Genus-sel').change(onChangeClearNoGenusErr.bind(null, elem, fLvl));
}
function onChangeClearNoGenusErr(elem, fLvl, e){
    if (e.target.value) { clrNoGenusErr(elem, fLvl); }
}
function clrNoGenusErr(elem, fLvl, e) {                                            
    $('#Genus-sel').off('change', onChangeClearNoGenusErr);
    clearErrElemAndEnableSubmit(elem, fLvl);
}
/** Note: error for the edit-taxon form. */
function handleNeedsHigherLvlPrnt(elem, errTag, fLvl, fieldName) { 
    const msg = '<span>The parent taxon must be at a higher taxonomic level.</span>';
    setErrElemAndExitBttn(elem, msg, errTag, fLvl);
}
/** Clears the cause, either the parent-selection process or the taxon's level. */
function clrNeedsHigherLvlPrnt(elem, fLvl, e) {          
    _f.cmbx('setSelVal', ['#txn-lvl', $('#txn-lvl').data('lvl')]);
    clearErrElemAndEnableSubmit(elem, fLvl);
    if ($('#sub-form').length) { 
        return _f.forms('selectParentTaxon', [ $('#txn-prnt').data('txn') ]); 
    }
    $('#txn-lvl').data('lvl', $('#txn-lvl').val());
}
/** Note: error for the edit-taxon form. */
function handleNeedsHigherLvl(elem, errTag, fLvl, fieldName) {  
    const msg = '<div>Taxon level must be higher than that of child taxa.</div>';
    $('#chng-prnt').attr({'disabled': true}).css({'opacity': '.6'});
    setErrElemAndExitBttn(elem, msg, errTag, fLvl);
}
export function clrNeedsHigherLvl(elem, fLvl, e, taxonLvl) {    
    var txnLvl = taxonLvl || $('#txn-lvl').data('lvl'); 
    _f.cmbx('setSelVal', ['#txn-lvl', $('#txn-lvl').data('lvl'), 'silent']);
    $('#txn-lvl').data('lvl', txnLvl);
    clearErrElemAndEnableSubmit($('#Taxon_errs')[0], fLvl);
    enableChngPrntBtttn();
}
/** Enables the button if the change-parent form isn't already open. */
function enableChngPrntBtttn() {
    if ($('#sub-form').length ) { return; }
    $('#chng-prnt').attr({'disabled': false}).css({'opacity': '1'});
}
/** Note: error used for the location form when selecting new location from map. */
function handleNeedsLocData(elem, errTag, fLvl, fieldName) {
    const msg = `<div id='err'>Please fill required fields and submit again.</div>`;
    setErrElemAndExitBttn(elem, msg, errTag, fLvl);
    $('div.new-loc-popup').prepend(msg);
}
function clrNeedsLocData(elem, fLvl, e) {
    clearErrElemAndEnableSubmit(elem, fLvl);
    $('.new-loc-popup #err').remove();
}
function handleNeedsName(elem, errTag, fLvl, fieldName) {
    const msg = `<span>Please fill required fields and submit again.</span>`;
    setErrElemAndExitBttn(elem, msg, errTag, fLvl);
}
function clrNeedsName(elem, fLvl, e) {
    clearErrElemAndEnableSubmit(elem, fLvl, 'enable');
}
/** Note: error used for the publication form. */
function handleOpenSubForm(elem, errTag, fLvl, fieldName) {  
    var subEntity = _fs.forms[fLvl] ? _fs.forms[fLvl].entity : '';
    var msg = '<p>Please finish the open '+ _f.util('ucfirst', [subEntity]) + ' form.</p>';
    setErrElemAndExitBttn(elem, msg, errTag, fLvl);
    setOnFormCloseListenerToClearErr(elem, fLvl);
}
/** Note: error used for the publication/citation form. */
function handleAuthBlanks(elem, errTag, fLvl, fieldName) {  
    var subEntity = _fs.forms[fLvl] ? _fs.forms[fLvl].entity : '';
    var msg = '<p>Please fill the blank in the order of authors.</p>';
    setErrElemAndExitBttn(elem, msg, errTag, fLvl);
    setOnFormCloseListenerToClearErr(elem, fLvl);
}
/** Note: error used for the publication form. */
function handleEdBlanks(elem, errTag, fLvl, fieldName) {  
    var subEntity = _fs.forms[fLvl] ? _fs.forms[fLvl].entity : '';
    var msg = '<p>Please fill the blank in the order of editors.</p>';
    setErrElemAndExitBttn(elem, msg, errTag, fLvl);
    setOnFormCloseListenerToClearErr(elem, fLvl);
}
export function clrContribFieldErr(field, fLvl) {                               //console.log('clrContribFieldErr.')
    const elem = $('#'+field+'_errs')[0];    
    clearErrElemAndEnableSubmit(elem, fLvl);
    _f.elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
}
/* ----------- Error-Elem Methods -------------- */
function setOnFormCloseListenerToClearErr(elem, fLvl) {
    $('#'+fLvl+'-form').bind('destroyed', clrOpenSubForm.bind(null, elem, fLvl));
}
function clrOpenSubForm(elem, fLvl) {   
    clearErrElemAndEnableSubmit(elem, fLvl);
}
/** Returns the error div for the passed field. */
function getFieldErrElem(fieldName, fLvl) {                                     //console.log("getFieldErrElem for %s", fieldName);
    var field = fieldName.split(' ').join('');
    var elem = $('#'+field+'_errs')[0];    
    $(elem).addClass(fLvl+'-active-errs');
    return elem;
}   
function getFormErrElem(fLvl) {
    const elem = _f.util('buildElem', ['div', { id: fLvl+'_errs', class: fLvl+'-active-errs' }]); 
    $('#'+fLvl+'-hdr').after(elem);
    return elem;
}
function setErrElemAndExitBttn(elem, msg, errTag, fLvl) {                       //console.log('setErrElemAndExitBttn. args = %O', arguments)
    elem.innerHTML = msg;
    $(elem).append(getErrExitBttn(errTag, elem, fLvl));
    _f.elems('toggleSubmitBttn', ['#'+fLvl+'-submit', false]);
}
function getErrExitBttn(errTag, elem, fLvl) {
    const exitHdnlrs = {
        'isGenusPrnt': clrIsGenusPrnt, 'invalidCoords': clrInvalidCoords,
        'needsGenusName': clrNeedsGenusName,    'needsName': clrNeedsName,
        'needsGenusPrnt': clrNeedsGenusPrntErr, 'noGenus': clrNoGenusErr, 
        'needsHigherLvl': clrNeedsHigherLvl, 'needsHigherLvlPrnt': clrNeedsHigherLvlPrnt,
        'needsLocData': clrNeedsLocData, 'openSubForm': clrOpenSubForm, 
        'dupSelAuth': clrFormLvlErr, 'dupAuth': clrDupAuth,
        'dupEnt': clrFormLvlErr, 'genSubmitErr': clrFormLvlErr, 
        'fillAuthBlanks': false, 'fillEdBlanks': false
    };
    if (!exitHdnlrs[errTag]) { return []; }
    const bttn = _f.elems('getExitButton');
    bttn.className += ' err-exit';
    $(bttn).off('click').click(exitHdnlrs[errTag].bind(null, elem, fLvl));
    return bttn;
}
function clrFormLvlErr(elem, fLvl) {
    const childFormLvl = _f.getNextFormLevel('child', fLvl);
    $('#'+fLvl+'_errs').remove();
    _f.elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
}
export function clearErrElemAndEnableSubmit(elem, fLvl, enable = false) {                       //console.log('clearErrElemAndEnableSubmit. [%O] innerHTML = [%s] bool? ', elem, elem.innerHTML, !!elem.innerHTML)
    const subLvl = _f.getNextFormLevel('child', fLvl);
    $(elem).fadeTo(200, 0, clearAndEnable);

    function clearAndEnable() {
        clearErrElem();
        enableSubmitIfFormReady();
    }
    function clearErrElem() {                                                   //console.log('fLvl = ', fLvl);
        $(elem).removeClass(fLvl+'-active-errs');
        if (elem.innerHTML) { elem.innerHTML = ''; }
        $(elem).fadeTo(0, 1);
    }
    function enableSubmitIfFormReady() {
        if (!$('#'+fLvl+'-form').length || $('#'+subLvl+'-form').length) { return; }
        if (!enable) { return; }
        _f.elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
    }
} 