/* ============ Debug Logging Function ================================= */

/* Use this function for quick and simple debug logging and include it
   in production code with the console.log line commented out to turn
   off logging completely without producing errors.                      */

/*
function logThis(helper, tag, msg) {
    console.log('%s from %s %s -> %O', tag, helper.menuName, msg, helper);
}
*/

/* Comment out the entire function above and uncomment the one below
   for detailed, configurable debug logging. Remove it and use the one
   above to reducefilesize for production.                              */

function logThis(helper, tag, msg, obj, hWaiting) {
    /* Comment or uncomment these tags to configure logging     */
		
    obj = obj || helper;
    var logTags = [
//        'init_complete',
        'wait_for_intent',
        'func_h',
        'func_h_w',
        'func_ary',
        'alert',
        'gen'
        ];
    var showHelperInfo = false;

    var logStrings = {
        init_complete:      helper.menuName + ' initialized ',
        wait_for_intent:    menuPrefix('waitForIntent') + '(' + msg + ') waiting helper = ' + obj.menuName ,
        func_h:				menuPrefix(msg) + '(h' + obj.menuName + ')',
        func_h_w:			menuPrefix(msg) + '(h' + obj.menuName + ') hWaiting = ' + waitingName(hWaiting),
        func_ary:			menuPrefix(msg) + ' = ' + getNames(obj),
        alert:				'!!! !!! -> ' + menuPrefix(msg) + ' <- !!! !!!',
        gen:				menuPrefix(msg)
        };

    if (loggingOn(tag)) {
        if (showHelperInfo) {
            console.log(logStrings[tag] + ' %O', helper);
        }  else {
            console.log(logStrings[tag]);
        }
    }

    function menuPrefix(methodStr) {
        return helper.menuName + '.' + methodStr;
    }

    function loggingOn(tag) {
        return ($.inArray(tag, logTags) > -1) ? true : false;
    }

    function nameStr(item, index, array) {
		return item.menuName;
	}

    function waitingName(hWaiting) {
		if (hWaiting !== null && hWaiting !== undefined) {
			return hWaiting.menuName;
		} else {
			return '<null>';
		}
	}
    
	function getNames(hAry) {
		if (hAry === null) {
			return '<null>';
		} else if (hAry === undefined) {
			return '<undefined>';
		} else if ($.isArray(hAry)) {
			if (hAry.length === 0) {
				return '[empty array]';
			} else {
			var names = hAry.map(nameStr);
			return '[' + names.join(', ') + ']';
			}
		} else {
			return '[not an array, undefined, or null]';
		}
    }

}        /*  End of function def for logThis  */
