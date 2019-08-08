/**
 * Formats the tree data into the row-data format used in ag-grid.
 *
 * Exports:                         Imported by:
 *     transformLocDataAndLoadTable         db-page, save-ints
 *     transformSrcDataAndLoadTable         db-page, save-ints
 *     transformTxnDataAndLoadTable         db-page, save-ints
 */
import initTbl from './init-table.js'

/*--------- Location Data Formatting ---------------------------------------------------------------------------------*/
/**
 * Transforms the tree's location data into the table format and sends the data 
 * to the init-table module.
 */
export function transformLocDataAndLoadTable(locTree, tblState) {  
    initTbl("Location Tree", transformLocData(locTree, tblState), tblState);
}
function transformLocData(tree, tblState) {
    const finalRowData = [];                                                    //console.log("locTree = %O", tree);
    for (let topNode in tree) {                                                 //console.log("topNode = ", topNode)
        finalRowData.push(getLocRowData(tree[topNode], 0, tblState)); 
    }
    return removeLocsWithoutInteractions(finalRowData);
}
/** Returns a row data object for the passed location and it's children.  */
function getLocRowData(locRcrd, treeLvl, tblState) {                            //console.log("--getLocRowData called for %s = %O, tblState = %O", locRcrd.displayName, locRcrd, tblState);
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
    function getLocRowDataForRowChildren(locRcrd, pTreeLvl) {                   //console.log("getLocRowDataForChildren called. locRcrd = %O", locRcrd)
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
/*--------- Source Data Formatting -----------------------------------------------------------------------------------*/
/**
 * Transforms the tree's source record data into table row format and sends the 
 * data to the init-table module.
 */
export function transformSrcDataAndLoadTable(srcTree, tblState) {               //console.log("transformSrcDataAndLoadTable called.")
    const rowData = transformSrcData(srcTree, tblState);                  
    initTbl(getSrcTreeName(tblState.curView), rowData, tblState);
}
function transformSrcData(tree, tblState) {
    let rowColorIdx = 0;
    const finalRowData = [];

    for (let topNode in tree) {
        rowColorIdx = rowColorIdx < 6 ? ++rowColorIdx : 0; 
        finalRowData.push(getSrcRowData(tree[topNode], 0, rowColorIdx, tblState));
    }
    return finalRowData;  
}
function getSrcRowData(src, treeLvl, idx, tblState) {                           //console.log("getSrcRowData. source = %O", src);
    const entity = src.sourceType.displayName;
    const detailId = entity === "Publication" ? src.publication.id : null;  
    const displayName = src.displayName.includes('(citation)') ? 
        'Whole work cited.' : src.displayName;
    return {
        id: src.id,
        entity: entity,
        pubId: detailId,
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
/*-------- Taxon Data Formatting ------------------------------------------*/
/**
 * Transforms the tree's taxon record data into the table format and sends the data 
 * to the init-table module.
 */
export function transformTxnDataAndLoadTable(taxonTree, tblState) {             //console.log("transformTaxonDataAndLoadTable called. taxonTree = %O", taxonTree)
    initTbl("Taxon Tree", transformTaxonData(taxonTree, tblState), tblState);
}
function transformTaxonData(tree, tblState) {
    const finalRowData = [];
    for (let topTaxon in tree) {
        finalRowData.push(getTaxonRowData(tree[topTaxon], 0, tblState));
    }
    return finalRowData;                                                        //console.log("rowData = %O", finalRowData);
}
/**
 * Recurses through each taxon's 'children' property and returns a row data obj 
 * for each taxon in the tree.
 */
function getTaxonRowData(taxon, treeLvl, tblState) {                            //console.log("taxonRowData. taxon = %O, tblState = %O", taxon, tblState);
    const lvl = taxon.level.displayName;
    const name = lvl === "Species" ? taxon.displayName : lvl+" "+taxon.displayName;
    const intCount = getIntCount(taxon); 
    return {
        id: taxon.id,
        children: getTaxonChildRowData(taxon, treeLvl, tblState),
        displayName: taxon.displayName,
        entity: "Taxon",
        interactions: intCount !== null,          
        intCnt: intCount,   
        isParent: true,                     
        name: name,
        open: tblState.openRows.indexOf(taxon.id.toString()) !== -1, 
        parentTaxon: taxon.parent && taxon.parent > 1 ? taxon.parent : false,
        taxonLvl: lvl,
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
 * Returns both interactions for the curTaxon and rowData for any children.
 * The interactions for non-species Taxa are grouped as the first child row 
 * under "Unspecified [taxonName] Interactions", for species the interactions 
 * are added as rows directly beneath the taxon.
 */
function getTaxonChildRowData(curTaxon, curTreeLvl, tblState) {                 
    let childRows = [];
    if (curTaxon.level.id !== 7){ //Species
        getUnspecifiedInts(curTreeLvl);
        if (curTaxon.children && curTaxon.children.length) { 
            getTaxonChildRows(curTaxon.children); 
        }
    } else { childRows = getTaxonIntRows(curTaxon, curTreeLvl, tblState); }
    return childRows;

    function getUnspecifiedInts(curTreeLvl) {
        var realmMap = { '2': 'Bat', '3': 'Plant', '4': 'Arthropod' };  
        var name = curTaxon.id in realmMap ?  
            realmMap[curTaxon.id] : curTaxon.displayName;
        getUnspecifiedTaxonInts(curTaxon, name, curTreeLvl);
    }
    /**
     * Groups interactions attributed directly to a taxon with child-taxa
     * and adds them as it's first child row. 
     * Note: Realm interactions are built closed, otherwise they would be expanded
     * by default
     */
    function getUnspecifiedTaxonInts(rcrd, taxonName, treeLvl) { 
        if (rcrd.failedFltr) {  return; }
        const realmIds = ['2', '3', '4'];  
        if (getIntCount(curTaxon) !== null) { 
            childRows.push({
                id: curTaxon.id,
                children: getTaxonIntRows(curTaxon, treeLvl, tblState),
                displayName: taxonName,
                entity: 'Taxon',
                groupedInts: true,
                interactions: true,
                isParent: true,
                name: `Unspecified ${taxonName} Interactions`,
                open: realmIds.indexOf(curTaxon.id) === -1 ? false : 
                    tblState.openRows.indexOf(curTaxon.id.toString()) !== -1,
                taxonLvl: curTaxon.level.displayName,
                treeLvl: treeLvl,
            });
        }
    }
    function getTaxonChildRows(children) {
        children.forEach(function(childTaxon){
            childRows.push( getTaxonRowData(childTaxon, curTreeLvl + 1, tblState));
        });
    }
} /* End getTaxonChildRowData */
function getTaxonIntRows(taxon, treeLvl, tblState) {                            //console.log("getTaxonInteractions for = %O. tblState = %O", taxon, tblState);
    const ints = [];
    ['subjectRoles', 'objectRoles'].forEach(function(role) {
        taxon[role].forEach(function(intRcrd){
            ints.push(buildTaxonIntRowData(intRcrd, treeLvl, tblState));
        });
    });
    return ints;
}
/** Adds the taxon heirarchical data to the interactions row data. */ 
function buildTaxonIntRowData(intRcrd, treeLvl, tblState) {
    const rowData = buildIntRowData(intRcrd, treeLvl);
    getCurTaxonLvlCols(tblState).forEach(function(colName){
        rowData[colName] = intRcrd[colName];
    });
    return rowData;                
}
function getCurTaxonLvlCols(tblState) {                                         //console.log("taxaByLvl = %O", tParams.taxaByLvl)
    var lvls = Object.keys(tblState.taxaByLvl);
    return lvls.map(function(lvl){ return 'tree' + lvl; });
}
/*------------------------ UTILITY ------------------------------------------ */
/**
 * Returns an array with table-row objects for each interaction record.
 * Note: var idx is used for row coloring.
 */
function getIntRowData(intRcrdAry, treeLvl, idx) {
    if (intRcrdAry) {
        return intRcrdAry.map(function(intRcrd){                                //console.log("intRcrd = %O", intRcrd);
            return buildIntRowData(intRcrd, treeLvl, idx);
        });
    }
    return [];
}
/** Returns an interaction rowData object with flat data in table-ready format. */
function buildIntRowData(intRcrd, treeLvl, idx){                                //console.log("intRcrd = %O", intRcrd);
    var rowData = {
        isParent: false,
        name: "",
        treeLvl: treeLvl,
        type: "intRcrd", 
        id: intRcrd.id,
        entity: "Interaction",
        interactionType: intRcrd.interactionType.displayName,
        citation: intRcrd.source.description,
        subject: getTaxonName(intRcrd.subject),
        object: getTaxonName(intRcrd.object),
        tags: intRcrd.tags,
        note: intRcrd.note, 
        rowColorIdx: idx,
        updatedAt: intRcrd.updatedAt,
        updatedBy: intRcrd.updatedBy,
        year: intRcrd.source.year
    };
    if (intRcrd.location) { getLocationData(intRcrd.location); }
    return rowData;
    /** Adds to 'rowData' any location properties present in the intRcrd. */
    function getLocationData(locObj) {
        getSimpleLocData();
        getOtherLocData();
        /** Add any present scalar location data. */
        function getSimpleLocData() {
            var props = {
                location: 'displayName',    gps: 'gpsData',
                elev: 'elevation',          elevMax: 'elevationMax',
                lat: 'latitude',            lng: 'longitude',
            };
            for (var p in props) {
               if (locObj[props[p]]) { rowData[p] = locObj[props[p]]; } 
            }
        }
        /** Adds relational location data. Skips 'unspecified' regions. */
        function getOtherLocData() {
            var props = {
                country: "country",         region: "region",
                habitat: "habitatType"          
            };
            for (var p in props) {
                if (locObj[props[p]]) { 
                    if (p === "region" && locObj[props[p]].displayName === "Unspecified") { continue; }
                    rowData[p] = locObj[props[p]].displayName; } 
            }                
        }
    } /* End getLocationData */
} /* End buildIntRowData */
function getTaxonName(taxon) {                                           
    var lvl = taxon.level.displayName;  
    return lvl === "Species" ? taxon.displayName : lvl+' '+taxon.displayName;
}   