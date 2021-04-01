/**
 * Data-entry form bundle's main file.
 *
 * TOC
 *     EXTERNAL FACADE
 *     MODULE FACADE
 *         FORM STATE / MEMORY
 *         ENTITY FORMS
 *         FORM UI
 *         VALIDATION & SUBMIT
 *     MODULE HELPERS
 */
import { _alert, executeMethod } from '~util';
import { _map, _ui } from '~db';
import * as form from './entity/entity-form-main.js';
import * as state from './etc/form-state-main.js';
import * as submit from './submit/submit-main.js';
import * as elems from './elems/elems-main.js';

export function alertFormIssue() {
    if (!state.getFormState()) { return; } //form closed
    return _alert('alertIssue', [...arguments]);
}
/** ===================== MODULE-EXECUTOR =================================== */
function moduleMethod(funcName, mod, modName, params) {
    return executeMethod(funcName, mod, modName, 'forms-main', params);
}
export function _confg(funcName, params = []) {
    return form._confg(funcName, params);
}
/** ------------------- FORM STATE / MEMORY --------------------------------- */
export function _state(funcName, params = []) {
    return moduleMethod(funcName, state, 'state', params);
}
export function clearFormMemory() {
    _map('clearMemory');
    form.clearEntityFormMemory(state.getFormEntity('top'));
    state.clearState();
}
/* ----------------- ENTITY FORMS ------------------------------------------- */
export function _form(funcName, params = []) {                      /*dbug-log*///console.log('entity func = %O', arguments);//entity form interface
    return moduleMethod(funcName, form, 'form', getParams(params));
}
export function create(entity, name) {
    return form.createEntity(entity, name);
}
export function edit(entity, id) {
    return initDataEntryForm(entity, id, form.editEntity);
}
export function initNewDataForm() {
    return initDataEntryForm('Interaction', null, create);
}
function initDataEntryForm(entity, val, initFunc) {                 /*dbug-log*/console.log('--initDataEntryForm entity[%s] val[%s] initFunc[%O]', entity, val, initFunc);
    _ui('showPopupMsg');
    return initFunc(entity, val)
        .then(() => _ui('hidePopupMsg'));
}
export function selectIntLoc(id) {
    form.selectIntLoc(id);
}
export function autofillCoordinateFields() {
    form.autofillCoordinateFields(...arguments);
}
/** --------------------------- FORM UI ------------------------------------- */
export function _elems(funcName, params = []) {
    return moduleMethod(funcName, elems, 'form-elems', params);
}
export function _panel(funcName, params = []) {
    return elems._panel(funcName, params);
}
export function exitFormLevel() {
    return elems.exitSubForm(...arguments);
}
/* ------------------- VALIDATION & SUBMIT ---------------------------------- */
export function _val(funcName, params = []) {
    return submit._validation(funcName, params);
}
export function getValidatedFormData() {
    return submit.getValidatedFormData(...arguments);
}
/* Vals passed in taxon edit-forms */
export function handleFormSubmit() {
    return submit.handleFormSubmit(...arguments);
}
/* ======================= MODULE HELPERS =================================== */
/* Handles captures of event objects and returns wrapped in array. */
function getParams(params) {
    return Array.isArray(params) ? params : [params];
}
/** Returns the 'next' form level- either the parent or child. */
export function getNextFormLevel(next, curLvl) {
    const fLvls = state.getStateProp('formLevels');
    const nextLvl = next === 'parent' ?
        fLvls[fLvls.indexOf(curLvl) - 1] :
        fLvls[fLvls.indexOf(curLvl) + 1] ;
    return nextLvl;
}
/**
 * Returns the sub form's lvl. If the top form is not the interaction form,
 * the passed form lvl is reduced by one and returned.
 * TODO: REPLAVE WITH (GETFORMSTATE, ENTITY)
 */
export function getSubFormLvl(lvl) {
    const topEntity = state.getFormState('top', 'name');
    const fLvls = state.getStateProp('formLevels');
    return topEntity === 'Interaction' ? lvl : fLvls[fLvls.indexOf(lvl) - 1];
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