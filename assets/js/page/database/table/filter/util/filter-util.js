/**
 * Database filter util methods.
 */
import {  _el } from '~util';
import { _table, _ui } from '~db';

const tState = _table.bind(null, 'tableState');
/* ---------------------------- BUILD --------------------------------------- */
export function newSel(opts, c, i, field) {                         /*dbug-log*///console.log('--newSel opts[%O], c[%s], i[%s], field[%s]', opts, c, i, field);
    const elem = _el('getSelect', [opts, { class: c, id: i }]);
    if (field) { $(elem).data('field', field+' Filter'); }
    return elem;
}
export function getFilterField(lblTxt, input) {
    const classes = lblTxt ? 'flex-row field-cntnr' : 'row-field';
    const lbl = _el('getElem', ['label', { class: classes }]);
    const span = lblTxt ? _el('getElem', ['span', { text: lblTxt + ': ' }]) : null;
    $(lbl).append([span, input].filter(e=>e));
    return lbl;
}
/* ------------------------------- APPEND ----------------------------------- */
export function appendDynamicFilter(filterEl) {
    const $el = ifRowIsFull() ?
        $('#focus-filters') : $($('#focus-filters')[0].lastChild);
    $el.append(filterEl);
}
function ifRowIsFull() {
    return $('#focus-filters')[0].lastChild.children.length % 2 === 0;
}
/* ====================== FILTER ROW DATA =================================== */
export function getRowDataForCurrentFilters(rowData) {                          //console.log('getRowDataForCurrentFilters. rowData = %O', rowData);
    const filters = fState.getRowDataFilters();
    if (!Object.keys(filters).length) { return rowData; }                       //console.log('getRowDataForCurrentFilters = %O', filters);
    return fRows.getFilteredRowData(filters, rowData);
}
/** If filter cleared, filters all table rows, else applies on top of current filters. */
export function onFilterChangeUpdateRowData() {                                 //console.log('onFilterChangeUpdateRowData')
    if (!Object.keys(fState.getRowDataFilters()).length) { return _table('resetDataTable'); }
    const rowData = getRowDataForCurrentFilters(tState().get('rowData'));
    _ui('enableClearFiltersButton');
    setCurrentRowData(rowData);
}
function setCurrentRowData(rowData) {
    const tblState = tState().get(['api', 'curFocus']);
    tblState.api.setRowData(rowData);
    _ui('updateFilterStatusMsg');
    _ui('setTreeToggleData', [false]);
    if (tblState.curFocus === 'taxa') { fTxn.updateTaxonComboboxes(rowData); }
}