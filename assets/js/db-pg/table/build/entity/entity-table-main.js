/**
 * Entity-table build stacks.
 *
 * Exports
 *     buildLocTable
 *     onLocViewChange
 *     rebuildLocTable
 *
 * TOC
 *     LOCATION
 *     SOURCE
 *     TAXON
 */

import * as loc from './loc-table.js';
import * as src from './src-table.js';
import * as txn from './txn-table.js';

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