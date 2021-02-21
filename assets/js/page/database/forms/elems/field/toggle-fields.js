/**
 * Toggles between displaying all fields for the entity and only showing the
 * default (required and suggested) fields.
 *
 *
 *
 */
import { _u } from '~util';
import { _elems, _state, _form } from '~form';
/**
 * [toggleFormFields description]
 * @param  {[type]} entity [description]
 * @param  {[type]} fLvl   [description]
 * @param  {[type]} fVals  [description]
 * @return {[type]}        [description]
 */
export function toggleFormFields(entity, fLvl, fVals) {
    updateFormMemoryOnFieldToggle(fLvl);
    $(`#${entity}_fields`).empty();
    _elems('getFormFieldRows', [entity, fVals, fLvl])
    .then(appendAndFinishRebuild);

    function appendAndFinishRebuild(rows) {
        $(`#${entity}_fields`).append(rows);
        _form('initFormCombos', [_u('lcfirst', [entity]), fLvl]);
        _elems('fillComplexFormFields', [fLvl])
        .then(finishComplexForms);
    }
    function finishComplexForms() {
        const complex = ['citation', 'publication', 'location'];
        if (complex.indexOf(entity) === -1) { return; }
        if (entity !== 'location') { _form('finishSrcFieldLoad', [entity, fVals, fLvl]); }
        _elems('setDynamicFormStyles', [entity]);
    }
}
function updateFormMemoryOnFieldToggle(fLvl) {
    const isChecked = $(`#${fLvl}-all-fields`)[0].checked;
    _state('setFormProp', [fLvl, 'simple', !isChecked]);
    _state('setFormProp', [fLvl, 'reqElems', []]);
}
