/**
 * Taxon-table module.
 *
 * TOC
 *     TABLE-BUILD CHAINS
 *     RECORD-DATA TREE
 *     TABLE ROW-DATA
 */
import * as build from './txn-table-build.js';
import * as format from './txn-format-table-data.js';
import * as tree from './txn-data-tree.js';

/* ------------------ TABLE-BUILD CHAINS ------------------------------------ */
export function onTxnViewChange() {
    build.onTxnViewChange(...arguments);
}
export function buildTxnTable() {
    return build.buildTxnTable(...arguments);
}
export function rebuildTxnTable() {
    return build.rebuildTxnTable(...arguments);
}
/* --------------------- RECORD-DATA TREE ------------------------------------ */
export function buildTxnTree() {
    return tree.buildTxnTree(...arguments);
}
/* --------------------- TABLE ROW-DATA ------------------------------------- */
export function buildTxnRowData() {
    return format.buildTxnRowData(...arguments);
}