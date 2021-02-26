/**
 *
 *
 *
 */
import { _form, _state } from '~form';

/**
 * When either source-type fields are regenerated or the form fields are toggled
 * between all available fields and the default shown, the fields that can
 * not be reset as easily as simply setting a value in the form input during
 * reinitiation are handled here.
 *
 */
export function fillComplexFormFields(fLvl) {
    const fieldData = _state('getFormState', [fLvl, 'fieldData']);
    const fieldHndlrs = { 'multiSelect': getMultiSelectHandler() };
    const fields = Object.keys(fieldData).filter(f => fieldData[f].type in fieldHndlrs);
    return fields.reduce(fillAllComplexFieldsWithData, Promise.resolve());

    function fillAllComplexFieldsWithData(p, field) {
        const type = fieldData[field].type;
        const val = fieldData[field].val;
        return p.then(() => fieldHndlrs[type]([field, val, fLvl]));
    }
}
function getMultiSelectHandler() {
    return _form.bind(null, 'selectExistingAuthsOrEds');
}