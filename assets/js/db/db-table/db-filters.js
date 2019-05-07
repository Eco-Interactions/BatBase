/**
 * Handles custom filtering of the data displayed in the table and reltaed UI.
 * 
 * Exports:                     Imported by:
 *     addDomEventListeners
 *     buildTreeSearchHtml
 *     resetFilterStatusBar
 *     resetTableStateParams
 *     showTodaysUpdates                db_forms
 *     toggleFilterPanel                db_ui
 *     toggleTimeUpdatedFilter          db_page
 *     updateFilterStatusMsg
 *     updateLocSearch                  util
 *     updatePubSearch                  util
 *     updateTaxonSearch                util
 */
import * as _u from '../util.js';
import { accessTableState as tState, selectSearchFocus, rebuildLocTable, rebuildTaxonTable } from '../db-page.js';
import * as db_ui from './db-ui.js';
/** 
 * Filter Params
 *     cal - Stores the flatpickr calendar instance. 
 *     fltrdRows - rowdata after filters
 *     focusFltrs - Stores focus specific filter strings (eg: name search, taxonomic level, country, etc)
 *     timeFltr - Stores the specified datetime for the time-updated filter.
 */
let fPs = {
    focusFltrs: []
};
/**
 * Updated with each new entry into this module with properties needed for that 
 * method chain.
 */
let tblState;

export function addDomEventListeners() {  
    $('#filter').click(toggleFilterPanel);                                      
    $('#shw-chngd').change(toggleTimeUpdatedFilter);
}
export function resetTableStateParams() {
    const props = ['fltrdRows'];
    props.forEach(function(prop){ delete fPs[prop]; });
    fPs.focusFltrs = [];
}
/* ====================== FILTER PANEL ============================================================================== */
export function toggleFilterPanel() {  
    if ($('#filter-opts').hasClass('closed')) { buildAndShowFilterPanel(); 
    } else { hideFilterPanel(); }
}
function buildAndShowFilterPanel() {                                            //console.log('buildAndShowFilterPanel')
    $('#filter-opts').removeClass('closed');  
    $('#db-opts-col2').addClass('shw-col-borders hide-fltr-bttm-border');
    _u.initCombobox('Saved Filters');
    window.setTimeout(function() { $('#filter-opts').css('overflow-y', 'visible')}, 500);
}
function hideFilterPanel() {                                                    //console.log('hideFilterPanel')
    $('#filter-opts').css('overflow-y', 'hidden');
    $('#db-opts-col2').removeClass('shw-col-borders hide-fltr-bttm-border');
    $('#filter-opts').addClass('closed');
}
/* ====================== UPDATE FILTER STATUS BAR ================================================================== */
/**
 * Either displays all filters currently applied, or applies the previous filter 
 * message persisted through table update into map view.
 */
export function updateFilterStatusMsg() {                                       //console.log("updateFilterStatusMsg called.")
    tblState = {api: tState().get('api')};
    if (!tblState.api) { return; }
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
    if ($('#xtrnl-filter-status').text() === 'Filtering on: ') {
        return filters.join(', ') + '.';
    } else {
        const tempStatusTxt = $('#xtrnl-filter-status').text();
        if (tempStatusTxt.charAt(tempStatusTxt.length-2) !== ',') {  //So as not to add a second comma.
            setExternalFilterStatus(tempStatusTxt + ', ');
        }
        return filters.join(', ') + '.'; 
    }
}
/** Returns an obj with the ag-grid filter models. */
function getAllFilterModels() {  
    const filters = Object.keys(tblState.api.filterManager.allFilters);
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
            tblState.api.getFilterApi(colName).getModel()
    }
}
function setTableFilterStatus(status) {                                         //console.log("setTableFilterStatus. status = ", status)
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
/* ====================== TIME-UPDATED FILTER ======================================================================= */
/**
 * When the interaction form is exited, the passed focus is selected and the 
 * table is refreshed with the 'interactions updates since' filter set to 'today'.
 */
export function showTodaysUpdates(focus) {                                      //console.log("showingUpdated from today")
    if (focus) { _u.setSelVal('Focus', focus); 
    } else { selectSearchFocus(); }
    window.setTimeout(showUpdatesAfterTableLoad, 200);
}
function showUpdatesAfterTableLoad() {
    toggleTimeUpdatedFilter(true, 'today');
}
/** The time-updated filter is enabled when the filter option is checked. */
export function toggleTimeUpdatedFilter(state, time) {                          //console.log('toggleTimeUpdatedFilter. state = %s, time? ', state, time);
    const filtering = state === 'disable' ? false : 
        state === true ? true : $('#shw-chngd')[0].checked;
    tblState = tState().get();
    updateRelatedUi(filtering);
    if (filtering) { showCal(time);
    } else { resetTimeUpdatedFilter(); }
    db_ui.resetToggleTreeBttn(false);
}
function updateRelatedUi(filtering) {
    const opac = filtering ? 1 : .3;
    $('#time-fltr, .flatpickr-input').attr({'disabled': !filtering});  
    $('#shw-chngd')[0].checked = filtering;
    $('#time-fltr, .flatpickr-input').css({'opacity': opac});
}
/** 
 * Disables the calendar, if shown, and resets table with active filters reapplied.
 */
function resetTimeUpdatedFilter() {                                             //console.log('tState = %O', tState);
    fPs.fltrdRows = null;
    if (tblState.api && tblState.rowData) { 
        tblState.api.setRowData(tblState.rowData);
        syncFiltersAndUi();
    }
}
/** 
 * Instantiates the flatpickr calendar and opens the calendar. If a custom time
 * was previously selected and stored, it is reapplied.
 */
function showCal(time) {                                                        //console.log('showFlatpickrCal. fPs = %O', fPs);
    fPs.cal = fPs.cal || initCal(); 
    if (time == 'today') { filterToChangesToday(); 
    } else if (fPs.timeFltr) { 
        reapplyPreviousTimeFilter(fPs.timeFltr)
    } else {
        fPs.cal.open();            
        fPs.cal.setDate(new Date().today(), false, 'Y-m-d');  
    }
}    
/** 
 * Instantiates the flatpickr calendar and returns the flatpickr instance.
 * Add time updated filter
 */
function initCal() {
    const confirmDatePlugin = require('../../libs/confirmDate.js'); 
    const calOpts = {
        altInput: true, maxDate: "today", enableTime: true,   
        plugins: [confirmDatePlugin({showAlways: true})],
        onReady: function() { this.amPM.textContent = "AM"; },
        onClose: filterInteractionsUpdatedSince
    }; 
    return $('#time-fltr').flatpickr(calOpts);
}
function reapplyPreviousTimeFilter(filterTime, skipSync) {
    fPs.cal.setDate(filterTime);  
    filterInteractionsUpdatedSince(null, filterTime, null, skipSync);
}
function filterToChangesToday() {  
    fPs.cal.setDate(new Date().today(), false, 'Y-m-d');  
    filterInteractionsUpdatedSince(null, new Date().today(), null)
}
/**
 * Filters all interactions in the table leaving only the records with updates
 * since the datetime specified by the user.
 * Note: Params 1-3 sent by calendar
 */
function filterInteractionsUpdatedSince(dates, dateStr, instance, skipSync) {   //console.log("filterInteractionsUpdatedSince called. arguments? ", arguments);
    const filterTime = getFilterTime();  
    tblState = tState().get();
    filterInteractionsAndUpdateState();   
    $('.flatpickr-input').val(dateStr);
    if (skipSync) { console.log('skipping sync');return; }
    syncFiltersAndUi(filterTime);

    function getFilterTime() {
        const fltrSince = dateStr || fPs.timeFltr;
        fPs.timeFltr = fltrSince;
        return new Date(fltrSince).getTime(); 
    }
    function filterInteractionsAndUpdateState() {
        const updatedRows = filterRowsByTimeUpdated();                          //console.log("updatedRows = %O", updatedRows);
        tblState.api.setRowData(updatedRows);
        fPs.fltrdRows = updatedRows;
    }
    function filterRowsByTimeUpdated() {
        const rowData = _u.snapshot(tblState.rowData);
        return rowData.filter(addAllRowsWithUpdates);        
    }
    function addAllRowsWithUpdates(rowObj) { 
        if (rowObj.interactionType) { return checkIntRowForUpdates(rowObj); }
        rowObj.children = rowObj.children ? 
            rowObj.children.filter(addAllRowsWithUpdates) : [];
        return rowObj.children.length > 0;

        function checkIntRowForUpdates(row) { 
            const rowUpdatedAt = new Date(row.updatedAt).getTime();             //console.log("row [%O}.data.updatedAt = [%s], filterTime = [%s], rowUpdatedAt > since = [%s]", row, rowUpdatedAt, filterTime, rowUpdatedAt > filterTime);
            return rowUpdatedAt > filterTime;
        }
    } /* End addAllRowsWithUpdates */
} /* End filterInteractionsUpdatedSince */ 
/**
 * When filtering by time updated, some filters will need to be reapplied.
 * (Taxa and loation filter rowdata directly, and so do not need to be reapplied.
 * Source, both auth and pub views, must be reapplied.)
 * The table filter's status message is updated. The time-updated radios are synced.
 */
function syncFiltersAndUi(filterTime) {                                         //console.log('tblState = %O', tblState);
    db_ui.resetToggleTreeBttn(false);
    syncViewFiltersAndUi(tblState.curFocus);
    updateFilterStatusMsg();  

    function syncViewFiltersAndUi(focus) {
        const map = {
            locs: db_ui.loadSearchLocHtml,
            srcs: applySrcFltrs,
            taxa: updateTaxonComboboxes
        }; 
        map[focus](tblState);
    }
}
/** Reapplys active external filters, author name or publication type. */
function applySrcFltrs(tblState) {
    const resets = { 'auths': reapplyTreeTextFltr, 'pubs': reapplyPubFltr, 
        'publ': reapplyTreeTextFltr };
    resets[tblState.curView]();
}
function reapplyTreeTextFltr() {                                            
    const entity = getTableEntityName();                                        //console.log("reapplying [%s] text filter", entity);
    if (getTreeFilterTextVal(entity) === "") { return; }
    searchTreeText(entity);
}
function getTableEntityName() {
    const names = { 'taxa': 'Taxon', 'locs': 'Location', 'auths': 'Author',
        'publ': 'Publisher', 'pubs': 'Publication' };
    const ent = tblState.curFocus === "srcs" ? tblState.curView : tblState.curFocus;
    return names[ent];
}
function reapplyPubFltr() {                                                     //console.log("reapplying pub filter");
    if (_u.getSelVal('Publication Type') === "all") { return; }
    updatePubSearch();
}
/**
 * When the time-updated filter is updated, the taxa-by-level property has to be
 * updated based on the rows displayed in the grid so that the combobox options
 * show only taxa in the filtered tree.
 */
function updateTaxonComboboxes(tblState) {
    tState().set({'taxaByLvl': seperateTaxonTreeByLvl(getAllCurRows(tblState))}); //console.log("taxaByLvl = %O", taxaByLvl)
    db_ui.loadTaxonComboboxes(tblState);
}
/** Returns an object with taxon records by level and keyed with display names. */
function seperateTaxonTreeByLvl(rowData) {                                      //console.log('rowData = %O', rowData);
    const separated = {};
    rowData.forEach(data => separate(data));
    return sortObjByLevelRank(separated);

    function separate(row) {                                                    //console.log('taxon = %O', taxon)
        if (!separated[row.taxonLvl]) { separated[row.taxonLvl] = {}; }
        separated[row.taxonLvl][row.displayName] = row.id;
        
        if (row.children) { 
            row.children.forEach(child => separate(child)); 
        }
    }
    function sortObjByLevelRank(taxonObj) {
        const levels = Object.keys(_u.getDataFromStorage('levelNames'));        //console.log("levels = %O", levels)
        const obj = {};
        levels.forEach(lvl => { 
            if (lvl in taxonObj) { obj[lvl] = taxonObj[lvl]; }
        });
        return obj;
    }
} /* End seperateTaxonTreeByLvl */
/*================== Search Panel Filter Functions ===================================================================*/
/** Returns a text input with submit button that will filter tree by text string. */
export function buildTreeSearchHtml(entity) {
    const func = getTreeSearchHandler(entity);
    const lbl = _u.buildElem('label', { class: 'sel-cntnr flex-row' });
    const span = _u.buildElem('span', { text: 'Name:' });
    const input = _u.buildElem('input', { 
        name: 'sel'+entity, type: 'text', placeholder: entity+' Name (Press Enter to Filter)'  });
    const bttn = _u.buildElem('button', { text: 'Search', 
        name: 'sel'+entity+'_submit', class: 'ag-fresh tbl-bttn' });
    if (entity == 'Location') { $(input).addClass('locTxtInput');}
    $(lbl).addClass('txtLbl');
    $(input).onEnter(func);
    $(lbl).append([span, input]);
    return lbl;
}
function getTreeSearchHandler(entity) { 
    return entity === 'Publication' ? 
        updatePubSearch : searchTreeText.bind(null, entity);
}
/**
 * When the search-tree text-input is submitted, by either pressing 'enter' or
 * by clicking on the 'search' button, the tree is rebuilt with only rows that  
 * contain the case insensitive substring.
 */
function searchTreeText(entity) {                                               //console.log("----- Search Tree Text");
    tblState = tState().get(null, ['api', 'curFocus', 'rowData']);
    const text = getTreeFilterTextVal(entity);
    const allRows = getAllCurRows(); 
    const newRows = text === "" ? allRows : getTreeRowsWithText(allRows, text);  
    tblState.api.setRowData(newRows); 
    fPs.focusFltrs = text === "" ? [] : fPs.focusFltrs.length ? 
        [...fPs.focusFltrs, `"${text}"`] : [`"${text}"`];  
    updateFilterStatusMsg();
    db_ui.resetToggleTreeBttn(false);
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
    if (tblState.curFocus !== 'locs') { return; }
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
export function updateTaxonSearch(val) {                                        //console.log("updateTaxonSearch val = ", val)
    if (!val) { return; }
    const taxonRcrds = tState().get('rcrdsById');
    const rcrd = _u.getDetachedRcrd(val, taxonRcrds);  
    tState().set({'selectedOpts': getRelatedTaxaToSelect(rcrd, taxonRcrds)});   //console.log("selectedVals = %O", tParams.selectedVals);
    updateFilterStatus();
    rebuildTaxonTable(rcrd, 'filtering');
    if ($('#shw-chngd')[0].checked) { filterInteractionsUpdatedSince(); }

    function updateFilterStatus() {
        const curLevel = rcrd.level.displayName;
        const taxonName = rcrd.displayName;
        fPs.focusFltrs = [curLevel + " " + taxonName];
        updateFilterStatusMsg();
    }
} /* End updateTaxonSearch */
/** The selected taxon's ancestors will be selected in their levels combobox. */
function getRelatedTaxaToSelect(selTaxonObj, taxonRcrds) {                      //console.log("getRelatedTaxaToSelect called for %O", selTaxonObj);
    const topTaxaIds = [1, 2, 3, 4]; //animalia, chiroptera, plantae, arthropoda 
    const selected = {};                                                        //console.log("selected = %O", selected)
    selectAncestorTaxa(selTaxonObj);
    return selected;
    /** Adds parent taxa to selected object, until the realm parent. */
    function selectAncestorTaxa(taxon) {                                        //console.log("selectedTaxonid = %s, obj = %O", taxon.id, taxon)
        if ( topTaxaIds.indexOf(taxon.id) === -1 ) {
            selected[taxon.level.displayName] = taxon.id;                       //console.log("setting lvl = ", taxon.level)
            selectAncestorTaxa(_u.getDetachedRcrd(taxon.parent, taxonRcrds))
        }
    }
} /* End getRelatedTaxaToSelect */
/*------------------ Location Filter Updates -----------------------------*/
export function updateLocSearch(val) { 
    if (!val) { return; }
    getComboboxValuesAndRebuildLocTree(val, getLocType(this.$input[0].id));
    if ($('#shw-chngd')[0].checked) { reapplyPreviousTimeFilter(fPs.timeFltr, 'skip'); }
} 
function getLocType(selId) {
    const selTypes = { selCountry: 'Country', selRegion: 'Region' };
    return selTypes[selId];
}
function getComboboxValuesAndRebuildLocTree(val, locType) {
    const selVal = parseInt(val);  
    tState().set({'selectedOpts': getSelectedVals(selVal, locType)});
    rebuildLocTable([selVal]);                                                  //console.log('selected [%s] = %O', locType, _u.snapshot(tState().get('selectedOpts'));
    updateFilter(locType);
}
function getSelectedVals(val, type) {                                           //console.log("getSelectedVals. val = %s, selType = ", val, type)
    const selected = {};
    const locRcrds = tState().get('rcrdsById');
    if (type === 'Country') { selectRegion(val); }
    if (val !== 'none' && val !== 'all') { selected[type] = val; }
    return selected;  

    function selectRegion(val) {
        const loc = _u.getDetachedRcrd(val, locRcrds);
        selected['Region'] = loc.region.id;
    }
} /* End getSelectedVals */
function updateFilter(locType) {
    fPs.focusFltrs = [locType];
    updateFilterStatusMsg();
}
/*------------------ Source Filter Updates -------------------------------*/
/**
 * When the publication type dropdown is changed or the table is filtered by 
 * publication text, the table is rebuilt with the filtered data.
 * NOTE: All Source realms include text search.
 */
export function updatePubSearch() {                                             //console.log('updatePubSearch.')
    tblState = tState().get(null, ['api', 'rowData']);  
    const typeId = _u.getSelVal('Publication Type'); 
    const txt = getTreeFilterTextVal('Publication');
    const newRows = getFilteredPubRows();
    fPs.focusFltrs = getPubFilters();
    tblState.api.setRowData(newRows);
    updateFilterStatusMsg();
    db_ui.resetToggleTreeBttn(false);

    function getFilteredPubRows() {                             
        if (typeId === 'all') { return getTreeRowsWithText(getAllCurRows(), txt); }
        if (txt === '') { return getPubTypeRows(typeId); }
        const pubTypes = _u.getDataFromStorage('publicationType'); 
        const pubIds = pubTypes[typeId].publications;        
        return getAllCurRows().filter(row => 
            pubIds.indexOf(row.pubId) !== -1 && 
            row.name.toLowerCase().indexOf(txt) !== -1);
    }
    /** Returns the rows for publications with their id in the selected type's array */
    function getPubTypeRows() { 
        const pubTypes = _u.getDataFromStorage('publicationType'); 
        const pubIds = pubTypes[typeId].publications;      
        return getAllCurRows().filter(row => pubIds.indexOf(row.pubId) !== -1);
    }
    function getPubFilters() { 
        const typeVal = $(`#selPubType option[value="${typeId}"]`).text();
        const truncTxt = txt ? 
            (txt.length > 50 ? txt.substring(0, 50)+'...' : txt) : null; 
        return typeId === 'all' && !txt ? [] :
            (typeId === 'all' ? [`"${truncTxt}"`] : 
            (!txt ? [`${typeVal}s`] : [`"${truncTxt}"`, `${typeVal}s`]));
    }
} /* End updatePubSearch */
/* ========================== FILTER UTILITY METHODS ================================================================ */
/** If table is filtered by an external filter, the rows are stored in fltrdRows. */
function getAllCurRows() { 
    return fPs.fltrdRows || tblState.rowData;
} 