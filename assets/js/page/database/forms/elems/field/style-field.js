/**
 * TODO: DOCUMENT
 */
/**
 * set after append so the container size is known
 * @param {[type]} entity [description]
 */
export function setDynamicFieldStyles(entity) {                     /*dbug-log*///console.log('setDynamicFormStyles [%s]', entity);
    $(`#${entity}_fields .row`).each((idx, row) => setFieldWidths(row));
}
function setFieldWidths(row) {
    const w = 100 / $(row).data('field-cnt');                       /*dbug-log*///console.log('setFieldWidths row[%O] fieldW[%s]', row, w);
    $(row.childNodes).each((idx, field) => setFieldWidth(field, w));
}
function setFieldWidth(field, w) {                                  /*dbug-log*///console.log('setFieldWidth field[%O][%s]', field, w);
    $(field).css({'width': w+'%'});
}