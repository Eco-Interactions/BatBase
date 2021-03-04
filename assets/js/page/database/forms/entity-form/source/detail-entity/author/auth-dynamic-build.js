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
/* ======================== BUILD FIELD ===================================== */
export function buildNewAuthorSelect(fLvl, aType, cnt = null) {     /*dbug-log*///console.log('--buildNewAuthorSelect[%s][%s]', aType, cnt);
    const fConfg = _u('snapshot', _state('getFormFieldData', [fLvl, aType]));
    fConfg.count = cnt ? cnt+1 : $(`#${aType}_f-cntnr`).data('cnt')+1;
    fConfg.required = false;                                        /*dbug-log*///console.log('   --fConfg[%O]', fConfg);
    return _elems('buildDynamicFormField', [fConfg])
        .then(f => appendNewAuthSelect(f, aType, fConfg.count));
}
function appendNewAuthSelect(field, aType, cnt) {
    $(`#${aType}_f-cntnr .cntnr`).append(field);
    $(`#${aType}_f-cntnr`).data('cnt', cnt);
    _cmbx('initCombobox', [getAuthSelConfg(aType, cnt)]);
}
function getAuthSelConfg(aType, cnt) {
    return {
        create: aForm.initAuthOrEdForm.bind(null, cnt, aType),
        onChange: aForm.onAuthAndEdSelection.bind(null, cnt, aType),
        id: '#sel-'+aType+cnt,
        confgName: aType+cnt,
        name: aType
    };
}
/* ======================= REMOVE FIELD ===================================== */
export function removeAuthField(aType, cnt) {                       /*dbug-log*///console.log('--removeAuthField[%s][%s]', aType, cnt);
    _cmbx('destroySelectizeInstance', [aType+cnt]);
    $(`#${aType}_f-cntnr`).data('cnt', cnt-1);
    $('#'+aType+cnt+'_f').remove();

}