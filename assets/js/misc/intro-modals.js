/**
 * The intro.js walkthrough contains the tutorial for the database search page.
 * It is loaded on the first visit to the page and prompts the user to go through
 * the entire tutorial. The tutorial can later be accessed by clicking on the
 * tutorial button and selecting the a smaller focus of the tutorial or the entire
 * set.
 * The search tips available by clicking on "Show Tips".
 *
 * Exports:
 *     exitModal
 *     showInfoModal
 *     showFormTutorial
 *     showSaveModal
 *
 * TOC
 *     INIT INTROJS
 *     HELP MODALS
 *     SAVE MODALS
 *     FORM TUTORIAL
 *         refreshIntroPosition
 */
import { _tutorial } from '../db-pg/db-main.js';
import * as introJs from '../libs/intro.js';
let intro;

function initIntroJs(options, onComplete, onExit) {
    intro = introJs();
    intro.oncomplete(onComplete);
    intro.onexit(onExit);
    intro.setOptions(options);
}
function clearIntroMemory() {
    intro = null;
}
/* ---------------------- HELP MODALS --------------------------------------- */
export function showInfoModal(key) {
    if (intro) { return; }
    initIntroJs(getInfoModalOpts(key), clearIntroMemory, clearIntroMemory);
    intro.start();
    refreshIntro();
}
function getInfoModalOpts(key) {
    return {
        showBullets: false,
        showStepNumbers: false,
        steps: getHelpSteps(key),
        tooltipClass: 'intro-tips'
    };
}
function getHelpSteps(key) {
    const getSteps = {
        'filter-panel': 'getFilterPanelSteps',
        'sel-FilterSet': 'getSavedFilterSteps',
        'saved-lists': 'getSavedListSteps'
    };
    return _tutorial(getSteps[key]);
}
/* ----------------------- SAVE MODALS -------------------------------------- */
/**
 * Shows the save modal. Possible configuration are:
 * > Required config: html, selector, dir
 * > Optional: submit, cancel, bttn
 */
export function showSaveModal(confg) {                                          //console.log('showing modal')
    if (intro) { return; }
    intro = 'loading';
    window.setTimeout(initModal.bind(null, confg), 500); //keeps the above button from flashing
}
function initModal(confg) {
    const onComplete = getSubmitFunc(confg.submit, confg.cancel);
    togglePgElemZindexes('hide');
    initIntroJs(getModalOptions(confg), onComplete, getExitFunc(confg.cancel));
    if (confg.onLoad) { intro.onafterchange(confg.onLoad); }
    intro.start();
    refreshIntro();
}
function getSubmitFunc(submitCb, cancelCb) {
    return !submitCb ? exitModal.bind(null, cancelCb) : submitCb;
}
function getExitFunc(cancelCb) {
    return cancelCb ? onModalExit.bind(null, cancelCb) : onModalExit;
}
export function exitModal(cancelCb) {
    if (intro) { intro.exit(); }
    onModalExit(cancelCb);
}
function onModalExit(cancelCb) {
    if (cancelCb) { cancelCb(); }
    intro = null;
    togglePgElemZindexes('show');
}
function getModalOptions(confg) {
    return {
        showStepNumbers: false,
        showBullets: false,
        skipLabel: 'Cancel',
        doneLabel: confg.bttn ? confg.bttn : 'Close',
        tooltipClass: 'modal-msg',
        steps: getSlideConfg(confg.html, confg.selector, confg.dir)
    };
}
function getSlideConfg(text, selector, dir) {
    return [{
        element: selector,
        intro: text,
        position: dir
    }];
}
/* ----------------------- FORM TUTORIAL ------------------------------------ */
export function showFormTutorial(fLvl) {                                        //console.log('show[%s]FormTutorial', fLvl);
    if (intro) { intro.exit(); }
    togglePgElemZindexes('hide');
    initIntroJs({tooltipClass: 'intro-tips'}, exitFormTutorial, exitFormTutorial);
    intro.start(fLvl+'-intro');
    refreshIntro();
    // addFinalInfoStep(fLvl);
}
/* ================================ SHARED ================================== */
function togglePgElemZindexes(state) {
    if (state === 'hide') { hideNonFormElems();
    } else { resetPgElems(); }
}
function hideNonFormElems() {
    const selectors = 'nav, #hdrmenu, #slider-logo';
    $(selectors).css({'z-index': 0});
}
function refreshIntro() {
    window.setTimeout(() => {intro ? intro.refresh() : null}, 250);
}
function resetPgElems() {
    $('nav').css({'z-index': 1});
    $('#hdrmenu').css({'z-index': 1001});
    $('#slider-logo').css({'z-index': 11});
}
function exitFormTutorial() {
    intro = null;
    togglePgElemZindexes('show');
}
// Not working yet
// function addFinalInfoStep(fLvl) {
//     intro._introItems.push({
//         disableInteraction: false,
//         element: `form#${fLvl}-form.flex-row.introjs-showElement.introjs-relativePosition`,
//         intro: "View field info by hovering over the field at any time.",
//         position: "right",
//         scrollTo: "element",
//         step: intro._introItems.length,
//     }); console.log('intro = %O', intro._introItems)
// }