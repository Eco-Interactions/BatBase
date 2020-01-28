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
// import * as _u from '../../util/util.js';
import * as _uPnl from '../panels-main.js';

export function initReviewPanel(userRole) {
    require('../../../../../styles/db/panels/rvw-data.styl');  
    $('#rvw-data').click(toggleReviewPanel);
}

function toggleReviewPanel(argument) {
    if ($('#review-pnl').hasClass('closed')) { 
        buildAndShowReviewPanel();
    } else { _uPnl.togglePanel('review', 'close'); }
}

function buildAndShowReviewPanel() {
    _uPnl.togglePanel('review', 'open');
}