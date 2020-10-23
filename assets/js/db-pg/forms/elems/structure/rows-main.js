/**
 * Handles form row builds.
 *
 * Exports:
 *     buildFormRow
 *     buildFormRows
 *     getFormFieldRows
 */
import { _u } from '../../../db-main.js';
import { _elems } from '../../forms-main.js';
import getFieldConfgs from '../fields/field-confg.js';
import buildFormField from '../fields/form-field.js';

export function buildFormRow() {
    return buildFormField(...arguments);
}
/**
 * Builds and returns the default fields for entity sub-form and returns the
 * row elems. Inits the params for the sub-form in the global mmry obj.
 */
export function buildFormRows(entity, fVals, fLvl, params) {                    //console.log('buildFormRows. args = %O', arguments);
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
export function getFormFieldRows(entity, fVals, fLvl) {
    const fObj = getFieldConfgs(_u('lcfirst', [entity]), fLvl);                 //console.log('getFormFieldRows [%s] = %O', entity, fObj);
    return buildRows(fObj, entity, fVals, fLvl);
}
/** @return {ary} Rows for each field in the entity field obj. */
function buildRows(fieldObj, entity, fVals, fLvl) {                             //console.log("buildRows. [%s][%s] fields = [%O]", entity, fLvl, fieldObj);
    return Promise.all(fieldObj.order.map(f => {
        return Array.isArray(f) ? buildMultiFieldRow(f) : buildSingleFieldRow(f);
    }));

    function buildMultiFieldRow(fields) {                                       //console.log('buildMultiFieldRow = %O', fields);
        const cntnr = _u('buildElem', ['div', { class: 'full-row flex-row cntnr-row' }]);
        const rows = fields.map(buildSingleFieldRow);
        return Promise.all(rows).then(appendRows).then(() => cntnr);

        function appendRows(rows) {
            rows.forEach(row => $(cntnr).append(row));
        }
    }
    function buildSingleFieldRow(field) {                                       //console.log('buildSingleFieldRow [%s]', field);
        return buildRowField(field, fieldObj, entity, fVals, fLvl);
    }
}
/**
 * @return {div} Form field row with required-state and value (if passed) set.
 */
function buildRowField(field, fieldsObj, entity, fVals, fLvl) {                 //console.log("buildRow. field [%s], fLvl [%s], fVals = %O, fieldsObj = %O", field, fLvl, fVals, fieldsObj);
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
    function buildField(input) {                                                //console.log('input = %O', input);
        return buildFormField(_u('ucfirst', [field]), input, fLvl, "", fieldData.info);
    }
}