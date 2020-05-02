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
import * as _pg from '../../db-main.js';
import * as fPnl from './filter/filter-panel-main.js';
import * as iPnl from './int-list-panel.js';
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
/* ======================== EXTERNAL USE ==================================== */
/* ------------- FILTER SETS ------------- */
export function isSavedFilterSetActive() {
    return fPnl.savedFilterSetActive();
}
/* -------- INTERACTION LISTS ------------- */
export function isSavedIntListLoaded() {
    return iPnl.isSavedIntListLoaded();
}
/* -------- DYNAMIC FILTERS ------------- */
export function loadLocFilterPanelUi(tblState) {                      
    fPanel.loadLocFilterPanelUi(tblState);
}
export function loadSrcFilterPanelUi(realm) {                      
    fPanel.loadSrcFilterPanelUi(realm);
}
export function loadTxnFilterPanelUi(tblState) {
    fPanel.loadTxnFilterPanelUi(tblState);
}
/* -------- STATIC FILTERS ------------- */
export function toggleDateFilter(state) {
    fPanel.toggleDateFilter(state);
}
/* ============================ INTERNAL USE ================================ */
export function pg(funcName, params) {
    return _pg[funcName](...params);
}
export function pgUtil() {
    return _pg._util(...arguments);
}
export function getTableState() {
    return _pg.accessTableState();
}
export function resetDataTbl() {
    return _pg.resetDataTable();
}
export function modal() {
    return _pg.modal(...arguments);
}
export function updateUserNamedList(data, action) {
    return _pg.db('updateUserNamedList', [data, action]);
}
export function pgUi() {
    return _pg.ui(...arguments);
}
export function resetToggleTreeBttn(state) {
    return _pg.ui('resetToggleTreeBttn', [state]);
}
/* ********************* MAIN CODE ****************************************** */
/* ======================= EVENTS =========================================== */
export function addPanelEventsAndStyles(userRole) {
    require('../../../../styles/db/panels/panel.styl');  
    fPnl.initFilterPanel();
    iPnl.initListPanel();
    if (userRole !== 'visitor' || userRole !== 'user') { initReviewPanel(userRole); }
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
    iPnl.toggleListPanelOrientation('vert');
    fPnl.toggleFilterPanelOrientation('vert');
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
        fPnl.toggleFilterPanelOrientation('horz', panel.id.includes('filter'));
        iPnl.toggleListPanelOrientation('horz');
        $('#fltr-int-pnl-cntnr').attr('class', 'flex-col');
        $('#filter-pnl, #list-pnl').removeClass('flex-col').addClass('flex-row');
    }, 500);
}
/* ------------------------ UTIL ---------------------------------- */
function getOpenPanels() {
    return Object.keys(panels).filter(key => !$(panels[key].id).hasClass('closed'));
}
/* ================ SUBMIT AND SUCCESS METHODS ============================== */
export function submitUpdates(data, action, successFunc) {
    const envUrl = $('body').data("ajax-target-url");
    _util('sendAjaxQuery', [data, envUrl + 'lists/' + action, successFunc]);
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