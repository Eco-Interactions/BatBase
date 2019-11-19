/**
 * Returns a container with 'Create [Entity]' and 'Cancel' buttons bound to events
 * specific to their form container @getBttnEvents, and a left spacer that 
 * pushes the buttons to the bottom right of their form container.
 *
 * Exports:             Imported by:
 *     buildFormFooter       form-ui
 *     
 */
import * as _u from '../../../util.js';
import * as db_forms from '../../db-forms.js';
import * as _cmbx from './combobox-util.js';
import * as _fCnfg from '../etc/form-config.js';

let fP;
/**
 * Returns row with a checkbox that will toggle optional form fields on the left 
 * and the submit/cancel buttons on the right.
 */
export function buildFormFooter(entity, level, action, noShwFields, params) {    //console.log('buildFormBttns'); 
    fP = params;   
    const cntnr = _u.buildElem("div", { class: "flex-row bttn-cntnr" });
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
    if (_fCnfg.getFormConfg(entity).order.opt === false) { return; }
    const cntnr = _u.buildElem('div', {class: 'all-fields-cntnr'});
    const chckBox = _u.buildElem('input', { id: level+'-all-fields', 
        type: 'checkbox', value: 'Show all fields' }) 
    const lbl = _u.buildElem('label', { for: level+'-all-fields', 
        text: 'Show all fields.' }); 
    if (fP.forms.expanded[entity]) { chckBox.checked = true; }
    $(chckBox).change(db_forms.toggleShowAllFields.bind(chckBox, _u.lcfirst(entity), level));
    _u.addEnterKeypressClick(chckBox);
    $(cntnr).append([chckBox, lbl]);
    return cntnr;
}
/** Returns the buttons with the events bound. */
function buildSubmitAndCancelBttns(level, action, entity) { console.log('level = [%s], fP = %O', level, fP);
    const bttn = { create: "Create", edit: "Update" };
    const events = getBttnEvents(entity, level);                                //console.log("events = %O", events);
    const submit = buildFormButton(
        'submit', level, bttn[action] + " " + _u.ucfirst(entity));
    const cancel = buildFormButton('cancel', level, 'Cancel');
    $(submit).attr("disabled", true).css("opacity", ".6").click(events.submit);
    $(cancel).css("cursor", "pointer").click(events.cancel);
    return [submit, cancel];
}
/** Returns a (submit or cancel) button for the form level. */
function buildFormButton(action, level, val) {
    return _u.buildElem("input", { id: level +'-'+action, 
        class: "ag-fresh tbl-bttn", type: "button", value: val});
}
/**
 * Returns an object with 'submit' and 'cancel' events bound to the passed level's
 * form container.  
 */
function getBttnEvents(entity, level) {                                         //console.log("getBttnEvents for [%s] @ [%s]", entity, level);
    const cnclFunc = fP.forms[level] ? fP.forms[level].exitHandler : Function.prototype;
    return { 
        submit: db_forms.getFormValuesAndSubmit.bind(null, '#'+level+'-form', level, entity), 
        cancel: db_forms.exitForm.bind(null, '#'+level+'-form', level, true, cnclFunc) 
    };
}