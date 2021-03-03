/**
 * Loads fields for the selected [Publication|Citation]-type.
 * Eg, Pubs have Book, Journal, Dissertation and 'Other' field confgs.
 *
 * Export
 *     loadSrcTypeFields
 *     getPubOrCitFields
 *
 * TOC
 *     LOAD SOURCE-TYPE ROWS
 *     GET SOURCE-TYPE ROWS
 *     UPDATE SOURCE-TYPE FIELDS
 *         LABELS
 *         INPUTS
 */
import { _cmbx, _u } from '~util';
import { _state, _elems, getSubFormLvl } from '~form';
import * as sForm from '../src-form-main.js';
/* ----------------- LOAD SOURCE-TYPE ROWS ---------------------------------- */
export function loadSrcTypeFields(entity, typeId, type) {           /*dbug-log*///console.log('+--loadSrcTypeFields [%s] id?[%s] type[%s]', entity, typeId, type);
    const fLvl = getSubFormLvl('sub');
    resetOnFormTypeChange(entity, typeId, fLvl);
    return getPubOrCitFields(entity, typeId, fLvl, type)
        .then(finishSrcTypeFormBuild);

    function finishSrcTypeFormBuild(rows) {                         /*dbug-log*///console.log('   --finishSrcTypeFormBuild rows[%O]', rows)
        $(`#${entity}_fields`).append(rows);
        sForm.initCombos(fLvl, entity);
        return _elems('fillComplexFormFields', [fLvl])
            .then(afterComplexFieldsFilled);
    }
    function afterComplexFieldsFilled () {
        _elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
        $('#Title_f input').focus();
        if (_state('getStateProp', ['action']) === 'create') { return; }
        $('.top-pin').hide(); //edit-forms show pins after type change otherwise.
    }
}
function resetOnFormTypeChange(entity, typeId, fLvl) {
    const capsType = _u('ucfirst', [entity]);
    _state('setFieldState', [fLvl, capsType+'Type', typeId]);
    _elems('toggleSubmitBttn', [`#${fLvl}-submit`, false]);
}
/* ----------------- GET SOURCE-TYPE ROWS ----------------------------------- */
/**
 * Builds and return the form-field rows for the selected source type.
 * @return {ary} Form-field rows ordered according to the form config.
 * @param  {[type]}  entity [description]
 * @param  {[type]}  typeId [description]
 * @param  {[type]}  fLvl   [description]
 * @param  {Str|Bool} type   Passed for edit-form builds
 * @return {[type]}         [description]
 */
export function getPubOrCitFields(entity, typeId, fLvl, type = false) {/*dbug-log*///console.log('getPubOrCitFields [%s][%s] typeId[%s] type?[%s]', fLvl, entity, typeId, type);
    setSourceType(entity, fLvl, typeId, type);
    $(`#${entity}_fields`).empty();
    return _elems('getFormFieldRows', [fLvl]);
}
/**
 * Update form state for the selected source type.
 * @param {str} entity Source-type entity
 * @param {str} fLvl   Form-level
 * @param {str} tId    Entity-type id
 * @param {str} tName    Entity-type name
 */
function setSourceType(entity, fLvl, tId, tName) {
    const typeField = _u('ucfirst', [entity])+'Type';
    const val = {
        text: tName ? tName : getSourceTypeNameFromCombo(typeField),
        value: tId ? tId : getSourceTypeIdFromCombo(typeField)
    };                                                               /*dbug-log*///console.log('--setSourceType[%s] = %O', typeField, val);
    _state('setFieldState', [fLvl, typeField, val]);
    _state('setFormState', [fLvl, 'type', val.text])
    _state('onEntityTypeChangeUpdateConfg', [fLvl]);
}
function getSourceTypeNameFromCombo(tField) {
    return _cmbx('getSelTxt', [tField]);
}
function getSourceTypeIdFromCombo(tField) {
    return _cmbx('getSelVal', [tField]);
}