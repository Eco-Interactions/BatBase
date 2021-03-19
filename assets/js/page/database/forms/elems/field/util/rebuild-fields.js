/**
 * TODO: DOCUMENT
 *
 * Export
 *     rebuildFieldsOnFormConfgChanged
 */
import { _elems, _form } from '~form';

export function rebuildFieldsOnFormConfgChanged(fLvl, entity) {     /*dbug-log*///console.log('+--rebuildFieldsOnFormConfgChanged [%s][%s]', fLvl, entity);
    $(`#${entity}_fields`).remove();
    return _elems('getFormRows', [entity, fLvl])
        .then(rows => appendAndFinishRebuild(entity, fLvl, rows));
}
function appendAndFinishRebuild(entity, fLvl, rows) {               /*dbug-log*///console.log('   --appendAndFinishRebuild rows[%O]', rows);
    $(`#${fLvl}_alert`).after(rows);
    _elems('finishFieldRebuild', [fLvl, entity])
    return _elems('fillComplexFormFields', [fLvl])
        .then(finishComplexForms);
}
function finishComplexForms(entity, fLvl) {
    const complex = ['citation', 'publication'];
    if (complex.indexOf(entity) === -1) { return; }
    _form('finishSrcFieldLoad', [entity, fLvl]);
}
