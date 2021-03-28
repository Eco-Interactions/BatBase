/**
 * Shows a sub-form to 'Select <Role>' of the interaction with a combobox for
 * the taxon group, sub-groups (if group has multiple taxon roots), and one for
 * each rank present in the group, (eg: Bat - Family, Genus, and Species), filled
 * with the taxa at that rank. When one is selected, the remaining boxes
 * are repopulated with related taxa and the 'select' button is enabled. A 'Select
 * Unspecified' button allows selection of a (sub)group's root taxon.
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
import { _cmbx, _el, _u } from '~util';
import { _form, _elems, _state } from '~form';
import * as selectForm from './txn-select-main.js';

export function initTaxonSelectForm(role, gId) {                    /*perm-log*/console.log('       +--init[%s]Select (selected ? [%s])', role, $(`#${role}-sel`).val());
    $('#sel-'+role).data('loading', true);
    return _elems('initSubForm', [getTxnSelectParams(role, gId)])
        .then(status => finishTaxonSelectBuild(status, role, gId));
}
function getTxnSelectParams(role, gId) {                            /*dbug-log*///console.log('build[%s]Taxon[%s]SelectForm', role, groupId);
    const groupId = role === 'Subject' ? gId : getObjectInitGroup(gId);
    return {
        appendForm: form => $(`#${role}_f`).append(form),
        entity: role,
        fLvl: 'sub',
        initCombos: selectForm.initSelectFormCombos,
        combo: role,
        style: 'sml-sub-form',
        submit: _form.bind(null, 'selectRoleTaxon'),
        vals: { Group: groupId }
    };
}
function getObjectInitGroup(gId) {
    const misc = _state('getFieldState', ['top', 'Subject', 'misc']);
    return !misc || misc.id === 1 ? gId : 1; //Bat
}
/* -------------------- BUILD FORM-FIELDS ----------------------------------- */
/**
 * Customizes the taxon-select form ui. Either re-sets the existing taxon selection
 * or brings the first rank-combo into focus. Clears the [role]'s' combobox.
 */
function finishTaxonSelectBuild(status, role, gId) {
    if (!status) { return } //Error handled elsewhere
    addSelectRootTaxonBttn(role);
    customizeElemsForTaxonSelectForm(role, gId);
    selectPrevTaxonAndResetRoleField(role);
}
/** Called after group-selection builds rank rows. */
export function selectPrevTaxonAndResetRoleField(role) {            /*dbug-log*///console.log('selectPrevTaxonAndResetRoleField [%s]', role)
    selectInitTaxonOrFocusFirstCombo(role);
    _cmbx('replaceSelOpts', [role, []]);
    $('#sel-'+role).data('loading', false);
    return Promise.resolve();
}
/* ----------------- SELECT UNSPECIFIED - ROOT TAXON  ----------------------- */
function addSelectRootTaxonBttn(role) {
    const bttn = buildSelectUnspecifedBttn(role);
    $('#sub-form .bttn-cntnr').prepend(bttn);
}
function buildSelectUnspecifedBttn(role) {
    const bttn = _el('getElem', ['input', getUnspecifiedBttnAttrs()]);
    $(bttn).click(_form.bind(null, 'selectRoleTaxon', [null, 'root']));
    $(bttn).data('role', role);
    return bttn;
}
function getUnspecifiedBttnAttrs() {
    return {
        id: 'select-group',
        type: 'button',
        value: 'Select Unspecified'
    };
}
/* ------------- CUSTOMIZE ELEMS FOR TAXON SELECT-FORM ---------------------- */
/** Adds a close button. Updates the Header and the submit/cancel buttons. */
function customizeElemsForTaxonSelectForm(role, gId) {
    $('#sub-hdr span')[0].innerHTML = `Select ${role} Taxon`;
    $('#sub-hdr span+div').append(getTaxonExitButton(role));
    $('#sub-submit')[0].value = "Select Taxon";
    $('#sub-cancel')[0].value = "Reset";
    $('#sub-cancel').unbind("click").click(resetTaxonSelectForm.bind(null, role, gId));
}
function getTaxonExitButton(role) {
    const bttn = _elems('getExitButton');
    bttn.id = 'exit-sub-form';
    $(bttn).unbind('click').click(exitTaxonSelectForm.bind(null, role));
    return bttn;
}
/** Exits sub form and restores any previous taxon selection. */
function exitTaxonSelectForm(role) {
    _elems('exitSubForm', ['sub', false, _form.bind(null, 'enableRoleTaxonFieldCombos')]);
    const prevTaxonId = $('#sel-'+role).data('selTaxon');
    if (!prevTaxonId) { return; }
    resetTaxonCombobox(role, prevTaxonId);
}
function resetTaxonCombobox(role, prevTaxonId) {
    const opt = { text: getTaxonym(prevTaxonId), value: prevTaxonId};
    _cmbx('replaceSelOpts', [role, opt]);
    _cmbx('setSelVal', [role, prevTaxonId]);
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
    } else { focusFirstRankCombo(role); }
}
function getPrevSelId(role) {
    return $('#sel-'+role).val() || $('#sel-'+role).data('reset') ?
        $('#sel-'+role).data('selTaxon') : null;
}
function focusFirstRankCombo(role) {
    const ranks = _state('getFieldState', ['sub', 'Sub-Group', 'misc']).subRanks;
    const rank = ranks.slice().pop();
    _cmbx('focusCombobox', [rank]);
}
/* -------------- RESET SELECT-FORM TO INIT STATE --------------------------- */
/**
 * Reinitializes the taxon select-form to the role-taxon previously selected or
 * to the default taxon-group for the role.
 */
function resetTaxonSelectForm(role, gId) {
    $('#sel-'+role).data('reset', true);
    $('#sub-form').remove();
    selectForm.initRoleTaxonSelect(role, gId);
}
/** Resets the taxon to the one previously selected in the interaction form.  */
function resetPrevTaxonSelection(id, role) {
    const taxon = _state('getRcrd', ['taxon', id]);
    if (taxon.isRoot) { return; }                                   /*dbug-log*///console.log('           --resetPrevTaxonSelection [%s] [%s] = %O', role, id, taxon);
    selectPrevTaxon(taxon, role);
}
function selectPrevTaxon(taxon, role) {
    if (ifTaxonInDifferentGroup(taxon.group)) { return selectTaxonGroup(taxon); }
    _cmbx('setSelVal', [taxon.rank.displayName, taxon.id]);
    window.setTimeout(() => { deleteResetFlag(role); }, 1000);
}
function ifTaxonInDifferentGroup(group) {
    return $('#sel-Group').val() != group.id;
}
function selectTaxonGroup(taxon) {
    _cmbx('setSelVal', ['Group', taxon.group.id]);
}
function deleteResetFlag(role) {
    $('#sel-'+role).removeData('reset');
}