/**
 * Taxon create form code.
 *
 * CODE SECTIONS
 *     CREATE FORM
 *     EDIT FORM
 *
 * Exports:                 
 *     finishEditFormBuild
 *     getTaxonEditFields
 *     initCreateForm
 *     initFormCombos
 */
import * as _i from '../forms-main.js';

let mmry;

export function initFormCombos(entity, fLvl) {} //No combos in this form.

/** ********************** CREATE FORM ************************************** */
export function initCreateForm(lvl, value) {                                    console.log('           /--initTaxon[%s]Form [%s]', lvl, value);
    const val = value === 'create' ? '' : value;
    const level = _i.util('ucfirst', [lvl]);
    // const fLvl = getTaxonCreateLvl();  why was this here? 
    return showNewTaxonForm(val, level, 'sub2');
} 
// function getTaxonCreateLvl() {
//     return _i.mmry('getMemoryProp', ['action']) === 'edit' 
//     // const editFormLvl = _i.mmry('getTaxonProp', ['prntSubFormLvl']);
//     // return editFormLvl || _i.getSubFormLvl('sub2'); //when editing parent taxon
// }
function showNewTaxonForm(val, level, fLvl) {                                  
    _i.mmry('setTaxonProp', ['formTaxonLvl', level]);  //used for data validation/submit
    return buildTaxonForm()
    .then(() => _i.ui('toggleSubmitBttn', ['#sub2-submit', !!val]));

    function buildTaxonForm() {
        const pId = '#'+level+'-sel'
        const vals = {'DisplayName': val};
        _i.mmry('initEntityFormMemory', ['taxon', fLvl, pId, 'create']);
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
/** ********************** EDIT FORM **************************************** */
/** ================= TAXON MAIN FORM ======================================= */
/**
 * Returns the elements of the edit-taxon form. 
 * <div>Parent Taxon: [Level][Display-name]</> <bttnInput>"Edit Parent"</>
 * <select>[Taxon-level]</>    <input type="text">[Taxon Display-name]</>
 *     <button>Update Taxon</> <button>Cancel</>
 */
export function getTaxonEditFields(id) {
    const taxa = _i.mmry('getEntityRcrds', ['taxon']);
    const realm = taxa[id].realm.displayName;
    const role = realm === 'Bat' ? 'Subject' : 'Object';
    return _i.mmry('initTaxonMemory', [role, realm])
        .then(txnMmry => buildTaxonEditFields(taxa[id], taxa, txnMmry));
}
function buildTaxonEditFields(taxon, taxaRcrds, txnMmry) {
    setScopeTaxonMemory(taxaRcrds, txnMmry);
    const txnElems = getEditTaxonFields(taxon)
    const prntElems = getPrntTaxonElems(taxon);
    return prntElems.concat(txnElems);
}
function setScopeTaxonMemory(taxaRcrds, txnMmry) {
    mmry = txnMmry;
    mmry.rcrds = taxaRcrds;
}
/** ----------------- TAXON NAME AND LEVEL ELEMS ---------------------------- */
function getEditTaxonFields(taxon) {                                            //console.log("getEditTaxonFields for [%s]", taxon.displayName);
    const input = buildNameInput(taxon.displayName);
    const lvlSel = getlvlSel(taxon);
    return [ buildTaxonEditFormRow('Taxon', [lvlSel, input], 'top')];
}
/** ----------- NAME INPUT --------------- */
function buildNameInput(displayName) { 
    const attr = { id: 'txn-name', type: 'text', value: displayName };
    return _i.util('buildElem', ['input', attr]);
}
/** ------- LEVEL COMBOBOX --------------- */
function getlvlSel(taxon) {
    const opts = getTaxonLvlOpts(taxon); 
    const sel = _i.util('buildSelectElem', [opts, { id: 'txn-lvl' }]);
    $(sel).data({ 'txn': taxon.id, 'lvl': taxon.level.id });
    return sel;
}
/** Returns an array of options for the levels in the taxon's realm. */
function getTaxonLvlOpts(taxon) {
    const opts = {};
    const realmLvls = mmry.curRealmLvls.map(lvl => lvl);  
    realmLvls.shift();  //Removes the realm-level
    buildLvlOptsObj();
    return _i.util('buildOptsObj', [opts, Object.keys(opts)]);

    function buildLvlOptsObj() {
        const lvls = _i.util('snapshot', [mmry.lvls]);                          //console.log('realmLvls = %O, allLvls = %O', _i.util('snapshot(realmLvls), _i.util('snapshot(lvls));
        for (let i = lvls.length - 1; i >= 0; i--) {
            if (realmLvls.indexOf(lvls[i]) === -1) { continue; }
            opts[lvls[i]] = i+1;
        }
    }
}
/** ----------------- PARENT TAXON ELEMS ------------------------------------ */
/**
 * <div>Taxon Parent: [parent name]</> <button>Change Parent</>
 * Button calls @showParentTaxonSelectForm.
 */
function getPrntTaxonElems(taxon) {                                             //console.log("getPrntTaxonElems for %O", taxon);
    const prnt = mmry.rcrds[taxon.parent]; 
    const elems = [ buildNameElem(prnt), buildEditPrntBttn(prnt)];
    return [ buildTaxonEditFormRow('Parent', elems, 'top')];
}
/** ----------- PARENT TAXON NAME --------------- */
function buildNameElem(prnt) {
    const div = _i.util('buildElem', ['div', { id: 'txn-prnt' }]);
    setTaxonPrntNameElem(prnt, div);
    $(div).css({'padding-top': '4px'});
    return div;
}
function setTaxonPrntNameElem(prnt, elem, pText) {
    const div = elem || $('#txn-prnt')[0];
    const text = pText || _i.getTaxonDisplayName(prnt);
    div.innerHTML = '<b>Taxon Parent</b>: <span>&nbsp ' + text + '</span>';
    if (prnt) { $(div).data('txn', prnt.id).data('lvl', prnt.level.id); }
}
/** ----------- CHANGE PARENT BUTTON --------------- */
function buildEditPrntBttn(prnt) {
    const attr = { type: 'button', value: 'Change Parent', id: 'chng-prnt', 
        class: 'ag-fresh tbl-bttn' };
    const bttn = _i.util('buildElem', ['input', attr]);
    $(bttn).click(showParentTaxonSelectForm);
    return bttn;
}
/** ------------------ FINISH FORM BUILD ------------------------------------ */
export function finishEditFormBuild(entity) {
    $('#top-submit').off('click').click(submitTaxonEdit);
    initTaxonEditCombo('txn-lvl', checkForTaxonLvlErrs); 
    $('.all-fields-cntnr').hide();
}
function submitTaxonEdit() {
    const vals = {
        displayName: $('#Taxon_row > div.field-row.flex-row > input[type="text"]').val(),
        level:       $('#Taxon_row select').text(),
        parentTaxon: $('#txn-prnt').data('txn')
    };                                                                          //console.log("taxon vals = %O", vals);
    _i.formatAndSubmitData('taxon', 'top', vals);
}
/** Inits a taxon select-elem with the selectize library. */
function initTaxonEditCombo(selId, chngFunc, createFunc) {                      //console.log("initTaxonEditCombo. selId = ", selId);
    const chng = chngFunc || Function.prototype;
    const options = { create: false, onChange: chng, placeholder: null }; 
    $('#'+selId).selectize(options);
    _i.cmbx('setSelVal', ['#'+selId, $('#'+selId).data('lvl'), 'silent']);
}
/** ----------------------- ERROR HANDLING ---------------------------------- */
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
        if (hasErrs[err]) { return sendTxnErrRprt(err, 'Taxon'); }
    }
    clearPreviousErr('clrNeedsHigherLvl');
    // ifParentSelectErrs(prntLvl);
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
    const highLvl = getHighestChildLvl($('#txn-lvl').data('txn'));                //console.log('lvlIsLowerThanKidLvls. txnLvl = %s, childHigh = %s', txnLvl, highLvl)                  
    return txnLvl >= highLvl;
}
function getHighestChildLvl(taxonId) {
    const high = 8;
    mmry.rcrds[taxonId].children.forEach(checkChildLvl);
    return high;

    function checkChildLvl(id) {
        const child = mmry.rcrds[id]
        if (child.level.id < high) { high = child.level.id; }
    }
} /* End getHighestChildLvl */
function clearPreviousErr(errTag) {
    if ($('.top-active-errs').length) { 
        _i.err(errTag, [null, null, null, txnLvl]); 
    }
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
/** ----------------------- BUILD FIELDS ------------------------------------ */
function buildParentTaxonEditElems(prntId) {
    const prnt = mmry.rcrds[prntId];
    const hdr = [ buildEditParentHdr()];
    const bttns = [ _i.ui('getFormFooter', ['parent', 'sub', 'edit', true])];
    return getParentEditFields(prnt)
        .then(fields => hdr.concat(fields, bttns));
}
function buildEditParentHdr() {
    const attr = { text: 'Select New Taxon Parent', id:'sub-hdr' };
    return _i.util('buildElem', ['h3', attr]);
}
function getParentEditFields(prnt) {  
    const realm = _i.util('lcfirst', [prnt.realm.displayName]);      
    _i.mmry('initEntityFormMemory', [realm, 'sub', null, 'edit']);
    return _i.elems('buildFormRows', [realm, {}, 'sub', null])
        .then(modifyAndReturnPrntRows);
    
    function modifyAndReturnPrntRows(rows) {
        const realmSelRow = getRealmLvlRow(prnt);
        $(rows).css({ 'padding-left': '.7em' });
        // mmry.prntSubFormLvl = 'sub2';
        return [realmSelRow, rows];
    }
}
/** ------- REALM DISPLAY NAME ------ */
function getRealmLvlRow(taxon) { 
    const realmLvl = mmry.curRealmLvls[0];
    const lbl = _i.util('buildElem', ['label', { text: realmLvl }]);
    const taxonym = _i.util('buildElem', ['span', { text: taxon.realm.displayName }]);
    $(taxonym).css({ 'padding-top': '.55em' });
    return buildTaxonEditFormRow(realmLvl, [lbl, taxonym], 'sub');
}
function appendPrntFormElems(elems) {
    const attr = { class: 'sml-sub-form flex-row pTaxon', id: 'sub-form' };
    const cntnr = _i.util('buildElem', ['div', attr]);
    $(cntnr).append(elems);
    $('#Parent_row').after(cntnr);
}
/** ------------------------ FINISH BUILD ----------------------------------- */
/**
 * Initializes the edit-parent form's comboboxes and selects the current parent.
 * Hides the species row. Adds styles and modifies event listeners. 
 */
function finishSelectPrntFormBuild() {                                                //console.log("fP = %O", fP);    
    initSelectParentCombos();
    selectParentTaxon($('#txn-prnt').data('txn'));
    // _i.mmry('setonFormCloseHandler', [fLvl, enableTaxonLvls]);
    // const realmLvl = mmry.curRealmLvls[0];
    finishParentSelectFormUi();
}
function initSelectParentCombos() {
    _i.cmbx('initFormCombos', [null, 'sub', getSelectParentComboEvents()]);
}
function getSelectParentComboEvents() {
    return {
        'Class': { change: ifParentSelectErrs, add: initCreateForm.bind(null, 'class') },
        'Family': { change: ifParentSelectErrs, add: initCreateForm.bind(null, 'family') },
        'Genus': { change: ifParentSelectErrs, add: initCreateForm.bind(null, 'genus') },
        'Order': { change: ifParentSelectErrs, add: initCreateForm.bind(null, 'order') },
        'Realm': { change: ifParentSelectErrs },
        'Species': { change: ifParentSelectErrs, add: initCreateForm.bind(null, 'species') },
    }
}
function selectParentTaxon(prntId) {                         console.log('selectParentTaxon. prntId [%s], taxa [%O]', prntId, mmry.rcrds);                          
    const parentLvl = mmry.rcrds[prntId].level.displayName;  
    const realmLvl = mmry.curRealmLvls[0];
    if (parentLvl == realmLvl) { return; }
    _i.cmbx('setSelVal', ['#'+parentLvl+'-sel', prntId]);
    // clearAllOtherLvls();
}
// function clearAllOtherLvls() {
//     $.each($('#sub-form select[id$="-sel"]'), (i, elem) => { 
//         $(elem)[0].selectize.clear('silent');
//     });
// }
function finishParentSelectFormUi() {
    alignRealmLevelText();
    clearAndDisableTopFormParentFields();
    $('#Species_row').hide();
    updateSubmitBttns();
}
function alignRealmLevelText() {
    const realmLvl = mmry.curRealmLvls[0];
    $('#'+realmLvl+'_row .field-row')[0].className += ' realm-row';
}
function clearAndDisableTopFormParentFields() {
    $('#txn-prnt span').text('');
    $('#chng-prnt').attr({'disabled': true}).css({'opacity': '.6'});
}
function updateSubmitBttns() {
    $('#sub-submit').attr('disabled', false).css('opacity', '1');
    $('#sub-submit').off('click').click(selectTaxonParent);
    $('#sub-cancel').off('click').click(cancelPrntEdit);
    _i.ui('toggleSubmitBttn', ['#top-submit', false]);
    $('#sub-submit')[0].value = 'Select Taxon';
}
function selectTaxonParent() {                                                  
    const prnt =  _i.entity('getSelectedTaxon') || mmry.realmTaxon;              //console.log("selectTaxonParent called. prnt = %O", prnt);
    exitPrntEdit(prnt);
}
function cancelPrntEdit() {                                                     //console.log("cancelPrntEdit called.");
    const prnt = mmry.rcrds[$('#txn-prnt').data('txn')];
    exitPrntEdit(prnt);
}
function exitPrntEdit(prnt) {
    if (ifParentSelectErrs(prnt.level.id)) { return; }
    resetAfterEditParentClose(prnt);
}
function resetAfterEditParentClose(prnt) {
    clearLvlErrs('#Parent_errs', 'sub');
    // mmry.prntSubFormLvl = null;
    $('#sub-form').remove();
    $('#chng-prnt').attr({'disabled': false}).css({'opacity': '1'});
    setTaxonPrntNameElem(prnt);
    _i.ui('toggleSubmitBttn', ['#top-submit', true]);
}
/** ------------------------ ERROR HANDLING --------------------------------- */
/**
 * Ensures that the parent taxon has a higher taxon-level and that a species 
 * taxon being edited has a genus parent selected.
 */
function ifParentSelectErrs(prnt) {
    const hasErrs = checkEachPossibleParentErr(prnt);
    if (!hasErrs) { clearLvlErrs('#Parent_errs', 'sub'); }
    return hasErrs;

} /* End ifParentSelectErrs */
function checkEachPossibleParentErr(prnt) {
    const prntLvl = prnt || $('#txn-prnt').data('lvl'); 
    const txnLvl = $('#txn-lvl').val();                                           //console.log("ifParentSelectErrs. taxon = %s. parent = %s", txnLvl, prntLvl);
    const errs = [
        { 'needsHigherLvlPrnt': txnLvl <= prntLvl },
        { 'needsGenusPrnt': txnLvl == 7 && prntLvl != 6 }
    ];
    return !errs.every(checkForErr);                                            //console.log('hasErrs? ', hasErrs)
    
    function checkForErr(errObj) {                                         
        for (let err in errObj) { 
            return errObj[err] ? sendTxnErrRprt(err, 'Parent') : true;
        }                                                                   
    }
}
/** -------------------- SHARED HELPERS ------------------------------------- */
/**
 * Each element is built, nested, and returned as a completed row. 
 * rowDiv>(errorDiv, fieldDiv>inputElems)
 */
function buildTaxonEditFormRow(field, inputElems, fLvl) {
    const rowDiv = buildFormRow(field, fLvl);
    const errorDiv = _i.util('buildElem', ['div', { id: field+'_errs'}]); 
    const fieldCntnr = buildFieldCntnr(inputElems);
    $(rowDiv).append([errorDiv, fieldCntnr]);
    return rowDiv;
} 
function buildFormRow(field, fLvl) {
    const attr = { class: fLvl + '-row', id: field + '_row'};
    return _i.util('buildElem', ['div', attr]);
}
function buildFieldCntnr(fields) {
    const cntnr =  _i.util('buildElem', ['div', { class: 'field-row flex-row'}]);
    $(cntnr).append(fields);
    return cntnr;
}
function sendTxnErrRprt(errTag, field) {                                              
    _i.err('reportFormFieldErr', [field, errTag, 'top']);
    _i.ui('toggleSubmitBttn', ['#top-submit', false]);
    return false;
}
function clearLvlErrs(elemId, fLvl) {                                           //console.log('clearLvlErrs.')
    if (!$('.top-active-errs').length) { return; }
    _i.err('clearErrElemAndEnableSubmit', [$(elemId)[0], fLvl]);
}