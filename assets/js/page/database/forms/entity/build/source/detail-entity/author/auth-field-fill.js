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
export function selectExistingAuthsOrEds(aType, authObj, fLvl) {    /*dbug-log*/console.log('--selectExistingAuthsOrEds. args = %O', arguments);
    if (ifFieldNotShownOrNoValToSelect(aType, authObj)) { return Promise.resolve(); }
    aForm.enableOtherField(aType, fLvl, false);
    return Object.keys(authObj).reduce((p, ord) => { //p(romise), (author-)ord(er)
        const selNextAuth = selectAuthor.bind(null, ord, authObj[ord], aType, fLvl);
        return p.then(selNextAuth);
    }, Promise.resolve());
}
function ifFieldNotShownOrNoValToSelect(aType, authObj) {
    return !Object.keys(authObj).length || !$(`#${aType}_f-cntnr`).length;
}
/** Selects the passed author and builds a new, empty author combobox. */
function selectAuthor(cnt, authId, aType, fLvl) {                   /*dbug-log*///console.log('   --selectAuthor. args = %O', arguments)
    if (!_state('isFieldShown', [fLvl, aType])) { return Promise.resolve(); }
    _cmbx('setSelVal', [aType+cnt, authId, 'silent']);
    return aForm.buildNewAuthorSelect(fLvl, aType, parseInt(cnt)+1);
}