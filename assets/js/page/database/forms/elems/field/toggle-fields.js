/**
 * Toggles between displaying all fields for the entity and only showing the
 * default (required and suggested) fields.
 * TODO: document
 *
 * Export
 *     ifMutlipleDisplaysGetToggle
 *
 *
 * TOC
 *
 *
 */
import { _el, _u } from '~util';
import { _elems, _state, _form , getNextFormLevel} from '~form';
/* ================== SHOW ALL FIELDS CHECKBOX ============================== */
/**
 * Returns the html of a checkbox labeled 'Show all fields' that toggles the
 * form fields displayed between the default fields and all available.
 * If there are no additional fields for the form, no checkbox is returned.
 * @return {elem} Checkbox and label that will 'Show all fields'
 */
export function ifMutlipleDisplaysGetToggle(entity, fLvl) {         /*dbug-log*/console.log('+-- ifMutlipleDisplaysGetToggle [%s][%s]', entity, fLvl);
    if (!ifFormHasMultipleFieldDisplays(fLvl)) { return null; }
    const cntnr = buildToggleFieldsContainer();
    $(cntnr).append([getCheckbox(fLvl, entity), getLabel(fLvl)]);
    return cntnr;
}
/** On create-form init, if the 'simple' display is availble it is the default set. */
function ifFormHasMultipleFieldDisplays(fLvl) {
    const defaultDisplay = _state('getFormConfg', [fLvl, 'display']);/*dbug-log*/console.log('   --ifFormHasMultipleFieldDisplays default[%s]', defaultDisplay);
    return defaultDisplay !== 'all';
}
function buildToggleFieldsContainer() {
    return _el('getElem', ['div', {class: 'all-fields-cntnr'}]);
}
/* ============================= LABEL ====================================== */
function getLabel(fLvl) {
    const attr = { for: fLvl+'-all-fields', text: 'Show all fields.' };
    return _el('getElem', ['label', attr]);
}
/* =========================== CHECKBOX ===================================== */
function getCheckbox(fLvl, entity) {
    const chkbx = buildChkbxInput(fLvl);
    setToggleEvent(fLvl, entity, chkbx);
    _u('addEnterKeypressClick', [chkbx]);
    return chkbx;
}
function buildChkbxInput(fLvl) {
    const attr = { id: fLvl+'-all-fields', type: 'checkbox', value: 'Show all fields' };
    const input = _el('getElem', ['input', attr]);
    // if (!fS.simple) { input.checked = true; }
    return input;
}
/* ------------------------- SET HANDLER ------------------------------------ */
function setToggleEvent(fLvl, entity, chkbx) {
    // const lcEntity = _u('lcfirst', [entity]);
    $(chkbx).click(handleToggleFields.bind(null, fLvl, entity));
}
/* ===================== TOGGLE FIELD-DISPLAY =============================== */
/**
 * [handleToggleFields description]
 * @param  {[type]} fLvl [description]
 * @return {[type]}      [description]
 */
function handleToggleFields(fLvl, entity) {
    if (ifOpenSubForm(fLvl)) { return showOpenSubFormAlert(fLvl); }
    const fVals = _state('getCurrentFormFieldVals', [fLvl]);
    toggleFormFields(entity, fLvl, fVals);
}
/** Returns true if the next sub-rank form exists in the dom. */
function ifOpenSubForm(fLvl) {
    const childFormLvl = getNextFormLevel('child', fLvl);
    return $(`#${childFormLvl}-form`).length > 0;
}
/**
 * [toggleFormFields description]
 * @param  {[type]} entity [description]
 * @param  {[type]} fLvl   [description]
 * @param  {[type]} fVals  [description]
 * @return {[type]}        [description]
 */
function toggleFormFields(entity, fLvl, fVals) {
    updateFormMemoryOnFieldToggle(fLvl);
    $(`#${fLvl}-form`).empty();
    _elems('getFormRows', [entity, fVals, fLvl])
    .then(appendAndFinishRebuild);

    function appendAndFinishRebuild(rows) {
        $(`#${fLvl}-top`).append(rows);
        _form('initFormCombos', [_u('lcfirst', [entity]), fLvl]);
        _elems('fillComplexFormFields', [fLvl])
        .then(finishComplexForms);
    }
    function finishComplexForms() {
        const complex = ['citation', 'publication', 'location'];
        if (complex.indexOf(entity) === -1) { return; }
        if (entity !== 'location') { _form('finishSrcFieldLoad', [entity, fVals, fLvl]); }
        _elems('setDynamicFormStyles', [entity]);
    }
}
function updateFormMemoryOnFieldToggle(fLvl) {
    const isChecked = $(`#${fLvl}-all-fields`)[0].checked;
    _state('setFormProp', [fLvl, 'simple', !isChecked]);
    _state('setFormProp', [fLvl, 'reqElems', []]);
}
