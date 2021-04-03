/**
 * Handles individual Entity edit forms.
 *
 * Export
 *     editEntity
 *
 * CODE SECTIONS
 *     FORM INIT
 *         FORM FIELDS
 *         FINISH FORM INIT
 */
// import { fillFormWithEntityData } from './autofill-data.js';
import * as data from './edit-data.js';

export function setEditFieldValues() {
    return data.setEditFieldValues(...arguments);
}