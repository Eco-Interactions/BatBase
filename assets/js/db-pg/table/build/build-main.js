/**
 * Handles the focus-entity's data-table (re)build.
 *
 * Note: Refactor to using a formal stack array for table builds to be able to
 * cancel table build if another table-rebuild action is initated. The asynchronous
 * local database calls make this process difficult to cancel.
 *
 * TOC
 *     ENTITY TABLE
 *         LOCATION
 *         SOURCE
 *         TAXON
 *     FORMAT DATA
 *         DATA TREE
 *         AGGRID ROW-DATA
 *     INIT AGGRID TABLE
 *     REBUILD TABLE
 */
import { _u, _ui } from '../../db-main.js';
import { getFilterState, resetTableState, resetTableParams, tableState } from '../table-main.js';
import * as format from './format/aggrid-format.js';
import * as init from './init-table.js';
import * as loc from './entity/loc-table.js';
import * as src from './entity/src-table.js';
import * as tree from './format/data-tree.js';
import * as txn from './entity/txn-table.js';

/* ======================== ENTITY TABLE ==================================== */
/* -------------------------- LOCATION -------------------------------------- */
export function buildLocTable() {
    return loc.buildLocTable(...arguments);
}
export function onLocViewChange() {
    return loc.onLocViewChange(...arguments);
}
export function rebuildLocTable() {
    return loc.rebuildLocTable(...arguments);
}
export function showLocInDataTable() {
    return loc.showLocInDataTable(...arguments);
}
/* ---------------------------- SOURCE -------------------------------------- */
export function onSrcViewChange() {
    return src.onSrcViewChange(...arguments);
}
export function buildSrcTable() {
    return src.buildSrcTable(...arguments);
}
/* ----------------------------- TAXON -------------------------------------- */
export function onTxnViewChange() {
    return txn.onTxnViewChange(...arguments);
}
export function buildTxnTable() {
    return txn.buildTxnTable(...arguments);
}
export function rebuildTxnTable() {
    return txn.rebuildTxnTable(...arguments);
}
/* ========================= FORMAT DATA ==================================== */
/* ------------------------- DATA TREE -------------------------------------- */
export function buildLocTree() {
    return tree.buildLocTree(...arguments)
}
export function buildSrcTree() {
    return tree.buildSrcTree(...arguments)
}
export function buildTxnTree() {
    return tree.buildTxnTree(...arguments)
}
/* ----------------------- AGGRID ROW-DATA ---------------------------------- */
export function buildLocRowData() {
    return format.buildLocRowData(...arguments)
}
export function buildSrcRowData() {
    return format.buildSrcRowData(...arguments)
}
export function buildTxnRowData() {
    return format.buildTxnRowData(...arguments)
}
/* ===================== INIT AGGRID TABLE ================================== */
export function initTable(tblName, rowData, tState) {
    return init.initTable(...arguments);
}
/* ==================== TABLE REBUILD ======================================= */
export function reloadTableWithCurrentFilters() {
    const filters = getFilterState();
    buildTable(filters.focus, filters.view)
    .then(() => _ui('onTableReloadCompleteApplyFilters', [filters]));
}
/**
 * Table-rebuild entry point after local database updates, filter clears, and
 * after edit-form close.
 */
export function resetDataTable(focus) {                              /*Perm-log*/console.log('   //resetting search table. Focus ? [%s]', focus);
    resetTableState();
    return buildTable(focus)
        .then(() => _ui('updateUiForTableView'));
}
export function buildTable(f, view = false) {
    if (f === '') { return Promise.resolve(); } //Combobox cleared by user
    const focus = f ? f : _u('getSelVal', ['Focus']);                 /*Perm-log*/console.log("   //select(ing)SearchFocus = [%s], view ? [%s]", focus, view);
    resetTableState();
    return updateFocusAndBuildTable(focus, view, tableState().get('curFocus'));
}
/** Updates the top sort (focus) of the data table: 'taxa', 'locs' or 'srcs'. */
function updateFocusAndBuildTable(focus, view, curFocus) {                      //console.log("updateFocusAndBuildTable called. focus = [%s], view = [%s", focus, view)
    if (focus === curFocus) { return buildDataTable(focus, view); }
    return onFocusChanged(focus, view)
        .then(() => buildDataTable(focus, view));
}
function onFocusChanged(focus, view) {
    _u('setData', ['curFocus', focus]);
    _u('setData', ['curView', view]);
    resetFilterPanel(focus);
    return resetTableParams(focus);
}
function resetFilterPanel(focus) {
    _ui('updateFilterPanelHeader', [focus]);
    $('#focus-filters').empty();
}
function buildDataTable(focus, view) {
    const builders = {
        'locs': buildLocTable, 'srcs': buildSrcTable,
        'taxa': buildTxnTable
    };
    return builders[focus](view);
}