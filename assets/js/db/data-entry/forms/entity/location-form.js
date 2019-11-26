/**
 *
 *
 * Exports:
 *     initCreateForm
 * 
 */
import * as _i from '../forms-main.js';

/**
 * 
 */
export function initFormCombos(entity, fLvl) {
    const events = {
        'Country': { change: focusParentAndShowChildLocs.bind(null, 'create') }
    };
    _i.cmbx('initFormCombos', ['location', fLvl, events]);
}
/** Inits the location form and disables the country/region combobox. */
export function initCreateForm(val) {                                              console.log("       --initLocForm [%s]", val);
    const fLvl = _i.getSubFormLvl('sub');
    if ($('#'+fLvl+'-form').length !== 0) { 
        return _i.err('openSubFormErr', ['Location', null, fLvl]); 
    }
    if ($('#loc-map').length !== 0) { $('#loc-map').remove(); }
    buildLocForm(val, fLvl)
    .then(onLocFormLoadComplete);
}
function buildLocForm(val, fLvl) {    
    const vals = { 'DisplayName': val === 'create' ? '' : val, //clears form trigger value
        'Country': $('#Country-Region-sel').val() 
    }; 
    _i.mmry('initEntityFormMemory', ['location', fLvl, '#Location-sel', 'create']);
    _i.mmry('setonFormCloseHandler', [fLvl, enableCountryRegionField]);
    return _i.elems('initSubForm', [fLvl, 'med-sub-form', vals, '#Location-sel'])
        .then(appendLocFormAndFinishBuild);

    function appendLocFormAndFinishBuild(form) {
        $('#Location_row')[0].parentNode.after(form);
        initFormCombobos(null, fLvl);
        _i.cmbx('enableCombobox', ['#Country-Region-sel', false]);
        $('#Latitude_row input').focus();
        $('#sub-submit').val('Create without GPS data');
        _i.ui('setCoreRowStyles', ['#location_Rows', '.sub-row']);
        enableSubmitBttnIfRequiredFieldsFilled(vals);
    }
    function enableSubmitBttnIfRequiredFieldsFilled(vals) {
        if (!vals.DisplayName || !vals.Country) { return; }
        _i.ui('toggleSubmitBttn', ['#'+fLvl+'-submit']); 
    }
}
function onLocFormLoadComplete() {
    const fLvl = _i.getSubFormLvl("sub");
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
        const coords = getCoordVals();
        _i.ui('toggleSubmitBttn', ['#sub-submit', coords.length]);
        if (coords.length === 2) { _i.map('addVolatileMapPin', params); }
    }
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
/**
 * New locations with GPS data are created by clicking a "Create Location" button
 * in a the new location's green map pin's popup on the map in the form.
 */
export function addNewLocation() {
    const fLvl = _i.getSubFormLvl('sub');
    if (_i.elems('ifAllRequiredFieldsFilled', [fLvl])) {
        _i.submitForm('#'+fLvl+'-form',  fLvl, 'location');
    } else { showFillAllLocFieldsError(fLvl); }
}
function showFillAllLocFieldsError(fLvl) {
    _i.err('reportFormFieldErr', ['Display Name', 'needsLocData', fLvl]);
}
export function locCoordErr(field) {
    const fLvl = _i.getSubFormLvl('sub');
    _i.err('reportFormFieldErr', [field, 'invalidCoords', fLvl]);
}
/*--------------- Map methods ---------------------------*/
export function addMapToLocForm(elemId, type) {                                        console.log('           --addMapToLocForm');
    const map = _i.util('buildElem', ['div', { id: 'loc-map', class: 'skipFormData' }]); 
    $(elemId).after(map);
    initLocFormMap(type);
}
function initLocFormMap(type) {
    const prntId = $('#Country-Region-sel').val() || $('#Country-sel').val();
    const locRcrds = _i.mmry('getEntityRcrds', ['location'])
    _i.map('initFormMap', [prntId, locRcrds, type]);
}
export function focusParentAndShowChildLocs(type, val) {                               
    if (!val) { return; }                                                       console.log('           --focusParentAndShowChildLocs [%s] [%s]', type, val);
    const locRcrds = _i.mmry('getEntityRcrds', ['location'])
    _i.map('initFormMap', [val, locRcrds, type]);
}

/** ================== EDIT FORM CODE ======================================= */
export function finishLocEditFormBuild() {  
    _i.cmbx('initFormCombos', ['Location', 'top']); 
    updateCountryChangeMethod();
    addGpsListenerToEditForm(_i.mmry('getEditEntityId', ['core']))
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
    if ($('#loc-map').data('loaded')) { finishEditForm(id)
    } else { window.setTimeout(() => finishLocFormAfterMapLoad(id), 500); }
}
function finishEditForm(id) {
    $('input.leaflet-control-create-icon').click(initCreateForm);
    $('#loc-select-bttn').click(selectLoc.bind(null, id));
    _i.ui('setCoreRowStyles', ['#form-main', '.top-row']);
    db_i.map('addVolatileMapPin', [id, 'edit', _i.cmbx.getSelVal('#Country-sel')]);
    $('#loc-map').removeData('loaded')
}
function selectLoc(id) {
    $('#sub-form').remove();
    _i.cmbx('setSelVal', ['#Location-sel', id]);
    enableCountryRegionField();
    _i.cmbx('enableCombobox', ['#Location-sel']);
}
/** When the Location sub-form is exited, the Country/Region combo is reenabled. */
function enableCountryRegionField() {  
    _i.cmbx('enableCombobox', ['#Country-Region-sel']);
    $('#loc-note').fadeTo(400, 1);
}