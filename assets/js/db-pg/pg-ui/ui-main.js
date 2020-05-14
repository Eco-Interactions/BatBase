/**
 * Handles UI related to the database search page.
 *
 * Exports:                         Imported by:
 *     addDomEventListeners             _pg
 *     collapseTree                     csv-export
 *     expandTreeByOne                  csv-export
 *     fadeTable                        db-page
 *     init                             _pg
 *     initLocViewOpts                  _pg
 *     initSrcViewOpts                  _pg
 *     initTxnViewOpts                _pg
 *     loadLocFilterPanelElems          db-page, db-filters
 *     loadSrcFilterPanelElems          db-page, db-filters
 *     loadTxnFilterPanelElems          db-page, db-filters     
 *     setTreeToggleData              _pg, init-table
 *     selectInitialSearchFocus         db-page
 *     updateUiForDatabaseInit             util
 *     showTips                         intro
 *     updateUiForTableView             db-page
 *     updateUiForMapView               db-page
 */
import { accessTableState as tState, _u } from '../db-main.js';
import * as pM from './panels/panels-main.js';
import * as bttns from './feature-buttons.js';
import * as rowToggle from './table-row-toggle.js'; 
import * as views from './view-opts.js'; 
import * as mapUi from './ui-map-state.js';

/* ************************** FACADE **************************************** */
/* ======================== EXTERNAL USE ==================================== */
export function showTips() {
    bttns.showTipsPopup();
}
/* =========================== PANELS ======================================= */
/* -------------------- FILTERS --------------------------------------------- */
export function updateFilterPanelHeader(focus) {
    pM.updateFilterPanelHeader(focus);
}
export function clearFilterUi() {
    pM.clearFilterUi();
}
export function enableClearFiltersButton() {
    pM.enableClearFiltersButton();
}
export function updateFilterStatusMsg() {
    pM.updateFilterStatusMsg();
}
export function reloadTableThenApplyFilters(filters) {
    fM.reloadTableThenApplyFilters(filters);
}
/* -------------------- DATA LISTS ------------------------------------------- */
export function isSavedIntListLoaded() {
    return pM.isSavedIntListLoaded();
}
export function isFilterSetActive() {
    return pM.isFilterSetActive();
}
export function enableListResetBttn() {
    return pM.enableListResetBttn();
}
/* ==================== DATABASE OPTIONS BAR ================================ */
/* -------------------- FILTERS --------------------------------------------- */

/* ================= TABLE STATUS BAR ======================================= */
/* -------------------- ROW TOGGLE ------------------------------------------ */
export function setTreeToggleData(state) {
    rowToggle.setTreeToggleData(state);
}
export function expandTreeByOne() {
    toggleTreeRows(true, true);
}
export function collapseTree() {
    toggleTreeRows(false);
}
function toggleTreeRows(xpand, byOne) {
    rowToggle.toggleTree(getTblApi(), xpand, byOne);
}
function getTblApi() {
    return pg.accessTableState().get('api');
}
function setRowToggleEvents() {
    $('button[name="xpand-all"]').click(toggleTreeRows.bind(null, true)); 
    $('button[name="xpand-1"]').click(expandTreeByOne);
    $('button[name="collapse-1"]').click(toggleTreeRows.bind(null, false, true));
}
/* ============================= DATABASE SEARCH PAGE INIT ========================================================== */
/** Shows a loading popup message for the inital data-download wait. */
export function init() {
    const userRole = $('body').data("user-role");    
    showPopUpMsg('Loading...');
    setRowToggleEvents();
    pM.addPanelEventsAndStyles(userRole);
    bttns.initFeatureButtons(userRole);
}
export function updateUiForDatabaseInit() {
    bttns.updateUiForDatabaseInit();
}
/* =========== DATABASE ENTITY FOCUS/VIEW UI ================================ */
/** Selects either Taxon, Location or Source in the table-focus dropdown. */
export function selectInitialSearchFocus(f) {                                   //console.log('--------------selectInitialSearchFocus [%s]', f);
    const focus = f || 'taxa';
    _u('replaceSelOpts', ['#search-focus', getFocusOpts()]);
    _u('setSelVal', ['Focus', focus, 'silent']);
}
function getFocusOpts() {
    return [
        { value: 'locs', text: 'Location' },
        { value: 'srcs', text: 'Source' },
        { value: 'taxa', text: 'Taxon' },
    ];
}
/* --------------- VIEW OPTS --------------- */
export function initTxnViewOpts(view, reset) {           
    views.initTxnViewOpts(view, reset);
}
export function initLocViewOpts(view) {    
    views.initLocViewOpts(view);
}        
export function initSrcViewOpts(view) {            
    views.initSrcViewOpts(view);
}
/* ====================== SWITCH BETWEEN MAP AND TABLE UI =================== */
export function updateUiForMapView() {
    bttns.disableTableButtons();
    mapUi.updateUiForMapView();
    showPopUpMsg();
    pM.closeOpenPanels();
}
export function updateUiForTableView() {
    bttns.enableTableButtons();
    mapUi.updateUiForTableView(); 
}
/* ==================== UTILITY ============================================= */
export function enableTableButtons(allDataAvailable) { 
    bttns.enableTableButtons(allDataAvailable);
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