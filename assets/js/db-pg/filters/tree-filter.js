/*
 * Filters the interactions by the text in the tree column of the data table.
 *
 * Exports:
 *      getRowsWithText
 *      getTreeTextFilterElem
 *      getTreeFilterVal
 *
 * TOC:
 *      BUILS FILTER ELEM
 *      SYNC WITH ACTIVE FILTERS
 */
import * as fM from './filters-main.js';
import { _ui, _u, accessTableState as tState } from '../db-main.js';
/* ====================== BUILD FILTER ELEM ================================= */
/** Returns a text input with submit button that will filter tree by text string. */
export function getTreeTextFilterElem(entity) {
    const lbl = buildTxtSearchLbl(entity);
    const span = _u('buildElem', ['span', { text: 'Name:' }]);
    const input = buildTxtSearchInput(entity);
    $(lbl).append([span, input]);
    return lbl;
}
function buildTxtSearchLbl(entity) {
    const classes = 'sel-cntnr flex-row' + (entity == 'Taxon' ? ' taxonLbl' : ' txtLbl');
    return _u('buildElem', ['label', { class: classes }]);
}
function buildTxtSearchInput(entity) {
    const attr = { type: 'text', name: 'sel'+entity,
        placeholder: entity+' Name (Press Enter to Filter)' };
    const input = _u('buildElem', ['input', attr]);
    addInputClass(entity, input);
    return addInputChangeEvent(entity, input);
}
function addInputClass(entity, input) {
    const map = { 'Location': 'locTxtInput', 'Taxon': 'taxonSel' };
    if (!map[entity]) { return; }
    $(input).addClass(map[entity]);
}
function addInputChangeEvent(entity, input) {
    $(input).change(onTextFilterChange.bind(null, entity));
    return input;
}
function onTextFilterChange(entity, e) {
    const filterTreeData = getTextFilterHandler(entity);
    const text = getTreeFilterVal(entity);
    updateTreeFilterState(text);
    filterTreeData(text);
}
function getTextFilterHandler(entity) {                                         //console.log('entity = [%s]', entity);
    let cmplxHndlrs = {
        'Location': filterLocs, 'Publication': filterSrcs, 'Taxon': filterTaxa
    };
    return cmplxHndlrs[entity] ? cmplxHndlrs[entity] : filterTableByText;
}
export function getTreeFilterVal(entity) {                         /*debug-log*///console.log('getTreeFilterVal entity = ', entity);
    return $('input[name="sel'+entity+'"]').val().trim().toLowerCase();
}
/* ====================== APPLY FILTER ====================================== */
export function filterTableByText(text) {                           /*perm-log*///console.log('       +filterTableByText [%s]', text);
    const tblState = tState().get(null, ['api', 'curFocus', 'rowData']);
    tblState.api.setRowData(getRowsAfterTextFilter(text));
    _ui('updateFilterStatusMsg');
    _ui('setTreeToggleData', [false]);

    function getRowsAfterTextFilter(text) {
        const allRows = fM.getCurRowData();
        return text === "" ? allRows : getTreeRowsWithText(allRows, text);
    }
}
function updateTreeFilterState(text) {
    const val = !text ? false : '"'+text+'"';
    fM.setFilterState('name', val, 'direct');
}
function ifRowContainsText(row, text) {                             /*dbug-log*///console.log('ifRow [%s] ContainsText [%s]', row.name, text);
    return row.name.toLowerCase().includes(text);
}
export function getTreeRowsWithText(data, text) {                   /*dbug-log*///console.log('getTreeRowsWithText [%s] rows = %O', text, rows)
    const curFocus = tState().get('curFocus');
    const rows = data.map(row => Object.assign({}, row));
    return rows.filter(filterRowByText);

    function filterRowByText(row) {
        const isRow = ifRowContainsText(row, text);
        if (rowChildrenAreTreeEntities(row)) {
            row.children = getTreeRowsWithText(row.children, text);
            return isRow || row.children.length;
        }                                                           /*dbug-log*///console.log('   isRow = [%s] children [%s]', isRow, nonSrcRowHasChildren(curFocus, row))
        return isRow;
    }
}
function rowChildrenAreTreeEntities(row) {
    return rowHasChildren(row) && rowChildrenAreNotInteractions(row);
}
function rowHasChildren(row) {
    // if (curFocus === 'srcs') { return false; } //Not sure why I wasn't trying to filter src child rows...
    return row.children && row.children.length > 0;
}
function rowChildrenAreNotInteractions(row) {
    return !row.children[0].hasOwnProperty('interactionType');
}
/* ================= SYNC WITH ACTIVE FILTERS =============================== */
/*------------------ LOCATION -----------------------------*/
function filterLocs(text) {
    fM.applyLocFilter(null, text);
}
/* ------------------- SOURCE ----------------------------------------------- */
function filterSrcs(text) {
    const pubTypeId = _u('getSelVal', ['Publication Type']);
    if (pubTypeId) {
        return fM.applyPubFilter(pubTypeId, text);
    }
    filterTableByText(text);
}
/* -------------------- TAXON ----------------------------------------------- */
function filterTaxa(text) {                                                     //console.log('filterTaxa! text [%s]', text);
    fM.applyTxnFilter(null, text);
}