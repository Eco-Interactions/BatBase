/**
 * Publisher-form code.
 * When a user enters a new publisher into the combobox, the create form is built
 * and appended to the field's row.
 *
 * Export
 *     initPublisherForm
 *     onPublSelection
 */
import { _elems, _val, getSubFormLvl, getNextFormLevel } from '../../../forms-main.js';
import * as sForm from '../src-form-main.js';

export function initPublisherForm(value) {                          /*perm-log*/console.log('       /--initPublisherForm [%s]', value);
    const val = value === 'create' ? '' : value;
    const fLvl = getSubFormLvl('sub2');
    const prntLvl = getNextFormLevel('parent', fLvl);
    if ($('#'+fLvl+'-form').length !== 0) {
        return _val('openSubFormAlert', ['Publisher', fLvl]);
    }
    return sForm.initEntitySubForm('publisher', fLvl, {'DisplayName': val}, '#sel-Publisher')
    .then(appendPublFormAndFinishBuild);

    function appendPublFormAndFinishBuild(form) {
        $('#Publisher_f').append(form);
        _elems('toggleSubmitBttn', ['#'+prntLvl+'-submit', false]);
        $('#DisplayName_f input').focus();
        sForm.addConfirmationBeforeSubmit('publisher', fLvl);
    }
}
export function onPublSelection(val) {
    if (val === 'create') { return initPublisherForm(val); }
}