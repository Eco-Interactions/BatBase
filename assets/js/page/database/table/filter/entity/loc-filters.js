/*
 * Filters interactions by the Country or Region using comboboxes in the filter panel.
 * Synchronizes the tree-text filter and the combobox filters.
 *
 * Export
 *      loadLocFilters
 *      applyLocFilter
 *
 * TOC
 *      UI
 *      FILTER
 */
import { _cmbx, _el, _u } from '~util';
import { _table, _ui, getDetachedRcrd } from '~db';
import * as fM from '../filter-main.js';

const tState = _table.bind(null, 'tableState');
 /* ========================= UI ============================================ */
/**
 * Builds the Location search comboboxes @loadLocComboboxes and the tree-text filter.
 */
export function loadLocFilters(tblState) {                          /*Perm-log*/console.log("       --Loading location filters.");
    if ($('#focus-filters label').length) { return updateLocSelOptions(tblState); }
    loadLocComboboxes(tblState);
    loadLocNameSearchElem();
}
function updateLocSelOptions(tblState) {
    const opts = buildLocSelectOpts(tblState);
    Object.keys(opts).forEach(locType => {
        _cmbx('replaceSelOpts', [locType+'Filter', opts[locType], null, locType]);
    });
    setSelectedLocVals(tblState.selectedOpts);
}
function loadLocNameSearchElem() {
    const searchTreeElem = fM.getTreeTextFilterElem('Location');
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
    initLocCombos();
    setSelectedLocVals(tblState.selectedOpts);
}
/** Builds arrays of options objects for the location comboboxes. */
function buildLocSelectOpts(tblState, data) {
    const processedOpts = { Region: [], Country: [] };
    const opts = { Region: [], Country: [] };
    tblState.api.getModel().rowsToDisplay.forEach(buildLocOptsForNode);
    modifyOpts();
    updateFilterMemory();
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
        opts[type].push(new Option(name.split('[')[0], id));
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
    function buildOpt(loc, type, optProp) {                                     //console.log('building opt for [%s]. loc = %O', type, loc);
        const val = loc && loc[type] ?  loc[type].id : false;
        const txt = loc && loc[type] ?  loc[type].displayName : false;
        if (!val) { return }
        addToSelectedObj(val, optProp);
        tblState.openRows.push(val);
        opts[optProp].push(new Option(txt, val));
    }
    function addToSelectedObj(id, type) {
        const sel = tblState.selectedOpts;                                      //console.log('building opt for [%s]', type);
        sel[type] = id;
    }
    /** Alphabetizes the options. */
    function sortLocOpts() {
        for (let type in opts) {
            opts[type] = _cmbx('alphabetizeOpts', [opts[type]]);
        }
    }
    function addAllOption() {
        Object.keys(tblState.selectedOpts).forEach(type => {                    //console.log('opts = %O, type = %s, tblStateOpts = %O', opts, type, tblState.selectedOpts)
            opts[type].unshift(new Option('- All -', 'all'));
        });
    }
    function updateFilterMemory() {
        const selTypes = Object.keys(tblState.selectedOpts);
        fM.setFilterState('combo', false, 'rebuild')
        if (!selTypes.length) { return; }
        const filterType = selTypes.length === 1 ? selTypes[0] : 'Country';
        updateLocComboFilter(filterType, tblState.selectedOpts[filterType]);
    }
}
function initLocCombos() {
    _cmbx('initCombobox', [{ name: 'Region Filter',  onChange: applyLocFilter }, true]);
    _cmbx('initCombobox', [{ name: 'Country Filter', onChange: applyLocFilter }, true]);
}
/** Builds the location select elements */
function buildLocSelects(locOpts) {
    const selElems = [];
    for (let locType in locOpts) {
        let elem = buildLocSel(_u('ucfirst', [locType]), locOpts[locType]);
        selElems.push(elem);
    }
    return selElems;

    function buildLocSel(locType, opts) {
        const lbl = _el('getElem', ['label', { class: 'sel-cntnr flex-row' }]);
        const span = _el('getElem', ['span', { text: locType + ': ', class: "opts-span" }]);
        const sel = fM.newSel(opts, 'opts-box', `sel-${locType}Filter`, locType);
        $(lbl).append([span, sel]);
        $(sel).addClass('locSel');
        return lbl;
    }
}
function setSelectedLocVals(selected) {                                         //console.log("selected in setSelectedLocVals = %O", selected);
    Object.keys(selected).forEach(locType => {
        _cmbx('setSelVal', [locType+'Filter', selected[locType], 'silent']);
    });
}
/* =========================== FILTER ======================================= */
export function applyLocFilter(val) {
    if (!val) { return; }
    const selectedOpts = tState().get('selectedOpts');
    let locType = getLocType(this, selectedOpts);                   /*perm-log*/console.log('       +-applyLoc[%s]Filter = [%s]', locType, val);
    const root = getNewLocRoot();
    updateLocFilterMemory(root, locType);
    _ui('setTreeToggleData', [false]);
    return _table('rebuildLocTable', [root]);

    function getNewLocRoot() {
        return isNaN(parseInt(val)) ?
            getRegionIdAndUpdateType(locType) : [parseInt(val)];
    }
    function getRegionIdAndUpdateType (comboType) {
        locType = 'Region';
        return getRegionId(comboType);
    }
    function getRegionId(comboType) {
        return (!comboType || comboType === 'Region' && val === 'all') ?
            Object.values(tState().get('data')['topRegionNames']) :
            [selectedOpts['Region']];
    }
}
function updateLocFilterMemory(loc, locType) {                                  //console.log('updateLocFilterMemory. [%s] loc = %O', locType, loc);
    if (loc.length > 1) { return resetLocComboMemory(); }
    const selVal = parseInt(loc[0]);
    tState().set({'selectedOpts': getSelectedVals(selVal, locType)});
    updateLocComboFilter(locType, selVal);
}
function updateLocComboFilter(locType, selVal) {                                //console.log('updateLocComboFilter type [%s] val [%s]', locType, selVal);
    const filter = {};
    filter[locType] = { text: locType, value: selVal };
    fM.setFilterState('combo', false, 'rebuild');
    fM.setFilterState('combo', filter, 'rebuild');
}
function resetLocComboMemory() {
    tState().set({'selectedOpts': {}});
    fM.setFilterState('combo', false, 'rebuild');
}
function getSelectedVals(val, type) {                                           //console.log("getSelectedVals. val = %s, selType = ", val, type)
    const selected = {};
    const locRcrds = tState().get('rcrdsById');
    if (type === 'Country') { selectRegion(val); }
    if (val !== 'none' && val !== 'all') { selected[type] = val; }
    return selected;

    function selectRegion(val) {
        const loc = getDetachedRcrd(val, locRcrds);
        selected['Region'] = loc.region.id;
    }
}
/* ------------------- GET SELECTED LOCATION -------------------------------- */
function getSelectedLocVal(locType, selectedOpts) {
    return selectedOpts[getLocType(null, selectedOpts)];
}
function getLocType(that, selectedOpts) {
    return that && that.hasOwnProperty('$input') ?
        that.$input[0].id.split('sel-')[1].split('Filter')[0] : getSelectedLocType(selectedOpts);
}
function getSelectedLocType(selectedOpts) {
    const sels = Object.keys(selectedOpts);
    return !sels.length ? getLocTypeFromElems() : (sels.length == 1 ? 'Region' : 'Country');
}
function getLocTypeFromElems() {
    const locType = ['Country', 'Region'].filter(l => hasSelVal($(`#sel-${l}Filter`).val()) );
    return locType.length == 1 ? locType[0] : null;
}
function hasSelVal(val) {
    return val && val !== 'all';
}