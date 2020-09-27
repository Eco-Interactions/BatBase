/**
 * Builds, filters, and manages the data table, built using ag-grid.
 *
 * Exports:
 *     buildLocTable
 *
 * TOC
 *
 *
 */
import * as entity from './build/entity/entity-table-main.js';

/* -------------------------- LOCATION -------------------------------------- */
export function buildLocTable() {
    return entity.buildLocTable(...arguments);
}
export function onLocViewChange() {
    return entity.onLocViewChange(...arguments);
}
export function rebuildLocTable() {
    return entity.rebuildLocTable(...arguments);
}
/* ---------------------------- SOURCE -------------------------------------- */
export function onSrcViewChange() {
    return entity.onSrcViewChange(...arguments);
}
export function buildSrcTable() {
    return entity.buildSrcTable(...arguments);
}
/* ----------------------------- TAXON -------------------------------------- */
export function onTxnViewChange() {
    return entity.onTxnViewChange(...arguments);
}

export function buildTxnTable() {
    return entity.buildTxnTable(...arguments);
}

export function rebuildTxnTable() {
    return entity.rebuildTxnTable(...arguments);
}