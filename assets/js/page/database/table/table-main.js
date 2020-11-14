/**
 * Builds, filters, and manages the data table, built using ag-grid.
 *
 * TOC
 *     FILTER
 *     STATE
 *     EXPORT
 *     BUILD
 *         LOCATION
 *         SOURCE
 *         TAXON
 */
import { executeMethod } from '~util';
import { _ui } from '~db';
import * as build from './build/table-build-main.js';
import * as csv from './export/csv-export.js';
import * as filter from './filter/filter-main.js';
import * as state from './etc/table-state.js';

function moduleMethod(funcName, mod, modName, params) {
    return executeMethod(funcName, mod, modName, 'tbl-main', params);
}
/* ======================== FILTER ========================================== */
export function _filter(funcName, params = []) {
    return moduleMethod(funcName, filter, 'filter', params);
}
/* ========================= STATE ========================================== */
export function tableState() {
    return state.tableState();
}
export function getStateData() {
    return state.tableState().get(...arguments);
}
export function setStateData() {
    return state.tableState().set(...arguments);
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