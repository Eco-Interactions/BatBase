/**
 * Returns the entity's data formatted for display and grouped by sections, rows,
 * and cells.
 * Ex: [{
 *        section: { classes, name },
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
import { _u } from '~util';
/* =================== ENTITY-SHOW CONFIG =================================== */
export default function getEntityDisplayData (entity, data) {       /*dbug-log*///console.log('get[%s]DisplayData = %O', entity, data);
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
            section:  {
                name: 'Interaction ' + data.id,
            },
            rows: [
               [  //row 1
                    [ //cell 1
                        { field: 'Subject', content: getTxnHierarchy(data.subject, 'parent') }
                    ],[  //cell 2
                        { field: 'Object', content: getTxnHierarchy(data.object, 'parent') }
                    ],[  //cell 3
                        { field: 'Type', content: data.interactionType.displayName },
                        { field: 'Tag', content: getTagData(data.tags) },
                        'col' //flex direction for multiple fields in single cell
                    ]
                ],[ //row 2
                    [  //cell 1
                        { field: 'Note', content: data.note }
                    ]
                ]
            ]
        },{
            section: {
                name:  'Source',
            },
            rows: [
               [  //row 1
                    [
                        // { field: 'Publication Type', content: data.source.citation.citationType.displayName, classes: 'max-cntnt' },
                        // { field: 'DOI', content: getDoiLink(data.source.doi) },
                        // { field: 'Website', content: getCitationWebsite(data.source) },
                    //     'col'
                    // ], [
                        getContributorFieldData(data.source.contributors)
                    ], [
                        { field: 'Citation', content: getCitationDisplay(data.source) },
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
            section:  {
                name: 'Location',
            },
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
            section:  {
                name: data.group.displayName + ' Hierarchy - ' + data.name,
            },
            rows: [
               [  //row 1
                    [
                        { field: 'heirachy', label: false, content: getTxnHierarchy(data, 'full') },
                    ],
                ]
            ]
        },{
            section:  {
                classes: 'flex-grow flex-wrap',
                name: getAllTaxonInts(data).length + ' Interactions',
            },
            rows: [
               [  //row 1
                    [
                        { field: 'By Type', content: getIntsGroupedBy('type', data), classes: 'max-cntnt' },
                    ],[
                        { field: 'By Country', content: getIntsGroupedBy('loc', data), classes: 'max-cntnt' },
                    ],
                    // [
                    //     { field: 'Publication', content: getIntsGroupedBy('src', data) },
                    // ],
                ]
            ]
        }
    ];
}

/* ================== FIELD-DATA HANDLERS =================================== */
function getTagData (tags) {
    if (!tags.length) { return null; }
    return tags.map(t => t.displayName).sort(moveSecondaryTag).join(', ');
}
function moveSecondaryTag(a, b) {
    return b === 'Secondary' ? -1 : 1;
}
function getNameIfSet(entity, field) {
    return entity[field] ? entity[field].displayName : null;
}
function getEntityLinkHtml(entity, id, displayTxt) {
    const link = $('body').data('base-url') + entity + '/' + id;
    return `<a href="${link}">${displayTxt}</a>`;
}
/* ------------------------------- TAXON ------------------------------------ */
/**
 * Returns the taxonomic heirachy for the group:
 *     full - All related taxa from the root down with the core taxon bolded
 *     parent - From the core taxon up through the group
 */
function getTxnHierarchy (taxon, group) {
    const txnNameHtml = `<strong>${taxon.displayName}</strong>`;
    const linkedTxn = getEntityLinkHtml('taxon', taxon.id, txnNameHtml);
    if (taxon.isRoot && group === 'parent') { return linkedTxn; }
    const heirachy = [ linkedTxn ] ;
    if (!taxon.isRoot) { getParentTaxaLinks(taxon.parentTaxon, 2); }
    ifFullHeirarchyReverseDisplayOrderAndAddChildren();
    return heirachy.reduce(formatHierarchy, '');

    function getParentTaxaLinks(pTaxon) {
        heirachy.push(getTxnLink(pTaxon));
        if (pTaxon.isRoot) { return; }
        getParentTaxaLinks(pTaxon.parentTaxon);
    }
    function ifFullHeirarchyReverseDisplayOrderAndAddChildren() {
        if (group !== 'full') { return; }
        heirachy.reverse();
        if (!taxon.childTaxa.length) { return; }
        let childTaxa = getChildTaxa(taxon.childTaxa.map(getChildTxnLinks));
        heirachy.push(childTaxa);
    }
    function getChildTxnLinks(taxon) {
        const links = [getTxnLink(taxon)];
        return links.concat(taxon.childTaxa.map(getChildTxnLinks));
    }
    function getTxnLink(taxon) {
        return getEntityLinkHtml('taxon', taxon.id, taxon.displayName);
    }
    function getChildTaxa(childLinks) {
        if (!childLinks.length) { return; }
        return childLinks.length === 1 ? childLinks[0] : childLinks;
    }
}
function formatHierarchy(namesHtml, val, i) {
    const lvlHtml = typeof val === 'string' ? (getIndentHtml(i) + val) :
        val.map(formatChildLinks.bind(null, i)).join('');
    return namesHtml + lvlHtml;

    function formatChildLinks(lvl, childVal) {                                  //console.log('childVal = %O, lvl', childVal, lvl)
        return typeof childVal === 'string' ? (getIndentHtml(lvl) + childVal) :
            childVal.map(subVal => formatChildLinks(lvl+1, subVal));
    }
    function getIndentHtml(lvl) {
        const indent = !lvl ? '' : '<br>' + '&emsp;'.repeat(lvl);
        return `${indent}${String.fromCharCode(8627)}&nbsp`;
    }
}
/* ---------------------------- SOURCE -------------------------------------- */
function getContributorFieldData (contribs) {
    if (!contribs || !Object.keys(contribs).length) { return null; }
    let type;
    const names = Object.keys(contribs).map(storeTypeAndReturnName).join("<br>");
    return { field: _u('ucfirst', [type])+'s', content: names, classes: 'max-cntnt' };

    function storeTypeAndReturnName (ord) {
        type = Object.keys(contribs[ord])[0];
        return contribs[ord][type];
    }
}
function getCitationTypeAndTitleFieldData (citation) {
    return { field: citation.citationType.displayName, content: citation.displayName };
}
function getCitationDisplay(source) {                               /*dbug-log*///console.log('  --getCitationDisplay source[%O]', source);
    const type = source.citation.citationType.displayName;
    const doi = getDoiLink(source.doi);
    const url = getCitationWebsite(source.linkUrl, type);
    return source.citation.fullText + doi + url;
}
function getDoiLink(doi) {
    return doi ? ` <a href="${doi}" target="_blank">DOI</a>` : '';
}
function getCitationWebsite(url, type) {
    return url ? ` <a href="${url}"" target="_blank">Read ${type}</a>` : '';
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
/* -------------------------- INTERACTIONS ---------------------------------- */
function getIntsGroupedBy(grouping, taxon) {
    const groupByMap = {
        type: getIntsGroupedByIntType, loc: getIntsGroupedByLocation,
        src: getIntsGroupedByPublication
    };
    const ints = getAllTaxonInts(taxon);
    return groupByMap[grouping](ints);
}
function getAllTaxonInts(taxon) {
    const childInts = taxon.childTaxa.map(getAllTaxonInts)
    return  taxon.subjectRoles.concat(taxon.objectRoles).concat(...childInts);
}
function sortAndFormatInts(ints, field) {
    const sorted = {};
    ints.forEach(sortInt);
    return formatSortedInts(sorted);

    function sortInt(int) {                                                     //console.log('int = %O', int);
        if (!sorted[int[field]]) { sorted[int[field]] = []; }
        sorted[int[field]].push(int.id);
    }
}
function formatSortedInts(sorted) {
    return Object.keys(sorted).sort(byIntCnt).map(formatTypeGroup).join('<br>');

    function formatTypeGroup(field) {
        const intCount = sorted[field].length;
        return `<span class="show-int-cnt">${intCount}</span><span>${field}</span>`;
    }
    function byIntCnt(a, b) {
        const x = sorted[a].length;
        const y = sorted[b].length;
        return x<y ? 1 : x>y ? -1 : 0;
    }
}
/* ------------ BY COUNTRY ------------------ */
function getIntsGroupedByLocation(ints) {
    const sorted = {};
    ints.forEach(sortIntByLoc);
    return formatIntsForLocs(sorted);

    function sortIntByLoc(int) {
        if (!sorted[int.region]) { sorted[int.region] = {}; }
        if (!sorted[int.region][int.country]) { sorted[int.region][int.country] = []; }
        sorted[int.region][int.country].push(int.id);
    }
}
function formatIntsForLocs(sorted) {                                            //console.log('sorted = %O', sorted);
    return Object.keys(sorted).sort().map(formatRegionGroup).join('<br><br>');

    function formatRegionGroup(region) {
        const regionHtml = `<i>${region}</i><br>`;
        const cntrys = Object.keys(sorted[region]).sort(byIntCnt).map(formatCountryInts).join('<br>');
        return regionHtml + cntrys;

        function formatCountryInts(country) {
            const intCntHtml = `&nbsp;&nbsp;${sorted[region][country].length}`;
            return `<span class="show-int-cnt">${intCntHtml}</span><span>${country}</span>`;
        }
        function byIntCnt(a, b) {
            const x = sorted[region][a].length;
            const y = sorted[region][b].length;
            return x<y ? 1 : x>y ? -1 : 0;
        }
    }
}
/* ------------ BY PUBLICATION ------------------ */
function getIntsGroupedByPublication(ints) {
    return sortAndFormatInts(ints, 'publication');
}
/* ------------ BY TYPE ------------------ */
function getIntsGroupedByIntType(ints) {
    return sortAndFormatInts(ints, 'interactionType');
}