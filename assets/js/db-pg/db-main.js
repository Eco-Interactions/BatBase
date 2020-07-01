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
import * as alert from '../app/misc/alert-issue.js';
import * as u from './util/util.js';
import * as _tree from './table/format-data/data-tree.js';
import * as filter from './filters/filters-main.js';
import * as _map from './map/map-main.js';
import * as ui from './pg-ui/ui-main.js';
import * as db from './local-data/local-data-main.js';
import * as format from './table/format-data/aggrid-format.js'; 
import * as modal from '../misc/intro-modals.js';
import * as form from './forms/forms-main.js';
import * as tutorial from './tutorial/db-tutorial.js';

if (window.location.pathname.includes('search')) {
    initDbPage();
}
/** ==================== FACADE ============================================= */
function moduleMethod(funcName, mod, modName, params = []) {
    try {
        return mod[funcName](...params);
    } catch(e) {
        alertIssue('facadeErr', {module: modName, caller: 'db-main', called: funcName, error: e.toString(), errMsg: e.message});
        if ($('body').data('env') === 'prod') { return; }
        console.error('[%s] module call [%s] failed.  params = %O, err = %O', modName, funcName, params, e);
    }
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
    return moduleMethod(funcName, filter, 'filter', params);
}
export function _form(funcName, params = []) {  
    return moduleMethod(funcName, form, 'form', params);
}
export function openDataEntryForm() {
    ui.showPopupMsg();
    form.initNewDataForm()
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
        const st = filter.getFilterState();  
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
    setTableInitState(isAllDataAvailable);      
    ui.selectInitialSearchFocus(focus);
    if ($('body').data('env') === 'test' && isAllDataAvailable === false) { return; }
    buildTable()
    .then(ui.updateFilterPanelHeader.bind(null, focus));
} 
function setTableInitState(isAllDataAvailable) {
    resetFilterPanel('taxa');
    resetTableParams('taxa');
    filter.toggleDateFilter('disable');
    // if ($('#shw-chngd')[0].checked) { filter.toggleDateFilter('disable'); }//init the updatedAt table filter
    tState.flags.allDataAvailable = isAllDataAvailable; 
}
export function enableMap() {
    $('#shw-map').data('loaded', true).prop('disabled', false).fadeTo('fast', 1);
    $('.map-ico').fadeTo('fast', 1);
}
/* ================== TABLE "STATE" ========================================= */
export function accessTableState() {
    return {
        get: getTableState,
        set: setTableState
    };
}
/** Returns table state to requesting module. */
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
    return Promise.resolve(u.getData('curFocus').then(f => resetTblParams(f)));
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
function resetTableState() {                                                  
    resetCurTreeStorageProps();
    ui.setTreeToggleData(false);
    ui.clearFilterUi();
    filter.resetFilterState();
}
function resetCurTreeStorageProps() {
    delete tState.curTree;
    tState.selectedOpts = {};
}
/* ==================== TABLE (RE)BUILDS ============================================================================ */
function loadTbl(tblName, rowData) {
    return require('./table/init-table.js').default(tblName, rowData, tState);
}
export function reloadTableWithCurrentFilters() {  
    const filters = filter.getFilterState();
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
        'locs': buildLocationTable, 'srcs': buildSourceTable,
        'taxa': buildTaxonTable 
    };  
    return builders[focus](view);
}
export function showTodaysUpdates(focus) {
    filter.showTodaysUpdates(focus);
}
/* ==================== LOCATION SEARCH ============================================================================= */
function buildLocationTable(v) {                                    /*Perm-log*/console.log("       --Building Location Table. View ? [%s]", v);
    const view = v || 'tree';
    return u.getData(['location', 'topRegionNames']).then(beginLocationLoad);
    
    function beginLocationLoad(data) {
        addLocDataToTableParams(data);
        ui.initLocViewOpts(view);
        return updateLocView(view);
    }
}
function addLocDataToTableParams(data) {
    tState.rcrdsById = data.location;                                    
    tState.data = data;
}
export function onLocViewChange(val) {
    if (!val) { return; }
    updateLocView(val);
}
/** 
 * Event fired when the source view select box has been changed.
 * An optional calback (cb) will redirect the standard map-load sequence.
 */
function updateLocView(v) {                                                     
    const val = v || u.getSelVal('View');                          /*Perm-log*/console.log('           --updateLocView. view = [%s]', val);
    resetLocUi(val);
    resetTableState();
    ui.setTreeToggleData(false);
    return showLocInteractionData(val);
}
function resetLocUi(view) { 
    ui.fadeTable();
    if (view === 'tree') { ui.updateUiForTableView(); }
}
function showLocInteractionData(view) {                                         //console.log('showLocInteractionData. view = ', view);
    u.setData('curView', view);                      
    return view === 'tree' ? rebuildLocTable() : buildLocMap();
}
/** --------------- LOCATION TABLE ------------------------------------------ */
/**
 * Rebuilds loc tree with passed location, or the default top regions, as the
 * base node(s) of the new tree with all sub-locations nested beneath @buildLocTree.
 * Resets 'openRows' and clears tree. Continues @buildLocTableTree.
 * Note: This is also the entry point for filter-related table rebuilds.
 */
export function rebuildLocTable(topLoc, textFltr) {                 /*Perm-log*/console.log("       --rebuilding loc tree. topLoc = %O", topLoc);
    const topLocs = topLoc || getTopRegionIds();    
    resetCurTreeStorageProps();
    tState.openRows = topLocs.length === 1 ? topLocs : [];
    ui.fadeTable();
    return startLocTableBuildChain(topLocs, textFltr);
}
function getTopRegionIds() {
    const ids = [];
    const regions = tState.data.topRegionNames;
    for (let name in regions) { ids.push(regions[name]); } 
    return ids;
}
function startLocTableBuildChain(topLocs, textFltr) {               
    return _tree.buildLocTree(topLocs, textFltr)
        .then(tree => format.buildLocRowData(tree, tState))
        .then(rowData => loadTbl('Location Tree', rowData))
        .then(() => filter.loadLocFilters(tState));
}
/** -------------------- LOCATION MAP --------------------------------------- */
/** Filters the data-table to the location selected from the map view. */
export function showLocInDataTable(loc) {                          /*Perm-log*/console.log("       --Showing Location in Table");
    ui.updateUiForTableView();
    u.setSelVal('View', 'tree', 'silent');
    rebuildLocTable([loc.id]);
}
/** Initializes the google map in the data table. */
function buildLocMap() {    
    ui.updateUiForMapView();      
    if (tState.intSet) { return showLocsInSetOnMap(); }
    _map.initMap(tState.rcrdsById);           
    return Promise.resolve();
}
/**
 * When displaying a user-made set "list" of interactions focused on locations in 
 * "Map Data" view, the locations displayed on the map are only those in the set
 * and their popup data reflects the data of the set. 
 */
function showLocsInSetOnMap() {
    _tree.buildLocTree(getTopRegionIds())
    .then(getGeoJsonAndShowLocsOnMap);
}
function getGeoJsonAndShowLocsOnMap(tree) { 
    _map.initMap(tState.rcrdsById, tree);
}
/** Switches to map view and centeres map on selected location. */
export function showLocOnMap(locId, zoom) {                          /*Perm-log*/console.log("       --Showing Location on Map");
    if ($('#shw-map').prop('disabled')) { return; }
    ui.updateUiForMapView();
    u.setSelVal('View', 'map', 'silent'); 
    _map.showLoc(locId, zoom, tState.rcrdsById);
    $('#tbl-filter-status').html('No Active Filters.');
}
/* ==================== SOURCE SEARCH =============================================================================== */
/**
 * Get all data needed for the Source-focused table from data storage and send  
 * to @initSrcViewOpts to begin the data-table build.  
 */
function buildSourceTable(v) {                                      /*Perm-log*/console.log("       --Building Source Table. view ? [%s]", v);
    if (v) { return getSrcDataAndBuildTable(v); }
    return u.getData('curView', true).then(storedView => {
        const view = storedView || 'pubs';
        return getSrcDataAndBuildTable(view);
    });
}
function getSrcDataAndBuildTable(view) {
    return u.getData('source').then(srcs => {
        tState.rcrdsById = srcs;
        ui.initSrcViewOpts(view);
        return startSrcTableBuildChain(view); 
    });
}
/** Event fired when the source view select box has been changed. */
export function onSrcViewChange(val) {                              /*Perm-log*/console.log('       --onSrcViewChange. view ? [%s]', val);
    if (!val) { return; }
    $('#focus-filters').empty();
    return rebuildSrcTable(val);
}
function rebuildSrcTable(val) {                                     /*Perm-log*/console.log('       --rebuildSrcTable. view ? [%s]', val)
    ui.fadeTable();
    resetTableState();
    ui.setTreeToggleData(false);
    return startSrcTableBuildChain(val);
}
function startSrcTableBuildChain(val) {
    storeSrcView(val);
    return _tree.buildSrcTree(tState.curView)
        .then(tree => format.buildSrcRowData(tree, tState))
        .then(rowData => loadTbl('Source Tree', rowData, tState))
        .then(() => filter.loadSrcFilters(tState.curView));
}
function storeSrcView(val) {  
    const viewVal = val || u.getSelVal('View');                                //console.log("storeAndReturnCurViewRcrds. viewVal = ", viewVal)
    u.setData('curView', viewVal);
    tState.curView = viewVal;    
}
/* ==================== TAXON SEARCH  =============================================================================== */
/**
 * Get all data needed for the Taxon-focused table from data storage and send 
 * to @initTxnViewOpts to begin the data-table build.  
 */
function buildTaxonTable(v) {                                       
    if (v) { return getTxnDataAndBuildTable(v); }
    return u.getData('curView', true).then(storedView => {
        const view = storedView || getSelValOrDefault(u.getSelVal('View'));/*Perm-log*/console.log("       --Building [%s] Taxon Table", view);    
        return getTxnDataAndBuildTable(view);
    });
}
function getTxnDataAndBuildTable(view) {
    return u.getData('taxon').then(beginTaxonLoad.bind(null, view));
}
function beginTaxonLoad(realmId, taxa) {                                                 
    tState.rcrdsById = taxa;                                                    //console.log('Building Taxon Table. taxa = %O', u.snapshot(taxa));
    const realmTaxon = storeAndReturnRealmRcrd(realmId);
    ui.initTxnViewOpts(realmTaxon.id, tState.flags.allDataAvailable);
    return startTxnTableBuildChain(realmTaxon);
}
/** Event fired when the taxon view select box has been changed. */
export function onTxnViewChange(val) {                              /*Perm-log*/console.log('       --onTxnViewChange. [%s]', val)
    if (!val) { return; }
    $('#focus-filters').empty();  
    buildTxnTable(val);
}
function buildTxnTable(val) {                                                   
    const realmTaxon = storeAndReturnRealmRcrd(val);
    resetTableState();
    return rebuildTxnTable(realmTaxon);
}
/**
 * Gets the currently selected taxon realm/view's id, gets the record for the taxon, 
 * stores both it's id and level in the global focusStorage, and returns 
 * the taxon's record.
 */
function storeAndReturnRealmRcrd(val) {
    const realmId = val || getSelValOrDefault(u.getSelVal('View'));/*dbug-log*///console.log('storeAndReturnView. val [%s], realmId [%s]', val, realmId)
    const realmTaxonRcrd = u.getDetachedRcrd(realmId, tState.rcrdsById, 'taxon');/*dbug-log*///console.log("realmTaxon = %O", realmTaxonRcrd);
    updateRealmTableState(realmId, realmTaxonRcrd);
    return realmTaxonRcrd;
}
function updateRealmTableState(realmId, realmTaxonRcrd) {
    u.setData('curView', realmId);
    tState.realmLvl = realmTaxonRcrd.level;  
    tState.curView = realmId; 
}
/** This catches errors in realm value caused by exiting mid-tutorial. TODO */
function getSelValOrDefault(val) {
    const bats = $('body').data('env') == 'test' ? 1 : 2; //Default
    return !val ? bats : isNaN(val) ? bats : val; 
}
/**
 * Builds a taxon data-tree for the passed taxon. The taxon levels present in 
 * the tree are stored or updated before continuing @getInteractionsAndFillTable.
 * Note: This is the entry point for filter-related taxon-table rebuilds.
 */
export function rebuildTxnTable(topTaxon, filtering, textFltr) {    /*Perm-log*/console.log('       --rebuildTxnTable. topTaxon = %O, filtering ? [%s], textFilter ? [%s]', topTaxon, filtering, textFltr);
    if (!tState.api || tState.flags.allDataAvailable) { ui.fadeTable(); } 
    return startTxnTableBuildChain(topTaxon, filtering, textFltr)
}
/**
 * Builds a family tree of taxon data with passed taxon as the top of the tree, 
 * transforms that data into the format used for ag-grid and loads the grid, aka table. 
 * The top taxon's id is added to the global focus storage obj's 'openRows' 
 * and will be expanded on table load. 
 */
function startTxnTableBuildChain(topTaxon, filtering, textFltr) {
    tState.openRows = [topTaxon.id.toString()];
    return _tree.buildTxnTree(topTaxon, filtering, textFltr)
        .then(tree => format.buildTxnRowData(tree, tState))
        .then(rowData => loadTbl('Taxon Tree', rowData, tState))
        .then(() => filter.loadTxnFilters(tState, topTaxon.realm.pluralName));
}
