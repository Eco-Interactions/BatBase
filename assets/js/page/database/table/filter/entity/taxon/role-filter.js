/**
 * The table can be filtered by interaction role if Taxon Group can be in both roles.
 *
 * Export
 *      initInteractionRoleCombobox
 *
 * TOC
 *      INIT COMBOBOX
 *      APPLY FILTER
 */
import { _cmbx, _el } from '~util';
import { _ui } from '~db';
import * as fM from '../../filter-main.js';

let timeout;
/* ---------------------- INIT COMBOBOX ------------------------------------- */
export function initInteractionRoleCombobox() {
    $('#focus-filters').append(buildInteractionRoleFilter());
    finishRoleComboInit();
}
function buildInteractionRoleFilter() {
    const opts = buildRoleOptions();                                /*dbug-log*///console.log('buildInteractionRoleFilter')
    const sel = fM.newSel(opts, '', 'sel-RoleFilter');
    const filter = fM.getFilterField('Role', sel);
    filter.id = 'objRoleFilterCntnr';
    return filter;
}
function buildRoleOptions() {
    return [
        { text: 'Subject & Object', value: 'all' },
        { text: 'Subject',          value: 'subj' },
        { text: 'Object',           value: 'obj' }
    ]
}
function finishRoleComboInit(filterEl) {
    const confg = {
        name: 'Role Filter',
        onChange: filterTableByInteractionRole,
    };
    _cmbx('initCombobox', [confg]);
}
/* ----------------------- APPLY FILTER ------------------------------------- */
function filterTableByInteractionRole(val) {                       /*dbug-log*///console.log('filterTableByInteractionRole [%s]', val);
    updateRoleFilterState(val);
    fM.onFilterChangeUpdateRowData();
}
function updateObjGroupFilterState(val) {
    const state = { 'Role': val === 'all' ? false : val };
    fM.setFilterState('combo', state, 'direct');
}