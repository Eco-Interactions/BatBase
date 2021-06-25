/**
 * Interaction subject/object role- or Taxon parent-selection form configuration.
 */
import { _u } from '~util';
import { _state } from '~form';

export default function(action, field) {
    const fields = getCoreGroupAndRankFieldConfg();
    return {
        action: action,
        data: {
            edit: ['group', 'rankNames', 'taxon']
        },
        fields: fields,
        name: field,
        views: {
            all: fields
        }
    };
}
export function getGroupFieldViewOrder(sGroupField) {                /*dbug-log*///console.log('getGroupFieldViewOrder sGroupField[%O]', _u('snapshot', [sGroupField]));
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