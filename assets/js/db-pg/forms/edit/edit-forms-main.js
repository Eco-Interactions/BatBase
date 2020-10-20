/**
 * Handles individual Entity edit forms.
 *
 * Export
 *     editEntity
 *
 * CODE SECTIONS
 *     FORM INIT
 *         FORM FIELDS
 *         FINISH FORM INIT
 */
import { _state, _elems, _confg, _form } from '../forms-main.js';
import { fillFormWithEntityData } from './autofill-data.js';

/** Shows the entity's edit form in a pop-up window on the search page. */
export default function editEntity(id, entity) {                     /*perm-log*/console.log("       +--edit[%s] [%s]", entity, id);
    initEditForm(id, entity)
    .then(() => _form('finishEditFormInit', [entity, id]));
}
/* ============================== FORM INIT ================================= */
function initEditForm(id, entity) {
    return getEditFormFields(id, entity)
        .then(fields => buildAndAppendEditForm(fields, id, entity))
        .then(() => fillFormWithEntityData(entity, id));
}
function buildAndAppendEditForm(fields, id, entity) {
    return _elems('buildAndAppendForm', [fields, id])
        .then(() => finishEditFormBuild(entity))
}
/* --------------------------- FORM FIELDS ---------------------------------- */
/** Returns the form fields for the passed entity.  */
function getEditFormFields(id, entity) {
    _state('setFormProp', ['top', 'expanded', true]); //All possible fields are shown in edit fields.
    return buildEditFields(entity, id);
}
function buildEditFields(entity, id) {
    const complxBldrs = {
        'citation': 'getSrcTypeFields', 'publication': 'getSrcTypeFields',
        'taxon': 'getTaxonEditFields'
    };
    return complxBldrs[entity] ? getCmplxEditFields() : getEditFields(entity, id);

    function getCmplxEditFields() {
        return _form(complxBldrs[entity], [entity, id]);
    }
}
/** Returns the passed entity's form fields. */
function getEditFields(entity, id) {
    const formConfg = _confg('getFormConfg', [entity]);
    return _elems('getFormFieldRows', [entity, {}, 'top']);
}
/* ----------------------- FINISH FORM INIT --------------------------------- */
function finishEditFormBuild(entity) {
    $('.top-pin').remove(); //removes checkboxes used in interaction create forms
    const cmplx = ['citation', 'interaction', 'location', 'publication', 'taxon'];
    return cmplx.indexOf(entity) > -1 ? finishCmplxForm() : finishEditForm(entity);

    function finishCmplxForm() {
        return _form('finishEntityEditFormBuild', [entity]);
    }
}
function finishEditForm(entity) {
    _form('initFormCombos', [entity, 'top']);
    $('.all-fields-cntnr').hide();  //Hide the "Show all fields" checkbox
    return Promise.resolve();
}