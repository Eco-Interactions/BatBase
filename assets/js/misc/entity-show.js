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
    const row2 = getNoteRow(data.note);
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
    if (!tags.length) { return '[ None ]'; }
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
/* ....................... SECOND ROW ....................................... */
function getNoteRow (note) {
    const text = note || '[ None ]';
    const noteData = getDataCell('Note:', text);
    return buildDataRow(noteData);
}
/* ---------------------- INTERACTION SOURCE -------------------------------- */ 
function getIntSourceHtml (data) {
    // body... 
}
/* -------------------- INTERACTION LOCATION -------------------------------- */ 
function getIntLocationHtml (data) {
    // body... 
}
/* =========================== SHOW TAXON =================================== */
function buildTxnShowPage (data) {

}



/* ====================== HTML BUILDERS ===================================== */
function getDataSect (title, rows) {
    const hdr = util.getElem('h3', { text: title });
    const sect = getDivWithContent('flex-col data-sect', hdr);
    $(sect).append(rows);
    return sect;
}
function buildDataRow (rowCells) {
    return getDivWithContent('flex-row sect-row', rowCells);
}
function buildRowColSect (colCells) {
    return getDivWithContent('flex-col', colCells);
}
function getDataCell (label, fieldHTML) {                                       //console.log('getDataCell [%s] = [%s]', label, fieldHTML)
    const lbl = util.getLabel(label);
    const div = util.getDiv({html: fieldHTML });
    return getDivWithContent('flex-row cell-data', [lbl, div]);
}
/* ------------ base ------------------- */
function getDivWithContent (classes, content) {
    const div = util.getElem('div', { class: classes });
    $(div).append(content);
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