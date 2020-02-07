/**
 * Strutural code and helpers for the search-options panels
 *
 * Exports:           Imported by:
 *     addPanelEvents       db-ui
 *     closeOpenPanels      db-ui
 *     parseUserNamed       filter-panel, save-ints
 *     submitUpdates        filter-panel, save-ints
 *     togglePanel          filter-panel, save-ints, review-panel
 *     updateSubmitEvent    filter-panel, save-ints
 *
 * TOC:
 *     EVENTS
 *     OPEN/CLOSE PANELS
 *         OPEN PANEL(S)
 *         CLOSE PANEL(S)
 *     SUBMIT/SUCCESS METHODS
 *     MISC
 */
import * as _u from '../../util/util.js';
import { initFilterPanel, toggleFilterPanelOrientation } from './filter-panel.js';
import { initListPanel, toggleListPanelOrientation } from './int-list-panel.js';
import { initReviewPanel } from './data-review/review-panel-main.js';

/* Panel confg */
const panels = { 
    'filter': { bttn: '#filter', key: 'filter',
        id: '#filter-pnl', tab: '#filter-opts', tabClass: 'hide-fltr-bttm-border'
    },
    'lists': { bttn: '#lists', key: 'lists',
        id: '#list-pnl',   tab: '#list-opts',   tabClass: 'hide-int-bttm-border'
    },
    'review': { bttn: '#rvw-data', key: 'review',
        id: '#review-pnl', tab: '#review-opts', tabClass: 'hide-rvw-bttm-border'
    }
};

/* ======================= EVENT RELATED ==================================== */
export function addPanelEventsAndStyles(userRole) {
    require('../../../../styles/db/panels/panel.styl');  
    initFilterPanel();
    initListPanel();
    if (userRole !== 'visitor' || userRole !== 'user') { initReviewPanel(userRole); }
}
export function updateSubmitEvent(id, event) {
    $(id).off('click').click(event);
}
/* ==================== OPEN/CLOSE PANELS =================================== */
export function closeOpenPanels() {
    const opened = getOpenPanels();
    opened.forEach(panelKey => togglePanel(key, 'close'));
}
export function togglePanel(key, state) {                                       //console.log('togglePanel [%s] [%s]', key, state);
    const panel = panels[key];
    if (state === 'open') { openPanel(panel); }
    else { closePanel(panel) }
}
/* -------------------------- Open Panel(s) --------------------------------- */
function openPanel(panel) {                                                     //console.log('openPanel = %O', panel);
    const opened = getOpenPanels();
    if (!opened.length) { return cssOpenPanel(panel); }
    if (compatiblePanelOpened(opened, panel)) { openVerticalPanels(panel); 
    } else { closeOpenedPanelThenOpenNewPanel(opened, panel); }
}
function cssOpenPanel(panel) {
    $(panel.bttn).addClass('panel-open-toggle');
    $(panel.id).removeClass('closed');  
    $(panel.tab).addClass('shw-col-borders ' + panel.tabClass);
    window.setTimeout(() => $(panel.id).css('overflow-y', 'visible'), 500);  
}
function compatiblePanelOpened(opened, panel) {
    return panel.key === 'review' ? false : opened.every(k => ['filter', 'lists'].indexOf(k) >= 0);
}
function openVerticalPanels(panel) {
    $('#fltr-int-pnl-cntnr').attr('class', 'flex-row');
    $('#filter-pnl, #list-pnl').removeClass('flex-row').addClass('flex-col');
    cssOpenPanel(panel);
    toggleListPanelOrientation('vert');
    toggleFilterPanelOrientation('vert');
}
function closeOpenedPanelThenOpenNewPanel(opened, panel) {                      //console.log('closeOpenedPanelThenOpenNewPanel. toClose = %O, newPanel = %O', opened, panel)
    opened.forEach(key => closePanel(panels[key]));
    window.setTimeout(() => cssOpenPanel(panel), 500);  
}
/* ------------------------ Close Panel(s) ---------------------------------- */
function closePanel(panel) {
    const opened = getOpenPanels();
    if (opened.length === 1) { cssClosePanel(panel);
    } else { closeVerticalPanel(panel); }
}
function cssClosePanel(panel) {
    $(panel.bttn).removeClass('panel-open-toggle');
    $(panel.id).css('overflow-y', 'hidden');
    $(panel.tab).removeClass('shw-col-borders ' + panel.tabClass);
    $(panel.id).addClass('closed');
}
function closeVerticalPanel(panel) {
    cssClosePanel(panel);
    window.setTimeout(() => {
        toggleFilterPanelOrientation('horz', panel.id.includes('filter'));
        toggleListPanelOrientation('horz');
        $('#fltr-int-pnl-cntnr').attr('class', 'flex-col');
        $('#filter-pnl, #list-pnl').removeClass('flex-col').addClass('flex-row');
    }, 500);
}
/* ------------------------ Shared ---------------------------------- */
function getOpenPanels() {
    return Object.keys(panels).filter(key => !$(panels[key].id).hasClass('closed'));
}
/* ================ SUBMIT AND SUCCESS METHODS ============================== */
export function submitUpdates(data, action, successFunc) {
    const envUrl = $('body').data("ajax-target-url");
    _u.sendAjaxQuery(data, envUrl + 'lists/' + action, successFunc);
}
/* ================= MISC =================================================== */
export function parseUserNamed(entity) {                                        
    return entity ? parseEntity(entity) : { details: [] };
}
function parseEntity(entity) {  
    entity.details = typeof entity.details == 'string' ? 
        JSON.parse(entity.details) : entity.details;
    return entity
}









