/**
 *
 *
 * TOC
 */
import * as root from './root-form.js';
import * as build from './build-form.js';
import * as exit from './exit-form.js';

/* =================== INIT FORM ============================================ */
export function assembleForm() {
    return build.assembleForm(...arguments);
}
export function finishAndAppendRootForm() {
    return root.finishAndAppendRootForm(...arguments);
}
/* ============================== EXIT FORM ================================= */
/**
 * Removes the form container with the passed id, clears and enables the combobox,
 * and contextually enables to parent form's submit button. Calls the exit
 * handler stored in the form's params object.
 */
export function exitSubForm() {
    exit.exitSubForm(...arguments);
}
/** Returns popup and overlay to their original/default state. */
export function exitRootForm() {
    exit.exitRootForm(...arguments);
}
/* -------------------------- EDIT FORMS ------------------------------------ */
export function finishEditFormInit(entity, id) {
    // forms[entity].initCombos('top', entity);
    // return finishCmplxFormBuilds(entity, id);
}
// function finishCmplxFormBuilds(entity, id) {
//     const map = {
//         'citation': src.setSrcEditRowStyle.bind(null, 'citation'),
//         'publication': src.setSrcEditRowStyle.bind(null, 'publication'),
//         'location': addMapToLocationEditForm,
//     };
//     return !map[entity] ? Promise.resolve() : Promise.resolve(map[entity](id));
// }
// export function addSourceDataToFormState() {
//     return src.addSourceDataToFormState(...arguments);
// }