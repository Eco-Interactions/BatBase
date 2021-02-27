/**
 * Builds form-field inputs.
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
        multiSelect:    buildMultiSelectField,
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
    const attr = { class: 'xlrg-field '+f.class, id:'txt-'+f.name };
    return _el('getElem', ['textarea', attr]);
}
/* --------------------- SINGLE SELECT/COMBOS ------------------------------- */
/**
 * Creates and returns a select dropdown for the passed field. If it is one of
 * a larger set of select elems, the current count is appended to the id. Adds
 * the select's fieldName to the subForm config's 'selElem' array to later
 * init the 'selectize' combobox.
 */
function buildSelect() {                                            /*dbug-log*///console.log("       --buildSelect [%s][%O]", f.name, f);
    return _cmbx('getFieldOptions', [f.name])
        .then(finishSelectBuild.bind(null, f));

    function finishSelectBuild(fConfg, opts) {                      /*dbug-log*///console.log('           --finishSelectBuild [%s] ?[%s] opts[%O]', fConfg, opts);
        const attr = { class: fConfg.class, id: 'sel-' + fConfg.name };
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
function buildMultiSelectField() {                                  /*dbug-log*///console.log("       --buildMultiSelectField [%s][%s]", f);
    return buildMultiSelectInput(f)
        .then(returnFinishedMultiSelectField);

    function returnFinishedMultiSelectField(input) {
        const fConfg = {
            dir: 'col',
            input: input,
            name: f.name,
        };
        return _el('getFieldElems', [fConfg]);
    }
}
export function buildMultiSelectInput(field, cnt = 1) {             /*dbug-log*///console.log("           --buildMultiSelectInput [%s][%O]", cnt, field);
    return buildSelect(field)
        .then(finishFieldInput);

    function finishFieldInput(input) {
        const fConfg = {
            input: input,
            label: getCntLabel(cnt),
            name: f.name+cnt
        };
        if (cnt) { $(input).data('cnt', cnt); }
        return _el('getFieldElems', [fConfg]);
    }
}
function getCntLabel(cnt) {
    const map = {1: '1st: ', 2:'2nd: ', 3:'3rd: '};
    return cnt in map ? map[cnt] : cnt+'th: ';
}
/* ========================== FINISH BUILD ================================== */
function finishInputBuild(fConfg, input) {                          /*dbug-log*///console.log('   --finishInputBuild [%O][%O]', fConfg, input);
    fConfg.input = input;
    setFieldValue(fConfg);
    return fConfg;
}
/* --------------------------- SET VALUE ------------------------------------ */
function setFieldValue(fConfg) {
    if (!fConfg.value || fConfg.type === 'multiSelect') { return; }
    $(fConfg.input).val(fConfg.value);
}