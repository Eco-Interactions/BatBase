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
export function initFormConfg(entity, fLvl, action, vals) {         /*dbug-log*///console.log('+--initFormConfg [%s][%s][%s] vals?[%O]', action, fLvl, entity, vals);
    const confg = getBaseConfg(entity, fLvl);
    initDisplayConfg(confg, action, !!confg.views.simple, vals);
    return confg;
}
function initDisplayConfg(confg, action, hasSimpleView, vals) {
    confg.display = action === 'create' && hasSimpleView ? 'simple' : 'all';
    setDisplayedFieldConfg(confg, confg.views, vals);
    delete confg.views;
}
/* ====================== REBUILD FORM-CONFG ================================ */
/* ------------------------ FORM-TYPE CHANGED ------------------------------- */
/** [onEntityTypeChangeUpdateConfg description] */
export function onEntityTypeChangeUpdateConfg(fLvl) {
    const confg = _state('getFormState', [fLvl]);
    updateConfg(confg);
}
/* ----------------------- FIELD-VIEW CHANGED ------------------------------- */
/** [onFieldViewChangeUpdateConfg description] */
export function onFieldViewChangeUpdateConfg(fLvl) {
    const confg = _state('getFormState', [fLvl]);
    confg.display = confg.display === 'all' ? 'simple' : 'all';
    updateConfg(confg);
}
function updateConfg(c) {                                           /*dbug-log*///console.log('   --updateConfg[%s][%O]', c.name, c);
    const vals = _state('getFieldValues', [c.group]);
    const mConfg = getBaseConfg(c.name, c.group, c.type);
    resetConfgDefaults(c);
    setDisplayedFieldConfg(c, mConfg.views, vals);
}
/* ---------------------- RESET VOLATILE CONFG ------------------------------ */
function resetConfgDefaults(c) {
    resetFieldConfgDefaults(c.fields);
}
function resetFieldConfgDefaults(fields) {                          /*dbug-log*///console.log('  --resetFieldConfgDefaults [%O]',fields);
    Object.values(fields).forEach(resetFieldDefaults);
}
function resetFieldDefaults(fConfg) {                               /*dbug-log*///console.log('     --resetFieldDefaults [%O]', fConfg);
    const props = [ 'combo', 'input', 'shown' ];  //handle required field reset without reseting those required in the base confgs
    props.forEach(p => delete fConfg[p]);                           /*dbug-log*///console.log('     --after reset [%O]', fConfg);
    if (fConfg.count) { fConfg.count = 1 }
}
/* ====================== CONFG BUILDERS ==================================== */
/* ----------------------- BASE CONFG --------------------------------------- */
/** [getBaseConfg description] INTERNAL USE */
export function getBaseConfg(entity, fLvl, type) {
    const confg = cUtil.getBaseFormConfg(entity, fLvl);
    if (confg.core) { mergeCoreEntityConfg(confg); }
    if (type) { cUtil.mergeIntoFormConfg(confg, confg.types[type]); }
    delete confg.types;                                             /*dbug-log*///console.log('   --getBaseConfg[%O]', confg.name, _u('snapshot', [confg]));
    return confg;
}
/** [mergeCoreEntityConfg description] */
function mergeCoreEntityConfg(c) {
    const coreConfg = cUtil.getBaseFormConfg(c.core);               /*dbug-log*///console.log('   --mergeCoreEntityConfg confg[%O], coreConfg[%O]', c, coreConfg);
    cUtil.mergeIntoFormConfg(c, coreConfg);
}
/* ------------------------- FIELD CONFG ------------------------------------ */
/** [setDisplayedFieldConfg description] INTERNAL USE */
export function setDisplayedFieldConfg(c, viewSets, vals = {}) {    /*dbug-log*///console.log("setDisplayedFieldConfg confg[%O] viewSets[%O] vals[%O]", c, viewSets, vals);
    c.infoSteps = 0;
    c.view = viewSets[c.display].map(row => getRowConfg(c, vals, row));
}
function getRowConfg(c, v, row) {
    return row.map(g => getGroupConfgs(c, v, g));
}
function getGroupConfgs(c, v, g) {
    if (Array.isArray(g)) { return getHorzGroup(c, v, g); }
    if (_u('isObj', [g])) { return getVertGroup(c, v, g); }
    return getSingleConfg(c, v, g);
}
function getHorzGroup(c, v, g) {
    return {
        class: g.class,
        confgs: g.map(f => getGroupConfgs(c, v, f)),
        dir: 'row'
    };
}
function getVertGroup(c, v, g) {
    return {
        class: g.class,
        confgs: g.fields.map(f => getGroupConfgs(c, v, f)),
        dir: 'col'
    };
}
function getSingleConfg(c, v, f) {
    return f === '' ? { emptyField: true } : getFieldConfg(c, v, f);
}
function getFieldConfg(c, v, name) {                                /*dbug-log*///console.log("   --getFieldConfg [%s] [%O]", name, c.fields[name]);
    const confg = getBaseConfg();                                   /*dbug-log*///console.log('       --fieldConfg [%O]', confg);
    if (confg.info) { ++c.infoSteps; }
    setFieldStyleClass(confg, c.group);
    confg.group = c.group;
    confg.pinnable = c.pinnable || false;
    setFieldValue(confg, v);
    return confg;

    function getBaseConfg() {
        return c.fields[name] ? c.fields[name] : getConfgByLabel(name);
    }
    function getConfgByLabel() {
        return Object.values(c.fields).find(f => f.label === name);
    }
}
/** [setFieldStyleClass description] */
function setFieldStyleClass(fConfg, fLvl) {
    if (fConfg.class) { return; } //Style class set in form-confg   /*dbug-log*///console.log('setFieldStyleClass fConfg[%O] fLvl[%s]', fConfg, fLvl);
    fConfg.class = fLvl + '-field';
}
/** [setFieldValue description] */
function setFieldValue(f, vals) {
    const val = vals[f.label] ? vals[f.label] : vals[f.name];
    if (!val) { return; }
    f.value = val;
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