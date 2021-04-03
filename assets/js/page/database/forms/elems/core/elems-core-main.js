/**
 * Initiates and appends the main entity form.
 * TOC
 *     BUILD FORM
 *     EXIT FORM
 */
import { _cmbx, _el } from '~util';
import { _elems, _state, getNextFormLevel } from '~form';
import * as build from './build/form-build-main.js';
import * as bttn from './buttons/form-buttons.js';
import * as footer from './footer/form-footer.js';

export function initForm(p) {                                       /*dbug-log*///console.log('+--initForm params[%O]', p);
    p.group = 'top';
    return _state('initFormState', [p])
        .then(fS => buildAndAppendForm(fS.forms.top, p.appendForm))
        .then(() => finishFormBuild(p.initCombos, p.name))
        .then(() => 'success');
}
export function initSubForm(p) {                                    /*dbug-log*///console.log('+--initSubForm params[%O]', p);
    if (ifFormInUse(p.group)) { return alertInUse(p.group); }
    return _state('buildNewFormState', [p])
        .then(fState => buildAndAppendForm(fState, p.appendForm))
        .then(() => finishFormBuild(p.initCombos, p.name))
        .then(() => updateParentForm(p))
        .then(() => 'success');
}
function updateParentForm(p) {                                      /*dbug-log*///console.log('--updateParentForm');
    const pLvl = getNextFormLevel('parent', p.group);
    _elems('toggleSubmitBttn', [pLvl, false]);
    _cmbx('enableCombobox', [p.combo, false])
}
export function getExitButton() {
    return bttn.getExitButton(...arguments);
}
export function finishFormBuild(initCombos, entity) {               /*dbug-log*///console.log('--finishFormBuild entity[%s] initCombos?[%O]', entity, initCombos);
    _elems('setDynamicFormStyles', [entity]);
    if (!initCombos) { return; }
    initCombos();
}
/* ----------------- IF OPEN SUB-FORM ISSUE --------------------------------- */
export function ifFormInUse(fLvl) {
    return fLvl ? $(`#${fLvl}-form`).length !== 0 : false;
}
export function alertInUse(fLvl) {
    _val('alertFormOpen', [fLvl]);
}
/* ============================== EXIT FORM ================================= */
/**
 * Removes the form container with the passed id, clears and enables the combobox,
 * and contextually enables to parent form's submit button. Calls the exit
 * handler stored in the form's params object.
 */
export function exitSubForm() {
    build.exitSubForm(...arguments);
}
/** Returns popup and overlay to their original/default state. */
export function exitRootForm() {
    build.exitRootForm(...arguments);
}
/* ============================= BUILD FORM ================================= */
function buildAndAppendForm(fState, appendForm) {                   /*dbug-log*///console.log('--buildAndAppendForm fState[%O] appendFunc[%O]', fState, appendForm);
    return getFormPieces(fState)
        .then(elems => assembleAndAppend(elems, fState, appendForm));
}
/** [getFormPieces description] */
function getFormPieces(fState) {
    const elems = {
        footer: footer.getFormFooter(fState.name, fState.group, fState.action),
        tutBttn: bttn.getFormHelpElems(fState.group, fState.infoSteps),
    };
    if (fState.group === 'top') { addExitBttn(elems); }

    return _elems('getFormRows', [fState.name, fState.group])
        .then(addRowsAndReturnPieces);

    function addRowsAndReturnPieces(rows) {
        elems.rows = rows;
        return elems;
    }
}
function addExitBttn(elems) {
    elems.exitBttn = bttn.getExitButton(_elems.bind(null, 'exitRootForm'));
}
function assembleAndAppend(elems, fState, appendForm) {             /*dbug-log*///console.log('--assembleAndAppend elems[%O] fState[%O] appendFunc[%O]', elems, fState, appendForm);
    const form = build.assembleForm(elems, fState);
    if (appendForm) { return appendForm(form); }
    build.finishAndAppendRootForm(form, fState, elems);
}