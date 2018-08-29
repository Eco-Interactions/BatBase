/**
 * The Database Search page entry point. The data table is built to display the 
 * eco-interaction records organized by a selected "focus": taxa (grouped further 
 * by realm: bat, plant, arthropod), locations, or sources (grouped by either 
 * authors, publications, or publishers). The data map displays interactions
 * geographically. Filtered interactions can be viewed in either form. 
 * Exports:
 *     handleReset
 *     initSearchPage
 *     initDataTable
 *     showUpdates
 *          
 */
import * as _util from '../misc/util.js';
import * as db_sync from './db-sync.js';
import * as db_forms from './db-forms.js';
import * as db_map from './db-map.js';
import * as agGrid from '../../grid/ag-grid.js';
import * as db_tips from './tips.js';
/**
 * userRole = Stores the role of the user.
 * dataStorage = window.localStorage (sessionStorage for tests)
 * misc = Container for misc data used at the global level--
 *      cal: Stores the flatpickr calendar instance. 
 *      cstmTimeFltr: Stores the specified datetime for the time-updated filter.
 *      intro: Stores an active tutorial/walk-through instance.
 * columnDefs = Array of column definitions for the table.
 * tParams = obj container for misc params used for the search table.
 * dataKey = String checked in data storage to indicate whether the stored 
 *      data should be cleared and redownloaded.
 */
let userRole, dataStorage, misc = {}, columnDefs = [], tParams = {}; 
const dataKey = 'Live for Justice!!!!! <3<3<3';
const tblOpts = getDefaultTblOpts();

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
    dataStorage = _util.getDataStorage();  
    db_sync.init();
    clearDataStorageCheck();
    showPopUpMsg('Loading...');
    addDomEventListeners();
    adaptUiToScreenSize();
    authDependentInit();
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
    _util.populateStorage(dataKey, true);
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
    _util.populateStorage(dataKey, true);
    _util.populateStorage('curFocus', prevFocus);
}
/** ------------- Page Init --------------------------------------------- */
/**
 * The first time a browser visits the search page, all data is downloaded
 * from the server and stored in dataStorage. The intro-walkthrough is shown 
 * for the user @showIntroWalkthrough.
 */
export function initSearchPage() {
    showLoadingDataPopUp();
    db_tips.startWalkthrough(tParams.curFocus);
}
/** Shows a loading popup message for the inital data-download wait. */
function showLoadingDataPopUp() {
    showPopUpMsg("Downloading and caching all interaction records. Please " +
        "allow for a ~30 second download.");   
}
function addDomEventListeners() {
    $('button[name="xpand-all"]').click(toggleExpandTree);
    $('button[name="xpand-1"]').click(expandTreeByOne);
    $('button[name="collapse-1"]').click(collapseTreeByOne);
    $('button[name="reset-tbl"]').click(resetDataTable);
    $('#shw-map').click(showTableRecordsOnMap);
    $('#shw-chngd').change(toggleTimeUpdatedFilter);
    $('#fltr-tdy').change(filterInteractionsByTimeUpdated);
    $('#fltr-cstm').change(filterInteractionsByTimeUpdated);
}
function authDependentInit() {
    userRole = $('body').data("user-role");                                     //console.log("----userRole === visitor ", userRole === "visitor")
    if (userRole === "visitor") {
        $('button[name="csv"]').prop('disabled', true);
        $('button[name="csv"]').prop('title', "Register to download.");
        $('button[name="csv"]').css({'opacity': '.8', 'cursor': 'not-allowed' });
    } else { $('button[name="csv"]').click(exportCsvData); }
}
/** Moves the buttons from the end of the search options panel to just beneath. */
function adaptUiToScreenSize() {
    if ($(window).width() > 1500) { return; }
    var elemCntnr = $('#opts-col4').detach();  
    var cntnr = _util.buildElem('div', { class: 'flex-row' });
    $(cntnr).css({ width: '100%', 'justify-content': 'flex-end' });
    $(elemCntnr)[0].className = 'flex-row';
    $(cntnr).append(elemCntnr);
    $('#search-opts').after(cntnr);
}
/*-------------------- Top "State" Managment Methods -------------------------*/
function initSearchState() {
    resetTableParams();
    toggleTimeUpdatedFilter('disable');
    resetFilterStatusBar();      
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
 */
function resetTableParams() {  
    tParams = {}; 
    tParams.curFocus = getResetFocus();  
    tParams.openRows = [];                                                      //console.log("tParams = %O", tParams);
}
function getResetFocus() {
    const foci = ['locs', 'srcs', 'taxa'];
    const storedFocus = dataStorage.getItem('curFocus');
    return foci.indexOf(storedFocus) !== -1 ? storedFocus : 'taxa';
}
/** Selects either Taxon, Location or Source in the table-focus dropdown. */
function selectInitialSearchFocus() {                                           //console.log('--------------selectInitialSearchFocus')
    $('#filter-opts').show(400);  
    initCombobox('Focus');
    setSelVal('Focus', tParams.curFocus, 'silent');
    $('#sort-opts').show(400);
    selectSearchFocus();
}
function setUpFutureDevInfoBttn() {
    const bttn = _util.buildElem('button', { name: 'futureDevBttn', 
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

/*------------------ Interaction Search Methods--------------------------------------*/
/**
 * If interaction data is already in data storage, the data is sent to 
 * @fillTreeWithInteractions to begin rebuilding the data table. Otherwise, 
 * an ajax call gets the data which is stored @storeInteractions before being
 * sent to @fillTreeWithInteractions.    
 */
function getInteractionsAndFillTable() {                                         //console.log("getInteractionsAndFillTable called. Tree = %O", tParams.curTree);
    var entityData = _util.getDataFromStorage('interaction');
    fadeTable();
    if (entityData) { fillTreeWithInteractions(entityData); 
    } else { console.log("Error loading interaction data from storage."); }
}
/**
 * Fills the current tree data with interaction records @fillTree and starts 
 * the table-building method chain for the current focus @buildTable. Finally, 
 * calls @finishTableAndUiLoad for the final stage of the build. 
 */
function fillTreeWithInteractions(intRcrds) {                                   //console.log("fillTreeWithInteractionscalled.");
    const focus = tParams.curFocus; 
    const curTree = tParams.curTree; 
    fillTree(focus, curTree, intRcrds);
    buildTable(focus, curTree);
    finishTableAndUiLoad();
} 
/** Replaces all interaction ids with records for every node in the tree.  */
function fillTree(focus, curTree, intRcrds) {  
    const intEntities = ['taxon', 'location', 'source'];
    const entityData = _util.getDataFromStorage(intEntities);
    const fillMethods = { taxa: fillTaxonTree, locs: fillLocTree, srcs: fillSrcTree };
    fillMethods[focus](curTree, intRcrds);

    function fillTaxonTree(curTree) {                                           //console.log("fillingTaxonTree. curTree = %O", curTree);
        fillTaxaInteractions(curTree);  
        fillHiddenTaxonColumns(curTree, intRcrds);

        function fillTaxaInteractions(treeLvl) {                                //console.log("fillTaxonInteractions called. taxonTree = %O", curTree) 
            for (let taxon in treeLvl) {   
                fillTaxonInteractions(treeLvl[taxon]);
                if (treeLvl[taxon].children !== null) { 
                    fillTaxaInteractions(treeLvl[taxon].children); }
            }
        }
        function fillTaxonInteractions(taxon) {                                 //console.log("fillTaxonInteractions. taxon = %O", taxon);
            const roles = ['subjectRoles', 'objectRoles'];
            for (let r in roles) {
                taxon[roles[r]] = replaceInteractions(taxon[roles[r]]); 
            }
        }
    } /* End fillTaxonTree */
    /**
     * Recurses through each location's 'children' property and replaces all 
     * interaction ids with the interaction records.
     */
    function fillLocTree(treeBranch) {                                          //console.log("fillLocTree called. taxonTree = %O", treeBranch) 
        for (let curNode in treeBranch) {                                       //console.log("curNode = %O", treeBranch[curNode]);
            if (treeBranch[curNode].interactions.length > 0) { 
                treeBranch[curNode].interactions = replaceInteractions(treeBranch[curNode].interactions); }
            if (treeBranch[curNode].children) { 
                fillLocTree(treeBranch[curNode].children); }
        }
    }
    /**
     * Recurses through each source's 'children' property until finding the
     * direct source, then replacing its interaction id's with their records.
     */
    function fillSrcTree(curTree) { 
        for (let srcName in curTree) {                                          //console.log("-----processing src %s = %O. children = %O", srcName, curTree[srcName], curTree[srcName].children);
            fillSrcInteractions(curTree[srcName]);
        }
        /**
         * Recurses through each source's 'children' property until all sources 
         * have any interaction ids replaced with the interaction records. 
         */
        function fillSrcInteractions(curSrc) {                                  //console.log("fillSrcInteractions. curSrc = %O. parentSrc = %O", curSrc, parentSrc);
            const srcChildren = [];
            if (curSrc.isDirect) { replaceSrcInts(curSrc); }
            curSrc.children.forEach(function(childSrc){
                fillSrcInteractions(childSrc); 
            });
        }
        function replaceSrcInts(curSrc) {
            curSrc.interactions = replaceInteractions(curSrc.interactions); 
        }

    } /* End fillSrcTree */
    /** Replace the interaction ids with their interaction records. */
    function replaceInteractions(interactionsAry) {                             //console.log("replaceInteractions called. interactionsAry = %O", interactionsAry);
        return interactionsAry.map(function(intId){
            if (typeof intId === "number") {                                    //console.log("new record = %O",  _util.snapshot(intRcrds[intId]));
                return fillIntRcrd(getDetachedRcrd(intId, intRcrds)); 
            }  console.log("####replacing interactions a second time? Ary = %O", interactionsAry);
        });
    }
    /** Returns a filled record with all references replaced with entity records. */
    function fillIntRcrd(intRcrd) {
        for (let prop in intRcrd) { 
            if (prop in entityData) { 
                intRcrd[prop] = entityData[prop][intRcrd[prop]];
            } else if (prop === "subject" || prop === "object") {
                intRcrd[prop] = entityData.taxon[intRcrd[prop]];
            } else if (prop === "tags") {
                intRcrd[prop] = intRcrd[prop].length > 0 ? 
                    getIntTags(intRcrd[prop]) : null;
            }
        }
        return intRcrd;
    }
    function getIntTags(tagAry) { 
        const tags = tagAry.map(function(tag){ return tag.displayName; });
        return tags.join(", ");
    }
} /* End fillTree */
/** Calls the start of the table-building method chain for the current focus. */
function buildTable(focus, curTree) {
    const tblBuilderMap = { 
        locs: buildLocSearchUiAndTable,  srcs: buildSrcSearchUiAndTable,
        taxa: buildTaxonSearchUiAndTable 
    };    
    tblBuilderMap[focus](curTree);
}
/** Returns an interaction rowData object with flat data in table-ready format. */
function buildIntRowData(intRcrd, treeLvl, idx){                                //console.log("intRcrd = %O", intRcrd);
    var rowData = {
        isParent: false,
        name: "",
        treeLvl: treeLvl,
        type: "intRcrd", 
        id: intRcrd.id,
        entity: "Interaction",
        interactionType: intRcrd.interactionType.displayName,
        citation: intRcrd.source.description,
        subject: getTaxonName(intRcrd.subject),
        object: getTaxonName(intRcrd.object),
        tags: intRcrd.tags,
        note: intRcrd.note, 
        rowColorIdx: idx,
        updatedAt: intRcrd.updatedAt
    };
    if (intRcrd.location) { getLocationData(intRcrd.location); }
    return rowData;
    /** Adds to 'rowData' any location properties present in the intRcrd. */
    function getLocationData(locObj) {
        getSimpleLocData();
        getOtherLocData();
        /** Add any present scalar location data. */
        function getSimpleLocData() {
            var props = {
                location: 'displayName',    gps: 'gpsData',
                elev: 'elevation',          elevMax: 'elevationMax',
                lat: 'latitude',            lng: 'longitude',
            };
            for (var p in props) {
               if (locObj[props[p]]) { rowData[p] = locObj[props[p]]; } 
            }
        }
        /** Adds relational location data. Skips 'unspecified' regions. */
        function getOtherLocData() {
            var props = {
                country: "country",         region: "region",
                habitat: "habitatType"          
            };
            for (var p in props) {
                if (locObj[props[p]]) { 
                    if (p === "region" && locObj[props[p]].displayName === "Unspecified") { continue; }
                    rowData[p] = locObj[props[p]].displayName; } 
            }                
        }
    } /* End getLocationData */
} /* End buildIntRowData */
function getTaxonName(taxon) {                                           
    var lvl = taxon.level.displayName;  
    return lvl === "Species" ? taxon.displayName : lvl+' '+taxon.displayName;
}   
/*------------------ Taxon Search Methods ------------------------------------*/
/**
 * Get all data needed for the Taxon-focused table from data storage and send 
 * to @initTaxonSearchUi to begin the data-table build.  
 */
function buildTaxonTable() {                                                     //console.log("Building Taxon Table.");
    var data = _util.getDataFromStorage(['realm', 'taxon', 'level']); 
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
    tParams.rcrdsById = data.taxon;
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
    if (!getSelVal('Taxon Realm')) { 
        realmVal = storedRealm !== null ? storedRealm : "3";  
        setSelVal('Taxon Realm', realmVal, 'silent');
    }
}
/**
 * Stores in the global tParams obj:
 * > taxonByLvl - object with taxon records in the current tree organized by 
 *   level and keyed under their display name.
 * > allRealmLvls - array of all levels present in the current realm tree.
 */
function storeLevelData(topTaxon) {
    tParams["taxaByLvl"] = seperateTaxonTreeByLvl(topTaxon);                    //console.log("taxaByLvl = %O", tParams.taxaByLvl)
    tParams["allRealmLvls"] = Object.keys(tParams.taxaByLvl);
}
function updateTaxaByLvl(topTaxon) {
    tParams["taxaByLvl"] = seperateTaxonTreeByLvl(topTaxon);                    //console.log("taxaByLvl = %O", tParams.taxaByLvl)
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
        var levels = Object.keys(_util.getDataFromStorage('levelNames'));       //console.log("levels = %O", levels)
        var obj = {};
        levels.forEach(function(lvl){
            if (lvl in taxonObj) { obj[lvl] = taxonObj[lvl]; }
        });
        return obj;
    }
} /* End seperateTaxonTreeByLvl */
/** Event fired when the taxon realm select box has been changed. */
function onTaxonRealmChange(val) {  
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
    const realmId = val || getSelValOrDefault(getSelVal('Taxon Realm'));        //console.log('storeAndReturnRealm. val [%s], realmId [%s]', val, realmId)
    const realmTaxonRcrd = getDetachedRcrd(realmId);                            console.log("realmTaxon = %O", realmTaxonRcrd);
    const realmLvl = realmTaxonRcrd.level;
    _util.populateStorage('curRealm', realmId);
    tParams.curRealm = realmId;
    tParams.realmLvl = realmLvl;
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
function rebuildTaxonTree(topTaxon, realmInit) {                                //console.log("realmTaxon=%O", realmTaxon)
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
    tParams.openRows = [topTaxon.id.toString()];                                //console.log("openRows=", openRows)
}
/**
 * Returns a heirarchical tree of taxon record data from the top, parent, 
 * realm taxon through all children. The tree is stored as 'curTree' in the 
 * global tParams obj. 
 */
function buildTaxonTree(topTaxon) {                                             //console.log("buildTaxonTree called for topTaxon = %O", topTaxon);
    var tree = {};                                                              //console.log("tree = %O", tree);
    tree[topTaxon.displayName] = topTaxon;  
    topTaxon.children = getChildTaxa(topTaxon.children);    
    tParams.curTree = tree;  
    /**
     * Recurses through each taxon's 'children' property and returns a record 
     * for each child ID found. 
     */
    function getChildTaxa(children) {                                           //console.log("getChildTaxa called. children = %O", children);
        if (children === null) { return null; }
        return children.map(function(child){
            if (typeof child === "object") { return child; }

            var childRcrd = getDetachedRcrd(child);                             //console.log("child = %O", child);
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
function buildTaxonSearchUiAndTable(taxonTree) {                                   //console.log("taxaByLvl = %O", tParams.taxaByLvl);
    loadTaxonComboboxes();
    transformTaxonDataAndLoadTable(taxonTree);
} 
/*------------------ Build Taxon Search Ui --------------------------------*/
/**
 * Builds the select box for the taxon realms that will become the data tree 
 * nodes displayed in the table.
 */
function buildTaxonRealmHtml(data) {                                            //console.log("buildTaxonRealmHtml called. ");
    const browseElems = _util.buildElem('span', { id:'sort-taxa-by', 
        class: 'flex-row', text: 'Group Taxa by: ' });
    const opts = getRealmOpts(data);                                            //console.log("realmOpts = %O", realmOpts);
    $(browseElems).append(newSelEl(opts, 'opts-box', 'sel-realm', 'Taxon Realm'));
    $('#sort-opts').append(browseElems);
    initCombobox('Taxon Realm');
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
    const curTaxaByLvl = tParams.taxaByLvl;                                     //console.log("curTaxaByLvl = %O", curTaxaByLvl);
    const lvlOptsObj = buildTaxonSelectOpts(curTaxaByLvl);
    const levels = Object.keys(lvlOptsObj);
    if (levels.indexOf(tParams.realmLvl) !== -1) { levels.shift(); } //Removes realm level
    loadLevelSelects(lvlOptsObj, levels);
}
/**
 * Builds select options for each level with taxon data in the current realm.
 * If there is no data after filtering at a level, a 'none' option obj is built
 * and will be selected.
 */
function buildTaxonSelectOpts(rcrdsByLvl) {                                     //console.log("buildTaxonSelectOpts rcrds = %O", rcrdsByLvl);
    const optsObj = {};
    const curRealmLvls = tParams.allRealmLvls.slice(1);                           //console.log("curRealmLvls = %O", curRealmLvls) //Skips realm lvl 
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
        if (lvl in tParams.selectedVals) {
            const taxon = getDetachedRcrd(tParams.selectedVals[lvl]);
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
    initComboboxes(tParams.allRealmLvls.slice(1));
    setSelectedTaxonVals(tParams.selectedVals);
    
    function buildTaxonSelects(opts, levels) {  
        const elems = [];
        levels.forEach(function(level) {                                        //console.log('----- building select box for level = [%s]', level);
            const lbl = _util.buildElem('label', { class: 'lbl-sel-opts flex-row' });
            const span = _util.buildElem('span', { text: level + ': ' });
            const sel = newSelEl(opts[level], 'opts-box', 'sel' + level, level);
            $(sel).css('width', '142px');
            $(lbl).css('margin', '.3em 0em 0em.3em').append([span, sel]);
            elems.push(lbl);
        });
        return elems;
    }
}
function setSelectedTaxonVals(selected) {                                       //console.log("selected in setSelectedTaxonVals = %O", selected);
    if (selected === undefined) {return;}
    tParams.allRealmLvls.forEach(function(lvl) {                                //console.log("lvl ", lvl)
        if (!selected[lvl]) { return; }                                                   //console.log("selecting = ", lvl, selected[lvl])
        setSelVal(lvl, selected[lvl], 'silent');
    });
}
/*-------- Taxon Data Formatting ------------------------------------------*/
/**
 * Transforms the tree's taxon record data into the table format and sets the 
 * row data in the global tParams object as 'rowData'. Calls @loadTable.
 */
function transformTaxonDataAndLoadTable(taxonTree) {                             //console.log("transformTaxonDataAndLoadTable called. taxonTree = %O", taxonTree)
    var finalRowData = [];
    for (var topTaxon in taxonTree) {
        finalRowData.push( getTaxonRowData(taxonTree[topTaxon], 0) );
    }
    tParams.rowData = finalRowData;                                             //console.log("rowData = %O", finalRowData);
    loadTable("Taxon Tree");
}
/**
 * Recurses through each taxon's 'children' property and returns a row data obj 
 * for each taxon in the tree.
 */
function getTaxonRowData(taxon, treeLvl) {                                      //console.log("taxonRowData. taxon = %O", taxon);
    var lvl = taxon.level.displayName;
    var name = lvl === "Species" ? taxon.displayName : lvl+" "+taxon.displayName;
    var intCount = getIntCount(taxon); 
    return {
        id: taxon.id,
        entity: "Taxon",
        name: name,
        isParent: true,                     
        parentTaxon: taxon.parent && taxon.parent > 1 ? taxon.parent : false,
        open: tParams.openRows.indexOf(taxon.id.toString()) !== -1, 
        children: getTaxonChildRowData(taxon, treeLvl),
        treeLvl: treeLvl,
        interactions: intCount !== null,          
        intCnt: intCount,   
    }; 
} /* End getTaxonRowData */
/**
 * Checks whether this taxon has interactions in either the subject or object
 * roles. Returns the interaction count if any records are found, null otherwise. 
 */
function getIntCount(taxon) {
    var roles = ["subjectRoles", "objectRoles"];
    var intCnt = 0;
    roles.forEach(function(role) { intCnt += taxon[role].length; });
    return intCnt > 0 ? intCnt : null;
} 
/**
 * Returns both interactions for the curTaxon and rowData for any children.
 * The interactions for non-species Taxa are grouped as the first child row 
 * under "Unspecified [taxonName] Interactions", for species the interactions 
 * are added as rows directly beneath the taxon.
 */
function getTaxonChildRowData(curTaxon, curTreeLvl) {
    var childRows = [];

    if (curTaxon.level.id !== 7){ //Species
        getUnspecifiedInts(curTreeLvl);
        if (curTaxon.children && curTaxon.children.length) { 
            getTaxonChildRows(curTaxon.children); 
        }
    } else { childRows = getTaxonIntRows(curTaxon, curTreeLvl); }
    return childRows;

    function getUnspecifiedInts(curTreeLvl) {
        var realmMap = { '2': 'Bat', '3': 'Plant', '4': 'Arthropod' };  
        var name = curTaxon.id in realmMap ?  
            realmMap[curTaxon.id] : curTaxon.displayName;
        getUnspecifiedTaxonInts(name, curTreeLvl);
    }
    /**
     * Groups interactions attributed directly to a taxon with child-taxa
     * and adds them as it's first child row. 
     * Note: Realm interactions are built closed, otherwise they would be expanded
     * by default
     */
    function getUnspecifiedTaxonInts(taxonName, treeLvl) { 
        var realmIds = ["2", "3", "4"];  
        if (getIntCount(curTaxon) !== null) { 
            childRows.push({
                id: curTaxon.id,
                entity: "Taxon",
                name: 'Unspecified ' + taxonName + ' Interactions',
                isParent: true,
                open: realmIds.indexOf(curTaxon.id) === -1 ? false : 
                    tParams.openRows.indexOf(curTaxon.id.toString()) !== -1,
                children: getTaxonIntRows(curTaxon, treeLvl),
                treeLvl: treeLvl,
                interactions: true,
                groupedInts: true
            });
        }
    }
    function getTaxonChildRows(children) {
        children.forEach(function(childTaxon){
            childRows.push( getTaxonRowData(childTaxon, curTreeLvl + 1));
        });
    }
} /* End getTaxonChildRowData */
function getTaxonIntRows(taxon, treeLvl) {                                      //console.log("getTaxonInteractions for = %O", taxon);
    var ints = [];
    ['subjectRoles', 'objectRoles'].forEach(function(role) {
        taxon[role].forEach(function(intRcrd){
            ints.push( buildTaxonIntRowData(intRcrd, treeLvl) );
        });
    });
    return ints;
}
/** Adds the taxon heirarchical data to the interactions row data. */ 
function buildTaxonIntRowData(intRcrd, treeLvl) {
    var rowData = buildIntRowData(intRcrd, treeLvl);
    getCurTaxonLvlCols().forEach(function(colName){
        rowData[colName] = intRcrd[colName];
    });
    return rowData;                
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
    var locDataStorageProps = [
        'location', 'locationType', 'topRegionNames', 'countryNames', 'regionNames'
    ];
    return _util.getDataFromStorage(locDataStorageProps);
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
    setSelVal('Loc View', locRealm, 'silent');
}
function addLocDataToTableParams(data) {
    tParams.rcrdsById = data.location;                                    
    tParams.data = data;
}
function buildLocViewHtml() {                   
    const span = _util.buildElem('span', { id:'grid-view', class: 'flex-row',
        text: 'View all as: ' });
    const sel = newSelEl(getViewOpts(), 'opts-box', 'sel-realm', 'Loc View');
    $('#sort-opts').append([span, sel]);
    initCombobox('Loc View');
    $('#sort-opts').fadeTo(0, 1);

    function getViewOpts() {
        return [{ value: 'map', text: 'Map Data' },
                { value: 'tree', text: 'Table Data' }];   
    } 
} /* End buildLocViewHtml */
function onLocViewChange(val) {
    if (!val) { return; }
    updateLocView(val);
}
/** 
 * Event fired when the source realm select box has been changed.
 * An optional calback (cb) will redirect the standard map-load sequence.
 */
function updateLocView(v) {                                                     
    const val = v || getSelVal('Loc View');                                     console.log('updateLocView. view = [%s]', val);
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
    _util.populateStorage('curRealm', view);                      
    return view === 'tree' ? buildLocTableTree(regions) : buildLocMap();
}
function getTopRegionIds() {
    const ids = [];
    const regions = tParams.data.topRegionNames;
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
function rebuildLocTree(topLoc) {                                               //console.log("-------rebuilding loc tree. topLoc = %O", topLoc);
    var topLocs = topLoc || getTopRegionIds();
    tParams.openRows = topLocs.length === 1 ? topLocs : [];
    clearPreviousTable();
    buildLocTableTree(topLocs);
}
/**
 * Builds a tree of location data with passed locations at the top level, and 
 * sub-locations as nested children. Adds the alphabetized tree to the global 
 * tParams obj as 'curTree'. 
 */ 
function buildLocTree(topLocs) {                                                //console.log("passed 'top' locIds = %O", topLocs)
    var topLoc;
    var tree = {};                                                              //console.log("tree = %O", tree);
    topLocs.forEach(function(id){  
        topLoc = getDetachedRcrd(id);  
        tree[topLoc.displayName] = getLocChildren(topLoc);
    });  
    tParams.curTree = sortDataTree(tree);
}
/** Returns the location record with all child ids replaced with their records. */
function getLocChildren(rcrd) {   
    if (rcrd.children.length > 0) { 
        rcrd.children = rcrd.children.map(getLocChildData);
    }
    return rcrd;
}
function getLocChildData(childId) {  
    return getLocChildren(getDetachedRcrd(childId));
}
/**
 * Builds the Location search comboboxes @loadLocComboboxes. Transform tree
 * data into table rows and load the table @transformLocDataAndLoadTable.
 * Note: This is also the entry point for filter-related table rebuilds.
 */
function buildLocSearchUiAndTable(locTree) {                                     //console.log("buildLocSearchUiAndTable called. locTree = %O", locTree)
    transformLocDataAndLoadTable(locTree);
    loadLocComboboxes();
}
/**
 * Create and append the location search comboboxes, Region and Country, and
 * set any previously 'selected' values.
 */
function loadLocComboboxes() {  
    const opts = buildLocSelectOpts();
    var selElems = buildLocSelects(opts);
    clearCol2();        
    $('#opts-col2').append(selElems);
    initComboboxes(['Region', 'Country']);
    setSelectedLocVals();
}/** Builds arrays of options objects for the location comboboxes. */
function buildLocSelectOpts() {
    var processedOpts = { Region: [], Country: [] };
    var opts = { Region: [], Country: [] };  
    tblOpts.api.getModel().rowsToDisplay.forEach(buildLocOptsForNode);
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
        var id = tParams.data[_util.lcfirst(type) + "Names"][name];             
        if (isOpenRow(id)) { addToSelectedObj(id, type); }
        opts[type].push({ value: id, text: name.split('[')[0] }); 
        processedOpts[type].push(name);
    }
    function isOpenRow(id) {  
        return tParams.openRows.indexOf(id) !== -1
    }
    /** Handles all modification of the location options. */
    function modifyOpts() {                                                     //console.log('modifyOpts. opts = %O', _util.snapshot(opts));
        if (opts.Region.length === 2) { rmvTopRegion(); }        
        addMissingOpts();
        sortLocOpts();
    }
    /** 
     * If both top & sub regions are in the table, only the sub-region opt is 
     * included, unless the top region is the location being filtered on. 
     */
    function rmvTopRegion() {                                                   //console.log('rmving top region. opts = %O, regionToKeep = %O', opts, tParams.selectedOpts)
        const selLoc = tParams.rcrdsById[tParams.openRows[0]];                  
        if (!selLoc || !selLoc.parent) { return; }
        opts.Region = opts.Region.filter(function(region) {
            return region.value == tParams.selectedOpts.region;
        });             
    }
    /** If the Region or Country aren't in the table, they are added as options here. */
    function addMissingOpts() {                                                 
        if (!tParams.openRows.length && !tParams.selectedOpts) { return; }
        const selLoc = tParams.rcrdsById[tParams.openRows[0]];                  
        if (!opts.Country.length) { buildOpt(selLoc, 'country', 'Country'); }
        if (!opts.Region.length) { buildOpt(selLoc, 'region', 'Region'); }
    }
    /** build the new opts and adds their loc ids to the selected-options obj. */
    function buildOpt(loc, type, optProp) {                                     //console.log('building opt for [%s]. loc = %O', type, loc);
        const val = loc && loc[type] ?  loc[type].id : false;
        const txt = loc && loc[type] ?  loc[type].displayName : false;
        if (!val) { return }
        addToSelectedObj(val, _util.ucfirst(type));  
        tParams.openRows.push(val);
        opts[optProp].push({ value: val, text: txt });
    }         
    function addToSelectedObj(id, type) {
        const sel = tParams.selectedOpts || createSelectedOptsObj();            //console.log('building opt for [%s] = %O', type, loc);
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
    tParams.selectedOpts = {};
    return tParams.selectedOpts;
}
/** Builds the location select elements */
function buildLocSelects(locOptsObj) {  
    const selElems = [];
    for (let locSelName in locOptsObj) {
        let elem = buildLocSel(_util.ucfirst(locSelName), locOptsObj[locSelName]); 
        selElems.push(elem);
    }
    return selElems;
    
    function buildLocSel(selName, opts) {
        const lbl = _util.buildElem('label', { class: "lbl-sel-opts flex-row" });
        const span = _util.buildElem('span', { text: selName + ': ', class: "opts-span" });
        const sel = newSelEl(opts, 'opts-box', 'sel' + selName, selName);
        $(sel).css('width', '202px');
        $(lbl).css('width', '282px').append([span, sel]);
        return lbl;
    }
}
function setSelectedLocVals() {                                                 
    const selected = tParams.selectedOpts;                                      //console.log("selected in setSelectedLocVals = %O", selected);
    Object.keys(selected).forEach(locType => {
        setSelVal(locType, selected[locType], 'silent');
    });
}
/*--------- Location Data Formatting -----------------------------------------*/
/**
 * Transforms the tree's location data into the table format and sets the row 
 * data in the global tParams object as 'rowData'. Calls @loadTable.
 */
function transformLocDataAndLoadTable(locTree) {
    var finalRowData = [];                                                      //console.log("locTree = %O", locTree);
    for (var topNode in locTree) {                                              //console.log("topNode = ", topNode)
        finalRowData.push( getLocRowData(locTree[topNode], 0)); 
    }
    tParams.rowData = removeLocsWithoutInteractions(finalRowData);              //console.log("rowData = %O", tParams.rowData);
    loadTable("Location Tree");
}
/** Returns a row data object for the passed location and it's children.  */
function getLocRowData(locRcrd, treeLvl) {                                      //console.log("--getLocRowData called for %s = %O", locRcrd.displayName, locRcrd);
    return {
        id: locRcrd.id,
        entity: "Location",
        name: getLocDisplayName(),  /* Interaction rows have no name to display. */
        onMap: isMappable(locRcrd),
        isParent: locRcrd.interactionType === undefined,  /* Only interaction records return false. */
        open: tParams.openRows.indexOf(locRcrd.id) !== -1, 
        children: getLocRowDataForRowChildren(locRcrd, treeLvl),
        treeLvl: treeLvl,
        interactions: locRcrd.interactions.length > 0,     /* Location objects have collections of interactions as children. */     
        locGroupedInts: hasGroupedInteractionsRow(locRcrd),
        type: locRcrd.locationType.displayName
    }; 
    function getLocDisplayName() {
        var trans = { 'Unspecified': 'Unspecified / Habitat Only' };
        return trans[locRcrd.displayName] || locRcrd.displayName;
    }     
    function isMappable(loc) {                                                  
        return loc.geoJsonId ? loc.id : false;
    }
    /**
     * Returns rowData for interactions at this location and for any children.
     * If there are both interactions and children, the interactions rows are 
     * grouped under the first child row as "Unspecified [locName] Interactions", 
     * otherwise interaction rows are added directly beneath the taxon.
     */
    function getLocRowDataForRowChildren(locRcrd, pTreeLvl) {                   //console.log("getLocRowDataForChildren called. locRcrd = %O", locRcrd)
        var childRows = [];
        var locType = locRcrd.locationType.displayName; 
        if (locType === "Region" || locType === "Country") {
            getUnspecifiedLocInts(locRcrd.interactions, pTreeLvl, locType);
            locRcrd.children.forEach(getChildLocData);
        } else { childRows = getIntRowData(locRcrd.interactions, pTreeLvl); }
        return childRows;
        /**
         * Groups interactions attributed directly to a location with child-locations
         * and adds them as it's first child row. 
         */
        function getUnspecifiedLocInts(intsAry, treeLvl, locType) {   
            var locName = locRcrd.displayName === "Unspecified" ? 
                "Location" : locRcrd.displayName;
            if (intsAry.length > 0) { 
                childRows.push({
                    id: locRcrd.id,
                    entity: "Location",
                    name: 'Unspecified ' + locName + ' Interactions',
                    isParent: true,
                    open: false,
                    children: getIntRowData(intsAry, treeLvl),
                    interactions: intsAry.length > 0,
                    treeLvl: treeLvl,
                    groupedInts: true,
                    type: locType
                });
            }
        }
        function getChildLocData(childLoc) {
            childRows.push(getLocRowData(childLoc, pTreeLvl + 1));
        }
    } /* End getLocRowDataForChildren */

} /* End getLocRowData */
function hasGroupedInteractionsRow(locRcrd) {
    return locRcrd.children.length > 0 && locRcrd.interactions.length > 0;
}
/** Filters out all locations with no interactions below them in the tree. */
function removeLocsWithoutInteractions(rows) {  
    return rows.filter(function(row){
        if (row.children) { 
            row.children = removeLocsWithoutInteractions(row.children);
        }
        return row.interactions || hasChildInteractions(row);
    });
}
function hasChildInteractions(row) {
    if (!row.children) { return true; }
    return row.children.some(function(childRow) {
        return childRow.interactions || hasChildInteractions(childRow);  
    });
}
/** ------------ Location Map Methods --------------------------------------- */
/** Filters the data-table to the location selected from the map view. */
export function showLocInDataTable(loc) {                                        //console.log('showing Loc = %O', loc);
    updateUiForTableView();
    rebuildLocTree([loc.id]);
    setSelVal('Loc View', 'tree', 'silent');
}
/** Initializes the google map in the data table. */
function buildLocMap() {    
    updateUiForMapView();       
    addNoteAboutHowToFilterInteractionsDisplayed();
    db_map.initMap();           
}
function addNoteAboutHowToFilterInteractionsDisplayed() {
    $('#opts-col2').html(`
        <div style="margin: 1em; font-size: 18px;">To filter the interactions 
        diplayed, return to viewing "Table Data" and filter using the options 
        available. Then click "Show Interactions on Map" to see them displayed 
        here. </div>`);
}
/** Switches to map view and centeres map on selected location. */
function showLocOnMap(geoJsonId, zoom) {
    updateUiForMapView();
    clearCol2();
    setSelVal('Loc View', 'map', 'silent');
    db_map.showLoc(geoJsonId, zoom);
}
/**
 * Build an object with all relevant data to display the interactions in the 
 * data-table in map-view. Sends it to the map to handle the display.
 */
function showTableRecordsOnMap() {                                               console.log('-----------showTableRecordsOnMap');
    $('#search-tbl').fadeTo('100', 0.3, () => {
        updateUiForMappingInts();
        storeIntAndLocRcrds();
        db_map.showInts(tParams.curFocus, buildTableLocDataObj());
    });
}
function storeIntAndLocRcrds() {
    const rcrds = _util.getDataFromStorage(['interaction', 'location']);
    tParams.interaction = rcrds.interaction;
    tParams.location = rcrds.location;
}
/**
 * Builds an object sorted by geoJsonId with all interaction data at that location.
 * -> geoJsonId: {locs: [{loc}], ints: [{name: [intRcrds]}], ttl: ## } 
 */
function buildTableLocDataObj() {  
    const mapData = { 'none': { ttl: 0, ints: {}, locs: null }}; 
    let curBaseNodeName; //used for Source rows
    tblOpts.api.forEachNodeAfterFilter(getIntMapData);
    return mapData;  
    
    function getIntMapData(row) {                         
        if (row.data.treeLvl === 0) { curBaseNodeName = row.data.name; }                         
        if (!row.data.interactions || hasUnspecifiedRow(row.data)) { return; }
        buildInteractionMapData(row.data, getDetachedRcrd(row.data.id));
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
            const intRcrd = getDetachedRcrd(intRowData.id, tParams.interaction);
            const loc = getDetachedRcrd(intRcrd.location, tParams.location);
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
    }    
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
        if (tParams.curRealm == 'auths') { return sanitizeAndAddInt(); }
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
    }
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
    if (tParams.curFocus === 'srcs') { return getSrcRowName(rowData, rcrd, baseNode)}
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
    return tParams.curFocus === 'taxa' ? 
        getTaxonName(rcrd) : getRcrdDisplayName(rcrd.displayName, rcrd);
}
function getRcrdDisplayName(name, rcrd) {
    return name === 'Whole work cited.' ? getParentName(rcrd) : name;
}
function getParentName(rcrd) {  
    return rcrd.displayName.split('(citation)')[0];
}
/* --- End showTableRecordsOnMap --- */
function updateUiForMapView(showingInts) {
    disableTableButtons();
    $('#tool-bar').fadeTo(100, 1);
    $('#search-tbl').hide();
    $('#map').show();
    if (showingInts) { return; }
    $('#shw-map').attr('disabled', 'disabled').css({'opacity': .3, 'cursor': 'default'});
}
function updateUiForTableView() {
    $('#search-tbl').fadeTo('100', 1);
    $('#map, #filter-in-tbl-msg').hide();
    enableTableButtons();
    enableComboboxes(true, $('#opts-col1 select, #opts-col2 select'));
    $('#shw-map').attr('disabled', false).css({'opacity': 1, 'cursor': 'pointer'});    
}
function updateUiForMappingInts() {
    updateUiForMapView('showingInts');
    updateBttnToReturnRcrdsToTable();
    addMsgAboutTableViewFiltering();
    enableComboboxes(false, $('#opts-col1 select, #opts-col2 select'));
}
function addMsgAboutTableViewFiltering() {
    if ($('#filter-in-tbl-msg').length) { return $('#filter-in-tbl-msg').show();}
    const div = _util.buildElem('div', {id:'filter-in-tbl-msg'});
    div.innerHTML = `Return to filter data shown.`;
    $('#content-detail').prepend(div);
}
function updateBttnToReturnRcrdsToTable() {
    $('#shw-map').text('Return to Table View');
    $('#shw-map').off('click').on('click', returnRcrdsToTable);
    $('#shw-map').attr('disabled', false).css({'opacity': 1, cursor: 'pointer'});
}
function updateBttnToShowRcrdsOnMap() {
    $('#shw-map').text('Show Interactions on Map');
    $('#shw-map').off('click').on('click', showTableRecordsOnMap);
}
function returnRcrdsToTable() {
    updateUiForTableView();
    updateBttnToShowRcrdsOnMap();
}
/*------------------Source Search Methods ------------------------------------*/
/**
 * Get all data needed for the Source-focused table from data storage and send  
 * to @initSrcSearchUi to begin the data-table build.  
 */
function buildSrcTable() {
    const entities = [ 'source', 'author', 'publication' ];
    const entityData = _util.getDataFromStorage(entities);
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
/** Add source data to tParams to be available while in a source focus. */
function addSrcDataToTableParams(srcData) {
    tParams.rcrdsById = srcData.source;
    tParams.author = srcData.author;
    tParams.publication = srcData.publication;
}
/** Builds the combobox for the source realm types. */
function buildSrcRealmHtml() {                                             
    $('#sort-opts').append(buildSrcTypeElems());
    initCombobox('Source Type');
    $('#sort-opts').fadeTo(0, 1);

    function buildSrcTypeElems() {
        const types = getRealmOpts();                                       
        const span = _util.buildElem('span', { id:'sort-srcs-by', class: 'flex-row', 
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
    if (!getSelVal('Source Type')) { setSelVal('Source Type', srcRealm); 
    } else { onSrcRealmChange(srcRealm); }
}
/** Event fired when the source realm select box has been changed. */
function onSrcRealmChange(val) {                                                //console.log('-------- SrcRealmChange')
    if (!val) { return; }
    resetSourceRealm(val);
}
function resetSourceRealm(val) {
    clearPreviousTable();
    resetCurTreeState();
    resetToggleTreeBttn(false);
    buildSrcTree(val);
}
/** (Re)builds source tree for the selected source realm. */
function buildSrcTree(val) {
    const realmRcrds = storeAndReturnCurRealmRcrds(val);                        //console.log("---Build Source Tree. realmRcrds = %O", realmRcrds);
    initSrcTree(tParams.curRealm, realmRcrds);
    getInteractionsAndFillTable();
}
/** Returns the records for the source realm currently selected. */
function storeAndReturnCurRealmRcrds(val) {
    const valMap = { 'auths': 'authSrcs', 'pubs': 'pubSrcs', 'publ': 'pubSrcs' };
    const realmVal = val || getSelVal('Source Type');                           //console.log("storeAndReturnCurRealmRcrds. realmVal = ", realmVal)
    tParams.curRealm = realmVal;    
    _util.populateStorage('curRealm', realmVal);
    return getTreeRcrdAry(valMap[realmVal]);
}
/** Returns an array with all records from the stored record object. */
function getTreeRcrdAry(realm) {
    const srcRcrdIdAry = _util.getDataFromStorage(realm);
    return srcRcrdIdAry.map(function(id) { return getDetachedRcrd(id); });
}
/**
 * Builds the source data tree for the selected source realm (source type) and 
 * adds it to the global tParams obj as 'curTree', 
 * NOTE: Sources have three realms and tree-data structures:
 * Authors->Citations/Publications->Interactions
 * Publications->Citations->Interactions. 
 * Publishers->Publications->Citations->Interactions. 
 */
function initSrcTree(focus, rcrds) {                                            //console.log("initSrcTree realmRcrds = %O", realmRcrds);
    const treeMap = { 'pubs': buildPubTree, 'auths': buildAuthTree, 'publ': buildPublTree };
    let tree = treeMap[focus](rcrds);
    tParams.curTree = sortDataTree(tree);
}  
/*-------------- Publication Source Tree -------------------------------------------*/
/**
 * Returns a tree object with Publications as the base nodes of the data tree. 
 * Each interaction is attributed directly to a citation source, which currently 
 * always has a 'parent' publication source.
 * Data structure:
 * ->Publication Title
 * ->->Citation Title
 * ->->->Interactions Records
 */
function buildPubTree(pubSrcRcrds) {                                            //console.log("buildPubSrcTree. Tree = %O", pubSrcRcrds);
    var tree = {};
    pubSrcRcrds.forEach(function(pub) { 
        tree[pub.displayName] = getPubData(pub); 
    });
    return tree;
}
function getPubData(rcrd) {                                                     //console.log("getPubData. rcrd = %O", rcrd);
    rcrd.children = getPubChildren(rcrd);
    if (rcrd.publication) {                                                     //console.log("rcrd with pub = %O", rcrd)
        rcrd.publication = getDetachedRcrd(rcrd.publication, tParams.publication);
    }
    return rcrd;
}
function getPubChildren(rcrd) {                                                 //console.log("getPubChildren rcrd = %O", rcrd)
    if (rcrd.children.length === 0) { return []; }
    return rcrd.children.map(id => getPubData(getDetachedRcrd(id)));
}
/*-------------- Publisher Source Tree ---------------------------------------*/
/**
 * Returns a tree object with Publishers as the base nodes of the data tree. 
 * Publications with no publisher are added underneath the "Unspecified" base node.
 * Data structure:
 * ->Publisher Name
 * ->->Publication Title
 * ->->->Citation Title
 * ->->->->Interactions Records
 */
function buildPublTree(pubRcrds) {                                              //console.log("buildPublSrcTree. Tree = %O", pubRcrds);
    let tree = {};
    let noPubl = [];
    pubRcrds.forEach(function(pub) { addPubl(pub); });
    tree["Unspecified"] = getPubsWithoutPubls(noPubl);
    return tree;

    function addPubl(pub) {
        if (!pub.parent) { noPubl.push(pub); return; }
        const publ = getDetachedRcrd(pub.parent, tParams.rcrdsById);
        tree[publ.displayName] = getPublData(publ); 
    }
} /* End buildPublTree */
function getPublData(rcrd) {
    rcrd.children = getPublChildren(rcrd);
    return rcrd;
}
function getPublChildren(rcrd) {                                                //console.log("getPubChildren rcrd = %O", rcrd)
    if (rcrd.children.length === 0) { return []; }
    return rcrd.children.map(id => getPubData(getDetachedRcrd(id)));
}
function getPubsWithoutPubls(pubs) {
    let publ = { id: 0, displayName: "Unspecified", parent: null, sourceType: { displayName: 'Publisher' } };
    publ.children = pubs.map(pub => getPubData(pub));
    return publ;
}
/*-------------- Author Source Tree ------------------------------------------*/
/**
 * Returns a tree object with Authors as the base nodes of the data tree, 
 * with their contributibuted works and the interactions they contain nested 
 * within. Authors with no contributions are not added to the tree.
 * Data structure:
 * ->Author Display Name [Last, First M Suff]
 * ->->Citation Title (Publication Title)
 * ->->->Interactions Records
 */
function buildAuthTree(authSrcRcrds) {                                          //console.log("----buildAuthSrcTree");
    var tree = {};
    for (var id in authSrcRcrds) { 
        getAuthData(getDetachedRcrd(id, authSrcRcrds)); 
    }  
    return tree;  

    function getAuthData(authSrc) {                                             //console.log("rcrd = %O", authSrc);
        if (authSrc.contributions.length > 0) {
            authSrc.author = getDetachedRcrd(authSrc.author, tParams.author);
            authSrc.children = getAuthChildren(authSrc.contributions); 
            tree[authSrc.displayName] = authSrc;
        }
    }
} /* End buildAuthTree */
/** For each source work contribution, gets any additional publication children
 * @getPubData and return's the source record.
 */
function getAuthChildren(contribs) {                                            //console.log("getAuthChildren contribs = %O", contribs);
    return contribs.map(wrkSrcid => getPubData(getDetachedRcrd(wrkSrcid)));
}
/**
 * Will build the select elems for the source search options. Clears previous 
 * table. Calls @transformSrcDataAndLoadTable to transform tree data into table 
 * format and load the data table.
 * NOTE: This is the entry point for source table rebuilds as filters alter data
 * contained in the data tree.
 */
function buildSrcSearchUiAndTable(srcTree) {                                     //console.log("buildSrcSearchUiAndTable called. tree = %O", srcTree);
    const buildUi = { 'auths': loadAuthSearchHtml, 'pubs': loadPubSearchHtml, 
        'publ':loadPublSearchHtml };
    clearPreviousTable();
    buildUi[tParams.curRealm](srcTree); 
    transformSrcDataAndLoadTable(srcTree);
} 
/** Builds a text input for searching author names. */
function loadAuthSearchHtml(srcTree) {
    const searchTreeElem = buildTreeSearchHtml('Author');
    clearCol2();        
    $('#opts-col2').append(searchTreeElem);
}
function loadPubSearchHtml(srcTree) {
    const pubTypeElem = buildPubTypeSelect();
    const searchTreeElem = buildTreeSearchHtml('Publication', updatePubSearchByTxt);
    clearCol2();        
    $('#opts-col2').append([searchTreeElem, pubTypeElem]); //searchTreeElem, 
    initCombobox('Publication Type');
    setSelVal('Publication Type', 'all', 'silent');
    
    function buildPubTypeSelect() {
        const pubTypeOpts = buildPubSelectOpts();
        return buildPubSelects(pubTypeOpts);
    }
    function buildPubSelectOpts() {
        const pubTypes = _util.getDataFromStorage('publicationType');           
        const opts = [{value: 'all', text: '- All -'}];
        for (let t in pubTypes) {
            opts.push({ value: pubTypes[t].id, text: pubTypes[t].displayName });
        }
        return opts.sort(alphaOptionObjs);  
    }
    /** Builds the publication type dropdown */
    function buildPubSelects(opts) {                                            //console.log("buildPubSelects pubTypeOpts = %O", pubTypeOpts)
        const lbl = _util.buildElem('label', {class: "lbl-sel-opts flex-row"});
        const span = _util.buildElem('span', { text: 'Type:' });
        const sel = newSelEl(opts, '', 'selPubType', 'Publication Type');
        $(sel).css('width', '177px');
        $(lbl).css('width', '222px').append([span, sel]);
        return lbl;
    }
} /* End loadPubSearchHtml */
function loadPublSearchHtml(srcTree) {
    const searchTreeElem = buildTreeSearchHtml('Publisher');
    clearCol2();        
    $('#opts-col2').append(searchTreeElem);
}
/*--------- Source Data Formatting ---------------------------------------*/
/**
 * Transforms the tree's source record data into table row format and set as 
 * 'rowData' in the global tParams object as 'rowData'. Calls @loadTable.
 */
function transformSrcDataAndLoadTable(srcTree) {                                 //console.log("transformSrcDataAndLoadTable called.")
    var prefix = { "pubs": "Publication", "auths": "Author", "publ": "Publisher"};
    var treeName = prefix[tParams.curRealm] + ' Tree';
    let rowColorIdx = 0;
    var finalRowData = [];

    for (var topNode in srcTree) {
        rowColorIdx = rowColorIdx < 6 ? ++rowColorIdx : 0; 
        finalRowData.push( getSrcRowData(srcTree[topNode], 0, rowColorIdx) );
    }
    tParams.rowData = finalRowData;                                             //console.log("rowData = %O", tParams.rowData);
    loadTable(treeName);
}
function getSrcRowData(src, treeLvl, idx) {                                     //console.log("getSrcRowData. source = %O", src);
    var entity = src.sourceType.displayName;
    var detailId = entity === "Publication" ? src.publication.id : null;  
    const displayName = src.displayName.includes('(citation)') ? 
        'Whole work cited.' : src.displayName;
    return {
        id: src.id,
        entity: entity,
        pubId: detailId,
        name: displayName,
        isParent: true,      
        parentSource: src.parent,
        open: tParams.openRows.indexOf(src.id.toString()) !== -1, 
        children: getChildSrcRowData(src, treeLvl, idx),
        treeLvl: treeLvl,
        interactions: src.isDirect,   //Only rows with interaction are colored
        rowColorIdx: idx
    }; 
    /**
     * Recurses through each source's 'children' property and returns a row data obj 
     * for each source node in the tree. 
     * Note: var idx is used for row coloring.
     */
    function getChildSrcRowData(curSrc, treeLvl, idx) {
        if (curSrc.isDirect) { return getIntRowData(curSrc.interactions, treeLvl, idx); }
        return curSrc.children === null ? [] : getChildSrcData(curSrc, treeLvl, idx);
       
        function getChildSrcData(src, treeLvl, idx) {
            return src.children.map(function(childSrc) {                        //console.log("childSrc = %O", childSrc);
                idx = idx < 6 ? ++idx : 0; 
                return getSrcRowData(childSrc, treeLvl +1, idx);
            });
        }
    }
} /* End getSrcRowData */
/*================== Search Panel Filter Functions ===========================*/
/** Returns a text input with submit button that will filter tree by text string. */
function buildTreeSearchHtml(entity, hndlr) {
    const func = hndlr || searchTreeText.bind(null, entity);
    const lbl = _util.buildElem('label', { class: 'lbl-sel-opts flex-row tbl-tools' });
    const input = _util.buildElem('input', { 
        name: 'sel'+entity, type: 'text', placeholder: entity+' Name'  });
    const bttn = _util.buildElem('button', { text: 'Search', 
        name: 'sel'+entity+'_submit', class: 'ag-fresh tbl-bttn' });
    $(bttn).css('margin-left', '5px');
    $(lbl).css('width', '222px');
    $(input).css('width', '160px');
    $(input).onEnter(func);
    $(bttn).click(func);
    $(lbl).append([input, bttn]);
    return lbl;
}
/**
 * When the search-tree text-input is submitted, by either pressing 'enter' or
 * by clicking on the 'search' button, the tree is rebuilt with only rows that  
 * contain the case insensitive substring.
 */
function searchTreeText(entity) {                                               //console.log("----- Search Tree Text");
    const text = getFilterTreeTextVal(entity);
    const allRows = getAllCurRows(); 
    const newRows = text === "" ? allRows : getTreeRowsWithText(allRows, text);
    tblOpts.api.setRowData(newRows);
    tParams.focusFltrs = text === "" ? [] : ['"' + text + '"'];
    updateTableFilterStatusMsg();
    resetToggleTreeBttn(false);
} 
function getFilterTreeTextVal(entity) {                                         //console.log('getFilterTreeTextVal entity = ', entity);
    return $('input[name="sel'+entity+'"]').val().trim().toLowerCase();
}
function getTreeRowsWithText(rows, text) {
    return rows.filter(row => row.name.toLowerCase().indexOf(text) !== -1);
}
/*------------------ Taxon Filter Updates ---------------------------------*/
/**
 * When a taxon is selected from one of the taxon-level comboboxes, the table 
 * is updated with the taxon as the top of the new tree. The remaining level 
 * comboboxes are populated with realted taxa, with ancestors selected.
 */
function updateTaxonSearch(val) {                                               //console.log("updateTaxonSearch val = ", val)
    if (!val) { return; }
    const rcrd = getDetachedRcrd(val);  
    tParams.selectedVals = getRelatedTaxaToSelect(rcrd);                        //console.log("selectedVals = %O", tParams.selectedVals);
    updateFilterStatus();
    rebuildTaxonTree(rcrd);
    if ($('#shw-chngd')[0].checked) { filterInteractionsUpdatedSince(); }

    function updateFilterStatus() {
        const curLevel = rcrd.level.displayName;
        const taxonName = rcrd.displayName;
        updateFilters();

        function updateFilters() {
            if (tParams.focusFltrs) { 
                tParams.focusFltrs.push(curLevel + " " + taxonName); 
            } else { tParams.focusFltrs = [curLevel + " " + taxonName] }
            updateTableFilterStatusMsg();
        }
    }
} /* End updateTaxonSearch */
/** The selected taxon's ancestors will be selected in their levels combobox. */
function getRelatedTaxaToSelect(selTaxonObj) {                                  //console.log("getRelatedTaxaToSelect called for %O", selTaxonObj);
    var topTaxaIds = [1, 2, 3, 4]; //animalia, chiroptera, plantae, arthropoda 
    var selected = {};                                                          //console.log("selected = %O", selected)
    selectAncestorTaxa(selTaxonObj);
    return selected;
    /** Adds parent taxa to selected object, until the realm parent. */
    function selectAncestorTaxa(taxon) {                                        //console.log("selectedTaxonid = %s, obj = %O", taxon.id, taxon)
        if ( topTaxaIds.indexOf(taxon.id) === -1 ) {
            selected[taxon.level.displayName] = taxon.id;                       //console.log("setting lvl = ", taxon.level)
            selectAncestorTaxa(getDetachedRcrd(taxon.parent))
        }
    }
} /* End getRelatedTaxaToSelect */
/*------------------ Location Filter Updates -----------------------------*/
function updateLocSearch(val) { 
    if (!val) { return; }
    const selVal = parseInt(val);  
    const locType = getLocType(this.$input[0].id);
    tParams.selectedOpts = getSelectedVals(selVal, locType);
    rebuildLocTree([selVal]);                                                   //console.log('selected [%s] = %O', locType, _util.snapshot(tParams.selectedOpts));
    updateFilter();

    function getLocType(selId) {
        const selTypes = { selCountry: 'Country', selRegion: 'Region' };
        return selTypes[selId];
    }
    function getSelectedVals(val, type) {                                       //console.log("getSelectedVals. val = %s, selType = ", val, type)
        const selected = {};
        if (type === 'Country') { selectRegion(val); }
        if (val !== 'none' && val !== 'all') { selected[type] = val; }
        return selected;  

        function selectRegion(val) {
            var loc = getDetachedRcrd(val);
            selected['Region'] = loc.region.id;
        }
    } /* End getSelectedVals */
    function updateFilter() {
        tParams.focusFltrs = [locType];
        updateTableFilterStatusMsg();
    }
} /* End updateLocSearch */
/*------------------ Source Filter Updates -------------------------------*/
function updatePubSearchByTxt() {
    const text = getFilterTreeTextVal('Publication');
    updatePubSearch(null, text);
}
function updatePubSearchByType(val) {                                           //console.log('updatePubSearchByType. val = ', val)
    if (!val) { return; }
    updatePubSearch(val, null);
}
/**
 * When the publication type dropdown is changed or the table is filtered by 
 * publication text, the table is rebuilt with the filtered data.
 */
function updatePubSearch(typeVal, text) {                                       //console.log('updatePubSearch. typeVal = ', typeVal)
    const typeId = typeVal || getSelVal('Publication Type');
    const txt = text || getFilterTreeTextVal('Publication');
    const newRows = getFilteredPubRows();
    tParams.focusFltrs = getPubFilters();
    tblOpts.api.setRowData(newRows);
    updateTableFilterStatusMsg();
    resetToggleTreeBttn(false);

    function getFilteredPubRows() {                             
        if (typeId === 'all') { return getTreeRowsWithText(getAllCurRows(), txt); }
        if (txt === '') { return getPubTypeRows(typeId); }
        const pubTypes = _util.getDataFromStorage('publicationType'); 
        const pubIds = pubTypes[typeId].publications;         
        return getAllCurRows().filter(row => 
            pubIds.indexOf(row.pubId) !== -1 && 
            row.name.toLowerCase().indexOf(text) !== -1);
    }
    /** Returns the rows for publications with their id in the selected type's array */
    function getPubTypeRows() { 
        const pubTypes = _util.getDataFromStorage('publicationType'); 
        const pubIds = pubTypes[typeId].publications;      
        return getAllCurRows().filter(row => pubIds.indexOf(row.pubId) !== -1);
    }
    function getPubFilters() {
        return typeId === 'all' && text === '' ? [] :
            (typeId === 'all' ? ['"' + text + '"'] : 
            [$("#selPubType option[value='"+typeId+"']").text()+'s']);
    }
} /* End updatePubSearch */
/*================ Table Build Methods ==============================================*/
/**
 * Fills additional columns with flattened taxon-tree parent chain data for csv exports.
 */
function fillHiddenTaxonColumns(curTaxonTree) {                                 //console.log('fillHiddenTaxonColumns. curTaxonTree = %O', curTaxonTree);
    var curTaxonHeirarchy = {};
    var lvls = Object.keys(_util.getDataFromStorage('levelNames'));             //console.log('lvls = %O', lvls);
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
        } else { clearLowerLvls(tParams.rcrdsById[prntId].level.displayName); }
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
        return speciesName === null ? null : _util.ucfirst(curTaxonHeirarchy['Species'].split(' ')[1]);
    }
} /* End fillHiddenColumns */
function getDefaultTblOpts() {
    return {
        columnDefs: getColumnDefs(),
        rowSelection: 'multiple',   //Used for csv export
        getHeaderCellTemplate: getHeaderCellTemplate, 
        getNodeChildDetails: getNodeChildDetails,
        getRowClass: getRowStyleClass,
        onRowGroupOpened: softRefresh,
        onBeforeFilterChanged: beforeFilterChange, 
        onAfterFilterChanged: afterFilterChanged,
        onModelUpdated: onModelUpdated,
        onBeforeSortChanged: onBeforeSortChanged,
        enableColResize: true,
        enableSorting: true,
        unSortIcon: true,
        enableFilter: true,
        rowHeight: 26
    };
}
/**
 * Builds the table options object and passes everyting into agGrid, which 
 * creates and shows the table.
 */
function loadTable(treeColTitle, tOpts) {                                       //console.log("loading table. rowdata = %s", JSON.stringify(rowData, null, 2));
    const tblDiv = document.querySelector('#search-tbl');
    const tblOptsObj = tOpts || tblOpts;
    tblOptsObj.rowData = tParams.rowData;
    tblOptsObj.columnDefs = getColumnDefs(treeColTitle);
    new agGrid.Grid(tblDiv, tblOptsObj);
    sortTreeColumnIfTaxonFocused();
}
/** If the table is Taxon focused, sort the tree column by taxon-rank and name. */
function sortTreeColumnIfTaxonFocused() {
    if (tParams.curFocus === 'taxa') {
        tblOpts.api.setSortModel([{colId: "name", sort: "asc"}]);
    }
}
/**
 * Copied from agGrid's default template, with columnId added to create unique ID's
 * @param  {obj} params  {column, colDef, context, api}
 */
function getHeaderCellTemplate(params) {  
    var filterId = params.column.colId + 'ColFilterIcon';  
    return '<div class="ag-header-cell">' +
        '  <div id="agResizeBar" class="ag-header-cell-resize"></div>' +
        '  <span id="agMenu" class="' + params.column.colId + ' ag-header-icon ag-header-cell-menu-button"></span>' + //added class here so I can hide the filter on the group column, 
        '  <div id="agHeaderCellLabel" class="ag-header-cell-label">' +                                 //which breaks the table. The provided 'supressFilter' option doesn't work.
        '    <span id="agSortAsc" class="ag-header-icon ag-sort-ascending-icon"></span>' +
        '    <span id="agSortDesc" class="ag-header-icon ag-sort-descending-icon"></span>' +
        '    <span id="agNoSort" class="ag-header-icon ag-sort-none-icon"></span>' +
        '    <a name="' + filterId + '" id="agFilter" class="anything ag-header-icon ag-filter-icon"></a>' +
        '    <span id="agText" class="ag-header-cell-text"></span>' +
        '  </div>' +
        '</div>'; 
}
function softRefresh() { tblOpts.api.refreshView(); }
/**
 * Tree columns are hidden until taxon export and are used for the flattened 
 * taxon-tree data. The role is set to subject for 'bats' exports, object for 
 * plants and arthropods.
 */
function getColumnDefs(mainCol) { 
    var realm = tParams.curRealm || false;  
    var taxonLvlPrefix = realm ? (realm == 2 ? "Subject" : "Object") : "Tree"; 

    return [{headerName: mainCol, field: "name", width: getTreeWidth(), cellRenderer: 'group', suppressFilter: true,
                cellRendererParams: { innerRenderer: addToolTipToTree, padding: 20 }, 
                cellClass: getCellStyleClass, comparator: sortByRankThenName },     //cellClassRules: getCellStyleClass
            {headerName: taxonLvlPrefix + " Kingdom", field: "treeKingdom", width: 150, hide: true },
            {headerName: taxonLvlPrefix + " Phylum", field: "treePhylum", width: 150, hide: true },
            {headerName: taxonLvlPrefix + " Class", field: "treeClass", width: 150, hide: true },
            {headerName: taxonLvlPrefix + " Order", field: "treeOrder", width: 150, hide: true },
            {headerName: taxonLvlPrefix + " Family", field: "treeFamily", width: 150, hide: true },
            {headerName: taxonLvlPrefix + " Genus", field: "treeGenus", width: 150, hide: true },
            {headerName: taxonLvlPrefix + " Species", field: "treeSpecies", width: 150, hide: true },
            {headerName: "Edit", field: "edit", width: 50, hide: isNotEditor(), headerTooltip: "Edit", cellRenderer: addEditPencil },
            {headerName: "Cnt", field: "intCnt", width: 47, volatile: true, headerTooltip: "Interaction Count" },
            {headerName: "Map", field: "map", width: 39, hide: !ifLocView(), headerTooltip: "Show on Map", cellRenderer: addMapIcon },
            {headerName: "Subject Taxon", field: "subject", width: 141, cellRenderer: addToolTipToCells, comparator: sortByRankThenName },
            {headerName: "Object Taxon", field: "object", width: 135, cellRenderer: addToolTipToCells, comparator: sortByRankThenName },
            {headerName: "Type", field: "interactionType", width: 105, cellRenderer: addToolTipToCells, filter: UniqueValuesFilter },
            {headerName: "Tags", field: "tags", width: 75, cellRenderer: addToolTipToCells, filter: UniqueValuesFilter},
            {headerName: "Citation", field: "citation", width: 111, cellRenderer: addToolTipToCells},
            {headerName: "Habitat", field: "habitat", width: 100, cellRenderer: addToolTipToCells, filter: UniqueValuesFilter },
            {headerName: "Location", field: "location", width: 122, hide: ifLocView(), cellRenderer: addToolTipToCells },
            {headerName: "Elev", field: "elev", width: 60, hide: !ifLocView(), cellRenderer: addToolTipToCells },
            // {headerName: "Elev Max", field: "elevMax", width: 150, hide: true },
            {headerName: "Lat", field: "lat", width: 60, hide: !ifLocView(), cellRenderer: addToolTipToCells },
            {headerName: "Long", field: "lng", width: 60, hide: !ifLocView(), cellRenderer: addToolTipToCells },
            {headerName: "Country", field: "country", width: 102, cellRenderer: addToolTipToCells, filter: UniqueValuesFilter },
            {headerName: "Region", field: "region", width: 100, cellRenderer: addToolTipToCells, filter: UniqueValuesFilter },
            {headerName: "Note", field: "note", width: 100, cellRenderer: addToolTipToCells} ];
}
/** Adds tooltip to Interaction row cells */
function addToolTipToCells(params) {
    var value = params.value || null;
    return value === null ? null : '<span title="'+value+'">'+value+'</span>';
}
/** --------- Tree Column ---------------------- */
/** Adds tooltip to Tree cells */
function addToolTipToTree(params) {      
    var name = params.data.name || null;                                        //console.log("params in cell renderer = %O", params)         
    return name === null ? null : '<span title="'+name+'">'+name+'</span>';
}
/** Returns the initial width of the tree column according to role and screen size. */
function getTreeWidth() { 
    var offset = ['admin', 'super', 'editor'].indexOf(userRole) === -1 ? 0 : 50;
    if (tParams.curFocus === 'locs') { offset = offset + 60; }
    return ($(window).width() > 1500 ? 340 : 273) - offset;
}
/** This method ensures that the Taxon tree column stays sorted by Rank and Name. */
function onBeforeSortChanged() {                                            
    if (tParams.curFocus !== "taxa") { return; }                       
    var sortModel = tblOpts.api.getSortModel();                             //console.log("model obj = %O", sortModel)
    if (!sortModel.length) { return tblOpts.api.setSortModel([{colId: "name", sort: "asc"}]); }
    ifNameUnsorted(sortModel);        
}
/** Sorts the tree column if it is not sorted. */
function ifNameUnsorted(model) {
    var nameSorted = model.some(function(colModel){
        return colModel.colId === "name";
    });
    if (!nameSorted) { 
        model.push({colId: "name", sort: "asc"}); 
        tblOpts.api.setSortModel(model);
    }
}
/**
 * Sorts the tree column alphabetically for all views. If in Taxon view, the 
 * rows are sorted first by rank and then alphabetized by name @sortTaxonRows. 
 */
function sortByRankThenName(a, b, nodeA, nodeB, isInverted) {                   //console.log("sortByRankThenName a-[%s] = %O b-[%s] = %O (inverted? %s)", a, nodeA, b, nodeB, isInverted);
    if (!a) { return 0; } //Interaction rows are returned unsorted
    if (tParams.curFocus !== "taxa") { return alphaSortVals(a, b); }
    return sortTaxonRows(a, b);
} 
/** Sorts each row by taxonomic rank and then alphabetizes by name. */
function sortTaxonRows(a, b) {
    var lvls = ["Kingdom", "Phylum", "Class", "Order", "Family", "Genus", "Species"];
    var aParts = a.split(" ");
    var aLvl = aParts[0];
    var aName = aParts[1];
    var bParts = b.split(" ");
    var bLvl = bParts[0];
    var bName = bParts[1];
    return  aLvl === "Unspecified" ? -1 : compareRankThenName();  

    function compareRankThenName() {
        return sortByRank() || sortByName();
    }
    function sortByRank() {
        if (lvls.indexOf(aLvl) === -1 || lvls.indexOf(bLvl) === -1) { return alphaSpecies(); }
        return lvls.indexOf(aLvl) === lvls.indexOf(bLvl) ? false :
            lvls.indexOf(aLvl) > lvls.indexOf(bLvl) ? 1 : -1; 
    }
    function sortByName() {
        return aName.toLowerCase() > bName.toLowerCase() ? 1 : -1;
    }
    function alphaSpecies() {                                             
        return lvls.indexOf(aLvl) !== -1 ? 1 :
            lvls.indexOf(bLvl) !== -1 ? -1 :
            a.toLowerCase() > b.toLowerCase() ? 1 : -1;
    }
}  /* End sortTaxonRows */
/** ------ Edit Column ---------- */
function isNotEditor() {  
    return ['admin', 'editor', 'super'].indexOf(userRole) === -1;
}
/** Adds an edit pencil for all tree nodes bound to the entity edit method. */
function addEditPencil(params) {   
    if (uneditableEntityRow(params)) { return "<span>"; }                     
    return getPencilHtml(params.data.id, params.data.entity, db_forms.editEntity);
}
function uneditableEntityRow(params) {                                          //console.log('focus = [%s] params = %O', tParams.curFocus, params);
    const uneditables = [
        tParams.curFocus === 'locs' && 
            (['Region','Country','Habitat'].indexOf(params.data.type) !== -1),
        tParams.curFocus === 'taxa' && //Realm Taxa 
            (!params.data.parentTaxon && !params.data.interactionType),
        tParams.curFocus === 'srcs' && params.data.id === 0]; //Unspecifed publisher
    return uneditables.some(test => test);
}
function getPencilHtml(id, entity, editFunc) {
    const path = require('../../css/images/eif.pencil.svg');
    var editPencil = `<img src=${path} id="edit${entity}${id}"
        class="tbl-edit" title="Edit ${entity} ${id}" alt="Edit ${entity}">`;
    $('#search-tbl').off('click', '#edit'+entity+id);
    $('#search-tbl').on(
        'click', '#edit'+entity+id, db_forms.editEntity.bind(null, id, _util.lcfirst(entity)));
    return editPencil;
}
/** -------- Map Column ---------- */
function ifLocView() {                                           
    return tParams.curFocus === 'locs';
}
function addMapIcon(params) {                                                   //console.log('row params = %O', params);
    if (!params.data.onMap) { return '<span>'; }
    const id = params.data.id;
    const zoomLvl = getZoomLvl(params.data);  
    const path = require('../../css/images/marker-icon.png');
    const icon = `<img src='${path}' id='map${id}' alt='Map Icon' 
        title='Show on Map' style='height: 22px; margin-left: 9px; cursor:pointer;'>`;
    $('#search-tbl').off('click', '#map'+id);
    $('#search-tbl').on('click', '#map'+id, showLocOnMap.bind(null, params.data.onMap, zoomLvl));
    return icon;
}
function getZoomLvl(loc) {  
    return loc.type === 'Region' ? 4 : loc.type === 'Country' ? 5 : 7;   
}
/*================== Row Styling =========================================*/
/**
 * Adds a css background-color class to interaction record rows. Source-focused 
 * interaction rows are not colored, their name rows are colored instead. 
 */
function getRowStyleClass(params) {                                             //console.log("getRowStyleClass params = %O... lvl = ", params, params.data.treeLvl);
    if (params.data.name !== "") { return; } 
    return tParams.curFocus === "srcs" ? 
        getSrcRowColorClass(params.data) : getRowColorClass(params.data.treeLvl);
}
/**
 * Adds a background-color to cells with open child interaction rows, or cells 
 * with their grouped interactions row displayed - eg, Expanding the tree cell 
 * for Africa will be highlighted, as well as the 'Unspecified Africa Interactions'
 * cell Africa's interaction record rows are still grouped within. 
 */
function getCellStyleClass(params) {                                            //console.log("getCellStyleClass for row [%s] = %O", params.data.name, params);
    if ((params.node.expanded === true && isOpenRowWithChildInts(params)) || 
        isNameRowforClosedGroupedInts(params)) {                                //console.log("setting style class")
        return tParams.curFocus === "srcs" ? 
        getSrcRowColorClass(params.data) : getRowColorClass(params.data.treeLvl);
    } 
}
function isOpenRowWithChildInts(params) {
    if (params.data.locGroupedInts) { return hasIntsAfterFilters(params); }     //console.log('params.data.interactions === true && params.data.name !== ""', params.data.interactions === true && params.data.name !== "")
    return params.data.interactions === true && params.data.name !== "";
}
/**
 * Returns true if the location row's child interactions are present in 
 * data tree after filtering.
 */
function hasIntsAfterFilters(params) {  
    return params.node.childrenAfterFilter.some(function(childRow) {
        return childRow.data.name.split(" ")[0] === "Unspecified";
    });
}
function isNameRowforClosedGroupedInts(params) {  
    return params.data.groupedInts === true;
}
/** Returns a color based on the tree level of the row. */
function getRowColorClass(treeLvl) {
    var rowColorArray = ['purple', 'green', 'orange', 'blue', 'red', 'turquoise', 'yellow'];
    var styleClass = 'row-' + rowColorArray[treeLvl];                           //console.log("styleClass = ", styleClass);
    return styleClass;
}
/** Returns a color based on the tree level of the row. */
function getSrcRowColorClass(params) {
    const rowColorArray = ['purple', 'green', 'orange', 'blue', 'red', 'turquoise', 'yellow'];
    const styleClass = 'row-' + rowColorArray[params.rowColorIdx];              //console.log("styleClass = ", styleClass);
    return styleClass;
}
function getNodeChildDetails(rcrd) {                                            //console.log("rcrd = %O", rcrd)  
    if (rcrd.isParent) {
        return { group: true, expanded: rcrd.open, children: rcrd.children };
    } else { return null; }
}
/*================== Table Filter Functions ===============================*/
function onFilterChange() {
    tblOpts.api.onFilterChanged();
}
function afterFilterChanged() {}                                                //console.log("afterFilterChange") 
/** Resets Table Status' Active Filter display */
function beforeFilterChange() {                                                 //console.log("beforeFilterChange")
    updateTableFilterStatusMsg();    
} 
/** Returns an obj with all filter models. */
function getAllFilterModels() {  
    const filters = Object.keys(tblOpts.api.filterManager.allFilters);
    return {
        'Subject Taxon': getColumnFilterApi('subject'),
        'Object Taxon': getColumnFilterApi('object'),
        'Interaction Type': getColumnFilterApi('interactionType'),
        'Tags': getColumnFilterApi('tags'),
        'Habitat': getColumnFilterApi('habitat'),
        'Country': getColumnFilterApi('country'),
        'Region': getColumnFilterApi('region'),
        'Location Desc.': getColumnFilterApi('location'),
        'Citation': getColumnFilterApi('citation'),
        'Note': getColumnFilterApi('note') 
    };  
    
    function getColumnFilterApi(colName) {
        return filters.indexOf(colName) === -1 ? null : 
            tblOpts.api.getFilterApi(colName).getModel()
    }
}
/**
 * Either displays all filters currently applied
 * , or applies the previous filter 
 * message persisted through table update into map view.
 */
function updateTableFilterStatusMsg() {                                          //console.log("updateTableFilterStatusMsg called.")
    if (tblOpts.api === undefined) { return; }
    // if (tParams.persistFilters) { return setTableFilterStatus(tParams.persistFilters); }
    getFiltersAndUpdateStatus();
}
/**
 * Adds all active filters to the table's status message. First adding any 
 * focus-level filters, such as author name or taxon, then any active filters
 * for table columns, and then checks/adds the 'interactions updated since' filter. 
 * Sets table-status with the resulting active-filters messasge.
 */
function getFiltersAndUpdateStatus() {
    const activeFilters = [];
    addActiveExternalFilters(activeFilters);
    addActiveTableFilters(activeFilters);
    setFilterStatus(activeFilters);
}
function addActiveExternalFilters(filters) {
    addFocusFilters();
    addUpdatedSinceFilter();
    
    function addFocusFilters() {
        if (tParams.focusFltrs && tParams.focusFltrs.length > 0) { 
            filters.push(tParams.focusFltrs.map(filter => filter));
        } 
    }
    function addUpdatedSinceFilter() {
        if ($('#shw-chngd')[0].checked) { 
            filters.push("Time Updated");
        } 
    }
} /* End addActiveExternalFilters */
function addActiveTableFilters(filters) {
    const filterModels = getAllFilterModels();        
    const columns = Object.keys(filterModels);        
    for (let i=0; i < columns.length; i++) {
        if (filterModels[columns[i]] !== null) { 
            filters.push(columns[i]); }
    }
}
function setFilterStatus(filters) {
    if (filters.length > 0) { setTableFilterStatus(getFilterStatus(filters)); 
    } else { resetFilterStatusBar() }
}
function getFilterStatus(filters) {
    var tempStatusTxt;
    if ($('#xtrnl-filter-status').text() === 'Filtering on: ') {
        return filters.join(', ') + '.';
    } else {
        tempStatusTxt = $('#xtrnl-filter-status').text();
        if (tempStatusTxt.charAt(tempStatusTxt.length-2) !== ',') {  //So as not to add a second comma.
            setExternalFilterStatus(tempStatusTxt + ', ');
        }
        return filters.join(', ') + '.'; 
    }
}
function setTableFilterStatus(status) {                                          //console.log("setTableFilterStatus. status = ", status)
    $('#tbl-filter-status').text(status);
}
function setExternalFilterStatus(status) {
    $('#xtrnl-filter-status').text(status);
}
function clearTableStatus() {
    $('#tbl-filter-status, #xtrnl-filter-status').empty();
}
function resetFilterStatusBar() {  
    $('#xtrnl-filter-status').text('Filtering on: ');
    $('#tbl-filter-status').text('No Active Filters.');
    tParams.focusFltrs = [];
}
/*-------------------- Filter By Time Updated ----------------------------*/
/**
 * The time-updated filter is enabled when the filter option in opts-col3 is 
 * checked. When active, the radio options, 'Today' and 'Custom', are enabled. 
 * Note: 'Today' is the default selection. 
 */
function toggleTimeUpdatedFilter(state) { 
    var filtering = state === 'disable' ? false : $('#shw-chngd')[0].checked;
    var opac = filtering ? 1 : .3;
    $('#time-fltr, .flatpickr-input, #fltr-tdy, #fltr-cstm')
        .attr({'disabled': !filtering});  
    $('#fltr-tdy')[0].checked = true;
    $('#shw-chngd')[0].checked = filtering;
    $('label[for=fltr-tdy], label[for=fltr-cstm], #time-fltr, .flatpickr-input')
        .css({'opacity': opac});
    if (filtering) { showInteractionsUpdatedToday();
    } else { resetTimeUpdatedFilter(); }
    resetToggleTreeBttn(false);
}
/** Disables the calendar, if shown, and resets table with active filters reapplied. */
function resetTimeUpdatedFilter() {
    // $('.flatpickr-input').attr({'disabled': true});
    tParams.fltrdRows = null;
    tParams.fltrSince = null;
    if (tblOpts.api && tParams.rowData) { 
        tblOpts.api.setRowData(tParams.rowData);
        syncFiltersAndUi();
    }
}
/** 
 * Filters the interactions in the table to show only those modified since the 
 * selected time - either 'Today' or a 'Custom' datetime selected using the 
 * flatpickr calendar.
 */
function filterInteractionsByTimeUpdated(e) {                               
    var elem = e.currentTarget;  
    if (elem.id === 'fltr-cstm') { showFlatpickrCal(elem); 
    } else { showInteractionsUpdatedToday(); }
}
/** 
 * Instantiates the flatpickr calendar and opens the calendar. If a custom time
 * was previously selected and stored, it is reapplied.
 */
function showFlatpickrCal(elem) {  
    misc.cal = misc.cal || initCal(elem); 
    if (misc.cstmTimeFltr) {
        misc.cal.setDate(misc.cstmTimeFltr);
        filterInteractionsUpdatedSince([], misc.cstmTimeFltr, null);
    } else {
        misc.cal.open();                                                             
        $('.today').focus();                                                   
    }
}    
/** Instantiates the flatpickr calendar and returns the flatpickr instance. */
function initCal(elem) {
    const confirmDatePlugin = require('../libs/confirmDate.js'); 
    var calOpts = {
        altInput: true,     maxDate: "today",
        enableTime: true,   plugins: [confirmDatePlugin({})],
        onReady: function() { this.amPM.textContent = "AM"; },
        onClose: filterInteractionsUpdatedSince
    }; 
    return $('#time-fltr').flatpickr(calOpts);
}
/** Filters table to show interactions with updates since midnight 'today'. */
function showInteractionsUpdatedToday() {
    misc.cal = misc.cal || initCal();
    misc.cal.setDate(new Date().today());
    filterInteractionsUpdatedSince([], new Date().today(), null);
}
/**
 * Filters all interactions in the table leaving only the records with updates
 * since the datetime specified by the user.
 */
function filterInteractionsUpdatedSince(dates, dateStr, instance) {             //console.log("\nfilterInteractionsUpdatedSince called.");
    var rowData = _util.snapshot(tParams.rowData);
    var fltrSince = dateStr || tParams.timeFltr;
    var sinceTime = new Date(fltrSince).getTime();                          
    var updatedRows = rowData.filter(addAllRowsWithUpdates);                    //console.log("updatedRows = %O", updatedRows);
    tParams.timeFltr = fltrSince;
    tblOpts.api.setRowData(updatedRows);
    tParams.fltrdRows = updatedRows;
    resetToggleTreeBttn(false);
    syncFiltersAndUi(sinceTime);

    function addAllRowsWithUpdates(rowObj) { 
        if (rowObj.interactionType) { return checkIntRowForUpdates(rowObj); }
        rowObj.children = rowObj.children ? 
            rowObj.children.filter(addAllRowsWithUpdates) : [];
        return rowObj.children.length > 0;

        function checkIntRowForUpdates(row) { 
            var rowUpdatedAt = new Date(row.updatedAt).getTime();               //console.log("row [%O}.data.updatedAt = [%s], sinceTime = [%s], rowUpdatedAt > since = [%s]", row, rowUpdatedAt, sinceTime, rowUpdatedAt > sinceTime);
            return rowUpdatedAt > sinceTime;
        }
    } /* End addAllRowsWithUpdates */
} /* End filterInteractionsUpdatedSince */ 
/**
 * When filtering by time updated, some filters will need to be reapplied.
 * (Taxa and loation filter rowdata directly, and so do not need to be reapplied.
 * Source, both auth and pub views, must be reapplied.)
 * The table filter's status message is updated. The time-updated radios are synced.
 */
function syncFiltersAndUi(sinceTime) {
    if (tParams.curFocus === "srcs") { applySrcFltrs(); }
    if (tParams.curFocus === "locs") { loadLocComboboxes(); }    
    updateTableFilterStatusMsg();  
    syncTimeUpdatedRadios(sinceTime);
}
function syncTimeUpdatedRadios(sinceTime) {
    if (new Date(new Date().today()).getTime() > sinceTime) { 
        $('#fltr-cstm')[0].checked = true;  
        misc.cstmTimeFltr = sinceTime;
    } else {
        $('#fltr-tdy')[0].checked = true; }
}
/** Reapplys active external filters, author name or publication type. */
function applySrcFltrs() {
    var resets = { 'auths': reapplyTreeTextFltr, 'pubs': reapplyPubFltr, 
        'publ': reapplyTreeTextFltr };
    var realm = tParams.curRealm;  
    resets[realm]();
}
function reapplyTreeTextFltr() {                                            
    const entity = getTableEntityName();                                         //console.log("reapplying [%s] text filter", entity);
    if (getFilterTreeTextVal(entity) === "") { return; }
    searchTreeText();
}
function getTableEntityName() {
    const names = { 'taxa': 'Taxon', 'locs': 'Location', 'auths': 'Author',
        'publ': 'Publisher', 'pubs': 'Publication' };
    const ent = tParams.curFocus === "srcs" ? tParams.curRealm : tParams.curFocus;
    return names[ent];
}
function reapplyPubFltr() {                                                     //console.log("reapplying pub filter");
    if (getSelVal('Publication Type') === "all") { return; }
    updatePubSearch();
}
/*-------------------- Unique Values Column Filter -----------------------*/
/**
 * Class function: 
 * This filter presents all unique values of column to potentially filter on.
 */
function UniqueValuesFilter() {}
UniqueValuesFilter.prototype.init = function (params) {                         //console.log("UniqueValuesFilter.prototype.init. params = %O", params)
    this.model = new UnqValsColumnFilterModel(params.colDef, params.rowModel, params.valueGetter, params.doesRowPassOtherFilter);
    this.filterModifiedCallback = params.filterModifiedCallback;
    this.valueGetter = params.valueGetter;
    this.colDef = params.colDef;
    this.filterActive = true;
    this.filterChangedCallback = params.filterChangedCallback; 
    this.rowsInBodyContainer = {};
    this.eGui = document.createElement('div');
    this.eGui.innerHTML = '<div>' +
        '<div class="ag-filter-header-container">' +
        '<label>' +
        '<input id="selectAll" type="checkbox" class="ag-filter-checkbox"/>' +
        ' ( Select All )' +
        '</label>' +
        '</div>' +
        '<div class="ag-filter-list-viewport">' +
        '<div class="ag-filter-list-container">' +
        '<div id="itemForRepeat" class="ag-filter-item">' +
        '<label>' +
        '<input type="checkbox" class="ag-filter-checkbox" filter-checkbox="true"/>' +
        '<span class="ag-filter-value"></span>' +
        '</label>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
    this.createGui();
    this.createApi();
}
UniqueValuesFilter.prototype.getGui = function () {
    return this.eGui;
}
UniqueValuesFilter.prototype.isFilterActive = function() {
    return this.model.isFilterActive();
}
UniqueValuesFilter.prototype.doesFilterPass = function (node) {
    if (this.model.isEverythingSelected()) { return true; }  // if no filter, always pass
    if (this.model.isNothingSelected()) { return false; }    // if nothing selected in filter, always fail
    var value = this.valueGetter(node);
    value = makeNull(value);
    if (Array.isArray(value)) {
        for (var i = 0; i < value.length; i++) {
            if (this.model.isValueSelected(value[i])) { return true; }
        }
        return false;
    } else { return this.model.isValueSelected(value); }
    
    return true;
}
UniqueValuesFilter.prototype.getApi = function () { // Not Working??
    return this.api;
};
UniqueValuesFilter.prototype.createApi = function () {
    var model = this.model;
    var that = this;
    this.api = {
        isFilterActive: function () {
            return model.isFilterActive();
        },
        selectEverything: function () { 
            that.eSelectAll.checked = true;
        },
        selectNothing: function () {
            that.eSelectAll.checked = false;
        },
        unselectValue: function (value) {
            model.unselectValue(value);
            that.refreshVirtualRows();
        },
        selectValue: function (value) {
            model.selectValue(value);
            that.refreshVirtualRows();
            expandTree();
        },
        isValueSelected: function (value) {
            return model.isValueSelected(value);
        },
        isEverythingSelected: function () {
            return model.isEverythingSelected();
        },
        isNothingSelected: function () {
            return model.isNothingSelected();
        },
        getUniqueValueCount: function () {
            return model.getUniqueValueCount();
        },
        getUniqueValue: function (index) {
            return model.getUniqueValue(index);
        },
        getModel: function () {
            return model.getModel();
        },
        setModel: function (dataModel) {
            if (dataModel === null) { that.eSelectAll.checked = true; } 
            model.setModel(dataModel);
            // that.refreshVirtualRows();
            that.filterChangedCallback();
        }, 
        refreshHeader: function() {
            tblOpts.api.refreshHeader();
        }
    };  
}  
// optional methods
UniqueValuesFilter.prototype.afterGuiAttached = function(params) {
    this.drawVirtualRows();
};
UniqueValuesFilter.prototype.onNewRowsLoaded = function () {}
UniqueValuesFilter.prototype.onAnyFilterChanged = function () {
    var colFilterModel = this.model.getModel();                             
    if ( colFilterModel === null ) { return; }
    var col = Object.keys(colFilterModel)[0];
    var colFilterIconName = col + 'ColFilterIcon';                              //console.log("colFilterIconName = %O", colFilterIconName)
    var selectedStr = colFilterModel[col].length > 0 ? colFilterModel[col].join(', ') : "None";

    $('a[name=' + colFilterIconName + ']').attr("title", "Showing:\n" + selectedStr);
}
UniqueValuesFilter.prototype.destroy = function () {}
// Support methods
UniqueValuesFilter.prototype.createGui = function () {
    var _this = this;
    this.eListContainer = this.eGui.querySelector(".ag-filter-list-container");
    this.eFilterValueTemplate = this.eGui.querySelector("#itemForRepeat");
    this.eSelectAll = this.eGui.querySelector("#selectAll");
    this.eListViewport = this.eGui.querySelector(".ag-filter-list-viewport");
    this.eListContainer.style.height = (this.model.getUniqueValueCount() * 20) + "px";
    removeAllChildren(this.eListContainer);
    this.eSelectAll.onclick = this.onSelectAll.bind(this);
    if (this.model.isEverythingSelected()) { this.eSelectAll.checked = true; 
    } else if (this.model.isNothingSelected()) { this.eSelectAll.checked = false; }
};
UniqueValuesFilter.prototype.onSelectAll = function () {
    var checked = this.eSelectAll.checked;
    if (checked) { this.model.selectEverything(); }
    else { this.model.selectNothing(); }

    this.updateAllCheckboxes(checked);
    this.filterChangedCallback();
};
UniqueValuesFilter.prototype.updateAllCheckboxes = function (checked) {
    var currentlyDisplayedCheckboxes = this.eListContainer.querySelectorAll("[filter-checkbox=true]");
    for (var i = 0, l = currentlyDisplayedCheckboxes.length; i < l; i++) {
        currentlyDisplayedCheckboxes[i].checked = checked;
    }
};
UniqueValuesFilter.prototype.refreshVirtualRows = function () {
    this.clearVirtualRows();
    this.drawVirtualRows();
};
UniqueValuesFilter.prototype.clearVirtualRows = function () {
    var rowsToRemove = Object.keys(this.rowsInBodyContainer);
    this.removeVirtualRows(rowsToRemove);
};
//takes array of row id's
UniqueValuesFilter.prototype.removeVirtualRows = function (rowsToRemove) {      //console.log("removeVirtualRows called. rows = %O", rowsToRemove)
    var _this = this;
    rowsToRemove.forEach(function (indexToRemove) {
        var eRowToRemove = _this.rowsInBodyContainer[indexToRemove];
        _this.eListContainer.removeChild(eRowToRemove);
        delete _this.rowsInBodyContainer[indexToRemove];
    });
};
UniqueValuesFilter.prototype.drawVirtualRows = function () {
    var topPixel = this.eListViewport.scrollTop;
    var firstRow = Math.floor(topPixel / 20);
    this.renderRows(firstRow);
};
UniqueValuesFilter.prototype.renderRows = function (start) {
    var _this = this;
    for (var rowIndex = start; rowIndex <= this.model.getDisplayedValueCount(); rowIndex++) {
        //check this row actually exists (in case overflow buffer window exceeds real data)
        if (this.model.getDisplayedValueCount() > rowIndex) {
            var value = this.model.getDisplayedValue(rowIndex);
            _this.insertRow(value, rowIndex);
        }
    }
};
UniqueValuesFilter.prototype.insertRow = function (value, rowIndex) {
    var _this = this;
    var eFilterValue = this.eFilterValueTemplate.cloneNode(true);
    var valueElement = eFilterValue.querySelector(".ag-filter-value");
    var blanksText = '( Blanks )';
    var displayNameOfValue = value === null || value === "" ? blanksText : value;
    valueElement.innerHTML = displayNameOfValue;
    var eCheckbox = eFilterValue.querySelector("input");
    eCheckbox.checked = this.model.isValueSelected(value);
    eCheckbox.onclick = function () {
        _this.onCheckboxClicked(eCheckbox, value);
    };
    eFilterValue.style.top = (20 * rowIndex) + "px";
    this.eListContainer.appendChild(eFilterValue);
    this.rowsInBodyContainer[rowIndex] = eFilterValue;
};
UniqueValuesFilter.prototype.onCheckboxClicked = function (eCheckbox, value) {
    var checked = eCheckbox.checked;
    if (checked) {
        this.model.selectValue(value);
        if (this.model.isEverythingSelected()) {
            this.eSelectAll.checked = true;
        }
    }
    else {
        this.model.unselectValue(value);
        this.eSelectAll.checked = false;
        //if set is empty, nothing is selected
        if (this.model.isNothingSelected()) {
            this.eSelectAll.checked = false;
        }
    }
    this.filterChangedCallback();
};
/*------------------------UnqValsColumnFilterModel----------------------------------*/
/** Class Function */
function UnqValsColumnFilterModel(colDef, rowModel, valueGetter, doesRowPassOtherFilters) { //console.log("UnqValsColumnFilterModel.prototype.init. arguments = %O", arguments);
    this.colDef = colDef;                                                       
    this.rowModel = rowModel;                                                   
    this.valueGetter = valueGetter; 
    this.doesRowPassOtherFilters = doesRowPassOtherFilters; 
    this.filterParams = this.colDef.filterParams;  
    this.usingProvidedSet = this.filterParams && this.filterParams.values;
    this.createAllUniqueValues();
    this.createAvailableUniqueValues();
    this.displayedValues = this.availableUniqueValues;
    this.selectedValuesMap = {};
    this.selectEverything();
}
UnqValsColumnFilterModel.prototype.createAllUniqueValues = function () {
    if (this.usingProvidedSet) { 
        this.allUniqueValues = toStrings(this.filterParams.values);
    }
    else { this.allUniqueValues = toStrings(this.getUniqueValues()); }
    this.allUniqueValues.sort(); 
};
UnqValsColumnFilterModel.prototype.getUniqueValues = function () {
    var _this = this;
    var uniqueCheck = {};
    var result = [];
    this.rowModel.forEachNode(function (node) {
        if (!node.group) {
            var value = _this.valueGetter(node);
            if (value === "" || value === undefined) { value = null; }
            addUniqueValueIfMissing(value);
        }
    });
    function addUniqueValueIfMissing(value) {
        if (!uniqueCheck.hasOwnProperty(value)) {
            result.push(value);
            uniqueCheck[value] = 1; }
    }
    return result;
};
UnqValsColumnFilterModel.prototype.createAvailableUniqueValues = function () {
    this.availableUniqueValues = this.allUniqueValues;
};
UnqValsColumnFilterModel.prototype.getUniqueValueCount = function () {
    return this.allUniqueValues.length;
};
UnqValsColumnFilterModel.prototype.selectEverything = function () {
    var count = this.allUniqueValues.length;
    for (var i = 0; i < count; i++) {
        var value = this.allUniqueValues[i];
        this.selectedValuesMap[value] = null;
    }
    this.selectedValuesCount = count;
    // this.
};
UnqValsColumnFilterModel.prototype.selectNothing = function () {
    this.selectedValuesMap = {};
    this.selectedValuesCount = 0;
};
UnqValsColumnFilterModel.prototype.unselectValue = function (value) {
    if (this.selectedValuesMap[value] !== undefined) {
        delete this.selectedValuesMap[value];
        this.selectedValuesCount--;
    }
};
UnqValsColumnFilterModel.prototype.selectValue = function (value) {
    if (this.selectedValuesMap[value] === undefined) {
        this.selectedValuesMap[value] = null;
        this.selectedValuesCount++;
    }
};
UnqValsColumnFilterModel.prototype.isEverythingSelected = function () {
    return this.allUniqueValues.length === this.selectedValuesCount;
};
UnqValsColumnFilterModel.prototype.isNothingSelected = function () {
    return this.allUniqueValues.length === 0;
};
UnqValsColumnFilterModel.prototype.isValueSelected = function (value) {
    return this.selectedValuesMap[value] !== undefined;
};
UnqValsColumnFilterModel.prototype.getDisplayedValueCount = function () {
    return this.displayedValues.length;
};
UnqValsColumnFilterModel.prototype.getDisplayedValue = function (index) {
    return this.displayedValues[index];
};
UnqValsColumnFilterModel.prototype.isFilterActive = function () {
    return this.allUniqueValues.length !== this.selectedValuesCount;
    // return false;
};
UnqValsColumnFilterModel.prototype.getModel = function () {
    var model = {};
    var column = this.colDef.field;
    model[column] = [];
    if (!this.isFilterActive()) { return null; }
    var selectedValues = [];
    iterateObject(this.selectedValuesMap, function (key) {
        model[column].push(key);
    });
    return model;
};
UnqValsColumnFilterModel.prototype.setModel = function (model, isSelectAll) {
    if (model && !isSelectAll) {
        this.selectNothing();
        for (var i = 0; i < model.length; i++) {
            var newValue = model[i];
            if (this.allUniqueValues.indexOf(newValue) >= 0) {
                this.selectValue(model[i]);
            } else {
                tblOpts.api.showNoRowsOverlay(); 
                console.warn('Value ' + newValue + ' is not a valid value for filter'); 
            }
        }
    } else { this.selectEverything(); }
};
/*=================CSV Methods================================================*/
/**
 * Exports a csv of the interaction records displayed in the table, removing 
 * tree rows and flattening tree data where possible: currently only taxon.
 * For taxon csv export: The relevant tree columns are shown and also exported. 
 */
function exportCsvData() {
    var views = { 'locs': 'Location', 'srcs': 'Source', 'taxa': 'Taxon' };
    var fileName = 'Bat Eco-Interaction Records by '+ views[tParams.curFocus] +'.csv';
    var params = {
        onlySelected: true,
        fileName: fileName,
        // customHeader: "This is a custom header.\n\n",
        // customFooter: "This is a custom footer."
    };
    if (tParams.curFocus === 'taxa') { showTaxonCols(); }
    tblOpts.columnApi.setColumnsVisible(['name', 'intCnt', 'edit', 'map'], false);
    selectRowsForExport();
    tblOpts.api.exportDataAsCsv(params);
    returnTableState();
}
function returnTableState() {
    collapseTree();
    tblOpts.columnApi.setColumnsVisible(['name', 'intCnt', 'edit'], true);
    if (tParams.curFocus === 'locs') { tblOpts.columnApi.setColumnsVisible(['map'], true); }
    if (tParams.curFocus === 'taxa') { revertTaxonTable(); }
}
function showTaxonCols() {
    tblOpts.columnApi.setColumnsVisible(getCurTaxonLvlCols(), true)
}
function getCurTaxonLvlCols() {                                                 //console.log("taxaByLvl = %O", tParams.taxaByLvl)
    var lvls = Object.keys(tParams.taxaByLvl);
    return lvls.map(function(lvl){ return 'tree' + lvl; });
}
function revertTaxonTable() {
    tblOpts.columnApi.setColumnsVisible(getCurTaxonLvlCols(), false)
    expandTreeByOne(); 
}
/**
 * Selects every interaction row in the currently displayed table by expanding all
 * rows in order to get all the rows via the 'rowsToDisplay' property on the rowModel.
 */
function selectRowsForExport() {
    tblOpts.api.expandAll();
    tblOpts.api.getModel().rowsToDisplay.forEach(selectInteractions);           //console.log("selected rows = %O", tblOpts.api.getSelectedNodes())   
}
/**
 * A row is identified as an interaction row by the 'interactionType' property
 * present in the interaction row data.
 */
function selectInteractions(rowNode) { 
    if (rowNode.data.interactionType !== undefined) {                       
        rowNode.setSelected(true);
    }
}
/*================= Utility ==================================================*/
function clearCol2() {
    $('#opts-col2').empty();
}
/** 
 * Returns a record detached from the original. If no records are passed, the 
 * focus' records are used.
 */
function getDetachedRcrd(rcrdKey, rcrds) {                                  
    const orgnlRcrds = rcrds || tParams.rcrdsById;                              //console.log("getDetachedRcrd. key = %s, rcrds = %O", rcrdKey, orgnlRcrds);
    try {
       return _util.snapshot(orgnlRcrds[rcrdKey]);
    }
    catch (e) { 
       console.log("#########-ERROR- couldn't get record [%s] from %O", rcrdKey, orgnlRcrds);
    }
}
/** If table is filtered by an external filter, the rows are stored in fltrdRows. */
function getAllCurRows() {
    return tParams.fltrdRows || tParams.rowData;
}
function showPopUpMsg(msg) {                                                    //console.log("showPopUpMsg. msg = ", msg)
    const popUpMsg = msg || 'Loading...';
    $('#db-popup').text(popUpMsg);
    $('#db-popup').addClass('loading'); //used in testing
    $('#db-popup, #db-overlay').show();
    fadeTable();
}
function hidePopUpMsg() {
    $('#db-popup, #db-overlay').hide();
    $('#db-popup').removeClass('loading'); //used in testing
    showTable();
}
function fadeTable() {  
    $('#borderLayout_eRootPanel, #tool-bar').fadeTo(100, .3);
}
function showTable() {
    $('#borderLayout_eRootPanel, #tool-bar').fadeTo(100, 1);
}
function finishTableAndUiLoad() {
    hidePopUpMsg();
    enableTableButtons();
    hideUnusedColFilterMenus();
} 
function enableTableButtons() {  
    $('.tbl-tools button, .tbl-tools input, button[name="futureDevBttn"]')
        .attr('disabled', false).css('cursor', 'pointer');
    $('button[name="show-hide-col"]').css('cursor', 'not-allowed');
    $('.tbl-tools, button[name="futureDevBttn"]').fadeTo(100, 1);
    authDependentInit(); 
}
function disableTableButtons() {
    $(`.tbl-tools button, .tbl-tools input, button[name="futureDevBttn"]`)
        .attr('disabled', 'disabled').css('cursor', 'default');
    $('.tbl-tools, button[name="futureDevBttn"]').fadeTo(100, .3); 
}
/**
 * Hides the "tree" column's filter button. (Filtering on the group 
 * column only filters the leaf nodes, by design. It is not useful here.)
 * Hides the sort icons for the 'edit' and 'map' columns.
 * Hides the filter button on the 'edit' and 'count' columns.
 *    Also hides for the map, elevation, latitude, longitude location columns.
 */
function hideUnusedColFilterMenus() {
    $('.ag-header-cell-menu-button.name').hide();
    $('.ag-header-cell-menu-button.edit').hide();
    $('.ag-header-cell-menu-button.intCnt').hide();
    $('.ag-header-cell-menu-button.map').hide();
    /** Hides sort icons for the map & edit columns. */
    $('div[colId="map"] .ag-sort-none-icon').hide();
    $('div[colId="map"] .ag-sort-ascending-icon').hide();
    $('div[colId="map"] .ag-sort-descending-icon').hide();
    $('div[colId="edit"] .ag-sort-none-icon').hide();
    $('div[colId="edit"] .ag-sort-ascending-icon').hide();
    $('div[colId="edit"] .ag-sort-descending-icon').hide();
    /* Hides filters for these loc data columns */
    $('.ag-header-cell-menu-button.elev').hide();
    $('.ag-header-cell-menu-button.lat').hide();
    $('.ag-header-cell-menu-button.lng').hide();
    $('div[colId="lat"] .ag-sort-none-icon').hide();
    $('div[colId="lat"] .ag-sort-ascending-icon').hide();
    $('div[colId="lat"] .ag-sort-descending-icon').hide();
    $('div[colId="lng"] .ag-sort-none-icon').hide();
    $('div[colId="lng"] .ag-sort-ascending-icon').hide();
    $('div[colId="lng"] .ag-sort-descending-icon').hide();
}
/** Sorts the all levels of the data tree alphabetically. */
function sortDataTree(tree) {
    var sortedTree = {};
    var keys = Object.keys(tree).sort();    

    for (var i=0; i<keys.length; i++){ 
        sortedTree[keys[i]] = sortNodeChildren(tree[keys[i]]);
    }
    return sortedTree;

    function sortNodeChildren(node) { 
        if (node.children) {  
            node.children = node.children.sort(alphaEntityNames);
            node.children.forEach(sortNodeChildren);
        }
        return node;
    } 
} /* End sortDataTree */
/** Alphabetizes array via sort method. */
function alphaEntityNames(a, b) {                                               //console.log("alphaSrcNames a = %O b = %O", a, b);
    var x = a.displayName.toLowerCase();
    var y = b.displayName.toLowerCase();
    return x<y ? -1 : x>y ? 1 : 0;
}
/** Sorts an array of options via sort method. */
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
/**
 * Returns an array with table-row objects for each interaction record.
 * Note: var idx is used for row coloring.
 */
function getIntRowData(intRcrdAry, treeLvl, idx) {
    if (intRcrdAry) {
        return intRcrdAry.map(function(intRcrd){                                //console.log("intRcrd = %O", intRcrd);
            return buildIntRowData(intRcrd, treeLvl, idx);
        });
    }
    return [];
}
/* ------------- Selectize Library -------------------------------------- */
/**
 * Inits 'selectize' for each select elem in the form's 'selElems' array
 * according to the 'selMap' config. Empties array after intializing.
 */
function initCombobox(field) {                                                  //console.log("initCombobox [%s]", field);
    const confg = getSelConfgObj(field); 
    initSelectCombobox(confg);  
} /* End initComboboxes */
function initComboboxes(fieldAry) {
    fieldAry.forEach(field => initCombobox(field));
}
function getSelConfgObj(field) {
    const confgs = { 
        'Focus' : { name: field, id: '#search-focus', change: selectSearchFocus },
        'Class' : { name: field, id: '#sel'+field, change: updateTaxonSearch },
        'Country' : { name: field, id: '#sel'+field, change: updateLocSearch },
        'Family' : { name: field, id: '#sel'+field, change: updateTaxonSearch },
        'Genus' : { name: field, id: '#sel'+field, change: updateTaxonSearch },
        'Order' : { name: field, id: '#sel'+field, change: updateTaxonSearch },
        'Publication Type' : {name: field, id: '#selPubType', change: updatePubSearchByType },
        'Loc View' : {name: field, id: '#sel-realm', change: onLocViewChange },
        'Source Type': { name: field, id: '#sel-realm', change: onSrcRealmChange },
        'Species' : { name: field, id: '#sel'+field, change: updateTaxonSearch },
        'Taxon Realm' : { name: 'Realm', id: '#sel-realm', change: onTaxonRealmChange },
        'Region' : { name: field, id: '#sel'+field, change: updateLocSearch },
    };
    return confgs[field];
}
/**
 * Inits the combobox, using 'selectize', according to the passed config.
 * Note: The 'selectize' library turns select dropdowns into input comboboxes
 * that allow users to search by typing.
 */
function initSelectCombobox(confg) {                                            //console.log("initSelectCombobox. CONFG = %O", confg)
    const options = {
        create: false,
        onChange: confg.change,
        onBlur: saveOrRestoreSelection,
        placeholder: getPlaceholer(confg.id)
    };
    const sel = $(confg.id).selectize(options); 

    function getPlaceholer(id) {
        const optCnt = $(id + ' > option').length;  
        const placeholder = 'Select ' + confg.name
        return optCnt ? 'Select ' + confg.name : '- None -';
    }
} /* End initSelectCombobox */
function getSelVal(field) {                                                     //console.log('getSelVal [%s]', field);
    const confg = getSelConfgObj(field);                                        //console.log('getSelVal [%s] = [%s]', field, $(confg.id)[0].selectize.getValue());
    return $(confg.id)[0].selectize.getValue();  
}
function getSelTxt(field) {
    const confg = getSelConfgObj(field);
    const $selApi = $(confg.id)[0].selectize; 
    return $selApi.getItem(id).length ? $selApi.getItem(id)[0].innerText : false;
}
function setSelVal(field, val, silent) {                                        //console.log('setSelVal [%s] = [%s]', field, val);
    const confg = getSelConfgObj(field);
    const $selApi = $(confg.id)[0].selectize; 
    $selApi.addItem(val, silent); 
    saveSelVal($(confg.id), val);
}
function saveSelVal($elem, val) {
    $elem.data('val', val);
}
/**
 * onBlur: the elem is checked for a value. If one is selected, it is saved. 
 * If none, the previous is restored. 
 */
function saveOrRestoreSelection() {                                             //console.log('----------- saveOrRestoreSelection')
    const $elem = this.$input;  
    const field = $elem.data('field'); 
    const prevVal = $elem.data('val');          
    const curVal = getSelVal(field);                                 
    return curVal ? saveSelVal($elem, curVal) : setSelVal(field, prevVal, 'silent');
} /* End saveOrRestoreSelection */
function newSelEl(opts, c, i, field) {                                          //console.log('newSelEl for [%s]. args = %O', field, arguments);
    const elem = _util.buildSelectElem(opts, { class: c, id: i });
    $(elem).data('field', field);
    return elem;
}
function enableComboboxes(enable, $pElems) {
    $pElems.each((i, elem) => {  
        if (enable) { enableCombobox(elem); } else { disableCombobox(elem); }
    });
}
function enableCombobox(elem) {
    elem.selectize.enable();
}
function disableCombobox(elem) {
    elem.selectize.disable();
}
// function updatePlaceholderText(elem, newTxt) {                               //console.log('updating placeholder text to [%s] for elem = %O', newTxt, elem);
//     elem.selectize.settings.placeholder = 'Select ' + newTxt;
//     elem.selectize.updatePlaceholder();
// }
/*--------------------- Table Button Methods ------------------------------*/
function toggleExpandTree() {                                                   //console.log("toggleExpandTree")
    var expanded = $('#xpand-all').data('xpanded');
    $('#xpand-all').data("xpanded", !expanded);
    return expanded ? collapseTree() : expandTree();
}
function expandTree() {
    tblOpts.api.expandAll();    
    $('#xpand-all').html("Collapse All");
}
function collapseTree() {
    tblOpts.api.collapseAll();
    $('#xpand-all').html("Expand All");
}
/**
 * Resets button based on passed boolean xpanded state. True for fully 
 * expanded and false when collapsed.
 */
function resetToggleTreeBttn(xpanded) {
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
    var tblModel = tblOpts.api.getModel();                                      //console.log("tblModel = %O", tblModel);
    var bttXpandedAll = $("#xpand-all").data('xpanded');
    if (opening && bttXpandedAll === true) {return;}

    tblModel.rowsToDisplay.forEach(function(row) {                             //console.log("rowToDisplay = %O", row)
        if (!opening && !isNextOpenLeafRow(row)) { return; }
        row.expanded = opening;
        row.data.open = opening;
    });
    tblOpts.api.onGroupExpandedOrCollapsed();
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
    tblOpts.api.forEachNodeAfterFilter(function(node){ cnt += 1; }); 
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
/** Table-rebuild entry point after form-window close. */
function resetDataSearchTable(focus) {                                          //console.log('resetting search table.')
    resetToggleTreeBttn(false);
    resetFilterStatusBar();
    if ($('#shw-chngd')[0].checked) { toggleTimeUpdatedFilter('disable'); }
    selectSearchFocus(focus);
}
/** Refactor: combine with resetDataSearchTable. */
export function initDataTable(focus) {                                          //console.log('resetting search table.')
    resetDataSearchTable(focus);
    updateUiForTableView();
}
function selectSearchFocus(f) { 
    const focus = f || getSelVal('Focus');                                      console.log("---select(ing)SearchFocus = ", focus); 
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
 */
function updateFocusAndBuildTable(focus, tableBuilder) {                        //console.log("updateFocusAndBuildTable called. focus = [%s], tableBuilder = %O", focus, tableBuilder)
    clearPreviousTable();
    if (focusNotChanged(focus)) { return tableBuilder(); }                      //console.log('--- Focus reset to [%s]', focus);
    _util.populateStorage('curFocus', focus);
    clearOnFocusChange(tableBuilder);
} 
function focusNotChanged(focus) {
    return focus === tParams.curFocus;
}
function clearOnFocusChange(tableBuilder) {
    dataStorage.removeItem('curRealm');
    resetFilterStatusBar();
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
        if ($('#shw-chngd')[0].checked) { $('#shw-chngd').click(); } //resets updatedAt table filter
    }
} /* End clearPastHtmlOptions */
/**
 * When the interaction form is exited, the passed focus is selected and the 
 * table is refreshed with the 'interactions updates since' filter set to 'today'.
 */
function showTodaysUpdates(focus) {                                             //console.log("showingUpdated from today")
    if (focus) { setSelVal('Focus', focus); 
    } else { selectSearchFocus(); }
    window.setTimeout(showUpdatesAfterTableLoad, 200);
}
function showUpdatesAfterTableLoad() {
    $('#shw-chngd')[0].checked = true;
    toggleTimeUpdatedFilter();
}
export function showUpdates(focus) {
    showTodaysUpdates(focus);
}
function clearPreviousTable() {                                                 //console.log("clearing table");
    if (tblOpts.api) { tblOpts.api.destroy(); }  
    $('#map').hide(); //Clears location map view
    $('#search-tbl').show();
}
/**
 * Resets table state to top focus options: Taxon and source are reset at current
 * realm; locations are reset to the top regions.
 */
function resetDataTable() {                                                     //console.log("---reseting table---")
    const resetMap = { taxa: resetTaxonRealm, locs: rebuildLocTree, srcs: resetSourceRealm };
    resetCurTreeState();
    resetMap[tParams.curFocus](); 
} 
/** Resets storage props, buttons and filter status. */
function resetCurTreeState() {                                                  //console.log('\n### Restting tree state ###')
    resetCurTreeStorageProps();
    resetToggleTreeBttn(false);
    if ($('#shw-chngd')[0].checked) { $('#shw-chngd')[0].checked = false; }     //resets updatedAt table filter
    updateTableFilterStatusMsg();
}
/** Deltes the props uesd for only the displayed table in the global tParams. */
function resetCurTreeStorageProps() {
    var props = ['curTree', 'selectedVals', 'fltrdRows', 'focusFltrs'];
    props.forEach(function(prop){ delete tParams[prop]; });
    tParams.selectedOpts = {};
}
/**
 * When the table rowModel is updated, the total interaction count for each 
 * tree node, displayed in the "count" column, is updated to count only displayed
 * interactions. Any rows filtered out will not be included in the totals.
 */
function onModelUpdated() {                                                     //console.log("--displayed rows = %O", tblOpts.api.getModel().rowsToDisplay);
    updateTotalRowIntCount( tblOpts.api.getModel().rootNode );
}
/**
 * Sets new interaction totals for each tree node @getChildrenCnt and then 
 * calls the table's softRefresh method, which refreshes any rows with "volatile"
 * set "true" in the columnDefs - currently only "Count".
 */
function updateTotalRowIntCount(rootNode) {
    getChildrenCnt(rootNode.childrenAfterFilter);  
    tblOpts.api.softRefreshView();
}
function getChildrenCnt(nodeChildren) {                                         //console.log("nodeChildren =%O", nodeChildren)
    var nodeCnt, ttl = 0;
    nodeChildren.forEach(function(child) {
        nodeCnt = 0;
        nodeCnt += addSubNodeInteractions(child);
        ttl += nodeCnt;
        if (nodeCnt !== 0 && child.data.intCnt !== null) { child.data.intCnt = nodeCnt; }
    });
    return ttl;
}
/**
 * Interaction records are identified by their lack of any children, specifically 
 * their lack of a "childrenAfterFilter" property.
 */
function addSubNodeInteractions(child) {  
    var cnt = 0;
    if (child.childrenAfterFilter) {
        cnt += getChildrenCnt(child.childrenAfterFilter);
        if (cnt !== 0) { child.data.intCnt = cnt; }
    } else { /* Interaction record row */
        ++cnt;
        child.data.intCnt = null; 
    }
    return cnt;
}
/*------- Style Manipulation ---------------------------------------------*/
function addOrRemoveCssClass(element, className, add) {
    if (add) { addCssClass(element, className);
    } else { removeCssClass(element, className); }
}
function removeCssClass(element, className) {
    if (element.className && element.className.length > 0) {
        var cssClasses = element.className.split(' ');
        var index = cssClasses.indexOf(className);
        if (index >= 0) {
            cssClasses.splice(index, 1);
            element.className = cssClasses.join(' ');
        }
    }
};
function addCssClass(element, className) {
    if (element.className && element.className.length > 0) {
        var cssClasses = element.className.split(' ');
        if (cssClasses.indexOf(className) < 0) {
            cssClasses.push(className);
            element.className = cssClasses.join(' ');
        }
    }
    else { element.className = className; }
};
/*---------Unique Values Filter Utils--------------------------------------*/
function loadTemplate(template) {
    var tempDiv = document.createElement("div");
    tempDiv.innerHTML = template;
    return tempDiv.firstChild;
}
function toStrings(array) {
    return array.map(function (item) {
        if (item === undefined || item === null || !item.toString) {
            return null;
        } else { return item.toString(); }
    });
}
function removeAllChildren(node) {
    if (node) {
        while (node.hasChildNodes()) {
            node.removeChild(node.lastChild); }
    }
}
function makeNull(value) {
    if (value === null || value === undefined || value === "") {
        return null;
    } else { return value; }
}
function iterateObject(object, callback) {
    var keys = Object.keys(object);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = object[key];
        callback(key, value);
    }
};