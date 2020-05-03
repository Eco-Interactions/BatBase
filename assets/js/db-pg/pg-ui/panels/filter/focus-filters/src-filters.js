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
const _u = pM.pgUtil;
const _fM = pM.accessFilterPanel;

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
    const searchTreeElem = _fM('getTreeTextFilterElem', ['Author']);
    $('#focus-filters').append(searchTreeElem);
    return Promise.resolve();
}
function loadPubSearchHtml() {
    return _u('getOptsFromStoredData', ['pubTypeNames'])
        .then(loadPubSearchElems);
}
function loadPubSearchElems(pubTypeOpts) {
    const pubTypeElem = buildPubTypeSelect(pubTypeOpts);
    const searchTreeElem = _fM('getTreeTextFilterElem', ['Publication']);
    $('#focus-filters').append([searchTreeElem, pubTypeElem]);
    _u('initCombobox', ['Publication Type', updatePubSearch]);
    $('#selPubType')[0].selectize.clear('silent'); //todo: figure out where 'all' is getting selected and remove.
}         
/** Builds the publication type dropdown */
function buildPubTypeSelect(opts) {                                             //console.log("buildPubSelects pubTypeOpts = %O", pubTypeOpts)
    const lbl = _u('buildElem', ['label', {class: "sel-cntnr flex-row"}]);
    const span = _u('buildElem', ['span', { text: 'Type:' }]);
    const sel = _fM('newSelEl', [addAllOpt(opts), '', 'selPubType', 'Publication Type']);
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
    const searchTreeElem = _fM('getTreeTextFilterElem', ['Publisher']);
    $('#focus-filters').append(searchTreeElem);
    return Promise.resolve();
}
 /* ===================== FILTER ============================================ */
/**
 * When viewing by publication, interactions can be filtered by the publication type.
 * Handles synchronizing with the tree-text filter. 
 */
export function updatePubSearch() {                                             console.log('       +-updatePubSearch.')
    const tblState = tState().get(null, ['api', 'rowData', 'curFocus']);  
    const typeId = _u('getSelVal', ['Publication Type']); 
    const txt = _fM('getTreeTextFilterElem', ['Publication']);
    const newRows = getFilteredPubRows();
    setPubFilters();
    tblState.api.setRowData(newRows);
    pM.pgUtil.resetToggleTreeBttn(false);
    return Promise.resolve(); //Needed when loading filter set

    function getFilteredPubRows() {
        if (!typeId || typeId == 'all') { return getTreeRowsWithText(getCurRowData(), txt); }
        return txt === '' ? getAllPubTypeRows() : getPubTypeRows(typeId);
    }
    function getPubTypeRows(typeId) {
        return getCurRowData().filter(r => { 
            return r.type == typeId && r.name.toLowerCase().indexOf(txt) !== -1;
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
        updatePubFilterState(typeVal, typeId, truncTxt);
        // updatePubFocusFilters(typeVal, typeId, truncTxt);
        updateFilterStatusMsg();
    }
    function updatePubFilterState(type, id, text) {
        const filter = type === '- All -' ? false : buildPubFilterObj({});
        _fM('setPanelFilterState', ['combo', filter]);
        
        function buildPubFilterObj(obj) {
            obj['Publication Type'] = { text: 'Publication Type', value: id };
            return obj;
        }
    }
    // function updatePubFocusFilters(type, typeId, text) {
    //     updatePubComboboxFilter();
    //     updatePubNameFilter();

    //     function updatePubComboboxFilter() { 
    //         if (type === '- All -') { delete fPs.pnlFltrs.combo; 
    //         } else { 
    //             fPs.pnlFltrs.combo = {}; 
    //             fPs.pnlFltrs.combo["Publication Type"] = 
    //                 { text: 'Publication Type', value: typeId }
    //         };
    //     }
    //     function updatePubNameFilter() {  
    //         if (text == '' || text == null) { delete fPs.pnlFltrs.name;
    //         } else { fPs.pnlFltrs.name = '"'+text+'"'; }
    //     }
    // }
} 