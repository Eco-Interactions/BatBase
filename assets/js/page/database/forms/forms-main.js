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
import * as confg from './confg/confg-main.js';
import * as form from './entity-form/entity-form-main.js';
import * as state from './etc/form-state.js';
import * as submit from './submit/submit-main.js';
import * as elems from './elems/elems-main.js';
import editEntity from './edit/edit-forms-main.js';

export function alertFormIssue() {
    if (!state.getFormState()) { return; } //form closed
    return _alert('alertIssue', [...arguments]);
}
/** ===================== MODULE-EXECUTOR =================================== */
function moduleMethod(funcName, mod, modName, params) {
    return executeMethod(funcName, mod, modName, 'forms-main', params);
}
export function _confg(funcName, params = []) {
    return moduleMethod(funcName, confg, 'confg', params);
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
export function _form(funcName, params = []) {                                  //console.log('entity func = %O', arguments);//entity form interface
    return moduleMethod(funcName, form, 'form', getParams(params));
}
export function create(entity, name) {
    return form.createEntity(entity, name);
}
export function initNewDataForm() {
    _ui('showPopupMsg');
    return create('interaction')
        .then(() => _ui('hidePopupMsg'));
}
export function edit(id, entity) {
    state.initFormState('edit', entity, id)
    .then(() => editEntity(id, entity));
}
export function selectIntLoc(id) {
    form.selectIntLoc(id);
}
export function autofillCoordinateFields() {
    form.autofillCoordinateFields(...arguments);
}
export function getPubOrCitEditFields() {
    return form.getPubOrCitEditFields(...arguments);
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
export function submitForm(formId, fLvl, entity) {
    $('#'+fLvl+'-submit').attr('disabled', true).fadeTo('fast', .6);
    submit.valAndSubmitFormData(formId, fLvl, entity);
}
/* Refactor: only used for taxon forms */
export function formatAndSubmitData(entity, fLvl, formVals) {
    return submit.buildFormDataAndSubmit(entity, fLvl, formVals);
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
 */
export function getSubFormLvl(lvl) {
    const topEntity = state.getFormProp('top', 'entity');
    const fLvls = state.getStateProp('formLevels');
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