/**
 * Handles all notifications and reporting related to issues that occur throughout
 * the database search page. Submits new events to our bugb tracker, Sentry.
 *
 * EXPORTS:
 *     alertIssue
 *     initSentry
 *     getErrMsgForUserRole
 *     showAlert
 *
 * TOC:
 *     INIT SENTRY
 *     CREATE SENTRY EVENT
 *     ALERT USER
 */
import { _table, _u } from '../../db-pg/db-main.js';
import { ExtraErrorData } from '@sentry/integrations';

/* --------------------- INIT SENTRY ---------------------------------------- */
export function initSentry () {
    Sentry.init({
        dsn: 'https://e4208400b3414c6d85beccfd218e194f@sentry.io/2506194',
        integrations: [new ExtraErrorData()],
        blacklistUrls: ['copy.batbase.org', 'dev.batbase.org']
    });
    configureSentryUserData($('body').data('user-name'), $('body').data('user-role'));
}
function configureSentryUserData (userName, userRole) {
    Sentry.configureScope(scope => {
        scope.setUser({ username: userName, role: userRole });
    })
}
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
 *     editorReport {summary, steps, etc, screenshots} (no browser alert)
 *     expectedDataNotFound {key}
 *     fetchIssue {url, responseText}
 *     noRcrdFound {id, entity} (no browser alert)
 *     TestIssue null (no browser alert)
 *     undefiendDataKey {key}
 */
export function alertIssue(tag, errData = {}) {                                 _u('logInDevEnv', ['!!ALERT ISSUE [%s] = %O', tag, errData]);
    if ($('body').data('env') !== 'prod') { return; }                           console.log("       !!!alertIssue [%s] = %O", tag, errData);
    if (tag == 'editorReport') { return submitEditorIssue(errData); }
    setSentryDebugContext(errData);
    handleUserAlert(tag);
    Sentry.captureException(new SentryError(tag, errData));
}
function setSentryDebugContext(errData) {
    setBasicStateContext();
    setErrorContext(errData);
}
function setBasicStateContext() {
    if ($('body').data('this-url') !== '/search') { return; }
    const state = _table('tableState').get();
    const base = {focus: state.curFocus, view: state.curView};
    Sentry.setContext('filter_state', Object.assign(base, _table('getFilterState')));
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
 */
function handleUserAlert(tag) {
    const silent = ['dataSyncFailure', 'noRcrdFound', 'TestIssue', 'editorReport'];
    if (silent.indexOf(tag) !== -1) { return; }
    const map = {
        'alertNoRcrdFound': noRcrdFoundInForms
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