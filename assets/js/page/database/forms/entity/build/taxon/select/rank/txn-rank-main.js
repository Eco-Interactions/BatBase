/**
 * Manages the taxon-rank comboboxes in the taxon select-form, used when editing
 * a taxon's parent and in the interaction form to select Subject and Object taxa.
 *
 * When a taxon in a rank combo is selected, all child-rank comboboxes are
 * repopulated with related taxa, ancestor taxa are selected automatically, and
 * the 'select' button is enabled. When a rank combo is cleared, child-rank combos
 * are reset with children of the next selected ancestor, or the root taxon. If
 * the 'create' option is selected, the taxon create-form is opened for the rank if
 * all required ancestor-rank taxa are selected in the form or shows an alert.
 * @since  Refactored 102020
 *
 * Export
 *     onRankSelection
 *
 * TOC
 *     VALIDATE THEN OPEN CREATE FORM
 *     RESET CHILD-RANK COMBOS
 *     FILL RANK COMBOS WITH RELATED TAXA
 */
import { _cmbx } from '~util';
import { _elems, _state, _val } from '~form';
import { getSelectedTaxon } from '../txn-select-main.js';
import { getAllRankAndSelectedOpts, getChildRankOpts } from './get-rank-opts.js';

export function onRankSelection(rank, val, fLvl = 'sub') {          /*dbug-log*///console.log("   +--onRankSelection rank[%s] val[%s] isNaN? [%s]", rank, val);
    if (val === 'create') { return openTaxonCreateForm(rank, fLvl); }
    if (val === '' || isNaN(parseInt(val))) { return syncTaxonCombos(rank); }
    repopulateCombosWithRelatedTaxa(val, fLvl);
    _elems('toggleSubmitBttn', [fLvl, true]);
}
 /* ----------------------- VALIDATE AND CREATE ----------------------------- */
function openTaxonCreateForm(rank, fLvl) {
    if (rank === 'Species' && !$('#sel-Genus').val()) {
        return _val('formInitAlert', [rank, 'noGenus', fLvl]);
    } else if (rank === 'Genus' && !$('#sel-Family').val()) {
        return _val('formInitAlert', [rank, 'noFamily', fLvl]);
    }
    $(`#sel-${rank}`)[0].selectize.createItem('create');
}
 /* ----------------------- RESET CHILD-RANK COMBOS ------------------------- */
function syncTaxonCombos(rank) {
    resetChildRankCombos(getSelectedTaxon(rank));
}
function resetChildRankCombos(txn) {
    getOptsForSelectedChildren(txn)
    .then(optData => repopulateRankCombos(optData.opts, optData.selected));
}
function getOptsForSelectedChildren(txn) {
    if (!txn) { return getAllGroupRankOpts() }
    return Promise.resolve(getChildOpts(txn));
}
function getAllGroupRankOpts() {
    const subGroup = _state('getFieldData', ['sub', 'Sub-Group', 'misc']).taxon;/*dbug-log*///console.log('--getAllGroupRankOpts subGroup[%O]', subGroup);
    return getAllRankAndSelectedOpts(null, subGroup.taxon);
}
function getChildOpts(txn) {
    if (txn.rank.displayName === 'Species') { return false; }
    return getChildRankOpts(txn.rank.displayName, txn.children)
}
 /* ------------- FILL RANK COMBOS WITH RELATED TAXA ------------------------ */
/**
 * Repopulates the comboboxes of child ranks when a taxon is selected. Selected
 * and ancestor ranks are populated with all taxa at the rank and the direct
 * ancestors selected. Child ranks populate with only decendant taxa and
 * have no initial selection.
 */
function repopulateCombosWithRelatedTaxa(selId, fLvl) {
    return getAllRankAndSelectedOpts(selId)
    .then(optData => repopulateRankCombos(optData.opts, optData.selected, fLvl));

}
function repopulateRankCombos(optsObj, selected, fLvl) {            /*dbug-log*///console.log('repopulateRankCombos. optsObj = %O, selected = %O', optsObj, selected);
    Object.keys(optsObj).forEach(rank => {
        repopulateRankCombo(optsObj[rank], rank, selected, fLvl)
    });
}
/**
 * Replaces the options for the rank combo. Selects the selected taxon and
 * its direct ancestors.
 */
function repopulateRankCombo(opts, rank, selected, fLvl) {          /*dbug-log*///console.log("repopulateRankCombo [%s] = %O", rank, opts);
    _cmbx('replaceSelOpts', [rank, opts]);
    if (!rank in selected) { return; }
    if (selected[rank] == 'none') { return resetPlaceholer(rank); }
    _elems('setSilentVal', [fLvl, rank, selected[rank]]);
}
function resetPlaceholer(rank) {
    _cmbx('updatePlaceholderText', [ rank, null, 0]);
}