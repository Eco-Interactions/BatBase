/**
 * Handles all notifications and reporting related to issues that occur throughout
 * the database search page. Submits new events to our bugb tracker, Sentry. 
 *
 * EXPORTS:
 *     alertIssue
 *     showAlert
 *     getErrMsgForUserRole
 *
 * TOC:
 *     CREATE SENTRY EVENT
 *     ALERT USER
 */
import { accessTableState as tState } from '../../db-pg/db-main.js';

/* ------------------- CREATE SENTRY EVENT ---------------------------------- */
/** Sends Error object to Sentry, issue tracker. */
export function reportErr(e) {
    Sentry.captureException(e);
}
/**
 * IssueTags {errDataKeys}:
 *     TestIssue null (no browser alert)
 *     undefiendDataKey {key}
 *     invalidDataKeyType {key, type}
 *     expectedDataNotFound {key}
 *     dataSyncFailure {fails} (no browser alert)
 *     fetchIssue {url, responseText}
 *     noRcrdFound {id, entity} (no browser alert)
 */
export function alertIssue(tag, errData = {}) {                                      
    if ($('body').data('env') !== 'prod') { return; }                           console.log("       !!!alertIssue [%s] = %O", tag, errData);
    const debugData = buildDebugData(errData, tag);
    const err = new SentryError(tag, debugData);
    Sentry.captureException(err); 
    handleUserAlert(tag);
}
function buildDebugData(errData, tag) {
    const data = buildBasicStateData();
    data.error = buildErrObj(errData, tag);
    return JSON.stringify(data, null, 4);
}
function buildBasicStateData() {
    const data = { user: $('body').data('user-name') };
    if ($('body').data('this-url') !== '/search') { return data; }
    const state = tState().get();
    return Object.assign(data, { 
        focus: state.curFocus, view: state.curView, userRole: state.userRole});
}
function buildErrObj(errData, tag) {
    const obj = {};
    Object.keys(errData).forEach(key => obj[key] = errData[key]);
    return obj;
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
    this.message = debugData;
  }
}
/* ------------------- ALERT USER ------------------------------------------- */
/**
 * IssueTags: alertHandler
 *     alertNoRcrdFound: noRcrdFoundInForms
 *     undefiendDataKey: showGeneralAlert
 *     invalidDataKeyType: showGeneralAlert
 *     expectedDataNotFound: showGeneralAlert
 *     dataSyncFailure: (handled in form validation code)
 *     fetchIssue: showGeneralAlert
 *     noRcrdFound: (handled at relevant points through the code)
 */
function handleUserAlert(tag) {
    const silent = ['dataSyncFailure', 'noRcrdFound', 'TestIssue'];
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
    alert(`An error ocurred somewhere on the page. If error persists, try reloading the page or ${getErrMsgForUserRole()}`);
}
function getErrMsgForUserRole() {
    const userRole = $('body').data('user-role');
    const msgs = { visitor: getVisitorErrMsg, user: getUserErrMsg };
    return msgs[userRole] ? msgs[userRole]() : getEditorErrMsg();
}
function getVisitorErrMsg() {
    return `contact us at info@batplant.org and let us know about the issue you are experiencing.`;
}
function getUserErrMsg() {
    return `contact us by Leaving Feedback on this page (in your user menu) and let us know about the issue you are experiencing.`;
}
function getEditorErrMsg() {
    return `send debug information: 
> Open the browser logs: Open Chrome menu -> "More Tools" -> "Developer Tools".
> Once the panel loads and the "console" tab is displayed, right click and save the log file.
> Email a description of the steps to reproduce this error and any additional information or screenshots that might help. Thanks!`;
}