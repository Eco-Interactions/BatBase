/**
 * TODO: DOCUMENT
 */
export function setDynamicFieldStyles(entity) {                     /*dbug-log*///console.log('--setDynamicFormStyles [%s]', entity);
    $(`#${entity}_fields .row`).each(handleRowStyles);
}
function handleRowStyles(i, row) {
    const w = 100 / $(row).data('field-cnt');                       /*dbug-log*///console.log('--handleRowStyles row[%O] fieldW[%s]', row, w);
    $(row.childNodes).each((i, f) => styleRowField(w, f));
}
function styleRowField(w, field) {                                  /*dbug-log*///console.log('--styleRowField[%O][%s]', field, w);
    const flex = getFlexValue(w, field);                            /*dbug-log*///console.log('     --flex[%s]', flex);
    $(field).css({'flex': flex});
}
/** [getFlexValue description] */
function getFlexValue(w, field) {
    return isSmallField(field)?'0' : (isNoGrowField(field)?'0':'1')+` 0 ${w}%`;
}
function isSmallField(field) {
    return $(getSelector(field))[0].className.includes('sml-field');
}
function isNoGrowField(field) {
    return $(getSelector(field)).hasClass('no-grow');
}
function getSelector(field) {
    const f = $(field).hasClass('s-fields') ? '.s-fields' : '#'+field.id;/*dbug-log*///console.log('--getSelector .[%s] .f-input', f)
    return f + ' .f-input';
}