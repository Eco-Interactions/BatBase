/**
 * Interaction form-field facade
 *
 * TOC
 *     SOURCE
 *     LOCATION
 *     TAXON ROLES
 *     INTERACTION TYPE
 *     TAGS
 */
import { _form } from '~form';
import * as src from './src-int-fields.js';
import * as loc from './loc-int-fields.js';
import * as txn from './txn-int-fields.js';
import * as type from './int-type-field.js';
import * as tag from './int-tag-field.js';

export function getIntComboConfg() {
    return {
        'CitationTitle': { onChange: src.onCitSelection, create: create('citation') },
        'Country-Region': { onChange: loc.onCntryRegSelection },
        'InteractionType': { onChange: type.onTypeSelection },
        'InteractionTags': { onChange: tag.onTagSelection, delimiter: ",", maxItems: null  },
        'Location': { onChange: loc.onLocSelection, create: create('location')},
        'Publication': { onChange: src.onPubSelection, create: create('publication')},
        'Subject': { onChange: txn.onTaxonRoleSelection.bind(null, 'Subject') },
        'Object': { onChange: txn.onTaxonRoleSelection.bind(null, 'Object') },
    };
}
function create(entity) {
    return _form.bind(null, 'createEntity', [entity]);
}
export function clearFormFieldModuleMemory() {
    type.resetTypeAndTagMemory();
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
export function enableRoleTaxonFieldCombos() {
    return txn.enableRoleTaxonFieldCombos(...arguments);
}
/* ----------------- INTERACTION TYPE --------------------------------------- */
export function initTypeField() {
    return type.initTypeField(...arguments);
}
/* ----------------------- TAGS --------------------------------------------- */
export function initTagField() {
    return tag.initTagField(...arguments);
}
export function loadInteractionTypeTags() {
    return tag.loadInteractionTypeTags(...arguments);
}
export function clearTypeTagData() {
    return tag.clearTypeTagData(...arguments);
}
export function onTagSelection() {
    return tag.onTagSelection(...arguments);
}
