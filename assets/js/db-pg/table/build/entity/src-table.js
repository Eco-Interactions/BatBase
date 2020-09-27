/**
 * Source table-build methods.
 *
 * Exports
 *     buildSrcTable
 *     onSrcViewChange
 *
 * TOC
 *
 *
 */
import { accessTableState as tState, resetTableState, _filter, _u, _ui } from '../../../db-main.js';
import * as build from '../build-main.js';

/**
 * Get all data needed for the Source-focused table from data storage and send
 * to @initSrcViewOpts to begin the data-table build.
 */
export function buildSrcTable(v) {                                  /*Perm-log*/console.log("       --Building Source Table. view ? [%s]", v);
    if (v) { return getSrcDataAndBuildTable(v); }
    return _u('getData', ['curView', true]).then(storedView => {
        const view = typeof storedView == 'string' ? storedView : 'pubs';
        return getSrcDataAndBuildTable(view);
    });
}
function getSrcDataAndBuildTable(view) {
    return _u('getData', ['source']).then(srcs => {
        tState().set({rcrdsById: srcs});
        _ui('initSrcViewOpts', [view]);
        return startSrcTableBuildChain(view);
    });
}
/** Event fired when the source view select box has been changed. */
export function onSrcViewChange(val) {                              /*Perm-log*/console.log('       --onSrcViewChange. view ? [%s]', val);
    if (!val) { return; }
    $('#focus-filters').empty();
    return rebuildSrcTable(val);
}
function rebuildSrcTable(val) {                                     /*Perm-log*/console.log('       --rebuildSrcTable. view ? [%s]', val)
    _ui('fadeTable');
    resetTableState();
    _ui('setTreeToggleData', [false]);
    return startSrcTableBuildChain(val);
}
function startSrcTableBuildChain(val) {
    const view = getAndStoreSrcView(val);
    const tS = tState().get();
    return build.buildSrcTree(view)
        .then(tree => build.buildSrcRowData(tree, tS))
        .then(rowData => _filter('getRowDataForCurrentFilters', [rowData]))
        .then(rowData => build.initTable('Source Tree', rowData, tS))
        .then(() => _filter('loadSrcFilters', [view]));
}
function getAndStoreSrcView(val) {
    const viewVal = val || _u('getSelVal', ['View']);                           //console.log("getAndStoreSrcView. viewVal = ", viewVal)
    _u('setData', ['curView', viewVal]);
    tState().set({curView: viewVal});
    return viewVal;
}