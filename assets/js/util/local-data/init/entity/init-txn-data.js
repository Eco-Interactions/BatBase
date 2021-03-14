/**
 * Modifies taxon-data for local storage:
 * - rankNames - an object with each rank name (k) and it's id and ordinal (v).
 * - groupNames - an object with each group name (k) and it's id.
 * - [group][subGroup][rank]Names - object with all taxa in subGroup at the rank: name (k) id (v)
 * * group - resaved with 'uiRanksShown' filled with the rank display names.
 *
 * Export
 *     modifyTxnDataForLocalDb
 *
 * TOC
 *     RANKS
 *     TAXA BY GROUP AND RANK
 *     MODIFY GROUP DATA
 */
import * as db from '../../local-data-main.js';
import { getNameObj } from '../init-helpers.js';

export function modifyTxnDataForLocalDb(data) {                     /*dbug-log*///console.log("modifyTxnDataForLocalDb called. data = %O", data);
    db.setDataInMemory('groupNames', getNameObj(Object.keys(data.group), data.group));
    modifyGroupData(data.group, data.rank);
    storeTaxaByRankAndGroup(data.taxon, data.group, data.groupRoot);
    storeRankData(data.rank);
    db.deleteMmryData('groupRoot');
}
/* ========================= RANKS ========================================== */
function storeRankData(rankData) {
    const ranks = {};
    const order = Object.keys(rankData).sort(orderRanks);
    $(order).each(addRankData);
    db.setDataInMemory('rankNames', ranks);

    function orderRanks(a, b) {
        const x = rankData[a].ordinal;
        const y = rankData[b].ordinal;
        return x<y ? -1 : x>y ? 1 : 0;
    }
    function addRankData(i, id) {
        return ranks[rankData[id].displayName] = {id: id, ord: i+1};
    }
}
/* ================= TAXA BY GROUP AND RANK ================================= */
function storeTaxaByRankAndGroup(taxa, groups, roots) {
    for (let groupId in groups) {
        const group = groups[groupId];
        sortTaxaBySubGroupRoot(group, group.subGroups);
        storeGroupSubRootNames(group, taxa);
    }
    db.setDataInMemory('group', groups);
    db.setDataInMemory('taxon', taxa);

    function sortTaxaBySubGroupRoot(group, gRoots) {                /*dbug-log*///console.log('-sortTaxaBySubGroupRoot group %O', group);
        for (let id in gRoots) {
            const gTaxon = taxa[gRoots[id].taxon];
            separateAndStoreGroupTaxa(gTaxon, gRoots[id], group);
        }
    }
    function separateAndStoreGroupTaxa(taxon, subGroup, group) {    /*dbug-log*///console.log('--separateAndStoreGroupTaxa group = %O subGroup = %O taxon = %O', group, subGroup, taxon);
        addGroupDataToTaxon(taxon, subGroup, group);
        const data = separateGroupTaxaByRank(taxon.children, subGroup, group, taxa);
        storeTaxaByGroupAndRank(data, subGroup, group.displayName);
    }
}
function separateGroupTaxaByRank(cTaxa, subGroup, group, rcrds) {   /*dbug-log*///console.log('---separateAndStoreGroupTaxa group = %O subGroup = %O rank[%s]', group, subGroup, rank);
    const data = {};
    cTaxa.forEach(separateTaxonAndChildren);
    return data;

    function separateTaxonAndChildren(id) {
        const taxon = rcrds[id];
        addToGroupRank(taxon, taxon.rank.displayName);
        addGroupDataToTaxon(taxon, subGroup, group);
        taxon.children.forEach(separateTaxonAndChildren);
    }
    function addToGroupRank(taxon, rank) {
        if (!data[rank]) { data[rank] = {}; };
        data[rank][taxon.name] = taxon.id;
    }
}
function addGroupDataToTaxon(taxon, subGroup, group) {
    taxon.group = {
        id: group.id,
        displayName: group.displayName,
        pluralName: group.pluralName,
        subGroup: { id: subGroup.id, name: subGroup.name }
    };
}
function storeTaxaByGroupAndRank(taxonObj, subGroup, group) {
    for (let rank in taxonObj) {
        const prop = group+subGroup.name+rank+'Names';              /*dbug-log*///console.log("storeTaxaByGroupAndRank [%s] = %O", prop, taxonObj[rank]);
        db.setDataInMemory(prop, taxonObj[rank]);
    }
}
function storeGroupSubRootNames(group, taxonRcrds) {                /*dbug-log*///console.log("--storeGroupSubRootNames group[%O] taxonRcrds[%O]", group, taxonRcrds);
    const gIds = Object.values(group.subGroups).map(sg => sg.taxon);
    db.setDataInMemory(group.displayName+'SubGroupNames', getNameObj(gIds, taxonRcrds));
}
/* ========================= MODIFY GROUP DATA ============================== */
function modifyGroupData(groups, ranks) {
    Object.values(groups).forEach(modifyGroup);
    db.setDataInMemory('group', groups);

    function modifyGroup(group) {
        buildSubGroupObject(group);
        flattenGroupSubRanks(group);
    }
    function buildSubGroupObject(group) {
        const subGroups ={};
        group.subGroups.forEach(g => subGroups[g.id] = g);
        group.subGroups = subGroups;                                /*dbug-log*///console.log('buildSubGroupObject = %O', subGroups);
    }
    function flattenGroupSubRanks(group) {                          /*dbug-log*///console.log('flattenGroupSubRanks [%O]', group)
        Object.values(group.subGroups).forEach(flattenSubGroupRanks);
    }
    function flattenSubGroupRanks(subGroup) {
        subGroup.subRanks = fillRankNames(JSON.parse(subGroup.subRanks));
    }
    function fillRankNames(rankAry) {
        return rankAry.map(id => ranks[id].displayName);
    }
}