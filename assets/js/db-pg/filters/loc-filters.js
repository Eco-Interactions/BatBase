/*
 * Filters interactions by the Country or Region using comboboxes in the filter panel. 
 * Synchronizes the tree-text filter and the combobox filters.
 * 
 * Exports:
 *      loadLocFilters
 *      updateLocSearch
 *      
 * TOC:
 *      UI
 *      FILTER
 */
import { _filter, _ui, _u, rebuildLocTable, accessTableState as tState } from '../db-main.js';
 /* ========================= UI ============================================ */
/**
 * Builds the Location search comboboxes @loadLocComboboxes and the tree-text filter. 
 */
export function loadLocFilters(tblState) {                          /*Perm-log*/console.log("       --Init Location Filter Panel UI.");
    if ($('#focus-filters label').length) { return updateLocSelOptions(tblState); }
    loadLocComboboxes(tblState);
    loadLocNameSearchElem();
}
function updateLocSelOptions(tblState) {
    const opts = buildLocSelectOpts(tblState); 
    Object.keys(opts).forEach(locType => {                                            
        _u('replaceSelOpts', ['#sel'+locType, opts[locType], null, locType]);
    });
    setSelectedLocVals(tblState.selectedOpts);
}
function loadLocNameSearchElem() {  
    const searchTreeElem = _filter('getTreeTextFilterElem', ['Location']);
    $('#focus-filters').append(searchTreeElem);
}
/**
 * Create and append the location search comboboxes, Region and Country, and
 * set any previously 'selected' values.
 */
function loadLocComboboxes(tblState) {  
    const opts = buildLocSelectOpts(tblState); 
    const selElems = buildLocSelects(opts);
    $('#focus-filters').append(selElems);
    _u('initComboboxes', [{'Region': updateLocSearch, 'Country': updateLocSearch}]);
    setSelectedLocVals(tblState.selectedOpts);
}
/** Builds arrays of options objects for the location comboboxes. */
function buildLocSelectOpts(tblState, data) {
    const processedOpts = { Region: [], Country: [] };
    const opts = { Region: [], Country: [] };  
    tblState.api.getModel().rowsToDisplay.forEach(buildLocOptsForNode);
    modifyOpts();
    return opts; 
    /**
     * Recurses through the tree and builds a option object for each unique 
     * country and region in the current table with interactions.
     */
    function buildLocOptsForNode(row) {                                 
        const rowData = row.data;  
        if (rowData.interactionType) {return;}                                  //console.log("buildLocOptsForNode %s = %O", rowData.name, rowData)
        if (rowData.type === 'Region' || rowData.type === 'Country') {
            buildLocOpt(rowData, rowData.name, rowData.type); 
        }
        if (row.childrenAfterFilter) { row.childrenAfterFilter.forEach(buildLocOptsForNode); }
    }
    /** If the location has interactions an option object is built for it. */
    function buildLocOpt(rowData, name, type) {  
        if (name.includes('Unspecified')) { return; }
        if (processedOpts[type].indexOf(name) !== -1) { return; }
        const id = rowData.id;             
        if (isOpenRow(id)) { addToSelectedObj(id, type); }
        opts[type].push({ value: id, text: name.split('[')[0] }); 
        processedOpts[type].push(name);
    }
    function isOpenRow(id) {  
        return tblState.openRows.indexOf(id) !== -1
    }
    /** Handles all modification of the location options. */
    function modifyOpts() {                                                     
        if (opts.Region.length === 2) { rmvTopRegion(); }        
        addMissingOpts();
        sortLocOpts();
        addAllOption();
    }
    /** 
     * If both top & sub regions are in the table, only the sub-region opt is 
     * included, unless the top region is the location being filtered on. 
     */
    function rmvTopRegion() {                                                   //console.log('rmving top region. opts = %O, regionToKeep = %O', opts, tblState.selectedOpts)
        const selLoc = tblState.rcrdsById[tblState.openRows[0]];                  
        if (!selLoc || !selLoc.parent) { return; }
        opts.Region = opts.Region.filter(region => {
            return region.value == tblState.selectedOpts.Region;
        });             
    }
    /** If the Region or Country aren't in the table, they are added as options here. */
    function addMissingOpts() {                                                 
        if (!tblState.openRows.length && !tblState.selectedOpts) { return; }
        const selLoc = tblState.rcrdsById[tblState.openRows[0]];                  
        if (!opts.Country.length) { buildOpt(selLoc, 'country', 'Country'); }
        if (!opts.Region.length) { buildOpt(selLoc, 'region', 'Region'); }
    }
    /** build the new opts and adds their loc ids to the selected-options obj. */
    function buildOpt(loc, type, optProp) {                                    //console.log('building opt for [%s]. loc = %O', type, loc);
        const val = loc && loc[type] ?  loc[type].id : false;
        const txt = loc && loc[type] ?  loc[type].displayName : false;
        if (!val) { return }
        addToSelectedObj(val, optProp);  
        tblState.openRows.push(val);
        opts[optProp].push({ value: val, text: txt });
    }         
    function addToSelectedObj(id, type) {
        const sel = tblState.selectedOpts;                                      //console.log('building opt for [%s]', type);
        sel[type] = id;
    }
    /** Alphabetizes the options. */
    function sortLocOpts() {
        for (let type in opts) {
            opts[type] = opts[type].sort(alphaOptionObjs); 
        }
    }
    function addAllOption() {  
        Object.keys(tblState.selectedOpts).forEach(type => {                    //console.log('opts = %O, type = %s, tblStateOpts = %O', opts, type, tblState.selectedOpts)
            opts[type].unshift({value: 'all', text: '- All -'})
        });
    }
} /* End buildLocSelectOpts */
function alphaOptionObjs(a, b) {
    var x = a.text.toLowerCase();
    var y = b.text.toLowerCase();
    return x<y ? -1 : x>y ? 1 : 0;
}  
/** Builds the location select elements */
function buildLocSelects(locOptsObj) {  
    const selElems = [];
    for (let locSelName in locOptsObj) {
        let elem = buildLocSel(_u('ucfirst', [locSelName]), locOptsObj[locSelName]); 
        selElems.push(elem);
    }
    return selElems;
    
    function buildLocSel(selName, opts) {
        const lbl = _u('buildElem', ['label', { class: "sel-cntnr flex-row" }]);
        const span = _u('buildElem', ['span', { text: selName + ': ', class: "opts-span" }]);
        const sel = newSelEl(opts, 'opts-box', 'sel' + selName, selName);
        $(lbl).addClass('locLbl').append([span, sel]);
        $(sel).addClass('locSel');
        return lbl;
    }
}
function newSelEl(opts, c, i, field) {                                          //console.log('newSelEl for [%s]. args = %O', field, arguments);
    const elem = _u('buildSelectElem', [opts, { class: c, id: i }]);
    $(elem).data('field', field);
    return elem;
}
function setSelectedLocVals(selected) {                                         //console.log("selected in setSelectedLocVals = %O", selected);
    Object.keys(selected).forEach(locType => {
        _u('setSelVal', [locType, selected[locType], 'silent']);
    });
}
/* =========================== FILTER ======================================= */
export function updateLocSearch(val, text) {                                 
    if (!val) { return; }                                                       console.log('       +-updateLocSearch. val = [%s] text = [%s]', val, text); 
    const locType = getLocTypeFromElems();     
    const root = getNewLocRoot(val, locType);  
    const txt = text || _filter('getTreeFilterVal', ['Location']);  
    updateLocFilterMemory(root, locType);
    _ui('setTreeToggleData', [false]);
    return rebuildLocTable(root, txt)
        .then(_filter('reapplyDateFilterIfActive'));
} 
function getLocTypeFromElems() {
    const locType = ['Country', 'Region'].filter(type => hasSelVal($('#sel'+type).val()) );
    return locType.length == 1 ? locType[0] : null;
}
function hasSelVal(val) {
    return val && val !== 'all';
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
    const filter = {};
    filter[locType] = { text: locType, value: selVal };
    _filter('setPanelFilterState', ['combo', filter]);
}
function resetLocComboMemory() {
    tState().set({'selectedOpts': {}});
    _filter('setPanelFilterState', ['combo', false]);
}
function getSelectedVals(val, type) {                                           //console.log("getSelectedVals. val = %s, selType = ", val, type)
    const selected = {};
    const locRcrds = tState().get('rcrdsById');
    if (type === 'Country') { selectRegion(val); }
    if (val !== 'none' && val !== 'all') { selected[type] = val; }
    return selected;  

    function selectRegion(val) {
        const loc = _u('getDetachedRcrd', [val, locRcrds]);
        selected['Region'] = loc.region.id;
    }
} 