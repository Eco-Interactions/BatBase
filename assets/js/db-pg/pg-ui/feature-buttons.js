/**
 * Handles en/disabling the various database features based on user role and the
 * state of the table or available data.
 *  
 * The database-options bar: Tutorial & Tips | Custom Data Lists | Table-Data 
 *    Focus/Grouping & View | Filters | Map & CSV | Data-Entry (New, Review, Help) 
 * The table-status bar: Table Row Toggles | Table-Data Status (total shown, 
 *    active filters, filter set/data list) | Table Column Toggle (future feature)
 * 
 * EXPORTS:
 *   disableTableButtons
 *   enableTableButtons
 *   initFeatureButtons
 *   updateUiForDatabaseInit
 *   
 * TOC:
 *   AUTH-DEPENDENT FEATURES
 *   DATABASE INIT UI
 *   TOGGLE TABLE BUTTONS
 */
import { openDataEntryForm } from '../db-main.js';
import { enableClearFiltersButton, enableListResetBttn, showPopupMsg } from './ui-main.js';
import exportCsvData from '../table/export/csv-export.js';
import showEditorHelpModal from './editor-help-modal.js';
import showTips from './tips-popup.js';
import { showTableRecordsOnMap } from './ui-map-state.js';


/* userRole, enabledSelectors, dbInitializing */
const app = {};
/* ================= AUTH-DEPENDENT FEATURES ================================ */
export function initFeatureButtons(userRole) {
    initBaseFeatures();
    authDependentInit(userRole);
}
function initBaseFeatures() {
    $('#shw-map').click(showTableRecordsOnMap);
    $("#show-tips").click(showTips);
}
export function showTipsPopup() {
    showTips();
}
/* Inits the UI for features based on current user role. */
export function authDependentInit(userRole) {
    app.userRole = userRole;
    const initFetaures = {
        visitor: disableUserFeatures, user: initUserFeatures,
        editor: initEditorFeatures, admin: initEditorFeatures,
        super: initEditorFeatures
    };
    app.enabledSelectors = initFetaures[userRole]();
}
function disableUserFeatures() {                                                //console.log('disableUserFeatures')
    $(`button[name="csv"], #list-opts button, #new-data, #rvw-data, #data-help,
        #selSavedFilters, .fltr-desc, #apply-filter, #save-filter, #delete-filter, 
        #stored-filters input, #stored-filters textarea`)
        .css('cursor', 'not-allowed').prop('disabled', true).fadeTo('fast', .5)
        .prop('title', 'Please register to use these features.');
    $('#data-help').fadeTo('fast', .1)
    return false;
}
function initUserFeatures() {                                                   //console.log('enableUserFeatures')
    initUserButtons();
    $('#data-help, #new-data, #rvw-data').css('cursor', 'not-allowed' )
        .prop('title', 'This feature is only available to editors.').fadeTo('fast', .5);
    return `button[name="csv"], #lists`; //list button init handled in list-panel js
}
function initEditorFeatures() {                                                 //console.log('enableEditorFeatures')
    initUserButtons();                                              
    initEditorButtons();
    return '.map-dsbl';
}
function initUserButtons() {
}
function initEditorButtons() {
    $('#data-help').addClass('adminbttn').click(showEditorHelpModal);
    $('#new-data').addClass('adminbttn').click(openDataEntryForm);
    $('#rvw-data').addClass('adminbttn');
}
/* ===================== DATABASE INIT UI =================================== */
/** While the database is being initialized, all options are disabled. */
export function updateUiForDatabaseInit() {
    app.dbInitializing = true;
    showDataInitLoadingStatus();
    toggleSearchOptions('disable');
    $('#shw-map').data('loaded', false);
}
function showDataInitLoadingStatus() {
    const status = '[ Database initializing... Table will reset once complete, ~45 seconds. ]';
    $('#filter-status').text(status).css('color', 'teal').data('loading', true);
    showPopupMsg();
}
function toggleSearchOptions(toggleKey) {
    handleButtons(toggleKey);
    $('#search-focus')[0].selectize[toggleKey](); 
}
function handleButtons(toggleKey) {
    const opac = toggleKey === 'enable' ? 1 : .5;
    const disabled = toggleKey === 'disable';
    const cursor = toggleKey === 'enable' ? 'pointer' : 'wait';
    $('.ico-bttn').css('cursor', cursor).prop('disabled', disabled).fadeTo('fast', opac);
    toggleMapButton(toggleKey, disabled);
}
function toggleMapButton(toggleKey, disabled) {
    if (toggleKey === 'enable' && !$('#shw-map').data('loaded')) { 
        $('#shw-map').prop('disabled', disabled).fadeTo('fast', .5); 
    }
}
/** 
 * Once db init complete, the page features are enabled after a delay so the table  
 * finishes reloading before the feature buttons fades in.
 */
function updateUiAfterDatabaseInit() {
    toggleSearchOptions('enable');
    $('#filter-status').css('color', 'black').data('loading', false);
    if (app.userRole === 'visitor') { disableUserFeatures(); }
    delete app.dbInitializing;
}
/* ================= TOGGLE TABLE BUTTONS  ================================== */
export function enableTableButtons(allDataAvailable) {                          //console.log('enableTableButtons. enabled elems = %s', app.enabledSelectors);
    if (app.dbInitializing && allDataAvailable || testingDbInit()) { updateUiAfterDatabaseInit() }
    if (app.dbInitializing === true) { return enableToggleTreeButtons(); }
    $(getAllSelectors('.tbl-tools button, .tbl-tools input, #focus-opts, #help-opts button'))
        .attr('disabled', false).css('cursor', 'pointer');
    $('button[name="show-hide-col"]').css('cursor', 'not-allowed');
    $(getAllSelectors('.tbl-tools, #help-opts button')).fadeTo('slow', 1);
    enableListResetBttn();
    enableClearFiltersButton();
}
function testingDbInit() {
    return app.dbInitializing && $('body').data('env') === 'test';
}
function enableToggleTreeButtons() {
    $('#xpand-tree, #xpand-tree button').attr('disabled', false).css('cursor', 'pointer')
        .fadeTo('slow', 1);
    app.dbInitializing = 'complete';
}
function getAllSelectors(selectors) {
    return app.enabledSelectors ? selectors += ', '+ app.enabledSelectors : selectors;
}
export function disableTableButtons() {
    $('.tbl-tools, .map-dsbl, #help-opts button').fadeTo('slow', .3); 
    $(`.tbl-tools button, .tbl-tools input, .map-dsbl, #help-opts button`)
        .attr('disabled', 'disabled').css('cursor', 'default');
}