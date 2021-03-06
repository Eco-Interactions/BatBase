/**
 * Handles tracking and reporting of the filter state.
 *
 * Exports:
 *     getActiveFilterVals
 *     getFilterState
 *     getFilterStateKey
 *     getRowDataFilters
 *     isFilterActive
 *     resetFilterState
 *     setFilterState
 *
 * TOC:
 *      SET
 *      GET
 *      FILTER STATUS TEXT
 *          FILTER SET
 *          PAGE FILTERS
 *          PANEL FILTERS
 *          TABLE FILTERS
 */
import { _u } from '~util';
import { _table, _ui } from '~db';

let fS;

initFilterStateObj();
/**
 * Filter state object structure:
 *
 * {str} timeout            Present when window is being resized.
 * {obj} filters            Filter-panel options only. (No table column filters)
 *     {obj} direct         Filters rowData only: type(k) value(v)
 *          {obj} date
 *              {str} time  Datetime
 *              {str} type  'cited' or 'updated' (in the database)
 *          {str} name      Name text
 *          {obj} combo     (objGroup, pubType)
 *              {obj} field value(v)
 *     {obj} rebuild        Filters rebuild the table: type (k) value (v) (NOTE: THERE CAN ONLY BE ONE.)
 *          {obj} combo     (Taxon ranks and subGroup, country||region)
 *              {obj} field text(k) and value(v) (Will set the combo and trigger the table rebuild)
 *
 *
 * Note: Date filter persists through reset due to how time consuming it is to select a date
 */
function initFilterStateObj(persisted = {}) {
    fS = { filters: { direct: persisted, rebuild: {} }};
}
/* =========================== SET ========================================== */
export function setFilterState(key, value, fGroup, fObj) {
    if (!fObj) { fObj = fS.filters[fGroup]; }
    if (value === false) { delete fObj[key];
    } else if (key === 'combo') { return setComboFilterState(...Object.keys(value));
    } else { fObj[key] = value; }

    function setComboFilterState(comboKey) {
        if (!fObj.combo || fGroup === 'rebuild') { fObj.combo = {}; }
        setFilterState(comboKey, value[comboKey], fGroup, fObj.combo);
    }
}
/** Because of how time consuming it is to choose a date, it persists through reset */
export function resetFilterState() {
    const persistedDate = getFiltersThatPersistThroughTableRebuild(fS.filters.direct);
    initFilterStateObj(persistedDate);
}
function getFiltersThatPersistThroughTableRebuild(dFilters) {
    const filters = {};
    ['date', 'list'].forEach(f => {
        if (!dFilters[f]) { return; }
        filters[f] = dFilters[f];
    });
    return filters;
}
/* =========================== GET ========================================== */
export function getFilterStateKey(key, fGroup = 'direct') {
    return key ? fS.filters[fGroup][key] : fS.filters[fGroup];
}
export function getFilterState() {
    return Object.assign(
        { table: getActiveTableFilterObj()},
        getPanelFilters(_u('snapshot', [fS.filters]))
    );
}
function getPanelFilters(filters) {
    filters.direct = getRowDataFilters(filters.direct)
    return filters;
}
export function isFilterActive() {
    const filters = getPageActiveFilters();
    removeListIfActive(filters);
    return !!filters.length;
}
function removeListIfActive(filters) {
    if (filters.indexOf('List') === -1) { return; }
    filters.splice(filters.indexOf('List'), 1);
}
export function getRowDataFilters(f) {
    const filters = f || _u('snapshot', [fS.filters.direct]);
    if (filters.date && !filters.date.active) { delete filters.date; }
    return filters;
}
export function getFilterStateForSentryErrorReport() {
    const st = getFilterState();
    Object.keys(st.table).forEach(col => {
        if (!st.table[col]) { delete st.table[col]; }});
    if (!Object.keys(st.table).length) { delete st.table; }
    if (!Object.keys(st.panel).length) { delete st.panel; }
    return st;
}
/* =================== FILTER STATUS TEXT =================================== */
/**
 * Returns the display values of all active filters in an array.
 * If a saved filter set is applied filters are read from the set. Otherwise, the
 * active filters in the panel and table are checked and returned.
 */
export function getActiveFilterVals(activeFilterSet = false) {
    return getPageActiveFilters();
}
/* ------------------- PAGE FILTERS ----------------------------------------- */
function getPageActiveFilters () {
    const panelFilters = getFilterDisplayNames(fS.filters.direct, fS.filters.rebuild);
    return getTblFilterNames().concat(panelFilters);
}
/* ----------------------- PANEL FILTERS ------------------------------------ */
/**
 * There are two groups of filters, ones that require the table to rebuild, and
 * the other can be applied to the row data directly.
 */
function getFilterDisplayNames(dFilters, rFilters) {                /*dbug-log*///console.log('getFilterDisplayNames. detail = %O, rebuild = %O', dFilters, rFilters);
    const names = [];
    getActivePanelFilterDisplayNames(dFilters, 'direct');
    getActivePanelFilterDisplayNames(rFilters, 'rebuild');
    return names.filter(t=>t);

    function getActivePanelFilterDisplayNames(gFilters, group) {
        Object.keys(gFilters).forEach(addActiveFilterType);

        function addActiveFilterType(type) {
            const edgeCase = {
                date: getDateFltrString,
                combo: addComboValues,
                list: () => 'List'
            };
            const name = getFilterName(Object.keys(edgeCase));
            if (Array.isArray(name)) { return names.push(...name); }
            names.push(name);

            function getFilterName(edgeCases) {
                return edgeCases.indexOf(type) === -1 ?
                    gFilters[type] : edgeCase[type](gFilters[type], group);
            }
        }
    }
}
/** Stores the most recent combobox selection. */
function addComboValues(comboObj, group) {                          /*dbug-log*///console.log('addComboValues [%s] %O', group, comboObj);
    const comboKeys = Object.keys(comboObj);
    if (group === 'direct') { return comboKeys; }
    return comboKeys.map(k => comboObj[k].text);
}
function getDateFltrString(date, group) {
    if (!date.active) { return null; }
    const type = date.type === 'cited' ? 'Published' : 'Updated';
    return 'Date '+ type;
}
/* ----------------------- TABLE FILTERS ------------------------------------ */
function getTblFilterNames() {
    return Object.keys(getActiveTableFilterObj());
}
/** Returns an obj with the ag-grid filter models. */
function getActiveTableFilterObj() {
    const tblApi = _table('tableState').get('api');
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