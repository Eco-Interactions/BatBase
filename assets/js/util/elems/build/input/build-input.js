/**
 * Builds form-field inputs.
 * TODO: DOCUMENT
 *
 * Export
 *     getFieldInput
 *     buildMultiSelectField
 *
 * TOC
 *     INPUT BUILDERS
 *         INPUT
 *         TEXTAREA
 *     FINISH INPUT BUILD
 *         CHANGE HANDLER
 *         REQUIRED FIELDS
 */
import { _cmbx, _el, _u } from '~util';
import { handleInputValidation } from './val-input.js';

/* ======================= INPUT BUIDLERS =================================== */
export function getFieldInput(fConfg) {                             /*dbug-log*///console.log('+--getFieldInput [%O]', fConfg);
    return Promise.resolve(getInput(fConfg))
        .then(handleInputValidation.bind(null, fConfg.type))
        .then(finishInputBuild.bind(null, fConfg));
}
function getInput(f) {
    return {
        doi:            buildInput,
        fullTextArea:   buildLongTextArea,
        lat:            buildInput,
        lng:            buildInput,
        multiSelect:    buildMultiSelectFieldCntnr,
        num:            buildNumberInput,
        page:           buildInput,
        select:         buildSelect,
        tags:           buildSelect,
        text:           buildInput,
        textArea:       buildTextArea,
        url:            buildUrlInput,
        year:           buildNumberInput
    }[f.type](f);
}
/* ------------------------------- INPUT ------------------------------------ */
function buildInput(f, type = 'text') {
    const attr = { type: type, class: f.class };
    const input = _el('getElem', ['input', attr]);
    return input;
}
function buildNumberInput(f) {
    return buildInput(f, 'number');
}
function buildUrlInput(f) {
    return buildInput(f, 'url');
}
/* ----------------------------- TEXTAREA ----------------------------------- */
function buildTextArea(f) {
    return _el('getElem', ['textarea', {class: f.class }]);
}
function buildLongTextArea(f) {
    const attr = { class: f.class, id:'txt-'+f.id };
    return _el('getElem', ['textarea', attr]);
}
/* --------------------- SINGLE SELECT/COMBOS ------------------------------- */
/**
 * Creates and returns a select dropdown for the passed field. If it is one of
 * a larger set of select elems, the current count is appended to the id. Adds
 * the select's fieldName to the subForm config's 'selElem' array to later
 * init the 'selectize' combobox.
 */
function buildSelect(f) {                                           /*dbug-log*///console.log("       --buildSelect [%O]", f);
    return _cmbx('getFieldOptions', [f.name])
        .then(finishSelectBuild.bind(null, f));
}
function finishSelectBuild(f, opts) {                               /*dbug-log*///console.log('           --finishSelectBuild fConfg[%O] opts[%O]', f, opts);
    const attr = { class: f.class, id: 'sel-' + f.id };
    f.combo = true; //Flag for the combobox selectize-library
    return _el('getSelect', [opts, attr]);
}
/* ---------------------- MULTI-SELECT/COMBOS ------------------------------- */
/**
 * Creates a select dropdown field wrapped in a div container that will
 * be reaplced inline upon selection. Either with an existing Author's name,
 * or the Author create form when the user enters a new Author's name.
 */
function buildMultiSelectFieldCntnr(f) {                             /*dbug-log*///console.log("       --buildMultiSelectFieldCntnr fConfg[%O]", f);
    return buildMultiSelectField(f)
        .then(buildMultiSelectCntnr.bind(null, f));
}
/**
 * [buildMultiSelectField description]
 * @param  {[type]} f      [description]
 * @param  {[type]} cnt    [description]
 * @return {[type]}        [description]
 */
export function buildMultiSelectField(f) {                          /*dbug-log*///console.log("--buildMultiSelectField [%O]", f);
    return buildSelect(f)
        .then(finishFieldInput.bind(null, f));
}
function finishFieldInput(f, input) {                               /*dbug-log*///console.log('--finishFieldInput fConfg[%O] input[%O]', f, input);
    const confg = getMultiInputFieldConfg(f, input);
    input.id += f.count;
    return _el('getFieldElems', [confg]);
}
function getMultiInputFieldConfg(f, input) {
    return {
        'class': f.class,
        group: f.group,
        id: f.name + f.count,
        input: input,
        label: getCntLabel(f.count)+' '+f.name,
        name: f.name+f.count,
        required: f.required || false,
        type: 'select'
    };
}
function getCntLabel(cnt) {
    const map = { 1: '1st', 2:'2nd', 3:'3rd' };
    return cnt in map ? map[cnt] : cnt+'th';
}
function buildMultiSelectCntnr(f, field) {
    f.input = field;
    return _el('getFieldElems', [f]);
}
/* ========================== FINISH BUILD ================================== */
function finishInputBuild(f, input) {                               /*dbug-log*///console.log('   --finishInputBuild f[%O] input[%O]', f, input);
    f.input = input;
    setFieldValue(f);
    return f;
}
/* --------------------------- SET VALUE ------------------------------------ */
function setFieldValue(f) {
    if (f.type === 'multiSelect') { return handleMultiFieldInitVal(f); }
    if (!f.value) { return; }
    const val = _u('isObj', f.value) ? f.value.value : f.value;
    $(f.input).val(val);
}
function handleMultiFieldInitVal(f) {
    if (f.value && _u('isObj', [f.value])) { return; }
    f.value = {};
}