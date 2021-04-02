/**
 * All form state data for the core form and any sub-forms.
 * TODO: DOCUMENT
 *
 * Export
 *     getFormEntity
 *     initFormState
 *     addEntityFormState
 *
 * TOC
 *     INIT FORM-STATE
 *     GETTERS
 *         ENTITY RECORDS
 *         EDIT FORM
 *         TAXON
 *         STATE PREDICATES
 *     SETTERS
 *         ENTITY FORM
 *             COMBOBOX
 *             TAXON
 */
import { _db, _u } from '~util';
import { _confg, alertFormIssue } from '~form';
import * as get from './get-state.js';
import * as init from './init-state.js';
import * as set from './set-state.js';

let fS = {};

export function clearState() {
    fS = {};
}
/* ========================= INIT FORM-STATE ================================ */
export function initFormState() {
    return init.initFormState(...arguments)
        .then(storeAndReturnState);
}
function storeAndReturnState(coreState) {
    fS = coreState;
    return coreState;
}
export function buildNewFormState() {
    return init.buildNewFormState(fS, ...arguments);
}
export function initTaxonState() {
    return init.initTaxonState(fS, ...arguments);
}
/* ============================= EXECUTORS ================================== */
/**
 * [callCoreState description]
 * @param  {[type]} mod      [description]
 * @param  {[type]} funcName [description]
 * @param  {[type]} args     [...funcParams]
 * @return {[type]}          [description]
 */
export function callCoreState(mod, funcName, args) {                /*dbug-log*///console.log('--callCoreState [%s][%O]', funcName, args);
    if (!fS.records) { return false; } //Form closed
    return mod[funcName](fS, ...args);
}
/**
 * [callFormState description]
 * @param  {[type]} mod      [description]
 * @param  {[type]} funcName [description]
 * @param  {[type]} args     [*fLvl, ...funcParams]
 * @return {[type]}          [description]
 */
export function callFormState(mod, funcName, args) {                /*dbug-log*///console.log('--callFormState [%s][%O]', funcName, args);
    if (!ifStateActive(args[0])) { return false; }
    return mod[funcName](getFormObj(args.shift()), ...args);
}
export function ifStateActive(fLvl) {
    return fS.forms && getFormObj(fLvl);
}
/* +++++++++ GETTERS ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
function getFormObj(fLvl) {
    return fS.forms[fLvl];
}
/* ======================= GET CORE STATE =================================== */
export function getStateProp(...args) {
    return callCoreState(get, 'getStateProp', args);
}
/* ----------------------- ENTITY RECORDS------------------------------------ */
export function getEntityRcrds(...args) {
    return callCoreState(get, 'getEntityRcrds', args);
}
export function getRcrd(...args) {
    return callCoreState(get, 'getRcrd', args);
}
/* --------------------- STATE PREDICATES ----------------------------------- */
export function isEditForm(...args) {
    return callCoreState(get, 'isEditForm', args);
}
/* ========================= GET FORM STATE ================================= */
export function getFormState(...args) {
    return callFormState(get, 'getFormState', args);
}
export function getFormEntity(...args) {
    return callFormState(get, 'getFormEntity', args);
}
/* -------------------------- FIELDS ---------------------------------------- */
export function getFieldState(...args) {
    return callFormState(get, 'getFieldState', args);
}
export function getComboFields(...args) {
    return callFormState(get, 'getComboFields', args);
}
export function getFieldValues(...args) {
    return callFormState(get, 'getFieldValues', args);
}
/* --------------------- STATE PREDICATES ----------------------------------- */
/** [isFieldShown description] */
export function isFieldShown(...args) {
    return callFormState(get, 'isFieldShown', args);
}
export function areFieldsShown(...args) {
    return callFormState(get, 'areFieldsShown', args);
}
/* +++++++++ SETTERS ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
/* ======================= SET CORE STATE =================================== */
export function setStateProp(...args) {
    return callCoreState(set, 'setStateProp', args);
}
export function setEntityRecords(...args) {
    return callCoreState(set, 'setEntityRecords', args);
}
/* ======================= SET FORM STATE =================================== */
export function setFormState(...args) {
    return callFormState(set, 'setFormState', args);
}
export function setFieldState(...args) {
    return callFormState(set, 'setFieldState', args);
}
/* ---------------------------- TAXON --------------------------------------- */
export function updateTaxonGroupState(fLvl, vals) {
    const fState = fS.forms[fLvl];
    fState.vals = vals;
    set.setTaxonGroupState(fS.records, fState);
    _confg('buildViewConfg', [fState]);
}
export function setTaxonGroupState(rcrds, fState) {
    set.setTaxonGroupState(rcrds, fState);
}