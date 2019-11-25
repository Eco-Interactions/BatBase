/**
 *
 *
 * Exports:                 Imported by:
 *     finishTaxonSelectUi       forms-main
 */
import * as _forms from '../forms-main.js';

const _mmry = _forms.memory;
const _cmbx = _forms.uiCombos;
const _elems = _forms.uiElems;
const _u = _forms._util;

/** Shows a New Taxon form with the only field, displayName, filled and ready to submit. */
function initTaxonForm(value) {                                                 console.log('           --initTaxonForm [%s]', value);
    const val = value === 'create' ? '' : value;
    const selLvl = this.$control_input[0].id.split('-sel-selectize')[0]; 
    const fLvl = fP.forms.taxonPs.prntSubFormLvl || getSubFormLvl('sub2'); //refact
    if (selLvl === 'Species' && !$('#Genus-sel').val()) {
        return _errs.formInitErr(selLvl, 'noGenus', fLvl);
    }
    enableTaxonLvls(false);
    showNewTaxonForm(val, selLvl, fLvl);
} 
function showNewTaxonForm(val, selLvl, fLvl) {                                  //console.log("showNewTaxonForm. val, selVal, fLvl = %O", arguments)
    fP.forms.taxonPs.formTaxonLvl = selLvl;
    buildTaxonForm().then(disableSubmitButtonIfEmpty.bind(null, '#sub2-submit', val));

    function buildTaxonForm() {
        return initEntitySubForm('taxon', fLvl, 'sml-sub-form', {'DisplayName': val}, 
            '#'+selLvl+'-sel')
            .then(appendTxnFormAndFinishBuild);
    }
    function appendTxnFormAndFinishBuild(form) {
        $('#'+selLvl+'_row').append(form);
        enableSubmitBttn('#'+fLvl+'-submit');
        $('#'+fLvl+'-hdr')[0].innerText += ' '+ selLvl;
        $('#DisplayName_row input').focus();
        if (selLvl == 'Species') { updateSpeciesSubmitBttn(fLvl); }
        // _forms.setonFormCloseHandler('taxon', fLvl);
    }
}  /* End showTaxonForm */
function updateSpeciesSubmitBttn(fLvl) {
    $('#'+fLvl+'-submit').off('click').click(submitSpecies.bind(null, fLvl));
}
function submitSpecies(fLvl) {                                                  //console.log('submitSpecies. fLvl = %s', fLvl);
    const species = $('#DisplayName_row input')[0].value;
    if (nameNotCorrect()) { return _errs.reportFormFieldErr('Species', 'needsGenusName', fLvl); }
    getFormValuesAndSubmit('#'+fLvl+'-form',  fLvl, 'taxon');
    
    function nameNotCorrect() {
        const genus = _cmbx.getSelTxt('#Genus-sel');                                  //console.log('Genus = %s, Species = %s', genus, species);
        const speciesParts = species.split(' ');
        return genus !== speciesParts[0];
    }
}
function disableSubmitButtonIfEmpty(bttnId, val) {
        if (!val) { disableSubmitBttn(bttnId); }
    }