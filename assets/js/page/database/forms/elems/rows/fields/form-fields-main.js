/**
 * TOC
 *     TOGGLE FORM-FIELDS
 *     GET FIELD-DATA
 *     FILL FORM-FIELD DATA
 */
import { _u } from '~db';
import { _elems, _form, _state } from '~form';
import * as fields from './input/input-builder.js';

export function buildFieldInput() {
    return fields.buildFieldInput(...arguments);
}
export function ifAllRequiredFieldsFilled() {
    return fields.ifAllRequiredFieldsFilled(...arguments);
}
/* -------------------- TOGGLE FORM-FIELDS ---------------------------------- */
/**
 * Toggles between displaying all fields for the entity and only showing the
 * default (required and suggested) fields.
 */
export function toggleFormFields(entity, fLvl, fVals) {
    updateFormMemoryOnFieldToggle(this.checked, fLvl);
    $('#'+entity+'_Rows').empty();
    _elems('getFormFieldRows', [entity, fVals, fLvl])
    .then(appendAndFinishRebuild);

    function appendAndFinishRebuild(rows) {
        $('#'+entity+'_Rows').append(rows);
        _form('initFormCombos', [_u('lcfirst', [entity]), fLvl]);
        _elems('fillComplexFormFields', [fLvl])
        .then(finishComplexForms);
    }
    function finishComplexForms() {
        const complex = ['citation', 'publication', 'location'];
        if (complex.indexOf(entity) === -1) { return; }
        if (entity !== 'location') { _form('finishSrcFieldLoad', [entity, fVals, fLvl]); }
        _elems('setCoreRowStyles', ['#'+entity+'_Rows', '.'+fLvl+'-row']);
    }
}
function updateFormMemoryOnFieldToggle(isChecked, fLvl) {
    _state('setFormProp', [fLvl, 'expanded', isChecked]);
    _state('setFormProp', [fLvl, 'reqElems', []]);
}

/* ----------------------- GET FIELD-DATA ----------------------------------- */
/** Returns an object with field names(k) and values(v) of all form fields*/
export function getCurrentFormFieldVals(fLvl) {
    const fieldData = _state('getFormProp', [fLvl, 'fieldData']);
    const vals = {};
    for (let field in fieldData) {
        vals[field] = fieldData[field].val;
    }                                                               /*dbug-log*///console.log('getCurrentFormFieldVals fieldsData = %O returnedVals = %O', fieldData, vals);
    return vals;
}
/* ------------------ FILL FORM-FIELD DATA ---------------------------------- */
/**
 * When either source-type fields are regenerated or the form fields are toggled
 * between all available fields and the default shown, the fields that can
 * not be reset as easily as simply setting a value in the form input during
 * reinitiation are handled here.
 */
export function fillComplexFormFields(fLvl) {
    const fieldData = _state('getFormProp', [fLvl, 'fieldData']);
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