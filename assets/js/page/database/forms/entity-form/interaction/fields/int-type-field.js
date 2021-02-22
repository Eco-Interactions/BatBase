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
 *     FIELD STATE
 *     BUILD VALID OPTIONS
 *     LOAD OPTIONS
 *         FIELD INIT-VAL
 *     ON TYPE SELECTION
 */
import { _cmbx } from '~util';
import { _confg, _state } from '~form';
import * as iForm from '../int-form-main.js';
/* ========================= FIELD STATE ==================================== */
/**
 * defaultTagOpts:  These tags are always valid and available to select.
 * object:          Object-taxon subGroup id
 * subject:         Subject-taxon subGroup id
 * validInts:       Valid interaction ids for the selected subject and object groups
 */
let app = getTypeDefaultState();

export function resetTypeAndTagMemory() {
    app = getTypeDefaultState();
}
function getTypeDefaultState() {
    return {
        object: null,
        subject: null,
        validInts: {}
    };
}
/**
 * Once both a subject and object taxon have been selected, all valid interaction
 * types are loaded in the field combobox,
 * @param  {int} subjGroup  Taxon sub-group id
 * @param  {int} objGroup)  Taxon sub-group id
 */
export function initTypeField(subjGroup, objGroup) {                /*perm-log*/console.log(        '+--initTypeField subjGroup[%s] -> objGroup[%s]', subjGroup, objGroup);
    if (ifGroupsMatchState(subjGroup, objGroup)) { return; }
    app.subject = subjGroup;
    app.object = objGroup;
    loadIntTypeOptions();
}
function ifGroupsMatchState(subjGroup, objGroup) {                  /*dbug-log*///console.log('ifGroupsMatchState subj[%s][%s] obj[%s][%s]', subjGroup, app.subject, objGroup, app.object);
    return app.subject == subjGroup && app.object == objGroup;
}
/* ====================== BUILD VALID OPTIONS =============================== */
function loadIntTypeOptions() {
    loadTypeOptions(buildValidInteractionTypeOptions());
    _cmbx('enableCombobox', ['InteractionType', true]);
}
function buildValidInteractionTypeOptions() {
    const data = _state('getEntityRcrds', [['interactionType', 'validInteraction']]);/*dbug-log*///console.log('buildInteractionTypeOptions for validInts = %O data = %O', app.validInts, data);
    return getAllValidInteractionTypes(data.validInteraction).map(buildIntTypeOpt)

    function buildIntTypeOpt(vData) {
        const txt = data.interactionType[vData.type].displayName;
        return { text: txt, value: vData.valId };
    }
}
/**
 * Valid Interaction entties describe the valid combinations of subject & object
 * subGroups, interaction types, and tags. The ValidInteraction data is added to the
 * form's state.
 * @return {ary} Objects with each valid InteractionType id and it's ValidInteraction id
 */
function getAllValidInteractionTypes(validInteractions) {           /*dbug-log*///console.log('-getAllValidInteractionTypes = %O', validInteractions);
    const types = [];
    Object.keys(validInteractions).forEach(ifValidAddData);
    _state('setFormProp', ['top', 'valData', app.validInts]);
    return types;

    function ifValidAddData(id) {
        const vInt = validInteractions[id];                         /*dbug-log*///console.log('--ifValidAddData = %O', vInt);
        if (!ifGroupsMatchState(vInt.subjectSubGroup, vInt.objectSubGroup)) { return; }
        app.validInts[id] = validInteractions[id];                  /*dbug-log*///console.log('---adding ValidInteraction = %O', validInteractions[id]);
        types.push({ type: validInteractions[id].interactionType, valId: id});
    }
}
/* ====================== LOAD OPTIONS ====================================== */
function loadTypeOptions(opts) {                                    /*dbug-log*///console.log('loadTypeOptions = %O', opts)
    const prevType = _cmbx('getSelVal', [`InteractionType`]);
    _cmbx('replaceSelOpts', ['InteractionType', opts]);
    selectTypeInitVal(prevType, opts);
}
/* -------------------- FIELD INIT-VAL -------------------------------------- */
/**
 * Init-val is set when type data is persistsed into a new interaction, and during
 * edit-form build to fill the field with record data.
 */
function selectTypeInitVal(prevType, typeOpts) {
    const initVal = $('#sel-InteractionType').data('init-val') || prevType;
    const validType = typeOpts.find(opt => opt.value == initVal);   /*dbug-log*///console.log('selectInitValIfValidType initVal?[%s] validType?[%s]', initVal, validType);
    if (validType) {
        _cmbx('setSelVal', ['InteractionType', initVal]);
    } else {
        iForm.clearTypeTagData();
        _cmbx('focusCombobox', ['InteractionType']);
    }
}
/* ======================== ON TYPE SELECTION =============================== */
export function onTypeSelection(val) {
    if (!val) { return onTypeClear(); }
    const validInt = app.validInts[val];
    setInteractionTypeFieldData(validInt.interactionType);
    iForm.loadInteractionTypeTags(validInt.tags);
    iForm.focusPinAndEnableSubmitIfFormValid('InteractionType');
}
function onTypeClear() {
    iForm.clearTypeTagData();
    setInteractionTypeFieldData(null);
}
function setInteractionTypeFieldData(val) {
    _state('setFormFieldData', ['top', 'InteractionType', val]);
}