/**
 *
 *
 * 
 */
import { accessTableState as tState } from '../../db-main.js';
import * as _err from './err-main.js';

export function reportErr(errTag, errData) {                                    console.log("#########- REPORT ERROR- [%s] = %O", errTag, errData);
    if ($('body').data('env') == 'dev') { return; } //alertErr('rcrdNotFound: ['.errData.id.']'); }
    const reportError = {
        'noRcrd': handleRecordNotFound
    };
    return reportError[errTag](errData);
}
/**
 * Note: no return value expected
 */
function reportRecordNotFound(errData) {
    const jsonDebugData = buildDebugData(errData.id);
    sendEmailToDeveloper(jsonDebugData);
}

function buildDebugData(errData) {
    const tblState = tState().get();
    const data = buildBasicStateData(tblState);
    data.error = { type: 'rcrdNotFound', id: errData.id, entity: errData.entity };
    return JSON.stringify(data, null, 4);
}

function sendEmailToDeveloper(jsonDebugData) {                                  console.log('       --sendEmailToDeveloper = ', jsonDebugData)
    // body...
}


/* --------------------------- SHARED --------------------------------------- */

function buildBasicStateData(tblState) {
    return {
        focus: tableState.curFocus,         view: tblState.curView,
        user: $('body').data('user-name'),  userRole: tblState.userRole,
        logs: _err.getLogData()
        //browser/computer information?
    }
}



export function alertErr(err) {                                                 console.log('err = %O', err);console.trace();
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