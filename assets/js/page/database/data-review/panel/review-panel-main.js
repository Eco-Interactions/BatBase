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
import * as admin from './admin/admin-review-panel-main.js';
import * as editor from './editor/editor-review-panel-main.js';
/* ============================ INIT ======================================== */
/* --------------------------- COMBOBOXES ----------------------------------- */
export function initDataReviewPanel(userRole) {
    const map = {
        // editor: editor.initEditorReviewPanel,
        admin: admin.initAdminDataReviewPanel,
        editor: admin.initAdminDataReviewPanel,
        super: admin.initAdminDataReviewPanel,
    };
    map[userRole]();
}
/* ------------- Select Records (First) Column ------------------------------- */
