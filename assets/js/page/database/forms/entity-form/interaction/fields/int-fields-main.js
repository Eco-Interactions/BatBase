/**
 * Interaction form-field facade
 *
 * TOC
 *     SOURCE
 *     LOCATION
 *     TAXON ROLES
 *     TYPE & TAG
 */
import { create } from '../int-form-main.js';
import * as src from './src-int-fields.js';
import * as loc from './loc-int-fields.js';
import * as txn from './txn-int-fields-main.js';
import * as type from './type-tag-int-fields.js';

export function getIntFormFieldComboEvents(argument) {
    return {
        'CitationTitle': { onChange: src.onCitSelection, create: create('citation', 'sub') },
        'Country-Region': { onChange: loc.onCntryRegSelection },
        'InteractionType': { onChange: type.onTypeSelectionInitTagField },
        'InteractionTags': { onChange: type.onTagSelection },
        'Location': { onChange: loc.onLocSelection, create: create('location', 'sub')},
        'Publication': { onChange: src.onPubSelection, create: create('publication', 'sub')},
        'Subject': { onChange: txn.onTaxonRoleSelection.bind(null, 'Subject') },
        'Object': { onChange: txn.onTaxonRoleSelection.bind(null, 'Object') },
    };
}
/* ------------------ SOURCE ------------------------------------------------ */
export function fillCitationCombo() {
    return src.fillCitationCombo(...arguments);
}
export function onCitSelection() {
    return src.onCitSelection(...arguments);
}
export function onPubSelection() {
    return src.onPubSelection(...arguments);
}
export function onPubClear() {
    return src.onPubClear(...arguments);
}
/* ----------------- LOCATION ----------------------------------------------- */
export function fillLocCombo() {
    return loc.fillLocCombo(...arguments);
}
export function selectLoc() {
    return loc.selectLoc(...arguments);
}
export function enableCountryRegionField() {
    return loc.enableCountryRegionField(...arguments);
}
export function onLocSelection() {
    return loc.onLocSelection(...arguments);
}
export function onCntryRegSelection() {
    return loc.onCntryRegSelection(...arguments);
}
export function addLocationSelectionMethodsNote() {
    return loc.addLocationSelectionMethodsNote(...arguments);
}
/* -------------------- TAXON ROLES ----------------------------------------- */
export function selectRoleTaxon() {
    return txn.selectRoleTaxon(...arguments);
}
export function onTaxonRoleSelection() {
    return txn.onTaxonRoleSelection(...arguments);
}
export function addRoleTaxonFocusListeners() {
    return txn.addRoleTaxonFocusListeners(...arguments);
}
/* -------------------- TYPE & TAGS ----------------------------------------- */
export function initTypeField() {
    return type.initTypeField(...arguments);
}
export function onTagSelection() {
    return type.onTagSelection(...arguments);
}
export function onTypeSelectionInitTagField() {
    return type.onTypeSelectionInitTagField(...arguments);
}
