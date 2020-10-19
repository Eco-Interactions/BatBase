/**
 * Manages the taxon fields in the interaction form, Subject and Object.
 *
 * Export
 *     getSelectedTaxon
 *     initObjectSelect
 *     initSubjectSelect
 *     onGroupSelection
 *     onRankSelection
 *     onRoleSelection
 *     onSubGroupSelection
 *
 * TOC
 */
import { _u } from '../../../../../db-main.js';
import { _state, _elems, _cmbx, _val, getSubFormLvl } from '../../../../forms-main.js';
import * as iForm from '../../interaction-form-main.js';
import * as rank from './rank/txn-rank-main.js';

export function onRankSelection() {
    return rank.onRankSelection.bind(this)(...arguments);
}
/*--------------------- TAXON ROLES ------------------------------------------*/
/* ------------------------ INIT ---------------------- */
/**
 * Shows a sub-form to 'Select <Role>' of the interaction with a combobox for
 * each rank present in the group, (eg: Bat - Family, Genus, and Species), filled
 * with the taxa at that rank. When one is selected, the remaining boxes
 * are repopulated with related taxa and the 'select' button is enabled.
 */
export function initSubjectSelect() {                                                  console.log('       +--initSubjectSelect (selected ? [%s])', $('#Subject-sel').val());
    initTaxonSelectForm('Subject', 1);
}
/** Note: The selected group's rank combos are built @onGroupSelection. */
export function initObjectSelect() {                                                   console.log('       +--initObjectSelect (selected ? [%s])', $('#Object-sel').val());
    initTaxonSelectForm('Object', getObjectGroup())
    .then(ifNoSubGroupsRemoveCombo);
}
function getObjectGroup(prop = 'id') {
    const prevSelectedId = $('#Object-sel').data('selTaxon');
    if (!prevSelectedId) { return 2; } //default: Plants (2)
    return iForm.getRcrd('taxon', prevSelectedId).group[prop];
}
/* ------------- SELECT FORM --------------- */
function initTaxonSelectForm(role, groupId) {
    if (ifSubFormAlreadyInUse(role)) { return iForm.throwAndCatchSubFormErr(role, 'sub'); }
    $('#'+role+'-sel').data('loading', true);
    return buildTaxonSelectForm(role, groupId)
        .then(form => appendTxnFormAndInitCombos(role, form))
        .then(() => finishTaxonSelectBuild(role));
}
function ifSubFormAlreadyInUse(role) {
    return iForm.ifFormAlreadyOpenAtLevel('sub') || ifOppositeRoleFormLoading(role);
}
function ifOppositeRoleFormLoading(role) {
    const oppRole = role === 'Subject' ? 'Object' : 'Subject';
    return $('#'+oppRole+'-sel').data('loading');
}
function buildTaxonSelectForm(role, groupId) {                                  //console.log('-------------buildTaxonSelectForm. args = %O', arguments);
    addNewFormState(role);
    return _state('initTaxonState', [role, groupId])
        .then(data => _elems('initSubForm', ['sub', 'sml-sub-form',
            {Group: groupId, 'Sub-Group': data.groupTaxon.id}, '#'+role+'-sel']));
}
function addNewFormState(role) {
    const lcRole = _u('lcfirst', [role]);
    _state('addEntityFormState', [lcRole, 'sub', '#'+role+'-sel', 'create']);
}
/**
 * Customizes the taxon-select form ui. Either re-sets the existing taxon selection
 * or brings the first rank-combo into focus. Clears the [role]'s' combobox.
 */
function finishTaxonSelectBuild(role) {
    addSelectGroupBttn();
    customizeElemsForTaxonSelectForm(role);
    selectInitTaxonOrFocusFirstCombo(role);
    _u('replaceSelOpts', ['#'+role+'-sel', []]);
    $('#'+role+'-sel').data('loading', false);
}
/* --------- SELECT UNSPECIFIED BUTTON -------------- */
function addSelectGroupBttn() {
    const bttn = buildSelectUnspecifedBttn();
    $('#sub-form .bttn-cntnr').prepend(bttn);
}
function buildSelectUnspecifedBttn() {
    const attr = { id: 'select-group', class: 'ag-fresh', type: 'button', value: 'Select Unspecified' }
    const bttn = _u('buildElem', ['input', attr]);
    $(bttn).click(selectRoleTaxon.bind(null, null, iForm.getTaxonData('groupTaxon')));
    return bttn;
}
/* --------- SELECT PREVIOUS TAXON OR FOCUS COMBO -------------- */
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
    return $('#'+role+'-sel').val() || $('#'+role+'-sel').data('reset') ?
        $('#'+role+'-sel').data('selTaxon') : null;
}
function focusFirstRankCombobox(lcRole) {
    _cmbx('focusFirstCombobox', ['#'+lcRole+'_Rows']);
}
function appendTxnFormAndInitCombos(role, form) {
    const lcRole = _u('lcfirst', [role]);
    $('#'+role+'_row').append(form);
    iForm.initFormCombos('taxon', 'sub');
}
/* --------- CUSTOMIZE ELEMS FOR TAXON SELECT FORM -------------- */
/** Adds a close button. Updates the Header and the submit/cancel buttons. */
function customizeElemsForTaxonSelectForm(role) {
    $('#sub-hdr')[0].innerHTML = "Select " + role + " Taxon";
    $('#sub-hdr').append(getTaxonExitButton(role));
    $('#sub-submit')[0].value = "Select Taxon";
    $('#sub-cancel')[0].value = "Reset";
    $('#sub-submit').unbind("click").click(selectRoleTaxon);
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
    _elems('exitSubForm', ['sub', false, enableTaxonCombos]);
    const prevTaxonId = $('#'+role+'-sel').data('selTaxon');
    if (!prevTaxonId) { return; }
    resetTaxonCombobox(role, prevTaxonId);
}
function resetTaxonCombobox(role, prevTaxonId) {
    const opt = { value: prevTaxonId, text: getTaxonym(prevTaxonId) };
    _cmbx('updateComboboxOptions', ['#'+role+'-sel', opt]);
    _cmbx('setSelVal', ['#'+role+'-sel', prevTaxonId]);
}
function getTaxonym(id) {
    return iForm.getRcrd('taxon', id).displayName;
}
function enableTaxonRanks(enable = true) {
    $.each($('#sub-form select'), (i, sel) => {
        _cmbx('enableCombobox', ['#'+sel.id, enable])
    });
}
/* ------- resetTaxonSelectForm --------- */
/** Removes and replaces the taxon form. */
function resetTaxonSelectForm(role) {
    const group = iForm.getTaxonData('groupName');
    const reset =  group == 'Bat' ? initSubjectSelect : initObjectSelect;
    $('#'+role+'-sel').data('reset', true);
    $('#sub-form').remove();
    reset();
}
/** Resets the taxon to the one previously selected in the interaction form.  */
function resetPrevTaxonSelection(id, role) {
    const taxon = iForm.getRcrd('taxon', id);
    if (taxon.isRoot) { return; }                                               console.log('           --resetPrevTaxonSelection [%s] [%s] = %O', role, id, taxon);
    selectPrevTaxon(taxon, role);
}
function selectPrevTaxon(taxon, role) {
    addTaxonOptToTaxonMemory(taxon);
    if (ifTaxonInDifferentGroup(taxon.group)) { return selectTaxonGroup(taxon); }
    _cmbx('setSelVal', ['#'+taxon.rank.displayName+'-sel', taxon.id]);
    window.setTimeout(() => { deleteResetFlag(role); }, 1000);
}
function addTaxonOptToTaxonMemory(taxon) {
    _state('setTaxonProp', ['prevSel', {val: taxon.id, text: taxon.displayName }]);
}
function ifTaxonInDifferentGroup(group) {
    return group.displayName !== 'Bat' && $('#Group-sel').val() != group.id;
}
function selectTaxonGroup(taxon) {
    _cmbx('setSelVal', ['#Group-sel', taxon.group.id]);
}
function deleteResetFlag(role) {
    $('#'+role+'-sel').removeData('reset');
}
/* ------------------ onGroupSelect ------------- */
/**
 * Removes any previous group comboboxes. Shows a combobox for each rank present
 * in the selected Taxon group filled with the taxa at that rank.
 */
export function onGroupSelection(val) {                                                //console.log("               --onGroupSelection. val = ", val)
    if (val === '' || isNaN(parseInt(val))) { return; }
    clearPreviousGroupRankCombos();
    _state('initTaxonState', ['Object', val])
    .then(taxonData => buildAndAppendGroupRows(taxonData.groupTaxon.id));
}
/** A row for each rank present in the group filled with the taxa at that rank.  */
function buildAndAppendGroupRows(rootId) {
    return _elems('getFormFieldRows', ['object', {'Sub-Group': rootId}, 'sub'])
    .then(appendGroupRowsAndFinishBuild);
}
function appendGroupRowsAndFinishBuild(rows) {
    ifNoSubGroupsRemoveCombo(rows);
    $('#object_Rows').append(rows);
    _state('setFormFieldData', ['sub', 'Group', null, 'select']);
    iForm.initFormCombos('taxon', 'sub');
    _elems('toggleSubmitBttn', ['#sub-submit', false]);
    /* Binds the current group to the 'Select Unspecified' button */
    $('#select-group').off('click');
    $('#select-group').click(selectRoleTaxon.bind(null, null, iForm.getTaxonData('groupTaxon')));
}
function ifNoSubGroupsRemoveCombo(rows = false) {
    const subGroups = Object.keys(iForm.getTaxonData('subGroups'));                   //console.log('ifNoSubGroupsRemoveCombo. subGroups = %O, rows = %O', subGroups, rows)
    if (subGroups.length > 1) { return; }
    if (!rows) {
        $('#Sub-Group_row').remove();
    } else {
        $(rows)[0].removeChild($(rows)[0].childNodes[0]); //removes Sub-Group row
    }
}
function clearPreviousGroupRankCombos() {
    $('#object_Rows>div').each(ifRankComboRemoveCombo);
}
function ifRankComboRemoveCombo(i, elem) {
    if (i !== 0) { elem.remove(); }
}
/* ------------ onSubGroupSelection ---------- */
export function onSubGroupSelection(val) {
    updateSubGroupState();
    clearPreviousSubGroupCombos();
    return buildAndAppendGroupRows(val);
}
function updateSubGroupState() {
    const subGroup = $('#Sub-Group-sel')[0].innerText.split(' ')[1];            //console.log('onSubGroupSelection [%s]', subGroup);
    const subGroupTaxon = iForm.getRcrd('taxon', iForm.getTaxonData('subGroups')[subGroup].id);
    _state('setTaxonProp', ['subGroup', subGroup]);
    _state('setTaxonProp', ['groupTaxon', subGroupTaxon]);
}
function clearPreviousSubGroupCombos() {
    const groupRows = $('#Group_row, #Sub-Group_row').detach();
    $('#object_Rows').empty();
    $('#object_Rows').append(groupRows);
}
/* ------- selectRoleTaxon --------- */
/** Adds the selected taxon to the interaction-form's [role]-taxon combobox. */
function selectRoleTaxon(e, groupTaxon) {
    const role = iForm.getTaxonData('groupName') === 'Bat' ? 'Subject' : 'Object';
    const opt = getSelectedTaxonOption(groupTaxon);
    $('#sub-form').remove();
    if (!opt) { return; } //issue alerted to developer and editor
    _cmbx('updateComboboxOptions', ['#'+role+'-sel', opt]);
    _cmbx('setSelVal', ['#'+role+'-sel', opt.value]);
}
/** Returns an option object for the most specific taxon selected. */
function getSelectedTaxonOption(groupTaxon) {
    const taxon = groupTaxon || getSelectedTaxon();                             //console.log("selected Taxon = %O", taxon);
    if (!taxon) { return; } //issue alerted to developer and editor
    return { value: taxon.id, text:taxon.displayName };
}
/** Finds the most specific rank with a selection and returns that taxon record. */
export function getSelectedTaxon(aboveRank) {
    const selElems = $('#sub-form .selectized').toArray();
    if (ifEditingTaxon()) { selElems.reverse(); } //Taxon parent edit form.
    const selected = selElems.find(isSelectedTaxon.bind(null, aboveRank));                              //console.log("getSelectedTaxon. selElems = %O selected = %O", selElems, selected);
    return !selected ? false : iForm.getRcrd('taxon', $(selected).val());

    function ifEditingTaxon() {
        const action = _state('getFormProp', ['top', 'action']);
        const entity = _state('getFormProp', ['top', 'entity']);
        return action == 'edit' && entity == 'taxon';
    }
}
/**
 * Note: On rank combo reset, the most specific taxon above the resetRank is selected.
 */
function isSelectedTaxon(resetRank, elem) {
    if (!ifIsRankComboElem(elem)) { return false; }
    if (resetRank && isRankChildOfResetRank(resetRank, elem)) { return false; }
    return $(elem).val();
}
function isRankChildOfResetRank(resetRank, elem) {
    const allRanks = iForm.getTaxonData('groupRanks');
    const rank = elem.id.split('-sel')[0];
    return allRanks.indexOf(rank) < allRanks.indexOf(resetRank);
}
function ifIsRankComboElem(elem) {
    return elem.id.includes('-sel') && !elem.id.includes('Group');
 }
/**
 * When complete, the select form is removed and the most specific taxon is displayed
 * in the interaction-form <role> combobox.
 */
export function onTaxonRoleSelection(role, val) {                                      console.log("       +--onTaxonRoleSelection [%s] = ", role, val);
    if (val === "" || isNaN(parseInt(val))) { return; }
    $('#'+getSubFormLvl('sub')+'-form').remove();
    $('#'+role+'-sel').data('selTaxon', val);
    enableTaxonCombos();
    if (role === 'Object') { iForm.initTypeField(getObjectGroup('displayName')); }
    iForm.focusPinAndEnableSubmitIfFormValid(role);
}
function enableTaxonCombos() {
    _cmbx('enableCombobox', ['#Subject-sel']);
    _cmbx('enableCombobox', ['#Object-sel']);
}