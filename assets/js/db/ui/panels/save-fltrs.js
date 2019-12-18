/**
 * Handles the saving, editing, and display of saved sets of filters.
 *
 * Exports:                 Imported By:                  (Added all post initial refactor)
 *     initFilterPanel              panel-util
 *     newFilterSet                 util
 *     resetStoredFiltersUi         db-page
 *     savedFilterSetActive         db-filters
 *     selFilterSet                 util
 *     updateFilterSel              util
 */
import * as _u from '../../util.js';
import * as _uPnl from './panel-util.js';
import * as data_tree from '../../table/format-data/data-tree.js';
import * as db_filters from '../../table/filters/filters-main.js';
import * as frmt_data from '../../table/format-data/aggrid-format.js'; 
import { updateUserNamedList } from '../../local-data/db-sync.js';
import { accessTableState as tState, selectSearchFocus, resetViewDataTable } from '../../db-page.js';
import { resetToggleTreeBttn } from '../../ui/ui-main.js';
import { savedIntListLoaded } from './save-ints.js';
import { exitModal, showHelpModal, showSaveModal } from '../../../misc/intro-core.js';

/**
 * fltr - List open in panel
 *     active - true when loading saved filters
 * tblApi - AgGrid table api
 * tblState - state data for table and search page
 * timeout - present when window is being resized.
 */
let app = {};

export function savedFilterSetActive() {  
    return app.fltr ? (app.fltr.active ? app.fltr.details : false) : false;
}
/* ------------ Init ------------------- */
export function initFilterPanel() {
    addFilterPanelEvents();
    initTimeFilterUi();
    disableFilterSetInputs();
}
function initTimeFilterUi() {
    _u.initCombobox('Time Filter', null, db_filters.selTimeFilter);
    $('#selTimeFilter')[0].selectize.disable();
    db_filters.toggleTimeFilter('disable'); //inits disabled ui
}
export function addFilterPanelEvents() {  
    window.addEventListener('resize', resizeFilterPanelTab);
    $('#filter').click(toggleFilterPanel);                                      
    $('#shw-chngd').change(db_filters.toggleTimeFilter.bind(null, null, null, null));
    $('#delete-filter').click(showCnfrmDeleteBttns);
    $('#apply-filter').click(applyFilterSet);
    $('#confm-set-delete').click(confmDelete);
    $('#cncl-set-delete').click(cancelDelete);
    $('#svd-fltr-hlp').click(showHelpModal.bind(null, 'selSavedFilters'));
    $('#fltr-pnl-hlp').click(showHelpModal.bind(null, 'filter-panel'));
}
/* --- TAB PSEUDO INVISIBLE BOTTOM BORDER -------- */
function resizeFilterPanelTab() {
    if ($('#filter-opts-pnl').hasClass('closed')) { return; }
    if (app.timeout) { return; }
    app.timeout = window.setTimeout(() => {
        sizeFilterPanelTab()
        app.timeout = false;
    }, 500);
}
/**
 * Working around a timeout in panel_util. Utlimately, this should be refactored
 * into the util file, but I'm in a time crunch. 
 */
function sizeFilterPanelTab() {
    window.setTimeout(function() { 
        const split = $('#filter-opts-pnl').hasClass('vert');
        const pseudo = split ? getSplitPseudoBorderStyle() : getPseudoBorderStyle();
        const elemClass = '.hide-fltr-bttm-border' + (split ? '-vert' : '');
        $(elemClass + ':before').remove();
        $(elemClass).append(pseudo);
    }, 555);
}
function getPseudoBorderStyle() {
    const panelT = $('#filter-opts-pnl').position().top;
    const tabW = $('#filter-opts').innerWidth();  
    const tabL = $('#filter-opts').position().left + 1;             /*debg-log*///console.log('sizePanelTab. T = [%s], W = [%s], L = [%s]', panelT, tabW, tabL); console.trace();//1px border
    return `<style>.hide-fltr-bttm-border:before { 
        position: absolute;
        content: '';
        height: 3px;
        z-index: 10;
        width: ${tabW}px;
        top: ${panelT}px;
        left: ${tabL}px;
        background: #f2f9f8;
        }</style>`;  
}
function getSplitPseudoBorderStyle() {
    const panelT = $('#filter-opts-pnl').position().top;
    const tabL = getLeftSplitPos(); 
    const tabW = $('#filter-opts').innerWidth();
    const borderW = Math.abs(tabL - $('#misc-opts').position().left + 1);       /*debg-log*///console.log('sizeSplitPanelTab. T = [%s], W = [%s], L = [%s]', panelT, tabW, tabL); //1px border
    return `<style>.hide-fltr-bttm-border-vert:before { 
        position: absolute;
        content: '';
        height: 5px;
        z-index: 10;
        max-width: 133px;
        width: ${borderW}px;
        top: ${panelT}px;
        left: ${tabL}px;
        background: #f2f9f8;
        }</style>`;  
}
function getLeftSplitPos() {
    const pnlL = $('#filter-opts-pnl').position().left;
    const tabL = $('#filter-opts').position().left + 1;
    return pnlL > (tabL - 2) ? pnlL : tabL;
}
export function resetStoredFiltersUi() {
    if (!$('#selSavedFilters')[0].selectize) { return; }
    $('#selSavedFilters')[0].selectize.clear();
    $('#stored-filters input, #stored-filters textarea').val('');
}
/** Adds the focus to the filter panel header, "[Focus] and Time Filters" */
export function updateFilterPanelHeader(focus) {  
    const map = {
        locs: 'Location', srcs: 'Source', taxa: 'Taxon'
    };
    const hdrPieces = $('#focus-filter-hdr').text().split(' ');  
    hdrPieces.splice(0, 1, map[focus]);  
    $('#focus-filter-hdr').text(hdrPieces.join(' '));   
}
/* --- Toggle Panel Vertically or Horizontally --- */
export function toggleFilterPanelOrientation(style, close) {
    if (style == 'vert') { stackFilterPanel();
    } else { spreadFilterPanel(close); }
    sizeFilterPanelTab(); 
}
function stackFilterPanel() {
    $('#filter-opts-pnl, #filter-col1, #stored-filters').addClass('vert');
    $('#filter-opts').removeClass('hide-fltr-bttm-border').addClass('hide-fltr-bttm-border-vert');
}
function spreadFilterPanel(close) { 
    $('#filter-opts-pnl, #filter-col1, #stored-filters').removeClass('vert');
    $('#filter-opts').removeClass('hide-fltr-bttm-border-vert');
    if (!close) { $('#filter-opts').addClass('hide-fltr-bttm-border'); }
}
/* ====================== SHOW/HIDE LIST PANEL ============================== */
export function toggleFilterPanel() {  
    if ($('#filter-opts-pnl').hasClass('closed')) { 
        buildAndShowFilterPanel(); 
        sizeFilterPanelTab();
    } else { _uPnl.togglePanel('#filter-opts-pnl', 'close'); }
}
/* ============== CREATE/OPEN FILTER SET ==================================== */
function buildAndShowFilterPanel() {                                /*perm-log*/console.log('           --buildAndShowFilterPanel')
    _uPnl.togglePanel('#filter-opts-pnl', 'open');
    _u.getOptsFromStoredData('savedFilterNames').then(updateFilterSel);
}
function updateFilterSel(filterOpts) {                              /*debg-log*///console.log('updateFilterSel. filterNames = %O', filterNames);
    const opts = getSavedFilterOpts(filterOpts);     
    const optGroups = buildOptGroups(opts);                         /*debg-log*///console.log('opts = %O, optGroups = %O', opts, optGroups);
    if ($('#selSavedFilters')[0].selectize) {$('#selSavedFilters')[0].selectize.destroy();}
    _u.initCombobox('Saved Filter Set', getSpecialOpts());

    function getSpecialOpts() { 
        return {
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
/* ------ CREATE FILTER SET ------- */
export function newFilterSet(val) {                                 /*debg-log*///console.log('newFilterSet. val = %s', val);
    enableFilterSetInputs('create');
    updateSubmitButton(createFilterSet, savedIntListLoaded());
    $('#filter-set-name + input').val(val).focus();
    return { value: 'new', text: val ? val : "Creating New Filter Set" };
}
function createFilterSet() {  
    const data = buildFilterData();
    _uPnl.submitUpdates(data, 'create', onFilterSubmitComplete.bind(null, 'create'));
    exitModal();
}
/* ------ OPEN FILTER SET ------- */
export function selFilterSet(val) {                                             
    if (val === 'new') { return; } // New list typed into combobox
    resetFilterUi();
    if (val === 'create') { return newFilterSet(); }                            
    if (!val) { return;  }                                          /*debg-log*///console.log('loading filter set. val = %s', val);
    enableFilterSetInputs();
    updateSubmitButton(editFilterSet, savedIntListLoaded());
    _u.getData('savedFilters').then(filters => fillFilterData(val, filters));
}
function editFilterSet() {  
    const data = buildFilterData();
    data.id = _u.getSelVal('Saved Filter Set');
    _uPnl.submitUpdates(data, 'edit', onFilterSubmitComplete.bind(null, 'edit'));
    exitModal();
}
function fillFilterData(id, filters) {
    const filter = addActiveFilterToMemory(filters[id]);            /*debg-log*///console.log('activeFilter = %O', filter);                                                 
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
        displayName: _u.ucfirst($('#filter-set-name + input').val()),
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
        });                                                                     
        return filters;
    }
}
/* ====================== DELETE FILTER SET ================================= */
function showCnfrmDeleteBttns() {                                   /*debg-log*///console.log('deleteInteractionList')
    $('#delete-filter').hide();
    $('#set-confm-cntnr').show();  
    hideSavedMsg();  
}
function confmDelete() {  
    resetDeleteButton();
    _uPnl.submitUpdates({id: app.fltr.id}, 'remove', onFilterDeleteComplete);
}
function cancelDelete() {
    resetDeleteButton();
}
function resetDeleteButton() {
    $('#set-confm-cntnr').hide();    
    $('#delete-filter').show();
}
/* ================== APPLY FILTER SET TO TABLE DATA ======================== */
function applyFilterSet() {                                                     
    const filters = app.fltr.details;                               /*Perm-log*/console.log('//Applying Filter Set = %O', filters);
    app.fltr.active = true; 
    reloadTableThenApplyFilters(filters, app.fltr.id);
}
function reloadTableThenApplyFilters(filters, id) { 
    _u.setSelVal('Focus', filters.focus, 'silent'); 
    setView(filters);
    selectSearchFocus(filters.focus, filters.view)
    .then(onTableReloadComplete.bind(null, filters, id));     
}
function setView(filters) {
    if (filters.view == tState().get('curView')) { return; }
    const view =  filters.view ? filters.view : 'tree'; //Location filters are only saved in tree view
    _u.setData('curView', view); 
    _u.setSelVal('View', filters.view, 'silent'); 
}
function onTableReloadComplete(filters, id) {                       /*temp-log*/console.log('   --onTableReloadComplete. filters = %O', filters);
    _u.setSelVal('Saved Filter Set', id); 
    setFiltersThatResetTableThenApplyRemaining(filters);
}
function setFiltersThatResetTableThenApplyRemaining(filters) {
    if (!filters.panel.combo) { return applyRemainingFilters(filters); }
    setComboboxFilter(filters.panel.combo)
    .then(applyRemainingFilters.bind(null, filters));
}
function setComboboxFilter(filter) {                                
    const name = Object.keys(filter)[0];                            /*debg-log*/console.log('       --setComboboxFilter. [%s] filter = %O', name, filter);
    return _u.triggerComboChangeReturnPromise(name, filter[name].value);
}
function applyRemainingFilters(filters) {                           /*temp-log*/console.log('       --applyRemainingFilters = %O', filters);
    setNameSearchFilter(filters.panel.name);
    setTimeUpdatedFilter(filters.panel.time);
    applyColumnFilters(filters.table);
    $('#selSavedFilters')[0].selectize.addItem(app.fltr.id);
    delete app.fltr.active; //Next time the status bar updates, the filters have changed outside the set
}
function setNameSearchFilter(text) {                                /*debg-log*///console.log('setNameSearchFilter. text = %s', text);
    if (!text) { return; }
    $('#focus-filters input').val(text);
}
function setTimeUpdatedFilter(time) {                               /*debg-log*///console.log('setTimeUpdatedFilter. time = %s. today = %s', time, new Date().today());
    if (!time) { return; } 
    _u.setSelVal('Time Filter', time.type);
    if (time.date) { db_filters.toggleTimeFilter(true, time.date); }
}
function applyColumnFilters(filters) {                              /*temp-log*///console.log('applyColumnFilters filters = %O, tblState = %O', filters, app.tblState);
    app.tblApi = tState().get('api'); 
    for (let name in filters) {  
        const colName = Object.keys(filters[name])[0];              /*debg-log*///console.log('col = [%s]. Model = %O', colName, filters[name][colName]);
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
function showSaveFilterModal(success) {
    if (!$('.filter-set-details input').val()) { return $('.filter-set-details input').focus(); }
    let readyToSave = true;  
    const modalHtml = buildModalHtml();
    const succFunc = readyToSave ? success : false;
    const bttnText = readyToSave ? 'Submit' : 'Cancel';
    showSaveModal(modalHtml, '#save-filter', 'right', succFunc, Function.prototype, bttnText);
    
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
    _u.sendAjaxQuery(data, envUrl + 'lists/' + action, onFilterSubmitComplete.bind(null, action));
}
function onFilterSubmitComplete(action, results) {
    addActiveFilterToMemory(JSON.parse(results.list.entity));                     /*debg-log*/console.log('onFilterSubmitComplete results = %O, filter = %O', results, app.fltr);
    updateUserNamedList(results.list, action)
    .then(onUpdateSuccessUpdateFilterUi.bind(null, app.fltr.id));
}
function onUpdateSuccessUpdateFilterUi(id) {
    _u.getOptsFromStoredData('savedFilterNames')
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
    db_filters.updateFilterStatusMsg();
    delete app.fltr.active;
}
function dataFiltersSaved(fltr) {
    const panleFilters = Object.keys(fltr.details.panel).length > 0;
    const tableFilters = Object.keys(fltr.details.table).length > 0;
    return panleFilters || tableFilters;
}
function onFilterDeleteComplete(results) {                          /*debg-log*///console.log('listDeleteComplete results = %O', results)
    updateUserNamedList(results.list, 'delete')
    .then(onDeleteSuccessUpdateFilterUi);
}
function onDeleteSuccessUpdateFilterUi() {
    resetFilterUi();
    _u.getOptsFromStoredData('savedFilterNames').then(updateFilterSel);
    $('#selSavedFilters')[0].selectize.open();
}
function showSavedMsg() {
    $('#set-submit-msg').fadeTo('slow', 1);
    window.setTimeout(hideSavedMsg, 3000);
}
function hideSavedMsg() {
    $('#set-submit-msg').fadeTo('slow', 0);
}
/* ------------------------------- UI ----------------------------------------*/
/* ---- Reset & Enable/Disable UI --- */
function resetFilterUi() {
    if (app.filtr && !app.fltr.active) { app.fltr = null; }
    hideSavedMsg();
    clearFilterDetailFields();
    disableFilterSetInputs();
    db_filters.updateFilterStatusMsg();
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
        _uPnl.updateSubmitEvent('#save-filter', showSaveFilterModal.bind(null, func));
    }
}