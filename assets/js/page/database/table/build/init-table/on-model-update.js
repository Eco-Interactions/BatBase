/**
 * When the table rowModel is updated, the total interaction count for each
 * tree node is updated. Interactions filtered out will not be included in the totals.
 * Updates the total interaction count displayed in the tool bar.
 *
 * Export
 *     onModelUpdated
 */
let tblApi;

export function onModelUpdated(api) {
    tblApi = api;
    if (!tblApi) { return; }
    const ttlInts = updateRowsAndGetIntCounts(tblApi.getModel().rootNode);
    updateTotalCountDisplay(ttlInts);
}
/**
 * Note: softRefreshView refreshes any columns with "volatile" set "true" in the
 * columnDefs - currently only "Count"
 */
function updateRowsAndGetIntCounts(root) {
    const ttls = root.childrenAfterFilter.map(row => updateTotalRowIntCounts(0, row));
    tblApi.softRefreshView();
    return ttls.reduce((ttl, cnt) => ttl += cnt, 0);
}
/** Sets new interaction totals for each tree node and returns count. */
function updateTotalRowIntCounts(total, row) {                      /*dbug-log*///console.log('updateTotalRowIntCounts. total [%s], row = %O', total, row);
    if (!row.childrenAfterFilter) { return total; }
    const rowCnt = ifChildRowsAreInteractions(row) ?
        row.childrenAfterFilter.length :
        row.childrenAfterFilter.reduce(updateTotalRowIntCounts, 0);
    row.data.intCnt = rowCnt;
    return total += rowCnt;
}
function ifChildRowsAreInteractions(row) {
    return !row.childrenAfterFilter.length ||
        !row.childrenAfterFilter[0].childrenAfterFilter;
}
function updateTotalCountDisplay(cnt) {
    $("#tbl-cnt").text(`[ ${cnt} Interactions  ]`);
}