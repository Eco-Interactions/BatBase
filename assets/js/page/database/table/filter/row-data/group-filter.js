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
export function initGroupFilterCombobox() {                         /*dbug-log*///console.log('-- initGroupFilterCombobox data[%O] allGroupOpts[%O]', t, allOpts);
    if ($('#groupFilterCntnr').length) { return; } //already initialized
    const t = tState().get(['groupName', 'allGroups', 'treeGroups']);
    allOpts = _opts('getOptions', [t.allGroups, Object.keys(t.allGroups).sort()]);/*dbug-log*///console.log('-- initGroupFilterCombobox data[%O] allGroupOpts[%O]', t, allOpts);
    $('#default-filters').prepend(buildGroupFilter(t.groupName, t.treeGroups));
    finishGroupComboInit();
}
function buildGroupFilter(tGroup, treeGroups) {
    const opts = getTableGroupOpts(tGroup, treeGroups);              /*dbug-log*///console.log('-- buildGroupFilter opts[%O]', opts);
    const sel = fM.newSel(opts, '', 'sel-TaxonGroupsFilter');
    const filter = fM.getFilterField(null, sel);
    filter.id = 'groupFilterCntnr';
    return filter;
}
function getTableGroupOpts(tableGroup, dataGroups) {                /*dbug-log*///console.log('--getTableGroupOpts tGroup[%s] dataGroups[%O] allOpts[%O]', tableGroup, dataGroups, allOpts);
    return dataGroups ? allOpts.filter(ifGroupInDataTree) : [];
    /* Note: Does not include group if in it's taxon group view. */
    function ifGroupInDataTree(o) {
        return o.text !== tableGroup && dataGroups.indexOf(parseInt(o.value)) !== -1;
    }
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
    if (!allOpts) { return; }
    const t = tState().get(['groupName', 'treeGroups']);
    const opts = getTableGroupOpts(t.groupName, t.treeGroups);      /*dbug-log*///console.log('groups = %O', groups)
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