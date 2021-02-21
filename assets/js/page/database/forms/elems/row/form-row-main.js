/**
 * Form-row builders.
 *
 * TOC
 *
 *
 */
import { _u } from '~util';
import { _confg } from '~form';
import * as build from './build-rows.js';

export function getFormRows(entity, fVals, fLvl, cntnr) {           /*dbug-log*/console.log('getFormRows [%s] fVals[%O] cntnr[%O]', entity, fVals, cntnr);
    return getFormFieldRows(entity, fVals, fLvl)
        .then(finishFormRowBuild.bind(null, cntnr));
}
function finishFormRowBuild(cntnr, rows) {
    $(cntnr).append(rows);
    return cntnr;
}
export function getFormFieldRows(entity, fVals, fLvl) {             /*dbug-log*/console.log('getFormFieldRows [%s][%s] = %O', entity, fLvl, fVals);
    const confg = _confg('getFormConfg', [fVals, entity, fLvl]);    /*dbug-log*/console.log('   --confg[%O]', _u('snapshot', [confg]));
    return build.getFormFieldRows(confg);
}