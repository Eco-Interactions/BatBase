/**
 * Builds a tree of record data for the passed entities.
 *
 * Export
 *     buildSrcTree
 *
 * TOC
 *     TREE-BUILD CORE
 *     PUBLICATION TREE
 *     PUBLISHER TREE
 *     AUTHOR TREE
 */
import { _db } from '~util';
import { getDetachedRcrd } from '~db';
import { fillTreeWithInteractions, getTreeRcrds, sortDataTree } from '../table-build-main.js';

let srcRcrds;
/*---------------------- TREE-BUILD CORE -------------------------------------*/
/** (Re)builds source tree for the selected source-type. */
export async function buildSrcTree(type, rcrds) {
    srcRcrds = rcrds;
    const tree = await buildSrcTypeTree(type);
    return fillTreeWithInteractions('srcs', tree);
}
/**
 * Builds the source data tree for the selected source type.
 * NOTE: Sources have three types and tree-data structures:
 * Authors->Citations/Publications->Interactions
 * Publications->Citations->Interactions.
 * Publishers->Publications->Citations->Interactions.
 */
function buildSrcTypeTree(type) {
    return Promise.all(getSrcTreeData(type))
        .then(data => buildSourceTree(data, type));
}
function getSrcTreeData(type) {
    const typeKey = getSrcRcrdKey(type);
    return [ _db('getData', [['publication', 'author']]), _db('getData', [typeKey])];
}
function getSrcRcrdKey(type) {
    const keys = { 'auths': 'authSrcs', 'pubs': 'pubSrcs', 'publ': 'pubSrcs' };
    return keys[type];
}
function buildSourceTree(data, type) {
    let tree = buildTypeTree(type, getTreeRcrds(data[1], srcRcrds, 'source'), data[0]);
    // tree = filterTreeToInteractionSet(tree, 'srcs');
    return sortDataTree(tree);
}
function buildTypeTree(type, srcData, detailData) {
    const bldr = { 'pubs': buildPubTree, 'auths': buildAuthTree, 'publ': buildPublTree };
    return bldr[type](srcData, detailData);
}
/*--------------------- PUBLICATION TREE -------------------------------------*/
/**
 * Returns a tree object with Publications as the base nodes of the data tree.
 * Each interaction is attributed directly to a citation source, which currently
 * always has a 'parent' publication source.
 * Data structure:
 * ->Publication Title
 * ->->Citation Title
 * ->->->Interactions Records
 */
function buildPubTree(pubSrcRcrds, data) {                                      //console.log("buildPubSrcTree. Tree = %O", pubSrcRcrds);
    const tree = {};
    pubSrcRcrds.forEach(getPubBranch);
    return tree;

    function getPubBranch(pubSrc) {
        const branchData = getPubData(pubSrc, data.publication);
        if (!branchData) { return; }
        tree[pubSrc.displayName] = branchData;
    }
}
function getPubData(rcrd, pubRcrds) {                                           //console.log("getPubData. rcrd = %O", rcrd);
    rcrd.children = getPubChildren(rcrd, pubRcrds);
    if (rcrd.publication) {
        const pub = getDetachedRcrd(rcrd.publication, pubRcrds, 'publication');
        if (!pub) { return false; }
        rcrd.publication = pub;
    }
    return rcrd;
}
function getPubChildren(rcrd, pubRcrds) {                                       //console.log("getPubChildren rcrd = %O", rcrd)
    if (rcrd.children.length === 0) { return []; }
    return getTreeRcrds(rcrd.children, srcRcrds, 'source')
        .map(rcrd => getPubData(rcrd, pubRcrds)).filter(c => c);
}
/*--------------------- PUBLISHER TREE ---------------------------------------*/
/**
 * Returns a tree object with Publishers as the base nodes of the data tree.
 * Publications with no publisher are added underneath the "Unspecified" base node.
 * Data structure:
 * ->Publisher Name
 * ->->Publication Title
 * ->->->Citation Title
 * ->->->->Interactions Records
 */
function buildPublTree(pubSrcRcrds, data) {                                 //console.log("buildPublSrcTree. Tree = %O", pubRcrds);
    const pubRcrds = data.publication;
    const tree = {};
    const noPubl = [];
    pubSrcRcrds.forEach(getPublBranch);
    tree["Unspecified"] = getPubsWithoutPubls(noPubl);
    return tree;

    function getPublBranch(pub) {
        if (!pub.parent) { noPubl.push(pub); return; }
        const publ = getDetachedRcrd(pub.parent, srcRcrds, 'source');
        if (!publ) { return; }
        tree[publ.displayName] = getPublData(publ);
    }
    function getPublData(rcrd) {
        rcrd.children = getPubChildren(rcrd, pubRcrds);
        return rcrd;
    }
    function getPubsWithoutPubls(pubs) {
        const publ = { id: 0, displayName: "Unspecified", parent: null,
            sourceType: { displayName: 'Publisher' }, interactions: [] };
        publ.children = pubs.map(pub => getPubData(pub, pubRcrds)).filter(c=>c);
        return publ;
    }
}
/*--------------------- AUTHOR TREE ------------------------------------------*/
/**
 * Returns a tree object with Authors as the base nodes of the data tree,
 * with their contributibuted works and the interactions they contain nested
 * within. Authors with no contributions are not added to the tree.
 * Data structure:
 * ->Author Display Name [Last, First M Suff]
 * ->->Citation Title (Publication Title)
 * ->->->Interactions Records
 */
function buildAuthTree(authSrcRcrds, data) {                                    //console.log("----buildAuthTree. authSrcRcrds = %O, data = %O", authSrcRcrds, data);
    const pubRcrds = data.publication;
    const authRcrds = data.author;
    const tree = {};
    authSrcRcrds.forEach(getAuthBranch);
    return tree;

    function getAuthBranch(authSrc) {                                           //console.log("rcrd = %O", authSrc);
        if (!authSrc.contributions.length) { return; }
        authSrc.author = getDetachedRcrd(authSrc.author, authRcrds, 'author');
        if (!authSrc.author) { return; }
        authSrc.children = getAuthChildren(authSrc.contributions);
        tree[authSrc.displayName] = authSrc;
    }
    /** For each source work contribution, gets any additional publication children
     *  and return's the source record.
     */
    function getAuthChildren(contribs) {                                        //console.log("getAuthChildren contribs = %O", contribs);
        return getTreeRcrds(contribs, srcRcrds, 'source')
            .map(rcrd => getPubData(rcrd, pubRcrds)).filter(c => c);
    }
}