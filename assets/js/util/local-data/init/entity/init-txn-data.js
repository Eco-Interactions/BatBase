/**
 * Modifies taxon-data for local storage:
 * - rankNames - an object with each rank name (k) and it's id and ordinal (v).
 * - groupNames - an object with each group name (k) and it's id.
 * - pluralGroupNames - an object with each group's plural name (k) and it's id.
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
    storePluralGroupNames(data.group);
    storeTaxaByRankAndGroup(data.taxon, data.group, data.groupRoot);
    modifyGroupData(data.group, data.rank);
    storeRankData(data.rank);
    db.deleteMmryData('groupRoot');
}
function storePluralGroupNames(groups) {
    const names = {}
    Object.values(groups).forEach(g => names[g.pluralName] = g.id);
    db.setDataInMemory('pluralGroupNames', names);
}
function getPluralGroupOpt(group) {
    return { text: group.pluralName, value: group.id }
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
        sortTaxaByGroupRoot(group, group.taxa);
        storeGroupTaxa(group, taxa);
    }
    db.setDataInMemory('group', groups);
    db.setDataInMemory('taxon', taxa);

    function sortTaxaByGroupRoot(group, gTaxa) {                    /*dbug-log*///console.log('sortTaxaByGroupRoot group %O', group);
        for (let gName in gTaxa) {
            const gTaxon = taxa[gTaxa[gName].id];
            separateAndStoreGroupTaxa(gTaxon, gTaxon.name, group);
        }
    }
    function separateAndStoreGroupTaxa(taxon, subGroup, group) {    /*dbug-log*///console.log('separateAndStoreGroupTaxa [%s] taxon = %O group = %O', subGroup, taxon, group)
        addGroupDataToTaxon(taxon, subGroup, group);
        const data = separateGroupTaxaByRank(taxon.children, subGroup, group, taxa);
        storeTaxaByGroupAndRank(data, subGroup, group.displayName);
    }
}
function separateGroupTaxaByRank(cTaxa, subGroup, group, rcrds) {
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
        subGroup: { id: group.taxa[subGroup].id, name: group.taxa[subGroup].name }
    };
}
function storeTaxaByGroupAndRank(taxonObj, subGroup, group) {
    for (let rank in taxonObj) {                                    /*dbug-log*///console.log("storing as [%s] = %O", group+subGroup+rank+'Names', taxonObj[rank]);
        db.setDataInMemory(group+subGroup+rank+'Names', taxonObj[rank]);
    }
}
function storeGroupTaxa(group, taxonRcrds) {
    const gIds = Object.values(group.taxa).map(t => t.id);
    db.setDataInMemory(group.displayName+'SubGroupNames', getNameObj(gIds, taxonRcrds));
}
/* ========================= MODIFY GROUP DATA ============================== */
function modifyGroupData(groups, ranks) {
    Object.values(groups).forEach(flattenGroupSubRanks);
    db.setDataInMemory('group', groups);

    function flattenGroupSubRanks(group) {                          /*dbug-log*///console.log('flattenGroupSubRanks [%O]', group)
        Object.values(group.taxa).forEach(flattenSubGroupRanks);
    }
    function flattenSubGroupRanks(subGroup) {
        subGroup.subRanks = fillRankNames(JSON.parse(subGroup.subRanks));
    }
    function fillRankNames(rankAry) {
        return rankAry.map(id => ranks[id].displayName);
    }
}