/**
 * Handles displaying and submitting the user-feedback form.
 *
 * Export
 *     initFeedbackUi
 *
 * TOC
 *     MENU ITEM
 *     POPUP
 *         SHOW
 *         HEADER
 *         FIELD ROWS
 *             RELOCATE ALERT
 *             TOPIC FIELD
 *             FEEDBACK-TEXTAREA
 *         FEEDBACK FOOTER
 *             TOGGLE SUBMIT
 *             SUBMIT FEEDBACK
 *             SENTRY ALERT
 *         CLOSE POPUP
 */
import { alertIssue, getElem, getFieldRow, getFormFooter, sendAjaxQuery } from '~util';
/* ======================= MWNU ITEM ======================================== */
/** Creates the "Leave Feedback" menu option for all registered users. */
export default function initFeedbackUi() {
    if ($('body').data('base-url') == "false") { return; }
    const fdbkElem = '<li id="feedback-menu"><a href="#">Leave Feedback</a></li>';
    $('#oimenu>.last>ul').prepend(fdbkElem);
    $('#feedback-menu').on('click', showFeedbackPopup);
    require('styles/modules/user-feedback.styl');
}
/* ======================= POPUP ============================================ */
function showFeedbackPopup() {
    buildFeedbackPopup();
    initCharCountAlerts();
    $('#b-overlay').fadeIn('slow');
}
/* ------------------------- SHOW ------------------------------------------- */
function buildFeedbackPopup() {
    const elems = [
        getFeedbackHeader(),
        getTopicField(),
        getContentField(),
        getFeedbackFooter()];
    $('#b-overlay-popup').addClass('feedback-popup').append(elems);
}
function initCharCountAlerts() {
    $('.feedback-popup textarea, .feedback-popup input').trigger('keyup');
}
/* ------------------------- HEADER ----------------------------------------- */
function getFeedbackHeader() {
    const thanks = 'Thank you for contributing to Bat Eco-Interactions!';
    return `<center><h3>${thanks}</h3></center>`;
}
/* _________________________ FIELD ROWS _____________________________________ */
function getFieldConfg(name, input, min, max) {
    return {
        flow: 'col',
        input: input,
        name: name,
        val: {
            charLimits: {
                min: min,
                max: max,
                onValid: toggleFeedbackSubmitButton,
                onInvalid: toggleFeedbackSubmitButton.bind(null, false)
            }
        }
    };
}
function getFeedbackFieldRow(confg) {
    const row = getFieldRow(confg);
    moveAlertsToRightOfLabel(row, confg);
    return row;
}
/* -------------------- RELOCATE ALERT -------------------------------------- */
function moveAlertsToRightOfLabel(row, confg) {
    const alertEl = row.removeChild(row.firstChild);
    $(getFieldLabel(row)).addClass('flex-row field-elems').append(alertEl);
}
function getFieldLabel(row) {
    return row.firstChild.firstChild;
}
/* ------------------------- TOPIC FIELD ------------------------------------ */
function getTopicField() {
    const confg = getFieldConfg('topic', getTopicInput(), 5, 50);
    return getFeedbackFieldRow(confg);
}
function getTopicInput() {
    const attrs = { type: 'text',  placeholder: 'Breif summary of your feedback' };
    return getElem('input', attrs);
}
/* ----------------------- FEEDBACK-TEXTAREA -------------------------------- */
function getContentField() {
    const confg = getFieldConfg('feedback', getContentTextarea(), 10, 500);
    return getFeedbackFieldRow(confg);
}
function getContentTextarea() {
    const attrs = { placeholder: 'Have an idea? Find a bug? Love a feature? Let us know!' };
    return getElem('textarea', attrs);
}
/* ====================== FEEDBACK FOOTER =================================== */
function getFeedbackFooter() {
    const confg = {
        formName: 'Feedback',
        onSubmit: postFeedback,
        submitText: 'Submit Feedback',
        onCancel: closePopup
    };
    return getFormFooter(confg);
}
/* ----------------------------- TOGGLE SUBMIT ------------------------------ */
function toggleFeedbackSubmitButton(enable = true) {
    enable = enable && $('.feedback-popup .alert-active').length === 0;/*dbug-log*///console.log('toggleFeedbackSubmitButton enable?[%s]', enable);
    const opac = enable ? 1 : .35;
    $('#Feedback-submit').fadeTo( 'fast', opac).attr({'disabled': !enable});
}
/* ---------------------------- SUBMIT FEEDBACK ----------------------------- */
function postFeedback() {
    const data = {
        route: $('body').data('this-url'),
        topic: $('#topic_row input').val(),
        feedback: $('#feedback_row textarea').val()
    };
    closePopup() && sendAjaxQuery(data, 'feedback/post');
    alertIssue('feedback', data);
}
/* =========================== CLOSE POPUP ================================== */
function closePopup() {
    $('#b-overlay').fadeOut('slow', () => {
        $('#b-overlay-popup').empty();
        $('#b-overlay-popup').removeClass('feedback-popup');
    });
    return true;
}