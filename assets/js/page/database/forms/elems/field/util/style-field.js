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
    if (isSpacer(field)) { return setFlex(field, `1 0 ${w}%`) }
    if (isNoFlexField(field)) { return; }
    setFlex(field, getFlexValue(w, field));
}
function isSpacer(field) {
    return $(field).hasClass('empty');
}
function setFlex(field, val) {                                      /*dbug-log*///console.log('     --setFlex [%s][%O]', val, field);
    $(field).css({flex: val});
}
/** [getFlexValue description] */
function getFlexValue(w, field) {
    return getGrow(w, field) + ' ' + getShrink(field) +` ${w}%`;
}
function getShrink(field) {
    const noShrinks = ['no-shrink'];
    return ifHasClasses(field, noShrinks) ? 0 : 1;
}
/* -------------------------------------------------------- */
function getGrow(w, field) {
    const noGrows = ['no-grow'];
    return w === 100 || ifHasClasses(field, noGrows) ? 0 : 1;
}
/** [ifHasClasses description] */
function isNoFlexField(field) {
    const noFlex = ['w-'];
    return ifHasClasses(field, noFlex);
}
function ifHasClasses(field, classes) {                             /*dbug-log*///console.log('  --ifHasClasses [%O]', field)
    const fClasses = $(getSelector(field))[0].className;            /*dbug-log*///console.log('     --[%s][%O]', fClasses, classes);
    return classes.find(c => fClasses.includes(c));
}
function getSelector(field) {
    if ($(field).hasClass('empty')) { return }
    const f = $(field).hasClass('g-cntnr') ? '.g-cntnr' : '#'+field.id;/*dbug-log*///console.log('--getSelector [%s] .f-input', f)
    return f + ' .f-input';
}