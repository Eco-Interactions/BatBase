// /**
//  *
//  *
//  *
//  *
//  */


// /* =========================== BUILD ROW ==================================== */
// /** @return {ary} Rows for each field in the entity field obj. */
// export function buildRows(confg) {                                         /*dbug-log*/console.log("buildRows [%O]",confg);
//     const track = getFieldTrackObj();
//     return confg.fields.map(getFormRow);

//     function getFormRow(f) {                                        /*dbug-log*/console.log("getFormRow[%O]", f);
//         const row = _el('getElem', ['div', { class: 'row' }]);
//         const elems = getRowFields(f);
//         $(row).append(...elems)
//         return row;
//     }
//     function getRowFields(f) {                                      /*dbug-log*/console.log("getRowFields[%O]", f);
//         return Array.isArray(f) ? f.map(getFormField) : [getFormField(f)];
//     }
//     function getFormField(fConfg) {                                  /*dbug-log*/console.log("getFormField[%O]", fConfg);
//         if (fConfg.info) { ++track.infoSteps; }
//         return Promise.resolve(buildFormField(fConfg, confg.group))
//         //     .then(setFieldState);

//         // function setFieldState(field) {                             /*dbug-log*/console.log("   --setFieldState field[%O]", field);
//         //     const field = buildFormField(fConfg);                   /*dbug-log*/console.log("   --field[%O]", field);
//         //     return field;
//         // }
//     }
// }
// function getFieldTrackObj() {
//     return {
//         infoSteps: 0
//     };
// }