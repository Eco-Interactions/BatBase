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

export function initPublisherForm(v) {                              /*perm-log*/console.log('       /--initPublisherForm [%s]', v);
    const fLvl = getSubFormLvl('sub2');
    return _elems('initSubForm', [getPublFormParams(fLvl, v)])
        .then(status => appendPublFormAndFinishBuild(fLvl, status));
}
function getPublFormParams(fLvl, v) {
    return {
        appendForm: form => $('#Publisher_f').append(form),
        entity: 'Publisher',
        fLvl: fLvl,
        pSel: '#sel-Publisher',
        style: 'sml-sub-form',
        submit: sForm.showSubmitModal.bind(null, fLvl),
        vals: { DisplayName: v === 'create' ? '' : v }
    };
}
function appendPublFormAndFinishBuild(fLvl, status) {
    if (!status) { return; } //Error handled elsewhere
    const pLvl = getNextFormLevel('parent', fLvl);
    _elems('toggleSubmitBttn', [pLvl, false]);
    $('#DisplayName_f input').focus();
}
export function onPublSelection(val) {
    if (val === 'create') { return initPublisherForm(val); }
}