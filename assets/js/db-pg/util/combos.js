/**
 * Selectized combobox methods.
 *
 * Exports:
 *     initCombobox
 *     initComboboxes
 *     getSelVal
 *     setSelVal
 *     updatePlaceholderText
 *     replaceSelOpts
 *     triggerComboChangeReturnPromise
 */
import * as _pg from '../db-main.js';
import * as db_filters from '../table/filters/filters-main.js';
import { newIntList, selIntList } from '../pg-ui/panels/int-list-panel.js';
import { newFilterSet, selFilterSet } from '../pg-ui/panels/filter/filter-panel-main.js';


/**
 * Inits 'selectize' for each select elem in the form's 'selElems' array
 * according to the 'selMap' config. Empties array after intializing.
 */
export function initCombobox(field, options, change) {                          //console.log("initCombobox [%s] args = %O", field, arguments);
    const confg = getSelConfgObj(field); 
    initSelectCombobox(confg, options, change);  
} /* End initComboboxes */
export function initComboboxes(fieldAry) {
    fieldAry.forEach(field => initCombobox(field));
}
function getSelConfgObj(field) {  
    const confgs = { 
        // Search Page Database Options Bar Comboboxes
        'Focus' : { name: field, id: '#search-focus', change: _pg.buildTable, blur: true },
        'View': { name: 'View', id: '#sel-view', change: false, blur: true },
        // Search Page Filter Comboboxes
        'Class' : { name: field, id: '#sel'+field, change: db_filters.updateTaxonSearch, blur: true },
        'Country' : { name: field, id: '#sel'+field, change: db_filters.updateLocSearch, blur: true },
        'Family' : { name: field, id: '#sel'+field, change: db_filters.updateTaxonSearch, blur: true },
        'Genus' : { name: field, id: '#sel'+field, change: db_filters.updateTaxonSearch, blur: true },
        'Order' : { name: field, id: '#sel'+field, change: db_filters.updateTaxonSearch, blur: true },
        'Publication Type' : {name: field, id: '#selPubType', change: db_filters.updatePubSearch, blur: true },
        'Region' : { name: field, id: '#sel'+field, change: db_filters.updateLocSearch, blur: true },
        'Species' : { name: field, id: '#sel'+field, change: db_filters.updateTaxonSearch, blur: true },
        'Date Filter': { name: 'Filter', id: '#selDateFilter' },
        // Search Page Comboboxes with Create Options
        'Int-lists': { name: 'Interaction List', id: '#selIntList', add: newIntList, change: selIntList },
        'Saved Filter Set': {name: field, id: '#selSavedFilters', add: newFilterSet, change: selFilterSet },        
    };
    return confgs[field];
}
/**
 * Inits the combobox, using 'selectize', according to the passed config.
 * Note: The 'selectize' library turns select dropdowns into input comboboxes
 * that allow users to search by typing.
 */
function initSelectCombobox(confg, opts, change) {                              //console.log("initSelectCombobox. CONFG = %O", confg)
    const options = {
        create: confg.add || false,
        onChange: change || confg.change,
        onBlur: confg.blur ? saveOrRestoreSelection : null,
        placeholder: getPlaceholer(confg.id, confg.name, confg.add)
    };
    if (opts) { addAdditionalOptions(); }                                       //console.log('options = %O', options);
    $(confg.id).selectize(options);  
    /** All non-standard options are added to this 'options' prop. */ 
    function addAdditionalOptions() {
        for (var opt in opts) {  
            options[opt] = opts[opt];
        }
    }
} /* End initSelectCombobox */
function getPlaceholer(id, name, add, empty) {
    const optCnt = empty ? 0 : $(id + ' > option').length;  
    const placeholder = 'Select ' + name
    return optCnt || add ? placeholder : '- None -';
}
export function getSelVal(field) {                                              //console.log('getSelVal [%s]', field);
    const selId = getSelConfgObj(field).id;                                        //console.log('getSelVal [%s] = [%s]', field, $(confg.id)[0].selectize.getValue());
    const $selApi = $(selId)[0].length ? $(selId)[0].selectize : false; 
    if (!$selApi) { return _pg.alertIssue('comboboxNotFound', {id: selId}); }
    return $selApi.getValue();  
}
// function getSelTxt(field) {
//     const confg = getSelConfgObj(field);
//     const $selApi = $(confg.id)[0].selectize; 
//     return $selApi.getItem(id).length ? $selApi.getItem(id)[0].innerText : false;
// }
export function setSelVal(field, val, silent) {                                 //console.log('setSelVal [%s] = [%s]', field, val);
    const selId = getSelConfgObj(field).id;
    const $selApi = $(selId)[0].length ? $(selId)[0].selectize : false; 
    if (!$selApi) { return _pg.alertIssue('comboboxNotFound', {id: selId}); }
    $selApi.addItem(val, silent); 
    saveSelVal($(selId), val);
}
/**
 * For comboboxes on the database page that must remain filled for the UI to stay synced.
 * onBlur: the elem is checked for a value. If one is selected, it is saved. 
 * If none, the previous is restored. 
 */
function saveOrRestoreSelection() {                                             //console.log('----------- saveOrRestoreSelection')
    const $elem = this.$input;  
    const field = $elem.data('field'); 
    const prevVal = $elem.data('val');          
    const curVal = getSelVal(field);                                 
    return curVal ? saveSelVal($elem, curVal) : setSelVal(field, prevVal, 'silent');
} 
function saveSelVal($elem, val) {
    $elem.data('val', val);
}
export function updatePlaceholderText(selId, newTxt, optCnt) {                     //console.log('updating placeholder text to [%s] for elem = %O', newTxt, elem);
    const emptySel = optCnt === 0;
    const $selApi = $(selId)[0].length ? $(selId)[0].selectize : false; 
    if (!$selApi) { return _pg.alertIssue('comboboxNotFound', {id: selId}); }
    $selApi.settings.placeholder = getPlaceholer(selId, newTxt, false, emptySel);
    $selApi.updatePlaceholder();
}
// export function enableComboboxes($pElems, enable) {   console.log('############ enableComboboxes used')
//     $pElems.each((i, elem) => { enableCombobox(enable, '#'+elem.id) });
// }
// function enableCombobox(enable, selId) {
//     if (enable === false) { return $(selId)[0].selectize.disable(); }
//     $(selId)[0].selectize.enable();
// }
export function replaceSelOpts(selId, opts, changeHndlr, name) {                //console.log('replaceSelOpts. args = %O', arguments)
    const $selApi = $(selId)[0].length ? $(selId)[0].selectize : false; 
    if (!$selApi) { return _pg.alertIssue('comboboxNotFound', {id: selId}); }
    if (!opts) { return clearCombobox($selApi); }
    if (name) { updatePlaceholderText(selId, name, opts.length); }    
    if (changeHndlr) { 
        $selApi.off('change');
        $selApi.on('change', changeHndlr); 
    }  
    $selApi.clear('silent'); 
    $selApi.clearOptions();
    $selApi.addOption(opts);
    $selApi.refreshOptions(false);
}
function clearCombobox($selApi) {
    $selApi.off('change');
    $selApi.clear('silent');
    $selApi.clearOptions();
}
export function triggerComboChangeReturnPromise(field, val) {                   //console.log('triggerComboChange [%s] = [%s]', field, val);
    const confg = getSelConfgObj(field);
    const $selApi = $(confg.id)[0].selectize; 
    const change = confg.change;
    $selApi.addItem(val, 'silent');
    return change(val);
}