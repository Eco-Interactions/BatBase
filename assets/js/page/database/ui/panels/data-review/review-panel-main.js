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
import { _cmbx, _db, _lib } from '~util';
import * as pM from '../panels-main.js';

/* ============================ INIT ======================================== */
export function initReviewPanel(userRole) {
    require('styles/pages/db/panels/rvw-data.styl');
    initReviewComboboxes();
    $('#rvw-data').click(toggleReviewPanel);
}
/* --------------------------- COMBOBOXES ----------------------------------- */
function initReviewComboboxes() {
    _cmbx('getOptsFromStoredData', ['editorNames']).then(initEditorCombobox);
    initStatusCombobox();
    initDateRangeCalendar();
}
function initEditorCombobox(editorOpts) {                           /*dbug-log*///console.log('editorOpts = %O', editorOpts)
    const confg = {
        id: '#sel-rvw-editor',
        maxItems: null,
        name: 'Editor',
        onChange: Function.prototype,
        options: editorOpts
    };
    _cmbx('initCombobox', [confg]);
}
function initStatusCombobox() {
    const confg = {
        id: '#sel-rvw-status',
        maxItems: null,
        name: 'Status',
        onChange: Function.prototype,
        options: getStatusOptions()
    };
    _cmbx('initCombobox', [confg]);
}
function getStatusOptions() {
    // body...
}
function initDateRangeCalendar() {
    _lib('getNewCalendar', [getDateRangeCalConfg()]);
}
function getDateRangeCalConfg() {
    return {
        elemId: '#rvw-date-start',
        // mode: 'range',
        enableTime: false,
        onClose: Function.prototype,
        // plugins: false,
        plugins: {'range': { input: '#rvw-date-end' }},
    };
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
