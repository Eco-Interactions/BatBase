/**
 * Interaction subject/object role-selection form configuration.
 */
import { _state } from 'db/forms/forms-main.js';

export default function(role) {
    const groupFields = getGroupFields();
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
function getGroupFields() {
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
    return [...Object.keys(groupFields), ...lvls];
}