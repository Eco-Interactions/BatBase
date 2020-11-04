/**
 * Handles UI related to the database search page.
 *
 * TOC
 *     PANELS
 *         FILTERS
 *         DATA-LISTS
 *     TABLE-ROW TOGGLE
 *     DATABASE-PAGE INIT
 *     DATABASE ENTITY FOCUS/VIEW UI
 *         VIEW OPTS
 *     SWITCH BETWEEN MAP AND TABLE UI
 *     UTILITY
 *
 */
import { _cmbx } from '~util';
import { _map, _table } from '~db';
import * as pM from './panels/panels-main.js';
import * as bttns from './feature-buttons.js';
import * as rowToggle from './table-row-toggle.js';
import * as views from './view-opts.js';

export function showTips() {
    bttns.showTipsPopup();
}
/* =========================== PANELS ======================================= */
/* -------------------- FILTERS --------------------------------------------- */
export function resetFilterPanelOnFocusChange() {
    pM.resetFilterPanelOnFocusChange(...arguments);
}
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
export function updateTaxonFilterViewMsg() {
    pM.updateTaxonFilterViewMsg(...arguments);
}
/* -------------------- DATA LISTS ------------------------------------------- */
export function enableListResetBttn() {
    return pM.enableListResetBttn();
}
/* ====================== TABLE-ROW TOGGLE =================================== */
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
function toggleAllRows() {
    toggleTreeRows(!$("#xpand-all").data('xpanded'));
}
function getTblApi() {
    return _table('tableState').get('api');
}
function setRowToggleEvents() {
    $('button[name="xpand-all"]').click(toggleAllRows);
    $('button[name="xpand-1"]').click(expandTreeByOne);
    $('button[name="collapse-1"]').click(toggleTreeRows.bind(null, false, true));
}
/* ====================== DATABASE-PAGE INIT ================================ */
/** Shows a loading popup message for the inital data-download wait. */
export function init() {
    const userRole = $('body').data("user-role");
    showPopupMsg('Loading...');
    setRowToggleEvents();
    pM.addPanelEventsAndStyles(userRole);
    bttns.initFeatureButtons(userRole);
    initDatabaseFocusAndViewCombos();
}
function initDatabaseFocusAndViewCombos() {  console.log('initDatabaseFocusAndViewCombos')
    _cmbx('initCombobox', [{ name: 'Focus', onChange: buildTable }, true]);
    _cmbx('initCombobox', [{ name: 'View',  onChange: Function.prototype }, true]);
    // _cmbx('initComboboxes', [{'Focus': buildTable, 'View': Function.prototype}]);
}
function buildTable() {
    _table('buildTable')
}
export function updateUiForDatabaseInit() {
    bttns.updateUiForDatabaseInit();
}
export function onDataDownloadCompleteEnableUiFeatures() {
    bttns.onDataDownloadCompleteEnableUiFeatures();
}
/* =========== DATABASE ENTITY FOCUS/VIEW UI ================================ */
/** Selects either Taxon, Location or Source in the table-focus dropdown. */
export function selectInitialSearchFocus(f) {                       /*dbug-log*///console.log('--------------selectInitialSearchFocus [%s]', f);
    const focus = f || 'taxa';
    _cmbx('replaceSelOpts', ['Focus', getFocusOpts()]);
    _cmbx('setSelVal', ['Focus', focus, 'silent']);
}
function getFocusOpts() {
    return [
        new Option('Location', 'locs'),
        new Option('Source', 'srcs'),
        new Option('Taxon', 'taxa')
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
export function updateUiForMapView(noPopup) {
    bttns.disableTableButtons();
    updateMapUiForMapView();
    pM.closeOpenPanels();
    if (noPopup) { return; }
    showPopupMsg();
}
export function updateUiForTableView() {
    bttns.enableTableButtons();
    updateMapUiForTableView();
}
function updateMapUiForMapView() {
    updateBttnToReturnRcrdsToTable();
    $('#tool-bar').fadeTo('fast', 1);
    $('#search-tbl').hide();
    $('#map').show();
}
function updateMapUiForTableView() {
    $('#search-tbl').fadeTo('fast', 1);
    $('#map, #filter-in-tbl-msg').hide();
    updateBttnToShowRcrdsOnMap();
}
function updateBttnToReturnRcrdsToTable() {
    $('#shw-map').text('Return to Table');
    $('#shw-map').off('click').on('click', returnRcrdsToTable)
        .prop('title', 'Close map and reopen records in table.');
}
function updateBttnToShowRcrdsOnMap() {
    $('#shw-map').text('Map Interactions');
    $('#shw-map').off('click').on('click', showRcrdsOnMap)
        .prop('title', 'Show interactions on a map.');
}
function showRcrdsOnMap() {
    _map('showTableRecordsOnMap');
}
function returnRcrdsToTable() {                                     /*dbug-log*///console.log('       +--returnRcrdsToTable');
    updateUiForTableView();
    if (_cmbx('getSelVal', ['View']) === 'map') { _cmbx('setSelVal', ['View', 'tree']); }
}
/* ==================== UTILITY ============================================= */
export function enableTableButtonsIfDataLoaded() {
    bttns.enableTableButtonsIfDataLoaded(...arguments);
}
export function fadeTable() {
    $('#borderLayout_eRootPanel, #tool-bar').fadeTo(100, .3);
}
export function showTable() {
    $('#borderLayout_eRootPanel, #tool-bar').fadeTo(100, 1);
}
export function showPopupMsg(msg) {                                 /*dbug-log*///console.log("showPopupMsg. msg = ", msg)
    const popUpMsg = msg || 'Loading...';
    $('#db-popup').text(popUpMsg);
    $('#db-popup').addClass('loading'); //used in testing
    $('#db-popup, #db-overlay').show();
    fadeTable();
}
export function hidePopupMsg() {
    $('#db-popup, #db-overlay').hide();
    $('#db-popup').removeClass('loading'); //used in testing
    showTable();
}