/**
 * Handles filtering the data displayed in the table.
 *     
 * TOC:
 *     STATIC FILTERS
 *         TREE-TEXT
 *         DATE
 *     DYNAMIC FILTERS
 *     FILTER STATE
 *         SET
 *         GET
 *             FILTER STATUS TEXT
 *     INTERNAL USE ONLY
 *         EXTERNAL FACADE
 */
import { _ui, _u, accessTableState as tState } from '../db-main.js';
import * as fDate from './date-filter.js';
import * as fTree from './tree-filter.js';
import * as fLoc from './loc-filters.js';
import * as fSrc from './src-filters.js';
import * as fTxn from './txn-filters.js';
/**
 * Filter State Tracking
 * {str} timeout        Ppresent when window is being resized.
 * {ary} fRowData       rowData when the date-filter is applied.
 * {obj} active
 *      combo: obj with combo-label (k): obj with text and value (k) with their respective values
 *      name: name filter string
 *      time: obj with the datetime and filter type, time published or time added/updated 
 */
let fState = { active: {}};

/* ====================== STATIC FILTERS ==================================== */
/* ------------------ TREE-TEXT FILTER -------------------------------------- */
export function getTreeTextFilterElem(entity) {
    return fTree.getTreeTextFilterElem(entity);
}
export function filterTableByText(entity) {
    fTree.filterTableByText(entity);
}
export function getTreeFilterVal(entity) {
    return fTree.getTreeFilterVal(entity);
}
export function getRowsWithText(text) {
    return fTree.getTreeRowsWithText(getCurRowData(), text);
}
/* ------------------ DATE FILTER ------------------------------------------- */
export function initDateFilterUi() {
    fDate.initDateFilterUi();
}
export function reapplyDateFilterIfActive() {
    if (!$('#shw-chngd')[0].checked) { return; }
    fDate.reapplyPreviousDateFilter(fState.active.date, 'skip'); 
}
export function toggleDateFilter(state) {
    fDate.toggleDateFilter(state);
}
export function showTodaysUpdates(focus) {
    fDate.showTodaysUpdates(focus);
}
export function syncViewFiltersAndUi(focus) {
    fDate.syncViewFiltersAndUi(focus);
}
/* ===================== DYNAMIC FILTERS ==================================== */
export function loadLocFilters(tblState) {                      
    fLoc.loadLocFilters(tblState);
}
export function updateLocSearch() {                                 
    return fLoc.updateLocSearch(...arguments);
}
export function loadSrcFilters(realm) {                      
    fSrc.loadSrcFilters(realm);
}
export function updatePubSearch() {
    return fSrc.updatePubSearch(...arguments);
}
export function loadTxnFilters(tblState) {
    fTxn.loadTxnFilters(tblState);
}
export function updateTaxonSearch() {                                        
    return fTxn.updateTaxonSearch(...arguments);
}
/* ==================== FILTER STATE ======================================== */
/* --------------------------- SET ----------------------------------------- */
export function setCurrentRowData(data) {
    fState.fRowData = data;
}
export function setPanelFilterState(key, value) {
    if (value === false) { delete fState.active[key]; 
    } else { fState.active[key] = value; }
}
export function resetFilterState() {
    fState = { active: {}};
}
/* --------------------------- GET ----------------------------------------- */
export function getPanelFilterState(key) {
    return key ? fState.active[key] : fState.active;
}
export function getFilterState() {
    return {
        panel: fState.active,
        table: getTableFilterModels()
    };
}
/** If table is filtered by an external filter, the rows are stored in fRowData. */
export function getCurRowData() {                                                    
    return fState.fRowData ? fState.fRowData : tState().get('rowData');
} 
export function isFilterActive() {
    const tbl = Object.keys(getTableFilters([])).length > 0;
    const pnl = Object.keys(fState.active).length > 0;
    return tbl || pnl;
}
/* ___________________ FILTER STATUS TEXT ___________________________________ */
/**
 * Returns the display names of all active filters in an array. 
 * If a saved filter set is applied filters are read from the set. Otherwise, the
 * active filters in the panel and table are checked and returned.
 */
export function getActiveFilterText() {   
    const set = _ui('isFilterSetActive'); 
    return set ? getSavedFilterStatus(set) : getTableFilters(addExternalFilters());
}
function getSavedFilterStatus(set) {                                            //console.log('getSavedFilterStatus. set = %O', set);
    const tblFltrs = Object.keys(set.table);
    const pnlFltrs = getPanelFilters(set.panel);
    return pnlFltrs.concat(tblFltrs);
}
function getPanelFilters(filters) {
    return Object.keys(filters).map(type => {  
        return type === 'time' ? 
            getTimeFltrString(filters[type]) : Object.keys(filters[type])[0]
    });
}
function addExternalFilters() {  
    const map = { combo: addComboValue, name: addName, time: getTimeFltrString };
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
function getTimeFltrString(time) {
    if (!fState.fRowData) { return null; }
    const type = time.type === 'cited' ? 'Published' : 'Updated';
    return 'Time '+ type;
}
function getTableFilters(filters) {
    const filterModels = getTableFilterModels();                                //console.log('filterModels = %O', filterModels); 
    const columns = Object.keys(filterModels);        
    for (let i=0; i < columns.length; i++) {
        if (filterModels[columns[i]] !== null) { 
            filters.push(columns[i]); }
    }
    return filters;
}
/** Returns an obj with the ag-grid filter models. */
function getTableFilterModels() {  
    const tblApi = tState().get('api');
    if (!tblApi) { return {}; }
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
    function getColumnFilterApi(colName) {
        return filters.indexOf(colName) === -1 ? null : 
            tblApi.getFilterApi(colName).getModel()
    }
}
