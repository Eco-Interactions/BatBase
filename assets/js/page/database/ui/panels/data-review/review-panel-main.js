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
import { _table } from '~db';
import { _cmbx } from '~util';
import * as pM from '../panels-main.js';

/* ============================ INIT ======================================== */
export function initReviewPanel(userRole) {
    // require('../../../../libs/rangePlugin.ts');
    require('styles/pages/db/panels/rvw-data.styl');
    initReviewComboboxes();
    $('#rvw-data').click(toggleReviewPanel);
}
function initReviewComboboxes() {
    _cmbx('initCombobox', [{ name: 'Editor', id: '#sel-rvw-editor', maxItems: null, onChange: Function.prototype }]);
    _cmbx('initCombobox', [{ name: 'Status', id: '#sel-rvw-status', onChange: Function.prototype }]);
    // initDateRangeSelect();
}
function initDateRangeSelect() {
    // _u.initCombobox('Review-Date-Range');
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
/* ------------- Select Records (First) Column ------------------------------- */
