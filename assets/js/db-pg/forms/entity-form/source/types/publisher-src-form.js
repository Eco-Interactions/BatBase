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
        return _val('openSubFormErr', ['Publisher', null, fLvl]);
    }
    return sForm.initEntitySubForm('publisher', fLvl, {'DisplayName': val}, '#Publisher-sel')
    .then(appendPublFormAndFinishBuild);

    function appendPublFormAndFinishBuild(form) {
        $('#Publisher_row').append(form);
        _elems('toggleSubmitBttn', ['#'+prntLvl+'-submit', false]);
        $('#DisplayName_row input').focus();
        sForm.addConfirmationBeforeSubmit('publisher', fLvl);
    }
}
export function onPublSelection(val) {
    if (val === 'create') { return initPublisherForm(val); }
}