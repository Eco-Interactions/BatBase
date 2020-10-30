/**
 * Location-table module.
 *
 * TOC
 *     TABLE-BUILD CHAINS
 *     RECORD-DATA TREE
 *     TABLE ROW-DATA
 */
import * as build from './loc-table-build.js';
import * as format from './loc-format-table-data.js';
import * as tree from './loc-data-tree.js';

/* ------------------ TABLE-BUILD CHAINS ------------------------------------ */
export function onLocViewChange() {
    build.onLocViewChange(...arguments);
}
export function buildLocTable() {
    return build.buildLocTable(...arguments);
}
export function rebuildLocTable() {
    return build.rebuildLocTable(...arguments);
}
export function showLocInDataTable() {
    build.showLocInDataTable(...arguments);
}
/* --------------------- RECORD-DATA TREE ------------------------------------ */
export function buildLocTree() {
    return tree.buildLocTree(...arguments);
}
/* --------------------- TABLE ROW-DATA ------------------------------------- */
export function buildLocRowData() {
    return format.buildLocRowData(...arguments);
}