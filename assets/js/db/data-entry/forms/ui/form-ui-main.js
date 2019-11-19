/**
 *
 *
 *
 * 
 */
import * as _forms from '../forms-main.js';
import * as _cmbx from './combobox-util.js';
import * as _elems from './form-elems.js';
import * as _pnl from './detail-panel.js';

const _u = _forms._util;

export function elems(funcName, params) {
    return _elems[funcName](...params);
}
export function combos(funcName, params) {
    return _cmbx[funcName](...params);
}
export function panel(funcName, params) {
    return _pnl[funcName](...params);
}

/* =============================== HELPERS ================================== */
export function setCoreRowStyles(formId, rowClass) {
    const w = $(formId).innerWidth() / 2 - 3;  
    $(rowClass).css({'flex': '0 1 '+w+'px', 'max-width': w});
}
/** Shows a form-submit success message at the top of the interaction form. */
export function showSuccessMsg(msg, color) {
    const cntnr = _u('buildElem', ['div', { id: 'success' }]);
    const msgHtml = getSuccessMsgHtml(msg);
    cntnr.append(div);
    $(cntnr).css('border-color', (color ? color : 'greem'));
    $('#top-hdr').after(cntnr); 
    $(cntnr).fadeTo('400', .8);
}
function getSuccessMsgHtml(msg) {
    const div = _u('buildElem', ['div', { class: 'flex-row' }]);
    const p = _u('buildElem', ['p', { text: msg }]);
    const bttn = getSuccessMsgExitBttn();
    div.append(p, bttn);
    return div;
}
function getSuccessMsgExitBttn() {
    const attr = { 'id': 'sucess-exit', 'class': 'tbl-bttn exit-bttn', 
        'type': 'button', 'value': 'X' }
    const bttn = _u('buildElem', ['input', attr]);
    $(bttn).click(exitSuccessMsg);
    return bttn;
}
export function exitSuccessMsg() {
    $('#success').fadeTo('400', 0, () => $('#success').remove());
}