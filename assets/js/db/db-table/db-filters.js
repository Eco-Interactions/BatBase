/**
 * Handles custom filtering of the data displayed in the table and related UI.
 * 
 * Exports:                     Imported by:                (Added all post initial refactor)
 *     buildTreeSearchHtml              db-ui
 *     enableClearFiltersButton         db-ui
 *     getFilterState                   save-fltrs
 *     resetTblFilters                  db-page, save-ints
 *     resetTableStateParams            db-page, db-ui, save-ints
 *     selTimeFilter                    save-fltrs
 *     showTodaysUpdates                db_forms
 *     syncViewFiltersAndUi             save-ints
 *     toggleTimeFilter                 db_page
 *     updateFilterStatusMsg            db-page, init-tbl, save-fltrs
 *     updateLocSearch                  util
 *     updatePubSearch                  util
 *     updateTaxonSearch                util
 */
import * as _u from '../util.js';
import { accessTableState as tState, selectSearchFocus, rebuildLocTable, rebuildTxnTable } from '../db-page.js';
import * as db_ui from '../db-ui.js';
import { resetStoredFiltersUi, savedFilterSetActive } from './save-fltrs.js';
import { savedIntListLoaded } from './save-ints.js';

/** 
 * Filter Params
 *     cal - Stores the flatpickr calendar instance. 
 *     rows - rowData at various stages of filtering
 *         allRows: all rowdata for the selected focus/view, no filters
 *         comboRows: after combo filters
 *         textRows: after text filter
 *         timeRows: after time filter
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

export function resetTableStateParams() {
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
export function enableClearFiltersButton() {
    if (!filtersActive()) { 
        $('button[name="reset-tbl"]')
            .attr('disabled', true).css({'opacity': .5, cursor: 'inherit'}); 
    } else {  
        $('button[name="reset-tbl"]')
            .attr('disabled', false).css({'opacity': 1, 'cursor': 'pointer'}); 
    }
}
function filtersActive() {
    const tbl = Object.keys(getTableFilters([])).length > 0;
    const pnl = Object.keys(fPs.pnlFltrs).length > 0;
    return tbl || pnl;
}
/* ====================== UPDATE FILTER STATUS BAR ================================================================== */
export function updateFilterViewMsg() {                                                     
    const view = _u.getDataFromStorage('curView'); 
    const map = {2: 'Bats', 3: 'Plants', 4: 'Bugs'};
    const msg = map[view] ? `[${map[view]}]` : '';
    $('#view-fltr').text(msg);
}
/**
 * Either displays all filters currently applied, or applies the previous filter 
 * message persisted through table update into map view.
 */
export function updateFilterStatusMsg() {                                       //console.log("updateFilterStatusMsg called."); 
    tblState = tState().get(null, ['api', 'intSet']);
    if (!tblState.api) { return; }
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
    if (filters.length > 0 || savedIntListLoaded()) { setStatus(getStatus(filters)); 
    } else { resetFilterUi() }
}
function getStatus(filters) {                                                   
    const list = savedIntListLoaded() ? '(LIST)' : ''; 
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
export function resetTblFilters() {
    resetFilterUi();
    fPs.pnlFltrs = {};
}
function resetFilterUi() {
    $('#filter-status').text('No Active Filters.');
    $('#focus-filters input').val('');
    if ($('#shw-chngd').prop('checked')) { 
        $('#shw-chngd').prop('checked', false).change(); //resets updatedAt table filter
    }
}
/* ====================== TIME-UPDATED FILTER ======================================================================= */
export function selTimeFilter(val) {                                            //console.log('selTimeFilter. = ', val);
    if (!fPs.pnlFltrs.time) { fPs.pnlFltrs.time = {}; }
    fPs.pnlFltrs.time.type = val;
    if (ifFilteringOnTime()) { filterTableByTime(); }
}
/**
 * When the interaction form is exited, the passed focus is selected and the 
 * table is refreshed with the 'interactions updates since' filter set to 'today'.
 */
export function showTodaysUpdates(focus) {                                      //console.log("showingUpdated from today")
    if (focus) { _u.setSelVal('Focus', focus); 
    } else { selectSearchFocus(); }
    window.setTimeout(showUpdatesAfterTableLoad, 200);
}
function showUpdatesAfterTableLoad() {
    _u.setSelVal('Time Filter', 'updated');
    toggleTimeFilter(true, 'today');
}
/** The time-updated filter is enabled when the filter option is checked. */
export function toggleTimeFilter(state, time) {                                 //console.log('toggleTimeFilter. state = %s, time? ', state, time);
    fPs.cal = fPs.cal || initCal(); 
    const filtering = ifFilteringOnTime(state);
    updateTimeFilterMemory(time);
    updateRelatedUi(filtering);
    if (filtering) { filterTableByTime(time);
    } else { resetTimeFilter(); } 
} 
/** 
 * Instantiates the flatpickr calendar and returns the flatpickr instance.
 * Add time updated filter
 */
function initCal() {
    const confirmDatePlugin = require('../../libs/confirmDate.js'); 
    const calOpts = {
        altInput: true, maxDate: "today", enableTime: true,   
        plugins: [confirmDatePlugin({showAlways: true})],
        onReady: function() { this.amPM.textContent = "AM"; },
        onClose: filterByTime
    }; 
    return $('#time-cal').flatpickr(calOpts);
}
function ifFilteringOnTime(state) {
    return state === 'disable' ? false : state === true ? true : $('#shw-chngd')[0].checked;
}
function updateTimeFilterMemory(time) {
    if (!fPs.pnlFltrs.time) { fPs.pnlFltrs.time = {}; }
    tblState = tState().get();
    fPs.pnlFltrs.time.type =  _u.getSelVal('Time Filter');
    if (time) { fPs.pnlFltrs.time.date = time; } 
}
function updateRelatedUi(filtering) {
    const opac = filtering ? 1 : .6;
    $('#time-cal, .flatpickr-input').attr({'disabled': !filtering});  
    $('.time-fltr-sel, #time-cal, .flatpickr-input, #shw-chngd-ints label, #shw-chngd-ints div').css({'opacity': opac});
    $('#shw-chngd')[0].checked = filtering;
    db_ui.resetToggleTreeBttn(false);
    if (filtering) {
        $('#time-fltr')[0].selectize.enable();
    } else { $('#time-fltr')[0].selectize.disable(); }
}
/** 
 * Disables the calendar, if shown, and resets table with active filters reapplied.
 */
function resetTimeFilter() {                                                    //console.log('tState = %O', tState);
    fPs.timeRows = null;
    if (tblState.api && tblState.rowData) { 
        tblState.api.setRowData(tblState.rowData);
        syncFiltersAndUi();
    }
}
function filterTableByTime(time) {                                              //console.log('filterTableByTime. time? = [%s] fPs = %O', time, fPs.pnlFltrs);
    if (time == 'today') { 
        filterToChangesToday(); 
    } else if (time) { 
        filterToSpecifiedTime(time);
    } else if (fPs.pnlFltrs.time.date) {  
        reapplyPreviousTimeFilter(fPs.pnlFltrs.time);
    } else {
        fPs.cal.open();
        fPs.cal.setDate(new Date().today(), false, 'Y-m-d');  
    }
}   
function reapplyPreviousTimeFilter(timeObj, skipSync) { 
    fPs.cal.setDate(timeObj.date);  
    filterByTime(null, timeObj.date, null, skipSync);
}
function filterToChangesToday() {  
    const today = new Date().today();
    $('#time-fltr')[0].selectize.addItem('updated');
    fPs.pnlFltrs.time.type = 'updated';
    fPs.cal.setDate(today, false, 'Y-m-d');  
    filterByTime(null, today);
}
function filterToSpecifiedTime(time) {
    fPs.cal.setDate(time, false, 'F d, Y h:i K');  
    filterByTime(null, time);
}
/**
 * Filters all interactions in the table leaving only the records with updates
 * since the datetime specified by the user.
 * Note: Params 1-3 sent by calendar
 */
function filterByTime(dates, dateStr, instance, skipSync) {
    const time = updateMemoryAndReturnTime(dateStr);
    filterInteractionsByTime(time, fPs.pnlFltrs.time.type);
    updateUiAfterTimeFilterChange(dateStr, skipSync);
}
function updateMemoryAndReturnTime(dateStr) {
    tblState = tState().get();
    const fltrSince = dateStr || fPs.pnlFltrs.time.date;
    fPs.pnlFltrs.time.date = fltrSince;
    return new Date(fltrSince).getTime(); 
}
function filterInteractionsByTime(time, type) {
    const rows = getRowsAfterTime(time, type);                                  //console.log("rows = %O", rows);
    tblState.api.setRowData(rows);
    fPs.timeRows = rows;
}
function getRowsAfterTime(filterTime, type) {
    const rowData = _u.snapshot(tblState.rowData);
    return rowData.filter(getIntsForTimeFilter);        
    
    function getIntsForTimeFilter(row) { 
        if (row.interactionType) { return checkIntRowForUpdates(row); }
        row.children = row.children ? 
            row.children.filter(getIntsForTimeFilter) : [];
        return row.children.length > 0;

        function checkIntRowForUpdates(row) { 
            const date = type === 'cited' ? row.year + '-01-01' : row.updatedAt;
            const rowTime = new Date(date).getTime();                           //console.log("row [%O] rowTime = %O, rowTime > since = [%s]", row, rowTime, rowTime > filterTime);
            return rowTime > filterTime;
        }
    } /* End addAllRowsWithUpdates */
} /* End getRowsAfterTime */
function updateUiAfterTimeFilterChange(time, skipSync) {
    $('.flatpickr-input').val(time);
    if (skipSync) { console.log('skipping filter sync');return; }
    syncFiltersAndUi(time);
}
/**
 * When filtering by time updated, some filters will need to be reapplied.
 * (Taxa and loation filter rowdata directly, and so do not need to be reapplied.
 * Source, both auth and pub views, must be reapplied.)
 * The table filter's status message is updated. The time-updated radios are synced.
 */
function syncFiltersAndUi() {                                                   //console.log('tblState = %O', tblState);
    db_ui.resetToggleTreeBttn(false);
    syncViewFiltersAndUi(tblState.curFocus);
    updateFilterStatusMsg();  
}
export function syncViewFiltersAndUi(focus) {
    tblState = tState().get();
    const map = {
        locs: db_ui.loadLocFilterPanelElems,
        srcs: applySrcFltrs,
        taxa: updateTaxonComboboxes
    }; 
    map[focus](tblState);
}
/** Reapplys active external filters, author name or publication type. */
function applySrcFltrs(tblState) {
    const resets = { 'auths': reapplyTreeTextFltr, 'pubs': reapplyPubFltr, 
        'publ': reapplyTreeTextFltr };
    resets[tblState.curView]();
}
function reapplyTreeTextFltr() {                                            
    const entity = getTableEntityName();                                        //console.log("reapplying [%s] text filter", entity);
    if (getTreeFilterTextVal(entity) === "") { return; }
    filterTableByText(entity);
}
function getTableEntityName() {
    const names = { 'taxa': 'Taxon', 'locs': 'Location', 'auths': 'Author',
        'publ': 'Publisher', 'pubs': 'Publication' };
    const ent = tblState.curFocus === "srcs" ? tblState.curView : tblState.curFocus;
    return names[ent];
}
function reapplyPubFltr() {                                                     //console.log("reapplying pub filter");
    if (_u.getSelVal('Publication Type') === "all") { return; }
    updatePubSearch();
}
/**
 * When the time-updated filter is updated, the taxa-by-level property has to be
 * updated based on the rows displayed in the grid so that the combobox options
 * show only taxa in the filtered tree.
 */
function updateTaxonComboboxes(tblState) {
    tState().set({'taxaByLvl': seperateTaxonTreeByLvl(getAllCurRows(tblState))}); //console.log("taxaByLvl = %O", taxaByLvl)
    db_ui.loadTaxonComboboxes(tblState);
}
/** Returns an object with taxon records by level and keyed with display names. */
function seperateTaxonTreeByLvl(rowData) {                                      //console.log('rowData = %O', rowData);
    const separated = {};
    rowData.forEach(data => separate(data));
    return sortObjByLevelRank(separated);

    function separate(row) {                                                    //console.log('taxon = %O', taxon)
        if (!separated[row.taxonLvl]) { separated[row.taxonLvl] = {}; }
        separated[row.taxonLvl][row.displayName] = row.id;
        
        if (row.children) { 
            row.children.forEach(child => separate(child)); 
        }
    }
    function sortObjByLevelRank(taxonObj) {
        const levels = Object.keys(_u.getDataFromStorage('levelNames'));        //console.log("levels = %O", levels)
        const obj = {};
        levels.forEach(lvl => { 
            if (lvl in taxonObj) { obj[lvl] = taxonObj[lvl]; }
        });
        return obj;
    }
} /* End seperateTaxonTreeByLvl */
/*================== Search Panel Filter Functions ===================================================================*/
/*------------------------- Tree Name Filter -------------------------------- */
/** Returns a text input with submit button that will filter tree by text string. */
export function buildTreeSearchHtml(entity) {
    const func = onTextFilterChange.bind(null, entity);  
    const lbl = _u.buildElem('label', { class: 'sel-cntnr flex-row' });
    const span = _u.buildElem('span', { text: 'Name:' });
    const input = _u.buildElem('input', { 
        name: 'sel'+entity, type: 'text', placeholder: entity+' Name (Press Enter to Filter)'  });
    const bttn = _u.buildElem('button', { text: 'Search', 
        name: 'sel'+entity+'_submit', class: 'ag-fresh tbl-bttn' });
    addInputClass(entity, input);
    addLblClass(entity, lbl);
    $(input).onEnter(func);
    $(lbl).append([span, input]);
    return lbl;
}
function addInputClass(entity, input) {
    const map = { 'Location': 'locTxtInput', 'Taxon': 'taxonSel' };
    if (!map[entity]) { return; }
    $(input).addClass(map[entity]);
}
function addLblClass(entity, lbl) {
    const className = entity == 'Taxon' ? 'taxonLbl' : 'txtLbl';
    $(lbl).addClass(className);
}
function onTextFilterChange(entity, e) {
    const map = {
        'Location': filterLocs, 'Publication': updatePubSearch, 'Taxon': filterTaxa };
    const txt = getTreeFilterTextVal(entity);  
    const hndlr = map[entity] ? map[entity] : filterTableByText;
    hndlr(txt);
}
function getTreeFilterTextVal(entity) {                                         //console.log('getTreeFilterTextVal entity = ', entity);
    return $('input[name="sel'+entity+'"]').val().trim().toLowerCase();
}
function filterTableByText(text) {                                              //console.log('filterTableByText [%s]', text);
    tblState = tState().get(null, ['api', 'curFocus', 'rowData']);  
    const allRows = getAllCurRows();                     
    const newRows = text === "" ? allRows : getTreeRowsWithText(allRows, text);
    tblState.api.setRowData(newRows); 
    updateNameFilterMemory(text);
    updateFilterStatusMsg();
    db_ui.resetToggleTreeBttn(false);
}
function updateNameFilterMemory(text) { 
    if (text === "") { return delete fPs.pnlFltrs.name; }
    fPs.pnlFltrs.name = '"'+text+'"'; 
}
function getTreeRowsWithText(rows, text) {                                      //console.log('getTreeRowsWithText [%s] rows = %O', text, rows)
    return rows.filter(row => {  
        const isRow = ifRowContainsText(row, text); 
        if (rowChildrenAreTreeEntities(row)) {
            row.children = getTreeRowsWithText(row.children, text);
        }                                                                       //console.log('isRow = [%s] children [%s]', isRow, nonSrcRowHasChildren(row))
        return isRow || (nonSrcRowHasChildren(row) ? 
            !row.children[0].hasOwnProperty('interactionType') : false );
    });
}
function ifRowContainsText(row, text) {
    return row.name.toLowerCase().includes(text);
}
function rowChildrenAreTreeEntities(row) {
    if (tblState.curFocus === 'srcs') { return false; }
    return row.children && !row.children[0].hasOwnProperty('interactionType');
}
function nonSrcRowHasChildren(row) { 
    if (tblState.curFocus === 'srcs') { return false; }
    return row.children && row.children.length > 0;
}
/*------------------ Location Filter Updates -----------------------------*/
function filterLocs(text) {  
    const selected = tState().get('selectedOpts');
    const selType = getSelectedLocVal(selected);                         
    if (selType) { return updateLocSearch(selected[selType], selType); }
    filterTableByText(text);
}
function getSelectedLocVal(selected) {
    const sels = Object.keys(selected);
    return !sels.length ? null : sels.length == 1 ? 'Region' : 'Country';
}
export function updateLocSearch(val, selType) {                                 //console.log('updateLocSearch. val = [%s] selType = [%s]', val, selType);
    if (!val) { return; }
    const locType = selType ? selType : getLocType(val, this.$input[0].id);   
    const root = getNewLocRoot(val, locType);    
    const txt = getTreeFilterTextVal('Location');  
    updateLocFilterMemory(root, locType);
    updateNameFilterMemory(txt);
    rebuildLocTable(root, txt);
    db_ui.resetToggleTreeBttn(false);
    if ($('#shw-chngd')[0].checked) { reapplyPreviousTimeFilter(fPs.pnlFltrs.time, 'skip'); }
} 
function getLocType(val, selId) {                                        
    const selTypes = { selCountry: 'Country', selRegion: 'Region' };
    const type = selTypes[selId];
    return val !== 'all' ? type : (type == 'Country' ? 'Region' : false);
}
function getNewLocRoot(val, locType) {
    return val == 'all' ? getParentId(locType) : [parseInt(val)];
}
function getParentId(locType) {                                                   
    return !locType ? getTopRegions() : [tState().get('selectedOpts')['Region']];
}
function getTopRegions() {
    return Object.values(tState().get('data')['topRegionNames']);      
}
function updateLocFilterMemory(loc, locType) {
    if (loc.length > 1) { return resetLocComboMemory(); }
    const selVal = parseInt(loc[0]);  
    tState().set({'selectedOpts': getSelectedVals(selVal, locType)});
    fPs.pnlFltrs.combo = {};
    fPs.pnlFltrs.combo[locType] = { text: locType, value: selVal };
}
function resetLocComboMemory() {
    tState().set({'selectedOpts': {}});
    delete fPs.pnlFltrs.combo; 
}
function getSelectedVals(val, type) {                                           //console.log("getSelectedVals. val = %s, selType = ", val, type)
    const selected = {};
    const locRcrds = tState().get('rcrdsById');
    if (type === 'Country') { selectRegion(val); }
    if (val !== 'none' && val !== 'all') { selected[type] = val; }
    return selected;  

    function selectRegion(val) {
        const loc = _u.getDetachedRcrd(val, locRcrds);
        selected['Region'] = loc.region.id;
    }
} /* End getSelectedVals */
/*------------------ Source Filter Updates -------------------------------*/
/**
 * When the publication type dropdown is changed or the table is filtered by 
 * publication text, the table is rebuilt with the filtered data.
 * NOTE: All Source realms include text search.
 */
export function updatePubSearch() {                                             //console.log('updatePubSearch.')
    tblState = tState().get(null, ['api', 'rowData', 'curFocus']);  
    const typeId = _u.getSelVal('Publication Type'); 
    const txt = getTreeFilterTextVal('Publication');
    const newRows = getFilteredPubRows();
    setPubFilters();
    tblState.api.setRowData(newRows);
    db_ui.resetToggleTreeBttn(false);

    function getFilteredPubRows() {                             
        if (typeId === 'all') { return getTreeRowsWithText(getAllCurRows(), txt); }
        if (txt === '') { return getPubTypeRows(typeId); }
        const pubTypes = _u.getDataFromStorage('publicationType'); 
        const pubIds = pubTypes[typeId].publications;        
        return getAllCurRows().filter(row => 
            pubIds.indexOf(row.pubId) !== -1 && 
            row.name.toLowerCase().indexOf(txt) !== -1);
    }
    /** Returns the rows for publications with their id in the selected type's array */
    function getPubTypeRows() { 
        const pubTypes = _u.getDataFromStorage('publicationType'); 
        const pubIds = pubTypes[typeId].publications;      
        return getAllCurRows().filter(row => pubIds.indexOf(row.pubId) !== -1);
    }
    function setPubFilters() { 
        const typeVal = $(`#selPubType option[value="${typeId}"]`).text();
        const truncTxt = txt ? 
            (txt.length > 50 ? txt.substring(0, 50)+'...' : txt) : null; 
        updatePubFocusFilters(typeVal, typeId, truncTxt);
        updateFilterStatusMsg();
    }
    function updatePubFocusFilters(type, typeId, text) {
        updatePubComboboxFilter();
        updatePubNameFilter();

        function updatePubComboboxFilter() { 
            if (type === '- All -') { delete fPs.pnlFltrs.combo; 
            } else { 
                fPs.pnlFltrs.combo = {}; 
                fPs.pnlFltrs.combo["Publication Type"] = 
                    { text: 'Publication Type', value: typeId }
            };
        }
        function updatePubNameFilter() {  
            if (text == '' || text == null) { delete fPs.pnlFltrs.name;
            } else { fPs.pnlFltrs.name = '"'+text+'"'; }
        }
    }
} /* End updatePubSearch */
/*------------------ Taxon Filter Updates ---------------------------------*/
function filterTaxa(text) {                                                    //console.log('filterTaxa! text [%s]', text);
    const selected = tState().get('selectedOpts'); 
    const selLvl = getSelectedTaxonLvl(selected);     
    if (selLvl) { return updateTaxonSearch(selected[selLvl], selLvl); }
    filterTableByText(text);
}
function getSelectedTaxonLvl(selected) {                
    if (Object.keys(selected).length == 0) { return; }
    const lvls = ['Class', 'Order', 'Family', 'Genus', 'Species'];
    return lvls.reverse().find(lvl => selected[lvl]);
}
/**
 * When a taxon is selected from one of the taxon-level comboboxes, the table 
 * is updated with the taxon as the top of the new tree. The remaining level 
 * comboboxes are populated with realted taxa, with ancestors selected.
 */
export function updateTaxonSearch(val, selLvl) {                                        
    if (!val) { return; }                                                       
    const taxonRcrds = tState().get('rcrdsById');  
    const rcrd = getRootTaxonRcrd(val, taxonRcrds, this);
    const txt = getTreeFilterTextVal('Taxon');                                  //console.log("updateTaxonSearch txt = [%s] txn = %O", txt, rcrd); 
    tState().set({'selectedOpts': getRelatedTaxaToSelect(rcrd, taxonRcrds)});   //console.log("selectedVals = %O", tParams.selectedVals);
    addToFilterMemory();
    rebuildTxnTable(rcrd, 'filtering', txt);

    function addToFilterMemory() {
        const curLevel = rcrd.level.displayName;
        const taxonName = rcrd.displayName;
        if (!rcrd.parent || rcrd.parent == 1) { return delete fPs.pnlFltrs.combo; }
        fPs.pnlFltrs.combo = {};
        fPs.pnlFltrs.combo[curLevel] = { text: taxonName, value: val };
        updateNameFilterMemory(txt);
    }
} /* End updateTaxonSearch */
/**
 * When a taxon is selected from the filter comboboxes, the record is returned.
 * When 'all' is selected, the selected parent is returned, or the realm record.
 */
function getRootTaxonRcrd(val, rcrds, that) {
    const id = val == 'all' ? getTaxonParentId(rcrds, that) : val;
    return _u.getDetachedRcrd(id, rcrds);  
}
function getTaxonParentId(rcrds, that) {  
    const prevId = getPreviouslySelectedTaxonId(that); 
    const prevRcrd = _u.getDetachedRcrd(prevId, rcrds);  
    return prevRcrd.parent;
}
/** Returns the ID of the parent of the reset taxon combobox */
function getPreviouslySelectedTaxonId(that) { 
    if (that) { return that.currentResults.items.filter(o => o.id !== 'all')[0].id; }
    const selected = tState().get('selectedOpts');
    const lvl = getSelectedTaxonLvl(selected);
    return selected[lvl];
}
/** The selected taxon's ancestors will be selected in their levels combobox. */
function getRelatedTaxaToSelect(selTaxonObj, taxonRcrds) {                      //console.log("getRelatedTaxaToSelect called for %O", selTaxonObj);
    const topTaxaIds = [1, 2, 3, 4]; //animalia, chiroptera, plantae, arthropoda 
    const selected = {};                                                        //console.log("selected = %O", selected)
    selectAncestorTaxa(selTaxonObj);
    return selected;
    /** Adds parent taxa to selected object, until the realm parent. */
    function selectAncestorTaxa(taxon) {                                        //console.log("selectedTaxonid = %s, obj = %O", taxon.id, taxon)
        if ( topTaxaIds.indexOf(taxon.id) === -1 ) {
            selected[taxon.level.displayName] = taxon.id;                       //console.log("setting lvl = ", taxon.level)
            selectAncestorTaxa(_u.getDetachedRcrd(taxon.parent, taxonRcrds))
        }
    }
} /* End getRelatedTaxaToSelect */
/* ========================== FILTER UTILITY METHODS ================================================================ */
/** If table is filtered by an external filter, the rows are stored in timeRows. */
function getAllCurRows() { 
    return fPs.timeRows || tblState.rowData;
} 