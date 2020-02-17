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
export function alertIssue(tag, errData) {                                      console.log("    !!!alertIssue [%s] = %O", tag, errData);
    // if ($('body').data('env') !== 'prod') { return; } //alertErr('rcrdNotFound: ['.errData.id.']'); }
    const debugData = buildDebugData(errData, tag);
    const err = new SentryError(tag, debugData);
    Sentry.captureException(err); console.log('err = %O', err)
    handleUserAlert(tag, debugData);
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
function handleUserAlert(tag, debugData) {
    // body...
}
export function showAlert(err) {                                                 console.log('err = %O', err);console.trace();
    if ($('body').data('env') === 'test') { return; }
    alert(`ERROR. Try reloading the page. If error persists, ${getErrMsgForUserRole()}`);
}
export function getErrMsgForUserRole() {
    const userRole = $('body').data('user-role');
    const msgs = { visitor: getVisitorErrMsg, user: getUserErrMsg };
    return msgs[userRole] ? msgs[userRole]() : getEditorErrMsg();
}
function getVisitorErrMsg() {
    return `please contact us at info@batplant.org and let us know about the issue you are experiencing.`;
}
function getUserErrMsg() {
    return `please contact us by Leaving Feedback on this page (from the user menu) and let us know about the issue you are experiencing.`;
}
function getEditorErrMsg() {
    return `please follow these steps and email Kelly. 
> Open the browser logs: Open Chrome menu -> "More Tools" -> "Developer Tools".
> Once the panel loads and the "console" tab is displayed, right click and save the log file.
> Email a description of the steps to reproduce this error and any additional information or screenshots that might help. Thanks!`;
}