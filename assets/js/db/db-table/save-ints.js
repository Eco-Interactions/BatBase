/**
 * Handles the saving, editing, and display of saved lists of interactions.
 *
 *
 * Exports:                 Imported By:
 *     toggleSaveIntsPanel          db-ui
 */



export function toggleSaveIntsPanel() {  console.log('toggle save(d) ints panel');
    if ($('#int-opts').hasClass('closed')) { buildAndShowIntPanel(); 
    } else { hideIntPanel(); }
}
function buildAndShowIntPanel() {                                               console.log('buildAndShowIntPanel')
    $('#int-opts').removeClass('closed');  
    $('#db-opts-col4').addClass('shw-col-borders hide-int-bttm-border');
    // _u.initCombobox('Saved Filters');
    window.setTimeout(function() { $('#int-opts').css('overflow-y', 'visible')}, 500);
}
function hideIntPanel() {                                                       console.log('hideIntPanel')
    $('#int-opts').css('overflow-y', 'hidden');
    $('#db-opts-col4').removeClass('shw-col-borders hide-int-bttm-border');
    $('#int-opts').addClass('closed');
}