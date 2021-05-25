/**
 * Handles form-data formatting, validation, submit, and onSubmitSuccess.
 *
 * Export
 *     _validation
 *     valAndSubmitFormData
 *
 * TOC
 *     VALIDATE DATA
 *     SUBMIT FORM
 *         ON SUBMIT SUCCESS
 *             TOP-FORM
 *             SUB-ENTITY
 */
import { _cmbx, _db, _el, _u, executeMethod } from '~util';
import { _state, _elems, clearFormMemory } from '~form';
import * as val from './validation/validation-alerts.js';
import getValidatedFormData from './data/get-form-data.js';

export function _validation(funcName, params = []) {
    return executeMethod(funcName, val, 'val', 'submit-main', params);
}
/** ----------------------- DATA PREPARATION -------------------------------- */
export function handleFormSubmit(fLvl) {
    $(`#${fLvl}-submit`).attr('disabled', true).fadeTo('fast', .6);
    const confg = _state('getFormState', [fLvl]);
    getValidatedFormData(confg)
    .then(data => submitFormData(data, fLvl, confg))
    .then(() => _state('setFormState', [fLvl, 'submit', true]));
}
/* ------------------------- SUBMIT FORM ------------------------------------ */
function submitFormData(data, fLvl, confg) {                        /*dbug-log*/console.log("   --submitFormData [%s] data[%O] confg[%O]", fLvl, data, confg);
    if (data.fails) { return handleDataPrepFailure(data.fails); }
    toggleWaitOverlay(true);
    submitForm(data, fLvl, confg.action);
}
function handleDataPrepFailure(fails) {
    if (fails === 'handled') { return; }
    val.errUpdatingData('dataPrepFail', data.fails);
}
function submitForm(data, fLvl, action) {
    const url = `crud/entity/${action}`;
    const fSuccess = onSuccess.bind(null, fLvl);
    const fError = val.formSubmitError.bind(null, fLvl);
    _u('sendAjaxQuery', [data, url, fSuccess, fError]);                         _u('logInProdEnv', ['data = ', JSON.stringify(data)]);
}
function formSubmitError() {
    toggleWaitOverlay(false);
    val.formSubmitError(...arguments);
}
/* ----------------- ON SUBMIT SUCCESS ---------------------------- */
function onSuccess(fLvl, data, textStatus, jqXHR) {                             _u('logAjaxData', [data, arguments]);
    _state('setFormState', [fLvl, 'submitted', true]);
    _db('afterServerDataUpdateSyncLocalDatabase', [data.results])
    .then(data => onDataSynced(fLvl, data));
}
function onDataSynced(fLvl, data) {                                 /*temp-log*/console.log('       --onDataSynced [%s][%O]', fLvl, data);
    if (!_state('getFormState', [fLvl, 'submitted'])) { return; } //form closed.
    toggleWaitOverlay(false);
    if (data.fails) { return val.errUpdatingData('dataSyncFailures', data.fails); }
    if (noDataChanges()) { return showNoChangesMessage(); }
    addDataToStoredRcrds(data.core, data.detail)
    .then(handleFormComplete.bind(null, fLvl, data));

    function noDataChanges() {
        const action = _state('getFormState', [fLvl, 'action'])
        return action === 'edit'  && !hasChngs(data);
    }
}
/**
 * Returns true if there have been user-made changes to the entity.
 * Note: The location elevUnitAbbrv is updated automatically for locations with elevation data, and is ignored here.
 */
function hasChngs(data) {
    const chngs = Object.keys(data.coreEdits).length > 0 ||
        Object.keys(data.detailEdits).length > 0;
    if (ifLocElevUnitIsTheOnlyChange(data.core)) { return false; }
    return chngs;

    function ifLocElevUnitIsTheOnlyChange() {
        const editCnt = Object.keys(data.coreEdits).length;
        return chngs && data.core == 'location' && editCnt == 2
            && 'elevUnitAbbrv' in data.coreEdits;
    }
}
function showNoChangesMessage() {
    _elems('toggleFormStatusMsg', ['No changes detected.', 'red']);
}
/** Updates the core records in the global form params object. */
function addDataToStoredRcrds(entity, detailEntity) {               /*dbug-log*///console.log('--addDataToStoredRcrds. [%s] (detail ? [%s])', entity, detailEntity);
    return _db('getData', [_u('lcfirst', [entity])]).then(addDataToMemory);

    function addDataToMemory(data) {                                /*dbug-log*///console.log('   --addDataToMemory data[%O]', data);
        _state('setEntityRecords', [entity, data]);
        if (detailEntity) { return addDataToStoredRcrds(detailEntity); } //Source & Location's detail entities: publications, citations, authors, geojson
    }
}
/*----------- Top-Form Success Methods ------------*/
function handleFormComplete(fLvl, data) {                           /*dbug-log*///console.log('--handleFormComplete fLvl = ', fLvl);
    if (fLvl !== 'top') { return exitFormAndSelectNewEntity(data, fLvl); }
    const onClose = _state('getFormState', ['top', 'onFormClose']); /*dbug-log*///console.log('   --onClose = %O', onClose);
    if (onClose) { onClose(data);
    } else { _elems('exitRootForm'); }
}
/* ---------- After Sub-Entity Created ------------ */
/**
 * Exits the successfully submitted form @exitForm. Adds and selects the new
 * entity in the form's parent elem @addAndSelectEntity.
 */
function exitFormAndSelectNewEntity(data, fLvl) {                    /*dbug-log*///console.log('           --exitFormAndSelectNewEntity.');
    const comboField = _state('getFormState', [fLvl, 'combo']);
    _elems('exitSubForm', [fLvl]);
    if (comboField) { addAndSelectEntity(data.coreEntity, comboField);
    } else { clearFormMemory(); }
}
/** Adds and option for the new entity to the form's parent elem, and selects it. */
function addAndSelectEntity(entity, comboField) {
    const newOpt = { text: entity.displayName, value: entity.id };
    _cmbx('addOpt', [comboField, newOpt]);
    _cmbx('setSelVal', [comboField, entity.id]);
}
/* ------------------- WAIT OVERLAY ----------------------------------------- */
 function toggleWaitOverlay(waiting) {
    if (waiting) { appendWaitingOverlay();
    } else { $('#c-overlay').remove(); }
}
function appendWaitingOverlay() {
    const attr = { class: 'overlay waiting', id: 'c-overlay'}
    $('#b-overlay').append(_el('getElem', ['div', attr]));
    $('#c-overlay').css({'z-index': '1000', 'display': 'block'});
}