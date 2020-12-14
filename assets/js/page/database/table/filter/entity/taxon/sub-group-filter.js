/**
 * For taxon groups with more than one root taxon, a multi-select combobox filter
 * is added with the display name of each root taxon.
 *
 * Export
 *     initSubGroupFilter
 *
 * TOC
 *     INIT COMBOBOX
 *     APPLY FILTER
 */
import { _cmbx, _db } from '~util';
import { _table, _ui, getDetachedRcrd } from '~db';
import * as fM from '../../filter-main.js';

let timeout;
/* ---------------------- INIT COMBOBOX ------------------------------------- */
export function initSubGroupFilter(tblState) {
    return getSubGroupOpts(tblState)
        .then(getSubGroupFilter)
        .then(finishSubGroupComboInit);
}
/** @todo Move opts builders to app-util and replace this. */
function getSubGroupOpts(tblState) {
    return _db('getData', [tblState.groupName+'SubGroupNames'])
        .then(buildSubGroupOpts);
}
function buildSubGroupOpts(subGroups) {
    return Object.keys(subGroups).map(group => {
        return { text: group, value: group.split(' ')[1]};
    });
}
function getSubGroupFilter(opts) {
    const sel = fM.newSel(opts, '', 'sel-Sub-GroupFilter');
    return fM.getFilterField(null, sel);
}
function finishSubGroupComboInit(filterElem) {
    const confg = {
        name: 'Sub-Group Filter',
        maxItems: null,
        onChange: filterTableBySubGroup,
    };
    $('#focus-filters').prepend(filterElem);
    _cmbx('initCombobox', confg);
}
/* ----------------------- APPLY FILTER ------------------------------------- */
function filterTableBySubGroup(vals) {
    if (!vals.length) { return; }
    _ui('fadeTable');
    if (!timeout) { timeout = setTimeout(filterBySubGroups, 1000); }
}
function filterBySubGroups() {
    timeout = null;
    const rootNames = getSelectedRootNames(_cmbx('getSelVal', ['Sub-GroupFilter']));
    if (!rootNames) { return clearFilterAndResetTableToAllGroupTaxa(); }
    const newRoots = getTxnRootRcrds(rootNames);                    /*dbug-log*///console.log('filterTableBySubGroups = %O', newRoots);
    updateSubGroupFilterState(rootNames);
    _table('rebuildTxnTable', [newRoots]);
}
function getSelectedRootNames(names) {
    const total = $('#sel-Sub-GroupFilter')[0].selectize.currentResults.total;
    const selected = names.length === total ? {} : names;
    _table('setStateData', [{'selectedOpts': { 'Sub-Group': selected }}]);
    return Object.keys(selected).length ? names : false;
}
function clearFilterAndResetTableToAllGroupTaxa() {
    $('#sel-Sub-GroupFilter')[0].selectize.clear();
    _table('resetDataTable', ['taxa']);
}
function getTxnRootRcrds(rootNames) {                               /*dbug-log*///console.log('getTxnRootRcrds ids = %O', rootNames);
    const taxa = _table('getStateData', 'rcrdsById');
    const subGroups = _table('getStateData', 'subGroups');
    return rootNames.map(getRootRcrd);

    function getRootRcrd(rootName) {
        return getDetachedRcrd(subGroups[rootName].id, taxa, 'taxon');
    }
}
function updateSubGroupFilterState(rootNames) {
    const filter = { 'Sub-Group': { text: 'Sub-Group', value: rootNames }};
    fM.setFilterState('combo', filter, 'rebuild');
}