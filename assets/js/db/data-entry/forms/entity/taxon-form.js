/**
 *
 *
 * Exports:                 Imported by:
 *     initCreateForm
 *     finishTaxonSelectUi       forms-main
 */
import * as _forms from '../forms-main.js';

const _errs = _forms.err;
const _mmry = _forms.memory;
const _cmbx = _forms.uiCombos;
const _elems = _forms.uiElems;
const _ui = _forms.ui;

export function initCreateForm(level, value) {                                  console.log('           /--initTaxon[%s]Form [%s]', level, value);
    const val = value === 'create' ? '' : value;
    const fLvl = fP.forms.taxonPs.prntSubFormLvl || _forms.getSubFormLvl('sub2'); //when editing parent taxon
    if (level === 'Species' && !$('#Genus-sel').val()) {
        return _errs('formInitErr', [level, 'noGenus', fLvl]);
    }
    enableTaxonLvls(false);
    showNewTaxonForm(val, level, fLvl);
} 
function showNewTaxonForm(val, level, fLvl) {                                  
    _mmry('setTaxonProp', ['formTaxonLvl', level]);  //used for data validation/submit
    buildTaxonForm()
    .then(() => _ui('toggleSubmitBttn', ['#sub2-submit', !!val]));

    function buildTaxonForm() {
        const pId = '#'+level+'-sel'
        const vals = {'DisplayName': val};
        _mmry('initEntityFormMemory', ['taxon', fLvl, pId, 'create']);
        _mmry('setonFormCloseHandler', [fLvl, enableTaxonLvls]);
        return _elems('initSubForm', [fLvl, 'sml-sub-form', vals, pId])
            .then(appendTxnFormAndFinishBuild);
    }
    function appendTxnFormAndFinishBuild(form) {
        $('#'+level+'_row').append(form);
        _ui('toggleSubmitBttn', ['#'+fLvl+'-submit'])
        $('#'+fLvl+'-hdr')[0].innerText += ' '+ level;
        $('#DisplayName_row input').focus();
        if (level == 'Species') { updateSpeciesSubmitBttn(fLvl); }
    }
}  /* End showTaxonForm */
function updateSpeciesSubmitBttn(fLvl) {
    $('#'+fLvl+'-submit').off('click').click(submitSpecies.bind(null, fLvl));
}
function submitSpecies(fLvl) {                                                  
    if (!hasCorrectBinomialNomenclature()) { 
        return _errs('reportFormFieldErr', ['Species', 'needsGenusName', fLvl]); 
    }
    _forms.submitForm('#'+fLvl+'-form',  fLvl, 'taxon');
    
    function hasCorrectBinomialNomenclature() {
        const species = $('#DisplayName_row input')[0].value;
        const genus = _cmbx('getSelTxt', ['#Genus-sel']);                       //console.log('Genus = %s, Species = %s', genus, species);
        const speciesParts = species.split(' ');
        return genus === speciesParts[0];
    }
}
function enableTaxonLvls(enable = true) {
    $.each($('#sub-form select'), (i, sel) => {
        _cmbx('enableCombobox', ['#'+sel.id, enable])
    });
}