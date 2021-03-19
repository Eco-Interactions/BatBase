/**
 * Form-row builders.
 *
 * TOC
 *
 *
 */
import { _state } from '~form';
import * as build from './build-rows.js';

export function buildFormRows(fLvl, cntnr) {                          /*dbug-log*///console.log('+--buildFormRows [%s] cntnr[%O]', fLvl, cntnr);
    return getFormFieldRows(fLvl)
        .then(finishFormRowBuild.bind(null, cntnr));
}
function finishFormRowBuild(cntnr, rows) {                          /*dbug-log*///console.log('   --finishFormRowBuild cntnr[%O] rows[%O]', cntnr, rows);
    $(cntnr).append(rows);
    return cntnr;
}
export function getFormFieldRows(fLvl) {                            /*dbug-log*///console.log('+--getFormFieldRows [%s]', fLvl);
    const fS = _state('getFormState', [fLvl]);                      /*dbug-log*///console.log('   --viewConfg[%O]', fS.view, fS.name);
    return build.getFormFieldRows(fS.view, fS.name);
}