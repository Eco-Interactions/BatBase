/**
 * Returns select options for the rank combos for all taxa related to the
 * selected taxon. The ancestors of the selected taxon will be selected as well.
 *
 * Export
 *     getAllRankAndSelectedOpts
 *     getChildRankOpts
 *
 * TOC
 *     GET ALL OPTS FOR RELATED TAXA
 *     CHILD RANKS
 *     SIBLING TAXA
 *     ANCESTOR RANKS
 *     CREATE OPTION
 */
import { _cmbx } from '~util';
import { _state } from '~form';
/**
 * All data needed to build the rank options.
 * {obj} opts     Arrays of options (v) for each rank's (k) taxa {value: id, text: name}
 * {obj} selected Rank name (k) and taxon id (v) to be selected in comboboxes.
 * {obj} taxon    The taxon selected in the form combos
 * {obj} group    The group of the selected taxon.
 * {obj} subroup  The subGroup, the root taxon, name.
 */
let d = {
    opts: {},
    ranks: [],
    selected: {},
};
function resetOptMemory() {
    d = { opts: {}, ranks: [], selected: {} };
}
/* ------------------- GET ALL OPTS FOR RELATED TAXA ------------------------ */
export function getAllRankAndSelectedOpts(selId, selTaxon = null) {
    d.taxon = selTaxon ? selTaxon : _state('getRcrd', ['taxon', selId]);/*dbug-log*///console.log("getAllRankAndSelectedOpts. taxon = %O, opts = %O, selected = %O", d.taxon, d.opts, d.selected);
    if (!d.taxon) { return; } //issue alerted to developer and editor
    d.group = d.taxon.group.name;
    d.subGroup = d.taxon.group.subGroup.name;
    d.ranks = _state('getTaxonProp', ['subGroup']).subRanks;
    return buildRankTaxonOpts()
        .then(clearMemoryAndReturnOpts)
}
function clearMemoryAndReturnOpts() {
    window.setTimeout(() => resetOptMemory(), 500);
    return d;
}
function buildRankTaxonOpts() {
    buildChildRankOpts(d.taxon.rank.displayName, d.taxon.children);
    return buildUpdatedTaxonOpts();
}
function buildUpdatedTaxonOpts() {
    return Promise.all([getSiblingOpts(d.taxon), getAncestorOpts(d.taxon.parent)])
    .then(buildOptsForEmptyRanks)
    .then(addCreateOpts);
}
/* -------------------------- CHILD RANKS ----------------------------------- */
export function getChildRankOpts(pRank, children) {
    buildChildRankOpts(pRank, children);
    addCreateOpts();
    return clearMemoryAndReturnOpts();
}
function buildChildRankOpts(pRank, children) {
    const childRanks = getChildRanks(pRank);
    children.forEach(addRelatedChild);
    handleEmptyChildRanks(childRanks);
}
function getChildRanks(rankName) {
    return d.ranks.slice(0, d.ranks.indexOf(rankName));
}
function addRelatedChild(id) {                                      /*dbug-log*///console.log('addRelatedChild. id = ', id);
    const childTxn = _state('getRcrd', ['taxon', id]);
    if (!childTxn) { return; } //issue alerted to developer and editor
    const rank = childTxn.rank.displayName;
    addOptToRankAry(childTxn, rank);
    childTxn.children.forEach(addRelatedChild);
}
function addOptToRankAry(childTxn, rank) {
    if (!d.opts[rank]) { d.opts[rank] = []; }                       /*dbug-log*///console.log("setting rank = ", d.taxon.rank)
    d.opts[rank].push({ text: childTxn.name, value: childTxn.id });
}
function handleEmptyChildRanks(childRanks) {
    childRanks.forEach(r => d.opts[r] ? null : addEmptyChildRankOptAry(r));
}
function addEmptyChildRankOptAry(rank) {
    d.opts[rank] = [];
}
/* ------------------------- SIBLING TAXA ----------------------------------- */
function getSiblingOpts(taxon) {
    if (taxon.isRoot) { return Promise.resolve(); }
    const rank = taxon.rank.displayName;
    return _cmbx('getTaxonOpts', [null, rank, d.group, d.subGroup])
        .then(o => {                                                /*dbug-log*///console.log('getSiblingOpts = %O. taxon = %O ', o, taxon);
            d.opts[taxon.rank.displayName] = o;
            d.selected[taxon.rank.displayName] = taxon.id;
        });
}
/* ----------------------- ANCESTOR RANKS ----------------------------------- */
function getAncestorOpts(pId) {
    if (!pId) { return Promise.resolve();} //Group-Root Taxon
    const pTaxon = _state('getRcrd', ['taxon', pId]);               /*dbug-log*///console.log('getAncestorOpts. parent [%s] = %O', pId, pTaxon);
    if (pTaxon.isRoot) { return Promise.resolve();} //Group-Root Taxon
    d.selected[pTaxon.rank.displayName] = pTaxon.id;
    return buildAncestorOpts(pTaxon);
}
function buildAncestorOpts(pTaxon) {
    const rank = pTaxon.rank.displayName;
    return _cmbx('getTaxonOpts', [null, rank, d.group, d.subGroup])
        .then(o => {                                                /*dbug-log*///console.log("--getAncestorOpts - setting rank = ", pTaxon.rank)
            d.opts[pTaxon.rank.displayName] = o;
            return getAncestorOpts(pTaxon.parent);
        });
}
/**
 * Builds the opts for each rank without taxa related to the selected taxon.
 * Ancestor ranks are populated with all taxa at the rank and will have
 * the 'none' value selected.
 */
function buildOptsForEmptyRanks() {
    const proms = [];
    fillOptsForEmptyRanks();
    return Promise.all(proms);

    function fillOptsForEmptyRanks() {
        d.ranks.forEach(rank => {                                     /*dbug-log*///console.log("--fillOptsForEmptyRank [%s]", rank)
            if (d.opts[rank] || rank == d.taxon.rank.displayName) { return; }
            buildAncestorOpts(rank);
        });
    }
    function buildAncestorOpts(rank) {
        proms.push(_cmbx('getTaxonOpts', [null, rank, d.group, d.subGroup])
            .then(o => d.opts[rank] = o ));
    }
}
/* ------------------------ CREATE OPTION ----------------------------------- */
function addCreateOpts() {
    for (let rank in d.opts) {                                      /*dbug-log*///console.log("rank = %s, name = ", rank, ranks[rank-1]);
        d.opts[rank].unshift({ text: `Add a new ${rank}...`, value: 'create'});
    }
    return Promise.resolve();
}
