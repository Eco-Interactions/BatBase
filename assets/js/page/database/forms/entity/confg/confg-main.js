/**
 * Returns the form-config for the passed entity and current field-display (all|simple).
 * TODO: REFACTOR AND DOCUMENT
 * { *: default confg-properties returned
 *    core: EntityName, ucfirst
 *    *data: { *edit: [dataProp, ..., create: [dataProp, ..., ] }
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
 *            prop: { core||detail: serverPropString } //used to set edit data
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
 *     GET CONFG DATA
 */
import { _u } from '~util';
import { _state } from '~form';
import * as cUtil from './util/confg-util-main.js';
import { getGroupFieldViewOrder } from './entity/group-confg.js';
/* ====================== INIT FORM-CONFG =================================== */
export function finishFormStateInit(c) {                            /*temp-log*/console.log('+--finishFormStateInit confg[%O]', c);
    c.display = c.action === 'create' && c.views.simple ? 'simple' : 'all';
    updateConfg(c);
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
function updateConfg(c) {                                           /*temp-log*/console.log('   --updateConfg[%s][%O]', c.name, c);
    const mConfg = getBaseConfg(c.action, c.name, c.type);
    resetConfgDefaults(c);
    cUtil.mergeFieldConfg(c.fields, mConfg.fields, 'finalMerge');
    handleCurrentFieldView(c, mConfg.views);
    updateActiveFieldFlags(c.fields);
}
function handleCurrentFieldView(c, mViews) {
    const views = c.action === 'select' ? getGroupFieldView(c) : mViews;/*dbug-log*///console.log(' views[%O]', views);
    cUtil.buildViewConfg(c, views);
}
function getGroupFieldView(c) {                                     /*dbug-log*///console.log('--getGroupFieldView c[%O]', c)
    return {
        all: getGroupFieldViewOrder(c.fields['Sub-Group'])
    };
}
/* ---------------------- RESET VOLATILE CONFG ------------------------------ */
function resetConfgDefaults(c) {
    resetFieldConfgDefaults(c.fields);
    delete c.view
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
function setActiveFlag(field) {                                     /*dbug-log*///console.log('  --setActiveFlag fields[%O]', field);
    field.active = field.current || false;
    delete field.current;
}
/* ====================== CONFG BUILDERS ==================================== */
export function mergeIntoFormConfg(confg, mConfg) {
    cUtil.mergeIntoFormConfg(confg, mConfg);
}
export function buildViewConfg(c) {
    return cUtil.buildViewConfg(c, c.views);
}
/* ----------------------- BASE CONFG --------------------------------------- */
/** [getBaseConfg description] INTERNAL USE */
export function getBaseConfg(action, entity, type) {                /*dbug-log*///console.log('   --getBaseConfg action[%s] entity[%s] type?[%O]', action, entity, type);
    const confg = cUtil.getBaseFormConfg(action, entity);
    if (confg.core) { mergeCoreEntityConfg(confg); }
    if (type) { mergeIntoFormConfg(confg, confg.types[type]); }
    delete confg.types;                                             /*dbug-log*///console.log('   --[%s] = [%O]', confg.name, _u('snapshot', [confg]));
    return confg;
}
/** [mergeCoreEntityConfg description] */
function mergeCoreEntityConfg(c) {
    const coreConfg = cUtil.getBaseFormConfg(c.action, c.core);     /*dbug-log*///console.log('   --mergeCoreEntityConfg confg[%O], coreConfg[%O]', c, coreConfg);
    mergeIntoFormConfg(c, coreConfg);
}
/* ====================== GET CONFG DATA ==================================== */
export function getConfgData(entity, prop) {
    const cfg = getBaseConfg(null, entity);
    return cfg[prop];
}