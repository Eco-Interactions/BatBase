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
import { _cmbx } from '~util';
import { _state } from '~form';
/* ========================== INIT ========================================== */
/**
 * Inits 'selectize' for each select elem in the form's 'selElems' array
 * according to the 'selMap' config. Empties array after intializing.
 */
export function initFormCombos(entity, fLvl, comboConfg) {          /*dbug-log*///console.log("initFormCombos. [%s] formLvl = [%s], comboConfg = %O", entity, fLvl, comboConfg);
    const elems = _state('getFormProp', [fLvl, 'selElems']);        /*dbug-log*///console.log('elems = %O', elems)
    elems.forEach(selectizeElem);
    _state('setFormProp', [fLvl, 'selElems', []]);

    function selectizeElem(fieldName) {
        const confg = getFieldConfg(comboConfg, fieldName);         /*dbug-log*///console.log("   Initializing [%s] confg = %O", fieldName, confg);
        _cmbx('initCombobox', [confg]);
        if (!confg.create) { _cmbx('removeOpt', [fieldName, 'create']); }
    }
}
function getFieldConfg(comboConfg, fieldName) {
    const baseConfg = getBaseFieldConfg(fieldName);                 /*dbug-log*///console.log('[%s] baseConfg = %O, comboConfg = %O', fieldName, baseConfg, comboConfg);
    const fieldConfg = comboConfg[fieldName] || {};
    return Object.assign(baseConfg, fieldConfg);
}
function getBaseFieldConfg(fieldName) {
    const confgMap = {
        'Authors': { id: '#sel-Authors1', confgName: 'Authors1' },
        'Editors': { id: '#sel-Editors1', confgName: 'Editors1' },
        'InteractionTags': { delimiter: ",", maxItems: null },
    };
    const confg = confgMap[fieldName] ? confgMap[fieldName] : {};
    confg.name = fieldName.replace(/([A-Z])/g, ' $1').trim(); //Adds a space between words in CamelCase string.
    if (!confg.id) { confg.id = '#sel-'+fieldName; }
    return confg;
}
/* =========================== UTILITY ====================================== */
/* ---------------------------- SET ----------------------------------------- */
/** The change event is not triggered, so the field data is updated here. */
export function setSilentVal(fLvl, field, val) {
    _cmbx('setSelVal', [field, val, 'silent']);
    _state('setFormFieldData', [fLvl, field, val]);
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