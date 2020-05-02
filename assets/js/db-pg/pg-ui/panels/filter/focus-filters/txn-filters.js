/*
 * Filters interactions a taxon and their children selected from the comboboxes 
 * in the filter panel.  Synchronizes the tree-text filter and the combobox filter. 
 * 
 * Exports:
 *      loadTxnFilterPanelUi
 *      updateTaxonSearch
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
const tState = pM.getTableState;
let tblState;

 /* ========================= UI ============================================ */
export function loadTxnFilterPanelUi(tblState) {
    if ($('#focus-filters label').length) { return loadTaxonComboboxes(tblState); }
    loadTaxonComboboxes(tblState);
    loadTxnNameSearchElem(tblState);
}
function loadTxnNameSearchElem(tblState) {
    const searchTreeElem = buildTreeSearchHtml('Taxon');
    $('#focus-filters').append(searchTreeElem);
}
/**
 * Builds and initializes a search-combobox for each level present in the 
 * the unfiltered realm tree. Each level's box is populated with the names 
 * of every taxon at that level in the displayed, filtered, table-tree. After 
 * appending, the selects are initialized with the 'selectize' library @initComboboxes.
 */
function loadTaxonComboboxes(tblState) {
    const lvlOptsObj = buildTaxonSelectOpts(tblState);
    const levels = Object.keys(lvlOptsObj);
    if (levels.indexOf(tblState.realmLvl) !== -1) { levels.shift(); } //Removes realm level
    updateTaxonComboboxes(lvlOptsObj, levels, tblState);
}
/**
 * Builds select options for each level with taxon data in the current realm.
 * If there is no data after filtering at a level, a 'none' option obj is built
 * and will be selected.
 */
function buildTaxonSelectOpts(tblState) {                                       //console.log("buildTaxonSelectOpts levels = %O", tblState.taxaByLvl);
    const optsObj = {};
    const taxaByLvl = tblState.taxaByLvl;       
    tblState.allRealmLvls.forEach(buildLvlOptions);
    return optsObj;

    function buildLvlOptions(lvl) {
        return lvl in taxaByLvl ? 
            getTaxaOptsAtLvl(taxaByLvl[lvl], lvl) : fillInLvlOpts(lvl)
    }
    /** Child levels can have multiple taxa.  */
    function getTaxaOptsAtLvl(rcrds, lvl) {
        const taxonNames = Object.keys(taxaByLvl[lvl]).sort();                  //console.log("taxonNames = %O", taxonNames);
        optsObj[lvl] = buildTaxonOptions(taxonNames, taxaByLvl[lvl]);
    }
    function buildTaxonOptions(taxonNames, data) {
        if (!taxonNames.length) { return []; }
        const opts = taxonNames.map(name => {
            return { value: data[name],
                     text: name}});
        if (optionIsSelected(opts[0].value)) {  
            opts.unshift({value: 'all', text: '- All -'});
        }
        return opts;
    }
    function optionIsSelected(id) { 
        if (Object.keys(tblState.selectedOpts).length > 2) { return; }
        return Object.keys(tblState.selectedOpts).some(k => id == tblState.selectedOpts[k]);
    }
    function fillInLvlOpts(lvl) {                                               //console.log("fillInEmptyAncestorLvls. lvl = ", lvl);
        if (lvl in tblState.selectedOpts) {
            const taxon = _u('getDetachedRcrd', [tblState.selectedOpts[lvl], tblState.rcrdsById]);
            optsObj[lvl] = [
                {value: 'all', text: '- All -'}, 
                {value: taxon.id, text: taxon.name}];  
        } else { optsObj[lvl] = []; }
    }
} /* End buildTaxonSelectOpts */
function updateTaxonComboboxes(lvlOptsObj, levels, tblState) {
    if ($('#focus-filters label').length) {
        updateTaxonSelOptions(lvlOptsObj, levels, tblState);    
    } else {
        loadLevelSelects(lvlOptsObj, levels, tblState);
    }
}
function loadLevelSelects(levelOptsObj, levels, tblState) {                     //console.log("loadLevelSelectElems. lvlObj = %O", levelOptsObj)
    const elems = buildTaxonSelects(levelOptsObj, levels);
    $('#focus-filters').append(elems);
    _u('initComboboxes', [tblState.allRealmLvls]);
    setSelectedTaxonVals(tblState.selectedOpts, tblState);
    
    function buildTaxonSelects(opts, levels) {  
        const elems = [];
        levels.forEach(function(level) {                                        //console.log('----- building select box for level = [%s]', level);
            const lbl = _u('buildElem', ['label', { class: 'sel-cntnr flex-row taxonLbl' }]);
            const span = _u('buildElem', ['span', { text: level + ': ' }]);
            const sel = newSelEl(opts[level], 'opts-box taxonSel', 'sel' + level, level);            
            $(lbl).append([span, sel])
            elems.push(lbl);
        });
        return elems;
    }
}
function updateTaxonSelOptions(lvlOptsObj, levels, tblState) {                  //console.log("updateTaxonSelOptions. lvlObj = %O, levels = %O, tblState = %O", lvlOptsObj, levels, tblState)          
    levels.forEach(level => {                                            
        _u('replaceSelOpts', ['#sel'+level, lvlOptsObj[level], null, level]);
    });
    setSelectedTaxonVals(tblState.selectedOpts, tblState);
}
function setSelectedTaxonVals(selected, tblState) {                             //console.log("selected in setSelectedTaxonVals = %O", selected);
    if (!selected || !Object.keys(selected).length) {return;}
    tblState.allRealmLvls.forEach(lvl => {                               
        if (!selected[lvl]) { return; }                                         //console.log("selecting [%s] = ", lvl, selected[lvl])
        _u('setSelVal', [lvl, selected[lvl], 'silent']);
    });
}

/**
 * When the time-updated filter is updated, the taxa-by-level property has to be
 * updated based on the rows displayed in the grid so that the combobox options
 * show only taxa in the filtered tree.
 */
function updateTaxonComboboxes() {                                              //console.log('updateTaxonComboboxes. tblState = %O', tblState)
    const rowData = _u.snapshot(getCurRowData());
    _u.getData('levelNames').then(lvls => {  
        const taxaByLvl = seperateTaxonTreeByLvl(lvls, rowData);
        tState().set({'taxaByLvl': taxaByLvl});                                 //console.log("taxaByLvl = %O", taxaByLvl)
        db_ui.loadTxnFilterPanelUi(tState().get());
    });
}
/** Returns an object with taxon records by level and keyed with display names. */
function seperateTaxonTreeByLvl(lvls, rowData) {                                
    const separated = {};
    rowData.forEach(data => separate(data));
    return sortObjByLevelRank();

    function separate(row) {                                                    //console.log('taxon = %O', taxon)
        if (!separated[row.taxonLvl]) { separated[row.taxonLvl] = {}; }
        separated[row.taxonLvl][row.name] = row.id;
        
        if (row.children) { 
            row.children.forEach(child => separate(child)); 
        }
    }
    function sortObjByLevelRank() {
        const obj = {};
        Object.keys(lvls).forEach(lvl => { 
            if (lvl in separated) { obj[lvl] = separated[lvl]; }
        });
        return obj;
    }
} /* End seperateTaxonTreeByLvl */
 /* ===================== FILTER ============================================ */
/**
 * When a taxon is selected from one of the taxon-level comboboxes, the table 
 * is updated with the taxon as the top of the new tree. The remaining level 
 * comboboxes are populated with realted taxa, with ancestors selected.
 */
export function updateTaxonSearch(val, selLvl) {                                        
    if (!val) { return; }                                                       console.log('       +-updateTaxonSearch.')  
    tblState = tState().get(['rcrdsById', 'flags']);  
    if (!tblState.flags.allDataAvailable) { return; }
    const rcrd = getRootTaxonRcrd(val, tblState.rcrdsById);
    const txt = getTreeFilterTextVal('Taxon');                                  //console.log("updateTaxonSearch txt = [%s] txn = %O", txt, rcrd); 
    tState().set({'selectedOpts': getRelatedTaxaToSelect(rcrd, tblState.rcrdsById)});   //console.log("selectedVals = %O", tParams.selectedVals);
    addToFilterMemory();
    return rebuildTxnTable(rcrd, 'filtering', txt);

    function addToFilterMemory() {
        const curLevel = rcrd.level.displayName;
        if (!rcrd.parent || rcrd.parent == 1) { return delete fPs.pnlFltrs.combo; }
        fPs.pnlFltrs.combo = {};
        fPs.pnlFltrs.combo[curLevel] = { text: rcrd.name, value: val };
        updateNameFilterMemory(txt);
    }
} /* End updateTaxonSearch */
/**
 * When a taxon is selected from the filter comboboxes, the record is returned.
 * When 'all' is selected, the selected parent is returned, or the realm record.
 */
function getRootTaxonRcrd(val, rcrds) {
    const id = val == 'all' ? getTaxonParentId(rcrds) : val;
    return _u.getDetachedRcrd(id, rcrds);  
}
function getTaxonParentId(rcrds) {  
    const prevId = getPreviouslySelectedTaxonId(); 
    const prevRcrd = _u.getDetachedRcrd(prevId, rcrds);  
    return prevRcrd.parent;
}
/** Returns the ID of the parent of the reset taxon combobox */
function getPreviouslySelectedTaxonId(that) { 
    const selected = tState().get('selectedOpts');
    const lvl = getSelectedTaxonLvl(selected); //REPLACE WITH GETTING THE LVL FROM THE TAXON RCRD
    return selected[lvl];
}
/** The selected taxon's ancestors will be selected in their levels combobox. */
function getRelatedTaxaToSelect(selTaxonObj, taxonRcrds) {                      //console.log("getRelatedTaxaToSelect called for %O", selTaxonObj);
    const selected = {};                                                        //console.log("selected = %O", selected)
    selectAncestorTaxa(selTaxonObj);
    return selected;
    /** Adds parent taxa to selected object, until the realm parent. */
    function selectAncestorTaxa(taxon) {                                        //console.log("selectedTaxonid = %s, obj = %O", taxon.id, taxon)
        if (taxon.isRoot) { return; }
        selected[taxon.level.displayName] = taxon.id;                           
        selectAncestorTaxa(_u.getDetachedRcrd(taxon.parent, taxonRcrds))
    }
} /* End getRelatedTaxaToSelect */