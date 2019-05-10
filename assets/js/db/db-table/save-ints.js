/**
 * Handles the saving, editing, and display of saved lists of interactions.
 *
 * Exports:                 Imported By:
 *     newIntList                   util
 *     selIntList                   util
 *     toggleSaveIntsPanel          db-ui
 */
import * as _u from '../util.js';
import { updateUserNamedList } from '../db-sync.js';
import { accessTableState as tState } from '../db-page.js';

/**
 * edits - tracks changes in interaction list on list submit
 * list - List open in panel
 * modMode - "add" || "rmv" interaction rows selected in table
 * tblApi - AgGrid table api
 */
let app = {};
/* ----------------------- Init Methods ------------------------------------- */
export function toggleSaveIntsPanel() {                                         console.log('toggle data lists panel');
    if ($('#int-opts').hasClass('closed')) { buildAndShowIntPanel(); 
    } else { hideIntPanel(); }
}
function buildAndShowIntPanel() {                                               //console.log('buildAndShowIntPanel')
    showPanel();
    disableInputs();
    initListCombobox();
    addInputEvents();
}
function showPanel() {
    $('#int-opts').removeClass('closed');  
    $('#db-opts-col4').addClass('shw-col-borders hide-int-bttm-border');
    window.setTimeout(function() { 
        $('#int-opts').css('overflow-y', 'visible');
        $('#saved-ints')[0].selectize.focus();  
    }, 500);  
}
function initListCombobox() {
    _u.initCombobox('Int-lists');   
    updateDataListSel();
}
function addInputEvents() {
    $('#add-mode').click(preventUnclick).change(updateModMode.bind(null, 'add'));
    $('#rmv-mode').click(preventUnclick).change(updateModMode.bind(null, 'rmv'));
    $('input[name="mod-list"]').on('change', toggleAddInstructions);
    $('#list-details input, #list-details textarea, input[name="mod-list"]').change(enableSubmitBttn);
}
function hideIntPanel() {                                                       //console.log('hideIntPanel')
    $('#int-opts').css('overflow-y', 'hidden');
    $('#db-opts-col4').removeClass('shw-col-borders hide-int-bttm-border');
    $('#int-opts').addClass('closed');
}
function preventUnclick(e) {
    const checkbox = $(this);
    if (!checkbox.is(':checked')) {
        e.preventDefault;
        return false
    }
}
function updateModMode(mode) {
    app.modMode = mode;
}
/* ----------------------- Create New List ---------------------------------- */
/** Creates a new list of saved interactions. */
export function newIntList(val) {                                               //console.log('creating interaction list. val = ', val);
    enableInputs();
    addSubmitEvent(createDataList);
    fillListDataFields(val, '', 0);
    addActiveListToMemory();
    return { value: "new", text: val ? val : "Adding New Interaction List" };
}
function createDataList() {
    const data = buildListData();
    submitDataList(data, 'create');
}
/* ----------------------- Edit List ---------------------------------------- */
/** Opens a saved list of interactions. */
export function selIntList(val) {                                               console.log('selecting interaction list. val = ', val);
    if (val === 'create') { return newIntList(''); }
    if (!val) { return clearAndDisableInputs(); }
    if (val === 'new') { return; } // New list typed into combobox
    addSubmitEvent(editDataList);
    fillListData(val);
    enableInputs();
    $('#add-mode').prop('checked', true);
}
function editDataList() {
    const data = buildListData();
    data.id = _u.getSelVal('Int-lists');
    submitDataList(data, 'edit');
}
function fillListData(id) {
    const lists = _u.getDataFromStorage('dataLists');                           
    const list = addActiveListToMemory(lists[id]);                              console.log('activeList = %O', list);                                                 
    fillListDataFields(
        list.displayName, list.description, list.details.length);
}
/** ================== Shared Util ========================================== */
/* ----------------- UI ------------------------------------------------------*/
function clearAndDisableInputs() {
    $('#list-details input, #list-details textarea, #int-list-cnt').val('');
    disableInputs();
    resetModUi();
}
function disableInputs() {
    $('#list-details input, #mod-radios input, #list-details textarea, #mod-list-pnl label, #int-opts button')
        .attr({'disabled': 'disabled'}).css({'opacity': '.5'});
}
function enableInputs() {
    $(`#list-details input, #list-details textarea, #add-mode+label, 
        #int-opts button, #mod-radios input, #mod-radios label`)
        .attr({'disabled': false}).css({'opacity': '1'});
}
function addSubmitEvent(submitEvent) {
    $('#submit-list').off('click').click(submitEvent);
}
function resetModUi() {                                                         console.log('resetModUi')
    $('input[type="radio"]').prop('checked', false);
    $('#mod-info').fadeTo('fast', 0, () => {
        $('#mod-info')[0].innerHTML = ''; 
    });
}
function toggleAddInstructions() {                                              console.log('toggleAddInstructions');
    $('#mod-info').fadeTo('fast', 0); 
    addInfoMsgAndUpdateTableSelection();
    $('#mod-info').fadeTo('slow', 1); 
}
function addInfoMsgAndUpdateTableSelection() {
    const byOne = 'Click on an *interaction row to select. Hold ctrl to select multiple rows. Hold shift and click a 2nd row to select a range. Click "Save Interaction List" to add/remove selection. *Interaction rows are the base level rows with data.';
    const all = 'Click "Save Interaction List" to add/remove all *interactions displayed in the table. *Interaction rows are the base level rows with data.';

    if ($('#mod-one-list').prop('checked')) { $('#mod-info')[0].innerHTML = byOne;
    } else { $('#mod-info')[0].innerHTML = all; }
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
/* --------------------- List Manipulation ---------------------------------- */
function addActiveListToMemory(list) {
    app.list = list ? parseList(list) : { details: [] };
    return app.list;
}
function parseList(list) {
    list.details = JSON.parse(list.details);
    return list
}
function buildListData() {
    const data = {
        displayName: $('#list-details input').val(),
        type: 'interaction',
        description: $('#list-details textarea').val(),
        details: getInteractions(),
    };
    app.edits = app.list.details.length !== data.details.length;
    data.details = JSON.stringify(data.details);      
    return data;
}
/* ----------- Add Interaction Rows ----------------- */
function getInteractions() {
    app.tblApi = tState().get('api');
    return $('#mod-one-list').prop('checked') ? 
        getUpdatedInteractionSet() : addAllInteractionsInTable();
}
function addAllInteractionsInTable() {
    app.tblApi = tState().get('api');
    app.tblApi.expandAll();
    app.tblApi.getModel().rowsToDisplay.forEach(selectInteractions);           
    return getUpdatedInteractionSet();
}
/** An interaction row has 'interactionType' data. */
function selectInteractions(rowNode) { 
    if (rowNode.data.interactionType !== undefined) { rowNode.setSelected(true); }
}
function getUpdatedInteractionSet() {
    const rows = app.tblApi.getSelectedNodes().map(r => { return r.data.id; }); console.log('selected rows = %O', rows);
    return [ ...new Set(rows.concat(app.list.details).filter(id => id))];
}
/* ---------------- Submit and Success Methods -------------------------------*/
function submitDataList(data, action) {
    const envUrl = $('body').data("ajax-target-url");
    _u.sendAjaxQuery(data, envUrl + 'lists/' + action, listSubmitComplete.bind(null, action));
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
    $('#list-submit-msg')[0].innerHTML = msg;
    $('#list-submit-msg').fadeTo('slow', 1);
    delete app.edits;
}
function hideSavedMsg() {
    $('#list-submit-msg').fadeTo('slow', 0);
    $('#list-submit-msg')[0].innerHTML = '';
}