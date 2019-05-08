/**
 * Handles the saving, editing, and display of saved lists of interactions.
 *
 *
 * Exports:                 Imported By:
 *     addDataListClickEvents       db-ui
 *     newIntList                   util
 *     selIntList                   util
 *     toggleSaveIntsPanel          db-ui
 */
import * as _u from '../util.js';

export function addDataListClickEvents() {
    $('#update-list').click(submitDataList);
}

export function toggleSaveIntsPanel() {                                         console.log('toggle data lists panel');
    if ($('#int-opts').hasClass('closed')) { buildAndShowIntPanel(); 
    } else { hideIntPanel(); }
}
function buildAndShowIntPanel() {                                               console.log('buildAndShowIntPanel')
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
    _u.replaceSelOpts('#saved-ints', [{value: 'create', text: 'Add New Interaction List'}]);
}
function hideIntPanel() {                                                       console.log('hideIntPanel')
    $('#int-opts').css('overflow-y', 'hidden');
    $('#db-opts-col4').removeClass('shw-col-borders hide-int-bttm-border');
    $('#int-opts').addClass('closed');
}
/** Creates a new list of saved interactions. */
export function newIntList(val) {                                               console.log('creating interaction list. val = ', val);
    enableInputs('create');
    $('#list-details input').val(val).focus();

    return { value: "new", text: val ? val : "Adding New Interaction List" };
}
/** Opens a saved list of interactions. */
export function selIntList(val) {                                               console.log('selecting interaction list. val = ', val);
    if (val === 'create' || !val) { return newIntList(''); }
    if (val === 'new') { return; }
    // fillListData();
    enableInputs();
}
function submitDataList() {
    const envUrl = $('body').data("ajax-target-url");
    const data = {
        displayName: $('#list-details input').val(),
        type: 'interaction',
        description: $('#list-details textarea').val(),
        details: "[]"
    };
    _u.sendAjaxQuery(data, envUrl + 'lists/create', listSubmitComplete);
}
function listSubmitComplete() {  console.log('listSubmitComplete arguments = %O', arguments);
        
}
/** ------------------ Util ------------------------------------------------- */
function disableInputs() {
    $('#int-opts input, #list-details textarea, #mod-list-pnl label, #int-opts button')
        .attr({'disabled': 'disabled'}).css({'opacity': '.5'});
}
function enableInputs(state) {
    const enableBttns = state === 'create' ? "#update-list" : '#int-opts button';  console.log('enableBttns = ', enableBttns)
    $('#list-details textarea, #list-details input, #mod-list-cntnr input, #mod-list-cntnr label, '+enableBttns)
        .attr({'disabled': false}).css({'opacity': '1'});
}