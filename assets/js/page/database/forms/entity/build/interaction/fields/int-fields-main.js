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
        'CitationTitle': { onChange: src.onCitSelection, create: create.bind(null, 'Citation') },
        'Country-Region': { onChange: loc.onCntryRegSelection },
        'InteractionType': { onChange: type.onTypeSelection },
        'InteractionTags': { onChange: tag.onTagSelection, delimiter: ",", maxItems: null  },
        'Location': { onChange: loc.onLocSelection, create: create.bind(null, 'Location')},
        'Publication': { onChange: src.onPubSelection, create: create.bind(null, 'Publication')},
        'Subject': { onChange: txn.onTaxonFieldSelection.bind(null, 'Subject') },
        'Object': { onChange: txn.onTaxonFieldSelection.bind(null, 'Object') },
    };
}
function create(entity, val) {
    return _form('createEntity', [entity, val]);
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
export function clearCitationCombo() {
    return src.clearCitationCombo(...arguments);
}
/* ----------------- LOCATION ----------------------------------------------- */
export function resetLocCombo() {
    return loc.resetLocCombo(...arguments);
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
export function selectFieldTaxon() {
    return txn.selectFieldTaxon(...arguments);
}
export function buildOptAndUpdateCombo() {
    return txn.buildOptAndUpdateCombo(...arguments);
}
export function onTaxonFieldSelection() {
    return txn.onTaxonFieldSelection(...arguments);
}
export function addRoleTaxonFocusListeners() {
    return txn.addRoleTaxonFocusListeners(...arguments);
}
export function enableTaxonFieldCombos() {
    return txn.enableTaxonFieldCombos(...arguments);
}
export function initTypeFieldIfBothTaxonRolesFilled() {
    return txn.initTypeFieldIfBothTaxonRolesFilled();
}
/* ----------------- INTERACTION TYPE --------------------------------------- */
export function initTypeField() {
    return type.initTypeField(...arguments);
}
export function setTypeEditVal() {
    return type.setTypeEditVal(...arguments);
}
/* ----------------------- TAGS --------------------------------------------- */
export function initTagField() {
    return tag.initTagField(...arguments);
}
export function onTypeSelection() {
    type.onTypeSelection(...arguments);
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
