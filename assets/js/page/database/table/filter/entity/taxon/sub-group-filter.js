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
import { _ui } from '~db';
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
    $('#focus-filters').append(filterEl);
}
/* ----------------------- APPLY FILTER ------------------------------------- */
function filterTableBySubGroup(vals) {                                          //console.log('filterTableBySubGroups = %O', vals);
    if (!vals.length) { return; }
    _ui('fadeTable');
    if (!timeout) { timeout = setTimeout(filterBySubGroups, 1000); }
}
function filterBySubGroups() {
    timeout = null;
    const groupNames = _cmbx('getSelVal', ['Sub-GroupFilter']);
    const totalGroups = $('#sel-Sub-GroupFilter')[0].selectize.currentResults.total;   //console.log('selectedGroupCnt [%s] !== total [%s]', selectedGroupCnt, total, selectedGroupCnt !== total);
    ifAllGroupsSelectedClearFilterCombo(groupNames.length, totalGroups);
    updateSubGroupFilterState(groupNames, totalGroups);
    fM.onFilterChangeUpdateRowData();
    _ui('showTable');

    function ifAllGroupsSelectedClearFilterCombo(selectedGroupCnt, totalGroups) {
        if (selectedGroupCnt !== totalGroups) { return; }
        $('#sel-Sub-GroupFilter')[0].selectize.clear();
    }
}
function updateSubGroupFilterState(gNames, totalGroups) {
    const selected = gNames.length && gNames.length !== totalGroups ? gNames : false;
    const state = { 'Sub-Group': selected };
    fM.setFilterState('combo', state, 'direct');
}