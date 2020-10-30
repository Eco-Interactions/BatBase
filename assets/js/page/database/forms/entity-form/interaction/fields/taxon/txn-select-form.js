/**
 * Shows a sub-form to 'Select <Role>' of the interaction with a combobox for
 * each rank present in the group, (eg: Bat - Family, Genus, and Species), filled
 * with the taxa at that rank. When one is selected, the remaining boxes
 * are repopulated with related taxa and the 'select' button is enabled. A 'Select
 * Unspecified' button allows selection of a (sub)group's root taxon.
 *
 * The Subject is always a Bat. The Object field includes a Group combobox, and a
 * Sub-Group combobox for groups with multiple root-taxa.
 *
 * Export
 *     initTaxonSelectForm
 *     selectPrevTaxonAndResetRoleField
 *
 * TOC
 *     IF OPEN SUB-FORM ISSUE
 *     BUILD FORM-FIELDS
 *     SELECT UNSPECIFIED - ROOT TAXON
 *     CUSTOMIZE ELEMS FOR TAXON SELECT-FORM
 *     SELECT CURRENT ROLE-TAXON OR FOCUS COMBO
 *     RESET SELECT-FORM TO INIT STATE
 */
import { _u } from '~db';
import { _state, _elems } from '~form';
import * as iForm from '../../int-form-main.js';

export function initTaxonSelectForm(role, groupId) {                /*perm-log*/console.log('       +--init[%s]Select (selected ? [%s])', role, $(`#${role}-sel`).val());
    $('#sel-'+role).data('loading', true);
    return buildTaxonSelectForm(role, groupId)
        .then(form => appendTxnFormAndInitCombos(role, form))
        .then(() => finishTaxonSelectBuild(role));
}
/* -------------------- BUILD FORM-FIELDS ----------------------------------- */
function buildTaxonSelectForm(role, groupId) {                      /*dbug-log*///console.log('-------------build[%s]Taxon[%s]SelectForm', role, groupId);
    addNewFormState(role);
    return _state('initTaxonState', [role, groupId])
        .then(data => _elems('initSubForm', ['sub', 'sml-sub-form',
            {Group: groupId, 'Sub-Group': data.groupTaxon.id}, '#sel-'+role]));
}
function addNewFormState(role) {
    const lcRole = _u('lcfirst', [role]);
    _state('addEntityFormState', [lcRole, 'sub', '#sel-'+role, 'create']);
}
/**
 * Customizes the taxon-select form ui. Either re-sets the existing taxon selection
 * or brings the first rank-combo into focus. Clears the [role]'s' combobox.
 */
function finishTaxonSelectBuild(role) {
    addSelectRootTaxonBttn();
    customizeElemsForTaxonSelectForm(role);
    if (role === 'Object') { return; } //For Object, called after group-selection builds rank rows.
    selectPrevTaxonAndResetRoleField(role);
}
export function selectPrevTaxonAndResetRoleField(role) {            /*dbug-log*///console.log('selectPrevTaxonAndResetRoleField [%s]', role)
    selectInitTaxonOrFocusFirstCombo(role);
    _u('replaceSelOpts', [role, []]);
    $('#sel-'+role).data('loading', false);
    return Promise.resolve();
}
/* ----------------- SELECT UNSPECIFIED - ROOT TAXON  ----------------------- */
function addSelectRootTaxonBttn() {
    const bttn = buildSelectUnspecifedBttn();
    $('#sub-form .bttn-cntnr').prepend(bttn);
}
function buildSelectUnspecifedBttn() {
    const gTaxon = _state('getTaxonProp', ['groupTaxon']);
    const bttn = _u('buildElem', ['input', getUnspecifiedBttnAttrs()]);
    $(bttn).click(iForm.selectRoleTaxon.bind(null, null, gTaxon));
    return bttn;
}
function getUnspecifiedBttnAttrs() {
    return {
        id: 'select-group',
        class: 'ag-fresh',
        type: 'button',
        value: 'Select Unspecified'
    };
}
/* ------------- CUSTOMIZE ELEMS FOR TAXON SELECT-FORM ---------------------- */
/** Adds a close button. Updates the Header and the submit/cancel buttons. */
function customizeElemsForTaxonSelectForm(role) {
    $('#sub-hdr')[0].innerHTML = "Select " + role + " Taxon";
    $('#sub-hdr').append(getTaxonExitButton(role));
    $('#sub-submit')[0].value = "Select Taxon";
    $('#sub-cancel')[0].value = "Reset";
    $('#sub-submit').unbind("click").click(iForm.selectRoleTaxon);
    $('#sub-cancel').unbind("click").click(resetTaxonSelectForm.bind(null, role));
}
function getTaxonExitButton(role) {
    const bttn = _elems('getExitButton');
    bttn.id = 'exit-sub-form';
    $(bttn).unbind('click').click(exitTaxonSelectForm.bind(null, role));
    return bttn;
}
/** Exits sub form and restores any previous taxon selection. */
function exitTaxonSelectForm(role) {
    _elems('exitSubForm', ['sub', false, iForm.enableRoleTaxonFieldCombos]);
    const prevTaxonId = $('#sel-'+role).data('selTaxon');
    if (!prevTaxonId) { return; }
    resetTaxonCombobox(role, prevTaxonId);
}
function resetTaxonCombobox(role, prevTaxonId) {
    const opt = { value: prevTaxonId, text: getTaxonym(prevTaxonId) };
    _u('replaceSelOpts', [role, opt]);
    _u('setSelVal', [role, prevTaxonId]);
}
function getTaxonym(id) {
    return _state('getRcrd', ['taxon', id]).displayName;
}
/* -------------- SELECT CURRENT ROLE-TAXON OR FOCUS COMBO ------------------ */
/**
 * Restores a previously selected taxon on initial load, or when reseting the select
 * form. When the select form loads without a previous selection or when the group
 * is changed by the user, the first combobox of the group is brought into focus.
 */
function selectInitTaxonOrFocusFirstCombo(role) {
    const selId = getPrevSelId(role);
    if (selId) { resetPrevTaxonSelection(selId, role);
    } else { focusFirstRankCombobox(_u('lcfirst', [role])); }
}
function getPrevSelId(role) {
    return $('#sel-'+role).val() || $('#sel-'+role).data('reset') ?
        $('#sel-'+role).data('selTaxon') : null;
}
function focusFirstRankCombobox(lcRole) {
    _u('focusFirstCombobox', ['#'+lcRole+'_Rows']);
}
function appendTxnFormAndInitCombos(role, form) {
    const lcRole = _u('lcfirst', [role]);
    $('#'+role+'_row').append(form);
    iForm.initFormCombos('taxon', 'sub');
}
/* -------------- RESET SELECT-FORM TO INIT STATE --------------------------- */
/**
 * Reinitializes the taxon select-form to the role-taxon previously selected or
 * to the default taxon-group for the role.
 */
function resetTaxonSelectForm(role) {
    const group = _state('getTaxonProp', ['groupName']);
    const reset =  group == 'Bat' ? initSubjectSelect : initObjectSelect;
    $('#sel-'+role).data('reset', true);
    $('#sub-form').remove();
    reset();
}
/** Resets the taxon to the one previously selected in the interaction form.  */
function resetPrevTaxonSelection(id, role) {
    const taxon = _state('getRcrd', ['taxon', id]);
    if (taxon.isRoot) { return; }                                   /*dbug-log*///console.log('           --resetPrevTaxonSelection [%s] [%s] = %O', role, id, taxon);
    selectPrevTaxon(taxon, role);
}
function selectPrevTaxon(taxon, role) {
    addTaxonOptToTaxonMemory(taxon);
    if (ifTaxonInDifferentGroup(taxon.group)) { return selectTaxonGroup(taxon); }
    _u('setSelVal', [taxon.rank.displayName, taxon.id]);
    window.setTimeout(() => { deleteResetFlag(role); }, 1000);
}
function addTaxonOptToTaxonMemory(taxon) {
    _state('setTaxonProp', ['prevSel', {val: taxon.id, text: taxon.displayName }]);
}
function ifTaxonInDifferentGroup(group) {
    return group.displayName !== 'Bat' && $('#sel-Group').val() != group.id;
}
function selectTaxonGroup(taxon) {
    _u('setSelVal', ['Group', taxon.group.id]);
}
function deleteResetFlag(role) {
    $('#sel-'+role).removeData('reset');
}