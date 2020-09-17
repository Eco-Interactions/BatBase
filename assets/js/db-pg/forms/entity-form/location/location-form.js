/**
 * Contains code specific to the location form.
 *
 * Exports:                     Clients:
 *     initCreateForm               forms-main
 *
 * TOC
 *     CREATE FORM
 *     EDIT FORM
 *     SHARED HELPERS
 *         FORM COMBOBOXES
 *         MAP METHODS
 */
import { _map, _u } from '../../../db-main.js';
import { _state, _elems, _cmbx, _form, _val, getSubFormLvl, submitForm } from '../../forms-main.js';

/** ====================== CREATE FORM ====================================== */
/** Inits the location form and disables the country/region combobox. */
export function initCreateForm(entity, val) {                                   console.log("       --initLocForm [%s]", val);
    if ($('#form-map').length !== 0) { $('#form-map').remove(); }
    buildLocForm(val)
    .then(onCreateFormLoadComplete);
}
function buildLocForm(val) {
    const vals = { 'DisplayName': val === 'create' ? '' : val, //clears form trigger value
        'Country': $('#Country-Region-sel').val()
    };
    _state('addEntityFormState', ['location', 'sub', '#Location-sel', 'create']);
    _state('setOnFormCloseHandler', ['sub', _form.bind(null, 'enableCountryRegionField')]);
    return _elems('initSubForm', ['sub', 'med-sub-form', vals, '#Location-sel'])
        .then(appendLocFormAndFinishBuild);

    function appendLocFormAndFinishBuild(form) {
        $('#Location_row')[0].parentNode.after(form);
        initFormCombos(null, 'sub');
        _cmbx('enableCombobox', ['#Country-Region-sel', false]);
        _elems('setCoreRowStyles', ['#location_Rows', '.sub-row']);
        _elems('checkReqFieldsAndToggleSubmitBttn', ['sub']);
        $('#Latitude_row input').focus();
    }
}
function onCreateFormLoadComplete() {
    disableTopFormLocNote();
    addMapToLocForm('create');
    addListenerToGpsFields('sub');
    scrollToLocFormWindow();
    onLocFormLoadComplete();
}
function onLocFormLoadComplete() {
    addNotesToForm();
    $('#Elevation-lbl').text('Elevation (m)');
}
function disableTopFormLocNote() {
    $('#loc-note').fadeTo(400, .3);
}
function scrollToLocFormWindow() {
    $('#form-main')[0].scrollTo(0, 150);
}
function addNotesToForm() {
    addHowToCreateWithGpsNote($('#Latitude_row')[0].parentNode);
    addSelectSimilarLocationNote($('#ElevationMax_row')[0].parentNode);
}
function addHowToCreateWithGpsNote(pElem) {
    const note = `<p class="loc-gps-note skipFormData" style="margin-top: 5px;">Enter
        decimal data (convert <a href="https://www.fcc.gov/media/radio/dms-decimal"
        target="_blank">here</a>) and see the green pin’s popup for name suggestions.</p>`;
    $(pElem).before(note);
}
function addSelectSimilarLocationNote(prevElem) {
    const note = `<p class="loc-gps-note skipFormData" style="margin-top: 5px;">
        Select an existing location by clicking inside its pin's popup.</p>`;
    $(prevElem).after(note);
}
/** ======================= EDIT FORM ======================================= */
export function finishEditFormBuild(entity) {
    initFormCombos('Location', 'top');
    updateCountryChangeMethod();
    addGpsListenerToEditForm(_state('getEditEntityId', ['core']));
    $('.all-fields-cntnr').hide();
    $('#DisplayName-lbl, #ElevationMax-lbl').css('min-width', '106px');
    onLocFormLoadComplete();
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
    addMapToLocForm('edit');
    afterMapLoads(finishEditForm, id);
}
function finishEditForm(id) {
    $('input.leaflet-control-create-icon').click(initCreateForm);
    _elems('setCoreRowStyles', ['#form-main', '.top-row']);
    if (!$('#Latitude_row input').val()) { return; }
    _map('addVolatileMapPin', [id, 'edit', _cmbx('getSelVal', ['#Country-sel'])]);
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
    _cmbx('initFormCombos', ['location', fLvl, events]);
}
/* ------------------------ MAP METHODS ------------------------------------- */
export function addMapToLocForm(type, $formElem = $('#location_Rows')) {
    const mapContainer = _u('buildElem', ['div', { id: 'form-map', class: 'skipFormData' }]);
    $formElem.after(mapContainer);
    initLocFormMap(type);
}
function initLocFormMap(type) {
    const prntId = $('#Country-Region-sel').val() || $('#Country-sel').val();
    const locRcrds = _state('getEntityRcrds', ['location'])
    _map('initFormMap', [prntId, locRcrds, type]);
}
export function focusParentAndShowChildLocs(type, val) {
    if (!val) { return; }                                                       //console.log('               --focusParentAndShowChildLocs [%s] [%s]', type, val);
    const locRcrds = _state('getEntityRcrds', ['location'])
    _map('initFormMap', [val, locRcrds, type]);
}
/* ----------- COORDINATE FIELD LISTENER --------------- */
export function addListenerToGpsFields(fLvl, params = [true]) {
    $('#Latitude_row input, #Longitude_row input').change(validateLocFields);

    function validateLocFields() {
        const coords = getCoordVals().filter(c=>c);
        _elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
        if (coords.length === 1) { ifEditingDisableSubmit(fLvl, coords); }
        if (coords.length !== 2) { _map('addVolatileMapPin', [false]); }
        if (coords.length === 2) { _map('addVolatileMapPin', params); }
    }
}
function ifEditingDisableSubmit(fLvl, coords) {
    if (_state('getFormProp', [fLvl, 'action']) !== 'edit') { return; }
    _elems('toggleSubmitBttn', ['#top-submit', false]);
}
function getCoordVals() {
    return ['Lat', 'Long'].map(l => lintCoord(l)).filter(v => v);
}
function lintCoord(prefix) {
    const field = prefix+'itude';
    const input = $('#'+field+'_row input')[0];
    return input.validity.valid ? input.value : null;
}
/* ----------- AUTOFILL COORDINATES --------------- */

export function autofillCoordinateFields(lat, lng) {
    $('#Latitude_row input').val(lat);
    $('#Longitude_row input').val(lng);
}