/**
 * For taxon groups with more than one root taxon, a multi-select combobox filter
 * is added with the display name of each root taxon.
 *
 * Exports:
 *     loadSubGroupFilter
 *
 * TOC
 *      INIT COMBOBOX
 *      APPLY FILTER
 */
import { _ui, _u } from '../../../../db-main.js';
import * as fM from '../../filter-main.js';

/* ---------------------- INIT COMBOBOX ------------------------------------- */
export function loadSubGroupFilter(tblState) {
    return getSubGroupOpts(tblState)
        .then(buildSubGroupCombo)
        .then(finishSubGroupComboInit);
}
function getSubGroupOpts(tblState) {
    return _u('getOptsFromStoredData', [tblState.groupName+'SubGroupNames']);
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
function filterTableBySubGroup(vals) {
    // body...
}