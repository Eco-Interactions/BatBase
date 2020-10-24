/**
 * Returns a container with 'Create [Entity]' and 'Cancel' buttons bound to events
 * specific to their form container @getBttnEvents, and a left spacer that
 * pushes the buttons to the bottom right of their form container.
 *
 * TOC
 *     SHOW ALL FIELDS CHECKBOX
 *     SUBMIT AND CANCEL BUTTONS
 */
import { _u } from '../../../db-main.js';
import { _confg, _elems, _state, exitFormLevel, submitForm } from '../../forms-main.js';

let fS;
/**
 * Returns row with a checkbox that will toggle optional form fields on the left
 * and the submit/cancel buttons on the right.
 */
export default function buildFormFooter(entity, level, action) {
    fS = _state('getFormState').forms[level];
    const cntnr = _u('buildElem', ['div', { class: "flex-row bttn-cntnr" }]);
    $(cntnr).append(...buildFooterElems(entity, level, action));
    return cntnr;
}
function buildFooterElems(entity, level, action) {
    const shwFields = buildAddFieldsCheckbox(entity, level);
    const spacer = $('<div></div>').css("flex-grow", 2);
    const bttns = buildSubmitAndCancelBttns(level, action, entity);
    return [shwFields, spacer, bttns];
}
/* ------------------ SHOW ALL FIELDS CHECKBOX ------------------------------ */
/**
 * Returns the html of a checkbox labeled 'Show all fields' that toggles the
 * form fields displayed between the default fields and all available.
 * If there are no additional fields for the form, no checkbox is returned.
 * @return {elem} Checkbox and label that will 'Show all fields'
 */
function buildAddFieldsCheckbox(entity, level) {
    if (!ifEntityHasOptionalFields(entity)) { return null; }
    const cntnr = _u('buildElem', ['div', {class: 'all-fields-cntnr'}]);
    $(cntnr).append([getCheckbox(level, entity), getLabel(level)]);
    return cntnr;
}
function ifEntityHasOptionalFields(entity) {
    const fConfg = _confg('getFormConfg', [entity]);
    return fConfg && fConfg.order.opt !== false;
}
function getCheckbox(level, entity) {
    const chkbx = buildChkbxInput(level);
    setToggleEvent(level, entity, chkbx);
    _u('addEnterKeypressClick', [chkbx]);
    return chkbx;
}
function buildChkbxInput(level) {
    const attr = { id: level+'-all-fields', type: 'checkbox', value: 'Show all fields' };
    const input = _u('buildElem', ['input', attr]);
    if (fS.expanded) { input.checked = true; }
    return input;
}
function setToggleEvent(level, entity, chkbx) {
    const lcEntity = _u('lcfirst', [entity]);
    _elems('setToggleFieldsEvent', [chkbx, lcEntity, level]);
}
function getLabel(level) {
    const attr = { for: level+'-all-fields', text: 'Show all fields.' };
    return _u('buildElem', ['label', attr]);
}
/* ------------------ SUBMIT AND CANCEL BUTTONS ----------------------------- */

/** Returns the buttons with the events bound. */
function buildSubmitAndCancelBttns(level, action, entity) {
    const events = getBttnEvents(entity, level);                                //console.log("events = %O", events);
    return [getSubmitBttn(), getCancelBttn()];

    function getSubmitBttn() {
        const bttn = buildFormButton('submit', level, getSubmitText());
        $(bttn).attr("disabled", true).css("opacity", ".6").click(events.submit);
        return bttn;
    }
    function getSubmitText() {
        const text = { create: "Create", edit: "Update" };;
        return text[action] + " " + _u('ucfirst', [entity]);
    }
    function getCancelBttn() {
        const bttn = buildFormButton('cancel', level, 'Cancel');
        $(bttn).css("cursor", "pointer").click(events.cancel);
        return bttn;
    }
}
/**
 * Returns an object with 'submit' and 'cancel' events bound to the passed level's
 * form container.
 */
function getBttnEvents(entity, level) {                                         //console.log("getBttnEvents for [%s] @ [%s]", entity, level);
    return {
        submit: getSubmitEvent(entity, level),
        cancel: getCancelFunc(entity, level)
    };

}
function getSubmitEvent(entity, level) {
    return submitForm.bind(null, '#'+level+'-form', level, entity);
}
function getCancelFunc(entity, level) {
    const onExit = fS ? fS.onFormClose : Function.prototype;
    return level === 'top' ? _elems.bind(null, 'exitRootForm') :
        exitFormLevel.bind(null, level, true, onExit);
}
/** Returns a (submit or cancel) button for the form level. */
function buildFormButton(actn, lvl, val) {
    const attr = { id: lvl+'-'+actn, class: 'ag-fresh', type: 'button', value: val}
    return _u('buildElem', ['input', attr]);
}