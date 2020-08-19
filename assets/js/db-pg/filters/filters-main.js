/**
 * Handles filtering the data displayed in the table.
 *
 *  TOC
 *     STATIC FILTERS
 *         TREE-TEXT
 *         DATE
 *     DYNAMIC FILTERS
 *     FILTER ROW DATA
 *     FILTER SETS
 *     FILTER STATE
 *         SET
 *         GET
 *             FILTER STATUS TEXT
 */
import { accessTableState as tState, _ui, _u } from '../db-main.js';
import * as fDate from './date-filter.js';
import * as fLoc from './loc-filters.js';
import * as fSrc from './src-filters.js';
import * as fState from './filter-state.js';
import * as fTree from './tree-filter.js';
import * as fTxn from './taxon/txn-filters.js';
import * as fRows from './row-data-filter.js';

/* ====================== STATIC FILTERS ==================================== */
/* ------------------ TREE-TEXT FILTER -------------------------------------- */
export function getTreeTextFilterElem(entity) {
    return fTree.getTreeTextFilterElem(entity);
}
/* ------------------ DATE FILTER ------------------------------------------- */
export function initDateFilterUi() {
    fDate.initDateFilterUi();
}
export function clearDateFilter() {
    fDate.clearDateFilter();
}
export function toggleDateFilter() {
    fDate.toggleDateFilter(...arguments);
}
export function showTodaysUpdates(focus) {
    fDate.showTodaysUpdates(focus);
}
/* ===================== DYNAMIC FILTERS ==================================== */
export function loadLocFilters(tblState) {
    fLoc.loadLocFilters(tblState);
}
export function applyLocFilter() {
    return fLoc.applyLocFilter(...arguments);
}
export function loadSrcFilters(realm) {
    fSrc.loadSrcFilters(realm);
}
export function applyPubFilter() {
    return fSrc.applyPubFilter(...arguments);
}
export function loadTxnFilters(tblState) {
    fTxn.loadTxnFilters(tblState);
}
export function applyTxnFilter() {
    return fTxn.applyTxnFilter(...arguments);
}
/* ====================== FILTER ROW DATA =================================== */
export function getRowDataForCurrentFilters(rowData) {
    const filters = fState.getRowDataFilters();
    if (!Object.keys(filters).length) { return rowData; }                       //console.log('getRowDataForCurrentFilters = %O', filters);
    return fRows.getFilteredRowData(filters, rowData);
}
/** If filter cleared (!val), filter all table rows, else apply on top of current filters. */
export function onFilterChangeUpdateRowData() {                                 //console.log('onFilterChangeUpdateRowData')
    const prevRowData = tState().get('rowData')
    const rowData = getRowDataForCurrentFilters(prevRowData);
    if (prevRowData.length === rowData.length) { return; }
    setCurrentRowData(rowData);

    function setCurrentRowData(rowData) {
        const tblState = tState().get(['api', 'curFocus']);
        tblState.api.setRowData(rowData);
        _ui('updateFilterStatusMsg');
        _ui('setTreeToggleData', [false]);
        if (tblState.curFocus === 'taxa') { fTxn.updateTaxonComboboxes(rowData); }
    }
}
/* ==================== FILTER STATE ======================================== */
export function setFilterState() {
    fState.setFilterState(...arguments);
}
export function resetFilterState() {
    fState.resetFilterState();
}
/* --------------------------- GET ----------------------------------------- */
export function getFilterStateKey() {
    return fState.getFilterStateKey(...arguments);
}
export function getFilterState() {
    return fState.getFilterState();
}
export function isFilterActive() {
    return fState.isFilterActive();
}
/* ___________________ FILTER STATUS TEXT ___________________________________ */
export function getActiveFilterVals() {
    return fState.getActiveFilterVals();
}
/* ------------------- UTIL ------------------------------------------------- */
export function newSel(opts, c, i, field) {
    const elem = _u('buildSelectElem', [opts, { class: c, id: i }]);
    $(elem).data('field', field);
    return elem;
}