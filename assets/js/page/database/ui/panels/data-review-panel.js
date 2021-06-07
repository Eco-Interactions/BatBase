/**
 * Handles opening and closing the Data-Review Panel. Inits the table @ _review.
 *
 * Export
 *     initReviewPanel
 *
 * TOC
 *     INIT
 *     TOGGLE
 */
import { _review } from '~db';
import * as pM from './panels-main.js';

/* ============================ INIT ======================================== */
export function initReviewPanel(userRole) {
    if (userRole === 'visitor' || userRole === 'user') { return; }
    require('styles/pages/db/panels/rvw-data.styl');
    _review('initDataReviewPanel', [userRole]);
    $('#rvw-data').click(toggleReviewPanel);
}
/* ========================== TOGGLE ======================================== */
function toggleReviewPanel() {
    if ($('#review-pnl').hasClass('closed')) {
        buildAndShowReviewPanel();
    } else { hideReviewPanel(); }
}
function toggleDataOptsBarButtons(enable = true) {
    const opac = enable ? 1 : .3;
    const cursor = enable ? 'pointer' : 'not-allowed';
    $('#new-data, #data-help').attr('disabled', !enable)
        .css({ 'opacity': opac, 'cursor': cursor });
}
/* ------------------------------- SHOW ------------------------------------- */
function buildAndShowReviewPanel() {
    pM.togglePanel('review', 'open');
    $('#data-opts').append(getPseudoBorderStyle());
    toggleDataOptsBarButtons(false);
}
function getPseudoBorderStyle() {
    const panelT = $('#review-pnl').position().top;
    const tabW = $('#data-opts').innerWidth();
    const tabL = $('#data-opts').position().left + 1;                /*dbug-log*///console.log('sizePanelTab. T = [%s], W = [%s], L = [%s]', panelT, tabW, tabL);
    return `<style>.hide-rvw-bttm-border:before {
        position: absolute;
        content: '';
        height: 3px;
        z-index: 10;
        width: ${tabW}px;
        top: ${panelT}px;
        left: ${tabL}px;
        background: #d6ebff;
        }</style>`;
}
/* ------------------------------- HIDE ------------------------------------- */
function hideReviewPanel() {
    pM.togglePanel('review', 'close');
    $('.hide-rvw-bttm-border:before').remove();
    toggleDataOptsBarButtons(true);

}