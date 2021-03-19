/**
 * Interaction subject/object role-selection form configuration.
 */
import { _state } from 'db/forms/forms-main.js';

export default function(role) {
    return {
        fields: getCoreGroupAndRankFieldConfg(),
        name: role,
        style: 'sml-form',
        views: {
            all: getRoleFieldViewOrder()
        }
    };
}
function getRoleFieldViewOrder() {
    const fConfg = _state('getFieldState', ['sub', 'Sub-Group', null]);
    const gFields = [['Group'], ['Sub-Group']];
    if (!fConfg.shown) { gFields.pop(); }
    return [...gFields, ...getSubGroupRankFields(fConfg)].filter(f => f);
}
/* --------------------------- RANK FIELDS ---------------------------------- */
function getSubGroupRankFields(fConfg) {
    return fConfg.misc.subRanks.map(f => [f]).reverse();
}
/* ------------------------ FIELD DEFINITIONS ------------------------------- */
function getCoreGroupAndRankFieldConfg() {
    return {
        Group: {
            misc: {
                customValueStore: true
            },
            name: 'Group',
            type: 'select'
        },
        'Sub-Group': {
            misc: {
                customValueStore: true
            },
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