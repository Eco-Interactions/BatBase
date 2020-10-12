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

/** Active Selectize configuration objects. Field name (k): confg (v)  */
const confgs = {};

/**
 * Inits 'selectize' for each select elem in the form's 'selElems' array
 * according to the 'selMap' config. Empties array after intializing.
 */
export function initCombobox(field, change, options) {                          //console.log("initCombobox [%s] args = %O", field, arguments);
    const confg = getBaseConfgObj(field, change);
    confgs[field] = confg;
    initSelectCombobox(confg, options, change);
}
export function initComboboxes(fields) {                                        //console.log('initComboboxes = %O', fields);
    Object.keys(fields).forEach(field => initCombobox(field, fields[field]));
}
/* TODO: Figure out when exactly blur is needed currently. */
function getBaseConfgObj(field, onChange) {
    const confgs = {
        // Search Page Database Options Bar Comboboxes
        'Focus' : { name: field, id: '#search-focus', change: onChange, blur: true },
        'View': { name: 'View', id: '#sel-view', change: onChange, blur: true },
        // Search Page Filter Comboboxes
        'Class' : { name: field, id: '#sel'+field, change: onChange, blur: true },
        'Country' : { name: field, id: '#sel'+field, change: onChange, blur: true },
        'Family' : { name: field, id: '#sel'+field, change: onChange, blur: true },
        'Genus' : { name: field, id: '#sel'+field, change: onChange, blur: true },
        'Order' : { name: field, id: '#sel'+field, change: onChange, blur: true },
        'Object Group': { name: 'Object Groups', id:'#selObjGroup', change: onChange },
        'Publication Type' : {name: field, id: '#selPubType', change: onChange, blur: true },
        'Region' : { name: field, id: '#sel'+field, change: onChange, blur: true },
        'Species' : { name: field, id: '#sel'+field, change: onChange, blur: true },
        'Date Filter': { name: 'Filter', id: '#selDateFilterType' },
        // Search Page Comboboxes with Create Options
        'Int-lists': { name: 'Interaction List', id: '#selIntList', change: onChange },
        'Saved Filter Set': {name: field, id: '#selSavedFilters', change: onChange },
    };
    return confgs[field];
}
/**
 * Inits the combobox, using 'selectize', according to the passed config.
 * Note: The 'selectize' library turns select dropdowns into input comboboxes
 * that allow users to search by typing.
 */
function initSelectCombobox(confg, opts, change) {                              //console.log("initSelectCombobox. args = %O", arguments);
    const create = opts ? opts.add : false;
    const options = {
        create: create,
        onChange: change || confg.change,
        onBlur: confg.blur ? saveOrRestoreSelection : null,
        placeholder: getPlaceholer(confg.id, confg.name, create)
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
    const selId = getBaseConfgObj(field).id;                                    //console.log('getSelVal [%s] = [%s]', field, $(confg.id)[0].selectize.getValue());
    const $selApi = $(selId)[0].length ? $(selId)[0].selectize : false;
    if (!$selApi) { return _pg.alertIssue('comboboxNotFound', {id: selId}); }
    return $selApi.getValue();
}
export function setSelVal(field, val, silent) {                                 //console.log('setSelVal [%s] (silent ? %s) = [%O]', field, silent, val);
    const selId = getBaseConfgObj(field).id;
    const $selApi = $(selId).length ? $(selId)[0].selectize : false;
    if (!$selApi) { return _pg.alertIssue('comboboxNotFound', {id: selId}); }

    if (Array.isArray(val)) { val.forEach(v => $selApi.addItem(v, 'silent'))
    } else { $selApi.addItem(val, 'silent'); }

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
    const confg = getBaseConfgObj(field);
    const $selApi = $(confg.id)[0].selectize;
    const change = confgs[field].change;

    if (Array.isArray(val)) { val.forEach(v => $selApi.addItem(val, 'silent'))
    } else { $selApi.addItem(val, 'silent'); }

    return change(val);
}