/**
 * The Database Search page entry point. The data table is built to display the
 * eco-interaction records organized by a selected "focus": taxa (grouped further
 * by view: bat, plant, arthropod), locations, or sources (grouped by either
 * authors, publications, or publishers). The data map displays interactions
 * geographically. Filtered interactions can be viewed in either form.
 *
 * CODE SECTIONS:
 *     TABLE STATE OBJ
 *     PAGE INIT
 *     TABLE "STATE"
 *         STATE MANAGMENT
 *     TABLE (RE)BUILD
 *     LOCATION SEARCH
 *         LOCATION TABLE
 *         LOCATION MAP
 *     SOURCE SEARCH
 *     TAXON SEARCH
 */
import * as db from './local-data/local-data-main.js';
import * as forms from './forms/forms-main.js';
import * as map from './map/map-main.js';
import * as table from './table/table-main.js';
import * as tutorial from './tutorial/db-tutorial.js';

import * as u from './util/util.js';
import * as alert from '../app/misc/alert-issue.js';

import * as ui from './pg-ui/ui-main.js';
import * as modal from '../misc/intro-modals.js';


/*NOTE: Not sure why this page is getting loaded on external pages. It could be something tangled with webpack.*/
if (window.location.pathname.includes('search')) {
    initDbPage();
}
/** ==================== FACADE ============================================= */
export function executeMethod(funcName, mod, modName, caller, params = []) {
    if (!Array.isArray(params)) { params = [params]; }  //Catches events typically.
    try {
        return mod[funcName](...params);
    } catch(e) {
        alertIssue('facadeErr', {module: modName, caller: caller, called: funcName, error: e.toString(), errMsg: e.message});
        if ($('body').data('env') === 'prod') { return; }
        console.error('[%s][%s] module: [%s] call failed.  params = %O, err = %O', caller, modName, funcName, params, e);
    }
}
function moduleMethod(funcName, mod, modName, params) {
    return executeMethod(funcName, mod, modName, 'db-main', params);
}
export function _u(funcName, params = []) {
    return moduleMethod(funcName, u, 'util', params);
}
export function _ui(funcName, params = []) {
    return moduleMethod(funcName, ui, 'ui', params);
}
export function _modal(funcName, params = []) {
    return moduleMethod(funcName, modal, 'modal', params);
}
export function _tutorial(funcName, params = []) {
    return moduleMethod(funcName, tutorial, 'tutorial', params);
}
export function _filter(funcName, params = []) {
    return moduleMethod(funcName, table, 'filter', params);
}
export function _forms(funcName, params = []) {
    return moduleMethod(funcName, forms, 'forms', params);
}
export function _map(funcName, params = []) {
    return moduleMethod(funcName, map, 'map', params);
}
export function _table(funcName, params = []) {
    return moduleMethod(funcName, table, 'table', params);
}
export function openDataEntryForm() {
    ui.showPopupMsg();
    forms.initNewDataForm()
    .then(ui.hidePopupMsg);
}
/* ------------------- LOCAL DATA ------------------------------------------- */
export function _db(funcName, params = []) {                        /*dbug-log*///console.log('_ui args = %O', arguments);
    return db[funcName](...params);
}
export function resetLocalDb() {
    return db.resetStoredData();
}
/* --------------- ERROR HANDLING ------------------------------------------- */
export function _alert(funcName, params = []) {                     /*dbug-log*///console.log('_ui args = %O', arguments);
    return alert[funcName](...params);
}
/** Handles issues without javascript error/exception objects. */
export function alertIssue() {
    return alert.alertIssue(...arguments);
}
/** Sends Error object to Sentry, issue tracker. */
export function reportErr() {
    return alert.reportErr(...arguments);
}
/** ==================== TABLE STATE OBJ ==================================== */
/**
 * Stores table state params needed across multiple modules.
 * {obj} api            Ag-grid API (available after table-init complete)
 * {obj} columnApi      Ag-grid Column API (available after table-init complete)
 * {str} curFocus       Focus of the data in table: taxa, srcs, locs
 * {str} curView        Sub-sort of table data. Eg: bats, auths, etc
 * {obj} filters        Current filter state.
 * {obj} flags          allDataAvailable, tutorialActive
 * {ary} intSet         An array of interactions saved and loaded in the table by the user
 * {ary} openRows       Array of entity ids whose table rows will be expanded on load.
 * {ary} rowData        Row data in table
 * {obj} rcrdsById      Focus records keyed by ID
 * {str} realmName      Stores Taxon view Realm name
 * {obj} selectedOpts   K: Combobox key V: value selected
 * {obj} taxaByLvl      Taxon records in curTree organized by level and keyed under their display name.
 * {str} userRole       Stores the role of the user.
 */
let tState = {};
/* --------------------------- FILTER STATE --------------------------------- */
/** Sends status for a new Sentry issue report. */
export function getCurrentFilterState() {
    return getActiveFilters();

    function getActiveFilters() {
        const st = table.getFilterState();
        Object.keys(st.table).forEach(col => {
            if (!st.table[col]) { delete st.table[col]; }});
        if (!Object.keys(st.table).length) { delete st.table; }
        if (!Object.keys(st.panel).length) { delete st.panel; }
        return st;
    }
}
/** ==================== PAGE INIT ========================================== */
/** Initializes the UI unless on mobile device.  */
function initDbPage () {
    if ($(window).width() < 1200 && $('body').data('env') != 'test') { return; } //Popup shown in oi.js
    requireCss();
    requireJs();
    ui.init();
    u.initComboboxes({'Focus': buildTable, 'View': Function.prototype});
    db.initDb();
    //The idb-util.initDb will call @initSearchStateAndTable once local database is ready.
}
/** Loads css files used on the search database page, using Encore webpack. */
function requireCss() {
    require('flatpickr/dist/flatpickr.min.css')
    require('../../styles/css/lib/ag-grid.css');
    require('../../styles/css/lib/theme-fresh.css');
    require('../../styles/css/lib/selectize.default.css');
    require('../../styles/css/search_db.css');
    require('../../styles/css/moz-styles.css');
    require('../../styles/pages/db/db.styl');
    require('../../styles/pages/db/map.styl');
    require('../../styles/pages/db/forms.styl');
}
function requireJs() {
    require('leaflet-control-geocoder');
    require('../libs/selectize.js');
}
/**
 * The first time a browser visits the search page, or when local data is reset,
 * all data is downloaded and stored from the server. The intro-walkthrough is
 * shown on first visit.
 */
export function showIntroAndLoadingMsg(resettingData) {
    ui.updateUiForDatabaseInit();
    ui.selectInitialSearchFocus('taxa', resettingData);
    if (resettingData) { return $('#sel-view')[0].selectize.clear('silent'); }
    tutorial.startWalkthrough('taxa');
}
/** After new data is downlaoded, the search state is initialized and page loaded. */
export function initSearchStateAndTable(focus = 'taxa', isAllDataAvailable = true) {/*Perm-log*/console.log('   *//initSearchStateAndTable. focus? [%s], allDataAvailable ? [%s]', focus, isAllDataAvailable);
    setTableInitState(focus, isAllDataAvailable);
    ui.selectInitialSearchFocus(focus);
    if ($('body').data('env') === 'test' && isAllDataAvailable === false) { return; }
    buildTable();
}
function setTableInitState(focus, isAllDataAvailable) {
    resetFilterPanel(focus);
    resetTableParams(focus);
    tState.flags.allDataAvailable = isAllDataAvailable;
}
export function onDataDownloadComplete () {
    if ($('.map-dsbl').prop('disabled')) { return window.setTimeout(onDataDownloadComplete, 500); }
    ui.onDataDownloadCompleteEnableUiFeatures();
}
/* ================== TABLE "STATE" ========================================= */
export function accessTableState() {
    return {
        get: getTableState,
        set: setTableState
    };
}
/** Returns table state to requesting module. */
//Todo: remove the redundant second param
function getTableState(k, keys) {                                               //console.log('getTableState. params? ', arguments);
    return k && Array.isArray(k) ? getStateObj(k) : k ? tState[k] :
        keys ? getStateObj(keys) : tState;
}
function getStateObj(keys) {
    const obj = {};
    keys.forEach(k => obj[k] = tState[k] || null);                            //console.log('stateObj = %O', obj)
    return obj;
}
function setTableState(stateObj) {                                              //console.log('setTableState. stateObj = %O', stateObj);
    Object.keys(stateObj).forEach(k => { tState[k] = stateObj[k]; })
}
/*---------------------- STATE MANAGMENT -------------------------------------*/
/** Resets on focus change. */
function resetTableParams(focus) {
    if (focus) { return Promise.resolve(resetTblParams(focus)); }
    return Promise.resolve(u.getData('curFocus').then(resetTblParams));
}
function resetTblParams(focus) {
    const intSet =  tState.intSet;
    const prevApi = tState.api; //will be destroyed before new table loads. Visually jarring to remove before the new one is ready.
    const flags = tState.flags ? tState.flags : {};
    tState = {
        api: prevApi,
        curFocus: focus,
        flags: flags,
        openRows: [],
        selectedOpts: {},
        userRole: $('body').data("user-role")
    };
    if (intSet) { tState.intSet = intSet; }
}
/** Resets storage props, buttons, and filters. */
export function resetTableState() {
    resetCurTreeStorageProps();
    ui.setTreeToggleData(false);
    ui.clearFilterUi();
    table.resetFilterState();
}
export function resetCurTreeStorageProps() {
    delete tState.curTree;
    tState.selectedOpts = {};
}
/* ==================== TABLE (RE)BUILDS ============================================================================ */
export function reloadTableWithCurrentFilters() {
    const filters = table.getFilterState();
    ui.reloadTableThenApplyFilters(filters);
}
/**
 * Table-rebuild entry point after local database updates, filter clears, and
 * after edit-form close.
 */
export function resetDataTable(focus) {                              /*Perm-log*/console.log('   //resetting search table. Focus ? [%s]', focus);
    resetTableState();
    return buildTable(focus)
        .then(ui.updateUiForTableView);
}
export function buildTable(f, view = false) {
    if (f === '') { return Promise.resolve(); } //Combobox cleared by user
    const focus = f ? f : u.getSelVal('Focus');                    /*Perm-log*/console.log("   //select(ing)SearchFocus = [%s], view ? [%s]", focus, view);
    resetTableState();
    return updateFocusAndBuildTable(focus, view);
}
/** Updates the top sort (focus) of the data table: 'taxa', 'locs' or 'srcs'. */
function updateFocusAndBuildTable(focus, view) {                                //console.log("updateFocusAndBuildTable called. focus = [%s], view = [%s", focus, view)
    if (focus === tState.curFocus) { return buildDataTable(focus, view); }
    return onFocusChanged(focus, view)
        .then(() => buildDataTable(focus, view));
}
function onFocusChanged(focus, view) {
    u.setData('curFocus', focus);
    u.setData('curView', view);
    resetFilterPanel(focus);
    return resetTableParams(focus);
}
function resetFilterPanel(focus) {
    ui.updateFilterPanelHeader(focus);
    $('#focus-filters').empty();
}
function buildDataTable(focus, view, fChange) {
    const builders = {
        'locs': table.buildLocTable, 'srcs': table.buildSrcTable,
        'taxa': table.buildTxnTable
    };
    return builders[focus](view);
}
export function showTodaysUpdates(focus) {
    table.showTodaysUpdates(focus);
}
/* -------------------------- LOCATION -------------------------------------- */
export function buildLocTable() {
    return table.buildLocTable(...arguments);
}
export function onLocViewChange() {
    return table.onLocViewChange(...arguments);
}
export function rebuildLocTable() {
    return table.rebuildLocTable(...arguments);
}
/** -------- LOCATION MAP ----------------------- */
/** Filters the data-table to the location selected from the map view. */
export function showLocInDataTable(loc) {                          /*Perm-log*/console.log("       --Showing Location in Table");
    ui.updateUiForTableView();
    u.setSelVal('View', 'tree', 'silent');
    rebuildLocTable([loc.id])
    .then(ui.updateFilterStatusMsg)
    .then(ui.enableClearFiltersButton);
}
/** Initializes the google map in the data table. */
export function buildLocMap() {
    ui.updateUiForMapView();
    if (tState.intSet) { return showLocsInSetOnMap(); }
    map.initMap(tState.rcrdsById);
    return Promise.resolve();
}
/**
 * When displaying a user-made set "list" of interactions focused on locations in
 * "Map Data" view, the locations displayed on the map are only those in the set
 * and their popup data reflects the data of the set.
 */
function showLocsInSetOnMap() {
    tree.buildLocTree(getTopRegionIds())
    .then(getGeoJsonAndShowLocsOnMap);
}
function getGeoJsonAndShowLocsOnMap(tree) {
    map.initMap(tState.rcrdsById, tree);
}
/** Switches to map view and centeres map on selected location. */
export function showLocOnMap(locId, zoom) {                          /*Perm-log*/console.log("       --Showing Location on Map");
    if ($('#shw-map').prop('loading')) { return; }
    ui.updateUiForMapView();
    u.setSelVal('View', 'map', 'silent');
    map.showLoc(locId, zoom, tState.rcrdsById);
    $('#tbl-filter-status').html('No Active Filters.');
}
/* ---------------------------- SOURCE -------------------------------------- */
export function onSrcViewChange() {
    return table.onSrcViewChange(...arguments);
}
export function buildSrcTable() {
    return table.buildSrcTable(...arguments);
}
/* ----------------------------- TAXON -------------------------------------- */
export function onTxnViewChange() {
    return table.onTxnViewChange(...arguments);
}

export function buildTxnTable() {
    return table.buildTxnTable(...arguments);
}

export function rebuildTxnTable() {
    return table.rebuildTxnTable(...arguments);
}
