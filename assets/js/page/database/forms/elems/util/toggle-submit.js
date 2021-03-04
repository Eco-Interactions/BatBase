/**
 * Toggles the form submit button's styling and availablility. Will only enable
 * if form html-validation passes.
 *
 * Export
 *     toggleSubmitBttn
 */
import { _el } from '~util';
import * as status from './form-status-msg.js';
import * as toggle from './toggle-submit.js';
/* ======================== TOGGLE SUBMIT =================================== */
export function toggleSubmitBttn(fLvl, enable = true) {
    if (enable && !isFormValid(fLvl)) { return; }
    const cursor = enable ? 'pointer' : 'initial';
    const opac = enable ? 1 : .6;
    $(`#${fLvl}-submit`).attr('disabled', !enable).css({opacity: opac, cursor: cursor});
}
/* ======================== VALIDATE FORM =================================== */
/** Checks HTML5 form-validity. */
function isFormValid(fLvl) {
    if (ifSelectForm(fLvl)) { return true; }
    const valid = $(`#${fLvl}-form`)[0].checkValidity();
    return valid || $(`#${fLvl}-form`)[0].reportValidity();
}
function ifSelectForm(fLvl) {
    return $(`#${fLvl}-hdr`)[0].innerText.includes('Select');
}