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
 *
 * Export
 *     onRankSelection
 *
 * TOC
 *     VALIDATE THEN OPEN CREATE FORM
 *     RESET CHILD-RANK COMBOS
 *     FILL RANK COMBOS WITH RELATED TAXA
 */
import { _u } from '~db';
import { _elems, _state, _val, getSubFormLvl } from '~form';
import * as iForm from '../../../int-form-main.js';
import { getAllRankAndSelectedOpts, getChildRankOpts } from './get-rank-opts.js';

export function onRankSelection(val, input) {                       /*dbug-log*///console.log("           --onRankSelection. val = [%s] isNaN? [%s]", val, isNaN(parseInt(val)));
    const fLvl = getSubFormLvl('sub');
    const elem = input || this.$input[0];
    if (val === 'create') { return openTaxonCreateForm(elem, fLvl); }
    if (val === '' || isNaN(parseInt(val))) { return syncTaxonCombos(elem); }
    repopulateCombosWithRelatedTaxa(val);
    _elems('toggleSubmitBttn', ['#'+fLvl+'-submit', true]);
}
 /* ----------------------- VALIDATE AND CREATE ----------------------------- */
function openTaxonCreateForm(selElem, fLvl) {
    const rank = selElem.id.split('sel-')[1];
    if (rank === 'Species' && !$('#sel-Genus').val()) {
        return _val('formInitAlert', [rank, 'noGenus', fLvl]);
    } else if (rank === 'Genus' && !$('#sel-Family').val()) {
        return _val('formInitAlert', [rank, 'noFamily', fLvl]);
    }
    selElem.selectize.createItem('create');
}
 /* ----------------------- RESET CHILD-RANK COMBOS ------------------------- */
function syncTaxonCombos(elem) {
    resetChildRankCombos(iForm.getSelectedTaxon(elem.id.split('sel-')[1]));
}
function resetChildRankCombos(selTxn) {
    getOptsForSelectedChildren(selTxn)
    .then(optData => repopulateRankCombos(optData.opts, optData.selected));
}
function getOptsForSelectedChildren(selTxn) {
    if (!selTxn) { return getAllGroupRankOpts() }
    return Promise.resolve(getChildOpts(selTxn));
}
function getAllGroupRankOpts() {
    const gTaxon = _state('getTaxonProp', ['groupTaxon']);
    return getAllRankAndSelectedOpts(null, gTaxon);
}
function getChildOpts(selTxn) {
    if (selTxn.rank.displayName === 'Species') { return false; }
    return getChildRankOpts(selTxn.rank.displayName, selTxn.children)
}
 /* ------------- FILL RANK COMBOS WITH RELATED TAXA ------------------------ */
/**
 * Repopulates the comboboxes of child ranks when a taxon is selected. Selected
 * and ancestor ranks are populated with all taxa at the rank and the direct
 * ancestors selected. Child ranks populate with only decendant taxa and
 * have no initial selection.
 */
function repopulateCombosWithRelatedTaxa(selId) {
    return getAllRankAndSelectedOpts(selId)
    .then(optData => repopulateRankCombos(optData.opts, optData.selected));

}
function repopulateRankCombos(optsObj, selected) {                  /*dbug-log*///console.log('repopulateRankCombos. optsObj = %O, selected = %O', optsObj, selected);
    Object.keys(optsObj).forEach(rank => {
        repopulateRankCombo(optsObj[rank], rank, selected)
    });
}
/**
 * Replaces the options for the rank combo. Selects the selected taxon and
 * its direct ancestors.
 */
function repopulateRankCombo(opts, rank, selected) {                /*dbug-log*///console.log("repopulateRankCombo [%s] = %O", rank, opts);
    _u('replaceSelOpts', [rank, opts]);
    if (!rank in selected) { return; }
    if (selected[rank] == 'none') { return resetPlaceholer(rank); }
    _u('setSelVal', [rank, selected[rank], 'silent']);
}
function resetPlaceholer(rank) {
    _u('updatePlaceholderText', [ rank, null, 0]);
}