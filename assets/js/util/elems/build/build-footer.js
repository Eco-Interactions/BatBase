/**
 * Returns footer-container with submit and cancel buttons spaced to the right.
 *     footerDiv->(spacerDiv, submitBttn, cancelBttn)
 *
 * Export
 *     getFormFooter
 *
 * TOC
 *     CONTAINER
 *     BUTTONS
 *         SUBMIT BUTTOM
 *         CANCEL BUTTON
 */
import { _el, _u } from '~util';
/**
 * @param  {Object}   confg
 * @param  {String}   confg.formName
 * @param  {String}   confg.action
 * @param  {Function} confg.onSubmit
 * @param  {Function} confg.onCancel
 * @param  {String}   [confg.submitText]
 * @return {Node}     footerDiv->(spacerDiv, submitBttn, cancelBttn)
 */
export function getFormFooter(confg) {
    const cntnr = getFooterCntnr(confg.formName);
    const spacer = $('<div></div>').css('flex-grow', 2);
    const bttns = getSubmitAndCancelBttns(confg);
    $(cntnr).append([spacer, ...bttns]);
    return cntnr;
}
/* ======================== CONTAINER ======================================= */
function getFooterCntnr(formName) {
    const attrs = { class: 'flex-row bttn-cntnr', id: formName+'_footer' };
    return _el('getElem', ['div', attrs]);
}
/* ========================== BUTTONS ======================================= */
function getSubmitAndCancelBttns(confg) {
    return [getSubmitBttn(confg), getCancelBttn(confg)];
}
function getActionButton(actn, formName, val) {
    const attr = { id: formName+'-'+actn, type: 'button', value: val}
    return _el('getElem', ['input', attr]);
}
/* -------------------------- SUBMIT BUTTON --------------------------------- */
function getSubmitBttn(confg) {
    const bttn = getActionButton('submit', confg.formName, getSubmitText());
    $(bttn).attr('disabled', true).css('opacity', '.6').click(confg.onSubmit);
    return bttn;

    function getSubmitText() {
        if (confg.submitText) { return confg.submitText; }
        const text = { create: 'Create', edit: 'Update' };;
        return text[confg.action] + ' ' + _u('ucfirst', [confg.formName]);
    }
}
/* -------------------------- CANCEL BUTTON --------------------------------- */
function getCancelBttn(confg) {
    const bttn = getActionButton('cancel', confg.formName, 'Cancel');
    $(bttn).css('cursor', 'pointer').click(confg.onCancel);
    return bttn;
}