/**
 * Taxon table-build methods.
 *
 * Exports
 *     buildTxnTable
 *     onTxnViewChange
 *     rebuildTxnTable
 *
 * TOC
 *
 *
 */
import { accessTableState as tState, resetTableState, _filter, _u, _ui } from '../../../db-main.js';
import * as build from '../build-main.js';

/**
 * Get all data needed for the Taxon-focused table from data storage and send
 * to @initTxnViewOpts to begin the data-table build.
 */
export function buildTxnTable(v) {
    if (v) { return getTxnDataAndBuildTable(v); }
    return _u('getData', ['curView', true]).then(storedView => {
        const view = storedView || getSelValOrDefault(_u('getSelVal', ['View']));/*Perm-log*/console.log("       --Building [%s] Taxon Table", view);
        return getTxnDataAndBuildTable(view);
    });
}
function getTxnDataAndBuildTable(view) {
    return _u('getData', ['taxon']).then(beginTaxonLoad.bind(null, view));
}
function beginTaxonLoad(realmId, taxa) {
    tState().set({'rcrdsById': taxa});                                          //console.log('Building Taxon Table. taxa = %O', _u('snapshot', [(taxa)]);
    const realmTaxon = storeAndReturnRealmRcrd(realmId);
    _ui('initTxnViewOpts', [realmTaxon.id, tState().get('flags').allDataAvailable]);
    return startTxnTableBuildChain(realmTaxon, true);
}
/** Event fired when the taxon view select box has been changed. */
export function onTxnViewChange(val) {                              /*Perm-log*/console.log('       --onTxnViewChange. [%s]', val)
    if (!val) { return; }
    $('#focus-filters').empty();
    buildTaxonTable(val);
}
function buildTaxonTable(val) {
    const realmTaxon = storeAndReturnRealmRcrd(val);
    resetTableState();
    return startTxnTableBuildChain(realmTaxon, true);
}
/**
 * Gets the currently selected taxon realm/view's id, gets the record for the taxon,
 * stores both it's id and level in the global focusStorage, and returns
 * the taxon's record.
 */
function storeAndReturnRealmRcrd(val) {
    const realmId = val || getSelValOrDefault(_u('getSelVal', ['View']));/*dbug-log*///console.log('storeAndReturnView. val [%s], realmId [%s]', val, realmId)
    const realmTaxonRcrd = _u('getDetachedRcrd', [realmId, tState().get('rcrdsById'), 'taxon']);/*dbug-log*///console.log("realmTaxon = %O", realmTaxonRcrd);
    updateRealmTableState(realmId, realmTaxonRcrd);
    return realmTaxonRcrd;
}
function updateRealmTableState(realmId, realmTaxonRcrd) {
    _u('setData', ['curView', realmId]);
    tState().set({
        realmLvl: realmTaxonRcrd.level,
        curView: realmId,
        realmName: realmTaxonRcrd.realm.displayName
    });
}
/** This catches errors in realm value caused by exiting mid-tutorial. TODO */
function getSelValOrDefault(val) {
    const bats = $('body').data('env') == 'test' ? 1 : 2; //Default
    return !val ? bats : isNaN(val) ? bats : val;
}
/**
 * Builds a taxon data-tree for the passed taxon. The taxon levels present in
 * the tree are stored or updated before continuing @getInteractionsAndFillTable.
 * Note: This is the entry point for filter-related taxon-table rebuilds.
 */
export function rebuildTxnTable(topTaxon) {                         /*Perm-log*/console.log('       --rebuildTxnTable. topTaxon = %O', topTaxon);
    const tS = tState().get(['api', 'flags']);
    if (!tS.api || tS.flags.allDataAvailable) { _ui('fadeTable'); }
    return startTxnTableBuildChain(topTaxon)
}
/**
 * Builds a family tree of taxon data with passed taxon as the top of the tree,
 * transforms that data into the format used for ag-grid and loads the grid, aka table.
 * The top taxon's id is added to the global focus storage obj's 'openRows'
 * and will be expanded on table load.
 */
function startTxnTableBuildChain(topTaxon, init = false) {
    tState().set({openRows: [topTaxon.id.toString()]});
    const tS = tState().get();
    return build.buildTxnTree(topTaxon, init)
        .then(tree => build.buildTxnRowData(tree, tS))
        .then(rowData => _filter('getRowDataForCurrentFilters', [rowData]))
        .then(rowData => build.initTable('Taxon Tree', rowData, tS))
        .then(() => _filter('loadTxnFilters', [tS, topTaxon.realm.pluralName]));
}
