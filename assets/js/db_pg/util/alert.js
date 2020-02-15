/**
 * Handles all notifications and reporting related to issues that occur throughout
 * the database search page. Submits new events to our bugb tracker, Sentry. 
 *
 * EXPORTS:
 *     handleErr
 *     showAlert
 *     getErrMsgForUserRole
 *
 * TOC:
 *     ERROR HANDLING
 *     GENERAL ISSUE ALERTS
 *     ALERT USER
 *     ALERT SENTRY
 */
import { accessTableState as tState } from '../db-main.js';

/* ---------------------- ERROR ALERT --------------------------------------- */
export function alertErr(e) {
    // actual error object only
    // triggerSentryEvent();
}
/* ------------------- GENERAL ISSUE ALERTS --------------------------------- */
export function alertIssue(errTag, errData) {                                    console.log("#########- REPORT ERROR- [%s] = %O", errTag, errData);
    if ($('body').data('env') == 'dev') { return; } //alertErr('rcrdNotFound: ['.errData.id.']'); }
    const issueAlertor = {
        'noRcrd': handleRecordNotFound
    };
    return issueAlertor[errTag](errData);
}
/**
 * Note: no return value expected
 */
function reportRecordNotFound(errData) {
    const jsonDebugData = buildDebugData(errData.id);
    triggerSentryEvent(jsonDebugData);
}

function buildDebugData(errData) {
    const tblState = tState().get();
    const data = buildBasicStateData(tblState);
    data.error = { type: 'rcrdNotFound', id: errData.id, entity: errData.entity };
    return JSON.stringify(data, null, 4);
}
/* ------------------- ALERT USER ------------------------------------------- */
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
/* ----------------------- ALERT SENTRY ------------------------------------- */
function buildBasicStateData(tblState) {
    return {
        focus: tableState.curFocus,         view: tblState.curView,
        user: $('body').data('user-name'),  userRole: tblState.userRole,
        //browser/computer information?
    }
}