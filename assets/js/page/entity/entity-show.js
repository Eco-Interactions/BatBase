/**
 * Builds and displays entity-data for the entity's show-page.
 *
 * TOC:
 *     CORE SHOW PAGE BUILDER
 *         HTML BUILDERS
 *     CSV DOWNLOAD
 */
import * as util from '~util';
import getEntityDisplayConfg from './entity-show-data.js';

initShowPage();

function initShowPage () {
    require('styles/pages/entity-show.styl');
    const entity = getEntity($('body').data('this-url'));
    buildEntityShowPage(entity, $('#entity-show').data('entity'));
    buildCsvDownloadButton();
    $('#entity-show').removeAttr('data-entity');
}
function getEntity (url) {
    return url.split('/').splice(-2, 1)[0];
}
/* ==================== CORE SHOW PAGE BUILDER ============================== */
function buildEntityShowPage (entity, data) {                       /*dbug-log*/console.log('   *//init[%s]ShowPage = %O', entity, data);
    const confg = getEntityDisplayConfg(entity, data, util);
    const sections = confg.map(buildDataSection);
    $('#show-loading-msg').remove();
    $('#entity-show').append(sections.filter(s => s));
}
function buildDataSection (confg, i) {
    return getDataSect(++i, confg.section, confg.rows.map(getSectionRow).filter(r => r));
}
function getSectionRow (row, i) {
    return buildDataRow(++i, row.map(getRowCell).filter(c => c));
}
function getRowCell (cell) {
    if (cell.length == 1) { return getDataCell(cell[0]); }
    return getRowGroupSect(cell.pop(), cell.map(getDataCell).filter(c => c));
}
function getDataCell (data) {
    if (!data) { return false; }
    return buildDataCell(data.field, data.content, data.label, data.classes);
}
/* ------------------------- HTML BUILDERS ---------------------------------- */
function getDataSect (cnt, section, rows) {                         /*dbug-log*///console.log('getDataSect [%s] = [%O]', title, rows);
    const hdr = util.getElem('h3', { text: section.name });
    const id = 'data-sect-'+cnt;
    const classes = 'data-sect' + (section.classes ? ' ' + section.classes : '');
    return getDivWithContent(id, classes, [hdr, ...rows]);
}
function buildDataRow (cnt, rowCells) {                             /*dbug-log*///console.log('   buildDataRow [%O]', rowCells);
    return getDivWithContent('sect-row'+cnt, 'sect-row', rowCells);
}
function getRowGroupSect (dir, colCells) {                          /*dbug-log*///console.log('       getRowGroupSect dir = %s, cells = %O', dir, colCells)
    const classes = `group-${dir} flex-${dir}`;
    return getDivWithContent('', classes, colCells);
}
function buildDataCell (field, fieldHTML, label, c = '') {          /*dbug-log*///console.log('           buildDataCell [%s] = [%O]', label, fieldHTML);
    const lbl = getFieldLabel(field, label);
    const data = getDivWithContent(field+'-data', '', fieldHTML);
    const classes = 'flex-row cell-data ' + c;
    return getDivWithContent(field+'-cell', classes, [lbl, data].filter(e=>e));
}
/** Note: If label is set to FALSE in confg, no label is built. */
function getFieldLabel(field, label) {
    return label === false ? false : util.getElem('label', { text: field+':'});
}
/* ------------ base ------------------- */
function getDivWithContent (id, classes, content) {                 /*dbug-log*///console.log('               getDivWithContent [%s] = [%O]', classes, content);
    const div = util.getElem('div', { class: classes, id: id });
    const html = !!content ? content : '[ NONE ]';
    $(div).append(html);
    return div;
}
/* ======================== CSV DOWNLOAD ==================================== */
function buildCsvDownloadButton() {
    const attrs = {
        class: 'ag-fresh map-dsbl ico-bttn', id: 'entity-csv',
        name: 'csv',                         title: 'CSV Download Coming Soon',
        text: 'CSV'
    };
    $('#headln-txt').append($('<button/>', attrs));
}