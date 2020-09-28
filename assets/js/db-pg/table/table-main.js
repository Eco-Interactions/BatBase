/**
 * Builds, filters, and manages the data table, built using ag-grid.
 *
 * Exports:
 *     buildLocTable
 *
 * TOC
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
import * as build from './build/build-main.js';
import * as filter from './filter/filter-main.js';
import * as csv from './export/csv-export.js';

/* ======================== EXPORT ========================================== */
export function exportCsvData() {
    csv.exportCsvData();
}
/* ========================= BUILD ========================================== */
/* -------------------------- LOCATION -------------------------------------- */
export function buildLocTable() {
    return build.buildLocTable(...arguments);
}
export function onLocViewChange() {
    return build.onLocViewChange(...arguments);
}
export function rebuildLocTable() {
    return build.rebuildLocTable(...arguments);
}
/* ---------------------------- SOURCE -------------------------------------- */
export function onSrcViewChange() {
    return build.onSrcViewChange(...arguments);
}
export function buildSrcTable() {
    return build.buildSrcTable(...arguments);
}
/* ----------------------------- TAXON -------------------------------------- */
export function onTxnViewChange() {
    return build.onTxnViewChange(...arguments);
}
export function buildTxnTable() {
    return build.buildTxnTable(...arguments);
}
export function rebuildTxnTable() {
    return build.rebuildTxnTable(...arguments);
}
/* ======================== FILTER ========================================== */
export function getTreeTextFilterElem() {
    return filter.getTreeTextFilterElem((...arguments);
}
/* ------------------ DATE FILTER ------------------------------------------- */
export function initDateFilterUi() {
    filter.initDateFilterUi();
}
export function clearDateFilter() {
    filter.clearDateFilter();
}
export function toggleDateFilter() {
    filter.toggleDateFilter(...arguments);
}
export function showTodaysUpdates() {
    filter.showTodaysUpdates((...arguments);
}
/* -------------------- DYNAMIC FILTERS ------------------------------------- */
export function loadLocFilters() {
    return filter.loadLocFilters((...arguments);
}
export function applyLocFilter() {
    return filter.applyLocFilter(...arguments);
}
export function loadSrcFilters() {
    return filter.loadSrcFilters((...arguments);
}
export function applyPubFilter() {
    return filter.applyPubFilter(...arguments);
}
export function loadTxnFilters() {
    return filter.loadTxnFilters((...arguments);
}
export function applyTxnFilter() {
    return filter.applyTxnFilter(...arguments);
}
/* -------------------- FILTER ROW-DATA ------------------------------------- */
export function getRowDataForCurrentFilters() {
    return filter.getRowDataForCurrentFilters(...arguments)
}
/** If filter cleared, filters all table rows, else applies on top of current filters. */
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
