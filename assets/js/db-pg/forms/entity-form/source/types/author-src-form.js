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
import { _u } from '../../../../db-main.js';
import { _elems, _cmbx, _val, getSubFormLvl, getNextFormLevel } from '../../../forms-main.js';
import * as sForm from '../src-form-main.js';
/* ------------------------ AUTHOR CREATE ----------------------------------- */
/**
 * When a user enters a new author|editor into the combobox, a create form is built
 * and appended to the field's row.
 */
export function initAuthOrEdForm(authCnt, value, authType) {        /*dbug-log*///console.log('           /--initAuthOrEdForm [%s][%s] - [%s]', authType, authCnt, value);
    const pId = '#'+authType+'-sel'+authCnt;
    const fLvl = getSubFormLvl('sub2');
    if ($('#'+fLvl+'-form').length !== 0) {
        return _val('openSubFormErr', [authType, pId, fLvl]);
    }
    const val = value === 'create' ? '' : value;
    const singular = _u('lcfirst', [authType.slice(0, -1)]);
    return sForm.initEntitySubForm(singular, fLvl, {'LastName': val}, pId)
    .then(appendAuthFormAndFinishBuild);

    function appendAuthFormAndFinishBuild(form) {
        $('#'+authType+'_row').append(form);
        handleSubmitBttns();
        $('#'+fLvl+'-cancel').click(_cmbx.bind(null, 'clearCombobox', ['#'+authType+'-sel'+authCnt]))
        $('#FirstName_row input').focus();
        sForm.addConfirmationBeforeSubmit(singular, fLvl);
    }
    function handleSubmitBttns() {
        const prntLvl = getNextFormLevel('parent', fLvl);
        _elems('toggleSubmitBttn', ['#'+prntLvl+'-submit', false]);
        _elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
        $('#'+fLvl+'-cancel').click(toggleOtherAuthorTypeSelect.bind(null, authType, true));
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
    return !Object.keys(authObj).length || !$('#'+field+'-sel-cntnr').length;
}
/** Selects the passed author and builds a new, empty author combobox. */
function selectAuthor(cnt, authId, field, fLvl) {                   /*dbug-log*///console.log('selectAuthor. args = %O', arguments)
    if (!$('#'+field+'-sel'+ cnt).length) { return Promise.resolve(); } //field hidden for certain citation types
    _cmbx('setSelVal', ['#'+field+'-sel'+ cnt, authId, 'silent']);
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
export function onAuthAndEdSelection(selCnt, authType, val) {
    let cnt = $('#'+authType+'-sel-cntnr').data('cnt');
    if (val === '' || parseInt(val) === NaN) { return handleFieldCleared(authType, cnt); }
    const fLvl = getSubFormLvl('sub');
    if (cnt === 1) { toggleOtherAuthorTypeSelect(authType, false);  }
    if (val === 'create') { return initAuthOrEdForm(selCnt, val, authType); }
    if (lastAuthComboEmpty(cnt, authType)) { return; }
    buildNewAuthorSelect(cnt+1, val, fLvl, authType);

    function handleFieldCleared(authType, cnt) {
        syncWithOtherAuthorTypeSelect(authType);
        sForm.handleCitText(fLvl);
        if ($('#'+authType+'-sel'+(cnt-1)).val() === '') {
            removeFinalEmptySelectField(authType, cnt);
        }
    }
}
function syncWithOtherAuthorTypeSelect(authType) {
    if ($('#'+authType+'-sel1').val()) { return; } //There are no selections in this type.
    toggleOtherAuthorTypeSelect(authType, true);
}
function removeFinalEmptySelectField(authType, cnt) {
    $('#'+authType+'-sel'+cnt)[0].selectize.destroy();
    $('#'+authType+'-sel'+cnt)[0].parentNode.remove();
    $('#'+authType+'-sel-cntnr').data('cnt', --cnt);
}
/** Stops the form from adding multiple empty combos to the end of the field. */
function lastAuthComboEmpty(cnt, authType) {
    return $('#'+authType+'-sel'+cnt).val() === '';
}
function toggleOtherAuthorTypeSelect(type, enable) {
    const entity = type === 'Authors' ? 'Editors' : 'Authors';
    if (!$('#'+entity+'-sel-cntnr').length) { return; }
    _cmbx('enableFirstCombobox', ['#'+entity+'-sel-cntnr', enable]);
}
/* ------------------ BUILD NEXT COMBO -------------------------------------- */
/** Builds a new, empty author combobox */
function buildNewAuthorSelect(cnt, val, prntLvl, authType) {        /*dbug-log*///console.log('buildNewAuthorSelect')
    return _cmbx('buildMultiSelectElem', [null, authType, prntLvl, cnt])
        .then(appendNewAuthSelect);

    function appendNewAuthSelect(sel) {
        $('#'+authType+'-sel-cntnr').append(sel).data('cnt', cnt);
        _cmbx('initSingle', [getAuthSelConfg(authType, cnt), prntLvl]);
    }
}
function getAuthSelConfg(authType, cnt) {
    return {
        add: initAuthOrEdForm.bind(null, cnt, authType),
        change: onAuthAndEdSelection.bind(null, cnt, authType),
        id: '#'+authType+'-sel'+cnt,
        name: authType.slice(0, -1) //removes 's' for singular type
    };
}