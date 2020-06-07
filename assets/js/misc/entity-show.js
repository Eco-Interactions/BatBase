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
    return buildRowColSect([typeData, tagData]);
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
    const row3 = getFullRow('Abstract:', data.abstract);
    return getDataSect('Source', [row1, row2, row3]);
}
/* ........................ FIRST ROW ....................................... */
// Publication: title, (Type: name, DOI:, website) Publisher: name (city/country)
function getSourceFirstRow (data) {
    const pubData = getPubDataCol(data.parent)
    const details = getPubDetailsCol(data.parent);
    const descAndEditors = getDescAndEditors(data.parent);
    return buildDataRow([pubData, details, descAndEditors]);
}
function getPubDataCol (pubSrc) {
    const title = getDataCell('Publication:', pubSrc.displayName);
    const type = getDataCell('Publication Type:', pubSrc.publication.publicationType.displayName);
    const publisher = getDataCell('Publisher:', getPublisherData(pubSrc.parent));
    return buildRowColSect([title, type, publisher]);
}
function getPublisherData (pSrc) {
    const loc = [pSrc.publisher.city, pSrc.publisher.country].join(', ');
    return pSrc.displayName + (!!loc ? (', ' + loc) : '');
}
function getPubDetailsCol (publication) {
    const yearCell = getDataCell('Year:', publication.year);
    const doiCell = getDataCell('DOI:', publication.doi);
    const link = getDataCell('Website:', null);
    return buildRowColSect([yearCell, doiCell, link]);
}
function getDescAndEditors (pubSrc) {
    const contributors = getPubContributors(pubSrc.contributors);
    const description = getDataCell('Description:', pubSrc.description);
    return buildRowColSect([contributors, description].filter(e => e));
}
function getPubContributors (contribs) {  
    if (!Object.keys(contribs).length) { return null; }
    let type;
    const names = Object.keys(contribs).map(storeTypeAndReturnName).join("<br>");
    return getDataCell(util.ucfirst(type)+'s:', names);
    
    function storeTypeAndReturnName (ord) {
        type = Object.keys(contribs[ord])[0]; 
        return contribs[ord][type];
    }
}
//Citation-type: title, (year:, pages) (Vol, Issue) 
function getSourceSecondRow (data) {
    // body... 
}
/* ........................ FIRST ROW ....................................... */
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
function buildRowColSect (colCells) {
    return getDivWithContent('flex-col', colCells);
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