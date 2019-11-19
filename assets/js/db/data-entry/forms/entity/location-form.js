/**
 *
 *
 *
 * 
 */
import * as _forms from '../forms-main.js';




export function getComboboxEvents() {
    return {
        'Country': { change: focusParentAndShowChildLocs.bind(null, 'create') }
    };
}

