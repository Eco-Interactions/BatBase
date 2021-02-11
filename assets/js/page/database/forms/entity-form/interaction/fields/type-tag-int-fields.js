/**
 * Mangages the Interaction Type and Interaction Tag fields in the interaction form.
 *
 * Exports:
 *     initTypeField
 *     onTagSelection
 *     onTypeSelectionInitTagField
 *     resetTypeAndTagMemory
 *
 * TOC
 *     INTERACTION TYPE
 *         BUILD VALID OPTIONS
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
 * object:          The selected object-taxon subGroup id
 * object:          The selected subject-taxon subGroup id
 * secondaryTagId:  This tag is always available regardless of the type selected.
 */
let app = getTypeAndTagMemoryDefaults();

export function resetTypeAndTagMemory() {
    app = getTypeAndTagMemoryDefaults();
}
function getTypeAndTagMemoryDefaults() {
    return {
        defaultTag: null,
        object: null,
        subject: null,
        secondaryTagId: null
    };
}
/* ========================= INTERACTION TYPE =============================== */
/**
 * Once both a subject and object taxon have been selected, all valid interaction
 * types are loaded in the field combobox,
 * @param  {int} subjGroup  Taxon sub-group id
 * @param  {int} objGroup)  Taxon sub-group id
 */
export function initTypeField(subjGroup, objGroup) {                /*perm-log*/console.log(        '+--initTypeField subjGroup[%s] -> objGroup[%s]', subjGroup, objGroup);
    if (ifGroupsUnchanged(subjGroup, objGroup)) { return; }
    app.subject = subjGroup;
    app.object = objGroup;
    loadIntTypeOptions();
}
function ifGroupsUnchanged(subjGroup, objGroup) {
    return app.subject === subjGroup && app.object === objGroup;
}
/* ---------------------- BUILD VALID OPTIONS ------------------------------- */
function loadIntTypeOptions() {
    loadTypeOptions(buildValidInteractionTypeOptions());
    _cmbx('enableCombobox', ['InteractionType', true]);
}
function buildValidInteractionTypeOptions() {
    const data = _state('getEntityRcrds', [['interactionType', 'validInteraction']]);
    const validInts = getAllValidInteractions(data.validInteraction);/*dbug-log*///console.log('buildInteractionTypeOptions for validInts = %O data = %O', validInts, data);
    return validInts.map(buildIntTypeOpt)

    function buildIntTypeOpt(id) {
        const int = data.validInteraction[id];
        const txt = data.interactionType[int.interactionType].displayName;
        return { text: txt, value: int.interactionType };
    }
}
/**
 * Valid Interaction entties describe the valid combinations of subject & object
 * subGroups, interaction types, and tags.
 * @return {ary} All ValidInteraction ids for the selected su|object taxon groups
 */
function getAllValidInteractions(validInteractions) {
    const validInts = Object.keys(validInteractions).filter(ifValidInt);
    app.validInts = validInts;
    return validInts;

    function ifValidInt(id) {
        const vInt = validInteractions[id];
        return vInt.subjectSubGroup == app.subject &&
            vInt.objectSubGroup == app.object;
    }
}
/* ---------------------- LOAD OPTIONS -------------------------------------- */
function loadTypeOptions(opts) {                                    /*dbug-log*///console.log('loadTypeOptions = %O', opts)
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
    const validType = typeOpts.find(opt => opt.value == initVal);   /*dbug-log*///console.log('selectInitValIfValidType initVal?[%s] validType?[%s]', initVal, validType);
    if (validType) {
        _cmbx('setSelVal', ['InteractionType', initVal]);
    } else {
        clearTypeRelatedTags();
    }
}
