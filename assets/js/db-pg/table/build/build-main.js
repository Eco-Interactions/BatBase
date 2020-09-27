/**
 * Entity-table facade.
 *
 * Exports:
 *     initEntityTable
 *
 * TOC
 *
 *
 */
import * as entity from './entity/entity-table-main.js';
import * as format from './format/aggrid-format.js';
import * as init from './init-table.js';
import * as tree from './format/data-tree.js';

export function initTable(tblName, rowData, tState) {
    return init.initTable(...arguments);
}


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
export function buildLocTree() {
    return tree.buildLocTree(...arguments)
}
export function buildSrcTree() {
    return tree.buildSrcTree(...arguments)
}
export function buildTxnTree() {
    return tree.buildTxnTree(...arguments)
}

export function buildLocRowData() {
    return format.buildLocRowData(...arguments)
}
export function buildSrcRowData() {
    return format.buildSrcRowData(...arguments)
}
export function buildTxnRowData() {
    return format.buildTxnRowData(...arguments)
}