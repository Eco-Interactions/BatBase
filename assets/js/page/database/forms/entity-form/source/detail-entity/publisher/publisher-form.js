/**
 * Publisher-form code.
 * When a user enters a new publisher into the combobox, the create form is built
 * and appended to the field's row.
 *
 * Export
 *     initPublisherForm
 *     onPublSelection
 */
import { _elems, _form, _val, getSubFormLvl, getNextFormLevel } from '~form';
import * as sForm from '../../src-form-main.js';

export function initPublisherForm(value) {                          /*perm-log*/console.log('       /--initPublisherForm [%s]', value);
    const val = value === 'create' ? '' : value;
    const fLvl = getSubFormLvl('sub2');
    if (_form('ifFormInUse', [fLvl])) { return _form('alertInUse', [fLvl]); }

    return sForm.initEntitySubForm('publisher', fLvl, {'DisplayName': val}, '#sel-Publisher')
    .then(appendPublFormAndFinishBuild);

    function appendPublFormAndFinishBuild(form) {
        const pLvl = getNextFormLevel('parent', fLvl);
        $('#Publisher_f').append(form);
        _elems('toggleSubmitBttn', [pLvl, false]);
        $('#DisplayName_f input').focus();
        sForm.addConfirmationBeforeSubmit('publisher', fLvl);
    }
}
export function onPublSelection(val) {
    if (val === 'create') { return initPublisherForm(val); }
}