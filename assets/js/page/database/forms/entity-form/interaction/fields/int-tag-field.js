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
 *         INIT TAG FIELD
 *         ON TAG SELECTION
 *     SHARED
 *         FIELD INIT-VAL
 */
import { _cmbx } from '~util';
import { _confg, _state } from '~form';
import * as iForm from '../int-form-main.js';
/**
 * defaultTagOpts:  These tags are always valid and available to select.
 * object:          Object-taxon subGroup id
 * subject:         Subject-taxon subGroup id
 * validInts:       Valid interaction ids for the selected subject and object groups
 */
let app = getTagFieldDefaultState();
// load default tags on form init
export function resetTagState() {
    app = getTagFieldDefaultState();
}
function getTagFieldDefaultState() {
    return {
        defaultTagOpts: [],
        requiredTag: null,
        validInts: {}
    };
}
/* ======================== INIT DEFAULT-TAGS =============================== */
/** Loads the default interaction tags (eg. 'Secondary') and enables the combobox. */
export function initTagField() {
    const tags = _state('getEntityRcrds', ['tag']);
    const defaults = _confg('getFormConfg', ['interaction']).defaultTags;
    app.defaultTagOpts = Object.keys(tags).map(ifDefaultTagGetOpt).filter(o=>o);
    loadTagOpts(app.defaultTagOpts);

    function ifDefaultTagGetOpt(id) {
        if (defaults.indexOf(tags[id].displayName) === -1) { return null; }
        return { text: tags[id].displayName, value: id }
    }
}
/* =================== CLEAR INTERACTION-TYPE TAGS ========================== */
export function clearTypeTagData() {
    loadTagOpts(app.defaultTagOpts);
    app.requiredTag = null;
}
/* ==================== LOAD INTERACTION-TYPE TAGS ========================== */
export function loadInteractionTypeTags(tags) {
    if (tags.length === 1) { handleRequiredTag(tags[0]); }
    addTypeTagOpts(tags);
}
/* -------------------------- REQUIRED TAG ---------------------------------- */
/**
 * If the selected ValidInteraction has one tag, that tag is required and will be
 * filled programatically. If there is more than one, at least one is required,
 * though this will be handled through later validation.
 * @param  {array} typeTags  Tags for the selected ValidInteraction type
 */
function handleRequiredTag(typeTag) {
    app.requiredTag = typeTag.id;
    const initVal = $('#sel-InteractionTags').data('init-val') || [];
    initVal.push(typeTag.id);                                       /*dbug-log*///console.log('handleRequiredTag tag[%s] initVal[%O]', typeTag.id, initVal);
    $('#sel-InteractionTags').data('init-val', initVal);
}
function addTypeTagOpts(typeTags) {                                 /*dbug-log*///console.log('addTypeTagOpts typeTags = %O', typeTags);
    loadTagOpts(buildTagOpts(typeTags));
}
/* ------------------------ BUILD TAG-OPTS ---------------------------------- */
function buildTagOpts(typeTags) {
    const tOpts = [...app.defaultTagOpts];
    typeTags.forEach(addValidTagOpt);
    return _cmbx('alphabetizeOpts', [tOpts]);

    function addValidTagOpt(tag) {
        tOpts.push({ text: tag.displayName, value: tag.id });
    }
}
/* ------------------------- LOAD TAG-OPTS ---------------------------------- */
function loadTagOpts(opts) {                                        /*dbug-log*///console.log('loadTagOpts = %O,', opts);
    const selected = _cmbx('getSelVal', ['InteractionTags']);
    _cmbx('replaceSelOpts', ['InteractionTags', opts]);
    selectTagInitVal(selected);
}
/* ------------------------ INIT-VAL ---------------------------------------- */
/**
 * Init-val is set when there is a required tag, when tag data is persistsed into
 * a new interaction, and during edit-form build to fill the field with record data.
 */
function selectTagInitVal(prevSelected) {
    let vals = $('#sel-InteractionTags').data('init-val');
    vals = vals ? vals.map(v=>v) : [];
    vals = vals.concat(prevSelected);                               /*dbug-log*///console.log('selectTagInitVal %O', vals);
    if (!vals.length) { return; }
    _cmbx('setSelVal', ['InteractionTags', vals]);
}
/* ====================== ON TAG SELECTION ================================== */
export function onTagSelection(tags) {                              /*dbug-log*///console.log('tags = ', tags);
    ensureDefaultTagStaysSelected(tags);
    iForm.checkIntFieldsAndEnableSubmit();
}
function ensureDefaultTagStaysSelected(tags) {
    if (!app.requiredTag || tags.indexOf(app.requiredTag) !== -1 ) { return; }
    $('#sel-InteractionTags')[0].selectize.addItem(app.requiredTag, 'silent');
}