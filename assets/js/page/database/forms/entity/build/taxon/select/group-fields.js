/**
 * The Taxon Group and Sub-Group combobox fields.
 *
 * Export
 *     onGroupSelection
 *     onSubGroupSelection
 *
 * TOC
 *     BUILD (SUB)GROUP FIELDS
 *         CLEAR PREVIOUS GROUP COMBOS
 *         BUILD GROUP FIELDS
 */
import { _elems, _state } from '~form';
/**
 * Removes any previous group comboboxes. Shows a combobox for each rank present
 * in the selected Taxon group filled with the taxa at that rank and sub-group
 * combobox if the group has mutliple root-taxa.
 */
export function onGroupSelection(val) {                             /*temp-log*/console.log("               +--onGroupSelection. [%s]", val);
    if (val === '' || isNaN(parseInt(val))) { return; }
    updateFieldValues({ Group: val, 'Sub-Group': null });
    return rebuildTaxonSelectForm();
}
function updateFieldValues(vals) {
    Object.keys(vals).forEach(f => _state('setFieldState', ['sub', f, vals[f]]));
}
/* ------------------ SELECT SUB-GROUP -------------------------------------- */
export function onSubGroupSelection(val) {                          /*temp-log*/console.log("               +--onSubGroupSelection. [%s]", val)
    updateFieldValues({ 'Sub-Group': val });
    return rebuildTaxonSelectForm();
}
/* ================== BUILD (SUB)GROUP FIELDS =============================== */
function rebuildTaxonSelectForm() {
    const field = $('#select-group').data('field');
    _state('updateTaxonGroupState', ['sub']);
    _elems('onFormConfgChanged', ['sub', field])
    .then(() => ifParentSelectRemoveSpecies(field));
}
export function ifParentSelectRemoveSpecies(field) {                /*dbug-log*///console.log("--ifParentSelectRemoveSpecies field[%s]", field);
    if (field !== 'Parent') { return; }
    $('#Species_f').hide();
}