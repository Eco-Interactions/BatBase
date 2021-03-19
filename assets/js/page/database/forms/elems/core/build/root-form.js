/**
 * Code specific to root-form builds.
 *
 * Export
 *     finishAndAppendRootForm
 *
 * TOC
 *
 */
import { _el } from '~util';
import { _elems, _panel } from '~form';

/** [buildAndAppendRootForm description] */
export function finishAndAppendRootForm(form, fState, el) {         /*dbug-log*///console.log('+--finishAndAppendRootForm form[%O] elems[%O] fState[%O]', form, el, fState);
    const finishedForm = buildRootForm(fState, form, el);
    appendAndStyleForm(finishedForm, fState.style);
}
/* ==================== ASSEMBLE ============================================ */

/**
 * Returns the form window elements - the form and the detail panel.
 * section>(div#top-form(header, form), div#form-details(hdr, pub, cit, loc), footer)
 */
function buildRootForm(fState, form, el) {                          /*dbug-log*///console.log('--buildRootForm  form[%O] elems[%O] fState[%O]', form, el, fState);
    return [getExitButtonRow(el), assembleFormAndPanel(fState, form)];
}
function assembleFormAndPanel(fState, form) {                        /*dbug-log*///console.log('--assembleFormAndPanel form[%O] fState[%O]', form, fState);
    const cntnr = _el('getElem', ['div', { class: 'flex-row' }]);
    $(cntnr).append([form, getPanel(fState)]);
    return cntnr;
}
/* --------------------------- PANEL ---------------------------------------- */
function getPanel(f) {
    const id = f.editing ? f.editing : null;
    return _panel('getDetailPanelElems', [f.name, id, f.action]);
}
/* ----------------------- POPUP-EXIT ROW ----------------------------------- */
function getExitButtonRow(el) {
    const  row = _el('getElem', ['div', { class: 'exit-row' }]);
    $(row).append(el.tutBttn, el.exitBttn);
    return row;
}
/* ======================== APPEND AND STYLE ================================ */
/** Builds and shows the popup form's structural elements. */
function appendAndStyleForm(finishedForm, style) {
    $('#b-overlay').addClass('form-ovrly');
    $('#b-overlay-popup').addClass('form-popup');
    $('#b-overlay-popup').append(finishedForm);
    addFormStyleClass(style);
}
/** Adds the width to both the popup window and the form element for each entity. */
function addFormStyleClass(style) {
    $('#top-form, .form-popup').removeClass(['lrg-form', 'med-form', 'sml-form']);
    $('#top-form, .form-popup').addClass(style);
}