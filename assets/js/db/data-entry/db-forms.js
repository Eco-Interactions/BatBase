/*
 * When logged in as an 'admin' or 'super': 
 * >> On the database search page, multiple admin-ui elements are added that open 
 * a popup interface allowing the creating, updating and, soon, deleting of data.   
 * >> All Content Blocks will have an edit icon attached to the top left of their 
 * container. When clicked, a wysiwyg interface will encapsulate that block and 
 * allow editing and saving of the content within using the trumbowyg library.
 * 
 * Exports:             Imported by:
 */
import * as _u from '../util.js';
// import * as _elems from './forms/ui/form-elems.js';
import * as _forms from './forms/forms-main.js';
import * as db_sync from '../db-sync.js';
import * as db_page from '../db-page.js';
import * as db_map from '../db-map/map-main.js';
import * as idb from 'idb-keyval'; //set, get, del, clear
import * as _errs from './forms/validation/form-errors.js';
import * as _cmbx from './forms/ui/combobox-util.js';
import * as _fCnfg from './forms/etc/form-config.js';
import { showEntityEditForm } from './forms/edit/edit-forms.js';
import { getFormValueData } from './forms/validation/get-form-data.js';
import { formatDataForServer } from './forms/validation/validate-data.js';
import { buildCitationText } from './forms/features/generate-citation.js';

let fP = {};

const _elems = _forms.uiElems;

export function loadDataTable(focus) {
    db_page.initDataTable(focus);
}
export function create(entity) {
    _forms.create(entity);
}
/* ================== FORM "STATE" ========================================= */
export function clearFormMemory() {
    fP = {};
}
export function getFormParams() {
    return fP;
}
/*------------------- Form Functions -------------------------------------------------------------*/
// /*--------------------------- Edit Form --------------------------------------*/
// /** Shows the entity's edit form in a pop-up window on the search page. */
export function editEntity(id, entity) {                                        console.log("   //editEntity [%s] [%s]", entity, id);  
    _forms.initFormMemory("edit", entity, id)
    .then(() => showEntityEditForm(id, entity, fP));
}   
/*--------------------------- Create Form --------------------------------------------------------*/
/*------------------- Interaction Form Methods (Shared) ----------------------*/ 

/*-------------- Form Builders -------------------------------------------------------------------*/

/*-------------- Country/Region ------------------------------------------*/

/*-------------- Location ------------------------------------------------*/
/** ----------------------- Params ------------------------------------- */

/*-------------- Sub Form Helpers ----------------------------------------------------------*/
/*-------------- Publisher -----------------------------------------------*/
/*------------------- Shared Form Builders ---------------------------------------------------*/
/*--------------- Shared Form Methods -------------------------------*/
export function getFormValuesAndSubmit(formId, fLvl, entity) {                             console.log("       --getFormValuesAndSubmit. formId = %s, fLvl = %s, entity = %s", formId, fLvl, entity);
    getFormValueData(fP, entity, fLvl, true)
        .then(buildFormDataAndSubmit.bind(null, entity, fLvl))
        .catch(() => {}); //Err caught in validation process and handled elsewhere.
}
export  function buildFormDataAndSubmit(entity, fLvl, formVals) {
    const data = formatDataForServer(fP, fLvl, formVals)
    submitFormData(data, fLvl, entity);
}
/*------------------ Form Submit Methods ---------------------------------*/
/** Sends the passed form data object via ajax to the appropriate controller. */
export function submitFormData(formData, fLvl, entity) {                               console.log("   --submitFormData [ %s ]= %O", fLvl, formData);
    var coreEntity = _fCnfg.getCoreFormEntity(entity);       
    var url = getEntityUrl(fP.forms[fLvl].action);
    if (fP.editing) { formData.ids = fP.editing; }
    formData.coreEntity = coreEntity;
    storeParamsData(coreEntity, fLvl);
    toggleWaitOverlay(true);
    _u.sendAjaxQuery(formData, url, formSubmitSucess, _errs.formSubmitError);
}
/** Stores data relevant to the form submission that will be used later. */
function storeParamsData(entity, fLvl) {                                 
    var focuses = { 'source': 'srcs', 'location': 'locs', 'taxon': 'taxa', 
        'interaction': 'int' };
    fP.ajaxFormLvl = fLvl;
    fP.submitFocus = focuses[entity];
}
/** Returns the full url for the passed entity and action.  */
function getEntityUrl(action) {
    var envUrl = $('body').data("ajax-target-url");
    return envUrl + "crud/entity/" + action;
}
/*------------------ Form Success Methods --------------------------------*/
/**
 * Ajax success callback. Updates the stored data @db_sync.updateLocalDb and 
 * the stored core records in the fP object. Exit's the successfully submitted 
 * form @exitFormAndSelectNewEntity.  
 */
function formSubmitSucess(data, textStatus, jqXHR) {                            console.log("       --Ajax Success! data = %O, textStatus = %s, jqXHR = %O", data, textStatus, jqXHR);                   
    db_sync.updateLocalDb(data.results).then(onDataSynced);
}
function onDataSynced(data) {                                                   console.log('       --Data update complete. data = %O', data);
    toggleWaitOverlay(false);
    if (data.errors) { return _errs.errUpdatingData(data.errors); }
    if (noDataChanges()) { return showNoChangesMessage(); }  
    addDataToStoredRcrds(data.core, data.detail)
    .then(handleFormComplete.bind(null, data));

    function noDataChanges() {
        return fP.forms[fP.ajaxFormLvl].action === 'edit'  && !hasChngs(data);
    }
}
function showNoChangesMessage() {
    _forms.ui('showSuccessMsg', ['No changes detected.', 'red']); 
}
/** Updates the core records in the global form params object. */
function addDataToStoredRcrds(entity, detailEntity) {                           //console.log('updateStoredFormParams. [%s] (detail ? [%s]) fP = %O', entity, detailEntity, fP);
    return _u.getData(entity).then(newData => {
        fP.records[entity] = newData;
        if (detailEntity) { return addDataToStoredRcrds(detailEntity); } //Source & Location's detail entities: publications, citations, authors, geojson
    });
}
/*------------------ Top-Form Success Methods --------------------*/
function handleFormComplete(data) {   
    var fLvl = fP.ajaxFormLvl;                                                  //console.log('handleFormComplete fLvl = ', fLvl);
    if (fLvl !== 'top') { return exitFormAndSelectNewEntity(data); }
    fP.forms.top.onFormClose(data);
}
/** 
 * Returns true if there have been user-made changes to the entity. 
 * Note: The location elevUnitAbbrv is updated automatically for locations with
 * elevation data, and is ignored here. 
 */
function hasChngs(data) {   
    const chngs = Object.keys(data.coreEdits).length > 0 || 
        Object.keys(data.detailEdits).length > 0;
    if (chngs && data.core == 'location' && 
        Object.keys(data.coreEdits).length == 2 && 
        'elevUnitAbbrv' in data.coreEdits) { return false; }
    return chngs;
}

/** map-main */
export function locCoordErr() {
    return _forms.locCoordErr(...arguments);
}