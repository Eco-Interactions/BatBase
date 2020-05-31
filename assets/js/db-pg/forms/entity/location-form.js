/**
 * Contains code specific to the location form.
 *
 * Exports:                     Clients:
 *     addNewLocationWithGps        map-main
 *     initCreateForm               forms-main
 *
 * CODE SECTIONS
 *     CREATE FORM
 *     EDIT FORM
 *     SHARED HELPERS
 *         FORM COMBOBOXES
 *         MAP METHODS
 */
import * as _f from '../forms-main.js';

/** ====================== CREATE FORM ====================================== */
/** Inits the location form and disables the country/region combobox. */
export function initCreateForm(entity, val) {                                   console.log("       --initLocForm [%s]", val);
    if ($('#form-map').length !== 0) { $('#form-map').remove(); }
    buildLocForm(val)
    .then(onLocFormLoadComplete);
}
function buildLocForm(val) {
    const vals = { 'DisplayName': val === 'create' ? '' : val, //clears form trigger value
        'Country': $('#Country-Region-sel').val() 
    }; 
    _f.state('addEntityFormState', ['location', 'sub', '#Location-sel', 'create']);
    _f.state('setOnFormCloseHandler', ['sub', _f.forms.bind(null, 'enableCountryRegionField')]);
    return _f.elems('initSubForm', ['sub', 'med-sub-form', vals, '#Location-sel'])
        .then(appendLocFormAndFinishBuild);

    function appendLocFormAndFinishBuild(form) {
        $('#Location_row')[0].parentNode.after(form);
        initFormCombos(null, 'sub');
        _f.cmbx('enableCombobox', ['#Country-Region-sel', false]);
        $('#sub-submit').val('Create without GPS data');
        _f.elems('setCoreRowStyles', ['#location_Rows', '.sub-row']);
        _f.elems('checkReqFieldsAndToggleSubmitBttn', ['sub']);
        $('#Latitude_row input').focus();
    }
}
function onLocFormLoadComplete() {
    disableTopFormLocNote();
    addMapToLocForm($('#location_Rows'), 'create');
    addNotesToForm();
    addListenerToGpsFields('sub');
    handleElevFieldsAndNumberInputs();
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
function handleElevFieldsAndNumberInputs() {
    $('#Elevation-lbl').text('Elevation (m)');
    $('#Elevation_row input, #ElevationMax_row input, #Latitude_row input, #Longitude_row input')
        .attr('type', 'number');

}
/**
 * New locations with GPS data are created by clicking a "Create Location" button
 * in a the new location's green map pin's popup on the map in the form.
 */
export function addNewLocationWithGps() {
    const fLvl = _f.getSubFormLvl('sub');
    if (_f.elems('ifAllRequiredFieldsFilled', [fLvl])) {
        _f.submitForm('#'+fLvl+'-form',  fLvl, 'location');
    } else { showFillAllLocFieldsError(fLvl); }
}
function showFillAllLocFieldsError(fLvl) {
    _f.val('reportFormFieldErr', ['Display Name', 'needsLocData', fLvl]);
}
function locCoordErr(field) {
    const fLvl = _f.getSubFormLvl('sub');
    _f.val('reportFormFieldErr', [field, 'invalidCoords', fLvl]);
}
/** ======================= EDIT FORM ======================================= */
export function finishEditFormBuild(entity) {  
    initFormCombos('Location', 'top'); 
    updateCountryChangeMethod();
    addGpsListenerToEditForm(_f.state('getEditEntityId', ['core']))
    $('.all-fields-cntnr').hide();
    $('#DisplayName-lbl, #ElevationMax-lbl').css('min-width', '106px');
}
function updateCountryChangeMethod() {
    $('#Country-sel')[0].selectize.off('change');
    $('#Country-sel')[0].selectize.on('change', 
        focusParentAndShowChildLocs.bind(null, 'edit'));
}
function addGpsListenerToEditForm(id) {
    addListenerToGpsFields('top', [id, 'edit', false]);
}
export function addMapToLocationEditForm(id) {
    addMapToLocForm($('#location_Rows'), 'edit');
    afterMapLoads(finishEditForm, id);
}
function finishEditForm(id) {
    $('input.leaflet-control-create-icon').click(initCreateForm);
    _f.elems('setCoreRowStyles', ['#form-main', '.top-row']);
    _f.map('addVolatileMapPin', [id, 'edit', _f.cmbx('getSelVal', ['#Country-sel'])]);
}
/** ================== SHARED HELPERS ======================================= */
function afterMapLoads(onLoadFunc, id) {  
    if ($('#form-map').data('loaded')) { 
        onLoadFunc(id);
        $('#form-map').removeData('loaded');
    } else { 
        window.setTimeout(() => afterMapLoads(onLoadFunc, id), 500); 
    }
}
/* -------------------------- FORM COMBOBOXES ------------------------------- */
export function initFormCombos(entity, fLvl) {
    const events = {
        'Country': { change: focusParentAndShowChildLocs.bind(null, 'create') }
    };
    _f.cmbx('initFormCombos', ['location', fLvl, events]);
}
/* ------------------------ MAP METHODS ------------------------------------- */
export function addMapToLocForm($elem, type) {                                  //console.log('           --addMapToLocForm. $elem = %O', $elem);
    const map = _f.util('buildElem', ['div', { id: 'form-map', class: 'skipFormData' }]); 
    $elem.after(map);
    initLocFormMap(type);
}
function initLocFormMap(type) {
    const prntId = $('#Country-Region-sel').val() || $('#Country-sel').val();
    const locRcrds = _f.state('getEntityRcrds', ['location'])
    _f.map('initFormMap', [prntId, locRcrds, type]);
}
export function focusParentAndShowChildLocs(type, val) {                               
    if (!val) { return; }                                                       console.log('               --focusParentAndShowChildLocs [%s] [%s]', type, val);
    const locRcrds = _f.state('getEntityRcrds', ['location'])
    _f.map('initFormMap', [val, locRcrds, type]);
}
export function addListenerToGpsFields(fLvl, params = [true]) {
    $('#Latitude_row input, #Longitude_row input').change(toggleNoGpsSubmitBttn);
    
    function toggleNoGpsSubmitBttn() {
        const coords = getCoordVals()
        _f.elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
        if (coords.length === 1) { ifEditingDisableSubmit(fLvl, coords); }
        if (coords.length !== 2) { _f.map('addVolatileMapPin', [false]); }
        if (coords.length === 2) { _f.map('addVolatileMapPin', params); }
    }
}
function ifEditingDisableSubmit(fLvl, coords) {
    if (_f.state('getFormProp', [fLvl, 'action']) !== 'edit') { return; }
    _f.elems('toggleSubmitBttn', ['#top-submit', false]);
}
function getCoordVals() {
    return ['Lat', 'Long'].map(l => lintCoord(l)).filter(v => v);  
}
function lintCoord(prefix) {
    const field = prefix+'itude';
    const val = $('#'+field+'_row input').val();
    if (ifCoordFieldHasErr(field, val)) { return locCoordErr(field); }
    return val;
}
function ifCoordFieldHasErr(field) {
    const coord = $(`#${field}_row input`).val();
    const max = field === 'Latitude' ? 90 : 180;
    return isNaN(coord) ? true : coord > max ? true : false;    
}