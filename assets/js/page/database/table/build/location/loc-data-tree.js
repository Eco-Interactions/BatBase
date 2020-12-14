/**
 * Builds a tree of record data for the passed entities.
 *
 * Export
 *     buildLocTree
 */
import { getDetachedRcrd } from '~db';
import { fillTreeWithInteractions, getTreeRcrds, sortDataTree } from '../table-build-main.js';

let locRcrds;
/**
 * Builds a tree of location data with passed locations at the top level, and
 * sub-locations as nested children.
 */
export function buildLocTree(topLocs, rcrds) {
    locRcrds = rcrds;
    return fillTreeWithInteractions('locs', buildLocDataTree(topLocs));
}
function buildLocDataTree(topLocs) {
    let tree = {};                                                              //console.log("tree = %O", tree);
    topLocs.forEach(buildLocBrach);
    return sortDataTree(tree);

    function buildLocBrach(id) {
        const topLoc = getDetachedRcrd(id, locRcrds);
        tree[topLoc.displayName] = fillLocChildren(topLoc);
    }
}
/** Returns the location record with all child ids replaced with their records. */
function fillLocChildren(rcrd) {
    if (!rcrd.children.length) { return rcrd; }
    rcrd.children = getTreeRcrds(rcrd.children, locRcrds, 'location')
        .map(loc => fillLocChildren(loc));
    return rcrd;
}