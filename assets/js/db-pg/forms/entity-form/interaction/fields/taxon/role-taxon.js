/**
 * Selects and returns the [Subject|Object] role taxon in the interaction form.
 *
 * Export
 *     getSelectedTaxon
 *     onTaxonRoleSelection
 *     selectRoleTaxon
 *
 * TOC
 *     SELECT TAXON IN ROLE COMBOBOX
 *     GET TAXON SELECTED IN ROLE COMBOBOX
 */
import { _state, getSubFormLvl } from '../../../../forms-main.js';
import * as iForm from '../../int-form-main.js';
/* ------------------- SELECT TAXON IN ROLE COMBOBOX ------------------------ */
/**
 * When complete, the select form is removed and the most specific taxon is displayed
 * in the interaction-form <role> combobox.
 */
export function onTaxonRoleSelection(role, val) {                   /*perm-log*/console.log("       +--onTaxon[%s]Selection [%s] = ", role, val);
    if (val === "" || isNaN(parseInt(val))) { return; }
    $('#'+getSubFormLvl('sub')+'-form').remove();
    $('#sel-'+role).data('selTaxon', val);
    iForm.enableRoleTaxonFieldCombos();
    if (role === 'Object') { iForm.initTypeField(_state('getTaxonProp', ['groupName'])); }
    iForm.focusPinAndEnableSubmitIfFormValid(role);
}
/** Adds the selected taxon to the interaction-form's [role]-taxon combobox. */
export function selectRoleTaxon(e, groupTaxon) {
    const role = _state('getTaxonProp', ['groupName']) === 'Bat' ? 'Subject' : 'Object';
    const opt = getSelectedTaxonOption(groupTaxon);
    $('#sub-form').remove();
    if (!opt) { return; } //issue alerted to developer and editor
    _u('replaceSelOpts', [role, opt]);
    _u('setSelVal', [role, opt.value]);
}
/** Returns an option object for the most specific taxon selected. */
function getSelectedTaxonOption(groupTaxon) {
    const taxon = groupTaxon || getSelectedTaxon();                 /*dbug-log*///console.log("selected Taxon = %O", taxon);
    if (!taxon) { return; } //issue alerted to developer and editor
    return { value: taxon.id, text:taxon.displayName };
}
/* --------------- GET TAXON SELECTED IN ROLE COMBOBOX ---------------------- */
/** Finds the most specific rank with a selection and returns that taxon record. */
export function getSelectedTaxon(aboveRank) {
    const selElems = $('#sub-form .selectized').toArray();
    if (ifEditingTaxon()) { selElems.reverse(); } //Taxon parent edit form.
    const selected = selElems.find(isSelectedTaxon.bind(null, aboveRank));/*dbug-log*///console.log("getSelectedTaxon above [%s]. selElems = %O selected = %O", aboveRank, selElems, selected);
    return !selected ? false : _state('getRcrd', ['taxon', $(selected).val()]);

    function ifEditingTaxon() {
        const action = _state('getFormProp', ['top', 'action']);
        const entity = _state('getFormProp', ['top', 'entity']);
        return action == 'edit' && entity == 'taxon';
    }
}
/** Note: On combo reset, the most specific taxon above the resetRank is selected. */
function isSelectedTaxon(resetRank, elem) {
    if (!ifIsRankComboElem(elem)) { return false; }
    if (resetRank && isRankChildOfResetRank(resetRank, elem)) { return false; }
    return $(elem).val();
}
function isRankChildOfResetRank(resetRank, elem) {
    const allRanks = Object.keys(_state('getTaxonProp', ['ranks']));
    const rank = elem.id.split('sel-')[1];                          /*dbug-log*///console.log('is [%s] sub-rank to [%s]', rank, resetRank, allRanks.indexOf(rank) < allRanks.indexOf(resetRank));
    return allRanks.indexOf(rank) > allRanks.indexOf(resetRank);
}
function ifIsRankComboElem(elem) {
    return elem.id.includes('sel') && !elem.id.includes('Group');
 }