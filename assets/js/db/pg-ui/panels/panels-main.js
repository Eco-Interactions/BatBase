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
import * as _u from '../../util/util.js';
import { initFilterPanel, toggleFilterPanelOrientation } from './save-fltrs.js';
import { addListPanelEvents, toggleListPanelOrientation } from './save-ints.js';
import { addDataReviewEvents } from './data-review/review-panel-main.js';

/* ----------------- EVENT RELATED ------------------ */
export function addPanelEvents(userRole) {
    initFilterPanel();
    addListPanelEvents();
    if (userRole !== 'visitor' || userRole !== 'user') {
        addDataReviewEvents();
    }
}
export function updateSubmitEvent(id, event) {
    $(id).off('click').click(event);
}
/* -------------------  OPEN/CLOSE PANELS --------------------- */
export function closeOpenPanels() {
    ['#filter-opts-pnl', '#int-opts'].forEach(id => {
        if (!$(id).hasClass('closed')) { togglePanel(id, 'close'); }
    })
}
export function togglePanel(id, state) {
    const tab = getMenuColumn(id);
    const tabSpcr = getColumnSpacerId(id);
    if (state === 'open') { openPanel(id, tab, tabSpcr); }
    else { closePanel(id, tab, tabSpcr) }
}
/** Section of search options bar */
function getMenuColumn(id) {
    return { 
        '#filter-opts-pnl': '#filter-opts', 
        '#int-opts': '#list-opts', 
    }[id];
}
function getColumnSpacerId(id) {
    return { 
        '#filter-opts-pnl': 'hide-fltr-bttm-border', 
        '#int-opts': 'hide-int-bttm-border', 
    }[id];
}
/* -------------------------- Open Panel(s) ----------------------------- */
function openPanel(id, tab, tabSpcr) {
    if (!bothPanelsOpen(id)) { cssOpenPanel(id, tab, tabSpcr);
    } else { openVerticalPanels(id, tab, tabSpcr); }
}
function bothPanelsOpen(id) {
    const otherPnl = id.includes('int') ? '#filter-opts-pnl' : '#int-opts';
    return !$(otherPnl).hasClass('closed'); 
}
function cssOpenPanel(id, tab, tabSpcr) {
    const bttn = id.includes('int') ? 'button[name="int-set"]' : '#filter';
    $(bttn).addClass('panel-open-toggle');
    $(id).removeClass('closed');  
    $(tab).addClass('shw-col-borders ' + tabSpcr);
    window.setTimeout(function() { 
        $(id).css('overflow-y', 'visible')}, 500);  
}
function openVerticalPanels(id, tab, tabSpcr) {
    $('#fltr-int-panl-cntnr').attr('class', 'flex-row');
    $('#filter-opts-pnl, #int-opts').removeClass('flex-row').addClass('flex-col');
    cssOpenPanel(id, tab, tabSpcr);
    toggleListPanelOrientation('vert');
    toggleFilterPanelOrientation('vert');
}
/* ------------------------ Close Panel(s) --------------------------------- */
function closePanel(id, tab, tabSpcr) {
    if (!bothPanelsOpen(id)) { cssClosePanel(id, tab, tabSpcr);
    } else { closeVerticalPanel(id, tab, tabSpcr); }
}
function cssClosePanel(id, tab, tabSpcr) {
    const bttn = id.includes('int') ? 'button[name="int-set"]' : '#filter';
    $(bttn).removeClass('panel-open-toggle');
    $(id).css('overflow-y', 'hidden');
    $(tab).removeClass('shw-col-borders ' + tabSpcr);
    $(id).addClass('closed');
}
function closeVerticalPanel(id, tab, tabSpcr) {
    cssClosePanel(id, tab, tabSpcr);
    window.setTimeout(() => {
        toggleFilterPanelOrientation('horz', id.includes('filter'));
        toggleListPanelOrientation('horz');
        $('#fltr-int-panl-cntnr').attr('class', 'flex-col');
        $('#filter-opts-pnl, #int-opts').removeClass('flex-col').addClass('flex-row');
    }, 500);
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









