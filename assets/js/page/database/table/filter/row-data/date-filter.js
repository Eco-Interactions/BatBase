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
import { _table, _ui, _u } from '~db';
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
    _u('initCombobox', [{ name: 'Date Filter Type', onChange: onDateTypeChange }]);
    _u('enableCombobox', ['DateFilterType', false]);
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
/* ---------------------- FLATPICKR CAL CONFIG ------------------------------ */
/** Instantiates the flatpickr calendar and returns the flatpickr instance. */
function initCal() {
    if (app.cal) { app.cal.destroy(); }
    const flatpickr = require('flatpickr');
    const calOpts = {
        altInput: true, maxDate: "today",
        disableMobile: true,
        enableTime: ifFilteringByUpdates(),
        onClose: filterByTime,
        onReady: getCalOnReadyMethod(),
        plugins: getCalPlugins(ifFilteringByUpdates()),
    };
    addDefaultTimeIfTesting(calOpts);
    return new flatpickr('#filter-cal', calOpts);
}
function ifFilteringByUpdates() {
    return app.date && app.date.type === 'updated';
}
function getCalPlugins(filterByDbUpdatedAt) {
    return filterByDbUpdatedAt ? getConfirmDatePlugin() : getMonthPlugin();
}
function getConfirmDatePlugin() {
    const confirmDatePlugin = require('flatpickr/dist/plugins/confirmDate/confirmDate.js');
    return [new confirmDatePlugin({showAlways: true})];
}
function getMonthPlugin() {
    return [];
    // const monthSelectPlugin = require('flatpickr/dist/plugins/monthSelectPlugin/monthSelectPlugin.js');
    // return [new monthSelectPlugin({
    //     shorthand: true, //defaults to false
    //     dateFormat: "m.y", //defaults to "F Y"
    //     altFormat: "F Y", //defaults to "F Y"
    //     theme: "dark" // defaults to "light"
    // })];
}
function getCalOnReadyMethod() {
    return ifFilteringByUpdates() ?
            function() {this.amPM.textContent = "AM"} : Function.prototype;
}
/**
 * There doesn't seem to be a way to set the date on the flatpickr calendar
 * from the selenium/behat tests. A data property is added to the calendar elem
 * and that date is set as the default for the calendar.
 */
function addDefaultTimeIfTesting(calOpts) {
    const date = $('#sel-DateFilterType').data('default');
    if (!date) { return; }
    calOpts.defaultDate = date;
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
        type:   _u('getSelVal', ['Date Filter Type'])
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
    _u('setSelVal', ['Focus', focus, 'silent']);
    _table('resetDataTable', [focus])
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