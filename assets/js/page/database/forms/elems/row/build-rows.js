/**
 *
 * TODO: DOCUMENT
 *
 * Export
 *     getFormFieldRows
 *
 * TOC
 *     FIELDS FACADE
 */
import { _el } from '~util';
import { _elems } from '~form';

/**
 * Returns rows for the entity form fields. If the form is a source-type,
 * the type-entity form config is used.
 * NOTE: FIRST METHOD IN INTERACTION FORM FIELD-ROW BUILD CHAIN.
 */
/** @return {ary} Rows for each field in the entity field obj. */
export function getFormFieldRows(confg) {                             /*dbug-log*/console.log("getFormFieldRows [%O]",confg);
    return Promise.all(confg.fields.map(getFormRow))
        .then(rows => rows);
}
function getFormRow(f) {                                            /*dbug-log*/console.log("getFormRow[%O]", f);
    const row = _el('getElem', ['div', { class: 'row' }]);
    $(row).data('field-cnt', getRowFieldCnt(f)); //used for styling
    return Promise.all(getRowFields(f))
        .then(appendFieldsAndReturnRow);

    function appendFieldsAndReturnRow(elems) {
        $(row).append(...elems);
        return row;
    }
}
function getRowFields(f) {                                          /*dbug-log*/console.log("getRowFields[%O]", f);
    return Array.isArray(f) ? f.map(getFormField) : [getFormField(f)];

    function getFormField(fConfg) {                                 /*dbug-log*/console.log("getFormField[%O]", fConfg);
        return _elems('buildFormField', [fConfg]);
    }
}
function getRowFieldCnt(f) {
    return Array.isArray(f) ? f.length : 1;
}