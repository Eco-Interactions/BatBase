/**
 * Handles the saving, editing, and display of saved sets of filters.
 *
 * Exports:                 Imported By:                  (Added all post initial refactor)
 *     addFilterPanelEvents         panel-util
 *     newFilterSet                     util
 *     selFilterSet                     util
 */
import * as _u from '../util.js';
import * as _uPnl from './panel-util.js';
import * as data_tree from './build-data-tree.js';
import * as db_filters from './db-filters.js';
import * as frmt_data from './format-data.js'; 
import { updateUserNamedList } from '../db-sync.js';
import { accessTableState as tState, resetSearchState } from '../db-page.js';
import { resetToggleTreeBttn } from './db-ui.js';

/**
 * list - List open in panel
 * listLoaded - List loaded in table
 * modMode - Set modificiation state: 'add' or Remove ('rmv')
 * rowSelMode - Modifying 'all' or 'some' rows
 * submitting - True when updates are in submit process
 * tblApi - AgGrid table api
 * tblState - state data for table and search page
] */
let app = {};

export function addFilterPanelEvents() {  
    $('#filter').click(toggleFilterPanel);                                      
    $('#shw-chngd').change(db_filters.toggleTimeUpdatedFilter);
    $('#delete-filter').click(confirmThenDeleteFilterSet.bind(null, app.modMode));
    $('#save-filter').click(submitFilterSet.bind(null, app.modMode));
}

/* ====================== SHOW/HIDE LIST PANEL ============================== */
export function toggleFilterPanel() {  
    if ($('#filter-opts').hasClass('closed')) { buildAndShowFilterPanel(); 
    } else { _uPnl.togglePanel('#filter-opts', 'close'); }
}
/* ============== CREATE/OPEN FILTER SET ==================================== */
function buildAndShowFilterPanel() {                                            //console.log('buildAndShowFilterPanel')
    _uPnl.togglePanel('#filter-opts', 'open');
    initSavedFiltersUi();
}
function initSavedFiltersUi() {
    initSavedFiltersCombobox();
    disableFilterSetInputs();
}
function initSavedFiltersCombobox() {
    _u.initCombobox('Saved Filter Set');
    updateFilterSelOpts();
}
function updateFilterSelOpts() {
    const opts = _u.getOptsFromStoredData('savedFilterNames');                     
    opts.unshift({value: 'create', text: '...New Saved Filter Set'});
    _u.replaceSelOpts('#saved-filters', opts);
}
/* ------ CREATE FILTER SET ------- */
export function newFilterSet(val) {                                             console.log('creating filter set. val = %s', val);                                     
    enableFilterSetInputs();
    $('.filter-set-details input').focus();
    return { value: "new", text: val ? val : "Creating New Filter Set" };
}



/* ------ OPEN FILTER SET ------- */
export function selFilterSet(val) {                                             console.log('loading filter set. val = %s', val);
    if (val === 'create') { return newFilterSet(null); }
    if (!val) { return disableFilterSetInputs(); }
    if (val === 'new') { return; } // New list typed into combobox
    enableFilterSetInputs();
}

/* ====================== EDIT FILTER SET =================================== */
function buildListData() {
    const data = {
        displayName: $('#list-details input').val(),
        type: 'interaction',
        description: $('#list-details textarea').val(),
        details: JSON.stringify(getInteractions()),
    };
    return data;
}
/* ====================== DELETE FILTER SET ================================= */
function confirmThenDeleteFilterSet() {
    // body...
}
/* ================== APPLY FILTER SET TO TABLE DATA ======================== */

/* ====================== UTILITY =========================================== */

/* ---------------- SUBMIT AND SUCCESS METHODS -------------------------------*/
function submitFilterSet(action) {
    const details = getFilterSetJson();
    const envUrl = $('body').data("ajax-target-url");
    _u.sendAjaxQuery(data, envUrl + 'lists/' + action, listSubmitComplete.bind(null, action));
}
function getFilterSetJson() {
    // body...
}
function listSubmitComplete(action, results) {                                      
    const list = JSON.parse(results.list.entity);                               console.log('listSubmitComplete results = %O, list = %O', results, list)
    updateUserNamedList(results.list, action);
    updateDataListSel();
    $('#saved-ints')[0].selectize.addItem(list.id);
    showSavedMsg(results.list.edits);
}
function showSavedMsg(edits) {
    const msg = app.edits || Object.keys(edits).length ? "Changes saved." : "No changes detected";
    $('#int-list-msg')[0].innerHTML = msg;
    $('#int-list-msg').fadeTo('slow', 1);
    delete app.edits;
}
function hideSavedMsg() {
    $('#int-list-msg').fadeTo('slow', 0);
    $('#int-list-msg')[0].innerHTML = '';
}
/* ------------------------------- UI ----------------------------------------*/

/* ---- Reset & Enable/Disable UI --- */
function disableFilterSetInputs() {
    $('.filter-set-details input, .filter-set-details textarea').val('');
    $(`.filter-set-details input, .filter-set-details span, .filter-submit button, 
        .filter-set-details textarea, #stored-filters button`)
        .attr('disabled', true).css('opacity', '.5');
}
function enableFilterSetInputs() {
    $(`.filter-set-details input, .filter-set-details span, .filter-submit button, 
        .filter-set-details textarea, #stored-filters button`)
        .attr('disabled', false).css('opacity', '1');
}
/* --- Table Methods --- */