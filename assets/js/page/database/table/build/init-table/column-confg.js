/**
 * Returns the column-confg object for the agGrid table.
 *
 * Export
 *     getColumnConfg
 *
 * TOC
 *     TREE COLUMN
 *     TAXONMY COLUMNS
 *     EDITOR COLUMNS
 *     MISC COLUMNS
 *     INTERACTION DATA COLUMNS
 */
import { _db, _u } from '~util';
import { _forms, _map } from '~db';
import { getCellStyleClass, getRowStyleClass } from './init-table-main.js';
import unqVals from 'db/table/filter/aggrid/ag-grid-unique-filter.js';
import { getInteractionRowTreeIcons, getShowIcon } from './tree-int-icon-render.js';

const mapIcon = require('images/icons/marker-icon.png').default;
const pencilSvg = require('images/icons/eif.pencil.svg').default;
let tblState;
/**
 * Tree columns are hidden until taxon export and are used for the flattened
 * taxon-tree data. The role is set to subject for 'bats' exports, object for
 * plants and arthropods.
 */
export function getColumnConfg(tblName, state) {
    tblState = state;
    return _db('getData', ['tagNames', true])
        .then(tags => buildColDefs(tblName, tags));
}
function buildColDefs(tblName, tags) {
    return [
        getTreeColumn(tblName),
        ...getHiddenTaxonmyColumns(),
        ...getEditorColumns(),
        ...getMiscColumns(), //tree-row intCnt, map-location link
        ...getInteractionDataColumns(tags)
    ];
}
/** =============================== TREE COLUMN ============================= */
function getTreeColumn(tblName) {
    return {
        headerName: tblName, field: "name", width: getTreeWidth(), cellRenderer: 'group',
        suppressFilter: true, cellRendererParams: { innerRenderer: handleTreeRowRender, padding: 20 },
        cellClass: getCellStyleClass.bind(null, tblState.curFocus), comparator: sortByRankThenName
    };
}
/** Returns the initial width of the tree column according to role and screen size. */
function getTreeWidth() {
    var offset = ['admin', 'super', 'editor'].indexOf(tblState.userRole) === -1 ? 0 : 50;
    if (tblState.curFocus === 'locs') { offset = offset + 66; }
    return ($(window).width() > 1500 ? 340 : 273) - offset;
}
function handleTreeRowRender (params) {
    const rowName = params.data.name || null;
    if (!rowName) { return getInteractionRowTreeIcons(params.data, tblState); }
    return tblState.curFocus === 'taxa' ?
        getTxnTreeCellHtml(params.data) : getToolTipTreeCellHtml(rowName);
}
/* -------------------- TREE-GROUP ROWS ------------------------------------- */
/* ----------- TOOL TIP ------------- */
function getToolTipTreeCellHtml(name) {
    return '<span title="'+name+'">'+name+'</span>';
}
/* --------------- TXN-TREE CELL ------------------ */
function getTxnTreeCellHtml(data) {
    return getToolTipTreeCellHtml(data.name) + getShowIcon('taxon', data.id, tblState);
}
/* ----------- SORT TAXON TREE AND COLUMNS --------------- */
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
/**
 * Sorts each row by taxonomic rank and then alphabetizes by name.
 * "Unspecified" interaction groupings are kept at top so they remain under their
 * source taxon.
 */
function sortTaxonRows(a, b) {
    var ranks = ["Kingdom", "Phylum", "Class", "Order", "Family", "Genus", "Species"];
    var aParts = a.split(" ");
    var aRank = aParts[0];
    var aName = aParts[1];
    var bParts = b.split(" ");
    var bRank = bParts[0];
    var bName = bParts[1];
    return  bRank === "Unspecified" ? 1 : compareRankThenName();

    function compareRankThenName() {
        return sortByRank() || sortByName();
    }
    function sortByRank() {
        if (ranks.indexOf(aRank) === -1 || ranks.indexOf(bRank) === -1) { return alphaSpecies(); }
        return ranks.indexOf(aRank) === ranks.indexOf(bRank) ? false :
            ranks.indexOf(aRank) > ranks.indexOf(bRank) ? 1 : -1;
    }
    function sortByName() {
        return aName.toLowerCase() > bName.toLowerCase() ? 1 : -1;
    }
    function alphaSpecies() {
        return ranks.indexOf(aRank) !== -1 ? 1 :
            ranks.indexOf(bRank) !== -1 ? -1 :
            a.toLowerCase() > b.toLowerCase() ? 1 : -1;
    }
}
/** =========================== TAXONMY COLUMNS ============================= */
function getHiddenTaxonmyColumns() {
    return [
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
    ];
}
/** ============================ EDITOR COLUMNS ============================= */
function getEditorColumns() {
    return [
        {headerName: "Edit", field: "edit", width: 50, hide: isNotEditor(), headerTooltip: "Edit", cellRenderer: addEditPencil },
        {headerName: "Editor", field: "updatedBy", width: 80, hide: true, headerTooltip: "Last Editied By", filter: unqVals },
    ];
}
/** -------------------------- Edit(or) Column(s) --------------------------- */
function isNotEditor() {
    return ['admin', 'editor', 'super'].indexOf(tblState.userRole) === -1;
}
/** Adds an edit pencil for all tree nodes bound to the entity edit method. */
function addEditPencil(params) {
    if (uneditableEntityRow(params)) { return "<span>"; }
    return getPencilHtml(params.data.id, params.data.entity);
}
function uneditableEntityRow(params) {                                          //console.log('focus = [%s] params = %O', tblState.curFocus, params);
    const uneditables = [
        tblState.curFocus === 'locs' &&
            (['Region','Country','Habitat'].indexOf(params.data.type) !== -1),
        tblState.curFocus === 'taxa' &&
            (!params.data.parentTaxon && !params.data.interactionType), //Group-Root Taxa
        tblState.curFocus === 'srcs' && params.data.id === 0]; //Unspecifed publisher
    return uneditables.some(test => test);
}
function getPencilHtml(id, entity) {
    var editPencil = `<img src=${pencilSvg} id="edit${entity}${id}"
        class="tbl-edit" title="Edit ${entity} ${id}" alt="Edit ${entity}">`;
    $('#search-tbl').off('click', '#edit'+entity+id);
    $('#search-tbl').on('click', '#edit'+entity+id,
        _forms.bind(null, 'edit', [entity, id]));
    return editPencil;
}
/** ============================ MISC COLUMNS =============================== */
function getMiscColumns() {
    return [
        {headerName: "Cnt", field: "intCnt", width: 48, volatile: true, headerTooltip: "Interaction Count" },
        {headerName: "Map", field: "map", width: 39, hide: !ifLocView(), headerTooltip: "Show on Map", cellRenderer: addMapIcon },
    ];
}
/** -------- Map Column ---------- */
function ifLocView() {
    return tblState.curFocus === 'locs';
}
function addMapIcon(params) {                                                   //console.log('row params = %O', params);
    if (!params.data.onMap) { return '<span>'; }
    const id = params.data.id;
    $('#search-tbl').off('click', '#map'+id);
    $('#search-tbl').on('click', '#map'+id,
        showLocOnPageMap.bind(null, params.data.onMap, params.data));
    return getMapIcon(id);
}
function showLocOnPageMap(id, loc) {
    _map('showLocOnMap', [id, getZoomLvl(loc)]);
}
function getMapIcon(id) {
    return `<img src='${mapIcon}' id='map${id}' alt='Map Icon' class='map-ico'
        title='Show on Map' style='${getMapIconStyles()}'>`;
}
function getMapIconStyles() {
    let styles = 'height: 22px; margin-left: 9px; cursor:pointer;';
    if ($('#shw-map').data('loading')) { styles += ' opacity: .3;' }
    return styles;
}
function getZoomLvl(loc) {
    return loc.type === 'Region' ? 4 : loc.type === 'Country' ? 5 : 7;
}
/** ========================= INTERACTION DATA COLUMNS ====================== */
function getInteractionDataColumns(tags) {
    return [
        {headerName: "Subject Taxon", field: "subject", width: respW('sub'), cellRenderer: addTitle, comparator: sortByRankThenName },
        {headerName: "Object Taxon", field: "object", width: respW('ob'), cellRenderer: addTitle, comparator: sortByRankThenName },
        {headerName: "Type", field: "interactionType", width: respW('typ'), cellRenderer: addTitle, filter: unqVals },
        getTagColDef(tags),
        {headerName: "Citation", field: "citation", width: respW('cit'), cellRenderer: addTitle},
        {headerName: "Habitat", field: "habitat", width: respW('hab'), cellRenderer: addTitle, filter: unqVals },
        {headerName: "Location", field: "location", width: respW('loc'), hide: ifLocView(), cellRenderer: addTitle },
        {headerName: "Elev", field: "elev", width: 60, hide: !ifLocView(), cellRenderer: addTitle },
        {headerName: "Elev Max", field: "elevMax", width: 60, hide: true },
        {headerName: "Lat", field: "lat", width: 60, hide: !ifLocView(), cellRenderer: addTitle },
        {headerName: "Long", field: "lng", width: 60, hide: !ifLocView(), cellRenderer: addTitle },
        {headerName: "Country", field: "country", width: respW('cty'), cellRenderer: addTitle, filter: unqVals },
        {headerName: "Region", field: "region", width: respW('reg'), cellRenderer: addTitle, filter: unqVals },
        {headerName: "Note", field: "note", width: respW('nt'), cellRenderer: addTitle}
    ];
}
function getTagColDef(tags) {
    const values = tags ? Object.keys(tags) : [];
    return {headerName: "Tags", field: "tags", width: 75, cellRenderer: addTitle,
                    filter: unqVals, filterParams: {values: values}}
}
/** Adds tooltip to Interaction row cells */
function addTitle(params) {
    var value = params.value || null;
    return value === null ? null : '<span title="'+value+'">'+value+'</span>';
}
function respW(col) {
    const pgW = $(window).width() < 1500 ? 'sml' : 'reg';
    const map = {
        sub: { sml: 133, reg: 141 }, ob:  { sml: 127, reg: 135 },
        typ: { sml: 88,  reg: 102 }, cit: { sml: 111, reg: 133 },
        hab: { sml: 90,  reg: 100 }, loc: { sml: 111, reg: 122 },
        cty: { sml: 94,  reg: 102 }, reg: { sml: 90,  reg: 100 },
        nt:  { sml: 100, reg: 127 }
    };
    return map[col][pgW];
}