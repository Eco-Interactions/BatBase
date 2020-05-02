/**
 * Handled initialization of the Database Search Page UI.
 * 
 * Exports:         Imported by:
 *      initUi            ui-main
 */
 import * as _ui from './ui-main.js';
 
/* ============================= DATABASE SEARCH PAGE INIT ========================================================== */
export function initUi() {
    _u.initComboboxes(['Focus', 'View']);
    showPopUpMsg('Loading...');
    authDependentInit();
}
/* --------------------- Auth-Dependent Init -------------------------------- */
function authDependentInit() {
    const initMap = {
        visitor: disableUserFeatures, user: initUserFeatures,
        editor: initEditorFeatures, admin: initEditorFeatures,
        super: initEditorFeatures
    };
    initMap[app.userRole]();
}
function disableUserFeatures() {                                                //console.log('disableUserFeatures')
    $(`button[name="csv"], #list-opts button, #new-data, #rvw-data, #data-help,
        #selSavedFilters, .fltr-desc, #apply-filter, #save-filter, #delete-filter, 
        #stored-filters input, #stored-filters textarea`)
        .css('cursor', 'not-allowed').prop('disabled', true).fadeTo('fast', .5)
        .prop('title', 'Please register to use these features.');
    $('#data-help').fadeTo('fast', .1)
    app.enabledSelectors = false;
}
function initUserFeatures() {                                                   //console.log('enableUserFeatures')
    initUserButtons();
    $('#data-help, #new-data, #rvw-data').css('cursor', 'not-allowed' )
        .prop('title', 'This feature is only available to editors.').fadeTo('fast', .5);
    app.enabledSelectors = `button[name="csv"], #lists`;
}
function initEditorFeatures() {                                                 //console.log('enableEditorFeatures')
    initUserButtons();                                              
    initEditorButtons();
    app.enabledSelectors = '.map-dsbl';
}
function initUserButtons() {
    $('#lists').click(toggleSaveIntsPanel);
    $('button[name="csv"]').click(exportCsvData);  
}
function initEditorButtons() {
    $('#data-help').addClass('adminbttn').click(showEditorHelpModal);
    $('#new-data').addClass('adminbttn').click(initNewDataForm);
    $('#rvw-data').addClass('adminbttn');
}
/* --------------------- Database-Init UI ----------------------------------- */
/** Shows a loading popup message for the inital data-download wait. */
/** While the database is being initialized, the Map Interactions feature is disabled. */
export function updateUiForDatabaseInit(type) {
    app.dbInitializing = true;
    showDataInitLoadingStatus();
    toggleSearchOptions('disable');
    $('#shw-map').data('loaded', false);
}
function showDataInitLoadingStatus() {
    const status = '[ Database initializing... Table will reset once complete, ~45 seconds. ]';
    $('#filter-status').text(status).css('color', 'teal').data('loading', true);
    showPopUpMsg();
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
/* --------------------- Init Table Focus ----------------------------------- */
/** Selects either Taxon, Location or Source in the table-focus dropdown. */
export function selectInitialSearchFocus(f) {                                   //console.log('--------------selectInitialSearchFocus [%s]', f);
    const focus = f || 'taxa';
    _u.replaceSelOpts('#search-focus', getFocusOpts())
    _u.setSelVal('Focus', focus, 'silent');
}
function getFocusOpts() {
    return [
        { value: 'locs', text: 'Location' },
        { value: 'srcs', text: 'Source' },
        { value: 'taxa', text: 'Taxon' },
    ];
}