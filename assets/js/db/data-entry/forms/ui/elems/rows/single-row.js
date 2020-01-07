import * as _i from '../../../forms-main.js';
/**
 * Each element is built, nested, and returned as a completed row. 
 * rowDiv>(errorDiv, fieldDiv>(label, input, [pin]))
 */
export default function buildFormRow(field, input, fLvl, rowClss) {              //console.log('building form row for [%s], req? [%s]', field, isReq);
    const rowDiv = buildRowContainer(field, input, fLvl, rowClss);
    const errorDiv = _i.util('buildElem', ['div', { id: field+'_errs'}]); 
    const fieldCntnr = buildFieldContainer(input, field, fLvl);   
    $(rowDiv).append([errorDiv, fieldCntnr]);
    return rowDiv;
} 
function buildRowContainer(field, input, fLvl, rowClss) {
    const attr = { class: getRowClasses(), id: field + '_row'}
    return _i.util('buildElem', ['div', attr]);
    /** Returns the style classes for the row. */
    function getRowClasses() { 
        const rowClass = input.className.includes('xlrg-field') ? 
            'full-row' : (fLvl + '-row') + (rowClss ? (' '+rowClss) : '');      //console.log("rowClass = ", rowClass)
        return rowClass; 
    }
}
function buildFieldContainer(input, field, fLvl) {
    const cntnr = _i.util('buildElem', ['div', { class: 'field-row flex-row'}]);
    const label = buildFieldLabel(input, field);
    const pin = fLvl === 'top' ? getPinElem(field) : null;  
    $(cntnr).append([label, input, pin]);
    return cntnr;
}
function buildFieldLabel(input, field) {
    const attr = { id: field+'-lbl', class: getLabelClass(), text: getFieldName()}; 
    return _i.util('buildElem', ['label', attr]);
    
    function getLabelClass() {
        return $(input).data('fLvl') ? 'required' : '';
    }
    function getFieldName() {
        const fieldName = field.replace(/([A-Z])/g, ' $1'); //Adds space between pascal-cased words
        return _i.util('ucfirst', [fieldName]).trim();
    }
}
function getPinElem(field) {
    const pin = buildPinElem(field);
    handledRelatedFieldPins(pin, field);
    return pin;
}
function buildPinElem(field) {
    const attr = {type: 'checkbox', id: field+'_pin', class: 'top-pin'};
    const pin = _i.util('buildElem', ['input', attr]);
    _i.util('addEnterKeypressClick', [pin]);
    return pin;
}
function handledRelatedFieldPins(pin, field) {
    const relFields = ['CitationTitle', 'Country-Region', 'Location', 'Publication'];
    if (relFields.indexOf(field) !== -1) { $(pin).click(checkConnectedFieldPin); }
}
/**
 * When a dependent field is pinned, the connected field will also be pinned.
 * If the connected field is unpinned, the dependant field is as well.
 */
function checkConnectedFieldPin() {
    const field = this.id.split("_pin")[0]; 
    const params = {
        'CitationTitle': { checked: true, relField: 'Publication' },
        'Country-Region': { checked: false, relField: 'Location' },
        'Location': { checked: true, relField: 'Country-Region' },
        'Publication': { checked: false, relField: 'CitationTitle' },
    }
    checkFieldPins(this, params[field].checked, params[field].relField);
}
function checkFieldPins(curPin, checkState, relField) {
    if (curPin.checked === checkState) {
        if ($('#'+relField+'_pin')[0].checked === checkState) { return; }
        $('#'+relField+'_pin')[0].checked = checkState;
    }
}
/**
 * Required field's have a 'required' class added which appends '*' to their 
 * label. Added to the input elem is a change event reponsible for enabling/
 * disabling the submit button and a form-level data property. The input elem
 * is added to the form param's reqElems property. 
 */
function ifRequiredFieldAddAsterisk(label, input) {
    if (!$(input).data('fLvl')) { return; }
    $(label).addClass('required');  
}