/**
 * Shows a sub-form to 'Select <Field>' of the interaction with a combobox for
 * the taxon group, sub-groups (if group has multiple taxon roots), and one for
 * each rank present in the group, (eg: Bat - Family, Genus, and Species), filled
 * with the taxa at that rank. When one is selected, the remaining boxes
 * are repopulated with related taxa and the 'select' button is enabled. A 'Select
 * Unspecified' button allows selection of a (sub)group's root taxon.
 *
 * TODO: UPDATE DOCUMENTATION. SELECT FORM USED TO EDIT PARENT TAXON TOO.
 *
 * Export
 *     initTaxonSelectForm
 *     selectPrevTaxonAndResetField
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

export function initTaxonSelectForm(field, gId, sgId, onSubmit) {   /*perm-log*/console.log('       +--init[%s]Select (selected ? [%s])', field, $(`#sel-${field}`).val());
    $('#sel-'+field).data('loading', true);
    return _elems('initSubForm', [getTxnSelectParams(field, gId)])
        .then(status => finishTaxonSelectBuild(status, field, gId));
}
function getTxnSelectParams(field, gId, sgId, onSubmit) {           /*dbug-log*/console.log('build[%s]Taxon[%s]SelectForm onSubmit?[%O]', field, groupId, onSubmit);
    const groupId = field === 'Object' ? getObjectInitGroup(gId) : gId;
    return {
        action: 'select',
        appendForm: form => $(`#${field}_f`).append(form),
        name: field,
        group: 'sub',
        initCombos: selectForm.initSelectFormCombos,
        combo: field,
        style: 'sml-sub-form',
        submit: onSubmit ? onSubmit : _form.bind(null, 'selectFieldTaxon'),
        vals: { Group: groupId, 'Sub-Group': sgId  }
    };
}
function getObjectInitGroup(gId) {
    const misc = _state('getFieldState', ['top', 'Subject', 'misc']);
    return !misc || misc.id === 1 ? gId : 1; //Bat
}
/* -------------------- BUILD FORM-FIELDS ----------------------------------- */
/**
 * Customizes the taxon-select form ui. Either re-sets the existing taxon selection
 * or brings the first rank-combo into focus. Clears the [field]'s' combobox.
 */
function finishTaxonSelectBuild(status, field, gId) {
    if (!status) { return } //Error handled elsewhere
    addSelectRootTaxonBttn(field);
    customizeElemsForTaxonSelectForm(field, gId);
    selectPrevTaxonAndResetField(field);
}
/** Called after group-selection builds rank rows. */
function selectPrevTaxonAndResetField(field) {                      /*dbug-log*/console.log('selectPrevTaxonAndResetField [%s]', field)
    selectInitTaxonOrFocusFirstCombo(field);
    _cmbx('replaceSelOpts', [field, []]);
    $('#sel-'+field).data('loading', false);
}
/* ----------------- SELECT UNSPECIFIED - ROOT TAXON  ----------------------- */
function addSelectRootTaxonBttn(field) {
    const bttn = buildSelectUnspecifedBttn(field);
    $('#sub-form .bttn-cntnr').prepend(bttn);
}
function buildSelectUnspecifedBttn(field) {
    const bttn = _el('getElem', ['input', getUnspecifiedBttnAttrs()]);
    $(bttn).click(_form.bind(null, 'selectFieldTaxon', [null, 'root']));
    $(bttn).data('field', field);
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
function customizeElemsForTaxonSelectForm(field, gId) {
    $('#sub-hdr span')[0].innerHTML = `Select ${field} Taxon`;
    $('#sub-hdr span+div').append(getTaxonExitButton(field));
    $('#sub-submit')[0].value = "Select Taxon";
    $('#sub-cancel')[0].value = "Reset";
    $('#sub-cancel').unbind("click").click(resetTaxonSelectForm.bind(null, field, gId));
}
function getTaxonExitButton(field) {
    const bttn = _elems('getExitButton');
    bttn.id = 'exit-sub-form';
    $(bttn).unbind('click').click(exitTaxonSelectForm.bind(null, field));
    return bttn;
}
/** Exits sub form and restores any previous taxon selection. */
function exitTaxonSelectForm(field) {
    _elems('exitSubForm', ['sub', false, _form.bind(null, 'enableTaxonFieldCombos')]);
    const prevTaxonId = $('#sel-'+field).data('selTaxon');
    if (!prevTaxonId) { return; }
    resetTaxonCombobox(field, prevTaxonId);
}
function resetTaxonCombobox(field, prevTaxonId) {
    const opt = { text: getTaxonym(prevTaxonId), value: prevTaxonId};
    _cmbx('replaceSelOpts', [field, opt]);
    _cmbx('setSelVal', [field, prevTaxonId]);
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
function selectInitTaxonOrFocusFirstCombo(field) {
    const selId = getPrevSelId(field);
    if (selId) { resetPrevTaxonSelection(selId, field);
    } else { focusFirstRankCombo(field); }
}
function getPrevSelId(field) {
    return $('#sel-'+field).val() || $('#sel-'+field).data('reset') ?
        $('#sel-'+field).data('selTaxon') : null;
}
function focusFirstRankCombo(field) {
    const ranks = _state('getFieldState', ['sub', 'Sub-Group', 'misc']).subRanks;
    const rank = ranks.slice().pop();
    _cmbx('focusCombobox', [rank]);
}
/* -------------- RESET SELECT-FORM TO INIT STATE --------------------------- */
/**
 * Reinitializes the taxon select-form to the field-taxon previously selected or
 * to the default taxon-group for the field.
 */
function resetTaxonSelectForm(field, gId) {
    $('#sel-'+field).data('reset', true);
    $('#sub-form').remove();
    selectForm.initFieldTaxonSelect(field, gId);
}
/** Resets the taxon to the one previously selected in the interaction form.  */
function resetPrevTaxonSelection(id, field) {
    const taxon = _state('getRcrd', ['taxon', id]);
    if (taxon.isRoot) { return; }                                   /*dbug-log*///console.log('           --resetPrevTaxonSelection [%s] [%s] = %O', field, id, taxon);
    selectPrevTaxon(taxon, field);
}
function selectPrevTaxon(taxon, field) {
    if (ifTaxonInDifferentGroup(taxon.group)) { return selectTaxonGroup(taxon); }
    _cmbx('setSelVal', [taxon.rank.displayName, taxon.id]);
    window.setTimeout(() => { deleteResetFlag(field); }, 1000);
}
function ifTaxonInDifferentGroup(group) {
    return $('#sel-Group').val() != group.id;
}
function selectTaxonGroup(taxon) {
    _cmbx('setSelVal', ['Group', taxon.group.id]);
}
function deleteResetFlag(field) {
    $('#sel-'+field).removeData('reset');
}