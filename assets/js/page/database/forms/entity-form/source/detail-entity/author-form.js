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
import { _elems, _val, getSubFormLvl, getNextFormLevel } from '~form';
import * as sForm from '../src-form-main.js';
/* ------------------------ AUTHOR CREATE ----------------------------------- */
/**
 * When a user enters a new author|editor into the combobox, a create form is built
 * and appended to the field's row.
 */
export function initAuthOrEdForm(authCnt, authType, value) {        /*perm-log*/console.log('           /--init [%s][%s] Form - [%s]', authType, authCnt, value);
    const pId = '#sel-'+authType+authCnt;
    const fLvl = getSubFormLvl('sub2');
    if ($('#'+fLvl+'-form').length !== 0) {
        return _val('openSubFormAlert', [authType+authCnt, fLvl]);
    }
    const val = value === 'create' ? '' : value;
    const singular = _u('lcfirst', [authType.slice(0, -1)]);
    return sForm.initEntitySubForm(singular, fLvl, {'LastName': val}, pId)
    .then(appendAuthFormAndFinishBuild);

    function appendAuthFormAndFinishBuild(form) {
        $('#'+authType+'_f').append(form);
        handleSubmitBttns();
        $('#FirstName_f input').focus();
    }
    function handleSubmitBttns() {
        $('#'+fLvl+'-cancel').click(resetOnCreateFormCancel);
        sForm.addConfirmationBeforeSubmit(singular, fLvl);
        _elems('toggleSubmitBttn', [`#${fLvl}-submit`]);
    }
    function resetOnCreateFormCancel() {
        _elems('ifParentFormValidEnableSubmit', [fLvl]);
        toggleOtherAuthorTypeSelect(authType, true);
        _cmbx('resetCombobox', [authType+authCnt]);
    }
}
/* ======================= SELECT AUTHORS|EDITORS =========================== */
/** Loops through author object and adds each author/editor to the form. */
export function selectExistingAuthsOrEds(field, authObj, fLvl) {       /*dbug-log*///console.log('selectExistingAuthsOrEds. args = %O', arguments);
    if (ifFieldNotShownOrNoValToSelect(field, authObj)) { return Promise.resolve(); }
    toggleOtherAuthorTypeSelect(field, false);
    return Object.keys(authObj).reduce((p, ord) => { //p(romise), (author-)ord(er)
        const selNextAuth = selectAuthor.bind(null, ord, authObj[ord], field, fLvl);
        return p.then(selNextAuth);
    }, Promise.resolve());
}
function ifFieldNotShownOrNoValToSelect(field, authObj) {
    return !Object.keys(authObj).length || !$(`#${field}_f-cntnr`).length;
}
/** Selects the passed author and builds a new, empty author combobox. */
function selectAuthor(cnt, authId, field, fLvl) {                   /*dbug-log*///console.log('selectAuthor. args = %O', arguments)
    if (!$('#sel-'+field+cnt).length) { return Promise.resolve(); } //field hidden for certain citation types
    _elems('setSilentVal', [fLvl, field+cnt, authId]);
    return buildNewAuthorSelect(++cnt, authId, fLvl, field);
}
/* ----------------------- ON AUTHOR|EDITOR SELECTION ----------------------- */
/** Loops through author object and adds each author/editor to the form. */
/**
 * When an author is selected, a new author combobox is initialized underneath
 * the last author combobox, unless the last is empty. The total count of
 * authors is added to the new id.
 * Note: If create form selected from dropdown, the count of that combo is used.
 */
export function onAuthAndEdSelection(selCnt, authType, val) {       /*dbug-log*///console.log('onAuthAndEdSelection [%s][%s] = [%s]', authType, selCnt, val);
    let cnt = $(`#${authType}_f-cntnr`).data('cnt');
    const fLvl = getSubFormLvl('sub');
    if (val === '' || parseInt(val) === NaN) { return handleFieldCleared(authType, cnt); }
    if (cnt === 1) { toggleOtherAuthorTypeSelect(authType, false);  }
    if (val === 'create') { return initAuthOrEdForm(selCnt, authType, val); }
    if (lastAuthComboEmpty(cnt, authType)) { return; }
    buildNewAuthorSelect(cnt+1, val, fLvl, authType);

    function handleFieldCleared(authType, cnt) {
        syncWithOtherAuthorTypeSelect(authType);
        sForm.handleCitText(fLvl);
        if ($('#sel-'+authType+(cnt-1)).val() === '') {
            removeFinalEmptySelectField(authType, cnt);
        }
    }
}
function syncWithOtherAuthorTypeSelect(authType) {
    if ($('#sel-'+authType+'1').val()) { return; } //There are no selections in this type.
    toggleOtherAuthorTypeSelect(authType, true);
}
function removeFinalEmptySelectField(authType, cnt) {
    $('#sel-'+authType+cnt)[0].selectize.destroy();
    $('#sel-'+authType+cnt)[0].parentNode.remove();
    $(`#${authType}_f-cntnr`).data('cnt', --cnt);
}
/** Stops the form from adding multiple empty combos to the end of the field. */
function lastAuthComboEmpty(cnt, authType) {
    const comboVal = $('#sel-'+authType+cnt).val();
    return comboVal === '' || comboVal === 'new';
}
function toggleOtherAuthorTypeSelect(type, enable) {
    const entity = type === 'Author' ? 'Editor' : 'Author';
    if (!$(`#${entity}_f-cntnr`).length) { return; }
    _cmbx('enableFirstCombobox', [entity, enable]);
}
/* ------------------ BUILD NEXT COMBO -------------------------------------- */
/** Builds a new, empty author combobox */
function buildNewAuthorSelect(cnt, val, prntLvl, authType) {        /*dbug-log*///console.log('buildNewAuthorSelect[%s][%s]', authType, cnt)
    return _elems('buildMultiSelectInput', [null, authType, prntLvl, cnt])
        .then(appendNewAuthSelect);

    function appendNewAuthSelect(sel) {
        $(`#${authType}_f-cntnr`).append(sel).data('cnt', cnt);
        _cmbx('initCombobox', [getAuthSelConfg(authType, cnt)]);
    }
}
function getAuthSelConfg(authType, cnt) {
    return {
        create: initAuthOrEdForm.bind(null, cnt, authType),
        onChange: onAuthAndEdSelection.bind(null, cnt, authType),
        id: '#sel-'+authType+cnt,
        confgName: authType+cnt,
        name: authType.slice(0, -1) //removes 's' for singular type
    };
}