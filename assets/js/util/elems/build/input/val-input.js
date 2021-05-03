/**
 * Handles HTML input-validation as needed.
 * TODO: DOCUMENT
 *
 * Export
 *     handleInputValidation
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
let input;
export function handleInputValidation(type, el) {                   /*dbug-log*///console.log("+--handleInputValidation [%s][%O]", type, el);
    input = el;
    setInputValidation(type);
    return input;
}
/* ======================== SET HANDLER ===================================== */
function setInputValidation(type) {
    const map = {
        doi: setDoiPattern,
        lat: setLatitudePattern,
        lng: setLongitudePattern,
        page: setPageRange,
        url: setHttpPatternAndPlaceholder,
        year: setYearCharLength
    };
    if (!map[type]) { return; }
    map[type]();
}
function addAttrAndValidation(attrs, msg) {                         /*dbug-log*///console.log('--addAttrAndValidation input[%O] attrs[%O] msg[%s]', input, attrs, msg);
    $(input).attr(attrs).change(validateInput.bind(null, msg));
}
/* ----------------------- COORDINATES -------------------------------------- */
function setLatitudePattern() {
    const pattern = '-?([0-8]?[0-9](\\.\\d+)?\|90(.[0]+)?)\\s?';
    return handleCoordPattern('lat', pattern);
}
function setLongitudePattern() {
    const pattern = '-?[1]?[0-7]?[0-9](\\.\\d+)?\|180((.[0]+)?)';
    handleCoordPattern('long', pattern);
}
function handleCoordPattern(prefix, pattern) {
    const msg = `Please enter a valid ${prefix}itude.`;
    addAttrAndValidation({ pattern: pattern }, msg);
}
/* ---------------------------- DOI ----------------------------------------- */
function setDoiPattern() {
    const msg = 'Please enter the full DOI URL. Ex: https://doi.org/10.1111/j.1439';
    const attrs = { pattern: 'https?:\/\/doi.org/\\S+', placeholder: 'https://doi.org/...' };
    addAttrAndValidation(attrs, msg);
}
/* ------------------------------ PAGE -------------------------------------- */
function setPageRange() {
    const attrs = { pattern: '^[\\d-]+$', placeholder: 'Ex: ###-###' };
    const msg = 'Please enter page range with no spaces: ###-####';
    addAttrAndValidation(attrs, msg);
}
/* ---------------------------- URL ----------------------------------------- */
function setHttpPatternAndPlaceholder() {
    const msg = 'Please enter a valid URL. Ex: https://...';
    const attrs = { pattern: '\\b(https?:\/\/\\S+\.\S*\\b\/?)', placeholder: 'http(s)://...' };
    addAttrAndValidation(attrs, msg);
}
/* ------------------------------ YEAR -------------------------------------- */
function setYearCharLength() {
    const msg = 'Please input a valid year.';
    addAttrAndValidation({ min: 1000, max: 3000 }, msg);
}
/* ========================== VALIDATE ====================================== */
function validateInput(msg, e) {                                    /*dbug-log*/console.log('validateInput. e = %O, msg = [%s]', e, msg);
    const valid = e.currentTarget.checkValidity();                  /*dbug-log*/console.log('valid ? ', valid)
    if (valid) { return; }
    if (msg) { setCustomInvalidMsg(e.currentTarget, msg); }
    e.currentTarget.reportValidity();
    // _elems('toggleSubmitBttn', [fLvl, false])   //replace
}
function setCustomInvalidMsg(elem, msg) {                          /*dbug-log*/console.log('setCustomInvalidMsg [%s] for [%O]', msg, elem);
    elem.setCustomValidity(msg);
    elem.oninput = resetValidityMsg.bind(null);
}
/* HTML5 validation always fails if a custom validity message is set. */
function resetValidityMsg(e) {
    const elem = e.currentTarget;                                  /*dbug-log*/console.log('resetValidityMsg. isValid ? %s = %O', elem.validity.valid, elem)
    elem.setCustomValidity('');
    elem.oninput = null;
    // _elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);  //replace
}