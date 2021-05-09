/**
 * Loops through object and adds each author|editor to the form.
 *
 * Export
 *     selectExistingAuthsOrEds
 *
 * TOC
 *     SELECT AUTHORS|EDITORS
 */
import { _cmbx } from '~util';
import { _elems, _state } from '~form';
import * as aForm from './auth-form-main.js';
/* ======================= SELECT AUTHORS|EDITORS =========================== */
export function selectExistingAuthsOrEds(aType, authObj, fLvl) {    /*dbug-log*///console.log('--selectExistingAuthsOrEds. args = %O', arguments);
    aForm.enableOtherField(aType, fLvl, false);
    return selectAuthors(aType, authObj, fLvl);
}
function selectAuthors(aType, authObj, fLvl) {
    return Object.keys(authObj).reduce((p, ord) => { //p(romise), (author-)ord(er)
        return p.then(() => selectAuthor(ord, authObj[ord], aType, fLvl));
    }, Promise.resolve());
}
/** Selects the passed author and builds a new, empty author combobox. */
function selectAuthor(cnt, authId, aType, fLvl) {
    if (!_state('isFieldShown', [fLvl, aType])) { return Promise.resolve(); }/*dbug-log*///console.log('   --selectAuthor [%s][%s][%s] id[%s]', fLvl, aType, cnt, authId);
    _cmbx('setSelVal', [aType+cnt, authId, 'silent']);
    return aForm.buildNewAuthorSelect(fLvl, aType, parseInt(cnt)+1);
}