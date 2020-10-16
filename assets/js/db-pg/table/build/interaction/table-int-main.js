/**
 * Interaction table-data module.
 */
import * as format from './int-table-format.js';
import * as tree from './int-data-tree.js';

export function getIntRowData() {
    return format.getIntRowData(...arguments);
}
export function fillTreeWithInteractions() {
    return tree.fillTreeWithInteractions(...arguments);
}
export function buildIntRowData() {
    return format.buildIntRowData(...arguments);
}