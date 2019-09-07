/**
 * Handles the saving, editing, and display of saved lists of interactions.
 *
 * Exports:                 Imported By:
 *     addListPanelEvents           panel-util
 *     newIntList                   util
 *     savedIntListLoaded           db-filters, save-fltrs
 *     selIntList                   util
 *     toggleListPanelOrientation   panel-util
 *     toggleSaveIntsPanel          db-ui
 *     enableListReset              db-ui
 */
import * as _u from '../util.js';
import * as data_tree from '../db-table/build-data-tree.js';
import * as frmt_data from '../db-table/format-data.js'; 
import * as _uPnl from './panel-util.js';
import { updateUserNamedList } from '../db-sync.js';
import { accessTableState as tState, resetSearchState } from '../db-page.js';
import { resetToggleTreeBttn } from '../db-ui.js';
import { updateFilterStatusMsg, syncViewFiltersAndUi, resetTableStateParams } from '../db-table/db-filters.js';
import { showHelpModal } from '../../misc/intro-core.js';

/**
 * list - List open in panel
 * listLoaded - List loaded in table
 * modMode - List modificiation state: 'add' or Remove ('rmv')
 * rowSelMode - Modifying 'all' or 'some' rows
 * submitting - True when updates are in submit process
 * tblApi - AgGrid table api
 * tblState - state data for table and search page
] */
let app = {};

export function savedIntListLoaded() {                                          //console.log('savedIntListLoaded? ', app.listLoaded);
    return app.listLoaded;
}

export function addListPanelEvents() {
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
export function toggleSaveIntsPanel() {                                         console.log('toggle data lists panel');
    if ($('#int-opts').hasClass('closed')) { buildAndShowIntPanel(); 
    } else { _uPnl.togglePanel('#int-opts', 'close'); }
}
function buildAndShowIntPanel() {                                               //console.log('buildAndShowIntPanel')
    _uPnl.togglePanel('#int-opts', 'open');
    if (!tState().get('intSet')) {
        initListCombobox();
        expandAllTableRows();
        window.setTimeout(function() { 
            $('#selIntList')[0].selectize.focus();  
            disableInputs();
        }, 500);         
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
/* --- Toggle Panel Vertically or Horizontally --- */
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
export function newIntList(val) {                                               //console.log('creating interaction list. val = ', val);
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
export function selIntList(val) {                                               //console.log('selecting interaction list. val = ', val);
    if (val === 'create') { return newIntList(''); }
    if (!val && !app.submitting) { return resetListUi(); }
    if (val === 'new'|| (!val && app.submitting)) { return; } // New list typed into combobox or mid edit-submit
    resetPrevListUiState();
    _uPnl.updateSubmitEvent('#submit-list', editDataList);
    fillListData(val);
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
    const lists = _u.getDataFromStorage('dataLists');                           
    const list = addActiveListToMemory(lists[id]);                              console.log('activeList = %O', list);                                                 
    fillListDataFields(
        list.displayName, list.description, list.details.length);  
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
function deleteInteractionList() {                                              //console.log('deleteInteractionList')
    $('#delete-list').hide();
    $('#list-confm-cntnr').show();    
}
function confmDelete() {
    resetDeleteButton();
    _uPnl.submitUpdates({id: app.list.id}, 'delete', onListDeleteComplete);
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
function loadListInTable() {                                                    //console.log('----Loading Interaction List in Table. %O', app.list);
    prepareMemoryForTableLoad();
    buildFocusDataTreeAndLoadGrid(app.tblState.curFocus);
    updateUi();
    delete app.tblState;
}
/**
 * Refactor to remove the table rebuild/teardown. It is here because I am crunched 
 * for time and it was the simplest way to clear the panel filters.
 */
function prepareMemoryForTableLoad() {
    tState().set({'intSet': app.list.details});
    removePreviousTable();
    resetSearchState();  //tblRebuild
    removePreviousTable(); //tblTeardown
    app.tblState = tState().get();  
    app.listLoaded = true;
}
function updateUi() {
    app.tblState.api.expandAll();
    resetToggleTreeBttn(true);
    syncFilterUi(app.tblState.curFocus);
    updateListLoadButton('Reset to All Interactions', resetTable);
    hideSavedMsg();
    enableModUi('rmv');
    updateFilterStatusMsg();
    enableListReset();
    updateDetailHdr('Loaded');
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
function buildFocusDataTreeAndLoadGrid(dataFocus) {
    const bldrs = {
        'locs': buildLocTreeInts, 'srcs': buildSrcTreeInts, 'taxa': buildTxnTreeInts
    }
    bldrs[dataFocus]();
}
/* ---- Locs ---- */
function buildLocTreeInts() {
    const regions = getRegionIds();
    frmt_data.transformLocDataAndLoadTable(
        data_tree.buildLocTree(regions), app.tblState);
}
function getRegionIds() {
    const ids = [];
    const regions = _u.getDataFromStorage('topRegionNames');
    for (let name in regions) { ids.push(regions[name]); } 
    return ids;
}
/* ---- Srcs ---- */
function buildSrcTreeInts() {                                                   
    frmt_data.transformSrcDataAndLoadTable(
        data_tree.buildSrcTree(app.tblState.curView), app.tblState);
}
/* ---- Taxa ---- */
function buildTxnTreeInts() {                                                   
    const realmTaxon = _u.getDataFromStorage('taxon')[getId(app.tblState.taxaByLvl)];
    frmt_data.transformTxnDataAndLoadTable(
        data_tree.buildTxnTree(realmTaxon), app.tblState);
}
function getId(taxaByLvl) {
    const realmLvl = Object.keys(taxaByLvl).filter(lvl => {
        return Object.keys(taxaByLvl[lvl]).length == 1;
    });
    return taxaByLvl[realmLvl][Object.keys(taxaByLvl[realmLvl])[0]];  
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
    const list = JSON.parse(results.list.entity);                               console.log('listSubmitComplete results = %O, list = %O', results, list)
    updateUserNamedList(results.list, action);
    updateDataListSel();
    $('#selIntList')[0].selectize.addItem(list.id);
    showSavedMsg();
    toggleInstructions();  
    if (app.submitting === 'rmv') { loadListInTable(); }
    delete app.submitting;
    $('#submit-list').data('submitting', false);
}
function onListDeleteComplete(results) {                                        console.log('listDeleteComplete results = %O', results)
    updateUserNamedList(results.list, 'delete');
    updateDataListSel();
    $('#selIntList')[0].selectize.open();
}
function showSavedMsg() {
    $('#list-submit-msg').fadeTo('slow', 1);
    window.setTimeout(hideSavedMsg, 3000);
}
function hideSavedMsg() {
    $('#list-submit-msg').fadeTo('slow', 0);
}
/* ------------------------------- UI ----------------------------------------*/
function initListCombobox() {
    _u.initCombobox('Int-lists');   
    updateDataListSel();
}
function fillListDataFields(nameVal, descVal, intCnt) {
    $('#list-details input').val(nameVal).focus();
    $('#list-details textarea').val(descVal);
    $('#int-list-cnt')[0].innerHTML = '<b>'+intCnt+'</b>';  
    if (intCnt > 0) { 
        $('#load-list, #load-list+div').attr({disabled: false}).css({opacity: 1}); 
    }
}
/* --- Select Rows Radio Toggles ---- */
function toggleInstructions() {                                                 //console.log('toggleInstructions');
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
function enableInputs(creating) {                                               //console.log('enableInputs')
    $(`#list-details input, #list-details textarea, #list-details span, #mod-list-pnl > span:first-child, 
        #int-opts button, #mod-mode, #mod-radios input, #mod-radios label`)
        .attr({'disabled': false}).css({'opacity': '1'});
    if (creating) { $('#delete-list').attr({'disabled': 'disabled'}).css({'opacity': '.5'});; }
    $('#unsel-rows').attr({'disabled': true}).fadeTo('slow', .6);
}
function disableInputs() {                                                      //console.log('disableInputs')
    $(`#list-details input, #list-details textarea, #list-details span, #list-sel-cntnr button, 
        #mod-list-pnl button, #mod-list-pnl > span:first-child, #load-list+div, 
        #mod-mode, #mod-radios input, #mod-radios label`)
            .attr({'disabled': 'disabled'}).css({'opacity': '.5'});
    $('#mod-rmv-list, label[for="mod-rmv-list"]').css({display: 'none'});
}
function enableModUi(m) {                                                       //console.log('enableModUi')
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
function updateDataListSel() {
    const opts = _u.getOptsFromStoredData('dataListNames');                     
    opts.unshift({value: 'create', text: '...Add New Interaction List'});
    _u.replaceSelOpts('#selIntList', opts);
}
function resetPrevListUiState() {
    if (!app.listLoaded || app.submitting) { return; }
    resetTable();
    updateListLoadButton('View Interaction List in Table', loadListInTable);  
    delete app.listLoaded;
}
/* --- Table Methods --- */
/** Resets interactions displayed to the full default set of the current focus. */
function resetTable() {                                                         //console.log('- - - - - -resetingTable');
    removePreviousTable();
    tState().set({'intSet': false});                                            
    delete app.listLoaded;
    resetSearchState();
    enableModUi('add');
    $('#load-list').html('Load Interaction List in Table');
    $('#load-list').off('click').click(loadListInTable);
    if (!$('#int-opts').hasClass('closed')) { expandAllTableRows(); }
    updateDetailHdr('Selected');
}
function removePreviousTable() {  
    resetTableStateParams();
    app.tblApi = app.tblState ? app.tblState.api : tState().get('api');  
    app.tblApi.destroy();
}
function expandAllTableRows() {
    app.tblApi = tState().get('api');
    app.tblApi.expandAll();
    resetToggleTreeBttn(true);
}
function deselectAllRows() {                                                    //console.log('unselect all rows');
    app.tblApi = tState().get('api');
    app.tblApi.getModel().rowsToDisplay.forEach(selectInteractions.bind(null, false));       
    $('#unsel-rows').attr({'disabled': true}).fadeTo('slow', .6);
}











