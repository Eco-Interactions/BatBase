/**
 * The table can be filtered by Object Group when in Taxon->Bat view.
 *
 * Exports
 * 		initObjectGroupCombobox
 *
 * TOC
 * 		INIT COMBOBOX
 * 		APPLY FILTER
 */
import { _ui, _u, _util } from '~db';
import * as fM from '../../filter-main.js';

let timeout;
/* ---------------------- INIT COMBOBOX ------------------------------------- */
export function initObjectGroupCombobox() {
    return _util('getOptsFromStoredData', ['groupNames'])
    .then(buildObjectGroupCombo)
    .then(finishGroupComboInit);
}
function buildObjectGroupCombo(groups) {
    const lbl = _u('buildElem', ['label', { class: 'sel-cntnr flex-row fWidthLbl' }]);
    const span = _u('buildElem', ['span', { text: 'Groups: ' }]);
    const opts = groups.filter(r => r.text !== 'Bat');  						//console.log('groups = %O', groups)
    const sel = fM.newSel(opts, 'opts-box fWidthFilter', 'sel-ObjectGroups');
    $(lbl).append([span, sel]);
    return lbl;
}
function finishGroupComboInit(filterEl) {
    const confg = {
        name: 'Object Groups',
        maxItems: null,
        onChange: filterTableByObjectGroup,
    };
    $('#focus-filters').append(filterEl);
    _u('initCombobox', [confg]);
}
/* ----------------------- APPLY FILTER ------------------------------------- */
/**
 * When viewing by publication, interactions can be filtered by the publication type.
 * Handles synchronizing with the tree-text filter.
 */
function filterTableByObjectGroup(groupIds) {                                   //console.log('filterTableByObjectGroup args = %O', arguments);
    if (!groupIds.length) { return; }
    _ui('fadeTable');
	if (!timeout) { timeout = setTimeout(filterByObjGroups, 1000); }
}
function filterByObjGroups() {
	timeout = null;
    const groupIds = _u('getSelVal', ['Object Group']);
    if (!groupIds.length) { return; }
    ifAllGroupsSelectedClearFilterCombo(groupIds.length);
    updateObjGroupFilterState(groupIds);
	fM.onFilterChangeUpdateRowData();
    _ui('showTable');

    function ifAllGroupsSelectedClearFilterCombo(selectedGroupCnt) {
        const total = $('#sel-ObjectGroups')[0].selectize.currentResults.total;      //console.log('selectedGroupCnt [%s] !== total [%s]', selectedGroupCnt, total, selectedGroupCnt !== total)
        if (selectedGroupCnt !== total) { return; }
        $('#sel-ObjectGroups')[0].selectize.clear();
    }
}
function updateObjGroupFilterState(groupIds) {
    const state = { 'Object Group': groupIds.length ? groupIds : false };
    fM.setFilterState('combo', state, 'direct');
}