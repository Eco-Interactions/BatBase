/*
 * Filters interactions on either the date published or updated. 
 * 
 * Exports:
 *      clearDateFilter
 *      initDateFilterUi
 *      selDateFilter
 *      reapplyPreviousDateFilter
 *      showTodaysUpdates
 *      syncViewFiltersAndUi
 *      toggleDateFilter
 *      
 * TOC:
 *      INIT
 *      SET UP
 *          FLATPICKR CAL CONFIG
 *          STYLES AND STATE
 *      FILTER BY DATE
 *          SHOW TODAY'S UPDATES AFTER CREATE FORM CLOSED
 *          APPLY FILTER
 *      CLEAR 
 *      SYNC WITH ACTIVE FILTERS
 *          TREE-TEXT
 *          SOURCE
 *          TAXON
 */
import * as fM from './filters-main.js';
import { accessTableState as tState,_ui, _u } from '../db-main.js';
let tblState;
/* 
 * {obj} cal    Stores the flatpickr calendar instance.  
 * {obj} date   Stores the date filter's current { time, type }
 */
let app = {};
/* ========================== INIT ========================================== */
export function initDateFilterUi() {
    $('#shw-chngd').change(toggleDateFilter.bind(null, null, null, null));
    _u('initCombobox', ['Date Filter', selDateFilter]);
    $('#selDateFilter')[0].selectize.disable();
    applyDateFilterStyles(false); //inits disabled ui
}
/** Change event for the time-filter-type combobox. */
export function selDateFilter(val) {                                            //console.log('selDateFilter. = ', val);
    if (!app.date) { app.date = { time: null }; }
    app.date.type = val;
    if (ifDateFilterActive()) { 
        app.cal = initCal();
        filterTableByDate(); 
    }
}
/* ============================== SET UP ==================================== */
export function toggleDateFilter(state, time, skipSync) {                       console.log('       +-toggleDateFilter. state = %s, time? ', state, time); 
    app.cal = initCal();
    tblState = tState().get();
    const filtering = ifDateFilterActive(state);
    updateDateFilterState(time);
    applyDateFilterStyles(filtering);
    if (filtering) { filterTableByDate(time);
    } else { resetDateFilter(skipSync); } 
} 
export function reapplyPreviousDateFilter(time, skipSync) { 
    app.cal.setDate(time);  
    filterByTime(null, time, null, skipSync);
}
/* ---------------------- FLATPICKR CAL CONFIG ------------------------------ */
/** Instantiates the flatpickr calendar and returns the flatpickr instance. */
function initCal() {
    if (app.cal) { app.cal.destroy(); }
    const flatpickr = require('flatpickr');
    const calOpts = {
        altInput: true, maxDate: "today", enableTime: ifFilteringByUpdates(),   
        plugins: ifFilteringByUpdates() ? getCalPlugins() : [],
        onReady: getCalOnReadyMethod(), disableMobile: true,
        onClose: filterByTime, 
    }; 
    addDefaultTimeIfTesting(calOpts);
    return new flatpickr('#filter-cal', calOpts);
}
function ifFilteringByUpdates() {
    return app.date && app.date.type === 'updated'; 
}
function getCalPlugins() {
    const confirmDatePlugin = require('flatpickr/dist/plugins/confirmDate/confirmDate.js'); 
    return [new confirmDatePlugin({showAlways: true})];
}
function getCalOnReadyMethod() {
    return ifFilteringByUpdates() ? 
            function() {this.amPM.textContent = "AM"} : Function.prototype;
}
/**
 * There doesn't seem to be a way to set the date on the flatpickr calendar
 * from the selenium/behat tests. A data property is added to the calendar elem 
 * and that time is set as the default for the calendar. 
 */
function addDefaultTimeIfTesting(calOpts) {
    const date = $('#selDateFilter').data('default');  
    if (!date) { return; }
    calOpts.defaultDate = date;
}
/* -------------------------- STYLES AND STATE ------------------------------ */
function applyDateFilterStyles(filtering) {
    const opac = filtering ? 1 : .6;
    $('#filter-cal, #filter-cal+.form-control').attr({'disabled': !filtering});  
    $('.selDateFilter-sel, #filter-cal, .flatpickr-input, #shw-chngd-ints label, #shw-chngd-ints div').css({'opacity': opac});
    $('#shw-chngd')[0].checked = filtering;
    _ui('setTreeToggleData', [false]);
    if (filtering) {
        $('#selDateFilter')[0].selectize.enable();
    } else { 
        $('#selDateFilter')[0].selectize.disable()
    }
}
function ifDateFilterActive(state) {
    return state === 'disable' ? false : state === true ? true : $('#shw-chngd')[0].checked;
}
function updateDateFilterState(time) {
    if (!app.date) { app.date = {}; }
    app.date = { time: time || null, type:  _u('getSelVal', ['Date Filter']) };
    fM.setPanelFilterState('date', app.date);
}
/* ============================ FILTER BY DATE ============================== */
function filterTableByDate(time) {                                              //console.log('filterTableByDate. time? = [%s] fPs = %O', time, fPs.pnlFltrs);
    if (time == 'today') { 
        filterToChangesToday(); 
    } else if (time) { 
        filterToSpecifiedTime(time);
    } else if (app.date.time) {  
        reapplyPreviousDateFilter(app.date.time);
    } else {
        app.cal.open();
        if ($('#selDateFilter').data('default')) { return; }
        app.cal.setDate(new Date().today(), false, 'Y-m-d');  
    }
}   
function filterToChangesToday() {  
    const today = new Date().today();
    $('#selDateFilter')[0].selectize.addItem('updated');
    app.date.type = 'updated';
    app.cal.setDate(today, false, 'Y-m-d');  
    filterByTime(null, today);
}
function filterToSpecifiedTime(time) {
    app.cal.setDate(time, false, 'F d, Y h:i K');  
    filterByTime(null, time);
}
/* ------------- SHOW TODAY'S UPDATES AFTER CREATE FORM CLOSE --------------- */
/**
 * When the interaction form is exited, the passed focus is selected and the 
 * table is refreshed with the 'interactions updates since' filter set to 'today'.
 */
export function showTodaysUpdates(focus) {                                      console.log("       +-showTodaysUpdates. focus ? [%s] ", focus)
    _u('setSelVal', ['Focus', focus, 'silent']);
    resetDataTable(focus)
    .then(showUpdatesAfterTableLoad);
}
function showUpdatesAfterTableLoad() {
    _u('setSelVal', ['Date Filter', 'updated']);
    toggleDateFilter(true, 'today');
}
/* ------------------- APPLY FILTER ----------------------------------------- */
/**
 * Filters all interactions in the table leaving only the records with updates
 * since the datetime specified by the user.
 * Note: Params 1-3 sent by calendar
 */
function filterByTime(dates, dateStr, instance, skipSync) {
    const time = updateMemoryAndReturnTime(dateStr);
    filterInteractionsByTime(time, app.date.type);
    updateUiAfterTimeFilterChange(dateStr, skipSync);
}
function updateMemoryAndReturnTime(dateStr) {
    tblState = tState().get();
    const fltrSince = dateStr || app.date.time;
    app.date.time = fltrSince;
    return new Date(fltrSince).getTime(); 
}
function filterInteractionsByTime(time, type) {
    const rows = getRowsAfterTime(time, type);                                  //console.log("rows = %O", rows);
    tblState.api.setRowData(rows);
    fM.setCurrentRowData(rows);
}
function getRowsAfterTime(filterTime, type) {
    const rowData = _u('snapshot', [tblState.rowData]);
    return rowData.filter(getIntsForDateFilter);        
    
    function getIntsForDateFilter(row) { 
        if (row.interactionType) { return checkIntRowForUpdates(row); }
        row.children = row.children ? 
            row.children.filter(getIntsForDateFilter) : [];
        return row.children.length > 0;

        function checkIntRowForUpdates(row) { 
            const date = type === 'cited' ? row.year + '-01-01' : row.updatedAt;
            let rowTime = new Date(date)
            rowTime.setHours(rowTime.getHours()+8);     //Resets from PCT to GMT                       
            rowTime = rowTime.getTime();                                        //console.log("row [%O] rowTime = %O >= since = %O [%s]", row, rowTime, filterTime, rowTime >= filterTime);
            return rowTime >= filterTime;
        }
    } /* End addAllRowsWithUpdates */
} /* End getRowsAfterTime */
function updateUiAfterTimeFilterChange(time, skipSync) {
    $('.flatpickr-input').val(time);
    if (skipSync) { return; } //console.log('skipping filter sync');
    syncFiltersAndUi(time);
}
/* ============================== CLEAR ===================================== */
export function clearDateFilter() {
    $('#shw-chngd').prop('checked', false);
    toggleDateFilter('disable', null, 'skipSync');
    tblState = null;
}
/** Clears Date filter and resets table with remainig active filters reapplied. */
function resetDateFilter(skipSync) {                                            //console.log('resetDateFilter. skipSync?', skipSync);
    fM.setCurrentRowData(null);
    if (!skipSync && tblState.api && tblState.rowData) { 
        tblState.api.setRowData(tblState.rowData);
        syncFiltersAndUi();
    }
}
/* ======================= SYNC WITH ACTIVE FILTERS ========================= */
/**
 * When filtering by date or view saved int lists, some filters will need to be reapplied.
 * (Taxa and loation filter rowdata directly, and so do not need to be reapplied.
 * Source, both auth and pub views, must be reapplied.) The date filter radios are synced.
 * The table filter's status message is updated. 
 */
function syncFiltersAndUi(time) {                                               console.log('           --syncFiltersAndUi [%s]', time);
    _ui('setTreeToggleData', [false]);
    if (time != new Date().today()) { syncViewFiltersAndUi(tblState.curFocus); } 
    _ui('updateFilterStatusMsg')
}
export function syncViewFiltersAndUi(focus) {
    tblState = tState().get();
    const map = {
        locs: fM.loadLocFilters,
        srcs: applySrcFilters,
        taxa: updateTaxonComboboxes
    }; 
    map[focus](tblState);
}
/* -------------------- TREE-TEXT ------------------------------------------- */
function reapplyTreeTextFltr() {                                            
    const entity = getTableEntityName();                                        //console.log("reapplying [%s] text filter", entity);
    if (getTreeFilterTextVal(entity) === '') { return; }
    fM.filterTableByText(entity);
}
function getTableEntityName() {
    const names = { 'taxa': 'Taxon', 'locs': 'Location', 'auths': 'Author',
        'publ': 'Publisher', 'pubs': 'Publication' };
    const ent = tblState.curFocus === 'srcs' ? tblState.curView : tblState.curFocus;
    return names[ent];
}
/* ------------------ SOURCE ------------------------------------------------- */
/** Reapplys active external filters, author name or publication type. */
function applySrcFilters(tblState) {
    const resets = { 'auths': reapplyTreeTextFltr, 'pubs': reapplyPubFltr, 
        'publ': reapplyTreeTextFltr };
    resets[tblState.curView]();
}
function reapplyPubFltr() {                                                     //console.log("reapplying pub filter");
    if (_u('getSelVal', ['Publication Type']) === 'all') { return; }
    fM.updatePubSearch();
}
/* ------------------ TAXON ------------------------------------------------- */
/**
 * When the time-updated filter is updated, the taxa-by-level property has to be
 * updated based on the rows displayed in the grid so that the combobox options
 * show only taxa in the filtered tree.
 */
function updateTaxonComboboxes() {                                              //console.log('updateTaxonComboboxes. tblState = %O', tblState)
    const rowData = _u('snapshot', [fM.getCurRowData()]);
    _u('getData', ['levelNames']).then(lvls => {  
        const taxaByLvl = seperateTaxonTreeByLvl(lvls, rowData);
        tState().set({'taxaByLvl': taxaByLvl});                                 //console.log("taxaByLvl = %O", taxaByLvl)
        fM.loadTxnFilters(tState().get());
    });
}
/** Returns an object with taxon records by level and keyed with display names. */
function seperateTaxonTreeByLvl(lvls, rowData) {                                
    const separated = {};
    rowData.forEach(data => separate(data));
    return sortObjByLevelRank();

    function separate(row) {                                                    //console.log('taxon = %O', taxon)
        if (!separated[row.taxonLvl]) { separated[row.taxonLvl] = {}; }
        separated[row.taxonLvl][row.name] = row.id;
        
        if (row.children) { 
            row.children.forEach(child => separate(child)); 
        }
    }
    function sortObjByLevelRank() {
        const obj = {};
        Object.keys(lvls).forEach(lvl => { 
            if (lvl in separated) { obj[lvl] = separated[lvl]; }
        });
        return obj;
    }
} 