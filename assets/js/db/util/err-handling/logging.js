/**
 *
 *
 * 
 */

const log = '';

window.onerror = function(message, url, linenumber) {
    log += "JavaScript error: [" + message + "] on line -" + 
            linenumber + "- for: " + url + "\n";
}

export function logToConsole(msg) {
    console.log(...arguments);
    log += msg + "\n";
}

export function getLogData() {
    return log;
}