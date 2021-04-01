/**
 * Loads fields for the selected [Publication|Citation]-type.
 * Eg, Pubs have Book, Journal, Dissertation and 'Other' field confgs.
 *
 * Export
 *     loadSrcTypeFields
 *
 * TOC
 *     LOAD SOURCE-TYPE ROWS
 *     SET SOURCE DETAIL-TYPE
 */
import { _cmbx, _u } from '~util';
import { _confg, _elems, _state, getSubFormLvl } from '~form';
import * as sForm from '../src-form-main.js';
/* ----------------- LOAD SOURCE-TYPE ROWS ---------------------------------- */
export function loadSrcTypeFields(entity, typeId, type) {           /*dbug-log*///console.log('+--loadSrcTypeFields [%s] id?[%s] type[%s]', entity, typeId, type);
    const fLvl = getSubFormLvl('sub');
    setSourceDetailType(entity, fLvl, typeId, type);
    return _elems('onFormConfgChanged', [fLvl, entity])
        .then(finishSrcTypeFormBuild);

    function finishSrcTypeFormBuild () {
        _elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
        $('#DisplayName_f input').focus();
    }
}
/* ----------------- SET SOURCE DETAIL-TYPE --------------------------------- */
/**
 * Update form state for the selected source type.
 * @param {str} entity Source-type entity
 * @param {str} fLvl   Form-level
 * @param {str} tId    Entity-type id
 * @param {str} tName    Entity-type name
 */
function setSourceDetailType(entity, fLvl, tId, tName) {
    const typeField = entity+'Type';
    const val = {
        text: tName ? tName : getSourceTypeNameFromCombo(typeField),
        value: tId ? tId : getSourceTypeIdFromCombo(typeField)
    };                                                               /*dbug-log*///console.log('--setSourceType[%s] = %O', typeField, val);
    _state('setFieldState', [fLvl, typeField, val]);
    _state('setFormState', [fLvl, 'type', val.text])
    _confg('onEntityTypeChangeUpdateConfg', [fLvl]);
}
function getSourceTypeNameFromCombo(tField) {
    return _cmbx('getSelTxt', [tField]);
}
function getSourceTypeIdFromCombo(tField) {
    return _cmbx('getSelVal', [tField]);
}