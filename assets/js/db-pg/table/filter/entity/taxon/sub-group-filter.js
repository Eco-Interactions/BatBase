/**
 * For taxon groups with more than one root taxon, a multi-select combobox filter
 * is added with the display name of each root taxon.
 *
 * Exports
 *     initSubGroupFilter
 *
 * TOC
 *     INIT COMBOBOX
 *     APPLY FILTER
 */
import { _ui, _u } from '../../../../db-main.js';
import * as fM from '../../filter-main.js';

let timeout;
/* ---------------------- INIT COMBOBOX ------------------------------------- */
export function initSubGroupFilter(tblState) {
    return getSubGroupOpts(tblState)
        .then(buildSubGroupCombo)
        .then(finishSubGroupComboInit);
}
function getSubGroupOpts(tblState) {
    return _u('getData', [tblState.groupName+'SubGroupNames'])
        .then(buildSubGroupOpts);
}
function buildSubGroupOpts(subGroups) {
    return Object.keys(subGroups).map(group => {
        return { value: group.split(' ')[1], text: group };
    });
}
function buildSubGroupCombo(opts) {
    const lbl = _u('buildElem', ['label', { class: 'sel-cntnr flex-row fWidthLbl' }]);
    const span = _u('buildElem', ['span', { text: 'Roots: ' }]);
    const sel = fM.newSel(opts, 'opts-box fWidthFilter', 'selSub-Group');
    $(lbl).append([span, sel]);
    return lbl;
}
function finishSubGroupComboInit(filterElem) {
    $('#focus-filters').append(filterElem);
    _u('initCombobox', ['Sub-Group', filterTableBySubGroup, {maxItems: null}]);
}
/* ----------------------- APPLY FILTER ------------------------------------- */
function filterTableBySubGroup(vals) {                                          //console.log('filterTableBySubGroups = %O', vals);
    if (!vals.length) { return; }
    _ui('fadeTable');
    if (!timeout) { timeout = setTimeout(filterBySubGroups, 1000); }
}
function filterBySubGroups() {
    timeout = null;
    const groupIds = _u('getSelVal', ['Sub-Group']);
    const totalGroups = $('#selSub-Group')[0].selectize.currentResults.total;   //console.log('selectedGroupCnt [%s] !== total [%s]', selectedGroupCnt, total, selectedGroupCnt !== total);
    ifAllGroupsSelectedClearFilterCombo(groupIds.length, totalGroups);
    updateSubGroupFilterState(groupIds, totalGroups);
    fM.onFilterChangeUpdateRowData();
    _ui('showTable');

    function ifAllGroupsSelectedClearFilterCombo(selectedGroupCnt, totalGroups) {
        if (selectedGroupCnt !== totalGroups) { return; }
        $('#selSub-Group')[0].selectize.clear();
    }
}
function updateSubGroupFilterState(gIds, totalGroups) {
    const selected = gIds.length && gIds.length !== totalGroups ? gIds : false;
    const state = { 'Sub-Group': selected };  console.log('state = %O', state)
    fM.setFilterState('combo', state, 'direct');
}