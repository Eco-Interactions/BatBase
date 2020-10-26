/**
 * The Database Search page entry point. The data table is built to display the
 * eco-interaction records organized by a selected "focus": taxa (grouped further
 * by view: bat, plant, etc), locations, or sources (grouped by either
 * authors, publications, or publishers). The data map displays interactions
 * geographically. Filtered interactions can be viewed in either form.
 *
 * TOC
 *     EXECUTOR
 *         LOCAL DATA
 *         ERROR HANDLING
 *     PAGE INIT
 */
import * as db from './local-data/local-data-main.js';
import * as forms from './forms/forms-main.js';
import * as map from './map/map-main.js';
import * as table from './table/table-main.js';
import * as tutorial from './tutorial/db-tutorial.js';

import * as u from './util/util.js';
import * as alert from '../app/misc/alert-issue.js';

import * as ui from './pg-ui/ui-main.js';
import * as modal from '../misc/intro-modals.js';

/*NOTE: Not sure why this page is getting loaded on external pages. It could be something tangled with webpack.*/
if (window.location.pathname.includes('search')) {
    initDbPage();
}
/** ========================= EXECUTOR ====================================== */
export function executeMethod(funcName, mod, modName, caller, params = []) {
    if (!Array.isArray(params)) { params = [params]; }  //Catches events typically.
    try {
        return mod[funcName](...params);
    } catch(e) {
        alertIssue('facadeErr', {module: modName, caller: caller, called: funcName, error: e.toString(), errMsg: e.message});
        if ($('body').data('env') === 'prod') { return; }
        console.error('[%s][%s] module: [%s] call failed.  params = %O, err = %O', caller, modName, funcName, params, e);
    }
}
function moduleMethod(funcName, mod, modName, params) {
    return executeMethod(funcName, mod, modName, 'db-main', params);
}
export function _u(funcName, params = []) {
    return moduleMethod(funcName, u, 'util', params);
}
export function _ui(funcName, params = []) {
    return moduleMethod(funcName, ui, 'ui', params);
}
export function _modal(funcName, params = []) {
    return moduleMethod(funcName, modal, 'modal', params);
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
/* ------------------- LOCAL DATA ------------------------------------------- */
export function _db(funcName, params = []) {                        /*dbug-log*///console.log('_ui args = %O', arguments);
    return db[funcName](...params);
}
export function resetLocalDb() {
    return db.resetStoredData();
}
/* --------------- ERROR HANDLING ------------------------------------------- */
export function _alert(funcName, params = []) {                     /*dbug-log*///console.log('_ui args = %O', arguments);
    return alert[funcName](...params);
}
/** Handles issues without javascript error/exception objects. */
export function alertIssue() {
    return alert.alertIssue(...arguments);
}
/** Sends Error object to Sentry, issue tracker. */
export function reportErr() {
    return alert.reportErr(...arguments);
}

/** ==================== PAGE INIT ========================================== */
/** Initializes the UI unless on mobile device.  */
function initDbPage () {
    if ($(window).width() < 1200 && $('body').data('env') != 'test') { return; } //Popup shown in oi.js
    requireScriptsAndStyles();
    ui.init();
    db.initDb();
    //The idb-util.initDb will call @initSearchStateAndTable once local database is ready.
}
function requireScriptsAndStyles() {
    requireCss();
    requireJs();
}
/** Loads css files used on the search database page, using Encore webpack. */
function requireCss() {
    require('flatpickr/dist/flatpickr.min.css')
    require('../../styles/css/lib/ag-grid.css');
    require('../../styles/css/lib/theme-fresh.css');
    require('../../styles/css/lib/selectize.default.css');
    require('../../styles/css/search_db.css');
    require('../../styles/css/moz-styles.css');
    require('../../styles/pages/db/db.styl');
    require('../../styles/pages/db/map.styl');
    require('../../styles/pages/db/forms.styl');
}
function requireJs() {
    require('leaflet-control-geocoder');
    require('../libs/selectize.js');
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