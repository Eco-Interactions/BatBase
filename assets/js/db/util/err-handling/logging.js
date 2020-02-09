/**
 *
 *
 * 
 */

let log = '';

extendConsoleAndErrLogs();

function extendConsoleAndErrLogs() {
    extendConsole()
    extendWindowOnError();
}
function extendConsole(argument) {
    const console = (function(orgCnsl) {
        return {
            mark: (text, ...params) => {
                const caller_line = (new Error).stack.split("\n")[2];
                orgCnsl.log(text, ...params);
                log += text + ' {' + JSON.stringify([...params]) + '} '+caller_line+"\n";
            }, 
            log: (text, ...params) => {  
                const caller_line = (new Error).stack.split("\n")[2];
                // orgCnsl.log('stack = %O', caller_line);
                orgCnsl.log(text, ...params, "\t\t\t\t" + caller_line);
                log += text;
            },
            info: (text, ...params) => {
                orgCnsl.info(text, ...params);
                log += text;
            },
            warn: (text, ...params) => {
                orgCnsl.warn(text, ...params);
                log += text;
            },
            error: (text, ...params) => {
                orgCnsl.error(text, ...params);
                log += text;
            }
        };
    }(window.console));
    window.console = console;
}
function extendWindowOnError() {
    window.onerror = function(message, url, linenumber) {
        log += "JavaScript error: [" + message + "] on line -" + 
                linenumber + "- for: " + url + "\n";
    }
}

export function getLogData() {
    return log;
}