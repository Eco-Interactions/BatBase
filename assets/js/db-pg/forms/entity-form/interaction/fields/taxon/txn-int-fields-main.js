/**
 * The role-taxon select-form for the interaction fields, Subject and Object, and
 * to select a new parent taxon in the taxon edit-form.
 *
 * TOC
 *     ROLE-FIELD FOCUS LISTENERS
 *     ROLE-TAXON SELECT-FORM INIT
 *     GROUP AND SUB-GROUP FIELDS
 *     RANK FIELDS
 *     SELECT ROLE-TAXON
 */
import {  _cmbx, _state } from '../../../../forms-main.js';
import * as iForm from '../../int-form-main.js';
import * as txnSelect from './txn-select-form.js';
import * as rankFields from './rank/txn-rank-main.js';
import * as groupFields from './group-fields.js';
import * as role from './role-taxon.js';
/* ----------------- ROLE-FIELD FOCUS LISTENER ------------------------------ */
/** Displays the [Role] Taxon select form when the field gains focus. */
export function addRoleTaxonFocusListeners() {
    ['Subject', 'Object'].forEach(addRoleFocusListener);
}
function addRoleFocusListener(role) {
    const elem = '#'+role+'-sel + div div.selectize-input';
    const showSelectForm = role === 'Object' ? initObjectSelect : initSubjectSelect;
    $('#form-main').on('focus', elem, showSelectForm);
}
/* ----------------- ROLE-TAXON SELECT-FORM INIT ---------------------------- */
export function initSubjectSelect() {
    if (ifSubFormAlreadyInUse('Subject')) { return openSubFormAlert('Subject'); }
    txnSelect.initTaxonSelectForm('Subject', 1);
}
/**
 * Notes:
 * - subForm check has to happen here because catching issues later is difficult.
 * - The selected group's rank combos are built @onGroupSelection.
 */
export function initObjectSelect() {
    if (ifSubFormAlreadyInUse('Object')) { return openSubFormAlert('Object'); }
    const groupInitId = getObjectGroupId();
    txnSelect.initTaxonSelectForm('Object', groupInitId)
    .then(() => groupFields.onGroupSelection(groupInitId))
    .then(() => txnSelect.selectPrevTaxonAndResetRoleField('Object'))
}
function getObjectGroupId() {
    const prevSelectedId = $('#Object-sel').data('selTaxon');
    if (!prevSelectedId) { return 2; } //default: Plants (2)
    return _state('getRcrd', ['taxon', prevSelectedId]).group.id;
}
/* ----------------- IF OPEN SUB-FORM ISSUE --------------------------------- */
function ifSubFormAlreadyInUse(role) {
    return iForm.ifFormAlreadyOpenAtLevel('sub') || ifOppositeRoleFormLoading(role);
}
function ifOppositeRoleFormLoading(role) {
    const oppRole = role === 'Subject' ? 'Object' : 'Subject';
    return $('#'+oppRole+'-sel').data('loading');
}
function openSubFormAlert(role) {
    iForm.handleOpenSubFormAlert(role, 'sub');
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
export function initRankCombos() {
    const events = getRankComboEvents();
    _cmbx('initFormCombos', ['taxon', 'sub', events]);
}
function getRankComboEvents() {
    return {
        'Class': { change: onRankSelection, add: iForm.create('class') },
        'Family': { change: onRankSelection, add: iForm.create('family') },
        'Genus': { change: onRankSelection, add: iForm.create('genus') },
        'Order': { change: onRankSelection, add: iForm.create('order') },
        'Group': { change: onGroupSelection },
        'Sub-Group': { change: onSubGroupSelection },
        'Species': { change: onRankSelection, add: iForm.create('species') },
    };
}