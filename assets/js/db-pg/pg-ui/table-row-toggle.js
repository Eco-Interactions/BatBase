/**
 * Expands the table tree column's interaction-row groupings. 
 * 
 * EXPORTS:
 *   toggleTree
 *   setTreeToggleData
 */
export function toggleTree(tApi, xpand, byOne) {
    byOne ? toggleTreeByOneLvl(tApi, xpand) : toggleTreeRows(tApi, xpand);
    setTreeToggleData(state);
}
/**
 * Resets button based on passed boolean xpanded state. True for fully 
 * expanded and false when collapsed.
 */
export function setTreeToggleData(xpanded) {
    const bttnText = xpanded ? "Collapse All" : "Expand All"; 
    $('#xpand-all').html(bttnText);
    $('#xpand-all').data("xpanded", xpanded);
}
function toggleTreeRows(tApi, xpand) {
    xpand ? tApi.expandAll() : tApi.collapseAll(); 
}
/**
 * Opens/closes one level of the displayed data tree. If there are no closed 
 * rows left after updating, the toggle tree button is updated to 'Collapse All'. 
 */
function toggleTreeByOneLvl(tApi, opening) {
    const tblModel = tApi.getModel();                                  
    const bttXpandedAll = $("#xpand-all").data('xpanded');
    if (opening && bttXpandedAll === true) {return;}

    tblModel.rowsToDisplay.forEach(row => {                             
        if (!opening && !isNextOpenLeafRow(row)) { return; }
        row.expanded = opening;
        row.data.open = opening;
    });
    tApi.onGroupExpandedOrCollapsed();
    updateToggleTreeButton();
    /**
     * Checks displayed rows against total rows after filters to determine
     * if there are any closed rows remaining. The toggle tree button is updated 
     * if necessary.
     */
    function updateToggleTreeButton() {
        const shownRows = tblModel.rowsToDisplay.length; 
        const allRows = getCurTreeRowCount(tApi);
        const closedRows = shownRows < allRows;                     /*debg-log*///console.log("%s < %s ? %s... treeBttn = %s ", shownRows, allRows, closedRows, bttXpandedAll);

        if (!closedRows) { setTreeToggleData(true); 
        } else if (bttXpandedAll === true) { setTreeToggleData(false); }
    }
} /* End toggleTreeByOneLvl */
function getCurTreeRowCount(tblApi) {
    let cnt = 0;
    tblApi.forEachNodeAfterFilter(node => cnt += 1); 
    return cnt;
}
/**
 * If there are no child rows, or if the child rows are closed, this is the open leaf.
 */
function isNextOpenLeafRow(node) {                                  
    if (node.childrenAfterFilter) {
        return node.childrenAfterFilter.every(childNode => !childNode.expanded);
    } 
    return true;
}