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


export function toggleSaveIntsPanel() {                                         console.log('toggle data lists panel');
    if ($('#int-opts').hasClass('closed')) { buildAndShowIntPanel(); 
    } else { hideIntPanel(); }
}
function buildAndShowIntPanel() {                                               console.log('buildAndShowIntPanel')
    $('#int-opts').removeClass('closed');  
    $('#db-opts-col4').addClass('shw-col-borders hide-int-bttm-border');
    _u.initCombobox('Int-lists');   
    $('#saved-ints')[0].selectize.clear();  //Can't figure out why an option is being selected
    window.setTimeout(function() { $('#int-opts').css('overflow-y', 'visible')}, 500);  
}
function hideIntPanel() {                                                       console.log('hideIntPanel')
    $('#int-opts').css('overflow-y', 'hidden');
    $('#db-opts-col4').removeClass('shw-col-borders hide-int-bttm-border');
    $('#int-opts').addClass('closed');
}

/** Creates a new list of saved interactions. */
export function newIntList() {                                                  console.log('creating interaction list');
    // body...
}
/** Opens a saved list of interactions. */
export function selIntList() {                                                  console.log('selecting interaction list');
    // body...
}