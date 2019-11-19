/**
 * Form UI Code
 * 
 * CODE SECTIONS:
 *     INIT FORM HTML
 *         APPEND FIELDS AND FORM
 *     AFTER FORM INIT COMPLETE
 *         INTERACTION CREATE FORM
 *         EDIT FORMS
 *         ENTITY FORMS
 *     DETAIL PANEL
 *     EXIT FORM
 *     HELPERS
 *         
 * Exports:             Imported by:
 *     buildAndAppendForm       
 *     setCoreRowStyles         db-forms
 *     exitFormPopup            db-forms
 *     getExitButton            db-forms, f-errs
 */
import * as _u from '../../../util.js';
import * as _cmbx from './combobox-util.js';
import * as _forms from '../forms-main.js';
import * as _detPnl from './detail-panel.js';
import * as db_map from '../../../db-map/db-map.js';
import * as db_page from '../../../db-page.js';
import * as db_forms from '../../db-forms.js';
import { showTodaysUpdates } from '../../../db-table/db-filters.js';
import { buildFormFooter } from './form-footer.js';

let fP;
/* ======================== DETAIL PANEL ================================== */

/* ==================== AFTER FORM INIT COMPLETE ============================ */
/* --------- INTERACTION CREATE FORM ------------------ */
/* ---------- EDIT FORMS ------------------- */
/* --------- ENTITY FORMS ------------------ */
// /* =============================== HELPERS ================================== */
// export function setCoreRowStyles(formId, rowClass) {
//     const w = $(formId).innerWidth() / 2 - 3;  
//     $(rowClass).css({'flex': '0 1 '+w+'px', 'max-width': w});
// }
// /** Shows a form-submit success message at the top of the interaction form. */
// export function showSuccessMsg(msg, color) {
//     const cntnr = _u.buildElem('div', { id: 'success' });
//     const div = _u.buildElem('div', { class: 'flex-row' });
//     const p = _u.buildElem('p', { text: msg });
//     const bttn = getSuccessMsgExitBttn();
//     div.append(p, bttn);
//     cntnr.append(div);
//     $(cntnr).css('border-color', color);
//     $('#top-hdr').after(cntnr); 
//     $(cntnr).fadeTo('400', .8);
// }
// function getSuccessMsgExitBttn() {
//     const bttn = _u.buildElem('input', { 'id': 'sucess-exit', 
//         'class': 'tbl-bttn exit-bttn', 'type': 'button', 'value': 'X' });
//     $(bttn).click(exitSuccessMsg);
//     return bttn;
// }
// export function exitSuccessMsg() {
//     $('#success').fadeTo('400', 0, () => $('#success').remove());
// }
