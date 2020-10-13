/**
 * The table can be filtered by Object Group when in Taxon->Bat view.
 *
 * Exports
 * 		initObjectGroupCombobox
 * 		filterTableByObjectGroup
 *
 * TOC
 * 		INIT COMBOBOX
 * 		APPLY FILTER
 */
import { _ui, _u } from '../../../../db-main.js';
import * as fM from '../../filter-main.js';

let timeout, totalObjectGroupCnt;
/* ---------------------- INIT COMBOBOX ------------------------------------- */
export function initObjectGroupCombobox() {
    return _u('getOptsFromStoredData', ['groupNames'])
    .then(setGroupCnt)
    .then(buildObjectGroupCombo)
    .then(finishGroupComboInit);
}
function setGroupCnt(groups) {
    totalObjectGroupCnt = groups.length - 1; //All but the Bat group can be objects
    return groups;
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
export function filterTableByObjectGroup(groupIds) {                            //console.log('filterTableByObjectGroup args = %O', arguments);
	_ui('fadeTable');
	if (!timeout) { timeout = setTimeout(filterByObjGroups, 1000); }
}
function filterByObjGroups() {
	timeout = null;
    const groupIds = _u('getSelVal', ['Object Group']);
    if (groupIds.length) { ifAllGroupsSelectedClearFilter(groupIds.length); }
    const filterObj = buildObjGroupFilterObj(groupIds);
	fM.setFilterState('combo', filterObj, 'direct');
	fM.onFilterChangeUpdateRowData();
    _ui('showTable');

    function ifAllGroupsSelectedClearFilter(selectedGroupCnt) {                 //console.log('selectedGroupCnt [%s] !== totalObjectGroupCnt [%s]', selectedGroupCnt, totalObjectGroupCnt, selectedGroupCnt !== totalObjectGroupCnt)
        if (selectedGroupCnt !== totalObjectGroupCnt) { return; }
        filterObj['Object Group'] = false;
        $('#selObjGroup')[0].selectize.clear();
    }
}
function buildObjGroupFilterObj(groupIds) {
    return { 'Object Group': groupIds.length ? groupIds : false };
}