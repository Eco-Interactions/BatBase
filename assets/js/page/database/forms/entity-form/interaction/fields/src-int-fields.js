/**
 * Manages the source fields in the interaction form, Publication and Citation.
 *
 * Export
 *     onPubSelection
 *     fillCitationCombo
 *     onCitSelection
 *     onPubClear
 *
 * TOC
 *     PUBLICATION
 *     CITATION
 *         FILL COMBOBOX
 *         SELECT CITATION
 */
import { _cmbx } from '~util';
import { _form, _panel, _state } from '~form';
import * as iForm from '../int-form-main.js';

/* ======================= PUBLICATION ====================================== */
/**
 * When an existing publication is selected, the citation field is filled with
 * all current citations for the publciation. When a publication is created,
 * the citation form is automatically opened.
 */
export function onPubSelection(val) {                               /*perm-log*/console.log('       +--onPubSelection[%s]', val);
    if (val === 'create') { return _form('createEntity', ['Publication']); }
    if (val === '' || isNaN(parseInt(val)) ) { return onPubClear(); }
    fillCitationCombo(val);
    _panel('updateSrcDetails', ['pub']);
    if (!hasCitation(val)) { return _form('createEntity', ['Citation']); }
    iForm.focusPinAndEnableSubmitIfFormValid('Publication');
}
function hasCitation(val) {
    const pub = _state('getRcrd', ['source', val]);
    return pub ? pub.children.length : null; //If no pub found, the issue was alerted to developer and editor
}
export function onPubClear() {
    _cmbx('resetCombobox', ['CitationTitle']);
    _cmbx('enableCombobox', ['CitationTitle', false]);
    _panel('clearDetailPanel', ['pub']);
}
/* ======================== CITATION ======================================== */
/* ---------------------- FILL COMBOBOX ------------------------------------- */
/** Fills the citation combobox with all citations for the selected publication. */
export function fillCitationCombo(pubId) {
    _cmbx('enableCombobox', ['CitationTitle']);
    _cmbx('replaceSelOpts', ['CitationTitle', getPubCitationOpts(pubId)]);
}
/** Returns an array of option objects with citations for this publication.  */
function getPubCitationOpts(pubId) {
    const pubRcrd = _state('getRcrd', ['source', pubId]);
    return _cmbx('buildSrcOpts', ['citation', pubRcrd.children]);
}
/* ---------------------- SELECT CITATION ----------------------------------- */
/**
 * When a Citation is selected, both 'top' location fields are initialized
 * and the publication combobox is reenabled.
 */
export function onCitSelection(val) {                               /*perm-log*/console.log('       +--onCitSelection [%s]', val);
    if (val === 'create') { return _form('createEntity', ['Citation']); }
    if (val === '' || isNaN(parseInt(val))) { return _panel('clearDetailPanel', ['cit']); }
    _panel('updateSrcDetails', ['cit']);
    _cmbx('enableCombobox', ['Publication']);
    iForm.focusPinAndEnableSubmitIfFormValid('CitationTitle')
}