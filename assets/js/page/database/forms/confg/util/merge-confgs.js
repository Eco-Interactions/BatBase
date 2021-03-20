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
/**
 * [ifEntityTypeConfgHandleMerge description]
 * @param  {[type]} fConfg [description]
 * @param  {[type]} mConfg Confg to merge into the form confg.
 * @return {[type]}        [description]
 */
export function mergeIntoFormConfg(fConfg, mConfg) {                /*dbug-log*///console.log('--mergeIntoFormConfg fConfg[%O] mConfg[%O]', fConfg, mConfg);
    Object.keys(mConfg).forEach(p => mergeConfgData(p, mConfg[p], fConfg));
    return fConfg ;
}
/* ======================== MERGE CONFG DATA ================================ */
function mergeConfgData(prop, mData, fConfg) {                      /*dbug-log*///console.log('--mergeConfgData mData[%s][%O] fConfg[%O]', prop, mData, fConfg);
    const map = {
        fields: mergeFieldConfg,
        views: mergeViewConfg
    };
    if (!map[prop]) { return fConfg[prop] = mData; }
    map[prop](fConfg[prop], mData);
}
/* ---------------- MERGE ENTITY-TYPE FIELD-CONFG --------------------------- */
/**
 * [mergeFieldConfg description]
 * @param  {[type]} mFields [description]
 * @return {[type]}         [description]
 */
export function mergeFieldConfg(cFields, mFields, finalMerge = false) {/*dbug-log*///console.log('<<<<<<<<<<<<<<<<<<--mergeFieldConfg cFields[%O] mFields[%O] finalMerge?[%s]', _u('snapshot', [cFields]), _u('snapshot', [mFields]), finalMerge);
    Object.keys(mFields).forEach(f => mergeFieldConfgs(f, mFields[f]));

    function mergeFieldConfgs(field, confg) {                        /*dbug-log*///console.log('--mergeFieldConfg field[%s] = [%O]', field, confg);
        Object.keys(confg).forEach(k => mergeFieldConfgData(field, k, confg[k]));
        if (!finalMerge) { return; }
        cFields[field].required = mFields[field].required;
    }
    function mergeFieldConfgData(field, prop, val) {                /*dbug-log*///console.log('--mergeFieldConfgData field[%s] prop[%s] = [%O] [%O]', field, prop, val, cFields);
        if (!cFields[field]) { cFields[field] = {}; }
        cFields[field][prop] = val;
        cFields[field].current = true;
    }
}
/* ----------------- MERGE ENTITY-TYPE VIEW-CONFG --------------------------- */
/**
 * [mergeViewConfg description]
 * @param  {[type]} mViews [description]
 * @return {[type]}        [description]
 */
function mergeViewConfg(cViews, mViews) {                            /*dbug-log*///console.log('--mergeViewConfg mViews[%O]', mViews);
    handleSimpleViewMerge(cViews, mViews);
    mergeFormViewConfg('all', cViews, mViews);
}
/** [handleSimpleViewMerge description] */
function handleSimpleViewMerge(cViews, mViews) {
    if (mViews.simple) { return mergeFormViewConfg('simple', cViews, mViews); }
    if (!cViews.simple || !mViews.all) { return; }
    cViews.simple = cViews.simple.concat(mViews.all)
}
/**
 * [mergeFormViewConfg description]
 * @param  {string} prop     View set.
 * @param  {array} viewData Values represent form rows. Strings are full-width
 *                           fields and arrays of strings are multi-field rows.
 */
function mergeFormViewConfg(prop, cViews, mViews) {                 /*dbug-log*///console.log('--mergeFormViewConfg prop[%s] = [%O]', prop, mViews);
    handleTargetFormViewInit(prop);
    cViews[prop] = cViews[prop].concat(mViews[prop]);
    /** Inits missing optional view-sets with the 'all' view-set fields. */
    function handleTargetFormViewInit(prop) {                        /*dbug-log*///console.log('--handleTargetFormViewInit prop[%s] current?[%O]', prop, cViews[prop]);
        if (cViews[prop]) { return; } //View present in form confg
        cViews[prop] = cViews.all.map(v => v);
    }
}
