/**
 * Handles form-data formatting, validation, submit, and onSubmitSuccess.
 *
 * EXPORTS:
 *     getFormValuesAndSubmit
 *     buildFormDataAndSubmit
 * 
 */
import * as _forms from '../forms-main.js';
import getValidatedFormData from './get-form-data.js';
import formatDataForServer from './format-data.js';
import * as _errs from './form-errors.js';

const _mmry = _forms.memory;
const _u = _forms._util;
const _ui = _forms.ui;

export function err(funcName, params = []) {
    return _errs[funcName](...params);
}
/** ----------- Data manipulation --------------------- */
export function getFormData() {
    return getValidatedFormData();
}
export function valAndSubmitFormData(formId, fLvl, entity) {                             console.log("       --getFormValuesAndSubmit. formId = %s, fLvl = %s, entity = %s", formId, fLvl, entity);
    getValidatedFormData(entity, fLvl, true)
        .then(buildFormDataAndSubmit.bind(null, entity, fLvl))
}
/* used by edit-form */
export function buildFormDataAndSubmit(entity, fLvl, formVals) {
    const data = formatDataForServer(entity, fLvl, formVals)
    submitFormData(data, fLvl, entity);
}
/*---------------------- Form Submit Methods ---------------------------------*/
function submitFormData(data, fLvl, entity) {                                   console.log("   --submitFormData [ %s ]= %O", fLvl, data);
    const coreEntity = _forms.confg('getCoreFormEntity', [entity]);        
    const url = getEntityAjaxUrl(fLvl);   
    addEntityDataToFormData(data, coreEntity);
    storeParamsData(coreEntity, fLvl);
    _ui('toggleWaitOverlay', [true]); 
    _u('sendAjaxQuery', [data, url, onSuccess, _errs.formSubmitError]);
}
function getEntityAjaxUrl(fLvl) { 
    const path = $('body').data('ajax-target-url');  
    const action = _mmry('getFormProp', ['action', fLvl]);  
    return path + 'crud/entity/' + action;
}
function addEntityDataToFormData(data, coreEntity) {  
    const editingId = _mmry('getMemoryProp', ['editing']);  
    if (editingId) { data.ids = editingId; } 
    data.coreEntity = coreEntity;  
}
/** Stores data relevant to the form submission that will be used later. */
function storeParamsData(entity, fLvl) {                                  
    const foci = { 'source': 'srcs', 'location': 'locs', 'taxon': 'taxa', 
        'interaction': 'int' };
    const props = { ajaxFormLvl: fLvl, submitFocus: foci[entity] };
    _mmry('addFormSubmitProps', [props]);
}
/* ----------------- Form Submit Success Methods ---------------------------- */
function onSuccess(data, textStatus, jqXHR) {                            console.log("       --Ajax Success! data = %O, textStatus = %s, jqXHR = %O", data, textStatus, jqXHR);                   
    _forms.updateLocalDataStorage(data.results)
    .then(onDataSynced);
}
function onDataSynced(data) {                                                   console.log('       --Data update complete. data = %O', data);
    _ui('toggleWaitOverlay', [false]);
    if (data.errors) { return _errs('errUpdatingData', [data.errors]); }
    if (noDataChanges()) { return showNoChangesMessage(); }  
    addDataToStoredRcrds(data.core, data.detail)
    .then(handleFormComplete.bind(null, data));

    function noDataChanges() {
        const fLvl = _mmry('getMemoryProp', ['submit']).ajaxFormLvl;
        const action = _mmry('getFormProp', ['action', fLvl])
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
    _ui('showSuccessMsg', ['No changes detected.', 'red']); 
}
/** Updates the core records in the global form params object. */
function addDataToStoredRcrds(entity, detailEntity) {                           //console.log('updateStoredFormParams. [%s] (detail ? [%s]) fP = %O', entity, detailEntity, fP);
    return _u('getData', [entity]).then(addDataToMemory);

    function addDataToMemory(data) {
        const rcrds = _mmry('addEntityRecords', [entity, data]);
        if (detailEntity) { return addDataToStoredRcrds(detailEntity); } //Source & Location's detail entities: publications, citations, authors, geojson
    }
}
/*------------------ Top-Form Success Methods --------------------*/
function handleFormComplete(data) {   
    const fLvl = _mmry('getMemoryProp', ['submit']).ajaxFormLvl;                //console.log('handleFormComplete fLvl = ', fLvl);
    if (fLvl !== 'top') { return exitFormAndSelectNewEntity(data, fLvl); }
    _mmry('getFormProp', ['onFormClose', 'top'])(data);
}
/*--------------------- After Sub-Entity Created -----------------------------*/
/**
 * Exits the successfully submitted form @exitForm. Adds and selects the new 
 * entity in the form's parent elem @addAndSelectEntity.
 */
function exitFormAndSelectNewEntity(data, fLvl) {                                     console.log('           --exitFormAndSelectNewEntity. data = %O', data);
    const formParent = _mmry('getFormParentId', [fLvl]);         
    _forms.exitFormLevel(fLvl); 
    if (formParent) { addAndSelectEntity(data, formParent); 
    } else { _mmry('clearMemory'); }
}
/** Adds and option for the new entity to the form's parent elem, and selects it. */
function addAndSelectEntity(data, formParent) {
    const selApi = $(formParent)[0].selectize;        
    selApi.addOption({ 
        'value': data.coreEntity.id, 'text': data.coreEntity.displayName 
    });
    selApi.addItem(data.coreEntity.id);
}