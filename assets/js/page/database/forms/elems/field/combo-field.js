/**
 * Data-entry form combobox methods.
 * TODO: DOCUMENT
 *
 * Export
 *     initFormCombos
 *     resetFormCombobox
 *     setSilentVal
 *
 * TOC
 *     GET INPUT
 *     COMBO UTIL
 */
import { _cmbx, _u } from '~util';
import { _state } from '~form';
/* ========================== INIT ========================================== */
/**
 * Inits 'selectize' for each select elem in the form's 'selElems' array
 * according to the 'selMap' config. Empties array after intializing.
 */
export function initFormCombos(fLvl, cConfg) {
    const cFields = _state('getComboFields', [fLvl]);               /*dbug-log*///console.log('initFormCombos [%s] cConfg[%O] cFields[%O]', fLvl, cConfg, cFields);
    cFields.forEach(f => selectizeElem(f, cConfg[f.id]));
}
function selectizeElem(fConfg, confg) {                             /*dbug-log*///console.log("   Initializing [%s] selectizeConfg[%O]", fConfg.id, confg);
    confg.confgName = getFormComboConfgName(fConfg, confg);
    confg.id = getFormComboId(fConfg, confg);
    confg.name = getFormComboDisplayName(fConfg);
    _cmbx('initCombobox', [confg]);
    if (!confg.create) { _cmbx('removeOpt', [fConfg.id, 'create']); }
}
function getFormComboConfgName(fConfg, confg) {
     const name = confg.confgName ? confg.confgName : fConfg.id;
     return appendCountIfMultiInputField(name, fConfg.count);
}
function getFormComboId(fConfg, confg) {
    const id = confg.id ? confg.id : '#sel-'+fConfg.id;
     return appendCountIfMultiInputField(id, fConfg.count);
}
function getFormComboDisplayName(fConfg) {
    return fConfg.label ? fConfg.label : fConfg.name;
}
function appendCountIfMultiInputField(string, count) {
    return count ? string + count : string;
}
/* =========================== UTILITY ====================================== */
/* ---------------------------- SET ----------------------------------------- */
/** The change event is not triggered, so the field data is updated here. */
export function setSilentVal(fLvl, field, val) {
    _cmbx('setSelVal', [field, val, 'silent']);
    _state('setFieldState', [fLvl, field, val]);
}
/* -------------------------------- RESET ----------------------------------- */
/**
 * Clears and enables the parent combobox for the exited form. Removes any
 * placeholder options and, optionally, brings it into focus.
 */
export function resetFormCombobox(fLvl, focus) {
    const field = _state('getFormState', [fLvl, 'combo']);          /*dbug-log*///console.log('resetFormCombobox [%s] field[%s] focus?[%s]', fLvl, field, focus);
    if (!field) { return; }
    _cmbx('resetCombobox', [field]);
    _cmbx('enableCombobox', [field]);
    _cmbx('focusCombobox', [field, focus]);
}