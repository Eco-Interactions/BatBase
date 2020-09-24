/**
 * Mangages the Interaction Type and Interaction Tag fields.
 *
 * Exports:
 *     initTypeField
 *     onTagSelection
 *     onTypeSelectionInitTagField
 *
 * TOC
 *     INTERACTION TYPE
 *     INTERACTION TAG
 *         CLEAR TYPE-TAGS
 *         INIT FIELD
 *         ON TAG SELECTION
 */
import { _confg, _cmbx, _state } from '../../forms-main.js';
import { checkIntFieldsAndEnableSubmit, focusPinAndEnableSubmitIfFormValid } from './interaction-form.js';
/**
 * defaultTag:      Required tag id for the selected interaction type.
 * objectRealm:     Realm of the object taxon when selected in the form.
 * secondaryTagId:  This tag is always available regardless of the type selected.
 */
const app = {
    defaultTag: null,
    objectRealm: null,
    secondaryTagId: null
}
/* ========================= INTERACTION TYPE =============================== */
/**
 * Interaction Types are restricted by the Object Realm.
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
export function initTypeField(objectRealm) {                                    console.log(        '+--initTypeField = [%s]', objectRealm);
    if (app.objectRealm === 'objectRealm') { return; }
    app.objectRealm = objectRealm;
    loadIntTypeOptions();
}
function loadIntTypeOptions() {
    const types = _confg('getRealmInteractionTypes')[app.objectRealm];          //console.log('types = %O', types)
    _cmbx('getSelectStoredOpts', ['intTypeNames', null, types])
    .then(loadComboOptionsForType)
    .then(() => _cmbx('enableCombobox', ['#InteractionType-sel', true]))
}
function loadComboOptionsForType(opts) {                                        //console.log('opts = %O', opts)
    const prevType = _cmbx('getSelVal', [`#InteractionType-sel`])
    _cmbx('updateComboboxOptions', ['#InteractionType-sel', opts, true]);
    const initVal = getInitVal('InteractionType', prevType);
    if (!initVal) { return _cmbx('focusCombobox', [`#InteractionType-sel`, true]); }
    selectInitValIfValidType(initVal, opts);
}
/**
 * Init-val is set when the field data is persistsed across new interactions or
 * during edit form build.
 */
function getInitVal(field, prevVal) {
    return $(`#${field}-sel`).data('init-val') || prevVal;
}
function selectInitValIfValidType(initVal, typeOpts) {
    const validType = typeOpts.find(opt => opt.value == initVal);               //console.log('validType = ', validType)
    if (validType) {
        _cmbx('setSelVal', ['#InteractionType-sel', initVal]);
    } else {
        clearTypeRelatedTags();
        _cmbx('focusCombobox', [`#InteractionType-sel`, true])
    }
}
/* ========================= INTERACTION TAGS =============================== */
export function onTypeSelectionInitTagField(val) {
    if (!val) { return clearTypeRelatedTags(); }
    fillAndEnableTags(val);
    focusPinAndEnableSubmitIfFormValid('InteractionType');
}
/* -------------------------- CLEAR TYPE-TAGS ------------------------------- */
function clearTypeRelatedTags() {                                               //console.log('clearTypeRelatedTags')
    const opts = [{ text: 'Secondary', value: app.secondaryTagId }];
    _cmbx('updateComboboxOptions', ['#InteractionTags-sel', opts]);
    app.defaultTag = null;
}
/* ---------------------------- INIT FIELD ---------------------------------- */
function fillAndEnableTags(id) {
    const tagOpts = buildTagOpts(_state('getRcrd', ['interactionType', id]));
    _cmbx('updateComboboxOptions', ['#InteractionTags-sel', tagOpts]);
    _cmbx('enableCombobox', ['#InteractionTags-sel', true]);
    selectTagInitVal();
}
/**
 * Init-val is set when the field data is persistsed across new interactions or
 * during edit form build.
 */
function selectTagInitVal() {
    const initVal = getInitVal('InteractionTags');
    if (!initVal) { return; }
    _cmbx('setSelVal', ['#InteractionTags-sel', initVal]);
}
function buildTagOpts(type) {
    filterTagsForObjectRealm(type, type.tags);
    handleRequiredTagForType(type.tags);
    return type.tags.map(buildTagOpt)
}
function filterTagsForObjectRealm(type, tags) {
    type.tags = tags.filter(t => !t.realm || t.realm === app.objectRealm);
}
function handleRequiredTagForType(typeTags) {
    app.defaultTag = getDefaultTag(typeTags);
    $('#InteractionTags-sel').data('init-val', app.defaultTag);
    if (!app.defaultTag) { return; }
    _cmbx('setSelVal', ['#InteractionTags-sel', app.defaultTag]);
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
export function onTagSelection(tags) {                                          //console.log('tags = ', tags);
    ensureDefaultTagStaysSelected(tags);
    checkIntFieldsAndEnableSubmit();
}
function ensureDefaultTagStaysSelected(tags) {
    if (!app.defaultTag || tags.indexOf(app.defaultTag) !== -1 ) { return; }
    $('#InteractionTags-sel')[0].selectize.addItem(app.defaultTag, 'silent');
}