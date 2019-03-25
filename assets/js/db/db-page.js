/**
 * The Database Search page entry point. The data table is built to display the 
 * eco-interaction records organized by a selected "focus": taxa (grouped further 
 * by realm: bat, plant, arthropod), locations, or sources (grouped by either 
 * authors, publications, or publishers). The data map displays interactions
 * geographically. Filtered interactions can be viewed in either form. 
 * 
 * Exports:
 *     accessTableState
 *     onDataReset
 *     initSearchPage
 *     initDataTable
 *     showLocOnMap
 *
 * REFACT:: REORGANIZE IMPORTS
 */
import * as _u from './util.js';
import * as db_sync from './db-sync.js';
import * as db_forms from './db-forms.js';
import * as db_map from './db-map.js';
import * as db_tips from './tips.js';
import * as db_filters from './db-table/db-filters.js';
import * as build_tbl_data from './db-table/build-table-data.js'; //REFACT: BETTER NAME
import * as data_tree from './db-table/build-data-tree.js';
import * as init_tbl from './db-table/init-table.js';
import * as db_ui from './db-table/db-ui.js';
import * as db_csv from './db-table/csv-data.js';

/**
 * dataStorage = window.localStorage (sessionStorage for tests)
 * tblState = Stores table state params needed across multiple modules.
 * dataKey = String checked in data storage to indicate whether the stored 
 *      data should be cleared and redownloaded. REFACT:: DB_SYNC
 */
let dataStorage; //REFACT: MOVE INTO UTIL OR DBSYNC
/**
 * Stores table state params needed across multiple modules. 
 * {obj} api            Ag-grid API (available after table-init complete)
 * {str} curFocus       Focus of the data in table: taxa, srcs, locs
 * {str} curRealm       Sub-sort of table data. Eg: bats, auths, etc 
 * {ary} openRows       Array of entity ids whose table rows will be expanded on load.
 * {ary} rowData        Row data in table
 * {obj} rcrdsById      Focus records keyed by ID
 * {obj} selectedOpts   K: Combobox key V: value selected 
 * {obj} taxaByLvl      Taxon records in curTree organized by level and keyed under their display name.
 * {str} userRole       Stores the role of the user.
 */
let tblState = {};
const dataKey = 'A life without cause is a life without effect!!!!';             console.log(dataKey);

requireCss();
initDbPage();

/** Loads css files used on the search database page, using Encore webpack. */
function requireCss() {
    require('../../css/lib/ag-grid.css');
    require('../../css/lib/theme-fresh.css');
    require('../../css/lib/confirmDate.css');
    require('../../css/lib/flatpickr.min.css');    
    require('../../css/lib/selectize.default.css');
    require('../../css/search_db.css');
}
function initDbPage () {    
    dataStorage = _u.getDataStorage();  
    db_sync.init();
    clearDataStorageCheck();
    _u.showPopUpMsg('Loading...');
    addDomEventListeners();
    _u.authDependentInit();
    initSearchState();
}
/** --------------- local storage methods ------------------------------- */
/** If data storage needs to be cleared, the datakey is updated */ 
function clearDataStorageCheck() {
    if (dataStorage && !dataStorage.getItem(dataKey)) {  
        clearDataStorage(dataKey);
    }
}
function clearDataStorage(dataKey) {  
    dataStorage.clear();
    _u.populateStorage(dataKey, true);
}
/** 
 * When the stored data is reset from another file, the loading data popup 
 * message is shown and the dataKey is restored.
 * Refactor to combine with: onDataReset
 */
export function onDataReset(prevFocus) {
    db_ui.showLoadingDataPopUp();
    _u.populateStorage(dataKey, true);
    _u.populateStorage('curFocus', prevFocus);
}
/** ------------- Page Init --------------------------------------------- */
/**
 * The first time a browser visits the search page, all data is downloaded
 * from the server and stored in dataStorage. The intro-walkthrough is shown 
 * for the user @showIntroWalkthrough.
 */
export function initSearchPage() {
    db_ui.showLoadingDataPopUp();
    db_tips.startWalkthrough(tblState.curFocus);
}
function addDomEventListeners() {
    db_filters.addDomEventListeners();
    db_ui.addDomEventListeners();
    $('button[name="reset-tbl"]').click(resetDataTable);
}
/*-------------------- Table "State" Managment Methods -------------------------*/
export function accessTableState() {
    return {
        get: getTableState,
        set: setTableState
    };
}
/** Returns table state to requesting module. */
function getTableState(k, keys) {                                                     //console.log('getTableState. params? ', arguments);
    return k ? tblState[k] : keys ? getStateObj(keys) : tblState;
}
function getStateObj(keys) {
    const obj = {};
    keys.forEach(k => obj[k] = tblState[k]);  console.log('stateObj = %O', obj)
    return obj;
}
function setTableState(stateObj) {                                              //console.log('setTableState. stateObj = %O', stateObj);
    Object.keys(stateObj).forEach(k => { tblState[k] = stateObj[k]; })
}
/*-------------------- Top "State" Managment Methods -------------------------*/
function initSearchState() {
    resetTableParams();
    db_filters.toggleTimeUpdatedFilter('disable');
    db_filters.resetFilterStatusBar();      
    db_ui.setUpFutureDevInfoBttn();
    selectInitialSearchFocus();
} 
/** Resets on focus change. */
function resetTableParams() {  
    tblState = {
        curFocus: getResetFocus(),
        openRows: [],
        selectedOpts: {},
        userRole: $('body').data("user-role")
    };
}
function getResetFocus() {
    const foci = ['locs', 'srcs', 'taxa'];
    const storedFocus = dataStorage.getItem('curFocus');
    return foci.indexOf(storedFocus) !== -1 ? storedFocus : 'taxa';
}
/** Selects either Taxon, Location or Source in the table-focus dropdown. */
function selectInitialSearchFocus() {                                           //console.log('--------------selectInitialSearchFocus')
    $('#filter-opts').show(400);  
    _u.initCombobox('Focus');
    _u.setSelVal('Focus', tblState.curFocus, 'silent');
    $('#sort-opts').show(400);
    selectSearchFocus();
}
/* ==================== TAXON SEARCH Search ============================================================================= */
/**
 * Get all data needed for the Taxon-focused table from data storage and send 
 * to @initTaxonSearchUi to begin the data-table build.  
 */
function buildTaxonTable() {                                                    //console.log("Building Taxon Table.");
    const data = _u.getDataFromStorage(['realm', 'taxon']); 
    if (data) { 
        tblState.rcrdsById = data.taxon;
        db_ui.initTaxonSearchUi(data);
        startTxnTableBuildChain(storeAndReturnRealm());
    } else { console.log("Error loading taxon data from storage."); }
}
/** Event fired when the taxon realm select box has been changed. */
export function onTaxonRealmChange(val) {  
    if (!val) { return; }
    resetTaxonRealm(val);
}
function resetTaxonRealm(val) {                                                 //console.log('resetTaxonRealm')
    const realmTaxon = storeAndReturnRealm(val);
    resetCurTreeState();
    rebuildTaxonTree(realmTaxon);
}
/**
 * Gets the currently selected taxon realm's id, gets the record for the taxon, 
 * stores both it's id and level in the global focusStorag, and returns 
 * the taxon's record.
 */
function storeAndReturnRealm(val) {
    const realmId = val || getSelValOrDefault(_u.getSelVal('Taxon Realm'));     //console.log('storeAndReturnRealm. val [%s], realmId [%s]', val, realmId)
    const realmTaxonRcrd = _u.getDetachedRcrd(realmId, tblState.rcrdsById);     //console.log("realmTaxon = %O", realmTaxonRcrd);
    const realmLvl = realmTaxonRcrd.level;
    _u.populateStorage('curRealm', realmId);
    tblState.curRealm = realmId;
    tblState.realmLvl = realmLvl;
    return realmTaxonRcrd;
}
/** This catches errors in realm value caused by exiting mid-tutorial.  */
function getSelValOrDefault(val) {
    return !val ? 3 : isNaN(val) ? 3 : val;
}
/**
 * Builds a taxon data-tree for the passed taxon. The taxon levels present in 
 * the tree are stored or updated before continuing @getInteractionsAndFillTable.
 * Note: This is the entry point for filter-related taxon-table rebuilds.
 */
export function rebuildTaxonTree(topTaxon, filtering) {     //REFACT:: CHANGE NAME TO REBUILDTAXONTABLE                    //console.log("realmTaxon=%O", realmTaxon)
    clearPreviousTable();
    startTxnTableBuildChain(topTaxon, filtering)
}
/**
 * Builds a family tree of taxon data with passed taxon as the top of the tree, 
 * transforms that data into the format used for ag-grid and loads the grid, aka table. 
 * The top taxon's id is added to the global focus storage obj's 'openRows' 
 * and will be expanded on table load. 
 */
function startTxnTableBuildChain(topTaxon, filtering) {
    tblState.openRows = [topTaxon.id.toString()];                                //console.log("openRows=", openRows)
    build_tbl_data.transformTaxonDataAndLoadTable(
        data_tree.buildTxnTree(topTaxon, filtering), tblState);
    db_ui.loadTaxonComboboxes(tblState);
}
/* ==================== Location Search ============================================================================= */
function buildLocationTable(view) {
    const data = getLocData();
    if (data) { 
        addLocDataToTableParams(data);
        db_ui.initLocSearchUi(data, view);
        updateLocView(view);
    } else { console.log('Error loading location data from storage.'); }
}
function getLocData() {
    const locDataStorageProps = [ 'location', 'topRegionNames' ]; //'locationType', 
    return _u.getDataFromStorage(locDataStorageProps);
}
function addLocDataToTableParams(data) {
    tblState.rcrdsById = data.location;                                    
    tblState.data = data;
}
// } /* End buildLocViewHtml */
export function onLocViewChange(val) {
    if (!val) { return; }
    updateLocView(val);
}
/** 
 * Event fired when the source realm select box has been changed.
 * An optional calback (cb) will redirect the standard map-load sequence.
 */
function updateLocView(v) {                                                     
    const val = v || _u.getSelVal('Loc View');                                  console.log('updateLocView. view = [%s]', val);
    resetLocUi(val);
    resetCurTreeState();
    db_ui.resetToggleTreeBttn(false);
    showLocInteractionData(val);
}
function resetLocUi(view) { 
    _u.clearCol2();
    clearPreviousTable();
    if (view === 'tree') { db_ui.updateUiForTableView(); }
}
/** 
 * Starts the Table build depending on the view selected.
 */
function showLocInteractionData(view) {                                         //console.log('showLocInteractionData. view = ', view);
    _u.populateStorage('curRealm', JSON.stringify(view));                      
    return view === 'tree' ? rebuildLocTree() : buildLocMap();
}
/** ------------ Location Table Methods ------------------------------------- */
/**
 * Rebuilds loc tree with passed location, or the default top regions, as the
 * base node(s) of the new tree with all sub-locations nested beneath @buildLocTree.
 * Resets 'openRows' and clears tree. Continues @buildLocTableTree.
 * Note: This is also the entry point for filter-related table rebuilds.
 */
export function rebuildLocTree(topLoc) {   //REFACT:: CHANGE NAME TO REBUILDLOCTABLE                                     //console.log("-------rebuilding loc tree. topLoc = %O", topLoc);
    const topLocs = topLoc || getTopRegionIds();
    tblState.openRows = topLocs.length === 1 ? topLocs : [];
    clearPreviousTable();
    startLocTableBuildChain(topLocs);
}
function getTopRegionIds() {
    const ids = [];
    const regions = tblState.data.topRegionNames;
    for (let name in regions) { ids.push(regions[name]); } 
    return ids;
}
function startLocTableBuildChain(topLocs) {
    build_tbl_data.transformLocDataAndLoadTable(
        data_tree.buildLocTree(topLocs), tblState);
    db_ui.loadSearchLocHtml(tblState);
}
/** ------------ Location Map Methods --------------------------------------- */
/** Filters the data-table to the location selected from the map view. */
export function showLocInDataTable(loc) {                                       //console.log('showing Loc = %O', loc);
    db_ui.updateUiForTableView();
    rebuildLocTree([loc.id]);
    _u.setSelVal('Loc View', 'tree', 'silent');
}
/** Initializes the google map in the data table. */
function buildLocMap() {    
    db_ui.updateUiForMapView();       
    db_map.initMap(tblState.rcrdsById);           
}
/** Switches to map view and centeres map on selected location. */
export function showLocOnMap(geoJsonId, zoom) {
    db_ui.updateUiForMapView();
    _u.clearCol2();
    _u.setSelVal('Loc View', 'map', 'silent');
    db_map.showLoc(geoJsonId, zoom, tblState.rcrdsById);
}
/* ==================== Source Search =============================================================================== */
/**
 * Get all data needed for the Source-focused table from data storage and send  
 * to @initSrcSearchUi to begin the data-table build.  
 */
function buildSourceTable() {
    const data = _u.getDataFromStorage('source');
    if (data) { 
        tblState.rcrdsById = data;
        db_ui.initSrcSearchUi(data);
        onSrcRealmChange(tblState.curRealm);
    } else { console.log('Error loading source data from storage.'); }
}
/** Event fired when the source realm select box has been changed. */
export function onSrcRealmChange(val) {                                         //console.log('-------- SrcRealmChange. [%s]', val)
    if (!val) { return; }
    resetSourceRealm(val);
}
function resetSourceRealm(val) {
    clearPreviousTable();
    resetCurTreeState();
    db_ui.resetToggleTreeBttn(false);
    startSrcTableBuildChain(val);
}
function startSrcTableBuildChain(val) {
    storeSrcRealm(val);
    db_ui.buildSrcSearchUiAndTable(tblState.curRealm);
    build_tbl_data.transformSrcDataAndLoadTable(
        data_tree.buildSrcTree(tblState.curRealm), tblState);
}
function storeSrcRealm(val) {  
    const realmVal = val || _u.getSelVal('Source Type');                        //console.log("storeAndReturnCurRealmRcrds. realmVal = ", realmVal)
    _u.populateStorage('curRealm', JSON.stringify(realmVal));
    tblState.curRealm = realmVal;    
}
/*----------------- Table Manipulation ------------------------------------------*/
/**  Table-rebuild entry point after form-window close.  */
function resetDataSearchTable(focus) {                                          //console.log('resetting search table.')
    db_ui.resetToggleTreeBttn(false);
    db_filters.resetFilterStatusBar();
    if ($('#shw-chngd')[0].checked) { db_filters.toggleTimeUpdatedFilter('disable'); }
    selectSearchFocus(focus);
}
/** Refactor: combine with resetDataSearchTable. */
export function initDataTable(focus) {                                          //console.log('resetting search table.')
    resetDataSearchTable(focus);
    db_ui.updateUiForTableView();
}
export function selectSearchFocus(f) { 
    const focus = f || _u.getSelVal('Focus');                                      console.log("---select(ing)SearchFocus = ", focus); 
    if (!focus) { return; }
    const builderMap = { 
        'locs': buildLocationTable, 'srcs': buildSourceTable,
        'taxa': buildTaxonTable 
    };  
    if (!dataStorage.getItem('pgDataUpdatedAt')) { return; } 
    updateFocusAndBuildTable(focus, builderMap[focus]); 
}
/**
 * Updates the top sort (focus) of the data table, either 'taxa', 'locs' or 'srcs'.
 *
 * REFACT NOTE:: load.js
 */
function updateFocusAndBuildTable(focus, tableBuilder) {                        //console.log("updateFocusAndBuildTable called. focus = [%s], tableBuilder = %O", focus, tableBuilder)
    clearPreviousTable();
    if ($('#shw-chngd')[0].checked) { $('#shw-chngd').click(); } //resets updatedAt table filter
    if (focusNotChanged(focus)) { return tableBuilder(); }                      //console.log('--- Focus reset to [%s]', focus);
    _u.populateStorage('curFocus', focus);
    clearOnFocusChange(tableBuilder);
} 
function focusNotChanged(focus) {
    return focus === tblState.curFocus;
}
function clearOnFocusChange(tableBuilder) {
    dataStorage.populateStorage('curRealm', false);
    db_filters.resetFilterStatusBar();
    resetTableParams();
    db_ui.resetToggleTreeBttn(false); 
    clearPastHtmlOptions(tableBuilder); 
}
/** Called seperately so @emptySearchOpts is called once. */
function clearPastHtmlOptions(tableBuilder) {    
    $('#opts-col2').fadeTo(100, 0);
    $('#opts-col1').fadeTo(100, 0, emptySearchOpts);
    
    function emptySearchOpts() {                                                //console.log("emptying search options");
        $('#opts-col2').empty();
        $('#sort-opts').empty();
        $('#opts-col1, #opts-col2').fadeTo(0, 1);
        db_ui.updateUiForTableView();
        tableBuilder();
    }
} /* End clearPastHtmlOptions */
function clearPreviousTable() {                                                 //console.log("clearing table");
    if (tblState.api) { tblState.api.destroy(); }  
    $('#map').hide(); //Clears location map view
    $('#search-tbl').show();
}
/**
 * ResetData button: Resets table state to top focus options: Taxon and source 
 * are reset at current realm; locations are reset to the top regions.
 *
 * REFACT NOTE:: UTILITY
 */
function resetDataTable() {                                                     //console.log("---reseting table---")
    const resetMap = { taxa: resetTaxonRealm, locs: rebuildLocTree, srcs: resetSourceRealm };
    resetCurTreeState();
    resetMap[tblState.curFocus](); 
} 
/** Resets storage props, buttons and filter status. */
function resetCurTreeState() {                                                  //console.log('\n### Restting tree state ###')
    resetCurTreeStorageProps();
    db_ui.resetToggleTreeBttn(false);
    if ($('#shw-chngd')[0].checked) { db_filters.toggleTimeUpdatedFilter('disable'); }     //resets updatedAt table filter
    db_filters.updateFilterStatusMsg();
}
/** 
 * Deltes the props uesd for only the displayed table in the global tblState.
 */
function resetCurTreeStorageProps() {
    delete tblState.curTree;
    tblState.selectedOpts = {};
    db_filters.resetTableStateParams();
}