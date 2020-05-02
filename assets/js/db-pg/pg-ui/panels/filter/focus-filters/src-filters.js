/*
 * Filters interactions by publication type when in Source->publication view .
 * Synchronizes the tree-text filter and the combobox filter. 
 * 
 * Exports:
 *      loadSrcFilterPanelUi
 *      updatePubSearch
 *      
 * TOC:
 *      UI
 *      FILTER
 */
import * as pM from '../../panels-main.js';
import { newSelEl } from './focus-filters-main.js';
import { buildTreeSearchHtml } from '../../../../table/filters/filters-main.js';
const _u = pM.pgUtil;
const _ui = pM.pgUi;

/* ========================= UI ============================================ */
 /**
 * Will build the select elems for the source search options. Clears previous 
 * table. Calls @transformSrcDataAndLoadTable to transform tree data into table 
 * format and load the data table.
 * NOTE: This is the entry point for source table rebuilds as filters alter data
 * contained in the data tree.
 */
export function loadSrcFilterPanelUi(realm) {                       /*Perm-log*/console.log("       --Init Source Filter Panel UI. realm = [%s]", realm);
    if ($('#focus-filters label').length) { return clearPanelCombos(realm); }
    const buildUi = { 'auths': loadAuthSearchHtml, 'pubs': loadPubSearchHtml, 
        'publ':loadPublSearchHtml }; 
    return buildUi[realm](); 
} 
function clearPanelCombos(realm) {
    if (realm !== 'pubs') { return Promise.resolve(); }
    return Promise.resolve($('#selPubType')[0].selectize.clear('silent'));
}
/** Builds a text input for searching author names. */
function loadAuthSearchHtml() {
    const searchTreeElem = buildTreeSearchHtml('Author');
    $('#focus-filters').append(searchTreeElem);
    return Promise.resolve();
}
function loadPubSearchHtml() {
    return _u('getOptsFromStoredData', ['pubTypeNames'])
        .then(loadPubSearchElems);
}
function loadPubSearchElems(pubTypeOpts) {
    const pubTypeElem = buildPubTypeSelect(pubTypeOpts);
    const searchTreeElem = buildTreeSearchHtml('Publication');
    $('#focus-filters').append([searchTreeElem, pubTypeElem]);
    _u('initCombobox', ['Publication Type']);
    $('#selPubType')[0].selectize.clear('silent'); //todo: figure out where 'all' is getting selected and remove.
}         
/** Builds the publication type dropdown */
function buildPubTypeSelect(opts) {                                             //console.log("buildPubSelects pubTypeOpts = %O", pubTypeOpts)
    const lbl = _u('buildElem', ['label', {class: "sel-cntnr flex-row"}]);
    const span = _u('buildElem', ['span', { text: 'Type:' }]);
    const sel = newSelEl(addAllOpt(opts), '', 'selPubType', 'Publication Type');
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
    const searchTreeElem = buildTreeSearchHtml('Publisher');
    $('#focus-filters').append(searchTreeElem);
    return Promise.resolve();
}
 /* ===================== FILTER ============================================ */
/**
 * When viewing by publication, interactions can be filtered by the publication type.
 * Handles synchronizing with the tree-text filter. 
 */
export function updatePubSearch() {                                             console.log('       +-updatePubSearch.')
    tblState = tState().get(null, ['api', 'rowData', 'curFocus']);  
    const typeId = _u.getSelVal('Publication Type'); 
    const txt = getTreeFilterTextVal('Publication');
    const newRows = getFilteredPubRows();
    setPubFilters();
    tblState.api.setRowData(newRows);
    db_ui.resetToggleTreeBttn(false);
    return Promise.resolve(); //Needed when loading filter set

    function getFilteredPubRows() {
        if (!typeId || typeId == 'all') { return getTreeRowsWithText(getCurRowData(), txt); }
        return txt === '' ? getAllPubTypeRows() : getPubTypeRows(typeId);
    }
    function getPubTypeRows(typeId) {
        return getCurRowData().filter(row => { 
            return row.type == typeId && 
                row.name.toLowerCase().indexOf(txt) !== -1;
        });
    }
    /** Returns the rows for publications with their id in the selected type's array */
    function getAllPubTypeRows() {     
        return getCurRowData().filter(row => row.type == typeId);
    }
    function setPubFilters() { 
        const typeVal = $(`#selPubType option[value="${typeId}"]`).text();
        const truncTxt = txt ? 
            (txt.length > 50 ? txt.substring(0, 50)+'...' : txt) : null; 
        updatePubFocusFilters(typeVal, typeId, truncTxt);
        updateFilterStatusMsg();
    }
    function updatePubFocusFilters(type, typeId, text) {
        updatePubComboboxFilter();
        updatePubNameFilter();

        function updatePubComboboxFilter() { 
            if (type === '- All -') { delete fPs.pnlFltrs.combo; 
            } else { 
                fPs.pnlFltrs.combo = {}; 
                fPs.pnlFltrs.combo["Publication Type"] = 
                    { text: 'Publication Type', value: typeId }
            };
        }
        function updatePubNameFilter() {  
            if (text == '' || text == null) { delete fPs.pnlFltrs.name;
            } else { fPs.pnlFltrs.name = '"'+text+'"'; }
        }
    }
} 