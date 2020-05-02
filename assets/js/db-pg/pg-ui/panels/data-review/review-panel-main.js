/**
 * Data review panel will allow editors to view the data they've edited, for
 * admin-editors to view all edited data and to send edits back to the editors
 * when needed.
 *
 * For now, toggles a column that shows the name of the most-recent editor of an
 * interaction/entity.
 *
 * Exports:                     Imported By:
 *     addDataReviewEvents          panels-main
 */
import { accessTableState as tState } from '../../../db-main.js';
// import * as _u from '../../../util/util.js';
// import * as pM from '../panels-main.js';

export function initReviewPanel() {
    require('../../../../../styles/db/panels/rvw-data.styl');  
    $('#rvw-data').click(toggleEditorColumn);
}

function toggleEditorColumn() {
    const tblState = tState().get();
    const shown = $('#rvw-data').data('shown');
    tblState.columnApi.setColumnsVisible(['updatedBy'], !shown);
    $('#rvw-data').data('shown', !shown);
}

// export function initReviewPanel(userRole) {
//     // require('../../../../libs/rangePlugin.ts');
//     initReviewComboboxes();
//     $('#rvw-data').click(toggleReviewPanel);
// }
// /* ----------------------- COMBOBOXES --------------------------------------- */
// function initReviewComboboxes() {
//     // _u.initCombobox('Review-Editor');
//     // _u.initCombobox('Review-Status');
//     // initDateRangeSelect();
// }
// function getComboConfg(field) {
//     const confgs = {
//         'Review-Editor': { name: 'Editor', id: 'rvw-editor-sel', change: Function.prototype },
//         'Review-Status': { name: 'Status', id: 'rvw-state-sel', change: Function.prototype },
//         'Review-Date-Range': { name: 'Date Range', id: 'rvw-date-start-sel', change: Function.prototype },
//     };
//     return confgs[field];
// }
// function initDateRangeSelect() {
//     // _u.initCombobox('Review-Date-Range');   
// }
// /* ----------------------- COMBOBOXES --------------------------------------- */
// function toggleReviewPanel(argument) {
//     if ($('#review-pnl').hasClass('closed')) { 
//         buildAndShowReviewPanel();
//     } else { pM.togglePanel('review', 'close'); }
// }
// function buildAndShowReviewPanel() {
//     pM.togglePanel('review', 'open');
//     // window.setTimeout(() => $('#rvw-editor-sel')[0].selectize.focus(), 500);
// }
// /* ------------- Select Records (First) Column ------------------------------- */
