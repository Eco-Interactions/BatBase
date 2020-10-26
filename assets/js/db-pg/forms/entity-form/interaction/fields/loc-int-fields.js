/**
 * Manages the location fields in the interaction form, Country/Region and Location.
 *
 * Export
 *     addLocationSelectionMethodsNote
 *     enableCountryRegionField
 *     fillLocCombo
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

import { _u } from '../../../../db-main.js';
import { _cmbx, _form, _panel, _state } from '../../../forms-main.js';
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
    if (val === "" || isNaN(parseInt(val))) { return fillLocCombo(null); }
    const loc = _state('getRcrd', ['location', val]);
    fillLocCombo(loc);
    iForm.focusPinAndEnableSubmitIfFormValid('Country-Region');
    if ($('#form-map').length) { showCountryDataOnMap(val); }
}
function showCountryDataOnMap(val) {
    _form('focusParentAndShowChildLocs', ['int', val]);
}
/** When the Location sub-form is exited, the Country/Region combo is reenabled. */
export function enableCountryRegionField() {
    _u('enableCombobox', ['Country-Region']);
    $('#loc-note').fadeTo(400, 1);
}
/* ========================== LOCATION ====================================== */
/* ---------------------- FILL COMBOBOX ------------------------------------- */
/**
 * When a country/region is selected, the location combobox is repopulated with its
 * child-locations and all habitat types. When cleared, the combobox is
 * repopulated with all locations.
 */
export function fillLocCombo(loc) {
    const opts = loc ? getOptsForLoc(loc) : _cmbx('getLocationOpts');
    _u('replaceSelOpts', ['Location', opts]);
}
/** Returns an array of options for the locations of the passed country/region. */
function getOptsForLoc(loc) {
    let opts = getChildLocOpts(loc.children)
    opts.push({ value: loc.id, text: loc.displayName });
    opts = _u('alphabetizeOpts', [opts]);
    opts.unshift({ value: 'create', text: 'Add a new Location...'});
    return opts;
}
function getChildLocOpts(children) {
    return children.map(id => {
        const loc = _state('getRcrd', ['location', id]);  //error alerted to developer and editor
        return loc ? { value: id, text: loc.displayName } : null
    }).filter(l => l);
}
/* ---------------------- SELECT LOCATION ----------------------------------- */
export function selectLoc(id) {
    $('#sub-form').remove();
    _u('setSelVal', ['Location', id]);
    enableCountryRegionField();
    _u('enableCombobox', ['Location']);
}
/**
 * When a location is selected, its country/region is selected in the top-form
 * combobox and the location record's data is added to the detail panel. If
 * the location was cleared, the detail panel is cleared.
 */
export function onLocSelection(val) {                               /*perm-log*/console.log('       +--onLocSelection [%s]', val);
    if (val === 'create') { return iForm.createSubEntity('location', 'sub'); }
    if (val === '' || isNaN(parseInt(val))) { return _panel('clearDetailPanel', ['loc']); }
    if ($('#form-map').length) { removeLocMap(); }
    const locRcrd = _state('getRcrd', ['location', val]);
    if (!locRcrd) { return; } //error alerted to developer and editor
    const prntVal = locRcrd.parent ? locRcrd.parent : locRcrd.id;
    _u('setSelVal', ['Country-Region', prntVal, 'silent']);
    _panel('fillLocDataInDetailPanel', [locRcrd]);
    iForm.focusPinAndEnableSubmitIfFormValid('Location');
}
function removeLocMap() {
    $('#form-map').fadeTo(400, 0, () => $('#form-map').remove());
}
/* =================== WAYS TO SELECT LOCATION NOTE ========================= */
/** Adds a message above the location fields in interaction forms. */
export function addLocationSelectionMethodsNote() {
    const cntnr = _u('buildElem', ['div', {id: 'loc-note', class: 'skipFormData'}]);
    const mapInfo = getMapInfoText();
    $(cntnr).append(mapInfo);
    $('#Country-Region_row')[0].parentNode.before(cntnr);
}
function getMapInfoText() {
    const text = `<span>Select or create a location using the fields below or </span>`;
    const link = getInfoLinkTextToOpenMap();
    return [ text, link ];
}
function getInfoLinkTextToOpenMap(argument) {
    const attr = {class:'map-link', text: 'click here to use the map interface.'};
    const span = _u('buildElem', ['span', attr]);
    $(span).click(showInteractionFormMap);
    return span;
}
/** Open popup with the map interface for location selection. */
function showInteractionFormMap() {                                 /*dbug-log*///console.log('showInteractionFormMap')
    if ($('#form-map').length) { return; }
    const pElem = $('#Location_row')[0].parentNode;
    _form('addMapToLocForm', ['int', $(pElem)]);
    if (_u('getSelVal', ['Country-Region'])) { return; }
    _u('focusCombobox', ['Country-Region', true]);
}