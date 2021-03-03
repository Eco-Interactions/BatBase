/**
 * Author-form code.
 * When a user enters a new author|editor into the combobox, the create form is built
 * and appended to the field's row. When an author is selected, a new author combobox
 * is initialized underneath the last author combobox, unless the last is empty.
 *
 * Export
 *     initAuthOrEdForm
 *     onAuthAndEdSelection
 *     selectExistingAuthsOrEds
 *
 * TOC
 *     AUTHOR CREATE
 *     SELECT AUTHORS|EDITORS
 *         ON AUTHOR|EDITOR SELECTION
 *         BUILD NEXT COMBO
 */
import { _cmbx, _u } from '~util';
import { _elems, _form, _state, _val, getSubFormLvl, getNextFormLevel } from '~form';
import * as sForm from '../../src-form-main.js';
/* ------------------------ AUTHOR CREATE ----------------------------------- */
/**
 * When a user enters a new author|editor into the combobox, a create form is built
 * and appended to the field's row.
 */
export function initAuthOrEdForm(authCnt, aType, v) {               /*perm-log*/console.log('           /--init [%s][%s] Form - [%s]', authCnt, aType, v);
    const pId = '#sel-'+aType+authCnt;
    const fLvl = getSubFormLvl('sub2');
    if (_form('ifFormInUse', [fLvl])) { return _form('alertInUse', [fLvl]); }

    return sForm.initEntitySubForm(aType, fLvl, getNameData(v), pId)
        .then(appendAuthFormAndFinishBuild);

    function appendAuthFormAndFinishBuild(form) {
        $('#'+aType+'_f').append(form);
        handleSubmitBttns();
        $('#FirstName_f input').focus();
    }
    function handleSubmitBttns() {
        $(`#${fLvl}-cancel`).click(resetOnCreateFormCancel);
        sForm.addConfirmationBeforeSubmit(aType, fLvl);
        _elems('toggleSubmitBttn', [`#${fLvl}-submit`]);
    }
    function resetOnCreateFormCancel() {
        _elems('ifParentFormValidEnableSubmit', [fLvl]);
        enableOtherField(aType, fLvl, true);
        _cmbx('resetCombobox', [aType+authCnt]);
    }
}
function getNameData(v) {
    return { 'LastName': (v === 'create' ? '' : v) };
}
/* ======================= SELECT AUTHORS|EDITORS =========================== */
/** Loops through author object and adds each author/editor to the form. */
export function selectExistingAuthsOrEds(aType, authObj, fLvl) {       /*dbug-log*///console.log('selectExistingAuthsOrEds. args = %O', arguments);
    if (ifFieldNotShownOrNoValToSelect(aType, authObj)) { return Promise.resolve(); }
    enableOtherField(aType, fLvl, false);
    return Object.keys(authObj).reduce((p, ord) => { //p(romise), (author-)ord(er)
        const selNextAuth = selectAuthor.bind(null, ord, authObj[ord], aType, fLvl);
        return p.then(selNextAuth);
    }, Promise.resolve());
}
function ifFieldNotShownOrNoValToSelect(aType, authObj) {
    return !Object.keys(authObj).length || !$(`#${aType}_f-cntnr`).length;
}
/** Selects the passed author and builds a new, empty author combobox. */
function selectAuthor(cnt, authId, aType, fLvl) {                   /*dbug-log*///console.log('selectAuthor. args = %O', arguments)
    if (!_state('isFieldShown', [fLvl, aType])) { return Promise.resolve(); }
    _elems('setSilentVal', [fLvl, aType+cnt, authId]);
    return buildNewAuthorSelect(++cnt, fLvl, aType);
}
/* ----------------------- ON AUTHOR|EDITOR SELECTION ----------------------- */
/** Loops through author object and adds each author/editor to the form. */
/**
 * When an author is selected, a new author combobox is initialized underneath
 * the last author combobox, unless the last is empty. The total count of
 * authors is added to the new id.
 * Note: If create form selected from dropdown, the count of that combo is used.
 * @param  {num} cnt      Order count Bound to input on init
 * @param  {str} aType    Author||Editor
 * @param  {num} v        ID of selected entity
 */
export function onAuthAndEdSelection(cnt, aType, v) {               /*dbug-log*///console.log('+--onAuthAndEdSelection [%s][%s] = [%s]', cnt, aType, v);
    const fLvl = getSubFormLvl('sub');
    if (v === '' || parseInt(v) === NaN) { return onFieldClear(aType, fLvl); }
    if (cnt === 1) { enableOtherField(aType, fLvl, false);  }
    if (v === 'create') { return initAuthOrEdForm(cnt, aType, v); }
    buildNewAuthorSelect(cnt+1, fLvl, aType);
}
/* ---------------------- SELECTION CLEARED --------------------------------- */
/** [onFieldClear description] */
function onFieldClear(aType, fLvl) {
    syncWithOtherAuthorTypeSelect(aType, fLvl);
    sForm.handleCitText(fLvl);
    ifFinalFieldEmptyRemove(aType);
}
function syncWithOtherAuthorTypeSelect(aType, fLvl) {
    if ($(`#sel-${aType}1`).val()) { return; } //There are no selections in this type.
    enableOtherField(aType, fLvl, true);
}
/** [ifFinalFieldEmptyRemove description] */
function ifFinalFieldEmptyRemove(aType) {
    const fCnt = $(`#${aType}_f-cntnr`).data('cnt');                /*dbug-log*///console.log('-- ifFinalFieldEmptyRemove[%s][%s]', aType, fCnt);
    if (_cmbx('getSelVal', [aType+fCnt])) { return; }
    _cmbx('destroySelectizeInstance', [aType+fCnt]);
    $('#'+aType+fCnt+'_f').remove();
    $(`#${aType}_f-cntnr`).data('cnt', fCnt-1);
}
/** [enableOtherField description] */
function enableOtherField(type, fLvl, enable) {
    const other = type === 'Author' ? 'Editor' : 'Author';
    if (!_state('isFieldShown', [fLvl, type])) { return; }
    _cmbx('enableFirstCombobox', [other, enable]);
    showOtherLabel(other, enable);
}
function showOtherLabel(oType, enable) {
    setOtherFieldWidth(oType, enable);
    showOtherLabelElem(oType, enable);
}
function setOtherFieldWidth(oType, enable) {
    const base = $(`#${oType}_f-cntnr`).css('flex-basis').slice(0, -1);
    const nBase = enable ? base*3 : base/3;                         /*dbug-log*///console.log('--showOtherLabel [%s][%s] oW[%s] nW[%s]', oType, enable, base, nBase);
    $(`#${oType}_f-cntnr`).css({'flex-basis': nBase+'%'});
}
function showOtherLabelElem(oType, enable) {
    const val = enable ? 'block' : 'none';
    $(`#${oType}_f-cntnr label`).css({display: val});
}
/* ------------------ BUILD NEXT COMBO -------------------------------------- */
/** Builds a new, empty author combobox */
function buildNewAuthorSelect(cnt, fLvl, aType) {                   /*dbug-log*///console.log('buildNewAuthorSelect[%s][%s]', aType, cnt);
    const fConfg = _u('snapshot', _state('getFormFieldData', [fLvl, aType]));
    fConfg.count = cnt;
    fConfg.required = false
    return _elems('buildDynamicFormField', [fConfg])
        .then(f => appendNewAuthSelect(f, aType, cnt));
}
function appendNewAuthSelect(field, aType, cnt) {
    $(`#${aType}_f-cntnr .cntnr`).append(field);
    $(`#${aType}_f-cntnr`).data('cnt', cnt);
    _cmbx('initCombobox', [getAuthSelConfg(aType, cnt)]);
}
function getAuthSelConfg(aType, cnt) {
    return {
        create: initAuthOrEdForm.bind(null, cnt, aType),
        onChange: onAuthAndEdSelection.bind(null, cnt, aType),
        id: '#sel-'+aType+cnt,
        confgName: aType+cnt,
        name: aType
    };
}