/*
 * Filters interactions a taxon and their children selected from the comboboxes
 * in the filter panel.  Synchronizes the tree-text filter and the combobox filter.
 *
 * Exports:
 *      loadTxnFilters
 *      applyTxnFilter
 *
 * TOC:
 *      UI
 *          NAME FILTER
 *          LEVEL TAXON
 *          OBJECT REALM
 *      FILTER
 */
import * as fM from '../filters-main.js';
import { _ui, _u, rebuildTxnTable, accessTableState as tState } from '../../db-main.js';
import { initObjectRealmCombobox, filterTableByObjectRealm } from './obj-realm-filter.js';
/* ========================== UI ============================================ */
export function loadTxnFilters(tblState) {                          /*Perm-log*/console.log("       --Loading taxon filters.");
    loadTxnLevelComboboxes(tblState);
    if ($('#selObjRealm').length) { return; } //elems already initialized
    initTxnNameSearchElem(tblState);
    initObjectRealmCombobox();
}
/* ------------------------ NAME FILTER ------------------------------------- */
function initTxnNameSearchElem(tblState) {
    const searchTreeElem = fM.getTreeTextFilterElem('Taxon');
    $('#focus-filters').append(searchTreeElem);
}
/* ------------------------ LEVEL TAXON ------------------------------------- */
/**
 * Builds and initializes a search-combobox for each level present in the
 * the unfiltered realm tree. Each level's box is populated with the names
 * of every taxon at that level in the displayed, filtered, table-tree. After
 * appending, the selects are initialized with the 'selectize' library @initComboboxes.
 */
function loadTxnLevelComboboxes(tblState) {
    const lvlOptsObj = buildTaxonSelectOpts(tblState);
    const levels = Object.keys(lvlOptsObj);
    if (levels.indexOf(tblState.realmLvl) !== -1) { levels.shift(); } //Removes realm level
    updateTxnLevelComboboxes(lvlOptsObj, levels, tblState);
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
function updateTxnLevelComboboxes(lvlOptsObj, levels, tblState) {
    if ($('#focus-filters label').length) {
        updateTaxonSelOptions(lvlOptsObj, levels, tblState);
    } else {
        loadLevelSelects(lvlOptsObj, levels, tblState);
    }
}
function loadLevelSelects(levelOptsObj, levels, tblState) {                     //console.log("loadLevelSelectElems. lvlObj = %O", levelOptsObj)
    const elems = buildTaxonSelects(levelOptsObj, levels);
    $('#focus-filters').append(elems);
    initLevelComboboxes(tblState.allRealmLvls);
    setSelectedTaxonVals(tblState.selectedOpts, tblState);

    function buildTaxonSelects(opts, levels) {
        const elems = [];
        levels.forEach(function(level) {                                        //console.log('----- building select box for level = [%s]', level);
            const lbl = _u('buildElem', ['label', { class: 'sel-cntnr flex-row taxonLbl' }]);
            const span = _u('buildElem', ['span', { text: level + ': ' }]);
            const sel = fM.newSel(opts[level], 'opts-box taxonSel', 'sel' + level, level);
            $(lbl).append([span, sel])
            elems.push(lbl);
        });
        return elems;
    }
}
function initLevelComboboxes(realmLvls) {
    const confg = {};
    realmLvls.forEach(lvl => {confg[lvl] = applyTxnFilter});
    _u('initComboboxes', [confg]);
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
/* ====================== FILTER ============================================ */
/**
 * When a taxon is selected from one of the taxon-level comboboxes, the table
 * is updated with the taxon as the top of the new tree. The remaining level
 * comboboxes are populated with realted taxa, with ancestors selected.
 */
export function applyTxnFilter(val, text) {
    if (!val && text === undefined) { return; }                                              //console.log('       +-applyTxnFilter.')
    const tblState = tState().get(['rcrdsById', 'flags']);
    if (!tblState.flags.allDataAvailable) { return clearSelection($(this)[0]); }
    const rcrd = getTaxonTreeRootRcrd(val, tblState.rcrdsById, this);
    const txt = text || fM.getTreeFilterVal('Taxon');
    tState().set({'selectedOpts': getRelatedTaxaToSelect(rcrd, tblState.rcrdsById)});
    addToFilterState();
    return rebuildTxnTable(rcrd, 'filtering', txt)
        .then(() => fM.reapplyDateFilterIfActive());

    function addToFilterState() {
        const curLevel = rcrd.level.displayName;
        if (!rcrd.parent || rcrd.parent == 1) { return fM.setPanelFilterState('combo', false); }
        const filter = {};
        filter[curLevel] = { text: rcrd.displayName, value: val };
        fM.setPanelFilterState('combo', filter, 'rebuild');;
    }
}
function clearSelection(elem) {
    if (elem && elem.selectize) {
        elem.selectize.clear();
    }
}
/**
 * When a taxon is selected from the filter comboboxes, the record is returned.
 * When 'all' is selected, the selected parent is returned, or the realm record.
 * When the tree-text filter is being applied, returns the most specific taxon selected.
 */
function getTaxonTreeRootRcrd(val, rcrds, that) {
    return isNaN(parseInt(val)) ? getSelTxn() : _u('getDetachedRcrd', [val, rcrds]);

    function getSelTxn() {
        return that.hasOwnProperty('$input') ? getParentTxn() : getSelectedTxn();
    }
    function getParentTxn() {
        const selected = tState().get('selectedOpts');
        const rank = that.$input[0].id.split('sel')[1];
        const prntId = _u('getDetachedRcrd', [selected[rank], rcrds]).parent;
        return _u('getDetachedRcrd', [prntId, rcrds])
    }
    function getSelectedTxn() {
        const selected = tState().get('selectedOpts');
        const id = selected[getSelectedTaxonLvl(selected)] || _u('getSelVal', ['View']);
        return _u('getDetachedRcrd', [id, rcrds]);
    }
}
function getSelectedTaxonLvl(selected) {
    if (Object.keys(selected).length == 0) { return; }
    const lvls = ['Class', 'Order', 'Family', 'Genus', 'Species'];
    return lvls.reverse().find(lvl => selected[lvl]);
}
/** The selected taxon's ancestors will be selected in their levels combobox. */
function getRelatedTaxaToSelect(selTaxonObj, taxonRcrds) {
    const selected = {};
    selectAncestorTaxa(selTaxonObj);
    return selected;
    /** Adds parent taxa to selected object, until the realm parent. */
    function selectAncestorTaxa(taxon) {
        if (taxon.isRoot) { return; }
        selected[taxon.level.displayName] = taxon.id;
        selectAncestorTaxa(_u('getDetachedRcrd', [taxon.parent, taxonRcrds]));
    }
}