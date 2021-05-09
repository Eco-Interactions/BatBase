/**
 * When either source-type fields are regenerated or the form fields are toggled
 * between all available fields and the default shown, the fields that can
 * not be reset as easily as simply setting a value in the form input during
 * reinitiation are handled here.
 *
 * Export
 *     fillComplexFormFields
 */
import { _form, _state } from '~form';
/** [fillComplexFormFields description] */
export function fillComplexFormFields(fLvl) {                       /*dbug-log*///console.log('--fillComplexFormFields [%s]', fLvl);
    const fieldData = _state('getFormState', [fLvl, 'fields']);
    const fieldHndlrs = { 'multiSelect': getMultiSelectHandler() };
    const fields = Object.keys(fieldData).filter(f => fieldData[f].type in fieldHndlrs);
    return fields.reduce(fillAllComplexFieldsWithData, Promise.resolve());

    function fillAllComplexFieldsWithData(p, field) {               /*dbug-log*///console.log('  --fillAllComplexFieldsWithData p[%O] field[%O]', p, fieldData[field]);
        if (!fieldData[field].shown) { return p; }
        const type = fieldData[field].type;
        const val = fieldData[field].value;
        const handler = fieldHndlrs[type].bind(null, [field, val, fLvl]);
        return p.then(handler);
    }
}
function getMultiSelectHandler() {
    return _form.bind(null, 'selectExistingAuthsOrEds');
}