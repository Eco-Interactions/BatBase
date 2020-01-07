/**
 * Sub-forms, form rows, fiele elements, etc.
 *
 * Exports:         
 *     buildAndAppendForm
 *     getExitButton
 *     getFormFooter       
 *     initSubForm                  
 *     buildFormRows                
 *     getFormFieldRows     
 *     buildFieldInput        
 *     checkReqFieldsAndToggleSubmitBttn    
 *     ifAllRequiredFieldsFilled    
 *     getLocationOpts               
 *     buildFormRow   
 *     buildLongTextArea
 *     getRcrdOpts      
 *     getTaxonOpts     
 *     buildMultiSelectElems
 */
import * as _i from '../../forms-main.js';
import * as _base from './forms/base-form.js';
import * as _fields from './fields/fields-main.js';
import * as _rows from './rows/rows-main.js';


export function buildAndAppendForm(fields, id) {
    return _base.buildAndAppendRootForm(fields, id);
}
export function getExitButton() {
    return _base.getExitButton();
}
export function getFormFooter() {
    return require('./forms/form-footer.js').default(...arguments);
}
export function initSubForm() {
    return require('./forms/sub-form.js').default(...arguments);
}
export function buildFormRows() {
    return _rows.buildFormRows(...arguments);
}
export function getFormFieldRows() {
    return _rows.getFormFieldRows(...arguments);
}
export function buildFieldInput() {
    return _fields.buildFieldInput(...arguments);
}
export function ifAllRequiredFieldsFilled() {
    return _fields.ifAllRequiredFieldsFilled(...arguments);
}
export function getLocationOpts() {
    return _fields.getLocationOpts();
}
export function getTaxonOpts() {
    return _fields.getTaxonOpts(...arguments);
}
export function getRcrdOpts() {
    return _fields.getRcrdOpts(...arguments);
}
export function buildMultiSelectElem() {
    return _fields.buildMultiSelectElem(...arguments);
}
/**
 * Note: The 'unchanged' property exists only after the create interaction form 
 * has been submitted and before any changes have been made.
 */
export function checkReqFieldsAndToggleSubmitBttn(fLvl) {                       //console.log('### checkingReqFields = %O, fLvl = %s, unchanged? ', input, fLvl, mmry.forms.top.unchanged);
    const state = ifNoOpenSubFormAndAllRequiredFieldsFilled(fLvl);
    _i.ui('toggleSubmitBttn', ['#'+fLvl+'-submit', state]); 
    return state;
}
function ifNoOpenSubFormAndAllRequiredFieldsFilled(fLvl) {  
    return _fields.ifAllRequiredFieldsFilled(fLvl) && 
        !hasOpenSubForm(fLvl) && !locHasGpsData(fLvl);
}
/** Returns true if the next sub-level form exists in the dom. */
function hasOpenSubForm(fLvl) {
    const childFormLvl = _i.getNextFormLevel('child', fLvl);
    return $('#'+childFormLvl+'-form').length > 0;
}
/** Prevents the location form's submit button from enabling when GPS data entered.*/
function locHasGpsData(fLvl) {
    if (_i.mmry('getFormProp', [fLvl, 'entity']) !== 'location') { return false; }
    return ['Latitude', 'Longitude'].some(field => {
        return $(`#${field}_row input`).val();
    });
}