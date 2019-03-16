/**
 * Handles custom filtering of the data displayed in the table and reltaed UI.
 * 
 * Exports:
 *     addDomEventListeners
 *     buildTreeSearchHtml
 *     resetFilterStatusBar
 *     toggleTimeUpdatedFilter
 *     updateFilterStatusMsg
 *     updateLocSearch
 *     updatePubSearchByType
 *     updateTaxonSearch
 *              
 */
import * as _u from '../util.js';
//Rfactor away from calling 'get' each time api is neededx
import { accessTableState as tState, resetToggleTreeBttn } from '../db-page.js';



/** 
 * Filter Params
 *     cal - Stores the flatpickr calendar instance. 
 *     focusFltrs - Stores focus specific filter strings (ie, name search, taxonomic level, country, etc)
 *     tblApi - API for ag-grid table
 *     timeFltr - Stores the specified datetime for the time-updated filter.
 *
 *      fltrdRows - USED IN DB-PAGE TOO
 *      rowData - USED IN DB-PAGE TOO
 *      curFocus - USED ALL OVER
 *      curRealm - USED ALL OVER
 *      selectedVals - - USED IN DB-PAGE TOO
 *      selectedOpts- USED IN DB-PAGE TOO
 *      
 */
let fPs = {};
let tblState; //Updated with each new entry into this module

export function addDomEventListeners() {
    $('#shw-chngd').change(toggleTimeUpdatedFilter);
    $('#fltr-tdy').change(filterInteractionsByTimeUpdated);
    $('#fltr-cstm').change(filterInteractionsByTimeUpdated);
}


/**
 * Either displays all filters currently applied, or applies the previous filter 
 * message persisted through table update into map view.
 */
export function updateFilterStatusMsg() {                                              //console.log("updateFilterStatusMsg called.")
    if (tState().get('api') === undefined) { return; }
    getFiltersAndUpdateStatus();
}


/*================== Table Filter Functions ===============================*/
// function onFilterChange() {
//     fPs.tblApi.onFilterChanged();
// }

/** Returns an obj with all filter models. */
function getAllFilterModels() {  
    const filters = Object.keys(tState.get('api').filterManager.allFilters);
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
            fPs.tblApi.getFilterApi(colName).getModel()
    }
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
        if (fPs.focusFltrs && fPs.focusFltrs.length > 0) { 
            filters.push(...fPs.focusFltrs);  
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
export function resetFilterStatusBar() {  
    $('#xtrnl-filter-status').text('Filtering on: ');
    $('#tbl-filter-status').text('No Active Filters.');
    fPs.focusFltrs = [];
}
/*-------------------- Filter By Time Updated ----------------------------*/
/**
 * The time-updated filter is enabled when the filter option in opts-col3 is 
 * checked. When active, the radio options, 'Today' and 'Custom', are enabled. 
 * Note: 'Today' is the default selection. 
 */
export function toggleTimeUpdatedFilter(state) {                                       console.log('toggleTimeUpdatedFilter. state = ', state);
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
/** 
 * Disables the calendar, if shown, and resets table with active filters reapplied.
 * REFACT
 */
function resetTimeUpdatedFilter() {  //console.log('tState = %O', tState);
    const curTableState = tState().get();
    tState().set({
        fltrdRows: null,
        fltrSince: null
    });
    if (curTableState.api && curTableState.rowData) { 
        curTableState.api.setRowData(curTableState.rowData);
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
    fPs.cal = fPs.cal || initCal(elem); 
    if (fPs.timeFltr) {
        fPs.cal.setDate(fPs.timeFltr);
        filterInteractionsUpdatedSince([], fPs.timeFltr, null);
    } else {
        fPs.cal.open();                                                             
        $('.today').focus();                                                   
    }
}    
/** Instantiates the flatpickr calendar and returns the flatpickr instance. */
function initCal(elem) {
    const confirmDatePlugin = require('../../libs/confirmDate.js'); 
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
    fPs.cal = fPs.cal || initCal();
    fPs.cal.setDate(new Date().today());
    filterInteractionsUpdatedSince([], new Date().today(), null);
}
/**
 * Filters all interactions in the table leaving only the records with updates
 * since the datetime specified by the user.
 */
function filterInteractionsUpdatedSince(dates, dateStr, instance) {             //console.log("\nfilterInteractionsUpdatedSince called.");
    var rowData = _u.snapshot(fPs.rowData);
    var fltrSince = dateStr || fPs.timeFltr;
    var sinceTime = new Date(fltrSince).getTime();                          
    var updatedRows = rowData.filter(addAllRowsWithUpdates);                    //console.log("updatedRows = %O", updatedRows);
    fPs.timeFltr = fltrSince;
    fPs.tblApi.setRowData(updatedRows);
    fPs.fltrdRows = updatedRows;
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
    tblState = tState().get(); //REFACT:: MOVE UP IN METHOD CHAIN TO FIRST ENTRY POINT
    if (tblState.curFocus === "srcs") { applySrcFltrs(); }
    if (tblState.curFocus === "locs") { loadSearchLocHtml(); }    
    updateFilterStatusMsg();  
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
function applySrcFltrs(focus, realm) {
    var resets = { 'auths': reapplyTreeTextFltr, 'pubs': reapplyPubFltr, 
        'publ': reapplyTreeTextFltr };
    // var realm = tParams.curRealm;  
    resets[realm]();
}
function reapplyTreeTextFltr() {                                            
    const entity = getTableEntityName();                                         //console.log("reapplying [%s] text filter", entity);
    if (getTreeFilterTextVal(entity) === "") { return; }
    searchTreeText();
}
function getTableEntityName() {
    const names = { 'taxa': 'Taxon', 'locs': 'Location', 'auths': 'Author',
        'publ': 'Publisher', 'pubs': 'Publication' };
    const ent = tblState.curFocus === "srcs" ? tblState.curRealm : tblState.curFocus;
    return names[ent];
}
function reapplyPubFltr() {                                                     //console.log("reapplying pub filter");
    if (getSelVal('Publication Type') === "all") { return; }
    updatePubSearch();
}
/*================== Search Panel Filter Functions ===========================*/
/** Returns a text input with submit button that will filter tree by text string. */
export function buildTreeSearchHtml(entity, hndlr) {
    const func = hndlr || searchTreeText.bind(null, entity);
    const lbl = _u.buildElem('label', { class: 'lbl-sel-opts flex-row tbl-tools' });
    const input = _u.buildElem('input', { 
        name: 'sel'+entity, type: 'text', placeholder: entity+' Name'  });
    const bttn = _u.buildElem('button', { text: 'Search', 
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
    const text = getTreeFilterTextVal(entity);
    const allRows = getAllCurRows(); 
    const newRows = text === "" ? allRows : getTreeRowsWithText(allRows, text);  
    fPs.tblApi.setRowData(newRows); 
    tParams.focusFltrs = text === "" ? [] : [...tParams.focusFltrs, `"${text}"`];
    updateFilterStatusMsg();
    resetToggleTreeBttn(false);
} 
function getTreeFilterTextVal(entity) {                                         //console.log('getTreeFilterTextVal entity = ', entity);
    return $('input[name="sel'+entity+'"]').val().trim().toLowerCase();
}
function getTreeRowsWithText(rows, text) {                                      //console.log('getTreeRowsWithText. rows = %O', rows)
    return rows.filter(row => {  
        const isRow = row.name.toLowerCase().indexOf(text) !== -1; 
        return isRow || (hasSubLocs(row) ? childRowsPassFilter(row, text) : false); 
    });
}
function hasSubLocs(row) {
    return row.children && row.children.length > 0 ? 
        !row.children[0].hasOwnProperty('interactionType') : false;
}
function childRowsPassFilter(row, text) {
    const rows = getTreeRowsWithText(row.children, text); 
    row.children = rows;
    return rows.length > 0;
}
/*------------------ Taxon Filter Updates ---------------------------------*/
/**
 * When a taxon is selected from one of the taxon-level comboboxes, the table 
 * is updated with the taxon as the top of the new tree. The remaining level 
 * comboboxes are populated with realted taxa, with ancestors selected.
 */
export function updateTaxonSearch(val) {                                               //console.log("updateTaxonSearch val = ", val)
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
            updateFilterStatusMsg();
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
export function updateLocSearch(val) { 
    if (!val) { return; }
    const selVal = parseInt(val);  
    const locType = getLocType(this.$input[0].id);
    tParams.selectedOpts = getSelectedVals(selVal, locType);
    rebuildLocTree([selVal]);                                                   //console.log('selected [%s] = %O', locType, _u.snapshot(tParams.selectedOpts));
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
        updateFilterStatusMsg();
    }
} /* End updateLocSearch */
/*------------------ Source Filter Updates -------------------------------*/
export function updatePubSearchByTxt() {
    const text = getTreeFilterTextVal('Publication');
    updatePubSearch(null, text);
}
export function updatePubSearchByType() {                                           //console.log('updatePubSearchByType. val = ', val)
    if (!val) { return; }
    updatePubSearch(val, null);
}
/**
 * When the publication type dropdown is changed or the table is filtered by 
 * publication text, the table is rebuilt with the filtered data.
 */
function updatePubSearch(typeVal, text) {                                       console.log('updatePubSearch. typeVal = ', typeVal)
    const typeId = typeVal || getSelVal('Publication Type');
    const txt = text || getTreeFilterTextVal('Publication');
    const newRows = getFilteredPubRows();
    tParams.focusFltrs = getPubFilters();
    fPs.tblApi.setRowData(newRows);
    updateFilterStatusMsg();
    resetToggleTreeBttn(false);

    function getFilteredPubRows() {                             
        if (typeId === 'all') { return getTreeRowsWithText(getAllCurRows(), txt); }
        if (txt === '') { return getPubTypeRows(typeId); }
        const pubTypes = _u.getDataFromStorage('publicationType'); 
        const pubIds = pubTypes[typeId].publications;         
        return getAllCurRows().filter(row => 
            pubIds.indexOf(row.pubId) !== -1 && 
            row.name.toLowerCase().indexOf(text) !== -1);
    }
    /** Returns the rows for publications with their id in the selected type's array */
    function getPubTypeRows() { 
        const pubTypes = _u.getDataFromStorage('publicationType'); 
        const pubIds = pubTypes[typeId].publications;      
        return getAllCurRows().filter(row => pubIds.indexOf(row.pubId) !== -1);
    }
    function getPubFilters() { 
        const typeVal = $(`#selPubType option[value="${typeId}"]`).text();
        const truncTxt = txt ? txt.substring(0, 50)+'...' : null; 
        return typeId === 'all' && !txt ? [] :
            (typeId === 'all' ? [`"${truncTxt}"`] : 
            (!txt ? [`${typeVal}s`] : [`"${truncTxt}"`, `${typeVal}s`]));
    }
} /* End updatePubSearch */