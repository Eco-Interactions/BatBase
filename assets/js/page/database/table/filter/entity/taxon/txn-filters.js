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
 *          DEFAULT FILTERS
 *          RANK TAXON
 *
 *      FILTER
 *          UPDATE COMBOBOXES AFTER FILTER CHANGE
 */
import { _cmbx, _el, _db, _u } from '~util';
import { _table, _ui, getDetachedRcrd } from '~db';
import * as fM from '../../filter-main.js';
import { finishRoleComboInit, getInteractionRoleFilter } from './role-filter.js';
import { initSubGroupFilter } from './sub-group-filter.js';

const tState = _table.bind(null, 'tableState');
/* ========================== UI ============================================ */
export function loadTxnFilters(tblState) {                          /*perm-log*/console.log("       --Loading taxon filters.");
    _ui('updateTaxonFilterViewMsg', [tblState.groupPluralName]);
    loadTxnRankComboboxes(tblState);
    if ($('input[name="name-Taxon"]').length) { return; } //elems already initialized
    addFiltersAfterDynamicRankCombos(tblState);
    return loadAsyncFilters(tblState);
}
function loadAsyncFilters(tblState) {
    if (Object.keys(tblState.subGroups).length > 1) { return initSubGroupFilter(tblState); }
}
/* ---------------------- DEFAULT FILTERS ----------------------------------- */
function addFiltersAfterDynamicRankCombos(tblState) {
    fM.appendDynamicFilter(fM.getTreeTextFilterElem('Taxon'));
    // if (tblState.groupRoles.length === 1) { return; }
    // fM.appendDynamicFilter(getInteractionRoleFilter());
    // finishRoleComboInit();
}
/* ------------------------ RANK TAXON -------------------------------------- */
/**
 * Builds and initializes a search-combobox for each rank present in the
 * the unfiltered group tree. Each rank's box is populated with the names
 * of every taxon at that rank in the displayed, filtered, table-tree. After
 * appending, the selects are initialized with the 'selectize' library @initComboboxes.
 */
function loadTxnRankComboboxes(tblState) {
    const rOpts = buildTaxonSelectOpts(tblState);
    const ranks = Object.keys(rOpts);
    updateTxnRankComboboxes(rOpts, ranks, tblState);
}
/**
 * Builds select options for each rank with taxon data in the current group.
 * If there is no data after filtering at a rank, a 'none' option obj is built
 * and will be selected.
 */
function buildTaxonSelectOpts(tblState) {                           /*dbug-log*///console.log("buildTaxonSelectOpts ranks = %O", tblState.taxaByRank);
    const optsObj = {};
    const taxaByRank = tblState.taxaByRank;
    tblState.allGroupRanks.forEach(buildRankOptions);
    return optsObj;

    function buildRankOptions(rank) {
        return rank in taxaByRank ?
            getTaxaOptsAtRank(taxaByRank[rank], rank) : fillInRankOpts(rank)
    }
    /** Child ranks can have multiple taxa.  */
    function getTaxaOptsAtRank(rcrds, rank) {
        const taxonNames = Object.keys(taxaByRank[rank]).sort();    /*dbug-log*///console.log("taxonNames = %O", taxonNames);
        optsObj[rank] = buildTaxonOptions(taxonNames, taxaByRank[rank]);
    }
    function buildTaxonOptions(taxonNames, data) {
        if (!taxonNames.length) { return []; }
        const opts = taxonNames.map(name => { return { text: name, value: data[name]}});
        if (optionIsSelected(opts[0].value)) {
            opts.unshift({ text: '- All -', value: 'all'});
        }
        return opts;
    }
    function optionIsSelected(id) {
        if (Object.keys(tblState.selectedOpts).length > 2) { return; }
        return Object.keys(tblState.selectedOpts).some(k => id == tblState.selectedOpts[k]);
    }
    function fillInRankOpts(rank) {                                 /*dbug-log*///console.log("fillInRankOpts [%s], rank);
        if (rank in tblState.selectedOpts) {
            const taxon = getDetachedRcrd(tblState.selectedOpts[rank], tblState.rcrdsById);
            optsObj[rank] = [
                { text: '- All -', value: 'all' },
                { text: taxon.name, value: taxon.id }];
        } else { optsObj[rank] = []; }
    }
}
function updateTxnRankComboboxes(rOpts, ranks, tblState) {
    if ($('#focus-filters label').length) {
        updateTaxonSelOptions(rOpts, ranks, tblState);
    } else {
        buildRankSelects(rOpts, ranks, tblState);
    }
}
function buildRankSelects(rOpts, ranks, tblState) {                 /*dbug-log*///console.log("buildRankSelects for %O", rOpts)
    const filterRows = getRankFilterFields(rOpts, ranks, tblState);
    $('#focus-filters').append(...filterRows);
    initRankComboboxes(tblState.allGroupRanks);
    setSelectedTaxonVals(tblState.selectedOpts, tblState);
}
function getRankFilterFields(rOpts, ranks, tblState) {
    const rows = [];
    let fields = [];
    Object.keys(rOpts).forEach(addRankComboToRows);
    if (fields.length) { completeFilterRow(); }
    return rows;

    function addRankComboToRows(rank) {
        if (fields.length === 2) { completeFilterRow();  }
        fields.push(getRankFilter(rank, rOpts[rank]))
    }
    function completeFilterRow() {
        const row = _el('getElem', ['div', { class: 'flex-row' }]);
        row.append(...fields);
        rows.push(row);
        fields = [];
    }
}
function getRankFilter(rank, opts) {
    const sel = fM.newSel(opts, 'field-input', `sel-${rank}Filter`, rank);
    return fM.getFilterField(rank, sel);
}
function initRankComboboxes(groupRanks) {
    groupRanks.forEach(initRankCombo);
}
function initRankCombo(rank) {
    const confg = {
        id: `#sel-${rank}Filter`,
        name: rank + ' Filter',
        onChange: applyTxnFilter
    };
    _cmbx('initCombobox', [confg, true]);
}
function updateTaxonSelOptions(rOpts, ranks, tblState) {            /*dbug-log*///console.log("updateTaxonSelOptions. rankObj = %O, ranks = %O, tblState = %O", rOpts, ranks, tblState)
    ranks.forEach(rank => {
        _cmbx('replaceSelOpts', [rank+'Filter', rOpts[rank]]);
    });
    setSelectedTaxonVals(tblState.selectedOpts, tblState);
}
function setSelectedTaxonVals(selected, tblState) {                 /*dbug-log*///console.log("selected in setSelectedTaxonVals = %O", selected);
    if (!selected || !Object.keys(selected).length) {return;}       /*temp-log*/console.log('keys = [%s]', Object.keys(selected).join(', '));
    if (selected['Sub-Group']) { setSubGroupFilter(selected['Sub-Group']); }
    tblState.allGroupRanks.forEach(rank => {
        if (!selected[rank]) { return; }                            /*dbug-log*///console.log("selecting [%s] = ", rank, selected[rank])
        _cmbx('setSelVal', [rank+'Filter', selected[rank], 'silent']);
    });
}
function setSubGroupFilter(val) {
    _cmbx('setSelVal', ['Sub-GroupFilter', val, 'silent']);
}
/* ====================== FILTER ============================================ */
/**
 * When a taxon is selected from one of the taxon-rank comboboxes, the table
 * is updated with the taxon as the top of the new tree. The remaining rank
 * comboboxes are populated with realted taxa, with ancestors selected.
 */
export function applyTxnFilter(val) {
    if (!val) { return; }                                           /*temp-log*/console.log('       +-applyTxnFilter.')
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
    return isNaN(parseInt(val)) ? getSelTxn() : getDetachedRcrd(val, rcrds);

    function getSelTxn() {
        return that.hasOwnProperty('$input') ? getParentTxn() : getSelectedTxn();
    }
    function getParentTxn() {
        const selected = tState().get('selectedOpts');
        const rank = that.$input[0].id.split('sel-')[1];
        const prntId = getDetachedRcrd(selected[rank], rcrds).parent;
        return getDetachedRcrd(prntId, rcrds);
    }
    function getSelectedTxn() {
        const selected = tState().get('selectedOpts');
        const id = selected[getSelectedTaxonRank(selected)] || _cmbx('getSelVal', ['View']);
        return getDetachedRcrd(id, rcrds);
    }
}
function getSelectedTaxonRank(selected) {
    if (Object.keys(selected).length == 0) { return; }
    const ranks = ['Class', 'Order', 'Family', 'Genus', 'Species'];
    return ranks.reverse().find(rank => selected[rank]);
}
/** The selected taxon's ancestors will be selected in their ranks combobox. */
function getRelatedTaxaToSelect(selTaxon, taxonRcrds) {             /*dbug-log*///console.log('getRelatedTaxaToSelect taxon = %O', selTaxon);
    const selected = {};
    selectAncestorTaxa(selTaxon);
    ifSubGroupsSelectSubGroupForFilter(selTaxon);
    return selected;
    /** Adds parent taxa to selected object, until the group parent. */
    function selectAncestorTaxa(taxon) {
        if (taxon.isRoot) { return; }
        selected[taxon.rank.displayName] = taxon.id;
        selectAncestorTaxa(getDetachedRcrd(taxon.parent, taxonRcrds));
    }
}
function ifSubGroupsSelectSubGroupForFilter(selTaxon) {
    if (!$('#sel-SubGroupFilter').length) { return; }
    selected['Sub-Group'] = selTaxon.group.subGroup.name;
}
/* --------------- UPDATE COMBOBOXES AFTER FILTER CHANGE -------------------- */
/**
 * When the date-updated filter is updated, the taxa-by-rank property has to be
 * updated based on the rows displayed in the grid so that the combobox options
 * show only taxa in the filtered tree.
 */
export function updateTaxonComboboxes(rd) {                         /*dbug-log*///console.log('updateTaxonComboboxes. tblState = %O', tblState)
    const rowData = _u('snapshot', [rd]);
    _db('getData', ['rankNames']).then(ranks => {
        const taxaByRank = seperateTaxonTreeByRank(ranks, rowData);
        tState().set({'taxaByRank': taxaByRank});                   /*dbug-log*///console.log("taxaByRank = %O", taxaByRank)
        loadTxnFilters(tState().get());
    });
}
/** Returns an object with taxon records by rank and keyed with display names. */
function seperateTaxonTreeByRank(ranks, rowData) {
    const separated = {};
    rowData.forEach(data => separate(data));
    return sortObjByRank();

    function separate(row) {                                        /*dbug-log*///console.log('taxon = %O', taxon)
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