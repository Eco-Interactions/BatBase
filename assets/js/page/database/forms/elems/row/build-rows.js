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
import { _el, _u } from '~util';
import { _elems } from '~form';

/**
 * Returns rows for the entity form fields. If the form is a source-type,
 * the type-entity form config is used.
 * NOTE: FIRST METHOD IN INTERACTION FORM FIELD-ROW BUILD CHAIN.
 */
/** @return {ary} Rows for each field in the entity field obj. */
export function getFormFieldRows(viewConfg) {                       /*dbug-log*///console.log("+--getFormFieldRows [%O]",viewConfg);
    return Promise.all(viewConfg.map(getFormRow))
        .then(rows => rows);
}
function getFormRow(f) {                                            /*dbug-log*///console.log("   --getFormRow[%O]", f);
    const row = _el('getElem', ['div', { class: 'row' }]);
    $(row).data('field-cnt', getRowFieldCnt(f)); //used for styling
    return Promise.all(getRowFields(f))
        .then(appendFieldsAndReturnRow.bind(null, row));
}
function appendFieldsAndReturnRow(row, elems) {                     /*dbug-log*///console.log("   --appendFieldsAndReturnRow row[%O] elems[%O]", elems);
    $(row).append(...elems);
    return row;
}
function getRowFields(fs) {                                          /*dbug-log*///console.log("       @--getRowFields[%O]", fs);
    return Array.isArray(fs) ? getMultiFieldRow(fs) : [getFormField(fs)];

    function getMultiFieldRow(r) {
        return r.map(f => f.fields ? getStackedFields(f) : getFormField(f));
    }
    function getStackedFields(fObj) {
        const row = _el('getElem', ['div', { class: 'flex-col' }]);
        const fConfgs = Object.values(fObj.fields);
        return Promise.all(fConfgs.map(getFormField))
            .then(appendFieldsAndReturnRow.bind(null, row));
    }
    function getFormField(fConfg) {                                 /*dbug-log*///console.log("           --getFormField[%O]", fConfg);
        return _elems('buildFormField', [fConfg]);
    }
}
function getRowFieldCnt(f) {
    return Array.isArray(f) ? f.length : 1;
}
