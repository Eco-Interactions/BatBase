/**
 * Handles building and removing the dynamically added author|editor combos.
 *
 * Export
 *     buildNewAuthorSelect
 *
 * TOC
 *     BUILD FIELD
 *     REMOVE FIELD
 */
import { _cmbx, _u } from '~util';
import { _elems, _state } from '~form';
import * as aForm from './auth-form-main.js';

const a = {};

function updateAuthData(aType, fLvl, cnt) {
    a.cnt = cnt;
    a.fLvl = fLvl;
    a.type = aType;
    updateFieldState(cnt)
}
/** [updateFieldState description] */
function updateFieldState(cnt) {                                    /*dbug-log*///console.log('--updateFieldState [%s][%s][%s]', a.fLvl, a.type, cnt);
    _state('setFieldState', [a.fLvl, a.type, cnt, 'count']);
}
/* ======================== BUILD FIELD ===================================== */
export function buildNewAuthorSelect(fLvl, aType, cnt) {            /*dbug-log*///console.log('+--buildNewAuthorSelect[%s][%s]', aType, cnt);
    updateAuthData(aType, fLvl, cnt);
    const fConfg = getNextFieldConfg();                             /*dbug-log*///console.log('   --fConfg[%O]', fConfg);
    return _elems('buildDynamicFormField', [fConfg])
        .then(appendNewAuthSelect);
}
/** [getNextFieldConfg description] */
function getNextFieldConfg() {
    const fConfg = _u('snapshot', _state('getFormFieldData', [a.fLvl, a.type]));
    fConfg.count = a.cnt;
    fConfg.required = false;
    return fConfg;
}
/** [appendNewAuthSelect description] */
function appendNewAuthSelect(field) {
    $(`#${a.type}_f-cntnr .cntnr`).append(field);
    _cmbx('initCombobox', [getAuthSelConfg()]);
}
function getAuthSelConfg() {
    return {
        create: aForm.initAuthOrEdForm.bind(null, a.cnt, a.type),
        onChange: aForm.onAuthAndEdSelection.bind(null, a.cnt, a.type),
        id: '#sel-'+a.type+a.cnt,
        confgName: a.type+a.cnt,
        name: a.type
    };
}
/* ======================= REMOVE FIELD ===================================== */
export function removeAuthField(aType, cnt) {                       /*dbug-log*///console.log('+--removeAuthField[%s][%s]', aType, cnt);
    _cmbx('destroySelectizeInstance', [aType+cnt]);
    $('#'+aType+cnt+'_f').remove();
    updateFieldState(--cnt);
}