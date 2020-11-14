/**
 * Strutural code and helpers for the search-options panels
 *
 * Export
 *     addPanelEvents
 *     closeOpenPanels
 *     togglePanel
 *     updateSubmitEvent
 *
 * TOC
 *     FACADE
 *         EXTERNAL
 *         INTERNAL
 *     EVENTS
 *     OPEN/CLOSE PANELS
 *         OPEN PANEL(S)
 *         CLOSE PANEL(S)
 *     SUBMIT/SUCCESS METHODS
 *     MISC
 */
import { _db, _modal, _u } from '~util';
import * as fM from './filter-panel-main.js';
import * as iM from './int-list-panel.js';
import { initReviewPanel } from './data-review/review-panel-main.js';

/* Panel confg */
const panels = {
    'filter': { bttn: '#filter', key: 'filter',
        id: '#filter-pnl', tab: '#filter-opts', tabClass: 'hide-fltr-bttm-border'
    },
    'lists': { bttn: '#lists', key: 'lists',
        id: '#list-pnl',   tab: '#list-opts',   tabClass: 'hide-int-bttm-border'
    },
    // 'review': { bttn: '#rvw-data', key: 'review',
    //     id: '#review-pnl', tab: '#review-opts', tabClass: 'hide-rvw-bttm-border'
    // }
};

/* ************************* FACADE ***************************************** */
/* ======================== FILTER PANEL ==================================== */
export function resetFilterPanelOnFocusChange() {
    fM.resetFilterPanelOnFocusChange(...arguments);
}
export function updateFilterPanelHeader(focus) {
    fM.updateFilterPanelHeader(focus);
}
export function enableClearFiltersButton() {
    fM.enableClearFiltersButton();
}
export function clearFilterUi() {
    fM.clearFilterUi();
}
export function updateFilterStatusMsg() {
    fM.updateFilterStatusMsg();
}
export function updateTaxonFilterViewMsg(groupName) {
    fM.updateTaxonFilterViewMsg(groupName);
}
/* -------- INTERACTION LISTS ------------- */
export function enableListResetBttn() {
    return iM.enableListResetBttn();
}
/* ============================ INTERNAL USE ================================ */
export function updateUserNamedList(data, action) {
    return _db('updateUserNamedList', [data, action]);
}
/* ********************* MAIN CODE ****************************************** */
/* ======================= EVENTS =========================================== */
export function addPanelEventsAndStyles(userRole) {
    require('styles/pages/db/panels/panel.styl');
    setInfoButtonClickEvents();
    fM.initFilterPanel();
    iM.initListPanel();
    if (userRole !== 'visitor' || userRole !== 'user') { initReviewPanel(userRole); }
}
function setInfoButtonClickEvents() {
    $('#svd-list-hlp').click(_modal.bind(null, 'showInfoModal', ['saved-lists']));
    $('#svd-fltr-hlp').click(_modal.bind(null, 'showInfoModal', ['sel-FilterSet']));
    $('#fltr-pnl-hlp').click(_modal.bind(null, 'showInfoModal', ['filter-panel']));
}
export function updateSubmitEvent(id, event) {
    $(id).off('click').click(event);
}
/* ==================== OPEN/CLOSE PANELS =================================== */
export function closeOpenPanels() {
    const opened = getOpenPanels();
    opened.forEach(key => togglePanel(key, 'close'));
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
    window.setTimeout(() => $(panel.id).css('overflow-y', 'visible'), 1000);
}
function compatiblePanelOpened(opened, panel) {
    return panel.key === 'review' ? false : opened.every(k => ['filter', 'lists'].indexOf(k) >= 0);
}
function openVerticalPanels(panel) {
    $('#fltr-int-pnl-cntnr').attr('class', 'flex-row');
    $('#filter-pnl, #list-pnl').removeClass('flex-row').addClass('flex-col');
    cssOpenPanel(panel);
    iM.toggleListPanelOrientation('vert');
    fM.toggleFilterPanelOrientation('vert');
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
    window.setTimeout(() => $(panel.id).css('overflow-y', 'hidden'), 500);  //Handles potential overlap with opening and closing rapidly due to rapid clicking.
}
function closeVerticalPanel(panel) {
    cssClosePanel(panel);
    window.setTimeout(() => {
        fM.toggleFilterPanelOrientation('horz', panel.id.includes('filter'));
        iM.toggleListPanelOrientation('horz');
        $('#fltr-int-pnl-cntnr').attr('class', 'flex-col');
        $('#filter-pnl, #list-pnl').removeClass('flex-col').addClass('flex-row');
    }, 500);
}
/* ------------------------ UTIL ---------------------------------- */
function getOpenPanels() {
    return Object.keys(panels).filter(key => !$(panels[key].id).hasClass('closed'));
}