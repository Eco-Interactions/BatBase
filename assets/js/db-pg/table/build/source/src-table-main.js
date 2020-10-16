/**
 * Source-table module.
 *
 * TOC
 *     TABLE-BUILD CHAINS
 *     RECORD-DATA TREE
 *     TABLE ROW-DATA
 */
import * as build from './src-table-build.js';
import * as format from './src-format-table-data.js';
import * as tree from './src-data-tree.js';

/* ------------------ TABLE-BUILD CHAINS ------------------------------------ */
export function onSrcViewChange() {
    build.onSrcViewChange(...arguments);
}
export function buildSrcTable() {
    return build.buildSrcTable(...arguments);
}
/* --------------------- RECORD-DATA TREE ------------------------------------ */
export function buildSrcTree() {
    return tree.buildSrcTree(...arguments);
}
/* --------------------- TABLE ROW-DATA ------------------------------------- */
export function buildSrcRowData() {
    return format.buildSrcRowData(...arguments);
}