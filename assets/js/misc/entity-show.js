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
    const details = getIntDetailsHtml(data);
    const source = getIntSourceHtml(data.source);
    const location = getIntLocationHtml(data.location);
    $('#entity-show').append([details, source, location].filter(e => e));
}
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
    const typeData = getDataCell('Type:', type.displayName);
    const tagData = getDataCell('Tags:', getTagData(tags));
    return getRowGroupSect([typeData, tagData]);
}
function getTagData (tags) { 
    if (!tags.length) { return null; }
    return tags.map(t => t.displayName).join(', ');
}
/* -------------- SUBJECT AND OBJECT --------------------- */
function getTaxonDataCell (role, data) {
    const taxonAndParents = getTaxonHierarchyDataHtml(data);
    return getDataCell(role, taxonAndParents);
}
function getTaxonHierarchyDataHtml (data) {
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
    const title = getDataCell('Publication:', pubSrc.displayName);
    const typeAndPublisher = getTypeAndDoi(pubSrc);
    const details = getSrcDetailsCol(pubSrc);
    return getRowGroupSect([title, typeAndPublisher, details]);
}
function getTypeAndDoi (pubSrc) {
    const type = getDataCell('Publication Type:', getPubType(pubSrc));
    const publisher = getDataCell('Publisher:', getPublisherData(pubSrc.parent));
    return getRowGroupSect([type, publisher], 'row');
}
function getPublisherData (pSrc) {
    if (!pSrc) { return null; }
    const loc = [pSrc.publisher.city, pSrc.publisher.country].join(', ');
    return pSrc.displayName + (!!loc ? ('<br>' + loc) : '');
}
function getDescAndEditors (pubSrc) {
    const contributors = getContributorDataCell(pubSrc.contributors);
    const description = getDataCell('Description:', pubSrc.description);
    return getRowGroupSect([contributors, description].filter(e => e));
}
function getContributorDataCell (contribs) {  
    if (!contribs || !Object.keys(contribs).length) { return null; }
    let type;
    const names = Object.keys(contribs).map(storeTypeAndReturnName).join("<br>");
    return getDataCell(util.ucfirst(type)+'s:', names);
    
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
    const title = getDataCell(getCitType(citSrc)+':', citSrc.displayName);
    const details = getSrcDetailsCol(citSrc);
    return getRowGroupSect([title, details]);
}
function getMiscCitData (citSrc) {
    const volume = getDataCell('Volume:', citSrc.publicationVolume);
    const issue = getDataCell('Issue:', citSrc.publicationIssue);
    const pages = getDataCell('Pages:', citSrc.publicationPages);
    return getRowGroupSect([volume, issue, pages]);
}
function getCitType (citSrc) {
    return citSrc.citation.citationType.displayName;
}
/* ---------- SHARED ----------------- */
function getSrcDetailsCol (src) {
    const year = src.year ? getDataCell('Year:', src.year) : null;
    const doi = getDataCell('DOI:', src.doi);
    const link = getDataCell('Website:', null);
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



/* ====================== HTML BUILDERS ===================================== */
function getDataSect (title, rows) {
    const hdr = util.getElem('h3', { text: title });
    return getDivWithContent('flex-col data-sect', [hdr, ...rows]);
}
function buildDataRow (rowCells) {
    return getDivWithContent('flex-row sect-row', rowCells);
}
function getFullRow (label, content) {
    const rowData = getDataCell(label, content);
    return buildDataRow(rowData);
}
function getRowGroupSect (colCells, dir = 'col') {
    return getDivWithContent('flex-'+dir, colCells);
}
function getDataCell (label, fieldHTML) {                           
    const lbl = util.getLabel(label);
    const data = getDivWithContent('', fieldHTML);
    return getDivWithContent('flex-row cell-data', [lbl, data]);
}
/* ------------ base ------------------- */
function getDivWithContent (classes, content) {                     /*dbug-log*///console.log('getDivWithContent [%s] = [%O]', classes, content);
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