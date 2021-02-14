/**
 * Builds form-field inputs that save their values to form-memory on value change
 * and reports whether all required fields are filled.
 *
 * Export
 *     buildFieldInput
 *     finishFieldBuild
 *
 * TOC
 *     INPUT BUILDERS
 *         INPUT
 *         TEXTAREA
 *     FINISH INPUT BUILD
 *         CHANGE HANDLER
 *         REQUIRED FIELDS
 */
import { _el } from '~util';
import { _state, _elems, _form } from '~form';

let entity, field, fLvl, input;
/* ======================= INPUT BUIDLERS =================================== */
export function buildFieldInput(field, entity, fLvl) {              /*dbug-log*///console.log('buildFieldInput [%s][%s] = %O', entity, fLvl, field);
    setInputMemory(field, entity, fLvl);
    return getInput(field.type);
}
function setInputMemory(f = null, e = null, fL = null, i = null) {
    entity = e;
    field = f;
    fLvl = fL;
    input = i;
}
function getInput(type) {
    return {
        doi:            buildInput,
        fullTextArea:   buildLongTextArea,
        lat:            buildInput,
        lng:            buildInput,
        num:            buildNumberInput,
        page:           buildInput,
        text:           buildInput,
        textArea:       buildTextArea,
        url:            buildUrlInput,
        year:           buildNumberInput
    }[type]();
}
/* ------------------------------- INPUT ------------------------------------ */
function buildInput(type = 'text') {
    const attr = { type: type, class: field.class };
    const input = _el('getElem', ['input', attr]);
    return input;
}
function buildNumberInput() {
    return buildInput('number');
}
function buildUrlInput() {
    return buildInput('url');
}
/* ----------------------------- TEXTAREA ----------------------------------- */
function buildTextArea() {
    return _el('getElem', ['textarea', {class: field.class }]);
}
function buildLongTextArea() {
    const attr = { class: getLongTextAreaClass(fLvl), id:'txt-'+field.name };
    return _el('getElem', ['textarea', attr]);
}
function getLongTextAreaClass(fLvl) {
    return 'xlrg-field' + (fLvl === 'top' ? ' top' : '');
}
/* =================== FINISH INPUT BUILD =================================== */
export function finishFieldBuild(input, field, entity, fLvl) {
    setInputMemory(field, entity, fLvl, input);
    _state('setFormFieldData', [fLvl, field.name, field.value, field.type]);
    addFieldOnChangeHandler();
    if (field.required) { handleRequiredField(); }
    if (field.type != 'multiSelect') { $(input).val(field.value); }
    setInputMemory(null);
    return input;
}
/* ------------------------ CHANGE HANDLER ---------------------------------- */
function addFieldOnChangeHandler() {                                /*dbug-log*///console.log('addFieldOnChangeHandler [%s][%s][%s] = %O', fLvl, entity, field.name, input);
    ifCitationFormAutoGenerateCitationOnChange();
    $(input).change(storeFieldValue.bind(null, input, field.name, fLvl, null));
}
function ifCitationFormAutoGenerateCitationOnChange() {
    if (entity === 'citation'){
        $(input).change(_form.bind(null, 'handleCitText', [fLvl]));
    }
}
function storeFieldValue(elem, fieldName, fLvl, value, e) {         /*dbug-log*///console.log('storeFieldValue [%s] field = %O', fieldName, elem);
    const val = value || $(elem).val();
    _state('setFormFieldData', [fLvl, fieldName, val]);
}
/* ----------------------------- REQUIRED FIELDS ---------------------------- */
/**
 * Required field's have a 'required' class added which appends '*' to their
 * label. Added to the input elem is a change event reponsible for enabling/
 * disabling the submit button and a form-level data property. The input elem
 * is added to the form param's reqElems property.
 */
function handleRequiredField() {
    $(input).change(checkRequiredFields);
    $(input).data('fLvl', fLvl);
    _state('addRequiredFieldInput', [fLvl, input]);
}
/**
 * On a required field's change event, the submit button for the element's form
 * is enabled if all of it's required fields have values and it has no open child
 * forms.
 */
function checkRequiredFields(e) {                                   /*dbug-log*///console.log('checkRequiredFields e = %O', e)
    const fLvl = $(e.currentTarget).data('fLvl');
   _elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
}