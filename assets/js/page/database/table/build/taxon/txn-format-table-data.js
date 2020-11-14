/**
 * Builds a tree of the Taxon data to display in the agGrid table format.
 *
 * Export
 *     buildLocRowData
 */
import { buildIntRowData, getIntRowData } from '../table-build-main.js';

export function buildTxnRowData(tree, tblState) {
    const finalRowData = [];
    for (let topTaxon in tree) {
        finalRowData.push(getTaxonRowData(tree[topTaxon], 0, tblState));
    }
    return finalRowData;
}
/**
 * Recurses through each taxon's 'children' property and returns a row data obj
 * for each taxon in the tree.
 */
function getTaxonRowData(taxon, treeLvl, tblState) {                /*dbug-log*///console.log("taxonRowData. taxon = %O, tblState = %O", taxon, tblState);
    const intCount = getIntCount(taxon);
    return {
        id: taxon.id,
        children: getTaxonAndChildTaxaRowData(taxon, treeLvl, tblState),
        entity: "Taxon",
        interactions: intCount !== null,
        intCnt: intCount,
        isParent: true,
        name: taxon.displayName,
        open: tblState.openRows.indexOf(taxon.id.toString()) !== -1,
        parentTaxon: taxon.isRoot ? false : taxon.parent,
        taxonRank: taxon.rank.displayName,
        treeLvl: treeLvl,
        updatedBy: taxon.updatedBy
    };
}
/**
 * Checks whether this taxon has interactions in either the subject or object
 * roles. Returns the interaction count if any records are found, null otherwise.
 */
function getIntCount(taxon) {
    const roles = ["subjectRoles", "objectRoles"];
    let intCnt = 0;
    roles.forEach(function(role) { intCnt += taxon[role].length; });
    return intCnt > 0 ? intCnt : null;
}
/**
 * Returns both interactions for the taxon and rowData for any children.
 * The interactions for non-species Taxa are grouped as the first child row
 * under "Unspecified [taxonName] Interactions", for species the interactions
 * are added as rows directly beneath the taxon.
 */
function getTaxonAndChildTaxaRowData(taxon, curTreeLvl, tblState) {
    let rows = [];
    if (taxon.rank.displayName !== 'Species'){
        handleTaxonWithPotentialChildren();
    } else { rows = getTaxonIntRows(taxon, curTreeLvl, tblState); }
    return rows;

    function handleTaxonWithPotentialChildren() {
        handleUnspecifiedInts(curTreeLvl);
        if (taxon.children && taxon.children.length) {
            getTaxonChildRows(taxon.children);
        }
    }

    function handleUnspecifiedInts(curTreeLvl) {
        if (taxon.failedFltr || getIntCount(taxon) === null) { return; }
        const name = taxon.isRoot ? taxon.group.displayName : taxon.name;
        addUnspecifiedTaxonIntsRow(name, curTreeLvl);
    }
    /**
     * Groups interactions attributed directly to a taxon with child-taxa
     * and adds them as it's first child row.
     * Note: Group interactions are built closed, otherwise they would be expanded
     * by default
     */
    function addUnspecifiedTaxonIntsRow(taxonName, treeLvl) {
        rows.push({
            id: taxon.id,
            children: getTaxonIntRows(taxon, treeLvl, tblState),
            displayName: taxonName,
            entity: 'Taxon',
            groupedInts: true,
            interactions: true,
            isParent: true,
            name: `Unspecified ${taxonName} Interactions`,
            open: !taxon.isRoot && tblState.openRows.indexOf(taxon.id.toString()) !== -1,
            taxonRank: taxon.rank.displayName,
            treeLvl: treeLvl,
        });
    }
    function getTaxonChildRows(children) {
        children.forEach(childTaxon => {
            rows.push(getTaxonRowData(childTaxon, curTreeLvl + 1, tblState));
        });
    }
}
function getTaxonIntRows(taxon, treeLvl, tblState) {                /*dbug-log*///console.log("getTaxonInteractions for = %O. tblState = %O", taxon, tblState);
    const ints = [];
    ['sub', 'ob'].forEach(prfx => taxon[prfx+'jectRoles'].forEach(buildTxnIntRow));
    return ints;

    function buildTxnIntRow(intRcrd) {
        const noData = !tblState.flags.allDataAvailable;
        const row = noData ? getPendingDataRow(treeLvl) : getTxnIntRow(intRcrd, treeLvl, tblState)
        ints.push(row);
    }
}
function getPendingDataRow(treeLvl) {
    const props = ['citation', 'subject', 'object', 'interactionType', 'tags',
        'citation', 'habitat', 'location', 'country', 'region', 'note'];
    const rowData = {
        entity: 'interaction',
        isParent: false,
        name: '',
        treeLvl: treeLvl
    };
    props.forEach(p => rowData[p] = 'Loading...');
    return rowData;
}
/** Adds the taxon heirarchical data to the interactions row data. */
function getTxnIntRow(intRcrd, treeLvl, tblState) {
    const rowData = buildIntRowData(intRcrd, treeLvl);
    getCurTaxonRankCols(tblState).forEach(colName => {
        rowData[colName] = intRcrd[colName];
    });
    return rowData;
}
function getCurTaxonRankCols(tblState) {
    return Object.keys(tblState.taxaByRank).map(r => 'tree' + r);
}