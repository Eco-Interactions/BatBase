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
import { _state, _elems, _form, getSubFormLvl } from '~form';

/** ====================== CREATE FORM ====================================== */
/** Inits the location form and disables the country/region combobox. */
export function initCreateForm(entity, val) {                       /*dbug-log*///console.log("       --initLocForm [%s]", val);
    if ($('#form-map').length !== 0) { $('#form-map').remove(); }
    _elems('initSubForm', [getLocFormParams(val)])
    .then(finishLocFormInit)
    .then(onCreateFormLoadComplete);
}
function getLocFormParams(val) {
    return {
        appendForm: form => $('#Location_f')[0].parentNode.after(form),
        entity: 'Location',
        fLvl: 'sub',
        initCombos: initCombos.bind(null, 'sub'),
        onFormClose: _form.bind(null, 'enableCountryRegionField'),
        combo: 'Location',
        style: 'med-sub-form',
        vals: {
            'DisplayName': val === 'create' ? '' : val, //clears form trigger value
            'Country': $('#sel-Country-Region').val()
        }
    };
}
function finishLocFormInit(status) {
    if (!status) { return; } //Error handled elsewhere
    _cmbx('enableCombobox', ['Country-Region', false]);
    _elems('checkReqFieldsAndToggleSubmitBttn', ['sub']);
    $('#Latitude_f input').focus();
}
function onCreateFormLoadComplete() {
    disableTopFormLocNote();
    addMapToLocForm('create');
    addListenerToGpsFields('sub');
    scrollToLocFormWindow();
    addNotesToForm();
}
function disableTopFormLocNote() {
    $('#loc-note').fadeTo(400, .3);
}
function scrollToLocFormWindow() {
    $('#top-form')[0].scrollTo(0, 150);
}
function addNotesToForm() {
    addHowToCreateWithGpsNote();
    addSelectSimilarLocationNote($('#ElevationMax_f')[0].parentNode);
}
function addHowToCreateWithGpsNote() {
    const note = `<div class="loc-gps-note" style="margin-top: 5px;">Enter
        decimal data (<a href="https://www.fcc.gov/media/radio/dms-decimal"
        target="_blank">convert</a>)<br>See the green pin’s popup for name suggestions.</div>`;
    $('#Country_f').after(note);
}
function addSelectSimilarLocationNote(prevElem) {
    const note = `<p class="loc-gps-note" style="margin-top: 5px;">
        Select an existing location by clicking inside its pin's popup.</p>`;
    $(prevElem).after(note);
}
/** ======================= EDIT FORM ======================================= */
export function finishEditFormBuild(entity) {
    updateCountryChangeMethod();
    addGpsListenerToEditForm(_state('getFormState', ['top', 'editing']).core);
    $('.all-fields-cntnr').hide();
    addNotesToForm();
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
function initCombos(fLvl) {
    const events = {
        'Country': { onChange: focusParentAndShowChildLocs.bind(null, 'create') },
        'HabitatType': { onChange: false },
    };
    _elems('initFormCombos', [fLvl, events]);
}
/* ------------------------ MAP METHODS ------------------------------------- */
export function addMapToLocForm(type, $form = $('#Location_fields')) {/*dbug-log*///console.log('--addMapToLocForm type[%s] form[%O]', type, $form);
    const mapContainer = _el('getElem', ['div', { id: 'form-map' }]);
    $form.after(mapContainer);
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
export function addListenerToGpsFields(fLvl, params = [true]) {     /*dbug-log*///console.log('--addListenerToGpsFields fLvl[%s] params[%O]', fLvl, params);
    $('#Latitude_f input, #Longitude_f input').change(validateLocFields);

    function validateLocFields() {                                  /*dbug-log*///console.log('   @--validateLocFields', );
        const coords = getCoordVals().filter(c=>c);
        _elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
        if (coords.length === 1) { ifEditingDisableSubmit(fLvl, coords); }
        if (coords.length !== 2) { _map('addVolatileMapPin', [false]); }
        if (coords.length === 2) { _map('addVolatileMapPin', params); }
    }
}
function ifEditingDisableSubmit(fLvl, coords) {
    if (_state('getFormState', [fLvl, 'action']) !== 'edit') { return; }
    _elems('toggleSubmitBttn', ['top', false]);
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

export function autofillCoordinateFields(lat, lng, cntryId) {
    const fLvl = getSubFormLvl('sub');
    setCoordinateFieldData(fLvl, 'Latitude', lat.toFixed(7));
    setCoordinateFieldData(fLvl, 'Longitude', lng.toFixed(7));
    _elems('setSilentVal', [fLvl, 'Country', cntryId]);
    _elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
}
function setCoordinateFieldData(fLvl, field, coord) {
    $(`#${field}_f input`).val(coord);
    _state('setFieldState', [fLvl, field, coord]);
}