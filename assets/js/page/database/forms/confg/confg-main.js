/**
 * Returns the form-config for the passed entity and current field-display (all|simple).
 * { *: default confg-properties returned
 *    core: EntityName, ucfirst
 *    *display: view, //Defaults to 'simple' display, if defined.
 *    *fields: {
 *         //CORE.FIELDS AND TYPE.FIELDS WILL BE MERGED IN.
 *        FieldName: { //DisplayName
 *            class: "",
 *            combo: true, //set during input build to trigger selectize combobox init
 *            id: '' //set using 'name' otherwise
 *            info: { intro: "", *tooltip: ""(req) },
 *            label: Field label text (Name-prop used if absent)
 *            *name: FieldName,  [REQUIRED]
 *            prep: funcNameString //prep data for server when different than exactly formEntity:FieldName
 *            required: true, //Set if true
 *            *type: "", null if field-data auto-derived [REQUIRED]
 *        }, ...
 *    },
 *    *group: top|sub|sub2, //SET DURING CONFG BUILD
 *    infoSteps: ##, //Count of fields with steps for the form tutorial, intro.js
 *    misc: {
 *        entityProp: value
 *    },
 *    *name: formName (entity or su|object) ucfirst
 *    onInvalidInput: Fired when an input fails HTML validation  //TODO
 *    onValidInput: Fired after invalid input validates (perhaps merge with all checkReqFieldsAndToggleSubmitBttn calls?)  //TODO
 *    prep: [], //server-data handled before form-submit
 *    *style: '', //CSS style classes: [lrg|med|sml]-form
 *    type: Type name, once selected. Only for entities with subTypes
 *    types: { //ENTITY SUB-TYPES
 *         Type name: {
 *              name: (req)
 *              [confg prop with type-data]
 *         }
 *    },
 *    view: [] //RETURNED VALUE IS views[display] MAPPED WITH EACH FIELD'S CONFG.
 * }
 *
 * Export
 *     getFormConfg
 *     onEntityTypeChangeUpdateConfg
 *     onFieldViewChangeUpdateConfg
 *
 * TOC
 *     INIT FORM-CONFG
 *     REBUILD FORM-CONFG
 *         FORM-TYPE CHANGED
 *         FIELD-VIEW CHANGED
 *     CONFG BUILDERS
 *         BASE CONFG
 *         FIELD CONFG
 */
import { _u } from '~util';
import { _state } from '~form';
import * as cUtil from './util/confg-util-main.js';
/* ====================== INIT FORM-CONFG =================================== */
export function getInitFormConfg(entity, fLvl, action, vals) {      /*dbug-log*///console.log('+--getInitFormConfg [%s][%s][%s] vals?[%O]', action, fLvl, entity, vals);
    const confg = getBaseConfg(entity, fLvl);
    confg.group = fLvl;
    initDisplayConfg(confg, action, !!confg.views.simple, vals);
    return confg;
}
function initDisplayConfg(confg, action, hasSimpleView, vals) {
    confg.display = action === 'create' && hasSimpleView ? 'simple' : 'all';
    cUtil.buildViewConfg(confg, confg.views, vals);
    delete confg.views;
}
/* ====================== ON FORM-CONFG CHANGE ============================== */
/* ------------------------ FORM-TYPE CHANGED ------------------------------- */
/** [onEntityTypeChangeUpdateConfg description] */
export function onEntityTypeChangeUpdateConfg(fLvl) {
    const confg = _state('getFormState', [fLvl]);                   /*dbug-log*///console.log('--onEntityTypeChangeUpdateConfg confg[%O]', confg)
    updateConfg(confg);
}
/* ----------------------- FIELD-VIEW CHANGED ------------------------------- */
/** [onFieldViewChangeUpdateConfg description] */
export function onFieldViewChangeUpdateConfg(fLvl) {
    const confg = _state('getFormState', [fLvl]);
    confg.display = confg.display === 'all' ? 'simple' : 'all';
    updateConfg(confg);
}
/* ====================== REBUILD FORM-CONFG ================================ */
function updateConfg(c) {                                           /*dbug-log*///console.log('   --updateConfg[%s][%O]', c.name, c);
    const vals = _state('getFieldValues', [c.group]);
    const mConfg = getBaseConfg(c.name, c.group, c.type);
    resetConfgDefaults(c);
    cUtil.mergeFieldConfg(c.fields, mConfg.fields, 'finalMerge');
    cUtil.buildViewConfg(c, mConfg.views, vals);
    updateActiveFieldFlags(c.fields);
}
/* ---------------------- RESET VOLATILE CONFG ------------------------------ */
function resetConfgDefaults(c) {
    resetFieldConfgDefaults(c.fields);
    delete c.views;
}
function resetFieldConfgDefaults(fields) {                          /*dbug-log*///console.log('  --resetFieldConfgDefaults [%O]',fields);
    Object.values(fields).forEach(resetFieldDefaults);
}
function resetFieldDefaults(fConfg) {                               /*dbug-log*///console.log('     --resetFieldDefaults [%O]', fConfg);
    const props = [ 'active', 'combo', 'input', 'shown' ];
    props.forEach(p => delete fConfg[p]);                           /*dbug-log*///console.log('     --after reset [%O]', fConfg);
    if (fConfg.count) { fConfg.count = 1 }
}
function updateActiveFieldFlags(fields) {
    Object.values(fields).forEach(setActiveFlag);
}
function setActiveFlag(field) {
    field.active = field.current || false;
    delete field.current;
}
/* ====================== CONFG BUILDERS ==================================== */
export function mergeIntoFormConfg(confg, mConfg) {
    cUtil.mergeIntoFormConfg(confg, mConfg);
}
/* ----------------------- BASE CONFG --------------------------------------- */
/** [getBaseConfg description] INTERNAL USE */
export function getBaseConfg(entity, fLvl, type) {
    const confg = cUtil.getBaseFormConfg(entity, fLvl);
    if (confg.core) { mergeCoreEntityConfg(confg, fLvl); }
    if (type) { mergeIntoFormConfg(confg, confg.types[type]); }
    delete confg.types;                                             /*dbug-log*///console.log('   --getBaseConfg[%O]', confg.name, _u('snapshot', [confg]));
    return confg;
}
/** [mergeCoreEntityConfg description] */
function mergeCoreEntityConfg(c, fLvl) {
    const coreConfg = cUtil.getBaseFormConfg(c.core, fLvl);               /*dbug-log*///console.log('   --mergeCoreEntityConfg confg[%O], coreConfg[%O]', c, coreConfg);
    mergeIntoFormConfg(c, coreConfg);
}
/* ====================== GET DEFAULT-CONFG ================================= */
// export function getDefaultConfgData(entity, params) {
//     const confg = getBaseConfg(entity, null);
//     const map = {
//         publication: getDefaultCitationType
//     };
//     return map[entity] ? map[entity](confg, ...arguments) : false;
// }
// function getDefaultCitationType(confg, e, pType) {
//     return confg.types[pType.displayName].misc.defaultCitType;
// }