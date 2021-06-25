/**
 * Manages the location fields in the interaction form, Country/Region and Location.
 *
 * Export
 *     addLocationSelectionMethodsNote
 *     enableCountryRegionField
 *     resetLocCombo
 *     selectLoc
 *     onCntryRegSelection
 *     onLocSelection
 *
 * TOC
 *     COUNTRY/REGION
 *     LOCATION
 *         FILL COMBOBOX
 *         SELECT LOCATION
 *     WAYS TO SELECT LOCATION NOTE
 */

import { _cmbx, _el, _opts } from '~util';
import { _confg, _elems, _form, _panel, _state } from '~form';
import * as iForm from '../int-form-main.js';
/* ======================= COUNTRY/REGION =================================== */
/**
 * When a country or region is selected, the location dropdown is repopulated
 * with it's child-locations and, for regions, all habitat types. When cleared,
 * the combobox is repopulated with all locations.
 * If the map is open, the country is outlined and all existing locations within
 * are displayed @focusParentAndShowChildLocs
 */
export function onCntryRegSelection(val) {                          /*perm-log*/console.log("       +--onCntryRegSelection [%s]", val);
    if (val === "" || isNaN(parseInt(val))) { return resetLocCombo(null); }
    const loc = _state('getRcrd', ['location', val]);
    resetLocCombo(loc);
    iForm.focusPinAndEnableSubmitIfFormValid('Country-Region');
    if ($('#form-map').length) { showCountryDataOnMap(val); }
}
function showCountryDataOnMap(val) {
    _form('focusParentAndShowChildLocs', ['int', val]);
}
/** When the Location sub-form is exited, the Country/Region combo is reenabled. */
export function enableCountryRegionField() {
    _cmbx('enableCombobox', ['Country-Region']);
    $('#loc-note').fadeTo(400, 1);
}
/* ========================== LOCATION ====================================== */
/* ---------------------- FILL COMBOBOX ------------------------------------- */
/**
 * When a country/region is selected, the location combobox is repopulated with its
 * child-locations and all habitat types. When cleared, the combobox is
 * repopulated with all locations.
 */
export function resetLocCombo(loc) {
    const subSet = loc ? getLocComboIds(loc) : false;               /*dbug-log*///console.log('--resetLocCombo subSet[%O]', subSet);
    const opts = _opts('getRcrdOpts', ['location', subSet]);
    _cmbx('replaceSelOpts', ['Location', opts]);
    _panel('clearDetailPanel', ['loc']);
    _state('setFieldState', ['top', 'Location', null]);
    $(`#Location_pin`).prop('checked', false);
}
function getLocComboIds(loc) {
    const tData = _confg('getConfgData', ['Location', 'misc']).territories;
    const tNames = tData[loc.displayName];
    if (!tNames) { return loc.children; }
    return getChildAndTerritoryLocIds(loc, _state('getEntityRcrds', ['location']));

    function getChildAndTerritoryLocIds(loc, rcrds) {
        const tIds = Object.keys(rcrds).filter(i => ifTerritory(rcrds[i], tNames));
        return loc.children.concat(...tIds.map(i => rcrds[i].children));
    }
    function ifTerritory(loc, territories) {
        return territories.indexOf(loc.displayName) !== -1;
    }
}
/* ---------------------- SELECT LOCATION ----------------------------------- */
export function selectLoc(id) {
    $('#sub-form').remove();
    _cmbx('setSelVal', ['Location', id]);
    enableCountryRegionField();
    _cmbx('enableCombobox', ['Location']);
}
/**
 * When a location is selected, its country/region is selected in the top-form
 * combobox and the location record's data is added to the detail panel. If
 * the location was cleared, the detail panel is cleared.
 */
export function onLocSelection(val) {                               /*perm-log*/console.log('       +--onLocSelection [%s]', val);
    if (val === 'create') { return _form('createEntity', ['Location']); }
    if (ifNoLocSelected(val)) { return _panel('clearDetailPanel', ['loc']); }
    if ($('#form-map').length) { removeLocMap(); }
    const locRcrd = _state('getRcrd', ['location', val]);
    if (!locRcrd) { return; } //error alerted to developer and editor
    selectParentCountryRegion(locRcrd);
    _panel('fillLocDataInDetailPanel', [locRcrd]);
    iForm.focusPinAndEnableSubmitIfFormValid('Location');
}
function ifNoLocSelected(val) {
    return val === 'new' || val === '' || isNaN(parseInt(val));
}
function removeLocMap() {
    $('#form-map').fadeTo(400, 0, () => $('#form-map').remove());
}
function selectParentCountryRegion(locRcrd) {
    const prntVal = locRcrd.parent ? locRcrd.parent : locRcrd.id;
    _elems('setSilentVal', ['top', 'Country-Region', prntVal]);
}
/* =================== WAYS TO SELECT LOCATION NOTE ========================= */
/** Adds a message above the location fields in interaction forms. */
export function addLocationSelectionMethodsNote() {
    const cntnr = _el('getElem', ['div', {id: 'loc-note', class: 'a-mrg g' }]);
    const mapInfo = getMapInfoText();
    $(cntnr).append(mapInfo);
    $('#Country-Region_f')[0].parentNode.before(cntnr);
}
function getMapInfoText() {
    const text = `<span>Select a location using the fields below or </span>`;
    const link = getInfoLinkTextToOpenMap();
    return [ text, link ];
}
function getInfoLinkTextToOpenMap(argument) {
    const attr = {class:'map-link', text: 'click here to use the map interface.'};
    const span = _el('getElem', ['span', attr]);
    $(span).click(showInteractionFormMap);
    return span;
}
/** Open popup with the map interface for location selection. */
function showInteractionFormMap() {                                 /*dbug-log*///console.log('showInteractionFormMap')
    if ($('#form-map').length) { return; }
    const pElem = $('#Location_f')[0].parentNode;
    _form('addMapToLocForm', ['int', $(pElem)]);
    if (_cmbx('getSelVal', ['Country-Region'])) { return; }
    _cmbx('focusCombobox', ['Country-Region', true]);
}