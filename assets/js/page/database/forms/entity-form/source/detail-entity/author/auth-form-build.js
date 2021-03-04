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
/* ======================== BUILD CREATE FORM =============================== */
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
        _elems('toggleSubmitBttn', [fLvl]);
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