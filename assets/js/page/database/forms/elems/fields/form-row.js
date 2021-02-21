/**
 * Form-row builder.
 * TODO: DOCUMENT
 *
 * Export
 *     buildFormFieldContainer
 *     getFormRows
 *     getFormFieldRows
 *     setCoreRowStyles
 *
 * TOC
 *     FIELDS FACADE
 */
import { _el, _u } from '~util';
import { _confg, _elems } from '~form';
/* ============================== ROWS ====================================== */
/**
 * TODO: SET WIDTH BY NUMBER OF FIELDS IN ROW
 * @param {[type]} entity [description]
 */
export function setCoreRowStyles(entity) {                          /*dbug-log*/console.log('setCoreRowStyles [%s]', entity);
    $(`#${entity}_fields .row`).each((idx, row) => setFieldWidths(row));
}
function setFieldWidths(row) {
    const w = 100 / $(row).data('field-cnt');                       /*dbug-log*/console.log('setFieldWidths row[%O] fieldW[%s]', row, w);
    $(row.childNodes).each((idx, field) => setFieldWidth(field, w));

}
function setFieldWidth(field, w) {                                  /*dbug-log*/console.log('setFieldWidth field[%O][%s]', field, w);
    $(field).css({'width': w+'%'});
}
/**
 * Builds and returns the default fields for entity sub-form and returns the
 * row elems. Inits the params for the sub-form in the global mmry obj.
 */
export function getFormRows(entity, fVals, fLvl, params) {          /*dbug-log*/console.log('getFormRows. args = %O', arguments);
    return getFormFieldRows(entity, fVals, fLvl)
        .then(returnFinishedRows);

    function returnFinishedRows(rows) {
        let id = entity+'_fields';
        if ($('#'+id).length) { id = id+'_'+fLvl;  }
        const attr = { id: id, class: 'flex-row flex-wrap'};
        const rowCntnr = _el('getElem', ['div', attr]);
        $(rowCntnr).append(rows);
        return rowCntnr;
    }
}
/**
 * Returns rows for the entity form fields. If the form is a source-type,
 * the type-entity form config is used.
 * NOTE: FIRST METHOD IN INTERACTION FORM FIELD-ROW BUILD CHAIN.
 */
export function getFormFieldRows(entity, fVals, fLvl) {             /*dbug-log*/console.log('getFormFieldRows [%s][%s] = %O', entity, fLvl, fVals);
    const confg = _confg('getFormConfg', [fVals, entity, fLvl]);    /*dbug-log*/console.log('   --confg[%O]', _u('snapshot', [confg]));
    // add confg to form state
    return buildRows(confg);
}
/* =========================== BUILD ROW ==================================== */
/** @return {ary} Rows for each field in the entity field obj. */
function buildRows(confg) {                                         /*dbug-log*/console.log("buildRows [%O]",confg);
    const track = getFieldTrackObj();
    return Promise.all(confg.fields.map(getFormRow))
        .then(rows => rows);

    function getFormRow(f) {                                        /*dbug-log*/console.log("getFormRow[%O]", f);
        const row = _el('getElem', ['div', { class: 'row' }]);
        $(row).data('field-cnt', getRowFieldCnt(f)); //used for styling
        return Promise.all(getRowFields(f))
            .then(appendFieldsAndReturnRow);

        function appendFieldsAndReturnRow(elems) {
            $(row).append(...elems);
            return row;
        }
    }
    function getRowFields(f) {                                      /*dbug-log*/console.log("getRowFields[%O]", f);
        return Array.isArray(f) ? f.map(getFormField) : [getFormField(f)];

        function getFormField(fConfg) {                             /*dbug-log*/console.log("getFormField[%O]", fConfg);
            if (fConfg.info) { ++track.infoSteps; }
            return Promise.resolve(_elems('buildFormField', [fConfg]))
            //     .then(setFieldState);

            // function setFieldState(field) {                             /*dbug-log*/console.log("   --setFieldState field[%O]", field);
            //     const field = buildFormField(fConfg);                   /*dbug-log*/console.log("   --field[%O]", field);
            //     return field;
            // }
        }
    }
}
function getFieldTrackObj() {
    return {
        infoSteps: 0
    };
}
function getRowFieldCnt(f) {
    return Array.isArray(f) ? f.length : 1;
}


// /**
//  * Returns rows for the entity form fields. If the form is a source-type,
//  * the type-entity form config is used.
//  */
// export function getFormFieldRows(entity, fVals, fLvl) {             /*dbug-log*/console.log('getFormFieldRows [%s][%s] = %O', entity, fLvl, fVals);
//     const fObj = getFormBuildConfg(_u('lcfirst', [entity]), fLvl);        /*dbug-log*/console.log('getFormFieldRows [%s] = %O', entity, fObj);
//     return buildRows(fObj, entity, fVals, fLvl);
// }
// /* =========================== BUILD ROW ==================================== */
// /** @return {ary} Rows for each field in the entity field obj. */
// function buildRows(fieldObj, entity, fVals, fLvl) {                 /*dbug-log*/console.log("buildRows. [%s][%s] fields = [%O]", entity, fLvl, fieldObj);
//     const track = getFieldTrackObj();
//     return Promise.all(fieldObj.order.map(f => {
//         return Array.isArray(f) ? buildMultiFieldRow(f) : buildSingleFieldRow(f);
//     }));

//     function buildMultiFieldRow(fields) {                           /*dbug-log*/console.log('buildMultiFieldRow = %O', fields);
//         const cntnr = _el('getElem', ['div', { class: 'full_fCntnr  flex-row cntnr-row' }]);
//         const rows = fields.map(buildSingleFieldRow);
//         return Promise.all(rows).then(appendRows).then(() => cntnr);

//         function appendRows(rows) {
//             rows.forEach(row => $(cntnr).append(row));
//         }
//     }
//     function buildSingleFieldRow(field) {                           /*dbug-log*/console.log('buildSingleFieldRow [%s]', field);
//         return buildRowField(field, fieldObj, entity, fVals, fLvl);
//     }
//     /* ------------`------------- BUILD FIELD ------------------------------------ */
//     /**
//      * @return {div} Form field row with required-state and value (if passed) set.
//      */
//     function buildRowField(field, fieldsObj, entity, fVals, fLvl) {     /*dbug-log*/console.log("buildRow. field [%s], fLvl [%s], fVals = %O, fieldsObj = %O", field, fLvl, fVals, fieldsObj);
//         return _elems('getFieldInput', [fieldData, entity, fLvl])
//             .then(finishFormField);

//         function getFieldData() {
//             return {
//                 info: handleFieldInfo(fieldsObj.info[field])  || '',
//                 name: field,
//                 required: fieldsObj.required.indexOf(field) !== -1,
//                 type: fieldsObj.fields[field],
//                 value: fVals[field] ? fVals[field] :
//                     (fieldsObj.fields[field] == 'multiSelect' ? {} : null)
//             }
//         }
//         function buildField(input) {                                    /*dbug-log*/console.log('input = %O', input);
//             return buildFormFieldContainer(_u('ucfirst', [field]), input, fLvl, "", fieldData.info);
//         }
//     }