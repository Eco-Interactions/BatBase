/**
 * The role-taxon select-form for the interaction fields, Subject and Object, and
 * to select a new parent taxon in the taxon edit-form.
 *
 * TOC
 *     ENABLE FIELDS
 *     FIELD FOCUS-LISTENERS
 *     SELECT ROLE-TAXON
 *     ON ROLE SELECTION
 */
import { _cmbx, _u } from '~util';
import {  _elems, _form, _state, _val, getSubFormLvl } from '~form';
import * as iForm from '../int-form-main.js';
/* ======================= ENABLE FIELDS ==================================== */
export function enableTaxonFieldCombos() {
    _cmbx('enableCombobox', ['Subject']);
    _cmbx('enableCombobox', ['Object']);
}
/* ====================== FIELD FOCUS-LISTENERS ============================= */
/** Displays the [Role] Taxon select form when the field gains focus. */
export function addRoleTaxonFocusListeners() {
    ['Subject', 'Object'].forEach(addRoleFocusListener);
}
function addRoleFocusListener(role) {
    $(`#sel-${role}`)[0].selectize.on('focus', initFieldTaxonSelect.bind(null, role));
}
function initFieldTaxonSelect(role) {
    if (ifOppositeRoleFormLoading(role)) { return _val('alertFormOpen', ['sub']); }
    _form('initFieldTaxonSelect', [role]);
}
function getOppositeRole(role) {
    return role === 'Subject' ? 'Object' : 'Subject';
}
/* ----------------- IF OPEN SUB-FORM ISSUE --------------------------------- */
function ifOppositeRoleFormLoading(role) {
    return $('#sel-'+getOppositeRole(role)).data('loading');
}
/* =================== SELECT FIELD-TAXON =================================== */
/** Adds the selected taxon to the interaction-form's [role]-taxon combobox. */
export function selectFieldTaxon(e, selectRoot = false) {           /*dbug-log*/console.log('@--selectFieldTaxon selectRoot?[%s]', selectRoot);
    const field = $('#select-group').data('field');
    const opt = getSelectedTaxonOption(selectRoot);
    $('#sub-form').remove();
    if (!opt) { return; } //issue alerted to developer and editor
    _cmbx('replaceSelOpts', [field, opt]);
    _cmbx('setSelVal', [field, opt.value]);
}
/** Returns an option object for the most specific taxon selected. */
function getSelectedTaxonOption(selectRoot) {
    const selected = _form('getSelectedTaxon');
    const taxon = selectRoot || !selected ? getRoot().taxon : selected;/*dbug-log*///console.log("--getSelectedTaxonOption taxon[%O]", taxon);
    if (!taxon) { return; } //issue alerted to developer and editor
    return { text: taxon.displayName, value: taxon.id};
}
function getRoot() {
    return _state('getFieldState', ['sub', 'Sub-Group', 'misc']);
}
/* =================== ON ROLE SELECTION ==================================== */
/**
 * When complete, the select form is removed and the most specific taxon is displayed
 * in the form <field> combobox.
 * In the interaction form, when both roles are selected, the valid interaction
 * types for the taxon groups, in their respective roles, load.
 */
export function onTaxonFieldSelection(role, val) {                   /*perm-log*/console.log("       +--onTaxon[%s]Selection [%s]", role, val);
    if (val === "" || isNaN(parseInt(val))) { return; }
    $('#'+getSubFormLvl('sub')+'-form').remove();
    storeFieldSelection(role, val);
    if (field === 'Parent') { return; } //taxon edit-form
    iForm.enableTaxonFieldCombos();
    iForm.focusPinAndEnableSubmitIfFormValid(field);
    initTypeFieldIfBothTaxonRolesFilled();
}
function storeFieldSelection(field, val) {
    const subGroup = { id: getRoot().rcrd.id };
    $('#sel-'+field).data('selTaxon', val);
    _state('setFieldState', ['top', field, subGroup, 'misc' ]);      /*dbug-log*///console.log('   --storeFieldSelection field[%s] subGroup[%O]', field, subGroup);
}
/* ---------------------- INTERACTION FORMS ONLY ---------------------------- */
function initTypeFieldIfBothTaxonRolesFilled() {
    const roleGroups = ['Su', 'O'].map(getRoleRootId);
    if (!roleGroups.every(i => i)) { return; }
    iForm.initTypeField(roleGroups);
}
function getRoleRootId(pref) {
    const root = _state('getFieldState', ['top', pref+'bject', 'misc']);/*dbug-log*///console.log('--getRoleRootId root[%O]', root);
    return root ? root.id : false;
}