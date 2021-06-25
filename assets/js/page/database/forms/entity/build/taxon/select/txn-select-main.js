/**
 * Builds a form to select a taxon with a combobox for the Group and Sub-group,
 * when selecting the taxon group and/or sub-group is available, and one for each
 * rank present in the taxon group, (eg: Bat - Family, Genus, and Species), filled
 * with the taxa at that rank in the group. When one is selected, the remaining
 * boxes are repopulated with related taxa and the 'select' button is enabled.
 * A 'Select Unspecified' button allows selection of a (sub)group's root taxon.
 * @since Refactored 11/2020
 *
 * TOC
 *     INIT
 *     GROUPS
 *     RANKS
 *     SELECTED
 */
import { _elems, _form, _state, _val } from '~form';
import * as build from './build-taxon-select.js';
import * as rank from './rank/txn-rank-main.js';
import * as group from './group-fields.js';

export function initSelectFormCombos(fLvl = 'sub') {
    const events = getSelectComboEvents();
    _elems('initFormCombos', [fLvl, events]);
}
function getSelectComboEvents() {
    return {
        Class: { onChange: onRankChange('Class'), create: create.bind(null, 'Class') },
        Family: { onChange: onRankChange('Family'), create: create.bind(null, 'Family') },
        Genus: { onChange: onRankChange('Genus'), create: create.bind(null, 'Genus') },
        Order: { onChange: onRankChange('Order'), create: create.bind(null, 'Order') },
        Group: { onChange: group.onGroupSelection },
        'Sub-Group': { onChange: group.onSubGroupSelection },
        Species: { onChange: onRankChange('Species'), create: create.bind(null, 'Species') },
    };
}
function onRankChange(rank) {
    return onRankSelection.bind(null, rank);
}
function replaceEditEvents(events, newEvents) {
    Object.keys(newEvents).forEach(updateEvents);

    function updateEvents(field) {
        Object.keys(newEvents[field]).forEach(updateConfgProp);

        function updateConfgProp(prop) {
            events[field][prop] = newEvents[field][prop];
        }
    }
}
function create(rank, val) {
    return _form('createEntity', [rank, val]);
}
/* ======================= INIT =========================================== */
export function initFieldTaxonSelect(field, gId, sgId, onSubmit, fLvl = 'sub') {/*dbug-log*///console.log('--initFieldTaxonSelect field[%s] gId?[%s sId?[%s] onSubmit?[%O]', field, gId, sgId, onSubmit);
    const groupId = gId ? gId : getGroupId(field);
    build.initTaxonSelectForm(field, groupId, sgId, onSubmit, fLvl)
    .then(() => group.ifParentSelectRemoveSpecies(field));
}
function getGroupId(field) {
    const prevSelectedId = $('#sel-'+field).data('selTaxon');
    if (!prevSelectedId) { return field === 'Subject' ? 1 : 2; } //defaults: Bats (1), Plants (2)
    return _state('getRcrd', ['taxon', prevSelectedId]).group.id;
}
/* ======================== RANKS =========================================== */
export function onRankSelection(rankName, val) {                    /*dbug-log*///console.log('--onRankSelection rank[%s] val[%s]', rankName, val);
    if (val === 'new') { return; } // New taxon being created.
    rank.onRankSelection(rankName, val);
}
/* ======================== SELECTED ======================================== */
/** Finds the most specific rank with a selection and returns that taxon record. */
export function getSelectedTaxon(aboveRank) {
    const selElems = $('#sub-form .selectized').toArray().reverse();/*dbug-log*///console.log("--getSelectedTaxon above [%s]. selElems[%O]", aboveRank, selElems);
    // if (ifEditingTaxon()) { selElems.reverse(); } /*edit-form*/
    const selected = selElems.find(el => isSelectedTaxon(aboveRank, el));/*dbug-log*///console.log("     --selected[%s][%O]", selected, _state('getRcrd', ['taxon', $(selected).val()]));
    const id = !selected ? getRoot() : $(selected).val();
    return _state('getRcrd', ['taxon', id]);
}
function ifEditingTaxon() {
    const action = _state('getFormState', ['top', 'action']);
    const entity = _state('getFormState', ['top', 'name']);
    return action === 'edit' && entity === 'Taxon';
}
/** Note: On combo reset, the most specific taxon above the resetRank is selected. */
function isSelectedTaxon(resetRank, elem) {                         /*dbug-log*///console.log('--isSelectedTaxon above?[%s] [%s][%s]', resetRank, $(elem)[0].id, $(elem).val())
    if (!ifIsRankComboElem(elem)) { return false; }
    if (resetRank && isRankChildOfResetRank(resetRank, elem)) { return false; }
    return $(elem).val();
}
function isRankChildOfResetRank(resetRank, elem) {
    const fLvl = _state('getSubFormLvl', ['sub']);
    const allRanks = _state('getFieldState', [fLvl, 'Sub-Group', 'misc']).subRanks;
    const rank = elem.id.split('sel-')[1];                                /*dbug-log*///console.log('--ranks[%O]', allRanks);
    const isChild = allRanks.indexOf(rank) <= allRanks.indexOf(resetRank);/*dbug-log*///console.log('     is [%s] sub-rank to [%s]? [%s]', rank, resetRank, isChild);
    return isChild;
}
function ifIsRankComboElem(elem) {
    return elem.id.includes('sel') && !elem.id.includes('Group');
 }
 function getRoot() {
     return _state('getFieldState', ['sub', 'Sub-Group', 'misc']).rcrd.taxon;
 }