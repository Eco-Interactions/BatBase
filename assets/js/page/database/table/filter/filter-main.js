/**
 * Handles filtering the data displayed in the table.
 *
 *  TOC
 *     STATIC FILTERS
 *         TREE-TEXT
 *         DATE
 *     DYNAMIC FILTERS
 *     FILTER SETS
 *     FILTER STATE
 *         SET
 *         GET
 *             FILTER STATUS TEXT
 *     FILTER ROW DATA
 */
import { _table, _ui, _u } from '~db';
import * as fDate from './row-data/date-filter.js';
import * as fLoc from './entity/loc-filters.js';
import * as fSrc from './entity/src-filters.js';
import * as fState from './etc/filter-state.js';
import * as fSets from './set/filter-set-main.js';
import * as fTree from './row-data/tree-filter.js';
import * as fTxn from './entity/taxon/txn-filters.js';
import * as fRows from './row-data/row-data-filter.js';

export function initDefaultFilters() {
    fDate.initDateFilterUi();
    fSets.initFilterSetsFeature();
}
/* ====================== STATIC FILTERS ==================================== */
/* ------------------ TREE-TEXT FILTER -------------------------------------- */
export function getTreeTextFilterElem(entity) {
    return fTree.getTreeTextFilterElem(entity);
}
/* ------------------ DATE FILTER ------------------------------------------- */
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
    return fLoc.loadLocFilters(tblState);
}
export function applyLocFilter() {
    return fLoc.applyLocFilter(...arguments);
}
export function loadSrcFilters(type) {
    return fSrc.loadSrcFilters(type);
}
export function applyPubFilter() {
    return fSrc.applyPubFilter(...arguments);
}
export function loadTxnFilters(tblState) {
    return fTxn.loadTxnFilters(tblState);
}
export function applyTxnFilter() {
    return fTxn.applyTxnFilter(...arguments);
}
/* ===================== FILTER SETS ======================================== */
export function isFilterSetActive() {
    return fSets.isFilterSetActive();
}
export function onTableReloadCompleteApplyFilters(filters, id) {
    fSets.onTableReloadCompleteApplyFilters(filters, id);
}
/* ==================== FILTER STATE ======================================== */
export function setFilterState() {
    fState.setFilterState(...arguments);
}
export function resetFilterState() {
    fState.resetFilterState();
}
export function getFilterStateForSentryErrorReport() {
    return fState.getFilterStateForSentryErrorReport();
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
    const elem = _u('getSelect', [opts, { class: c, id: i }]);
    $(elem).data('field', field);
    return elem;
}
/* ====================== FILTER ROW DATA =================================== */
export function getRowDataForCurrentFilters(rowData) {                          //console.log('getRowDataForCurrentFilters. rowData = %O', rowData);
    const filters = fState.getRowDataFilters();
    if (!Object.keys(filters).length) { return rowData; }                       //console.log('getRowDataForCurrentFilters = %O', filters);
    return fRows.getFilteredRowData(filters, rowData);
}
/** If filter cleared, filters all table rows, else applies on top of current filters. */
export function onFilterChangeUpdateRowData() {                                 //console.log('onFilterChangeUpdateRowData')
    if (!Object.keys(fState.getRowDataFilters()).length) { return _table('resetDataTable'); }
    const rowData = getRowDataForCurrentFilters(_table('tableState').get('rowData'));
    _ui('enableClearFiltersButton');
    setCurrentRowData(rowData);
}
function setCurrentRowData(rowData) {
    const tblState = _table('tableState').get(['api', 'curFocus']);
    tblState.api.setRowData(rowData);
    _ui('updateFilterStatusMsg');
    _ui('setTreeToggleData', [false]);
    if (tblState.curFocus === 'taxa') { fTxn.updateTaxonComboboxes(rowData); }
}