/**
 * Assembles the data-entry form pieces.
 * TODO: document
 *
 * Export
 *     assembleForm
 *
 * TOC
 *     CONTAINER
 *     HEADER
 *     STATUS/ALERTS
 */
import { _el } from '~util';
let fState;
/* ======================== BUILD FORM ====================================== */
/** [assembleForm description] */
export function assembleForm(el, formState) {                       /*dbug-log*///console.log('+--buildForm elems[%O] fState[%O]', el, formState);
    fState = formState;
    const cntnr = buildFormCntnr();
    const hdr = buildFormHdr(el.tutBttn);
    const valMsg = getValMsgCntnr();
    $(cntnr).append([hdr, valMsg, el.rows, el.footer].filter(e=>e));
    $(cntnr).submit(e => e.preventDefault());
    return cntnr;
}
/* --------------------------- CONTAINER ------------------------------------ */
function buildFormCntnr() {
    const attr = {id: fState.group+'-form', class: fState.style };
    return _el('getElem', ['form', attr]);
}
/* ------------------------------ HEADER ------------------------------------ */
function buildFormHdr(tutBttn) {
    const cntnr = buildHeaderCntnr();
    const hdr = _el('getElem', ['span', { text: getHeaderTitle() }]);
    $(cntnr).append([getBttnOrSpacer(tutBttn), hdr, $('<div>')[0]]);
    return cntnr;
}
function buildHeaderCntnr() {
    return _el('getElem', ['div', { id: fState.group+'-hdr', class: 'flex-row'}]);
}
function getHeaderTitle() {
    const map = {
        create: 'New',
        edit: 'Edit',
        select: 'Select'
    };
    return map[fState.action] + ' ' + fState.name;
}
function getBttnOrSpacer(tutBttn) {
    return fState.group === 'top' ? $('<div>')[0] : tutBttn;
}
/* ------------------------- STATUS/ALERTS ---------------------------------- */
/** Container for custom form-validation messages. */
function getValMsgCntnr() {
    return _el('getElem', ['div', { id: fState.group+'_alert' }]);
}