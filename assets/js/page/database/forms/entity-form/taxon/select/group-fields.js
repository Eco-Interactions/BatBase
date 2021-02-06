/**
 * The Object Group and Sub-Group combobox fields.
 *
 * Export
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
import * as selectForm from './txn-select-main.js';;
/**
 * Removes any previous group comboboxes. Shows a combobox for each rank present
 * in the selected Taxon group filled with the taxa at that rank and sub-group
 * combobox if the group has mutliple root-taxa.
 */
export function onGroupSelection(val) {                             /*temp-log*/console.log("               --onGroupSelection. [%s]", val)
    if (val === '' || isNaN(parseInt(val))) { return; }
    clearPreviousGroupCombos();
    return _state('initTaxonState', ['Object', val])
    .then(taxonData => buildAndAppendGroupRows(taxonData.groupTaxon.id));
}
/* ------------------- CLEAR PREVIOUS GROUP COMBOS -------------------------- */
function clearPreviousGroupCombos() {
    $('#object_Rows>div').each(ifNotGroupComboRemove);
}
function ifNotGroupComboRemove(i, elem) {
    if (i !== 0) { elem.remove(); }
}
/* ------------------ BUILD GROUP FIELDS ------------------------------------ */
/** A row for each rank present in the group filled with the taxa at that rank.  */
function buildAndAppendGroupRows(rootId) {
    return _elems('getFormFieldRows', ['object', {'Sub-Group': rootId}, 'sub'])
    .then(appendGroupRowsAndFinishBuild);
}
function appendGroupRowsAndFinishBuild(rows) {                      /*dbug-log*///console.log('appendGroupRowsAndFinishBuild = %O', rows);
    ifNoSubGroupsRemoveCombo(rows);
    $('#object_Rows').append(rows);
    _state('setFormFieldData', ['sub', 'Group', null, 'select']);
    selectForm.initSelectFormCombos();
    _elems('toggleSubmitBttn', ['#sub-submit', false]);
    bindGroupRootTaxonToSelectUnspecfiedBttn();
}
function bindGroupRootTaxonToSelectUnspecfiedBttn() {
    const gTaxon = _state('getTaxonProp', ['groupTaxon']);
    $('#select-group').off('click');
    $('#select-group').click(_form.bind(null, 'selectRoleTaxon', [null, gTaxon]));
}
/* ------------------- IF NO SUB-GROUPS REMOVE COMBO ------------------------ */
function ifNoSubGroupsRemoveCombo(rows = false) {
    const subGroups = Object.keys(_state('getTaxonProp', ['subGroups']));/*dbug-log*///console.log('ifNoSubGroupsRemoveCombo. subGroups = %O, rows = %O', subGroups, rows)
    if (subGroups.length > 1) { return; }
    if (!rows) { // Taxon edit-form parent select-form
        $('#Sub-Group_row').remove();
    } else { // Object taxon select-form
        rows.splice(0, 1);
    }
    _state('removeSelFromStateMemory', ['sub', 'Sub-Group']);
}
/* ------------------ SELECT SUB-GROUP -------------------------------------- */
export function onSubGroupSelection(val) {
    updateSubGroupState();
    clearPreviousSubGroupCombos();
    return buildAndAppendGroupRows(val);
}
function updateSubGroupState() {
    const subGroupName = _cmbx('getSelTxt', ['Sub-Group']).split(' ')[1];
    const subGroup =  _state('getTaxonProp', ['subGroups'])[subGroupName];/*temp-log*/console.log('onSubGroupSelection [%O]', subGroup);
    const subGroupTaxon = _state('getRcrd', ['taxon', subGroup.id]);
    _state('setTaxonProp', ['subGroup', subGroupName]);
    _state('setTaxonProp', ['groupTaxon', subGroupTaxon]);
    _state('setTaxonProp', ['groupRanks', subGroup.subRanks]);
}
function clearPreviousSubGroupCombos() {
    const groupRows = $('#Group_row, #Sub-Group_row').detach();
    $('#object_Rows').empty();
    $('#object_Rows').append(groupRows);
}