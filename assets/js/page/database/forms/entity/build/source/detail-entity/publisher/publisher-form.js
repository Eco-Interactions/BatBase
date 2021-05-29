/**
 * Publisher-form code.
 * When a user enters a new publisher into the combobox, the create form is built
 * and appended to the field's row.
 *
 * Export
 *     initCreateForm
 *     onPublSelection
 *
 * TOC
 *     ON SELECTION
 *     INIT FORM
 *         CREATE
 *         EDIT
 *         SHARED
 *     FINISH BUILD
 */
import { _elems, _form, _state, _val } from '~form';
import * as sForm from '../../src-form-main.js';
/* ======================= ON SELECTION ===================================== */
export function onPublSelection(fLvl, val) {
    if (val === 'create') { return initCreateForm(val); }
    _state('setFieldState', [fLvl, 'ParentSource', val]);
}
/* ======================= INIT FORM ======================================== */
/* --------------------------- CREATE --------------------------------------- */
export function initCreateForm(v) {                                 /*perm-log*/console.log('       /--initCreateForm [%s]', v);
    const p = getCreateFormParams(v);
    return _elems('initSubForm', [p])
        .then(status => finishFormInit(p, status));
}
function getCreateFormParams(v) {
    const cParams = {
        appendForm: form => $('#Publisher_f').append(form),
        combo: 'Publisher',
        style: 'sml-sub-form',
        vals: { DisplayName: v === 'create' ? '' : v }
    };
    return { ...cParams, ...getFormParams(_state('getSubFormLvl', ['sub2']), 'create') };
}
/* ---------------------------- EDIT ---------------------------------------- */
export function initEditForm(id) {
   const p = getEditFormParams(id);                                 /*dbug-log*///console.log('   --params[%O]', p);
    return _elems('initForm', [p])
        .then(status => finishFormInit(p, status));
}
function getEditFormParams(id) {
    const eParams = {
        id: id,
        style: 'sml-form',
    };
    return { ...eParams, ...getFormParams('top', 'edit') };
}
/* ---------------------------- SHARED -------------------------------------- */
function getFormParams(fLvl, action) {
    return {
        action: action,
        name: 'Publisher',
        group: fLvl,
        submit: sForm.showSubmitModal.bind(null, fLvl),
    };
}
/* ======================== FINISH BUILD ==================================== */
function finishFormInit(p, status) {
    if (!status) { return; } //Error handled elsewhere
    $('#DisplayName_f input').focus();
}