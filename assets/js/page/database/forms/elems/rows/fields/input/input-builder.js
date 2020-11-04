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

/* ======================= INPUT BUIDLERS =================================== */
export function buildFieldInput(field, entity, fLvl) {
    const builders = {
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
    };
    return builders[field.type](entity, field.name, fLvl)
}
function getFieldClass(fLvl, fieldKey) {
    const classes = { 'top': 'lrg-field', 'sub': 'med-field', 'sub2': 'med-field' };
    return fieldKey === 'long' ? (fLvl === 'top' ? 'xlrg-field top' :
        'xlrg-field') : classes[fLvl];
}
/* ------------------------------- INPUT ------------------------------------ */
function buildInput(entity, field, fLvl, type = 'text') {
    const attr = { type: type, class: getFieldClass(fLvl) };
    const input = _el('getElem', ['input', attr]);
    return input;
}
function buildNumberInput(entity, field, fLvl) {
    return buildInput(entity, field, fLvl, 'number');
}
function buildUrlInput(entity, field, fLvl) {
    return buildInput(entity, field, fLvl, 'url');
}
/* ----------------------------- TEXTAREA ----------------------------------- */
function buildTextArea(entity, field, fLvl) {
    return _el('getElem', ['textarea', {class: getFieldClass(fLvl) }]);
}
export function buildLongTextArea(entity, field, fLvl) {
    const attr = { class: getFieldClass(fLvl, 'long'), id:'txt-'+field };
    return _el('getElem', ['textarea', attr]);
}
/* =================== FINISH INPUT BUILD =================================== */
export function finishFieldBuild(input, field, entity, fLvl) {
    _state('setFormFieldData', [fLvl, field.name, field.value, field.type]);
    if (field.required) { handleRequiredField(input, fLvl); }
    addFieldOnChangeHandler(entity, input, field.name, fLvl);
    if (field.type != 'multiSelect') { $(input).val(field.value); }
    return input;
}
/* ------------------------ CHANGE HANDLER ---------------------------------- */
function addFieldOnChangeHandler(entity, input, field, fLvl) {      /*dbug-log*///console.log('addFieldOnChangeHandler [%s][%s][%s] = %O', fLvl, entity, field, input);
    ifCitationFormAutoGenerateCitationOnChange(entity, input, fLvl);
    if (input.id.includes('sel-cntnr')) { return; } //change event added during combo build
    $(input).change(storeFieldValue.bind(null, input, field, fLvl, null));
}
function ifCitationFormAutoGenerateCitationOnChange(entity, input, fLvl) {
    if (entity === 'citation'){
        $(input).change(_form.bind(null, 'handleCitText', [fLvl]));
    }
}
function storeFieldValue(elem, fieldName, fLvl, value, e) {         /*dbug-log*///console.log('fieldName [%s] field = %O', fieldName, elem);
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
function checkRequiredFields(e) {                                   /*dbug-log*///console.log('checkRequiredFields e = %O', e)
    const fLvl = $(e.currentTarget).data('fLvl');
   _elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
}