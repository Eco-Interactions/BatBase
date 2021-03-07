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
    if (isNoFlexField(field)) { return; }
    const flex = getFlexValue(w, field);                            /*dbug-log*///console.log('     --flex[%s]', flex);
    $(field).css({'flex': flex});
}
/** [getFlexValue description] */
function getFlexValue(w, field) {
    if ($(field).hasClass('empty')) { return `1 0 ${w}%`; }
    return getGrow(field) + ' ' + getShrink(field) +` ${w}%`;
}
function getShrink(field) {
    const noShrinks = ['no-shrink'];
    return ifHasClasses(field, noShrinks) ? 0 : 1;
}
/* -------------------------------------------------------- */
function getGrow(field) {
    const noGrows = ['no-grow'];
    return ifHasClasses(field, noGrows) ? 0 : 1;
}
/** [ifHasClasses description] */
function isNoFlexField(field) {
    const noFlex = ['sml', 'med', 'lrg'];
    return ifHasClasses(field, noFlex);
}
function ifHasClasses(field, classes) {                             /*dbug-log*///console.log('  --ifHasClasses [%O]', field)
    const fClasses = $(getSelector(field))[0].className;            /*dbug-log*///console.log('     --[%s][%O]', fClasses, classes);
    return classes.find(c => fClasses.includes(c));
}
function getSelector(field) {
    if ($(field).hasClass('empty')) { return }
    const f = $(field).hasClass('g-cntnr') ? '.g-cntnr' : '#'+field.id;/*dbug-log*///console.log('--getSelector .[%s] .f-input', f)
    return f + ' .f-input';
}