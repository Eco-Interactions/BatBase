/**
 * The Taxon Group and Sub-Group combobox fields.
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
    _state('setTaxonGroupState', [null, 'sub', { Group: val }]);
    return _elems('getFormFieldRows', ['sub'])
        .then(appendGroupRowsAndFinishBuild);
}
/* ------------------- CLEAR PREVIOUS GROUP COMBOS -------------------------- */
function clearPreviousGroupCombos() {
    $(`#${role}_fields>div`).each(ifNotGroupComboRemove);
}
function ifNotGroupComboRemove(i, elem) {
    if (i !== 0) { elem.remove(); }
}
/* ------------------ BUILD GROUP FIELDS ------------------------------------ */
function appendGroupRowsAndFinishBuild(rows) {                      /*dbug-log*///console.log('appendGroupRowsAndFinishBuild = %O', rows);
    $(`#${role}_fields`).append(rows);
    selectForm.initSelectFormCombos();
    _elems('toggleSubmitBttn', ['sub', false]);
    bindGroupRootTaxonToSelectUnspecfiedBttn();
}
function bindGroupRootTaxonToSelectUnspecfiedBttn() {
    const gTaxon = _state('getFieldData', ['sub', 'Sub-Group', 'misc']).taxon;/*dbug-log*///console.log('ifNoSubGroupsRemoveCombo. subGroups = %O, rows = %O', subGroups, rows)
    $('#select-group').off('click');
    $('#select-group').click(_form.bind(null, 'selectRoleTaxon', [null, gTaxon]));
}
/* ------------------ SELECT SUB-GROUP -------------------------------------- */
export function onSubGroupSelection(val) {
    _state('setTaxonGroupState', [null, 'sub', { 'Sub-Group': val }])
    clearPreviousSubGroupCombos();
    return buildAndAppendGroupRows(val);
}
function clearPreviousSubGroupCombos() {
    const gFields = $('#Group_f, #Sub-Group_f').detach();
    $(`#${role}_fields`).empty();
    $(`#${role}_fields`).append(gFields);
}