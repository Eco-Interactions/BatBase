/**
 * Builds a tree of the Source data to display in the agGrid table format.
 *
 * Export
 *     buildSrcRowData
 */
import { getIntRowData } from '../table-build-main.js';

export function buildSrcRowData(tree, tblState) {
    let rowColorIdx = 0;
    const finalRowData = [];

    for (let topNode in tree) {
        rowColorIdx = rowColorIdx < 6 ? ++rowColorIdx : 0;
        finalRowData.push(getSrcRowData(tree[topNode], 0, rowColorIdx, tblState));
    }
    return finalRowData;
}
function getSrcRowData(src, treeLvl, idx, tblState) {               /*dbug-log*///console.log("getSrcRowData. source = %O", src);
    const entity = src.sourceType.displayName;
    const pubTypeId =  entity === "Publication" ? src.publication.publicationType.id : null;
    const displayName = src.displayName.includes('(citation)') ?
        'Whole work cited.' : src.displayName;
    return {
        id: src.id,
        entity: entity,
        type: pubTypeId,  // used for publication type filter
        name: displayName,
        isParent: true,
        parentSource: src.parent,
        open: tblState.openRows.indexOf(src.id.toString()) !== -1,
        children: getChildSrcRowData(src, treeLvl, idx),
        treeLvl: treeLvl,
        interactions: src.isDirect || false,   //Only rows with interaction are colored
        rowColorIdx: idx,
        updatedBy: src.updatedBy,
    };
    /**
     * Recurses through each source's 'children' property and returns a row data obj
     * for each source node in the tree.
     * Note: idx is used for row coloring.
     */
    function getChildSrcRowData(curSrc, treeLvl, idx) {
        if (curSrc.isDirect) { return getIntRowData(curSrc.interactions, treeLvl, idx); }
        return curSrc.children === null ? [] : getChildSrcData(curSrc, treeLvl, idx);

        function getChildSrcData(src, treeLvl, idx) {
            return src.children.map(function(childSrc) {                        //console.log("childSrc = %O", childSrc);
                idx = idx < 6 ? ++idx : 0;
                return getSrcRowData(childSrc, treeLvl +1, idx, tblState);
            });
        }
    }
}
function getSrcTreeName(view) {
    const prefix = { "pubs": "Publication", "auths": "Author", "publ": "Publisher"};
    return prefix[view] + ' Tree';
}