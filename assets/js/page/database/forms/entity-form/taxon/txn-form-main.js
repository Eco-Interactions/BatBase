/**
 * Taxon create|edit and select forms.
 *
 * TOC
 *     CREATE FORM
 *     EDIT FORM
 *         FIELDS
 *             NAME FIELD AND RANK COMBOBOX
 *             PARENT TAXON ELEMS
 *                 TAXON PARENT SELECT FORM
 *                     RANK COMBO ELEMS
 *                     FINISH SELECT FORM BUILD
 *                     DATA VALIDATION
 *         ROW BUILDERS
 *         FINISH EDIT FORM BUILD
 *         DATA VALIDATION
 */
import * as create from './create/txn-create-form.js';
import * as edit from './edit/txn-edit-main.js';
import * as select from './select/txn-select-main.js';

/* ======================= CREATE =========================================== */
export function initCreateForm() {
    return create.initCreateForm(...arguments);
}
export function initFormCombos(entity, fLvl) {} //No combos in the create form.
/* ========================= EDIT =========================================== */
export function finishEditFormBuild() {
    edit.finishEditFormBuild(...arguments);
}
export function getTaxonEditFields() {
    return edit.getTaxonEditFields(...arguments);
}
export function selectParentTaxon() {
    edit.selectParentTaxon(...arguments);
}
/* ======================= SELECT =========================================== */
export function initRoleTaxonSelect() {
    return select.initRoleTaxonSelect(...arguments);
}
export function initSelectFormCombos() {
    return select.initSelectFormCombos(...arguments);
}
export function onSubGroupSelection() {
    return select.onSubGroupSelection(...arguments);
}
export function getSelectedTaxon() {
    return select.getSelectedTaxon(...arguments);
}