/**
 * Random methods that affect various form-elems.
 *
 * Export
 *     toggleSubmitBttn
 *     toggleFormStatusMsg
 */
import * as status from './form-status-msg.js';
import * as toggle from './toggle-submit.js';

export function toggleSubmitBttn() {
    return toggle.toggleSubmitBttn(...arguments);
}
export function toggleFormStatusMsg() {
    status.toggleFormStatusMsg(...arguments);
}