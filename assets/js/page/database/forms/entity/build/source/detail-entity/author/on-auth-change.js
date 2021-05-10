/**
 * When an author is selected, a new author combobox is initialized underneath
 * the last author combobox, unless the last is empty. The total count of
 * authors is added to the new id.
 *
 * Export
 *     onAuthAndEdSelection
 *     enableOtherField
 *
 * TOC
 *     ON AUTHOR|EDITOR SELECTION
 *     ON FIELD CLEARED
 *     SYNC AUTH-TYPE FIELDS
 *         UPDATE OTHER AUTH-TYPE UI
 *             FIELD WIDTH
 *             FIELD LABEL
 */
import { _cmbx, _u } from '~util';
import { _state, _val } from '~form';
import * as sForm from '../../src-form-main.js';
import * as aForm from './auth-form-main.js';
/* ======================= ON AUTHOR|EDITOR SELECTION ======================= */
/**
 * Note: If create form selected from dropdown, the count of that combo is used.
 * @param  {num} cnt      Order count Bound to input on init
 * @param  {str} aType    Author||Editor
 * @param  {num} v        ID of selected entity
 */
export function onAuthAndEdSelection(cnt, aType, v) {               /*dbug-log*///console.log('+--onAuthAndEdSelection [%s][%s] = [%s]', cnt, aType, v);
    const fLvl = _state('getSubFormLvl', ['sub']);
    const ttl = _state('getFieldState', [fLvl, aType, 'count']);    /*dbug-log*///console.log('       --ttl[%s]', ttl);
    if (v === '' || parseInt(v) === NaN) { return onFieldClear(aType, fLvl, ttl, cnt); }
    if (ttl === 1) { enableOtherField(aType, fLvl, false);  }
    if (v === 'create') { return aForm.initCreateForm(cnt, aType, v); }
    if (aForm.isDynamicFieldEmpty(aType, ttl)) { return; }
    aForm.buildNewAuthorSelect(fLvl, aType, ttl+1);
    ifPreviousAlertClearIt(aType, fLvl);
}
/* ======================= ON FIELD CLEARED ================================= */
/** [onFieldClear description] */
function onFieldClear(aType, fLvl, ttl, cnt) {                      /*dbug-log*///console.log('--onFieldClear [%s] cleared[%s] ttl[%s]', aType, cnt, ttl);
    sForm.handleCitText(fLvl);
    if (!aForm.isDynamicFieldEmpty(aType, ttl)) { return handleBlanks(aType, fLvl); }
    ifNoneStillSelectedEnableOtherType(aType, fLvl, cnt);
    aForm.removeAuthField(aType, ttl--);
    handleEmptyFields(aType, fLvl, ttl, cnt);
}
function handleEmptyFields(aType, fLvl, ttl, cnt) {
    removeExtraEmptyFields(aType, ttl, cnt);
    handleBlanks(aType, cnt, fLvl);
}
/** [ifFinalFieldEmptyRemove description] */
function removeExtraEmptyFields(aType, ttl) {                       /*dbug-log*///console.log('--removeExtraEmptyFields ttl[%s] cleared[%s]', ttl);
    while (ttl > 1 && aForm.isDynamicFieldEmpty(aType, ttl)) {
        if (ttl > 2 && aForm.isDynamicFieldEmpty(aType, ttl-1)) { return; }/*dbug-log*///console.log('  --Removing [%s]', ttl);
        aForm.removeAuthField(aType, ttl--);
    }
}
/* ------------------ HANDLE BLANKS IN ORDER -------------------------------- */
/**
 * Author/editor fields must have all fields filled continuously. There can
 * be no blanks in the selected order. If found, an alert is shown to the user.
 */
function handleBlanks(aType, cnt, fLvl) {
    const vals = _state('getFieldState', [fLvl, aType]);            /*dbug-log*///console.log('--handleBlanks [%s][%O]', aType, vals);
    let blank = checkForBlanks(vals, cnt);
    if (blank !== 'found') { return; }
    alertBlank(aType, fLvl);
    return true;
}
function checkForBlanks(vals, cleared) {
    let blanks = false;
    checkValsForBlanks();
    return blanks;

    function checkValsForBlanks() {
        for (let ord in vals) {                                     /*dbug-log*///console.log('    --ord[%s] val[%s] blanks[%s]?', ord, vals[ord], blanks)
            if (vals[ord] === null || ord == cleared) {
                blanks = blanks ? 'found' : 'maybe';
            } else {
                if (blanks) { blanks = 'found'; }
            }
        }
    }
}
function alertBlank(aType, fLvl) {
    const alertTags = { Author: 'fillAuthBlanks', Editor: 'fillEdBlanks' };
     _val('showFormValAlert', [aType, alertTags[aType], fLvl]);
}
function ifPreviousAlertClearIt(aType, fLvl) {
    if (!$('#'+aType+'_alert.'+fLvl+'-active-alert')) { return; }
    _val('clrContribFieldAlert', [aType, fLvl]);
}
/* ====================== SYNC AUTH-TYPE FIELDS ============================= */
/** [ifNoneStillSelectedEnableOtherType description] */
export function ifNoneStillSelectedEnableOtherType(aType, fLvl, clearedCnt) {/*dbug-log*///console.log('--ifNoneStillSelectedEnableOtherType lvl[%s] type[%s] cleared[%s]', fLvl, aType, clearedCnt);
    if (ifTypeStillSelected(aType, fLvl, clearedCnt)) { return; }
    enableOtherField(aType, fLvl, true);
}
function ifTypeStillSelected(aType, fLvl, clearedCnt) {
    const fVals = _state('getFieldState', [fLvl, aType]);           /*dbug-log*///console.log('--ifTypeStillSelected lvl[%s] type[%s] vals[%O]', fLvl, aType, _u('snapshot', [fVals]));
    if (fVals[clearedCnt]) { fVals[clearedCnt] = null; } //val store change event could happen after this check
    return Object.values(fVals).find(v => v);
}
/* -------------------- UPDATE OTHER AUTH-TYPE UI --------------------------- */
/** [enableOtherField description] */
export function enableOtherField(type, fLvl, enable) {              /*dbug-log*///console.log('--enableOtherField [%s][%s][%s]', type, fLvl, enable);
    const other = type === 'Author' ? 'Editor' : 'Author';
    if (!_state('isFieldShown', [fLvl, other])) { return; }
    _cmbx('enableFirstCombobox', [other, enable]);
    updateOtherTypeUi(other, enable);
    _state('setFieldState', [fLvl, other, enable, 'required']);
}
/** [updateOtherTypeUi description] */
function updateOtherTypeUi(oType, enable) {                         /*dbug-log*///console.log('--updateOtherTypeUi [%s][%s]', oType, enable);
    setOtherFieldWidth(oType, enable);
    showOtherLabelElem(oType, enable);
}
/* --------------------------------------------------- FIELD WIDTH ---------- */
/** [setOtherFieldWidth description] */
function setOtherFieldWidth(oType, enable) {
    const base = $(`#${oType}_f-cntnr`).css('flex-basis').slice(0, -1);
    const nBase = enable ? base*3 : base/3;                         /*dbug-log*///console.log('--showOtherLabel [%s][%s] oW[%s] nW[%s]', oType, enable, base, nBase);
    $(`#${oType}_f-cntnr`).css({'flex-basis': nBase+'%'});
}
/* --------------------------------------------------- FIELD LABEL ---------- */
/** [showOtherLabelElem description] */
function showOtherLabelElem(oType, enable) {
    const val = enable ? 'block' : 'none';
    $(`#${oType}_f-cntnr label`).css({display: val});
}