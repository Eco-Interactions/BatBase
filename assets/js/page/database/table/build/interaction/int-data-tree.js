/**
 * Fills the passed data-tree interaction records.
 *
 * Export
 *     fillTreeWithInteractions
 */
import { _alert, _db } from '~util';
import { _table } from '~db';
import { getTreeRcrds } from '../table-build-main.js';

const tState = _table.bind(null, 'tableState');
let treeGroups = [];

/** Replaces all interaction ids with records for every node in the tree.  */
export async function fillTreeWithInteractions(focus, dataTree) {   /*dbug-log*///console.log('fillTreeWithInteractions. [%s], tree = %O', focus, dataTree);
    const fillInts = { taxa: fillTaxonTree, locs: fillLocTree, srcs: fillSrcTree };
    const entities = ['interaction', 'taxon', 'location', 'source'];
    const data = await _db('getData', [entities, true]);
    fillInts[focus](dataTree, data);
    updateStateData();
    return dataTree;
}
function fillTaxonTree(dataTree, entityData) {                                  //console.log("fillingTaxonTree. dataTree = %O", dataTree);
    const gRoles = []; // Taxon-group's possible interaction-roles
    fillTaxaInteractions(dataTree);                                 /*dbug-log*///console.log('-- gRoles[%O] tState[%O]', gRoles, tState);
    tState().set({'groupRoles': gRoles});

    function fillTaxaInteractions(branch) {                                     //console.log("fillTaxonInteractions called. branch = %O", branch);
        for (let key in branch) {
            fillTaxonInteractions(branch[key]);
            if (branch[key].children !== null) {
                fillTaxaInteractions(branch[key].children);
            }
        }
    }
    function fillTaxonInteractions(taxon) {                                     //console.log("fillTaxonInteractions. taxon = %O", taxon);
        ['subjectRoles', 'objectRoles'].forEach(role => {
            taxon[role] = replaceInteractions(taxon[role], entityData);
            if (!taxon[role].length || gRoles.indexOf(role) !== -1) { return; }
            gRoles.push(role);
        });
    }
} /* End fillTaxonTree */
/**
 * Recurses through each location's 'children' property and replaces all
 * interaction ids with the interaction records.
 */
function fillLocTree(branch, entityData) {                                      //console.log("fillLocTree called. taxonTree = %O", branch)
    for (let node in branch) {                                                  //console.log("node = %O", branch[node]);
        if (branch[node].interactions.length > 0) {
            branch[node].interactions = replaceInteractions(
                branch[node].interactions, entityData);
        }
        if (branch[node].children) {
            fillLocTree(branch[node].children, entityData); }
    }
}
/**
 * Recurses through each source's 'children' property until finding the
 * direct source, then replacing its interaction id's with their records.
 */
function fillSrcTree(dataTree, entityData) {
    for (let srcName in dataTree) {                                             //console.log("-----processing src %s = %O. children = %O", srcName, dataTree[srcName], dataTree[srcName].children);
        fillSrcInteractions(dataTree[srcName]);
    }
    /**
     * Recurses through each source's 'children' property until all sources
     * have any interaction ids replaced with the interaction records.
     */
    function fillSrcInteractions(curSrc) {                                      //console.log("fillSrcInteractions. curSrc = %O", curSrc);
        const srcChildren = [];
        if (curSrc.isDirect) { replaceSrcInts(curSrc); }
        curSrc.children.forEach(childSrc => fillSrcInteractions(childSrc));
    }
    function replaceSrcInts(curSrc) {
        curSrc.interactions = replaceInteractions(curSrc.interactions, entityData);
    }

} /* End fillSrcTree */
/** Replace the interaction ids with their interaction records. */
function replaceInteractions(intAry, entityData) {
    return getTreeRcrds(intAry, entityData.interaction, 'interaction')
        .map(rcrd => fillIntRcrd(rcrd, entityData)).filter(i => i);
}
/** Returns a filled record with all references replaced with entity records. */
function fillIntRcrd(intRcrd, entityData) {
    for (let prop in intRcrd) {
        intRcrd[prop] = fillIntProp(prop);
        if (intRcrd[prop] === '_err_') { return null; }
    }
    return intRcrd;

    function fillIntProp(prop) {
        if (prop === "tags") { return getIntTags(intRcrd[prop]); }
        const entity = prop in entityData ? prop : prop.includes('bject') ? 'taxon' : null;
        return !entity ? intRcrd[prop] : getTreeRcrd(intRcrd[prop], entityData, entity, prop);
    }
}
function getIntTags(tagAry) {
    return tagAry.map(tag => tag.displayName).join(', ');
}
function getTreeRcrd(id, entityData, entity, prop) {                /*dbug-log*///console.log('--getTreeRcrd. [%s][%s] (%s)', entity, id, prop);
    if (entityData[entity] === undefined) { return {}; }
    const rcrd = entityData[entity][id];                            /*dbug-log*///console.log('   --rcrd[%O]]', rcrd);
    if (entity === 'taxon') { trackTaxonGroups(rcrd); }
    // if (!rcrd && prop === 'object') { return {}; }
    if (!rcrd) { _alert('alertIssue', ['noRcrdFound', {id: id, entity: entity }]); }
    return rcrd ? rcrd : '_err_';
}
/* ===================== TRACK DATA ========================================= */
function trackTaxonGroups(taxon) {                                  /*dbug-log*///console.log('--trackTaxonGroups [%O]', taxon);
    if (treeGroups.indexOf(taxon.group.id) !== -1) { return; }
    treeGroups.push(taxon.group.id);
}
function updateStateData(argument) {
    tState().set({'treeGroups': treeGroups});
}