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
import * as appUtil from '~util';
import * as forms from './forms/forms-main.js';
import * as map from './map/map-main.js';
import * as table from './table/table-main.js';
import * as tutorial from './tutorial/db-tutorial.js';

import * as u from './util/db-util.js';

import * as ui from './ui/ui-main.js';
/*
 * NOTE: Not sure why this code is getting loaded on external pages, or why this
 * is ran before the core site-init begins. Probably something tangled with webpack.
 */
if (window.location.pathname.includes('search')) {
    window.setTimeout(initDbPage, 500);
}
/** ===================== MODULE-EXECUTOR =================================== */
export function executeMethod() {
    return appUtil.executeMethod(...arguments);
}
function moduleMethod(funcName, mod, modName, params) {
    return appUtil.executeMethod(funcName, mod, modName, 'db-main', params);
}
export function _util(funcName, params = []) {
    return moduleMethod(funcName, appUtil, 'app-util', params);
}
/** Calls the util methods from either the db-util or the app-util. */
export function _u(funcName, params = []) {
    const modName = u[funcName] ? 'db-util' : 'app-util';
    const mod = modName === 'db-util' ? u : appUtil;
    return moduleMethod(funcName, mod, modName, params);
}
export function _dbCmbx(funcName, params = []) {
    return moduleMethod(funcName, u._dbCmbx, 'db-cmbx', params);
}
export function _ui(funcName, params = []) {
    return moduleMethod(funcName, ui, 'ui', params);
}
export function _tutorial(funcName, params = []) {
    return moduleMethod(funcName, tutorial, 'tutorial', params);
}
export function _filter(funcName, params = []) {
    return moduleMethod(funcName, table, 'filter', params);
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
/** ==================== PAGE INIT ========================================== */
/** Initializes the UI unless on mobile device.  */
function initDbPage () {
    if ($(window).width() < 1200 && $('body').data('env') != 'test') { return; } //Popup shown in oi.js
    requireScriptsAndStyles();
    ui.init();
    appUtil._db('initDb');
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
    require('styles/css/search_db.css');
    require('styles/css/moz-styles.css');
    require('styles/pages/db/db.styl');
    require('styles/pages/db/map.styl');
    require('styles/pages/db/forms.styl');
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
export function initSearchStateAndTable(focus = 'taxa', isAllDataAvailable = true) {/*Perm-log*/console.log('   *//initSearchStateAndTable. focus? [%s], allDataAvailable ? [%s]', focus, isAllDataAvailable);
    setTableInitState(focus, isAllDataAvailable);
    ui.selectInitialSearchFocus(focus);
    if ($('body').data('env') === 'test' && isAllDataAvailable === false) { return; }
    table.buildTable();
}
function setTableInitState(focus, isAllDataAvailable) {
    ui.resetFilterPanelOnFocusChange(focus);
    table.resetTableParams(focus, isAllDataAvailable);
}