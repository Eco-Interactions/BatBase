/**
 * Mangages the Interaction Type and Interaction Tag fields in the interaction form.
 *
 * Exports:
 *     initTypeField
 *     onTypeSelection
 *     resetTypeAndTagMemory
 *     setTypeEditVal
 *
 * TOC
 *     FIELD STATE
 *     BUILD VALID OPTIONS
 *     LOAD OPTIONS
 *         FIELD INIT-VAL
 *     ON TYPE SELECTION
 */
import { _cmbx } from '~util';
import { _val, _confg, _state } from '~form';
import * as iForm from '../int-form-main.js';
/* ========================= FIELD STATE ==================================== */
/**
 * Module-scope data.
 * defaultTagOpts:  These tags are always valid and available to select.
 * object:          Object-taxon subGroup id
 * subject:         Subject-taxon subGroup id
 * validInts:       Valid interaction ids for the selected subject and object groups
 */
let md = getTypeDefaultState();

export function resetTypeAndTagMemory() {
    md = getTypeDefaultState();
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
 * @param  {int} objGroup   Taxon sub-group id
 */
export function initTypeField(ids) {                                /*perm-log*/console.log(        '+--initTypeField subjGroup[%s] -> objGroup[%s]', ids[0], ids[1]);
    if (ifGroupsMatchState(...ids)) { return _cmbx('enableCombobox', ['InteractionType']); }
    md.subject = ids[0];
    md.object = ids[1];
    loadIntTypeOptions();
}
function ifGroupsMatchState(subjGroup, objGroup) {                  /*dbug-log*///console.log('ifGroupsMatchState subj[%s][%s] obj[%s][%s]', subjGroup, md.subject, objGroup, md.object);
    return md.subject == subjGroup && md.object == objGroup;
}
/* ====================== BUILD VALID OPTIONS =============================== */
function loadIntTypeOptions() {
    const vIntTypeOpts = buildValidInteractionTypeOptions();
    loadTypeOptions(vIntTypeOpts);
    if (!vIntTypeOpts.length) { return alertNoValidInteractions(); }
    _val('clearAnyGroupAlerts');
    _cmbx('enableCombobox', ['InteractionType', true]);
}
function buildValidInteractionTypeOptions() {
    const data = _state('getEntityRcrds', [['interactionType', 'validInteraction']]);/*dbug-log*///console.log('buildInteractionTypeOptions for validInts = %O data = %O', md.validInts, data);
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
    // _state('setFormState', ['top', 'valData', md.validInts]); //Not needed yet.
    return types;

    function ifValidAddData(id) {
        const vInt = validInteractions[id];                         /*dbug-log*///console.log('--ifValidAddData = %O', vInt);
        if (!ifGroupsMatchState(vInt.subjectSubGroup, vInt.objectSubGroup)) { return; }
        md.validInts[id] = validInteractions[id];                   /*dbug-log*///console.log('---adding ValidInteraction = %O', validInteractions[id]);
        types.push({ type: validInteractions[id].interactionType, valId: id});
    }
}
/* ----------------- ALERT NO VALID INTERACTION-TYPES ----------------------- */
function alertNoValidInteractions() {
    onTypeClear();
    _val('showFormValAlert', ['InteractionType', 'noValidInts', 'top']);
    _cmbx('focusCombobox', ['InteractionTags', false]);
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
/* -------------------- FIELD INIT-VAL -------------------------------------- */
export function setTypeEditVal(tId) {
    const vId = Object.keys(md.validInts).find(ifTypeMatches);   /*dbug-log*///console.log('--setTypeEditVal vId[%s]', vId)
    _cmbx('setSelVal', ['InteractionType', vId]);

    function ifTypeMatches(id) {
        return md.validInts[id].interactionType === tId;
    }

}
/* ======================== ON TYPE SELECTION =============================== */
export function onTypeSelection(val) {
    if (!val) { return onTypeClear(); }
    const validInt = md.validInts[val];                             /*dbug-log*///console.log('onTypeSelection validInt[%O]', validInt)
    setInteractionTypeFieldData(validInt.interactionType);
    iForm.focusPinAndEnableSubmitIfFormValid('InteractionType');
    if (!validInt.tags.length) { return iForm.clearTypeTagData(); }
    iForm.loadInteractionTypeTags(validInt.tags, validInt.tagRequired);
}
function onTypeClear() {
    iForm.clearTypeTagData();
    setInteractionTypeFieldData(null);
    $('#sel-InteractionType').data('init-val', null);
}
function setInteractionTypeFieldData(val) {
    _state('setFieldState', ['top', 'InteractionType', val]);
}