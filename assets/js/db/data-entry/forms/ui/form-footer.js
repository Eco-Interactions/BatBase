/**
 * Returns a container with 'Create [Entity]' and 'Cancel' buttons bound to events
 * specific to their form container @getBttnEvents, and a left spacer that 
 * pushes the buttons to the bottom right of their form container.
 *
 * Exports:             Imported by:
 *     buildFormFooter       form-ui
 *     
 */
import * as db_forms from '../../db-forms.js';
import * as _forms from '../forms-main.js';

const _u = _forms._util;

let fP;
/**
 * Returns row with a checkbox that will toggle optional form fields on the left 
 * and the submit/cancel buttons on the right.
 */
export function buildFormFooter(entity, level, action, noShwFields, params) {    //console.log('buildFormBttns'); 
    fP = params;   
    const cntnr = _u('buildElem', ['div', { class: "flex-row bttn-cntnr" }]);
    const shwFields = noShwFields ? null : buildAddFieldsCheckbox(entity, level);
    const spacer = $('<div></div>').css("flex-grow", 2);
    const submitBttns = buildSubmitAndCancelBttns(level, action, entity);
    $(cntnr).append([shwFields, spacer].concat(submitBttns));
    return cntnr;
}
/** 
 * Returns the html of a checkbox labeled 'Show all fields' that toggles the 
 * form fields displayed between the default fields and all available.
 * If there are no additional fields for the form, no checkbox is returned. 
 * @return {elem} Checkbox and label that will 'Show all fields'
 */
function buildAddFieldsCheckbox(entity, level) {                                //console.log('fP = %O', fP);
    if (!ifEntityHasOptionalFields(entity)) { return; }
    const cntnr = _u('buildElem', ['div', {class: 'all-fields-cntnr'}]);
    const chckBox = getCheckbox(level, entity);
    const lbl = getLabel(level);
    $(cntnr).append([chckBox, lbl]);
    return cntnr;
}
function ifEntityHasOptionalFields(entity) {
    return _forms.confg('getFormConfg', [entity]).order.opt !== false;
}
function getCheckbox(level, entity) {
    const attr = { id: level+'-all-fields', type: 'checkbox', value: 'Show all fields' };
    const elem = _u('buildElem', ['input', attr]); 
    const lcEntity = _u('lcfirst', [entity]);
    if (fP.forms[level].expanded) { elem.checked = true; }
    _forms.ui('setToggleFieldsEvent', [elem, lcEntity, level])
    _u('addEnterKeypressClick', [elem]);
    return elem;
}
function getLabel(level) {
    const attr = { for: level+'-all-fields', text: 'Show all fields.' };
    return _u('buildElem', ['label', attr]); 
}
/** Returns the buttons with the events bound. */
function buildSubmitAndCancelBttns(level, action, entity) { 
    const events = getBttnEvents(entity, level);                                //console.log("events = %O", events);
    return [getSubmitBttn(), getCancelBttn()];
    
    function getSubmitBttn() {
        const text = { create: "Create", edit: "Update" };
        const bttn = buildFormButton(
            'submit', level, text[action] + " " + _u('ucfirst', [entity]));
        $(bttn).attr("disabled", true).css("opacity", ".6").click(events.submit);
        return bttn;
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
    return _forms.submitForm.bind(null, '#'+level+'-form', level, entity);
}
function getCancelFunc(entity, level) {
    const onExit = fP.forms[level] ? fP.forms[level].onFormClose : Function.prototype;
    return level === 'top' ? _forms.exitFormWindow : 
        _forms.exitFormLevel.bind(null, level, true, onExit);
}
/** Returns a (submit or cancel) button for the form level. */
function buildFormButton(action, level, val) {
    const attr = { id: level +'-'+action, class: "ag-fresh tbl-bttn", 
        type: "button", value: val}
    return _u('buildElem', ['input', attr]);
}