/**
 *
 *
 * Exports:
 *     initCreateForm
 * 
 */
import * as _forms from '../forms-main.js';


const _errs = _forms.err;
const _ui = _forms.ui;
const _cmbx = _forms.uiCombos;
const _elems = _forms.uiElems;
const _mmry = _forms.memory;
const _u = _forms._util;
const _map = _forms.map;


export function getComboboxEvents() {
    return {
        'Country': { change: focusParentAndShowChildLocs.bind(null, 'create') }
    };
}
/** Inits the location form and disables the country/region combobox. */
export function initCreateForm(val) {                                              console.log("       --initLocForm [%s]", val);
    const fLvl = _forms.getSubFormLvl('sub');
    if ($('#'+fLvl+'-form').length !== 0) { 
        return _errs('openSubFormErr', ['Location', null, fLvl]); 
    }
    if ($('#loc-map').length !== 0) { $('#loc-map').remove(); }
    buildLocForm(val, fLvl)
    .then(onLocFormLoadComplete);
}
function buildLocForm(val, fLvl) {    
    const vals = { 'DisplayName': val === 'create' ? '' : val, //clears form trigger value
        'Country': $('#Country-Region-sel').val() 
    }; 
    _mmry('initEntityFormMemory', ['location', fLvl, '#Location-sel', 'create']);
    _mmry('setonFormCloseHandler', [fLvl, _forms.enableCountryRegionField]);
    return _elems('initSubForm', [fLvl, 'med-sub-form', vals, '#Location-sel'])
        .then(appendLocFormAndFinishBuild);

    function appendLocFormAndFinishBuild(form) {
        $('#Location_row')[0].parentNode.after(form);
        _cmbx('initFormCombos', ['location', 'sub', getComboboxEvents()]);
        _cmbx('enableCombobox', ['#Country-Region-sel', false]);
        $('#Latitude_row input').focus();
        $('#sub-submit').val('Create without GPS data');
        _ui('setCoreRowStyles', ['#location_Rows', '.sub-row']);
        enableSubmitBttnIfRequiredFieldsFilled(vals);
    }
    function enableSubmitBttnIfRequiredFieldsFilled(vals) {
        if (!vals.DisplayName || !vals.Country) { return; }
        _ui('toggleSubmitBttn', ['#'+fLvl+'-submit']); 
    }
}
function onLocFormLoadComplete() {
    const fLvl = _forms.getSubFormLvl("sub");
    disableTopFormLocNote();
    addMapToLocForm('#location_Rows', 'create');
    addNotesToForm();
    addListenerToGpsFields();
    scrollToLocFormWindow();
}
function disableTopFormLocNote() {
    $('#loc-note').fadeTo(400, .3);
}
function scrollToLocFormWindow() {
    $('#form-main')[0].scrollTo(0, 150); 
}
function addNotesToForm() {
    addHowToCreateWithGpsNote($('#Latitude_row')[0].parentNode);
    addHowToCreateWithOutGpsNote($('#DisplayName_row')[0].parentNode);
}
function addHowToCreateWithGpsNote(pElem) {
    $(pElem).before(getHowToCreateLocWithGpsDataNote());
}
function getHowToCreateLocWithGpsDataNote(argument) {
    return `<p class="loc-gps-note skipFormData" style="margin-top: 5px;">GPS 
        data? Enter all data and see the added green pin's popup for name 
        suggestions and the "Create" button.</p>`;
}
function addHowToCreateWithOutGpsNote(pElem) {
    $(pElem).before(getHowToCreateLocWithoutGpsDataNote());
}
function getHowToCreateLocWithoutGpsDataNote() {
    return `<p class="loc-gps-note skipFormData">No GPS data? Fill 
        in available data and click "Create without GPS data" at the bottom of 
        the form.</p>`;
}
export function addListenerToGpsFields(params = [true]) {
    $('#Latitude_row input, #Longitude_row input').change(toggleNoGpsSubmitBttn);
    
    function toggleNoGpsSubmitBttn() {
        const hasGps = ['Lat', 'Long'].find(l => $('#'+l+'itude_row input').val());  
        _ui('toggleSubmitBttn', ['#sub-submit', !hasGps]);
        _map('addVolatileMapPin', params);
    }
}
/**
 * New locations with GPS data are created by clicking a "Create Location" button
 * in a the new location's green map pin's popup on the map in the form.
 */
export function addNewLocation() {
    const fLvl = _forms.getSubFormLvl('sub');
    if (_elems('ifAllRequiredFieldsFilled', [fLvl])) {
        _forms.submitForm('#'+fLvl+'-form',  fLvl, 'location');
    } else { showFillAllLocFieldsError(fLvl); }
}
function showFillAllLocFieldsError(fLvl) {
    _errs('reportFormFieldErr', ['Display Name', 'needsLocData', fLvl]);
}
export function locCoordErr(field) {
    const fLvl = _forms.getSubFormLvl('sub');
    _errs('reportFormFieldErr', [field, 'invalidCoords', fLvl]);
}
/*--------------- Map methods ---------------------------*/
export function addMapToLocForm(elemId, type) {                                        console.log('           --addMapToLocForm');
    const map = _u('buildElem', ['div', { id: 'loc-map', class: 'skipFormData' }]); 
    $(elemId).after(map);
    initLocFormMap(type);
}
function initLocFormMap(type) {
    const prntId = $('#Country-Region-sel').val() || $('#Country-sel').val();
    const locRcrds = _mmry('getEntityRcrds', ['location'])
    _map('initFormMap', [prntId, locRcrds, type]);
}
export function focusParentAndShowChildLocs(type, val) {                               
    if (!val) { return; }                                                       console.log('           --focusParentAndShowChildLocs [%s] [%s]', type, val);
    const locRcrds = _mmry('getEntityRcrds', ['location'])
    _map('initFormMap', [val, locRcrds, type]);
}

/** ================== EDIT FORM CODE ======================================= */
export function finishLocEditFormBuild() {  
    _cmbx('initFormCombos', ['Location', 'top']); 
    updateCountryChangeMethod();
    addGpsListenerToEditForm(_mmry('getEditEntityId', ['core']))
    $('.all-fields-cntnr').hide();
}
function updateCountryChangeMethod() {
    $('#Country-sel')[0].selectize.off('change');
    $('#Country-sel')[0].selectize.on('change', 
        focusParentAndShowChildLocs.bind(null, 'edit'));
}
function addGpsListenerToEditForm(id) {
    addListenerToGpsFields([id, 'edit', false]);
}
export function addMapToLocationEditForm(id) {
    addMapToLocForm('#location_Rows', 'edit');
    finishLocFormAfterMapLoad(id);
}
function finishLocFormAfterMapLoad(id) {
    if ($('#loc-map').data('loaded')) {
        _ui('setCoreRowStyles', ['#form-main', '.top-row']);
        db_map('addVolatileMapPin', [id, 'edit', _cmbx.getSelVal('#Country-sel')]);
    } else {
        window.setTimeout(() => finishLocFormAfterMapLoad(id), 500);
    }
}