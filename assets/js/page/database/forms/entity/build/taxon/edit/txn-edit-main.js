/**
 * Taxon edit-form.
 *
 * TOC
 *     CORE FIELDS
 *         NAME FIELD AND RANK COMBOBOX
 *         PARENT TAXON NAME AND CHANGE BUTTON
 *     TAXON PARENT SELECT FORM
 *         RANK COMBO ELEMS
 *         FINISH SELECT FORM BUILD
 *         DATA VALIDATION
 *     ROW BUILDERS
 *     FINISH EDIT FORM BUILD
 *     DATA VALIDATION
 *         RANK VALIDATION
 *             RANK NOT AVAILABLE IN NEW GROUP
 *             MUST REMAIN GENUS
 *             NEEDS HIGHER RANK
 *         ALERTS
 */
import { _cmbx, _el, _u } from '~util';
import { _state, _elems, _form, _val, handleFormSubmit } from '~form';
import * as tForm from '../txn-form-main.js';

/* ========================= INIT FORM ====================================== */
export function initEditForm(entity, id) {                          /*perm-log*/console.log('           >--EDIT [%s][%s]', entity, id);
   const p = getEditFormParams(id);                                 /*dbug-log*///console.log('   --params[%O]', p);
    return _elems('initForm', [p])
        .then(finishFormInit);
}
/* -------------------------- PARAMS ---------------------------------------- */
function getEditFormParams(id) {                                    /*dbug-log*///console.log('--getEditFormParams id[%s]', id);
    return {
        action: 'edit',
        group: 'top',
        id: id,
        initCombos: initCombos,
        name: 'Taxon',
        style: 'sml-form',
        submit: validateFormAndSubmit,
        type: 'edit'
    };
}
function initCombos() {
    const events = {
        Rank: { onChange: onRankChangeValidate },
        Parent: { onChange: onParentChange },
    };
    _elems('initFormCombos', ['top', events]);
}
/* ------------------------- FINISH BUILD ----------------------------------- */
function finishFormInit(status) {                                   /*dbug-log*///console.log('--finishFormInit');
    if (!status) { return; } //Error handled elsewhere
    const fields = _state('getFormState', ['top', 'fields']);
    handleParentTaxonInit(fields.Parent.value);
}
/** ======================= RANK ============================================ */
/**
 * Ensures that the new taxon-rank is higher than its children, and that a
 * species taxon being edited has a genus parent selected.
 */
function onRankChangeValidate(rId) {                                /*dbug-log*///console.log("--onRankChangeValidate rId[%s]", rId);
    const valData = buildRankValData();
    validateRank(valData);
}
/* ---------------- BUILD RANK VALIDATION DATA ------------------------------ */
function buildRankValData() {
    const data = _state('getEntityRcrds', [['taxon', 'orderedRanks']]);/*dbug-log*///console.log('    --buildRankValData data[%O]', data);
    data.entity = _state('getFormState', ['top', 'entity']);
    data.newRank = _cmbx('getSelTxt', ['Rank']);
    data.childRank = getHighestChildRank(data.entity, data.taxon, data.orderedRanks);
    data.parentRank = getParentRank(data.entity);
    return data;

    function getParentRank(rcrd) {
        const newRank = _state('getFieldState', ['top', 'Parent', 'misc']);
        return newRank ? newRank : data.taxon[rcrd.parent].rank.displayName;
    }
}
function getHighestChildRank(taxon, taxa, ranks) {
    let high = ranks.indexOf('Species');
    taxon.children.forEach(checkChildRank);
    return ranks[high];

    function checkChildRank(id) {
        const childIdx = ranks.indexOf(taxa[id].rank.displayName);
        if (childIdx <= high) { return; }
        high = childIdx;
    }
}
/* -------------------------- RANK VALIDATION ------------------------------- */
function validateRank(data) {                                       /*dbug-log*///console.log("--validateRank data[%O]", data);
    const issues = {
        isGenusPrnt: data.childRank === 'Species',
        needsHigherRank: ifRankTooLow(data.newRank, data.childRank, data.orderedRanks),
        needsLowerRank: ifRankTooLow(data.parentRank, data.newRank, data.orderedRanks)
    };                                                              /*dbug-log*///console.log('   --issues[%O]', issues);
    for (let tag in issues) {
        if (issues[tag]) { return shwTxnValAlert(tag, 'Rank', 'top'); }
    }
    clearActiveAlert('clrTaxonRankAlert');
}
/* -------- NEEDS HIGHER RANK -------------------- */
function ifRankTooLow(highRank, lowRank, ranks) {                    /*dbug-log*///console.log('  --ifRankTooLow? high[%s] <= low[%s]', highRank, lowRank);
    return ranks.indexOf(highRank) <= ranks.indexOf(lowRank);
}
/** ======================= PARENT TAXON ==================================== */
/* -------------------------- INIT ------------------------------------------ */
function handleParentTaxonInit(pId) {                               /*dbug-log*///console.log('--handleParentTaxonInit');
    $(`#sel-Parent`)[0].selectize.on('focus', loadParentSelectForm);
    $('#sel-Parent').data('selTaxon', pId);
    _form('buildOptAndUpdateCombo', ['Parent', pId, 'silent']);
}
function loadParentSelectForm() {
    const gId = _state('getFieldState', ['top', 'Group']);
    const sgId = _state('getFieldState', ['top', 'Sub-Group']);     /*dbug-log*///console.log('--loadParentTaonxSelectForm g[%s] sg[%s]', gId, sgId);
    _form('initFieldTaxonSelect', ['Parent', gId, sgId, onParentChange]);
}
/* -------------------------- ON CHANGE ------------------------------------- */
// Check for group changes
function onParentChange(e) {
    const pTxn = _form('getSelectedTaxon');                         /*dbug-log*///console.log("--onParentChange pTxn[%O]", pTxn);
    const valData = buildParentValData(pTxn);
    if (!validateParent(valData)) { return; } //Issue alert shown
    _form('buildOptAndUpdateCombo', ['Parent', pTxn.id, 'silent']);
    _form('onTaxonFieldSelection', ['Parent', pTxn.id]);
    updateGroupState(pTxn);
    _elems('checkReqFieldsAndToggleSubmitBttn', ['top']);
}
function updateGroupState(pTxn) {
    _state('setFieldState', ['top', 'Parent', pTxn.id ]);
    _state('setFieldState', ['top', 'Parent', pTxn.rank.displayName, 'misc' ]);
    _state('setFieldState', ['top', 'Group', pTxn.group.id ]);
    _state('setFieldState', ['top', 'Sub-Group', pTxn.group.subGroup.id ]);
}
/* ------------------------ PARENT VALIDATION ------------------------------- */
function buildParentValData(pTxn) {
    const data = _state('getEntityRcrds', [['orderedRanks']]);      /*dbug-log*///console.log('    --buildParentValData data[%O]', data);
    data.entity = pTxn;
    data.newRank = pTxn.rank.displayName;
    data.childRank = _cmbx('getSelTxt', ['Rank']);
    data.parent
    return data;
}
function validateParent(data) {                                     /*dbug-log*///console.log("--validateParent data[%O]", data);
    const issues = {
        rankNotAvailableInNewGroup: ifInvalidGroupRank(data.childRank),
        needsHigherRank: ifRankTooLow(data.newRank, data.childRank, data.orderedRanks)
    };                                                              /*dbug-log*///console.log('   --issues[%O]', issues);
    for (let tag in issues) {
        if (issues[tag]) { return shwTxnValAlert(tag, 'Parent', 'top'); }
    }
    clearActiveAlert('clrTaxonParentAlert');
    return true;
}
/* -------- RANK NOT AVAILABLE IN NEW GROUP ---------------- */
function ifInvalidGroupRank(txnRank) {
    const sgField = _state('getFieldState', ['sub', 'Sub-Group', 'misc']);/*dbug-log*///console.log('--ifInvalidGroupRank? sgField[%O]', sgField);
    return sgField.subRanks.indexOf(txnRank) === -1;
}
/* ------------------------- ALERTS ----------------------------------------- */
function clearActiveAlert(clearAlertTag) {
    if (!$('.top-active-alert').length) { return; }
    _val(clearAlertTag);
}
function shwTxnValAlert(tag, field) {
    _val('showFormValAlert', [field, tag, 'top']);
    _elems('toggleSubmitBttn', ['top', false]);
    return false;
}
/* ============================ SUBMIT ====================================== */
function validateFormAndSubmit() {                                  /*dbug-log*///console.log('--validateFormAndSubmit');
    // if (!isTaxonEditFormValid(vals)) { return; } //Alert shown
    handleFormSubmit('top');
}
//TODO
function isTaxonEditFormValid(vals) {                               /*dbug-log*///console.log('isTaxonEditFormValid? %O', vals);
    const issues = {
        // needsGenusName: tForm.ifSpeciesValIssue(vals.rank)
    };
    for (let tag in issues) {
        if (issues[tag]) { return shwTxnValAlert(tag, 'Taxon', 'top'); }
    }
    return true;
}