/**
 * The Taxon Group and Sub-Group combobox fields.
 *
 * Export
 *     ifNoSubGroupsRemoveCombo
 *     onSubGroupSelection
 *     onGroupSelection
 *
 * TOC
 *     CLEAR PREVIOUS GROUP COMBOS
 *     BUILD GROUP FIELDS
 *     IF NO SUB-GROUPS REMOVE COMBO
 *     SELECT SUB-GROUP
 */
import { _cmbx } from '~util';
import { _form, _state, _elems } from '~form';
import * as selectForm from './txn-select-main.js';

let role;
/**
 * Removes any previous group comboboxes. Shows a combobox for each rank present
 * in the selected Taxon group filled with the taxa at that rank and sub-group
 * combobox if the group has mutliple root-taxa.
 */
export function onGroupSelection(val) {                             /*temp-log*/console.log("               --onGroupSelection. [%s]", val)
    if (val === '' || isNaN(parseInt(val))) { return; }
    role = $('#select-group').data('role');
    clearPreviousGroupCombos();
    return _state('initTaxonState', ['sub', val])
    .then(taxonData => buildAndAppendGroupRows(taxonData.groupTaxon.id));
}
/* ------------------- CLEAR PREVIOUS GROUP COMBOS -------------------------- */
function clearPreviousGroupCombos() {
    $(`#${role}_fields>div`).each(ifNotGroupComboRemove);
}
function ifNotGroupComboRemove(i, elem) {
    if (i !== 0) { elem.remove(); }
}
/* ------------------ BUILD GROUP FIELDS ------------------------------------ */
/** A row for each rank present in the group filled with the taxa at that rank.  */
function buildAndAppendGroupRows(rootId) {
    _state('setFieldState', ['sub', 'Sub-Group', rootId]);
    return _elems('getFormFieldRows', ['sub'])
    .then(appendGroupRowsAndFinishBuild);
}
function appendGroupRowsAndFinishBuild(rows) {                      /*dbug-log*///console.log('appendGroupRowsAndFinishBuild = %O', rows);
    ifNoSubGroupsRemoveCombo(rows);
    $(`#${role}_fields`).append(rows);
    // _state('setFieldState', ['sub', 'Group', null]);
    selectForm.initSelectFormCombos();
    _elems('toggleSubmitBttn', ['sub', false]);
    bindGroupRootTaxonToSelectUnspecfiedBttn();
}
function bindGroupRootTaxonToSelectUnspecfiedBttn() {
    const gTaxon = _state('getTaxonProp', ['groupTaxon']);
    $('#select-group').off('click');
    $('#select-group').click(_form.bind(null, 'selectRoleTaxon', [null, gTaxon]));
}
/* ------------------- IF NO SUB-GROUPS REMOVE COMBO ------------------------ */
export function ifNoSubGroupsRemoveCombo(rows = false) {
    const subGroups = Object.keys(_state('getTaxonProp', ['subGroups']));/*dbug-log*///console.log('ifNoSubGroupsRemoveCombo. subGroups = %O, rows = %O', subGroups, rows)
    if (subGroups.length > 1) { return; }
    if (!rows) { // Taxon edit-form parent select-form
        $('#Sub-Group_f').remove();
    } else { // Taxon select-form
        rows.splice(0, 1);
    }
    _state('removeFieldFromComboInit', ['sub', 'Sub-Group']);
}
/* ------------------ SELECT SUB-GROUP -------------------------------------- */
export function onSubGroupSelection(val) {
    updateSubGroupState();
    clearPreviousSubGroupCombos();
    return buildAndAppendGroupRows(val);
}
function updateSubGroupState() {
    const subGroupId = _cmbx('getSelVal', ['Sub-Group']);
    const subGroup =  _state('getTaxonProp', ['subGroups'])[subGroupId];
    const subGroupTaxon = _state('getRcrd', ['taxon', subGroup.taxon]);/*temp-log*/console.log('onSubGroupSelection [%s]', _cmbx('getSelTxt', ['Sub-Group']));
    _state('setTaxonProp', ['subGroupId', subGroupId]);
    _state('setTaxonProp', ['groupTaxon', subGroupTaxon]);
}
function clearPreviousSubGroupCombos() {
    const gFields = $('#Group_f, #Sub-Group_f').detach();
    $(`#${role}_fields`).empty();
    $(`#${role}_fields`).append(gFields);
}