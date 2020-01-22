/**
 * Handles all data-entry form entry points. 
 *
 * CODE SECTIONS
 *     DATABASE PAGE FACADE
 *     FORMS FACADE
 *         FORM STATE / MEMORY
 *         FORM UI
 *         HELPERS
 */
import * as _confg from './etc/form-config.js';
import editEntity from './edit/edit-forms.js';
import * as _forms from './base/base-main.js';
import * as _mmry from './etc/form-memory.js';
import * as _submit from './submit/submit-main.js';
import * as _elems from './elems/elems-main.js';
// REFACTOR
import * as _map from '../map/map-main.js';
import * as _page from '../db-main.js';
import * as _sync from '../local-data/db-sync.js';

function getParams(params) {
    return Array.isArray(params) ? params : [params];
}
/** =================== DATABASE PAGE FACADE ================================ */
export function util(funcName, params) {  
    return _page._util(funcName, params);
}
export function map(funcName, params = []) {
    return _map[funcName](...params);
}
export function loadDataTableAfterFormClose(focus) {
    _page.resetDataTable(focus);
}
export function showTodaysUpdates(focus) {
    _page.showTodaysUpdates(focus);
}
export function initNewDataForm() {
    _forms.createEntity('interaction');
}
export function updateLocalDataStorage() {
    return _sync.updateLocalDb(...arguments);
}
export function resetStoredData() {
    _sync.resetStoredData();
}
/** ====================== FORMS FACADE ===================================== */
export function forms(funcName, params = []) {                                 //console.log('entity func = %O', arguments);//entity form interface
    return _forms[funcName](...getParams(params));
}
export function create(entity, name) {
    return _forms.createEntity(entity, name);
}
export function edit(id, entity) {                                        
    _mmry.initFormState('edit', entity, id)
    .then(() => editEntity(id, entity));
}   
export function val(funcName, params = []) {  
    return _submit.validation(funcName, params);
}
export function submitForm(formId, fLvl, entity) {
    _submit.valAndSubmitFormData(formId, fLvl, entity);
}
/** edit-forms */
export function formatAndSubmitData(entity, fLvl, formVals) {
    return _submit.buildFormDataAndSubmit(entity, fLvl, formVals);
}
/** ------------------- FORM STATE / MEMORY --------------------------------- */
export function confg(funcName, params = []) {
    return _confg[funcName](...params);
}
export function mmry(funcName, params = []) {   
    return _mmry[funcName](...params);
}
export function clearFormMemory() {
    _map.clearMemory();
    _mmry.clearMemory();
}
/** --------------------------- FORM UI ------------------------------------- */
export function elems(funcName, params = []) {                                     //console.log('ui func = %O', arguments);  //ui interface
    return _elems[funcName](...params);
}
// export function elems(funcName, params = []) {
//     return _ui.elems(funcName, params);
// }
export function cmbx(funcName, params = []) {
    return _elems.combos(funcName, params);
}
export function panel(funcName, params = []) {
    return _elems.panel(funcName, params);
}
export function exitFormWindow(e, skipReset) {
    _elems.exitFormPopup(e, skipReset);
}
/** form-footer */
export function exitFormLevel() {
    return _elems.exitSubForm(...arguments);
}
/** --------------------------- HELPERS ------------------------------------- */
/* generate-citation */
export function getFormValData(entity, fLvl, submitting) {
    return _submit.getFormValData(entity, fLvl, submitting);
}
/** Returns the 'next' form level- either the parent or child. */
export function getNextFormLevel(next, curLvl) {  
    const fLvls = _mmry.getStateProp('formLevels');   
    const nextLvl = next === 'parent' ? 
        fLvls[fLvls.indexOf(curLvl) - 1] : 
        fLvls[fLvls.indexOf(curLvl) + 1] ;
    return nextLvl;
}
/** 
 * Returns the sub form's lvl. If the top form is not the interaction form,
 * the passed form lvl is reduced by one and returned. 
 */
export function getSubFormLvl(lvl) { 
    const topEntity = _mmry.getFormProp('top', 'entity');
    const fLvls = _mmry.getStateProp('formLevels');   
    return topEntity === 'interaction' ? lvl : fLvls[fLvls.indexOf(lvl) - 1];
}
/** Returns an obj with the order (k) of the values (v) inside of the container. */
export function getSelectedVals(cntnr, fieldName) {
    let vals = {};
    $.each(cntnr.children, (i, elem) => getCntnrFieldValue(i+1, elem.children));              
    return vals;
        
    function getCntnrFieldValue(cnt, subElems) {                                     
        $.each(subElems, (i, subEl) => { 
            if (subEl.value) { vals[cnt] = subEl.value; }});  
    }                                                                   
}
export function getTaxonDisplayName(taxon) { 
    return taxon.level.displayName === 'Species' ? 
        taxon.displayName : taxon.level.displayName +' '+ taxon.displayName;
}
export function onLevelSelection(val) {
    _entity.onLevelSelection.bind(this)(val);
}