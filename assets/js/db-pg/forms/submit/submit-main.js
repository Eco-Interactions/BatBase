/**
 * Handles form-data formatting, validation, submit, and onSubmitSuccess.
 *
 * EXPORTS:
 *     getFormValuesAndSubmit
 *     buildFormDataAndSubmit
 * 
 */
import * as _f from '../forms-main.js';
import * as _val from './validation.js';
import formatDataForServer from './format-data.js';
import getValidatedFormData from './get-form-data.js';

export function validation(funcName, params = []) {
    return _val[funcName](...params);
}
/** ----------- Data manipulation --------------------- */
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
/*---------------------- Form Submit Methods ---------------------------------*/
function submitFormData(data, fLvl, entity) {                                   console.log("   --submit[%s]FormData [ %s ]= %O", entity, fLvl, data);
    const coreEntity = _f.confg('getCoreFormEntity', [entity]);        
    const url = getEntityAjaxUrl(_f.state('getFormProp', [fLvl, 'action']));   
    addEntityDataToFormData(data, coreEntity);
    storeParamsData(coreEntity, fLvl);
    _f.elems('toggleWaitOverlay', [true]); 
    _f.util('sendAjaxQuery', [data, url, onSuccess, _val.formSubmitError]);
}
function getEntityAjaxUrl(action) { 
    const path = $('body').data('base-url');  
    return path + 'crud/entity/' + action;
}
function addEntityDataToFormData(data, coreEntity) {  
    const editingId = _f.state('getStateProp', ['editing']);  
    if (editingId) { data.ids = editingId; } 
    data.coreEntity = coreEntity;  
}
/** Stores data relevant to the form submission that will be used later. */
function storeParamsData(entity, fLvl) { 
    _f.state('setStateProp', ['submit', { fLvl: fLvl, entity: entity }]);
}
/* ----------------- Form Submit Success Methods ---------------------------- */
function onSuccess(data, textStatus, jqXHR) {                                   _f.util('logAjaxData', [data, arguments]);
    _f.updateLocalDb(data.results)
    .then(onDataSynced);
}
function onDataSynced(data) {                                                   console.log('       --onDataSynced.');
    _f.elems('toggleWaitOverlay', [false]);
    if (data.fails) { return _val.errUpdatingData('dataSyncFailures'); }
    if (noDataChanges()) { return showNoChangesMessage(); }  
    addDataToStoredRcrds(data.core, data.detail)
    .then(handleFormComplete.bind(null, data));

    function noDataChanges() {
        const fLvl = _f.state('getStateProp', ['submit']).fLvl;
        const action = _f.state('getFormProp', [fLvl, 'action'])
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
    _f.elems('showSuccessMsg', ['No changes detected.', 'red']); 
}
/** Updates the core records in the global form params object. */
function addDataToStoredRcrds(entity, detailEntity) {                           //console.log('updateStoredFormParams. [%s] (detail ? [%s]) fP = %O', entity, detailEntity, fP);
    return _f.util('getData', [entity]).then(addDataToMemory);

    function addDataToMemory(data) {
        const rcrds = _f.state('addEntityRecords', [entity, data]);
        if (detailEntity) { return addDataToStoredRcrds(detailEntity); } //Source & Location's detail entities: publications, citations, authors, geojson
    }
}
/*------------------ Top-Form Success Methods --------------------*/
function handleFormComplete(data) {   
    const fLvl = _f.state('getStateProp', ['submit']).fLvl;              //console.log('handleFormComplete fLvl = ', fLvl);
    if (fLvl !== 'top') { return exitFormAndSelectNewEntity(data, fLvl); }
    const onClose = _f.state('getFormProp', ['top', 'onFormClose']);             //console.log('onClose = %O', onClose);
    if (onClose) { onClose(data); 
    } else { _f.exitFormWindow() }
}
/*--------------------- After Sub-Entity Created -----------------------------*/
/**
 * Exits the successfully submitted form @exitForm. Adds and selects the new 
 * entity in the form's parent elem @addAndSelectEntity.
 */
function exitFormAndSelectNewEntity(data, fLvl) {                               console.log('           --exitFormAndSelectNewEntity.');
    const formParent = _f.state('getFormParentId', [fLvl]);         
    _f.elems('exitSubForm', [fLvl]); 
    if (formParent) { addAndSelectEntity(data, formParent); 
    } else { _f.clearFormMemory(); }
}
/** Adds and option for the new entity to the form's parent elem, and selects it. */
function addAndSelectEntity(data, formParent) {
    const selApi = $(formParent)[0].selectize;        
    selApi.addOption({ 
        'value': data.coreEntity.id, 'text': data.coreEntity.displayName 
    });
    selApi.addItem(data.coreEntity.id);
}