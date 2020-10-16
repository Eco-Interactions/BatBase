/**
 * Loads the formatted data using the ag-grid library and handles table styling.
 */
import { getColumnConfg } from './column-confg.js';
import * as style from './row-styles.js';


import { tableState } from '../../table-main.js';
import { _forms, _map, _ui, _u } from '../../../db-main.js';
import * as agGrid from '../../../../../libs/grid/ag-grid.js';
let tblState;

export function getRowStyleClass() {
    return style.getRowStyleClass(...arguments)
}
export function getCellStyleClass() {
    return style.getCellStyleClass(...arguments);
}

/**
 * Builds the table options object and passes everyting into agGrid, which
 * creates and shows the table.
 */
export function initTable(view, rowData, state) {                /*Perm-log*/console.log('           //--initTable [%s], rowData = %O, tblState = %O', view, rowData, state);
    tblState = state;
    destroyPreviousTable(state.api);
    return init(view, rowData)
        .then(() => onTableInitComplete(rowData));
}
function destroyPreviousTable(tblApi) {
    if (tblApi) { tblApi.destroy(); }
}
function init(view, rowData) {
    return getBaseTableConfg(view).then(tblOpts => {
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
/** Base table options object. */
function getBaseTableConfg(viewTitle) {
    return getColumnConfg(viewTitle, tblState).then(colDefs => {
        return {
            columnDefs: colDefs,
            enableColResize: true,
            enableFilter: true,
            enableSorting: true,
            getHeaderCellTemplate: getHeaderCellTemplate,
            getNodeChildDetails: getNodeChildDetails,
            getRowClass: getRowStyleClass,
            onBeforeFilterChanged: beforeFilterChange,
            onAfterFilterChanged: afterFilterChanged,
            onBeforeSortChanged: onBeforeSortChanged,
            onModelUpdated: onModelUpdated,
            onRowGroupOpened: softRefresh,
            onRowSelected: rowSelected,
            rowHeight: 26,
            rowSelection: 'multiple',   //Used for csv export
            unSortIcon: true
        };
    });
}
function afterFilterChanged() {}                                                //console.log("afterFilterChange")
/** Resets Table Status' Active Filter display */
function beforeFilterChange() {                                                 //console.log("beforeFilterChange")
    _ui('updateFilterStatusMsg');
}
/** ------------------------ BEFORE SORT CHANGE ----------------------------- */
/** This method ensures that the Taxon tree column stays sorted by Rank and Name. */
function onBeforeSortChanged() {
    if (tblState.curFocus !== "taxa") { return; }
    var sortModel = tblState.api.getSortModel();                             //console.log("model obj = %O", sortModel)
    if (!sortModel.length) { return tblState.api.setSortModel([{colId: "name", sort: "asc"}]); }
    ifNameUnsorted(sortModel);
}
/** Sorts the tree column if it is not sorted. */
function ifNameUnsorted(model) {
    var nameSorted = model.some(function(colModel){
        return colModel.colId === "name";
    });
    if (!nameSorted) {
        model.push({colId: "name", sort: "asc"});
        tblState.api.setSortModel(model);
    }
}
/** If the interaction list panel is open, row selection triggers switch to add-by-one mode. */
function rowSelected() {
    if ($('#list-pnl').hasClass('closed') || $('#submit-list').data('submitting')) { return; }
    $('#unsel-rows').attr({'disabled': false}).fadeTo('slow', 1);
    if (!$('#mod-some-list').prop('checked')) {
        $('#mod-some-list').prop({checked: 'checked'}).change();
    }
}
/**
 * Copied from agGrid's default template, with columnId added to create unique ID's
 * @param  {obj} params  {column, colDef, context, api}
 */
function getHeaderCellTemplate(params) {
    var filterId = params.column.colId + 'ColFilterIcon';
    return '<div class="ag-header-cell">' +
        '  <div id="agResizeBar" class="ag-header-cell-resize"></div>' +
        '  <span id="agMenu" class="' + params.column.colId + ' ag-header-icon ag-header-cell-menu-button"></span>' + //added class here so I can hide the filter on the group column,
        '  <div id="agHeaderCellLabel" class="ag-header-cell-label">' +                                 //which breaks the table. The provided 'supressFilter' option doesn't work.
        '    <span id="agSortAsc" class="ag-header-icon ag-sort-ascending-icon"></span>' +
        '    <span id="agSortDesc" class="ag-header-icon ag-sort-descending-icon"></span>' +
        '    <span id="agNoSort" class="ag-header-icon ag-sort-none-icon"></span>' +
        '    <a name="' + filterId + '" id="agFilter" class="anything ag-header-icon ag-filter-icon"></a>' +
        '    <span id="agText" class="ag-header-cell-text"></span>' +
        '  </div>' +
        '</div>';
}
function softRefresh() { tblState.api.refreshView(); }
function getNodeChildDetails(rcrd) {                                            //console.log("rcrd = %O", rcrd)
    if (rcrd.isParent) {
        return { group: true, expanded: rcrd.open, children: rcrd.children };
    } else { return null; }
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
    if (tblState.intSet) { updateDisplayForShowingInteractionSet(rowData); }
    _ui('updateFilterStatusMsg');
}
function updateDisplayForShowingInteractionSet(rowData) {
    if (rowData.length == 0) { return tblState.api.showNoRowsOverlay(); }
    tblState.api.expandAll();
    _ui('setTreeToggleData', [true]);
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
/* --------------- UPDATE INTERACTION TOTAL ON MODEL CHANGE ----------------- */
/**
 * When the table rowModel is updated, the total interaction count for each
 * tree node is updated. Interactions filtered out will not be included in the totals.
 * Updates the total interaction count displayed in the tool bar.
 */
function onModelUpdated() {
    if (!tblState.api) { return; }
    const ttlInts = updateRowsAndGetIntCounts(tblState.api.getModel().rootNode);
    updateTotalCountDisplay(ttlInts);
}
/**
 * Note: softRefreshView refreshes any columns with "volatile" set "true" in the
 * columnDefs - currently only "Count"
 */
function updateRowsAndGetIntCounts(root) {
    const ttls = root.childrenAfterFilter.map(row => updateTotalRowIntCounts(0, row));
    tblState.api.softRefreshView();
    return ttls.reduce((ttl, cnt) => ttl += cnt, 0);
}
/** Sets new interaction totals for each tree node and returns count. */
function updateTotalRowIntCounts(total, row) {                      /*dbug-log*///console.log('updateTotalRowIntCounts. total [%s], row = %O', total, row);
    if (!row.childrenAfterFilter) { return total; }
    const rowCnt = ifChildRowsAreInteractions(row) ?
        row.childrenAfterFilter.length :
        row.childrenAfterFilter.reduce(updateTotalRowIntCounts, 0);
    row.data.intCnt = rowCnt;
    return total += rowCnt;
}
function ifChildRowsAreInteractions(row) {
    return !row.childrenAfterFilter.length ||
        !row.childrenAfterFilter[0].childrenAfterFilter;
}
function updateTotalCountDisplay(cnt) {
    $("#tbl-cnt").text(`[ Interactions: ${cnt} ]`);
}

