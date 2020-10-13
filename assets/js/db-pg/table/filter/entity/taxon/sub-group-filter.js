/**
 * For taxon groups with more than one root taxon, a multi-select combobox filter
 * is added with the display name of each root taxon.
 *
 * Exports:
 *     ifSubGroupsLoadFilter
 *
 * TOC
 *
 */

export function ifSubGroupsLoadFilter(tblState) {
    if (Object.keys(tblState.subGroups).length === 1) { return; }
}