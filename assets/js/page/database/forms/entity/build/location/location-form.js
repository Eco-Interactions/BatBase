/**
 * Contains code specific to the location form.
 *
 * Export
 *     addMapToLocForm
 *     autofillCoordinateFields
 *     focusParentAndShowChildLocs
 *     initCreateForm
 *     initEditForm
 *
 * TOC
 *     INIT FORM
 *         CREATE
 *             FINISH INIT
 *         EDIT
 *             FINISH INIT
 *         SHARED
 *             FINISH BUILD
 *     MAPS
 *         ADD MAP TO FORM
 *         ON MAP LOADED
 *         LOAD COUNTRY LOCATIONS
 *     COMBO FIELDS
 *         LISTENERS
 *         AUTOFILL
 */
import { _cmbx, _el } from '~util';
import { _map } from '~db';
import { _state, _elems, _form, getSubFormLvl } from '~form';
/* ========================= INIT FORM ====================================== */
/* --------------------------- CREATE --------------------------------------- */
export function initCreateForm(entity, val) {                       /*dbug-log*///console.log("       --initLocForm [%s]", val);
    if ($('#form-map').length !== 0) { $('#form-map').remove(); }
    const p = getCreateFormParams(val);                             /*dbug-log*///console.log('--params[%O]', p);
    _elems('initSubForm', [p])
    .then(status => finishFormInit(status, p))
    .then(finishCreateFormInit);
}
function getCreateFormParams(val) {
    const createParams = {
        appendForm: form => $('#Location_f')[0].parentNode.after(form),
        onFormClose: _form.bind(null, 'enableCountryRegionField'),
        combo: 'Location',
        style: 'med-sub-form',
        vals: {
            'DisplayName': val === 'create' ? '' : val, //clears form trigger value
            'Country': $('#sel-Country-Region').val()
        }
    };
    return { ...createParams, ...getFormParams('sub', 'create') };
}
/* _____________________________ FINISH INIT ________________________________ */
function finishCreateFormInit() {
    _cmbx('enableCombobox', ['Country-Region', false]);
    disableTopFormLocNote();
    addListenerToGpsFields('sub');
    scrollToLocFormWindow();
}
function disableTopFormLocNote() {
    $('#loc-note').fadeTo(400, .3);
}
function scrollToLocFormWindow() {
    $('#top-form')[0].scrollTo(0, 150);
}
/* ---------------------------- EDIT ---------------------------------------- */
export function initEditForm(id) {                                  /*perm-log*/console.log('           >--Author EDIT Form id[%s]', id);
   const p = getEditFormParams(id);                                 /*dbug-log*///console.log('   --params[%O]', p);
    return _elems('initForm', [p])
        .then(status => finishFormInit(status, p))
        .then(() => finishEditFormInit(p));
}
function getEditFormParams(id) {
    const editParams = {
        id: id,
        // style: 'sml-form',
    };
    return { ...editParams, ...getFormParams('top', 'edit') };
}
/* _____________________________ FINISH INIT ________________________________ */
function finishEditFormInit(p) {
    addListenerToGpsFields('top', [p.id, 'edit', false]);
    afterMapLoads(finishEditForm, p.id);
}
function finishEditForm(id) {
    $('input.leaflet-control-create-icon').click(initCreateForm);
    if (!$('#Latitude_f input').val()) { return; }
    _map('addVolatileMapPin', [id, 'edit', _cmbx('getSelVal', ['Country'])]);
}
/* --------------------------- SHARED --------------------------------------- */
function getFormParams(fLvl, action) {
    return {
        action: action,
        name: 'Location',
        group: fLvl,
        initCombos: initCombos.bind(null, fLvl, action),
    };
}
function initCombos(fLvl, action) {
    const events = {
        'Country': { onChange: focusParentAndShowChildLocs.bind(null, action) },
        'HabitatType': { onChange: false },
    };
    _elems('initFormCombos', [fLvl, events]);
}
/* _______________________ FINISH BUILD _____________________________________ */
function finishFormInit(status, p) {
    if (!status) { return; } //Error handled elsewhere
    _elems('checkReqFieldsAndToggleSubmitBttn', [p.group]);
    $('#Latitude_f input').focus();
    addMapToLocForm(p.action);
    addNotesToForm();
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
/** ========================= MAPS ========================================== */
/* -------------------------- ADD MAP TO FORM ------------------------------- */
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
/* ---------------------------- ON MAP LOADED ------------------------------- */
function afterMapLoads(onLoadFunc, id) {
    if ($('#form-map').data('loaded')) {
        onLoadFunc(id);
        $('#form-map').removeData('loaded');
    } else {
        window.setTimeout(() => afterMapLoads(onLoadFunc, id), 500);
    }
}
/* ------------------------- LOAD COUNTRY LOCATIONS ------------------------- */
export function focusParentAndShowChildLocs(type, val) {
    if (!val) { return; }                                           /*dbug-log*///console.log('               --focusParentAndShowChildLocs [%s] [%s]', type, val);
    const locRcrds = _state('getEntityRcrds', ['location'])
    _map('initFormMap', [val, locRcrds, type]);
}
/** ====================== COORD FIELDS ===================================== */
/* ------------------------------ LISTENERS --------------------------------- */
function addListenerToGpsFields(fLvl, params = [true]) {            /*dbug-log*///console.log('--addListenerToGpsFields fLvl[%s] params[%O]', fLvl, params);
    $('#Latitude_f input, #Longitude_f input').change(validateLocFields);

    function validateLocFields() {                                  /*dbug-log*///console.log('   @--validateLocFields', );
        const coords = getCoordVals().filter(c=>c);
        _elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
        if (coords.length === 1) { _elems('toggleSubmitBttn', [fLvl, false]); }
        if (coords.length !== 2) { _map('addVolatileMapPin', [false]); }
        if (coords.length === 2) { _map('addVolatileMapPin', params); }
    }
}
function getCoordVals() {
    return ['Lat', 'Long'].map(l => lintCoord(l)).filter(v => v);
}
function lintCoord(prefix) {
    const field = prefix+'itude';
    const input = $(`#${field}_f input`)[0];
    return input.validity.valid ? input.value : null;
}
/* -------------------------------- AUTOFILL -------------------------------- */
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