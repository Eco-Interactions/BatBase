/**
 *
 *
 * Exports:             Imported by:
 *     initFormCombos       db-forms   
 *     initSingle           db-forms
 */
import { mmry as _mmry } from '../forms-main.js';

/*------------------- Combobox (selectized) Methods ----------------------*/
/**
 * Inits the combobox, using 'selectize', according to the passed config.
 * Note: The 'selectize' library turns select dropdowns into input comboboxes
 * that allow users to search by typing and, when configured, add new options 
 * not in the list by triggering a sub-form for that entity.
 */
export function initSingle(confg, fLvl) {                                       //console.log("initSingle. CONFG = %O. fLvl = ", confg, fLvl)
    const options = {
        create: confg.add,
        onChange: confg.change,
        placeholder: 'Select ' + confg.name
    };
    if (confg.options) { addAdditionalOptions(); }
    $(confg.id).selectize(options);  
    /** All non-standard options are added to this 'options' prop. */ 
    function addAdditionalOptions() {
        for (let opt in confg.options) {
            options[opt] = confg.options[opt];
        }
    }
} 
export function enableCombobox(selId, enable) { 
    if (enable === false) { return $(selId)[0].selectize.disable(); }
    $(selId)[0].selectize.enable();
}
export function enableComboboxes($pElems, enable) {
    $pElems.each((i, elem) => { enableCombobox('#'+elem.id, enable)});
}
export function enableFirstCombobox(cntnrId, enable = true) {
    const selElems = $(cntnrId+' .selectized').toArray();                       //console.log("[%s] first elem = %O", cntnrId, selElems[0]);
    const firstElem = $('#'+ selElems[0].id)[0].selectize;
    return enable ? firstElem.enable() : firstElem.disable();
}
export function focusCombobox(selId, focus) { 
    if (!focus) { return $(selId)[0].selectize.blur(); }
    $(selId)[0].selectize.focus();
}
export function focusFirstCombobox(cntnrId, focus) {  
    const selElems = $(cntnrId+' .selectized').toArray();                       //console.log("[%s] first elem = %O", cntnrId, selElems[0]);
    focusCombobox('#'+ selElems[0].id, focus);
}
export function clearCombobox(selId) {                                          //console.log("clearCombobox [%s]", selId);
    const selApi = $(selId)[0].selectize;
    selApi.clear(true);
    selApi.updatePlaceholder();
    selApi.removeOption("");
}    
/**
 * Clears and enables the parent combobox for the exited form. Removes any 
 * placeholder options and, optionally, brings it into focus.
 */
export function resetFormCombobox(fLvl, focus) {      
    const selId = _mmry('getFormParentId', [fLvl]);  
    if (!selId) { return; }
    const combobox = $(selId)[0].selectize;   
    combobox.clear();
    combobox.enable();
    combobox.removeOption(''); //Removes the "Creating [entity]..." placeholder.
    if (focus) { combobox.focus(); 
    } else if (focus === false) { combobox.blur(); }
}
/** Clears previous options and adds the new ones. Optionally focuses the combobox. */
export function updateComboboxOptions(selId, opts, focus) {
    const selApi = $(selId)[0].selectize;
    selApi.clearOptions();
    selApi.addOption(opts);
    selApi.refreshOptions(false);
    if (focus === true) {  }
}
export function getSelVal(id) {                                                 //console.log('getSelVal [%s]', id);
    return $(id)[0].selectize.getValue();  
}
export function getSelTxt(id) {                                                 //console.log('getSelTxt. id = ', id);
    return $(id)[0].innerText;
}
export function setSelVal(id, val, silent) {                                    //console.log('setSelVal [%s] = [%s]. silent ? ', id, val, silent);
    const $selApi = $(id)[0].selectize; 
    $selApi.addItem(val, silent); 
}

/**
 * Inits 'selectize' for each select elem in the form's 'selElems' array
 * according to the 'selMap' config. Empties array after intializing.
 */
export function initFormCombos(entity, fLvl, comboEvents) {                     //console.log("initFormCombos. [%s] formLvl = [%s], events = %O", entity, fLvl, comboEvents);
    const elems = _mmry('getFormProp', [fLvl, 'selElems']);  
    elems.forEach(selectizeElem);
    _mmry('setFormProp', [fLvl, 'selElems', []]);

    function selectizeElem(fieldName) {                                         //console.log("Initializing --%s-- select", field);
        const confg = getFieldConfg(comboEvents, fieldName);
        confg.id = confg.id || '#'+fieldName+'-sel';
        // $(confg.id).off('change');
        initSingle(confg, fLvl);
    }
} 
function getFieldConfg(comboEvents, fieldName) {
    const baseConfg = getBaseFieldConfg(fieldName) ;                            //console.log('baseConfg = %O, eventConfg = %O', baseConfg, comboEvents);
    const eventConfg = comboEvents[fieldName] || {};
    return Object.assign(baseConfg, eventConfg);
}
function getBaseFieldConfg(fieldName) {
    const confgName = fieldName.replace(/([A-Z])/g, ' $1');
    const confgs = { 
        'Authors': { name: 'Authors', id: '#Authors-sel1' },
        'Editors': { name: 'Editors', id: '#Editors-sel1' },
        'InteractionTags': { name: 'Interaction Tags', 
            options: { delimiter: ",", maxItems: null }},         
    };
    return confgs[fieldName] || { name: confgName };
}

