/**
 * Taxon create-form.
 *
 * Export
 *     initCreateForm
 *
 * TOC
 *     INIT
 *     VALIDATE
 */
import { _cmbx, _el } from '~util';
import { _form, _state, _elems, _val, handleFormSubmit } from '~form';

/* ========================= INIT =========================================== */
export function initCreateForm(rank, v) {                           /*perm-log*/console.log('           /--initTaxon[%s]Form [%s]', rank, v);
    _elems('initSubForm', [getTxnFormParams(rank, v)])
    .then(finishTxnFormInit);
}
function getTxnFormParams(rank, v) {
    return {
        appendForm: form => $(`#${rank}_f`).append(form),
        combo: rank,
        group: 'sub2',
        name: 'Taxon',
        onFormClose: _form.bind(null, 'enableCountryRegionField'),
        style: 'sml-sub-form',
        submit: validateAndSubmit.bind(null, rank), //form submit handler
        type: 'create',
        vals: getTaxonCreateStateVals(val, rank)
    }
}
function getTaxonCreateStateVals(val, rank) {
    return {
        DisplayName: val,
        Group: _state('getFieldState', ['sub', 'Group']),
        Rank: rank,
        'Sub-Group': _state('getFieldState', ['sub', 'Sub-Group']),
    };
}
function finishTxnFormInit(val, rank, status) {
    if (!status) { return } //Error handled elsewhere
    $(`#${rank}_f`).append(form);
    _elems('toggleSubmitBttn', ['sub2'])
    $('#sub2-hdr')[0].innerText += ' '+ rank;
    $('#DisplayName_f input').focus();
}
/* ========================= VALIDATE ========================================= */
function validateAndSubmit(rank) {
    if (ifEmptyNameField()) { return valAlert(rank, 'needsName'); }
    if (ifSpeciesValIssue(rank)) { return valAlert(rank, 'needsGenusName'); }
    handleFormSubmit('sub2');
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