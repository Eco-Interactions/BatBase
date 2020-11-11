/**
 * The role-taxon select-form for the interaction fields, Subject and Object, and
 * to select a new parent taxon in the taxon edit-form.
 *
 * TOC
 *     ROLE-FIELD FOCUS LISTENERS
 *     ROLE-TAXON SELECT-FORM INIT
 *     SELECT ROLE-TAXON
 */
import { _cmbx } from '~util';
import {  _elems, _form, _state, getSubFormLvl } from '~form';
import * as iForm from '../int-form-main.js';
/* ----------------- ROLE-FIELD FOCUS LISTENER ------------------------------ */
/** Displays the [Role] Taxon select form when the field gains focus. */
export function addRoleTaxonFocusListeners() {
    ['Subject', 'Object'].forEach(addRoleFocusListener);
}
function addRoleFocusListener(role) {
    $(`#sel-${role}`)[0].selectize.on('focus', initRoleTaxonSelect.bind(null, role));
}
/* ----------------- ROLE-TAXON SELECT-FORM INIT ---------------------------- */
function initRoleTaxonSelect(role) {
    _form('initRoleTaxonSelect', [role]);
}
/* ------------------- SELECT ROLE-TAXON ------------------------------------ */
/**
 * When complete, the select form is removed and the most specific taxon is displayed
 * in the interaction-form <role> combobox.
 */
export function onTaxonRoleSelection(role, val) {                   /*perm-log*/console.log("       +--onTaxon[%s]Selection [%s]", role, val);
    if (val === "" || isNaN(parseInt(val))) { return; }
    $('#'+getSubFormLvl('sub')+'-form').remove();
    $('#sel-'+role).data('selTaxon', val);
    iForm.enableRoleTaxonFieldCombos();
    if (role === 'Object') { iForm.initTypeField(_state('getTaxonProp', ['groupName'])); }
    iForm.focusPinAndEnableSubmitIfFormValid(role);
}
/** Adds the selected taxon to the interaction-form's [role]-taxon combobox. */
export function selectRoleTaxon(e, groupTaxon) {
    const role = _state('getTaxonProp', ['groupName']) === 'Bat' ? 'Subject' : 'Object';
    const opt = getSelectedTaxonOption(groupTaxon);
    $('#sub-form').remove();
    if (!opt) { return; } //issue alerted to developer and editor
    _cmbx('replaceSelOpts', [role, opt]);
    _cmbx('setSelVal', [role, opt.value]);
}
/** Returns an option object for the most specific taxon selected. */
function getSelectedTaxonOption(groupTaxon) {
    const taxon = groupTaxon || _form('getSelectedTaxon');          /*dbug-log*///console.log("selected Taxon = %O", taxon);
    if (!taxon) { return; } //issue alerted to developer and editor
    return { text: taxon.displayName, value: taxon.id};
}