/**
 * Handles tracking and reporting of the filter state.
 * 
 * TOC:
 *      SET
 *      GET
 *      FILTER STATUS TEXT
 */
/**
 * {str} timeout        Ppresent when window is being resized.
 * {ary} fRowData       rowData when the date-filter is applied.
 * {obj} active
 *      combo: obj with combo-label(k): obj with text and value(v) with their respective values
 *      name: name filter string
 *      date: obj with the datetime(v) and filter type(k), date published or added/updated 
 */
import { _ui, accessTableState as tState } from '../db-main.js';
let fState = { active: {}};
/* =========================== SET ========================================== */
export function setCurrentRowData(data) {
    fState.fRowData = data;
}
export function setPanelFilterState(key, value) {
    if (value === false) { delete fState.active[key]; 
    } else { fState.active[key] = value; }
}
/** Because of how time consuming it is to choose a date, it persists through reset */
export function resetFilterState() {
    const state = fState.active.date ? { date: fState.active.date } : {}; 
    fState = { active: state };
}
/* =========================== GET ========================================== */
export function getFilterStateKey(key) {
    return key ? fState.active[key] : fState.active;
}
export function getFilterState() {
    return {
        panel: getPanelFilters(Object.assign({}, fState.active)),
        table: getActiveTableFilterObj()
    };
}
function getPanelFilters(filters) {
    if (!fState.fRowData) { delete filters.date; }
    return filters;
}
/** If table is filtered by an external filter, the rows are stored in fRowData. */
export function getCurRowData() {                                                    
    return fState.fRowData ? fState.fRowData : tState().get('rowData');
} 
export function isFilterActive() {
    const tbl = getTblFilterNames().length > 0;
    const pnl = getPanelFilterVals().length > 0;
    return tbl || pnl;
}
/* =================== FILTER STATUS TEXT =================================== */
/**
 * Returns the display names of all active filters in an array. 
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
    return getFocusFilterDisplayVals();

    function getFocusFilterDisplayVals() {
        const filters = [];
        Object.keys(fState.active).forEach(type => {                             //console.log('filter [%s] = %O', type, fPs.pnlFltrs[type]);
            filters.push(map[type](fState.active[type]));
        });  
        return filters.filter(f => f); 
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
    if (!fState.fRowData) { return null; }
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