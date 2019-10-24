/**
 * Data review panel will allow editors to view the data they've edited, for
 * admin-editors to view all edited data and to send edits back to the editors
 * when needed.
 *
 * For now, toggles a column that shows the name of the most-recent editor of an
 * interaction/entity.
 *
 * Exports:                     Imported By:
 *     addDataReviewEvents          panel-util
 */
import { accessTableState as tState } from '../db-page.js';

let tblState;

export function addDataReviewEvents() {
    $('#rvw-data').click(toggleEditorColumn);
}

function toggleEditorColumn() {
    const shown = $('#rvw-data').data('shown');
    if (shown) {
        hideEditorColumn();
    } else {
        showEditorColumn();
    }
}
function hideEditorColumn() {
    tState().set({'initParams': {editor: false}}); 
    reloadTable();
    $('#rvw-data').data('shown', false);
    $('#rvw-data').removeClass('admin-open-toggle');
}
function showEditorColumn() {
    tState().set({'initParams': {editor: true}}); 
    reloadTable();
    $('#rvw-data').data('shown', true);
    $('#rvw-data').addClass('admin-open-toggle');
}
function reloadTable() {
    tblState = tState().get();
    const treeName = getTreeName(tblState.curView);
    tblState.api.destroy();
    require('../db-table/init.js').init(treeName, tblState.rowData, tblState);
}
function getTreeName(focus, view) {
    const map = {
        locs: 'Location', srcs: getSourceTreeName(view), taxa: 'Taxon'
    };
    return map[focus] + ' Tree';
}
function getSourceTreeName(view) {
    const map = { 'pubs': 'Publication', 'auths': 'Author', 'publ': 'Publisher'};
    return map[view];
}