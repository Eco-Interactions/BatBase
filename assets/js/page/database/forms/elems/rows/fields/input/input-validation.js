/**
 * Utilizes HTML 5 form validation on field inputs where possible.
 *
 * Export
 *     handleFieldValidation
 *
 * TOC
 *     HTML VALIDATION
 *         COORDINATES
 *         URL
 *         PAGE
 *         YEAR
 *         SHARED
 */
import { _elems } from '~form';
/* ====================== HTML VALIDATION =================================== */
export function handleFieldValidation(input, field, fLvl) {
    const map = {
        lng: setLongitudePattern, lat: setLatitudePattern,
        page: setPageRange,       doi: setDoiPattern,
        url: setHttpPatternAndPlaceholder,  year: setYearCharLength
    };
    return !map[field.type] ? input : map[field.type](input, fLvl);
}
/* ----------------------- COORDINATES -------------------------------------- */
function setLatitudePattern(input, fLvl) {
    return handleCoordPattern(input, fLvl, 'lat');
}
function setLongitudePattern(input, fLvl) {
    return handleCoordPattern(input, fLvl, 'long');
}
function handleCoordPattern(input, fLvl, prefix) {
    const coordRegex = '-?\\d{1,2}(\\.?\\d*)';
    const msg = `Please enter a valid ${prefix}itude.`;
    return addAttrAndValidation(input, { pattern: coordRegex }, msg, fLvl);
}
/* ---------------------------- URL ----------------------------------------- */
function setHttpPatternAndPlaceholder(input, fLvl) {
    const msg = 'Please enter a valid URL. Ex: https://...';
    const attrs = { pattern: '\\b(https?:\/\/\\S+\.\S*\\b\/?)', placeholder: 'http(s)://...' };
    return addAttrAndValidation(input, attrs, msg, fLvl);
}
function setDoiPattern(input, fLvl) {
    const msg = 'Please enter the full DOI URL. Ex: https://doi.org/10.1111/j.1439';
    const attrs = { pattern: 'https?:\/\/doi.org/\\S+', placeholder: 'https://doi.org/...' };
    return addAttrAndValidation(input, attrs, msg, fLvl);
}
/* ------------------------------ PAGE -------------------------------------- */
function setPageRange(input, fLvl) {
    const attrs = { pattern: '^[\\d-]+$', placeholder: 'Ex: ###-###' };
    const msg = 'Please enter page range with no spaces: ###-####';
    return addAttrAndValidation(input, attrs, msg, fLvl);
}
/* ------------------------------ YEAR -------------------------------------- */
function setYearCharLength(input, fLvl) {
    const msg = 'Please input a valid year.';
    return addAttrAndValidation(input, { min: 1000, max: 3000 }, msg, fLvl);
}
/* --------------------------- SHARED --------------------------------------- */
function addAttrAndValidation(input, attrs, msg, fLvl) {
    $(input).attr(attrs).change(validateInput.bind(null, msg, fLvl));
    return input;
}
function validateInput(msg, fLvl, e) {                              /*dbug-log*///console.log('validateInput. e = %O, msg = [%s]', e, msg);
    const valid = e.currentTarget.checkValidity();                  /*dbug-log*///console.log('valid ? ', valid)
    if (valid) { return; }
    if (msg) { setCustomInvalidMsg(e.currentTarget, msg, fLvl); }
    e.currentTarget.reportValidity();
    _elems('toggleSubmitBttn', ['#'+fLvl+'-submit', false])
}
function setCustomInvalidMsg(input, msg, fLvl) {  console.log('fLvl = ', fLvl)
    input.setCustomValidity(msg);
    input.oninput = resetValidityMsg.bind(null, fLvl);
}
/* HTML5 validation always fails if a custom validity message is set. */
function resetValidityMsg(fLvl, e) {
    const input = e.currentTarget;                                  /*dbug-log*///console.log('resetValidityMsg. isValid ? %s = %O', input.validity.valid, input)
    input.setCustomValidity('');
    input.oninput = null;
    _elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
}