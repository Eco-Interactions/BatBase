 /*
 * Filters interactions by publication type when in Source->publication view .
 * Synchronizes the tree-text filter and the combobox filter.
 *
 * Exports:
 *      loadSrcFilters
 *      applyPubFilter
 *
 * TOC:
 *      UI
 *      FILTER
 */
import * as fM from '../filter-main.js';
import { _ui, _u } from '../../../db-main.js';
/* ========================= UI ============================================ */
export function loadSrcFilters(type) {                              /*Perm-log*/console.log("       --Loading source [%s] filters.", type);
    if ($('#focus-filters label').length) { return clearPanelCombos(type); }
    const buildUi = { 'auths': loadAuthSearchHtml, 'pubs': loadPubSearchHtml,
        'publ':loadPublSearchHtml };
    return buildUi[type]();
}
function clearPanelCombos(type) {
    if (type !== 'pubs') { return Promise.resolve(); }
    return Promise.resolve($('#sel-PublicationType')[0].selectize.clear('silent'));
}
/** Builds a text input for searching author names. */
function loadAuthSearchHtml() {
    const searchTreeElem = fM.getTreeTextFilterElem('Author');
    $('#focus-filters').append(searchTreeElem);
    return Promise.resolve();
}
function loadPubSearchHtml() {
    return _u('getOptsFromStoredData', ['pubTypeNames'])
        .then(loadPubSearchElems);
}
function loadPubSearchElems(pubTypeOpts) {
    const pubTypeElem = buildPubTypeSelect(pubTypeOpts);
    const searchTreeElem = fM.getTreeTextFilterElem('Publication');
    $('#focus-filters').append([searchTreeElem, pubTypeElem]);
    _u('initCombobox', [{ name: 'Publication Type', onChange: applyPubFilter }, true]);
    $('#sel-PublicationType')[0].selectize.clear('silent'); //todo: figure out where 'all' is getting selected and remove.
}
/** Builds the publication type dropdown */
function buildPubTypeSelect(opts) {                                             //console.log("buildPubSelects pubTypeOpts = %O", pubTypeOpts)
    const lbl = _u('buildElem', ['label', {class: "sel-cntnr flex-row"}]);
    const span = _u('buildElem', ['span', { text: 'Type:' }]);
    const sel = fM.newSel(addAllOpt(opts), '', 'sel-PublicationType', 'Publication Type');
    const lblW = $(window).width() > 1500 ? '222px' : '230px';
    $(sel).css('width', '177px');
    $(lbl).css('width', lblW).append([span, sel]);
    return lbl;
}
function addAllOpt(opts) {
    opts.unshift({value: 'all', text: '- All -'});
    return opts;
}
function loadPublSearchHtml() {
    const searchTreeElem = fM.getTreeTextFilterElem('Publisher');
    $('#focus-filters').append(searchTreeElem);
    return Promise.resolve();
}
 /* ===================== FILTER ============================================ */
/**
 * When viewing by publication, interactions can be filtered by the publication type.
 */
export function applyPubFilter(typeId) {
    if (!typeId) { return; }
    const type = $(`#sel-PublicationType option[value="${typeId}"]`).text();
    const filter = type === '- All -' ? false : buildPubFilterObj(typeId);
    fM.setFilterState('combo', filter, 'direct');
    fM.onFilterChangeUpdateRowData();
}
function buildPubFilterObj(id) {
    return { 'Publication Type': id };
}