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
 *     TABLE REBUILD
 *     UTILITY
 */

import { _cmbx, _db, _u } from '~util';
import { _filter, _table, _ui, getDetachedRcrd } from '~db';
import * as init from './init-table/init-table-main.js';
import * as loc from './location/loc-table-main.js';
import * as src from './source/src-table-main.js';
import * as int from './interaction/table-int-main.js';
import * as txn from './taxon/txn-table-main.js';
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
/* -------------------------- INTERACTION ----------------------------------- */
export function getIntRowData() {
    return int.getIntRowData(...arguments);
}
export function buildIntRowData() {
    return int.buildIntRowData(...arguments);
}
export function fillTreeWithInteractions() {
    return int.fillTreeWithInteractions(...arguments);
}
/* ========================= FORMAT DATA ==================================== */
/* ------------------------- DATA TREE -------------------------------------- */
export function buildLocTree() {
    return loc.buildLocTree(...arguments)
}
export function buildSrcTree() {
    return src.buildSrcTree(...arguments)
}
export function buildTxnTree() {
    return txn.buildTxnTree(...arguments)
}
/* ----------------------- AGGRID ROW-DATA ---------------------------------- */
export function buildLocRowData() {
    return loc.buildLocRowData(...arguments)
}
export function buildSrcRowData() {
    return src.buildSrcRowData(...arguments)
}
export function buildTxnRowData() {
    return txn.buildTxnRowData(...arguments)
}
/* ===================== INIT AGGRID TABLE ================================== */
export function initTable(tblName, rowData, tState) {
    return init.initTable(...arguments);
}
/* ==================== TABLE REBUILD ======================================= */
export function reloadTableWithCurrentFilters() {
    const filters = _filter('getFilterState');
    buildTable(filters.focus, filters.view)
    .then(() => _filter('onTableReloadCompleteApplyFilters', [filters]));
}
/**
 * Table-rebuild entry point after local database updates, filter clears, and
 * after edit-form close.
 */
export function resetDataTable(focus) {                              /*Perm-log*/console.log('   //resetting search table. Focus ? [%s]', focus);
    _table('resetTableState');
    return buildTable(focus)
        .then(() => _ui('updateUiForTableView'));
}
export function buildTable(f, view = false) {
    if (f === '') { return Promise.resolve(); } //Combobox cleared by user
    const focus = f ? f : _cmbx('getSelVal', ['Focus']);                 /*Perm-log*/console.log("   //select(ing)SearchFocus = [%s], view ? [%s]", focus, view);
    const prevFocus = _table('tableState').get('curFocus');
    _table('resetTableState');
    return updateFocusAndBuildTable(focus, view, prevFocus);
}
/** Updates the top sort (focus) of the data table: 'taxa', 'locs' or 'srcs'. */
function updateFocusAndBuildTable(focus, view, curFocus) {                      //console.log("updateFocusAndBuildTable called. focus = [%s], view = [%s", focus, view)
    if (focus === curFocus) { return buildDataTable(focus, view); }
    return onFocusChanged(focus, view)
        .then(() => buildDataTable(focus, view));
}
function onFocusChanged(focus, view) {
    _db('setData', ['curFocus', focus]);
    _db('setData', ['curView', view]);
    resetFilterPanel(focus);
    return _table('resetTableParams', [focus]);
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
/* ================== UTILITY =============================================== */
/** Sorts the all levels of the data tree alphabetically. */
export function sortDataTree(tree) {
    const sortedTree = {};
    const keys = Object.keys(tree).sort(alphaBranchNames);

    for (var i=0; i<keys.length; i++){
        sortedTree[keys[i]] = sortNodeChildren(tree[keys[i]]);
    }
    return sortedTree;

    function sortNodeChildren(node) {
        if (node.children) {
            node.children = node.children.sort(alphaEntityNames);
            node.children.forEach(sortNodeChildren);
        }
        return node;
    }
    function alphaBranchNames(a, b) {
        if (a.includes('Unspecified')) { return 1; }
        var x = a.toLowerCase();
        var y = b.toLowerCase();
        return x<y ? -1 : x>y ? 1 : 0;
    }
}
/** Alphabetizes array via sort method. */
function alphaEntityNames(a, b) {                                               //console.log("alphaSrcNames a = %O b = %O", a, b);
    var x = a.displayName.toLowerCase();
    var y = b.displayName.toLowerCase();
    return x<y ? -1 : x>y ? 1 : 0;
}
export function getTreeRcrds(idAry, rcrds, entity) {                                   //console.log('getTreeRcrds. args = %O', arguments);
    return idAry.map(id => getDetachedRcrd(id, rcrds, entity)).filter(r => r);
}