/**
 * Show or remove form-status message elements from the top of the form.
 * Note: currently only used on the interaction form. TODO: add fLvl param
 *
 * Export
 *     toggleFormStatusMsg
 */
import { _el } from '~util';
/* ====================== TOGGLE STATUS MSG ================================= */
export function toggleFormStatusMsg(msg, color = 'green') {
    if (!msg) { return exitFormStatusMsg(); }
    const cntnr = _el('getElem', ['div', { id: 'success' }]);
    cntnr.append(getSuccessMsgHtml(msg));
    $(cntnr).css('border-color', (color));
    $('#top-hdr').after(cntnr);
    $(cntnr).fadeTo('400', .8);
}
/* ============================ BUILD HTML =================================== */
function getSuccessMsgHtml(msg) {
    const div = _el('getElem', ['div', { class: 'flex-row' }]);
    const p = _el('getElem', ['p', { text: msg }]);
    const bttn = getSuccessMsgExitBttn();
    div.append(p, bttn);
    return div;
}
function getSuccessMsgExitBttn() {
    const attr = {
        class: 'exit-bttn',
        id: 'sucess-exit',
        type: 'button',
        value: 'X'
    };
    const bttn = _el('getElem', ['input', attr]);
    $(bttn).click(exitFormStatusMsg);
    return bttn;
}
/* ============================ EXIT MSG ==================================== */
function exitFormStatusMsg() {
    $('#success').fadeTo('400', 0, () => $('#success').remove());
}
