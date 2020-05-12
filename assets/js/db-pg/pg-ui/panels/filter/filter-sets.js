/*
 * Handles the right section of the filter panel, saved filter set managment. 
 * 
 * Exports:
 *      disableFilterSetInputs
 *      reloadTableThenApplyFilters
 *      isFilterSetActive
 *      selFilterSet
 *      newFilterSet
 *      updateFilterSetSel
 *      
 * TOC:
 *      INIT UI
 *      CREATE
 *      SELECT/EDIT
 *          BUILD FILTER SET JSON DATA
 *      DELETE
 *      APPLY FILTER SET
 *      UTILITY
 *          SUBMIT & SUCCESS METHODS
 *          RESET & ENABLE/DISABLE UI
 */
import * as pM from '../panels-main.js';
import { _filter, _modal, _ui, _u } from '../../../db-main.js';
/* Holds selected filter data and table state. */
let app = {};

export function isFilterSetActive() {  
    return app.fltr ? (app.fltr.active ? app.fltr.details : false) : false;
}
/* ============================= INIT UI ==================================== */
export function setFilterSetEventListeners() {    
    $('#delete-filter').click(showCnfrmDeleteBttns);
    $('#apply-filter').click(applyFilterSet);
    $('#confm-set-delete').click(confmDelete);
    $('#cncl-set-delete').click(cancelDelete);
}
export function updateFilterSetSel(filterOpts) {                              /*debg-log*///console.log('updateFilterSel. filterNames = %O', filterNames);
    const opts = getSavedFilterOpts(filterOpts);     
    const optGroups = buildOptGroups(opts);                         /*debg-log*///console.log('opts = %O, optGroups = %O', opts, optGroups);
    if ($('#selSavedFilters')[0].selectize) {$('#selSavedFilters')[0].selectize.destroy();}
    _u('initCombobox', ['Saved Filter Set', selFilterSet, getSpecialOpts()]);

    function getSpecialOpts() { 
        return {
            create: newFilterSet,
            options: opts,
            optgroups: optGroups, 
            optgroupField: 'group',
            labelField: 'text',
            searchField: ['text'],
            sortField: [
                { field: 'group',
                  direction: 'asc'},
                { field: 'text',
                  direction: 'asc'},
                { field: '$score'}],
            render: {
                optgroup_header: function(data, escape) {  
                    return '<div class="optgroup-header">' + escape(data.text) + '</div>';
                }
            }
        };
    }         
}
function getSavedFilterOpts(opts) {  
    opts.unshift({text: '... New Filter Set', value: 'create', group: 'Create'}); 
    return opts;
}
function buildOptGroups(opts) {
    let groups = Array.from(new Set(opts.map(opt => opt.group)));       
    groups = groups.map(g => { return {text: g, value: g }}); 
    return groups;
}
/* ============================== CREATE ==================================== */
export function newFilterSet(val) {                                 /*debg-log*///console.log('newFilterSet. val = %s', val);
    enableFilterSetInputs('create');
    updateSubmitButton(createFilterSet, pM.isSavedIntListLoaded());
    $('#filter-set-name + input').val(val).focus();
    return { value: 'new', text: val ? val : "Creating New Filter Set" };
}
function createFilterSet() {  
    const data = buildFilterData();
    pM.submitUpdates(data, 'create', onFilterSubmitComplete.bind(null, 'create'));
    _modal('exitModal');
}
/* ========================= SELECT/EDIT ==================================== */
export function selFilterSet(val) {                                             
    if (val === 'new') { return; } // New list typed into combobox
    resetFilterUi();
    if (val === 'create') { return newFilterSet(); }                            
    if (!val) { return;  }                                          /*debg-log*///console.log('loading filter set. val = %s', val);
    enableFilterSetInputs();
    updateSubmitButton(editFilterSet, pM.isSavedIntListLoaded());
    _u('getData', ['savedFilters']).then(filters => fillFilterData(val, filters));
}
function editFilterSet() {  
    const data = buildFilterData();
    data.id = _u('getSelVal', ['Saved Filter Set']);
    pM.submitUpdates(data, 'edit', onFilterSubmitComplete.bind(null, 'edit'));
    _modal('exitModal');
}
function fillFilterData(id, filters) {
    const filter = addActiveFilterToMemory(filters[id]);            /*debg-log*///console.log('activeFilter = %O', filter);                                                 
    fillFilterDetailFields(filter.displayName, filter.description);
}
function fillFilterDetailFields(name, description) {
    $('#filter-set-name + input').val(name).focus();
    $('.filter-set-details textarea').val(description);
}
/* ----------------- BUILD FILTER SET JSON DATA ----------------------------- */
function buildFilterData() {
    app.tblState = tState().get(null, ['curFocus', 'curView', 'api']);
    const data = {
        displayName: _u('ucfirst', [$('#filter-set-name + input').val()]),
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
function getFilterSetJson(tState) {                                             
    const fState = _filter.getFilterState();
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
        });                                                                     
        return filters;
    }
}
/* ============================== DELETE ==================================== */
function showCnfrmDeleteBttns() {                                   /*debg-log*///console.log('deleteInteractionList')
    $('#delete-filter').hide();
    $('#set-confm-cntnr').show();  
    hideSavedMsg();  
}
function confmDelete() {  
    resetDeleteButton();
    pM.submitUpdates({id: app.fltr.id}, 'remove', onFilterDeleteComplete);
}
function cancelDelete() {
    resetDeleteButton();
}
function resetDeleteButton() {
    $('#set-confm-cntnr').hide();    
    $('#delete-filter').show();
}
/* ================== APPLY FILTER SET ====================================== */
function applyFilterSet() {                                                     
    const filters = app.fltr.details;                               /*Perm-log*/console.log('//Applying Filter Set = %O', filters);
    app.fltr.active = true; 
    reloadTableThenApplyFilters(filters, app.fltr.id);
}
export function reloadTableThenApplyFilters(filters, id) { 
    if (id) { setSavedFilterFocusAndView(filters); } //If no id, reapplying filters after form closed.
    buildTable(filters.focus, filters.view)
    .then(onTableReloadComplete.bind(null, filters, id));     
}
function setSavedFilterFocusAndView(filters) { 
    _u('setSelVal', ['Focus', filters.focus, 'silent']); 
    setView(filters);
}
function setView(filters) {
    if (filters.view == tState().get('curView')) { return; }
    const view =  filters.view ? filters.view : 'tree'; //Location filters are only saved in tree view
    _u('setData', ['curView', view]); 
    _u('setSelVal', ['View', filters.view, 'silent']); 
}
function onTableReloadComplete(filters, id) {                       /*debg-log*///console.log('   --onTableReloadComplete. filters = %O', filters);
    if (id) { _u('setSelVal', ['Saved Filter Set', id]);  }  //If no id, reapplying filters after form closed.
    setFiltersThatResetTableThenApplyRemaining(filters);
}
function setFiltersThatResetTableThenApplyRemaining(filters) {
    if (!filters.panel.combo) { return applyRemainingFilters(filters); }
    setComboboxFilter(filters.panel.combo)
    .then(applyRemainingFilters.bind(null, filters));
}
function setComboboxFilter(filter) {                                
    const name = Object.keys(filter)[0];                            /*debg-log*///console.log('       --setComboboxFilter. [%s] filter = %O', name, filter);
    return _u('triggerComboChangeReturnPromise', [name, filter[name].value]);
}
function applyRemainingFilters(filters) {                           /*debg-log*///console.log('       --applyRemainingFilters = %O', filters);
    setNameSearchFilter(filters.panel.name);
    setTimeUpdatedFilter(filters.panel.time);
    applyColumnFilters(filters.table);
    if (!app.fltr) { return; } //reapplying filters after form closed.
    $('#selSavedFilters')[0].selectize.addItem(app.fltr.id);
    delete app.fltr.active; //Next time the status bar updates, the filters have changed outside the set
}
function setNameSearchFilter(text) {                                /*debg-log*///console.log('setNameSearchFilter. text = [%s]', text);
    if (!text) { return; }
    text = text.replace(/['"]+/g, '');
    $('#focus-filters input[type="text"]').val(text).change();
}
function setTimeUpdatedFilter(time) {                               /*debg-log*///console.log('setTimeUpdatedFilter. time = %s. today = %s', time, new Date().today());
    if (!time) { return; } 
    _u('setSelVal', ['Date Filter', time.type]);
    if (time.date) { _filter.toggleDateFilter(true, time.date); }
}
function applyColumnFilters(filters) {                              /*debg-log*///console.log('applyColumnFilters filters = %O, tblState = %O', filters, app.tblState);
    app.tblApi = tState().get('api'); 
    for (let name in filters) {
        if (filters[name] === null) { continue; }  
        const colName = Object.keys(filters[name])[0];              /*debg-log*///console.log('col = [%s]. Model = %O', colName, filters[name][colName]);
        app.tblApi.getFilterApi(colName).setModel(filters[name][colName]);
    }
    delete app.tblApi;
}
/* ====================== UTILITY =========================================== */
function addActiveFilterToMemory(set) {
    const status = app.fltr ? app.fltr.active : false;
    app.fltr = pM.parseUserNamed(set);
    app.fltr.active = status;
    return app.fltr;
}
/* ---------------- SUBMIT AND SUCCESS METHODS -------------------------------*/
function showSaveFilterModal(success) {
    if (!$('.filter-set-details input').val()) { return $('.filter-set-details input').focus(); }
    let saveReady = true;  
    const confg = {
        html: buildModalHtml(), elem: '#save-filter', dir: 'right', 
        submit: saveReady ? success : false, bttn: saveReady ? 'Submit' : 'Cancel'
    };
    _modal('showSaveModal', [confg]);
    
    function buildModalHtml() {
        const hdr = '<h2> Saving Filter Set: </h2>';
        const fltrs = getActiveFilters($('#filter-status').html());
        if (fltrs.includes('No Active')) { readyToSave = false; }
        return hdr + '<br>' + fltrs;
    }
}
function getActiveFilters(statusMsg) {
    const pieces = statusMsg.split(')');
    if (pieces.length > 1) { pieces.shift(); }
    return pieces.join('');
}
function submitFilterSet(data, action, successFunc) {
    const envUrl = $('body').data("ajax-target-url");
    _u('sendAjaxQuery', [data, envUrl + 'lists/' + action, onFilterSubmitComplete.bind(null, action)]);
}
function onFilterSubmitComplete(action, results) {
    addActiveFilterToMemory(JSON.parse(results.list.entity));                     /*debg-log*/console.log('onFilterSubmitComplete results = %O, filter = %O', results, app.fltr);
    pM.updateUserNamedList(results.list, action)
    .then(onUpdateSuccessUpdateFilterUi.bind(null, app.fltr.id));
}
function onUpdateSuccessUpdateFilterUi(id) {
    _u('getOptsFromStoredData', ['savedFilterNames'])
    .then(updateFilterSel)
    .then(() => {
        $('#selSavedFilters')[0].selectize.addItem(id);
        addSetToFilterStatus();
        showSavedMsg();
    });
}
function addSetToFilterStatus() {
    if (!dataFiltersSaved(app.fltr)) { return; }
    app.fltr.active = true;
    _ui('updateFilterStatusMsg');
    delete app.fltr.active;
}
function dataFiltersSaved(fltr) {
    const panleFilters = Object.keys(fltr.details.panel).length > 0;
    const tableFilters = Object.keys(fltr.details.table).length > 0;
    return panleFilters || tableFilters;
}
function onFilterDeleteComplete(results) {                          /*debg-log*///console.log('listDeleteComplete results = %O', results)
    pM.updateUserNamedList(results.list, 'delete')
    .then(onDeleteSuccessUpdateFilterUi);
}
function onDeleteSuccessUpdateFilterUi() {
    resetFilterUi();
    _u('getOptsFromStoredData', ['savedFilterNames']).then(updateFilterSel);
    $('#selSavedFilters')[0].selectize.open();
}
function showSavedMsg() {
    $('#set-submit-msg').fadeTo('slow', 1);
    window.setTimeout(hideSavedMsg, 3000);
}
function hideSavedMsg() {
    $('#set-submit-msg').fadeTo('slow', 0);
}
/* ------------------- RESET & ENABLE/DISABLE UI -----------------------------*/
function resetFilterUi() {
    if (app.filtr && !app.fltr.active) { app.fltr = null; }
    hideSavedMsg();
    clearFilterDetailFields();
    disableFilterSetInputs();
    _ui('updateFilterStatusMsg');
}
function clearFilterDetailFields() {
    $('#filter-set-name + input').val('');
    $('.filter-set-details textarea').val('');
}
export function disableFilterSetInputs() {
    $('.filter-set-details input, .filter-set-details textarea').val('');
    $(`.filter-set-details input, .filter-set-details span, #delete-filter, 
        .filter-set-details textarea, #save-filter, #apply-filter`)
        .attr('disabled', true).css('opacity', '.5');
    $('#save-filter').html('Save'); 
}
function enableFilterSetInputs(create) {
    $(`.filter-set-details input, .filter-set-details span, #save-filter, 
        .filter-set-details textarea`).attr('disabled', false).css('opacity', '1');
    if (!create) { 
        $('#delete-filter').attr('disabled', false).css('opacity', '1'); 
        $('#save-filter').html('Update'); 
        $('#apply-filter').attr('disabled', false).css('opacity', '1'); 
    } else {
        $('#save-filter').html('Save'); 
    }
}
function updateSubmitButton(func, listLoaded) {
    if (listLoaded) {
        $(`#save-filter`).css('opacity', '.5')
            .attr({'disabled': true, 'title': 'Set can not be changed while interaction list loaded.'});
    } else {
        pM.updateSubmitEvent('#save-filter', showSaveFilterModal.bind(null, func));
    }
}