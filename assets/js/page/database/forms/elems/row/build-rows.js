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
    const rows = [];
    return handleRowBuildChain(viewConfg)
        .then(() => rows);

    function handleRowBuildChain(viewConfg) {
        return viewConfg.reduce((p, f) => p.then(getFormRow.bind(null, f)),
            Promise.resolve());
    }
    function getFormRow(f) {
        return buildFormRow(f)
            .then(row => rows.push(row));
    }
}
function buildFormRow(row) {                                        /*dbug-log*///console.log("   --buildFormRow[%O]", row);
    const cntnr = _el('getElem', ['div', { class: 'row' }]);
    $(cntnr).data('field-cnt', getRowFieldCnt(row)); //used for styling
    return getRowGroup(row)
        .then(appendFieldsAndReturnRow.bind(null, cntnr));
}
function appendFieldsAndReturnRow(cntnr, elems) {
    $(cntnr).append(...elems);
    return cntnr;
}
function getRowGroup(hGroup) {
    return Promise.all(hGroup.map(getFieldGroup));
}
function getFieldGroup(g) {                                         /*dbug-log*///console.log('           --getFieldGroup [%O]', g);
    return g.dir ? buildGroup(g) : getFormField(g);
}
function buildGroup(g) {                                            /*dbug-log*///console.log('               --buildGroup dir[%s] fields[%O]', g.dir, g.confgs);
    const gClass = `flex-${g.dir} g-cntnr ` + (g.class ? g.class : '');/*dbug-log*///console.log("                   --gClass[%s]", gClass);
    const cntnr = _el('getElem', ['div', { class: gClass }]);
    return Promise.all(g.confgs.map(getFieldGroup).filter(f=>f))
        .then(appendFieldsAndReturnRow.bind(null, cntnr));
}
function getFormField(fConfg) {                                     /*dbug-log*///console.log("           --getFormField [%s][%O]", fConfg.name, fConfg);
    if (fConfg.shown === false) { return Promise.resolve(); }
    if (fConfg.emptyField) { return _el('getElem', ['div', { class: 'empty' }]); }
    return _elems('buildFormField', [fConfg]);
}
function getRowFieldCnt(f) {
    return Array.isArray(f) ? f.length : 1;
}