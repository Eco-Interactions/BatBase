/**
 * Handles form row builds.
 *
 * Exports:
 *     buildFormRow
 *     buildFormRows
 *     getFormFieldRows
 *     setCoreRowStyles
 */
import { _u } from '../../../db-main.js';
import { _elems } from '../../forms-main.js';
import * as fields from './fields/form-fields-main.js';
import buildFormRow from './form-row.js';
import getRowConfg from './row-confg.js';

/* ============================== FIELDS ==================================== */
export function buildFieldInput() {
    return fields.buildFieldInput(...arguments);
}
export function toggleFormFields() {
    return fields.toggleFormFields(...arguments);
}
/* -------------------- REQUIRED FIELDS ------------------------------------- */
export function ifAllRequiredFieldsFilled() {
    return fields.ifAllRequiredFieldsFilled(...arguments);
}
/*---------------------- FILL FORM-DATA --------------------------------------*/
export function getCurrentFormFieldVals(fLvl) {
    return fields.getCurrentFormFieldVals(fLvl);
}
export function fillComplexFormFields(fLvl) {
    return fields.fillComplexFormFields(fLvl);
}
/* ============================== ROWS ====================================== */
export function setCoreRowStyles(formId, rowClass) {
    const w = $(formId).innerWidth() / 2 - 3;
    $(rowClass).css({'flex': '0 1 '+w+'px', 'max-width': w});
}
/**
 * Builds and returns the default fields for entity sub-form and returns the
 * row elems. Inits the params for the sub-form in the global mmry obj.
 */
export function buildFormRows(entity, fVals, fLvl, params) {        /*dbug-log*///console.log('buildFormRows. args = %O', arguments);
    return getFormFieldRows(entity, fVals, fLvl)
        .then(returnFinishedRows);

    function returnFinishedRows(rows) {
        let id = entity+'_Rows';
        if ($('#'+id).length) { id = id+'_'+fLvl;  }
        const attr = { id: id, class: 'flex-row flex-wrap'};
        const rowCntnr = _u('buildElem', ['div', attr]);
        $(rowCntnr).append(rows);
        return rowCntnr;
    }
}
/**
 * Returns rows for the entity form fields. If the form is a source-type,
 * the type-entity form config is used.
 */
export function getFormFieldRows(entity, fVals, fLvl) {             /*dbug-log*///console.log('getFormFieldRows [%s][%s] = %O', entity, fLvl, fVals);
    const fObj = getRowConfg(_u('lcfirst', [entity]), fLvl);        /*dbug-log*///console.log('getFormFieldRows [%s] = %O', entity, fObj);
    return buildRows(fObj, entity, fVals, fLvl);
}
/** @return {ary} Rows for each field in the entity field obj. */
function buildRows(fieldObj, entity, fVals, fLvl) {                 /*dbug-log*///console.log("buildRows. [%s][%s] fields = [%O]", entity, fLvl, fieldObj);
    return Promise.all(fieldObj.order.map(f => {
        return Array.isArray(f) ? buildMultiFieldRow(f) : buildSingleFieldRow(f);
    }));

    function buildMultiFieldRow(fields) {                           /*dbug-log*///console.log('buildMultiFieldRow = %O', fields);
        const cntnr = _u('buildElem', ['div', { class: 'full-row flex-row cntnr-row' }]);
        const rows = fields.map(buildSingleFieldRow);
        return Promise.all(rows).then(appendRows).then(() => cntnr);

        function appendRows(rows) {
            rows.forEach(row => $(cntnr).append(row));
        }
    }
    function buildSingleFieldRow(field) {                           /*dbug-log*///console.log('buildSingleFieldRow [%s]', field);
        return buildRowField(field, fieldObj, entity, fVals, fLvl);
    }
}
/**
 * @return {div} Form field row with required-state and value (if passed) set.
 */
function buildRowField(field, fieldsObj, entity, fVals, fLvl) {     /*dbug-log*///console.log("buildRow. field [%s], fLvl [%s], fVals = %O, fieldsObj = %O", field, fLvl, fVals, fieldsObj);
    const fieldData = getFieldData();
    return _elems('buildFieldInput', [fieldData, entity, fLvl])
        .then(buildField);

    function getFieldData() {
        return {
            info: fieldsObj.info[field] || '',
            name: field,
            required: fieldsObj.required.indexOf(field) !== -1,
            type: fieldsObj.fields[field],
            value: fVals[field] ? fVals[field] :
                (fieldsObj.fields[field] == 'multiSelect' ? {} : null)
        }
    }
    function buildField(input) {                                    /*dbug-log*///console.log('input = %O', input);
        return buildFormRow(_u('ucfirst', [field]), input, fLvl, "", fieldData.info);
    }
}