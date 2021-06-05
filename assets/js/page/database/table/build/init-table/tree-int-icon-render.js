/**
 * Returns the column-confg object for the agGrid table.
 *
 * Export
 *     getInteractionRowIcons
 *     getShowIcon
 *
 * TOC
 *     TAXON-GROUP ICONS
 *         GROUP NAME
 *         GROUP STYLE
 *         INTERACTINO ARROW
 *     SHOW INTERACTION-PAGE ICON
 *     BUILD ICON
 */
import { _db, _u } from '~util';
import { _forms, _map } from '~db';
let tblState;

const icons = {};

export function getInteractionRowTreeIcons(data, tState) {          /*dbug-log*///console.log('--getInteractionRowIcons row[%O] tState[%O]', data, tState);
    tblState = tState;
    const treeIcons = [
        getTaxonGroupIcon('subject', data),
        getInteractionTypeArrow(data),
        getTaxonGroupIcon('object', data),
        getShowIcon('interaction', data.id)
    ]; //elems are added in reverse into the parent, agGrid's row-span
    const html = treeIcons.reverse().join(' ');                     /*dbug-log*///console.log('--icon html [%s]', html);
    return html;
}
/* ===================== TAXON-GROUP ICONS ================================== */
function getTaxonGroupIcon(role, data) {
    const title = getTxnGroupName(role, data);
    const group = getGroupIconName(title);                          /*dbug-log*///console.log('-- getTxnGroupIconSrc role[%s] group[%s]', role, group);
    const style = getGroupIconStyle(group);
    const src = getIconSrc(group);
    return buildIcon(src, style, title, 'txn-group-icon');
}
/* --------------------- GROUP NAME ----------------------------------------- */
function getGroupIconName(gName) {
    const map = {
        Arthropod: 'bug',
    };
    return map[gName] ? map[gName] : _u('lcfirst', [gName]);
}
function getTxnGroupName(role, data) {
    const prop = (role === 'object' ? 'o' : 'su') +'bjGroupId';
    const id = data[prop];
    return tblState.data.group[id].displayName;
}
/* -------------------- GROUP STYLE ----------------------------------------- */
function getGroupIconStyle(group) {
    const map = {
        bat: '2',
        plant: '1.5',
        reptile: '2'
    };
    const width = (map[group] ? map[group] : '1.5') + 'em';
    return `width:${width};`;
}
/* ----------------- INTERACTION ARROW -------------------------------------- */
function getInteractionTypeArrow(data) {
    const type = data.interactionType === 'Cohabitation' ? 'arrows-alt-h': 'arrow-right';
    return buildIcon(getIconSrc(type), '', data.interactionType, 'tree-arrow-icon');
}
/* ================= SHOW INTERACTION-PAGE ICON ============================= */
export function getShowIcon (entity, id, tState = tblState) {
    tblState = tState;
    const icon = getShowIconHtml(_u('ucfirst', [entity]));
    return `<a href="${getShowLink(entity, id)}">${icon}</a>`;
}
function getShowIconHtml () {
    const title = "Show Interaction Details";
    const style = 'opacity:'+ (tblState.flags.allDataAvailable ? 1 : 0);
    const src = getIconSrc('search');
    return buildIcon(src, style, title);
}
function getShowLink(entity, id) {
    const link =  $('body').data('base-url') + entity + '/' + id;   /*dbug-log*///console.log('--getShowLink [%s]', link);
    return link;
}
/* ====================== BUILD ICON ======================================== */
function getIconSrc(name) {                                         /*dbug-log*///console.log('-- getIconSrc [%s]', name);
    return icons[name] ? icons[name] : initIconSrc(name);
}
function initIconSrc(name) {
    const src = require(`images/icons/${name}.svg`).default;
    icons[name] = src;
    return src;
}
function buildIcon(src, style = '', title = '', clss = 'tree-show') {/*dbug-log*///console.log('-- builIcon src[%s] style[%s] title[%s]', src, style, title);
    const source = src ? `src="${src}"` : '';
    return`<img ${source} class="${clss}" title="${title}" alt="${title}" style="${style}">`;
}
