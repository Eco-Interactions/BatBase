/**
 * The table interactions can be filtered by any/all taxon groups.
 *
 * Export
 *      initGroupFilterCombobox
 *      resetGroupFilter
 *
 * TOC
 *      INIT COMBOBOX
 *      APPLY FILTER
 */
import { _cmbx, _opts } from '~util';
import { _table, _ui } from '~db';
import * as fM from '../filter-main.js';

const tState = _table.bind(null, 'tableState');
let allOpts;
let timeout;
/* ---------------------- INIT COMBOBOX ------------------------------------- */
export function initGroupFilterCombobox() {
    const t = tState().get(['groupName', 'allGroups']);
    allOpts = _opts('getOptions', [t.allGroups, Object.keys(t.allGroups).sort()]);
    $('#default-filters').prepend(buildGroupFilter(t.groupName));
    finishGroupComboInit();
}
function buildGroupFilter(tGroup) {
    const opts = getTableGroupOpts(tGroup);                         /*dbug-log*///console.log('groups = %O', groups)
    const sel = fM.newSel(opts, '', 'sel-TaxonGroupsFilter');
    const filter = fM.getFilterField(null, sel);
    filter.id = 'groupFilterCntnr';
    return filter;
}
function getTableGroupOpts(tableGroup) {
    return allOpts.filter(r => r.text !== tableGroup);
}
function finishGroupComboInit() {
    const confg = {
        name: 'Taxon Groups Filter',
        maxItems: null,
        onChange: filterTableByGroups,
    };
    _cmbx('initCombobox', [confg]);
}
export function resetGroupFilter() {
    const tableGroup = tState().get('groupName');
    const opts = getTableGroupOpts(tGroup);                         /*dbug-log*///console.log('groups = %O', groups)
    _cmbx('replaceSelOpts', ['TaxonGroupsFilter', opts]);
}
/* ----------------------- APPLY FILTER ------------------------------------- */
function filterTableByGroups(groupIds) {                            /*dbug-log*///console.log('filterTableByGroups args = %O', arguments);
    if (!groupIds.length) { return; }
    _ui('fadeTable');
    if (!timeout) { timeout = setTimeout(filterByGroups, 1000); }
}
function filterByGroups() {
    timeout = null;
    const groupIds = _cmbx('getSelVal', ['TaxonGroupsFilter']);
    if (!groupIds.length) { return; }
    ifAllGroupsSelectedClearFilterCombo(groupIds.length);
    updateGroupFilterState(groupIds);
    fM.onFilterChangeUpdateRowData();
    _ui('showTable');

    function ifAllGroupsSelectedClearFilterCombo(selectedGroupCnt) {
        const total = $('#sel-TaxonGroupsFilter')[0].selectize.currentResults.total;/*dbug-log*///console.log('selectedGroupCnt [%s] !== total [%s]', selectedGroupCnt, total, selectedGroupCnt !== total)
        if (selectedGroupCnt !== total) { return; }
        $('#sel-TaxonGroupsFilter')[0].selectize.clear();
    }
}
function updateGroupFilterState(groupIds) {
    const state = { 'Groups': groupIds.length ? groupIds : false };
    fM.setFilterState('combo', state, 'direct');
}