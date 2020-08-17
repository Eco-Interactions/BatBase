/**
 * Handles tracking and reporting of the filter state.
 *
 * TOC:
 *      SET
 *      GET
 *      FILTER STATUS TEXT
 */
import { _ui, accessTableState as tState } from '../db-main.js';

let fS;

initFilterStateObj();
/**
 * Filter state object structure:
 *
 * {str} timeout            Present when window is being resized.
 * {ary} fRowData           rowData when 'direct' filters are applied.
 * {obj} filters            Filter-panel options only. (No table column filters)
 *     {obj} direct         Filters rowData only: type(k) value(v)
 *          {obj} date
 *              {str} time  Datetime
 *              {str} type  'cited' or 'updated' (in the database)
 *          {str} name      Name text
 *          {obj} combo     (objRealm, pubType)
 *              {obj} field text(k) and value(v)
 *     {obj} rebuild        Filters rebuild the table: type (k) value (v)
 *          {obj} combo     (Taxon levels, country||region)
 *              {obj} field text(k) and value(v)
 *
 *
 * Note: Date filter persists through reset due to how time consuming it is to select a date
 */
function initFilterStateObj(persisted = {}) {
    fS = { filters: { direct: persisted, rebuild: {} }};
}
/* =========================== SET ========================================== */
export function setStateRowData(data) {
    fS.fRowData = data;
}
export function setFilterState(key, value, filterType) {
    if (value === false) { fS.filters[filterType][key]
    } else { fS.filters[filterType][key] = value; }
}
/** Because of how time consuming it is to choose a date, it persists through reset */
export function resetFilterState() {
    const persistedDate = fS.filters.direct.date ? { date: fS.filters.direct.date } : {};
    initFilterStateObj(persistedDate);
}
/* =========================== GET ========================================== */
export function getFilterStateKey(key, filterType = 'direct') {
    return key ? fS.filters[filterType][key] : fS.filters[filterType];
}
export function getFilterState() {
    return {
        panel: getPanelFilters(Object.assign({}, fS.filters)),
        table: getActiveTableFilterObj()
    };
}
function getPanelFilters(filters) {
    filters.direct = getRowDataFilters(filters.direct)
    return filters;
}
/** If table is filtered by an external filter, the rows are stored in fRowData. */
export function getCurRowData() {
    return fS.fRowData ? fS.fRowData : tState().get('rowData');
}
export function isFilterActive() {
    const tbl = getTblFilterNames().length > 0;
    const pnl = getPanelFilterVals().length > 0;
    return tbl || pnl;
}
export function getRowDataFilters(f) {
    const filters = f || Object.assign({}, fS.filters.direct);
    if (!fS.fRowData) { delete filters.date; }
    return filters;
}
/* =================== FILTER STATUS TEXT =================================== */
/**
 * Returns the display values of all active filters in an array.
 * If a saved filter set is applied filters are read from the set. Otherwise, the
 * active filters in the panel and table are checked and returned.
 */
export function getActiveFilterVals() {
    const set = _ui('isFilterSetActive');
    return set ? getSavedFilterStatus(set) : getPageActiveFilters();
}
/* ------------------- FILTER SET STATUS ------------------------------------ */
function getSavedFilterStatus(set) {                                            //console.log('getSavedFilterStatus. set = %O', set);
    const tblFltrs = Object.keys(set.table);
    const pnlFltrs = getSetPanelFilterVals(set.panel);
    return pnlFltrs.concat(tblFltrs);
}
function getSetPanelFilterVals(filters) {
    return Object.keys(filters).map(type => {
        return type === 'date' ?
            getDateFltrString(filters[type]) : Object.keys(filters[type])[0]
    }).filter(v => v);
}
/* ----------------- ACTIVE PAGE FILTERS ------------------------------------ */
function getPageActiveFilters (argument) {
    return getTblFilterNames().concat(getPanelFilterVals());
}
function getPanelFilterVals() {
    const map = { combo: addComboValue, name: addName, date: getDateFltrString };
    return ['direct', 'rebuild'].flatMap(getFocusFilterDisplayVals);

    function getFocusFilterDisplayVals(group) {
        if (!fS.filters[group]) { return []; }
        const vals = [];
        Object.keys(fS.filters[group]).forEach(addFilterVal);
        return vals.filter(f => f);

        function addFilterVal(type) {                                           //console.log('filter [%s] = %O', type, fS.filters[group][type]);
            vals.push(map[type](fS.filters[group][type]));
        }
    }
}
/** Stores the most recent combobox selection. */
function addComboValue(comboObj) {                                              //console.log('comboObj = %O', comboObj);
    const type = Object.keys(comboObj);
    return comboObj[type].text;
}
function addName(name) {
    return name;
}
function getDateFltrString(date) {
    if (!fS.fRowData) { return null; }
    const type = date.type === 'cited' ? 'Published' : 'Updated';
    return 'Date '+ type;
}
function getTblFilterNames() {
    return Object.keys(getActiveTableFilterObj());
}
/** Returns an obj with the ag-grid filter models. */
function getActiveTableFilterObj() {
    const tblApi = tState().get('api');
    if (!tblApi) { return {}; }
    const models = getColFilterModels(tblApi);
    return getActiveTblFilters(models);
}
function getColFilterModels (tblApi) {
    const filters = Object.keys(tblApi.filterManager.allFilters);
    return {
        'Subject Taxon': getColumnFilterApi('subject'),
        'Object Taxon': getColumnFilterApi('object'),
        'Interaction Type': getColumnFilterApi('interactionType'),
        'Tags': getColumnFilterApi('tags'),
        'Habitat': getColumnFilterApi('habitat'),
        'Country': getColumnFilterApi('country'),
        'Region': getColumnFilterApi('region'),
        'Location Desc.': getColumnFilterApi('location'),
        'Citation': getColumnFilterApi('citation'),
        'Note': getColumnFilterApi('note')
    };
    function getColumnFilterApi (colName) {
        return filters.indexOf(colName) === -1 ? null :
            tblApi.getFilterApi(colName).getModel()
    }
}
function getActiveTblFilters (models) {
    const filters = {};
    Object.keys(models).forEach(col => {
        if (!models[col]) { return; }
        filters[col] = models[col];
    });
    return filters;
}