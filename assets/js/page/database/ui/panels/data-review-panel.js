/**
 * Data review panel will allow editors to view the data they've edited, for
 * admin-editors to view all edited data and to send edits back to the editors
 * when needed.
 *
 * Export
 *     addDataReviewEvents\
 *
 * TOC
 *     INIT
 *     TOGGLE
 */
import { _review } from '~db';
import * as pM from './panels-main.js';

/* ============================ INIT ======================================== */
export function initReviewPanel(userRole) {
    require('styles/pages/db/panels/rvw-data.styl');
    _review('initReviewComboboxes');
    $('#rvw-data').click(toggleReviewPanel);
}
/* ========================== TOGGLE ======================================== */
function toggleReviewPanel() {
    if ($('#review-pnl').hasClass('closed')) {
        buildAndShowReviewPanel();
    } else { pM.togglePanel('review', 'close'); }
}
function buildAndShowReviewPanel() {
    pM.togglePanel('review', 'open');
}