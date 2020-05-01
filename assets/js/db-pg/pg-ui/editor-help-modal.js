/**
 * Handles displaying the 'help' modal for editors and above with options to either
 * reset the local database or submit a bug report.
 */
import * as _pg from '../db-main.js';
import { exitModal, showSaveModal } from '../../misc/intro-core.js';

/* ====================== EDITOR HELP ======================================= */
/* --------------------- HELP MODAL ----------------------------------------- */
export default function showEditorHelpModal() {
    const confg = {
        html: getHelpHtml(), elem: '#data-help', dir: 'left', onLoad: setBttnEvents
    }
    showSaveModal(confg);
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
        'Reset Local Data': _pg.resetLocalDb.bind(null, true),
        'Report A Bug': showBugReportPopup
    }
    $('.intro-bttn').each((i, elem) => { 
        $(elem).click(() => { exitModal(map[elem.innerText]); }
    )});
}
/* --------------------- BUG REPORT POPUP ----------------------------------- */
function showBugReportPopup() {
    $("#b-overlay-popup").html(getBugReportHtml());
    $("#b-overlay-popup").addClass("bugs-popup flex-row");
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
/* -------------- REPORT HTML --------------------------- */
function getBugReportHtml() {
    const hdr = '<h3><center>New Issue Report</center></h3><br>'
    const prompts = getReportPrompts();
    const bttns = getReportBttns();
    return [hdr, ...prompts, bttns];
}
/* ------ PROMPTS ----------------- */
function getReportPrompts() {     
    const p1 = buildRprtPrompt('Summarize the issue you are experiencing:', true);
    const p2 = buildRprtPrompt('Describe the steps necessary to reproduce the issue:', true);
    const p3 = buildRprtPrompt('Please provide any additional helpful information:');
    return [p1, p2, p3];
}
function buildRprtPrompt(text, isRequired) {
    const lbl = buildPromptContainer(isRequired); 
    const span = _pg._util('buildElem', ['span', { text: text, class: 'bug-span' }]);
    const txt = _pg._util('buildElem', ['textarea', { class: 'bug-rprt-input' }]);
    $(lbl).append([span, txt]);
    return lbl;
}
function buildPromptContainer(isRequired) {
    const classes = 'bug-prompt' + (isRequired ? ' required' : '');  
    return _pg._util('buildElem', ['label', { class: classes }]);
}
/* ------ BUTTONS ----------------- */
function getReportBttns() {
    const cntnr = _pg._util('buildElem', ['div', { class: 'flex-row' }]);
    const spacer = _pg._util('buildElem', ['div', { class: 'flex-grow' }]);
    const sub = buildFormButton('Submit', submitBugRprt);
    const cncl = buildFormButton('Cancel', closeBugReportPopup);
    $(cntnr).append([spacer, sub, cncl]);
    return cntnr;
}
/** Returns a (submit or cancel) button */
function buildFormButton(action, onClick) {
    const attr = { id: 'rprt-'+action, class: 'ag-fresh', type: 'button', value: action}
    const bttn = _pg._util('buildElem', ['input', attr]);
    $(bttn).click(onClick);
    return bttn;
}
/* -------- SUBMIT REPORT -------------------- */
function submitBugRprt() {                                                      
    const ready = checkRequiredBugReportFields($('.bug-prompt.required'));
    if (!ready) { showReportStatus('Please fill all required fields.', 'red'); 
    } else { submitNewSentryIssue(); }
}
function checkRequiredBugReportFields($fields) { 
    let ready = true; 
    $fields.each((i, f) => { if (!$(f.children[1]).val()) { ready = false; } })
    return ready;
}
function submitNewSentryIssue() {
    const data = {
        summary: $('.bug-rprt-input')[0].value,
        steps: $('.bug-rprt-input')[1].value,
        etc: $('.bug-rprt-input')[0].value,
    };
    _pg.alertIssue('editorReport', data);
    updateBugReportUiAfterSubmit();
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
    const msg = _pg._util('buildElem', ['div', { class: 'rprt-status', text: text }]);
    $(msg).css({'color': color, 'margin-top': '1em'});
    return msg;
}
/* ------------- CLOSE REPORT POPUP ----------------- */
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