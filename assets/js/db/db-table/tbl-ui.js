/**
 * Handles UI related to the table data.
 *
 * Exports:
 *     addDomEventListeners
 *     resetToggleTreeBttn
 *     setUpFutureDevInfoBttn
 *     updateUiForTableView
 *     updateUiForMapView
 */
import * as _u from '../util.js';
import { accessTableState as tState, showTableRecordsOnMap } from '../db-page.js';
import { showInts } from '../db-map.js';


/* ============================= DATABASE SEARCH PAGE INIT ========================================================== */
export function addDomEventListeners() {
    $('button[name="xpand-all"]').click(toggleExpandTree);
    $('button[name="xpand-1"]').click(expandTreeByOne);
    $('button[name="collapse-1"]').click(collapseTreeByOne);
}
export function setUpFutureDevInfoBttn() {
    const bttn = _u.buildElem('button', { name: 'futureDevBttn', 
            title: getFutureDevMsg(),
            text: 'Hover here for future search options.'});  
    $(bttn).appendTo('#opts-col3 .bttm-row');        
}
function getFutureDevMsg() {                                                    //console.log("addFutureDevMsg")
    return "Future options include year and elevation range, habitat and interaction " +
        "type (currently available by filtering the table columns), " +
        "as well as other criteria that would be helpful to focus the data. \n" +
        "Below is a 'Show/Hide Columns' button that will allow users to specify " +
        "the data shown in the table and/or csv export.";
}
/* ============================== TOGGLE TABLE ROWS ================================================================= */
/**
 * Resets button based on passed boolean xpanded state. True for fully 
 * expanded and false when collapsed.
 */
export function resetToggleTreeBttn(xpanded) {
    const bttnText = xpanded ? "Collapse All" : "Expand All"; 
    $('#xpand-all').html(bttnText);
    $('#xpand-all').data("xpanded", xpanded);
}
function toggleExpandTree() {                                                   //console.log("toggleExpandTree")
    const tblApi = tState().get('api');
    const expanded = $('#xpand-all').data('xpanded');
    $('#xpand-all').data("xpanded", !expanded);
    return expanded ? collapseTree(tblApi) : expandTree(tblApi);
}
function expandTree(tblApi) {
    tblApi.expandAll();    
    $('#xpand-all').html("Collapse All");
}
function collapseTree(tblApi) {
    tblApi.collapseAll();
    $('#xpand-all').html("Expand All");
}
/** Events fired when clicking the + or - tree buttons.  */
function expandTreeByOne() {    
    toggleTreeByOneLvl(true);
}
function collapseTreeByOne() {
    toggleTreeByOneLvl(false);
}
/**
 * Opens/closes one level of the displayed data tree. If there are no closed 
 * rows left after updating, the toggle tree button is updated to 'Collapse All'. 
 */
function toggleTreeByOneLvl(opening) {
    const tblApi = tState().get('api');
    const tblModel = tblApi.getModel();                                            //console.log("tblModel = %O", tblModel);
    const bttXpandedAll = $("#xpand-all").data('xpanded');
    if (opening && bttXpandedAll === true) {return;}

    tblModel.rowsToDisplay.forEach(function(row) {                              //console.log("rowToDisplay = %O", row)
        if (!opening && !isNextOpenLeafRow(row)) { return; }
        row.expanded = opening;
        row.data.open = opening;
    });
    tblApi.onGroupExpandedOrCollapsed();
    updateToggleTreeButton();
    /**
     * Checks displayed rows against total rows after filters to determine
     * if there are any closed rows remaining. The toggle tree button is updated 
     * if necessary.
     */
    function updateToggleTreeButton() {
        const shownRows = tblModel.rowsToDisplay.length; 
        const allRows = getCurTreeRowCount(tblApi);
        const closedRows = shownRows < allRows;                                 //console.log("%s < %s ? %s... treeBttn = %s ", shownRows, allRows, closedRows, bttXpandedAll);

        if (!closedRows) { resetToggleTreeBttn(true); 
        } else if (bttXpandedAll === true) { resetToggleTreeBttn(false); }
    }
} /* End toggleTreeByOneLvl */
function getCurTreeRowCount(tblApi) {
    let cnt = 0;
    tblApi.forEachNodeAfterFilter(function(node){ cnt += 1; }); 
    return cnt;
}
/**
 * If there are no child rows, or if the child rows are closed, this is the open leaf.
 */
function isNextOpenLeafRow(node) {                                              //console.log("node = %O", node);
    if (node.childrenAfterFilter) {
        return node.childrenAfterFilter.every(function(childNode){
            return !childNode.expanded;
        });
    } 
    return true;
}     
/* ====================== SWITCH BETWEEN MAP AND TABLE UI =========================================================== */
export function updateUiForMapView() {
    updateBttnToReturnRcrdsToTable();
    _u.disableTableButtons();
    _u.showPopUpMsg();
    $('#tool-bar').fadeTo(100, 1);
    $('#search-tbl').hide();
    $('#map').show(); 
}
export function updateUiForTableView() {
    $('#search-tbl').fadeTo('100', 1);
    $('#map, #filter-in-tbl-msg').hide();
    _u.enableTableButtons();
    _u.enableComboboxes($('#opts-col1 select, #opts-col2 select'));
    $('#shw-map').attr('disabled', false).css({'opacity': 1, 'cursor': 'pointer'});  
    updateBttnToShowRcrdsOnMap();
}
export function updateUiForMappingInts() {
    updateUiForMapView();
    _u.enableComboboxes($('#opts-col1 select, #opts-col2 select'), false);
}
function updateBttnToReturnRcrdsToTable() {
    addMsgAboutTableViewFiltering();
    $('#shw-map').text('Return to Table View');
    $('#shw-map').off('click').on('click', returnRcrdsToTable);
    $('#shw-map').attr('disabled', false).css({'opacity': 1, cursor: 'pointer'});
}
function addMsgAboutTableViewFiltering() {
    if ($('#filter-in-tbl-msg').length) { return $('#filter-in-tbl-msg').show();}
    const div = _u.buildElem('div', {id:'filter-in-tbl-msg'});
    div.innerHTML = `Return to filter data shown.`;
    $('#content-detail').prepend(div);
}
function updateBttnToShowRcrdsOnMap() {
    $('#shw-map').text('Show Interactions on Map');
    $('#shw-map').off('click').on('click', showTableRecordsOnMap);
}
function returnRcrdsToTable() {
    updateUiForTableView();
    if (_u.getSelVal('Loc View') === 'map') { _u.setSelVal('Loc View', 'tree'); }
}