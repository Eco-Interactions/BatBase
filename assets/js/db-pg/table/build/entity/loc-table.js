/**
 * Location table-build methods.
 *
 * Exports
 *     buildLocTable
 *     onLocViewChange
 *     rebuildLocTable
 *
 * TOC
 *
 *
 */
import { _map, _table, _u, _ui } from '../../../db-main.js';
import * as build from '../build-main.js';

const tState = _table.bind(null, 'tableState');

export function buildLocTable(v) {                                  /*Perm-log*/console.log("       --Building Location Table. View ? [%s]", v);
    const view = v || 'tree';
    return _u('getData', [['location', 'topRegionNames']]).then(beginLocationLoad);

    function beginLocationLoad(data) {
        addLocDataToTableParams(data);
        _ui('initLocViewOpts', [view]);
        return updateLocView(view);
    }
}
function addLocDataToTableParams(data) {
    tState().set({
        data:  data,
        rcrdsById: data.location
    });
}
export function onLocViewChange(val) {
    if (!val) { return; }
    updateLocView(val);
}
/**
 * Event fired when the source view select box has been changed.
 */
function updateLocView(v) {
    const val = v || _u('getSelVal', ['View']);                     /*Perm-log*/console.log('           --updateLocView. view = [%s]', val);
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
    _u('setData', ['curView', view]);
    return view === 'tree' ? rebuildLocTable() : _map('buildLocMap');
}
/** --------------- LOCATION TABLE ------------------------------------------ */
/**
 * Rebuilds loc tree with passed location, or the default top regions, as the
 * base node(s) of the new tree with all sub-locations nested beneath @buildLocTree.
 * Resets 'openRows' and clears tree. Continues @buildLocTableTree.
 * Note: This is also the entry point for filter-related table rebuilds.
 */
export function rebuildLocTable(topLoc, textFltr) {                 /*Perm-log*/console.log("       --rebuilding loc tree. topLoc = %O", topLoc);
    const topLocs = topLoc || getTopRegionIds();
    _table('resetCurTreeStorageProps');
    tState().set({openRows: topLocs.length === 1 ? topLocs : []});
    _ui('fadeTable');
    return startLocTableBuildChain(topLocs, textFltr);
}
function getTopRegionIds() {
    const ids = [];
    const regions = tState().get('data').topRegionNames;
    for (let name in regions) { ids.push(regions[name]); }
    return ids;
}
function startLocTableBuildChain(topLocs) {
    const tS = tState().get();
    return build.buildLocTree(topLocs)
        .then(tree => build.buildLocRowData(tree, tS))
        .then(rowData => _table('getRowDataForCurrentFilters', [rowData]))
        .then(rowData => build.initTable('Location Tree', rowData, tS))
        .then(() => _table('loadLocFilters', [tS]));
}

/** Reloads the data-table with the location selected from the map view. */
export function showLocInDataTable(loc) {                          /*Perm-log*/console.log("       --Showing Location in Table");
    _ui('updateUiForTableView');
    _u('setSelVal', ['View', 'tree', 'silent']);
    table.rebuildLocTable([loc.id])
    .then(() => _ui('updateFilterStatusMsg'))
    .then(() => _ui('enableClearFiltersButton'));
}