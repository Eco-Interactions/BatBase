/**
 * Builds form-field inputs that save their values to form-memory on value change.
 *
 * EXPORTS:
 *     buildFieldInput            
 *     buildTagField
 *     buildLongTextArea
 *     buildMultiSelectElem
 *     getLocationOpts
 *     getRcrdOpts
 *     getTaxonOpts
 *     getLocationOpts
 *     ifAllRequiredFieldsFilled
 *
 * CODE SECTIONS:
 *     COMBOBOX FACADE
 *     BASIC FIELD INPUTS
 *         INPUT BUILDERS
 *         CHANGE HANDLER
 */

import * as _f from '../../../forms-main.js';
import * as _combos from './combos.js';

/* ====================== COMBOBOX FACADE =================================== */
export function buildMultiSelectElem() {
    return _combos.buildMultiSelectElem(...arguments);
}
export function getRcrdOpts() {
    return _combos.getRcrdOpts(...arguments);
}
export function getTaxonOpts() {
    return _combos.getTaxonOpts(...arguments);
}
export function getLocationOpts() {
    return _combos.getLocationOpts();
}
/* ====================== BUILD BASIC FIELD INPUTS ========================== */
export function buildFieldInput(field, entity, fLvl) {                          //console.log('buildFieldInput. type [%s], entity [%s], field [%s], lvl [%s]', fieldType, entity, field, fLvl);
    return Promise.resolve(getFieldInput())
        .then(finishFieldBuild)

    function getFieldInput() {
        const builders = { 'text': buildTextInput, 'tags': _combos.buildTagField, 
            'select': _combos.buildSelect, 'multiSelect': _combos.buildMultiSelect,  
            'textArea': buildTextArea, 'fullTextArea': buildLongTextArea };
        return builders[field.type](entity, field.name, fLvl);
    } 
    function finishFieldBuild(input) {
        _f.mmry('setFormFieldData', [fLvl, field.name, field.value, field.type]);
        if (field.required) { handleRequiredField(input, fLvl); }
        addFieldOnChangeHandler(entity, input, field.name, fLvl);
        if (field.type != 'multiSelect') { $(input).val(field.value); }
        return input;
    }
}
function getFieldClass(fLvl, fieldType) {  
    const classes = { 'top': 'lrg-field', 'sub': 'med-field', 'sub2': 'med-field' };
    return fieldType === 'long' ? (fLvl === 'top' ? 'xlrg-field top' :
        'xlrg-field') : classes[fLvl];
}
/* ----------------------- INPUT BUIDLERS ----------------------------------- */
function buildTextInput(entity, field, fLvl) { 
    const attr = { 'type': 'text', class: getFieldClass(fLvl) };
    return _f.util('buildElem', ['input', attr]);
}
function buildTextArea(entity, field, fLvl) {                                     
    return _f.util('buildElem', ['textarea', {class: getFieldClass(fLvl) }]);
}
export function buildLongTextArea(entity, field, fLvl) {
    const attr = { class: getFieldClass(fLvl, 'long'), id:field+'-txt' };
    return _f.util('buildElem', ['textarea', attr]);
}
/* --------------------- CHANGE HANDLER ------------------------------------- */
function addFieldOnChangeHandler(entity, input, field, fLvl) {
    ifCitationFormAutoGenerateCitationOnChange(entity, input); 
    if (input.id.includes('-sel-cntnr')) { return; } //change event added during combo build
    $(input).change(storeFieldValue.bind(null, input, field, fLvl, null));   
}
function ifCitationFormAutoGenerateCitationOnChange(entity, input) {
    if (entity === 'citation'){ 
        $(input).change(_f.forms.bind(null, 'handleCitText', [])); 
    }
}
function storeFieldValue(elem, fieldName, fLvl, value, e) {            
    const val = value || $(elem).val();                             
    _f.mmry('setFormFieldData', [fLvl, fieldName, val]);
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
    _f.mmry('addRequiredFieldInput', [fLvl, input]);
}
/**
 * On a required field's change event, the submit button for the element's form 
 * is enabled if all of it's required fields have values and it has no open child 
 * forms. 
 */
function checkRequiredFields(e) {                                               //console.log('checkRequiredFields e = %O', e)
    const fLvl = $(e.currentTarget).data('fLvl');
   _f.elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
}
/** Returns true if all the required elements for the current form have a value. */
export function ifAllRequiredFieldsFilled(fLvl) {                               
    const reqElems = _f.mmry('getFormProp', [fLvl, 'reqElems']);                //console.log("   ->-> ifAllRequiredFieldsFilled... [%s] = %O", fLvl, reqElems)
    return reqElems.every(isRequiredFieldFilled.bind(null, fLvl));
}
/** Note: checks the first input of multiSelect container elems.  */
function isRequiredFieldFilled(fLvl, elem) {                                    
    if ($('.'+fLvl+'-active-errs').length) { return false; }                    //console.log('       --checking [%s] = %O, value ? ', elem.id, elem, getElemValue(elem));
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