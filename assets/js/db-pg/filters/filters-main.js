/**
 * Handles filtering the data displayed in the table.
 *     
 * TOC:
 *     STATIC FILTERS
 *         TREE-TEXT
 *         DATE
 *     DYNAMIC FILTERS
 *     FILTER SETS
 *     FILTER STATE
 *         SET
 *         GET
 *             FILTER STATUS TEXT
 */
import * as fDate from './date-filter.js';
import * as fLoc from './loc-filters.js';
import * as fSrc from './src-filters.js';
import * as fState from './filter-state.js';
import * as fTree from './tree-filter.js';
import * as fTxn from './txn-filters.js';

/* ====================== STATIC FILTERS ==================================== */
/* ------------------ TREE-TEXT FILTER -------------------------------------- */
export function getTreeTextFilterElem(entity) {
    return fTree.getTreeTextFilterElem(entity);
}
export function filterTableByText(entity) {
    fTree.filterTableByText(entity);
}
export function getTreeFilterVal(entity) {
    return fTree.getTreeFilterVal(entity);
}
export function getRowsWithText(text) {
    return fTree.getTreeRowsWithText(getCurRowData(), text);
}
/* ------------------ DATE FILTER ------------------------------------------- */
export function initDateFilterUi() {
    fDate.initDateFilterUi();
}
export function clearDateFilter() {
    fDate.clearDateFilter();
}
export function reapplyDateFilterIfActive() {
    if (!$('#shw-chngd')[0].checked) { return; }
    const time = fState.getFilterStateKey('date').time;
    fDate.reapplyPreviousDateFilter(time, 'skip'); 
}
export function toggleDateFilter() {
    fDate.toggleDateFilter(...arguments);
}
export function showTodaysUpdates(focus) {
    fDate.showTodaysUpdates(focus);
}
export function syncViewFiltersAndUi(focus) {
    fDate.syncViewFiltersAndUi(focus);
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
/* ==================== FILTER STATE ======================================== */
/* --------------------------- SET ----------------------------------------- */
export function setCurrentRowData(data) {
    fState.setCurrentRowData(data);
}
export function setPanelFilterState(key, value) {
    fState.setPanelFilterState(key, value);
}
export function resetFilterState() {
    fState.resetFilterState();
}
/* --------------------------- GET ----------------------------------------- */
export function getFilterStateKey(key) {
    return fState.getFilterStateKey(key);
}
export function getFilterState() {
    return fState.getFilterState();
}
export function getCurRowData() {                                                    
    return fState.getCurRowData();
} 
export function isFilterActive() {
    return fState.isFilterActive();
}
/* ___________________ FILTER STATUS TEXT ___________________________________ */
export function getActiveFilterVals() { 
    return fState.getActiveFilterVals();
}