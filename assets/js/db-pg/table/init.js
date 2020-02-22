/**
 * Loads the formatted data using the ag-grid library and handles table styling.
 */
import * as agGrid from '../../../libs/grid/ag-grid.min.js';
import * as _forms from '../forms/forms-main.js';
import { updateFilterStatusMsg } from './filters/filters-main.js';
import unqVals from './filters/ag-grid-unique-filter.js';
import { lcfirst, getData } from '../util/util.js';
import { enableTableButtons, resetToggleTreeBttn, showTable } from '../pg-ui/ui-main.js';
import { accessTableState as tState, showLocOnMap } from '../db-main.js';

let tblState;

/**
 * Builds the table options object and passes everyting into agGrid, which 
 * creates and shows the table.
 */
export default function init(view, rowData, state) {                /*Perm-log*/console.log('           +--initTable [%s], rowData = %O, tblState = %O', view, rowData, state);
    tblState = state;
    destroyPreviousTable(state.api);
    return initTable(view, rowData)
        .then(() => onTableInitComplete(rowData));
}
function destroyPreviousTable(tblApi) {
    if (tblApi) { tblApi.destroy(); }
}
function initTable(view, rowData) {
    return getBaseTableConfg(view).then(tblOpts => {
        tblOpts.rowData = rowData;
        new agGrid.Grid($('#search-tbl')[0], tblOpts);
        updateTableState(tblOpts, rowData);
        sortTreeColumnIfTaxonFocused(); 
        onModelUpdated();
    });
}
/** Base table options object. */
function getBaseTableConfg(viewTitle) {
    return getColumnDefs(viewTitle).then(colDefs => {
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
    updateFilterStatusMsg();    
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
/**
 * Tree columns are hidden until taxon export and are used for the flattened 
 * taxon-tree data. The role is set to subject for 'bats' exports, object for 
 * plants and arthropods.
 */
function getColumnDefs(mainCol) { 
    const realm = tblState.curRealm || false;  
    return getData('tagNames').then(buildColDefs);

    function buildColDefs(tags) { 
        return [{headerName: mainCol, field: "name", width: getTreeWidth(), cellRenderer: 'group', suppressFilter: true,
                    cellRendererParams: { innerRenderer: addToolTipToTree, padding: 20 }, 
                    cellClass: getCellStyleClass, comparator: sortByRankThenName },     //cellClassRules: getCellStyleClass
                {headerName: "Subject Order", field: "subjOrder", width: 10, hide: true },
                {headerName: "Subject Family", field: "subjFamily", width: 10, hide: true },
                {headerName: "Subject Genus", field: "subjGenus", width: 10, hide: true },
                {headerName: "Subject Species", field: "subjSpecies", width: 10, hide: true },            
                {headerName: "Object Domain", field: "objDomain", width: 10, hide: true },
                {headerName: "Object Kingdom", field: "objKingdom", width: 10, hide: true },
                {headerName: "Object Phylum", field: "objPhylum", width: 10, hide: true },
                {headerName: "Object Class", field: "objClass", width: 10, hide: true },
                {headerName: "Object Order", field: "objOrder", width: 10, hide: true },
                {headerName: "Object Family", field: "objFamily", width: 10, hide: true },
                {headerName: "Object Genus", field: "objGenus", width: 10, hide: true },
                {headerName: "Object Species", field: "objSpecies", width: 10, hide: true },
                {headerName: "Edit", field: "edit", width: 50, hide: isNotEditor(), headerTooltip: "Edit", cellRenderer: addEditPencil },
                {headerName: "Editor", field: "updatedBy", width: 80, hide: true, headerTooltip: "Last Editied By", filter: unqVals },
                {headerName: "Cnt", field: "intCnt", width: 48, volatile: true, headerTooltip: "Interaction Count" },
                {headerName: "Map", field: "map", width: 39, hide: !ifLocView(), headerTooltip: "Show on Map", cellRenderer: addMapIcon },
                {headerName: "Subject Taxon", field: "subject", width: 141, cellRenderer: addToolTipToCells, comparator: sortByRankThenName },
                {headerName: "Object Taxon", field: "object", width: 135, cellRenderer: addToolTipToCells, comparator: sortByRankThenName },
                {headerName: "Type", field: "interactionType", width: 105, cellRenderer: addToolTipToCells, filter: unqVals },
                {headerName: "Tags", field: "tags", width: 75, cellRenderer: addToolTipToCells, 
                    filter: unqVals, filterParams: {values: Object.keys(tags)}},
                {headerName: "Citation", field: "citation", width: 111, cellRenderer: addToolTipToCells},
                {headerName: "Habitat", field: "habitat", width: 100, cellRenderer: addToolTipToCells, filter: unqVals },
                {headerName: "Location", field: "location", width: 122, hide: ifLocView(), cellRenderer: addToolTipToCells },
                {headerName: "Elev", field: "elev", width: 60, hide: !ifLocView(), cellRenderer: addToolTipToCells },
                {headerName: "Elev Max", field: "elevMax", width: 60, hide: true },
                {headerName: "Lat", field: "lat", width: 60, hide: !ifLocView(), cellRenderer: addToolTipToCells },
                {headerName: "Long", field: "lng", width: 60, hide: !ifLocView(), cellRenderer: addToolTipToCells },
                {headerName: "Country", field: "country", width: 102, cellRenderer: addToolTipToCells, filter: unqVals },
                {headerName: "Region", field: "region", width: 100, cellRenderer: addToolTipToCells, filter: unqVals },
                {headerName: "Note", field: "note", width: 100, cellRenderer: addToolTipToCells} ];
    }
}
/** Adds tooltip to Interaction row cells */
function addToolTipToCells(params) {
    var value = params.value || null;
    return value === null ? null : '<span title="'+value+'">'+value+'</span>';
}
/** --------- Tree Column ---------------------- */
/** Adds tooltip to Tree cells */
function addToolTipToTree(params) {      
    var name = params.data.name || null;                                        //console.log("params in cell renderer = %O", params)         
    return name === null ? null : '<span title="'+name+'">'+name+'</span>';
}
/** Returns the initial width of the tree column according to role and screen size. */
function getTreeWidth() { 
    var offset = ['admin', 'super', 'editor'].indexOf(tblState.userRole) === -1 ? 0 : 50;
    if (tblState.curFocus === 'locs') { offset = offset + 60; }
    return ($(window).width() > 1500 ? 340 : 273) - offset;
}
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
/**
 * Sorts the tree column alphabetically for all views. If in Taxon view, the 
 * rows are sorted first by rank and then alphabetized by name @sortTaxonRows. 
 */
function sortByRankThenName(a, b, nodeA, nodeB, isInverted) {                   //console.log("sortByRankThenName a-[%s] = %O b-[%s] = %O (inverted? %s)", a, nodeA, b, nodeB, isInverted);
    if (!a) { return 0; } //Interaction rows are returned unsorted
    if (tblState.curFocus !== "taxa") { return alphaSortVals(a, b); }
    return sortTaxonRows(a, b);
} 
function alphaSortVals(a, b) {
    var x = a.toLowerCase();
    var y = b.toLowerCase();
    return x<y ? -1 : x>y ? 1 : 0;
}  
/** If the table is Taxon focused, sort the tree column by taxon-rank and name. */
function sortTreeColumnIfTaxonFocused() {
    if (tblState.curFocus === 'taxa') {
        tblState.api.setSortModel([{colId: "name", sort: "asc"}]);
    }
}
/** 
 * Sorts each row by taxonomic rank and then alphabetizes by name.
 * "Unspecified" interaction groupings are kept at top so they remain under their 
 * source taxon. 
 */
function sortTaxonRows(a, b) {
    var lvls = ["Kingdom", "Phylum", "Class", "Order", "Family", "Genus", "Species"];
    var aParts = a.split(" ");
    var aLvl = aParts[0];   
    var aName = aParts[1];
    var bParts = b.split(" ");
    var bLvl = bParts[0];
    var bName = bParts[1];
    return  bLvl === "Unspecified" ? 1 : compareRankThenName();  

    function compareRankThenName() {
        return sortByRank() || sortByName();
    }
    function sortByRank() {
        if (lvls.indexOf(aLvl) === -1 || lvls.indexOf(bLvl) === -1) { return alphaSpecies(); }
        return lvls.indexOf(aLvl) === lvls.indexOf(bLvl) ? false :
            lvls.indexOf(aLvl) > lvls.indexOf(bLvl) ? 1 : -1; 
    }
    function sortByName() {
        return aName.toLowerCase() > bName.toLowerCase() ? 1 : -1;
    }
    function alphaSpecies() {                                             
        return lvls.indexOf(aLvl) !== -1 ? 1 :
            lvls.indexOf(bLvl) !== -1 ? -1 :
            a.toLowerCase() > b.toLowerCase() ? 1 : -1;
    }
}  /* End sortTaxonRows */
/** ------ Edit(or) Column(s) ---------- */
function isNotEditor() {  
    return ['admin', 'editor', 'super'].indexOf(tblState.userRole) === -1;
}
/** Adds an edit pencil for all tree nodes bound to the entity edit method. */
function addEditPencil(params) {   
    if (uneditableEntityRow(params)) { return "<span>"; }                     
    return getPencilHtml(params.data.id, params.data.entity, _forms.edit);
}
function uneditableEntityRow(params) {                                          //console.log('focus = [%s] params = %O', tblState.curFocus, params);
    const uneditables = [
        tblState.curFocus === 'locs' && 
            (['Region','Country','Habitat'].indexOf(params.data.type) !== -1),
        tblState.curFocus === 'taxa' && //Realm Taxa 
            (!params.data.parentTaxon && !params.data.interactionType),
        tblState.curFocus === 'srcs' && params.data.id === 0]; //Unspecifed publisher
    return uneditables.some(test => test);
}
function getPencilHtml(id, entity, editFunc) {
    const path = require('../../../images/icons/eif.pencil.svg');
    var editPencil = `<img src=${path} id="edit${entity}${id}"
        class="tbl-edit" title="Edit ${entity} ${id}" alt="Edit ${entity}">`;
    $('#search-tbl').off('click', '#edit'+entity+id);
    $('#search-tbl').on(
        'click', '#edit'+entity+id, _forms.edit.bind(null, id, lcfirst(entity)));
    return editPencil;
}
/** -------- Map Column ---------- */
function ifLocView() {                                           
    return tblState.curFocus === 'locs';
}
function addMapIcon(params) {                                                   //console.log('row params = %O', params);
    if (!params.data.onMap) { return '<span>'; }
    const id = params.data.id;
    const zoomLvl = getZoomLvl(params.data);  
    const path = require('../../../images/icons/marker-icon.png');
    const icon = `<img src='${path}' id='map${id}' alt='Map Icon' 
        title='Show on Map' style='height: 22px; margin-left: 9px; cursor:pointer;'>`;
    $('#search-tbl').off('click', '#map'+id);
    $('#search-tbl').on('click', '#map'+id, showLocOnMap.bind(null, params.data.onMap, zoomLvl));
    return icon;
}
function getZoomLvl(loc) {  
    return loc.type === 'Region' ? 4 : loc.type === 'Country' ? 5 : 7;   
}
/*================== Row Styling =========================================*/
/**
 * Adds a css background-color class to interaction record rows. Source-focused 
 * interaction rows are not colored, their name rows are colored instead. 
 */
function getRowStyleClass(params) {                                             //console.log("getRowStyleClass params = %O... lvl = ", params, params.data.treeLvl);
    if (params.data.name !== "") { return; } 
    return tblState.curFocus === "srcs" ? 
        getSrcRowColorClass(params.data) : getRowColorClass(params.data.treeLvl);
}
/**
 * Adds a background-color to cells with open child interaction rows, or cells 
 * with their grouped interactions row displayed - eg, Expanding the tree cell 
 * for Africa will be highlighted, as well as the 'Unspecified Africa Interactions'
 * cell Africa's interaction record rows are still grouped within. 
 */
function getCellStyleClass(params) {                                            //console.log("getCellStyleClass for row [%s] = %O", params.data.name, params);
    if ((params.node.expanded === true && isOpenRowWithChildInts(params)) || 
        isNameRowforClosedGroupedInts(params)) {                                //console.log("setting style class")
        return tblState.curFocus === "srcs" ? 
        getSrcRowColorClass(params.data) : getRowColorClass(params.data.treeLvl);
    } 
}
function isOpenRowWithChildInts(params) {
    if (params.data.locGroupedInts) { return locHasIntsAfterFilters(params); }     //console.log('params.data.interactions === true && params.data.name !== ""', params.data.interactions === true && params.data.name !== "")
    if (params.data.interactions === true && params.data.name !== "") {
        return tblState.curFocus === "taxa" ? txnHasIntsAfterFilters(params) : true;
    };
}
function txnHasIntsAfterFilters(params) {
    if (params.data.taxonLvl === 'Species') { return true; }
    return params.node.childrenAfterFilter.some(function(childRow) {
        return childRow.data.name.split(" ")[0] === "Unspecified";
    });
}
/**
 * Returns true if the location row's child interactions are present in 
 * data tree after filtering.
 */
function locHasIntsAfterFilters(params) {  
    return params.node.childrenAfterFilter.some(function(childRow) {
        return childRow.data.name.split(" ")[0] === "Unspecified";
    });
}
function isNameRowforClosedGroupedInts(params) {  
    return params.data.groupedInts === true;
}
/** Returns a color based on the tree level of the row. */
function getRowColorClass(treeLvl) {
    var rowColorArray = ['purple', 'green', 'orange', 'blue', 'red', 'turquoise', 'yellow'];
    var styleClass = 'row-' + rowColorArray[treeLvl];                           //console.log("styleClass = ", styleClass);
    return styleClass;
}
/** Alternates the row coloring. rowColorIdx added when row data built. */
function getSrcRowColorClass(params) {
    const rowColorArray = ['purple', 'green', 'orange', 'blue', 'red', 'turquoise', 'yellow'];
    const styleClass = 'row-' + rowColorArray[params.rowColorIdx];              //console.log("styleClass = ", styleClass);
    return styleClass;
}
function getNodeChildDetails(rcrd) {                                            //console.log("rcrd = %O", rcrd)  
    if (rcrd.isParent) {
        return { group: true, expanded: rcrd.open, children: rcrd.children };
    } else { return null; }
}
/* -------------------------------------------------------------------------- */
function updateTableState(tblOpts, rowData) {
    tblState.api = tblOpts.api;
    tState().set(
        {'api': tblOpts.api, 'columnApi': tblOpts.columnApi, 'rowData': rowData});
}
function onTableInitComplete(rowData) {
    hidePopUpMsg();
    enableTableButtons();
    hideUnusedColFilterMenus();
    if (tblState.intSet) { updateDisplayForShowingInteractionSet(rowData); }  
    updateFilterStatusMsg();
} 
function updateDisplayForShowingInteractionSet(rowData) {
    if (rowData.length == 0) { return tblState.api.showNoRowsOverlay(); }
    tblState.api.expandAll(); 
    resetToggleTreeBttn(true);
}
function hidePopUpMsg() {
    $('#db-popup, #db-overlay').hide();
    $('#db-popup').removeClass('loading'); //used in testing
    showTable();
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

/**
 * When the table rowModel is updated, the total interaction count for each 
 * tree node is updated. Interactions filtered out will not be included in the totals.
 * Updates the total interaction count displayed in the tool bar. 
 */
function onModelUpdated() {                                                     
    if (!tblState.api) { return; }
    const ttlInts = updateTotalRowIntCounts(tblState.api.getModel().rootNode);  //console.log("-----new total ints = ", ttlInts);
    updateTotalCountDisplay(ttlInts);
}
/**
 * Sets new interaction totals for each tree node @getChildrenCnt and then 
 * calls the table's softRefresh method, which refreshes any rows with "volatile"
 * set "true" in the columnDefs - currently only "Count".
 */
function updateTotalRowIntCounts(rootNode) {
    const ttlInts = getChildrenCnt(rootNode.childrenAfterFilter);  
    tblState.api.softRefreshView();
    return ttlInts;
}
function getChildrenCnt(nodeChildren) {                                         //console.log("nodeChildren =%O", nodeChildren)
    var nodeCnt, ttl = 0;
    nodeChildren.forEach(function(child) {
        nodeCnt = 0;
        nodeCnt += addSubNodeInteractions(child);
        ttl += nodeCnt;
        if (nodeCnt !== 0 && child.data.intCnt !== null) { child.data.intCnt = nodeCnt; }
    });
    return ttl;
}
/**
 * Interaction records are identified by their lack of any children, specifically 
 * their lack of a "childrenAfterFilter" property.
 */
function addSubNodeInteractions(child) {  
    var cnt = 0;
    if (child.childrenAfterFilter) {
        cnt += getChildrenCnt(child.childrenAfterFilter);
        if (cnt !== 0) { child.data.intCnt = cnt; }
    } else { /* Interaction record row */
        ++cnt;
        child.data.intCnt = null; 
    }
    return cnt;
}
function updateTotalCountDisplay(cnt) {  
    $("#tbl-cnt").text(`[ Interactions: ${cnt} ]`);
}

