/**
 * Interaction subject/object role-selection form configuration.
 */
import { _state } from '../../forms-main.js';

export default function(role) {
    const groupFields = getGroupFields(role);
    const fields = getRoleFields(groupFields);
    return {
        'add': groupFields,
        'required': [],
        'suggested': fields,
        'optional': [],
        'order': {
            'sug': fields,
            'opt': false },
    };
}
function getGroupFields(role) {
    if (role === 'subject') { return {}; }
    const fields = {};
    ['Group', 'Sub-Group'].forEach(addFieldNotPresentInDom);
    return fields;

    function addFieldNotPresentInDom(field) {
        if ($(`#${field}_row`).length) { return; }
        fields[field] = 'select';
    }
}
function getRoleFields(groupFields) {
    const lvls = _state('getTaxonProp', ['groupRanks']);
    const addedFields = Object.keys(groupFields);
    return !addedFields.length ? lvls : [...addedFields, ...lvls];
}