/**
 * TODO: DOCUMENT
 *
 * Export
 *     rebuildFieldsOnFormConfgChanged
 */
import { _elems, _form } from '~form';
const lcl = {
    fLvl: null,
    entity: null,
};
export function rebuildFieldsOnFormConfgChanged(fLvl, entity) {     /*dbug-log*///console.log('+--rebuildFieldsOnFormConfgChanged [%s][%s]', fLvl, entity);
    lcl.fLvl = fLvl;
    lcl.entity = entity;
    return _elems('getFormRows', [entity, fLvl])
        .then(appendAndFinishRebuild);
}
function appendAndFinishRebuild(rows) {                             /*dbug-log*///console.log('   --appendAndFinishRebuild rows[%O]', rows);
    $(`#${lcl.fLvl}_alert`).after(rows);
    _form('initCombos', [lcl.fLvl]);
    return _elems('fillComplexFormFields', [lcl.fLvl])
        .then(finishComplexForms);
}
function finishComplexForms() {
    const complex = ['citation', 'publication', 'location'];
    if (complex.indexOf(lcl.entity) === -1) { return; }
    _elems('setDynamicFormStyles', [lcl.entity]);
    if (lcl.entity === 'location') { return; }
    _form('finishSrcFieldLoad', [lcl.entity, lcl.fLvl]);
}
