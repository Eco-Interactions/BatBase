/**
 * Handles custom filtering of the data displayed in the table and related UI.
 * 
 * Exports:                     Imported by:                (Added all post initial refactor)
 *     buildTreeSearchHtml              db-ui
 *     enableClearFiltersButton         db-ui
 *     getFilterState                   save-fltrs
 *     resetTblFilters                  db-page, save-ints
 *     resetTableStateParams            db-page, db-ui, save-ints
 *     selTimeFilter                    save-fltrs
 *     showTodaysUpdates                db_forms
 *     syncViewFiltersAndUi             save-ints
 *     toggleTimeFilter          db_page
 *     updateFilterStatusMsg            db-page, init-tbl, save-fltrs
 *     updateLocSearch                  util
 *     updatePubSearch                  util
 *     updateTaxonSearch                util
 */
import * as _u from '../util.js';
import { accessTableState as tState, selectSearchFocus, rebuildLocTable, rebuildTxnTable } from '../db-page.js';
import * as db_ui from '../db-ui.js';
import { resetStoredFiltersUi, savedFilterSetActive } from './save-fltrs.js';
import { savedIntListLoaded } from './save-ints.js';

/** 
 * Filter Params
 *     cal - Stores the flatpickr calendar instance. 
 *     fltrdRows - rowdata after filters
 *     pnlFltrs - Object stores panel filter values 
 *         combo - obj with combo-label (k): obj with text and value (k) with their respective values
 *         name - name filter string
 *         time - Obj with the datetime and filter type, time published or time added/updated 
 */
let fPs = {
    pnlFltrs: {}
};
/**
 * Updated with each new entry into this module with properties needed for that 
 * method chain.
 */
let tblState = {};

export function resetTableStateParams() {
    const props = ['fltrdRows'];
    props.forEach(function(prop){ delete fPs[prop]; });
    fPs.pnlFltrs = {};
}
export function getFilterState() {
    return {
        panel: fPs.pnlFltrs,
        table: getTableFilterModels()
    };
}
export function enableClearFiltersButton() {
    if (!filtersActive()) { 
        $('button[name="reset-tbl"]')
            .attr('disabled', true).css({'opacity': .5, cursor: 'inherit'}); 
    } else {  
        $('button[name="reset-tbl"]')
            .attr('disabled', false).css({'opacity': 1, 'cursor': 'pointer'}); 
    }
}
function filtersActive() {
    const tbl = Object.keys(getTableFilters([])).length > 0;
    const pnl = Object.keys(fPs.pnlFltrs).length > 0;
    return tbl || pnl;
}
/* ====================== UPDATE FILTER STATUS BAR ================================================================== */
/**
 * Either displays all filters currently applied, or applies the previous filter 
 * message persisted through table update into map view.
 */
export function updateFilterStatusMsg() {                                       //console.log("updateFilterStatusMsg called.")
    tblState = tState().get(null, ['api', 'intSet']);
    if (!tblState.api) { return; }
    setFilterStatus(getActiveFilters());
    enableClearFiltersButton();
}
/**
 * Returns the display names of all active filters in an array. 
 * If a saved filter set is applied filters are read from the set. Otherwise, the
 * active filters in the panel and table are checked and returned.
 */
function getActiveFilters() { 
    const set = savedFilterSetActive(); 
    return set ? getSavedFilterStatus(set) : getTableFilters(addExternalFilters());
}
function getSavedFilterStatus(set) {                                            //console.log('getSavedFilterStatus. set = %O', set);
    const tblFltrs = Object.keys(set.table);
    const pnlFltrs = getPanelFilters(set.panel);
    return pnlFltrs.concat(tblFltrs);
}
function getPanelFilters(filters) {
    return Object.keys(filters).map(type => {  
        return typeof filters[type] == 'string' ? 'Time Updated' : Object.keys(filters[type])[0]
    });
}
function addExternalFilters() {  
    const map = { combo: addComboValue, name: addName, time: addTimeFltr };
    return getFocusFilterDisplayVals();

    function getFocusFilterDisplayVals() {
        const filters = [];
        Object.keys(fPs.pnlFltrs).forEach(type => {                             //console.log('filter [%s] = %O', type, fPs.pnlFltrs[type]);
            filters.push(map[type](fPs.pnlFltrs[type]));
        });  
        return filters; 
    }
}
/** Stores the most recent combobox selection. */
function addComboValue(comboObj) {                                              //console.log('comboObj = %O', comboObj);
    const type = Object.keys(comboObj);
    return comboObj[type].text;
}
function addName(name) {
    return name;
}
function addTimeFltr(time) {
    return "Time Updated";
}
function getTableFilters(filters) {
    const filterModels = getTableFilterModels();                                //console.log('filterModels = %O', filterModels); 
    const columns = Object.keys(filterModels);        
    for (let i=0; i < columns.length; i++) {
        if (filterModels[columns[i]] !== null) { 
            filters.push(columns[i]); }
    }
    return filters;
}
function setFilterStatus(filters) {  
    if (filters.length > 0 || savedIntListLoaded()) { setStatus(getStatus(filters)); 
    } else { resetTblFilters() }
}
function getStatus(filters) {                                                   
    const list = savedIntListLoaded() ? '(LIST)' : ''; 
    const set = savedFilterSetActive() ? '(SET)' : '';
    const loaded = [list, set].filter(f=>f).join(' '); 
    const fltrs = filters.join(', ');
    return loaded !== '' & fltrs !== '' ? `${loaded} ${fltrs}.` :
        loaded ? loaded : fltrs+'.';
}
// Removed because setting the "external filter status" doesn't seem to ever be used anymore.
// function getStatus(filters) {
//     if ($('#xtrnl-filter-status').text() === 'Filtering on: ') {
//         return filters.join(', ') + '.';
//     } else {
//         const tempStatusTxt = $('#xtrnl-filter-status').text();
//         if (tempStatusTxt.charAt(tempStatusTxt.length-2) !== ',') {  //So as not to add a second comma.
//             setExternalFilterStatus(tempStatusTxt + ', ');
//         }
//         return filters.join(', ') + '.'; 
//     }
// }
/** Returns an obj with the ag-grid filter models. */
function getTableFilterModels() {  
    if (!tblState.api) { return {}; }
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
function setStatus(status) {                                                    //console.log("setFilterStatus. status = ", status)
    $('#filter-status').text(status);
}
export function resetTblFilters() {  
    $('#filter-status').text('No Active Filters.');
    $('#focus-filters input').val('');
    $('#shw-chngd').prop('checked', false); //resets updatedAt table filter
    fPs.pnlFltrs = {};
}
/* ====================== TIME-UPDATED FILTER ======================================================================= */
export function selTimeFilter(val) {                                            //console.log('selTimeFilter. = ', val);
    fPs.pnlFltrs.time.type = val;
    showCal();
}
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
    toggleTimeFilter(true, 'today');
}
/** The time-updated filter is enabled when the filter option is checked. */
export function toggleTimeFilter(state, time) {                                 //console.log('toggleTimeFilter. state = %s, time? ', state, time);
    const filtering = ifFilteringOnTime(state);
    updateMemory(time);
    updateRelatedUi(filtering);
    if (filtering) { showCal(time);
    } else { resetTimeFilter(); }
}
function updateMemory(time) {
    tblState = tState().get();
    fPs.pnlFltrs.time = {date: time, type: _u.getSelVal('Time Filter')};
}
function ifFilteringOnTime(state) {
    return state === 'disable' ? false : state === true ? true : $('#shw-chngd')[0].checked;
}
function updateRelatedUi(filtering) {
    const opac = filtering ? 1 : .3;
    $('#time-cal, .flatpickr-input').attr({'disabled': !filtering});  
    $('.time-fltr-sel, #time-cal, .flatpickr-input').css({'opacity': opac});
    $('#shw-chngd')[0].checked = filtering;
    db_ui.resetToggleTreeBttn(false);
    if (filtering) {
        $('#time-fltr')[0].selectize.enable();
    } else { $('#time-fltr')[0].selectize.disable(); }
}
/** 
 * Disables the calendar, if shown, and resets table with active filters reapplied.
 */
function resetTimeFilter() {                                                    //console.log('tState = %O', tState);
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
function showCal(time) {                                                        //console.log('showFlatpickrCal. time? = [%s] fPs = %O', time, fPs);
    fPs.cal = fPs.cal || initCal(); 
    if (time == 'today') { 
        filterToChangesToday(); 
    } else if (time) { 
        filterToSpecifiedTime(time);
    } else if (fPs.pnlFltrs.time.date) {  
        reapplyPreviousTimeFilter(fPs.pnlFltrs.time);
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
        onClose: filterByType
    }; 
    return $('#time-cal').flatpickr(calOpts);
}
function reapplyPreviousTimeFilter(timeObj, skipSync) { 
    fPs.cal.setDate(timeObj.date);  
    filterByType(null, timeObj.date, null, skipSync);
}
function filterToChangesToday() {  
    const today = new Date().today();
    fPs.cal.setDate(today, false, 'Y-m-d');  
    filterByType(null, today, null, skipSync);
}
function filterToSpecifiedTime(time) {
    fPs.cal.setDate(time, false, 'F d, Y h:i K');  
    filterByType(null, time, null, skipSync);
}
/**
 * This method can be called on calendar input change, and thus takes the following
 * parameters: dates, dateStr, instance, skipSync.
 */
function filterByType(dates, dateStr, instance, skipSync) {
    if (fPs.pnlFltrs.time.type === 'cited') {
        filterInteractionsPublishedAfter(null, dateStr, null, skipSync);
    } else {
        filterInteractionsUpdatedSince(null, dateStr, null, skipSync);
    }
}
/* ------------------ PUBLISHED AFTER [TIME] FILTER ------------------------- */
function filterInteractionsPublishedAfter(dates, dateStr, instance, skipSync) { console.log("filterInteractionsPublishedAfter called. arguments? ", arguments);
    
}
/* ------------------- UPDATED AFTER [TIME] FILTER -------------------------- */
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
        const fltrSince = dateStr || fPs.pnlFltrs.time.date;
        fPs.pnlFltrs.time.date =  fltrSince;
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
function syncFiltersAndUi() {                                                   //console.log('tblState = %O', tblState);
    db_ui.resetToggleTreeBttn(false);
    syncViewFiltersAndUi(tblState.curFocus);
    updateFilterStatusMsg();  
}
export function syncViewFiltersAndUi(focus) {
    tblState = tState().get();
    const map = {
        locs: db_ui.loadSearchLocHtml,
        srcs: applySrcFltrs,
        taxa: updateTaxonComboboxes
    }; 
    map[focus](tblState);
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
    setFocusFilterVal(text);
    updateFilterStatusMsg();
    db_ui.resetToggleTreeBttn(false);
} 
function setFocusFilterVal(text) { 
    if (text === "") { return delete fPs.pnlFltrs.name; }
    fPs.pnlFltrs.name = '"'+text+'"'; 
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
export function updateTaxonSearch(val) {                                        
    if (!val) { return; }                                                       console.log("updateTaxonSearch val = ", val); 
    const taxonRcrds = tState().get('rcrdsById');
    const rcrd = _u.getDetachedRcrd(val, taxonRcrds);  
    tState().set({'selectedOpts': getRelatedTaxaToSelect(rcrd, taxonRcrds)});   //console.log("selectedVals = %O", tParams.selectedVals);
    addToFilterMemory();
    rebuildTxnTable(rcrd, 'filtering');

    function addToFilterMemory() {
        const curLevel = rcrd.level.displayName;
        const taxonName = rcrd.displayName;
        fPs.pnlFltrs.combo = {};
        fPs.pnlFltrs.combo[curLevel] = { text: taxonName, value: val };
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
    if ($('#shw-chngd')[0].checked) { reapplyPreviousTimeFilter(fPs.pnlFltrs.time, 'skip'); }
} 
function getLocType(selId) {
    const selTypes = { selCountry: 'Country', selRegion: 'Region' };
    return selTypes[selId];
}
function getComboboxValuesAndRebuildLocTree(val, locType) {
    const selVal = parseInt(val);  
    tState().set({'selectedOpts': getSelectedVals(selVal, locType)});
    updateLocFilter(locType, selVal);
    rebuildLocTable([selVal]);                                                  //console.log('selected [%s] = %O', locType, _u.snapshot(tState().get('selectedOpts'));
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
function updateLocFilter(locType, locId) {
    fPs.pnlFltrs.combo = {};
    fPs.pnlFltrs.combo[locType] = { text: locType, value: locId };
    // updateFilterStatusMsg();
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
    setPubFilters();
    tblState.api.setRowData(newRows);
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
    function setPubFilters() { 
        const typeVal = $(`#selPubType option[value="${typeId}"]`).text();
        const truncTxt = txt ? 
            (txt.length > 50 ? txt.substring(0, 50)+'...' : txt) : null; 
        updatePubFocusFilters(typeVal, typeId, truncTxt);
        updateFilterStatusMsg();
    }
    function updatePubFocusFilters(type, typeId, text) {
        updatePubComboboxFilter();
        updatePubNameFilter();

        function updatePubComboboxFilter() { 
            if (type === '- All -') { delete fPs.pnlFltrs.combo; 
            } else { 
                fPs.pnlFltrs.combo = {}; 
                fPs.pnlFltrs.combo["Publication Type"] = 
                    { text: 'Publication Type', value: typeId }
            };
        }
        function updatePubNameFilter() {  
            if (text == '' || text == null) { delete fPs.pnlFltrs.name;
            } else { fPs.pnlFltrs.name = '"'+text+'"'; }
        }
    }
} /* End updatePubSearch */
/* ========================== FILTER UTILITY METHODS ================================================================ */
/** If table is filtered by an external filter, the rows are stored in fltrdRows. */
function getAllCurRows() { 
    return fPs.fltrdRows || tblState.rowData;
} 