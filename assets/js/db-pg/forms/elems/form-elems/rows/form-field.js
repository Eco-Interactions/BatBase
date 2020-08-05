/**
 * Builds a single form-row.
 */
import { _u } from '../../../../db-main.js';
/**
 * Each element is built, nested, and returned as a completed row.
 * rowDiv>(errorDiv, fieldDiv>(label, input, [pin]))
 */
export default function buildFormField(field, input, fLvl, rowClss, info) {              //console.log('building form row for [%s], req? [%s]', field, isReq);
    const rowDiv = buildRowContainer(field, input, fLvl, rowClss);
    const errorDiv = _u('buildElem', ['div', { id: field+'_errs'}]);
    const fieldCntnr = buildField(input, field, fLvl, info);
    $(rowDiv).append([errorDiv, fieldCntnr]);
    return rowDiv;
}
function buildRowContainer(field, input, fLvl, rowClss) {
    const attr = { class: getRowClasses(), id: field + '_row'}
    return _u('buildElem', ['div', attr]);
    /** Returns the style classes for the row. */
    function getRowClasses() {
        const rowClass = input.className.includes('xlrg-field') ?
            'full-row' : (fLvl + '-row') + (rowClss ? (' '+rowClss) : '');      //console.log("rowClass = ", rowClass)
        return rowClass;
    }
}
function buildField(input, field, fLvl, info) {
    const cntnr = buildFieldContainer(fLvl, info);
    const label = buildFieldLabel(input, field);
    const pin = fLvl === 'top' ? getPinElem(field) : null;
    $(cntnr).append([label, input, pin]);
    return cntnr;
}
/**
 * Note: The formLvl class is used for the form-specific tutorials.
 */
function buildFieldContainer(fLvl, info) {
    const attr = { class: 'field-row flex-row '+fLvl+'-intro', title: info};
    const cntnr = _u('buildElem', ['div', attr]);
    if (info) { $(cntnr).attr('data-intro', info); }
    return cntnr;
}
function buildFieldLabel(input, field) {
    const attr = { id: field+'-lbl', class: getLabelClass(), text: getFieldName()};
    return _u('buildElem', ['label', attr]);

    function getLabelClass() {
        return $(input).data('fLvl') ? 'required' : '';
    }
    function getFieldName() {
        const fieldName = field.replace(/([A-Z])/g, ' $1'); //Adds space between pascal-cased words
        return _u('ucfirst', [fieldName]).trim();
    }
}
function getPinElem(field) {
    const pin = buildPinElem(field);
    handledRelatedFieldPins(pin, field);
    return pin;
}
function buildPinElem(field) {
    const attr = {type: 'checkbox', id: field+'_pin', class: 'top-pin'};
    const pin = _u('buildElem', ['input', attr]);
    _u('addEnterKeypressClick', [pin]);
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