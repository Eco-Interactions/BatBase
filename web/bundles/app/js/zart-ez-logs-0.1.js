function zartEzLogger() {
	var self = this;
	self.al = autoLog; /*   var zl = zartEzLogger();   to init, then:
								zl.al(arguments);
								zl.al(arguments, 'step-' + s.step.idx);     ...or
								zl.al(arguments, 'init', {'css': css, 'ghostHtml': ghostHtml });
							...to access
						*/
	return self;
	/* logging functions */
	function autoLog(argsObj, tag, snap) {
		var logObj = getLogObj(argsObj, tag, snap);	
		console.groupCollapsed(logObj.desc);
			logGroupDetails(logObj);
		console.groupEnd();
	}
	function logGroupDetails(logObj) {				
		logObj.params.group && logObjParams(logObj);
		logStackGroup(logObj.stack);
	}
	function logObjParams(logObj) {
		$.each(logObj.params.group, logObjParam);

		function logObjParam(name, obj) {
			console.log('%s %O', name, obj);
		}
	}
	function logStackGroup(stack) {
		console.groupCollapsed('stack');
			console.log('...as object %O', stack);
			console.table(stack);
		console.groupEnd();
	}
	/* arguments data parser */
	function getLogObj(argsObj, tag, snap) {
		tag = tag ? '[' + tag + ']' : '';
		var paramAry = Array.prototype.slice.call(argsObj);
		var regExp = /\(([^)]+)\)/;
		var paramNames = regExp.exec(argsObj.callee.toString())[1].split(', ');
		var stackObj = getOriginStack();
		var paramObj = stackObj.length > 0 ? getParamData(paramAry, paramNames, snap) : false;
		return { 
				desc: getGroupDesc(stackObj[0], paramObj, tag),
				stack: stackObj,
				params: paramObj,			
			 };
		function getOriginStack() {
			var stackAry = getStackAry();
			return stackAry.filter(notInThisFile);

			function notInThisFile(stackItem) {
				return stackItem.file !== 'zart-ez-logs-0.1.js';
			}			
			function getStackAry() {
				var obj = {};
				Error.captureStackTrace(obj, getOriginStack);
				var stackAry = obj.stack.split(' at ');
				stackAry.shift();
				return stackAry.map(parseStackItem);
				function parseStackItem(itemStr) {		
					var strAry = itemStr.split(' (');	
					strAry.length === 1 && strAry.unshift('<anonymous>');
					var origin = ((strAry[1].split(')')[0]).split('//')[1]).split(':');
					return {
						call: strAry[0],
						file: origin[0].split('/').pop(),
						line: Number(origin[1]),
						col: Number(origin[2]),
						path: origin[0]
						};
				}/*  parseStackItem */
			}/*  getStackAry 		*/
		}/*  getOriginStack 		*/
		function getGroupDesc(origin, paramObj, tag) {
			var paramAbrv = paramObj ? paramObj.abrv : '';
			var desc = [origin.file,'line',origin.line];
			tag !== '' && desc.push(tag);
			desc.push(origin.call);
			return desc.join(' ') + '(' + paramAbrv + ')'; 
		}
		function getParamData(paramAry, paramNames, snap) {	//	console.log('---- snap %O', snap);
			var paramObj = {};
			var keyValParams = {};
			var abrvsAry = [];
			var objParams = {};
			snap !== undefined && (objParams.snap = getSnap(snap));
			paramAry.forEach(parseParam); 
			paramObj.abrv = abrvsAry.join(', ');
			paramObj.all = keyValParams;
			paramObj.group = paramAry.length > 0 ? objParams : false;
			return paramObj;
			function getSnap(obj) {
				var cache = [];
				var objStr = JSON.stringify(obj, truncCirc);
				cache = null; // Enable garbage collection				
				return JSON.parse(objStr);
				function truncCirc(key, value) {
					var newVal = value;
					if (typeof value === 'object' && value !== null) {
						if (cache.indexOf(value) !== -1) {	// console.log('snap found circular reference to %O', value);
							return '<circular reference to ' + value.toString() + '>'; 
						}
						cache.push(value);
					}
					return value;					
				}
			}/*  getSnap	*/
			function parseParam(val, idx) {
				var name = paramNames[idx];
				keyValParams[name] = val;	
				(isScalar(val) && abrvVal()) || grpVal();	
				function abrvVal() {		
					var q = '';
					typeof val === 'string' && (q = '"');
					abrvsAry.push(name + '=' +  q + val + q);
					return true;
				}
				function grpVal() {	
					abrvsAry.push(name);
					objParams[name] = val;
				}
				function isScalar(val) {
					var t = typeof val;
					return (t === 'string' || t === 'boolean' || t === 'number' || t === 'undefined');
				}				
			}/*  parseParam	*/
		}/*  getParamData 	*/
	}/*  getLogObj 			*/
}/*  zartEzLogger 			*/
