/**
 * Mangages the Interaction Type and Interaction Tag fields in the interaction form.
 *
 * Exports:
 *     initTypeField
 *     onTagSelection
 *     onTypeSelectionInitTagField
 *
 * TOC
 *     INTERACTION TYPE
 *         LOAD OPTIONS
 *     INTERACTION TAG
 *         CLEAR TYPE-TAGS
 *         INIT FIELD
 *         ON TAG SELECTION
 *     SHARED
 *         FIELD INIT-VAL
 */
import { _cmbx } from '~util';
import { _confg, _state } from '~form';
import * as iForm from '../int-form-main.js';
/**
 * defaultTag:      Required tag id for the selected interaction type.
 * objectGroup:     The object taxon group when selected in the form.
 * secondaryTagId:  This tag is always available regardless of the type selected.
 */
const app = {
    defaultTag: null,
    objectGroup: null,
    secondaryTagId: null
}
/* ========================= INTERACTION TYPE =============================== */
/**
 * Interaction Types are restricted by the Object Group.
 * Ex:
        'Visitation': ['Plant'],
        'Pollination': ['Plant'],
        'Seed Dispersal': ['Plant'],
        'Consumption': ['Plant', 'Fungi'],
        'Transport': ['Plant', 'Arthropod'],
        'Roost': ['Plant'],
        'Predation': [ 'Arthropod', 'Bird', 'Reptile', 'Amphibian', 'Fish', 'Mammal'],
        'Prey': [ 'Arthropod', 'Bird', 'Reptile', 'Amphibian', 'Fish', 'Mammal'],
        'Host': ['Arthropod', 'Virus', 'Fungi', 'Bacteria', 'Other Parasite'],
        'Cohabitation': ['Arthropod', 'Bird', 'Mammal', 'Bat'],
        'Hematophagy': ['Bird', 'Mammal'],
 */
export function initTypeField(objectGroup) {                        /*perm-log*/console.log(        '+--initTypeField = [%s]', objectGroup);
    if (app.objectGroup === objectGroup) { return; }
    app.objectGroup = objectGroup;
    loadIntTypeOptions();
}
/* ---------------------- LOAD OPTIONS -------------------------------------- */
function loadIntTypeOptions() {
    const types = _confg('getFormConfg', ['taxon']).groups[app.objectGroup];/*dbug-log*///console.log('types = %O', types)
    _cmbx('getSelectStoredOpts', ['intTypeNames', types])
    .then(loadComboOptionsForType)
    .then(() => _cmbx('enableCombobox', ['InteractionType', true]))
}
function loadComboOptionsForType(opts) {                            /*dbug-log*///console.log('opts = %O', opts)
    const prevType = _cmbx('getSelVal', [`InteractionType`]);
    _cmbx('replaceSelOpts', ['InteractionType', opts]);
    _cmbx('focusCombobox', ['InteractionType']);
    const initVal = getInitVal('InteractionType', prevType);
    selectInitValIfValidType(initVal, opts);
}
/* ========================= INTERACTION TAGS =============================== */
export function onTypeSelectionInitTagField(val) {
    if (!val) { return clearTypeRelatedTags(); }
    fillAndEnableTags(val);
    iForm.focusPinAndEnableSubmitIfFormValid('InteractionType');
}
/* -------------------------- CLEAR TYPE-TAGS ------------------------------- */
function clearTypeRelatedTags() {                                   /*dbug-log*///console.log('clearTypeRelatedTags')
    const opts = [ { text: 'Secondary', value: app.secondaryTagId} ];
    _cmbx('replaceSelOpts', ['InteractionTags', opts]);
    app.defaultTag = null;
}
/* ---------------------------- INIT FIELD ---------------------------------- */
function fillAndEnableTags(id) {
    const tagOpts = buildTagOpts(_state('getRcrd', ['interactionType', id]));
    _cmbx('replaceSelOpts', ['InteractionTags', tagOpts]);
    _cmbx('enableCombobox', ['InteractionTags', true]);
    selectTagInitVal();
}
/**
 * Init-val is set when the field data is persistsed across new interactions or
 * during edit form build.
 */
function selectTagInitVal() {
    const initVal = getInitVal('InteractionTags');
    if (!initVal) { return; }
    _cmbx('setSelVal', ['InteractionTags', initVal]);
}
function buildTagOpts(type) {
    filterTagsForObjectGroup(type, type.tags);
    handleRequiredTagForType(type.tags);
    return type.tags.map(buildTagOpt)
}
function filterTagsForObjectGroup(type, tags) {
    type.tags = tags.filter(t => !t.group || t.group === app.objectGroup);
}
function handleRequiredTagForType(typeTags) {
    app.defaultTag = getDefaultTag(typeTags);
    $('#sel-InteractionTags').data('init-val', app.defaultTag);
    if (!app.defaultTag) { return; }
    _cmbx('setSelVal', ['InteractionTags', app.defaultTag]);
}
function getDefaultTag(tags) {
    const tag = tags.find(t => t.required);
    return tag ? tag.id : false;
}
function buildTagOpt(tag) {
    if (!app.secondaryTagId && tag.displayName === 'Secondary') { app.secondaryTagId = tag.id; }
    return {value: tag.id, text: tag.displayName};
}
/* ------------------------ ON TAG SELECTION -------------------------------- */
export function onTagSelection(tags) {                              /*dbug-log*///console.log('tags = ', tags);
    ensureDefaultTagStaysSelected(tags);
    iForm.checkIntFieldsAndEnableSubmit();
}
function ensureDefaultTagStaysSelected(tags) {
    if (!app.defaultTag || tags.indexOf(app.defaultTag) !== -1 ) { return; }
    $('#sel-InteractionTags')[0].selectize.addItem(app.defaultTag, 'silent');
}
/* ========================= SHARED ========================================= */
/* --------------------- FIELD INIT-VAL ------------------------------------- */
/**
 * Init-val is set when the field data is persistsed across new interactions or
 * during edit form build.
 */
function getInitVal(field, prevVal) {
    return $('#sel-'+field).data('init-val') || prevVal;
}
function selectInitValIfValidType(initVal, typeOpts) {
    const validType = typeOpts.find(opt => opt.value == initVal);   /*dbug-log*///console.log('validType = ', validType)
    if (validType) {
        _cmbx('setSelVal', ['InteractionType', initVal]);
    } else {
        clearTypeRelatedTags();
    }
}
