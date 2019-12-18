/**
 * Exports a csv of the interaction records displayed in the table, removing 
 * tree rows and flattening tree data where possible: currently only taxon.
 * For taxon csv export: The relevant tree columns are shown and also exported. 
 *
 * CODE SECTIONS:
 *     SET UP
 *     EXPORT
 *     RESET
 *     HELPERS
 *     
 * Export default:
 *     exportCsvData
 */
import { accessTableState as tState } from '../../db-page.js';
import { collapseTree } from '../../ui/ui-main.js';

let tblState;

export default function exportCsvData() {
    // TODO: FADE TABLE
    tblState = tState().get();
    setUpTableForExport();
    exportCsv();
    returnTableState();
}
/* ---------------------- SET UP -------------------------------------------- */
function setUpTableForExport() {
    showAllExportData();
    removeUneededColsFromExport()
    selectInteractionDataRowsForExport(tblState.api);
}
function showAllExportData() {
    toggleLocExportData(true);
    toggleTxnExportData(true);
}
function selectInteractionDataRowsForExport(tblApi) {
    tblApi.expandAll();
    tblApi.getModel().rowsToDisplay.forEach(selectInteractions);                //console.log("selected rows = %O", tblOpts.api.getSelectedNodes())   
}
/** An interaction row has 'interactionType' data. */
function selectInteractions(rowNode) { 
    if (rowNode.data.interactionType !== undefined) {                       
        rowNode.setSelected(true);
    }
}
/* ------------------------------ EXPORT ------------------------------------ */
function exportCsv() {
    const params = {
        onlySelected: true,
        fileName: 'Bat Eco-Interaction Records.csv',
        // customHeader: "This is a custom header.\n\n",
        // customFooter: "This is a custom footer."
    };
    tblState.api.exportDataAsCsv(params);
}
/* ------------------------------ RESET ------------------------------------- */
function returnTableState() {
    collapseTree(tblState.api);
    hideExportOnlyColumns();
    toggleUiTableColumns(true);
    if (tblState.curFocus === 'taxa') { 
        expandTreeByOne(); 
    }
}
function hideExportOnlyColumns() {
    toggleLocExportData(false);
    toggleTxnExportData(false);
}
/* ------------------------- HELPERS ---------------------------------------- */
function toggleLocExportData(showing) {
    if (!showing && tblState.curFocus === 'locs') { return; } //Cols are shown in Loc view
    const cols = ['lat', 'long', 'elev', 'elevMax'];
    toggleTableColumns(cols, showing);
}
function toggleTxnExportData(showing) {
    toggleTxnUiCols(!showing);
    const cols = getCurTaxonLvlCols(tblState.taxaByLvl);
    toggleTableColumns(cols, showing);
}
function getCurTaxonLvlCols(taxaByLvl) {                                        //console.log("taxaByLvl = %O", tParams.taxaByLvl)
    const lvls = Object.keys(taxaByLvl);
    return lvls.map(lvl => 'tree' + lvl);
}

function toggleTableColumns(cols, showing) {
    tblState.columnApi.setColumnsVisible(cols, showing);
}
function toggleUiTableColumns(showing) {
    toggleTableColumns(['name', 'intCnt', 'edit', 'map'], showing);
}