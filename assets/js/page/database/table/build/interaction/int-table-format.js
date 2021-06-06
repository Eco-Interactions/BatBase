/**
 * Formats interaction data for the agGrid table.
 *
 * Export
 *     getIntRowData
 *     buildIntRowData
 */
/**
 * Returns an array with table-row objects for each interaction record.
 * Note: var idx is used for row coloring.
 */
export function getIntRowData(intRcrdAry, treeLvl, idx) {
    if (intRcrdAry) {
        return intRcrdAry.map(intRcrd => {
            return buildIntRowData(intRcrd, treeLvl, idx);
        });
    }
    return [];
}
/** Returns an interaction rowData object with flat data in table-ready format. */
export function buildIntRowData(intRcrd, treeLvl, idx){                         //console.log('buildIntRowData. int = %O', intRcrd);
    const rowData = {
        citation: getEntityData('source', 'description'),
        entity: 'Interaction',       //Not sure what this is all used for...
        id: intRcrd.id,
        interactionType: intRcrd.interactionType.displayName,   //Table data
        isParent: false,        //Tell grid and various code not to expect sub-nodes
        name: '',               // Blank tree field
        note: intRcrd.note,     //Table data
        object: getEntityData('taxon', 'displayName', 'object'),
        objGroupId: intRcrd.objGroupId.toString(),//Used for the Object Group filter in taxon->bat view and interaction-row tree-icons
        subjGroupId: intRcrd.subjGroupId.toString(),//Used for interaction-row tree-icons
        rowColorIdx: idx,       //Not sure what this is all used for...
        subject: getEntityData('taxon', 'displayName', 'subject'),
        tags: intRcrd.tags,     //Table data
        treeLvl: treeLvl,       //Influences row coloring
        type: 'intRcrd',        //Not sure what this is all used for...
        updatedAt: intRcrd.serverUpdatedAt,  //When filtering interactions by time updated
        updatedBy: intRcrd.updatedBy === 'Sarah' ? null : intRcrd.updatedBy,
        year: getEntityData('source', 'year').replace(/\D/g,'')       //When filtering interactions by publication date
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
    }
    function getEntityData(entity, prop, intProp) {
        const rcrdKey = intProp || entity;
        return prop in intRcrd[rcrdKey] ? intRcrd[rcrdKey][prop] :
            !Object.keys(intRcrd[rcrdKey]).length ? '[ Loading... ]' : '';
    }
}