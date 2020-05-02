/**
 * Handles UI related to the database search page.
 *
 * Exports:                         Imported by:
 *     addDomEventListeners             _pg
 *     collapseTree                     csv-export
 *     expandTreeByOne                  csv-export
 *     fadeTable                        db-page
 *     init                             _pg
 *     initLocSearchUi                  _pg
 *     initSrcSearchUi                  _pg
 *     initTaxonSearchUi                _pg
 *     loadLocFilterPanelElems          db-page, db-filters
 *     loadSrcFilterPanelElems          db-page, db-filters
 *     loadTxnFilterPanelElems          db-page, db-filters     
 *     resetToggleTreeBttn              _pg, init-table
 *     selectInitialSearchFocus         db-page
 *     updateUiForDatabaseInit             util
 *     showTips                         intro
 *     updateUiForTableView             db-page
 *     updateUiForMapView               db-page
 */
import * as _pg from '../db-main.js';
import * as _u from '../util/util.js';
import * as pM from './panels/panels-main.js';
import showTips from './tips-popup.js';

import exportCsvData from '../table/export/csv-export.js';
import { initNewDataForm } from '../forms/forms-main.js';
import * as db_filters from '../table/filters/filters-main.js';
import { showInts } from '../map/map-main.js';
import { enableListReset, toggleSaveIntsPanel } from '../pg-ui/panels/int-list-panel.js';
import { addPanelEventsAndStyles, closeOpenPanels } from '../pg-ui/panels/panels-main.js';
import showEditorHelpModal from './editor-help-modal.js';

const tState = _pg.accessTableState;
const app = {
    userRole: $('body').data("user-role"),
    enabledSelectors: false
};
/* ======================== FILTER PANEL ==================================== */
export function loadLocFilterPanelUi(tblState) {                      
    pM.loadLocFilterPanelUi(tblState);
}
export function loadSrcFilterPanelUi(realm) {                      
    pM.loadSrcFilterPanelUi(realm);
}
export function loadTxnFilterPanelUi(tblState) {
    pM.loadTxnFilterPanelUi(tblState);
}
export function toggleDateFilter(state) {
    pM.toggleDateFilter(state);
}
/* ============================= DATABASE SEARCH PAGE INIT ========================================================== */
export function init() {
    _u.initComboboxes(['Focus', 'View']);
    showPopUpMsg('Loading...');
    addDomEventListeners();
    authDependentInit();
}
function addDomEventListeners() {
    $("#show-tips").click(showTips);
    $('button[name="xpand-all"]').click(toggleExpandTree);
    $('button[name="xpand-1"]').click(expandTreeByOne);
    $('button[name="collapse-1"]').click(collapseTreeByOne);
    $('#shw-map').click(showTableRecordsOnMap);
    addPanelEventsAndStyles(app.userRole);
}
/* --------------------- Auth-Dependent Init -------------------------------- */
function authDependentInit() {
    const initMap = {
        visitor: disableUserFeatures, user: initUserFeatures,
        editor: initEditorFeatures, admin: initEditorFeatures,
        super: initEditorFeatures
    };
    initMap[app.userRole]();
}
function disableUserFeatures() {                                                //console.log('disableUserFeatures')
    $(`button[name="csv"], #list-opts button, #new-data, #rvw-data, #data-help,
        #selSavedFilters, .fltr-desc, #apply-filter, #save-filter, #delete-filter, 
        #stored-filters input, #stored-filters textarea`)
        .css('cursor', 'not-allowed').prop('disabled', true).fadeTo('fast', .5)
        .prop('title', 'Please register to use these features.');
    $('#data-help').fadeTo('fast', .1)
    app.enabledSelectors = false;
}
function initUserFeatures() {                                                   //console.log('enableUserFeatures')
    initUserButtons();
    $('#data-help, #new-data, #rvw-data').css('cursor', 'not-allowed' )
        .prop('title', 'This feature is only available to editors.').fadeTo('fast', .5);
    app.enabledSelectors = `button[name="csv"], #lists`;
}
function initEditorFeatures() {                                                 //console.log('enableEditorFeatures')
    initUserButtons();                                              
    initEditorButtons();
    app.enabledSelectors = '.map-dsbl';
}
function initUserButtons() {
    $('#lists').click(toggleSaveIntsPanel);
    $('button[name="csv"]').click(exportCsvData);  
}
function initEditorButtons() {
    $('#data-help').addClass('adminbttn').click(showEditorHelpModal);
    $('#new-data').addClass('adminbttn').click(initNewDataForm);
    $('#rvw-data').addClass('adminbttn');
}
/* --------------------- Database-Init UI ----------------------------------- */
/** Shows a loading popup message for the inital data-download wait. */
/** While the database is being initialized, the Map Interactions feature is disabled. */
export function updateUiForDatabaseInit(type) {
    app.dbInitializing = true;
    showDataInitLoadingStatus();
    toggleSearchOptions('disable');
    $('#shw-map').data('loaded', false);
}
function showDataInitLoadingStatus() {
    const status = '[ Database initializing... Table will reset once complete, ~45 seconds. ]';
    $('#filter-status').text(status).css('color', 'teal').data('loading', true);
    showPopUpMsg();
}
function toggleSearchOptions(toggleKey) {
    handleButtons(toggleKey);
    $('#search-focus')[0].selectize[toggleKey](); 
}
function handleButtons(toggleKey) {
    const opac = toggleKey === 'enable' ? 1 : .5;
    const disabled = toggleKey === 'disable';
    const cursor = toggleKey === 'enable' ? 'pointer' : 'wait';
    $('.ico-bttn').css('cursor', cursor).prop('disabled', disabled).fadeTo('fast', opac);
    toggleMapButton(toggleKey, disabled);
}
function toggleMapButton(toggleKey, disabled) {
    if (toggleKey === 'enable' && !$('#shw-map').data('loaded')) { 
        $('#shw-map').prop('disabled', disabled).fadeTo('fast', .5); 
    }
}
/** 
 * Once db init complete, the page features are enabled after a delay so the table  
 * finishes reloading before the feature buttons fades in.
 */
function updateUiAfterDatabaseInit() {
    toggleSearchOptions('enable');
    $('#filter-status').css('color', 'black').data('loading', false);
    if (app.userRole === 'visitor') { disableUserFeatures(); }
    delete app.dbInitializing;
}
/* --------------------- Init Table Focus ----------------------------------- */
/** Selects either Taxon, Location or Source in the table-focus dropdown. */
export function selectInitialSearchFocus(f) {                                   //console.log('--------------selectInitialSearchFocus [%s]', f);
    const focus = f || 'taxa';
    _u.replaceSelOpts('#search-focus', getFocusOpts())
    _u.setSelVal('Focus', focus, 'silent');
}
function getFocusOpts() {
    return [
        { value: 'locs', text: 'Location' },
        { value: 'srcs', text: 'Source' },
        { value: 'taxa', text: 'Taxon' },
    ];
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
    const tblApi = _pg.accessTableState().get('api');
    const expanded = $('#xpand-all').data('xpanded');
    $('#xpand-all').data("xpanded", !expanded);
    return expanded ? collapseTree(tblApi) : expandTree(tblApi);
}
function expandTree(tblApi) {
    tblApi.expandAll();    
    $('#xpand-all').html("Collapse All");
}
export function collapseTree(tblApi) {
    tblApi.collapseAll();
    $('#xpand-all').html("Expand All");
}
/** Events fired when clicking the + or - tree buttons.  */
export function expandTreeByOne() {    
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
    const tblApi = _pg.accessTableState().get('api');
    const tblModel = tblApi.getModel();                                  
    const bttXpandedAll = $("#xpand-all").data('xpanded');
    if (opening && bttXpandedAll === true) {return;}

    tblModel.rowsToDisplay.forEach(row => {                             
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
    tblApi.forEachNodeAfterFilter(node => cnt += 1); 
    return cnt;
}
/**
 * If there are no child rows, or if the child rows are closed, this is the open leaf.
 */
function isNextOpenLeafRow(node) {                                              //console.log("node = %O", node);
    if (node.childrenAfterFilter) {
        return node.childrenAfterFilter.every(childNode => !childNode.expanded);
    } 
    return true;
}     
/* ====================== DATABASE ENTITY VIEW UI =================================================================== */
/* ---------------------------- TAXON VIEW -------------------------------------------------------------------------- */
/** Loads the taxon view options and updates the data-view combobox. */
export function initTaxonSearchUi(curView, reset) {                             //console.log("initTaxonSearchUi. realms = %O", realms);
    _u.getData('realm').then( realms => {                                       //console.log('--initTaxonSearchUi. realms = %O', realms)
        loadTxnViewOpts(realms, reset);
        setTaxonView(curView); 
    });
}
function loadTxnViewOpts(realms, reset) {
    if ($('#sel-view').data('focus') === 'taxa' && !reset) { return; }
    buildAndLoadTxnOpts(realms);
}
function buildAndLoadTxnOpts(realms) {
    const opts = getViewOpts(realms);
    _u.replaceSelOpts('#sel-view', opts, _pg.onTxnViewChange);
    $('#sel-view').data('focus', 'taxa');
}
function getViewOpts(realms) { 
    const taxa = tState().get('rcrdsById');
    const optsAry = [];
    Object.keys(realms).forEach(buildRealmOpt);
    return optsAry;
    
    function buildRealmOpt(id) {  
        const rootTxn = taxa[realms[id].taxon];  
        const val = rootTxn ? rootTxn.id : id+'temp';                           //console.log('realm = %O rootTxn = %O', realms[id], rootTxn);
        if (Number.isInteger(val) && !ifTxnHasInts(rootTxn.id)) { return; }
        optsAry.push({ value: val, text: realms[id].pluralName });
    }
    function ifTxnHasInts(id) {
        const taxon = taxa[id];
        const hasInts = !!taxon.subjectRoles.length || !!taxon.objectRoles.length;
        return hasInts || taxon.children.find(ifTxnHasInts);
    }
}
/** Restores stored realm from previous session or sets the default 'Bats'. */
function setTaxonView(curView) {
    if (!_u.getSelVal('View')) { 
        const realmVal = curView ? curView : '2';  
        _u.setSelVal('View', realmVal, 'silent');
    }
}
/* ---------------------------- LOCATION VIEW ----------------------------------------------------------------------- */
/**
 * Builds location view html and initializes table load. Either builds the table 
 * data-tree view, by default, or loads the data-map view, if previously 
 * selected. 
 */ 
export function initLocSearchUi(view) {                             /*Perm-log*/console.log("       --Init Location UI. view ? [%s]", view);        
    loadLocationViewOpts();
    if (view) { setLocView(view); 
    } else { _u.getData('curView'.then(setLocView)); }
} 
function loadLocationViewOpts(argument) {
    if ($('#sel-view').data('focus') === 'locs') { return; }
    const opts = [{ value: 'map', text: 'Map Data' },
                { value: 'tree', text: 'Table Data' }];
    _u.replaceSelOpts('#sel-view', opts, _pg.onLocViewChange);
    $('#sel-view').data('focus', 'locs');
}
function setLocView(view) {
    _u.setSelVal('View', view, 'silent');
}
/* ---------------------------- SOURCE VIEW ------------------------------------------------------------------------- */
/**
 * If the source-realm combobox isn't displayed, build it @buildSrcViewHtml.
 * If no realm selected, set the default realm value. Start table build @buildSrcTree.
 */
export function initSrcSearchUi(view) {                             /*Perm-log*/console.log("       --Init source UI. view ? [%s]", view);
    loadSourceViewOpts();   
    setSrcView(view);  
}
function loadSourceViewOpts() {
    if ($('#sel-view').data('focus') === 'srcs') { return ; }
    const opts = [{ value: "auths", text: "Authors" },
                  { value: "pubs", text: "Publications" },
                  { value: "publ", text: "Publishers" }];
    _u.replaceSelOpts('#sel-view', opts, _pg.onSrcViewChange);
    $('#sel-view').data('focus', 'srcs');
} 
/** Restores stored realm from previous session or sets the default 'Publications'. */
function setSrcView(view) {
    _pg.accessTableState().set({'curView': view});
    if (!_u.getSelVal('View')) { _u.setSelVal('View', view, 'silent'); } 
}
/* ====================== SWITCH BETWEEN MAP AND TABLE UI =========================================================== */
export function updateUiForMapView() {
    updateBttnToReturnRcrdsToTable();
    disableTableButtons();
    showPopUpMsg();
    closeOpenPanels();
    $('#tool-bar').fadeTo('fast', 1);
    $('#search-tbl').hide();  
    $('#map').show(); 
}
export function updateUiForTableView() {
    $('#search-tbl').fadeTo('fast', 1);
    $('#map, #filter-in-tbl-msg').hide();
    enableTableButtons();
    updateBttnToShowRcrdsOnMap(); 
}
function showTableRecordsOnMap() {                                              console.log('       +--showTableRecordsOnMap');
    const tblState = _pg.accessTableState().get(null, ['curFocus', 'rcrdsById']);
    $('#search-tbl').fadeTo('fast', 0.3, () => {
        updateUiForMapView();
        getLocRcrds().then( rcrds => {
            showInts(tblState.curFocus, tblState.rcrdsById, rcrds);
        });
    });

    function getLocRcrds() {
        return Promise.resolve(tblState.curFocus !== 'locs' ? 
            _u.getData('location') : tblState.rcrdsById);  
    }
}
function updateBttnToReturnRcrdsToTable() {
    $('#shw-map').text('Return to Table');
    $('#shw-map').off('click').on('click', returnRcrdsToTable)
        .prop('title', 'Close map and reopen records in table.');
}
function updateBttnToShowRcrdsOnMap() {
    $('#shw-map').text('Map Interactions');
    $('#shw-map').off('click').on('click', showTableRecordsOnMap)
        .prop('title', 'Show interactions on a map.');
}
function returnRcrdsToTable() {                                                 console.log('       +--returnRcrdsToTable');
    updateUiForTableView();
    if (_u.getSelVal('View') === 'map') { _u.setSelVal('View', 'tree'); }
}

/* ========================== UTILITY =============================================================================== */
export function enableTableButtons(allDataAvailable) {                                          //console.log('enableTableButtons. enabled elems = %s', app.enabledSelectors);
    if (app.dbInitializing && allDataAvailable || testingDbInit()) { updateUiAfterDatabaseInit() }
    if (app.dbInitializing === true) { return enableToggleTreeButtons(); }
    $(getAllSelectors('.tbl-tools button, .tbl-tools input, #focus-opts'))
        .attr('disabled', false).css('cursor', 'pointer');
    $('button[name="show-hide-col"]').css('cursor', 'not-allowed');
    $(getAllSelectors('.tbl-tools')).fadeTo('slow', 1);
    enableListReset();
    db_filters.enableClearFiltersButton();
}
function testingDbInit() {
    return app.dbInitializing && $('body').data('env') === 'test';
}
function enableToggleTreeButtons() {
    $('#xpand-tree, #xpand-tree button').attr('disabled', false).css('cursor', 'pointer')
        .fadeTo('slow', 1);
    app.dbInitializing = 'complete';
}
function getAllSelectors(selectors) {
    return app.enabledSelectors ? selectors += ', '+ app.enabledSelectors : selectors;
}
function disableTableButtons() {
    $('.tbl-tools, .map-dsbl').fadeTo('slow', .3); 
    $(`.tbl-tools button, .tbl-tools input, .map-dsbl`)
        .attr('disabled', 'disabled').css('cursor', 'default');
}
export function fadeTable() {  
    $('#borderLayout_eRootPanel, #tool-bar').fadeTo(100, .3);
}
export function showTable() {
    $('#borderLayout_eRootPanel, #tool-bar').fadeTo(100, 1);
}
export function showPopUpMsg(msg) {                                             //console.log("showPopUpMsg. msg = ", msg)
    const popUpMsg = msg || 'Loading...';
    $('#db-popup').text(popUpMsg);
    $('#db-popup').addClass('loading'); //used in testing
    $('#db-popup, #db-overlay').show();
    fadeTable();
}