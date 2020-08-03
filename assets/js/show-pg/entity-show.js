/**
 * Builds and displays entity-data for the entity's show-page.
 *
 * TOC:
 *     CORE SHOW PAGE BUILDER
 *     HTML BUILDERS
 */
import * as util from '../util/util-main.js';
import getEntityDisplayConfg from './entity-show-data.js';

initShowPage();

function initShowPage () {
    require('../../styles/pages/entity-show.styl');
    const entity = getEntity($('body').data('this-url'));
    buildEntityShowPage(entity, $('#entity-show').data('entity'));
    $('#entity-show').removeAttr('data-entity');
}
function getEntity (url) {
    return url.split('/').splice(-2, 1)[0];
}
/* ==================== CORE SHOW PAGE BUILDER ============================== */
function buildEntityShowPage (entity, data) {                       /*dbug-log*/console.log('   *//init[%s]ShowPage = %O', entity, data);
    const confg = getEntityDisplayConfg(entity, data, util);
    const sections = confg.map(buildDataSection);
    $('#entity-show').append(sections.filter(s => s));
}
function buildDataSection (confg) {
    return getDataSect(confg.section, confg.rows.map(getSectionRow).filter(r => r));
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
    return buildDataCell(data.field, data.content, data.classes);
}
/* ------------------------- HTML BUILDERS ---------------------------------- */
function getDataSect (title, rows) {                                /*dbug-log*///console.log('getDataSect [%s] = [%O]', title, rows);
    const hdr = util.getElem('h3', { text: title });
    const id = title.replace(/ /g,'') + '-data-sect';
    return getDivWithContent(id, 'data-sect', [hdr, ...rows]);
}
function buildDataRow (cnt, rowCells) {                             /*dbug-log*///console.log('   buildDataRow [%O]', rowCells);
    return getDivWithContent('sect-row'+cnt, 'sect-row', rowCells);
}
function getRowGroupSect (dir, colCells) {                          /*dbug-log*///console.log('       getRowGroupSect dir = %s, cells = %O', dir, colCells)
    const classes = `group-${dir} flex-${dir}`;
    return getDivWithContent('', classes, colCells);
}
function buildDataCell (label, fieldHTML, c = '') {                 /*dbug-log*///console.log('           buildDataCell [%s] = [%O]', label, fieldHTML);
    const lbl = util.getLabel(label+':');
    const data = getDivWithContent(label+'-data', '', fieldHTML);
    const classes = 'flex-row cell-data ' + c;
    return getDivWithContent(label+'-cell', classes, [lbl, data]);
}
/* ------------ base ------------------- */
function getDivWithContent (id, classes, content) {                 /*dbug-log*///console.log('               getDivWithContent [%s] = [%O]', classes, content);
    const div = util.getElem('div', { class: classes, id: id });
    const html = !!content ? content : '[ NONE ]';
    $(div).append(html);
    return div;
}