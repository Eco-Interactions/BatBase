/*
 * Filters interactions a taxon and their children selected from the comboboxes
 * in the filter panel.  Synchronizes the tree-text filter and the combobox filter.
 *
 * Export
 *      loadTxnFilters
 *      applyTxnFilter
 *
 * TOC
 *      UI
 *          NAME FILTER
 *          RANK TAXON
 *          Object Group
 *      FILTER
 *          UPDATE COMBOBOXES AFTER FILTER CHANGE
 */
import { _db } from '~util';
import { _table, _ui, _u } from '~db';
import * as fM from '../../filter-main.js';
import { initObjectGroupCombobox } from './obj-group-filter.js';
import { initSubGroupFilter } from './sub-group-filter.js';

const tState = _table.bind(null, 'tableState');
/* ========================== UI ============================================ */
export function loadTxnFilters(tblState) {                          /*Perm-log*/console.log("       --Loading taxon filters.");
    loadTxnRankComboboxes(tblState);
    if ($('input[name="name-Taxon"]').length) { return; } //elems already initialized
    initTxnNameSearchElem(tblState);
    _ui('updateTaxonFilterViewMsg', [tblState.groupPluralName]);
    return loadAsyncFilters(tblState);
}
function loadAsyncFilters(tblState) {
    if (tblState.groupName === 'Bat') { return initObjectGroupCombobox(); }
    if (Object.keys(tblState.subGroups).length > 1) { return initSubGroupFilter(tblState); }
}
/* ------------------------ NAME FILTER ------------------------------------- */
function initTxnNameSearchElem(tblState) {
    const searchTreeElem = fM.getTreeTextFilterElem('Taxon');
    $('#focus-filters').append(searchTreeElem);
}
/* ------------------------ RANK TAXON ------------------------------------- */
/**
 * Builds and initializes a search-combobox for each rank present in the
 * the unfiltered group tree. Each rank's box is populated with the names
 * of every taxon at that rank in the displayed, filtered, table-tree. After
 * appending, the selects are initialized with the 'selectize' library @initComboboxes.
 */
function loadTxnRankComboboxes(tblState) {
    const rankOptsObj = buildTaxonSelectOpts(tblState);
    const ranks = Object.keys(rankOptsObj);
    updateTxnRankComboboxes(rankOptsObj, ranks, tblState);
}
/**
 * Builds select options for each rank with taxon data in the current group.
 * If there is no data after filtering at a rank, a 'none' option obj is built
 * and will be selected.
 */
function buildTaxonSelectOpts(tblState) {                                       //console.log("buildTaxonSelectOpts ranks = %O", tblState.taxaByRank);
    const optsObj = {};
    const taxaByRank = tblState.taxaByRank;
    tblState.allgroupRanks.forEach(buildRankOptions);
    return optsObj;

    function buildRankOptions(rank) {
        return rank in taxaByRank ?
            getTaxaOptsAtRank(taxaByRank[rank], rank) : fillInRankOpts(rank)
    }
    /** Child ranks can have multiple taxa.  */
    function getTaxaOptsAtRank(rcrds, rank) {
        const taxonNames = Object.keys(taxaByRank[rank]).sort();                  //console.log("taxonNames = %O", taxonNames);
        optsObj[rank] = buildTaxonOptions(taxonNames, taxaByRank[rank]);
    }
    function buildTaxonOptions(taxonNames, data) {
        if (!taxonNames.length) { return []; }
        const opts = taxonNames.map(name => new Option(name, data[name]));
        if (optionIsSelected(opts[0].value)) {
            opts.unshift(new Option('- All -', 'all'));
        }
        return opts;
    }
    function optionIsSelected(id) {
        if (Object.keys(tblState.selectedOpts).length > 2) { return; }
        return Object.keys(tblState.selectedOpts).some(k => id == tblState.selectedOpts[k]);
    }
    function fillInRankOpts(rank) {                                               //console.log("fillInEmptyAncestorRanks. rank = ", rank);
        if (rank in tblState.selectedOpts) {
            const taxon = _u('getDetachedRcrd', [tblState.selectedOpts[rank], tblState.rcrdsById]);
            optsObj[rank] = [ new Option('- All -', 'all'), new Option(taxon.id, taxon.name)];
        } else { optsObj[rank] = []; }
    }
} /* End buildTaxonSelectOpts */
function updateTxnRankComboboxes(rankOptsObj, ranks, tblState) {
    if ($('#focus-filters label').length) {
        updateTaxonSelOptions(rankOptsObj, ranks, tblState);
    } else {
        loadRankSelects(rankOptsObj, ranks, tblState);
    }
}
function loadRankSelects(rankOptsObj, ranks, tblState) {                     //console.log("loadRankSelectElems. rankObj = %O", rankOptsObj)
    const elems = buildTaxonSelects(rankOptsObj, ranks);
    $('#focus-filters').append(elems);
    initRankComboboxes(tblState.allgroupRanks);
    setSelectedTaxonVals(tblState.selectedOpts, tblState);

    function buildTaxonSelects(opts, ranks) {
        const elems = [];
        ranks.forEach(function(rank) {                                        //console.log('----- building select box for rank = [%s]', rank);
            const lbl = _u('getElem', ['label', { class: 'sel-cntnr flex-row taxonLbl' }]);
            const span = _u('getElem', ['span', { text: rank + ': ' }]);
            const sel = fM.newSel(opts[rank], 'opts-box taxonSel', 'sel-' + rank, rank);
            $(lbl).append([span, sel])
            elems.push(lbl);
        });
        return elems;
    }
}
function initRankComboboxes(groupRanks) {
    const confg = {};
    groupRanks.forEach(initRankCombo);
}
function initRankCombo(rank) {
    _u('initCombobox', [{ name: rank, onChange: applyTxnFilter }, true]);
}
function updateTaxonSelOptions(rankOptsObj, ranks, tblState) {                  //console.log("updateTaxonSelOptions. rankObj = %O, ranks = %O, tblState = %O", rankOptsObj, ranks, tblState)
    ranks.forEach(rank => {
        _u('replaceSelOpts', [rank, rankOptsObj[rank], null, rank]);
    });
    setSelectedTaxonVals(tblState.selectedOpts, tblState);
}
function setSelectedTaxonVals(selected, tblState) {                             //console.log("selected in setSelectedTaxonVals = %O", selected);
    if (!selected || !Object.keys(selected).length) {return;}
    tblState.allgroupRanks.forEach(rank => {
        if (!selected[rank]) { return; }                                         //console.log("selecting [%s] = ", rank, selected[rank])
        _u('setSelVal', [rank, selected[rank], 'silent']);
    });
}
/* ====================== FILTER ============================================ */
/**
 * When a taxon is selected from one of the taxon-rank comboboxes, the table
 * is updated with the taxon as the top of the new tree. The remaining rank
 * comboboxes are populated with realted taxa, with ancestors selected.
 */
export function applyTxnFilter(val) {
    if (!val) { return; }                                                       //console.log('       +-applyTxnFilter.')
    const tblState = tState().get(['rcrdsById', 'flags']);
    if (!tblState.flags.allDataAvailable) { return clearSelection($(this)[0]); }
    const rcrd = getTaxonTreeRootRcrd(val, tblState.rcrdsById, this);
    tState().set({'selectedOpts': getRelatedTaxaToSelect(rcrd, tblState.rcrdsById)});
    addToFilterState();
    return _table('rebuildTxnTable', [[rcrd]]);

    function addToFilterState() {
        const filter = {};
        const curRank = rcrd.rank.displayName;
        filter[curRank] = getRankFilterState()
        fM.setFilterState('combo', filter, 'rebuild');

        function getRankFilterState() {
            if (!rcrd.parent || rcrd.parent == 1) { return false; }
            return { text: rcrd.displayName, value: val };
        }
    }
}
function clearSelection(elem) {
    if (elem && elem.selectize) {
        elem.selectize.clear();
    }
}
/**
 * When a taxon is selected from the filter comboboxes, the record is returned.
 * When 'all' is selected, the selected parent is returned, or the group record.
 * When the tree-text filter is being applied, returns the most specific taxon selected.
 */
function getTaxonTreeRootRcrd(val, rcrds, that) {
    return isNaN(parseInt(val)) ? getSelTxn() : _u('getDetachedRcrd', [val, rcrds]);

    function getSelTxn() {
        return that.hasOwnProperty('$input') ? getParentTxn() : getSelectedTxn();
    }
    function getParentTxn() {
        const selected = tState().get('selectedOpts');
        const rank = that.$input[0].id.split('sel-')[1];
        const prntId = _u('getDetachedRcrd', [selected[rank], rcrds]).parent;
        return _u('getDetachedRcrd', [prntId, rcrds])
    }
    function getSelectedTxn() {
        const selected = tState().get('selectedOpts');
        const id = selected[getSelectedTaxonRank(selected)] || _u('getSelVal', ['View']);
        return _u('getDetachedRcrd', [id, rcrds]);
    }
}
function getSelectedTaxonRank(selected) {
    if (Object.keys(selected).length == 0) { return; }
    const ranks = ['Class', 'Order', 'Family', 'Genus', 'Species'];
    return ranks.reverse().find(rank => selected[rank]);
}
/** The selected taxon's ancestors will be selected in their ranks combobox. */
function getRelatedTaxaToSelect(selTaxonObj, taxonRcrds) {
    const selected = {};
    selectAncestorTaxa(selTaxonObj);
    return selected;
    /** Adds parent taxa to selected object, until the group parent. */
    function selectAncestorTaxa(taxon) {
        if (taxon.isRoot) { return; }
        selected[taxon.rank.displayName] = taxon.id;
        selectAncestorTaxa(_u('getDetachedRcrd', [taxon.parent, taxonRcrds]));
    }
}
/* --------------- UPDATE COMBOBOXES AFTER FILTER CHANGE -------------------- */
/**
 * When the date-updated filter is updated, the taxa-by-rank property has to be
 * updated based on the rows displayed in the grid so that the combobox options
 * show only taxa in the filtered tree.
 */
export function updateTaxonComboboxes(rd) {                                              //console.log('updateTaxonComboboxes. tblState = %O', tblState)
    const rowData = _u('snapshot', [rd]);
    _db('getData', ['rankNames']).then(ranks => {
        const taxaByRank = seperateTaxonTreeByRank(ranks, rowData);
        tState().set({'taxaByRank': taxaByRank});                                 //console.log("taxaByRank = %O", taxaByRank)
        loadTxnFilters(tState().get());
    });
}
/** Returns an object with taxon records by rank and keyed with display names. */
function seperateTaxonTreeByRank(ranks, rowData) {
    const separated = {};
    rowData.forEach(data => separate(data));
    return sortObjByRank();

    function separate(row) {                                                    //console.log('taxon = %O', taxon)
        if (!separated[row.taxonRank]) { separated[row.taxonRank] = {}; }
        separated[row.taxonRank][row.name] = row.id;

        if (row.children) {
            row.children.forEach(child => separate(child));
        }
    }
    function sortObjByRank() {
        const obj = {};
        Object.keys(ranks).forEach(rank => {
            if (rank in separated) { obj[rank] = separated[rank]; }
        });
        return obj;
    }
}