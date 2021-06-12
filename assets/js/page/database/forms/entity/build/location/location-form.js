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
import { _confg, _elems, _form, _state, _val, handleFormSubmit } from '~form';
/* ========================= INIT FORM ====================================== */
/* --------------------------- CREATE --------------------------------------- */
export function initCreateForm(entity, val) {                       /*temp-log*/console.log("       --initLocForm [%s]", val);
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
        submit: checkIfLocExists.bind(null, 'sub'),
        vals: {
            DisplayName: val === 'create' ? '' : val, //clears form trigger value
            Country: $('#sel-Country-Region').val()
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
function checkIfLocExists(fLvl) {
    const fields = _state('getFormState', ['sub', 'fields']);       /*dbug-log*///console.log('-- checkIfLocExists [%s]fields[%O]', fLvl, fields);
    if (Object.values(fields).find(isSpecificData)) { return handleFormSubmit('sub'); }
    setExistingEntityData(fLvl, fields);
    _val('showFormValAlert', ['sub', 'existingEntity', 'sub'])

    function isSpecificData(field) {
        if (!field.shown) { return false; }
        const habData = ['DisplayName', 'HabitatType', 'Country'];  /*dbug-log*///console.log('-- isSpecificData? field[%s]?[%s]', field.name, (habData.indexOf(field.name) === -1 ? !!field.value : false));
        return habData.indexOf(field.name) === -1 ? !!field.value : false;
    }
}
function setExistingEntityData(fLvl, fields) {
    const name = buildExistingLocName();
    const loc = getExistngLocRcrd(name, fields.Country.value);
    updateLocState(fLvl, loc);
}
function buildExistingLocName() {
    const name = _cmbx('getSelTxt', ['Country']);
    const habName = _cmbx('getSelTxt', ['HabitatType']);            /*dbug-log*///console.log('-- buildExistingLocName parent[%s] habitat?[%s]', name, habName);
    return habName ? ( name + '-' + habName ) : name;
}
function getExistngLocRcrd(name, id) {
    const locs = _state('getEntityRcrds', ['location']);
    const pLoc = locs[id];                                          /*dbug-log*///console.log('-- getExistngLocRcrd name[%s] pLoc[%O]', name, pLoc);
    return pLoc.displayName === name ? pLoc : getLocHabRcrd(name, pLoc, locs);
}
function getLocHabRcrd(name, pLoc, locs) {
    const id = pLoc.children.find(c => locs[c].displayName == name);
    return locs[id];
}
function updateLocState(fLvl, loc) {
    const misc = _state('getFormState', [fLvl, 'misc']);            /*dbug-log*///console.log('-- updateLocState loc[%O] state[%O]', loc, misc);
    misc.existingEntity = loc;
    misc.entityField = 'Location';
}
/* ---------------------------- EDIT ---------------------------------------- */
export function initEditForm(entity, id) {                          /*perm-log*/console.log('           >--LOCATION EDIT entity[%s] id[%s]', entity, id);
   const p = getEditFormParams(id);                                 /*dbug-log*///console.log('   --params[%O]', p);
    return _elems('initForm', [p])
        .then(status => finishFormInit(status, p))
        .then(() => finishEditFormInit(p));
}
function getEditFormParams(id) {
    const editParams = {
        id: id,
        style: 'lrg-form',
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
        Country: { onChange: focusParentAndShowChildLocs.bind(null, action) },
        HabitatType: { onChange: false },
    };
    _elems('initFormCombos', [fLvl, events]);
}
/* _______________________ FINISH BUILD _____________________________________ */
function finishFormInit(status, p) {                                /*dbug-log*///console.log('           --finishFormInit status[%s] params[%O]', status, p);
    if (!status) { return; } //Error handled elsewhere
    _elems('checkReqFieldsAndToggleSubmitBttn', [p.group]);
    $('#DisplayName_f input').focus();
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
    const pId = $('#sel-Country-Region').val() || $('#sel-Country').val();
    $form.after(_el('getElem', ['div', { id: 'form-map' }]));
    initLocFormMap(type, pId);
}
function initLocFormMap(type, pId) {
    const mData = {
        pId: pId,
        locRcrds:  _state('getEntityRcrds', ['location']),
        formConfg: _confg('getConfgData', ['Location', 'misc']),
        type: type
    };
    _map('initFormMap', [mData]);
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
    initLocFormMap(type, val);
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
    const fLvl = _state('getSubFormLvl', ['sub']);
    setCoordinateFieldData(fLvl, 'Latitude', lat.toFixed(7));
    setCoordinateFieldData(fLvl, 'Longitude', lng.toFixed(7));
    _elems('setSilentVal', [fLvl, 'Country', cntryId]);
    _elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
}
function setCoordinateFieldData(fLvl, field, coord) {
    $(`#${field}_f input`).val(coord);
    _state('setFieldState', [fLvl, field, coord]);
}