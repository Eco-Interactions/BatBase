/**
 * Interaction form-field facade
 *
 * TOC
 *     SOURCE
 *     LOCATION
 *     TAXON ROLES
 *     TYPE & TAG
 */
import * as src from './src-int-fields.js';
import * as loc from './loc-int-fields.js';
import * as txn from './txn-int-fields.js';
import * as type from './type-tag-int-fields.js';

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
/* -------------------- TAXON ROLES ----------------------------------------- */
export function getSelectedTaxon() {
    return txn.getSelectedTaxon(...arguments);
}
export function onSubGroupSelection() {
    return txn.onSubGroupSelection(...arguments);
}
export function onRankSelection() {
    return txn.onRankSelection.bind(this)(...arguments);
}
export function onTaxonRoleSelection() {
    return txn.onTaxonRoleSelection(...arguments);
}
export function onGroupSelection() {
    return txn.onGroupSelection(...arguments);
}
export function initObjectSelect() {
    return txn.initObjectSelect(...arguments);
}
export function initSubjectSelect() {
    return txn.initSubjectSelect(...arguments);
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