/**
 * Interaction form-field facade
 *
 * TOC
 *     SOURCE
 *     LOCATION
 *     TAXON ROLES
 *     TYPE & TAG
 */
import { create } from '../../interaction-form-main.js';
import * as src from './src-int-fields.js';
import * as loc from './loc-int-fields.js';
import * as txn from './taxon/txn-int-fields-main.js';
import * as type from './type-tag-int-fields.js';

export function getIntFormFieldComboEvents(argument) {
    return {
        'CitationTitle': { change: src.onCitSelection, add: create('citation', 'sub') },
        'Country-Region': { change: loc.onCntryRegSelection },
        'InteractionType': { change: type.onTypeSelectionInitTagField },
        'InteractionTags': { change: type.onTagSelection },
        'Location': { change: loc.onLocSelection, add: create('location', 'sub')},
        'Publication': { change: src.onPubSelection, add: create('publication', 'sub')},
        'Subject': { change: txn.onTaxonRoleSelection.bind(null, 'Subject') },
        'Object': { change: txn.onTaxonRoleSelection.bind(null, 'Object') },
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
export function initObjectSelect() {
    return txn.initObjectSelect(...arguments);
}
export function initSubjectSelect() {
    return txn.initSubjectSelect(...arguments);
}
export function getSelectedTaxon() {
    return txn.getSelectedTaxon(...arguments);
}
export function selectRoleTaxon() {
    return txn.selectRoleTaxon(...arguments);
}
export function onTaxonRoleSelection() {
    return txn.onTaxonRoleSelection(...arguments);
}
export function onGroupSelection() {
    return txn.onGroupSelection(...arguments);
}
export function onSubGroupSelection() {
    return txn.onSubGroupSelection(...arguments);
}
export function onRankSelection() {
    return txn.onRankSelection.bind(this)(...arguments);
}
export function initRankCombos() {
    return txn.initRankCombos(...arguments);
}
export function addRoleTaxonFocusListener() {
    return txn.addRoleTaxonFocusListener(...arguments);
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
