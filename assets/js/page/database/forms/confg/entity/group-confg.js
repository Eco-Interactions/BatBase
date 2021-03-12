/**
 * Interaction subject/object role-selection form configuration.
 */
import { _state } from 'db/forms/forms-main.js';

export default function(role) {
    return {
        name: role,
        fields: getCoreGroupAndRankFieldConfg(),
        views: {
            all: getRoleFieldViewOrder()
        },
    };
}
function getRoleFieldViewOrder() {
    const fConfg = _state('getFieldState', ['sub', 'Sub-Group', null]);
    return [getGroupFields(fConfg), ...getSubGroupRankFields(fConfg)].filter(f => f);
}
/* -------------------------- GROUP FIELDS ---------------------------------- */
/**
 * On init, all fields are built. Once a (sub)Group is selected, the rank fields
 * will get rebuilt. If the previous group had a subGroup, the field is still
 * present in the DOM.
 */
function getGroupFields(fConfg) {
    return ifFieldAlreadyInDom('Group') ? null : ['Group', 'Sub-Group'];
}
function ifFieldAlreadyInDom(field) {
    return $(`#${field}_f`).length;
}
/* --------------------------- RANK FIELDS ---------------------------------- */
function getSubGroupRankFields(fConfg) {
    return fConfg.misc.subRanks.reverse().map(f => [f]);
}
/* ------------------------ FIELD DEFINITIONS ------------------------------- */
function getCoreGroupAndRankFieldConfg() {
    return {
        Group: {
            name: 'Group',
            type: 'select'
        },
        'Sub-Group': {
            name: 'Sub-Group',
            type: 'select'
        },
        Class: {
            name: 'Class',
            type: 'select'
        },
        Order: {
            name: 'Order',
            type: 'select'
        },
        Family: {
            name: 'Family',
            type: 'select'
        },
        Genus: {
            name: 'Genus',
            type: 'select'
        },
        Species: {
            name: 'Species',
            type: 'select'
        }
    }
}