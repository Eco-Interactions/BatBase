/**
 * Left column: Contains all custom filters: Tree Text, Date Updated/Published, and
 *     Focus specific filters (Loc: Region/Country, Src: Pub Type, Txn: Rank Taxa )
 * Rigth column: Saved Filter Set managment
 *
 * TOC:
 *     FILTER SETS
 *     INIT PANEL
 *     SHOW/HIDE PANEL
 */
import * as pM from '../panels-main.js';
import { buildTable, _filter, _ui, _u, accessTableState as tState } from '../../../db-main.js';
import * as fSets from './filter-sets.js';

let timeout;

/* ========================= FILTER SETS ==================================== */
export function isFilterSetActive() {
    return fSets.isFilterSetActive();
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
/* ================================ Init ==================================== */
export function initFilterPanel() {
    require('../../../../../styles/pages/db/panels/filters.styl');
    addFilterPanelEvents();
    _filter('initDateFilterUi');
    fSets.disableFilterSetInputs();
}
export function addFilterPanelEvents() {
    $('#filter').click(toggleFilterPanel);
    $('button[name="reset-tbl"]').click(buildTable.bind(null, false, false));
    window.addEventListener('resize', resizeFilterPanelTab);
    fSets.setFilterSetEventListeners();
}
/* --- TAB PSEUDO INVISIBLE BOTTOM BORDER -------- */
function resizeFilterPanelTab() {
    if ($('#filter-pnl').hasClass('closed')) { return; }
    if (timeout) { return; }
    timeout = window.setTimeout(() => {
        sizeFilterPanelTab()
        timeout = false;
    }, 500);
}
/**
 * Working around a timeout in panel_u. Utlimately, this should be refactored
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
    const tabL = $('#filter-opts').position().left + 1;             /*dbug-log*///console.log('sizePanelTab. T = [%s], W = [%s], L = [%s]', panelT, tabW, tabL); console.trace();//1px border
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
    const borderW = Math.abs(tabL - $('#misc-opts').position().left + 1);       /*dbug-log*///console.log('sizeSplitPanelTab. T = [%s], W = [%s], L = [%s]', panelT, tabW, tabL); //1px border
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
/** Adds the focus to the filter panel header, "[Focus] and Date Filters" */
export function updateFilterPanelHeader(focus) {                    /*dbug-log*///console.log('updateFilterPanelHeader. focus [%s]', focus);  console.trace();
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
function buildAndShowFilterPanel() {                                /*dbug-log*///console.log('           +--buildAndShowFilterPanel')
    pM.togglePanel('filter', 'open');
    _u('getOptsFromStoredData', ['savedFilterNames']).then(fSets.updateFilterSetSel);
}
/* ======================= CLEAR FILTERS ==================================== */
/* -------------------- RESET BUTTON ---------------------------------------- */
export function enableClearFiltersButton() {                        /*dbug-log*///console.log('enableClearFiltersButton')
    const noFilters = !_filter('isFilterActive');
    const opac = noFilters ? .5 : 1;
    const cursor = noFilters ? 'inherit' : 'pointer';
    $('button[name="reset-tbl"]')
        .attr('disabled', noFilters).css('cursor', cursor).fadeTo('fast', opac);
}
/* ----------------------- RESET UI ----------------------------------------- */
export function clearFilterUi() {
    if ($('#filter-status').data('loading')) { return; } //DB initializing status displayed.
    resetFilterUi();
    resetStoredFiltersUi();
    _filter('resetFilterState');
}
function resetFilterUi() {
    resetFilterStatus();
    $('#focus-filters input[type="select-one"]').val('');
    $('label.txtLbl input[type="text"]').val('');
    if ($('div.selectize-control.multi').length) { clearMultiComboboxes() }
    if ($('#shw-chngd').prop('checked')) { _filter('clearDateFilter'); }
}
function resetFilterStatus() {
    $('#filter-status').text('No Active Filters.');
    updateTaxonFilterViewMsg('');
}
function clearMultiComboboxes() {
    $('div.selectize-control.multi input').each(clearMultiCombo);
}
function clearMultiCombo(i, el) {  
    const selId = el.id.split('-selectized')[0]
    $('#'+selId)[0].selectize.clear('silent');
}
function resetStoredFiltersUi() {
    if (!$('#selSavedFilters')[0].selectize) { return; }
    $('#selSavedFilters')[0].selectize.clear('silent');
    $('#stored-filters input, #stored-filters textarea').val('');
}
/* ======================== TABLE DATA-STATUS =============================== */
/** Used in taxon views to indicate the filtering happening at the view level. */
export function updateTaxonFilterViewMsg(view) {
    $('#view-fltr').text(view);
}
/**
 * Either displays all filters currently applied, or applies the previous filter
 * message persisted through table update into map view.
 */
export function updateFilterStatusMsg() {                                       //console.log("updateFilterStatusMsg called.");
    const tblState = tState().get(['api', 'intSet', 'flags']);
    if (!tblState.api || !tblState.flags.allDataAvailable) { return; }
    setFilterStatus(_filter('getActiveFilterVals'), tblState.intSet);
    enableClearFiltersButton();
}

function setFilterStatus(filters, intSet) {
    if (filters.length > 0 || intSet) {
        setStatus(getStatus(filters, intSet));
    } else {
        resetFilterUi()
    }
}
function getStatus(filters, intSet) {
    const list = intSet ? '(LIST)' : '';
    const set = fSets.isFilterSetActive() ? '(SET)' : '';
    const loaded = [list, set].filter(f=>f).join(' ');
    const fltrs = filters.join(', ');
    return loaded !== '' & fltrs !== '' ? `${loaded} ${fltrs}.` :
        loaded ? loaded : fltrs+'.';
}
function setStatus(status) {                                                    //console.log("setFilterStatus. status = ", status)
    $('#filter-status').text(status);
}