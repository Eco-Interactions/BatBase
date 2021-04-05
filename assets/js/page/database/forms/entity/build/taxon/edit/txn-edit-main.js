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
   const p = getEditFormParams(id);                                 /*dbug-log*/console.log('   --params[%O]', p);
    return _elems('initForm', [p])
        .then(status => finishFormInit(status, p));
}
/* -------------------------- PARAMS ---------------------------------------- */
function getEditFormParams(id) {                                    /*dbug-log*/console.log('--getEditFormParams id[%s]', id);
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
        Parent: { onChange: onParentChangeValidate },
    };
    _elems('initFormCombos', ['top', events]);
}
/* ---------------------------- SUBMIT -------------------------------------- */

function validateFormAndSubmit() {                                  /*dbug-log*/console.log('--validateFormAndSubmit');
    // if (!isTaxonEditFormValid(vals)) { return } //Alert shown
    // handleFormSubmit('top');
}
                                                            /*dbug-log*///console.log("taxon vals = %O", vals);


/* ------------------------- FINISH BUILD ----------------------------------- */
function finishFormInit(status, p) {/*dbug-log*/console.log('--finishFormInit p[%O]', p);
    if (!status) { return; } //Error handled elsewhere
    handleParentTaxonInit(p);
}


/** ======================= PARENT TAXON ==================================== */
function handleParentTaxonInit(p) {                                 /*dbug-log*/console.log('--handleParentTaxonInit p[%O]', p);
    const openParentSelectForm = loadParentTaonxSelectForm.bind(null, p);
    $(`#sel-Parent`)[0].selectize.on('focus', openParentSelectForm);
    $('#sel-Parent').data('selTaxon');
}
function loadParentTaonxSelectForm(p) {                             /*dbug-log*/console.log('--loadParentTaonxSelectForm p[%O]', p);
    // body...
}


/** ======================= DATA VALIDATION ================================== */
/** TODO: MERGE INTO STANDARD FORM VALIDATION */
function isTaxonEditFormValid(vals) {                               /*dbug-log*///console.log('isTaxonEditFormValid? %O', vals);
    const valIssues = {
        rankNotAvailableInNewGroup: rankIsNotAvailableInNewGroup(vals.rank)
    };
    for (let alertTag in valIssues) {
        if (valIssues[alertTag]) { return shwTxnValAlert(alertTag, 'Taxon', 'top'); }
    }
    return true;
}
/* -------------------------- RANK VALIDATION ------------------------------- */

function onParentChangeValidate(pId) {                              /*dbug-log*/console.log("--onParentChangeValidate pId[%s]", txnRank);
    // body...
}
function rankIsNotAvailableInNewGroup(txnRank) {                    /*dbug-log*///console.log('rankIsNotAvailableInNewGroup? [] %O', txnRank, _state('getTaxonProp', ['groupRanks']));
    return _state('getFieldState', ['top', 'Sub-Group', 'misc']).subRanks.indexOf(txnRank) === -1;
}


/* -------------------------- RANK VALIDATION ------------------------------- */
/* -------- RANK NOT AVAILABLE IN NEW GROUP ---------------- */
/**
 * Ensures that the new taxon-rank is higher than its children, and that a
 * species taxon being edited has a genus parent selected.
 */
function onRankChangeValidate(txnRank) {                            /*dbug-log*/console.log("--onRankChangeValidate txnRank[%s]", txnRank);
    // const pRank = $('#txn-prnt').data('rank');
    const valIssues = {
        // 'isGenusPrnt': isGenusPrnt(data),
        'needsHigherRank': rankIsLowerThanKidRanks(txnRank)
    };
    for (let alertTag in valIssues) {
        if (valIssues[alertTag]) { return shwTxnValAlert(alertTag, 'Taxon', 'top'); }
    }
    clearActiveAlert('clrNeedsHigherRank', txnRank);
}
/* ------------ MUST REMAIN GENUS ------------------------- */
/** Returns true if the taxon's original rank is Genus and it has children. */
// function isGenusPrnt(taxa) {
//     const orgTxnRank = $('#sel-Rank').data('rank');
//     const txnId = $('#sel-Rank').data('txn');
//     return orgTxnRank == 6 && getHighestChildRank(taxa, txnId) < 8;
// }
/* \-------- NEEDS HIGHER RANK -------------------- */
/**
 * Returns true if the passed rank is lower or equal to the highest rank of
 * the taxon-being-edited's children.
 */
function rankIsLowerThanKidRanks(txnRank) {
    const highRank = getHighestChildRank(_state('getFormState', ['top', 'editing']).core);
    return txnRank >= highRank;
}
function getHighestChildRank(taxonId) {
    const data = _state('getEntityRcrds', ['taxon', 'rankNames']);
    let high = data.rankNames.Species.ord;
    data.taxon[taxonId].children.forEach(checkChildRank);
    return high;

    function checkChildRank(id) {
        const child = data.taxon[id]
        if (child.rank.ord < high) { high = child.rank.ord; }
    }
}
/* ------------------------- ALERTS ----------------------------------------- */
function clearActiveAlert(alertTag, txnRank) {
    if ($('.top-active-alert').length) {
        _val(alertTag, [null, null, null, txnRank]);
    }
}
function shwTxnValAlert(alertTag, field, fLvl) {
    _val('showFormValAlert', [field, alertTag, fLvl]);
    _elems('toggleSubmitBttn', ['top', false]);
    return false;
}
function clearRankAlerts(elemId, fLvl) {
    if (!$('.top-active-alert').length) { return; }
    _val('clearAlert', [$(elemId)[0], fLvl]);
}
