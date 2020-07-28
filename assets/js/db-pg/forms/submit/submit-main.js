/**
 * Handles form-data formatting, validation, submit, and onSubmitSuccess.
 *
 * EXPORTS
 *     _validation
 *     getFormValData
 *     valAndSubmitFormData
 *
 * TOC
 *     VALIDATE DATA
 *     SUBMIT FORM
 *         ON SUBMIT SUCCESS
 *             TOP-FORM
 *             SUB-ENTITY
 */
import { executeMethod, _db, _u } from '../../db-main.js';
import { _state, _elems, _confg, clearFormMemory } from '../forms-main.js';
import * as val from './validation.js';
import formatDataForServer from './format-data.js';
import getValidatedFormData from './get-form-data.js';

export function _validation(funcName, params = []) {
    return executeMethod(funcName, val, 'val', 'submit-main', params);
}
/** ----------------------- VALIDATE DATA ----------------------------------- */
export function getFormValData(entity, fLvl, submitting) {
    return getValidatedFormData(entity, fLvl, submitting);
}
export function valAndSubmitFormData(formId, fLvl, entity) {                    //console.log("       --getFormValuesAndSubmit. formId = %s, fLvl = %s, entity = %s", formId, fLvl, entity);
    getValidatedFormData(entity, fLvl, true)
        .then(vals => buildFormDataAndSubmit(entity, fLvl, vals));
}
/* used by edit-form */
export function buildFormDataAndSubmit(entity, fLvl, formVals) {
    const data = formatDataForServer(entity, fLvl, formVals)
    submitFormData(data, fLvl, entity);
}
/* ------------------------- SUBMIT FORM ------------------------------------ */
function submitFormData(data, fLvl, entity) {                                   console.log("   --submit[%s]FormData [ %s ]= %O", entity, fLvl, data);
    const coreEntity = _confg('getCoreFormEntity', [entity]);
    const url = getEntityAjaxUrl(_state('getFormProp', [fLvl, 'action']));
    addEntityDataToFormData(data, coreEntity);
    storeParamsData(coreEntity, fLvl);
    _elems('toggleWaitOverlay', [true]);
    _u('sendAjaxQuery', [data, url, onSuccess, val.formSubmitError]);
}
function getEntityAjaxUrl(action) {
    const path = $('body').data('base-url');
    return path + 'crud/entity/' + action;
}
function addEntityDataToFormData(data, coreEntity) {
    const editingId = _state('getStateProp', ['editing']);
    if (editingId) { data.ids = editingId; }
    data.coreEntity = coreEntity;
}
/** Stores data relevant to the form submission that will be used later. */
function storeParamsData(entity, fLvl) {
    _state('setStateProp', ['submit', { fLvl: fLvl, entity: entity }]);
}
/* ----------------- ON SUBMIT SUCCESS ---------------------------- */
function onSuccess(data, textStatus, jqXHR) {                                   _u('logAjaxData', [data, arguments]);
    _db('updateLocalDb', [data.results])
    .then(onDataSynced);
}
function onDataSynced(data) {                                                   console.log('       --onDataSynced.');
    if (!_state('getStateProp', ['submit'])) { return; } //form closed.
    _elems('toggleWaitOverlay', [false]);
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
    return _u('getData', [entity]).then(addDataToMemory);

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
    } else { _elems('exitFormPopup'); }
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