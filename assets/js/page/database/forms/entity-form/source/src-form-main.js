/**
 * Source forms: Author, Citation, Publication, and Publisher.
 *
 * TOC
 *     FORM INIT
 *     EDIT FORMS
 *         PUBLICATION|CITATION-TYPE FIELDS
 *         PUBLICATION|CITATION FINISH BUILD
 *     MODULE INTERNAL-USAGE
 *         ENTITY FIELDS
 *         SUBMIT CONFIRMATION-MODAL
 */
import { _db, _modal } from '~util';
import { _state, _elems, handleFormSubmit } from '~form';
import * as entityForm from './detail-entity/src-detail-entity-form-main.js';
/* ------------------- FORM INIT -------------------------------------------- */
/** Inits comboboxes for the source forms. */
export function initCombos() {
    entityForm.initCombos(...arguments);
}
export function initCreateForm() {
    return entityForm.initCreateForm(...arguments);
}
export function selectExistingAuthsOrEds() {
    return entityForm.selectExistingAuthsOrEds(...arguments);
}
/* =========================== EDIT FORMS =================================== */
/* ----------------- PUBLICATION|CITATION FINISH BUILD ---------------------- */
/** Note: Only citation & publication forms use this. */
export function finishEditFormBuild(entity) {                       /*dbug-log*///console.log('---finishEditFormBuild')
    finishSrcFieldLoad(entity, 'top');
}
/* *********************** MODULE INTERNAL-USAGE **************************** */
/* ------------------- ENTITY FIELDS ---------------------------------------- */
export function loadSrcTypeFields() {
    return entityForm.loadSrcTypeFields(...arguments);
}
export function handleCitText() {
    entityForm.handleCitText(...arguments);
}
export function finishSrcFieldLoad(entity, fLvl) {                  /*dbug-log*///console.log('finishSrcFieldLoad [%s] entity[%s]', fLvl, entity);
    if (entity === 'citation' || entity === 'publication') {
        entityForm.finishPubOrCitEditForm(entity);
    }
}
/* -------------------- SUBMIT CONFIRMATION-MODAL --------------------------- */
/**
 * If a URL is entered in the form, a modal is shown prompting the editor to
 * double check the links work before submitting.
 */
export function showSubmitModal(fLvl) {
    const linkHtml = buildConfirmationModalHtml(fLvl);
    const submit = handleFormSubmit.bind(null, fLvl);
    if (!linkHtml) { return submit(); }
    _modal('showSaveModal', [ buildModalConfg(fLvl, linkHtml, submit) ]);
    $(`#${fLvl}-submit`).css({'opacity': .5, cursor: 'not-allowed'})
    window.setTimeout(() => $('.modal-msg').css({width: 'max-content'}), 500);
}
function buildConfirmationModalHtml(fLvl) {
    const hdr = '<b>Please double-check URLs before submitting.</b><br><br>';
    const links = ['Doi', 'Website'].map(buildLinkHtmlForValues).filter(l=>l);
    return links.length ? hdr + links.join('<br><br>') : false;

    function buildLinkHtmlForValues(field) {
        const url = $(`#${fLvl}-form #${field}_f input`).val();
        return url ? buildUrlLink(field, url) : null;
    }
}
function buildUrlLink(field, url) {
    return `<b>${field}:</b> <a href="${url}"" target="_blank">${url}</a>`;
}
function buildModalConfg(fLvl, linkHtml, submit) {
    return {
        html: linkHtml,
        selector: `#${fLvl}-submit`,
        dir: 'left',
        submit: submit,
        bttn: 'SUBMIT'
    };
}