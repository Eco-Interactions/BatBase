/**
 * Handles custom validation alerts. Forms utilize HTML5 validation where possible.
 *
 * Exports:
 *     clearAlert
 *     clrNeedsHigherRank
 *     clrContribFieldAlert
 *     errUpdatingData
 *     formInitAlert
 *     formSubmitError
 *     openSubFormAlert
 *     showFormValAlert
 *
 * TOC
 *      FORM-SUBMIT ALERT
 *      DATA-STORAGE ALERT
 *      FORM-INIT ALERT
 *      SHOW FORM-VALIDATION ALERT
 *          FORM
 *              SUB-FORM ALREADY OPEN
 *              REQUIRED-FIELD EMPTY
 *          SOURCE
 *              DUPLICATE AUTHOR
 *              BLANKS IN AUTHOR ORDER
 *          TAXON
 *              MUST STAY GENUS RANK
 *              INCORRECT BINOMIAL
 *              MUST HAVE GENUS PARENT
 *              PARENT MUST BE HIGHER RANK
 *              TAXON MUST BE HIGHER RANK
 *              NEEDS FAMILY
 *              NEEDS GENUS
 *     SHOW ALERT
 *     CLEAR ALERT
 *         DEFAULT-HANDLER
 */
import { _db, _u } from '../../db-main.js';
import { _state, _elems, _form, getNextFormLevel } from '../forms-main.js';
let fS;
/* ====================== FORM-SUBMIT ALERT ================================= */
/**
 * Shows server-validation message to editor for duplicated authors or editors,
 * non-unique display names, or general form-error message.
 */
export function formSubmitError(jqXHR, textStatus) {                /*perm-log*/console.log("   !!!ajaxError. jqXHR: %O, responseText = [%O], textStatus = [%s]", jqXHR, jqXHR.responseText, textStatus);
    const fLvl = _state('getStateProp', ['submit']).fLvl;
    const tag = getFormAlertTag(jqXHR.responseText);
    showFormValAlert(fLvl, tag, fLvl);
}
function getFormAlertTag(errTxt) {                                    /*dbug-log*///console.log("errTxt = %O", errTxt)
    return isDuplicateContribution(errTxt) ? 'dupContrib' :
        isDuplicateAuthor(errTxt) ? 'dupAuth' :
            errTxt.includes("Duplicate entry") ? 'dupEnt'  : 'genSubmitErr';
}
function isDuplicateContribution(errTxt) {
    return errTxt.includes("Duplicate entry") && errTxt.includes("contribution");
}
function isDuplicateAuthor(errTxt) {
    const detailEntity = _state('getStateProp', ['submit']).detailEntity;
    return errTxt.includes("Duplicate entry") && detailEntity === 'author';
}
/* ===================== DATA-STORAGE ALERT ================================= */
export function errUpdatingData(errTag) {                           /*perm-log*/console.log('           !!!errUpdatingData [%s]', errTag);
    const cntnr = _u('buildElem', ['div', { class: 'flex-col', id:'data_alert' }]);
    $(cntnr).append([buildAlertMsg(), buildResetDataButton()]);
    $('#top-hdr').after(cntnr);
    $('#top-submit, #top-cancel, #exit-form').off('click').css('disabled', 'disabled')
        .fadeTo('400', 0.5);
}
function buildAlertMsg() {
    return `<span>An error occured and the developer has been notified.
        <br>All stored data will be redownloaded.</span>`;
}
function buildResetDataButton() {
    const confirm = _u('buildElem', ['span', { class: 'flex-row',
            'text': `Please click "OK" to continue.` }]);
    const bttn = _u('buildElem', ['input', { type: 'button', value: 'OK', class: 'exit-bttn' }]);
    $(bttn).click(reloadAndRedownloadData);
    $(confirm).append(bttn);
    return confirm;
}
function reloadAndRedownloadData() {
    _elems('exitRootForm', [null, 'skipTableReset']);
    _db('resetStoredData', [true]);
}
/* ===================== FORM-INIT ALERT ==================================== */
/** A sub-form is already open. */
export function openSubFormAlert(field, fLvl, skipClear) {          /*dbug-log*///console.log("       --open[%s]FormAlert [%s]", fLvl, field)
    return formInitAlert(field, 'openSubForm', fLvl, skipClear);
}
/**
 * When an issue prevents a form init, an alert is shown to the editor and the
 * combobox that triggered the form is reset.
 */
export function formInitAlert(field, tag, fLvl, skipClear) {        /*perm-log*/console.log("       --[%s]formInitAlert [%s][%s]", fLvl, field, tag);
    showFormValAlert(field, tag, fLvl);
    if (skipClear) { return; }
    window.setTimeout(function() {_u('resetCombobox', [field])}, 10);
}
/* =================== SHOW FORM-VALIDATION ALERT =========================== */
/**
 * Handles the tag's validation issue and displays an alert that can be cleared
 * manually with the close button, or automatically by resolving the issue.
 */
export function showFormValAlert(fieldName, tag, fLvl) {            /*perm-log*/console.log("       --show[%s]FormValAlert [%s][%s]", fLvl, fieldName, tag);
    fS = _state('getFormState');
    const handleAndGetAlertMsg = getFieldValAlertHandler(tag, 'show')
    const alertEl = getAlertElem(fieldName, fLvl);
    const alertMsg = handleAndGetAlertMsg(alertEl, tag, fLvl, fieldName);
    if (alertMsg === false) { return; }
    showAlert(alertEl, alertMsg, tag, fLvl);
}
function getFieldValAlertHandler(tag, action) {
    const alertMap = {
        /* --- FORM --- */
        'dupEnt': {
            show: getServerValidationAlertMsg,
            clear: clrFormLvlAlert
        },
        'dupContrib': {
            show: getServerValidationAlertMsg,
            clear: clrFormLvlAlert
        },
        'genSubmitErr': {
            show: getServerValidationAlertMsg,
            clear: clrFormLvlAlert
        },
        'openSubForm': {
            show: handleOpenSubFormAndReturnAlertMsg
        },
        /* --- SOURCE --- */
        'dupAuth': {
            show: handleDupAuthAndReturnAlertMsg
        },
        'fillAuthBlanks': {
            show: handleAuthBlanksAndReturnAlertMsg,
            clear: false
        },
        'fillEdBlanks': {
            show: handleEdBlanksAndReturnAlertMsg,
            clear:false
        },
        /* --- TAXON --- */
        'isGenusPrnt': {
            show: handleIsGenusPrntAndReturnAlertMsg,
            clear: clrIsGenusPrnt
        },
        'needsGenusName': {
            show: handleNeedsGenusNameAndReturnAlertMsg
        },
        'needsGenusPrnt': {
            show: handleNeedsGenusParentAndReturnAlertMsg
        },
        'needsHigherRankPrnt': {
            show: handleNeedsHigherRankPrntAndReturnAlertMsg
        },
        'needsHigherRank': {
            show: handleNeedsHigherRankAndReturnAlertMsg,
            clear: clrNeedsHigherRank
        },
        'needsName': {
            show: getRequiredFieldsEmptyAleryMsg
        },
        'noFamily': {
            show: handleNoFamilyAndReturnAlertMsg,
            clear: false
        },
        'noGenus': {
            show: handleNoGenusAndReturnAlertMsg,
            clear: false
        },
    };
    return alertMap[tag][action];
}
/* ============================= FORM ======================================= */
function setOnFormCloseClearAlert(elem, fLvl) {
    $('#'+fLvl+'-form').bind('destroyed', clearAlert.bind(null, elem, fLvl));
}
function setOnChangeClearAlert(fieldSelector, clearAlertHandler) {
    $(fieldSelector).change(clearAlertHandler);
}
function getServerValidationAlertMsg(elem, tag, fLvl, fieldName) {
    const msg = {
        'dupContrib': 'An author is selected multiple times.',
        'dupEnt' : 'A record with this name already exists.',
        'genSubmitErr': 'An Error occured and the developer has been notified.'
    };
    return '<span>' + msg[tag] + '</span>';
}
/* ----------------- SUB-FORM ALREADY OPEN ---------------------------------- */
function handleOpenSubFormAndReturnAlertMsg(elem, tag, fLvl, fieldName) {
    const subEntity = fS.forms[fLvl] ? fS.forms[fLvl].entity : '';
    setOnFormCloseClearAlert(elem, fLvl);
    return '<p>Please finish the open '+ _u('ucfirst', [subEntity]) + ' form.</p>';
}
/* ----------------- REQUIRED-FIELD EMPTY ----------------------------------- */
function getRequiredFieldsEmptyAleryMsg(elem, tag, fLvl, fieldName) {
    return `<span>Please fill required fields and submit again.</span>`;
}
/* ============================= SOURCE ===================================== */
/* --------------- DUPLICATE AUTHOR ----------------------------------------- */
function handleDupAuthAndReturnAlertMsg(elem, tag, fLvl, fieldName) {
    return `<span>An author with this name already exists in the database.\n
        If you are sure this is a new author, add initials or modify their name
        and submit again. </span>`;
}
/* --------------- BLANKS IN AUTHOR ORDER ----------------------------------- */
function handleAuthBlanksAndReturnAlertMsg(elem, tag, fLvl, fieldName) {
    setOnFormCloseClearAlert(elem, fLvl);
    return '<p>Please fill the blank in the order of authors.</p>';
}
function handleEdBlanksAndReturnAlertMsg(elem, tag, fLvl, fieldName) {
    setOnFormCloseClearAlert(elem, fLvl);
    return '<p>Please fill the blank in the order of editors.</p>';
}
/** Called when the blank is filled in the author|editor order. */
export function clrContribFieldAlert(field, fLvl) {                   /*dbug-log*///console.log('clrContribFieldAlert.')
    const elem = $('#'+field+'_alert')[0];
    clearAlert(elem, fLvl);
}
/* ============================= TAXON ====================================== */
/* ---------------- MUST STAY GENUS RANK ------------------------------------ */
function handleIsGenusPrntAndReturnAlertMsg(elem, tag, fLvl, fieldName) {
    return "<span>Genus' with species children must remain at genus.</span>";
}
function clrIsGenusPrnt(elem, fLvl, e) {
    _u('setSelVal', ['Rank', $('#sel-Rank').data('rank')]);
}
/* ------------- INCORRECT BINOMIAL ----------------------------------------- */
function handleNeedsGenusNameAndReturnAlertMsg(elem, tag, fLvl, fieldName) {
    const genus = _u('getSelTxt', ['Genus']);
    $('#DisplayName_row input').change(clearAlert.bind(null, elem, fLvl));
    return `<span>Species must begin with the Genus name "${genus}".</span>`;
}
/* ---------------- MUST HAVE GENUS PARENT ---------------------------------- */
/** Note: Alert generated in the sub-form and the msg is added to the 'top' form. */
function handleNeedsGenusParentAndReturnAlertMsg(elem, tag, fLvl, fieldName) {
    return '<span>Please select a genus parent for the species taxon.</span>';
}
function clrNeedsGenusPrntAlert(elem, fLvl, e) {
    _u('setSelVal', ['Rank', $('#sel-Rank').data('rank')]);
}
/* -------------- PARENT MUST BE HIGHER RANK -------------------------------- */
function handleNeedsHigherRankPrntAndReturnAlertMsg(elem, tag, fLvl, fieldName) {
    return '<span>The parent taxon must be at a higher taxonomic rank.</span>';
}
/* -------------- TAXON MUST BE HIGHER RANK -------------------------------- */
function handleNeedsHigherRankAndReturnAlertMsg(elem, tag, fLvl, fieldName) {
    $('#chng-prnt').attr({'disabled': true}).css({'opacity': '.6'});
    return '<div>Taxon rank must be higher than that of child taxa.</div>';
}
/** Resets the taxon's rank. */
export function clrNeedsHigherRank(elem, fLvl, e, taxonRank) {
    const txnRank = taxonRank || $('#sel-Rank').data('rank');
    _u('setSelVal', ['Rank', $('#sel-Rank').data('rank'), 'silent']);
    clearAlert($('#Taxon_alert')[0], fLvl);
    enableChngPrntBtttn();
}
/** Enables the button if the change-parent form isn't already open. */
function enableChngPrntBtttn() {
    if ($('#sub-form').length ) { return; }
    $('#chng-prnt').attr({'disabled': false}).css({'opacity': '1'});
}
/* ------------------- NEEDS FAMILY ----------------------------------------- */
function handleNoFamilyAndReturnAlertMsg(elem, tag, fLvl, fieldName) {
    window.setTimeout(() => clearAlert(elem, fLvl), 2000);
    return '<span>Please select a family before creating a genus.</span>';
}
/* ----------------------- NEEDS GENUS -------------------------------------- */
function handleNoGenusAndReturnAlertMsg(elem, tag, fLvl, fieldName) {
    window.setTimeout(() => clearAlert(elem, fLvl), 2000);
    return '<span>Please select a genus before creating a species.</span>';
}
/* ===================== SHOW ALERT ========================================= */
/** Returns the validation alert container for the passed field|form. */
function getAlertElem(fieldName, fLvl) {                            /*dbug-log*///console.log("getAlertElem for %s", fieldName);
    const field = fieldName.split(' ').join('');  //[fLvl]_alert for form-validation alerts
    const elem = $('#'+field+'_alert')[0];
    $(elem).addClass(fLvl+'-active-alert');
    return elem;
}
function showAlert(elem, msg, tag, fLvl) {                          /*dbug-log*///console.log('showAlert. args = %O', arguments)
    elem.innerHTML = msg;
    $(elem).append(getAlertExitBttn(tag, elem, fLvl));
    _elems('toggleSubmitBttn', ['#'+fLvl+'-submit', false]);
}
function getAlertExitBttn(tag, elem, fLvl) {
    const onFieldClear = getFieldValAlertHandler(tag, 'clear');
    if (onFieldClear === false) { return []; }
    const bttn = _elems('getExitButton');
    bttn.className += ' alert-exit';
    $(bttn).off('click').click(clearFieldAlert.bind(null, onFieldClear, elem, fLvl));
    return bttn;
}
/* ===================== CLEAR ALERT ======================================== */
function clearFieldAlert(fieldHandler, elem, fLvl) {
    if (fieldHandler) { fieldHandler(elem, fLvl); }
    clearAlert(elem, fLvl);
}
function clrFormLvlAlert(elem, fLvl) {
    $('#'+fLvl+'_alert').remove();
    _elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
}
/* ------------------------ DEFAULT HANDLER --------------------------------- */
export function clearAlert(elem, fLvl, enableSubmit = true) {       /*dbug-log*///console.log('clearAlert. [%O] innerHTML = [%s] bool? ', elem, elem.innerHTML, !!elem.innerHTML)
    $(elem).fadeTo(200, 0, clearAndEnableSubmit);

    function clearAndEnableSubmit() {
        clearAlertElem(elem, fLvl);
        enableSubmitIfFormReady(fLvl, enableSubmit);
    }
}
function clearAlertElem(elem, fLvl) {
    $(elem).removeClass(fLvl+'-active-alert');
    if (elem.innerHTML) { elem.innerHTML = ''; }
    $(elem).fadeTo(0, 1);
}
function enableSubmitIfFormReady(fLvl, enableSubmit) {
    if (!$('#'+fLvl+'-form').length || !_elems('hasOpenSubForm', [fLvl])) { return; }
    if (!enableSubmit) { return; }
    _elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
}