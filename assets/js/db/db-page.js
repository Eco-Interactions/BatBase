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
 *     showUpdates
 *
 *  REFACT
 *      resetToggleTreeBttn
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
import * as db_csv from './db-table/csv-data.js';

/**
 * dataStorage = window.localStorage (sessionStorage for tests)
 * tblState = Stores table state params needed across multiple modules.
 * dataKey = String checked in data storage to indicate whether the stored 
 *      data should be cleared and redownloaded. REFACT:: DB_SYNC
 */
let dataStorage, tblState = {};
const dataKey = 'A life without cause is a life without effect!';               console.log(dataKey);

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
    showPopUpMsg('Loading...');
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
    showPopUpMsg(`Downloading and caching all interaction records. Please allow 
        for a ~45 second download.`);   
}
function storeUserRole() {
    tblState.userRole = $('body').data("user-role");                              //console.log("----userRole === visitor ", userRole === "visitor")
}
function addDomEventListeners() {
    db_filters.addDomEventListeners();
    $('button[name="xpand-all"]').click(toggleExpandTree);
    $('button[name="xpand-1"]').click(expandTreeByOne);
    $('button[name="collapse-1"]').click(collapseTreeByOne);
    $('button[name="reset-tbl"]').click(resetDataTable);
    $('#shw-map').click(showTableRecordsOnMap);
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

/**
 * Returns table state to requesting module.
 */
function getTableState(k) {                                                     //console.log('getTableState. params? ', arguments);
    return k ? tblState[k] : tblState;
}

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
    setUpFutureDevInfoBttn();
    selectInitialSearchFocus();
} 
/**
 * Container for param data needed for a selected focus. Resets on focus change.
 * - curFocus: Top table sort - Taxon (taxa), Location (locs), or Source (srcs).
 * - openRows: Array of entity ids whose table rows will be expanded on load.
 * Notable properties stored later: 
 * rcrdsById - all records for the current focus.
 * curRealm - focus' realm-level sort (eg, Taxon realms: Bat, Plant, Arthropod).
 * curTree - data 'tree' object to be displayed in table.
 * rowData - array of rows displayed in the table.
 * selectedOpts - search combobox values 'selected' for the current tree.
 *
 * REFACT:: DESCRIBE THE DIFFERENCE AND SEPARATE
 */
function resetTableParams() {  
    tblState = {};
    tblState.openRows = [];                                                      //console.log("tblState = %O", tblState);
    tblState.curFocus = getResetFocus();  
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
function setUpFutureDevInfoBttn() {
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

// /*------------------ Interaction Search Methods--------------------------------------*/
// /**
//  * If interaction data is already in data storage, the data is sent to 
//  * @fillTreeWithInteractions to begin rebuilding the data table. Otherwise, 
//  * an ajax call gets the data which is stored @storeInteractions before being
//  * sent to @fillTreeWithInteractions.    
//  */
// function getInteractionsAndFillTable() {                                         //console.log("getInteractionsAndFillTable called. Tree = %O", tblState.curTree);
//     var entityData = _u.getDataFromStorage('interaction');
//     fadeTable();
//     if (entityData) { fillTreeWithInteractions(entityData); 
//     } else { console.log("Error loading interaction data from storage."); }
// }
// /**
//  * Fills the current tree data with interaction records @fillTree and starts 
//  * the table-building method chain for the current focus @buildTable. Finally, 
//  * calls @init_tbl.onTableInitComplete for the final stage of the build. 
//  */
// function fillTreeWithInteractions(intRcrds) {                                   //console.log("fillTreeWithInteractionscalled.");
//     const focus = tblState.curFocus; 
//     const curTree = tblState.curTree; 
//     fillTree(focus, curTree, intRcrds);
//     buildTable(focus, curTree);
//     init_tbl.onTableInitComplete();
// } 
// /** Replaces all interaction ids with records for every node in the tree.  */
// function fillTree(focus, curTree, intRcrds) {  
//     const intEntities = ['taxon', 'location', 'source'];
//     const entityData = _u.getDataFromStorage(intEntities);
//     const fillMethods = { taxa: fillTaxonTree, locs: fillLocTree, srcs: fillSrcTree };
//     fillMethods[focus](curTree, intRcrds);

//     function fillTaxonTree(curTree) {                                           //console.log("fillingTaxonTree. curTree = %O", curTree);
//         fillTaxaInteractions(curTree);  
//         fillHiddenTaxonColumns(curTree, intRcrds);

//         function fillTaxaInteractions(treeLvl) {                                //console.log("fillTaxonInteractions called. taxonTree = %O", curTree) 
//             for (let taxon in treeLvl) {   
//                 fillTaxonInteractions(treeLvl[taxon]);
//                 if (treeLvl[taxon].children !== null) { 
//                     fillTaxaInteractions(treeLvl[taxon].children); }
//             }
//         }
//         function fillTaxonInteractions(taxon) {                                 //console.log("fillTaxonInteractions. taxon = %O", taxon);
//             const roles = ['subjectRoles', 'objectRoles'];
//             for (let r in roles) {
//                 taxon[roles[r]] = replaceInteractions(taxon[roles[r]]); 
//             }
//         }
//     } /* End fillTaxonTree */
//     /**
//      * Recurses through each location's 'children' property and replaces all 
//      * interaction ids with the interaction records.
//      */
//     function fillLocTree(treeBranch) {                                          //console.log("fillLocTree called. taxonTree = %O", treeBranch) 
//         for (let curNode in treeBranch) {                                       //console.log("curNode = %O", treeBranch[curNode]);
//             if (treeBranch[curNode].interactions.length > 0) { 
//                 treeBranch[curNode].interactions = replaceInteractions(treeBranch[curNode].interactions); }
//             if (treeBranch[curNode].children) { 
//                 fillLocTree(treeBranch[curNode].children); }
//         }
//     }
//     /**
//      * Recurses through each source's 'children' property until finding the
//      * direct source, then replacing its interaction id's with their records.
//      */
//     function fillSrcTree(curTree) { 
//         for (let srcName in curTree) {                                          //console.log("-----processing src %s = %O. children = %O", srcName, curTree[srcName], curTree[srcName].children);
//             fillSrcInteractions(curTree[srcName]);
//         }
//         /**
//          * Recurses through each source's 'children' property until all sources 
//          * have any interaction ids replaced with the interaction records. 
//          */
//         function fillSrcInteractions(curSrc) {                                  //console.log("fillSrcInteractions. curSrc = %O. parentSrc = %O", curSrc, parentSrc);
//             const srcChildren = [];
//             if (curSrc.isDirect) { replaceSrcInts(curSrc); }
//             curSrc.children.forEach(function(childSrc){
//                 fillSrcInteractions(childSrc); 
//             });
//         }
//         function replaceSrcInts(curSrc) {
//             curSrc.interactions = replaceInteractions(curSrc.interactions); 
//         }

//     } /* End fillSrcTree */
//     /** Replace the interaction ids with their interaction records. */
//     function replaceInteractions(interactionsAry) {                             //console.log("replaceInteractions called. interactionsAry = %O", interactionsAry);
//         return interactionsAry.map(function(intId){
//             if (typeof intId === "number") {                                    //console.log("new record = %O",  _u.snapshot(intRcrds[intId]));
//                 return fillIntRcrd(_u.getDetachedRcrd(intId, intRcrds)); 
//             }  console.log("####replacing interactions a second time? Ary = %O", interactionsAry);
//         });
//     }
//     /** Returns a filled record with all references replaced with entity records. */
//     function fillIntRcrd(intRcrd) {
//         for (let prop in intRcrd) { 
//             if (prop in entityData) { 
//                 intRcrd[prop] = entityData[prop][intRcrd[prop]];
//             } else if (prop === "subject" || prop === "object") {
//                 intRcrd[prop] = entityData.taxon[intRcrd[prop]];
//             } else if (prop === "tags") {
//                 intRcrd[prop] = intRcrd[prop].length > 0 ? 
//                     getIntTags(intRcrd[prop]) : null;
//             }
//         }
//         return intRcrd;
//     }
//     function getIntTags(tagAry) { 
//         const tags = tagAry.map(function(tag){ return tag.displayName; });
//         return tags.join(", ");
//     }
// } /* End fillTree */
// /** Calls the start of the table-building method chain for the current focus. */
// function buildTable(focus, curTree) {
//     const tblBuilderMap = { 
//         locs: buildLocSearchUiAndTable,  srcs: buildSrcSearchUiAndTable,
//         taxa: buildTaxonSearchUiAndTable 
//     };    
//     tblBuilderMap[focus](curTree);
// }
// function getTaxonName(taxon) {                                           
//     var lvl = taxon.level.displayName;  
//     return lvl === "Species" ? taxon.displayName : lvl+' '+taxon.displayName;
// }   
/*------------------ Taxon Search Methods ------------------------------------*/
/**
 * Get all data needed for the Taxon-focused table from data storage and send 
 * to @initTaxonSearchUi to begin the data-table build.  
 */
function buildTaxonTable() {                                                     //console.log("Building Taxon Table.");
    var data = _u.getDataFromStorage(['realm', 'taxon', 'level']); 
    if( data ) { initTaxonSearchUi(data);
    } else { console.log("Error loading taxon data from storage."); }
}
/**
 * If the taxon search comboboxes aren't displayed, build them @buildTaxonRealmHtml.
 * If no realm is selected, the default realm value is set. The realm-tree 
 * is built @initTaxonTree and all present taxon-levels are stored @storeLevelData. 
 * Continues table build @getInteractionsAndFillTable.  
 */
function initTaxonSearchUi(data) {                                              console.log("initTaxonSearchUi. data = %O", data);
    var realmTaxonRcrd;
    tblState.rcrdsById = data.taxon;
    if (!$("#sel-realm").length) { buildTaxonRealmHtml(data.realm); }  
    setTaxonRealm();  
    
    realmTaxonRcrd = storeAndReturnRealm();
    initTaxonTree(realmTaxonRcrd);
    storeLevelData(realmTaxonRcrd);
    getInteractionsAndFillTable();
}
/** Restores stored realm from previous session or sets the default 'Plants'. */
function setTaxonRealm() {
    var realmVal;
    var storedRealm = dataStorage.getItem('curRealm');                          console.log("storedRealm = ", storedRealm)
    if (!_u.getSelVal('Taxon Realm')) { 
        realmVal = storedRealm !== null ? storedRealm : "3";  
        _u.setSelVal('Taxon Realm', realmVal, 'silent');
    }
}
/**
 * Stores in the global tState obj:
 * > taxonByLvl - object with taxon records in the current tree organized by 
 *   level and keyed under their display name.
 *   ## tblState
 * > allRealmLvls - array of all levels present in the current realm tree.
 */
function storeLevelData(topTaxon) {
    tblState["taxaByLvl"] = seperateTaxonTreeByLvl(topTaxon);                   //console.log("taxaByLvl = %O", tblState.taxaByLvl)
    tblState["allRealmLvls"] = Object.keys(tblState.taxaByLvl);
}
function updateTaxaByLvl(topTaxon) {
    tblState["taxaByLvl"] = seperateTaxonTreeByLvl(topTaxon);                   //console.log("taxaByLvl = %O", tblState.taxaByLvl)
}
/** Returns an object with taxon records by level and keyed with display names. */
function seperateTaxonTreeByLvl(topTaxon) {
    var separated = {};
    separate(topTaxon);
    return sortObjByLevelRank(separated);

    function separate(taxon) {
        var lvl = taxon.level.displayName;
        if (separated[lvl] === undefined) { separated[lvl] = {}; }
        separated[lvl][taxon.displayName] = taxon;
        
        if (taxon.children) { 
            taxon.children.forEach(function(child){ separate(child); }); 
        }
    }
    function sortObjByLevelRank(taxonObj) {
        var levels = Object.keys(_u.getDataFromStorage('levelNames'));       //console.log("levels = %O", levels)
        var obj = {};
        levels.forEach(function(lvl){
            if (lvl in taxonObj) { obj[lvl] = taxonObj[lvl]; }
        });
        return obj;
    }
} /* End seperateTaxonTreeByLvl */
/** Event fired when the taxon realm select box has been changed. */
export function onTaxonRealmChange(val) {  
    if (!val) { return; }
    resetTaxonRealm(val);
}
function resetTaxonRealm(val) {  console.log('resetTaxonRealm')
    const realmTaxon = storeAndReturnRealm(val);
    resetCurTreeState();
    rebuildTaxonTree(realmTaxon, true);
}
/**
 * Gets the currently selected taxon realm's id, gets the record for the taxon, 
 * stores both it's id and level in the global focusStorag, and returns 
 * the taxon's record.
 */
function storeAndReturnRealm(val) {
    const realmId = val || getSelValOrDefault(_u.getSelVal('Taxon Realm'));        //console.log('storeAndReturnRealm. val [%s], realmId [%s]', val, realmId)
    const realmTaxonRcrd = _u.getDetachedRcrd(realmId, tblState.rcrdsById);                            console.log("realmTaxon = %O", realmTaxonRcrd);
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
 * the tree are stored or updated before continuing @getInteractionsAndFillTable.. 
 * Note: This is the entry point for filter-related taxon-table rebuilds.
 */
export function rebuildTaxonTree(topTaxon, realmInit) {                                //console.log("realmTaxon=%O", realmTaxon)
    clearPreviousTable();
    initTaxonTree(topTaxon);
    if (realmInit) { storeLevelData(topTaxon); 
    } else { updateTaxaByLvl(topTaxon); }
    getInteractionsAndFillTable();
}
/**
 * Builds a family tree of taxon data with passed taxon as the top of the tree. 
 * The top taxon's id is added to the global focus storage obj's 'openRows' 
 * and will be expanded on table load. 
 */
function initTaxonTree(topTaxon) {
    buildTaxonTree(topTaxon);                                 
    tblState.openRows = [topTaxon.id.toString()];                                //console.log("openRows=", openRows)
}
/**
 * Returns a heirarchical tree of taxon record data from the top, parent, 
 * realm taxon through all children. The tree is stored as 'curTree' in the 
 * global tblState obj. 
 */
function buildTaxonTree(topTaxon) {                                             //console.log("buildTaxonTree called for topTaxon = %O", topTaxon);
    var tree = {};                                                              //console.log("tree = %O", tree);
    tree[topTaxon.displayName] = topTaxon;  
    topTaxon.children = getChildTaxa(topTaxon.children);    
    tblState.curTree = tree;  
    /**
     * Recurses through each taxon's 'children' property and returns a record 
     * for each child ID found. 
     */
    function getChildTaxa(children) {                                           //console.log("getChildTaxa called. children = %O", children);
        if (children === null) { return null; }
        return children.map(function(child){
            if (typeof child === "object") { return child; }

            var childRcrd = _u.getDetachedRcrd(child, tblState.rcrdsById);                             //console.log("child = %O", child);
            if (childRcrd.children.length >= 1) { 
                childRcrd.children = getChildTaxa(childRcrd.children);
            } else { childRcrd.children = null; }

            return childRcrd;
        });
    }
} /* End buildTaxonTree */
/**
 * Initialize a search-combobox for each level in the tree @loadTaxonComboboxes.
 * Transform tree data into table rows and load table @transformTaxonDataAndLoadTable.
 */
function buildTaxonSearchUiAndTable(taxonTree) {                                   //console.log("taxaByLvl = %O", tblState.taxaByLvl);
    loadTaxonComboboxes();
    build_tbl_data.transformTaxonDataAndLoadTable(taxonTree, tblState);
} 
/*------------------ Build Taxon Search Ui --------------------------------*/
/**
 * Builds the select box for the taxon realms that will become the data tree 
 * nodes displayed in the table.
 */
function buildTaxonRealmHtml(data) {                                            //console.log("buildTaxonRealmHtml called. ");
    const browseElems = _u.buildElem('span', { id:'sort-taxa-by', 
        class: 'flex-row', text: 'Group Taxa by: ' });
    const opts = getRealmOpts(data);                                            //console.log("realmOpts = %O", realmOpts);
    $(browseElems).append(newSelEl(opts, 'opts-box', 'sel-realm', 'Taxon Realm'));
    $('#sort-opts').append(browseElems);
    _u.initCombobox('Taxon Realm');
    $('#sort-opts').fadeTo(0, 1);

    function getRealmOpts(data) {  
        var optsAry = [];
        for (var id in data) {                                                  //console.log("taxon = %O", data[taxonId]);
            optsAry.push({ value: data[id].taxon, text: data[id].displayName });
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
    const curRealmLvls = tblState.allRealmLvls.slice(1);                           //console.log("curRealmLvls = %O", curRealmLvls) //Skips realm lvl 
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
function setSelectedTaxonVals(selected) {                                       //console.log("selected in setSelectedTaxonVals = %O", selected);
    if (!selected || !Object.keys(selected).length) {return;}
    tblState.allRealmLvls.forEach(function(lvl) {                                //console.log("lvl ", lvl)
        if (!selected[lvl]) { return; }                                                   //console.log("selecting = ", lvl, selected[lvl])
        _u.setSelVal(lvl, selected[lvl], 'silent');
    });
}
/*------------------Location Search Methods-----------------------------------*/
/** 
 * Get location data from data storage and sends it to @initLocSearchUi
 */
function buildLocationTable(view) {
    const data = getLocData();
    if( data ) { initLocSearchUi(data, view);
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
    resetToggleTreeBttn(false);
    showLocInteractionData(val);
}
function resetLocUi(view) { 
    clearCol2();
    clearPreviousTable();
    if (view === 'tree') { updateUiForTableView(); }
}
/** 
 * Starts the Table build depending on the view selected.
 */
function showLocInteractionData(view) {                                         //console.log('showLocInteractionData. view = ', view);
    const regions = getTopRegionIds();
    _u.populateStorage('curRealm', view);                      
    return view === 'tree' ? buildLocTableTree(regions) : buildLocMap();
}
function getTopRegionIds() {
    const ids = [];
    const regions = tblState.data.topRegionNames;
    for (let name in regions) { ids.push(regions[name]); } 
    return ids;
}
/** ------------ Location Table Methods ------------------------------------- */
/** 
 * Builds a tree of location data with regions at the top level, and sub-regions, 
 * countries, areas, and points as nested children @buildLocTree. Fills tree
 * with interactions and continues building the table @getInteractionsAndFillTable.
 */
function buildLocTableTree(topLocs) {                                            //console.log('buildLocTableTree')
    buildLocTree(topLocs);
    getInteractionsAndFillTable();
}
/**
 * Rebuilds loc tree with passed location, or the default top regions, as the
 * base node(s) of the new tree with all sub-locations nested beneath @buildLocTree.
 * Resets 'openRows' and clears tree. Continues @buildLocTableTree.
 */
export function rebuildLocTree(topLoc) {                                        console.log("-------rebuilding loc tree. topLoc = %O", topLoc);
    var topLocs = topLoc || getTopRegionIds();
    tblState.openRows = topLocs.length === 1 ? topLocs : [];
    clearPreviousTable();
    buildLocTableTree(topLocs);
}
/**
 * Builds a tree of location data with passed locations at the top level, and 
 * sub-locations as nested children. Adds the alphabetized tree to the global 
 * tblState obj as 'curTree'. 
 */ 
function buildLocTree(topLocs) {                                                //console.log("passed 'top' locIds = %O", topLocs)
    var topLoc;
    var tree = {};                                                              //console.log("tree = %O", tree);
    topLocs.forEach(function(id){  
        topLoc = _u.getDetachedRcrd(id, tblState.rcrdsById);  
        tree[topLoc.displayName] = getLocChildren(topLoc);
    });  
    tblState.curTree = sortDataTree(tree);
}
/** Returns the location record with all child ids replaced with their records. */
function getLocChildren(rcrd) {   
    if (rcrd.children.length > 0) { 
        rcrd.children = rcrd.children.map(getLocChildData);
    }
    return rcrd;
}
function getLocChildData(childId) {  
    return getLocChildren(_u.getDetachedRcrd(childId, tblState.rcrdsById));
}
/**
 * Builds the Location search comboboxes @loadLocComboboxes. Transform tree
 * data into table rows and load the table @transformLocDataAndLoadTable.
 * Note: This is also the entry point for filter-related table rebuilds.
 */
function buildLocSearchUiAndTable(locTree) {                                    //console.log("buildLocSearchUiAndTable called. locTree = %O", locTree)
    build_tbl_data.transformLocDataAndLoadTable(locTree, tblState);
    loadSearchLocHtml();
}
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
function buildLocSelectOpts() {  console.log('tblState = %O', tblState);
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
    const selected = tblState.selectedOpts;                                      //console.log("selected in setSelectedLocVals = %O", selected);
    Object.keys(selected).forEach(locType => {
        _u.setSelVal(locType, selected[locType], 'silent');
    });
}
/** ------------ Location Map Methods --------------------------------------- */
/** Filters the data-table to the location selected from the map view. */
export function showLocInDataTable(loc) {                                        //console.log('showing Loc = %O', loc);
    updateUiForTableView();
    rebuildLocTree([loc.id]);
    _u.setSelVal('Loc View', 'tree', 'silent');
    updateBttnToReturnRcrdsToTable();
}
/** Initializes the google map in the data table. */
function buildLocMap() {    
    updateUiForMapView();       
    db_map.initMap(tblState.rcrdsById);           
}
/** Switches to map view and centeres map on selected location. */
export function showLocOnMap(geoJsonId, zoom) {
    updateUiForMapView();
    clearCol2();
    _u.setSelVal('Loc View', 'map', 'silent');
    db_map.showLoc(geoJsonId, zoom, tblState.rcrdsById);
}
/**
 * Build an object with all relevant data to display the interactions in the 
 * data-table in map-view. Sends it to the map to handle the display.
 */
function showTableRecordsOnMap() {                                               console.log('-----------showTableRecordsOnMap');
    $('#search-tbl').fadeTo('100', 0.3, () => {
        updateUiForMappingInts();
        storeIntAndLocRcrds();
        db_map.showInts(tblState.curFocus, buildTableLocDataObj(), tblState.rcrdsById);
    });
}
function storeIntAndLocRcrds() {
    const rcrds = _u.getDataFromStorage(['interaction', 'location']);
    tblState.interaction = rcrds.interaction;
    tblState.location = rcrds.location;
}
/**
 * Builds an object sorted by geoJsonId with all interaction data at that location.
 * -> geoJsonId: {locs: [{loc}], ints: [{name: [intRcrds]}], ttl: ## } 
 */
function buildTableLocDataObj() {  
    const mapData = { 'none': { ttl: 0, ints: {}, locs: null }}; 
    let curBaseNodeName; //used for Source rows
    tblState.api.forEachNodeAfterFilter(getIntMapData);
    return mapData;  
    
    function getIntMapData(row) {                         
        if (row.data.treeLvl === 0) { curBaseNodeName = row.data.name; }                         
        if (!row.data.interactions || hasUnspecifiedRow(row.data)) { return; }
        buildInteractionMapData(row.data, _u.getDetachedRcrd(row.data.id, tblState.rcrdsById));
    }
    function buildInteractionMapData(rowData, rcrd) {
        const locs = {/*locId: { loc: loc, ints: [rcrd]*/};
        let noLocCnt = 0;
        const data = { 
            intCnt: 0, 
            name: getRowRcrdName(rowData, rcrd, curBaseNodeName),
            rcrd: rcrd
        };
        rowData.children.forEach(addRowData); //interactions
        addToMapDataObj(data, locs, noLocCnt);
        /** Adds to mapData obj by geoJsonId, or tracks if no location data. */
        function addRowData(intRowData) {  
            if (!intRowData.location) { return ++noLocCnt; }
            const intRcrd = _u.getDetachedRcrd(intRowData.id, tblState.interaction);
            const loc = _u.getDetachedRcrd(intRcrd.location, tblState.location);
            addLocAndIntData(loc, intRcrd);
            ++data.intCnt;
        }
        function addLocAndIntData(newLoc, intRcrd) {
            if (!locs[newLoc.id]) { initLocObj() }
            locs[newLoc.id].ints.push(intRcrd);

            function initLocObj() {
                locs[newLoc.id] = { loc: newLoc, ints: [] }; 
            }
        }
    } /* End buildInteractionMapData */
    function addToMapDataObj(entData, locs, noLocCnt) { 
        mapData.none.ttl += noLocCnt;
        for (let id in locs) {
            addData(locs[id], entData);
        }
    }
    function addData(locObj, entData) {
        const geoId = locObj.loc.geoJsonId;
        if (!geoId) { return mapData.none.ttl += locObj.ints.length; }
        if (!mapData[geoId]) { initDataObj(geoId, locObj.loc); }
        mapData[geoId].ttl += locObj.ints.length;
        addIfNewLoc(locObj.loc, geoId);
        addIntData(locObj, entData, geoId);
    }
    function addIntData(locObj, entData, geoId) {
        const mapDataProp = mapData[geoId].ints[entData.name]
        if (!mapData[geoId].ints[entData.name]) { initIntDataObj(entData, geoId); }
        if (tblState.curRealm == 'auths') { return sanitizeAndAddInt(); }
        addToIntObj(entData.name)

        function addToIntObj(key) {
            mapData[geoId].ints[key] = mapData[geoId].ints[key].concat(locObj.ints);
        }
        /**
         * When author interactions are displayed, they often duplicate if two 
         * authors attrbuted to the same work are shown. This combines the author
         * names in that case, thus showing the interaction once.
         */
        function sanitizeAndAddInt() { 
            const keyStr = entData.name.split(' - (')[1];
            const curAuth = entData.name.split(' - (')[0];
            const toCombine = Object.keys(mapData[geoId].ints).find(
                key => key.includes(keyStr) && !key.includes(curAuth)); 
            if (!toCombine) { addToIntObj(entData.name); 
            } else { modifyAndCombineInt(toCombine, keyStr, curAuth); }
        }
        function modifyAndCombineInt(keyName, work, curAuth) {  
            let auths = keyName.split(' - (')[0]; 
            auths += `, ${curAuth} - (${work}`; 
            mapData[geoId].ints[auths] = mapData[geoId].ints[keyName];
            delete mapData[geoId].ints[keyName];  
        }
    } /* End addIntData */
    function initIntDataObj(entData, geoId) {
        mapData[geoId].ints[entData.name] = [];
    }
    /** Some locations share geoJson with their parent, eg habitats. */
    function addIfNewLoc(newLoc, geoId) {
        const alreadyAdded = mapData[geoId].locs.find(
            loc => loc.displayName === newLoc.displayName); 
        if (alreadyAdded) { return; }  
        mapData[geoId].locs.push(newLoc);
    }
    function initDataObj(geoId, loc) {
        mapData[geoId] = { ints: {/* name: [rcrds] */}, locs: [loc], ttl: 0 };
    }
} /* End buildTableLocDataObj */
function hasUnspecifiedRow(rowData) {
    return rowData.children[0].name.indexOf('Unspecified') !== -1;
}
function getRowRcrdName(rowData, rcrd, baseNode) {
    if (tblState.curFocus === 'srcs') { return getSrcRowName(rowData, rcrd, baseNode)}
    return rowData.name.indexOf('Unspecified') !== -1 ?
        getUnspecifiedRowEntityName(rowData, rcrd) : 
        getRcrdDisplayName(rowData.name, rcrd);
}
/** Adds the base entity name before the name of the work, eg Author (work) */
function getSrcRowName(rowData, rcrd, baseNode) {  
    const work = getRcrdDisplayName(rowData.name, rcrd);
    if (work == baseNode) { return baseNode; }
    return `${baseNode} - (${work})`;
}
function getUnspecifiedRowEntityName(row, rcrd) {
    return tblState.curFocus === 'taxa' ? 
        getTaxonName(rcrd) : getRcrdDisplayName(rcrd.displayName, rcrd);
}
function getRcrdDisplayName(name, rcrd) {
    return name === 'Whole work cited.' ? getParentName(rcrd) : name;
}
function getParentName(rcrd) {  
    return rcrd.displayName.split('(citation)')[0];
}
/* --- End showTableRecordsOnMap --- */
function updateUiForMapView() {
    updateBttnToReturnRcrdsToTable();
    _u.disableTableButtons();
    showPopUpMsg();
    $('#tool-bar').fadeTo(100, 1);
    $('#search-tbl').hide();
    $('#map').show();
}
function updateUiForTableView() {
    $('#search-tbl').fadeTo('100', 1);
    $('#map, #filter-in-tbl-msg').hide();
    _u.enableTableButtons();
    enableComboboxes($('#opts-col1 select, #opts-col2 select'));
    $('#shw-map').attr('disabled', false).css({'opacity': 1, 'cursor': 'pointer'});  
    updateBttnToShowRcrdsOnMap();
}
function updateUiForMappingInts() {
    updateUiForMapView();
    enableComboboxes($('#opts-col1 select, #opts-col2 select'), false);
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
/*------------------Source Search Methods ------------------------------------*/
/**
 * Get all data needed for the Source-focused table from data storage and send  
 * to @initSrcSearchUi to begin the data-table build.  
 */
function buildSrcTable() {
    const entities = [ 'source', 'author', 'publication' ];
    const entityData = _u.getDataFromStorage(entities);
    if( entityData ) { initSrcSearchUi(entityData);
    } else { console.log('Error loading source data from storage.'); }
}

/**
 * If the source-realm combobox isn't displayed, build it @buildSrcRealmHtml.
 * If no realm selected, set the default realm value. Start table build @buildSrcTree.
 */
function initSrcSearchUi(srcData) {                                             //console.log("=========init source search ui");
    addSrcDataToTableParams(srcData);
    if (!$("#sel-realm").length) { buildSrcRealmHtml(); }  
    setSrcRealm();  
}
/** Add source data to tblState to be available while in a source focus. */
function addSrcDataToTableParams(srcData) {
    tblState.rcrdsById = srcData.source;
    tblState.author = srcData.author;
    tblState.publication = srcData.publication;
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
    resetToggleTreeBttn(false);
    startSrcTableBuildChain(val);
}
function startSrcTableBuildChain(val) {
    storeSrcRealm(val);
    buildSrcSearchUiAndTable();
    build_tbl_data.transformSrcDataAndLoadTable(data_tree.buildSrcTree(), tblState);
}
function storeSrcRealm(val) {  
    const realmVal = val || _u.getSelVal('Source Type');                           //console.log("storeAndReturnCurRealmRcrds. realmVal = ", realmVal)
    _u.populateStorage('curRealm', realmVal);
    tblState.curRealm = realmVal;    
}
// /** (Re)builds source tree for the selected source realm. */
// function buildSrcTree(val) {
//     const realmRcrds = storeAndReturnCurRealmRcrds(val);                        //console.log("---Build Source Tree. realmRcrds = %O", realmRcrds);
//     initSrcTree(tblState.curRealm, realmRcrds);
//     getInteractionsAndFillTable();
// }
// /** Returns the records for the source realm currently selected. */
// function storeAndReturnCurRealmRcrds(val) {
//     const valMap = { 'auths': 'authSrcs', 'pubs': 'pubSrcs', 'publ': 'pubSrcs' };
//     const realmVal = val || _u.getSelVal('Source Type');                           //console.log("storeAndReturnCurRealmRcrds. realmVal = ", realmVal)
//     tblState.curRealm = realmVal;    
//     _u.populateStorage('curRealm', realmVal);
//     return getTreeRcrdAry(valMap[realmVal]);
// }
// /** Returns an array with all records from the stored record object. */
// function getTreeRcrdAry(realm) {
//     const srcRcrdIdAry = _u.getDataFromStorage(realm);
//     return srcRcrdIdAry.map(function(id) { return _u.getDetachedRcrd(id, tblState.rcrdsById); });
// }
// /**
//  * Builds the source data tree for the selected source realm (source type) and 
//  * adds it to the global tblState obj as 'curTree', 
//  * NOTE: Sources have three realms and tree-data structures:
//  * Authors->Citations/Publications->Interactions
//  * Publications->Citations->Interactions. 
//  * Publishers->Publications->Citations->Interactions. 
//  */
// function initSrcTree(focus, rcrds) {                                            //console.log("initSrcTree realmRcrds = %O", realmRcrds);
//     const treeMap = { 'pubs': buildPubTree, 'auths': buildAuthTree, 'publ': buildPublTree };
//     let tree = treeMap[focus](rcrds);
//     tblState.curTree = sortDataTree(tree);
// }  
// /*-------------- Publication Source Tree -------------------------------------------*/
// /**
//  * Returns a tree object with Publications as the base nodes of the data tree. 
//  * Each interaction is attributed directly to a citation source, which currently 
//  * always has a 'parent' publication source.
//  * Data structure:
//  * ->Publication Title
//  * ->->Citation Title
//  * ->->->Interactions Records
//  */
// function buildPubTree(pubSrcRcrds) {                                            //console.log("buildPubSrcTree. Tree = %O", pubSrcRcrds);
//     var tree = {};
//     pubSrcRcrds.forEach(function(pub) { 
//         tree[pub.displayName] = getPubData(pub); 
//     });
//     return tree;
// }
// function getPubData(rcrd) {                                                     //console.log("getPubData. rcrd = %O", rcrd);
//     rcrd.children = getPubChildren(rcrd);
//     if (rcrd.publication) {                                                     //console.log("rcrd with pub = %O", rcrd)
//         rcrd.publication = _u.getDetachedRcrd(rcrd.publication, tblState.publication);
//     }
//     return rcrd;
// }
// function getPubChildren(rcrd) {                                                 //console.log("getPubChildren rcrd = %O", rcrd)
//     if (rcrd.children.length === 0) { return []; }
//     return rcrd.children.map(id => getPubData(_u.getDetachedRcrd(id, tblState.rcrdsById)));
// }
// /*-------------- Publisher Source Tree ---------------------------------------*/
// /**
//  * Returns a tree object with Publishers as the base nodes of the data tree. 
//  * Publications with no publisher are added underneath the "Unspecified" base node.
//  * Data structure:
//  * ->Publisher Name
//  * ->->Publication Title
//  * ->->->Citation Title
//  * ->->->->Interactions Records
//  */
// function buildPublTree(pubRcrds) {                                              //console.log("buildPublSrcTree. Tree = %O", pubRcrds);
//     let tree = {};
//     let noPubl = [];
//     pubRcrds.forEach(function(pub) { addPubl(pub); });
//     tree["Unspecified"] = getPubsWithoutPubls(noPubl);
//     return tree;

//     function addPubl(pub) {
//         if (!pub.parent) { noPubl.push(pub); return; }
//         const publ = _u.getDetachedRcrd(pub.parent, tblState.rcrdsById);
//         tree[publ.displayName] = getPublData(publ); 
//     }
// } /* End buildPublTree */
// function getPublData(rcrd) {
//     rcrd.children = getPublChildren(rcrd);
//     return rcrd;
// }
// function getPublChildren(rcrd) {                                                //console.log("getPubChildren rcrd = %O", rcrd)
//     if (rcrd.children.length === 0) { return []; }
//     return rcrd.children.map(id => getPubData(_u.getDetachedRcrd(id, tblState.rcrdsById)));
// }
// function getPubsWithoutPubls(pubs) {
//     let publ = { id: 0, displayName: "Unspecified", parent: null, sourceType: { displayName: 'Publisher' } };
//     publ.children = pubs.map(pub => getPubData(pub));
//     return publ;
// }
// /*-------------- Author Source Tree ------------------------------------------*/
// /**
//  * Returns a tree object with Authors as the base nodes of the data tree, 
//  * with their contributibuted works and the interactions they contain nested 
//  * within. Authors with no contributions are not added to the tree.
//  * Data structure:
//  * ->Author Display Name [Last, First M Suff]
//  * ->->Citation Title (Publication Title)
//  * ->->->Interactions Records
//  */
// function buildAuthTree(authSrcRcrds) {                                          //console.log("----buildAuthSrcTree");
//     var tree = {};
//     for (var id in authSrcRcrds) { 
//         getAuthData(_u.getDetachedRcrd(id, authSrcRcrds)); 
//     }  
//     return tree;  

//     function getAuthData(authSrc) {                                             //console.log("rcrd = %O", authSrc);
//         if (authSrc.contributions.length > 0) {
//             authSrc.author = _u.getDetachedRcrd(authSrc.author, tblState.author);
//             authSrc.children = getAuthChildren(authSrc.contributions); 
//             tree[authSrc.displayName] = authSrc;
//         }
//     }
// } /* End buildAuthTree */
// /** For each source work contribution, gets any additional publication children
//  * @getPubData and return's the source record.
//  */
// function getAuthChildren(contribs) {                                            //console.log("getAuthChildren contribs = %O", contribs);
//     return contribs.map(wrkSrcid => getPubData(_u.getDetachedRcrd(wrkSrcid, tblState.rcrdsById)));
// }
/**
 * Will build the select elems for the source search options. Clears previous 
 * table. Calls @transformSrcDataAndLoadTable to transform tree data into table 
 * format and load the data table.
 * NOTE: This is the entry point for source table rebuilds as filters alter data
 * contained in the data tree.
 */
function buildSrcSearchUiAndTable() {                                     //console.log("buildSrcSearchUiAndTable called. tree = %O", srcTree);
    const buildUi = { 'auths': loadAuthSearchHtml, 'pubs': loadPubSearchHtml, 
        'publ':loadPublSearchHtml };
    clearPreviousTable();
    buildUi[tblState.curRealm](); 
    // build_tbl_data.transformSrcDataAndLoadTable(srcTree, tblState);
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
/*================ Table Build Methods ==============================================*/
// /**
//  * Fills additional columns with flattened taxon-tree parent chain data for csv exports.
//  *
//  */
function fillHiddenTaxonColumns(curTaxonTree) {                                 //console.log('fillHiddenTaxonColumns. curTaxonTree = %O', curTaxonTree);
    var curTaxonHeirarchy = {};
    var lvls = Object.keys(_u.getDataFromStorage('levelNames'));                //console.log('lvls = %O', lvls);
    getTaxonDataAtTreeLvl(curTaxonTree);

    function getTaxonDataAtTreeLvl(treeLvl) {
        for (var topTaxon in treeLvl) {                                         //console.log('curTaxon = %O', treeLvl[topTaxon])
            syncTaxonHeir( treeLvl[topTaxon] ); 
            fillInteractionRcrdsWithTaxonTreeData( treeLvl[topTaxon] );
            if (treeLvl[topTaxon].children) { 
                getTaxonDataAtTreeLvl( treeLvl[topTaxon].children ); }             
        }
    }
    /**
     * This method keeps the curTaxonChain obj in sync with the taxon being processed.  
     * For each taxon, all level more specific that the parent lvl are cleared.
     * Note: The top taxon for the realm inits the taxon chain obj. 
     */
    function syncTaxonHeir(taxon) {                        
        var lvl = taxon.level.displayName;
        var prntId = taxon.parent;                                              //console.log("syncTaxonHeir TAXON = [%s], LVL = [%s] prntId = ",taxonName, lvl, prntId);
        if (!prntId || prntId === 1) { fillInAvailableLevels(lvl);
        } else { clearLowerLvls(tblState.rcrdsById[prntId].level.displayName); }
        curTaxonHeirarchy[lvl] = taxon.displayName;
    }
    /**
     * Inits the taxonomic-rank object that will be used to track the parent
     * chain of each taxon being processed. 
     */
    function fillInAvailableLevels(topLvl) { 
        var topIdx = lvls.indexOf(topLvl);
        for (var i = topIdx; i < lvls.length; i++) { 
            curTaxonHeirarchy[lvls[i]] = null;
        }  
    }
    function clearLowerLvls(parentLvl) {
        var topIdx = lvls.indexOf(parentLvl);
        for (var i = ++topIdx; i < lvls.length; i++) { curTaxonHeirarchy[lvls[i]] = null; }
    }
    function fillInteractionRcrdsWithTaxonTreeData(taxon) {                     //console.log('curTaxonHeirarchy = %O', JSON.parse(JSON.stringify(curTaxonHeirarchy)));
        $(['subjectRoles', 'objectRoles']).each(function(i, role) {             //console.log('role = ', role)
            if (taxon[role].length > 0) { taxon[role].forEach(addTaxonTreeFields) }
        });
    } 
    function addTaxonTreeFields(intRcrdObj) {                               
        for (var lvl in curTaxonHeirarchy) {
            var colName = 'tree' + lvl; 
            intRcrdObj[colName] = lvl === 'Species' ? 
                getSpeciesName(curTaxonHeirarchy[lvl]) : curTaxonHeirarchy[lvl];
        }                                                                       //console.log('intRcrd after taxon fill = %O', intRcrdObj);
    }
    function getSpeciesName(speciesName) {
        return speciesName === null ? null : _u.ucfirst(curTaxonHeirarchy['Species'].split(' ')[1]);
    }
} /* End fillHiddenColumns */
/*================= Utility ==================================================*/
function clearCol2() {
    $('#opts-col2').empty();
}
function showPopUpMsg(msg) {                                                    //console.log("showPopUpMsg. msg = ", msg)
    const popUpMsg = msg || 'Loading...';
    $('#db-popup').text(popUpMsg);
    $('#db-popup').addClass('loading'); //used in testing
    $('#db-popup, #db-overlay').show();
    _u.fadeTable();
}
// function hidePopUpMsg() {
//     $('#db-popup, #db-overlay').hide();
//     $('#db-popup').removeClass('loading'); //used in testing
//     showTable();
// }
// function showTable() {
//     $('#borderLayout_eRootPanel, #tool-bar').fadeTo(100, 1);
// }
// /** Sorts the all levels of the data tree alphabetically. */
// function sortDataTree(tree) {
//     var sortedTree = {};
//     var keys = Object.keys(tree).sort();    

//     for (var i=0; i<keys.length; i++){ 
//         sortedTree[keys[i]] = sortNodeChildren(tree[keys[i]]);
//     }
//     return sortedTree;

//     function sortNodeChildren(node) { 
//         if (node.children) {  
//             node.children = node.children.sort(alphaEntityNames);
//             node.children.forEach(sortNodeChildren);
//         }
//         return node;
//     } 
// } /* End sortDataTree */
// /** Alphabetizes array via sort method. */
// function alphaEntityNames(a, b) {                                               //console.log("alphaSrcNames a = %O b = %O", a, b);
//     var x = a.displayName.toLowerCase();
//     var y = b.displayName.toLowerCase();
//     return x<y ? -1 : x>y ? 1 : 0;
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
function enableComboboxes($pElems, enable) {
    $pElems.each((i, elem) => { enableCombobox(enable, '#'+elem.id) });
}
function enableCombobox(enable, selId) {
    if (enable === false) { return $(selId)[0].selectize.disable(); }
    $(selId)[0].selectize.enable();
}
/*--------------------- Table Button Methods ------------------------------*/
/**
 *  * REFACT NOTE:: table-bttns.js
 */
function toggleExpandTree() {                                                   //console.log("toggleExpandTree")
    var expanded = $('#xpand-all').data('xpanded');
    $('#xpand-all').data("xpanded", !expanded);
    return expanded ? collapseTree() : expandTree();
}
function expandTree() {
    tblState.api.expandAll();    
    $('#xpand-all').html("Collapse All");
}
function collapseTree() {
    tblState.api.collapseAll();
    $('#xpand-all').html("Expand All");
}
/**
 * Resets button based on passed boolean xpanded state. True for fully 
 * expanded and false when collapsed.
 */
export function resetToggleTreeBttn(xpanded) {
    var bttnText = xpanded ? "Collapse All" : "Expand All"; 
    $('#xpand-all').html(bttnText);
    $('#xpand-all').data("xpanded", xpanded);
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
    var tblModel = tblState.api.getModel();                                      //console.log("tblModel = %O", tblModel);
    var bttXpandedAll = $("#xpand-all").data('xpanded');
    if (opening && bttXpandedAll === true) {return;}

    tblModel.rowsToDisplay.forEach(function(row) {                             //console.log("rowToDisplay = %O", row)
        if (!opening && !isNextOpenLeafRow(row)) { return; }
        row.expanded = opening;
        row.data.open = opening;
    });
    tblState.api.onGroupExpandedOrCollapsed();
    updateToggleTreeButton();
    /**
     * Checks displayed rows against total rows after filters to determine
     * if there are any closed rows remaining. The toggle tree button is updated 
     * if necessary.
     */
    function updateToggleTreeButton() {
        var shownRows = tblModel.rowsToDisplay.length; 
        var allRows = getCurTreeRowCount();
        var closedRows = shownRows < allRows;                                   //console.log("%s < %s ? %s... treeBttn = %s ", shownRows, allRows, closedRows, bttXpandedAll);

        if (!closedRows) { resetToggleTreeBttn(true); 
        } else if (bttXpandedAll === true) { resetToggleTreeBttn(false); }
    }
} /* End toggleTreeByOneLvl */
function getCurTreeRowCount() {
    var cnt = 0;
    tblState.api.forEachNodeAfterFilter(function(node){ cnt += 1; }); 
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
/*----------------- Table Manipulation ------------------------------------------*/
/** 
 * Table-rebuild entry point after form-window close. 
 *
 
 */
function resetDataSearchTable(focus) {                                          //console.log('resetting search table.')
    resetToggleTreeBttn(false);
    db_filters.resetFilterStatusBar();
    if ($('#shw-chngd')[0].checked) { db_filters.toggleTimeUpdatedFilter('disable'); }
    selectSearchFocus(focus);
}
/** Refactor: combine with resetDataSearchTable. */
export function initDataTable(focus) {                                          //console.log('resetting search table.')
    resetDataSearchTable(focus);
    updateUiForTableView();
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
    resetToggleTreeBttn(false); 
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
        updateUiForTableView();
        tableBuilder();
    }
} /* End clearPastHtmlOptions */
/**
 * When the interaction form is exited, the passed focus is selected and the 
 * table is refreshed with the 'interactions updates since' filter set to 'today'.
 *
 * REFACT NOTE:: FORM EXIT METHOD
 */
function showTodaysUpdates(focus) {                                             //console.log("showingUpdated from today")
    if (focus) { _u.setSelVal('Focus', focus); 
    } else { selectSearchFocus(); }
    window.setTimeout(showUpdatesAfterTableLoad, 200);
}
function showUpdatesAfterTableLoad() {
    $('#shw-chngd')[0].checked = true;
    db_filters.toggleTimeUpdatedFilter();
}
export function showUpdates(focus) {
    showTodaysUpdates(focus);
}
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
    resetToggleTreeBttn(false);
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