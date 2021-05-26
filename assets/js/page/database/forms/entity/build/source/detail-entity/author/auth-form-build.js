/**
 * Author form-build.
 *
 * Export
 *     initCreateForm
 *     initEditForm
 *
 * TOC
 *     INIT FORM
 *         CREATE
 *         EDIT
 *         SHARED
 *     FINISH BUILD
 */
import { _cmbx } from '~util';
import { _elems, _form, _state } from '~form';
import * as sForm from '../../src-form-main.js';
import * as aForm from './auth-form-main.js';
/* ======================= INIT FORM ======================================== */
/* --------------------------- CREATE --------------------------------------- */
/** Init form when a new author|editor name is entered into the combobox. */
export function initCreateForm(cnt, aType, v) {                     /*perm-log*/console.log('           >--init [%s][%s] Form - [%s]', cnt, aType, v);
    const p = getCreateFormParams();                                /*dbug-log*///console.log('--params[%O]', p);
    return _elems('initSubForm', [p])
        .then(status => finishFormInit(status, p));

    function getCreateFormParams() {
        const fLvl = _state('getSubFormLvl', ['sub2']);
        return {
            action: 'create',
            appendForm: form => $('#'+aType+cnt+'_f')[0].append(form),
            combo: aType+cnt,
            cnt: cnt,
            name: aType,
            group: fLvl,
            onFormClose: resetOnCreateFormCancel.bind(null, fLvl, aType, cnt),
            style: 'sml-sub-form',
            submit: getSubmitFunc(fLvl),
            vals: { 'LastName': (v === 'create' ? '' : v) }
        };
    }
}
function resetOnCreateFormCancel(fLvl, type, cnt) {                 /*dbug-log*///console.log('--resetOnCreateFormCancel [%s][%s][%s]', fLvl, type, cnt);
    _elems('ifParentFormValidEnableSubmit', [fLvl]);
    aForm.ifNoneStillSelectedEnableOtherType(type, _state('getSubFormLvl', ['sub']), cnt);
    _cmbx('resetCombobox', [type + cnt]);
}
/* ---------------------------- EDIT ---------------------------------------- */
export function initEditForm(id) {                                  /*perm-log*/console.log('           >--Author EDIT Form id[%s]', id);
   const p = getEditFormParams();                                   /*dbug-log*///console.log('   --params[%O]', p);
    return _elems('initForm', [p])
        .then(status => finishFormInit(status, p));

    function getEditFormParams() {
        const fLvl = _state('getSubFormLvl', ['sub2']);
        return {
            action: 'edit',
            group: 'top',
            id: id,
            name: 'Author',
            style: 'sml-form',
            submit: getSubmitFunc('top')
        };
    }
}
/* ------------------------ SHARED ------------------------------------------ */
function getSubmitFunc(fLvl) {
    return sForm.showSubmitModal.bind(null, fLvl);
}
/* ======================= FINISH BUILD ===================================== */
function finishFormInit(status, p) {                                /*dbug-log*///console.log('-finishFormInit status[%s] p[%O]', status, p);
    if (!p.status) { return; } //Error handled elsewhere
    _elems('toggleSubmitBttn', [p.group]);
    $('#LastName_f .f-input').focus();
}