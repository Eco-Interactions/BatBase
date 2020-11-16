/**
 * Taxon table-build methods.
 *
 * Export
 *     buildTxnTable
 *     onTxnViewChange
 *     rebuildTxnTable
 *
 * TOC
 *     TAXON TABLE
 *     TAXON VIEW
 */
import { _db, _cmbx, _u } from '~util';
import { _filter, _table, _ui, getDetachedRcrd } from '~db';
import * as build from '../table-build-main.js';

const tState = _table.bind(null, 'tableState');
/** =================== TAXON TABLE ========================================= */
/**
 * Get all data needed for the Taxon-focused table from data storage and send
 * to @initTxnViewOpts to begin the data-table build.
 */
export function buildTxnTable(v) {
    if (v) { return getTxnDataAndBuildTable(v); }
    return _db('getData', ['curView', true]).then(storedView => {
        const view = storedView || getSelValOrDefault(_cmbx('getSelVal', ['View']));/*perm-log*/console.log("       --Building [%s] Taxon Table", view);
        return getTxnDataAndBuildTable(view);
    });
}
function getTxnDataAndBuildTable(view) {
    return _db('getData', [['rankNames', 'group', 'taxon']])
        .then(beginTaxonLoad.bind(null, view));
}
function beginTaxonLoad(groupId, data) {
    updateTaxonTableState(data);                                                //console.log('Building Taxon Table. data = %O', _u('snapshot', [(data)]);
    const groupRoots = storeGroupAndReturnRootTaxa(groupId);
    _ui('initTxnViewOpts', [groupId, data.taxon, data.group]);
    return startTxnTableBuildChain(groupRoots, true);
}
function updateTaxonTableState(data) {
    tState().set({
        rcrdsById: data.taxon,
        groups: data.group,
        allRanks: data.rankNames
    });
}

/**
 * Builds a taxon data-tree for the passed taxon. The taxon ranks present in
 * the tree are stored or updated before continuing @getInteractionsAndFillTable.
 * Note: This is the entry point for filter-related taxon-table rebuilds.
 */
export function rebuildTxnTable(taxa) {
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
function startTxnTableBuildChain(taxa) {                            /*perm-log*/console.log('       --startTxnTableBuildChain taxa = %O', taxa);
    setTaxonOpenRows(taxa);
    const tS = tState().get();
    return build.buildTxnTree(taxa, tState)
        .then(tree => build.buildTxnRowData(tree, tS))
        .then(rowData => _filter('getRowDataForCurrentFilters', [rowData]))
        .then(rowData => build.initTable('Taxon Tree', rowData, tS))
        .then(() => _filter('loadTxnFilters', [tS, tS.groupName]));
}
function setTaxonOpenRows(taxa) {
    if (taxa.length > 1) { return; }
    tState().set({openRows: [taxa[0].id.toString()]});
}
/** =================== TAXON VIEW ========================================== */
/** Event fired when the taxon view select box has been changed. */
export function onTxnViewChange(val) {                              /*perm-log*/console.log('       --onTxnViewChange. [%s]', val)
    if (!val) { return; }
    $('#focus-filters').empty();
    buildTaxonTable(val);
}
function buildTaxonTable(val) {
    const groupRoots = storeGroupAndReturnRootTaxa(val);
    _table('resetTableState');
    return startTxnTableBuildChain(groupRoots);
}
/**
 * Gets the currently selected taxon group/view's id, gets the record for the taxon,
 * stores both it's id and rank in the global focusStorage, and returns
 * the taxon's record.
 */
function storeGroupAndReturnRootTaxa(val) {
    const groupId = val || getSelValOrDefault(_cmbx('getSelVal', ['View']));/*dbug-log*///console.log('storeAndReturnView. val [%s], groupId [%s]', val, groupId)
    const group = getDetachedRcrd(groupId, tState().get('groups'), 'group');/*dbug-log*///console.log("groupTaxon = %O", group);
    updateGroupTableState(groupId, group);
    return Object.values(group.taxa).map(getRootTaxonRcrd);
}
function getRootTaxonRcrd(root) {
    return getDetachedRcrd(root.id, tState().get('rcrdsById'), 'taxon');
}
function updateGroupTableState(groupId, group) {
    _db('setData', ['curView', groupId]);
    tState().set({
        curView: groupId,
        groupName: group.displayName,
        groupPluralName: group.pluralName,
        subGroups: group.taxa,
        allGroupRanks: getAllSubRanks(group.taxa),
    });
}
function getAllSubRanks(roots) {
    return Object.values(roots).reduce((ranks, root) => {
        return ranks.length > root.subRanks.length ? ranks : root.subRanks;}, []);
}
/** This catches errors in group value caused by exiting mid-tutorial. TODO */
function getSelValOrDefault(val) {
    return !val ? 1 : isNaN(val) ? 1 : val;
}