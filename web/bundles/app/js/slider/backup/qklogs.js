function zartEzLogger () {
	var self = this;
	self.al = autoLog;
	
	return self;
	
	function autoLog(argsObj) {
		console.groupCollapsed(getGroupDesc(argsObj));
		logGroupDetails(argsObj);
		console.groupEnd();
	}
	
	function getGroupDesc(argsObj) {
		return 'Test description'
	}

	function logGroupDetails(argsObj) {
		console.log('originData:%O:', getOriginData(argsObj));
	}

	function getOriginData(argsObj) {
		var stackAry = getStackAry(argsObj);	console.log('stackAry:%O:', stackAry);
													
//		var realStackLine = JSON.stringify(obj.stack).split(' at ')[1];	console.log('realStackLine:%s:', realStackLine);
//		var logOrigin = realStackLine.split('/').pop().split(':');
		return {
//			fileName: logOrigin[0],
			funcName: argsObj.callee.name,
//			lineNum: logOrigin[1],
//			params: getParamData(argsObj)
			};
	}

	function getStackAry(argsObj) {
		var obj = {};
		Error.captureStackTrace(obj, getOriginData);		// console.log('capturedStack:%s:', obj.stack);
		var stackAry = obj.stack.split(' at ');
		stackAry.shift();
		return stackAry.map(parseStackItem);
	}

	function parseStackItem(itemStr) {
		var strAry = itemStr.split(' (');
		var origin = ((strAry[1].split(')')[0]).split('//')[1]).split(':');
		return {
			call: strAry[0],
			file: origin[0].split('/').pop(),
			line: origin[1],
			col: origin[2],
			path: origin[0]
			};
	}

	function getParamData(argsObj) {
		varParamNames = '';
		var paramAry = [];
		$.each(argsObj, addParam);
		
	}

	function getParamNames(argsObj) {
		var regExp = /\(([^)]+)\)/;
		var fParams = regExp.exec(argsObj.callee.toString());
		return fParams[1];
	}

	function xxx(argsObj) {
	}


	
}





/* 		qkLog(cfargs, optStr) 
call with:

qkLog(arguments, '');	for a simple one line log with the name of the function called. Log will look like "functionFooName called"
qkLog(arguments, 'g');	
 */

function qkLog(cfargs, optStr) {
	(optStr === '' && simple(cfargs)) || logDetails(cfargs, optStr);
	
	function logDetails(cfargs, optStr) {								
		optStr.charAt(0) === 'g' && qkLogGroup(cfargs, optStr);
		
		function qkLogGroup(cfargs, optStr) {
			console.groupCollapsed(getLocStr(cfargs));
			qkLogGroupContent(cfargs, optStr);
			console.groupEnd();
		}
		
		function qkLogGroupContent(cfargs, optStr) {
			optStr.charAt(1) === '' && logDfltGrpDetails(cfargs);
		}
		
		function logDfltGrpDetails(cfargs) {
//			showStep && console.log('step: %O', showStep);
//			var logCalledFromFuncName = cfargs.callee.toString().match(/function ([^\(]+)/)[1];
			console.log('cfargs = %O', cfargs);
			if (cfargs.length > 0) {
//				console.log('fName = %s and getParamNames = "%s"', cfargs.callee.name, getParamNames(cfargs));
			}
			
			console.log('cfargs.callee.toString() = %s', cfargs.callee.toString());
//			var firstLine = theString.split('\n')[0];
			
			
			
			
			
//			var myFunctionPtr = eval(logCalledFromFuncName);
//			console.log('myFunctionPtr.toString() = %s', myFunctionPtr.toString());

			(cfargs.length > 0 && logArgsSnapshot(cfargs)) || console.log('no params');
			console.trace('strack trace');
		}
		
		function logArgsSnapshot(cfargs) {
			console.groupCollapsed('params');
			$.each(cfargs, logParams);
			console.groupEnd();
			return true;
			
			function logParams(key, val) {
				isScalar(val) && console.log('%s is scalar = %s', key, JSON.stringify(val));
				!isScalar(val) && console.log('%s is not scalar | %s = %O', key, key, val);
			}
/*
			var indentStr = JSON.stringify(cfargs, null, 4);
			var whitelist = ['step', 'stepIdx', 'attrName', 'attrVal'];
			var filteredStr = JSON.stringify(cfargs, whitelist, 4);
			var argStr = JSON.stringify(cfargs);
			var argObj = JSON.parse(argStr);
			var args = {asObj: argObj, asStr: indentStr};
			console.log('raw arguments = %O', cfargs);
			console.log('arg cout = %s', argCnt);
			console.log('arguments = %O', args);
			console.log('argStr = %s', indentStr);		*/
		}
	}

	function isScalar(val) {
		var t = typeof val;
		return (t === 'string' || t === 'boolean' || t === 'number' || t === 'undefined');
	}
	

	
	function simple(cfargs) {
		console.log('%s called', cfargs.callee.toString().match(/function ([^\(]+)/)[1]);
		return true;
	}
	
	
	
	function getLocStr(cfargs) {
		var obj = {};
		Error.captureStackTrace(obj, qkLog);
		var realStackLine = JSON.stringify(obj.stack).split(' at ')[1];
		var logOrigin = realStackLine.split('/').pop().split(':');
		var originFuncName = cfargs.callee.toString().match(/function ([^\(]+)/)[1];
		var originFileName = logOrigin[0];
		var lineNum = logOrigin[1];
		var paramStr = cfargs.length === 0 ? '' : formatParams(cfargs);
		return originFileName + ' ln ' + lineNum + ' ' + originFuncName + '(' + paramStr +')';
		
		function formatParams(cfargs) {
			var paramsStr = [];
			$.each(cfargs, fmtParam);
			return paramsStr.join(', ');
			
			function fmtParam(key, val) {
				var t = typeof val;
				var isScalar = (t === 'string' || t === 'boolean' || t === 'number' || t === 'undefined');
				if (isScalar) {
					paramsStr.push(val);
				} else if ('settings' in val && val.settings.type === 'slider') {
					paramsStr.push('s');
				} else if ('nextStep' in val ) {
					paramsStr.push('step-' + val.idx);
					showStep = val;
				} else {
//					var dvdr = new Array(40).join('=');
//					console.log('%c %s Aboout to stringify %O:', 'color: Magenta;', dvdr, val);
					paramsStr.push(JSON.stringify(val));
				}
				
			}
		}

		
		
		
	}
}

function checkLog(msgStr) {
	var dvdr = new Array(40).join('=');
	console.log('%c %s %s', 'color: Brown;', dvdr, msgStr);	
}

function divLine(msgStr, color) {
	var dvdr = new Array(40).join('=');
	console.log('%c %s %s %s', 'color: ' + color + ';', dvdr, msgStr, dvdr);
}

function objLog(msgStr, obj) {
	var dvdr = new Array(30).join('=');
	console.log('%c %s %s:%O', 'color: Green;', dvdr, msgStr, obj);
}





// arguments.callee.toString().match(/function ([^\(]+)/)[1]

// arguments.callee.displayName

/* 

	function getContextDetails(cfargs) {
		var obj = {};
		Error.captureStackTrace(obj, qkLog);
		var logOrigin = obj.stack.split('/').pop().split(':');
		var originFuncName = cfargs.callee.toString().match(/function ([^\(]+)/)[1];
		var originFileName = logOrigin[0];
		var realStackLine = JSON.stringify(obj.stack).split(' at ')[1];
		var realOrigin = realStackLine.split('/').pop().split(':');
		var realFileName = realOrigin[0];
		var lineNum = logOrigin[1];
		return {
			rlName: realFileName,
			wholeStack: obj.stack,
			stackAsStr: JSON.stringify(obj.stack),
			stackAsAry: JSON.stringify(obj.stack).split(' at '),
			origin: logOrigin,
			fileName: logOrigin[0],
			lineNum: logOrigin[1],
			funcName: originFuncName
			};
	}

*/
