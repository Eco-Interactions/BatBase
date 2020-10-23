/**
 * Source form code: Authors, Citations, Publication, and Publisher.
 *
 * TOC:
 *     FORM INIT
 *     EDIT FORMS
 *         PUBLICATION|CITATION-TYPE FIELDS
 *         PUBLICATION|CITATION FINISH BUILD
 *     MODULE INTERNAL-USAGE
 *         ENTITY FIELDS
 *         SUBMIT CONFIRMATION-MODAL
 */
import { _modal, _u } from '../../../db-main.js';
import { _state, _elems, submitForm } from '../../forms-main.js';
import * as entityForm from './detail-entity/src-detail-entity-form-main.js';
import * as typeFields from './pub-and-cit-type-fields.js';
/* ------------------- FORM INIT -------------------------------------------- */
/** Inits comboboxes for the source forms. */
export function initFormCombos() {
    entityForm.initFormCombos(...arguments);
}
export function initCreateForm() {
    return entityForm.initCreateForm(...arguments);
}
export function selectExistingAuthsOrEds() {
    return entityForm.selectExistingAuthsOrEds(...arguments);
}
/* =========================== EDIT FORMS =================================== */
/* ----------------- PUBLICATION|CITATION-TYPE FIELDS ----------------------- */
export function getPubOrCitEditFields(entity, id) {
    const srcRcrd = _state('getRcrd', ['source', id]);
    const type = _state('getRcrd', [entity, srcRcrd[entity]]);
    const typeId = type[entity+'Type'].id;
    const typeName = type[entity+'Type'].displayName;
    return ifCitationAddPubToMemory(entity, srcRcrd, id)
        .then(() => getPubOrCitFields(entity, typeId, 'top', typeName));
}
function ifCitationAddPubToMemory(entity, srcRcrd) {
    if (entity !== 'citation') { return Promise.resolve(); }
    return _u('getData', ['publication'])
        .then(setPubDataInMemory);

    function setPubDataInMemory(pubRcrds) {
        const pubSrc = _state('getRcrd', ['source', srcRcrd.parent]);
        const pub = pubRcrds[pubSrc.publication]
        _state('setFormProp', ['top', 'rcrds', { pub: pub, src: pubSrc}]);
    }
}
function getSrcRcrd(pubId) {
    const rcrd = _state('getRcrd', ['source', _state('getStateProp', '[editing]').core]);
    return _state('getRcrd', ['source', rcrd.parent]);
}
/* ----------------- PUBLICATION|CITATION FINISH BUILD ---------------------- */
/** Note: Only citation & publication forms use this. */
export function finishEditFormBuild(entity) {                       /*dbug-log*///console.log('---finishEditFormBuild')
    $('.all-fields-cntnr').hide();
    initFormCombos(entity, 'top');
    finishSrcFieldLoad(entity, 'top');
    addConfirmationBeforeSubmit(entity, 'top');
}
export function setSrcEditRowStyle() {
    _elems('setCoreRowStyles', ['#form-main', '.top-row']);
}
/* *********************** MODULE INTERNAL-USAGE **************************** */
export function initEntitySubForm(entity, fLvl, fVals, pSel) {
    _state('addEntityFormState', [entity, fLvl, pSel, 'create']);
    return _elems('initSubForm', [fLvl, 'sml-sub-form', fVals, pSel]);
}
/* ------------------- ENTITY FIELDS ---------------------------------------- */
export function getPubOrCitFields() {
    return typeFields.getPubOrCitFields(...arguments);
}
export function loadSrcTypeFields() {
    return typeFields.loadSrcTypeFields(...arguments);
}
export function handleCitText() {
    entityForm.handleCitText(...arguments);
}
export function finishSrcFieldLoad(entity, fLvl) {
    if (entity === 'citation' || entity === 'publication') {
        entityForm.finishPubOrCitEditForm(entity);
        typeFields.updateFieldsForSourceType(entity, fLvl);
    }
}
/* -------------------- SUBMIT CONFIRMATION-MODAL --------------------------- */
/**
 * If a URL is entered in the form, a modal is shown prompting the editor to
 * double check the links work before submitting.
 */
export function addConfirmationBeforeSubmit(entity, fLvl) {
    $(`#${fLvl}-submit`).off('click').click(showSubmitModal.bind(null, entity, fLvl));
}
function showSubmitModal(entity, fLvl) {
    const linkHtml = buildConfirmationModalHtml(fLvl);
    const submit = submitForm.bind(null, `#${fLvl}-form`, fLvl, entity);
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
        const url = $(`#${fLvl}-form #${field}_row input`).val();
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