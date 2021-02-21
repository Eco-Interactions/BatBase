/**
 * Handles HTML input-validation as needed.
 * TODO: DOCUMENT
 *
 * Export
 *     getFieldInput
 *     buildMultiSelectInput
 *
 * TOC
 *     INPUT BUILDERS
 *         INPUT
 *         TEXTAREA
 *     FINISH INPUT BUILD
 *         CHANGE HANDLER
 *         REQUIRED FIELDS
 */
import { _cmbx, _el } from '~util';
let f;
/* ====================== HTML VALIDATION =================================== */
export function handleFieldValidation(fConfg, input) {               /*dbug-log*/console.log("handleFieldValidation fConfg[%O][%O]", fConfg, input);
    f = fConfg;
    const map = {
        doi: setDoiPattern,
        lat: setLatitudePattern,
        lng: setLongitudePattern,
        page: setPageRange,
        url: setHttpPatternAndPlaceholder,
        year: setYearCharLength
    };
    return !map[f.type] ? input : map[f.type](input);
}
/* ----------------------- COORDINATES -------------------------------------- */
function setLatitudePattern(input) {
    const pattern = '-?([0-8]?[0-9](\\.\\d+)?\|90(.[0]+)?)\\s?';
    return handleCoordPattern(input, 'lat', pattern);
}
function setLongitudePattern(input) {
    const pattern = '-?[1]?[0-7]?[0-9](\\.\\d+)?\|180((.[0]+)?)';
    return handleCoordPattern(input, 'long', pattern);
}
function handleCoordPattern(input, prefix, pattern) {
    const msg = `Please enter a valid ${prefix}itude.`;
    return addAttrAndValidation(input, { pattern: pattern }, msg);
}
/* ---------------------------- DOI ----------------------------------------- */
function setDoiPattern(input) {
    const msg = 'Please enter the full DOI URL. Ex: https://doi.org/10.1111/j.1439';
    const attrs = { pattern: 'https?:\/\/doi.org/\\S+', placeholder: 'https://doi.org/...' };
    return addAttrAndValidation(input, attrs, msg);
}
/* ------------------------------ PAGE -------------------------------------- */
function setPageRange(input) {
    const attrs = { pattern: '^[\\d-]+$', placeholder: 'Ex: ###-###' };
    const msg = 'Please enter page range with no spaces: ###-####';
    return addAttrAndValidation(input, attrs, msg);
}
/* ---------------------------- URL ----------------------------------------- */
function setHttpPatternAndPlaceholder(input) {
    const msg = 'Please enter a valid URL. Ex: https://...';
    const attrs = { pattern: '\\b(https?:\/\/\\S+\.\S*\\b\/?)', placeholder: 'http(s)://...' };
    return addAttrAndValidation(input, attrs, msg);
}
/* ------------------------------ YEAR -------------------------------------- */
function setYearCharLength(input) {
    const msg = 'Please input a valid year.';
    return addAttrAndValidation(input, { min: 1000, max: 3000 }, msg);
}
/* --------------------------- SHARED --------------------------------------- */
function addAttrAndValidation(input, attrs, msg) {
    $(input).attr(attrs).change(validateInput.bind(null, msg));
    return input;
}
function validateInput(msg, e) {                                    /*dbug-log*/console.log('validateInput. e = %O, msg = [%s]', e, msg);
    const valid = e.currentTarget.checkValidity();                  /*dbug-log*/console.log('valid ? ', valid)
    if (valid) { return; }
    if (msg) { setCustomInvalidMsg(e.currentTarget, msg); }
    e.currentTarget.reportValidity();
    // _elems('toggleSubmitBttn', ['#'+fLvl+'-submit', false])   //replace
}
function setCustomInvalidMsg(input, msg) {                          /*dbug-log*/console.log('setCustomInvalidMsg [%s] for [%O]', msg, input);
    input.setCustomValidity(msg);
    input.oninput = resetValidityMsg.bind(null);
}
/* HTML5 validation always fails if a custom validity message is set. */
function resetValidityMsg(e) {
    const input = e.currentTarget;                                  /*dbug-log*/console.log('resetValidityMsg. isValid ? %s = %O', input.validity.valid, input)
    input.setCustomValidity('');
    input.oninput = null;
    // _elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);  //replace
}