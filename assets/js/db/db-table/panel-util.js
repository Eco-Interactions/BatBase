/**
 * Strutural code and helpers for the menu panels
 */

/**
 * Exports:           Imported by:
 *     addPanelEvents       db-ui
 *     closeOpenPanels      db-ui
 *     togglePanel          db-filters, save-ints
 */
import * as _u from '../util.js';
import { addFilterPanelEvents } from './db-filters.js';
import { addListPanelEvents } from './save-ints.js';


export function addPanelEvents() {
    addFilterPanelEvents();
    addListPanelEvents();
}

/* -------------------  Open/Close Panels --------------------- */
export function closeOpenPanels() {
    ['#filter-opts', '#int-opts'].forEach(id => {
        if (!$(id).hasClass('closed')) { cssClosePanel(id); }
    })
}
export function togglePanel(id, state) {
    const col = getMenuColumn(id);
    const colClass = getColumnSpacerId(id);
    if (state === 'open') { cssOpenPanel(id, col, colClass) }
    else { cssClosePanel(id, col, colClass) }
}
function cssOpenPanel(id, col, colClass) {
    $(id).removeClass('closed');  
    $(col).addClass('shw-col-borders ' + colClass);
    window.setTimeout(function() { 
        $(id).css('overflow-y', 'visible')}, 500);  
}
function cssClosePanel(id, col, colClass) {
    $(id).css('overflow-y', 'hidden');
    $(col).removeClass('shw-col-borders ' + colClass);
    $(id).addClass('closed');
}
function getMenuColumn(id) {
    return { 
        '#filter-opts': '#db-opts-col2', 
        '#int-opts': '#db-opts-col4', 
    }[id];
}
function getColumnSpacerId(id) {
    return { 
        '#filter-opts': 'hide-fltr-bttm-border', 
        '#int-opts': 'hide-int-bttm-border', 
    }[id];
}
