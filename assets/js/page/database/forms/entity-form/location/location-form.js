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
import { _cmbx, _el } from '~util';
import { _map } from '~db';
import { _state, _elems, _form } from '~form';

/** ====================== CREATE FORM ====================================== */
/** Inits the location form and disables the country/region combobox. */
export function initCreateForm(entity, val) {                       /*dbug-log*/console.log("       --initLocForm [%s]", val);
    if ($('#form-map').length !== 0) { $('#form-map').remove(); }
    buildLocForm(val)
    .then(onCreateFormLoadComplete);
}
function buildLocForm(val) {
    const vals = {
        'DisplayName': val === 'create' ? '' : val, //clears form trigger value
        'Country': $('#sel-Country-Region').val()
    };
    _state('addEntityFormState', ['location', 'sub', '#sel-Location', 'create']);
    _state('setOnFormCloseHandler', ['sub', _form.bind(null, 'enableCountryRegionField')]);
    return _elems('getSubForm', ['sub', 'med-sub-form', vals, '#sel-Location'])
        .then(appendLocFormAndFinishBuild);

    function appendLocFormAndFinishBuild(form) {
        $('#Location_f')[0].parentNode.after(form);
        initFormCombos(null, 'sub');
        _cmbx('enableCombobox', ['Country-Region', false]);
        _elems('setDynamicFormStyles', ['location']);
        _elems('checkReqFieldsAndToggleSubmitBttn', ['sub']);
        $('#Latitude_f input').focus();
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
    addHowToCreateWithGpsNote($('#Latitude_f')[0].parentNode);
    addSelectSimilarLocationNote($('#ElevationMax_f')[0].parentNode);
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
    $('#sel-Country')[0].selectize.off('change');
    $('#sel-Country')[0].selectize.on('change',
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
    _elems('setDynamicFormStyles', ['location']);
    if (!$('#Latitude_f input').val()) { return; }
    _map('addVolatileMapPin', [id, 'edit', _cmbx('getSelVal', ['Country'])]);
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
        'Country': { onChange: focusParentAndShowChildLocs.bind(null, 'create') }
    };
    _elems('initFormCombos', ['location', fLvl, events]);
}
/* ------------------------ MAP METHODS ------------------------------------- */
export function addMapToLocForm(type, $formElem = $('#location_fields')) {
    const mapContainer = _el('getElem', ['div', { id: 'form-map', class: 'skipFormData' }]);
    $formElem.after(mapContainer);
    initLocFormMap(type);
}
function initLocFormMap(type) {
    const prntId = $('#sel-Country-Region').val() || $('#sel-Country').val();
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
    $('#Latitude_f input, #Longitude_f input').change(validateLocFields);

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
    const input = $(`#${field}_f input`)[0];
    return input.validity.valid ? input.value : null;
}
/* ----------- AUTOFILL COORDINATES --------------- */

export function autofillCoordinateFields(lat, lng) {
    $('#Latitude_f input').val(lat);
    $('#Longitude_f input').val(lng);
}