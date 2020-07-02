/**
 * The intro.js walkthrough contains the tutorial for the database search page.
 * It is loaded on the first visit to the page and prompts the user to go through
 * the entire tutorial. The tutorial can later be accessed by clicking on the
 * tutorial button and selecting the a smaller focus of the tutorial or the entire
 * set.
 * The search tips available by clicking on "Show Tips".
 *
 * Exports:             Imported by:
 *     exitModal                save-fltrs
 *     showHelpModal            save-fltrs, save-ints
 *     showSaveModal            save-fltrs, view-pdfs
 */
import { _tutorial } from '../db-pg/db-main.js';
let intro;

/* ===================== MODALS/TIPS ======================================== */
/* ------------ HELP MODALS ------------ */
export function showHelpModal(key) {
    if (intro) { return; }
    intro = require('../libs/intro.js').introJs();
    intro.onexit(() => intro = null);
    intro.oncomplete(() => intro = null);
    intro.setOptions({
        showBullets: false,
        showStepNumbers: false,
        steps: getHelpSteps(key),
        tooltipClass: 'intro-tips'});
    intro.start();
}
function getHelpSteps(key) {
    const getSteps = {
        'filter-panel': 'getFilterPanelSteps',
        'selSavedFilters': 'getSavedFilterSteps',
        'saved-lists': 'getSavedListSteps'
    };
    return _tutorial(getSteps[key]);
}
/* ------------ SAVE MODALS ------------ */
/**
 * Shows the save modal. Possible configuration are:
 * > Required config: html, elem, dir
 * > Optional: submit, cancel, bttn
 */
export function showSaveModal(confg) { //text, elem, dir, submitCb, cancelCb, bttnText) {  //console.log('showing modal')
    if (intro) { return; }
    window.setTimeout(initModal.bind(null, confg), 500); //keeps the above button from flashing
}
function initModal(confg) {
    intro = require('../libs/intro.js').introJs();
    intro.oncomplete(getSubmitFunc(confg.submit, confg.cancel));
    intro.onexit(getExitFunc(confg.cancel));
    intro.setOptions(getModalOptions(confg));
    if (confg.onLoad) { intro.onafterchange(confg.onLoad); }
    intro.start();
}
function getSubmitFunc(submitCb, cancelCb) {
    return !submitCb ? exitModal.bind(null, cancelCb) : submitCb;
}
function getExitFunc(cancelCb) {
    return cancelCb ? exitModal.bind(null, cancelCb) : exitModal;
}
export function exitModal(cancelCb) {
    if (intro) { intro.exit(); }
    if (cancelCb) { cancelCb(); }
    intro = null;
}
function getModalOptions(confg) {
    return {
        showStepNumbers: false,
        showBullets: false,
        skipLabel: 'Cancel',
        doneLabel: confg.bttn ? confg.bttn : 'Close',
        tooltipClass: 'modal-msg',
        steps: getSlideConfg(confg.html, confg.elem, confg.dir)
    };
}
function getSlideConfg(text, elem, dir) {
    return [{
        element: elem,
        intro: text,
        position: dir
    }];
}
