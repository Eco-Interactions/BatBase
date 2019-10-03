/**
 * Handles UI related to the database search page.
 *
 * Exports:                         Imported by:
 *     addDomEventListeners             db_page
 *     collapseTree                     csv-data
 *     pg_init                          db_page
 *     initLocSearchUi                  db_page
 *     initSrcSearchUi                  db_page
 *     initTaxonSearchUi                db_page
 *     loadLocFilterPanelElems          db-page, db-filters
 *     loadTaxonComboboxes              db-page, db-filters     
 *     loadTxnFilterPanelElems          db-page
 *     resetToggleTreeBttn              db_page, init-table
 *     showLoadingDataPopUp             util
 *     showTips                         intro
 *     updateUiForTableView             db-page
 *     updateUiForMapView               db-page
 */
import * as _u from './util.js';
import exportCsvData from './db-table/csv-data.js';
import { createEntity } from './db-forms/db-forms.js';
import * as db_page from './db-page.js';
import * as db_filters from './db-table/db-filters.js';
import { showInts } from './db-map/db-map.js';
import { enableListReset, toggleSaveIntsPanel } from './panels/save-ints.js';
import { addPanelEvents, closeOpenPanels } from './panels/panel-util.js';

const app = {
    userRole: $('body').data("user-role"),
    enabledSelectors: ''
};
/* ============================= DATABASE SEARCH PAGE INIT ========================================================== */
export function pg_init() {
    addDomEventListeners();
    adaptUiToScreenSize();
    authDependentInit();
}
/** 
 * Moves the buttons from the end of the search menu to just the header row.
 * (Not used currently. Could revive in the future if the search menu grows.)
 */
function adaptUiToScreenSize() {
    // if ($(window).width() > 1500) { return; }
    // const elemCntnr = $('#data-opts').detach();  
    // const cntnr = _u.buildElem('div', { class: 'flex-row' });
    // $(cntnr).css({ width: '100%', 'justify-content': 'flex-end' });
    // $(elemCntnr)[0].className = 'flex-row';
    // $(cntnr).append(elemCntnr);
    // $('#hdr-right').append(cntnr);
}
function addDomEventListeners() {
    $('button[name="xpand-all"]').click(toggleExpandTree);
    $('button[name="xpand-1"]').click(expandTreeByOne);
    $('button[name="collapse-1"]').click(collapseTreeByOne);
    $('#shw-map').click(showTableRecordsOnMap);
    $('button[name="reset-tbl"]').click(db_page.resetDataTable);
    addPanelEvents(app.userRole);
}
/** Shows a loading popup message for the inital data-download wait. */
export function showLoadingDataPopUp(type) {
    const msgs = { 'user': 'Downloading all user-specific data.' };
    const msg = msgs[type] || `Downloading and caching all interaction records. 
        Please allow for a ~45 second download.`;
    showPopUpMsg(msg);   
}
function authDependentInit() {
    const initMap = {
        visitor: disableUserFeatures, user: enableUserFeatures,
        editor: enableEditorFeatures, admin: enableAdminFeatures,
        super: enableAdminFeatures
    };
    initMap[app.userRole]();
}
function disableUserFeatures() {                                                //console.log('disableUserFeatures')
    $(`button[name="csv"], #list-opts button, #new-data, #rvw-data, 
        #selSavedFilters, .fltr-desc, #apply-filter, #save-filter, #delete-filter, 
        #stored-filters input, #stored-filters textarea`)
        .css({'opacity': '.5', 'cursor': 'not-allowed' }).prop('disabled', true)
        .prop('title', "Please register to use these features.");
    app.enabledSelectors = '#filter';
}
function enableUserFeatures() {                                                 //console.log('enableUserFeatures')
    $('button[name="csv"]').click(exportCsvData); 
    $('button[name="int-set"]').click(toggleSaveIntsPanel);
    $('#new-data').css({'opacity': '.5', 'cursor': 'not-allowed' })
        .prop('title', 'This feature is only available to editors.');
    $('#rvw-data').css({'opacity': '.5', 'cursor': 'not-allowed' })
        .prop('title', 'This feature is only available to admins.');
    app.enabledSelectors = `#filter, button[name="csv"], button[name="int-set"]`;
}
function enableEditorFeatures() {                                               //console.log('enableEditorFeatures')
    $('button[name="csv"]').click(exportCsvData);  
    $('button[name="int-set"]').click(toggleSaveIntsPanel);
    $('#new-data').addClass('adminbttn')
        .click(createEntity.bind(null, 'create', 'interaction'));
    $('#rvw-data').addClass('adminbttn');
    app.enabledSelectors = `#filter, button[name="csv"], button[name="int-set"], 
        #new-data, #rvw-data`;
}
function enableAdminFeatures() {                                                //console.log('enableAdminFeatures')
    $('button[name="csv"]').click(exportCsvData);  
    $('button[name="int-set"]').click(toggleSaveIntsPanel);
    $('#new-data').addClass('adminbttn')
        .click(createEntity.bind(null, 'create', 'interaction'));
    $('#rvw-data').addClass('adminbttn');
    app.enabledSelectors = '.map-dsbl';
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
    const tblApi = db_page.accessTableState().get('api');
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
    const tblApi = db_page.accessTableState().get('api');
    const tblModel = tblApi.getModel();                                         //console.log("tblModel = %O", tblModel);
    const bttXpandedAll = $("#xpand-all").data('xpanded');
    if (opening && bttXpandedAll === true) {return;}

    tblModel.rowsToDisplay.forEach(function(row) {                              //console.log("rowToDisplay = %O", row)
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
    tblApi.forEachNodeAfterFilter(function(node){ cnt += 1; }); 
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
/* ====================== DATABASE ENTITY VIEW UI =================================================================== */
/* ---------------------------- TAXON VIEW -------------------------------------------------------------------------- */
/** Loads the taxon view options and updates the data-view combobox. */
export function initTaxonSearchUi(curView) {                                       //console.log("initTaxonSearchUi. realms = %O", realms);
    _u.getData('realm').then( realms => {                                       //console.log('--initTaxonSearchUi. realms = %O', realms)
        loadTxnViewOpts(realms);
        setTaxonView(curView); 
        $('#focus-filters').empty();  
    });
}
function loadTxnViewOpts(realms) {
    if ($('#sel-view').data('focus') === 'taxa') { return; }
    buildAndLoadTxnOpts(realms);
}
function buildAndLoadTxnOpts(realms) {
    const opts = getViewOpts(realms);
    _u.replaceSelOpts('#sel-view', opts, db_page.onTxnViewChange);
    $('#sel-view').data('focus', 'taxa');
}
function getViewOpts(realms) {  
    const optsAry = [];
    for (let id in realms) {                                                
        optsAry.push({ value: realms[id].taxon, text: realms[id].displayName });
    }
    return optsAry;
}
/** Restores stored realm from previous session or sets the default 'Bats'. */
function setTaxonView(curView) {
    if (!_u.getSelVal('View')) { 
        const realmVal = curView ? curView : "2";  
        _u.setSelVal('View', realmVal, 'silent');
    }
}
/* ---------------------------- TAXON FILTER UI ----------------------------- */
export function loadTxnFilterPanelElems(tblState) {
    if ($('#focus-filters div').length) { return loadTaxonComboboxes(tblState); }
    loadTaxonComboboxes(tblState);
    loadTxnNameSearchElem(tblState);
}
function loadTxnNameSearchElem(tblState) {
    const searchTreeElem = db_filters.buildTreeSearchHtml('Taxon');
    $('#focus-filters').append(searchTreeElem);
}
/**
 * Builds and initializes a search-combobox for each level present in the 
 * the unfiltered realm tree. Each level's box is populated with the names 
 * of every taxon at that level in the displayed, filtered, table-tree. After 
 * appending, the selects are initialized with the 'selectize' library @initComboboxes.
 */
export function loadTaxonComboboxes(tblState) {
    const lvlOptsObj = buildTaxonSelectOpts(tblState);
    const levels = Object.keys(lvlOptsObj);
    const loadFunc = $('#focus-filters div').length ? updateTaxonSelOptions : loadLevelSelects;
    if (levels.indexOf(tblState.realmLvl) !== -1) { levels.shift(); } //Removes realm level
    loadFunc(lvlOptsObj, levels, tblState);
}
/**
 * Builds select options for each level with taxon data in the current realm.
 * If there is no data after filtering at a level, a 'none' option obj is built
 * and will be selected.
 */
function buildTaxonSelectOpts(tblState) {                                       //console.log("buildTaxonSelectOpts levels = %O", tblState.taxaByLvl);
    const optsObj = {};
    const taxaByLvl = tblState.taxaByLvl;       
    // const curRealmLvls = tblState.allRealmLvls.slice(1);  //Skips realm lvl
    tblState.allRealmLvls.forEach(buildLvlOptions);
    return optsObj;

    function buildLvlOptions(lvl) {
        return lvl in taxaByLvl ? 
            getTaxaOptsAtLvl(taxaByLvl[lvl], lvl) : fillInLvlOpts(lvl)
    }
    /** Child levels can have multiple taxa.  */
    function getTaxaOptsAtLvl(rcrds, lvl) {
        const taxonNames = Object.keys(taxaByLvl[lvl]).sort();                  //console.log("taxonNames = %O", taxonNames);
        optsObj[lvl] = buildTaxonOptions(taxonNames, taxaByLvl[lvl]);
    }
    function buildTaxonOptions(taxonNames, data) {
        if (!taxonNames.length) { return []; }
        const opts = taxonNames.map(name => {
            return { value: data[name],
                     text: name}});
        if (optionIsSelected(opts[0].value)) {  
            opts.unshift({value: 'all', text: '- All -'});
        }
        return opts;
    }
    function optionIsSelected(id) { 
        if (Object.keys(tblState.selectedOpts).length > 2) { return; }
        return Object.keys(tblState.selectedOpts).some(k => id == tblState.selectedOpts[k]);
    }
    function fillInLvlOpts(lvl) {                                               //console.log("fillInEmptyAncestorLvls. lvl = ", lvl);
        if (lvl in tblState.selectedOpts) {
            const taxon = _u.getDetachedRcrd(tblState.selectedOpts[lvl], tblState.rcrdsById);
            optsObj[lvl] = [
                {value: 'all', text: '- All -'}, 
                {value: taxon.id, text: taxon.displayName}];  
        } else { optsObj[lvl] = []; }
    }
} /* End buildTaxonSelectOpts */
function loadLevelSelects(levelOptsObj, levels, tblState) {                     //console.log("loadLevelSelectElems. lvlObj = %O", levelOptsObj)
    const elems = buildTaxonSelects(levelOptsObj, levels);
    $('#focus-filters').append(elems);
    _u.initComboboxes(tblState.allRealmLvls);
    setSelectedTaxonVals(tblState.selectedOpts, tblState);
    
    function buildTaxonSelects(opts, levels) {  
        const elems = [];
        levels.forEach(function(level) {                                        //console.log('----- building select box for level = [%s]', level);
            const lbl = _u.buildElem('label', { class: 'sel-cntnr flex-row taxonLbl' });
            const span = _u.buildElem('span', { text: level + ': ' });
            const sel = newSelEl(opts[level], 'opts-box taxonSel', 'sel' + level, level);            
            $(lbl).append([span, sel])
            elems.push(lbl);
        });
        return elems;
    }
}
function updateTaxonSelOptions(lvlOptsObj, levels, tblState) {                  //console.log("updateTaxonSelOptions. lvlObj = %O", lvlOptsObj)          
    levels.forEach(function(level) {                                            
        _u.replaceSelOpts('#sel'+level, lvlOptsObj[level], null, level);
    });
    setSelectedTaxonVals(tblState.selectedOpts, tblState);
}
function setSelectedTaxonVals(selected, tblState) {                             //console.log("selected in setSelectedTaxonVals = %O", selected);
    if (!selected || !Object.keys(selected).length) {return;}
    tblState.allRealmLvls.forEach(function(lvl) {                               
        if (!selected[lvl]) { return; }                                         //console.log("selecting [%s] = ", lvl, selected[lvl])
        _u.setSelVal(lvl, selected[lvl], 'silent');
    });
}
/* ---------------------------- LOCATION VIEW ----------------------------------------------------------------------- */
/**
 * Builds location view html and initializes table load. Either builds the table 
 * data-tree view, by default, or loads the data-map view, if previously 
 * selected. 
 */ 
export function initLocSearchUi(view) {
    loadLocationViewOpts();
    setLocView(view);  
} 
function loadLocationViewOpts(argument) {
    if ($('#sel-view').data('focus') === 'locs') { return; }
    const opts = [{ value: 'map', text: 'Map Data' },
                { value: 'tree', text: 'Table Data' }];
    _u.replaceSelOpts('#sel-view', opts, db_page.onLocViewChange);
    $('#sel-view').data('focus', 'locs');
}
function setLocView(view) {
    const storedView = view || _u.getDataFromStorage('curView');                //console.log("setLocView. storedView = ", storedView)
    const locView = storedView || 'tree';
    _u.setSelVal('View', locView, 'silent');
}
/* ------------------------- LOCATION FILTER UI ----------------------------- */
/**
 * Builds the Location search comboboxes @loadLocComboboxes. Transform tree
 * data into table rows and load the table @transformLocDataAndLoadTable.
 */
export function loadLocFilterPanelElems(tblState) {   
    if ($('#focus-filters div').length) { return updateLocSelOptions(tblState); }
    loadLocComboboxes(tblState);
    loadLocNameSearchElem();
}
function updateLocSelOptions(tblState) {
    const opts = buildLocSelectOpts(tblState); 
    Object.keys(opts).forEach(locType => {                                            
        _u.replaceSelOpts('#sel'+locType, opts[locType], null, locType);
    });
    setSelectedLocVals(tblState.selectedOpts);
}
function loadLocNameSearchElem() {  
    const searchTreeElem = db_filters.buildTreeSearchHtml('Location');
    $('#focus-filters').append(searchTreeElem);
}
/**
 * Create and append the location search comboboxes, Region and Country, and
 * set any previously 'selected' values.
 */
function loadLocComboboxes(tblState) {  
    const opts = buildLocSelectOpts(tblState); 
    const selElems = buildLocSelects(opts);
    $('#focus-filters').append(selElems);
    _u.initComboboxes(['Region', 'Country']);
    setSelectedLocVals(tblState.selectedOpts);
}/** Builds arrays of options objects for the location comboboxes. */
function buildLocSelectOpts(tblState) {  
    const data = _u.getDataFromStorage(['countryNames', 'regionNames']);
    const processedOpts = { Region: [], Country: [] };
    const opts = { Region: [], Country: [] };  
    tblState.api.getModel().rowsToDisplay.forEach(buildLocOptsForNode);
    modifyOpts();
    return opts; 
    /**
     * Recurses through the tree and builds a option object for each unique 
     * country and region in the current table with interactions.
     */
    function buildLocOptsForNode(row) {                                 
        const rowData = row.data;  
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
        const id = data[_u.lcfirst(type) + "Names"][name];             
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
        addAllOption();
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
        const sel = tblState.selectedOpts;                                      //console.log('building opt for [%s] = %O', type, loc);
        sel[type] = id;
    }
    /** Alphabetizes the options. */
    function sortLocOpts() {
        for (let type in opts) {
            opts[type] = opts[type].sort(_u.alphaOptionObjs); 
        }
    }
    function addAllOption() {  
        Object.keys(tblState.selectedOpts).forEach(type => {
            opts[type].unshift({value: 'all', text: '- All -'})
        });
    }
} /* End buildLocSelectOpts */
/** Builds the location select elements */
function buildLocSelects(locOptsObj) {  
    const selElems = [];
    for (let locSelName in locOptsObj) {
        let elem = buildLocSel(_u.ucfirst(locSelName), locOptsObj[locSelName]); 
        selElems.push(elem);
    }
    return selElems;
    
    function buildLocSel(selName, opts) {
        const lbl = _u.buildElem('label', { class: "sel-cntnr flex-row" });
        const span = _u.buildElem('span', { text: selName + ': ', class: "opts-span" });
        const sel = newSelEl(opts, 'opts-box', 'sel' + selName, selName);
        $(lbl).addClass('locLbl').append([span, sel]);
        $(sel).addClass('locSel');
        return lbl;
    }
}
function setSelectedLocVals(selected) {                                         //console.log("selected in setSelectedLocVals = %O", selected);
    Object.keys(selected).forEach(locType => {
        _u.setSelVal(locType, selected[locType], 'silent');
    });
}
/* ---------------------------- SOURCE VIEW ------------------------------------------------------------------------- */
/**
 * If the source-realm combobox isn't displayed, build it @buildSrcViewHtml.
 * If no realm selected, set the default realm value. Start table build @buildSrcTree.
 */
export function initSrcSearchUi(srcData) {                                      //console.log("=========init source search ui");
    loadSourceViewOpts();   
    setSrcView();  
}
function loadSourceViewOpts() {
    if ($('#sel-view').data('focus') === 'srcs') { return ; }
    const opts = [{ value: "auths", text: "Authors" },
                  { value: "pubs", text: "Publications" },
                  { value: "publ", text: "Publishers" }];
    _u.replaceSelOpts('#sel-view', opts, db_page.onSrcViewChange);
    $('#sel-view').data('focus', 'srcs');
} 
/** Restores stored realm from previous session or sets the default 'Publications'. */
function setSrcView() {
    const storedView = _u.getDataFromStorage('curView');                        //console.log("storedView = ", storedView)
    const srcView = storedView || 'pubs';  
    db_page.accessTableState().set({'curView': srcView});
    if (!_u.getSelVal('View')) { _u.setSelVal('View', srcView, 'silent'); } 
}
/* ------------------------- SOURCE FILTER UI ------------------------------- */
/**
 * Will build the select elems for the source search options. Clears previous 
 * table. Calls @transformSrcDataAndLoadTable to transform tree data into table 
 * format and load the data table.
 * NOTE: This is the entry point for source table rebuilds as filters alter data
 * contained in the data tree.
 */
export function loadSrcSearchUi(realm) {                                        //console.log("buildSrcSearchUiAndTable called. realm = [%s]", realm);
    if ($('#focus-filters div').length) { return; }
    const buildUi = { 'auths': loadAuthSearchHtml, 'pubs': loadPubSearchHtml, 
        'publ':loadPublSearchHtml }; 
    buildUi[realm](); 
} 
/** Builds a text input for searching author names. */
function loadAuthSearchHtml() {
    const searchTreeElem = db_filters.buildTreeSearchHtml('Author');
    $('#focus-filters').append(searchTreeElem);
}
function loadPubSearchHtml() {
    const pubTypeElem = buildPubTypeSelect();
    const searchTreeElem = db_filters.buildTreeSearchHtml('Publication');
    // $(searchTreeElem).css('width', '228px');
    $('#focus-filters').append([searchTreeElem, pubTypeElem]); //searchTreeElem, 
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
        return opts.sort(_u.alphaOptionObjs);  
    }
    /** Builds the publication type dropdown */
    function buildPubSelects(opts) {                                            //console.log("buildPubSelects pubTypeOpts = %O", pubTypeOpts)
        const lbl = _u.buildElem('label', {class: "sel-cntnr flex-row"});
        const span = _u.buildElem('span', { text: 'Type:' });
        const sel = newSelEl(opts, '', 'selPubType', 'Publication Type');
        const lblW = $(window).width() > 1500 ? '222px' : '230px';
        $(sel).css('width', '177px');
        $(lbl).css('width', lblW).append([span, sel]);
        return lbl;
    }
} /* End loadPubSearchHtml */
function loadPublSearchHtml() {
    const searchTreeElem = db_filters.buildTreeSearchHtml('Publisher');
    $('#focus-filters').append(searchTreeElem);
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
function showTableRecordsOnMap() {                                              console.log('-----------showTableRecordsOnMap');
    const tblState = db_page.accessTableState().get(null, ['curFocus', 'rcrdsById']);
    $('#search-tbl').fadeTo('fast', 0.3, () => {
        updateUiForMapView();
        showInts(tblState.curFocus, tblState.rcrdsById, getLocRcrds());
    });

    function getLocRcrds() {
        return tblState.curFocus !== 'locs' ? 
            _u.getDataFromStorage('location') : tblState.rcrdsById;  
    }
}
function updateBttnToReturnRcrdsToTable() {
    $('#shw-map').text('Return to Table');
    $('#shw-map').off('click').on('click', returnRcrdsToTable);
}
function updateBttnToShowRcrdsOnMap() {
    $('#shw-map').text('Map Interactions');
    $('#shw-map').off('click').on('click', showTableRecordsOnMap);
}
function returnRcrdsToTable() {
    updateUiForTableView();
    if (_u.getSelVal('View') === 'map') { _u.setSelVal('View', 'tree'); }
}
/* ------------------ Search Tips ------------------------------------------- */
export function showTips() {                                                           //console.log("show tips called.")
    if (!$('#tips-close-bttn').length) { initSearchTips(); }
    $('#b-overlay-popup').addClass("tips-popup");
    $('#b-overlay, #b-overlay-popup').fadeIn(500);
    $('#show-tips').html("Tips");
    $('#show-tips').off("click");
    $('#show-tips').click(hideTips);
}
function initSearchTips() { 
    $('#b-overlay-popup').html(getSearchTipsHtml());
    bindEscEvents();
}
function hideTips() {
    $('#b-overlay').fadeOut(500, removeTips);
    $('#show-tips').html("Tips");
    $('#show-tips').off("click");
    $('#show-tips').click(showTips);
    $('#b-overlay-popup').removeClass("tips-popup");
    $('#b-overlay-popup').empty();
}
function removeTips() {                                                         //console.log("removeTips called.")
    $('#b-overlay, #b-overlay-popup').css("display", "none");
    $('#b-overlay-popup').removeClass("tips-popup");
}
function bindEscEvents() {
    addCloseButton();
    $(document).on('keyup',function(evt) {
        if (evt.keyCode == 27) { hideTips(); }
    });
    $("#b-overlay").click(hideTips);
    $('#show-tips').off("click");
    $('#show-tips').click(hideTips);
    $("#b-overlay-popup").click(function(e) { e.stopPropagation(); });
}
function addCloseButton() {
    $("#b-overlay-popup").append(`
        <button id="tips-close-bttn" class="tos-bttn">Close</button>`);
    $('#tips-close-bttn').click(hideTips)
}
function getSearchTipsHtml() {
    return `
        <h3>Tips for searching</h3>
        <ul> 
            <br><li><strong>To search by specific interaction or habitat types</strong>, click on the 
            filter menu of the Type or Habitat columns and select which ones to include in your search.  
            (<a href="definitions">Click here to see definitions</a> 
            for each interaction and habitat type.)</li>
            <br><li><strong>Interested in knowing all the fruit species known from a bat species’ 
            diet?</strong> Search for the bat species by selecting "Taxon" in the "Group Interactions by"
            field, then select "Bat" below in the "Group Taxon by" field, and then select only “Fruit” and “Seed” in the filter 
            menu for the Tags column on the table. This will provide you with a list of all plant species known to have their 
            fruit consumed, seeds consumed, and seeds dispersed by that particular bat species.</li>
            <br><li><strong>Or all of the flower species known from a bat species’ diet?</strong> 
            Search for the bat species as described above, then select only “Flower” in the filter menu for the Tags column
            on the table. This will provide you with a list of all plant species known to have their flowers visited, consumed, 
            or pollinated by that particular bat species.</li>
            <br><li><strong>Interested in knowing all of the bat species known to visit or 
            pollinate a particular plant species/genus/family?</strong> Select "Taxon" for "Group Interactions by" 
            and then "Plant" for “Group Taxa by” in the field below. You can narrow the search by selecting
            family, genus, or species in the menu to the right. Next, select only “Flower” in the filter menu for the 
            Tags column on the table. This will provide information on the bats that visited 
            the flower as well as those that have been confirmed pollinating it.</li><br>
            <li><strong>Want to see all interactions for a particular bat species/genus/family on a map?</strong> 
            Search for the bat as described above, filtering as desired, and then click “Show Interactions on Map”. 
            All interactions with GPS data will be displayed on the map.</li>
            <br><li><b>Follow along with the tutorial for a guided tour 
            of the search functionality.</b></li><br>
        </ul>
        <p> Note: "csv" stands for comma separated values. The interaction 
        data in the table can be downloaded in this format, as a plain-text file containing tabular 
        data, and can be imported into spreadsheet programs like Excel, Numbers, and Google Sheets.</p>
    `.replace(/\n\s+/g, '');
}
/* ========================== UTILITY =============================================================================== */
function newSelEl(opts, c, i, field) {                                          //console.log('newSelEl for [%s]. args = %O', field, arguments);
    const elem = _u.buildSelectElem(opts, { class: c, id: i });
    $(elem).data('field', field);
    return elem;
}
export function enableTableButtons() {                                          //console.log('enableTableButtons. enabled elems = %s', app.enabledSelectors);
    $('.tbl-tools button, .tbl-tools input, #focus-opts, ' + app.enabledSelectors)
        .attr('disabled', false).css('cursor', 'pointer');
    $('button[name="show-hide-col"]').css('cursor', 'not-allowed');
    $('.tbl-tools, ' + app.enabledSelectors).fadeTo('slow', 1);
    enableListReset();
    db_filters.enableClearFiltersButton();
}
export function disableTableButtons() {
    $('.tbl-tools, .map-dsbl').fadeTo('slow', .3); 
    $(`.tbl-tools button, .tbl-tools input, .map-dsbl`)
        .attr('disabled', 'disabled').css('cursor', 'default');
}
export function fadeTable() {  
    $('#borderLayout_eRootPanel, #tool-bar').fadeTo(100, .3);
}
export function showPopUpMsg(msg) {                                             //console.log("showPopUpMsg. msg = ", msg)
    const popUpMsg = msg || 'Loading...';
    $('#db-popup').text(popUpMsg);
    $('#db-popup').addClass('loading'); //used in testing
    $('#db-popup, #db-overlay').show();
    fadeTable();
}
/** Called seperately so @emptySearchOpts is called once. */
// export function clearPastHtmlOptions(tableBuilder) {    
//     $('#opts-col2').fadeTo(100, 0);
//     $('#opts-col1').fadeTo(100, 0, emptySearchOpts);
    
//     function emptySearchOpts() {                                             //console.log("emptying search options");
//         $('#opts-col2').empty();
//         // $('#sort-opts').empty();
//         $('#opts-col1, #opts-col2').fadeTo(0, 1);
//         updateUiForTableView();
//         tableBuilder();
//     }
// } /* End clearPastHtmlOptions */
// export function clearCol2() {
    // $('#opts-col2').empty();
// }