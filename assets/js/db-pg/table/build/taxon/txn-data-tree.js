/**
 * Builds a tree of record data for the passed entities.
 *
 * Export
 *     buildTxnTree
 */
import { _u } from '../../../db-main.js';
import { fillTreeWithInteractions, getTreeRcrds } from '../build-main.js';

let tState, tblState;
/**
 * Returns a heirarchical tree of taxon record data from the root taxa through
 * all children. The taxon ranks present are stored in tblState.
 */
export function buildTxnTree(taxa, state) {                                            //console.log("buildTaxonTree called for taxa = %O", taxa);
    tState = state;
    tblState = tState().get(null, ['rcrdsById', 'flags', 'allRanks']);
    const tree = buildTxnDataTree(taxa);
    updateTaxaByRank(taxa, tblState.allRanks);
    if (!tblState.flags.allDataAvailable) { return Promise.resolve(tree); }
    return fillTreeWithInteractions('taxa', tree);
}
function buildTxnDataTree(roots) {
    let tree = {};                                                              //console.log("tree = %O", tree);
    roots.forEach(taxon => { tree[taxon.displayName] = buildTaxonBranch(taxon); });
    return tree;

    function buildTaxonBranch(taxon) {
        taxon.children = getChildTaxa(taxon.children);
        return taxon;
    }
    /**
     * Recurses through each taxon's 'children' property and returns a record
     * for each child ID found.
     */
    function getChildTaxa(taxa) {                                               //console.log("getChildTaxa called. children = %O", children);
        if (taxa === null) { return []; }
        return getTreeRcrds(taxa, tblState.rcrdsById, 'taxon').map(buildTaxonBranch);
    }
}
function updateTaxaByRank(taxa, ranks) {
    const taxaByRank = seperateTaxonTreeByRank(taxa, ranks);                     //console.log("taxaByRank = %O", taxaByRank)
    tState().set({'taxaByRank': taxaByRank});
}
/** Returns an object with taxon records by rank and keyed with display names. */
function seperateTaxonTreeByRank(taxa, ranks) {                                 //console.log('seperateTaxonTreeByRank. taxon = %O, ranks = %O', topTaxon, ranks);
    const separated = {};
    taxa.forEach(t => t.children.forEach(separate));
    return sortObjByRank(separated);

    function separate(taxon) {                                                  //console.log('taxon = %O', taxon)
        const rank = taxon.rank.displayName;
        if (!separated[rank]) { separated[rank] = {}; }
        separated[rank][taxon.name] = taxon.id;

        if (taxon.children) {
            taxon.children.forEach(child => separate(child));
        }
    }
    function sortObjByRank(taxonObj) {
        const obj = {};
        Object.keys(ranks).forEach(rank => {
            if (rank in taxonObj) { obj[rank] = taxonObj[rank]; }
        });
        return obj;
    }
}