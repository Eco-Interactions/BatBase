/**
 * The Database Search page entry point. The data table is built to display the 
 * eco-interaction records organized by a selected "focus": taxa (grouped further 
 * by view: bat, plant, arthropod), locations, or sources (grouped by either 
 * authors, publications, or publishers). The data map displays interactions
 * geographically. Filtered interactions can be viewed in either form. 
 * 
 * Exports:                 Imported by:
 *     accessTableState         Almost everything else
 *     initSearchState          db_sync, util
 *     initDataTable            db_sync
 *     onLocViewChange          db_ui
 *     onDataReset
 *     onSrcViewChange          db_ui
 *     onTxnViewChange          db_ui
 *     rebuildLocTable          db-filters
 *     rebuildTxnTable          db-filters
 *     resetSearchState         save-ints
 *     resetDataTable           db-ui, save-ints    
 *     selectSearchFocus        db-filters
 *     showIntroAndLoadingMsg   db_sync
 *     showLocInDataTable
 *     showLocOnMap
 */
import * as _u from './util.js';
import * as data_tree from './db-table/build-data-tree.js';
import * as db_filters from './db-table/db-filters.js';
import * as db_map from './db-map/db-map.js';
import * as db_sync from './db-sync.js';
import * as db_tips from './tips.js';
import * as db_ui from './db-table/db-ui.js';
import * as frmt_data from './db-table/format-data.js'; 

/**
 * Stores table state params needed across multiple modules. 
 * {obj} api            Ag-grid API (available after table-init complete)
 * {obj} columnApi      Ag-grid Column API (available after table-init complete)
 * {str} curFocus       Focus of the data in table: taxa, srcs, locs
 * {str} curView        Sub-sort of table data. Eg: bats, auths, etc 
 * {ary} intSet         An array of interactions saved and loaded in the table by the user
 * {ary} openRows       Array of entity ids whose table rows will be expanded on load.
 * {ary} rowData        Row data in table
 * {obj} rcrdsById      Focus records keyed by ID
 * {obj} selectedOpts   K: Combobox key V: value selected 
 * {obj} taxaByLvl      Taxon records in curTree organized by level and keyed under their display name.
 * {str} userRole       Stores the role of the user.
 */
let tblState = {};
/** ------------- Page Init --------------------------------------------- */
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
/**
 * Initializes the database and UI. The util init method will call @initSearchState
 * after handling the initializing of the local data storage.
 */
function initDbPage () {    
    _u.init_db();
    db_ui.pg_init();
}
/**
 * The first time a browser visits the search page, all data is downloaded
 * from the server and stored in dataStorage. The intro-walkthrough is shown.
 */
export function showIntroAndLoadingMsg() {
    db_ui.showLoadingDataPopUp();
    _u.initComboboxes(['Focus', 'View']);
    db_tips.startWalkthrough('taxa');
}
/** After new data is downlaoded, the search state is initialized and page loaded. */
export function initSearchState() {                                             //console.log('initSearchState');
    resetState();      
    selectInitialSearchFocus();
} 
function resetState() {
    resetTableParams();
    db_filters.toggleTimeUpdatedFilter('disable');
    db_filters.resetTblFilters();
}
export function resetSearchState() {                                            //console.log('resetSearchState');
    resetTableParams();
    db_filters.toggleTimeUpdatedFilter('disable');
    db_filters.resetTblFilters();    
    selectSearchFocus();

}
/** Selects either Taxon, Location or Source in the table-focus dropdown. */
function selectInitialSearchFocus() {                                           //console.log('--------------selectInitialSearchFocus')
    const focus = tblState.curFocus || 'taxa';
    _u.initComboboxes(['Focus', 'View']);
    _u.replaceSelOpts('#search-focus', getFocusOpts())
    _u.setSelVal('Focus', focus, 'silent');
    selectSearchFocus();
}
function getFocusOpts() {
    return [
        { value: 'locs', text: 'Location' },
        { value: 'srcs', text: 'Source' },
        { value: 'taxa', text: 'Taxon' },
    ];
}
/* ================== Table "State" Methods ========================================================================= */
export function accessTableState() {
    return {
        get: getTableState,
        set: setTableState
    };
}
/** Returns table state to requesting module. */
function getTableState(k, keys) {                                               //console.log('getTableState. params? ', arguments);
    return k ? tblState[k] : keys ? getStateObj(keys) : tblState;
}
function getStateObj(keys) {
    const obj = {};
    keys.forEach(k => obj[k] = tblState[k] || null);                            //console.log('stateObj = %O', obj)
    return obj;
}
function setTableState(stateObj) {                                              //console.log('setTableState. stateObj = %O', stateObj);
    Object.keys(stateObj).forEach(k => { tblState[k] = stateObj[k]; })
}
/*-------------------- "State" Managment Methods -----------------------------*/
/** Resets on focus change. */
function resetTableParams(focus) {  
    const intSet =  tblState.intSet;
    tblState = {
        curFocus: focus || getResetFocus(),
        openRows: [],
        selectedOpts: {},
        userRole: $('body').data("user-role")
    };
    if (intSet) { tblState.intSet = intSet; }
}
function getResetFocus() {
    const foci = ['locs', 'srcs', 'taxa'];
    const storedFocus = _u.getDataFromStorage('curFocus');
    return foci.indexOf(storedFocus) !== -1 ? storedFocus : 'taxa';
}
/** Resets table state to top focus options for the selected view. */
export function resetDataTable() {                                              //console.log("---reseting table---")
    const resetMap = { taxa:  buildTxnTable, locs: rebuildLocTable, srcs: rebuildSrcTable };
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
/**  Table-rebuild entry point after form-window close.  */
export function initDataTable(focus) {                                          //console.log('resetting search table.')
    db_ui.resetToggleTreeBttn(false);
    db_filters.resetTblFilters();
    if ($('#shw-chngd')[0].checked) { db_filters.toggleTimeUpdatedFilter('disable'); }
    selectSearchFocus(focus);
    db_ui.updateUiForTableView();
}
export function selectSearchFocus(f) { 
    const focus = f ? f : _u.getSelVal('Focus');                                console.log("---select(ing)SearchFocus = ", focus); 
    const builderMap = { 
        'locs': buildLocationTable, 'srcs': buildSourceTable,
        'taxa': buildTaxonTable 
    };  
    if (!_u.getDataFromStorage('pgDataUpdatedAt')) { return; } 
    updateFocusAndBuildTable(focus, builderMap[focus]); 
}
/** Updates the top sort (focus) of the data table: 'taxa', 'locs' or 'srcs'. */
function updateFocusAndBuildTable(focus, tableBuilder) {                        //console.log("updateFocusAndBuildTable called. focus = [%s], tableBuilder = %O", focus, tableBuilder)
    clearPreviousTable();
    if (focusNotChanged(focus)) { return tableBuilder(); }                      //console.log('--- Focus reset to [%s]', focus);
    storeStateValue('curFocus', focus);
    clearOnFocusChange(focus, tableBuilder);
} 
function clearPreviousTable() {                                                 //console.log("clearing table");
    if (tblState.api) { tblState.api.destroy(); }  
    $('#map').hide(); //Clears location map view
    $('#search-tbl').show();
}
function focusNotChanged(focus) {
    return focus === tblState.curFocus;
}
function clearOnFocusChange(focus, tableBuilder) {
    storeStateValue('curView', false);
    db_filters.resetTblFilters();
    resetTableParams(focus);
    db_ui.resetToggleTreeBttn(false); 
    _u.replaceSelOpts('#sel-view', false);
    $('#focus-filters').empty();  
    tableBuilder();
}
function storeStateValue(key, value) {
    _u.addToStorage(key, JSON.stringify(value));
}
/* ==================== LOCATION SEARCH ============================================================================= */
function buildLocationTable(view) {
    const data = getLocData();
    if (data) { 
        addLocDataToTableParams(data);
        db_ui.initLocSearchUi(view);
        updateLocView(view);
    } else { console.log('Error loading location data from storage.'); }
}
function getLocData() {
    const locDataStorageProps = [ 'location', 'topRegionNames' ];  
    return _u.getDataFromStorage(locDataStorageProps);
}
function addLocDataToTableParams(data) {
    tblState.rcrdsById = data.location;                                    
    tblState.data = data;
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
    const val = v || _u.getSelVal('View');                                      //console.log('updateLocView. view = [%s]', val);
    resetLocUi(val);
    resetCurTreeState();
    db_ui.resetToggleTreeBttn(false);
    showLocInteractionData(val);
}
function resetLocUi(view) { 
    clearPreviousTable();
    if (view === 'tree') { db_ui.updateUiForTableView(); }
}
function showLocInteractionData(view) {                                         //console.log('showLocInteractionData. view = ', view);
    storeStateValue('curView', view);                      
    return view === 'tree' ? rebuildLocTable() : buildLocMap();
}
/** ------------ Location Table Methods ------------------------------------- */
/**
 * Rebuilds loc tree with passed location, or the default top regions, as the
 * base node(s) of the new tree with all sub-locations nested beneath @buildLocTree.
 * Resets 'openRows' and clears tree. Continues @buildLocTableTree.
 * Note: This is also the entry point for filter-related table rebuilds.
 */
export function rebuildLocTable(topLoc) {                                       //console.log("-------rebuilding loc tree. topLoc = %O", topLoc);
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
    frmt_data.transformLocDataAndLoadTable(
        data_tree.buildLocTree(topLocs), tblState);
    db_ui.loadSearchLocHtml(tblState);
}
/** ------------ Location Map Methods --------------------------------------- */
/** Filters the data-table to the location selected from the map view. */
export function showLocInDataTable(loc) {                                       //console.log('showing Loc = %O', loc);
    db_ui.updateUiForTableView();
    rebuildLocTable([loc.id]);
    _u.setSelVal('View', 'tree', 'silent');
}
/** Initializes the google map in the data table. */
function buildLocMap() {    
    db_ui.updateUiForMapView();      
    if (tblState.intSet) { return showLocsInSetOnMap(); }
    db_map.initMap(tblState.rcrdsById);           
}
/**
 * When displaying a user-made set "list" of interactions focused on locations in 
 * "Map Data" view, the locations displayed on the map are only those in the set
 * and their popup data reflects the data of the set. 
 */
function showLocsInSetOnMap() {
    const locTree = data_tree.buildLocTree(getTopRegionIds());
    db_map.initMap(tblState.rcrdsById, locTree);
}
/** Switches to map view and centeres map on selected location. */
export function showLocOnMap(geoJsonId, zoom) {
    db_ui.updateUiForMapView();
    _u.setSelVal('View', 'map', 'silent');
    db_map.showLoc(geoJsonId, zoom, tblState.rcrdsById);
    $('#tbl-filter-status').html('No Active Filters.');
}
/* ==================== SOURCE SEARCH =============================================================================== */
/**
 * Get all data needed for the Source-focused table from data storage and send  
 * to @initSrcSearchUi to begin the data-table build.  
 */
function buildSourceTable() {
    const data = _u.getDataFromStorage('source');
    if (data) { 
        tblState.rcrdsById = data;
        db_ui.initSrcSearchUi(data);
        onSrcViewChange(tblState.curView);
    } else { console.log('Error loading source data from storage.'); }
}
/** Event fired when the source view select box has been changed. */
export function onSrcViewChange(val) {                                         //console.log('-------- SrcViewChange. [%s]', val)
    if (!val) { return; }
    rebuildSrcTable(val);
}
function rebuildSrcTable(val) {
    clearPreviousTable();
    resetCurTreeState();
    db_ui.resetToggleTreeBttn(false);
    $('#focus-filters').empty();
    startSrcTableBuildChain(val);
}
function startSrcTableBuildChain(val) {
    storeSrcView(val);
    db_ui.loadSrcSearchUi(tblState.curView);
    frmt_data.transformSrcDataAndLoadTable(
        data_tree.buildSrcTree(tblState.curView), tblState);
}
function storeSrcView(val) {  
    const viewVal = val || _u.getSelVal('View');                                //console.log("storeAndReturnCurViewRcrds. viewVal = ", viewVal)
    storeStateValue('curView', viewVal);
    tblState.curView = viewVal;    
}
/* ==================== TAXON SEARCH  =============================================================================== */
/**
 * Get all data needed for the Taxon-focused table from data storage and send 
 * to @initTaxonSearchUi to begin the data-table build.  
 */
function buildTaxonTable() {                                                    //console.log("Building Taxon Table.");
    const data = _u.getDataFromStorage(['realm', 'taxon']); 
    if (data) { 
        tblState.rcrdsById = data.taxon;
        db_ui.initTaxonSearchUi(data);
        startTxnTableBuildChain(storeAndReturnView());
    } else { console.log("Error loading taxon data from storage."); }
}
/** Event fired when the taxon view select box has been changed. */
export function onTxnViewChange(val) {                                          //console.log('rebuildTxnTable. val = [%s]', val) 
    if (!val) { return; }
    buildTxnTable(val);
}
function buildTxnTable(val) {                                                   //console.log('onTxnViewChange')
    const realmTaxon = storeAndReturnView(val);
    resetCurTreeState();
    $('#focus-filters').empty();  
    rebuildTxnTable(realmTaxon);
}
/**
 * Gets the currently selected taxon realm/view's id, gets the record for the taxon, 
 * stores both it's id and level in the global focusStorage, and returns 
 * the taxon's record.
 */
function storeAndReturnView(val) {
    const realmId = val || getSelValOrDefault(_u.getSelVal('View'));            //console.log('storeAndReturnView. val [%s], realmId [%s]', val, realmId)
    const realmTaxonRcrd = _u.getDetachedRcrd(realmId, tblState.rcrdsById);     //console.log("realmTaxon = %O", realmTaxonRcrd);
    const realmLvl = realmTaxonRcrd.level;
    storeStateValue('curView', realmId);
    tblState.curView = realmId;
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
export function rebuildTxnTable(topTaxon, filtering) {                          //console.log("topTaxon = %O", topTaxon)
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
    tblState.openRows = [topTaxon.id.toString()];                               //console.log("openRows=", openRows)
    frmt_data.transformTxnDataAndLoadTable(
        data_tree.buildTxnTree(topTaxon, filtering), tblState);
    db_ui.loadTaxonComboboxes(tblState);
}
