/**
 * Interaction subject/object role-selection form configuration.
 */
import { _state } from 'db/forms/forms-main.js';

export default function(role) {
    const groupFields = getGroupFields();
    const fieldOrder = getRoleFields(groupFields);
    return {
        name: role,
        fields: getCoreGroupAndRankFieldConfg(),
        views: {
            all: fieldOrder
        },
    };
}
/**
 * On init, all fields are built. Once a (sub)Group is selected, the rank fields
 * will get rebuilt. If the previous group had a subGroup, the field is still
 * present in the DOM.
 */
function getGroupFields() {
    const fields = {};
    ['Group', 'Sub-Group'].forEach(addFieldNotPresentInDom);
    return fields;

    function addFieldNotPresentInDom(field) {
        if ($(`#${field}_f`).length) { return; }
        fields[field] = 'select';
    }
}
function getRoleFields(groupFields) {
    const lvls = _state('getTaxonProp', ['subGroup']).subRanks;
    return [...Object.keys(groupFields), ...lvls];
}
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
        Species: {
            name: 'Species',
            type: 'select'
        }
    }
}