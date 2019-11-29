/**
 * Taxon create form code.
 *
 * Exports:                 
 *     initCreateForm
 */
import * as _i from '../forms-main.js';

export function initFormCombos(entity, fLvl) {} //No combos in this form.

export function initCreateForm(lvl, value) {                                    console.log('           /--initTaxon[%s]Form [%s]', lvl, value);
    const val = value === 'create' ? '' : value;
    const level = _i.util('ucfirst', [lvl]);
    const fLvl = getTaxonCreateLvl();
    enableTaxonLvls(false);
    showNewTaxonForm(val, level, fLvl);
} 
function getTaxonCreateLvl() {
    const editFormLvl = _i.mmry('getTaxonProp', ['prntSubFormLvl']);
    return editFormLvl || _i.getSubFormLvl('sub2'); //when editing parent taxon
}
function showNewTaxonForm(val, level, fLvl) {                                  
    _i.mmry('setTaxonProp', ['formTaxonLvl', level]);  //used for data validation/submit
    buildTaxonForm()
    .then(() => _i.ui('toggleSubmitBttn', ['#sub2-submit', !!val]));

    function buildTaxonForm() {
        const pId = '#'+level+'-sel'
        const vals = {'DisplayName': val};
        _i.mmry('initEntityFormMemory', ['taxon', fLvl, pId, 'create']);
        _i.mmry('setonFormCloseHandler', [fLvl, enableTaxonLvls]);
        return _i.elems('initSubForm', [fLvl, 'sml-sub-form', vals, pId])
            .then(appendTxnFormAndFinishBuild);
    }
    function appendTxnFormAndFinishBuild(form) {
        $('#'+level+'_row').append(form);
        _i.ui('toggleSubmitBttn', ['#'+fLvl+'-submit'])
        $('#'+fLvl+'-hdr')[0].innerText += ' '+ level;
        $('#DisplayName_row input').focus();
        if (level == 'Species') { updateSpeciesSubmitBttn(fLvl); }
    }
} 
function updateSpeciesSubmitBttn(fLvl) {
    $('#'+fLvl+'-submit').off('click').click(submitSpecies.bind(null, fLvl));
}
function submitSpecies(fLvl) {                                                  
    if (!hasCorrectBinomialNomenclature()) { 
        return _i.err('reportFormFieldErr', ['Species', 'needsGenusName', fLvl]); 
    }
    _i.submitForm('#'+fLvl+'-form',  fLvl, 'taxon');
    
    function hasCorrectBinomialNomenclature() {
        const species = $('#DisplayName_row input')[0].value;
        const genus = _i.cmbx('getSelTxt', ['#Genus-sel']);                     //console.log('Genus = %s, Species = %s', genus, species);
        const speciesParts = species.split(' ');
        return genus === speciesParts[0];
    }
}
function enableTaxonLvls(enable = true) {
    $.each($('#sub-form select'), (i, sel) => {
        _i.cmbx('enableCombobox', ['#'+sel.id, enable])
    });
}