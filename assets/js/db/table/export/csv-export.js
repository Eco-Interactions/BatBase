/**
 * Exports a csv of the interaction records displayed in the table, removing 
 * tree rows and flattening tree data where possible: currently only taxon.
 * For taxon csv export: The relevant tree columns are shown and also exported. 
 *
 * CODE SECTIONS:
 *     FILL EXPORT DATA
 *     SET UP TABLE
 *     EXPORT
 *     RESET
 *     HELPERS
 *     
 * Export default:
 *     exportCsvData
 */
import * as _u from '../../util.js';
import { accessTableState as tState } from '../../db-page.js';
import { collapseTree, expandTreeByOne, fadeTable, showTable } from '../../ui/ui-main.js';
import { buildLocTree, buildSrcTree, buildTxnTree } from '../format-data/data-tree.js';

let tblState;  

export default function exportCsvData() {
    fadeTable();
    tblState = tState().get();
    fillTableWithExportOnlyData()
    .then(exportTableDataThenResetTable);
}
function exportTableDataThenResetTable() {
    setUpTableForExport();
    exportCsv();
    returnTableState();
}
/* ----------- ------- FILL EXPORT DATA ------------------------------------- */
/**
 * Adds export-only data to the interaction data:
 *     Taxon - A data-point is added for each realm-level in both roles, and
 *         stores the ancestry for the taxa in each interaction.
 *     Location - Elevation, Elevation Max, Latitude, and Longitude
 */
function fillTableWithExportOnlyData() {
    return _u.getData(['interaction', 'taxon'])
    .then(fillInteractionsWithExportData);
}
function fillInteractionsWithExportData(rcrds) {                                console.log('-----fillInteractionsWithExportData')
    const taxa = {};
    const entityRcrds = rcrds;
    tblState.api.forEachNodeAfterFilter(fillRowExportData);
    tblState.api.refreshView();
    
    function fillRowExportData(row) {                                           
        if (row.data.entity !== 'Interaction') { return; }  
        const intRcrd = entityRcrds.interaction[row.data.id];  
        fillTaxonData('subject', row.data, intRcrd);
        fillTaxonData('object', row.data, intRcrd);
    }
    /**
     * Will need to be rewritten to allow for taxa acting as both subject & object. 
     */
    function fillTaxonData(role, rowData, intRcrd) {
        addTaxonToRowData(role, intRcrd[role]);

        function addTaxonToRowData(role, taxonId) {
            const txn = entityRcrds.taxon[intRcrd[role]];                       
            if (taxa[txn.displayName]) { 
                addKnownTaxonAncestry(role, txn.displayName, taxa[txn.displayName]); 
            } else {
                discoverAndAddTaxonAncestry(role, txn);
            }
        }
        function addKnownTaxonAncestry(role, txnName, txnData) {  
            rowData[txnData.col] = txnName;
            if (!txnData.prnt) { return; }
            addKnownTaxonAncestry(role, txnData.prnt, taxa[txnData.prnt]);
        }
        function discoverAndAddTaxonAncestry(role, txn) {                       
            const pTxn = txn.isRealm ? false : entityRcrds.taxon[txn.parent];
            addToRowDataAndDiscoveredTaxa();
            if (!pTxn) { return; }
            discoverAndAddTaxonAncestry(role, pTxn);

            function addToRowDataAndDiscoveredTaxa() {
                const colName = getColName();
                addToDiscoveredTaxa(colName);
                rowData[colName] = txn.displayName;
            }
            function addToDiscoveredTaxa(col) {
                const pName = pTxn ? pTxn.displayName : false;
                taxa[txn.displayName] = { col: col, prnt: pName };
            }
            function getColName() {
                const prefix = role == 'subject' ? 'subj' : 'obj';
                return  prefix + txn.level.displayName;
            }
        }
    }
}
/* ---------------------- SET UP TABLE -------------------------------------- */
function setUpTableForExport() {
    showAllExportData();
    toggleUiTableColumns(false);
    selectInteractionDataRowsForExport(tblState.api);
}
function showAllExportData() {
    toggleLocExportData(true);
    toggleTxnExportData(true);
}
function selectInteractionDataRowsForExport(tblApi) {
    tblApi.expandAll();
    tblApi.forEachNodeAfterFilter(selectInteractions);                
}
/** An interaction row has 'interactionType' data. */
function selectInteractions(row) { 
    if (row.data.entity !== 'Interaction') { return; }  
    row.setSelected(true);
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
    showTable();
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
    const cols = ['subjOrder', 'subjGenus', 'subjFamily', 'subjSpecies', 
        'objDomain', 'objectKingdom', 'objPhylum', 'objClass', 'objOrder', 
        'objGenus', 'objFamily', 'objSpecies'];
    // toggleTxnUiCols(!showing);
    // const cols = getCurTaxonLvlCols(tblState.taxaByLvl);
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
    toggleTableColumns(['name', 'intCnt', 'edit', 'map', 'subject', 'object'], showing);
}