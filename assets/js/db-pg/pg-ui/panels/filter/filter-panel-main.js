/**
 * Handles the saving, editing, and display of saved sets of filters.
 *
 * Exports:              
 *     initFilterPanel   
 *     getCurRowData
 *     newFilterSet      
 *     resetStoredFiltersUi
 *     savedFilterSetActive
 *     selFilterSet        
 *     setPanelFilterState
 *     updateFilterSel     
 *     
 * TOC:
 *     FILTER SETS
 *     FOCUS FILTERS
 *     FILTER STATE TRACKING
 *     INIT PANEL
 *     SHOW/HIDE PANEL
 */
import * as pM from '../panels-main.js';
import * as fEntity from './focus-filters/focus-filters-main.js';
import * as fSets from './filter-sets.js';
import * as fDate from './date-filter.js';
import * as fTree from './tree-filter.js';


import * as data_tree from '../../../table/format-data/data-tree.js';
import * as db_filters from '../../../table/filters/filters-main.js';
import * as frmt_data from '../../../table/format-data/aggrid-format.js'; 
import { updateUserNamedList } from '../../../local-data/db-sync.js';
import { accessTableState as tState, buildTable } from '../../../db-main.js';
import { resetToggleTreeBttn } from '../../../pg-ui/ui-main.js';
/**
 * Filter State Tracking
 * {str} timeout        Present when window is being resized.
 * {ary} fRowData       rowData when the date-filter is applied.
 * {obj} active
 *      combo: obj with combo-label (k): obj with text and value (k) with their respective values
 *      name: name filter string
 *      time: Obj with the datetime and filter type, time published or time added/updated 
 */
const fState = { active: {}};
/* ========================= FILTER SETS ==================================== */
export function savedFilterSetActive() {  
    return fSets.savedFilterSetActive();
}
export function updateFilterSetSel(filterOpts) {
    fSets.updateFilterSetSel(filterOpts);
}
export function newFilterSet(val) {                              
    return fSets.newFilterSet(val);
}
export function selFilterSet(val) {                                             
    fSets.selFilterSet(val);
}
export function reloadTableThenApplyFilters(filters, id) { 
    fSets.reloadTableThenApplyFilters(filters, id);
}
/* ====================== STATIC FILTERS ==================================== */
export function getTreeTextFilterElem(entity) {
    return fTree.getTreeTextFilterElem(entity);
}
export function filterTableByText(entity) {
    fTree.filterTableByText(entity);
}
export function getTreeFilterTextVal(entity) {
    return fTree.getTreeFilterTextVal(entity);
}
export function reapplyDateFilterIfActive() {
    if (!$('#shw-chngd')[0].checked) { return; }
    fDate.reapplyPreviousDateFilter(fState.active.date, 'skip'); 
}
export function toggleDateFilter(state) {
    fDate.toggleDateFilter(state);
}
export function showTodaysUpdates(focus) {
    fDate.showTodaysUpdates(focus);
}
export function syncViewFiltersAndUi(focus) {
    fDate.syncViewFiltersAndUi(focus);
}
/* ===================== DYNAMIC FILTERS ==================================== */
export function loadLocFilterPanelUi(tblState) {                      
    fEntity.loadLocFilterPanelUi(tblState);
}
export function updateLocSearch(val, selType) {                                 
    return fEntity.updateLocSearch(val, selType);
}
export function loadSrcFilterPanelUi(realm) {                      
    fEntity.loadSrcFilterPanelUi(realm);
}
export function updatePubSearch() {
    return fEntity.updatePubSearch();
}
export function loadTxnFilterPanelUi(tblState) {
    fEntity.loadTxnFilterPanelUi(tblState);
}
export function updateTaxonSearch(val, selLvl) {                                        
    return fEntity.updateTaxonSearch(val, selLvl);
}
export function newSelEl() {
    return fEntity.newSelEl(...arguments);
}
/* ========================== FILTER UTILITY METHODS ================================================================ */
/** If table is filtered by an external filter, the rows are stored in timeRows. */
export function getCurRowData() {                                                      //console.log('getCurRowData. timeRows = %O, baseRowData = %O', fPs.timeRows, tblState.rowData);
    return fState.fRowData ? fState.fRowData : pM.getTableState().get('rowData');
} 
/* ==================== FILTER STATE TRACKING =============================== */
export function setCurrentRowData(data) {
    fState.fRowData = data;
}
export function setPanelFilterState(key, value) {
    if (value === false) { delete fState.active[key]; 
    } else { fState.active[key] = value; }
}
export function getPanelFilterState(key) {
    return key ? fState.active[key] : fState.active;
}
/* ================================ Init ==================================== */
export function initFilterPanel() {
    require('../../../../../styles/db/panels/filters.styl');  
    addFilterPanelEvents();
    fDate.initDateFilterUi();
    fSets.disableFilterSetInputs();
}
export function addFilterPanelEvents() {  
    $('#filter').click(toggleFilterPanel);             
    $('button[name="reset-tbl"]').click(buildTable.bind(null, false, false));
    window.addEventListener('resize', resizeFilterPanelTab);
    fSets.setFilterSetEventListeners();
    $('#svd-fltr-hlp').click(pM.modal.bind(null, 'showHelpModal', ['selSavedFilters']));
    $('#fltr-pnl-hlp').click(pM.modal.bind(null, 'showHelpModal', ['filter-panel']));
}
/* --- TAB PSEUDO INVISIBLE BOTTOM BORDER -------- */
function resizeFilterPanelTab() {
    if ($('#filter-pnl').hasClass('closed')) { return; }
    if (fState.timeout) { return; }
    fState.timeout = window.setTimeout(() => {
        sizeFilterPanelTab()
        fState.timeout = false;
    }, 500);
}
/**
 * Working around a timeout in panel_util. Utlimately, this should be refactored
 * into the util file, but I'm in a time crunch. 
 */
function sizeFilterPanelTab() {
    window.setTimeout(function() { 
        const split = $('#filter-pnl').hasClass('vert');
        const pseudo = split ? getSplitPseudoBorderStyle() : getPseudoBorderStyle();
        const elemClass = '.hide-fltr-bttm-border' + (split ? '-vert' : '');
        $(elemClass + ':before').remove();
        $(elemClass).append(pseudo);
    }, 555);
}
function getPseudoBorderStyle() {
    const panelT = $('#filter-pnl').position().top;
    const tabW = $('#filter-opts').innerWidth();  
    const tabL = $('#filter-opts').position().left + 1;             /*debg-log*///console.log('sizePanelTab. T = [%s], W = [%s], L = [%s]', panelT, tabW, tabL); console.trace();//1px border
    return `<style>.hide-fltr-bttm-border:before { 
        position: absolute;
        content: '';
        height: 3px;
        z-index: 10;
        width: ${tabW}px;
        top: ${panelT}px;
        left: ${tabL}px;
        background: #f2f9f8;
        }</style>`;  
}
function getSplitPseudoBorderStyle() {
    const panelT = $('#filter-pnl').position().top;
    const tabL = getLeftSplitPos(); 
    const tabW = $('#filter-opts').innerWidth();
    const borderW = Math.abs(tabL - $('#misc-opts').position().left + 1);       /*debg-log*///console.log('sizeSplitPanelTab. T = [%s], W = [%s], L = [%s]', panelT, tabW, tabL); //1px border
    return `<style>.hide-fltr-bttm-border-vert:before { 
        position: absolute;
        content: '';
        height: 5px;
        z-index: 10;
        max-width: 133px;
        width: ${borderW}px;
        top: ${panelT}px;
        left: ${tabL}px;
        background: #f2f9f8;
        }</style>`;  
}
function getLeftSplitPos() {
    const pnlL = $('#filter-pnl').position().left;
    const tabL = $('#filter-opts').position().left + 1;
    return pnlL > (tabL - 2) ? pnlL : tabL;
}
export function resetStoredFiltersUi() {
    if (!$('#selSavedFilters')[0].selectize) { return; }
    $('#selSavedFilters')[0].selectize.clear('silent');
    $('#stored-filters input, #stored-filters textarea').val('');
}
/** Adds the focus to the filter panel header, "[Focus] and Date Filters" */
export function updateFilterPanelHeader(focus) {  
    const map = {
        locs: 'Location', srcs: 'Source', taxa: 'Taxon'
    };
    const hdrPieces = $('#focus-filter-hdr').text().split(' ');  
    hdrPieces.splice(0, 1, map[focus]);  
    $('#focus-filter-hdr').text(hdrPieces.join(' '));   
}
/* --- Toggle Panel Vertically or Horizontally --- */
export function toggleFilterPanelOrientation(style, close) {
    if (style == 'vert') { stackFilterPanel();
    } else { spreadFilterPanel(close); }
    sizeFilterPanelTab(); 
}
function stackFilterPanel() {
    $('#filter-pnl, #filter-col1, #stored-filters').addClass('vert');
    $('#filter-opts').removeClass('hide-fltr-bttm-border').addClass('hide-fltr-bttm-border-vert');
}
function spreadFilterPanel(close) { 
    $('#filter-pnl, #filter-col1, #stored-filters').removeClass('vert');
    $('#filter-opts').removeClass('hide-fltr-bttm-border-vert');
    if (!close) { $('#filter-opts').addClass('hide-fltr-bttm-border'); }
}
/* ====================== SHOW/HIDE PANEL =================================== */
export function toggleFilterPanel() {  
    if ($('#filter-pnl').hasClass('closed')) { 
        buildAndShowFilterPanel(); 
        sizeFilterPanelTab();
    } else { pM.togglePanel('filter', 'close'); }
}
function buildAndShowFilterPanel() {                                /*perm-log*/console.log('           +--buildAndShowFilterPanel')
    pM.togglePanel('filter', 'open');
    pM.pgUtil('getOptsFromStoredData', ['savedFilterNames']).then(fSets.updateFilterSetSel);
}