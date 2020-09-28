/**
 * Entity-table facade.
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
 */
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