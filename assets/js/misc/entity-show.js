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
    const source = getIntSourceHtml(data);
    const location = getIntLocationHtml(data);
    $('#entity-show').append([details, source, location].filter(e => e));
}
/* --------------------- INTERACTION DETAILS -------------------------------- */ 
function getIntDetailsHtml (data) {
    const sect = getDataSect('Details');
    const row1 = getDetailsFirstRow(data.subject, data.object, data.type, data.tags);
    const row2 = getNoteRow(data.note);
    $(sect).append([row1, row2].filter(r => r));
    return sect;
}
/* ........................ FIRST ROW ....................................... */
function getDetailsFirstRow (subject, object, type, tags) {
    const row = getDataRow();
    const subj = getTaxonDataCell('Subject', subject);
    const obj = getTaxonDataCell('Object', object);
    const typeAndTags = getTypeAndTagDataCell(type, tags);
    $(row).append([subj, obj]);
    return row;
}
/* -------------- SUBJECT AND OBJECT --------------------- */
function getTaxonDataCell (role, data) {
    const cell = getRowCell();
    const lbl = util.getLabel(role);
    const taxonAndParents = getTaxonHierarchyDataHtml(data);
    $(cell).append([lbl, taxonAndParents]);
    return cell;
}
function getTaxonHierarchyDataHtml (data) {
    const div = util.getDiv();
    const content = JSON.stringify(data).substr(0, 200);
    $(div).append(content);
    return div;
}
/* ------------ INTERACTION TYPE AND TAGS ---------------- */
function getTypeAndTagDataCell (type, tags) {
    // body... 
}
/* ....................... SECOND ROW ....................................... */
function getNoteRow (note, row) {
    if (!note) { return }
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
function getDataSect (title) {
    const sectCntnr = util.getElem('div', { class: 'flex-col data-sect' });
    const hdr = util.getElem('h3', { text: title });
    $(sectCntnr).append(hdr);
    return sectCntnr;
}
function getDataRow () {
    return util.getElem('div', { class: 'flex-row sect-row' });
}
function getRowCell () {
    return util.getElem('div', { class: 'flex-row cell-data' });
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