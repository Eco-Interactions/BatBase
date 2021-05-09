/**
 * TODO: Document
 *
 */
import { _state } from '~form';
import * as fill from './complex-fields.js';
import * as rebuild from './rebuild-fields.js';
import * as style from './style-field.js';
import * as toggle from './toggle-fields.js';

export function setDynamicFieldStyles() {
    style.setDynamicFieldStyles(...arguments);
}
export function ifMutlipleDisplaysGetToggle() {
    return toggle.ifMutlipleDisplaysGetToggle(...arguments);
}
export function rebuildFieldsOnFormConfgChanged() {
    return rebuild.rebuildFieldsOnFormConfgChanged(...arguments);
}
/* =================== SET FORM-FIELD DATA ================================== */
/**
 * When either source-type fields are regenerated or the form fields are toggled
 * between all available fields and the default shown, the fields that can
 * not be reset as easily as simply setting a value in the form input during
 * reinitiation are handled here.
 */
export function fillComplexFormFields() {
    return fill.fillComplexFormFields(...arguments);
}
/* ================== IF REQUIRED FIELDS FILLED ============================= */
/** Returns true if all the required elements for the current form have a value. */
export function ifAllRequiredFieldsFilled(fLvl) {
    const fields = _state('getFormState', [fLvl, 'fields']);        /*dbug-log*///console.log("+--ifAllRequiredFieldsFilled... [%s][%O]", fLvl, fields);
    return Object.values(fields).every(isRequiredFieldFilled.bind(null, fLvl));
}
/** TODO: checks the first input of multiSelect container elems.  */
function isRequiredFieldFilled(fLvl, field) {                       /*dbug-log*///console.log('       --isRequiredFieldFilled[%s] [%O]', fLvl, field);
    if (!field.required || !field.type) { return true; }
    if (field.value === 'invalid') { return false; }                /*dbug-log*///console.log('       --[%s] = [%O]', field.name, field.value ? field.value : null);
    if (field.type === 'multiSelect') { return getMultiSelectValues(field.value); }
    return field.value;
}
function getMultiSelectValues(values = {}) {
    return Object.keys(values).length ? values : null ;
}