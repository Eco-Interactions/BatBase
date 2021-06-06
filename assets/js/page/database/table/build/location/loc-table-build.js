/**
 * Location table-build methods.
 *
 * Export
 *     buildLocTable
 *     onLocViewChange
 *     rebuildLocTable
 *
 * TOC
 *     LOCATION TABLE
 *     LOCATION VIEW
 */
import { _db, _cmbx } from '~util';
import { _filter, _map, _table, _ui } from '~db';
import * as build from '../table-build-main.js';

const tState = _table.bind(null, 'tableState');
/** =============== LOCATION TABLE ========================================== */
export function buildLocTable(v) {                                  /*perm-log*/console.log("       --Building Location Table. View ? [%s]", v);
    const view = v || 'tree';
    return _db('getData', [['location', 'topRegionNames', 'group']])
        .then(beginLocationLoad);

    function beginLocationLoad(data) {
        addDataToTableParams(data);
        _ui('initLocViewOpts', [view]);
        return updateLocView(view);
    }
}
function addDataToTableParams(data) {
    tState().set({
        data:  data,
        rcrdsById: data.location
    });
}
/* --------------------------- BUILD CHAIN ---------------------------------- */
/**
 * Rebuilds loc tree with passed location, or the default top regions, as the
 * base node(s) of the new tree with all sub-locations nested beneath @buildLocTree.
 * Resets 'openRows' and clears tree. Continues @buildLocTableTree.
 * Note: This is also the entry point for filter-related table rebuilds.
 */
export function rebuildLocTable(topLoc) {                            /*perm-log*/console.log("       --rebuilding loc tree. topLoc = %O", topLoc);
    const topLocs = topLoc || getTopRegionIds();
    _table('resetCurTreeStorageProps');
    tState().set({openRows: topLocs.length === 1 ? topLocs : []});
    _ui('fadeTable');
    return startLocTableBuildChain(topLocs);
}
function getTopRegionIds() {
    const ids = [];
    const regions = tState().get('data').topRegionNames;
    for (let name in regions) { ids.push(regions[name]); }
    return ids;
}
function startLocTableBuildChain(topLocs) {
    const tS = tState().get();
    return build.buildLocTree(topLocs, tS.rcrdsById)
        .then(tree => build.buildLocRowData(tree, tS))
        .then(rowData => _filter('getRowDataForCurrentFilters', [rowData]))
        .then(rowData => build.initTable('Location Tree', rowData, tS))
        .then(() => _filter('loadLocFilters', [tS]));
}

/** Reloads the data-table with the location selected from the map view. */
export function showLocInDataTable(loc) {                           /*perm-log*/console.log("       --Showing Location in Table");
    _ui('updateUiForTableView');
    _cmbx('setSelVal', ['View', 'tree', 'silent']);
    rebuildLocTable([loc.id])
    .then(() => _ui('updateFilterStatusMsg'))
    .then(() => _ui('enableClearFiltersButton'));
}
/** ================ LOCATION VIEW ========================================== */
export function onLocViewChange(val) {
    if (!val) { return; }
    updateLocView(val);
}
/**
 * Event fired when the source view select box has been changed.
 */
function updateLocView(v) {
    const val = v || _cmbx('getSelVal', ['View']);                  /*perm-log*/console.log('           --updateLocView. view = [%s]', val);
    resetLocUi(val);
    _table('resetTableState');
    _ui('setTreeToggleData', [false]);
    return showLocInteractionData(val);
}
function resetLocUi(view) {
    _ui('fadeTable');
    if (view === 'tree') { _ui('updateUiForTableView'); }
}
function showLocInteractionData(view) {                                         //console.log('showLocInteractionData. view = ', view);
    _db('setData', ['curView', view]);
    return view === 'tree' ? rebuildLocTable() : _map('buildLocMap');
}