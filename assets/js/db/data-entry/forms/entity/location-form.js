/**
 *
 *
 *
 * 
 */
import * as _forms from '../forms-main.js';
import * as db_map from '../../../db-map/map-main.js';




export function getComboboxEvents() {
    // return {
    //     'Country': { change: focusParentAndShowChildLocs.bind(null, 'create') }
    // };
}

        // _forms.setonFormCloseHandler('taxon', fLvl);

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

/** ================== EDIT FORM CODE ======================================= */
export function finishLocEditFormBuild() {  
    _cmbx('initFormCombos', ['Location', 'top']); 
    updateCountryChangeMethod();
    addListenerToGpsFields(
        db_map.addVolatileMapPin.bind(null, fP.editing.core, 'edit', false));
    $('.all-fields-cntnr').hide();
}
function updateCountryChangeMethod() {
    $('#Country-sel')[0].selectize.off('change');
    $('#Country-sel')[0].selectize.on('change', 
        focusParentAndShowChildLocs.bind(null, 'edit'));
}
export function addMapToLocationEditForm(id) {
    addMapToLocForm('#location_Rows', 'edit');
    finishLocFormAfterMapLoad(id);
}
function finishLocFormAfterMapLoad(id) {
    if ($('#loc-map').data('loaded')) {
        _forms.ui('setCoreRowStyles', ['#form-main', '.top-row']);
        db_map.addVolatileMapPin(id, 'edit', _cmbx.getSelVal('#Country-sel'));
    } else {
        window.setTimeout(() => finishLocFormAfterMapLoad(id), 500);
    }
}