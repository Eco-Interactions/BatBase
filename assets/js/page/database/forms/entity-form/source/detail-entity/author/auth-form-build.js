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
    const fLvl = getSubFormLvl('sub2');
    setLclAuthData(aType, cnt, fLvl);
    return _elems('initSubForm', [getFormParams(fLvl, cnt, aType, v)])
        .then(finishAuthFormInit);
}
function getFormParams(fLvl, cnt, aType, v) {
    return {
        appendForm: form => $('#'+a.type+a.cnt+'_f')[0].append(form),
        entity: aType,
        fLvl: fLvl,
        onFormClose: resetOnCreateFormCancel,
        combo: aType+cnt,
        style: 'sml-sub-form',
        submit: sForm.showSubmitModal.bind(null, fLvl),
        vals: { 'LastName': (v === 'create' ? '' : v) }
    };
}
function finishAuthFormInit(status) {                              /*dbug-log*///console.log('--appendAuthFormAndFinishBuild [%s][%s][%s]form[%O]', a.fLvl, a.type, a.cnt, form);
    if (!status) { return; } //Error handled elsewhere
    _elems('toggleSubmitBttn', [a.fLvl]);
    $('#LastName_f input').focus();
}
function resetOnCreateFormCancel() {                                /*dbug-log*///console.log('--resetOnCreateFormCancel [%s][%s][%s]', a.fLvl, a.type, a.cnt);
    _elems('ifParentFormValidEnableSubmit', [a.fLvl]);
    aForm.ifNoneStillSelectedEnableOtherType(a.type, getSubFormLvl('sub'), a.cnt);
    _cmbx('resetCombobox', [a.type+a.cnt]);
}