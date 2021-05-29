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
import {  _elems, _form, _state, _val } from '~form';
import * as iForm from '../int-form-main.js';
/* ======================= ENABLE FIELDS ==================================== */
export function enableTaxonFieldCombos(field) {                     /*dbug-log*///console.log('--enableTaxonFieldCombos field?[%s]', field);
    const fields = field === 'Parent' ? [field] : ['Subject', 'Object'];
    fields.forEach(f => _cmbx('enableCombobox', [f]));
}
/* ====================== FIELD FOCUS-LISTENERS ============================= */
/** Displays the [Role] Taxon select form when the field gains focus. */
export function addRoleTaxonFocusListeners() {
    ['Subject', 'Object'].forEach(addRoleFocusListener);
}
function addRoleFocusListener(role) {
    $(`#sel-${role}`)[0].selectize.on('focus', loadFieldTaxonSelect.bind(null, role));
}
function loadFieldTaxonSelect(role) {
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
export function selectFieldTaxon(e, selectRoot = false) {           /*dbug-log*///console.log('@--selectFieldTaxon selectRoot?[%s]', selectRoot);
    const field = $('#select-group').data('field');
    const opt = getSelectedTaxonOption(selectRoot);
    updateCombo(field, opt);
    $('#sub-form').remove(); //Used with edit-forms and 'select unspecified'
}
/** Returns an option object for the most specific taxon selected. */
function getSelectedTaxonOption(selectRoot) {
    const taxon = selectRoot ? getRoot().taxon : _form('getSelectedTaxon');/*dbug-log*///console.log("--getSelectedTaxonOption taxon[%O]", taxon);
    if (!taxon) { return; } //issue alerted to developer and editor
    return buildTxnOpt(taxon);
}
function buildTxnOpt(taxon) {
    return { text: taxon.displayName, value: taxon.id};
}
function getRoot() {
    return _state('getFieldState', ['sub', 'Sub-Group', 'misc']);
}
export function buildOptAndUpdateCombo(field, id, silent = false) {/*dbug-log*///console.log("--buildOptAndUpdateCombo field[%O] id[%s]", field, id);
    const taxon = _state('getEntityRcrds', ['taxon'])[id];
    updateCombo(field, buildTxnOpt(taxon), silent);
    _cmbx('enableCombobox', [field]);
}
function updateCombo(field, opt, silent) {
    _cmbx('replaceSelOpts', [field, opt]);
    _cmbx('setSelVal', [field, opt.value, silent]);

}
/* =================== ON ROLE SELECTION ==================================== */
/**
 * When complete, the select form is removed and the most specific taxon is displayed
 * in the form <field> combobox.
 * In the interaction form, when both roles are selected, the valid interaction
 * types for the taxon groups, in their respective roles, load.
 */
export function onTaxonFieldSelection(field, val) {                 /*perm-log*/console.log("       +--onTaxon[%s]Selection [%s]", field, val);
    if (val === "" || isNaN(parseInt(val))) { return; }
    $('#sub-form').remove();
    storeFieldSelection(field, val);
    iForm.enableTaxonFieldCombos(field);
    if (field === 'Parent') { return; } //taxon edit-form
    iForm.focusPinAndEnableSubmitIfFormValid(field);
    initTypeFieldIfBothTaxonRolesFilled();
}
function storeFieldSelection(field, val) {
    $('#sel-'+field).data('selTaxon', val);
    if (_state('isEditForm', ['top'])) { return; }
    const subGroup = { id: getRoot().rcrd.id };
    _state('setFieldState', ['top', field, subGroup, 'misc' ]);     /*dbug-log*///console.log('   --storeFieldSelection field[%s] subGroup[%O]', field, subGroup);
}
/* ---------------------- INTERACTION FORMS ONLY ---------------------------- */
export function initTypeFieldIfBothTaxonRolesFilled() {
    const roleGroups = ['Su', 'O'].map(getRoleRootId);
    if (!roleGroups.every(i => i)) { return; }
    iForm.initTypeField(roleGroups);
}
function getRoleRootId(pref) {
    const root = _state('getFieldState', ['top', pref+'bject', 'misc']);/*dbug-log*///console.log('--getRoleRootId root[%O]', root);
    return root ? root.id : false;
}