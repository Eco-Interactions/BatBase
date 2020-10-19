/**
 * Manages the taxon fields in the interaction form, Subject and Object.
 *
 * Export
 *     getSelectedTaxon
 *     initObjectSelect
 *     initSubjectSelect
 *     onGroupSelection
 *     onRankSelection
 *     onRoleSelection
 *     onSubGroupSelection
 *
 * TOC
 */
import { _u } from '../../../../db-main.js';
import { _state, _elems, _cmbx, _val, getSubFormLvl } from '../../../forms-main.js';
import * as iForm from '../interaction-form-main.js';

/*--------------------- TAXON ROLES ------------------------------------------*/
/* ------------------------ INIT ---------------------- */
/**
 * Shows a sub-form to 'Select <Role>' of the interaction with a combobox for
 * each rank present in the group, (eg: Bat - Family, Genus, and Species), filled
 * with the taxa at that rank. When one is selected, the remaining boxes
 * are repopulated with related taxa and the 'select' button is enabled.
 */
export function initSubjectSelect() {                                                  console.log('       +--initSubjectSelect (selected ? [%s])', $('#Subject-sel').val());
    initTaxonSelectForm('Subject', 1);
}
/** Note: The selected group's rank combos are built @onGroupSelection. */
export function initObjectSelect() {                                                   console.log('       +--initObjectSelect (selected ? [%s])', $('#Object-sel').val());
    initTaxonSelectForm('Object', getObjectGroup())
    .then(ifNoSubGroupsRemoveCombo);
}
function getObjectGroup(prop = 'id') {
    const prevSelectedId = $('#Object-sel').data('selTaxon');
    if (!prevSelectedId) { return 2; } //default: Plants (2)
    return iForm.getRcrd('taxon', prevSelectedId).group[prop];
}
/* ------------- SELECT FORM --------------- */
function initTaxonSelectForm(role, groupId) {
    if (ifSubFormAlreadyInUse(role)) { return iForm.throwAndCatchSubFormErr(role, 'sub'); }
    $('#'+role+'-sel').data('loading', true);
    return buildTaxonSelectForm(role, groupId)
        .then(form => appendTxnFormAndInitCombos(role, form))
        .then(() => finishTaxonSelectBuild(role));
}
function ifSubFormAlreadyInUse(role) {
    return iForm.ifFormAlreadyOpenAtLevel('sub') || ifOppositeRoleFormLoading(role);
}
function ifOppositeRoleFormLoading(role) {
    const oppRole = role === 'Subject' ? 'Object' : 'Subject';
    return $('#'+oppRole+'-sel').data('loading');
}
function buildTaxonSelectForm(role, groupId) {                                  //console.log('-------------buildTaxonSelectForm. args = %O', arguments);
    addNewFormState(role);
    return _state('initTaxonState', [role, groupId])
        .then(data => _elems('initSubForm', ['sub', 'sml-sub-form',
            {Group: groupId, 'Sub-Group': data.groupTaxon.id}, '#'+role+'-sel']));
}
function addNewFormState(role) {
    const lcRole = _u('lcfirst', [role]);
    _state('addEntityFormState', [lcRole, 'sub', '#'+role+'-sel', 'create']);
}
/**
 * Customizes the taxon-select form ui. Either re-sets the existing taxon selection
 * or brings the first rank-combo into focus. Clears the [role]'s' combobox.
 */
function finishTaxonSelectBuild(role) {
    addSelectGroupBttn();
    customizeElemsForTaxonSelectForm(role);
    selectInitTaxonOrFocusFirstCombo(role);
    _u('replaceSelOpts', ['#'+role+'-sel', []]);
    $('#'+role+'-sel').data('loading', false);
}
/* --------- SELECT UNSPECIFIED BUTTON -------------- */
function addSelectGroupBttn() {
    const bttn = buildSelectUnspecifedBttn();
    $('#sub-form .bttn-cntnr').prepend(bttn);
}
function buildSelectUnspecifedBttn() {
    const attr = { id: 'select-group', class: 'ag-fresh', type: 'button', value: 'Select Unspecified' }
    const bttn = _u('buildElem', ['input', attr]);
    $(bttn).click(selectRoleTaxon.bind(null, null, getTaxonData('groupTaxon')));
    return bttn;
}
/* --------- SELECT PREVIOUS TAXON OR FOCUS COMBO -------------- */
/**
 * Restores a previously selected taxon on initial load, or when reseting the select
 * form. When the select form loads without a previous selection or when the group
 * is changed by the user, the first combobox of the group is brought into focus.
 */
function selectInitTaxonOrFocusFirstCombo(role) {
    const selId = getPrevSelId(role);
    if (selId) { resetPrevTaxonSelection(selId, role);
    } else { focusFirstRankCombobox(_u('lcfirst', [role])); }
}
function getPrevSelId(role) {
    return $('#'+role+'-sel').val() || $('#'+role+'-sel').data('reset') ?
        $('#'+role+'-sel').data('selTaxon') : null;
}
function focusFirstRankCombobox(lcRole) {
    _cmbx('focusFirstCombobox', ['#'+lcRole+'_Rows']);
}
function appendTxnFormAndInitCombos(role, form) {
    const lcRole = _u('lcfirst', [role]);
    $('#'+role+'_row').append(form);
    iForm.initFormCombos('taxon', 'sub');
}
/* --------- CUSTOMIZE ELEMS FOR TAXON SELECT FORM -------------- */
/** Adds a close button. Updates the Header and the submit/cancel buttons. */
function customizeElemsForTaxonSelectForm(role) {
    $('#sub-hdr')[0].innerHTML = "Select " + role + " Taxon";
    $('#sub-hdr').append(getTaxonExitButton(role));
    $('#sub-submit')[0].value = "Select Taxon";
    $('#sub-cancel')[0].value = "Reset";
    $('#sub-submit').unbind("click").click(selectRoleTaxon);
    $('#sub-cancel').unbind("click").click(resetTaxonSelectForm.bind(null, role));
}
function getTaxonExitButton(role) {
    const bttn = _elems('getExitButton');
    bttn.id = 'exit-sub-form';
    $(bttn).unbind('click').click(exitTaxonSelectForm.bind(null, role));
    return bttn;
}
/** Exits sub form and restores any previous taxon selection. */
function exitTaxonSelectForm(role) {
    _elems('exitSubForm', ['sub', false, enableTaxonCombos]);
    const prevTaxonId = $('#'+role+'-sel').data('selTaxon');
    if (!prevTaxonId) { return; }
    resetTaxonCombobox(role, prevTaxonId);
}
function resetTaxonCombobox(role, prevTaxonId) {
    const opt = { value: prevTaxonId, text: getTaxonym(prevTaxonId) };
    _cmbx('updateComboboxOptions', ['#'+role+'-sel', opt]);
    _cmbx('setSelVal', ['#'+role+'-sel', prevTaxonId]);
}
function getTaxonym(id) {
    return iForm.getRcrd('taxon', id).displayName;
}
function enableTaxonRanks(enable = true) {
    $.each($('#sub-form select'), (i, sel) => {
        _cmbx('enableCombobox', ['#'+sel.id, enable])
    });
}
/* ------- resetTaxonSelectForm --------- */
/** Removes and replaces the taxon form. */
function resetTaxonSelectForm(role) {
    const group = getTaxonData('groupName');
    const reset =  group == 'Bat' ? initSubjectSelect : initObjectSelect;
    $('#'+role+'-sel').data('reset', true);
    $('#sub-form').remove();
    reset();
}
/** Resets the taxon to the one previously selected in the interaction form.  */
function resetPrevTaxonSelection(id, role) {
    const taxon = iForm.getRcrd('taxon', id);
    if (taxon.isRoot) { return; }                                               console.log('           --resetPrevTaxonSelection [%s] [%s] = %O', role, id, taxon);
    selectPrevTaxon(taxon, role);
}
function selectPrevTaxon(taxon, role) {
    addTaxonOptToTaxonMemory(taxon);
    if (ifTaxonInDifferentGroup(taxon.group)) { return selectTaxonGroup(taxon); }
    _cmbx('setSelVal', ['#'+taxon.rank.displayName+'-sel', taxon.id]);
    window.setTimeout(() => { deleteResetFlag(role); }, 1000);
}
function addTaxonOptToTaxonMemory(taxon) {
    _state('setTaxonProp', ['prevSel', {val: taxon.id, text: taxon.displayName }]);
}
function ifTaxonInDifferentGroup(group) {
    return group.displayName !== 'Bat' && $('#Group-sel').val() != group.id;
}
function selectTaxonGroup(taxon) {
    _cmbx('setSelVal', ['#Group-sel', taxon.group.id]);
}
function deleteResetFlag(role) {
    $('#'+role+'-sel').removeData('reset');
}
/* ------------------ onGroupSelect ------------- */
/**
 * Removes any previous group comboboxes. Shows a combobox for each rank present
 * in the selected Taxon group filled with the taxa at that rank.
 */
export function onGroupSelection(val) {                                                //console.log("               --onGroupSelection. val = ", val)
    if (val === '' || isNaN(parseInt(val))) { return; }
    clearPreviousGroupRankCombos();
    _state('initTaxonState', ['Object', val])
    .then(taxonData => buildAndAppendGroupRows(taxonData.groupTaxon.id));
}
/** A row for each rank present in the group filled with the taxa at that rank.  */
function buildAndAppendGroupRows(rootId) {
    return _elems('getFormFieldRows', ['object', {'Sub-Group': rootId}, 'sub'])
    .then(appendGroupRowsAndFinishBuild);
}
function appendGroupRowsAndFinishBuild(rows) {
    ifNoSubGroupsRemoveCombo(rows);
    $('#object_Rows').append(rows);
    _state('setFormFieldData', ['sub', 'Group', null, 'select']);
    iForm.initFormCombos('taxon', 'sub');
    _elems('toggleSubmitBttn', ['#sub-submit', false]);
    /* Binds the current group to the 'Select Unspecified' button */
    $('#select-group').off('click');
    $('#select-group').click(selectRoleTaxon.bind(null, null, getTaxonData('groupTaxon')));
}
function ifNoSubGroupsRemoveCombo(rows = false) {
    const subGroups = Object.keys(getTaxonData('subGroups'));                   //console.log('ifNoSubGroupsRemoveCombo. subGroups = %O, rows = %O', subGroups, rows)
    if (subGroups.length > 1) { return; }
    if (!rows) {
        $('#Sub-Group_row').remove();
    } else {
        $(rows)[0].removeChild($(rows)[0].childNodes[0]); //removes Sub-Group row
    }
}
function clearPreviousGroupRankCombos() {
    $('#object_Rows>div').each(ifRankComboRemoveCombo);
}
function ifRankComboRemoveCombo(i, elem) {
    if (i !== 0) { elem.remove(); }
}
/* ------------ onSubGroupSelection ---------- */
export function onSubGroupSelection(val) {
    updateSubGroupState();
    clearPreviousSubGroupCombos();
    return buildAndAppendGroupRows(val);
}
function updateSubGroupState() {
    const subGroup = $('#Sub-Group-sel')[0].innerText.split(' ')[1];            //console.log('onSubGroupSelection [%s]', subGroup);
    const subGroupTaxon = iForm.getRcrd('taxon', getTaxonData('subGroups')[subGroup].id);
    _state('setTaxonProp', ['subGroup', subGroup]);
    _state('setTaxonProp', ['groupTaxon', subGroupTaxon]);
}
function clearPreviousSubGroupCombos() {
    const groupRows = $('#Group_row, #Sub-Group_row').detach();
    $('#object_Rows').empty();
    $('#object_Rows').append(groupRows);
}
 /* --------------------------- OnRankSelection ------------------------ */
/**
 * When a taxon at a rank is selected, all child rank comboboxes are
 * repopulated with related taxa and the 'select' button is enabled. If the
 * combo was cleared, ensure the remaining dropdowns are in sync or, if they
 * are all empty, disable the 'select' button.
 */
export function onRankSelection(val, input) {                                   console.log("           --onRankSelection. val = [%s] isNaN? [%s]", val, isNaN(parseInt(val)));
    const fLvl = getSubFormLvl('sub');
    const elem = input || this.$input[0];
    if (val === 'create') { return openTaxonCreateForm(elem, fLvl); }
    if (val === '' || isNaN(parseInt(val))) { return syncTaxonCombos(elem); }
    repopulateCombosWithRelatedTaxa(val);
    _elems('toggleSubmitBttn', ['#'+fLvl+'-submit', true]);
}
function openTaxonCreateForm(selElem, fLvl) {
    const rank = selElem.id.split('-sel')[0];
    if (rank === 'Species' && !$('#Genus-sel').val()) {
        return _val('formInitErr', [rank, 'noGenus', fLvl]);
    } else if (rank === 'Genus' && !$('#Family-sel').val()) {
        return _val('formInitErr', [rank, 'noFamily', fLvl]);
    }
    selElem.selectize.createItem('create');
}
function syncTaxonCombos(elem) {
    resetChildRankCombos(getSelectedTaxon(elem.id.split('-sel')[0]));
}
function resetChildRankCombos(selTxn) {
    const rankName = selTxn ? selTxn.rank.displayName : getGroupTopSubRank();
    if (rankName == 'Species') { return; }
    getChildRankOpts(rankName, selTxn.group.subGroup.name)
    .then(opts => repopulateRankCombos(opts, {}));
}
function getGroupTopSubRank() {
    return getTaxonData('groupRanks').map(l => l).pop();
}
function getChildRankOpts(rankName, subGroup) {
    const opts = {};
    return buildChildRankOpts().then(() => opts);

    function buildChildRankOpts() {
        const ranks = getChildRanks();
        const optProms = ranks.map(rank => getTaxonOpts(rank))
        return Promise.all(optProms);
    }
    function getChildRanks() {
        const ranks = getTaxonData('groupRanks');
        return ranks.slice(0, ranks.indexOf(rankName));
    }
    function getTaxonOpts(rank) {
        return _cmbx('getTaxonOpts', [rank, null, getTaxonData('groupName'), subGroup])
            .then(rankOpts => opts[rank] = rankOpts);
    }
}
/**
 * Repopulates the comboboxes of child ranks when a taxon is selected. Selected
 * and ancestor ranks are populated with all taxa at the rank and the direct
 * ancestors selected. Child ranks populate with only decendant taxa and
 * have no initial selection.
 * TODO: Fix bug with child taxa opt refill sometimes filling with all taxa.
 */
function repopulateCombosWithRelatedTaxa(selId) {
    const opts = {}, selected = {};
    const taxon = iForm.getRcrd('taxon', selId);                                      //console.log("repopulateCombosWithRelatedTaxa. taxon = %O, opts = %O, selected = %O", taxon, opts, selected);
    const group = getTaxonData('groupName');
    const subGroup = taxon.group.subGroup.name;
    if (!taxon) { return; } //issue alerted to developer and editor
    taxon.children.forEach(addRelatedChild);
    return buildUpdatedTaxonOpts()
        .then(repopulateRankCombos.bind(null, opts, selected));

    function addRelatedChild(id) {                                              //console.log('addRelatedChild. id = ', id);
        const childTxn = iForm.getRcrd('taxon', id);
        if (!childTxn) { return; } //issue alerted to developer and editor
        const rank = childTxn.rank.displayName;
        addOptToRankAry(childTxn, rank);
        childTxn.children.forEach(addRelatedChild);
    }
    function addOptToRankAry(childTxn, rank) {
        if (!opts[rank]) { opts[rank] = []; }                                 //console.log("setting rank = ", taxon.rank)
        opts[rank].push({ value: childTxn.id, text: childTxn.name });
    }
    function buildUpdatedTaxonOpts() {
        return Promise.all([getSiblingOpts(taxon), getAncestorOpts(taxon.parent)])
        .then(buildOptsForEmptyRanks)
        .then(addCreateOpts);
    }
    function getSiblingOpts(taxon) {
        const rank = taxon.rank.displayName;
        return _cmbx('getTaxonOpts', [rank, null, group, subGroup])
            .then(o => {                                                        //console.log('getSiblingOpts. taxon = %O', taxon);
                opts[taxon.rank.displayName] = o;
                selected[taxon.rank.displayName] = taxon.id;
            });
    }
    function getAncestorOpts(prntId) {                                          //console.log('getAncestorOpts. prntId = [%s]', prntId);
        const prntTaxon = iForm.getRcrd('taxon', prntId);
        if (prntTaxon.isRoot) { return Promise.resolve();}
        selected[prntTaxon.rank.displayName] = prntTaxon.id;
        return buildAncestorOpts(prntTaxon);
    }
    function buildAncestorOpts(prntTaxon) {
        const rank = prntTaxon.rank.displayName;
        return _cmbx('getTaxonOpts', [rank, null, group, subGroup])
            .then(o => {                                                        //console.log("--getAncestorOpts - setting rank = ", prntTaxon.rank)
                opts[prntTaxon.rank.displayName] = o;
                return getAncestorOpts(prntTaxon.parent);
            });
    }
    /**
     * Builds the opts for each rank without taxa related to the selected taxon.
     * Ancestor ranks are populated with all taxa at the rank and will have
     * the 'none' value selected.
     */
    function buildOptsForEmptyRanks() {
        const ranks = getTaxonData('groupRanks');
        const proms = [];
        fillOptsForEmptyRanks();
        return Promise.all(proms);

        function fillOptsForEmptyRanks() {
            ranks.forEach(rank => {
                if (opts[rank] || rank == taxon.rank.displayName) { return; }
                buildAncestorOpts(rank);
            });
        }
        function buildAncestorOpts(rank) {
            selected[rank] = 'none';
            proms.push(_cmbx('getTaxonOpts', [rank, null, group, subGroup])
                .then(o => opts[rank] = o ));
        }
    }
    function addCreateOpts() {
        for (let rank in opts) {                                                 //console.log("rank = %s, name = ", rank, ranks[rank-1]);
            opts[rank].unshift({ value: 'create', text: 'Add a new '+rank+'...'});
        }
        return Promise.resolve();
    }
} /* End fillAncestorTaxa */
function repopulateRankCombos(optsObj, selected) {                              //console.log('repopulateRankCombos. optsObj = %O, selected = %O', optsObj, selected); //console.trace();
    Object.keys(optsObj).forEach(rank => {                                      //console.log("rank = %s, name = ", rank, optsObj[rank]);
        repopulateRankCombo(optsObj[rank], rank, selected)
    });
}
/**
 * Replaces the options for the rank combo. Selects the selected taxon and
 * its direct ancestors.
 */
function repopulateRankCombo(opts, rank, selected) {                            //console.log("repopulateRankCombo for rank = %s (%s)", rank, rankName);
    updateComboOpts(rank, opts);
    if (!rank in selected) { return; }
    if (selected[rank] == 'none') { return resetPlaceholer(rank); }
    _cmbx('setSelVal', ['#'+rank+'-sel', selected[rank], 'silent']);
}
/**
 * Change event is fired when options are replaced, so the event is removed and
 * restored after the options are updated.
 */
function updateComboOpts(rank, opts) {
    _u('replaceSelOpts', ['#'+rank+'-sel', opts, () => {}]);
    $('#'+rank+'-sel')[0].selectize.on('change', onRankSelection);
}
function resetPlaceholer(rank) {
    _u('updatePlaceholderText', ['#'+rank+'-sel', null, 0]);
}
/* ------- selectRoleTaxon --------- */
/** Adds the selected taxon to the interaction-form's [role]-taxon combobox. */
function selectRoleTaxon(e, groupTaxon) {
    const role = getTaxonData('groupName') === 'Bat' ? 'Subject' : 'Object';
    const opt = getSelectedTaxonOption(groupTaxon);
    $('#sub-form').remove();
    if (!opt) { return; } //issue alerted to developer and editor
    _cmbx('updateComboboxOptions', ['#'+role+'-sel', opt]);
    _cmbx('setSelVal', ['#'+role+'-sel', opt.value]);
}
/** Returns an option object for the most specific taxon selected. */
function getSelectedTaxonOption(groupTaxon) {
    const taxon = groupTaxon || getSelectedTaxon();                             //console.log("selected Taxon = %O", taxon);
    if (!taxon) { return; } //issue alerted to developer and editor
    return { value: taxon.id, text:taxon.displayName };
}
/** Finds the most specific rank with a selection and returns that taxon record. */
export function getSelectedTaxon(aboveRank) {
    const selElems = $('#sub-form .selectized').toArray();
    if (ifEditingTaxon()) { selElems.reverse(); } //Taxon parent edit form.
    const selected = selElems.find(isSelectedTaxon.bind(null, aboveRank));                              //console.log("getSelectedTaxon. selElems = %O selected = %O", selElems, selected);
    return !selected ? false : iForm.getRcrd('taxon', $(selected).val());

    function ifEditingTaxon() {
        const action = _state('getFormProp', ['top', 'action']);
        const entity = _state('getFormProp', ['top', 'entity']);
        return action == 'edit' && entity == 'taxon';
    }
}
/**
 * Note: On rank combo reset, the most specific taxon above the resetRank is selected.
 */
function isSelectedTaxon(resetRank, elem) {
    if (!ifIsRankComboElem(elem)) { return false; }
    if (resetRank && isRankChildOfResetRank(resetRank, elem)) { return false; }
    return $(elem).val();
}
function isRankChildOfResetRank(resetRank, elem) {
    const allRanks = getTaxonData('groupRanks');
    const rank = elem.id.split('-sel')[0];
    return allRanks.indexOf(rank) < allRanks.indexOf(resetRank);
}
function ifIsRankComboElem(elem) {
    return elem.id.includes('-sel') && !elem.id.includes('Group');
 }
/**
 * When complete, the select form is removed and the most specific taxon is displayed
 * in the interaction-form <role> combobox.
 */
export function onTaxonRoleSelection(role, val) {                                      console.log("       +--onTaxonRoleSelection [%s] = ", role, val);
    if (val === "" || isNaN(parseInt(val))) { return; }
    $('#'+getSubFormLvl('sub')+'-form').remove();
    $('#'+role+'-sel').data('selTaxon', val);
    enableTaxonCombos();
    if (role === 'Object') { iForm.initTypeField(getObjectGroup('displayName')); }
    iForm.focusPinAndEnableSubmitIfFormValid(role);
}
function enableTaxonCombos() {
    _cmbx('enableCombobox', ['#Subject-sel']);
    _cmbx('enableCombobox', ['#Object-sel']);
}
function getTaxonData(prop) {
    return prop ? _state('getTaxonProp', [prop]) : _state('getGroupState');
}