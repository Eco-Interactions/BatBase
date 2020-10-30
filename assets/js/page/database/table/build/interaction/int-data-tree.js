/**
 * Fills the passed data-tree interaction records.
 *
 * Export
 *     fillTreeWithInteractions
 */
import { alertIssue, _u } from '~db';
import { getTreeRcrds } from '../build-main.js';

/** Replaces all interaction ids with records for every node in the tree.  */
export async function fillTreeWithInteractions(focus, dataTree) {                            //console.log('fillTreeWithInteractions. [%s], tree = %O', focus, dataTree);
    const fillInts = { taxa: fillTaxonTree, locs: fillLocTree, srcs: fillSrcTree };
    const entities = ['interaction', 'taxon', 'location', 'source'];
    const data = await _u('getData', [entities, true]);
    fillInts[focus](dataTree, data);
    return dataTree;
}
function fillTaxonTree(dataTree, entityData) {                                  //console.log("fillingTaxonTree. dataTree = %O", dataTree);
    fillTaxaInteractions(dataTree);

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
/**
 * Refactor. Hastily coded. Object taxa are not loaded until after interactions
 * on intial database download. They will be filled in after table loads. Rewrite
 * so a missing object record triggers the alert once all taxon data is avaiable.
 */
function getTreeRcrd(id, entityData, entity, prop) {  //console.log('getTreeRcrd. [%s][%s] (%s) in %O', entity, id, prop, entityData);
    if (entityData[entity] === undefined) { return {}; }
    const rcrd = entityData[entity][id];
    if (!rcrd && prop === 'object') { return {}; }
    if (!rcrd) { alertIssue('noRcrdFound', {id: id, entity: entity }); }
    return rcrd ? rcrd : '_err_';
}