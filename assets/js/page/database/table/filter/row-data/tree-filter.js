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
import { _el } from '~util';
import * as fM from '../filter-main.js';
/* ====================== BUILD FILTER ELEM ================================= */
/** Returns a text input with submit button that will filter tree by text string. */
export function getTreeTextFilterElem(entity) {
    const lbl = buildTxtSearchLbl(entity);
    const span = _el('getElem', ['span', { text: 'Name:' }]);
    const input = buildTxtSearchInput(entity);
    $(lbl).append([span, input]);
    return lbl;
}
function buildTxtSearchLbl(entity) {
    const classes = 'sel-cntnr flex-row' + (entity == 'Taxon' ? ' taxonLbl' : ' txtLbl');
    return _el('getElem', ['label', { class: classes }]);
}
function buildTxtSearchInput(entity) {
    const attr = { type: 'text', name: 'name-'+entity,
        placeholder: entity+' Name (Press Enter to Filter)' };
    const input = _el('getElem', ['input', attr]);
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
/* ========================= APPLY FILTER =================================== */
function onTextFilterChange(entity, e) {
    const text = getTreeFilterVal(entity);
    updateTreeFilterState(text);
    fM.onFilterChangeUpdateRowData();
}
export function getTreeFilterVal(entity) {                         /*debug-log*///console.log('getTreeFilterVal entity = ', entity);
    return $('input[name="name-'+entity+'"]').val().trim().toLowerCase();
}
function updateTreeFilterState(text) {
    const val = !text ? false : '"'+text+'"';
    fM.setFilterState('name', val, 'direct');
}