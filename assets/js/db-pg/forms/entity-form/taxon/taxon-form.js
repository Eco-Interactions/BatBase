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
import { _u } from '../../../db-main.js';
import { _state, _elems, _cmbx, _form, _val, formatAndSubmitData, submitForm } from '../../forms-main.js';

let groupData;

export function initFormCombos(entity, fLvl) {} //No combos in this form.

/** ********************** CREATE FORM ************************************** */
export function initCreateForm(lvl, value) {                                    console.log('           /--initTaxon[%s]Form [%s]', lvl, value);
    const val = value === 'create' ? '' : value;
    const level = _u('ucfirst', [lvl]);
    return showNewTaxonForm(val, level);
}
function showNewTaxonForm(val, level) {
    _state('setGroupProp', ['formTaxonLvl', level]);  //used for data validation/submit
    return buildTaxonForm()
    .then(() => _elems('toggleSubmitBttn', ['#sub2-submit', true]));

    function buildTaxonForm() {
        const pId = '#'+level+'-sel'
        const vals = {'DisplayName': val};
        _state('addEntityFormState', ['taxon', 'sub2', pId, 'create']);
        return _elems('initSubForm', ['sub2', 'sml-sub-form', vals, pId])
            .then(appendTxnFormAndFinishBuild);
    }
    function appendTxnFormAndFinishBuild(form) {
        $('#'+level+'_row').append(form);
        _elems('toggleSubmitBttn', ['#sub2-submit'])
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
    submitForm('#sub2-form',  'sub2', 'taxon');
}
function ifEmptyNameField() {
    return !$('#DisplayName_row input').val();
}
function ifSpeciesErr(level) {
    return level === 'Species' && !hasCorrectBinomialNomenclature();

    function hasCorrectBinomialNomenclature() {
        const species = $('#DisplayName_row input')[0].value;
        const genus = _cmbx('getSelTxt', ['#Genus-sel']);                     //console.log('Genus = %s, Species = %s', genus, species);
        const speciesParts = species.split(' ');
        return genus === speciesParts[0];
    }
}
function fieldErr(level, tag) {
    _val('reportFormFieldErr', [level, tag, 'sub2'])
}
/** ********************** EDIT FORM **************************************** */
/**
 * Returns the elements of the edit-taxon form.
 * <div>Parent Taxon: [Level][Display-name]</> <bttnInput>"Edit Parent"</>
 * <select>[Taxon-level]</>    <input type="text">[Taxon Display-name]</>
 *     <button>Update Taxon</> <button>Cancel</>
 */
export function getTaxonEditFields(id) {
    const taxa = _state('getEntityRcrds', ['taxon']);
    const group = taxa[id].group;
    const role = group.displayName === 'Bat' ? 'Subject' : 'Object';
    return _state('initGroupState', [role, group.id, group])
        .then(groupState => {
            setScopeTaxonMemory(taxa, groupState);
            return buildTaxonEditFields(taxa[id]);
        });
}
function setScopeTaxonMemory(taxaRcrds, groupState) {
    groupData = groupState;
    groupData.rcrds = taxaRcrds;
}
/** ======================== FIELDS ========================================= */
function buildTaxonEditFields(taxon) {
    const txnElems = getEditTaxonFields(taxon);
    const prntElems = getPrntTaxonElems(taxon);
    return prntElems.concat(txnElems);
}
/** ----------------- NAME FIELD AND LEVEL COMBOBOX ------------------------- */
function getEditTaxonFields(taxon) {                                            //console.log("getEditTaxonFields for [%s]", taxon.displayName);
    const input = buildNameInput(taxon.name);
    const lvlSel = buildLvlSel(taxon);
    return [ buildTaxonEditFormRow('Taxon', [lvlSel, input], 'top')];
}
/** ----------- NAME INPUT --------------- */
function buildNameInput(name) {
    const attr = { id: 'txn-name', type: 'text', value: name };
    return _u('buildElem', ['input', attr]);
}
/** ------- LEVEL COMBOBOX --------------- */
function buildLvlSel(taxon) {
    const opts = getTaxonLvlOpts();
    const sel = _u('buildSelectElem', [opts, { id: 'txn-lvl' }]);
    $(sel).data({ 'txn': taxon.id, 'lvl': getLvlVal(taxon.level.displayName) });
    return sel;
}
function getLvlVal(lvl) {
    return groupData.lvls[lvl].ord;
}
/** Returns an array of options for the levels in the taxon's group. */
function getTaxonLvlOpts() {
    return groupData.groupRanks.reverse().map(lvl => {
        return { value: groupData.lvls[lvl].ord, text: lvl };
    });
}
/** ----------------- PARENT TAXON ELEMS ------------------------------------ */
/**
 * <div>Taxon Parent: [parent name]</> <button>Change Parent</>
 * Button calls @showParentTaxonSelectForm.
 */
function getPrntTaxonElems(taxon) {                                             //console.log("getPrntTaxonElems for %O", taxon);
    const prnt = groupData.rcrds[taxon.parent];
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
    $(div).data('txn', prnt.id).data('lvl', getLvlVal(prnt.level.displayName));
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
 * <select>[Group Levels]</> <select>[Taxa at selected level]</>
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
    const prnt = groupData.rcrds[prntId];
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
        const groupSelRow = getGroupLvlRow(prnt, rows);
        return [groupSelRow, rows].filter(r=>r);
    }
}
/** ------- REALM DISPLAY NAME ------ */
function getGroupLvlRow(taxon, rows) {
    const subGroup = Object.keys(groupData.subGroup);
    if (subGroup.length > 1) { return; }
    $(rows)[0].removeChild($(rows)[0].childNodes[0]); //removes Group row
    return buildTaxonParentRow(subGroup[0]);
}
function buildTaxonParentRow(displayName) {
    const groupLvl = displayName.split(' ')[0];
    const lbl = _u('buildElem', ['label', { text: groupLvl }]);
    const groupParent = buildGroupNameSpan(displayName.split(' ')[1]);
    return buildTaxonEditFormRow(groupLvl, [lbl, groupParent], 'sub');
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
        'Class': { change: onParentLevelSelection, add: initCreateForm.bind(null, 'class') },
        'Family': { change: onParentLevelSelection, add: initCreateForm.bind(null, 'family') },
        'Genus': { change: onParentLevelSelection, add: initCreateForm.bind(null, 'genus') },
        'Order': { change: onParentLevelSelection, add: initCreateForm.bind(null, 'order') },
        'Group': { change: onParentLevelSelection },
        'Species': { change: onParentLevelSelection, add: initCreateForm.bind(null, 'species') },
    }
}
function onParentLevelSelection(val) {
    _form('onLevelSelection', [val, this.$input[0]]);
}
export function selectParentTaxon(prntId) {                                     //console.log('selectParentTaxon. prntId [%s], taxa [%O]', prntId, groupData.rcrds);
    const prntTxn = groupData.rcrds[prntId];
    if (prntTxn.isRoot) { return; }
    const prntLvl = prntTxn.level.displayName;
    _cmbx('setSelVal', ['#'+prntLvl+'-sel', prntId]);
}
function finishParentSelectFormUi() {
    alignGroupLevelText();
    clearAndDisableTopFormParentFields();
    $('#Species_row').hide();
    updateSubmitBttns();
}
function alignGroupLevelText() {
    if ($('#Sub-Group_row').length) { return; }
    const groupLvl = Object.keys(groupData.subGroup)[0].split(' ')[0];
    $('#'+groupLvl+'_row .field-row')[0].className += ' group-row';
}
function clearAndDisableTopFormParentFields() {
    $('#txn-prnt span').text('');
    $('#chng-prnt').attr({'disabled': true}).css({'opacity': '.6'});
}
function updateSubmitBttns() {
    $('#sub-submit').attr('disabled', false).css('opacity', '1');
    $('#sub-submit').off('click').click(selectTaxonParent);
    $('#sub-cancel').off('click').click(cancelPrntEdit);
    _elems('toggleSubmitBttn', ['#top-submit', false]);
    $('#sub-submit')[0].value = 'Select Taxon';
}
function selectTaxonParent() {
    const prnt =  _form('getSelectedTaxon') || groupData.groupTaxon;             //console.log("selectTaxonParent called. prnt = %O", prnt);
    if (ifParentSelectErrs(getLvlVal(prnt.level.displayName))) { return; }
    exitPrntEdit(prnt);
}
function cancelPrntEdit() {                                                     //console.log("cancelPrntEdit called.");
    const prnt = groupData.rcrds[$('#txn-prnt').data('txn')];
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
    _elems('toggleSubmitBttn', ['#top-submit', true]);
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
    initTaxonEditLevelCombo();
    $('.all-fields-cntnr').hide();
}
function submitTaxonEdit() {
    const vals = {
        displayName: $('#Taxon_row > div.field-row.flex-row > input[type="text"]').val(),
        level:       $('#Taxon_row select').text(),
        parentTaxon: $('#txn-prnt').data('txn')
    };                                                                          //console.log("taxon vals = %O", vals);
    formatAndSubmitData('taxon', 'top', vals);
}
function initTaxonEditLevelCombo() {
    const options = { create: false, onChange: checkForTaxonLvlErrs, placeholder: null };
    $('#txn-lvl').selectize(options);
    _cmbx('setSelVal', ['#txn-lvl', $('#txn-lvl').data('lvl'), 'silent']);
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
    let high = groupData.lvls.Species.ord;
    groupData.rcrds[taxonId].children.forEach(checkChildLvl);
    return high;

    function checkChildLvl(id) {
        const child = groupData.rcrds[id]
        if (child.level.ord < high) { high = child.level.ord; }
    }
}
function clearPreviousErr(errTag, txnLvl) {
    if ($('.top-active-errs').length) {
        _val(errTag, [null, null, null, txnLvl]);
    }
}
function sendTxnErrRprt(errTag, field, fLvl) {
    _val('reportFormFieldErr', [field, errTag, fLvl]);
    _elems('toggleSubmitBttn', ['#top-submit', false]);
    return false;
}
function clearLvlErrs(elemId, fLvl) {                                           //console.log('clearLvlErrs.')
    if (!$('.top-active-errs').length) { return; }
    _val('clearErrElemAndEnableSubmit', [$(elemId)[0], fLvl]);
}
