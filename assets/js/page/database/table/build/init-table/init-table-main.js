/**
 * Loads the formatted data using the ag-grid library and handles table styling.
 *
 * TOC
 *     INIT-TABLE CHAIN
 *     INTERNAL FACADE
 */
import { _ui, _u } from '~db';
import { tableState } from 'db/table/table-main.js';
import * as agGrid from 'libs/grid/ag-grid.js';
import { getBaseTableConfg } from './table-init-confg.js';
import * as style from './row-styles.js';
import * as model from './on-model-update.js';

let tblState;
/** ====================== INIT-TABLE CHAIN ================================= */
/**
 * Builds the table options object and passes everyting into agGrid, which
 * creates and shows the table.
 */
export function initTable(view, rowData, state) {                   /*perm-log*/console.log('           //--initTable [%s], rowData = %O, tblState = %O', view, rowData, state);
    tblState = state;
    destroyPreviousTable(state.api);
    return init(view, rowData)
        .then(() => onTableInitComplete(rowData));
}
function destroyPreviousTable(tblApi) {
    if (tblApi) { tblApi.destroy(); }
}
function init(view, rowData) {
    return getBaseTableConfg(view, tblState).then(tblOpts => {
        tblOpts.rowData = rowData;
        new agGrid.Grid($('#search-tbl')[0], tblOpts);
        updateTableState(tblOpts, rowData);
        sortTreeColumnIfTaxonFocused();
        onModelUpdated();
    });
}
/** If the table is Taxon focused, sort the tree column by taxon-rank and name. */
function sortTreeColumnIfTaxonFocused() {
    if (tblState.curFocus === 'taxa') {
        tblState.api.setSortModel([{colId: "name", sort: "asc"}]);
    }
}
/* -------------------------------------------------------------------------- */
function updateTableState(tblOpts, rowData) {
    tblState.api = tblOpts.api;
    tableState().set(
        {'api': tblOpts.api, 'columnApi': tblOpts.columnApi, 'rowData': rowData});
}
function onTableInitComplete(rowData) {
    _ui('hidePopupMsg');
    _ui('enableTableButtonsIfDataLoaded', [tblState.flags.allDataAvailable]);
    hideUnusedColFilterMenus();
    if (rowData.length == 0) { return tblState.api.showNoRowsOverlay(); }
    _ui('updateFilterStatusMsg');
}
/**
 * Hides the "tree" column's filter button. (Filtering on the group
 * column only filters the leaf nodes, by design. It is not useful here.)
 * Hides the sort icons for the 'edit' and 'map' columns.
 * Hides the filter button on the 'edit' and 'count' columns.
 *    Also hides for the map, elevation, latitude, longitude location columns.
 */
function hideUnusedColFilterMenus() {
    $('.ag-header-cell-menu-button.name').hide();
    $('.ag-header-cell-menu-button.edit').hide();
    $('.ag-header-cell-menu-button.intCnt').hide();
    $('.ag-header-cell-menu-button.map').hide();
    /** Hides sort icons for the map & edit columns. */
    $('div[colId="map"] .ag-sort-none-icon').hide();
    $('div[colId="map"] .ag-sort-ascending-icon').hide();
    $('div[colId="map"] .ag-sort-descending-icon').hide();
    $('div[colId="edit"] .ag-sort-none-icon').hide();
    $('div[colId="edit"] .ag-sort-ascending-icon').hide();
    $('div[colId="edit"] .ag-sort-descending-icon').hide();
    /* Hides filters for these loc data columns */
    $('.ag-header-cell-menu-button.elev').hide();
    $('.ag-header-cell-menu-button.lat').hide();
    $('.ag-header-cell-menu-button.lng').hide();
    $('div[colId="lat"] .ag-sort-none-icon').hide();
    $('div[colId="lat"] .ag-sort-ascending-icon').hide();
    $('div[colId="lat"] .ag-sort-descending-icon').hide();
    $('div[colId="lng"] .ag-sort-none-icon').hide();
    $('div[colId="lng"] .ag-sort-ascending-icon').hide();
    $('div[colId="lng"] .ag-sort-descending-icon').hide();
}
/* ========================= INTERNAL FACADE ================================ */
export function getRowStyleClass() {
    return style.getRowStyleClass(...arguments)
}
export function getCellStyleClass() {
    return style.getCellStyleClass(...arguments);
}
export function onModelUpdated() {
    model.onModelUpdated(tblState.api);
}