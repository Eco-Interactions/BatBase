/**
 * Handles all notifications and reporting related to issues that occur throughout
 * the database search page. Submits new events to our bugb tracker, Sentry.
 *
 * Export
 *     alertIssue
 *     getErrMsgForUserRole
 *     showAlert
 *
 * TOC
 *     CREATE SENTRY EVENT
 *     ALERT USER
 */
import { _u } from '~util';
import { _filter, _table } from '~db';
/* =================== CREATE SENTRY EVENT ================================== */
/** Sends Error object to Sentry, issue tracker. */
export function reportErr(e) {
    Sentry.captureException(e);
}
/**
 * IssueTags {errDataKeys}:
 *     invalidDataKeyType {key, type}
 *     dataSyncFailure {fails} (no browser alert)
 *     facadeErr {module, caller, called, error(toString), errMsg}
 *     feedback { route, topic, feedback } (no browser alert)
 *     editorReport {summary, steps, etc, screenshots} (no browser alert)
 *     expectedDataNotFound {key}
 *     fetchIssue {url, responseText}
 *     noRcrdFound {id, entity} (no browser alert)
 *     TestIssue null (no browser alert)
 *     undefiendDataKey {key}
 *
 * TEMP ISSUE TAGS FOR BUG TRACKING
 */
export function alertIssue(tag, errData = {}) {                                 logAlertInDev(tag, errData);
    if ($('body').data('env') !== 'prod') { return; }                           console.log("       !!!alertIssue [%s] = %O", tag, errData);
    if (tag == 'editorReport') { return submitEditorIssue(errData); }
    setSentryDebugContext(errData);
    handleUserAlert(tag);
    Sentry.captureException(new SentryError(tag, errData));
}
function logAlertInDev(tag, errData) {
    try {
        _u('logInDevEnv', ['!!ALERT ISSUE [%s] = %O', tag, errData]);
    } catch (e) { /* When error occurs before module is fully loaded. */ }
}
function setSentryDebugContext(errData) {
    setBasicStateContext();
    setErrorContext(errData);
}
function setBasicStateContext() {
    if ($('body').data('this-url') !== '/search') { return; }
    const state = _table('tableState').get();
    const base = {focus: state.curFocus, view: state.curView};
    Sentry.setContext('filter_state', Object.assign(base, _filter('getFilterState')));
}
function setErrorContext (errData) {
    Sentry.setContext('error_data', errData);
}
/* ---------------- EDITOR ISSUE REPORT ------------------------------------- */
function submitEditorIssue(data) {
    setEditorReportContextData(data);
    Sentry.captureException(new SentryError('editorReport', data.summary));
}
function setEditorReportContextData(data) {
    Sentry.setExtra('1 Summary', data.summary);
    Sentry.setExtra('2 Steps to Reproduce', data.steps);
    Sentry.setExtra('3 Misc Info', data.etc);
    Sentry.setExtra('4 Screenshots', data.screenshots);
}
/* ------------------------ Sentry Error Object ----------------------------- */
/** Extends the Error object to add debug data for the error.  */
class SentryError extends Error {
  constructor(tag, debugData, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params)
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) { Error.captureStackTrace(this, SentryError); }
    // Custom debugging information
    this.name = tag
    // this.tag = tag;
    this.message = JSON.stringify(debugData);
  }
}
/* ------------------- ALERT USER ------------------------------------------- */
/**
 * IssueTags: alertHandler
 *     alertNoRcrdFound: noRcrdFoundInForms
 *     comboboxNotFound: showGeneralAlert
 *     dataSyncFailure: (handled in form validation code)
 *     editorReport: (handled in bug report form)
 *     expectedDataNotFound: showGeneralAlert
 *     facadeErr: showGeneralAlert
 *     fetchIssue: showGeneralAlert
 *     invalidDataKeyType: showGeneralAlert
 *     noRcrdFound: (handled at relevant points through the code)
 *     undefiendDataKey: showGeneralAlert
 *
 * TEMP ISSUE TAGS FOR BUG TRACKING
 */
function handleUserAlert(tag) {
    const silent = ['dataSyncFailure', '', 'noRcrdFound', 'TestIssue', 'editorReport'];
    if (silent.indexOf(tag) !== -1) { return; }
    const map = {
        alertNoRcrdFound: noRcrdFoundInForms,
        citeAuth: showGeneralFormAlert
    };
    if (tag in map) { map[tag]();
    } else { showGeneralAlert(); }
}
function noRcrdFoundInForms() {
    alert(`Expected record not found. Try reloading the page or ${getEditorErrMsg()}`);
}
function showGeneralAlert() {
    alert(`If you are using an adblocker, please disable.\n\n An error ocurred somewhere on the page. If error persists, try reloading the page or ${getErrMsgForUserRole()}`);
}
function showGeneralFormAlert() {
    alert(`If you are using an adblocker, please disable.\n\n An error ocurred somewhere on the form.\n\n Please do not submit new data. Try refreshing the page or ${getErrMsgForUserRole()}`);
}
function getErrMsgForUserRole() {
    const userRole = $('body').data('user-role');
    const msgs = { visitor: getVisitorErrMsg, user: getUserErrMsg };
    return msgs[userRole] ? msgs[userRole]() : getEditorErrMsg();
}
function getVisitorErrMsg() {
    return `contact us at info@batbase.org and let us know about the issue you are experiencing.`;
}
function getUserErrMsg() {
    return `contact us by Leaving Feedback on this page (in your user menu) and let us know about the issue you are experiencing.`;
}
function getEditorErrMsg() {
    return `send debug information:
> Open the browser logs: Open Chrome menu -> "More Tools" -> "Developer Tools".
> Once the panel loads and the "console" tab is displayed, select all log text and copy.
> Submit an Issue Report by clicking the far right blue button on the page options bar. Thank you!`;
}