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
import { _state, _elems, _confg, clearFormMemory } from '~form';
import * as val from './validation-alerts.js';
import * as prep from './data/submit-data-main.js';

export function _validation(funcName, params = []) {
    return executeMethod(funcName, val, 'val', 'submit-main', params);
}
/** ----------------------- VALIDATE DATA ----------------------------------- */
export function getValidatedFormData(entity, fLvl, submitting) { /*dbug-log*/console.log(' !!!!!!!!!!!!!  getValidatedFormData')
    // return handleFormSubmit(entity, fLvl);
}
/* used by edit-form */
export function handleFormSubmit(fLvl) {
    $(`#${fLvl}-submit`).attr('disabled', true).fadeTo('fast', .6);
    const confg = _state('getFormConfg', [fLvl]);
    prep.prepareDataForServer(confg)
    .then(data => submitFormData(data, fLvl, confg));
}
/* ------------------------- SUBMIT FORM ------------------------------------ */
function submitFormData(data, fLvl, confg) {                                   console.log("   --submitFormData [%s] data[%O] confg[%O]", fLvl, data, confg);
    const url = 'crud/entity/' + _state('getFormProp', [fLvl, 'action']);
    addEntityDataToFormData(data, confg);
    storeParamsData(data);
    toggleWaitOverlay(true);
    _u('sendAjaxQuery', [data, url, onSuccess, val.formSubmitError]);           _u('logInProdEnv', ['data = ', JSON.stringify(data)]);
}
function formSubmitError() {
    toggleWaitOverlay(false);
    val.formSubmitError(...arguments);
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
/**
 * Stores data relevant to the form submission that will be used later.
 * TODO: REFACTOR
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function storeParamsData(data) {
    const params = {
        detailEntity: data.detailEntity ? data.detailEntity : false,
        entity: data.coreEntity,
        fLvl: data.group
    };
    _state('setStateProp', ['submit', data]);
}
/* ----------------- ON SUBMIT SUCCESS ---------------------------- */
function onSuccess(data, textStatus, jqXHR) {                                   _u('logAjaxData', [data, arguments]);
    _db('afterServerDataUpdateSyncLocalDatabase', [data.results])
    .then(onDataSynced);
}
function onDataSynced(data) {                                                   console.log('       --onDataSynced.');
    if (!_state('getStateProp', ['submit'])) { return; } //form closed.
    toggleWaitOverlay(false);
    if (data.fails) { return val.errUpdatingData('dataSyncFailures'); }
    if (noDataChanges()) { return showNoChangesMessage(); }
    addDataToStoredRcrds(data.core, data.detail)
    .then(handleFormComplete.bind(null, data));

    function noDataChanges() {
        const fLvl = _state('getStateProp', ['submit']).fLvl;
        const action = _state('getFormProp', [fLvl, 'action'])
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
function handleFormComplete(data) {
    const fLvl = _state('getStateProp', ['submit']).fLvl;              //console.log('handleFormComplete fLvl = ', fLvl);
    if (fLvl !== 'top') { return exitFormAndSelectNewEntity(data, fLvl); }
    const onClose = _state('getFormProp', ['top', 'onFormClose']);             //console.log('onClose = %O', onClose);
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