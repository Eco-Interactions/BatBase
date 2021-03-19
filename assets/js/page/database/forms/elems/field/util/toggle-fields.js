/**
 * Returns the html of a checkbox labeled 'Show all fields' that toggles the
 * form fields displayed between the default fields and all available.
 * If there are no additional fields for the form, no checkbox is returned.
 * @return {elem} Checkbox and label that will 'Show all fields'
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
import { _confg, _elems, _form, _state, getNextFormLevel } from '~form';
/* ================== SHOW ALL FIELDS CHECKBOX ============================== */
export function ifMutlipleDisplaysGetToggle(entity, fLvl) {         /*dbug-log*///console.log('+--ifMutlipleDisplaysGetToggle [%s][%s]', entity, fLvl);
    if (!ifFormHasMultipleFieldDisplays(fLvl)) { return null; }
    const cntnr = buildToggleFieldsContainer();
    $(cntnr).append([getCheckbox(fLvl, entity), getLabel(fLvl)]);
    return cntnr;
}
/** On create-form init, if the 'simple' display is availble it is the default set. */
function ifFormHasMultipleFieldDisplays(fLvl) {
    const defaultDisplay = _state('getFormState', [fLvl, 'display']);/*dbug-log*///console.log('--ifFormHasMultipleFieldDisplays default[%s]', defaultDisplay);
    return defaultDisplay !== 'all';
}
function buildToggleFieldsContainer() {
    return _el('getElem', ['div', {class: 'all-fields-cntnr'}]);
}
/* ----------------------------- LABEL -------------------------------------- */
function getLabel(fLvl) {
    const attr = { for: fLvl+'-all-fields', text: 'Show all' };
    return _el('getElem', ['label', attr]);
}
/*---------------------------- CHECKBOX ------------------------------------- */
function getCheckbox(fLvl, entity) {
    const chkbx = buildChkbxInput(fLvl);
    $(chkbx).click(handleToggleFields.bind(null, fLvl, entity));
    _u('addEnterKeypressClick', [chkbx]);
    return chkbx;
}
function buildChkbxInput(fLvl) {
    const attr = { id: fLvl+'-all-fields', type: 'checkbox', value: 'Show all fields' };
    const input = _el('getElem', ['input', attr]);
    // if (!fS.simple) { input.checked = true; }
    return input;
}
/* ===================== TOGGLE FIELD-DISPLAY =============================== */
/** [handleToggleFields description] */
function handleToggleFields(fLvl, entity) {                         /*dbug-log*///console.log('@--handleToggleFields [%s][%s]', fLvl, entity);
    // if (ifOpenSubForm(fLvl)) { return _form('alertInUse', [fLvl]); } //Necessary?
    _confg('onFieldViewChangeUpdateConfg', [fLvl]);
    _elems('onFormConfgChanged', [fLvl, entity]);
}
