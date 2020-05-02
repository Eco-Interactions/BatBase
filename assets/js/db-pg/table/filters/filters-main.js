/**
 * Handles custom filtering of the data displayed in the table and related UI.
 * 
 * Exports:                     Imported by:                (Added all post initial refactor)
 *     buildTreeSearchHtml              db-ui
 *     enableClearFiltersButton         db-ui
 *     getFilterState                   filter-panel
 *     clearFilters                     db-page, save-ints
 *     resetFilterParams                db-page, db-ui, save-ints
 *     selDateFilter                        
 *     showTodaysUpdates                db_forms
 *     syncViewFiltersAndUi             save-ints
 *     toggleDateFilter                 db_page
 *     updateFilterStatusMsg            db-page, init-tbl, filter-panel
 *     updateTaxonFilterViewMsg         db-page
 *     updateLocSearch                  util
 *     updatePubSearch                  util
 *     updateTaxonSearch                util
 */
import * as _u from '../../util/util.js';
import { accessTableState as tState, resetDataTable, rebuildLocTable, rebuildTxnTable, _util } from '../../db-main.js';
import * as db_ui from '../../pg-ui/ui-main.js';
import { resetStoredFiltersUi, savedFilterSetActive, reloadTableThenApplyFilters } from '../../pg-ui/panels/filter/filter-panel-main.js';
import { isSavedIntListLoaded } from '../../pg-ui/panels/int-list-panel.js';
/** 
 * Filter Params
 *     cal - Stores the flatpickr calendar instance. 
 *     rows - rowData at various stages of filtering
 *         allRows: all rowdata for the selected focus/view, no filters
 *         timeRows: after Date Filter
 *     pnlFltrs - Object stores panel filter values 
 *         combo: obj with combo-label (k): obj with text and value (k) with their respective values
 *         name: name filter string
 *         time: Obj with the datetime and filter type, time published or time added/updated 
 */
let fPs = {
    pnlFltrs: {}
};
/**
 * Updated with each new entry into this module with properties needed for that 
 * method chain.
 */
let tblState = {};

export function resetFilterParams() {
    const props = ['timeRows'];
    props.forEach(function(prop){ delete fPs[prop]; });
    fPs.pnlFltrs = {};
}
export function getFilterState() {
    return {
        panel: fPs.pnlFltrs,
        table: getTableFilterModels()
    };
}
export function reloadTableAndApplyFilters(filters) {
    reloadTableThenApplyFilters(filters);
}
export function enableClearFiltersButton() {
    const noFilters = !filtersActive();
    const opac = noFilters ? .5 : 1;
    const cursor = noFilters ? 'inherit' : 'pointer';
    $('button[name="reset-tbl"]')
        .attr('disabled', noFilters).css('cursor', cursor).fadeTo('slow', opac); 
}
function filtersActive() {
    const tbl = Object.keys(getTableFilters([])).length > 0;
    const pnl = Object.keys(fPs.pnlFltrs).length > 0;
    return tbl || pnl;
}
export function clearFilters() { 
    if ($('#filter-status').data('loading')) { return; } //DB initializing status displayed.
    resetFilterUi();
    resetStoredFiltersUi();
    resetFilterParams();
}
function resetFilterUi() {  
    resetFilterStatus();
    $('#focus-filters input').val('');
    if ($('#shw-chngd').prop('checked')) { clearDateFilter(); }
}
function resetFilterStatus() { 
    $('#filter-status').text('No Active Filters.');
    updateTaxonFilterViewMsg('');
}
/* ====================== UPDATE FILTER STATUS BAR ================================================================== */
/** Used in taxon views to indicate the filtering happening at the view level. */
export function updateTaxonFilterViewMsg(view) {
    $('#view-fltr').text(view);
}
/**
 * Either displays all filters currently applied, or applies the previous filter 
 * message persisted through table update into map view.
 */
export function updateFilterStatusMsg() {                                       //console.log("updateFilterStatusMsg called."); 
    tblState = tState().get(['api', 'intSet', 'flags']);
    if (!tblState.api || !tblState.flags.allDataAvailable) { return; }
    setFilterStatus(getActiveFilters());
    enableClearFiltersButton();
}
/**
 * Returns the display names of all active filters in an array. 
 * If a saved filter set is applied filters are read from the set. Otherwise, the
 * active filters in the panel and table are checked and returned.
 */
function getActiveFilters() {   
    const set = savedFilterSetActive(); 
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
        Object.keys(fPs.pnlFltrs).forEach(type => {                             //console.log('filter [%s] = %O', type, fPs.pnlFltrs[type]);
            filters.push(map[type](fPs.pnlFltrs[type]));
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
    if (!fPs.timeRows) { return null; }
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
function setFilterStatus(filters) {  
    if (filters.length > 0 || isSavedIntListLoaded()) { setStatus(getStatus(filters)); 
    } else { resetFilterUi() }
}
function getStatus(filters) {                                                   
    const list = isSavedIntListLoaded() ? '(LIST)' : ''; 
    const set = savedFilterSetActive() ? '(SET)' : '';
    const loaded = [list, set].filter(f=>f).join(' '); 
    const fltrs = filters.join(', ');
    return loaded !== '' & fltrs !== '' ? `${loaded} ${fltrs}.` :
        loaded ? loaded : fltrs+'.';
}
/** Returns an obj with the ag-grid filter models. */
function getTableFilterModels() {  
    if (!tblState.api) { return {}; }
    const filters = Object.keys(tblState.api.filterManager.allFilters);
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
            tblState.api.getFilterApi(colName).getModel()
    }
}
function setStatus(status) {                                                    //console.log("setFilterStatus. status = ", status)
    $('#filter-status').text(status);
}