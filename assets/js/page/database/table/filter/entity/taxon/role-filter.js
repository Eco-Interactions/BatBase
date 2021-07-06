/**
 * The table can be filtered by interaction role if Taxon Group can be in both roles.
 *
 * Export
 *      finishRoleComboInit
 *      getInteractionRoleFilter
 *
 * TOC
 *      INIT COMBOBOX
 *      APPLY FILTER
 */
import { _cmbx } from '~util';
import { _ui } from '~db';
import * as fM from '../../filter-main.js';

let timeout;
/* ---------------------- INIT COMBOBOX ------------------------------------- */
export function getInteractionRoleFilter() {
    const opts = buildRoleOptions();                                /*dbug-log*///console.log('buildInteractionRoleFilter')
    const sel = fM.newSel(opts, 'field-input', 'sel-RoleFilter');
    const filter = fM.getFilterField('Role', sel);
    filter.id = 'roleFilterCntnr';
    return filter;
}
function buildRoleOptions() {
    return [
        { text: 'Subject & Object', value: 'all' },
        { text: 'Subject',          value: 'subj' },
        { text: 'Object',           value: 'obj' }
    ]
}
export function finishRoleComboInit() {                                         //console.log('-- finishRoleComboInit')
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