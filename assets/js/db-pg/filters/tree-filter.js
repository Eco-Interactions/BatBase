/*
 * Filters the interactions by the text in the tree column of the data table.
 * 
 * Exports:
 * 
 * 
 * TOC:
 */
import * as fM from './filters-main.js';
import { _ui, _u } from '../db-main.js';
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
    filterTreeData(getTreeFilterTextVal(entity));
}
function getTextFilterHandler(entity) {
    let h = { 'Location': filterLocs, 'Publication': updatePubSearch, 'Taxon': filterTaxa };
    return h[entity] ? h[entity] : filterTableByText;
}
export function getTreeFilterTextVal(entity) {                                         //console.log('getTreeFilterTextVal entity = ', entity);
    return $('input[name="sel'+entity+'"]').val().trim().toLowerCase();
}
/* ====================== APPLY FILTER ====================================== */

export function filterTableByText(text) {                                              //console.log('----filterTableByText [%s]', text);
    const tblState = tState().get(null, ['api', 'curFocus', 'rowData']);  
    tblState.api.setRowData(newRows); 
    updateTreeFilterState(text);
    _ui('updateFilterStatusMsg');
    _ui('setTreeToggleData', [false]);
    
    function getRowsAfterTextFilter(text) {
        const allRows = fM.getCurRowData();                     
        return text === "" ? allRows : getTreeRowsWithText(allRows, text);
    }
    function getTreeRowsWithText(data, text) {                                      //console.log('getTreeRowsWithText [%s] rows = %O', text, rows)
        const rows = data.map(row => Object.assign({}, row));
        return rows.filter(row => {  
            const isRow = ifRowContainsText(row, text); 
            if (rowChildrenAreTreeEntities(row)) {
                row.children = getTreeRowsWithText(row.children, text);
            }                                                                       //console.log('isRow = [%s] children [%s]', isRow, nonSrcRowHasChildren(row))
            return isRow || (nonSrcRowHasChildren(row) ? 
                !row.children[0].hasOwnProperty('interactionType') : false );
        });
    }
    function rowChildrenAreTreeEntities(row) {
        return nonSrcRowHasChildren(row) && !row.children[0].hasOwnProperty('interactionType');
    }
    function nonSrcRowHasChildren(row) { 
        if (tblState.curFocus === 'srcs') { return false; }
        return row.children && row.children.length > 0;
    }
}
function updateTreeFilterState(text) { 
    const val = !text ? false : '"'+text+'"';
    fM.setPanelFilterState('text', val);
}
function ifRowContainsText(row, text) {
    return row.name.toLowerCase().includes(text);
}
/* ================= SYNC WITH ACTIVE FILTERS =============================== */
/*------------------ LOCATION -----------------------------*/
function filterLocs(text) { 
    const selVal = getSelectedLoc();  
    if (selVal) { return updateLocSearch(selVal); }
    filterTableByText(text);
}
/* --- Get selected location data --- */
function getSelectedLoc() {
    const selObj = tState().get('selectedOpts');
    const selType = getSelectedLocType(selObj);
    return selObj[selType];
}
function getSelectedLocType(selected) {
    const sels = Object.keys(selected);
    return !sels.length ? getLocTypeFromElems() : (sels.length == 1 ? 'Region' : 'Country');
}
function getLocTypeFromElems() {
    const locType = ['Country', 'Region'].filter(type => hasSelVal($('#sel'+type).val()) );
    return locType.length == 1 ? locType[0] : null;
}
function hasSelVal(val) {
    return val && val !== 'all';
}
/* -------------------- TAXON ----------------------------------------------- */
function filterTaxa(text) {                                                     //console.log('filterTaxa! text [%s]', text);
    // updateTreeFilterState(text);
    updateTaxonSearch(text);
}