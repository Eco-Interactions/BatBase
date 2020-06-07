/**
 * Handles individual entity show pages: Interaction and Taxon.
 * 
 * TOC:
 * 
 */                                                                        
import * as util from '../util/util-main.js';

initShowPage();
/* __________________________ INIT SHOW PAGE ________________________________ */
function initShowPage () {                                          
    require('../../styles/pages/entity-show.styl');
    buildShowPage($('body').data('this-url'), $('#entity-show').data('entity'))
    // setColumnSizes();
}
function buildShowPage (url, entityData) {
    const entity = getShowEntity(url);                              /*Perm-log*/console.log('   *//init[%s]ShowPage = %O', entity, entityData);
    const builder = getShowPageBuilder(entity);
    builder(entityData);
}
function getShowEntity (url) {
    return url.split('/').splice(-2, 1)[0];
}
function getShowPageBuilder (entity) {
    return {
        'interaction': buildIntShowPage, 'taxon': buildTxnShowPage
    }[entity];
}
/* ========================= SHOW INTERACTION =============================== */
function buildIntShowPage (data) {
    const confg = getEntityShowBuildConfig('interaction', data);
    const sections = confg.map(buildDataSection);
    $('#entity-show').append(sections.filter(e => e));
}
function buildDataSection (confg) {
    return getDataSect(confg.section, confg.rows.map(getSectionRow));
}
function getSectionRow (row) {
    return buildDataRow(row.map(getRowCell));
}
function getRowCell (cell) {
    if (cell.length == 1) { return getDataCell(cell[0]); }
    return getRowGroupSect(cell.pop(), cell.map(getDataCell));
}
function getDataCell (data) {
    return buildDataCell(data.field, data.content);
}

// function buildIntShowPage (data) {
//     const details = getIntDetailsHtml(data);
//     const source = getIntSourceHtml(data.source);
//     const location = getIntLocationHtml(data.location);
//     $('#entity-show').append([details, source, location].filter(e => e));
// }
/* """"""""""""""""""""" INTERACTION DETAILS """""""""""""""""""""""""""""""" */ 
function getIntDetailsHtml (data) {
    const row1 = getDetailsFirstRow(
        data.subject, data.object, data.interactionType, data.tags);
    const row2 = getFullRow ('Note:', data.note);
    return getDataSect('Interaction Details', [row1, row2]);
}
/* ........................ FIRST ROW ....................................... */
function getDetailsFirstRow (subject, object, type, tags) {
    const typeAndTags = getTypeAndTagDataCol(type, tags);
    const subj = getTaxonDataCell('Subject:', subject);
    const obj = getTaxonDataCell('Object:', object);
    return buildDataRow([typeAndTags, subj, obj]);
}
/* ------------ INTERACTION TYPE AND TAGS ---------------- */
function getTypeAndTagDataCol (type, tags) {
    const typeData = buildDataCell('Type:', type.displayName);
    const tagData = buildDataCell('Tags:', getTagData(tags));
    return getRowGroupSect([typeData, tagData]);
}
function getTagData (tags) { 
    if (!tags.length) { return null; }
    return tags.map(t => t.displayName).join(', ');
}
/* -------------- SUBJECT AND OBJECT --------------------- */
function getTaxonDataCell (role, data) {
    const taxonAndParents = getTaxonHierarchyDataHtml(data);
    return buildDataCell(role, taxonAndParents);
}
function getTaxonHierarchyDataHtml (data) {  console.log('data = %O', data)
    return JSON.stringify(data).substr(0, 200);
}
/* """""""""""""""""""""" INTERACTION SOURCE """""""""""""""""""""""""""""""" */ 
function getIntSourceHtml (data) {                                              console.log('getIntSourceHtml data = %O', data);
    const row1 = getSourceFirstRow(data);
    const row2 = getSourceSecondRow(data);
    const row3 = getFullRow('Citation:', data.citation.fullText);
    const row4 = getFullRow('Abstract:', data.abstract);
    return getDataSect('Source', [row1, row2, row3, row4]);t
}
/* ........................ FIRST ROW ....................................... */
// Publication: title, (Type: name, DOI:, website) Publisher: name (city/country)
function getSourceFirstRow (data) {
    const pubData = getPubDataRow(data.parent)
    const descAndEditors = getDescAndEditors(data.parent);
    return buildDataRow([pubData, descAndEditors]);
}
function getPubType (pubSrc) {
    return pubSrc.publication.publicationType.displayName;
}
function getPubDataCol (pubSrc) {
    const title = buildDataCell('Publication:', pubSrc.displayName);
    const typeAndPublisher = getTypeAndDoi(pubSrc);
    const details = getSrcDetailsCol(pubSrc);
    return getRowGroupSect([title, typeAndPublisher, details]);
}
function getTypeAndDoi (pubSrc) {
    const type = buildDataCell('Publication Type:', getPubType(pubSrc));
    const publisher = buildDataCell('Publisher:', getPublisherData(pubSrc.parent));
    return getRowGroupSect([type, publisher], 'row');
}
function getPublisherData (pSrc) {
    if (!pSrc) { return null; }
    const loc = [pSrc.publisher.city, pSrc.publisher.country].join(', ');
    return pSrc.displayName + (!!loc ? ('<br>' + loc) : '');
}
function getDescAndEditors (pubSrc) {
    const contributors = getContributorDataCell(pubSrc.contributors);
    const description = buildDataCell('Description:', pubSrc.description);
    return getRowGroupSect([contributors, description].filter(e => e));
}
function getContributorDataCell (contribs) {  
    if (!contribs || !Object.keys(contribs).length) { return null; }
    let type;
    const names = Object.keys(contribs).map(storeTypeAndReturnName).join("<br>");
    return buildDataCell(util.ucfirst(type)+'s:', names);
    
    function storeTypeAndReturnName (ord) {
        type = Object.keys(contribs[ord])[0]; 
        return contribs[ord][type];
    }
}
/* ....................... SECOND ROW ....................................... */
//Citation-type: title, (year:, pages) (Vol, Issue) 
function getSourceSecondRow (citSrc) {
    const pubData = getCitDataCol(citSrc)
    const misc = getMiscCitData(citSrc);
    const contributors = getContributorDataCell(citSrc.contributors);
    return buildDataRow([pubData, misc, contributors]);
}
function getCitDataCol (citSrc) {
    const title = buildDataCell(getCitType(citSrc)+':', citSrc.displayName);
    const details = getSrcDetailsCol(citSrc);
    return getRowGroupSect([title, details]);
}
function getMiscCitData (citSrc) {
    const volume = buildDataCell('Volume:', citSrc.publicationVolume);
    const issue = buildDataCell('Issue:', citSrc.publicationIssue);
    const pages = buildDataCell('Pages:', citSrc.publicationPages);
    return getRowGroupSect([volume, issue, pages]);
}
function getCitType (citSrc) {
    return citSrc.citation.citationType.displayName;
}
/* ---------- SHARED ----------------- */
function getSrcDetailsCol (src) {
    const year = src.year ? buildDataCell('Year:', src.year) : null;
    const doi = buildDataCell('DOI:', src.doi);
    const link = buildDataCell('Website:', null);
    return getRowGroupSect([year, doi, link], 'row');
}
/* """""""""""""""""""" INTERACTION LOCATION """""""""""""""""""""""""""""""" */ 
function getIntLocationHtml (data) {
    // body... 
}
/* ........................ FIRST ROW ....................................... */

/* =========================== SHOW TAXON =================================== */
function buildTxnShowPage (data) {

}
/* =================== ENTITY-SHOW CONFIG =================================== */
/* [ Data-section, Row Array -> [ rowCellsArray -> [ single, [multi, cell, dir]  ] } */
function getEntityShowBuildConfig (entity, data) {
    const confg = {
        interaction: [
            {
                section:  'Interaction Details', 
                rows: [
                   [  //row 1
                        [ //cell 1
                            { field: 'Type', content: data.interactionType.displayName },
                            { field: 'Tag', content: getTagData(data.tags) },
                            'col'
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
                rows: []
            }
        ]
    };
    return confg[entity].map(c => c); //detach obj
}

/* ====================== HTML BUILDERS ===================================== */
function getDataSect (title, rows) {                                /*dbug-log*/console.log('getDataSect [%s] = [%O]', title, rows);
    const hdr = util.getElem('h3', { text: title });
    return getDivWithContent('flex-col data-sect', [hdr, ...rows]);
}
function buildDataRow (rowCells) {                                  /*dbug-log*/console.log('   buildDataRow [%O]', rowCells);
    return getDivWithContent('flex-row sect-row', rowCells);
}
// function getFullRow (label, content) {
//     const rowData = buildDataCell(label, content);
//     return buildDataRow(rowData);
// }
function getRowGroupSect (dir, colCells) {                          /*dbug-log*/console.log('       getRowGroupSect dir = %s, cells = %O', dir, colCells)
    return getDivWithContent('flex-'+dir, colCells);
}
function buildDataCell (label, fieldHTML) {                         /*dbug-log*/console.log('           buildDataCell [%s] = [%O]', label, fieldHTML); 
    const lbl = util.getLabel(label);
    const data = getDivWithContent('', fieldHTML);
    return getDivWithContent('flex-row cell-data', [lbl, data]);
}
/* ------------ base ------------------- */
function getDivWithContent (classes, content) {                     /*dbug-log*/console.log('               getDivWithContent [%s] = [%O]', classes, content);
    const div = util.getElem('div', { class: classes });
    const html = !!content ? content : '[ NONE ]';
    $(div).append(html);
    return div;
}

/* ======================== SHOW PAGE STYLES ================================ */
/* ------------------------- SET ROW COLUMN WIDTHS -------------------------- */
/**
 * Sets column flex-grow based on the percentage of the field value character count
 * of the totsl characters for all field values in this row. CSS min-width set at 122px. 
 */
function setColumnSizes () {
    $('.sect-row').each(sizeRowColumnData);
}
function sizeRowColumnData (i, el) {  
    const contentSizes = [];
    let total = 0;
    $(el.children).each(getDataCharCnt);
    $(el.children).each(setColWidth);

    function getDataCharCnt (i, field) {
        contentSizes[i] = field.children[1].innerText.length;
        total += contentSizes[i];
    }
    function setColWidth (i, field) {
        const colW = Math.round(contentSizes[i]*100/total);
        $(field.children[1]).css('flex-grow', colW);
    }
}