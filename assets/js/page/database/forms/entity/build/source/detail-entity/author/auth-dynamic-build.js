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
    a.group = fLvl;
    a.type = aType;
    updateFieldState(cnt)
}
/** [updateFieldState description] */
function updateFieldState(cnt) {                                    /*dbug-log*///console.log('--updateFieldState [%s][%s][%s]', a.group, a.type, cnt);
    _state('setFieldState', [a.group, a.type, cnt, 'count']);
}
/* ======================== BUILD FIELD ===================================== */
export function buildNewAuthorSelect(fLvl, aType, cnt) {            /*dbug-log*///console.log('+--buildNewAuthorSelect[%s][%s]', aType, cnt);
    updateAuthData(aType, fLvl, cnt);
    const fConfg = getNextFieldConfg();                             /*dbug-log*///console.log('   --fConfg[%O]', fConfg);
    return _elems('buildDynamicFormField', [fConfg])
        .then(appendNewAuthSelect)
        .then(() => Promise.resolve());
}
/** [getNextFieldConfg description] */
function getNextFieldConfg() {
    const fConfg = _u('snapshot', _state('getFieldState', [a.group, a.type, null]));
    fConfg.count = a.cnt;
    fConfg.required = false;
    return fConfg;
}
/** [appendNewAuthSelect description] */
function appendNewAuthSelect(field) {                               /*dbug-log*///console.log('--appendNewAuthSelect field[%O]', field);
    $(`#${a.type}_f-cntnr .cntnr`).append(field);
    const confg = getAuthSelConfg();
    _cmbx('initCombobox', [confg]);
    removeSelectedOptions(confg.confgName);
}
function getAuthSelConfg() {
    return {
        create: aForm.initCreateForm.bind(null, a.cnt, a.type),
        onChange: aForm.onAuthAndEdSelection.bind(null, a.cnt, a.type),
        id: '#sel-'+a.type+a.cnt,
        confgName: a.type+a.cnt,
        name: a.type
    };
}
function removeSelectedOptions(fName) {
    if (_state('isEditForm', [a.group]) || a.cnt == 1) { return; }
    const vals = _state('getFieldState', [a.group, a.type]);        /*dbug-log*///console.log('--removeSelectedOptions field[%s] vals[%O]', fName, vals);
    _cmbx('removeOptions', [fName, Object.values(vals)]);
}
/* ======================= REMOVE FIELD ===================================== */
export function removeAuthField(aType, cnt) {                       /*dbug-log*///console.log('+--removeAuthField[%s][%s]', aType, cnt);
    _cmbx('destroySelectizeInstance', [aType+cnt]);
    $('#'+aType+cnt+'_f').remove();
    updateFieldState(--cnt);
}