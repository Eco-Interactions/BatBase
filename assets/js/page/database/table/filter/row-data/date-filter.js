/*
 * Filters interactions on either the date published or updated.
 *
 * Exports:
 *      clearDateFilter
 *      initDateFilterUi
 *      reapplyPreviousDateFilter
 *      showTodaysUpdates
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
 *          LOCATION
 *          SOURCE
 *          TAXON
 *          TREE-TEXT
 */
import { _cmbx, _lib } from '~util';
import { _table, _ui } from '~db';
import * as fM from '../filter-main.js';
let tblState;
/*
 * {obj} cal    Stores the flatpickr calendar instance.
 * {obj} date   Stores the date filter's current { time, type, active(state) }
 */
let app = {};
/* ========================== INIT ========================================== */
export function initDateFilterUi() {
    $('#shw-chngd').change(toggleDateFilter.bind(null, null, null, null));
    _cmbx('initCombobox', [{ name: 'Date Filter Type', onChange: onDateTypeChange }]);
    _cmbx('enableCombobox', ['DateFilterType', false]);
    applyDateFilterStyles(false); //inits disabled ui
}
/** Change event for the time-filter-type combobox. */
function onDateTypeChange(val) {
    if (!app.date) { app.date = { time: null, active: false }; }
    app.date.type = val;
    if (ifDateFilterActive()) {
        app.cal = initCal();
        filterTableByDate();
    }
}
/* ============================== SET UP ==================================== */
/**
 * Change method for the date-filter checkbox and entry point for setting filter
 * in general.
 */
export function toggleDateFilter(state, dateTime, skipSync) {       /*dbug-log*///console.log('       +-toggleDateFilter. state = %s, time? ', state, dateTime);
    app.cal = initCal();
    app.date = fM.getFilterStateKey('date');
    tblState = _table('tableState').get();
    const filtering = ifDateFilterActive(state);
    updateDateFilterState(dateTime, filtering);
    applyDateFilterStyles(filtering);
    if (filtering) { filterTableByDate(dateTime);
    } else { resetDateFilter(skipSync); }
}
function initCal() {
    if (app.cal) { app.cal.destroy(); }
    return _lib('getNewCalendar', [getDateFilterCalConfg()]);
}
function getDateFilterCalConfg() {
    return {
        elemId: '#filter-cal',
        enableTime: ifFilteringByUpdates(),
        onClose: filterByTime,
        plugins: getCalPlugins(ifFilteringByUpdates()),
    };
}
function getCalPlugins(filterByDbUpdatedAt) {
    return filterByDbUpdatedAt ? ['confirm'] : false;
}
function ifFilteringByUpdates() {
    return app.date && app.date.type === 'updated';
}
/* -------------------------- STYLES AND STATE ------------------------------ */
function applyDateFilterStyles(filtering) {
    const opac = filtering ? 1 : .6;
    $('#filter-cal, #filter-cal+.form-control').attr({'disabled': !filtering});
    $('.sel-DateFilterType-sel, #filter-cal, .flatpickr-input, #shw-chngd-ints label, #shw-chngd-ints div').css({'opacity': opac});
    $('#shw-chngd')[0].checked = filtering;
    _ui('setTreeToggleData', [false]);
    if (filtering) {
        $('#sel-DateFilterType')[0].selectize.enable();
    } else {
        $('#sel-DateFilterType')[0].selectize.disable()
    }
}
function ifDateFilterActive(state) {
    return state === 'disable' ? false : state === true ? true : $('#shw-chngd')[0].checked;
}
function updateDateFilterState(dateTime, filtering) {
    if (!app.date) { app.date = {}; }
    app.date = {
        active: filtering,
        time:   dateTime || app.date.time,
        type:   _cmbx('getSelVal', ['DateFilterType'])
    };
    fM.setFilterState('date', app.date, 'direct');
}
/* ============================ FILTER BY DATE ============================== */
function filterTableByDate(date) {                                              //console.log('filterTableByDate. date? = [%s] prevDate = %O', date, app.date.time);
    if (date == 'today') {
        filterToChangesToday();
    } else if (date) {
        filterToSpecifiedTime(date);
    } else if (app.date.time) {
        reapplyPreviousDateFilter(app.date.time);
    } else {
        openCalendar();
    }
}
function filterToChangesToday() {
    const today = new Date().today();
    $('#sel-DateFilterType')[0].selectize.addItem('updated');
    app.date.type = 'updated';
    app.cal.setDate(today, false, 'Y-m-d');
    filterByTime(null, today);
}
function filterToSpecifiedTime(dateTime) {
    app.cal.setDate(dateTime, false, 'F d, Y h:i K');
    filterByTime(null, dateTime);
}
function reapplyPreviousDateFilter(dateTime) {
    app.cal.setDate(dateTime);
    filterByTime(null, dateTime, null, 'skipUiSync');
}
function openCalendar() {
    app.cal.open();
    if ($('#sel-DateFilterType').data('default')) { return; }
    app.cal.setDate(new Date().today(), false, 'Y-m-d');
}
/* ------------- SHOW TODAY'S UPDATES AFTER CREATE FORM CLOSE --------------- */
/**
 * When the interaction form is exited, the passed focus is selected and the
 * table is refreshed with the 'interactions updates since' filter set to 'today'.
 */
export function showTodaysUpdates(focus) {                                      //console.log("       +-showTodaysUpdates. focus ? [%s] ", focus)
    _cmbx('setSelVal', ['Focus', focus, 'silent']);
    _table('resetDataTable', [focus])
    .then(showUpdatesAfterTableLoad);
}
function showUpdatesAfterTableLoad() {
    _cmbx('setSelVal', ['Date Filter Type', 'updated']);
    toggleDateFilter(true, 'today');
}
/* ------------------- APPLY FILTER ----------------------------------------- */
/**
 * Filters all interactions in the table leaving only the records with updates
 * since the datetime specified by the user.
 * Note: Params 1-3 sent by calendar
 */
function filterByTime(dates, dateTime, instance, skipSync = true) { /*dbug-log*///console.log('filterByTime args = %O', arguments)
    updateDateFilterState(dateTime, true);
    fM.onFilterChangeUpdateRowData();
    updateUiAfterTimeFilterChange(dateTime, skipSync);
}
function updateUiAfterTimeFilterChange(dateTime, skipSync) {
    $('.flatpickr-input').val(dateTime);
    _ui('updateFilterStatusMsg');
    if (skipSync) { return; }                                                   //console.log('skipping filter sync');
    syncUiAfterDateFilter(dateTime);
}
/* ============================== CLEAR ===================================== */
export function clearDateFilter() {
    $('#shw-chngd').prop('checked', false);
    toggleDateFilter('disable', null, 'skipSync');
    tblState = null;
}
/** Clears Date filter and resets table with remainig active filters reapplied. */
function resetDateFilter(skipSync) {                                            //console.log('resetDateFilter. skipSync?', skipSync);
    updateDateFilterState(false, false);
    if (!skipSync) {
        fM.onFilterChangeUpdateRowData();
        syncUiAfterDateFilter();
    }
}
/* ======================= SYNC WITH ACTIVE FILTERS ========================= */
/**
 * When filtering by date or view saved int lists, some filters will need to be reapplied.
 * (Taxa and loation filter rowdata directly, and so do not need to be reapplied.
 * Source, both auth and pub views, must be reapplied.) The date filter radios are synced.
 * The table filter's status message is updated.
 */
function syncUiAfterDateFilter(dateTime) {                         /*debug-log*///console.log('           --syncUiAfterDateFilter [%s]', dateTime);
    _ui('setTreeToggleData', [false]);
    _ui('updateFilterStatusMsg')
}