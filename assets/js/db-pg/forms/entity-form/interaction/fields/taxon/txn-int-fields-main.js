/**
 * The role-taxon select-form for the interaction fields, Subject and Object, and
 * to select a new parent taxon in the taxon edit-form.
 *
 * TOC
 *     ROLE-TAXON SELECT-FORM INIT
 *     GROUP AND SUB-GROUP FIELDS
 *     RANK FIELDS
 *     SELECT ROLE-TAXON
 */
import * as iForm from '../../interaction-form-main.js';
import * as txnSelect from './txn-select-form.js';
import * as rankFields from './rank/txn-rank-main.js';
import * as groupFields from './group-fields.js';
import * as role from './role-taxon.js';
/* ----------------- ROLE-TAXON SELECT-FORM INIT ---------------------------- */
export function initSubjectSelect() {
    txnSelect.initTaxonSelectForm('Subject', 1);
}
/** Note: The selected group's rank combos are built @onGroupSelection. */
export function initObjectSelect() {
    const groupInitId = getObjectGroupId();
    txnSelect.initTaxonSelectForm('Object', groupInitId)
    .then(() => groupFields.onGroupSelection(groupInitId));
}
function getObjectGroupId() {
    const prevSelectedId = $('#Object-sel').data('selTaxon');
    if (!prevSelectedId) { return 2; } //default: Plants (2)
    return iForm.getRcrd('taxon', prevSelectedId).group.id;
}
/* ------------------ GROUP AND SUB-GROUP FIELDS ---------------------------- */
export function onGroupSelection() {
    return groupFields.onGroupSelection(...arguments);
}
export function onSubGroupSelection() {
    return groupFields.onSubGroupSelection(...arguments);
}
/* ----------------------- RANK FIELDS -------------------------------------- */
export function onRankSelection() {
    return rankFields.onRankSelection.bind(this)(...arguments);
}
/* ------------------ SELECT ROLE-TAXON ------------------------------------- */
export function selectRoleTaxon() {
    return role.selectRoleTaxon(...arguments);
}
export function onTaxonRoleSelection() {
    return role.onTaxonRoleSelection(...arguments);
}
export function getSelectedTaxon() {
    return role.getSelectedTaxon(...arguments);
}