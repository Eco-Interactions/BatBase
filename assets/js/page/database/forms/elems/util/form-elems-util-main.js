/**
 * Random methods that affect various form-elems.
 *
 * Export
 *     exitSubForm
 *     exitRootForm
 *     toggleSubmitBttn
 *     showSuccessMsg
 *     exitSuccessMsg
 *
 * TOC
 *     EXIT FORM
 *     SUBMIT BUTTOM
 *     SUBMIT-SUCCESS MSG
 */
import { _el } from '~util';
/* ------------------------ SUBMIT BUTTON ----------------------------------- */
export function toggleSubmitBttn(bttnId, enable = true) {
    return enable ? enableSubmitBttn(bttnId) : disableSubmitBttn(bttnId);
}
function enableSubmitBttn(bttnId) {
    if (!isFormValid(bttnId)) { return; }
    $(bttnId).attr("disabled", false).css({"opacity": "1", "cursor": "pointer"});
}
/** Checks HTML5 form-validity. */
function isFormValid(bttnId) {
    const fLvl = bttnId.split('-')[0];
    if ($(`${fLvl}-hdr`)[0].innerText.includes('Select')) { return true; } //Taxon parent select forms
    const valid = $(fLvl+'-form')[0].checkValidity();
    if (valid) { return true; }
    $(fLvl+'-form')[0].reportValidity();
}
function disableSubmitBttn(bttnId) {
    $(bttnId).attr("disabled", true).css({"opacity": ".6", "cursor": "initial"});
}
/* ------------------- SUBMIT-SUCCESS MSG ----------------------------------- */
/** Shows a form-submit success message at the top of the interaction form. */
export function showSuccessMsg(msg, color = 'green') {
    const cntnr = _el('getElem', ['div', { id: 'success' }]);
    cntnr.append(getSuccessMsgHtml(msg));
    $(cntnr).css('border-color', (color));
    $('#top-hdr').after(cntnr);
    $(cntnr).fadeTo('400', .8);
}
function getSuccessMsgHtml(msg) {
    const div = _el('getElem', ['div', { class: 'flex-row' }]);
    const p = _el('getElem', ['p', { text: msg }]);
    const bttn = getSuccessMsgExitBttn();
    div.append(p, bttn);
    return div;
}
function getSuccessMsgExitBttn() {
    const attr = { 'id': 'sucess-exit', 'class': 'exit-bttn',
        'type': 'button', 'value': 'X' }
    const bttn = _el('getElem', ['input', attr]);
    $(bttn).click(exitSuccessMsg);
    return bttn;
}
export function exitSuccessMsg() {
    $('#success').fadeTo('400', 0, () => $('#success').remove());
}
