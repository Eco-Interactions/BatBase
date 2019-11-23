/*
 * When logged in as an 'admin' or 'super': 
 * >> On the database search page, multiple admin-ui elements are added that open 
 * a popup interface allowing the creating, updating and, soon, deleting of data.   
 * >> All Content Blocks will have an edit icon attached to the top left of their 
 * container. When clicked, a wysiwyg interface will encapsulate that block and 
 * allow editing and saving of the content within using the trumbowyg library.
 * 
 * Exports:             Imported by:
 *     addNewLocation
 *     clearForMemory          form-ui
 *     editEntity
 *     initLocForm
 *     initNewDataForm          db-ui
 *     mergeLocs
 *     selectLoc
 *     locCoordErr
 *
 *     getFormParams            f-errs, 
 *     getFormValuesAndSubmit
 *     ifParentFormValidEnableSubmit
 *     buildIntFormFields
 *     getRcrd                  edit-forms, generate-citation, form-elems
 *     getSrcTypeRows           edit-forms
 *     loadSrcTypeFields        ""
 *     fieldIsDisplayed         ""
 *     selectExistingAuthors    ""
 *     addMapToLocForm          ""
 *     buildFormDataAndSubmit
 *     addListenerToGpsFields
 *     toggleSubmitBttn         edit-forms, f-errs
 *     focusParentAndShowChildLocs      edit-forms, interaction-form
 *     enableTaxonLvls          f-confg 
 *     enablePubField           f-confg
 *     submitFormData               edit-forms
 *     handleCitText                ""
 *     getSubFormLvl                ""
 *     resetIfFormWaitingOnChanges              ""
 *     disableSubmitBttn            ""
 *     enableSubmitBttn             "", [something else, didn't doc]
 *     exitForm                save-exit-bttns
 *     getFormLevelParams           generate-citation
 *     getObjectRealm               interaction-form
 *     showSuccessMsg               interaction-form
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
/** Inits the location form and disables the country/region combobox. */
export function initLocForm(val) {                                              console.log("       --initLocForm [%s]", val);
    const fLvl = getSubFormLvl("sub");
    if ($('#'+fLvl+'-form').length !== 0) { return _errs.openSubFormErr('Location', null, fLvl); }
    if ($('#loc-map').length !== 0) { $('#loc-map').remove(); }
    buildLocForm(val, fLvl)
    .then(onLocFormLoadComplete);
}
function buildLocForm(val, fLvl) {    
    const vals = {
        'DisplayName': val === 'create' ? '' : val, //clears form trigger value
        'Country': $('#Country-Region-sel').val() }; 
    return initEntitySubForm('location', fLvl, 'flex-row med-sub-form', vals, '#Location-sel')
        .then(appendLocFormAndFinishBuild);

    function appendLocFormAndFinishBuild(form) {
        $('#Location_row').after(form);
        _cmbx('initFormCombos', ['location', 'sub']);
        _cmbx('enableCombobox', ['#Country-Region-sel', false]);
        $('#Latitude_row input').focus();
        $('#sub-submit').val('Create without GPS data');
        _forms.ui('setCoreRowStyles', ['#location_Rows', '.sub-row']);
        if (vals.DisplayName && vals.Country) { enableSubmitBttn('#sub-submit'); }
    }
}
function onLocFormLoadComplete() {
    const fLvl = getSubFormLvl("sub");
    disableTopFormLocNote();
    addMapToLocForm('#location_Rows', 'create');
    addNotesToForm();
    addListenerToGpsFields();
    scrollToLocFormWindow();
    _forms.setonFormCloseHandler('location', fLvl);
}
function disableTopFormLocNote() {
    $('#loc-note').fadeTo(400, .3);
}
function scrollToLocFormWindow() {
    $('#form-main')[0].scrollTo(0, 150); 
}
function addNotesToForm() {
    $('#Latitude_row').before(getHowToCreateLocWithGpsDataNote());
    $('#DisplayName_row').before(getHowToCreateLocWithoutGpsDataNote());
}
function getHowToCreateLocWithGpsDataNote(argument) {
    return `<p class="loc-gps-note skipFormData" style="margin-top: 5px;">GPS 
        data? Enter all data and see the added green pin's popup for name 
        suggestions and the "Create" button.</p>`;
}
function getHowToCreateLocWithoutGpsDataNote() {
    return `<p class="loc-gps-note skipFormData">No GPS data? Fill 
        in available data and click "Create without GPS data" at the bottom of 
        the form.</p>`;
}
export function addListenerToGpsFields(func) {
    const method = func || db_map.addVolatileMapPin;
    $('#Latitude_row input, #Longitude_row input').change(
        toggleNoGpsSubmitBttn.bind(null, method));
}
function toggleNoGpsSubmitBttn(addMapPinFunc) {
    const lat = $('#Latitude_row input').val();  
    const lng = $('#Longitude_row input').val();  
    const toggleMethod = lat || lng ? disableSubmitBttn : enableSubmitBttn;
    toggleMethod('#sub-submit');
    addMapPinFunc(true);
}
/**
 * New locations with GPS data are created by clicking a "Create Location" button
 * in a the new location's green map pin's popup on the map in the form.
 */
export function addNewLocation() {
    const fLvl = fP.forms['location'];
    if (_elems.ifAllRequiredFieldsFilled(fLvl)) {
        getFormValuesAndSubmit('#'+fLvl+'-form',  fLvl, 'location');
    } else { showFillAllLocFieldsError(fLvl); }
}
function showFillAllLocFieldsError(fLvl) {
    _errs.reportFormFieldErr('Display Name', 'needsLocData', fLvl);
}
export function locCoordErr(field) {
    const fLvl = fP.forms['location'];
    _errs.reportFormFieldErr(field, 'invalidCoords', fLvl);
}
/*--------------- Map methods ---------------------------*/
export function addMapToLocForm(elemId, type) {                                        console.log('           --addMapToLocForm');
    const map = _u.buildElem('div', { id: 'loc-map', class: 'skipFormData' }); 
    const prntId = $('#Country-Region-sel').val() || $('#Country-sel').val();
    $(elemId).after(map);
    db_map.initFormMap(prntId, fP.records.location, type);
}
export function focusParentAndShowChildLocs(type, val) {                               
    if (!val) { return; }                                                       console.log('           --focusParentAndShowChildLocs [%s] [%s]', type, val);
    db_map.initFormMap(val, fP.records.location, type);
}
/** ----------------------- Params ------------------------------------- */

/*-------------- Sub Form Helpers ----------------------------------------------------------*/
/*-------------- Publisher -----------------------------------------------*/
function onPublSelection(val) {
    if (val === 'create') { return _forms.createSubEntity('Publisher'); }        
}
/**
 * When a user enters a new publisher into the combobox, a create-publisher
 * form is built, appended to the publisher field row and an option object is 
 * returned to be selected in the combobox. Unless there is already a sub2Form,
 * where a message will be shown telling the user to complete the open sub2 form
 * and the form init canceled.
 * Note: The publisher form inits with the submit button enabled, as display 
 *     name, aka val, is it's only required field.
 */
function initPublisherForm (value) {                                            //console.log("Adding new publisher! val = %s", val);
    const val = value === 'create' ? '' : value;
    const fLvl = getSubFormLvl('sub2');
    const prntLvl = getNextFormLevel('parent', fLvl);
    if ($('#'+fLvl+'-form').length !== 0) { return _errs.openSubFormErr('Publisher', null, fLvl); }
    initEntitySubForm('publisher', fLvl, 'sml-sub-form', {'DisplayName': val}, 
        '#Publisher-sel')
    .then(appendPublFormAndFinishBuild);

    function appendPublFormAndFinishBuild(form) {
        $('#Publisher_row').append(form);
        disableSubmitBttn('#'+prntLvl+'-submit');
        $('#DisplayName_row input').focus();
    }
}
/*-------------- Author --------------------------------------------------*/
/** Loops through author object and adds each author/editor to the form. */
export function selectExistingAuthors(field, authObj, fLvl) {       
    if (!authObj || !$('#'+field+'-sel-cntnr').length) { return Promise.resolve(); }                                 //console.log('reselectAuthors. field = [%s] auths = %O', field, authObj);
    Object.keys(authObj).reduce((p, ord) => { //p(romise), ord(er)  
        const selNextAuth = selectAuthor.bind(null, ord, authObj[ord], field, fLvl);
        return p.then(selNextAuth);
    }, Promise.resolve());
}
/** Selects the passed author and builds a new, empty author combobox. */
function selectAuthor(cnt, authId, field, fLvl) {
    if (!$('#'+field+'-sel'+ cnt).length) { return; }
    _cmbx.setSelVal('#'+field+'-sel'+ cnt, authId, 'silent');
    return buildNewAuthorSelect(++cnt, authId, fLvl, field);
}
/**
 * When an author is selected, a new author combobox is initialized underneath
 * the last author combobox, unless the last is empty. The total count of 
 * authors is added to the new id.
 */
function onAuthSelection(val, ed) {                                             //console.log("Add existing author = %s", val);
    handleAuthSelect(val);
}
function onEdSelection(val) {                                                   //console.log("Add existing author = %s", val);
    handleAuthSelect(val, 'editor');
}
function handleAuthSelect(val, ed) {                                            
    if (val === '' || parseInt(val) === NaN) { return; }
    const authType = ed ? 'Editors' : 'Authors';                                
    const fLvl = getSubFormLvl('sub');
    let cnt = $('#'+authType+'-sel-cntnr').data('cnt') + 1;                          
    if (val === 'create') { return _forms.createSubEntity(authType, --cnt); } 
    _forms.handleCitText(fLvl);       
    // if (citationFormNeedsCitTextUpdate(fLvl)) { handleCitText(fLvl); }
    if (lastAuthComboEmpty(cnt-1, authType)) { return; }
    buildNewAuthorSelect(cnt, val, fLvl, authType);
}
function citationFormNeedsCitTextUpdate(fLvl) {
    return fP.forms[fLvl].entity === 'citation' && !fP.citTimeout;
}
/** Stops the form from adding multiple empty combos to the end of the field. */
function lastAuthComboEmpty(cnt, authType) {  
    return $('#'+authType+'-sel'+cnt).val() === '';
}
/** Builds a new, empty author combobox */
function buildNewAuthorSelect(cnt, val, prntLvl, authType) {                    //console.log("buildNewAuthorSelect. cnt [%s] val [%s] type [%s]", cnt, val, authType)
    return _elems.buildMultiSelectElems(null, authType, prntLvl, cnt)
    .then(appendNewAuthSelect);

    function appendNewAuthSelect(sel) {
        $('#'+authType+'-sel-cntnr').append(sel).data('cnt', cnt);
        _cmbx.initSingle(getAuthSelConfg(authType, cnt), prntLvl);
    }
}
function getAuthSelConfg(authType, cnt) {
    return { 
        add: getAuthAddFunc(authType, cnt), change: getAuthChngFnc(authType),
        id: '#'+authType+'-sel'+cnt,        name: authType.slice(0, -1) //removes 's' for singular type
    };
}
function getAuthChngFnc(authType) {
    return authType === 'Editors' ? onEdSelection : onAuthSelection;
}
function getAuthAddFunc(authType, cnt) {
    const add = authType === 'Editors' ? initEdForm : initAuthForm;
    return add.bind(null, cnt);
}
/** Removes the already selected authors from the new dropdown options. */
// function removeAllSelectedAuths(sel, fLvl, authType) { 
//     const auths = fP.forms[fLvl].fieldConfg.vals[authType].val;   
//     const $selApi = $(sel).data('selectize');                          
//     if (auths) { auths.forEach(id => $selApi.removeOption(id)); } 
// }
function initAuthForm(selCnt, val) {                                            //console.log("Adding new auth! val = %s, e ? ", val, arguments);      
    handleNewAuthForm(selCnt, val, 'Authors');
}
function initEdForm(selCnt, val) {                                              //console.log("Adding new editor! val = %s, e ? ", val, arguments);      
    handleNewAuthForm(selCnt, val, 'Editors');
}
/**
 * When a user enters a new author (or editor) into the combobox, a create 
 * form is built and appended to the field row. An option object is returned 
 * to be selected in the combobox. If there is already an open form at
 * this level , a message will be shown telling the user to complete the open 
 * form and the form init will be canceled.
 */
function handleNewAuthForm(authCnt, value, authType) {  
    const parentSelId = '#'+authType+'-sel'+authCnt; 
    const fLvl = getSubFormLvl('sub2');
    const singular = authType.slice(0, -1);
    const val = value === 'create' ? '' : value;
    if ($('#'+fLvl+'-form').length !== 0) { return _errs.openSubFormErr(authType, parentSelId, fLvl); }
    initEntitySubForm( _u.lcfirst(singular), fLvl, 'sml-sub-form', {'LastName': val}, 
        parentSelId)
    .then(appendAuthFormAndFinishBuild);

    function appendAuthFormAndFinishBuild(form) {        
        $('#'+authType+'_row').append(form);
        handleSubmitBttns();
        $('#FirstName_row input').focus();
    }
    function handleSubmitBttns() {
        const prntLvl = getNextFormLevel('parent', fLvl);
        disableSubmitBttn('#'+prntLvl+'-submit');  
        return _elems.ifAllRequiredFieldsFilled(fLvl) ? 
            enableSubmitBttn('#'+fLvl+'-submit') : 
            disableSubmitBttn('#'+fLvl+'-submit');
    }
} /* End handleNewAuthForm */
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
