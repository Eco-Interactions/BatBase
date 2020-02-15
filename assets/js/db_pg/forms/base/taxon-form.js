/**
 * Taxon form code.
 *
 * Exports:                 
 *     finishEditFormBuild
 *     getTaxonEditFields
 *     initCreateForm
 *     initFormCombos
 *     selectParentTaxon        form-errors
 *     
 * CODE SECTIONS
 *     CREATE FORM
 *     EDIT FORM
 *         FIELDS
 *             NAME FIELD AND LEVEL COMBOBOX
 *             PARENT TAXON ELEMS
 *                 TAXON PARENT SELECT FORM
 *                     LEVEL COMBO ELEMS
 *                     FINISH SELECT FORM BUILD
 *                     ERROR HANDLING
 *         ROW BUILDERS
 *         FINISH EDIT FORM BUILD
 *         ERROR HANDLING
 */
import * as _f from '../forms-main.js';

let realmData;

export function initFormCombos(entity, fLvl) {} //No combos in this form.

/** ********************** CREATE FORM ************************************** */
export function initCreateForm(lvl, value) {                                    console.log('           /--initTaxon[%s]Form [%s]', lvl, value);
    const val = value === 'create' ? '' : value;
    const level = _f.util('ucfirst', [lvl]);
    return showNewTaxonForm(val, level);
} 
function showNewTaxonForm(val, level) {                                  
    _f.state('setRealmProp', ['formTaxonLvl', level]);  //used for data validation/submit
    return buildTaxonForm()
    .then(() => _f.elems('toggleSubmitBttn', ['#sub2-submit', true]));

    function buildTaxonForm() {
        const pId = '#'+level+'-sel'
        const vals = {'DisplayName': val};
        _f.state('addEntityFormState', ['taxon', 'sub2', pId, 'create']);
        return _f.elems('initSubForm', ['sub2', 'sml-sub-form', vals, pId])
            .then(appendTxnFormAndFinishBuild);
    }
    function appendTxnFormAndFinishBuild(form) {
        $('#'+level+'_row').append(form);
        _f.elems('toggleSubmitBttn', ['#sub2-submit'])
        $('#sub2-hdr')[0].innerText += ' '+ level;
        $('#DisplayName_row input').focus();
        updateTaxonSubmitBttn(level);
    }
} 
function updateTaxonSubmitBttn(level) {
    $('#sub2-submit').off('click').click(checkTaxonymErrsAndSubmit.bind(null, level));
}
function checkTaxonymErrsAndSubmit(level) {
    if (ifEmptyNameField()) { return fieldErr(level, 'needsName'); }
    if (ifSpeciesErr(level)) { return fieldErr(level, 'needsGenusName'); }
    _f.submitForm('#sub2-form',  'sub2', 'taxon');
}
function ifEmptyNameField() {
    return !$('#DisplayName_row input').val();
}
function ifSpeciesErr(level) { 
    return level === 'Species' && !hasCorrectBinomialNomenclature();
    
    function hasCorrectBinomialNomenclature() {
        const species = $('#DisplayName_row input')[0].value;
        const genus = _f.cmbx('getSelTxt', ['#Genus-sel']);                     //console.log('Genus = %s, Species = %s', genus, species);
        const speciesParts = species.split(' ');
        return genus === speciesParts[0];
    }
}
function fieldErr(level, tag) {
    _f.val('reportFormFieldErr', [level, tag, 'sub2'])
}
/** ********************** EDIT FORM **************************************** */
/**
 * Returns the elements of the edit-taxon form. 
 * <div>Parent Taxon: [Level][Display-name]</> <bttnInput>"Edit Parent"</>
 * <select>[Taxon-level]</>    <input type="text">[Taxon Display-name]</>
 *     <button>Update Taxon</> <button>Cancel</>
 */
export function getTaxonEditFields(id) {
    const taxa = _f.state('getEntityRcrds', ['taxon']);
    const realm = taxa[id].realm;
    const role = realm.displayName === 'Bat' ? 'Subject' : 'Object';
    return _f.state('initRealmState', [role, realm.id])
        .then(realmState => {
            setScopeTaxonMemory(taxa, realmState);
            return buildTaxonEditFields(taxa[id]);
        });
}
function setScopeTaxonMemory(taxaRcrds, realmState) {
    realmData = realmState;
    realmData.rcrds = taxaRcrds;
}
/** ======================== FIELDS ========================================= */
function buildTaxonEditFields(taxon) {
    const txnElems = getEditTaxonFields(taxon);
    const prntElems = getPrntTaxonElems(taxon);  
    return prntElems.concat(txnElems);
}
/** ----------------- NAME FIELD AND LEVEL COMBOBOX ------------------------- */
function getEditTaxonFields(taxon) {                                            //console.log("getEditTaxonFields for [%s]", taxon.displayName);
    const input = buildNameInput(taxon.displayName);
    const lvlSel = buildLvlSel(taxon);
    return [ buildTaxonEditFormRow('Taxon', [lvlSel, input], 'top')];
}
/** ----------- NAME INPUT --------------- */
function buildNameInput(displayName) { 
    const attr = { id: 'txn-name', type: 'text', value: displayName };
    return _f.util('buildElem', ['input', attr]);
}
/** ------- LEVEL COMBOBOX --------------- */
function buildLvlSel(taxon) {
    const opts = getTaxonLvlOpts(); 
    const sel = _f.util('buildSelectElem', [opts, { id: 'txn-lvl' }]);
    $(sel).data({ 'txn': taxon.id, 'lvl': getLvlVal(taxon.level.displayName) });
    return sel;
}
function getLvlVal(lvl) {
    return realmData.lvls[lvl].ord;
}
/** Returns an array of options for the levels in the taxon's realm. */
function getTaxonLvlOpts() {
    return realmData.realmLvls.reverse().map(lvl => { 
        return { value: realmData.lvls[lvl].ord, text: lvl };
    });  
}
/** ----------------- PARENT TAXON ELEMS ------------------------------------ */
/**
 * <div>Taxon Parent: [parent name]</> <button>Change Parent</>
 * Button calls @showParentTaxonSelectForm.
 */
function getPrntTaxonElems(taxon) {                                             //console.log("getPrntTaxonElems for %O", taxon);
    const prnt = realmData.rcrds[taxon.parent]; 
    const elems = [ buildNameElem(prnt), buildEditPrntBttn(prnt)];
    return [ buildTaxonEditFormRow('Parent', elems, 'top')];
}
/** ----------- PARENT TAXON NAME --------------- */
function buildNameElem(prnt) {
    const div = _f.util('buildElem', ['div', { id: 'txn-prnt' }]);
    setTaxonPrntNameElem(prnt, div);
    $(div).css({'padding-top': '4px'});
    return div;
}
function setTaxonPrntNameElem(prnt, elem, pText) {    
    const div = elem || $('#txn-prnt')[0];
    const text = pText || prnt.displayName;
    div.innerHTML = '<b>Taxon Parent</b>: <span>&nbsp ' + text + '</span>';
    $(div).data('txn', prnt.id).data('lvl', getLvlVal(prnt.level.displayName));
}
/** ----------- CHANGE PARENT BUTTON --------------- */
function buildEditPrntBttn(prnt) {
    const attr = { type: 'button', value: 'Change Parent', id: 'chng-prnt', 
        class: 'ag-fresh tbl-bttn' };
    const bttn = _f.util('buildElem', ['input', attr]);
    $(bttn).click(showParentTaxonSelectForm);
    return bttn;
}
/** ============= TAXON PARENT SELECT FORM ================================== */
/**
 * <select>[Realm Levels]</> <select>[Taxa at selected level]</>
 * Changing the level select repopulates the taxon select with taxa at this level.
 * Entering a taxon that does not already exists will open the 'create' form.
 * Current parent data is selected upon init.
 */
function showParentTaxonSelectForm() {   
    buildParentTaxonEditElems($('#txn-prnt').data('txn'))        
    .then(appendPrntFormElems)
    .then(finishSelectPrntFormBuild);
}
/** ------------------ LEVEL COMBO ELEMS ------------------------------------ */
function buildParentTaxonEditElems(prntId) {
    const prnt = realmData.rcrds[prntId];
    const hdr = [ buildEditParentHdr()];
    const bttns = [ _f.elems('getFormFooter', ['parent', 'sub', 'edit'])];
    return getParentEditFields(prnt)
        .then(fields => hdr.concat(fields, bttns));
}
function buildEditParentHdr() {
    const attr = { text: 'Select New Taxon Parent', id:'sub-hdr' };
    return _f.util('buildElem', ['h3', attr]);
}
function getParentEditFields(prnt) {    
    const realm = _f.util('lcfirst', [prnt.realm.displayName]);      
    _f.state('addEntityFormState', [realm, 'sub', null, 'edit']);
    return _f.elems('buildFormRows', ['subject', {}, 'sub', null])
        .then(modifyAndReturnPrntRows);
    
    function modifyAndReturnPrntRows(rows) {  
        const realmSelRow = getRealmLvlRow(prnt);
        return [realmSelRow, rows];
    }
}
/** ------- REALM DISPLAY NAME ------ */
function getRealmLvlRow(taxon) { 
    const lbl = _f.util('buildElem', ['label', { text: realmData.rootLvl }]);
    const span = buildRealmNameSpan(taxon.realm.displayName);
    return buildTaxonEditFormRow(realmData.rootLvl, [lbl, span], 'sub');
}
function buildRealmNameSpan(realmName) {
    const span = _f.util('buildElem', ['span', { text: realmName }]);
    $(span).css({ 'padding-top': '.55em' });
    return span;
}
function appendPrntFormElems(elems) {
    const attr = { class: 'sml-sub-form flex-row pTaxon', id: 'sub-form' };
    const cntnr = _f.util('buildElem', ['div', attr]);
    $(cntnr).append(elems);
    $('#Parent_row').after(cntnr);
}
/** ------------------ FINISH SELECT FORM BUILD ----------------------------- */
/**
 * Initializes the edit-parent form's comboboxes and selects the current parent.
 * Hides the species row. Adds styles and modifies event listeners. 
 */
function finishSelectPrntFormBuild() {                                          //console.log("fP = %O", fP);    
    initSelectParentCombos();
    selectParentTaxon($('#txn-prnt').data('txn'));
    finishParentSelectFormUi();
}
function initSelectParentCombos() {
    _f.cmbx('initFormCombos', [null, 'sub', getSelectParentComboEvents()]);
}
function getSelectParentComboEvents() {
    return {
        'Class': { change: onParentLevelSelection, add: initCreateForm.bind(null, 'class') },
        'Family': { change: onParentLevelSelection, add: initCreateForm.bind(null, 'family') },
        'Genus': { change: onParentLevelSelection, add: initCreateForm.bind(null, 'genus') },
        'Order': { change: onParentLevelSelection, add: initCreateForm.bind(null, 'order') },
        'Realm': { change: onParentLevelSelection },
        'Species': { change: onParentLevelSelection, add: initCreateForm.bind(null, 'species') },
    }
}
function onParentLevelSelection(val) {
    _f.onLevelSelection.bind(this)(val);
}
export function selectParentTaxon(prntId) {                                     //console.log('selectParentTaxon. prntId [%s], taxa [%O]', prntId, realmData.rcrds);                          
    const prntTxn = realmData.rcrds[prntId];
    if (prntTxn.isRealm) { return; }
    const prntLvl = prntTxn.level.displayName;
    _f.cmbx('setSelVal', ['#'+prntLvl+'-sel', prntId]);
}
function finishParentSelectFormUi() {
    alignRealmLevelText();
    clearAndDisableTopFormParentFields();
    $('#Species_row').hide();
    updateSubmitBttns();
}
function alignRealmLevelText() {
    $('#'+realmData.rootLvl+'_row .field-row')[0].className += ' realm-row';
}
function clearAndDisableTopFormParentFields() {
    $('#txn-prnt span').text('');
    $('#chng-prnt').attr({'disabled': true}).css({'opacity': '.6'});
}
function updateSubmitBttns() {
    $('#sub-submit').attr('disabled', false).css('opacity', '1');
    $('#sub-submit').off('click').click(selectTaxonParent);
    $('#sub-cancel').off('click').click(cancelPrntEdit);
    _f.elems('toggleSubmitBttn', ['#top-submit', false]);
    $('#sub-submit')[0].value = 'Select Taxon';
}
function selectTaxonParent() {    
    const prnt =  _f.forms('getSelectedTaxon') || realmData.realmTaxon;             //console.log("selectTaxonParent called. prnt = %O", prnt);
    if (ifParentSelectErrs(getLvlVal(prnt.level.displayName))) { return; }
    exitPrntEdit(prnt);
}
function cancelPrntEdit() {                                                     //console.log("cancelPrntEdit called.");
    const prnt = realmData.rcrds[$('#txn-prnt').data('txn')];
    exitPrntEdit(prnt);
}
function exitPrntEdit(prnt) {
    resetAfterEditParentClose(prnt);
}
function resetAfterEditParentClose(prnt) {
    clearLvlErrs('#Parent_errs', 'sub');
    $('#sub-form').remove();
    $('#chng-prnt').attr({'disabled': false}).css({'opacity': '1'});
    setTaxonPrntNameElem(prnt);
    _f.elems('toggleSubmitBttn', ['#top-submit', true]);
}
/** ------------------------ ERROR HANDLING --------------------------------- */
/**
 * Ensures that the parent taxon has a higher taxon-level and that a species 
 * taxon being edited has a genus parent selected.
 */
function ifParentSelectErrs(prntLvl) {
    const hasErrs = checkEachPossibleParentErr(prntLvl);
    if (!hasErrs) { clearLvlErrs('#Parent_errs', 'sub'); }
    return hasErrs;

} /* End ifParentSelectErrs */
function checkEachPossibleParentErr(prntLvl) { 
    const txnLvl = $('#txn-lvl').val();                                         console.log("ifParentSelectErrs. taxon = %s. parent = %s", txnLvl, prntLvl);
    const errs = [
        { 'needsHigherLvlPrnt': txnLvl <= prntLvl },
        { 'needsGenusPrnt': txnLvl == 8 && prntLvl != 7 }
    ];
    return !errs.every(checkForErr);                                            //console.log('hasErrs? ', hasErrs)
    
    function checkForErr(errObj) {                                         
        for (let err in errObj) { 
            return errObj[err] ? sendTxnErrRprt(err, 'Parent', 'sub') : true;
        }                                                                   
    }
}
/** ======================= ROW BUILDERS ==================================== */
/**
 * Each element is built, nested, and returned as a completed row. 
 * rowDiv>(errorDiv, fieldDiv>inputElems)
 */
function buildTaxonEditFormRow(field, inputElems, fLvl) {
    const rowDiv = buildFormRow(field, fLvl);
    const errorDiv = _f.util('buildElem', ['div', { id: field+'_errs'}]); 
    const fieldCntnr = buildFieldCntnr(inputElems);
    $(rowDiv).append([errorDiv, fieldCntnr]);
    return rowDiv;
} 
function buildFormRow(field, fLvl) {
    const attr = { class: fLvl + '-row', id: field + '_row'};
    return _f.util('buildElem', ['div', attr]);
}
function buildFieldCntnr(fields) {
    const cntnr =  _f.util('buildElem', ['div', { class: 'field-row flex-row'}]);
    $(cntnr).append(fields);
    return cntnr;
}
/** =============== FINISH MAIN FORM BUILD ================================== */
export function finishEditFormBuild(entity) {
    $('#top-submit').off('click').click(submitTaxonEdit);
    initTaxonEditLevelCombo(); 
    $('.all-fields-cntnr').hide();
}
function submitTaxonEdit() {
    const vals = {
        displayName: $('#Taxon_row > div.field-row.flex-row > input[type="text"]').val(),
        level:       $('#Taxon_row select').text(),
        parentTaxon: $('#txn-prnt').data('txn')
    };                                                                          //console.log("taxon vals = %O", vals);
    _f.formatAndSubmitData('taxon', 'top', vals);
}
function initTaxonEditLevelCombo() {                                       
    const options = { create: false, onChange: checkForTaxonLvlErrs, placeholder: null }; 
    $('#txn-lvl').selectize(options);                                           
    _f.cmbx('setSelVal', ['#txn-lvl', $('#txn-lvl').data('lvl'), 'silent']);
}
/** ======================= ERROR HANDLING ================================== */
/**
 * Ensures that the new taxon-level is higher than its children, and that a 
 * species taxon being edited has a genus parent selected.
 */
function checkForTaxonLvlErrs(txnLvl) {
    const prntLvl = $('#txn-prnt').data('lvl');                                 //console.log("checkForTaxonLvlErrs. taxon = %s. parent = %s", txnLvl, prntLvl);
    const hasErrs = {
        'isGenusPrnt': isGenusPrnt(),
        'needsHigherLvl': lvlIsLowerThanKidLvls(txnLvl)
    };
    for (let err in hasErrs) {  
        if (hasErrs[err]) { return sendTxnErrRprt(err, 'Taxon', 'top'); }
    }
    clearPreviousErr('clrNeedsHigherLvl', txnLvl);
}
/** Returns true if the taxon's original level is Genus and it has children. */
function isGenusPrnt() {
    const orgTxnLvl = $('#txn-lvl').data('lvl');
    const txnId = $('#txn-lvl').data('txn');
    return orgTxnLvl == 6 && getHighestChildLvl(txnId) < 8;
}
/** 
 * Returns true if the passed level is lower or equal to the highest level of 
 * the taxon-being-edited's children.  
 */
function lvlIsLowerThanKidLvls(txnLvl) {                                    
    const highLvl = getHighestChildLvl($('#txn-lvl').data('txn'));                
    return txnLvl >= highLvl;
}
function getHighestChildLvl(taxonId) {
    let high = realmData.lvls.Species.ord;
    realmData.rcrds[taxonId].children.forEach(checkChildLvl);
    return high;

    function checkChildLvl(id) {
        const child = realmData.rcrds[id]
        if (child.level.ord < high) { high = child.level.ord; }
    }
} /* End getHighestChildLvl */
function getSpeciesLvl() {
    
}
function clearPreviousErr(errTag, txnLvl) {
    if ($('.top-active-errs').length) { 
        _f.val(errTag, [null, null, null, txnLvl]); 
    }
}
function sendTxnErrRprt(errTag, field, fLvl) {                                              
    _f.val('reportFormFieldErr', [field, errTag, fLvl]);
    _f.elems('toggleSubmitBttn', ['#top-submit', false]);
    return false;
}
function clearLvlErrs(elemId, fLvl) {                                           //console.log('clearLvlErrs.')
    if (!$('.top-active-errs').length) { return; }
    _f.val('clearErrElemAndEnableSubmit', [$(elemId)[0], fLvl]);
}
