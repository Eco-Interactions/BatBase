/**
 * Builds form-field inputs that save their values to form-memory on value change.
 *
 * EXPORTS:
 *     buildFieldInput
 *     buildTagField
 *     buildLongTextArea
 *     ifAllRequiredFieldsFilled
 *
 * TOC:
 *     BASIC FIELD INPUTS
 *         INPUT BUILDERS
 *             INPUT
 *             TEXTAREA
 *             COMBOBOX
 *         HTML VALIDATION
 *             COORDINATES
 *             URL
 *             PAGE
 *             YEAR
 *             SHARED
 *         CHANGE HANDLER
 */
import { _u } from '../../../../db-main.js';
import { _state, _elems, _cmbx, _form } from '../../../forms-main.js';

/* ============================ BUILD FIELD INPUTS ========================== */
export function buildFieldInput(field, entity, fLvl) {                          //console.log('buildFieldInput. [%s] = %O, lvl [%s]', field.name, field, fLvl);
    return Promise.resolve(getFieldInput())
        .then(finishFieldBuild)
        .then(handleFieldValidation)

    function getFieldInput() {
        const builders = {
            doi:            buildInput,
            fullTextArea:   buildLongTextArea,
            lat:            buildInput,
            lng:            buildInput,
            multiSelect:    buildCombobox.bind(null, field.type),
            num:            buildNumberInput,
            page:           buildInput,
            select:         buildCombobox.bind(null, field.type),
            tags:           buildCombobox.bind(null, field.type),
            text:           buildInput,
            textArea:       buildTextArea,
            url:            buildUrlInput,
            year:           buildNumberInput
        };
        return builders[field.type](entity, field.name, fLvl);
    }
    function finishFieldBuild(input) {
        _state('setFormFieldData', [fLvl, field.name, field.value, field.type]);
        if (field.required) { handleRequiredField(input, fLvl); }
        addFieldOnChangeHandler(entity, input, field.name, fLvl);
        if (field.type != 'multiSelect') { $(input).val(field.value); }
        return input;
    }
    function handleFieldValidation(input) {
        const map = {
            lng: setLongitudePattern, lat: setLatitudePattern,
            page: setPageRange,       doi: setDoiPattern,
            url: setHttpPatternAndPlaceholder,  year: setYearCharLength
        };
        return !map[field.type] ? input : map[field.type](input, fLvl);
    }
}
/* ----------------------- INPUT BUIDLERS ----------------------------------- */
function getFieldClass(fLvl, fieldKey) {
    const classes = { 'top': 'lrg-field', 'sub': 'med-field', 'sub2': 'med-field' };
    return fieldKey === 'long' ? (fLvl === 'top' ? 'xlrg-field top' :
        'xlrg-field') : classes[fLvl];
}
/* ---------- INPUT --------- */
function buildInput(entity, field, fLvl, type = 'text') {
    const attr = { type: type, class: getFieldClass(fLvl) };
    const input = _u('buildElem', ['input', attr]);
    return input;
}
function buildNumberInput(entity, field, fLvl) {
    return buildInput(entity, field, fLvl, 'number');
}
function buildUrlInput(entity, field, fLvl) {
    return buildInput(entity, field, fLvl, 'url');
}
/* ------- TEXTAREA --------- */
function buildTextArea(entity, field, fLvl) {
    return _u('buildElem', ['textarea', {class: getFieldClass(fLvl) }]);
}
export function buildLongTextArea(entity, field, fLvl) {
    const attr = { class: getFieldClass(fLvl, 'long'), id:field+'-txt' };
    return _u('buildElem', ['textarea', attr]);
}
/* ------- COMBOBOX --------- */
function buildCombobox(fieldType, entity, field, fLvl) {
    const map = {
        tags: 'buildTagField', select: 'buildSelect', multiSelect: 'buildMultiSelect'
    };
    return _cmbx(map[fieldType], [entity, field, fLvl]);
}
/* ------------------ HTML VALIDATION --------------------------------------- */
/* ---------- COORDINATES ---------- */
function setLatitudePattern(input, fLvl) {
    return handleCoordPattern(input, fLvl, 'lat');
}
function setLongitudePattern(input, fLvl) {
    return handleCoordPattern(input, fLvl, 'long');
}
function handleCoordPattern(input, fLvl, prefix) {
    const coordRegex = '-?\\d{1,2}(\\.?\\d*)';
    const msg = `Please enter a valid ${prefix}itude.`;
    return addAttrAndValidation(input, { pattern: coordRegex }, msg, fLvl);
}
/* ---------- URL ---------- */
function setHttpPatternAndPlaceholder(input, fLvl) {
    const msg = 'Please enter a valid URL. Ex: https://...';
    const attrs = { pattern: '\\b(https?:\/\/\\S+\.\S*\\b\/?)', placeholder: 'http(s)://...' };
    return addAttrAndValidation(input, attrs, msg, fLvl);
}
function setDoiPattern(input, fLvl) {
    const msg = 'Please enter the full DOI URL. Ex: https://doi.org/10.1111/j.1439';
    const attrs = { pattern: 'https?:\/\/doi.org/\\S+', placeholder: 'https://doi.org/...' };
    return addAttrAndValidation(input, attrs, msg, fLvl);
}
/* ---------- PAGE ---------- */
function setPageRange(input, fLvl) {
    const attrs = { pattern: '^[\\d-]+$', placeholder: 'Ex: ###-###' };
    const msg = 'Please enter page range with no spaces: ###-####';
    return addAttrAndValidation(input, attrs, msg, fLvl);
}
/* ---------- YEAR ---------- */
function setYearCharLength(input, fLvl) {
    const msg = 'Please input a valid year.';
    return addAttrAndValidation(input, { min: 1000, max: 3000 }, msg, fLvl);
}
/* ---------- SHARED ---------- */
function addAttrAndValidation(input, attrs, msg, fLvl) {
    $(input).attr(attrs).change(validateInput.bind(null, msg, fLvl));
    return input;
}
function validateInput(msg, fLvl, e) {                                          //console.log('validateInput. e = %O, msg = [%s]', e, msg);
    const valid = e.currentTarget.checkValidity();                              //console.log('valid ? ', valid)
    if (valid) { return; }
    if (msg) { setCustomInvalidMsg(e.currentTarget, msg, fLvl); }
    e.currentTarget.reportValidity();
    _elems('toggleSubmitBttn', ['#'+fLvl+'-submit', false])
}
function setCustomInvalidMsg(input, msg, fLvl) {  console.log('fLvl = ', fLvl)
    input.setCustomValidity(msg);
    input.oninput = resetValidityMsg.bind(null, fLvl);
}
/* HTML5 validation always fails if a custom validity message is set. */
function resetValidityMsg(fLvl, e) {
    const input = e.currentTarget;                                              //console.log('resetValidityMsg. isValid ? %s = %O', input.validity.valid, input)
    input.setCustomValidity('');
    input.oninput = null;
    _elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
}
/* --------------------- CHANGE HANDLER ------------------------------------- */
function addFieldOnChangeHandler(entity, input, field, fLvl) {
    ifCitationFormAutoGenerateCitationOnChange(entity, input, fLvl);
    if (input.id.includes('-sel-cntnr')) { return; } //change event added during combo build
    $(input).change(storeFieldValue.bind(null, input, field, fLvl, null));
}
function ifCitationFormAutoGenerateCitationOnChange(entity, input, fLvl) {
    if (entity === 'citation'){
        $(input).change(_form.bind(null, 'handleCitText', [fLvl]));
    }
}
function storeFieldValue(elem, fieldName, fLvl, value, e) {                     //console.log('fieldName [%s] field = %O', fieldName, elem);
    const val = value || $(elem).val();
    _state('setFormFieldData', [fLvl, fieldName, val]);
}
/**
 * Required field's have a 'required' class added which appends '*' to their
 * label. Added to the input elem is a change event reponsible for enabling/
 * disabling the submit button and a form-level data property. The input elem
 * is added to the form param's reqElems property.
 */
function handleRequiredField(input, fLvl) {
    $(input).change(checkRequiredFields);
    $(input).data('fLvl', fLvl);
    _state('addRequiredFieldInput', [fLvl, input]);
}
/**
 * On a required field's change event, the submit button for the element's form
 * is enabled if all of it's required fields have values and it has no open child
 * forms.
 */
function checkRequiredFields(e) {                                               //console.log('checkRequiredFields e = %O', e)
    const fLvl = $(e.currentTarget).data('fLvl');
   _elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
}
/** Returns true if all the required elements for the current form have a value. */
export function ifAllRequiredFieldsFilled(fLvl) {
    const reqElems = _state('getFormProp', [fLvl, 'reqElems']);     /*dbug-log*///console.log("   ->-> ifAllRequiredFieldsFilled... [%s] = %O", fLvl, reqElems)
    return reqElems.every(isRequiredFieldFilled.bind(null, fLvl));
}
/** Note: checks the first input of multiSelect container elems.  */
function isRequiredFieldFilled(fLvl, elem) {
    if ($('.'+fLvl+'-active-alert').length) { return false; }                    //console.log('       --checking [%s] = %O, value ? ', elem.id, elem, getElemValue(elem));
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
function isCntnrFilled(elem) {                                                  //console.log('isCntnrFilled? elem = %O', elem);
    return isAFieldSelected('Authors') || isAFieldSelected('Editors');
}
function isAFieldSelected(entity) {                                             //console.log('[%s] field = %O', entity, $('#'+entity+'-sel-cntnr')[0]);
    if (!$('#'+entity+'-sel-cntnr').length) { return false; } //When no editor select is loaded.
    const fields = $('#'+entity+'-sel-cntnr')[0].firstChild.children;           //console.log('fields = %O', fields);
    let isSelected = false;
    $.each(fields, (i, field) => { if ($(field).val()) { isSelected = true; } });
    return isSelected;
}