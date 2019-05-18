/**
 * Handles the saving, editing, and display of saved lists of interactions.
 *
 * Exports:                 Imported By:
 *     addDomEvents                 db-ui
 *     hideIntPanel                 db-ui
 *     newIntList                   util
 *     selIntList                   util
 *     toggleSaveIntsPanel          db-ui
 */
import * as _u from '../util.js';
import * as data_tree from './build-data-tree.js';
import * as frmt_data from './format-data.js'; 
import { updateUserNamedList } from '../db-sync.js';
import { accessTableState as tState, resetSearchState } from '../db-page.js';
import { resetToggleTreeBttn } from './db-ui.js';
import { updateFilterStatusMsg, syncViewFiltersAndUi } from './db-filters.js';

/**
 * list - List open in panel
 * listLoaded - List loaded in table
 * tblApi - AgGrid table api
 * tblState - state data for table and search page
] */
let app = {};

export function addDomEvents() {
    addEvents();
}
function addEvents() {
    $('#add-mode').change(() => app.modMode = 'add');
    $('#rmv-mode').change(() => app.modMode = 'rmv');
    $('input[name="mod-list"]').on('change', toggleInstructions);
    $('#unsel-rows').click(deselectAllRows);
    $('#list-details input, #list-details textarea, input[name="mod-list"]').change(enableSubmitBttn);
    $('#load-list').click(loadInteractionsInTable);
    $('#delete-list').click(deleteInteractionList);
    $('#confm-delete').click(confmDelete);
    $('#cncl-delete').click(cancelDelete);
}
/* ====================== SHOW/HIDE LIST PANEL ============================== */
export function toggleSaveIntsPanel() {                                         console.log('toggle data lists panel');
    if ($('#int-opts').hasClass('closed')) { buildAndShowIntPanel(); 
    } else { hideIntPanel(); }
}
function buildAndShowIntPanel() {                                               //console.log('buildAndShowIntPanel')
    showPanel();
    if (!tState().get('intSet')) {
        disableInputs();
        initListCombobox();
        expandAllTableRows();
        enableModUi('add');
        window.setTimeout(function() { 
            $('#saved-ints')[0].selectize.focus();  
        }, 500);         
    }
}
function showPanel() {
    $('#int-opts').removeClass('closed');  
    $('#db-opts-col4').addClass('shw-col-borders hide-int-bttm-border');
    window.setTimeout(function() { 
        $('#int-opts').css('overflow-y', 'visible')}, 500);  
}
export function hideIntPanel() {                                                //console.log('hideIntPanel')
    $('#int-opts').css('overflow-y', 'hidden');
    $('#db-opts-col4').removeClass('shw-col-borders hide-int-bttm-border');
    $('#int-opts').addClass('closed');
}
/* ============== CREATE/OPEN INTERACTION LIST ============================== */
/* ------ CREATE LIST ------- */
/** Creates a new list of saved interactions. */
export function newIntList(val) {                                               //console.log('creating interaction list. val = ', val);
    enableInputs('create');
    addSubmitEvent(createDataList);
    fillListDataFields(val, '', 0);
    addActiveListToMemory();
    return { value: "new", text: val ? val : "Creating New Interaction List" };
}
function createDataList() {
    const data = buildListData();
    submitDataList(data, 'create');
}
/* ------ OPEN LIST ------- */
/** Opens a saved list of interactions. */
export function selIntList(val) {                                               //console.log('selecting interaction list. val = ', val);
    if (val === 'create') { return newIntList(''); }
    if (!val) { return resetListUi(); }
    if (val === 'new') { return; } // New list typed into combobox
    resetPrevListUiState();
    addSubmitEvent(editDataList);
    fillListData(val);
    enableInputs();
}
function editDataList() {
    const data = buildListData();
    data.id = _u.getSelVal('Int-lists');
    submitDataList(data, 'edit');
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
/* ----- ADD ROWS ----- */
function getInteractions() {
    app.tblApi = tState().get('api');
    return $('#mod-one-list').prop('checked') ? getUpdatedInteractionSet() : 
        $('#mod-all-list').prop('checked') ? addAllInteractionsInTable() : [];
}
function addAllInteractionsInTable() {
    app.tblApi = tState().get('api');
    app.tblApi.expandAll();
    resetToggleTreeBttn(true);
    app.tblApi.getModel().rowsToDisplay.forEach(selectInteractions.bind(null, true));           
    return getUpdatedInteractionSet();
}
/** An interaction row has 'interactionType' data. Selected or unselects all rows. */
function selectInteractions(select, rowNode) { 
    if (rowNode.data.interactionType !== undefined) { rowNode.setSelected(select); }
}
function getUpdatedInteractionSet() {
    const rows = app.tblApi.getSelectedNodes().map(r => { return r.data.id; }); //console.log('selected rows = %O', rows);
    return [ ...new Set(rows.concat(app.list.details).filter(id => id))];
}
/* ----- REMOVE ROWS ----- */

/* ====================== DELETE INTERACTION LIST =========================== */
function deleteInteractionList() {                                              //console.log('deleteInteractionList')
    $('#delete-list').hide();
    $('.confm-cntnr').show();    
}
function confmDelete() {
    resetDeleteButton();
    deleteDataList({id: app.list.id});
}
function cancelDelete() {
    resetDeleteButton();
}
function resetDeleteButton() {
    $('.confm-cntnr').hide();    
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
    tState().set('intSet', app.list.details);
    buildFocusDataTreeAndLoadGrid(app.tblState.curFocus);
    enableModUi('rmv');
    app.tblState.api.expandAll();
    updateUi();
    app.listLoaded = true;
    delete app.tblState;
}
function updateUi() {
    resetToggleTreeBttn(true);
    syncViewFiltersAndUi(app.tblState.curFocus);
    updateFilterStatusMsg();
    updateListLoadButton('Reset to All Interactions', resetTable);
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

/* ---------------- SUBMIT AND SUCCESS METHODS -------------------------------*/
/** Submit new or edited interaction list. */
function submitDataList(data, action) {
    const envUrl = $('body').data("ajax-target-url");
    _u.sendAjaxQuery(data, envUrl + 'lists/' + action, listSubmitComplete.bind(null, action));
}
function listSubmitComplete(action, results) {                                      
    const list = JSON.parse(results.list.entity);                               console.log('listSubmitComplete results = %O, list = %O', results, list)
    updateUserNamedList(results.list, action);
    updateDataListSel();
    $('#saved-ints')[0].selectize.addItem(list.id);
    showSavedMsg();
}
/** Submit new or edited interaction list. */
function deleteDataList(data) {
    const envUrl = $('body').data('ajax-target-url');
    _u.sendAjaxQuery(data, envUrl + 'lists/delete', listDeleteComplete);
}
function listDeleteComplete(results) {                                          console.log('listDeleteComplete results = %O', results)
    updateUserNamedList(results.list, 'delete');
    updateDataListSel();
    $('#saved-ints')[0].selectize.open();
}
function showSavedMsg(msgClass) {
    $('#int-list-msg').fadeTo('slow', 1);
}
function hideSavedMsg() {
    $('#int-list-msg').fadeTo('slow', 0);
}
/* ----------------- UI -------------*/
function initListCombobox() {
    _u.initCombobox('Int-lists');   
    updateDataListSel();
}
function toggleInstructions() {                                                 //console.log('toggleInstructions');
    $('#mod-info').fadeTo('fast', 0); 
    addInfoMsgAndUpdateTableSelection();
    $('#mod-info').fadeTo('slow', 1);
}
function addInfoMsgAndUpdateTableSelection() {
    const byOne = 'Click on an *interaction row to select. Hold ctrl to select multiple rows. Hold shift and click a 2nd row to select a range. Click "Save List" to add/remove selection. *Interaction rows are the colored base-level rows.';
    const all = 'Click "Save List" to add/remove all *interactions displayed in the table. *Interaction rows are the colored base-level rows.';

    if ($('#mod-one-list').prop('checked')) { $('#mod-info')[0].innerHTML = byOne;
    } else { $('#mod-info')[0].innerHTML = all; }
}
function resetListUi() {
    clearAndDisableInputs();
    hideSavedMsg();
    resetPrevListUiState();
}
function clearAndDisableInputs() {
    $('#list-details input, #list-details textarea, #int-list-cnt').val('');
    $('#int-list-cnt').html('');
    disableInputs();
}
function disableInputs() {
    $(`#list-details input, #mod-radios input, #list-details textarea,
        #mod-list-pnl label, #int-opts button, #mod-info`)
        .attr({'disabled': 'disabled'}).css({'opacity': '.5'});
}
function enableInputs(creating) {
    $(`#list-details input, #list-details textarea, #add-mode+label, 
        #int-opts button, #mod-radios input, #mod-radios label, #mod-info`)
        .attr({'disabled': false}).css({'opacity': '1'});
    if (creating) { $('#delete-list').attr({'disabled': 'disabled'}).css({'opacity': '.5'});; }
}
function addSubmitEvent(submitEvent) {
    $('#submit-list').off('click').click(submitEvent);
}
function enableModUi(mode) { 
    const inactiveMode = mode === 'add' ? 'rmv' : 'add';
    $(`#${inactiveMode}-mode`).prop('checked', false);
    $(`label[for="${inactiveMode}-mode"]`).css('opacity', .5);

    $(`#${mode}-mode`).prop('checked', true);
    $(`label[for="${mode}-mode"]`).css('opacity', 1);
    $(`#mod-all-list`).prop('checked', true).change();
}
function enableSubmitBttn() {
    $('#submit-list').attr({'disabled': false}).css({'opacity': '1'});
    hideSavedMsg();
}
function fillListDataFields(nameVal, descVal, intCnt) {
    $('#list-details input').val(nameVal).focus();
    $('#list-details textarea').val(descVal);
    $('#int-list-cnt')[0].innerHTML = intCnt;  
    if (intCnt > 0) { $('#load-list').attr({disabled: false}).css({opacity: 1}); }
}
function updateDataListSel() {
    const opts = _u.getOptsFromStoredData('dataListNames');                     
    opts.unshift({value: 'create', text: '...Add New Interaction List'});
    _u.replaceSelOpts('#saved-ints', opts);
}
function resetPrevListUiState() {
    if (!app.listLoaded) { return; }
    resetTable();
    updateListLoadButton('View Interaction List in Table', loadInteractionsInTable);
    delete app.listLoaded;
}
function addActiveListToMemory(list) {
    app.list = list ? parseList(list) : { details: [] };
    return app.list;
}
function parseList(list) {
    list.details = JSON.parse(list.details);
    return list
}
/** Resets interactions displated to the full feault set of the current focus. */
function resetTable() {                                                         //console.log('- - - - - -resetingTable');
    removePreviousTable();
    tState().set({'intSet': false});                                            
    delete app.listLoaded;
    resetSearchState();
    $('#load-list').html('View Interaction List in Table');
    $('#load-list').off('click').click(loadInteractionsInTable);
}
function removePreviousTable() {
    app.tblState.api.destroy();
}
function expandAllTableRows() {
    app.tblApi = tState().get('api');
    app.tblApi.expandAll();
    resetToggleTreeBttn(true);
}
function deselectAllRows() {                                                    console.log('unselect all rows');
    app.tblApi = tState().get('api');
    app.tblApi.getModel().rowsToDisplay.forEach(selectInteractions.bind(null, false));           
}











