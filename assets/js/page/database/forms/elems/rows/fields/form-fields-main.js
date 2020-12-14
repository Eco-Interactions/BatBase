/**
 * Builds and manages the form fields.
 *
 * Export
 *     getFieldInput
 *     buildMultiSelectElem
 *     fillComplexFormFields
 *     getCurrentFormFieldVals
 *     ifAllRequiredFieldsFilled
 *     initFormCombos
 *     resetFormCombobox
 *     toggleFormFields
 *
 * TOC
 *     INIT FORM-FIELDS
 *     TOGGLE FORM-FIELDS
 *     GET FIELD-DATA
 *     FILL FORM-FIELD DATA
 *     IF REQUIRED FIELDS FILLED
 */
import { _u } from '~util';
import { _elems, _form, _state } from '~form';
import * as fields from './input/input-main.js';
/* ==================== INIT FORM-FIELDS ================================== */
export function getFieldInput() {
    return fields.getFieldInput(...arguments);
}
export function buildMultiSelectElem() {
    return fields.buildMultiSelectElem(...arguments);
}
export function initFormCombos() {
    fields.initFormCombos(...arguments);
}
export function resetFormCombobox() {
    fields.resetFormCombobox(...arguments);
}
/* ==================== TOGGLE FORM-FIELDS ================================== */
/**
 * Toggles between displaying all fields for the entity and only showing the
 * default (required and suggested) fields.
 */
export function toggleFormFields(entity, fLvl, fVals) {
    updateFormMemoryOnFieldToggle(fLvl);
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
function updateFormMemoryOnFieldToggle(fLvl) {
    const isChecked = $(`#${fLvl}-all-fields`)[0].checked;
    _state('setFormProp', [fLvl, 'expanded', isChecked]);
    _state('setFormProp', [fLvl, 'reqElems', []]);
}

/* ======================= GET FIELD-DATA =================================== */
/** Returns an object with field names(k) and values(v) of all form fields*/
export function getCurrentFormFieldVals(fLvl) {
    const fieldData = _state('getFormProp', [fLvl, 'fieldData']);
    const vals = {};
    for (let field in fieldData) {
        vals[field] = fieldData[field].val;
    }                                                               /*dbug-log*///console.log('getCurrentFormFieldVals fieldsData = %O returnedVals = %O', fieldData, vals);
    return vals;
}
/* ================== FILL FORM-FIELD DATA ================================== */
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
/* ================== IF REQUIRED FIELDS FILLED ============================= */
/** Returns true if all the required elements for the current form have a value. */
export function ifAllRequiredFieldsFilled(fLvl) {
    const reqElems = _state('getFormProp', [fLvl, 'reqElems']);     /*dbug-log*///console.log("   ->-> ifAllRequiredFieldsFilled... [%s] = %O", fLvl, reqElems)
    return reqElems.every(isRequiredFieldFilled.bind(null, fLvl));
}
/** Note: checks the first input of multiSelect container elems.  */
function isRequiredFieldFilled(fLvl, elem) {
    if ($('.'+fLvl+'-active-alert').length) { return false; }       /*dbug-log*///console.log('       --checking [%s] = %O, value ? ', elem.id, elem, getElemValue(elem));
    return getElemValue(elem);

    function getElemValue(elem) {
        return elem.value ? true :
            elem.id.includes('-cntnr') ? isCntnrFilled(elem) : false;
    }
}
/**
 * Returns true if the first field of the author/editor container has a value.
 * For book publications, either authors or editors are required. If there is
 * no author value, the first editor value is returned instead.
 */
function isCntnrFilled(elem) {                                      /*dbug-log*///console.log('isCntnrFilled? elem = %O', elem);
    return isAFieldSelected('Authors') || isAFieldSelected('Editors');
}
function isAFieldSelected(entity) {                                 /*dbug-log*///console.log('[%s] field = %O', entity, $('#sel-cntnr-'+entity)[0]);
    if (!$('#sel-cntnr-'+entity).length) { return false; } //When no editor select is loaded.
    const fields = $('#sel-cntnr-'+entity)[0].firstChild.children;/*dbug-log*///c//console.log('fields = %O', fields);
    let isSelected = false;
    $.each(fields, (i, field) => { if ($(field).val()) { isSelected = true; } });
    return isSelected;
}