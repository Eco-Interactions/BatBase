/**
 * Error handling throughout the database search page.
 *
 * EXPORTS:
 *     handleErr
 *     alertErr
 *     getErrMsgForUserRole
 *
 * TOC:
 *     ERROR HANDLING
 *     ERROR REPORTING
 */
import * as _hndl from './handling.js';
import * as _rprt from './reporting.js';
import * as _logs from './logging.js';

/* ----------------------- LOGS --------------------------------------------- */
export function logToConsole() {
    _logs.logToConsole(...arguments);    
}
export function getLogData() {
    return _logs.getLogData();
}
/* -------------------- ERROR HANDLING -------------------------------------- */
// export function handleErr() {
//     return _hndl.handleErr(...arguments);
// }
/* ------------------- ERROR REPORTING -------------------------------------- */
export function reportErr() {
    return _rprt.reportErr(...arguments);
}
export function alertErr() {                                                    
    return _rprt.alertErr(...arguments);
}
export function getErrMsgForUserRole() {                                                 
    return _rprt.getErrMsgForUserRole(...arguments);
}