 /*
 * Filters interactions by publication type when in Source->publication view .
 * Synchronizes the tree-text filter and the combobox filter.
 *
 * Export
 *      loadSrcFilters
 *      applyPubFilter
 *
 * TOC
 *      UI
 *          NAME TEXT
 *          PUBLICATION
 *      FILTER
 */
import { _cmbx, _el } from '~util';
import { _ui } from '~db';
import * as fM from '../filter-main.js';
/* ========================= UI ============================================ */
export function loadSrcFilters(type) {                              /*Perm-log*/console.log("       --Loading source [%s] filters.", type);
    if ($('#focus-filters label').length) { return clearPanelCombos(type); }
    const buildUi = {
        'auths': loadNameSearchHtml.bind(null, 'Author', true),
        'pubs': loadPubSearchHtml,
        'publ': loadNameSearchHtml.bind(null, 'Publisher', true) };
    return buildUi[type]();
}
function clearPanelCombos(type) {
    if (type !== 'pubs') { return Promise.resolve(); }
    return Promise.resolve($('#sel-PublicationTypeFilter')[0].selectize.clear('silent'));
}
/* ------------------------- NAME TEXT -------------------------------------- */
/** Builds a text input for searching tree-column names. */
function loadNameSearchHtml(entity, fWidth = false) {
    const searchTreeElem = fM.getTreeTextFilterElem(entity);
    if (fWidth) { $(searchTreeElem).addClass('fWidthRow'); }
    $('#focus-filters').append(searchTreeElem);
    return Promise.resolve();
}
/* ----------------------- PUBLICATION -------------------------------------- */
function loadPubSearchHtml() {
    return _cmbx('getOptsFromStoredData', ['pubTypeNames'])
        .then(loadPubSearchElems);
}
function loadPubSearchElems(pubTypeOpts) {
    const pubTypeElem = buildPubTypeSelect(pubTypeOpts);
    const searchTreeElem = fM.getTreeTextFilterElem('Publication');
    $('#focus-filters').append([searchTreeElem, pubTypeElem]);
    _cmbx('initCombobox', [{ name: 'Publication Type Filter', onChange: applyPubFilter }, true]);
    $('#sel-PublicationTypeFilter')[0].selectize.clear('silent');
}
/** Builds the publication type dropdown */
function buildPubTypeSelect(opts) {                                             //console.log("buildPubSelects pubTypeOpts = %O", pubTypeOpts)
    const lbl = _el('getElem', ['label', {class: "field-cntnr flex-row"}]);
    const span = _el('getElem', ['span', { text: 'Type:' }]);
    const sel = fM.newSel(addAllOpt(opts), 'field-input', 'sel-PublicationTypeFilter', 'Publication Type');
    $(lbl).append([span, sel]);
    return lbl;
}
function addAllOpt(opts) {
    opts.unshift({value: 'all', text: '- All -'});
    return opts;
}
 /* ===================== FILTER ============================================ */
/**
 * When viewing by publication, interactions can be filtered by the publication type.
 */
export function applyPubFilter(typeId) {
    if (!typeId) { return; }
    const type = $(`#sel-PublicationTypeFilter option[value="${typeId}"]`).text();
    const filter = type === '- All -' ? false : buildPubFilterObj(typeId);
    fM.setFilterState('combo', filter, 'direct');
    fM.onFilterChangeUpdateRowData();
}
function buildPubFilterObj(id) {
    return { 'Publication Type': id };
}