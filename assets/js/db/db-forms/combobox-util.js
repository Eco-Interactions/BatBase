/**
 *
 *
 * Exports:             Imported by:
 *     initFormCombos       db-forms   
 *     initSingle           db-forms
 */
import * as db_forms from './db-forms.js';

/*------------------- Combobox (selectized) Methods ----------------------*/
/**
 * Inits the combobox, using 'selectize', according to the passed config.
 * Note: The 'selectize' library turns select dropdowns into input comboboxes
 * that allow users to search by typing and, when configured, add new options 
 * not in the list by triggering a sub-form for that entity.
 */
export function initSingle(confg, fLvl) {                                      //console.log("initSingle. CONFG = %O. fLvl = ", confg, fLvl)
    var options = {
        create: confg.add,
        onChange: confg.change,
        placeholder: 'Select ' + confg.name
    };
    if (confg.options) { addAdditionalOptions(); }
    $(confg.id).selectize(options);  
    /** All non-standard options are added to this 'options' prop. */ 
    function addAdditionalOptions() {
        for (var opt in confg.options) {
            options[opt] = confg.options[opt];
        }
    }
} /* End initSingle */
/**
 * Inits 'selectize' for each select elem in the form's 'selElems' array
 * according to the 'selMap' config. Empties array after intializing.
 */
export function initFormCombos(entity, fLvl, elems) {     //console.log('args = %O', arguments); console.trace();                                 //console.log("initFormCombos. [%s] formLvl = [%s] fields = %O", entity, formLvl, fP.forms[formLvl].selElems);
    // const fLvl = formLvl || fP.forms[entity];  
    const selConfgs = db_forms.getSelConfgs();
    elems.forEach(selectizeElem);
    elems = [];

    function selectizeElem(fieldName) {                                             //console.log("Initializing --%s-- select", field);
        const confg = selConfgs[fieldName];
        confg.id = confg.id || '#'+fieldName+'-sel';
        initSingle(confg, fLvl);
    }
} /* End initFormCombos */
export function enableCombobox(selId, enable) {
    if (enable === false) { return $(selId)[0].selectize.disable(); }
    $(selId)[0].selectize.enable();
}
export function enableComboboxes($pElems, enable) {
    $pElems.each((i, elem) => { enableCombobox('#'+elem.id, enable)});
}
export function focusCombobox(selId, focus) { 
    if (!focus) { return $(selId)[0].selectize.blur(); }
    $(selId)[0].selectize.focus();
}
export function focusFirstCombobox(cntnrId, focus) {
    const selElems = $(cntnrId+' .selectized').toArray();                       //console.log("cntnr = %s, elems[0] = %O", cntnrId, selElems[0]);
    focusCombobox('#'+ selElems[0].id, focus);
}
export function clearCombobox(selId) {                                                 //console.log("clearCombobox [%s]", selId);
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
    const selId = db_forms.getFormParams().forms[fLvl].pSelId;  
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
    var selApi = $(selId)[0].selectize;
    selApi.clearOptions();
    selApi.addOption(opts);
    selApi.refreshOptions(false);
    if (focus === true) {  }
}
export function getSelVal(id) {                                                        //console.log('getSelVal [%s]', id);
    return $(id)[0].selectize.getValue();  
}
export function getSelTxt(id) {                                                        //console.log('getSelTxt. id = ', id);
    return $(id)[0].innerText;
}
export function setSelVal(id, val, silent) {                                           //console.log('setSelVal [%s] = [%s]. silent ? ', id, val, silent);
    const $selApi = $(id)[0].selectize; 
    $selApi.addItem(val, silent); 
}