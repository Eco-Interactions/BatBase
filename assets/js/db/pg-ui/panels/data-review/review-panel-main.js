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

let tblState;

export function addDataReviewEvents() {
    $('#rvw-data').click(toggleEditorColumn);
}

function toggleEditorColumn() {
    tblState = tState().get();
    const shown = $('#rvw-data').data('shown');
    tblState.columnApi.setColumnsVisible(['updatedBy'], !shown);
    $('#rvw-data').data('shown', !shown);
}