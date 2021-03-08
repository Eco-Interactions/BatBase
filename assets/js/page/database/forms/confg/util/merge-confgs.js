/**
 * TODO: Document
 *
 * Export
 *     mergeIntoFormConfg
 *
 * TOC
 *     FORM CONFG
 *         TAXON SELECT FORM CONFG
 *         CREATE/EDIT FORM CONFG
 *             CORE-ENTITY CONFG
 *     SERVER FIELD CONFG
 */
import { _u } from '~util';
const lcl = {
    confg: null
};
/**
 * [ifEntityTypeConfgHandleMerge description]
 * @param  {[type]} fConfg [description]
 * @param  {[type]} mConfg Confg to merge into the form confg.
 * @return {[type]}        [description]
 */
export function mergeIntoFormConfg(fConfg, mConfg) {                /*dbug-log*///console.log('--mergeIntoFormConfg fConfg[%O] mConfg[%O]', fConfg, mConfg);
    lcl.confg = fConfg;
    Object.keys(mConfg).forEach(prop => mergeConfgData(prop, mConfg[prop]));
    return lcl.confg;
}
/* ======================== MERGE CONFG DATA ================================ */
function mergeConfgData(prop, mData) {                              /*dbug-log*///console.log('mergeConfgData prop[%s][%O]', prop, mData);
    const map = {
        fields: mergeFieldConfg,
        views: mergeViewConfg
    };
    if (!map[prop]) { return; }
    map[prop](mData);
}
/* ---------------- MERGE ENTITY-TYPE FIELD-CONFG --------------------------- */
/**
 * [mergeFieldConfg description]
 * @param  {[type]} mFields [description]
 * @return {[type]}         [description]
 */
function mergeFieldConfg(mFields) {                                 /*dbug-log*///console.log('mergeFieldConfg mFields[%O]', mFields);
    Object.keys(mFields).forEach(f => mergeFieldConfgs(f, mFields[f]));
}
function mergeFieldConfgs(field, confg) {                            /*dbug-log*///console.log('mergeFieldConfg field[%s] = [%O]', field, confg);
    Object.keys(confg).forEach(k => mergeFieldConfgData(field, k, confg[k]));
}
function mergeFieldConfgData(field, prop, val) {                    /*dbug-log*///console.log('mergeFieldConfgData field[%s] prop[%s] = [%O] [%O]', field, prop, val, lcl.confg.fields);
    if (!lcl.confg.fields[field]) { lcl.confg.fields[field] = {}; }
    lcl.confg.fields[field][prop] = val;
}
/* ----------------- MERGE ENTITY-TYPE VIEW-CONFG --------------------------- */
/**
 * [mergeViewConfg description]
 * @param  {[type]} mViews [description]
 * @return {[type]}        [description]
 */
function mergeViewConfg(mViews) {                                   /*dbug-log*///console.log('mergeViewConfg mViews[%O]', mViews);
    handleSimpleViewMerge(mViews);
    mergeFormViewConfg('all', mViews);
}
/** [handleSimpleViewMerge description] */
function handleSimpleViewMerge(mViews) {
    if (mViews.simple) { return mergeFormViewConfg('simple', mViews); }
    if (!lcl.confg.views.simple || !mViews.all) { return; }
    lcl.confg.views.simple = lcl.confg.views.simple.concat(mViews.all)
}
/**
 * [mergeFormViewConfg description]
 * @param  {string} prop     View set.
 * @param  {array} viewData Values represent form rows. Strings are full-width
 *                           fields and arrays of strings are multi-field rows.
 */
function mergeFormViewConfg(prop, mViews) {                         /*dbug-log*///console.log('mergeFormViewConfg prop[%s] = [%O]', prop, mViews);
    handleTargetFormViewInit(prop);
    lcl.confg.views[prop] = lcl.confg.views[prop].concat(mViews[prop]);
}
/** Inits missing optional view-sets with the 'all' view-set fields. */
function handleTargetFormViewInit(prop) {                             /*dbug-log*///console.log('handleTargetFormViewInit prop[%s] current?[%O]', prop, lcl.confg.views[prop]);
    if (lcl.confg.views[prop]) { return; } //View present in form confg
    lcl.confg.views[prop] = lcl.confg.views.all.map(v => v);
}
