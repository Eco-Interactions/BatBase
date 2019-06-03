/**
 * Handles the saving, editing, and display of saved sets of filters.
 *
 * Exports:                 Imported By:                  (Added all post initial refactor)
 *     addFilterPanelEvents         panel-util
 *     newFilterSet                 util
 *     resetStoredFiltersUi         db-page
 *     savedFilterSetActive         db-filters
 *     selFilterSet                 util
 *     
 */
import * as _u from '../util.js';
import * as _uPnl from './panel-util.js';
import * as data_tree from './build-data-tree.js';
import * as db_filters from './db-filters.js';
import * as frmt_data from './format-data.js'; 
import { updateUserNamedList } from '../db-sync.js';
import { accessTableState as tState, resetSearchState, selectSearchFocus, resetDataTable } from '../db-page.js';
import { resetToggleTreeBttn } from './db-ui.js';
import { savedIntListLoaded } from './save-ints.js';

/**
 * fltr - List open in panel
 *     active - true when loading saved filters
 * tblApi - AgGrid table api
 * tblState - state data for table and search page
] */
let app = {};

export function savedFilterSetActive() {  
    return app.fltr ? app.fltr.active : false;
}

export function addFilterPanelEvents() {  
    $('#filter').click(toggleFilterPanel);                                      
    $('#shw-chngd').change(db_filters.toggleTimeUpdatedFilter);
    $('#delete-filter').click(deleteFilterSet);
    $('#apply-filter').click(applyFilterSet);
    $('#confm-set-delete').click(confmDelete);
    $('#cncl-set-delete').click(cancelDelete);
}
export function resetStoredFiltersUi() {
    if (!$('#saved-filters')[0].selectize) { return; }
    $('#saved-filters')[0].selectize.clear();
    $('#stored-filters input, #stored-filters textarea').val('');
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
    updateFilterSel();
}
function updateFilterSel() {
    const opts = _u.getOptsFromStoredData('savedFilterNames');     
    opts.unshift({text: '... New Filter Set', value: 'create', group: 'Create'});              //console.log('groups =%O', groups);
    const optGroups = buildOptGroups(opts);                                      //console.log('optGroups = %O', optGroups);
    if ($('#saved-filters')[0].selectize) {$('#saved-filters')[0].selectize.destroy();}
    _u.initCombobox('Saved Filter Set', getSpecialOpts());

    function getSpecialOpts() { 
        return {
            options: opts,
            optgroups: optGroups, 
            optgroupField: 'group',
            labelField: 'text',
            searchField: ['text'],
            sortField: 'group',
            render: {
                optgroup_header: function(data, escape) {  
                    return '<div class="optgroup-header">' + escape(data.text) + '</div>';
                }
            }
        };
    }         
}
function buildOptGroups(opts) {
    let groups = Array.from(new Set(opts.map(opt => opt.group)));       
    groups = groups.map(g => { return {text: g, value: g }}); 
    return groups;
}
/* ------ CREATE FILTER SET ------- */
export function newFilterSet(val) {                                             console.log('creating filter set. val = %s', val);                                     
    enableFilterSetInputs('create');
    updateSubmitButton(createFilterSet, savedIntListLoaded());
    $('#filter-set-name + input').val(val).focus();
    return { value: 'new', text: val ? val : "Creating New Filter Set" };
}
function createFilterSet() {
    const data = buildFilterData();
    _uPnl.submitUpdates(data, 'create', onFilterSubmitComplete.bind(null, 'create'));
}
/* ------ OPEN FILTER SET ------- */
export function selFilterSet(val) {                                             
    if (val === 'new') { return; } // New list typed into combobox
    if (val === 'create') { return newFilterSet(); }                            console.log('loading filter set. val = %s', val);
    if (!val) { return resetFilterUi(); }
    enableFilterSetInputs();
    updateSubmitButton(editFilterSet, savedIntListLoaded());
    fillFilterData(val);
}
function editFilterSet() {
    const data = buildFilterData();
    data.id = _u.getSelVal('Saved Filter Set');
    _uPnl.submitUpdates(data, 'edit', onFilterSubmitComplete.bind(null, 'edit'));
}
function fillFilterData(id) {
    const filters = _u.getDataFromStorage('savedFilters');                           
    const filter = addActiveFilterToMemory(filters[id]);                        console.log('activeFilter = %O', filter);                                                 
    fillFilterDetailFields(filter.displayName, filter.description);
}
function fillFilterDetailFields(name, description) {
    $('#filter-set-name + input').val(name).focus();
    $('.filter-set-details textarea').val(description);
}
/* =================== BUILD FILTER DATA JSON =============================== */
function buildFilterData() {
    app.tblState = tState().get(null, ['curFocus', 'curView', 'api']);
    const data = {
        displayName: $('#filter-set-name + input').val(),
        type: 'filter',
        description: $('#stored-filters textarea').val(),
        details: getFilterSetJson(app.tblState),
    };
    return data;
}
/**
 * Returns a json object with the current focus, view, and active filters in the
 * filter panel and the table column headers.
 */
function getFilterSetJson(tState) {                                             //console.log('tblState = %O', tState)
    const fState = db_filters.getFilterState();
    const filters = {
        focus: tState.curFocus, panel: fState.panel,
        table: getColumnHeaderFilters(fState.table), view: tState.curView
    };
    return JSON.stringify(filters);
}
/** Returns an obj with the ag-grid filter models. */
function getColumnHeaderFilters(models) {
    const colTitles = Object.keys(models);
    return getActiveTableFilters();
    
    function getActiveTableFilters() {
        const filters = {};
        colTitles.forEach(col => { 
            if (!models[col]) { return; }  
            filters[col] = models[col];
        });                                                                     //console.log('tableFilters = %O', filters);
        return filters;
    }
}
/* ====================== DELETE FILTER SET ================================= */
function deleteFilterSet() {                                              //console.log('deleteInteractionList')
    $('#delete-filter').hide();
    $('#set-confm-cntnr').show();  
    hideSavedMsg();  
}
function confmDelete() {  
    resetDeleteButton();
    _uPnl.submitUpdates({id: app.fltr.id}, 'delete', onFilterDeleteComplete);
}
function cancelDelete() {
    resetDeleteButton();
}
function resetDeleteButton() {
    $('#set-confm-cntnr').hide();    
    $('#delete-filter').show();
}
/* ================== APPLY FILTER SET TO TABLE DATA ======================== */
function applyFilterSet() {                                                     console.log('Applying Filter Set')
    const filters = app.fltr.details; 
    app.fltr.active = true;
    reloadTableInFilterFocus(filters.view, filters.focus);
    applyPanelFilters(filters.panel);
    applyTableFilters(filters.table);
    delete app.fltr.active; //Next time the status bar updates, the filters have changed outside the set
}
/* --- reloadTableInFilterFocus --- */
function reloadTableInFilterFocus(view, focus) {   
    updateTableView(view);    
    reloadTable(focus, app.fltr.id);
}
function reloadTable(focus, fltrId) { 
    if (focus == tState().get('curFocus')) { 
        resetDataTable();
        _u.setSelVal('Saved Filter Set', fltrId); 
    } else { $('#search-focus')[0].selectize.addItem(focus); }                        
}
/* End reloadTableInFilterFocus */
function updateTableView(view) {                                                //console.log('updateTableView')
    view =  view ? view : 'tree'; //Location filters are only saved in tree view
    _u.addToStorage('curView', JSON.stringify(view)); 
}
function applyPanelFilters(fs) {                                                //console.log('applyPanelFilters = %O', fs)
    const map = {
        combo: setComboboxFilter, name: setNameSearchFilter,
        time: setTimeUpdatedFilter
    };
    Object.keys(map).forEach(type => fs[type] ? map[type](fs[type]) : null);    //Calls filters in an order that ensures optimized application, eg, less redundant processes
}
function setComboboxFilter(fObj) {                                              //console.log('setComboboxFilter. fObj = %O', fObj);
    const name = Object.keys(fObj)[0];
    $(`#sel${name}`)[0].selectize.addItem(fObj[name].value);
}
function setNameSearchFilter(text) {                                            //console.log('setNameSearchFilter. text = %s', text);
    $('#focus-filters input').val(text);
}
function setTimeUpdatedFilter(time) {                                           //console.log('setTimeUpdatedFilter. time = %s. today = %s', time, new Date().today());
    db_filters.toggleTimeUpdatedFilter(true, time);
}
function applyTableFilters(filters) {                                           //console.log('tblState = %O', app.tblState)                                        //console.log('applyTableFilters = %O', filters);
    app.tblApi = tState().get('api'); 
    for (let name in filters) {  
        const colName = Object.keys(filters[name])[0];                          console.log('col = [%s]. Model = %O', colName, filters[name][colName]);
        app.tblApi.getFilterApi(colName).setModel(filters[name][colName]);
    }
    delete app.tblApi;
}
/* ====================== UTILITY =========================================== */
function addActiveFilterToMemory(set) {
    const status = app.fltr ? app.fltr.active : false;
    app.fltr = _uPnl.parseUserNamed(set);
    app.fltr.active = status;
    return app.fltr;
}
/* ---------------- SUBMIT AND SUCCESS METHODS -------------------------------*/
function submitFilterSet(data, action, successFunc) {
    const envUrl = $('body').data("ajax-target-url");
    _u.sendAjaxQuery(data, envUrl + 'lists/' + action, onFilterSubmitComplete.bind(null, action));
}
function onFilterSubmitComplete(action, results) {          
    const filter = JSON.parse(results.list.entity);                             console.log('onFilterSubmitComplete results = %O, filter = %O', results, filter);
    updateUserNamedList(results.list, action);
    updateFilterSel();
    $('#saved-filters')[0].selectize.addItem(filter.id);
    addSetToFilterStatus();
    showSavedMsg();
}
function addSetToFilterStatus() {
    if (!dataFiltersSaved(app.fltr)) { return; }
    app.fltr.active = true;
    db_filters.updateFilterStatusMsg();
    delete app.fltr.active;
}
function dataFiltersSaved(fltr) {
    const panleFilters = Object.keys(fltr.details.panel).length > 0;
    const tableFilters = Object.keys(fltr.details.table).length > 0;
    return panleFilters || tableFilters;
}
function onFilterDeleteComplete(results) {                                      console.log('listDeleteComplete results = %O', results)
    updateUserNamedList(results.list, 'delete');
    updateFilterSel();
    $('#stored-filters input, #stored-filters textarea').val('');
    $('#saved-filters')[0].selectize.open();
}
function showSavedMsg() {
    $('#set-submit-msg').fadeTo('slow', 1);
    window.setTimeout(hideSavedMsg, 2500);
}
function hideSavedMsg() {
    $('#set-submit-msg').fadeTo('slow', 0);
}
/* ------------------------------- UI ----------------------------------------*/
/* ---- Reset & Enable/Disable UI --- */
function resetFilterUi() {
    hideSavedMsg();
    clearFilterDetailFields();
    disableFilterSetInputs();
}
function clearFilterDetailFields() {
    $('#filter-set-name + input').val('');
    $('.filter-set-details textarea').val('');
}
function disableFilterSetInputs() {
    $('.filter-set-details input, .filter-set-details textarea').val('');
    $(`.filter-set-details input, .filter-set-details span, #delete-filter, 
        .filter-set-details textarea, #save-filter, #apply-filter`)
        .attr('disabled', true).css('opacity', '.5');
    $('#save-filter').html('Save Filter'); 
}
function enableFilterSetInputs(create) {
    $(`.filter-set-details input, .filter-set-details span, #save-filter, 
        .filter-set-details textarea`).attr('disabled', false).css('opacity', '1');
    if (!create) { 
        $('#delete-filter').attr('disabled', false).css('opacity', '1'); 
        $('#save-filter').html('Update Filter'); 
        $('#apply-filter').attr('disabled', false).css('opacity', '1'); 
    } else {
        $('#save-filter').html('Save Filter'); 
    }
}
function updateSubmitButton(func, listLoaded) {
    if (listLoaded) {
    $(`#save-filter`).css('opacity', '.5')
        .attr({'disabled': true, 'title': 'Set can not be changed while interaction list loaded.'});

    } else {
        _uPnl.updateSubmitEvent('#save-filter', func);
    }
}













