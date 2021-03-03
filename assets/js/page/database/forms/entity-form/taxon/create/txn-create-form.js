/**
 * Taxon create-form.
 *
 * Export
 *     initCreateForm
 *
 * TOC
 *     INIT
 *     SUBMIT
 *         VALIDATE
 */
import { _cmbx, _el, _u } from '~util';
import { _state, _elems, _val, handleFormSubmit } from '~form';

export function initCombos() {} //No combos in this form.
/* ========================= INIT =========================================== */
export function initCreateForm(rank, value) {                       /*perm-log*/console.log('           /--initTaxon[%s]Form [%s]', rank, value);
    const val = value === 'create' ? '' : value;
    const ucRank = _u('ucfirst', [rank]);
    return showNewTaxonForm(val, ucRank);
}
function showNewTaxonForm(val, rank) {
    _state('setTaxonProp', ['formTaxonRank', rank]);  //used for data validation/submit
    return buildTaxonForm()
    .then(() => _elems('toggleSubmitBttn', ['#sub2-submit', true]));

    function buildTaxonForm() {
        const pId = '#sel-'+rank;
        const vals = {'DisplayName': val};
        _state('addEntityFormState', ['taxon', 'sub2', pId, 'create', vals]);
        return _elems('getSubForm', ['sub2', 'sml-sub-form', pId])
            .then(appendTxnFormAndFinishBuild);
    }
    function appendTxnFormAndFinishBuild(form) {
        $(`#${rank}_f`).append(form);
        _elems('toggleSubmitBttn', ['#sub2-submit'])
        $('#sub2-hdr')[0].innerText += ' '+ rank;
        $('#DisplayName_f input').focus();
        updateTaxonSubmitBttn(rank);
    }
}
/* ========================= SUBMIT ========================================= */
function updateTaxonSubmitBttn(rank) {
    $('#sub2-submit').off('click').click(validateAndSubmit.bind(null, rank));
}
/* ------------------------- VALIDATE --------------------------------------- */
function validateAndSubmit(rank) {
    if (ifEmptyNameField()) { return valAlert(rank, 'needsName'); }
    if (ifSpeciesValIssue(rank)) { return valAlert(rank, 'needsGenusName'); }
    handleFormSubmit('sub2', 'taxon');
}
function ifEmptyNameField() {
    return !$('#DisplayName_f input').val();
}
function ifSpeciesValIssue(rank) {
    return rank === 'Species' && !hasCorrectBinomialNomenclature();

    function hasCorrectBinomialNomenclature() {
        const species = $('#DisplayName_f input')[0].value;
        const genus = _cmbx('getSelTxt', ['Genus']);                /*dbug-log*///console.log('Genus = %s, Species = %s', genus, species);
        const speciesParts = species.split(' ');
        return genus === speciesParts[0];
    }
}
function valAlert(rank, tag) {
    _val('showFormValAlert', [rank, tag, 'sub2'])
}