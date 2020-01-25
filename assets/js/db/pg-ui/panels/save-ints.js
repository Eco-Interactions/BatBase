/**
 * Handles the saving, editing, and display of saved lists of interactions.
 *
 * Exports:                 Imported By:
 *     addListPanelEvents           panels-main
 *     newIntList                   util
 *     savedIntListLoaded           db-filters, filter-panel
 *     selIntList                   util
 *     toggleListPanelOrientation   panels-main
 *     toggleSaveIntsPanel          db-ui
 *     enableListReset              db-ui
 *
 * TOC:
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
import * as _u from '../../util/util.js';
import * as _uPnl from './panels-main.js';
import { updateUserNamedList } from '../../local-data/db-sync.js';
import { accessTableState as tState, resetDataTable } from '../../db-main.js';
import { resetToggleTreeBttn } from '../../pg-ui/ui-main.js';
import { updateFilterStatusMsg, syncViewFiltersAndUi, resetFilterParams } from '../../table/filters/filters-main.js';
import { showHelpModal } from '../../../misc/intro-core.js';
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
let app = {};

export function savedIntListLoaded() {                                          
    return app.listLoaded;
}
export function addListPanelEvents() {
    window.addEventListener('resize', resizeIntPanelTab);
    $('button[name="clear-list"]').click(resetTable);
    $('input[name="mod-list"]').on('change', toggleInstructions);
    $('#unsel-rows').click(deselectAllRows);
    $('#list-details input, #list-details textarea, input[name="mod-list"]').change(enableSubmitBttn);
    $('#load-list').click(loadListInTable);
    $('#delete-list').click(deleteInteractionList);
    $('#confm-list-delete').click(confmDelete);
    $('#cncl-list-delete').click(cancelDelete);
    $('#svd-list-hlp').click(showHelpModal.bind(null, 'saved-lists'));
}
/* ====================== SHOW/HIDE LIST PANEL ============================== */
export function toggleSaveIntsPanel() {                                         
    if ($('#int-opts').hasClass('closed')) { 
        buildAndShowIntPanel(); 
        sizeIntPanelTab();
    } else { _uPnl.togglePanel('#int-opts', 'close'); }
}
function buildAndShowIntPanel() {                                   /*perm-log*/console.log('           +--buildAndShowIntPanel')         
    _uPnl.togglePanel('#int-opts', 'open');
    if (!tState().get('intSet')) {
        initListCombobox();
        expandAllTableRows();
    }
}
export function enableListReset() {  
    if (!app.listLoaded) { 
        $('button[name="clear-list"]')
            .attr('disabled', true).css({'opacity': .5, cursor: 'inherit'}); 
    } else {  
        $('button[name="clear-list"]')
            .attr('disabled', false).css({'opacity': 1, 'cursor': 'pointer'}); 
    }
}
/* --------------- Toggle Panel Vertically or Horizontally ------------------ */
export function toggleListPanelOrientation(style) {
    if (style == 'vert') { stackIntListPanel();
    } else { spreadIntListPanel(); }
}
/* --- Vertical Stacking --- */
function stackIntListPanel() {
    $(`#list-sel-cntnr, #load-list-cntnr, #mod-opts-cntnr`).removeClass('flex-col').addClass('flex-row');
    $(`#int-opts, #int-lists, #list-details, #mod-list-pnl, #load-list-cntnr,
        #list-sel-cntnr, #list-count`).addClass('vert');
    stackListElems();
    if (window.innerWidth < 1313) { $('#load-list-cntnr div').text('(Filters reset)'); }
}
function stackListElems() {
    $('#top-details').append($('#list-count').detach());
}
/* --- Horizontal Spreading --- */
function spreadIntListPanel() {
    $(`#list-sel-cntnr, #load-list-cntnr, #mod-opts-cntnr`).removeClass('flex-row').addClass('flex-col');
    $(`#int-opts, #int-lists, #list-details, #mod-list-pnl, #load-list-cntnr,
        #list-sel-cntnr, #list-count`).removeClass('vert');
    $('#list-details').append($('#list-count').detach());
}
function filtersApplied() {
    return $('#filter-status').text() !== '(LIST)';
}
/* ============== CREATE/OPEN INTERACTION LIST ============================== */
/* ------ CREATE LIST ------- */
/** Creates a new list of saved interactions. */
export function newIntList(val) {                                   /*debg-log*///console.log('           --New Interaction List');
    _uPnl.updateSubmitEvent('#submit-list', createDataList);
    updateUiForListCreate();
    fillListDataFields(val, '', 0);
    addActiveListToMemory();
    delete app.rowSelMode;
    return { value: "new", text: val ? val : "Creating New Interaction List" };
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
    _uPnl.updateSubmitEvent('#submit-list', editDataList);
    enableInputs();
    enableModUi('add');
    updateDetailHdr('Selected');
}
function editDataList() {
    if (!$('#top-details input').val()) { return $('#top-details input').focus(); }
    $('#submit-list').data('submitting', true); //Prevents selMode from being overwritten
    const data = buildListData();
    data.id = _u.getSelVal('Int-lists');
    submitDataList(data, 'edit', onListSubmitComplete.bind(null, 'edit'));
}
function fillListData(id) {
    _u.getData('dataLists').then(lists => {
        const list = addActiveListToMemory(lists[id]);              /*debg-log*///console.log('activeList = %O', list);                                                 
        fillListDataFields(
            list.displayName, list.description, list.details.length);  
    });
}
/* ====================== EDIT INTERACTION LIST ============================= */
function buildListData() {
    const data = {
        displayName: _u.ucfirst($('#list-details input').val()),
        type: 'interaction',
        description: $('#list-details textarea').val(),
        details: JSON.stringify(getInteractions()),
    };
    return data;
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
    resetToggleTreeBttn(true);
    app.tblApi.getModel().rowsToDisplay.forEach(selectInteractions.bind(null, true));           
    return getUpdatedIntSet(mode);
}
/** An interaction row has 'interactionType' data. Selected or unselects all rows. */
function selectInteractions(select, rowNode) { 
    if (rowNode.data.interactionType !== undefined) { rowNode.setSelected(select); }
}
function getUpdatedIntSet(mode) {                                               
    const rows = app.tblApi.getSelectedNodes().map(r => { return r.data.id; }); 
    return mode == 'add' ? 
        [ ...new Set(rows.concat(app.list.details).filter(id => id))] : 
        app.list.details.filter(id => rows.indexOf(id) === -1);
}
/* ====================== DELETE INTERACTION LIST =========================== */
function deleteInteractionList() {                                  
    $('#delete-list').hide();
    $('#list-confm-cntnr').show();    
}
function confmDelete() {                                            /*perm-log*/console.log('           --Deleted Interaction List');
    resetDeleteButton();
    _uPnl.submitUpdates({id: app.list.id}, 'remove', onListDeleteComplete);
    delete app.rowSelMode;
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
    resetDataTable()
    .then(updateRelatedListUi);
}
function prepareMemoryForTableLoad() {
    tState().set({'intSet': app.list.details});
    app.tblState = tState().get();  
    app.listLoaded = true;
}
function updateRelatedListUi() {
    app.tblState.api.expandAll();
    resetToggleTreeBttn(true);
    syncFilterUi(app.tblState.curFocus);
    updateListLoadButton('Reset to All Interactions', resetTable);
    hideSavedMsg();
    enableModUi('rmv');
    updateFilterStatusMsg();
    enableListReset();
    updateDetailHdr('Loaded');
    delete app.tblState;
}
function syncFilterUi(focus) {
    syncViewFiltersAndUi(focus);
    if ($('#selSavedFilters')[0].selectize) { 
        $('#selSavedFilters')[0].selectize.clear() 
    }
}
function updateListLoadButton(text, clickFunc) {
    $('#load-list').html(text);
    $('#load-list').off('click').click(clickFunc);
}
/* ====================== UTILITY =========================================== */
function addActiveListToMemory(list) {
    app.list = _uPnl.parseUserNamed(list); 
    return app.list;
}
/* ---------------- SUBMIT AND SUCCESS METHODS -------------------------------*/
/** Submit new or edited interaction list. */
function submitDataList(data, action, hndlr) {
    app.submitting = app.modMode; //Flag tells various event handlers how to handle submit
    _uPnl.submitUpdates(data, action, hndlr);
}
function onListSubmitComplete(action, results) {                                      
    const list = JSON.parse(results.list.entity);                   /*temp-log*///console.log('listSubmitComplete results = %O, list = %O', results, list)
    updateUserNamedList(results.list, action)
    .then(updateListComboboxOptions)
    .then(updateUiAfterListSubmit.bind(null, list));
}
function updateUiAfterListSubmit(list) {
    $('#selIntList')[0].selectize.addItem(list.id)
    showSavedMsg();
    toggleInstructions();  
    if (app.submitting === 'rmv') { loadListInTable(); }
    delete app.submitting;
    $('#submit-list').data('submitting', false);
}
function onListDeleteComplete(results) {                            /*temp-log*///console.log('listDeleteComplete results = %O', results)
    updateUserNamedList(results.list, 'delete')
    .then(updateListComboboxOptions)
    .then(() => $('#selIntList')[0].selectize.open());
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
    _u.initCombobox('Int-lists');   
    updateListComboboxOptions().then(() => {
        window.setTimeout(() => $('#selIntList')[0].selectize.focus(), 500);
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
    const panelT = $('#int-opts').position().top;
    const tabW = $('#list-opts').innerWidth();  
    const tabL = $('#list-opts').position().left + 1;               /*debg-log*///console.log('sizeIntPanelTab. T = [%s], W = [%s], L = [%s]', panelT, tabW, tabL); //1px border
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
        #int-opts button, #mod-mode, #mod-radios input, #mod-radios label`)
        .attr({'disabled': false}).css({'opacity': '1'});
    if (creating) { $('#delete-list').attr({'disabled': 'disabled'}).css({'opacity': '.5'});; }
    $('#unsel-rows').attr({'disabled': true}).fadeTo('slow', .6);
}
function disableInputs() {                                                      
    $(`#list-details input, #list-details textarea, #list-details span, #list-sel-cntnr button, 
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
    return Promise.resolve(_u.getOptsFromStoredData('dataListNames').then(
        opts => { 
            opts.unshift({value: 'create', text: '...Add New Interaction List'});
            _u.replaceSelOpts('#selIntList', opts);
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
    tState().set({'intSet': false});                                            
    delete app.listLoaded;
    resetDataTable()
    .then(updateUiAfterTableReset);
}
function updateUiAfterTableReset() {
    enableModUi('add');
    $('#load-list').html('Load Interaction List in Table');
    $('#load-list').off('click').click(loadListInTable);
    if (!$('#int-opts').hasClass('closed')) { expandAllTableRows(); }
    updateDetailHdr('Selected');
}
function expandAllTableRows() {
    app.tblApi = tState().get('api');
    app.tblApi.expandAll();
    resetToggleTreeBttn(true);
}
function deselectAllRows() {                                                    
    app.tblApi = tState().get('api');
    app.tblApi.getModel().rowsToDisplay.forEach(selectInteractions.bind(null, false));       
    $('#unsel-rows').attr({'disabled': true}).fadeTo('slow', .6);
}