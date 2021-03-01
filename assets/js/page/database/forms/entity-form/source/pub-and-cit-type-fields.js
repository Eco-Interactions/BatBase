/**
 * Loads or returns fields for the selected [Publication|Citation]-type. Clears
 * previous type-fields and initializes the selectized dropdowns. Updates
 * any type-specific labels for fields.
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
import * as sForm from './src-form-main.js';
/* ----------------- LOAD SOURCE-TYPE ROWS ---------------------------------- */
export function loadSrcTypeFields(entity, typeId, type) {           /*dbug-log*/console.log('+--loadSrcTypeFields [%s] id?[%s] type[%s]', entity, typeId, type);
    const fLvl = getSubFormLvl('sub');
    resetOnFormTypeChange(entity, typeId, fLvl);
    return getPubOrCitFields(entity, typeId, fLvl, type)
        .then(finishSrcTypeFormBuild);

    function finishSrcTypeFormBuild(rows) {                         /*dbug-log*/console.log('   --finishSrcTypeFormBuild rows[%O]', rows)
        $(`#${entity}_fields`).append(rows);
        sForm.initCombos(fLvl, entity);
        return _elems('fillComplexFormFields', [fLvl])
            .then(afterComplexFieldsFilled);
    }
    function afterComplexFieldsFilled () {
        _elems('checkReqFieldsAndToggleSubmitBttn', [fLvl]);
        updateFieldsForSourceType(entity, fLvl)
        $('#Title_f input').focus();
        if (_state('getStateProp', ['action']) === 'create') { return; }
        $('.top-pin').hide(); //edit-forms show pins after type change otherwise.
    }
}
function resetOnFormTypeChange(entity, typeId, fLvl) {
    const capsType = _u('ucfirst', [entity]);
    _state('setFieldState', [fLvl, capsType+'Type', typeId]);
    // _state('setFormState', [fLvl, 'reqElems', []]);
    _elems('toggleSubmitBttn', ['#'+fLvl+'-submit', false]);
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
export function getPubOrCitFields(entity, typeId, fLvl, type = false) {/*dbug-log*/console.log('getPubOrCitFields [%s][%s] typeId[%s] type?[%s]', fLvl, entity, typeId, type);
    setSourceType(entity, fLvl, typeId, type);
    $(`#${entity}_fields`).empty();
    return _elems('getFormFieldRows', [entity, {}, fLvl]);
}
/** Update form state for the selected source type. */
function setSourceType(entity, fLvl, tId, tName) {
    const typeField = _u('ucfirst', [entity])+'Type';
    const val = {
        text: tName ? tName : getSourceTypeNameFromCombo(typeField),
        value: tId ? tId : getSourceTypeIdFromCombo(typeField)
    };                                                               /*dbug-log*/console.log('--setSourceType[%s] = %O', typeField, val);
    _state('setFieldState', [fLvl, typeField, val]);
    _state('updateFormTypeConfg', [fLvl, val.text]);
}
function getSourceTypeNameFromCombo(tField) {
    return _cmbx('getSelTxt', [tField]);
}
function getSourceTypeIdFromCombo(tField) {
    return _cmbx('getSelVal', [tField]);
}
/* ================= UPDATE SOURCE-TYPE FIELDS ============================== */
export function updateFieldsForSourceType (entity, fLvl) {
    // updateFieldLabelsForType(entity, fLvl);
    // updateInputTypes();
}
/* ---------------------- LABELS -------------------------------------------- */
/**
 * Changes form-field labels to more specific and user-friendly labels for
 * the selected type.
 */
// function updateFieldLabelsForType(entity, fLvl) {
//     const type = _cmbx('getSelTxt', [_u('ucfirst', [entity]+ 'Type')]);
//     const trans = getLabelTrans();
//     const fId = '#'+fLvl+'-form';

//     for (let field in trans) {                                      /*dbug-log*/console.log('updating field [%s] to [%s]', field, trans[field]);
//         const $lbl = $(fId+' label:contains('+field+')');
//         $lbl.text(trans[field]);
//         if ($(fId+' [id^=sel-'+field).length) {
//             updateComboText($lbl[0], field, trans[field]);
//         }
//     }
//     function getLabelTrans() {
//         const trans =  {
//             'publication': {
//                 'Thesis/Dissertation': { 'Publisher': 'Publisher / University' }
//             },
//             'citation': {
//                 'Book': {'Volume': 'Edition'},
//                 'Chapter': {'Title': 'Chapter Title'},
//             }
//         };
//         return trans[entity][type];
//     }
//     function updateComboText(lblElem, field, newTxt) {
//         return lblElem.nextSibling.id.includes('-cntnr') ?
//             updateAllComboPlaceholders($(`#${field}_f-cntnr`)[0].children) :
//             _cmbx('updatePlaceholderText', [field, newTxt]);

//         function updateAllComboPlaceholders(elems) {
//             for (let $i = 0; $i < elems.length; $i++) {
//                 if (elems[$i].tagName !== 'SELECT') {continue}
//                 const field = elems[$i].id.split('sel-')[1];
//                 _cmbx('updatePlaceholderText', [field, newTxt]);
//             }
//         }
//     }
// }
/* ----------------------- INPUTS ------------------------------------------- */
// function updateInputTypes () {
//     setNumberInputs();
//     setInputType('Website', 'url');
// }
// function setNumberInputs () {
//     const fields = ['Edition', 'Issue', 'Volume', 'Year'];
//     fields.forEach(f => setInputType(f, 'number'));
// }
// function setInputType (fieldName, type) {
//     if (!$('#'+fieldName+'-lbl + input').length) { return; }
//     $('#'+fieldName+'-lbl + input').attr('type', type);
// }