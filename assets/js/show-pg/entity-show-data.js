/**
 * Returns an Array with the entity's data seperated into sections, rows, and 
 * cells for each field with it's data formatted for display.
 * Eg: [{ section: 'name', rows: [ row1-[ cell1-[ { field: 'name', content: data } ], cell... ], row... ]}, { section2 }] 
 * 
 * TOC:
 *    ENTITY-SHOW CONFG
 *    FIELD-DATA HANDLERS
 */
 let util;
/* =================== ENTITY-SHOW CONFIG =================================== */
export default function getEntityShowData (entity, data, u) {
    util = u;
    const confg = {
        interaction: [
            {
                section:  'Interaction Details', 
                rows: [
                   [  //row 1
                        [ //cell 1
                            { field: 'Type', content: data.interactionType.displayName },
                            { field: 'Tag', content: getTagData(data.tags) },
                            'col' //flex direction for multiple fields in single cell
                        ],[  //cell 2
                            { field: 'Subject', content: getTaxonHierarchyDataHtml(data.subject) }
                        ],[  //cell 3
                            { field: 'Object', content: getTaxonHierarchyDataHtml(data.object) }
                        ]
                    ],[ //row 2
                        [  //cell 1
                            { field: 'Note', content: data.note }
                        ]
                    ]
                ]
            },{
                section:  'Source', 
                rows: [
                   [  //row 1
                        [ 
                            { field: 'Publication', content: data.source.parent.displayName },
                            { field: 'Publication Type', content: data.source.parent.publication.publicationType.displayName },
                            'col'
                        ], [
                            getContributorFieldData(data.source.parent.contributors),
                        ], [
                            { field: 'Publisher', content: getPublisherData(data.source.parent.parent) },
                            { field: 'Description', content: data.source.parent.description },
                            'col'
                        ], [ 
                            // { field: 'Year', content: data.source.parent.year },
                            { field: 'DOI', content: data.source.parent.doi },
                            { field: 'Website', content: null },
                            'col'
                        ],
                    ], [//row 2
                        [ 
                            getCitationTypeAndTitleFieldData(data.source.citation)
                        ], [
                            { field: 'Year', content: data.source.year },
                            { field: 'Pages', content: data.source.citation.publicationPages },
                            'col'
                        ], [
                            { field: 'Volume', content: data.source.citation.publicationVolume },
                            { field: 'Issue', content: data.source.citation.publicationIssue },
                            'col'
                        ], [
                            { field: 'DOI', content: data.source.doi },
                            { field: 'Website', content: null },
                            'col'
                        ]
                    ], [//row 3
                        [ 
                            getContributorFieldData(data.source.contributors),
                            { field: 'Citation', content: data.source.description, classes: 'w333' },
                            'row'
                        ],
                    ], [//row 4
                        [
                            { field: 'Abstract', content: data.source.citation.abstract }
                        ],

                    ]
                ]
            },{
                section:  'Location', 
                rows: [
                   [  //row 1
                        [ 
                            { field: 'Name', content: data.location.displayName },
                            { field: 'Coordinates', content: getCoordinates(data.location), classes: 'max-cntnt'},
                            'col'
                        ], [
                            { field: 'Country', content: data.location.country.displayName },
                            { field: 'Region', content: data.location.region.displayName, classes: 'max-cntnt' },
                            'col'
                        ], [
                            { field: 'Habitat', content: data.location.habitatType.displayName },
                            { field: 'Elevation(m)', content: getElevRange(data.location) },
                            'col'
                        ], [
                            { field: 'Description', content: data.location.description },
                        ]
                    ]
                ]
            }
        ]
    };
    util = null;
    return confg[entity].map(c => c); //detach obj
}
/* ================== FIELD-DATA HANDLERS =================================== */
function getTagData (tags) { 
    if (!tags.length) { return null; }
    return tags.map(t => t.displayName).join(', ');
}
/* ------------------------------- TAXON ------------------------------------ */
function getTaxonHierarchyDataHtml (data) { 
    return JSON.stringify(data).substr(0, 200);
}
/* ---------------------------- SOURCE -------------------------------------- */
function getContributorFieldData (contribs) {
    if (!contribs || !Object.keys(contribs).length) { return null; }
    let type;
    const names = Object.keys(contribs).map(storeTypeAndReturnName).join("<br>");
    return { field: util.ucfirst(type)+'s', content: names, classes: 'max-cntnt' };
    
    function storeTypeAndReturnName (ord) {
        type = Object.keys(contribs[ord])[0]; 
        return contribs[ord][type];
    }
}
function getPublisherData (pSrc) {
    if (!pSrc) { return null; }
    const loc = [pSrc.publisher.city, pSrc.publisher.country].join(', ');
    return pSrc.displayName + (!!loc ? ('<br>' + loc) : '');
}
function getCitationTypeAndTitleFieldData (citation) {
    return { field: citation.citationType.displayName, content: citation.displayName };
}
/* ---------------------------- LOCATION ------------------------------------ */
function getElevRange (location) {
    return location.elevationMax ? 
        (location.elevation + ' - ' + location.elevationMax) : location.elevation;
}
function getCoordinates (location) {
    return location.latitude ? 
        (location.latitude.toString() + ', ' + location.longitude.toString()) : null;
}