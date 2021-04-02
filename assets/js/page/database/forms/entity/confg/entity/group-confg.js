/**
 * Interaction subject/object role-selection form configuration.
 */
import { _state } from '~form';

export default function(role) {
    return {
        data: {
            edit: ['group', 'rankNames', 'taxon']
        },
        fields: getCoreGroupAndRankFieldConfg(),
        name: role,
        views: {}
    };
}
export function getRoleFieldViewOrder(sGroupField) {                /*dbug-log*///console.log('getRoleFieldViewOrder sGroupField[%O]', sGroupField);
    const gFields = [['Group'], ['Sub-Group']];
    if (!sGroupField.shown) { gFields.pop(); }
    return [...gFields, ...getSubGroupRankFields(sGroupField)];
}
/* --------------------------- RANK FIELDS ---------------------------------- */
function getSubGroupRankFields(sGroupField) {
    return sGroupField.misc.subRanks.map(f => [f]).reverse();
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