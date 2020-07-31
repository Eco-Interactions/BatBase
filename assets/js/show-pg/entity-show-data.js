/**
 * Returns the entity's data formatted for display and grouped by sections, rows,
 * and cells.
 * Ex: [{
 *        section: 'name',
 *        rows: [
 *            (row1)[
 *                (cell) [
 *                    { field: 'name', content: data }
 *                ], (cell)...
 *            ], (row2)...
 *         ]
 *      }, { section2 }]
 *
 * TOC:
 *    ENTITY-SHOW CONFG
 *    FIELD-DATA HANDLERS
 */
 let util;
/* =================== ENTITY-SHOW CONFIG =================================== */
export default function getEntityDisplayData (entity, data, u) {
    util = u;
    return getEntityShowData(entity, data).map(c => c); //detach obj
}
function getEntityShowData(entity, data) {
    const map = {
        interaction: getIntDisplayData, taxon: getTxnDisplayData
    };
    return map[entity](data);
}
function getIntDisplayData(data) {
    return [
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
                        { field: 'DOI', content: getDoiLink(data.source.doi) },
                        { field: 'Website', content: getCitationWebsite(data.source) },
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
                        { field: 'Country', content: getNameIfSet(data.location, "country") },
                        { field: 'Region', content: data.location.region.displayName, classes: 'max-cntnt' },
                        'col'
                    ], [
                        { field: 'Habitat', content: getNameIfSet(data.location, "habitatType") },
                        { field: 'Elevation(m)', content: getElevRange(data.location) },
                        'col'
                    ], [
                        { field: 'Description', content: data.location.description },
                    ]
                ]
            ]
        }
    ];
}
function getTxnDisplayData(data) {
    return [
        {
            section:  'Taxon Hierarchy',
            rows: [
               [  //row 1
                    [
                        { field: data.realm.displayName, content: getTaxonHierarchyDataHtml(data, 'down') },
                    ],
                ]
            ]
        }
    ];
}

/* ================== FIELD-DATA HANDLERS =================================== */
function getTagData (tags) {
    if (!tags.length) { return null; }
    return tags.map(t => t.displayName).join(', ');
}
function getNameIfSet(entity, field) {
    return entity[field] ? entity[field].displayName : null;
}
function getEntityLinkHtml(entity, id, displayTxt) {
    const link = $('body').data('base-url') + entity + '/' + id;
    return `<a href="${link}">${displayTxt}</a>`;
}
/* ------------------------------- TAXON ------------------------------------ */
function getTaxonHierarchyDataHtml (taxon, dir) {
    const txnNameHtml = `<strong>${taxon.displayName}</strong>`;
    const linkedTxn = getEntityLinkHtml('taxon', taxon.id, txnNameHtml);
    if (taxon.isRoot) { return linkedTxn; }
    const txnLinks = [linkedTxn];
    getHeirarchyTaxaLinks(taxon.parentTaxon);
    if (dir === 'down') { txnLinks.reverse(); }
    return txnLinks.reduce(buildTaxonomicHierarchyHtml, '');

    function getHeirarchyTaxaLinks(pTaxon) {
        const link = getEntityLinkHtml('taxon', pTaxon.id, pTaxon.displayName);
        txnLinks.push(link);
        if (pTaxon.isRoot) { return; }
        getHeirarchyTaxaLinks(pTaxon.parentTaxon);
    }
}
function buildTaxonomicHierarchyHtml(namesHtml, val, i) {
    const indent = !i ? '' : '<br>' + '&emsp;'.repeat(i);
    return namesHtml + `${indent}${String.fromCharCode(8627)}&nbsp${val}`;
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
function getCitationWebsite(source) {
    return source.linkUrl ?
        `<a href="${source.linkUrl}"" target="_blank">${source.linkDisplay}</a>` : null;
}
function getDoiLink(doi) {
    return doi ? `<a href="${doi}" target="_blank">${doi}</a>` : null;
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