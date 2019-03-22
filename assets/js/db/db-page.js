/**
 * The Database Search page entry point. The data table is built to display the 
 * eco-interaction records organized by a selected "focus": taxa (grouped further 
 * by realm: bat, plant, arthropod), locations, or sources (grouped by either 
 * authors, publications, or publishers). The data map displays interactions
 * geographically. Filtered interactions can be viewed in either form. 
 * 
 * Exports:
 *     accessTableState
 *     handleReset
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
import * as tbl_ui from './db-table/tbl-ui.js';
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
const dataKey = 'A life without cause is a life without effect!!!';             console.log(dataKey);

// initGeoJsonDB();
requireCss();
initDbPage();

/** 
 * Initialized here because I am unsure exaclty where to load this db before it is needed.
 * Checks whether the dataKey exists in indexDB cache. 
 * If it is, the stored geoJson is fetched and stored in the global variable. 
 * If not, the db is cleared and geoJson is redownloaded. 
 */
function initGeoJsonDB() {
    _u.initGeoJsonData();
}
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
    storeUserRole();
    addDomEventListeners();
    adaptUiToScreenSize();
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
export function handleReset(prevFocus) {
    onDataReset(prevFocus);
}
function onDataReset(prevFocus) {
    showLoadingDataPopUp();
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
    showLoadingDataPopUp();
    db_tips.startWalkthrough(tblState.curFocus);
}
/** Shows a loading popup message for the inital data-download wait. */
function showLoadingDataPopUp() {
    _u.showPopUpMsg(`Downloading and caching all interaction records. Please allow 
        for a ~45 second download.`);   
}
function storeUserRole() {
    tblState.userRole = $('body').data("user-role");                              //console.log("----userRole === visitor ", userRole === "visitor")
}
function addDomEventListeners() {
    db_filters.addDomEventListeners();
    tbl_ui.addDomEventListeners();
    // $('button[name="xpand-all"]').click(toggleExpandTree);
    // $('button[name="xpand-1"]').click(expandTreeByOne);
    // $('button[name="collapse-1"]').click(collapseTreeByOne);
    $('#shw-map').click(showTableRecordsOnMap);
    $('button[name="reset-tbl"]').click(resetDataTable);
}
/** Moves the buttons from the end of the search options panel to just beneath. */
function adaptUiToScreenSize() {
    if ($(window).width() > 1500) { return; }
    var elemCntnr = $('#opts-col4').detach();  
    var cntnr = _u.buildElem('div', { class: 'flex-row' });
    $(cntnr).css({ width: '100%', 'justify-content': 'flex-end' });
    $(elemCntnr)[0].className = 'flex-row';
    $(cntnr).append(elemCntnr);
    $('#search-opts').after(cntnr);
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
function setTableState(multi, key, value) {                                     //console.log('setTableState. params? ', arguments);
    if (multi) { Object.keys(multi).forEach(k => {
        tblState[k] = multi[k];
    })} else {
        tblState[key] = value;
    }
}
/*-------------------- Top "State" Managment Methods -------------------------*/
function initSearchState() {
    resetTableParams();
    db_filters.toggleTimeUpdatedFilter('disable');
    db_filters.resetFilterStatusBar();      
    tbl_ui.setUpFutureDevInfoBttn();
    selectInitialSearchFocus();
} 
/** Resets on focus change. */
function resetTableParams() {  
    tblState = {
        curFocus: getResetFocus(),
        openRows: [],
        selectedOpts: {}
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

/*------------------ Taxon Search Methods ------------------------------------*/
/**
 * Get all data needed for the Taxon-focused table from data storage and send 
 * to @initTaxonSearchUi to begin the data-table build.  
 */
function buildTaxonTable() {                                                    //console.log("Building Taxon Table.");
    const data = _u.getDataFromStorage(['realm', 'taxon']); 
    if (data) { initTaxonSearchUi(data);
    } else { console.log("Error loading taxon data from storage."); }
}
/**
 * If the taxon search comboboxes aren't displayed, build them @buildTaxonRealmHtml.
 * If no realm is selected, the default realm value is set. The realm-tree 
 * is built @startTxnTableBuildChain and all present taxon-levels are stored @storeLevelData. 
 * Continues table build @getInteractionsAndFillTable.  
 */
function initTaxonSearchUi(data) {                                              console.log("initTaxonSearchUi. data = %O", data);
    tblState.rcrdsById = data.taxon;
    if (!$("#sel-realm").length) { buildTaxonRealmHtml(data.realm); }  
    setTaxonRealm();  
    startTxnTableBuildChain(storeAndReturnRealm());
}
/** Restores stored realm from previous session or sets the default 'Plants'. */
function setTaxonRealm() {
    const storedRealm = dataStorage.getItem('curRealm');                        console.log("storedRealm = ", storedRealm)
    if (!_u.getSelVal('Taxon Realm')) { 
        const realmVal = storedRealm !== null ? storedRealm : "3";  
        _u.setSelVal('Taxon Realm', realmVal, 'silent');
    }
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
    loadTaxonComboboxes();
}
/*------------------ Build Taxon Search Ui --------------------------------*/
/**
 * Builds the select box for the taxon realms that will become the data tree 
 * nodes displayed in the table.
 */
function buildTaxonRealmHtml(realms) {                                          //console.log("buildTaxonRealmHtml called. ");
    const browseElems = _u.buildElem('span', { id:'sort-taxa-by', 
        class: 'flex-row', text: 'Group Taxa by: ' });
    const opts = getRealmOpts(realms);                                          //console.log("realmOpts = %O", realmOpts);
    $(browseElems).append(newSelEl(opts, 'opts-box', 'sel-realm', 'Taxon Realm'));
    $('#sort-opts').append(browseElems);
    _u.initCombobox('Taxon Realm');
    $('#sort-opts').fadeTo(0, 1);

    function getRealmOpts(realms) {  
        const optsAry = [];
        for (let id in realms) {                                                //console.log("taxon = %O", data[taxonId]);
            optsAry.push({ value: realms[id].taxon, text: realms[id].displayName });
        }
        return optsAry;
    }
} /* End buildTaxonRealmHtml */
/**
 * Builds and initializes a search-combobox for each level present in the 
 * the unfiltered realm tree. Each level's box is populated with the names 
 * of every taxon at that level in the displayed, filtered, table-tree. After 
 * appending, the selects are initialized with the 'selectize' library @initComboboxes. 
 */
function loadTaxonComboboxes() {
    const curTaxaByLvl = tblState.taxaByLvl;                                    //console.log("curTaxaByLvl = %O", curTaxaByLvl);
    const lvlOptsObj = buildTaxonSelectOpts(curTaxaByLvl);
    const levels = Object.keys(lvlOptsObj);
    if (levels.indexOf(tblState.realmLvl) !== -1) { levels.shift(); } //Removes realm level
    loadLevelSelects(lvlOptsObj, levels);
}
/**
 * Builds select options for each level with taxon data in the current realm.
 * If there is no data after filtering at a level, a 'none' option obj is built
 * and will be selected.
 */
function buildTaxonSelectOpts(rcrdsByLvl) {                                     //console.log("buildTaxonSelectOpts rcrds = %O", rcrdsByLvl);
    const optsObj = {};
    const curRealmLvls = tblState.allRealmLvls.slice(1);                        console.log("curRealmLvls = %O", curRealmLvls) //Skips realm lvl 
    curRealmLvls.forEach(buildLvlOptions);
    return optsObj;

    function buildLvlOptions(lvl) {
        return lvl in rcrdsByLvl ? 
            getTaxaOptsAtLvl(rcrdsByLvl[lvl], lvl) : fillInLvlOpts(lvl)
    }
    /** Child levels can have multiple taxa.  */
    function getTaxaOptsAtLvl(rcrds, lvl) {
        const taxonNames = Object.keys(rcrdsByLvl[lvl]).sort();                   //console.log("taxonNames = %O", taxonNames);
        optsObj[lvl] = buildTaxonOptions(taxonNames, rcrdsByLvl[lvl]);
    }
    function fillInLvlOpts(lvl) {                                               //console.log("fillInEmptyAncestorLvls. lvl = ", lvl);
        if (lvl in tblState.selectedOpts) {
            const taxon = _u.getDetachedRcrd(tblState.selectedOpts[lvl], tblState.rcrdsById);
            optsObj[lvl] = [{value: taxon.id, text: taxon.displayName}];  
        } else { optsObj[lvl] = []; }
    }
} /* End buildTaxonSelectOpts */
function buildTaxonOptions(taxonNames, taxonData) {
    return taxonNames.map(function(taxonKey){
        return {
            value: taxonData[taxonKey].id,
            text: taxonKey
        };
    });
}
function loadLevelSelects(levelOptsObj, levels) {                               //console.log("loadLevelSelectElems. lvlObj = %O", levelOptsObj)
    const elems = buildTaxonSelects(levelOptsObj, levels);
    clearCol2();        
    $('#opts-col2').append(elems);
    _u.initComboboxes(tblState.allRealmLvls.slice(1));
    setSelectedTaxonVals(tblState.selectedOpts);
    
    function buildTaxonSelects(opts, levels) {  
        const elems = [];
        levels.forEach(function(level) {                                        //console.log('----- building select box for level = [%s]', level);
            const lbl = _u.buildElem('label', { class: 'lbl-sel-opts flex-row' });
            const span = _u.buildElem('span', { text: level + ': ' });
            const sel = newSelEl(opts[level], 'opts-box', 'sel' + level, level);
            $(sel).css('width', '142px');
            $(lbl).css('margin', '.3em 0em 0em.3em').append([span, sel]);
            elems.push(lbl);
        });
        return elems;
    }
}
function setSelectedTaxonVals(selected) {                                       console.log("selected in setSelectedTaxonVals = %O", selected);
    if (!selected || !Object.keys(selected).length) {return;}
    tblState.allRealmLvls.forEach(function(lvl) {                               
        if (!selected[lvl]) { return; }                                         console.log("selecting [%s] = ", lvl, selected[lvl])
        _u.setSelVal(lvl, selected[lvl], 'silent');
    });
}
/*------------------Location Search Methods-----------------------------------*/
/** Get location data from data storage and sends it to @initLocSearchUi */
function buildLocationTable(view) {
    const data = getLocData();
    if (data) { initLocSearchUi(data, view);
    } else { console.log('Error loading location data from storage.'); }
}
function getLocData() {
    const locDataStorageProps = [
        'location', 'locationType', 'topRegionNames', 'countryNames', 'regionNames'
    ];
    return _u.getDataFromStorage(locDataStorageProps);
}
/**
 * Builds location view html and initializes table load. Either builds the table 
 * data-tree view, by default, or loads the data-map view, if previously 
 * selected. 
 */ 
function initLocSearchUi(locData, view) {
    addLocDataToTableParams(locData);
    if (!$("#grid-view").length) { buildLocViewHtml(); }  
    setLocView(view);  
    updateLocView(view);
} 
function setLocView(view) {
    const storedRealm = view || dataStorage.getItem('curRealm');                //console.log("setLocView. storedRealm = ", storedRealm)
    const locRealm = storedRealm || 'tree';
    _u.setSelVal('Loc View', locRealm, 'silent');
}
function addLocDataToTableParams(data) {
    tblState.rcrdsById = data.location;                                    
    tblState.data = data;
}
function buildLocViewHtml() {                   
    const span = _u.buildElem('span', { id:'grid-view', class: 'flex-row',
        text: 'View all as: ' });
    const sel = newSelEl(getViewOpts(), 'opts-box', 'sel-realm', 'Loc View');
    $('#sort-opts').append([span, sel]);
    _u.initCombobox('Loc View');
    $('#sort-opts').fadeTo(0, 1);

    function getViewOpts() {
        return [{ value: 'map', text: 'Map Data' },
                { value: 'tree', text: 'Table Data' }];   
    } 
} /* End buildLocViewHtml */
export function onLocViewChange(val) {
    if (!val) { return; }
    updateLocView(val);
}
/** 
 * Event fired when the source realm select box has been changed.
 * An optional calback (cb) will redirect the standard map-load sequence.
 */
function updateLocView(v) {                                                     
    const val = v || _u.getSelVal('Loc View');                                     //console.log('updateLocView. view = [%s]', val);
    resetLocUi(val);
    resetCurTreeState();
    tbl_ui.resetToggleTreeBttn(false);
    showLocInteractionData(val);
}
function resetLocUi(view) { 
    clearCol2();
    clearPreviousTable();
    if (view === 'tree') { tbl_ui.updateUiForTableView(); }
}
/** 
 * Starts the Table build depending on the view selected.
 */
function showLocInteractionData(view) {                                         //console.log('showLocInteractionData. view = ', view);
    _u.populateStorage('curRealm', view);                      
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
    loadSearchLocHtml();
}
/**
 * Builds the Location search comboboxes @loadLocComboboxes. Transform tree
 * data into table rows and load the table @transformLocDataAndLoadTable.
 */
function loadSearchLocHtml() {
    clearCol2();       
    loadSearchByNameElem();
    loadLocComboboxes();
}
function loadSearchByNameElem() {  
    const searchTreeElem = db_filters.buildTreeSearchHtml('Location');
    $(searchTreeElem).css({ 'width': '273px' });
    $('#opts-col2').append(searchTreeElem);
    $('input[name="selLocation"]').css({ 'width': '205px' });
}
/**
 * Create and append the location search comboboxes, Region and Country, and
 * set any previously 'selected' values.
 */
function loadLocComboboxes() {  
    const opts = buildLocSelectOpts(); 
    var selElems = buildLocSelects(opts);
    $('#opts-col2').append(selElems);
    _u.initComboboxes(['Region', 'Country']);
    setSelectedLocVals();
}/** Builds arrays of options objects for the location comboboxes. */
function buildLocSelectOpts() {  
    var processedOpts = { Region: [], Country: [] };
    var opts = { Region: [], Country: [] };  
    tblState.api.getModel().rowsToDisplay.forEach(buildLocOptsForNode);
    modifyOpts();
    return opts; 
    /**
     * Recurses through the tree and builds a option object for each unique 
     * country and region in the current table with interactions.
     */
    function buildLocOptsForNode(row) {                                 
        var rowData = row.data;  
        if (rowData.interactionType) {return;}                                  //console.log("buildLocOptsForNode %s = %O", rowData.name, rowData)
        if (rowData.type === 'Region' || rowData.type === 'Country') {
            buildLocOpt(rowData, rowData.name, rowData.type); 
        }
        if (row.childrenAfterFilter) { row.childrenAfterFilter.forEach(buildLocOptsForNode); }
    }
    /** If the location has interactions an option object is built for it. */
    function buildLocOpt(rowData, name, type) {
        if (name.includes('Unspecified')) { return; }
        if (processedOpts[type].indexOf(name) !== -1) { return; }
        var id = tblState.data[_u.lcfirst(type) + "Names"][name];             
        if (isOpenRow(id)) { addToSelectedObj(id, type); }
        opts[type].push({ value: id, text: name.split('[')[0] }); 
        processedOpts[type].push(name);
    }
    function isOpenRow(id) {  
        return tblState.openRows.indexOf(id) !== -1
    }
    /** Handles all modification of the location options. */
    function modifyOpts() {                                                     //console.log('modifyOpts. opts = %O', _u.snapshot(opts));
        if (opts.Region.length === 2) { rmvTopRegion(); }        
        addMissingOpts();
        sortLocOpts();
    }
    /** 
     * If both top & sub regions are in the table, only the sub-region opt is 
     * included, unless the top region is the location being filtered on. 
     */
    function rmvTopRegion() {                                                   //console.log('rmving top region. opts = %O, regionToKeep = %O', opts, tblState.selectedOpts)
        const selLoc = tblState.rcrdsById[tblState.openRows[0]];                  
        if (!selLoc || !selLoc.parent) { return; }
        opts.Region = opts.Region.filter(function(region) {
            return region.value == tblState.selectedOpts.region;
        });             
    }
    /** If the Region or Country aren't in the table, they are added as options here. */
    function addMissingOpts() {                                                 
        if (!tblState.openRows.length && !tblState.selectedOpts) { return; }
        const selLoc = tblState.rcrdsById[tblState.openRows[0]];                  
        if (!opts.Country.length) { buildOpt(selLoc, 'country', 'Country'); }
        if (!opts.Region.length) { buildOpt(selLoc, 'region', 'Region'); }
    }
    /** build the new opts and adds their loc ids to the selected-options obj. */
    function buildOpt(loc, type, optProp) {                                     //console.log('building opt for [%s]. loc = %O', type, loc);
        const val = loc && loc[type] ?  loc[type].id : false;
        const txt = loc && loc[type] ?  loc[type].displayName : false;
        if (!val) { return }
        addToSelectedObj(val, _u.ucfirst(type));  
        tblState.openRows.push(val);
        opts[optProp].push({ value: val, text: txt });
    }         
    function addToSelectedObj(id, type) {
        const sel = tblState.selectedOpts || createSelectedOptsObj();            //console.log('building opt for [%s] = %O', type, loc);
        sel[type] = id;
    }
    /** Alphabetizes the options. */
    function sortLocOpts() {
        for (let type in opts) {
            opts[type] = opts[type].sort(alphaOptionObjs); 
        }
    }
} /* End buildLocSelectOpts */
function createSelectedOptsObj() {
    tblState.selectedOpts = {};
    return tblState.selectedOpts;
}
/** Builds the location select elements */
function buildLocSelects(locOptsObj) {  
    const selElems = [];
    for (let locSelName in locOptsObj) {
        let elem = buildLocSel(_u.ucfirst(locSelName), locOptsObj[locSelName]); 
        selElems.push(elem);
    }
    return selElems;
    
    function buildLocSel(selName, opts) {
        const lbl = _u.buildElem('label', { class: "lbl-sel-opts flex-row" });
        const span = _u.buildElem('span', { text: selName + ': ', class: "opts-span" });
        const sel = newSelEl(opts, 'opts-box', 'sel' + selName, selName);
        $(sel).css('width', '202px');
        $(lbl).css('width', '282px').append([span, sel]);
        return lbl;
    }
}
function setSelectedLocVals() {                                                 
    const selected = tblState.selectedOpts;                                     //console.log("selected in setSelectedLocVals = %O", selected);
    Object.keys(selected).forEach(locType => {
        _u.setSelVal(locType, selected[locType], 'silent');
    });
}
/** ------------ Location Map Methods --------------------------------------- */
/** Filters the data-table to the location selected from the map view. */
export function showLocInDataTable(loc) {                                       //console.log('showing Loc = %O', loc);
    tbl_ui.updateUiForTableView();
    rebuildLocTree([loc.id]);
    _u.setSelVal('Loc View', 'tree', 'silent');
}
/** Initializes the google map in the data table. */
function buildLocMap() {    
    tbl_ui.updateUiForMapView();       
    db_map.initMap(tblState.rcrdsById);           
}
/** Switches to map view and centeres map on selected location. */
export function showLocOnMap(geoJsonId, zoom) {
    tbl_ui.updateUiForMapView();
    clearCol2();
    _u.setSelVal('Loc View', 'map', 'silent');
    db_map.showLoc(geoJsonId, zoom, tblState.rcrdsById);
}
/**
 * Build an object with all relevant data to display the interactions in the 
 * data-table in map-view. Sends it to the map to handle the display.
 */
export function showTableRecordsOnMap() {                                       console.log('-----------showTableRecordsOnMap');
    const locRcrds = tblState.curFocus !== 'locs' ? 
        _u.getDataFromStorage('location') : tblState.rcrdsById;  
    $('#search-tbl').fadeTo('100', 0.3, () => {
        tbl_ui.updateUiForMappingInts();
        db_map.showInts(tblState.curFocus, tblState.rcrdsById, locRcrds);
    });
}
/*------------------Source Search Methods ------------------------------------*/
/**
 * Get all data needed for the Source-focused table from data storage and send  
 * to @initSrcSearchUi to begin the data-table build.  
 */
function buildSrcTable() {
    const data = _u.getDataFromStorage('source');
    if (data) { initSrcSearchUi(data);
    } else { console.log('Error loading source data from storage.'); }
}

/**
 * If the source-realm combobox isn't displayed, build it @buildSrcRealmHtml.
 * If no realm selected, set the default realm value. Start table build @buildSrcTree.
 */
function initSrcSearchUi(srcData) {                                             //console.log("=========init source search ui");
    tblState.rcrdsById = srcData;
    if (!$("#sel-realm").length) { buildSrcRealmHtml(); }  
    setSrcRealm();  
}
/** Builds the combobox for the source realm types. */
function buildSrcRealmHtml() {                                             
    $('#sort-opts').append(buildSrcTypeElems());
    _u.initCombobox('Source Type');
    $('#sort-opts').fadeTo(0, 1);

    function buildSrcTypeElems() {
        const types = getRealmOpts();                                       
        const span = _u.buildElem('span', { id:'sort-srcs-by', class: 'flex-row', 
            text: 'Source Type: ' });
        const sel = newSelEl(types, 'opts-box', 'sel-realm', 'Source Type');
        return [span, sel];
    }
    function getRealmOpts() {
        return [{ value: "auths", text: "Authors" },
                { value: "pubs", text: "Publications" },
                { value: "publ", text: "Publishers" }];
    }
} /* End buildSrcRealmHtml */
/** Restores stored realm from previous session or sets the default 'Publications'. */
function setSrcRealm() {
    const storedRealm = dataStorage.getItem('curRealm');                        //console.log("storedRealm = ", storedRealm)
    const srcRealm = storedRealm || 'pubs';  
    if (!_u.getSelVal('Source Type')) { _u.setSelVal('Source Type', srcRealm); 
    } else { onSrcRealmChange(srcRealm); }
}
/** Event fired when the source realm select box has been changed. */
export function onSrcRealmChange(val) {                                         console.log('-------- SrcRealmChange')
    if (!val) { return; }
    resetSourceRealm(val);
}
function resetSourceRealm(val) {
    clearPreviousTable();
    resetCurTreeState();
    tbl_ui.resetToggleTreeBttn(false);
    startSrcTableBuildChain(val);
}
function startSrcTableBuildChain(val) {
    storeSrcRealm(val);
    buildSrcSearchUiAndTable();
    build_tbl_data.transformSrcDataAndLoadTable(
        data_tree.buildSrcTree(tblState.curRealm), tblState);
}
function storeSrcRealm(val) {  
    const realmVal = val || _u.getSelVal('Source Type');                           //console.log("storeAndReturnCurRealmRcrds. realmVal = ", realmVal)
    _u.populateStorage('curRealm', realmVal);
    tblState.curRealm = realmVal;    
}
/**
 * Will build the select elems for the source search options. Clears previous 
 * table. Calls @transformSrcDataAndLoadTable to transform tree data into table 
 * format and load the data table.
 * NOTE: This is the entry point for source table rebuilds as filters alter data
 * contained in the data tree.
 */
function buildSrcSearchUiAndTable() {                                           //console.log("buildSrcSearchUiAndTable called. tree = %O", srcTree);
    const buildUi = { 'auths': loadAuthSearchHtml, 'pubs': loadPubSearchHtml, 
        'publ':loadPublSearchHtml };
    buildUi[tblState.curRealm](); 
} 
/** Builds a text input for searching author names. */
function loadAuthSearchHtml() {
    const searchTreeElem = db_filters.buildTreeSearchHtml('Author');
    clearCol2();        
    $('#opts-col2').append(searchTreeElem);
}
/**
 * REFACT TREE SEARCH ELEM BUILD INTO DB FILTERS
 * @param  {[type]} srcTree [description]
 * @return {[type]}         [description]
 */
function loadPubSearchHtml() {
    const pubTypeElem = buildPubTypeSelect();
    const searchTreeElem = db_filters.buildTreeSearchHtml('Publication');
    clearCol2();        
    $('#opts-col2').append([searchTreeElem, pubTypeElem]); //searchTreeElem, 
    _u.initCombobox('Publication Type');
    _u.setSelVal('Publication Type', 'all', 'silent');
    
    function buildPubTypeSelect() {
        const pubTypeOpts = buildPubSelectOpts();
        return buildPubSelects(pubTypeOpts);
    }
    function buildPubSelectOpts() {
        const pubTypes = _u.getDataFromStorage('publicationType');           
        const opts = [{value: 'all', text: '- All -'}];
        for (let t in pubTypes) {
            opts.push({ value: pubTypes[t].id, text: pubTypes[t].displayName });
        }
        return opts.sort(alphaOptionObjs);  
    }
    /** Builds the publication type dropdown */
    function buildPubSelects(opts) {                                            //console.log("buildPubSelects pubTypeOpts = %O", pubTypeOpts)
        const lbl = _u.buildElem('label', {class: "lbl-sel-opts flex-row"});
        const span = _u.buildElem('span', { text: 'Type:' });
        const sel = newSelEl(opts, '', 'selPubType', 'Publication Type');
        $(sel).css('width', '177px');
        $(lbl).css('width', '222px').append([span, sel]);
        return lbl;
    }
} /* End loadPubSearchHtml */
function loadPublSearchHtml() {
    const searchTreeElem = db_filters.buildTreeSearchHtml('Publisher');
    clearCol2();        
    $('#opts-col2').append(searchTreeElem);
}
/*================= Utility ==================================================*/
function clearCol2() {
    $('#opts-col2').empty();
}
// function showPopUpMsg(msg) {                                                    //console.log("showPopUpMsg. msg = ", msg)
//     const popUpMsg = msg || 'Loading...';
//     $('#db-popup').text(popUpMsg);
//     $('#db-popup').addClass('loading'); //used in testing
//     $('#db-popup, #db-overlay').show();
//     _u.fadeTable();
// }
/** 
 * Sorts an array of options via sort method.
 * REFACT NOTE:: UTIL.js
 */
function alphaOptionObjs(a, b) {
    var x = a.text.toLowerCase();
    var y = b.text.toLowerCase();
    return x<y ? -1 : x>y ? 1 : 0;
}
/** Sorts an array of options via sort method. */
function alphaSortVals(a, b) {
    var x = a.toLowerCase();
    var y = b.toLowerCase();
    return x<y ? -1 : x>y ? 1 : 0;
}
function newSelEl(opts, c, i, field) {                                          //console.log('newSelEl for [%s]. args = %O', field, arguments);
    const elem = _u.buildSelectElem(opts, { class: c, id: i });
    $(elem).data('field', field);
    return elem;
}
/*----------------- Table Manipulation ------------------------------------------*/
/**  Table-rebuild entry point after form-window close.  */
function resetDataSearchTable(focus) {                                          //console.log('resetting search table.')
    tbl_ui.resetToggleTreeBttn(false);
    db_filters.resetFilterStatusBar();
    if ($('#shw-chngd')[0].checked) { db_filters.toggleTimeUpdatedFilter('disable'); }
    selectSearchFocus(focus);
}
/** Refactor: combine with resetDataSearchTable. */
export function initDataTable(focus) {                                          //console.log('resetting search table.')
    resetDataSearchTable(focus);
    tbl_ui.updateUiForTableView();
}
export function selectSearchFocus(f) { 
    const focus = f || _u.getSelVal('Focus');                                      console.log("---select(ing)SearchFocus = ", focus); 
    if (!focus) { return; }
    const builderMap = { 
        'locs': buildLocationTable, 'srcs': buildSrcTable,
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
    dataStorage.removeItem('curRealm');
    db_filters.resetFilterStatusBar();
    resetTableParams();
    tbl_ui.resetToggleTreeBttn(false); 
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
        tbl_ui.updateUiForTableView();
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
    tbl_ui.resetToggleTreeBttn(false);
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