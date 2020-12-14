/**
 * Handles displaying the 'help' modal for editors and above with options to either
 * reset the local database or submit a bug report.
 *
 * TOC
 *    HELP MODAL
 *    BUG REPORT POPUP
 *        REPORT HTML
 *            PROMPTS
 *            BUTTONS
 *        SUBMIT REPORT
 *            SERVER
 *            SENTRY
 *        CLOSE REPORT POPUP
 */
import { _db, _el, _modal } from '~util';
/* ===================== HELP MODAL ========================================= */
export default function showEditorHelpModal() {
    const confg = {
        html: getHelpHtml(), selector: '#data-help', dir: 'left', onLoad: setBttnEvents
    }
    _modal('showSaveModal', [confg]);
}
function getHelpHtml() {
    return `<center><h3>Experiencing issues?</h3></center><br><br>
    ${getModalBttn('Reset Local Data')}${getModalBttn('Report A Bug')}<br>`
}
function getModalBttn(text) {
    return `<button class="intro-bttn">${text}</button>`;
}
function setBttnEvents() {
    const map = {
        'Reset Local Data': _db.bind(null, 'resetStoredData', [true]),
        'Report A Bug': showBugReportPopup
    }
    $('.intro-bttn').each((i, elem) => {
        $(elem).click(() => { _modal('exitModal', [map[elem.innerText]]); }
    )});
}
/* ===================== BUG REPORT POPUP =================================== */
function showBugReportPopup() {
    $("#b-overlay-popup").html(getBugReportHtml());
    $("#b-overlay-popup").addClass("bugs-popup flex-col");
    bindEscEvents();
    $('#b-overlay, #b-overlay-popup').fadeIn(500, () => $('.bug-rprt-input')[0].focus());

    function bindEscEvents() {
        $(document).on('keyup',function(evt) {
            if (evt.keyCode == 27) { closeBugReportPopup(); }
        });
        $("#b-overlay").click(closeBugReportPopup);
        $("#b-overlay-popup").click(function(e) { e.stopPropagation(); });
    }
}
/* ---------------------------- REPORT HTML --------------------------------- */
function getBugReportHtml() {
    const hdr = '<h3><center>New Issue Report</center></h3><br>'
    const prompts = getReportPrompts();
    const upload = buildRprtPrompt('Upload screenshots if relevant:', 'file');
    const bttns = getReportBttns();
    return [hdr, ...prompts, upload, bttns];
}
/* ------ PROMPTS ----------------- */
function getReportPrompts() {
    const p1 = buildRprtPrompt('Breifly summarize the issue you are experiencing:', 'text', true);
    const p2 = buildRprtPrompt('Describe the steps necessary to reproduce the issue:', null, true);
    const p3 = buildRprtPrompt('Please provide any additional helpful information:');
    return [p1, p2, p3];
}
function buildRprtPrompt(text, inputType, isRequired) {
    const lbl = buildFieldContainer(isRequired);
    const span = _el('getElem', ['span', { text: text, class: 'bug-span' }]);
    const input = buildFieldInput(inputType);
    $(lbl).append([span, input]);
    return lbl;
}
function buildFieldInput (type) {
    if (!type) { return _el('getElem', ['textarea', { class: 'bug-rprt-input' }])}
    const input =  _el('getElem', ['input', { class: 'bug-rprt-input', type: type }]);
    if (type === 'file') { $(input).attr('multiple', 'multiple'); }
    return input;
}
function buildFieldContainer(isRequired) {
    const classes = 'bug-prompt' + (isRequired ? ' required' : '');
    return _el('getElem', ['label', { class: classes }]);
}
/* ------ BUTTONS ----------------- */
function getReportBttns() {
    const cntnr = _el('getElem', ['div', { class: 'flex-row' }]);
    const spacer = _el('getElem', ['div', { class: 'flex-grow' }]);
    const sub = buildFormButton('Submit', submitBugRprt);
    const cncl = buildFormButton('Cancel', closeBugReportPopup);
    $(cntnr).append([spacer, sub, cncl]);
    return cntnr;
}
/** Returns a (submit or cancel) button */
function buildFormButton(action, onClick) {
    const attr = { id: 'rprt-'+action, type: 'button', value: action}
    const bttn = _el('getElem', ['input', attr]);
    $(bttn).click(onClick);
    return bttn;
}
/* -------------------------- SUBMIT REPORT --------------------------------- */
function submitBugRprt() {
    const ready = checkRequiredBugReportFields($('.bug-prompt.required'));
    if (!ready) { showReportStatus('Please fill all required fields.', 'red');
    } else { createNewIssueReport(); }
}
function checkRequiredBugReportFields($fields) {
    let ready = true;
    $fields.each((i, f) => { if (!$(f.children[1]).val()) { ready = false; } })
    return ready;
}
/* ----------------- SERVER ------------------ */
function createNewIssueReport () {
    const formData = new FormData();
    formData.append('description', $('.bug-rprt-input')[0].value);
    formData.append('stepsToReproduce', $('.bug-rprt-input')[1].value);
    formData.append('miscInfo', $('.bug-rprt-input')[2].value);
    attachFilesToFormData($('.bug-rprt-input')[3].files);
    sendAjaxFormData(formData);

    function attachFilesToFormData (files) {
        files.forEach((f, i) => formData.append('image'+(i+1), f));
    }
}
function sendAjaxFormData (formData) {
    $.ajax({
       url: 'issue/report',
       type: 'POST',
       data: formData,
       processData: false,
       contentType: false,
       success: reportSubmitSuccess,
       error: reportSubmitError
    });
}
function reportSubmitSuccess (data) {                                           console.log('reportSubmitSuccess. args = %O', arguments);
    submitNewSentryIssue(data.filenames);
}
function reportSubmitError (jqXHR, textStatus, errorMessage) {                  console.log('IssueReportSubmitError = [%s]', errorMessage);
    showReportStatus('An error occured during submission.', 'red');
}
/* ----------------- SENTRY ------------------ */
function submitNewSentryIssue(fileNames) {
    const data = {
        summary: $('.bug-rprt-input')[0].value,
        steps: $('.bug-rprt-input')[1].value,
        etc: $('.bug-rprt-input')[2].value,
        screenshots: JSON.stringify(fileNames.map(f => buildScreenshotUrl(f)))
    };
    _db('getData', ['editorReport', data]);
    updateBugReportUiAfterSubmit();
}
function buildScreenshotUrl(fileName) {
    const date = new Date().today().split('-').join('/');  console.log('url = ', '/uploads/issue_screenshots/' + date + '/' + fileName);
    return '/uploads/issue_screenshots/' + date + '/' + fileName;
}
function updateBugReportUiAfterSubmit() {
    $('#rprt-Cancel').val('Close');
    $('#rprt-Submit, .bug-rprt-input').css({'opacity': .5, 'pointer': 'not-allowed'}).attr('disabled', true);
    showReportStatus('Thank you for helping improve the database!', 'green');
}
function showReportStatus(msg, color) {
    if ($('.rprt-status')[0]) { $('.rprt-status').remove(); }
    $('.bugs-popup h3').after(buildReportStatus(msg, color));
}
function buildReportStatus(text, color) {
    const msg = _el('getElem', ['div', { class: 'rprt-status', text: text }]);
    $(msg).css({'color': color, 'margin-top': '1em'});
    return msg;
}
/* --------------------- CLOSE REPORT POPUP --------------------------------- */
function closeBugReportPopup() {
    $("#b-overlay").fadeTo('fast', 0, () => {
        $("#b-overlay").css({'display': 'none', 'opacity': 1});
        unbindEscEvents();
        removeReportStyles();
    });
}
function unbindEscEvents() {
    $(document).on('keyup',function(){});
    $("#b-overlay").click(function(){});
}
function removeReportStyles() {
    $("#b-overlay-popup").removeClass("bugs-popup");
    $("#b-overlay").removeClass("flex-col");
    $("#b-overlay-popup").empty();
}