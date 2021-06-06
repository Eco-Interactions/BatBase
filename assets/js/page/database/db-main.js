/**
 * The Database Search page entry point. The data table is built to display the
 * eco-interaction records organized by a selected "focus": taxa (grouped further
 * by view: bat, plant, etc), locations, or sources (grouped by either
 * authors, publications, or publishers). The data map displays interactions
 * geographically. Filtered interactions can be viewed in either form.
 *
 * TOC
 *     MODULE-EXECUTOR
 *     PAGE INIT
 */
import { _alert, _db, _u, executeMethod } from '~util';
import * as forms from './forms/forms-main.js';
import * as map from './map/map-main.js';
import * as table from './table/table-main.js';
import * as review from './data-review/data-review-main.js';
import * as tutorial from './tutorial/db-tutorial.js';
import * as ui from './ui/ui-main.js';
/*
 * NOTE: Not sure why this code is getting loaded on external pages, or why this
 * is ran before the core site-init begins. Probably something tangled with webpack.
 */
if (window.location.pathname.includes('search')) {
    window.setTimeout(initDbPage, 500);
}
/** ===================== MODULE-EXECUTOR =================================== */
function moduleMethod(funcName, mod, modName, params) {
    return executeMethod(funcName, mod, modName, 'db-main', params);
}
export function _filter(funcName, params = []) {
    return table._filter(funcName, [...params]);
}
export function _forms(funcName, params = []) {
    return moduleMethod(funcName, forms, 'forms', params);
}
export function _map(funcName, params = []) {
    return moduleMethod(funcName, map, 'map', params);
}
export function _table(funcName, params = []) {
    return moduleMethod(funcName, table, 'table', params);
}
export function _review(funcName, params = []) {
    return moduleMethod(funcName, review, 'review', params);
}
export function _tutorial(funcName, params = []) {
    return moduleMethod(funcName, tutorial, 'tutorial', params);
}
export function _ui(funcName, params = []) {
    return moduleMethod(funcName, ui, 'ui', params);
}
/** ==================== PAGE INIT ========================================== */
/** Initializes the UI unless on mobile device.  */
function initDbPage () {
    if ($(window).width() < 1200 && $('body').data('env') != 'test') { return; } //Popup shown in oi.js
    requireScriptsAndStyles();
    ui.init();
    _db('initDb');
    //The idb-util.initDb will call @initSearchStateAndTable once local database is ready.
}
function requireScriptsAndStyles() {
    requireCss();
    requireJs();
}
/** Loads css files used on the search database page, using Encore webpack. */
function requireCss() {
    require('flatpickr/dist/flatpickr.min.css')
    require('styles/css/lib/ag-grid.css');
    require('styles/css/lib/theme-fresh.css');
    require('styles/css/lib/selectize.default.css');
    require('styles/pages/db/db.styl');
}
function requireJs() {
    require('leaflet-control-geocoder');
    require('libs/selectize.js');
}
/**
 * The first time a browser visits the search page, or when local data is reset,
 * all data is downloaded and stored from the server. The intro-walkthrough is
 * shown on first visit.
 */
export function showIntroAndLoadingMsg(resettingData) {
    ui.updateUiForDatabaseInit();
    ui.selectInitialSearchFocus('taxa', resettingData);
    if (resettingData) { return $('#sel-View')[0].selectize.clear('silent'); } //TODO: Why is this needed?
    tutorial.startWalkthrough('taxa');
}
/** After new data is downlaoded, the search state is initialized and page loaded. */
export function initSearchStateAndTable(focus = 'taxa', isAllDataAvailable = true) {/*perm-log*/console.log('   *//initSearchStateAndTable. focus? [%s], allDataAvailable ? [%s]', focus, isAllDataAvailable);
    setTableInitState(focus, isAllDataAvailable);
    ui.selectInitialSearchFocus(focus);
    if ($('body').data('env') === 'test' && isAllDataAvailable === false) { return; }
    table.buildTable();
}
function setTableInitState(focus, isAllDataAvailable) {
    ui.resetFilterPanelOnFocusChange(focus);
    table.resetTableParams(focus, isAllDataAvailable);
}
/** ==================== HELPERS ============================================ */
/**  Returns a copy of the record detached from the original. */
export function getDetachedRcrd(rcrdKey, rcrds, entity) {           /*dbug-log*///console.log("getDetachedRcrd. key = %s, rcrds = %O", rcrdKey, rcrds);
    if (!rcrds[rcrdKey]) { return alertNoRecord(rcrdKey, entity); }
    if (ifRecordSoftDeleted(rcrds[rcrdKey])) { return false; }
    return _u('snapshot', [rcrds[rcrdKey]]);
}
function alertNoRecord(rcrdKey, entity) {                           /*perm-log*/_u('logInDevEnv', ["#########-ERROR- couldn't get record [%s] from %O", rcrdKey, rcrds]);
    _alert('alertIssue', ['noRcrdFound', {id: rcrdKey, entity: entity }]);
    return false;
}
function ifRecordSoftDeleted(rcrd) {
    return rcrd.displayName && rcrd.displayName.includes('[DELETE]');
}