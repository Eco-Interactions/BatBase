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
import { _filter, _table, _u, _ui } from '../../../db-main.js';
import * as build from '../build-main.js';

const tState = _table.bind(null, 'tableState');
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
    return _u('getData', [['levelNames', 'realm', 'taxon']])
        .then(beginTaxonLoad.bind(null, view));
}
function beginTaxonLoad(realmId, data) {
    updateTaxonTableState(data);                                                //console.log('Building Taxon Table. data = %O', _u('snapshot', [(data)]);
    const realmRoots = storeRealmAndReturnRootTaxa(realmId);
    _ui('initTxnViewOpts', [realmId, tState().get('flags').allDataAvailable]);

    return startTxnTableBuildChain(realmRoots, true);
}
function updateTaxonTableState(data) {
    tState().set({
        rcrdsById: data.taxon,
        realms: data.realm,
        allLevels: data.levelNames
    });
}
/** Event fired when the taxon view select box has been changed. */
export function onTxnViewChange(val) {                              /*Perm-log*/console.log('       --onTxnViewChange. [%s]', val)
    if (!val) { return; }
    $('#focus-filters').empty();
    buildTaxonTable(val);
}
function buildTaxonTable(val) {
    const realmRoots = storeRealmAndReturnRootTaxa(val);
    _table('resetTableState');
    return startTxnTableBuildChain(realmRoots);  //, true
}
/**
 * Gets the currently selected taxon realm/view's id, gets the record for the taxon,
 * stores both it's id and level in the global focusStorage, and returns
 * the taxon's record.
 */
function storeRealmAndReturnRootTaxa(val) {
    const realmId = val || getSelValOrDefault(_u('getSelVal', ['View']));/*dbug-log*///console.log('storeAndReturnView. val [%s], realmId [%s]', val, realmId)
    const realm = _u('getDetachedRcrd', [realmId, tState().get('realms'), 'realm']);/*dbug-log*///console.log("realmTaxon = %O", realm);
    updateRealmTableState(realmId, realm);
    return Object.values(realm.taxa).map(getRootTaxonRcrd);
}
function getRootTaxonRcrd(root) {
    return _u('getDetachedRcrd', [root.id, tState().get('rcrdsById'), 'taxon']);
}
function updateRealmTableState(realmId, realm) {
    _u('setData', ['curView', realmId]);
    tState().set({
        // realmLvl: realmTaxonRcrd.level,
        curView: realmId,
        realmName: realm.pluralName,
        allRealmLvls: realm.uiLevelsShown,
    });
}
/** This catches errors in realm value caused by exiting mid-tutorial. TODO */
function getSelValOrDefault(val) {
    return !val ? 1 : isNaN(val) ? 1 : val;
}
/**
 * Builds a taxon data-tree for the passed taxon. The taxon levels present in
 * the tree are stored or updated before continuing @getInteractionsAndFillTable.
 * Note: This is the entry point for filter-related taxon-table rebuilds.
 */
export function rebuildTxnTable(taxa) {                             /*Perm-log*/console.log('       --rebuildTxnTable. topTaxon = %O', taxa);
    const tS = tState().get(['api', 'flags']);
    if (!tS.api || tS.flags.allDataAvailable) { _ui('fadeTable'); }
    return startTxnTableBuildChain(taxa)
}
/**
 * Builds a family tree of taxon data with passed taxa as the roots of the tree,
 * Transforms that data into the format used for ag-grid and loads the grid, aka table.
 * The root ids are added to the global focus storage obj's 'openRows'  and will
 * be expanded on table load.
 */
function startTxnTableBuildChain(taxa) {   //, init = false
    tState().set({openRows: [...taxa.map(t => t.id.toString())]});
    const tS = tState().get();
    return build.buildTxnTree(taxa)  //, init
        .then(tree => build.buildTxnRowData(tree, tS))
        .then(rowData => _filter('getRowDataForCurrentFilters', [rowData]))
        .then(rowData => build.initTable('Taxon Tree', rowData, tS))
        .then(() => _filter('loadTxnFilters', [tS, tS.realmName]));
}