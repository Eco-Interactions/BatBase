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
let f;
/* ======================= INPUT BUIDLERS =================================== */
export function getFieldInput(fConfg) {                             /*dbug-log*///console.log('+--getFieldInput [%O]', fConfg);
    f = fConfg;
    return Promise.resolve(getInput(f.type))
        .then(handleInputValidation.bind(null, f.type))
        .then(finishInputBuild.bind(null, f));
}
/**
 * [getInput description]
 * @param  {[type]} type [description]
 * @return {[type]}      [description]
 */
function getInput(type) {
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
    }[type]();
}
/* ------------------------------- INPUT ------------------------------------ */
function buildInput(type = 'text') {
    const attr = { type: type, class: f.class };
    const input = _el('getElem', ['input', attr]);
    return input;
}
function buildNumberInput() {
    return buildInput('number');
}
function buildUrlInput() {
    return buildInput('url');
}
/* ----------------------------- TEXTAREA ----------------------------------- */
function buildTextArea() {
    return _el('getElem', ['textarea', {class: f.class }]);
}
function buildLongTextArea() {
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
function buildSelect(fConfg = f) {                                  /*dbug-log*///console.log("       --buildSelect [%O]", fConfg);
    return _cmbx('getFieldOptions', [fConfg.name])
        .then(finishSelectBuild.bind(null, fConfg));

    function finishSelectBuild(fConfg, opts) {                      /*dbug-log*///console.log('           --finishSelectBuild fConfg[%O] opts[%O]', fConfg, opts);
        const attr = { class: fConfg.class, id: 'sel-' + fConfg.id };
        fConfg.combo = true; //Flag for the combobox selectize-library
        return _el('getSelect', [opts, attr]);
    }
}
/* ---------------------- MULTI-SELECT/COMBOS ------------------------------- */
/**
 * Creates a select dropdown field wrapped in a div container that will
 * be reaplced inline upon selection. Either with an existing Author's name,
 * or the Author create form when the user enters a new Author's name.
 */
function buildMultiSelectFieldCntnr() {                             /*dbug-log*///console.log("       --buildMultiSelectFieldCntnr fConfg[%O]", f);
    return buildMultiSelectField(f)
        .then(buildMultiSelectCntnr.bind(null, f));
}
/**
 * [buildMultiSelectField description]
 * @param  {[type]} fConfg [description]
 * @param  {[type]} cnt    [description]
 * @return {[type]}        [description]
 */
export function buildMultiSelectField(fConfg) {                     /*dbug-log*///console.log("--buildMultiSelectField [%O]", fConfg);
    return buildSelect(fConfg)
        .then(finishFieldInput.bind(null, fConfg));
}
function finishFieldInput(fConfg, input) {                          /*dbug-log*///console.log('--finishFieldInput fConfg[%O] input[%O]', fConfg, input);
    const confg = getMultiInputFieldConfg(fConfg, input);
    input.id += fConfg.count;
    return _el('getFieldElems', [confg]);
}
function getMultiInputFieldConfg(c, input) {
    return {
        'class': c.class,
        group: c.group,
        id: c.name + c.count,
        input: input,
        label: getCntLabel(c.count)+' '+c.name,
        name: c.name+c.count,
        required: c.required || false,
        type: 'select'
    };
}
function getCntLabel(cnt) {
    const map = { 1: '1st', 2:'2nd', 3:'3rd' };
    return cnt in map ? map[cnt] : cnt+'th';
}
function buildMultiSelectCntnr(fConfg, field) {
    fConfg.input = field;
    return _el('getFieldElems', [fConfg]);
}
/* ========================== FINISH BUILD ================================== */
function finishInputBuild(fConfg, input) {                          /*dbug-log*///console.log('   --finishInputBuild [%O][%O]', fConfg, input);
    fConfg.input = input;
    setFieldValue(fConfg);
    return fConfg;
}
/* --------------------------- SET VALUE ------------------------------------ */
function setFieldValue(fConfg) {
    if (fConfg.type === 'multiSelect') { return handleMultiFieldInitVal(fConfg); }
    if (!fConfg.value) { return; }
    const val = _u('isObj', fConfg.value) ? fConfg.value.value : fConfg.value;
    $(fConfg.input).val(val);
}
function handleMultiFieldInitVal(fConfg) {
    if (fConfg.value && _u('isObj', [fConfg.value])) { return; }
    fConfg.value = {};
}