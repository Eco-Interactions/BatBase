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
                        ],
                    ], [ //row 2
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
                            { field: 'Publication Type', content: data.source.citation.citationType.displayName, classes: 'max-cntnt' },
                            { field: 'DOI', content: data.source.doi },
                            { field: 'Website', content: null },
                            'col'
                        ], [
                            getContributorFieldData(data.source.contributors)
                        ], [
                            { field: 'Citation', content: data.source.description },
                        ]
                    ], [
                        [
                            { field: 'Abstract', content: data.source.citation.abstract }
                        ]
                    ]
                            // { field: 'Publication', content: data.source.parent.displayName },
                            // { field: 'Publisher', content: getPublisherData(data.source.parent.parent) },
                            // { field: 'Description', content: data.source.parent.description },
                            // { field: 'Year', content: data.source.parent.year },
                            // { field: 'DOI', content: data.source.parent.doi },
                            // { field: 'Website', content: null },
                            // getCitationTypeAndTitleFieldData(data.source.citation)
                            // { field: 'Year', content: data.source.year },
                            // { field: 'Pages', content: data.source.citation.publicationPages },
                            // { field: 'Volume', content: data.source.citation.publicationVolume },
                            // { field: 'Issue', content: data.source.citation.publicationIssue },
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
function getTaxonHierarchyDataHtml (taxon) {
    return `<strong>${taxon.displayName}</strong>` + getParentTaxaNames(taxon.parentTaxon);
}
function getParentTaxaNames (pTaxon, lvl = 1) {
    if (!pTaxon) { return ''; }
    const indent = '&emsp;'.repeat(lvl);
    return `<br>${indent}${String.fromCharCode(8627)}&nbsp${pTaxon.displayName}`
        + (pTaxon.isRoot ? '' : getParentTaxaNames(pTaxon.parentTaxon, ++lvl));
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
    const loc = [pSrc.publisher.city, pSrc.publisher.country].filter(c => c).join(', ');
    return pSrc.displayName + (!!loc ? ('<br>' + loc) : '');
}
function getCitationTypeAndTitleFieldData (citation) {
    return { field: citation.citationType.displayName, content: citation.displayName };
}
/* ---------------------------- LOCATION ------------------------------------ */
function getElevRange (location) {
    return location.elevationMax && location.elevation ?
        (location.elevation + ' - ' + location.elevationMax) :
        (location.elevation || location.elevationMax); //Some locations have a max but not the base of the range. Will fix in data soon.
}
function getCoordinates (location) {
    return location.latitude ?
        (location.latitude.toString() + ', ' + location.longitude.toString()) : null;
}