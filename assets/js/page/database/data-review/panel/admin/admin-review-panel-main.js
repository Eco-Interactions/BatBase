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
const app = { cal: false };
/* ============================ INIT ======================================== */
/* --------------------------- COMBOBOXES ----------------------------------- */
export function initAdminDataReviewPanel() {
    _cmbx('getOptsFromStoredData', ['editorNames']).then(initEditorCombobox);
    initStatusCombobox();
    initDateRangeCalendar();
    $('#rvw-cntrl-bttn').click(toggleAdminDataReview);
}
function initEditorCombobox(editorOpts) {                           /*dbug-log*///console.log('editorOpts = %O', editorOpts)
    const confg = {
        id: '#sel-rvw-editor',
        maxItems: null,
        name: 'Review Editor',
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
    const status = {
        approved: 'app',
        pending: 'pend',
        rejected: 'rej',
        deleted: 'del',
        unreviewed: 'new'
    }
    return Object.keys(status).map(buildStatusOption);

    function buildStatusOption(key) {
        return { text: key, value: status[key] };
    }
}
function initDateRangeCalendar() {
    app.cal = _lib('getNewCalendar', [getDateRangeCalConfg()]);
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
/* ------------- Select Records (First) Column ------------------------------- */
function toggleAdminDataReview() {
    if ($('#rvw-cntrl-bttn').data('review')) {
        //end data review
    } else {
        beginAdminDataReview();
    }
}
function beginAdminDataReview() {
    const dataReviewFilters = getDataReviewFilterParams();          /*dbug-log*/console.log('dataReviewFilters = %O', dataReviewFilters)

}
function getDataReviewFilterParams() {
    return {
        editors: _cmbx('getSelVal', ['Review Editor']),
        status: _cmbx('getSelVal', ['Review Editor']),
        dateRange: app.cal.selectedDates
    };
}