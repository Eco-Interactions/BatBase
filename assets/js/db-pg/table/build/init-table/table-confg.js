/**
 * Base table-options object.
 *
 * Export
 *     getBaseTableConfg
 */
import { getColumnConfg } from './column-confg.js';
import { getRowStyleClass, onModelUpdated } from './init-table-main.js';

let tblState;

export function getBaseTableConfg(viewTitle, state) {
    tblState = state;
    return getColumnConfg(viewTitle, tblState).then(colDefs => {
        return {
            columnDefs: colDefs,
            enableColResize: true,
            enableFilter: true,
            enableSorting: true,
            getHeaderCellTemplate: getHeaderCellTemplate,
            getNodeChildDetails: getNodeChildDetails,
            getRowClass: getRowStyleClass.bind(null, tblState.curFous),
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