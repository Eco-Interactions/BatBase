/**
 * Handles form row builds.
 *
 * Exports:
 *     buildFormRow
 *     buildFormRows
 *     getFormFieldRows 
 */
import * as _i from '../../../forms-main.js';

export function buildFormRow() {
    return require('./single-row.js').default(...arguments);
}
/** 
 * Builds and returns the default fields for entity sub-form and returns the 
 * row elems. Inits the params for the sub-form in the global mmry obj.
 */
export function buildFormRows(entity, fVals, fLvl, params) {                    //console.log('buildFormRows. args = %O', arguments)
    return getFormFieldRows(entity, fVals, fLvl)
        .then(returnFinishedRows.bind(null, entity, params));
}
function returnFinishedRows(entity, params, rows) {
    const attr = { id: entity+'_Rows', class: 'flex-row flex-wrap'};
    const rowCntnr = _i.util('buildElem', ['div', attr]);
    $(rowCntnr).append(rows);
    return rowCntnr;
}
/**
 * Returns rows for the entity form fields. If the form is a source-type, 
 * the type-entity form config is used. 
 */
export function getFormFieldRows(entity, fVals, fLvl, params) {
    const fObj = require('./field-confg.js').default(_i.util('lcfirst', [entity]), fLvl);
    return buildRows(fObj, entity, fVals, fLvl);
}
/** @return {ary} Rows for each field in the entity field obj. */
function buildRows(fieldObj, entity, fVals, fLvl) {                             //console.log("buildRows. fLvl = [%s] fields = [%O]", fLvl, fieldObj);
    return Promise.all(fieldObj.order.map(field => {
        return Array.isArray(field) ? 
            buildMultiFieldRow(field) : buildSingleFieldRow(field);
    }));
    
    function buildMultiFieldRow(fields) {                                       //console.log('buildMultiFieldRow = %O', fields);
        const cntnr = _i.util('buildElem', ['div', { class: 'full-row flex-row cntnr-row' }]);
        const rows = fields.reduce(buildAndAppendField, Promise.resolve());
        return rows.then(() => cntnr);

        function buildAndAppendField(p, field) {
            return p.then(() => buildSingleFieldRow(field)
                .then(row => $(cntnr).append(row)));
        }
    }
    function buildSingleFieldRow(field) {                                       //console.log('buildSingleFieldRow [%s]', field);  
        return buildRow(field, fieldObj, entity, fVals, fLvl);
    }
}
/**
 * @return {div} Form field row with required-state and value (if passed) set.  
 */
function buildRow(field, fieldsObj, entity, fVals, fLvl) {                      //console.log("buildRow. field [%s], fLvl [%s], fVals = %O, fieldsObj = %O", field, fLvl, fVals, fieldsObj);
    const fieldData = getFieldData();
    return _i.elems('buildFieldInput', [fieldData, entity, fLvl])
        .then(buildFieldRow);

    function getFieldData() {
        return {
            name: field,
            required: fieldsObj.required.indexOf(field) !== -1,
            type: fieldsObj.fields[field],
            value: fVals[field] ? fVals[field] : 
                (fieldsObj.fields[field] == 'multiSelect' ? {} : null)
        }
    }
    function buildFieldRow(input) {                                             //console.log('input = %O', input);
        return buildFormRow(_i.util('ucfirst', [field]), input, fLvl, "");
    }
} /* End buildRow */ 