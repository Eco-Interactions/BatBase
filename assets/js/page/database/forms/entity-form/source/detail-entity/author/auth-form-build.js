/**
 * When a user enters a new author|editor into the combobox, a create form is built
 * and appended to the field's row.
 *
 *
 * Export
 *     initAuthOrEdForm
 *
 * TOC
 *     BUILD CREATE FORM
 */
import { _cmbx } from '~util';
import { _elems, _form, getSubFormLvl } from '~form';
import * as sForm from '../../src-form-main.js';
import * as aForm from './auth-form-main.js';

const a = {};

function setLclAuthData(aType, cnt, fLvl) {
    a.type = aType;
    a.cnt = cnt;
    a.fLvl = fLvl;
}
/* ======================== BUILD CREATE FORM =============================== */
export function initAuthOrEdForm(cnt, aType, v) {                   /*perm-log*/console.log('           /--init [%s][%s] Form - [%s]', cnt, aType, v);
    const pId = '#sel-'+aType+cnt;
    const fLvl = getSubFormLvl('sub2');
    setLclAuthData(aType, cnt, fLvl);
    if (_form('ifFormInUse', [fLvl])) { return _form('alertInUse', [fLvl]); }
    return sForm.initEntitySubForm(aType, fLvl, getNameData(v), pId)
        .then(appendAuthFormAndFinishBuild);
}
function appendAuthFormAndFinishBuild(form) {                       /*dbug-log*///console.log('--appendAuthFormAndFinishBuild [%s][%s][%s]form[%O]', a.fLvl, a.type, a.cnt, form);
    $('#'+a.type+a.cnt+'_f')[0].append(form);
    handleSubmitBttns(a.type,a.fLvl);
    $('#LastName_f input').focus();
}
function handleSubmitBttns() {
    $(`#${a.fLvl}-cancel`).click(resetOnCreateFormCancel);
    sForm.addConfirmationBeforeSubmit(a.type, a.fLvl);
    _elems('toggleSubmitBttn', [a.fLvl]);
}
function resetOnCreateFormCancel() {
    _elems('ifParentFormValidEnableSubmit', [a.fLvl]);
    aForm.ifNoneStillSelectedEnableOtherType(a.type, getSubFormLvl('sub'), a.cnt);
    _cmbx('resetCombobox', [a.type+a.cnt]);
}
function getNameData(v) {
    return { 'LastName': (v === 'create' ? '' : v) };
}