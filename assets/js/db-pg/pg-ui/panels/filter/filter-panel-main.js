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
import { _filter, _table, _ui, _u } from '../../../db-main.js';
import * as fSets from './filter-sets.js';

let timeout;

export function resetFilterPanelOnFocusChange(focus) {
    updateFilterPanelHeader(focus);
    $('#focus-filters').empty();
}
/* ========================= FILTER SETS ==================================== */
export function isFilterSetActive() {
    return fSets.isFilterSetActive();
}
export function onTableReloadCompleteApplyFilters(filters, id) {
    fSets.onTableReloadCompleteApplyFilters(filters, id);
}
/* ================================ Init ==================================== */
export function initFilterPanel() {
    require('../../../../../styles/pages/db/panels/filters.styl');
    addFilterPanelEvents();
    _filter('initDateFilterUi');
    fSets.initFilterSetsFeature();
}
export function addFilterPanelEvents() {
    $('#filter').click(toggleFilterPanel);
    $('button[name="reset-tbl"]').click(handleTableRebuild);
    window.addEventListener('resize', resizeFilterPanelTab);
}
function handleTableRebuild() {
    _table('buildTable', [false, false]);
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
    const borderW = Math.abs(tabL - $('#misc-opts').position().left + 1);/*dbug-log*///console.log('sizeSplitPanelTab. T = [%s], W = [%s], L = [%s]', panelT, tabW, tabL); //1px border
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
    if (isFilterSetActive()) { return; }
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
    if (!$('#sel-FilterSet')[0].selectize) { return; }
    $('#sel-FilterSet')[0].selectize.clear('silent');
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
    const tblState = _table('tableState').get(['api', 'flags']);
    if (!tblState.api || !tblState.flags.allDataAvailable) { return; }
    setFilterStatus(_filter('getActiveFilterVals'));
    enableClearFiltersButton();
}

function setFilterStatus(filters) {
    if (filters.length > 0) {
        setStatus(getStatus(filters));
    } else {
        resetFilterUi()
    }
}
function getStatus(filters) {
    let status = filters.join(', ') + '.';
    if (fSets.isFilterSetActive()) { status += ' (SET)'; }
    return status;
}
function setStatus(status) {                                                    //console.log("setFilterStatus. status = ", status)
    $('#filter-status').text(status);
}