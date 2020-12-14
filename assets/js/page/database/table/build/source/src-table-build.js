/**
 * Source table-build methods.
 *
 * Export
 *     buildSrcTable
 *     onSrcViewChange
 *
 * TOC
 *     SOURCE TABLE
 *     SOURCE VIEW
 */
import { _cmbx, _db } from '~util';
import { _filter, _table, _u, _ui } from '~db';
import * as build from '../table-build-main.js';

const tState = _table.bind(null, 'tableState');
/** ================= SOURCE TABLE ========================================== */
/**
 * Get all data needed for the Source-focused table from data storage and send
 * to @initSrcViewOpts to begin the data-table build.
 */
export function buildSrcTable(v) {                                  /*perm-log*/console.log("       --Building Source Table. view ? [%s]", v);
    if (v) { return getSrcDataAndBuildTable(v); }
    return _db('getData', ['curView', true]).then(storedView => {
        const view = typeof storedView == 'string' ? storedView : 'pubs';
        return getSrcDataAndBuildTable(view);
    });
}
function getSrcDataAndBuildTable(view) {
    return _db('getData', ['source']).then(srcs => {
        tState().set({rcrdsById: srcs});
        _ui('initSrcViewOpts', [view]);
        return startSrcTableBuildChain(view);
    });
}
/** ================== SOURCE VIEW ========================================== */
/** Event fired when the source view select box has been changed. */
export function onSrcViewChange(val) {                              /*perm-log*/console.log('       --onSrcViewChange. view ? [%s]', val);
    if (!val) { return; }
    $('#focus-filters').empty();
    return rebuildSrcTable(val);
}
function rebuildSrcTable(val) {                                     /*perm-log*/console.log('       --rebuildSrcTable. view ? [%s]', val)
    _ui('fadeTable');
    _table('resetTableState');
    _ui('setTreeToggleData', [false]);
    return startSrcTableBuildChain(val);
}
function startSrcTableBuildChain(val) {
    const view = getAndStoreSrcView(val);
    const tS = tState().get();
    return build.buildSrcTree(view, tS.rcrdsById)
        .then(tree => build.buildSrcRowData(tree, tS))
        .then(rowData => _filter('getRowDataForCurrentFilters', [rowData]))
        .then(rowData => build.initTable('Source Tree', rowData, tS))
        .then(() => _filter('loadSrcFilters', [view]));
}
function getAndStoreSrcView(val) {
    const viewVal = val || _cmbx('getSelVal', ['View']);            /*dbug-log*///console.log("getAndStoreSrcView [%s]", viewVal)
    _db('setData', ['curView', viewVal]);
    tState().set({curView: viewVal});
    return viewVal;
}