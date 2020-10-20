/**
 * Taxon form code.
 *
 * Exports:
 *     finishEditFormBuild
 *     getTaxonEditFields
 *     initCreateForm
 *     initFormCombos
 *     selectParentTaxon
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
 *                     ERROR HANDLING
 *         ROW BUILDERS
 *         FINISH EDIT FORM BUILD
 *         ERROR HANDLING
 */
import { _u } from '../../../db-main.js';
import { _state, _elems, _cmbx, _form, _val, formatAndSubmitData, submitForm } from '../../forms-main.js';

let taxonData;

export function initFormCombos(entity, fLvl) {} //No combos in this form.

/** ********************** CREATE FORM ************************************** */
export function initCreateForm(rank, value) {                                    console.log('           /--initTaxon[%s]Form [%s]', rank, value);
    const val = value === 'create' ? '' : value;
    const ucRank = _u('ucfirst', [rank]);
    return showNewTaxonForm(val, ucRank);
}
function showNewTaxonForm(val, rank) {
    _state('setTaxonProp', ['formTaxonRank', rank]);  //used for data validation/submit
    return buildTaxonForm()
    .then(() => _elems('toggleSubmitBttn', ['#sub2-submit', true]));

    function buildTaxonForm() {
        const pId = '#'+rank+'-sel'
        const vals = {'DisplayName': val};
        _state('addEntityFormState', ['taxon', 'sub2', pId, 'create']);
        return _elems('initSubForm', ['sub2', 'sml-sub-form', vals, pId])
            .then(appendTxnFormAndFinishBuild);
    }
    function appendTxnFormAndFinishBuild(form) {
        $('#'+rank+'_row').append(form);
        _elems('toggleSubmitBttn', ['#sub2-submit'])
        $('#sub2-hdr')[0].innerText += ' '+ rank;
        $('#DisplayName_row input').focus();
        updateTaxonSubmitBttn(rank);
    }
}
function updateTaxonSubmitBttn(rank) {
    $('#sub2-submit').off('click').click(checkTaxonymErrsAndSubmit.bind(null, rank));
}
function checkTaxonymErrsAndSubmit(rank) {
    if (ifEmptyNameField()) { return fieldErr(rank, 'needsName'); }
    if (ifSpeciesErr(rank)) { return fieldErr(rank, 'needsGenusName'); }
    submitForm('#sub2-form',  'sub2', 'taxon');
}
function ifEmptyNameField() {
    return !$('#DisplayName_row input').val();
}
function ifSpeciesErr(rank) {
    return rank === 'Species' && !hasCorrectBinomialNomenclature();

    function hasCorrectBinomialNomenclature() {
        const species = $('#DisplayName_row input')[0].value;
        const genus = _cmbx('getSelTxt', ['#Genus-sel']);                     //console.log('Genus = %s, Species = %s', genus, species);
        const speciesParts = species.split(' ');
        return genus === speciesParts[0];
    }
}
function fieldErr(rank, tag) {
    _val('reportFormFieldErr', [rank, tag, 'sub2'])
}
/** ********************** EDIT FORM **************************************** */
/**
 * Returns the elements of the edit-taxon form.
 * <div>Parent Taxon: [Rank][Display-name]</> <bttnInput>"Edit Parent"</>
 * <select>[Taxon-rank]</>    <input type="text">[Taxon Display-name]</>
 *     <button>Update Taxon</> <button>Cancel</>
 */
export function getTaxonEditFields(id) {
    const taxa = _state('getEntityRcrds', ['taxon']);
    const group = taxa[id].group;
    const role = group.displayName === 'Bat' ? 'Subject' : 'Object';
    return _state('initTaxonState', [role, group.id, group.subGroup.name])
        .then(groupState => {
            setScopeTaxonMemory(taxa, groupState);
            return buildTaxonEditFields(taxa[id]);
        });
}
function setScopeTaxonMemory(taxaRcrds, groupState) {
    taxonData = groupState;
    taxonData.rcrds = taxaRcrds;
}
/** ======================== FIELDS ========================================= */
function buildTaxonEditFields(taxon) {
    const txnElems = getEditTaxonFields(taxon);
    const prntElems = getPrntTaxonElems(taxon);
    return prntElems.concat(txnElems);
}
/** ----------------- NAME FIELD AND Rank COMBOBOX ------------------------- */
function getEditTaxonFields(taxon) {                                            //console.log("getEditTaxonFields for [%s]", taxon.displayName);
    const input = buildNameInput(taxon.name);
    const rankSel = buildRankSel(taxon);
    return [ buildTaxonEditFormRow('Taxon', [rankSel, input], 'top')];
}
/** ----------- NAME INPUT --------------- */
function buildNameInput(name) {
    const attr = { id: 'txn-name', type: 'text', value: name };
    return _u('buildElem', ['input', attr]);
}
/** ------- RANK COMBOBOX --------------- */
function buildRankSel(taxon) {
    const opts = getTaxonRankOpts();
    const sel = _u('buildSelectElem', [opts, { id: 'txn-rank' }]);
    $(sel).data({ 'txn': taxon.id, 'rank': getRankVal(taxon.rank.displayName) });
    return sel;
}
function getRankVal(rank) {
    return taxonData.ranks[rank].ord;
}
/** Returns an array of options for the ranks in the taxon's group. */
function getTaxonRankOpts() {
    return taxonData.groupRanks.reverse().map(rank => {
        return { value: taxonData.ranks[rank].ord, text: rank };
    });
}
/** ----------------- PARENT TAXON ELEMS ------------------------------------ */
/**
 * <div>Taxon Parent: [parent name]</> <button>Change Parent</>
 * Button calls @showParentTaxonSelectForm.
 */
function getPrntTaxonElems(taxon) {                                             //console.log("getPrntTaxonElems for %O", taxon);
    const prnt = taxonData.rcrds[taxon.parent];
    const elems = [ buildNameElem(prnt), buildEditPrntBttn(prnt)];
    return [ buildTaxonEditFormRow('Parent', elems, 'top')];
}
/** ----------- PARENT TAXON NAME --------------- */
function buildNameElem(prnt) {
    const div = _u('buildElem', ['div', { id: 'txn-prnt' }]);
    setTaxonPrntNameElem(prnt, div);
    $(div).css({'padding-top': '4px'});
    return div;
}
function setTaxonPrntNameElem(prnt, elem, pText) {
    const div = elem || $('#txn-prnt')[0];
    const text = pText || prnt.displayName;
    div.innerHTML = '<b>Taxon Parent</b>: <span>&nbsp ' + text + '</span>';
    $(div).data('txn', prnt.id).data('rank', getRankVal(prnt.rank.displayName));
}
/** ----------- CHANGE PARENT BUTTON --------------- */
function buildEditPrntBttn(prnt) {
    const attr = { type: 'button', value: 'Change Parent', id: 'chng-prnt',
        class: 'ag-fresh' };
    const bttn = _u('buildElem', ['input', attr]);
    $(bttn).click(showParentTaxonSelectForm);
    return bttn;
}
/** ============= TAXON PARENT SELECT FORM ================================== */
/**
 * <select>[Group Ranks]</> <select>[Taxa at selected rank]</>
 * Changing the rank select repopulates the taxon select with taxa at this rank.
 * Entering a taxon that does not already exists will open the 'create' form.
 * Current parent data is selected upon init.
 */
function showParentTaxonSelectForm() {
    buildParentTaxonEditElems($('#txn-prnt').data('txn'))
    .then(appendPrntFormElems)
    .then(finishSelectPrntFormBuild);
}
/** ------------------- RANK COMBO ELEMS ------------------------------------ */
function buildParentTaxonEditElems(prntId) {
    const prnt = taxonData.rcrds[prntId];
    const hdr = [ buildEditParentHdr()];
    const bttns = [ _elems('getFormFooter', ['taxon', 'sub', 'edit'])];
    return getParentEditFields(prnt)
        .then(fields => hdr.concat(fields, bttns));
}
function buildEditParentHdr() {
    const attr = { text: 'Select New Taxon Parent', id:'sub-hdr' };
    return _u('buildElem', ['h3', attr]);
}
function getParentEditFields(prnt) {
    const group = _u('lcfirst', [prnt.group.displayName]);
    _state('addEntityFormState', [group, 'sub', null, 'edit']);
    return _elems('buildFormRows', ['object', {}, 'sub', null])
        .then(modifyAndReturnPrntRows);

    function modifyAndReturnPrntRows(rows) {                                    //console.log('modifyAndReturnPrntRows = %O', rows);
        $(rows)[0].removeChild($(rows)[0].childNodes[0]); //removes Group row
        const groupSelRow = getGroupRankRow(prnt, rows);
        return [groupSelRow, rows].filter(r=>r);
    }
}
/** ------- GROUP DISPLAY NAME ------ */
function getGroupRankRow(taxon, rows) {
    const subGroups = Object.keys(taxonData.subGroups);
    if (subGroups.length > 1) { return; }
    $(rows)[0].removeChild($(rows)[0].childNodes[0]); //removes Sub-Group row
    return buildTaxonParentRow(taxonData.subGroups[subGroups[0]].displayName);
}
function buildTaxonParentRow(displayName) {
    const groupRank = displayName.split(' ')[0];
    const lbl = _u('buildElem', ['label', { text: groupRank }]);
    const groupParent = buildGroupNameSpan(displayName.split(' ')[1]);
    return buildTaxonEditFormRow(groupRank, [lbl, groupParent], 'sub');
}
function buildGroupNameSpan(name) {
    const span = _u('buildElem', ['span', { text: name }]);
    $(span).css({ 'padding-top': '.55em' });
    return span;
}
function appendPrntFormElems(elems) {
    const attr = { class: 'sml-sub-form flex-row pTaxon', id: 'sub-form' };
    const cntnr = _u('buildElem', ['div', attr]);
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
    _cmbx('initFormCombos', [null, 'sub', getSelectParentComboEvents()]);
}
function getSelectParentComboEvents() {
    return {
        'Class': { change: onParentRankSelection, add: initCreateForm.bind(null, 'class') },
        'Family': { change: onParentRankSelection, add: initCreateForm.bind(null, 'family') },
        'Genus': { change: onParentRankSelection, add: initCreateForm.bind(null, 'genus') },
        'Sub-Group': { change: handleOnSubGroupSelection },
        'Order': { change: onParentRankSelection, add: initCreateForm.bind(null, 'order') },
        'Species': { change: onParentRankSelection, add: initCreateForm.bind(null, 'species') },
    }
}
function onParentRankSelection(val) {
    _form('onRankSelection', [val, this.$input[0]]);
}
function handleOnSubGroupSelection(val) {
    _form('onSubGroupSelection', [val])
    .then(hideGroupAndSpeciesCombo)
    .then(enableChangeParentSubmitBttn);
}
/** Note: Species combo needs to stay in DOM for the combo change methods. */
function hideGroupAndSpeciesCombo() {
    $('#Group_row, #Species_row').hide();
}
function enableChangeParentSubmitBttn() {
    _elems('toggleSubmitBttn', ['#sub-submit', true]);
}
export function selectParentTaxon(prntId) {
    const prntTxn = taxonData.rcrds[prntId];                                    //console.log('selectParentTaxon = ', prntTxn);
    ifSubGroupSelect(prntTxn);
    if (prntTxn.isRoot) { return; }
    const prntRank = prntTxn.rank.displayName;
    _cmbx('setSelVal', ['#'+prntRank+'-sel', prntId]);
}
function ifSubGroupSelect(parentTaxon) {
    if (!$('#Sub-Group_row').length) { return; }
    _cmbx('setSelVal', ['#Sub-Group-sel', parentTaxon.group.subGroup.id, 'silent']);
}
function finishParentSelectFormUi() {
    alignGroupRankText();
    clearAndDisableTopFormParentFields();
    $('#Species_row').hide();
    updateSubmitBttns();
}
function alignGroupRankText() {
    if ($('#Sub-Group_row').length) { return; }
    const groupRank = $('#txn-prnt span')[0].innerText.split(' ')[1];
    $('#'+groupRank+'_row .field-row')[0].className += ' group-row';
}
function clearAndDisableTopFormParentFields() {
    $('#txn-prnt span').text('');
    $('#chng-prnt').attr({'disabled': true}).css({'opacity': '.6'});
}
function updateSubmitBttns() {
    $('#sub-submit').attr('disabled', false).css('opacity', '1');
    $('#sub-submit').off('click').click(selectNewTaxonParent);
    $('#sub-cancel').off('click').click(cancelPrntEdit);
    _elems('toggleSubmitBttn', ['#top-submit', false]);
    $('#sub-submit')[0].value = 'Select Taxon';
}
function selectNewTaxonParent() {
    const prnt = _form('getSelectedTaxon') || _state('getTaxonProp', ['groupTaxon']);//console.log("selectNewTaxonParent called. prnt = %O", prnt);
    if (ifParentSelectErrs(getRankVal(prnt.rank.displayName))) { return; }
    exitPrntEdit(prnt);
}
function cancelPrntEdit() {                                                     //console.log("cancelPrntEdit called.");
    const prnt = taxonData.rcrds[$('#txn-prnt').data('txn')];
    exitPrntEdit(prnt);
}
function exitPrntEdit(prnt) {
    resetAfterEditParentClose(prnt);
}
function resetAfterEditParentClose(prnt) {
    clearRankErrs('#Parent_errs', 'sub');
    $('#sub-form').remove();
    $('#chng-prnt').attr({'disabled': false}).css({'opacity': '1'});
    setTaxonPrntNameElem(prnt);
    _elems('toggleSubmitBttn', ['#top-submit', true]);
}
/** ------------------------ ERROR HANDLING --------------------------------- */
/**
 * Ensures that the parent taxon has a higher taxon-rank and that a species
 * taxon being edited has a genus parent selected.
 */
function ifParentSelectErrs(prntRank) {
    const hasErrs = checkEachPossibleParentErr(prntRank);
    if (!hasErrs) { clearRankErrs('#Parent_errs', 'sub'); }
    return hasErrs;
}
function checkEachPossibleParentErr(prntRank) {
    const txnRank = $('#txn-rank').val();                                       //console.log("ifParentSelectErrs. taxon = %s. parent = %s", txnRank, prntRank);
    const errs = [
        { 'needsHigherRankPrnt': txnRank <= prntRank },
        { 'needsGenusPrnt': txnRank == 8 && prntRank != 7 }
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
    const errorDiv = _u('buildElem', ['div', { id: field+'_errs'}]);
    const fieldCntnr = buildFieldCntnr(inputElems);
    $(rowDiv).append([errorDiv, fieldCntnr]);
    return rowDiv;
}
function buildFormRow(field, fLvl) {
    const attr = { class: fLvl + '-row', id: field + '_row'};
    return _u('buildElem', ['div', attr]);
}
function buildFieldCntnr(fields) {
    const cntnr =  _u('buildElem', ['div', { class: 'field-row flex-row'}]);
    $(cntnr).append(fields);
    return cntnr;
}
/** =============== FINISH MAIN FORM BUILD ================================== */
export function finishEditFormBuild(entity) {
    $('#top-submit').off('click').click(submitTaxonEdit);
    initTaxonEditRankCombo();
    $('.all-fields-cntnr').hide();
}
function submitTaxonEdit() {
    const vals = {
        displayName: $('#Taxon_row > div.field-row.flex-row > input[type="text"]').val(),
        rank:       $('#Taxon_row select').text(),
        parentTaxon: $('#txn-prnt').data('txn')
    };                                                                          //console.log("taxon vals = %O", vals);
    formatAndSubmitData('taxon', 'top', vals);
}
function initTaxonEditRankCombo() {
    const options = { create: false, onChange: checkForTaxonRankErrs, placeholder: null };
    $('#txn-rank').selectize(options);
    _cmbx('setSelVal', ['#txn-rank', $('#txn-rank').data('rank'), 'silent']);
}
/** ======================= ERROR HANDLING ================================== */
/**
 * Ensures that the new taxon-rank is higher than its children, and that a
 * species taxon being edited has a genus parent selected.
 */
function checkForTaxonRankErrs(txnRank) {
    const prntRank = $('#txn-prnt').data('rank');                                 //console.log("checkForTaxonRankErrs. taxon = %s. parent = %s", txnRank, prntRank);
    const hasErrs = {
        'isGenusPrnt': isGenusPrnt(),
        'needsHigherRank': rankIsLowerThanKidRanks(txnRank)
    };
    for (let err in hasErrs) {
        if (hasErrs[err]) { return sendTxnErrRprt(err, 'Taxon', 'top'); }
    }
    clearPreviousErr('clrNeedsHigherRank', txnRank);
}
/** Returns true if the taxon's original rank is Genus and it has children. */
function isGenusPrnt() {
    const orgTxnRank = $('#txn-rank').data('rank');
    const txnId = $('#txn-rank').data('txn');
    return orgTxnRank == 6 && getHighestChildRank(txnId) < 8;
}
/**
 * Returns true if the passed rank is lower or equal to the highest rank of
 * the taxon-being-edited's children.
 */
function rankIsLowerThanKidRanks(txnRank) {
    const highRank = getHighestChildRank($('#txn-rank').data('txn'));
    return txnRank >= highRank;
}
function getHighestChildRank(taxonId) {
    let high = taxonData.ranks.Species.ord;
    taxonData.rcrds[taxonId].children.forEach(checkChildRank);
    return high;

    function checkChildRank(id) {
        const child = taxonData.rcrds[id]
        if (child.rank.ord < high) { high = child.rank.ord; }
    }
}
function clearPreviousErr(errTag, txnRank) {
    if ($('.top-active-errs').length) {
        _val(errTag, [null, null, null, txnRank]);
    }
}
function sendTxnErrRprt(errTag, field, fLvl) {
    _val('reportFormFieldErr', [field, errTag, fLvl]);
    _elems('toggleSubmitBttn', ['#top-submit', false]);
    return false;
}
function clearRankErrs(elemId, fLvl) {                                           //console.log('clearRankErrs.')
    if (!$('.top-active-errs').length) { return; }
    _val('clearErrElemAndEnableSubmit', [$(elemId)[0], fLvl]);
}
