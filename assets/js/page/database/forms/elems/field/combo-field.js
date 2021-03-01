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
    const cFields = _state('getFormComboFields', [fLvl]);           /*dbug-log*///console.log('initFormCombos [%s] cConfg[%O] cFields[%O]', fLvl, cConfg, cFields);
    cFields.forEach(f => selectizeElem(f, cConfg[f.id]));
    _state('setFormProp', [fLvl, 'selElems', []]);

}
function selectizeElem(fConfg, confg) {                             /*dbug-log*///console.log("   Initializing [%s] selectizeConfg[%O]", fConfg.label, confg);
    confg.confgName = fConfg.name;
    confg.id = confg.id ? confg.id : '#sel-'+fConfg.id;
    confg.name = fConfg.label;
    _cmbx('initCombobox', [confg]);
    if (!confg.create) { _cmbx('removeOpt', [fConfg.id, 'create']); }
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
    const selId = _state('getFormParentId', [fLvl]);                /*dbug-log*///console.log('resetFormCombobox [%s][%s] focus?[%s]', selId, fLvl, focus);
    if (!selId) { return; }
    const field = selId.split('sel-')[1];
    _cmbx('resetCombobox', [field]);
    _cmbx('enableCombobox', [field]);
    _cmbx('focusCombobox', [field, focus]);
}