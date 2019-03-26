/**
 * Handles UI related to the database search page.
 *
 * Exports:
 *     addDomEventListeners
 *     resetToggleTreeBttn
 *     setUpFutureDevInfoBttn
 *     updateUiForTableView
 *     updateUiForMapView
 */
import * as _u from '../util.js';
import exportCsvData from './csv-data.js';
import { accessTableState as tState } from '../db-page.js';
import { buildTreeSearchHtml } from './db-filters.js';
import { showInts } from '../db-map/db-map.js';


adaptUiToScreenSize();

/* ============================= DATABASE SEARCH PAGE INIT ========================================================== */
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
export function addDomEventListeners() {
    $('button[name="xpand-all"]').click(toggleExpandTree);
    $('button[name="xpand-1"]').click(expandTreeByOne);
    $('button[name="collapse-1"]').click(collapseTreeByOne);
    $('#shw-map').click(showTableRecordsOnMap);
}
export function setUpFutureDevInfoBttn() {
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
/** Shows a loading popup message for the inital data-download wait. */
export function showLoadingDataPopUp() {
    showPopUpMsg(`Downloading and caching all interaction records. Please allow 
        for a ~45 second download.`);   
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
    const tblApi = tState().get('api');
    const expanded = $('#xpand-all').data('xpanded');
    $('#xpand-all').data("xpanded", !expanded);
    return expanded ? collapseTree(tblApi) : expandTree(tblApi);
}
function expandTree(tblApi) {
    tblApi.expandAll();    
    $('#xpand-all').html("Collapse All");
}
function collapseTree(tblApi) {
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
    const tblApi = tState().get('api');
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
/* ---------------------------- TAXON VIEW ---------------------------------- */
/**
 * If the taxon search comboboxes aren't displayed, build them @buildTaxonRealmHtml.
 * If no realm is selected, the default realm value is set. The realm-tree 
 * is built @startTxnTableBuildChain and all present taxon-levels are stored @storeLevelData. 
 * Continues table build @getInteractionsAndFillTable.  
 */
export function initTaxonSearchUi(data) {                                       //console.log("initTaxonSearchUi. data = %O", data);
    if (!$("#sel-realm").length) { buildTaxonRealmHtml(data.realm); }  
    setTaxonRealm();  
}
/** Restores stored realm from previous session or sets the default 'Plants'. */
function setTaxonRealm() {
    const storedRealm = _u.getDataFromStorage('curRealm');                      //console.log("storedRealm = [%s] taxonRealm = [%s]", storedRealm, _u.getSelVal('Taxon Realm'))
    if (!_u.getSelVal('Taxon Realm')) { 
        const realmVal = storedRealm ? storedRealm : "3";  
        _u.setSelVal('Taxon Realm', realmVal, 'silent');
    }
}
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
export function loadTaxonComboboxes(tblState) {
    const lvlOptsObj = buildTaxonSelectOpts(tblState);
    const levels = Object.keys(lvlOptsObj);
    if (levels.indexOf(tblState.realmLvl) !== -1) { levels.shift(); } //Removes realm level
    loadLevelSelects(lvlOptsObj, levels, tblState);
}
/**
 * Builds select options for each level with taxon data in the current realm.
 * If there is no data after filtering at a level, a 'none' option obj is built
 * and will be selected.
 */
function buildTaxonSelectOpts(tblState) {                                       //console.log("buildTaxonSelectOpts rcrds = %O", rcrdsByLvl);
    const optsObj = {};
    const rcrdsByLvl = tblState.taxaByLvl;       
    const curRealmLvls = tblState.allRealmLvls.slice(1);  //Skips realm lvl
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
function loadLevelSelects(levelOptsObj, levels, tblState) {                     //console.log("loadLevelSelectElems. lvlObj = %O", levelOptsObj)
    const elems = buildTaxonSelects(levelOptsObj, levels);
    clearCol2();        
    $('#opts-col2').append(elems);
    _u.initComboboxes(tblState.allRealmLvls.slice(1));
    setSelectedTaxonVals(tblState.selectedOpts, tblState);
    
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
function setSelectedTaxonVals(selected, tblState) {                             //console.log("selected in setSelectedTaxonVals = %O", selected);
    if (!selected || !Object.keys(selected).length) {return;}
    tblState.allRealmLvls.forEach(function(lvl) {                               
        if (!selected[lvl]) { return; }                                         //console.log("selecting [%s] = ", lvl, selected[lvl])
        _u.setSelVal(lvl, selected[lvl], 'silent');
    });
}
/* ---------------------------- LOCATION VIEW ------------------------------- */
/**
 * Builds location view html and initializes table load. Either builds the table 
 * data-tree view, by default, or loads the data-map view, if previously 
 * selected. 
 */ 
export function initLocSearchUi(locData, view) {
    if (!$("#grid-view").length) { buildLocViewHtml(); }  
    setLocView(view);  
} 
function setLocView(view) {
    const storedRealm = view || _u.getDataFromStorage('curRealm');              //console.log("setLocView. storedRealm = ", storedRealm)
    const locRealm = storedRealm || 'tree';
    _u.setSelVal('Loc View', locRealm, 'silent');
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
/**
 * Builds the Location search comboboxes @loadLocComboboxes. Transform tree
 * data into table rows and load the table @transformLocDataAndLoadTable.
 */
export function loadSearchLocHtml(tblState) {
    clearCol2();       
    loadSearchByNameElem();
    loadLocComboboxes(tblState);
}
function loadSearchByNameElem() {  
    const searchTreeElem = buildTreeSearchHtml('Location');
    $(searchTreeElem).css({ 'width': '273px' });
    $('#opts-col2').append(searchTreeElem);
    $('input[name="selLocation"]').css({ 'width': '205px' });
}
/**
 * Create and append the location search comboboxes, Region and Country, and
 * set any previously 'selected' values.
 */
function loadLocComboboxes(tblState) {  
    const opts = buildLocSelectOpts(tblState); 
    const selElems = buildLocSelects(opts);
    $('#opts-col2').append(selElems);
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
        const lbl = _u.buildElem('label', { class: "lbl-sel-opts flex-row" });
        const span = _u.buildElem('span', { text: selName + ': ', class: "opts-span" });
        const sel = newSelEl(opts, 'opts-box', 'sel' + selName, selName);
        $(sel).css('width', '202px');
        $(lbl).css('width', '282px').append([span, sel]);
        return lbl;
    }
}
function setSelectedLocVals(selected) {                                         //console.log("selected in setSelectedLocVals = %O", selected);
    Object.keys(selected).forEach(locType => {
        _u.setSelVal(locType, selected[locType], 'silent');
    });
}
/* ---------------------------- SOURCE VIEW --------------------------------- */
/**
 * If the source-realm combobox isn't displayed, build it @buildSrcRealmHtml.
 * If no realm selected, set the default realm value. Start table build @buildSrcTree.
 */
export function initSrcSearchUi(srcData) {                                      //console.log("=========init source search ui");
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
    const storedRealm = _u.getDataFromStorage('curRealm');                      //console.log("storedRealm = ", storedRealm)
    const srcRealm = storedRealm || 'pubs';  
    tState().set({'curRealm': srcRealm});
    if (!_u.getSelVal('Source Type')) { _u.setSelVal('Source Type', srcRealm, 'silent'); } 
}
/**
 * Will build the select elems for the source search options. Clears previous 
 * table. Calls @transformSrcDataAndLoadTable to transform tree data into table 
 * format and load the data table.
 * NOTE: This is the entry point for source table rebuilds as filters alter data
 * contained in the data tree.
 */
export function buildSrcSearchUiAndTable(realm) {                               //console.log("buildSrcSearchUiAndTable called. realm = [%s]", realm);
    const buildUi = { 'auths': loadAuthSearchHtml, 'pubs': loadPubSearchHtml, 
        'publ':loadPublSearchHtml };
    buildUi[realm](); 
} 
/** Builds a text input for searching author names. */
function loadAuthSearchHtml() {
    const searchTreeElem = buildTreeSearchHtml('Author');
    clearCol2();        
    $('#opts-col2').append(searchTreeElem);
}
function loadPubSearchHtml() {
    const pubTypeElem = buildPubTypeSelect();
    const searchTreeElem = buildTreeSearchHtml('Publication');
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
        return opts.sort(_u.alphaOptionObjs);  
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
    const searchTreeElem = buildTreeSearchHtml('Publisher');
    clearCol2();        
    $('#opts-col2').append(searchTreeElem);
}
/* ====================== SWITCH BETWEEN MAP AND TABLE UI =========================================================== */
export function updateUiForMapView() {
    updateBttnToReturnRcrdsToTable();
    disableTableButtons();
    showPopUpMsg();
    $('#tool-bar').fadeTo(100, 1);
    $('#search-tbl').hide();
    $('#map').show(); 
}
export function updateUiForTableView() {
    $('#search-tbl').fadeTo('100', 1);
    $('#map, #filter-in-tbl-msg').hide();
    enableTableButtons();
    _u.enableComboboxes($('#opts-col1 select, #opts-col2 select'));
    $('#shw-map').attr('disabled', false).css({'opacity': 1, 'cursor': 'pointer'});  
    updateBttnToShowRcrdsOnMap();
}
export function updateUiForMappingInts() {
    updateUiForMapView();
    _u.enableComboboxes($('#opts-col1 select, #opts-col2 select'), false);
}
function showTableRecordsOnMap() {                                              console.log('-----------showTableRecordsOnMap');
    const tblState = tState().get(null, ['curFocus', 'rcrdsById']);
    const locRcrds = tblState.curFocus !== 'locs' ? 
        _u.getDataFromStorage('location') : tblState.rcrdsById;  
    $('#search-tbl').fadeTo('100', 0.3, () => {
        updateUiForMappingInts();
        showInts(tblState.curFocus, tblState.rcrdsById, locRcrds);
    });
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
/* ========================== UTILITY =============================================================================== */
function newSelEl(opts, c, i, field) {                                          //console.log('newSelEl for [%s]. args = %O', field, arguments);
    const elem = _u.buildSelectElem(opts, { class: c, id: i });
    $(elem).data('field', field);
    return elem;
}
export function authDependentInit(userRole) {
    if (userRole === "visitor") {
        $('button[name="csv"]').prop('disabled', true);
        $('button[name="csv"]').prop('title', "Register to download.");
        $('button[name="csv"]').css({'opacity': '.8', 'cursor': 'not-allowed' });
    } else { $('button[name="csv"]').click(exportCsvData); }
}
export function enableTableButtons() {  
    $('.tbl-tools button, .tbl-tools input, button[name="futureDevBttn"]')
        .attr('disabled', false).css('cursor', 'pointer');
    $('button[name="show-hide-col"]').css('cursor', 'not-allowed');
    $('.tbl-tools').fadeTo(100, 1);
    $('button[name="futureDevBttn"]').fadeTo(100, .7);    
    authDependentInit(); 
}
export function disableTableButtons() {
    $(`.tbl-tools button, .tbl-tools input, button[name="futureDevBttn"]`)
        .attr('disabled', 'disabled').css('cursor', 'default');
    $('.tbl-tools, button[name="futureDevBttn"]').fadeTo(100, .3); 
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
export function clearPastHtmlOptions(tableBuilder) {    
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
export function clearCol2() {
    $('#opts-col2').empty();
}