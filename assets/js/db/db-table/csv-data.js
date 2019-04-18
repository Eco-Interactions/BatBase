/**
 * Exports a csv of the interaction records displayed in the table, removing 
 * tree rows and flattening tree data where possible: currently only taxon.
 * For taxon csv export: The relevant tree columns are shown and also exported. 
 *
 * Export default:
 *     exportCsvData
 */
import { accessTableState as tState } from '../db-page.js';
import { collapseTree } from './db-ui.js';

export default function exportCsvData() {
    const tblState = tState().get();
    const views = { 'locs': 'Location', 'srcs': 'Source', 'taxa': 'Taxon' };
    const fileName = 'Bat Eco-Interaction Records by '+ views[tblState.curFocus] +'.csv';
    const params = {
        onlySelected: true,
        fileName: fileName,
        // customHeader: "This is a custom header.\n\n",
        // customFooter: "This is a custom footer."
    };
    if (tblState.curFocus === 'taxa') { 
        showTaxonCols(tblState.columnApi, tblState.taxaByLvl); }
    tblState.columnApi.setColumnsVisible(['name', 'intCnt', 'edit', 'map'], false);
    selectRowsForExport(tblState.api);
    tblState.api.exportDataAsCsv(params);
    returnTableState();

    function returnTableState() {
        collapseTree(tblState.api);
        tblState.columnApi.setColumnsVisible(['name', 'intCnt', 'edit'], true);
        if (focus === 'locs') { tblState.columnApi.setColumnsVisible(['map'], true); }
        if (focus === 'taxa') { 
            revertTaxonTable(tblState.columnApi, tblState.taxaByLvl); }
    }
}
function showTaxonCols(colApi, taxaByLvl) {
    colApi.setColumnsVisible(getCurTaxonLvlCols(taxaByLvl), true)
}
function getCurTaxonLvlCols(taxaByLvl) {                                                 //console.log("taxaByLvl = %O", tParams.taxaByLvl)
    const lvls = Object.keys(taxaByLvl);
    return lvls.map(function(lvl){ return 'tree' + lvl; });
}
function revertTaxonTable(colApi, taxaByLvl) {
    colApi.setColumnsVisible(getCurTaxonLvlCols(taxaByLvl), false)
    expandTreeByOne(); 
}
/**
 * Selects every interaction row in the currently displayed table by expanding all
 * rows in order to get all the rows via the 'rowsToDisplay' property on the rowModel.
 */
function selectRowsForExport(tblApi) {
    tblApi.expandAll();
    tblApi.getModel().rowsToDisplay.forEach(selectInteractions);                //console.log("selected rows = %O", tblOpts.api.getSelectedNodes())   
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