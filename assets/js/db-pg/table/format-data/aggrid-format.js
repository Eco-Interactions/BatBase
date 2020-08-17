/**
 * Formats the tree data into the row-data format used in ag-grid.
 *
 * Exports:                Imported by:
 *     buildLocRowData         db-page
 *     buildSrcRowData         db-page
 *     buildTxnRowData         db-page
 *
 * TOC:
 *     LOCATION ROW DATA
 *     SOURCE ROW DATA
 *     TAXON ROW DATA
 *     INTERACTION ROW DATA
 */
/* --------------------- LOCATION ROW DATA ---------------------------------- */
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
            if (intsAry.length > 0) {
                childRows.push({
                    id: locRcrd.id,
                    entity: "Location",
                    name: 'Unspecified ' + locName + ' Interactions',
                    isParent: true,
                    open: false,
                    children: getIntRowData(intsAry, treeLvl),
                    interactions: intsAry.length > 0,
                    treeLvl: treeLvl,
                    groupedInts: true,
                    type: locType
                });
            }
        }
        function getChildLocData(childLoc) {
            childRows.push(getLocRowData(childLoc, pTreeLvl + 1, tblState));
        }
    } /* End getLocRowDataForChildren */

} /* End getLocRowData */
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
/* ------------------ SOURCE ROW DATA --------------------------------------- */
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
    const pubType =  entity === "Publication" ? src.publication.publicationType.id : null;
    const displayName = src.displayName.includes('(citation)') ?
        'Whole work cited.' : src.displayName;
    return {
        id: src.id,
        entity: entity,
        type: pubType,
        name: displayName,
        isParent: true,
        parentSource: src.parent,
        open: tblState.openRows.indexOf(src.id.toString()) !== -1,
        children: getChildSrcRowData(src, treeLvl, idx),
        treeLvl: treeLvl,
        interactions: src.isDirect,   //Only rows with interaction are colored
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
} /* End getSrcRowData */
function getSrcTreeName(view) {
    const prefix = { "pubs": "Publication", "auths": "Author", "publ": "Publisher"};
    return prefix[view] + ' Tree';
}
/* ---------------- TAXON ROW DATA ------------------------------------------ */
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
        realm: taxon.realm.id, // Used for the object realm filter in Bat view
        taxonLvl: taxon.level.displayName,
        treeLvl: treeLvl,
        updatedBy: taxon.updatedBy
    };
} /* End getTaxonRowData */
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
    if (taxon.level.displayName !== 'Species'){
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
        const name = taxon.isRoot ? taxon.realm.displayName : taxon.name;
        addUnspecifiedTaxonIntsRow(name, curTreeLvl);
    }
    /**
     * Groups interactions attributed directly to a taxon with child-taxa
     * and adds them as it's first child row.
     * Note: Realm interactions are built closed, otherwise they would be expanded
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
            taxonLvl: taxon.level.displayName,
            treeLvl: treeLvl,
        });
    }
    function getTaxonChildRows(children) {
        children.forEach(childTaxon => {
            rows.push(getTaxonRowData(childTaxon, curTreeLvl + 1, tblState));
        });
    }
} /* End getTaxonAndChildTaxaRowData */
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
    getCurTaxonLvlCols(tblState).forEach(colName => {
        rowData[colName] = intRcrd[colName];
    });
    return rowData;
}
function getCurTaxonLvlCols(tblState) {
    var lvls = Object.keys(tblState.taxaByLvl);
    return lvls.map(function(lvl){ return 'tree' + lvl; });
}
/*------------------------ INTERACTION ROW DATA ----------------------------- */
/**
 * Returns an array with table-row objects for each interaction record.
 * Note: var idx is used for row coloring.
 */
function getIntRowData(intRcrdAry, treeLvl, idx) {
    if (intRcrdAry) {
        return intRcrdAry.map(intRcrd => {
            return buildIntRowData(intRcrd, treeLvl, idx);
        });
    }
    return [];
}
/** Returns an interaction rowData object with flat data in table-ready format. */
function buildIntRowData(intRcrd, treeLvl, idx){
    const rowData = {
        citation: getEntityData('source', 'description'),
        entity: 'Interaction',       //Not sure what this is all used for...
        id: intRcrd.id,
        interactionType: intRcrd.interactionType.displayName,   //Table data
        isParent: false,  //Tell grid and various code not to expect sub-nodes
        name: '',           // Blank tree field
        note: intRcrd.note,    //Table data
        object: getEntityData('taxon', 'displayName', 'object'),
        rowColorIdx: idx,       //Not sure what this is all used for...
        subject: getEntityData('taxon', 'displayName', 'subject'),
        tags: intRcrd.tags,   //Table data
        treeLvl: treeLvl,       //Influences row coloring
        type: 'intRcrd',        //Not sure what this is all used for...
        updatedAt: intRcrd.serverUpdatedAt,  //When filtering interactions by time updated
        updatedBy: intRcrd.updatedBy === 'Sarah' ? null : intRcrd.updatedBy,
        year: getEntityData('source', 'year')       //When filtering interactions by publication date
    };

    if (intRcrd.location) { getLocationData(intRcrd.location); }  //Table & csv export data
    return rowData;
    /** Adds to 'rowData' any location properties present in the intRcrd. */
    function getLocationData(locObj) {
        getSimpleLocData();
        getOtherLocData();
        /** Add any present scalar location data. */
        function getSimpleLocData() {
            const props = {
                location: 'displayName',    gps: 'gpsData',
                elev: 'elevation',          elevMax: 'elevationMax',
                lat: 'latitude',            lng: 'longitude',
            };
            for (var p in props) {
                rowData[p] = locObj[props[p]] ? locObj[props[p]] :
                    !Object.keys(locObj).length ? '[ Loading... ]' : '';
            }
        }
        /** Adds relational location data. Skips 'unspecified' regions. */
        function getOtherLocData() {
            const props = {
                country: 'country', region: 'region', habitat: 'habitatType'
            };
            for (let p in props) {
                rowData[p] = ifDataAvailable(p) ? locObj[props[p]].displayName :
                    !Object.keys(locObj).length ? '[ Loading... ]' : '';
            }
            function ifDataAvailable(p) {
                return locObj[props[p]] && !ifUnspecifiedRegion(p);
            }
            function ifUnspecifiedRegion(p) {
                return p === 'region' && locObj[props[p]].displayName === 'Unspecified';
            }
        }
    } /* End getLocationData */
    function getEntityData(entity, prop, intProp) {
        const rcrdKey = intProp || entity;
        return prop in intRcrd[rcrdKey] ? intRcrd[rcrdKey][prop] :
            !Object.keys(intRcrd[rcrdKey]).length ? '[ Loading... ]' : '';
    }
} /* End buildIntRowData */