/**
 * Handles the saving, editing, and display of saved lists of interactions.
 *
 *
 * Exports:                 Imported By:
 *     newIntList                   util
 *     selIntList                   util
 *     toggleSaveIntsPanel          db-ui
 */
import * as _u from '../util.js';
import { updateUserNamedList } from '../db-sync.js';

let activeList;

export function toggleSaveIntsPanel() {                                         console.log('toggle data lists panel');
    if ($('#int-opts').hasClass('closed')) { buildAndShowIntPanel(); 
    } else { hideIntPanel(); }
}
function buildAndShowIntPanel() {                                               //console.log('buildAndShowIntPanel')
    showPanel();
    disableInputs();
    initListCombobox();
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
function hideIntPanel() {                                                       //console.log('hideIntPanel')
    $('#int-opts').css('overflow-y', 'hidden');
    $('#db-opts-col4').removeClass('shw-col-borders hide-int-bttm-border');
    $('#int-opts').addClass('closed');
}
/* --------------- Create New List ------------------- */
/** Creates a new list of saved interactions. */
export function newIntList(val) {                                               //console.log('creating interaction list. val = ', val);
    enableInputs('create');
    $('#list-details input, #list-details textarea').change(enableSubmitBttn);
    $('#list-details input').val(val).focus();
    $('#list-details textarea').val('');
    $('#int-list-cnt')[0].innerHTML = 0;
    $('#submit-list').off('click').click(createDataList);
    return { value: "new", text: val ? val : "Adding New Interaction List" };
}
function createDataList() {
    const data = buildListData();
    submitDataList(data, 'create');
}
/* --------------- Edit List ----------------------- */
/** Opens a saved list of interactions. */
export function selIntList(val) {                                               //console.log('selecting interaction list. val = ', val);
    if (val === 'create') { return newIntList(''); }
    if (!val) { return clearAndDisableInputs(); }
    if (val === 'new') { return; } // New list typed into combobox
    $('#submit-list').off('click').click(editDataList);
    $('#list-details input, #list-details textarea').change(enableSubmitBttn);
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
    const list = lists[id];                                                     console.log('activeList = %O', list);                                                 
    activeList = list;

    $('#list-details input').val(list.displayName);
    $('#list-details textarea').val(list.description);
    $('#int-list-cnt')[0].innerHTML = JSON.parse(list.details).length;
}
/** ------------------ Shared Util ------------------------------------------ */
function clearAndDisableInputs() {
    $('#list-details input, #list-details textarea').val('');
    disableInputs();
}
function disableInputs() {
    $('#int-opts input, #list-details textarea, #mod-list-pnl label, #int-opts button')
        .attr({'disabled': 'disabled'}).css({'opacity': '.5'});
}
function enableInputs(state) {
    const enableBttns = state === 'create' ? '' : ', #load-list';  
    $('#list-details textarea, #list-details input, #mod-list-cntnr input, #mod-list-cntnr label' + enableBttns)
        .attr({'disabled': false}).css({'opacity': '1'});
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
/* -------------- List create/edit helpers -------------- */
function buildListData() {
    return {
        displayName: $('#list-details input').val(),
        type: 'interaction',
        description: $('#list-details textarea').val(),
        details: "[]"
    };
}
function submitDataList(data, action) {
    const envUrl = $('body').data("ajax-target-url");
    _u.sendAjaxQuery(data, envUrl + 'lists/' + action, listSubmitComplete);
    
    function listSubmitComplete(results) {                                      
        const list = JSON.parse(results.list.entity);                           console.log('listSubmitComplete list = %O, id = %s', list, list.id)
        updateUserNamedList(results.list, action);
        updateDataListSel();
        $('#saved-ints')[0].selectize.addItem(list.id);
        showSavedMsg();
    }
}
function showSavedMsg() {
    $('#list-submit-msg').fadeTo('slow', 1);
}
function hideSavedMsg() {
    $('#list-submit-msg').fadeTo('slow', 0);
}