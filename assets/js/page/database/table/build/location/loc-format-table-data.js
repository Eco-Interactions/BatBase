/**
 * Builds a tree of the Location data to display in the agGrid table format.
 *
 * Export
 *     buildLocRowData
 */
import { getIntRowData } from '../table-build-main.js';

export function buildLocRowData(tree, tblState) {
    const finalRowData = [];
    for (let topNode in tree) {
        finalRowData.push(getLocRowData(tree[topNode], 0, tblState));
    }
    return removeLocsWithoutInteractions(finalRowData);
}
/** Returns a row data object for the passed location and it's children.  */
function getLocRowData(locRcrd, treeLvl, tblState) {                /*dbug-log*///console.log("--getLocRowData called for %s = %O, tblState = %O", locRcrd.displayName, locRcrd, tblState);
    return {
        id: locRcrd.id,
        entity: "Location",
        name: getLocDisplayName(),  /* Interaction rows have no name to display. */
        onMap: isMappable(locRcrd),
        isParent: locRcrd.interactionType === undefined,  /* Only interaction records return false. */
        open: tblState.openRows.indexOf(locRcrd.id) !== -1,
        children: getLocRowDataForRowChildren(locRcrd, treeLvl),
        treeLvl: treeLvl,
        interactions: locRcrd.interactions.length > 0,     /* Location objects have collections of interactions as children. */
        locGroupedInts: hasGroupedInteractionsRow(locRcrd),
        type: locRcrd.locationType.displayName,
        updatedBy: locRcrd.updatedBy,
    };
    function getLocDisplayName() {
        const trans = { 'Unspecified': 'Unspecified / Habitat Only' };
        return trans[locRcrd.displayName] || locRcrd.displayName;
    }
    function isMappable(loc) {
        return loc.geoJsonId ? loc.id : false;
    }
    /**
     * Returns rowData for interactions at this location and for any children.
     * If there are both interactions and children, the interactions rows are
     * grouped under the first child row as "Unspecified [locName] Interactions",
     * otherwise interaction rows are added directly beneath the taxon.
     */
    function getLocRowDataForRowChildren(locRcrd, pTreeLvl) {       /*dbug-log*///console.log("getLocRowDataForChildren called. locRcrd = %O", locRcrd)
        let childRows = [];
        const locType = locRcrd.locationType.displayName;
        if (locType === "Region" || locType === "Country") {
            getUnspecifiedLocInts(locRcrd, locRcrd.interactions, pTreeLvl, locType);
            locRcrd.children.forEach(getChildLocData);
        } else { childRows = getIntRowData(locRcrd.interactions, pTreeLvl); }
        return childRows;
        /**
         * Groups interactions attributed directly to a location with child-locations
         * and adds them as it's first child row.
         */
        function getUnspecifiedLocInts(rcrd, intsAry, treeLvl, locType) {
            if (rcrd.failedFltr) {  return; }
            const locName = locRcrd.displayName === "Unspecified" ?
                "Location" : locRcrd.displayName;
            const rowData = {
                id: locRcrd.id,
                entity: "Location",
                name: 'Unspecified ' + locName + ' Interactions',
                isParent: true,
                open: false,
                children: getUnspecifiedInts(rcrd.children, intsAry, treeLvl),
                interactions: intsAry.length > 0,
                treeLvl: treeLvl,
                groupedInts: true,
                type: locType
            };
            if (!rowData.children.length) { return; }
            childRows.push(rowData);
        }
        function getUnspecifiedInts(locs, ints, treeLvl) {
            const ids = locs.map(getHabInts).reduce(concatInts, ints);
            return getIntRowData(ids, pTreeLvl)

            function concatInts(all, habInts) {
                return all.concat(habInts);
            }
        }
        function getHabInts(loc) {
            if (loc.locationType.displayName !== 'Habitat') { return []; }
            return loc.interactions;
        }
        function getChildLocData(childLoc) {
            if (childLoc.locationType.displayName === 'Habitat') { return; }
            childRows.push(getLocRowData(childLoc, pTreeLvl + 1, tblState));
        }
    }
}
function hasGroupedInteractionsRow(locRcrd) {
    return locRcrd.children.length > 0 && locRcrd.interactions.length > 0;
}
/** Filters out all locations with no interactions below them in the tree. */
function removeLocsWithoutInteractions(rows) {
    return rows.filter(function(row){
        if (row.children) {
            row.children = removeLocsWithoutInteractions(row.children);
        }
        return row.interactions || hasChildInteractions(row);
    });
}
function hasChildInteractions(row) {
    if (!row.children) { return true; }
    return row.children.some(function(childRow) {
        return childRow.interactions || hasChildInteractions(childRow);
    });
}