/**
 * The table can be filtered by Object Group when in Taxon->Bat view.
 *
 * Export
 * 		initObjectGroupCombobox
 *
 * TOC
 * 		INIT COMBOBOX
 * 		APPLY FILTER
 */
import { _cmbx, _el } from '~util';
import { _ui } from '~db';
import * as fM from '../../filter-main.js';

let timeout;
/* ---------------------- INIT COMBOBOX ------------------------------------- */
export function initObjectGroupCombobox() {
    return _cmbx('getOptsFromStoredData', ['groupNames'])
    .then(buildObjectGroupCombo)
    .then(finishGroupComboInit);
}
function buildObjectGroupCombo(groups) {
    const lbl = _el('getElem', ['label', { class: 'field-cntnr flex-row fWidthLbl' }]);
    const span = _el('getElem', ['span', { text: 'Groups: ' }]);
    const opts = groups.filter(r => r.text !== 'Bat');  		    /*dbug-log*///console.log('groups = %O', groups)
    const sel = fM.newSel(opts, 'opts-box fWidthFilter', 'sel-ObjectGroupsFilter');
    $(lbl).append([span, sel]);
    return lbl;
}
function finishGroupComboInit(filterEl) {
    const confg = {
        name: 'Object Groups Filter',
        maxItems: null,
        onChange: filterTableByObjectGroup,
    };
    $('#focus-filters').append(filterEl);
    _cmbx('initCombobox', [confg]);
}
/* ----------------------- APPLY FILTER ------------------------------------- */
/**
 * When viewing by publication, interactions can be filtered by the publication type.
 * Handles synchronizing with the tree-text filter.
 */
function filterTableByObjectGroup(groupIds) {                       /*dbug-log*///console.log('filterTableByObjectGroup args = %O', arguments);
    if (!groupIds.length) { return; }
    _ui('fadeTable');
	if (!timeout) { timeout = setTimeout(filterByObjGroups, 1000); }
}
function filterByObjGroups() {
	timeout = null;
    const groupIds = _cmbx('getSelVal', ['ObjectGroupsFilter']);
    if (!groupIds.length) { return; }
    ifAllGroupsSelectedClearFilterCombo(groupIds.length);
    updateObjGroupFilterState(groupIds);
	fM.onFilterChangeUpdateRowData();
    _ui('showTable');

    function ifAllGroupsSelectedClearFilterCombo(selectedGroupCnt) {
        const total = $('#sel-ObjectGroupsFilter')[0].selectize.currentResults.total;/*dbug-log*///console.log('selectedGroupCnt [%s] !== total [%s]', selectedGroupCnt, total, selectedGroupCnt !== total)
        if (selectedGroupCnt !== total) { return; }
        $('#sel-ObjectGroupsFilter')[0].selectize.clear();
    }
}
function updateObjGroupFilterState(groupIds) {
    const state = { 'Object Group': groupIds.length ? groupIds : false };
    fM.setFilterState('combo', state, 'direct');
}