/**
 * Handles the saving, editing, and display of saved lists of interactions.
 *
 * Export
 *     addListPanelEvents
 *     newIntList
 *     sel-InteractionList
 *     toggleListPanelOrientation
 *     enableListResetBttn
 *
 * TOC
 *     SHOW/HIDE LIST PANEL
 *         Toggle Panel Vertically or Horizontally
 *     CREATE/OPEN INTERACTION LIST
 *     EDIT INTERACTION LIST
 *     DELETE INTERACTION LIST
 *     LOAD INTERACTION LIST IN TABLE
 *     UTILITY
 *         SUBMIT AND SUCCESS METHODS
 *         UI
 *             PSEUDO TAB INVISIBLE BOTTOM BORDER
 *             Select Rows Radio Toggles
 *             Reset & Enable/Disable UI
 *             Table Methods
 */
import { _cmbx, _db, _el, _u } from '~util';
import { _filter, _table, _ui } from '~db';
import * as pM from './panels-main.js';

const tState = _table.bind(null, 'tableState');
/**
 * list - List open in panel
 * listLoaded - List loaded in table
 * modMode - List modificiation state: 'add' or Remove ('rmv')
 * rowSelMode - Modifying 'all' or 'some' rows
 * submitting - True when updates are in submit process
 * tblApi - AgGrid table api
 * tblState - state data for table and search page
 * timeout - present when window is being resized.
 */
let app = {
    rowSelMode: 'some'
};

export function initListPanel() {
    if ($('body').data('user-role') === 'visitor') { return; }
    require('styles/pages/db/panels/lists.styl');
    addListPanelEvents();
}
function addListPanelEvents() {
    window.addEventListener('resize', resizeIntPanelTab);
    $('#lists').click(toggleSaveIntsPanel);
    $('button[name="clear-list"]').click(resetTable);
    $('input[name="mod-list"]').on('change', toggleInstructions);
    $('#unsel-rows').click(deselectAllRows);
    $('#list-details input, #list-details textarea, input[name="mod-list"]').change(enableSubmitBttn);
    $('#load-list').click(loadListInTable);
    $('#delete-list').click(deleteInteractionList);
    $('#confm-list-delete').click(confmDelete);
    $('#cncl-list-delete').click(cancelDelete);
}
/* ====================== SHOW/HIDE LIST PANEL ============================== */
function toggleSaveIntsPanel() {
    if ($('#list-pnl').hasClass('closed')) {
        buildAndShowIntPanel();
        sizeIntPanelTab();
    } else { pM.togglePanel('lists', 'close'); }
}
function buildAndShowIntPanel() {                                   /*perm-log*/console.log('           +--buildAndShowIntPanel')
    pM.togglePanel('lists', 'open');
    initListCombobox();
}
export function enableListResetBttn() {
    if (!app.listLoaded) {
        $('button[name="clear-list"]')
            .attr('disabled', true).css({'cursor': 'inherit'}).fadeTo('fast', .5);
    } else {
        $('button[name="clear-list"]')
            .attr('disabled', false).css({'cursor': 'pointer'}).fadeTo('fast', 1);
    }
}
/* --------------- Toggle Panel Vertically or Horizontally ------------------ */
export function toggleListPanelOrientation(style) {
    if (style == 'vert') { stackIntListPanel();
    } else { spreadIntListPanel(); }
}
/* --- Vertical Stacking --- */
function stackIntListPanel() {
    $(`#sel-list-cntnr, #mod-opts-cntnr`).removeClass('flex-col').addClass('flex-row');
    $(`#list-pnl, #int-lists, #list-details, #mod-list-pnl, #sel-list-cntnr,
        #load-list, #list-count`).addClass('vert');
    stackListElems();
}
function stackListElems() {
    $('#top-details').append($('#list-count').detach());
}
/* --- Horizontal Spreading --- */
function spreadIntListPanel() {
    $(`#sel-list-cntnr, #mod-opts-cntnr`).removeClass('flex-row').addClass('flex-col');
    $(`#list-pnl, #int-lists, #list-details, #mod-list-pnl, #load-list,
        #sel-list-cntnr, #list-count`).removeClass('vert');
    $('#list-details').append($('#list-count').detach());
}
/* ============== CREATE/OPEN INTERACTION LIST ============================== */
/* ------ CREATE LIST ------- */
/** Creates a new list of saved interactions. */
export function newIntList(val) {                                   /*dbug-log*///console.log('           --New Interaction List');
    $('#submit-list').off('click').click(createDataList);
    updateUiForListCreate();
    fillListDataFields(val, '', 0);
    addActiveListToMemory();
}
function updateUiForListCreate() {
    enableInputs('create');
    enableModUi('add');
    hideSavedMsg();
    updateDetailHdr('New');
}
function createDataList() {
    if (!$('#top-details input').val()) { return $('#top-details input').focus(); }
    $('#submit-list').data('submitting', true); //Prevents selMode from being overwritten
    const data = buildListData();
    if (!data) { return; } //No interactions selected; Alert shown to the user
    submitDataList(data, 'create', onListSubmitComplete.bind(null, 'create'));
}
/* ------ OPEN LIST ------- */
/** Opens a saved list of interactions. */
export function selIntList(val) {
    if (val === 'create') { return newIntList(''); }
    if (!val && !app.submitting) { return resetListUi(); }
    if (val === 'new'|| (!val && app.submitting)) { return; } // New list typed into combobox or mid edit-submit
    fillListData(val);
    resetPrevListUiState();
    $('#submit-list').off('click').click(editDataList);
    enableInputs();
    enableModUi('add');
    updateDetailHdr('Selected');
}
function editDataList() {
    if (!$('#top-details input').val()) { return $('#top-details input').focus(); }
    $('#submit-list').data('submitting', true); //Prevents selMode from being overwritten
    const data = buildListData();
    if (!data) { return; }//No interactions selected; Alert shown to the user
    data.id = _cmbx('getSelVal', ['InteractionList']);
    submitDataList(data, 'edit', onListSubmitComplete.bind(null, 'edit'));
}
function fillListData(id) {
    _db('getData', ['dataLists']).then(lists => {
        const list = addActiveListToMemory(lists[id]);              /*dbug-log*///console.log('activeList = %O', list);
        fillListDataFields(
            list.displayName, list.description, list.details.length);
    });
}
/* ====================== EDIT INTERACTION LIST ============================= */
function buildListData() {
    const ints = getInteractions();
    if (!ints) { return false; }
    return {
        displayName: _u('ucfirst', [$('#list-details input').val()]),
        type: 'interaction',
        description: $('#list-details textarea').val(),
        details: JSON.stringify(ints),
    };
}
/* ----- ADD/REMOVE ROWS ----- */
function getInteractions() {
    app.tblApi = tState().get('api');
    return $('#mod-some-list').prop('checked') ? getUpdatedIntSet(app.modMode) :
        $('#mod-all-list').prop('checked') ? getAllIntsInTable(app.modMode) : [];
}
function getAllIntsInTable(mode) {
    app.tblApi = tState().get('api');
    app.tblApi.expandAll();
    _ui('setTreeToggleData', [true]);
    app.tblApi.getModel().rowsToDisplay.forEach(selectInteractions.bind(null, true));
    return getUpdatedIntSet(mode);
}
/** An interaction row has 'interactionType' data. Selected or unselects all rows. */
function selectInteractions(select, rowNode) {
    if (rowNode.data.interactionType !== undefined) { rowNode.setSelected(select); }
}
function getUpdatedIntSet(mode) {
    const rows = app.tblApi.getSelectedNodes().map(r => { return r.data.id; });
    return mode == 'add' ? getIntsToAdd(rows) :
        app.list.details.filter(id => rows.indexOf(id) === -1);
}
function getIntsToAdd(rows) {
    const ints = [ ...new Set(rows.concat(app.list.details).filter(id => id))];
    return !ints.length ? showNoneSelectedAlert() : ints;
}
function showNoneSelectedAlert() {
    const msg = 'None selected.';
    const alert = _el('getElem', ['div', { id: 'list_alert', text: msg }]);
    $('#list-submit-msg').before(alert);
    window.setTimeout(removeAlert, 2000);
}
function removeAlert() {
    $('#list_alert').fadeTo('slow', 0, () => $('#list_alert').remove());
}
/* ====================== DELETE INTERACTION LIST =========================== */
function deleteInteractionList() {
    $('#delete-list').hide();
    $('#list-confm-cntnr').show();
}
function confmDelete() {                                            /*perm-log*/console.log('           --Deleted Interaction List');
    resetDeleteButton();
    _u('sendAjaxQuery', [{id: app.list.id}, 'lists/remove', onListDeleteComplete]);
    resetListUi();
}
function cancelDelete() {
    resetDeleteButton();
}
function resetDeleteButton() {
    $('#list-confm-cntnr').hide();
    $('#delete-list').show();
}
/* ================== LOAD INTERACTION LIST IN TABLE ======================== */
/**
 * Loads the interaction set in the table, where it can be explored and filtered
 * with the standard UI options
 */
function loadListInTable() {                                        /*perm-log*/console.log('           +--Loading Interaction List in Table. %O', app.list);
    prepareMemoryForTableLoad();
    _filter('onFilterChangeUpdateRowData');
    updateRelatedListUi();
}
function prepareMemoryForTableLoad() {
    _filter('setFilterState', ['list', app.list.details, 'direct']);
    app.tblState = tState().get();
    app.listLoaded = true;
}
function updateRelatedListUi() {
    expandAllTableRows();
    syncFilterUi(app.tblState.curFocus);
    updateListLoadButton('Reset to All Interactions', resetTable);
    hideSavedMsg();
    enableModUi('rmv');
    enableListResetBttn();
    updateDetailHdr('Loaded');
    delete app.tblState;
}
function syncFilterUi(focus) {
    _ui('updateFilterStatusMsg');
    if ($('#sel-FilterSet')[0].selectize) {
        $('#sel-FilterSet')[0].selectize.clear('silent')
    }
}
function updateListLoadButton(text, clickFunc) {
    $('#load-list').html(text);
    $('#load-list').off('click').click(clickFunc);
}
/* ====================== UTILITY =========================================== */
function addActiveListToMemory(list) {
    app.list = parseUserNamed(list);
    return app.list;
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
/** Submit new or edited interaction list. */
function submitDataList(data, action, hndlr) {
    app.submitting = app.modMode; //Flag tells various event handlers how to handle submit
    _u('sendAjaxQuery', [data, 'lists/'+action, hndlr]);
}
function onListSubmitComplete(action, results) {
    const list = JSON.parse(results.list.entity);                   /*temp-log*///console.log('listSubmitComplete results = %O, list = %O', results, list)
    _db('updateUserNamedList', [results.list, action])
    .then(updateListComboboxOptions)
    .then(updateUiAfterListSubmit.bind(null, list));
}
function updateUiAfterListSubmit(list) {
    $('#sel-InteractionList')[0].selectize.addItem(list.id)
    showSavedMsg();
    toggleInstructions();
    if (app.submitting === 'rmv') { loadListInTable(); }
    delete app.submitting;
    $('#submit-list').data('submitting', false);
}
function onListDeleteComplete(results) {                            /*temp-log*///console.log('listDeleteComplete results = %O', results)
    _db('updateUserNamedList', [results.list, 'delete'])
    .then(updateListComboboxOptions)
    .then(() => $('#sel-InteractionList')[0].selectize.open());
}
function showSavedMsg() {
    $('#list-submit-msg').fadeTo('slow', 1);
    window.setTimeout(hideSavedMsg, 3000);
}
function hideSavedMsg() {
    $('#list-submit-msg').fadeTo('slow', 0);
}
/* =============================== UI ======================================= */
function initListCombobox() {
    if ($('#list-details>span').text() !== 'List Details') { return; }
    _cmbx('initCombobox', [{ name: 'Interaction List', onChange: selIntList, create: newIntList}]);
    updateListComboboxOptions().then(() => {
        window.setTimeout(() => $('#sel-InteractionList')[0].selectize.focus(), 500);
        disableInputs();
    });
}
function fillListDataFields(nameVal, descVal, intCnt) {
    $('#list-details input').val(nameVal).focus();
    $('#list-details textarea').val(descVal);
    $('#int-list-cnt')[0].innerHTML = '<b>'+intCnt+'</b>';
    if (intCnt > 0) {
        $('#load-list, #load-list+div').attr({disabled: false}).css({opacity: 1});
    }
}
/* --- PSEUDO TAB INVISIBLE BOTTOM BORDER -------- */
function resizeIntPanelTab() {
    if ($('#list-opts').hasClass('closed')) { return; }
    if (app.timeout) { return; }
    app.timeout = window.setTimeout(() => {
        sizeIntPanelTab()
        app.timeout = false;
    }, 500);
}
function sizeIntPanelTab() {
    const pseudo = getPseudoStyle();
    $('.hide-int-bttm-border:before').remove();
    $('.hide-int-bttm-border').append(pseudo);
}
function getPseudoStyle() {
    const panelT = $('#list-pnl').position().top;
    const tabW = $('#list-opts').innerWidth();
    const tabL = $('#list-opts').position().left + 1;               /*dbug-log*///console.log('sizeIntPanelTab. T = [%s], W = [%s], L = [%s]', panelT, tabW, tabL); //1px border
    return `<style>.hide-int-bttm-border:before {
        position: absolute;
        content: '';
        height: 3px;
        z-index: 10;
        width: ${tabW}px;
        top: ${panelT}px;
        left: ${tabL}px;
        background: #e2f2f3;
        }</style>`;
}
/* --- Select Rows Radio Toggles ---- */
function toggleInstructions() {
    $('#mod-info').fadeTo('fast', 0);
    addInfoMsgAndUpdateTableSelection();
    $('#mod-info').fadeTo('fast', 1);
}
function addInfoMsgAndUpdateTableSelection() {
    const selMode = getRowSelectModeAndSyncRadioUi();
    const info = getRowSelectInfo(selMode);
    $('#mod-info')[0].innerHTML = info;
    app.rowSelMode = selMode;
}
function getRowSelectModeAndSyncRadioUi() {
    const radioVal = $('#mod-some-list').prop('checked') ? 'some' :
        $('#mod-all-list').prop('checked') ? 'all' : false;
    if (!radioVal) {
        $(`#mod-${app.rowSelMode}-list`).prop('checked', true);
        return app.rowSelMode;
    }
    return radioVal;
}
function getRowSelectInfo(selMode) {
    const map = {
        some: 'Click on an *interaction row to select. Hold ctrl/cmd to select multiple rows. Hold shift and click a 2nd row to select a range. Click "Save List" to add/remove selection. *Interaction rows are the colored base-level rows.',
        all: 'Click "Save List" to add/remove all *interactions in the table. *Interaction rows are the colored base-level rows.',
    };
    return map[selMode];
}
/* ---- Reset & Enable/Disable UI --- */
function resetListUi() {
    clearAndDisableInputs();
    hideSavedMsg();
    resetPrevListUiState();
}
function clearAndDisableInputs() {
    $('#list-details input, #list-details textarea').val('');
    $('#int-list-cnt').html('');
    updateDetailHdr('');
    disableModUi();
    disableInputs();
}
function enableInputs(creating) {
    $(`#list-details input, #list-details textarea, #list-details span, #mod-list-pnl > span:first-child,
        #list-pnl button, #mod-mode, #mod-radios input, #mod-radios label`)
        .attr({'disabled': false}).css({'opacity': '1'});
    if (creating) { $('#delete-list').attr({'disabled': 'disabled'}).css({'opacity': '.5'});; }
    $('#unsel-rows').attr({'disabled': true}).fadeTo('slow', .6);
}
function disableInputs() {
    $(`#list-details input, #list-details textarea, #list-details span, #sel-list-cntnr button,
        #mod-list-pnl button, #mod-list-pnl > span:first-child, #load-list+div,
        #mod-mode, #mod-radios input, #mod-radios label`)
            .attr({'disabled': 'disabled'}).css({'opacity': '.5'});
    $('#mod-rmv-list, label[for="mod-rmv-list"]').css({display: 'none'});
}
function enableModUi(m) {
    const mode = app.submitting || m;
    const inactiveMode = mode === 'add' ? 'rmv' : 'add';
    const label = mode === 'add' ?
        'Add Interactions to List:' : 'Remove Interactions from List:';
    $('#mod-mode').html(label).css({'font-weight': 600, 'font-size': '.9em'});
    $('#unsel-rows').attr({'disabled': true}).fadeTo('slow', .6);
    app.modMode = mode;
    toggleInstructions();
}
function disableModUi() {
    $(`#mod-radios input`).prop('checked', false);
    $('#mod-info').fadeTo('fast', 0);
    $('#mod-mode').css({'font-weight': 400});
}
function enableSubmitBttn() {
    $('#submit-list').attr({'disabled': false}).css({'opacity': '1'});
    hideSavedMsg();
}
function updateDetailHdr(type) {
    $('#list-details>span').html(type + ' List Details');
}
function updateListComboboxOptions() {
    return Promise.resolve(_cmbx('getOptsFromStoredData', ['dataListNames']).then(
        opts => {
            opts.unshift({value: 'create', text: '...Add New Interaction List'});
            _cmbx('replaceSelOpts', ['InteractionList', opts]);
    }));
}
function resetPrevListUiState() {
    if (!app.listLoaded || app.submitting) { return; }
    resetTable();
    updateListLoadButton('View Interaction List in Table', loadListInTable);
    delete app.listLoaded;
}
/* --- Table Methods --- */
/** Resets interactions displayed to the full default set of the current focus. */
function resetTable() {
    _filter('setFilterState', ['list', false, 'direct']);
    delete app.listLoaded;
    _filter('onFilterChangeUpdateRowData');
    updateUiAfterTableReset();
}
function updateUiAfterTableReset() {
    enableModUi('add');
    $('#load-list').html('Load Interaction List in Table');
    $('#load-list').off('click').click(loadListInTable);
    if (!$('#list-pnl').hasClass('closed')) { expandAllTableRows(); }
    updateDetailHdr('Selected');
}
function expandAllTableRows() {
    app.tblApi = tState().get('api');
    app.tblApi.expandAll();
    _ui('setTreeToggleData', [true]);
}
function deselectAllRows() {
    app.tblApi = tState().get('api');
    app.tblApi.getModel().rowsToDisplay.forEach(selectInteractions.bind(null, false));
    $('#unsel-rows').attr({'disabled': true}).fadeTo('slow', .6);
}