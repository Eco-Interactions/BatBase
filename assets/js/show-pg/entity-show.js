/**
 * Builds and displays entity-data for the entity's show-page.
 * 
 * TOC:
 *     CORE SHOW PAGE BUILDER
 *     HTML BUILDERS
 */                                                                        
import * as util from '../util/util-main.js';
import getEntityShowData from './entity-show-data.js';

initShowPage();

function initShowPage () {                                          
    require('../../styles/pages/entity-show.styl');
    const entity = getEntity($('body').data('this-url'));
    buildEntityShowPage(entity, $('#entity-show').data('entity'));
}
function getEntity (url) {
    return url.split('/').splice(-2, 1)[0];
}
/* ==================== CORE SHOW PAGE BUILDER ============================== */
function buildEntityShowPage (entity, data) {                       /*Perm-log*/console.log('   *//init[%s]ShowPage = %O', entity, entityData);
    const confg = getEntityShowBuildConfig(entity, data);
    const sections = confg.map(buildDataSection);
    $('#entity-show').append(sections.filter(s => s));
}
function buildDataSection (confg) {
    return getDataSect(confg.section, confg.rows.map(getSectionRow).filter(r => r));
}
function getSectionRow (row) {
    return buildDataRow(row.map(getRowCell).filter(c => c));
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
function getDataSect (title, rows) {                                /*dbug-log*/console.log('getDataSect [%s] = [%O]', title, rows);
    const hdr = util.getElem('h3', { text: title });
    return getDivWithContent('flex-col data-sect', [hdr, ...rows]);
}
function buildDataRow (rowCells) {                                  /*dbug-log*/console.log('   buildDataRow [%O]', rowCells);
    return getDivWithContent('flex-row sect-row', rowCells);
}
function getRowGroupSect (dir, colCells) {                          /*dbug-log*/console.log('       getRowGroupSect dir = %s, cells = %O', dir, colCells)
    const classes = `group-${dir} flex-${dir}`;
    return getDivWithContent(classes, colCells);
}
function buildDataCell (label, fieldHTML, classes = '') {           /*dbug-log*/console.log('           buildDataCell [%s] = [%O]', label, fieldHTML); 
    const lbl = util.getLabel(label+':');
    const data = getDivWithContent('', fieldHTML);
    return getDivWithContent('flex-row cell-data '+classes, [lbl, data]);
}
/* ------------ base ------------------- */
function getDivWithContent (classes, content) {                     /*dbug-log*/console.log('               getDivWithContent [%s] = [%O]', classes, content);
    const div = util.getElem('div', { class: classes });
    const html = !!content ? content : '[ NONE ]';
    $(div).append(html);
    return div;
}