/**
 * Builds, filters, and manages the data table, built using ag-grid.
 *
 * Exports:
 *     buildLocTable
 *
 * TOC
 *     STATE
 *     EXPORT
 *     BUILD
 *         LOCATION
 *         SOURCE
 *         TAXON
 *     FILTER
 *         DATE FILTER
 *         DYNAMIC FILTERS
 *         FILTER ROW-DATA
 *         FILTER STATE
 */
import { _ui } from '~db';
import * as build from './build/build-main.js';
import * as csv from './export/csv-export.js';
import * as filter from './filter/filter-main.js';
import * as state from './etc/table-state.js';

/* ========================= STATE ========================================== */
export function tableState() {
    return state.tableState();
}
export function resetCurTreeStorageProps() {
    state.resetCurTreeStorageProps();
}
export function resetTableParams() {
    return state.resetTableParams(...arguments);
}
/** Resets storage props, buttons, and filters. */
export function resetTableState() {
    state.resetCurTreeStorageProps();
    _ui('setTreeToggleData', [false]);
    _ui('clearFilterUi');
    filter.resetFilterState();
}
/* ======================== EXPORT ========================================== */
export function exportCsvData() {
    csv.exportCsvData();
}
/* ========================= BUILD ========================================== */
export function buildTable() {
    return build.buildTable(...arguments);
}
export function resetDataTable() {
    return build.resetDataTable(...arguments);
}
export function reloadTableWithCurrentFilters() {
    return build.reloadTableWithCurrentFilters(...arguments);
}
/* -------------------------- LOCATION -------------------------------------- */
export function onLocViewChange() {
    return build.onLocViewChange(...arguments);
}
export function rebuildLocTable() {
    return build.rebuildLocTable(...arguments);
}
export function buildLocTree() {
    return build.buildLocTree(...arguments);
}
export function showLocInDataTable() {
    return build.showLocInDataTable(...arguments);
}
/* ---------------------------- SOURCE -------------------------------------- */
export function onSrcViewChange() {
    return build.onSrcViewChange(...arguments);
}
/* ----------------------------- TAXON -------------------------------------- */
export function onTxnViewChange() {
    return build.onTxnViewChange(...arguments);
}
export function rebuildTxnTable() {
    return build.rebuildTxnTable(...arguments);
}
/* ======================== FILTER ========================================== */
export function getTreeTextFilterElem() {
    return filter.getTreeTextFilterElem(...arguments);
}
/* ------------------ DATE FILTER ------------------------------------------- */
export function clearDateFilter() {
    filter.clearDateFilter();
}
export function toggleDateFilter() {
    filter.toggleDateFilter(...arguments);
}
export function showTodaysUpdates() {
    filter.showTodaysUpdates(...arguments);
}
/* -------------------- DYNAMIC FILTERS ------------------------------------- */
export function loadLocFilters() {
    return filter.loadLocFilters(...arguments);
}
export function applyLocFilter() {
    return filter.applyLocFilter(...arguments);
}
export function loadSrcFilters() {
    return filter.loadSrcFilters(...arguments);
}
export function applyPubFilter() {
    return filter.applyPubFilter(...arguments);
}
export function loadTxnFilters() {
    return filter.loadTxnFilters(...arguments);
}
export function applyTxnFilter() {
    return filter.applyTxnFilter(...arguments);
}
/* -------------------- FILTER ROW-DATA ------------------------------------- */
export function getRowDataForCurrentFilters() {
    return filter.getRowDataForCurrentFilters(...arguments)
}
export function onFilterChangeUpdateRowData() {
    filter.onFilterChangeUpdateRowData(...arguments);
}
/* ----------------------- FILTER STATE ------------------------------------- */
export function setFilterState() {
    filter.setFilterState(...arguments);
}
export function resetFilterState() {
    filter.resetFilterState();
}
export function getFilterStateKey() {
    return filter.getFilterStateKey(...arguments);
}
export function getFilterState() {
    return filter.getFilterState();
}
export function isFilterActive() {
    return filter.isFilterActive();
}
export function getActiveFilterVals() {
    return filter.getActiveFilterVals();
}
export function getFilterStateForSentryErrorReport() {
    return filter.getFilterStateForSentryErrorReport();
}
