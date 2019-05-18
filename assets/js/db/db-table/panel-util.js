/**
 * Strutural code and helpers for the menu panels
 */

/**
 * Exports:           Imported by:
 *     addPanelEvents       db-ui
 *     cssClosePanel        save-ints
 *     cssOpenPanel         save-ints
 */
import * as _u from '../util.js';
import { addListPanelEvents } from './save-ints.js';


export function addPanelEvents() {
    addListPanelEvents();
}

/* -------------------  Open/Close Panels --------------------- */
export function cssOpenPanel(panelId) {
    const col = getMenuColumn(panelId);
    $(panelId).removeClass('closed');  
    $(col).addClass('shw-col-borders hide-int-bttm-border');
    window.setTimeout(function() { 
        $(panelId).css('overflow-y', 'visible')}, 500);  
}

export function cssClosePanel(panelId) {
    const col = getMenuColumn(panelId);                                      
    $(panelId).css('overflow-y', 'hidden');
    $(col).removeClass('shw-col-borders hide-int-bttm-border');
    $(panelId).addClass('closed');
}
function getMenuColumn(id) {
    return { 
        '#int-opts': '#db-opts-col4', 
    }[id];
}