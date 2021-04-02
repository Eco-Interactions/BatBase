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
    return rebuildTaxonSelectForm({ Group: val });
}
/* ------------------ SELECT SUB-GROUP -------------------------------------- */
export function onSubGroupSelection(val) {                          /*temp-log*/console.log("               +--onSubGroupSelection. [%s]", val)
    return rebuildTaxonSelectForm({ 'Sub-Group': val });
}
/* ================== BUILD (SUB)GROUP FIELDS =============================== */
function rebuildTaxonSelectForm(vals) {
    const role = $('#select-group').data('role');
    _state('updateTaxonGroupState', ['sub', vals]);
    _elems('onFormConfgChanged', ['sub', role]);
}