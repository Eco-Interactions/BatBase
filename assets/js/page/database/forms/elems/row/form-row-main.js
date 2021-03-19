/**
 * Form-row builders.
 *
 * TOC
 *
 *
 */
import { _el } from '~util';
import { _state } from '~form';
import * as build from './build-rows.js';
/** Returns completed form rows in the Entity_fields container. */
export function buildFormRows(entity, fLvl) {                       /*dbug-log*///console.log('+--buildFormRows [%s] cntnr[%O]', fLvl, cntnr);
    return getFormFieldRows(fLvl)
        .then(finishFormRowBuild.bind(null, entity, fLvl));
}
function finishFormRowBuild(entity, fLvl, rows) {                   /*dbug-log*///console.log('   --finishFormRowBuild cntnr[%O] rows[%O]', cntnr, rows);
    const cntnr = getRowContainer(entity, fLvl);
    $(cntnr).append(rows);
    return cntnr;
}
/** Returns completed form rows. */
export function getFormFieldRows(fLvl) {                            /*dbug-log*///console.log('+--getFormFieldRows [%s]', fLvl);
    const fS = _state('getFormState', [fLvl]);                      /*dbug-log*///console.log('   --viewConfg[%O]', fS.view, fS.name);
    return build.getFormFieldRows(fS.view, fS.name);
}
/* ========================== ROW CONTAINER ================================= */
function getRowContainer(entity, fLvl) {
    const attr = { id: getCntnrId(entity, fLvl), class: 'flex-col'};
    return _el('getElem', ['div', attr]);
}
function getCntnrId(entity, fLvl) {
    const baseId = entity+'_fields';
    return $('#'+baseId).length ? baseId+'_'+fLvl : baseId;
}