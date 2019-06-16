/**
 * Strutural code and helpers for the menu panels
 */

/**
 * Exports:           Imported by:
 *     addPanelEvents       db-ui
 *     closeOpenPanels      db-ui
 *     parseUserNamed       save-fltrs, save-ints
 *     submitUpdates        save-fltrs, save-ints
 *     togglePanel          save-fltrs, save-ints
 *     updateSubmitEvent    save-fltrs, save-ints
 */
import * as _u from '../util.js';
import { addFilterPanelEvents } from './save-fltrs.js';
import { addListPanelEvents } from './save-ints.js';


/* ----------------- EVENT RELATED ------------------ */
export function addPanelEvents() {
    addFilterPanelEvents();
    addListPanelEvents();
}
export function updateSubmitEvent(id, event) {
    $(id).off('click').click(event);
}
/* -------------------  OPEN/CLOSE PANELS --------------------- */
export function closeOpenPanels() {
    ['#filter-opts', '#int-opts'].forEach(id => {
        if (!$(id).hasClass('closed')) { togglePanel(id, 'close'); }
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
/* ---------------- SUBMIT AND SUCCESS METHODS -------------------------------*/
export function submitUpdates(data, action, successFunc) {
    const envUrl = $('body').data("ajax-target-url");
    _u.sendAjaxQuery(data, envUrl + 'lists/' + action, successFunc);
}
/* ----------------- MISC ----------------------------------------------------*/
export function parseUserNamed(entity) {                                        
    return entity ? parseEntity(entity) : { details: [] };
}
function parseEntity(entity) {  
    entity.details = typeof entity.details == 'string' ? 
        JSON.parse(entity.details) : entity.details;
    return entity
}









