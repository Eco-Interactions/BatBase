/**
 * Handles the saving, editing, and display of saved lists of interactions.
 *
 * Exports:                 Imported By:
 *     addListPanelEvents           panel-util
 *     newIntList                   util
 *     savedIntListLoaded           db-filters, save-fltrs
 *     selIntList                   util
 *     toggleSaveIntsPanel          db-ui
 */
import * as _u from '../util.js';
import * as data_tree from './build-data-tree.js';
import * as frmt_data from './format-data.js'; 
import * as _uPnl from './panel-util.js';
import { updateUserNamedList } from '../db-sync.js';
import { accessTableState as tState, resetSearchState } from '../db-page.js';
import { resetToggleTreeBttn } from './db-ui.js';
import { updateFilterStatusMsg, syncViewFiltersAndUi } from './db-filters.js';

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
    $('input[name="mod-list"]').on('change', toggleInstructions);
    $('#unsel-rows').click(deselectAllRows);
    $('#list-details input, #list-details textarea, input[name="mod-list"]').change(enableSubmitBttn);
    $('#load-list').click(loadInteractionsInTable);
    $('#delete-list').click(deleteInteractionList);
    $('#confm-list-delete').click(confmDelete);
    $('#cncl-list-delete').click(cancelDelete);
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
            $('#saved-ints')[0].selectize.focus();  
            disableInputs();
        }, 500);         
    }
}
/* ============== CREATE/OPEN INTERACTION LIST ============================== */
/* ------ CREATE LIST ------- */
/** Creates a new list of saved interactions. */
export function newIntList(val) {                                               //console.log('creating interaction list. val = ', val);
    enableInputs('create');
    _uPnl.updateSubmitEvent('#submit-list', createDataList);
    fillListDataFields(val, '', 0);
    addActiveListToMemory();
    enableModUi('add');
    hideSavedMsg();
    delete app.rowSelMode;
    return { value: "new", text: val ? val : "Creating New Interaction List" };
}
function createDataList() {
    const data = buildListData();
    submitDataList(data, 'create', onListSubmitComplete.bind(null, 'create'));
}
/* ------ OPEN LIST ------- */
/** Opens a saved list of interactions. */
export function selIntList(val) {                                               //console.log('selecting interaction list. val = ', val);
    if (val === 'create') { return newIntList(''); }
    if (!val && !app.submitting) { return resetListUi(); }
    if (val === 'new') { return; } // New list typed into combobox
    // resetPrevListUiState();
    _uPnl.updateSubmitEvent('#submit-list', editDataList);
    fillListData(val);
    enableInputs();
    enableModUi('add');
}
function editDataList() {
    const data = buildListData();
    data.id = _u.getSelVal('Int-lists');
    submitDataList(data, 'edit', onListSubmitComplete.bind(null, 'edit'));
}
function fillListData(id) {
    const lists = _u.getDataFromStorage('dataLists');                           
    const list = addActiveListToMemory(lists[id]);                              //console.log('activeList = %O', list);                                                 
    fillListDataFields(
        list.displayName, list.description, list.details.length);
}
/* ====================== EDIT INTERACTION LIST ============================= */
function buildListData() {
    const data = {
        displayName: $('#list-details input').val(),
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
function loadInteractionsInTable() {                                            //console.log('loading Interaction List in Table');
    app.tblState = tState().get();
    removePreviousTable();
    app.listLoaded = true;
    buildFocusDataTreeAndLoadGrid(app.tblState.curFocus);
    updateUi();
    delete app.tblState;
}
function updateUi() {
    app.tblState.api.expandAll();
    resetToggleTreeBttn(true);
    syncFilterUi(app.tblState.curFocus);
    updateListLoadButton('Reset to All Interactions', resetTable);
    hideSavedMsg();
    enableModUi('rmv');
    updateFilterStatusMsg();
}
function syncFilterUi(focus) {
    syncViewFiltersAndUi(focus);
    if ($('#saved-filters')[0].selectize) { 
        $('#saved-filters')[0].selectize.clear() 
    }
}
function updateListLoadButton(text, clickFunc) {
    $('#load-list').html(text);
    $('#load-list').off('click').click(clickFunc);
}
function buildFocusDataTreeAndLoadGrid(dataFocus) {
    tState().set({'intSet': app.list.details});
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
    $('#saved-ints')[0].selectize.addItem(list.id);
    showSavedMsg();
    toggleInstructions();  
    if (app.submitting === 'rmv') { loadInteractionsInTable(); }
    delete app.submitting;
}
function onListDeleteComplete(results) {                                        console.log('listDeleteComplete results = %O', results)
    updateUserNamedList(results.list, 'delete');
    updateDataListSel();
    $('#saved-ints')[0].selectize.open();
}
function showSavedMsg() {
    $('#list-submit-msg').fadeTo('slow', 1);
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
    const byOne = 'Click on an *interaction row to select. Hold ctrl/cmd to select multiple rows. Hold shift and click a 2nd row to select a range. Click "Save List" to add/remove selection. *Interaction rows are the colored base-level rows.';
    const all = 'Click "Save List" to add/remove all *interactions displayed in the table. *Interaction rows are the colored base-level rows.';
    return selMode === 'all' ? all : byOne;
}
/* ---- Reset & Enable/Disable UI --- */
function resetListUi() {
    clearAndDisableInputs();
    hideSavedMsg();
    // resetPrevListUiState();
}
function clearAndDisableInputs() {
    $('#list-details input, #list-details textarea').val('');
    $('#int-list-cnt').html('');
    disableModUi();
    disableInputs();
}
function enableInputs(creating) {                                               //console.log('enableInputs')
    $(`#list-details input, #list-details textarea, #add-mode+label, 
        #int-opts button, #mod-radios input, #mod-radios label`)
        .attr({'disabled': false}).css({'opacity': '1'});
    if (creating) { $('#delete-list').attr({'disabled': 'disabled'}).css({'opacity': '.5'});; }
}
function disableInputs() {                                                      //console.log('disableInputs')
    $(`#list-details input, #mod-radios input, #list-details textarea,
        #mod-list-pnl label, #int-opts button, #load-list+div`)
        .attr({'disabled': 'disabled'}).css({'opacity': '.5'});
}
function enableModUi(m) {                                                       //console.log('enableModUi')
    const mode = app.submitting || m;
    const inactiveMode = mode === 'add' ? 'rmv' : 'add';
    const label = mode === 'add' ? 
        'Add Interactions to List' : 'Remove Interactions from List';
    $('#mod-mode').html(label).css({'font-weight': 600});
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
function updateDataListSel() {
    const opts = _u.getOptsFromStoredData('dataListNames');                     
    opts.unshift({value: 'create', text: '...Add New Interaction List'});
    _u.replaceSelOpts('#saved-ints', opts);
}
// function resetPrevListUiState() {
//     if (!app.listLoaded || app.submitting) { return; }
//     resetTable();
//     updateListLoadButton('View Interaction List in Table', loadInteractionsInTable);  console.log('#################### listLoaded flag? ', listLoaded);
//     delete app.listLoaded;
// }
/* --- Table Methods --- */
/** Resets interactions displayed to the full default set of the current focus. */
function resetTable() {                                                         //console.log('- - - - - -resetingTable');
    removePreviousTable();
    tState().set({'intSet': false});                                            
    delete app.listLoaded;
    resetSearchState();
    enableModUi('add');
    $('#load-list').html('View Interaction List in Table');
    $('#load-list').off('click').click(loadInteractionsInTable);
    expandAllTableRows();
}
function removePreviousTable() {  
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
}