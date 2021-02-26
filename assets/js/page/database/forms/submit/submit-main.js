/**
 * Handles form-data formatting, validation, submit, and onSubmitSuccess.
 *
 * Export
 *     _validation
 *     getValidatedFormData
 *     valAndSubmitFormData
 *
 * TOC
 *     VALIDATE DATA
 *     SUBMIT FORM
 *         ON SUBMIT SUCCESS
 *             TOP-FORM
 *             SUB-ENTITY
 */
import { _db, _el, _u, executeMethod } from '~util';
import { _state, _elems, clearFormMemory } from '~form';
import * as val from './validation-alerts.js';
import * as prep from './data/submit-data-main.js';

export function _validation(funcName, params = []) {
    return executeMethod(funcName, val, 'val', 'submit-main', params);
}
/** ----------------------- DATA PREPARATION -------------------------------- */
export function getValidatedFormData(entity, fLvl, submitting) {    /*dbug-log*/console.log(' !!!!!!!!!!!!!  getValidatedFormData')
    // return handleFormSubmit(entity, fLvl);
}
/* used by edit-form */
export function handleFormSubmit(fLvl) {
    $(`#${fLvl}-submit`).attr('disabled', true).fadeTo('fast', .6);
    const confg = _state('getFormState', [fLvl]);
    prep.prepareDataForServer(confg)
    .then(data => submitFormData(data, fLvl, confg))
    .then(() => _state('setFormProp', [fLvl, 'submit', true]));
}
function addEntityDataToFormData(data, confg) {
    addEntityNames(confg.core);
    if (confg.group !== 'top') { return; }
    const editingIds = _state('getStateProp', ['editing']);
    if (editingIds) { data.ids = editingIds; }

    function addEntityNames(core) {
        data.coreEntity = core ? core : confg.name;
        if (core) { data.detailEntity =  confg.name; }
    }
}
/* ------------------------- SUBMIT FORM ------------------------------------ */
function submitFormData(data, fLvl, action) {                       /*dbug-log*/console.log("   --submitFormData [%s] data[%O] confg[%O]", fLvl, data, confg);
    addEntityDataToFormData(data);
    toggleWaitOverlay(true);
    submitForm(data, fLvl, action);
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
    _db('afterServerDataUpdateSyncLocalDatabase', [data.results])
    .then(data => onDataSynced(fLvl, data));
}
function onDataSynced(fLvl, data) {                                             console.log('       --onDataSynced.');
    if (!_state('getFormState', [fLvl, 'submit'])) { return; } //form closed.
    toggleWaitOverlay(false);
    if (data.fails) { return val.errUpdatingData('dataSyncFailures'); }
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
    _elems('showSuccessMsg', ['No changes detected.', 'red']);
}
/** Updates the core records in the global form params object. */
function addDataToStoredRcrds(entity, detailEntity) {                           //console.log('updateStoredFormParams. [%s] (detail ? [%s])', entity, detailEntity);
    return _db('getData', [entity]).then(addDataToMemory);

    function addDataToMemory(data) {
        _state('addEntityRecords', [entity, data]);
        if (detailEntity) { return addDataToStoredRcrds(detailEntity); } //Source & Location's detail entities: publications, citations, authors, geojson
    }
}
/*----------- Top-Form Success Methods ------------*/
function handleFormComplete(fLvl, data) {                                       console.log('handleFormComplete fLvl = ', fLvl);
    if (fLvl !== 'top') { return exitFormAndSelectNewEntity(data, fLvl); }
    const onClose = _state('getFormState', ['top', 'onFormClose']);              console.log('onClose = %O', onClose);
    if (onClose) { onClose(data);
    } else { _elems('exitRootForm'); }
}
/* ---------- After Sub-Entity Created ------------ */
/**
 * Exits the successfully submitted form @exitForm. Adds and selects the new
 * entity in the form's parent elem @addAndSelectEntity.
 */
function exitFormAndSelectNewEntity(data, fLvl) {                               console.log('           --exitFormAndSelectNewEntity.');
    const formParent = _state('getFormParentId', [fLvl]);
    _elems('exitSubForm', [fLvl]);
    if (formParent) { addAndSelectEntity(data, formParent);
    } else { clearFormMemory(); }
}
/** Adds and option for the new entity to the form's parent elem, and selects it. */
function addAndSelectEntity(data, formParent) {
    const selApi = $(formParent)[0].selectize;
    selApi.addOption({
        'value': data.coreEntity.id, 'text': data.coreEntity.displayName
    });
    selApi.addItem(data.coreEntity.id);
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