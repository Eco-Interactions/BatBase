/**
 * Mangages the Interaction Type and Interaction Tag fields in the interaction form.
 *
 * Export
 *     clearTypeTagData
 *     initTagField
 *     loadInteractionTypeTags
 *     onTagSelection
 *
 * TOC
 *     INTERACTION TYPE
 *         BUILD VALID OPTIONS
 *         LOAD OPTIONS
 *     INTERACTION TAG
 *         CLEAR TYPE-TAGS
 *         INIT TAG FIELD
 *         ON TAG SELECTION
 *     SHARED
 *         FIELD INIT-VAL
 */
import { _cmbx, _opts } from '~util';
import { _confg, _state } from '~form';
import * as iForm from '../int-form-main.js';
/**
 * defaultTagOpts:  These tags are always valid and available to select.
 * object:          Object-taxon subGroup id
 * subject:         Subject-taxon subGroup id
 * validInts:       Valid interaction ids for the selected subject and object groups
 */
let md = getTagFieldDefaultState();

export function resetTagState() {
    md = getTagFieldDefaultState();
}
function getTagFieldDefaultState() {
    return {
        defaultTagOpts: [],
        autoTag: null,
        validInts: {}
    };
}
/** Loads the default interaction tags (eg. 'Secondary') and enables the combobox. */
export function initTagField() {
    handleDefaultTags(_state('getFieldState', ['top', 'InteractionTags', 'misc']));
    loadTagOpts(md.defaultTagOpts);
    handleEditTags(_state('getFieldState', ['top', 'InteractionTags']));
}
/* ======================== INIT DEFAULT-TAGS =============================== */
function handleDefaultTags() {
    const tags = _state('getEntityRcrds', ['tag']);
    const tData = _state('getFieldState', ['top', 'InteractionTags', 'misc']);
    md.defaultTagOpts = Object.keys(tags).map(ifDefaultTagGetOpt).filter(o=>o);
    tData.defaultTags = md.defaultTagOpts;
    _state('setFieldState', ['top', 'InteractionTags', tData, 'misc']);

    function ifDefaultTagGetOpt(id) {
        if (tData.defaultTags.indexOf(tags[id].displayName) === -1) { return null; }
        return { text: tags[id].displayName, value: id }
    }
}
function handleEditTags(tags) {
    $('#sel-InteractionTags').data('init-val', tags);
}
/* =================== CLEAR INTERACTION-TYPE TAGS ========================== */
export function clearTypeTagData() {
    loadTagOpts(md.defaultTagOpts);
    md.autoTag = null;
    updateTagsState(null, false);
}
/* ==================== LOAD INTERACTION-TYPE TAGS ========================== */
export function loadInteractionTypeTags(tags, isRequired) {         /*perm-log*/console.log('--loadInteractionTypeTags tags[%O] required?[%s]', tags, isRequired);
    handleRequiredTag(tags, isRequired);
    addTypeTagOpts(tags);
}
function addTypeTagOpts(typeTags) {                                 /*dbug-log*///console.log('addTypeTagOpts typeTags = %O', typeTags);
    loadTagOpts(buildTagOpts(typeTags));
}
/* -------------------------- REQUIRED TAG ---------------------------------- */
function handleRequiredTag(tags, isRequired) {
    updateTagsState(tags, isRequired);
    md.autoTag = isRequired && tags.length === 1 ? tags[0].id : null;
}
function updateTagsState(tags, isRequired) {
    const tField = _state('getFieldState', ['top', 'InteractionTags', false]);/*dbug-log*///console.log('--updateTagsState tags[%O] field[%O] required?[%s]', tags, tField, isRequired);
    tField.required = isRequired;
    tField.misc.typeTags = tags;
    tField.value = getStillSelectedTags(tField.value, tags, md.defaultTagOpts);
    _state('setFieldState', ['top', 'InteractionTags', tField, null]);
}
function getStillSelectedTags(val, typeTags, dTags) {
    const valid = typeTags ? typeTags.concat(dTags) : dTags;
    const nVal = !val ? [] : val.filter(i => valid.indexOf(i) !== -1);
    return nVal.length ? nVal : null;
}
/* ------------------------ BUILD TAG-OPTS ---------------------------------- */
function buildTagOpts(typeTags) {
    const opts = typeTags.map(getTagOpt).concat(md.defaultTagOpts);
    return _opts('alphabetizeOpts', [opts]);
}
function getTagOpt(tag) {
    return { text: tag.displayName, value: tag.id };
}
/* ------------------------- LOAD TAG-OPTS ---------------------------------- */
function loadTagOpts(opts) {
    const selected = _cmbx('getSelVal', ['InteractionTags']).filter(ifDefaultTag);/*dbug-log*///console.log('loadTagOpts = %O, selectedDefaults = %O', opts, selected);
    _cmbx('replaceSelOpts', ['InteractionTags', opts]);
    afterTypeTagsLoaded(selected);
}
function ifDefaultTag(id) {
    return md.defaultTagOpts.some(o => o.value == id);
}
/* ---------------------- AFTER TYPE-TAGS LOAD ------------------------------ */
function afterTypeTagsLoaded(selectedDefaults) {
    const vals = [...getInitVal(), md.autoTag, ...selectedDefaults].filter(t=>t);/*dbug-log*///console.log('--afterTypeTagsLoaded select[%O]', vals);
    if (!vals.length) { return; }
    _cmbx('setSelVal', ['InteractionTags', vals]);
}
/**
 * Init-val is set when tag data is persistsed into a new interaction, and during
 * edit-form build to fill the field with record data.
 */
function getInitVal() {
    const initVal = $('#sel-InteractionTags').data('init-val');
    return initVal ? initVal : [];
}
/* ====================== ON TAG SELECTION ================================== */
export function onTagSelection(tags) {                              /*dbug-log*///console.log('onTagSelection [%O]', tags);
    ensureDefaultTagStaysSelected(tags);
    iForm.focusPinAndEnableSubmitIfFormValid();
}
function ensureDefaultTagStaysSelected(tags) {
    if (!md.autoTag || tags.indexOf(md.autoTag) !== -1 ) { return; }
    $('#sel-InteractionTags')[0].selectize.addItem(md.autoTag, 'silent');
}