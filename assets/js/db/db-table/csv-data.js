/**
 * Exports a csv of the interaction records displayed in the table, removing 
 * tree rows and flattening tree data where possible: currently only taxon.
 * For taxon csv export: The relevant tree columns are shown and also exported. 
 *
 * Export default:
 *     exportCsvData
 */
export default function exportCsvData() {
    var views = { 'locs': 'Location', 'srcs': 'Source', 'taxa': 'Taxon' };
    var fileName = 'Bat Eco-Interaction Records by '+ views[tParams.curFocus] +'.csv';
    var params = {
        onlySelected: true,
        fileName: fileName,
        // customHeader: "This is a custom header.\n\n",
        // customFooter: "This is a custom footer."
    };
    if (tParams.curFocus === 'taxa') { showTaxonCols(); }
    tblOpts.columnApi.setColumnsVisible(['name', 'intCnt', 'edit', 'map'], false);
    selectRowsForExport();
    tblOpts.api.exportDataAsCsv(params);
    returnTableState();
}
function returnTableState() {
    collapseTree();
    tblOpts.columnApi.setColumnsVisible(['name', 'intCnt', 'edit'], true);
    if (tParams.curFocus === 'locs') { tblOpts.columnApi.setColumnsVisible(['map'], true); }
    if (tParams.curFocus === 'taxa') { revertTaxonTable(); }
}
function showTaxonCols() {
    tblOpts.columnApi.setColumnsVisible(getCurTaxonLvlCols(), true)
}
function getCurTaxonLvlCols() {                                                 //console.log("taxaByLvl = %O", tParams.taxaByLvl)
    var lvls = Object.keys(tParams.taxaByLvl);
    return lvls.map(function(lvl){ return 'tree' + lvl; });
}
function revertTaxonTable() {
    tblOpts.columnApi.setColumnsVisible(getCurTaxonLvlCols(), false)
    expandTreeByOne(); 
}
/**
 * Selects every interaction row in the currently displayed table by expanding all
 * rows in order to get all the rows via the 'rowsToDisplay' property on the rowModel.
 */
function selectRowsForExport() {
    tblOpts.api.expandAll();
    tblOpts.api.getModel().rowsToDisplay.forEach(selectInteractions);           //console.log("selected rows = %O", tblOpts.api.getSelectedNodes())   
}
/**
 * A row is identified as an interaction row by the 'interactionType' property
 * present in the interaction row data.
 */
function selectInteractions(rowNode) { 
    if (rowNode.data.interactionType !== undefined) {                       
        rowNode.setSelected(true);
    }
}