/*
 * Handles the right section of the filter panel, saved filter set managment.
 *
 * Export
 *      onTableReloadCompleteApplyFilters
 *      isFilterSetActive
 *      initFilterSetsFeature
 *      selectFilterSet
 *      createNewFilterSet
 *      updateFilterSetSel
 *
 * TOC
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
import { _cmbx, _db, _modal, _u } from '~util';
import { _filter, _table, _ui } from '~db';
/* Holds selected filter data and table state. */
let app = {};
const tState = _table.bind(null, 'tableState');

/* ============================= INIT UI ==================================== */
export function initFilterSetsFeature() {
    setFilterSetEventListeners();
    _cmbx('getOptsFromStoredData', ['savedFilterNames']).then(updateFilterSetSel);
    disableFilterSetInputs();
}
function setFilterSetEventListeners() {
    $('#delete-filter').click(showCnfrmDeleteBttns);
    $('#apply-filter').click(applyFilterSet);
    $('#confm-set-delete').click(confmDelete);
    $('#cncl-set-delete').click(cancelDelete);
}
function updateFilterSetSel(opts) {                                 /*dbug-log*///console.log('updateFilterSetSel. opts = %O', opts);
    addCreateOpt(opts);
    _cmbx('destroySelectizeInstance', ['FilterSet']);
    _cmbx('initCombobox', [buildSavedFiltersComboConfg(opts)]);
}
function addCreateOpt(opts) {
    opts.unshift({text: '... New Filter Set', value: 'create', group: 'Create'});
}
function buildSavedFiltersComboConfg(opts) {
    return {
        name: 'Filter Set',
        create: createNewFilterSet,
        onChange: selectFilterSet,
        options: opts,
        optgroups: buildOptGroups(opts),
        optgroupField: 'group',
        labelField: 'text',
        searchField: ['text'],
        sortField: [
            { field: 'group', direction: 'asc'},
            { field: 'text', direction: 'asc'},
            { field: '$score'}],
        render: {
            optgroup_header: function(data, escape) {
                return '<div class="optgroup-header">' + escape(data.text) + '</div>';
            }
        }
    };
}
function buildOptGroups(opts) {
    const groups = Array.from(new Set(opts.map(opt => opt.group)));
    return groups.map(g => { return {text: g, value: g }});
}
/* ============================== CREATE ==================================== */
export function createNewFilterSet(val) {                                 /*dbug-log*///console.log('createNewFilterSet. val = %s', val);
    enableFilterSetInputs('create');
    updateSubmitButton(createFilterSet);
    $('#filter-set-name + input').val(val).focus();
}
function createFilterSet() {
    const data = buildFilterData();
    _u('sendAjaxQuery', [data, 'lists/create', onFilterSubmitComplete.bind(null, 'create')])
    _modal('exitModal');
}
/* ========================= SELECT/EDIT ==================================== */
export function selectFilterSet(val) {
    if (val === 'new') { return; } // New list typed into combobox
    resetFilterUi();
    if (val === 'create') { return createNewFilterSet(); }
    if (!val) { return;  }                                          /*dbug-log*///console.log('loading filter set. val = %s', val);
    enableFilterSetInputs();
    updateSubmitButton(editFilterSet);
    _db('getData', ['savedFilters']).then(filters => fillFilterData(val, filters));
}
function editFilterSet() {
    const data = buildFilterData();
    data.id = _cmbx('getSelVal', ['FilterSet']);
    _u('sendAjaxQuery', [data, 'lists/edit', onFilterSubmitComplete.bind(null, 'edit')]);
    _modal('exitModal');
}
function fillFilterData(id, filters) {
    const filter = addActiveFilterToMemory(filters[id]);            /*dbug-log*///console.log('activeFilter = %O', filter);
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
 * table column headers and the filter panel: rebuild (rebuilds table) and
 * direct (applied to row data directly).
 */
function getFilterSetJson(tState) {
    const fState = _filter('getFilterState');
    const filters = {
        direct: getDirectFitlersForSet(fState.direct),
        focus: tState.curFocus,
        rebuild: fState.rebuild,
        table: fState.table,
        view: tState.curView,
    };
    return JSON.stringify(filters);
}
function getDirectFitlersForSet(filters) {
    delete filters.list; //Active interaction list not saved in set.
    return filters;
}
/* ============================== DELETE ==================================== */
function showCnfrmDeleteBttns() {                                   /*dbug-log*///console.log('deleteInteractionList')
    $('#delete-filter').hide();
    $('#set-confm-cntnr').show();
    hideSavedMsg();
}
function confmDelete() {
    resetDeleteButton();
    _u('sendAjaxQuery', [{id: app.fltr.id}, 'lists/remove', onFilterDeleteComplete]);
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
    const filters = app.fltr.details;                               /*perm-log*/console.log('//Applying Filter Set = %O', filters);
    reloadTableThenApplyFilters(filters, app.fltr.id);
}
function reloadTableThenApplyFilters(filters, id) {
    if (id) { setSavedFilterFocusAndView(filters); } //If no id, reapplying filters after form closed.
    _table('buildTable', [filters.focus, filters.view])
    .then(onTableReloadCompleteApplyFilters.bind(null, filters, id));
}
function setSavedFilterFocusAndView(filters) {
    _cmbx('setSelVal', ['Focus', filters.focus, 'silent']);
    setView(filters);
}
function setView(filters) {
    if (filters.view == tState().get('curView')) { return; }
    const view =  filters.view ? filters.view : 'tree'; //Location filters are only saved in tree view
    _db('setData', ['curView', view]);
    _cmbx('setSelVal', ['View', filters.view, 'silent']);
}
export function onTableReloadCompleteApplyFilters(filters, id) {    /*dbug-log*///console.log('   --onTableReloadComplete. filters = %O', filters);
    setFiltersThatResetTableThenApplyRemaining(filters)
    .then(onAllFiltersApplied)
    .then(() => ifActiveSetResetVal(id));
}
function ifActiveSetResetVal(id) {
    if (!id) { return; }  //If no id, reapplying filters after form closed.
    fillFilterDetailFields(app.fltr.displayName, app.fltr.description);
    _cmbx('setSelVal', ['Filter Set', id, 'silent'])
    addSetToFilterStatus();
}
/* ------------ SET IN FILTER MEMORY -------------- */
function addFiltersToMemoryAndUi(filters) {
    ['direct', 'rebuild'].forEach(handleFilters);

    function handleFilters(group) {
        if (!filters[group]) { return; }
        Object.keys(filters[group]).forEach(handleFilter);

        function handleFilter(type) {
            handleUiUpdate(type, filters[group][type]);
            _filter('setFilterState', [type, filters[group][type], group]);
        }
    }
}
function handleUiUpdate(type, val) {
    const map = {
        name: setNameTextInput,
        combo: setComboElem,
        date: setDateElems
    };
    if (!map[type]) { return; }
    map[type](type, val);
}
/* ------------- SET RELATED UI ------------- */
function setNameTextInput(type, val) {
    $('#focus-filters input[type="text"]').val(val.replace(/"/g,""));
}
function setComboElem(type, val) {
    const field = Object.keys(val)[0];
    _cmbx('setSelVal', [getFilterName(field), val[field], 'silent']);
}
function setDateElems(type, val) {
    _cmbx('setSelVal', ['Date Filter Type', type, 'silent']);
    _filter('toggleDateFilter', [true, val.time, 'skipSync']);
}
/* --------------- FILTERS THAT REBUILD TABLE ------- */
function setFiltersThatResetTableThenApplyRemaining(filters, setId) {
    if (!Object.keys(filters.rebuild).length) { return Promise.resolve(applyDirectFilters()); }
    return setComboboxFilter(filters.rebuild.combo)
    .then(applyDirectFilters)
    .then(applyColumnFilters.bind(null, filters.table))

    function applyDirectFilters() {                                 /*dbug-log*///console.log('applyDirectFilters. args = %O', arguments)
        if (!Object.keys(filters.direct).length) { return; }
        addFiltersToMemoryAndUi(filters);
        _filter('onFilterChangeUpdateRowData');
    }
}
function setComboboxFilter(filter) {
    if (!filter) { return Promise.resolve(); }
    const name = Object.keys(filter)[0];
    const val = filter[name].value;
    return _cmbx('triggerComboChangeReturnPromise', [getFilterName(name), val]);
}
function applyColumnFilters(filters) {                              /*dbug-log*///console.log('applyColumnFilters filters = %O, tblState = %O', filters, app.tblState);
    app.tblApi = tState().get('api');
    for (let name in filters) {
        if (filters[name] === null) { continue; }
        const colName = Object.keys(filters[name])[0];              /*dbug-log*///console.log('col = [%s]. Model = %O', colName, filters[name][colName]);
        app.tblApi.getFilterApi(colName).setModel(filters[name][colName]);
    }
    delete app.tblApi;
}
function onAllFiltersApplied() {
    if (!app.fltr) { return; } //reapplying filters after form closed.
    $('#sel-FilterSet')[0].selectize.addItem(app.fltr.id);
}
/* ====================== UTILITY =========================================== */
function getFilterName(name) {
    return name.includes('Filter') ? name : (name + 'Filter');
}
function addActiveFilterToMemory(set) {
    app.fltr = parseUserNamed(set);
    return app.fltr;
}
function parseUserNamed(entity) {
    return entity ? parseEntity(entity) : { details: [] };
}
function parseEntity(entity) {
    entity.details = typeof entity.details == 'string' ?
        JSON.parse(entity.details) : entity.details;
    return entity
}
/* ---------------- SUBMIT AND SUCCESS METHODS -------------------------------*/
function showSaveFilterModal(success) {
    if (!$('.filter-set-details input').val()) { return $('.filter-set-details input').focus(); }
    let saveReady = true;
    const confg = {
        html: buildModalHtml(), selector: '#save-filter', dir: 'right',
        submit: saveReady ? success : false, bttn: saveReady ? 'Submit' : 'Cancel'
    };
    _modal('showSaveModal', [confg]);

    function buildModalHtml() {
        const hdr = '<h2> Saving Filter Set: </h2>';
        const fltrs = getActiveFilters($('#filter-status').html());
        if (fltrs.includes('No Active')) { saveReady = false; }
        return hdr + '<br>' + fltrs;
    }
}
function getActiveFilters(statusMsg) {
    ['List, ', ', List.', 'List.'].forEach(l => statusMsg = statusMsg.replace(l, ''));
    if (!statusMsg) { statusMsg = 'No Active Filters.'; }
    return statusMsg;
}
function onFilterSubmitComplete(action, results) {
    addActiveFilterToMemory(JSON.parse(results.list.entity));       /*dbug-log*///console.log('onFilterSubmitComplete results = %O, filter = %O', results, app.fltr);
    _db('updateUserNamedList', [results.list, action])
    .then(onUpdateSuccessUpdateFilterUi.bind(null, app.fltr.id));
}
function onUpdateSuccessUpdateFilterUi(id) {
    _cmbx('getOptsFromStoredData', ['savedFilterNames'])
    .then(updateFilterSetSel)
    .then(() => {
        $('#sel-FilterSet')[0].selectize.addItem(id);
        addSetToFilterStatus();
        showSavedMsg();
    });
}
function addSetToFilterStatus() {
    if (!dataFiltersSaved(app.fltr)) { return; }
    const status = $('#filter-status').text();
    $('#filter-status').text('(SET) '+status);
}
function dataFiltersSaved(fltr) {
    const panleFilters = ifSetHasPanelFilters(fltr.details);
    const tableFilters = Object.keys(fltr.details.table).length > 0;
    return panleFilters || tableFilters;
}
function ifSetHasPanelFilters(filters) {
    return Object.keys(filters.direct).length || Object.keys(filters.rebuild).length;
}
function onFilterDeleteComplete(results) {                          /*dbug-log*///console.log('listDeleteComplete results = %O', results)
    _db('updateUserNamedList', [results.list, 'delete'])
    .then(onDeleteSuccessUpdateFilterUi);
}
function onDeleteSuccessUpdateFilterUi() {
    resetFilterUi();
    _cmbx('getOptsFromStoredData', ['savedFilterNames']).then(updateFilterSetSel);
    $('#sel-FilterSet')[0].selectize.open();
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
    if (app.filtr) { app.fltr = null; }
    hideSavedMsg();
    clearFilterDetailFields();
    disableFilterSetInputs();
    _ui('updateFilterStatusMsg');
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
function updateSubmitButton(func) {
    $('#save-filter').off('click').click(showSaveFilterModal.bind(null, func));
}