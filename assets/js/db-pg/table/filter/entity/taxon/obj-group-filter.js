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
import { _ui, _u } from '../../../../db-main.js';
import * as fM from '../../filter-main.js';

let timeout;
/* ---------------------- INIT COMBOBOX ------------------------------------- */
export function initObjectGroupCombobox() {
    return _u('getOptsFromStoredData', ['groupNames'])
    .then(buildObjectGroupCombo)
    .then(finishGroupComboInit);
}
function buildObjectGroupCombo(groups) {
    const lbl = _u('buildElem', ['label', { class: 'sel-cntnr flex-row fWidthLbl' }]);
    const span = _u('buildElem', ['span', { text: 'Groups: ' }]);
    const opts = groups.filter(r => r.text !== 'Bat');  						//console.log('groups = %O', groups)
    const sel = fM.newSel(opts, 'opts-box fWidthFilter', 'selObjGroup');
    $(lbl).append([span, sel]);
    return lbl;
}
function finishGroupComboInit(filterEl) {
    $('#focus-filters').append(filterEl);
    _u('initCombobox', ['Object Group', filterTableByObjectGroup, {maxItems: null}])
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
        const total = $('#selObjGroup')[0].selectize.currentResults.total;      //console.log('selectedGroupCnt [%s] !== total [%s]', selectedGroupCnt, total, selectedGroupCnt !== total)
        if (selectedGroupCnt !== total) { return; }
        $('#selObjGroup')[0].selectize.clear();
    }
}
function updateObjGroupFilterState(groupIds) {
    const state = { 'Object Group': groupIds.length ? groupIds : false };
    fM.setFilterState('combo', state, 'direct');
}