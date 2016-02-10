$(function(){
	var self = this;
	$('#masthead').data('bslider', self);
	var imagePath = $('#masthead').data('img-path');
	var fadeDur = 500;
	var vMsgPad = 30;
	var hMsgPad = 58;
	var autoRunning = true;
	var oiFadeSet = [
		{name:"fade",duration:1000},
		{name:"chessBoardLeftUp",duration:fadeDur,size:20,steps:50},
		{name:"chessBoardLeftDown",duration:fadeDur,size:20,steps:50},
		{name:"chessBoardRightUp",duration:fadeDur,size:20,steps:50},
		{name:"chessBoardRightDown",duration:fadeDur,size:20,steps:50},
		{name:"jalousieLeft",duration:fadeDur,size:20,steps:50},
		{name:"jalousieRight",duration:fadeDur,size:20,steps:50},	
		{name:"jalousieUp",duration:fadeDur,size:20,steps:50},
		{name:"jalousieDown",duration:fadeDur,size:20,steps:50}
		];
	var stepObjs = [
		{	/* Step One - array index 0 */
			msgTxt: 'batplant.org',
			msgGhostClass: 'site-name',
			msgCss: { 'font-size': '60px'},
			newImg: 'twobats.jpg',
			imgFade: {
					effects: oiFadeSet,
					initialInterval: 500,					
					interval: 500
				},
			msgPos:	{ top: 20, left: hMsgPad },
			msgSlide: {
						messageAnimationDirection: 'left',
						messageAnimationDuration:	800,
						messageAnimationMaxHorLength: 1000,
						messageAnimationMaxVerLength: 350
					}
		}, {	/* Step Two - array index 1 */
			msgTxt: 'An Online Database of<br />Bat Eco-Interactions',
			msgCss: { 'font-size': '36px', 'text-align': 'right'},
			msgGhostClass: 'site-desc',
			msgPos:	{ top: vMsgPad, right: hMsgPad },
			msgSlide: { messageAnimationDirection: 'right' }
		}, {	/* Step Three - array index 2 */
			msgTxt: 'This new image slider<br />has animated captions 3BLg',
			msgGhostClass: 'intro',
			imgFade: { interval: 2000 },
			msgCss: { 'font-size': '24px', width: '', 'text-align': 'left'},
			msgPos:	{ bottom: vMsgPad, left: hMsgPad },
			msgSlide: { messageAnimationDirection: 'down' }
		}, {	/* Step Four - array index 3 */
			msgTxt: 'Text may appear in any corner 4BR',
			msgPos:	{ right: hMsgPad },
			msgCss: { 'font-size': '34px', width: '250px', 'text-align': 'right'},
		}, {	/* Step */
			msgTxt: 'New text can replace existing text 5BR',
		}, {	/* Step */
			msgTxt: 'A single block of text can be removed 6BRg',
			msgGhostClass: 'bot-right',
			imgFade: { interval: 100 }
		}, {	/* Step */
			msgTxt: '7BL',
			msgPos:	{ left: hMsgPad },
			fadeGhostClass: '.intro'
		}, {	/* Step */
			msgTxt: 'The image may change with the text 8BR',
			msgPos:	{ right: hMsgPad },
			newImg: 'cactusbat.jpg',
			imgFade: { interval: 1000 },
			fadeGhostClass: '.bot-right'
		}, {	/* Step */
			msgTxt: 'The image may chage while the text stays the same 9BRg',
			msgCss: { 'font-size': '24px' },
			msgGhostClass: 'bot-right'
		}, {	/* Step */
			msgTxt: '10BL',
			msgPos:	{ left: hMsgPad },
			newImg: 'inflower.jpg'
		}, {	/* Step */
			msgTxt: 'All the text can be removed and just images cycled 11BR',
			msgPos:	{ right: hMsgPad },
			fadeGhostClass: '.bot-right,.intro,.site-name,.site-desc'
		}, {	/* Step */
			msgTxt: '12BR',
			newImg: 'twobats.jpg',
		}, {	/* Step */
			msgTxt: '13BR',
			newImg: 'cactusbat.jpg',
		}, {	/* Step */
			msgTxt: 'Text May Slide in from the left or right 14BR',
			msgPos:	{ bottom: 55, 'text-align': 'right' },
			msgSlide: { messageAnimationDirection: 'right' }
		}, {	/* Step */
			msgTxt: 'It can also slide up from the bottom...15TL',
			msgSlide: { messageAnimationDirection: 'up' },
			msgPos:	{ top: vMsgPad, left: hMsgPad, 'text-align': 'left' },
			msgGhostClass: 'top-left',
		},{	/* Step */
			msgTxt: '...or down from the top 16BR',
			msgPos:	{ bottom: vMsgPad, right: hMsgPad, 'text-align': 'right' },
			msgSlide: { messageAnimationDirection: 'down' }
		}, {	/* Step */
			msgTxt: '17BR',
			fadeGhostClass: '.top-left',
			msgCss: { width: '' },
		}, {	/* Step */
			msgTxt: '18BR',
		}, {	/* Step */
			msgTxt: '19BR',
		}, {	/* Step */
			msgTxt: '20BR',
		}
	];
	
	self.init =  function() {

		var autoRunning = true;
		var stepGhosts = [];
		var fadedGhosts = [];
		var s = new BeaverSlider(getSliderConfig(stepObjs, imagePath));
		initStepPlayerCtrls();
		return s;

		function initStepPlayerCtrls() {
			$('#pause-btn').on("click", toggleAutoRun);
			$('#next-btn').on("click", stepPlayerNext);
			$('#prev-btn').on("click", stepPlayerPrev);
			$('.step-btn').fadeTo(400, 0);			
		}

		function stepPlayerNext() {
			console.log('stepPlayerNext');
			initStepThenWait(s);
		}

		function toggleAutoRun() {
			console.log('toggleAutoRun');
			(autoRunning && stopAutoRun(s)) || startAutoRun(s);
		}

		function startAutoRun(s) {
			console.log('AutoRun on');
			autoRunning = true;
			$('.step-btn').fadeTo(400, 0);
			$('#pause-btn').attr('src', imagePath + 'pause.png');
			startStepAfterPause(s, s.stepIdx, s.stepInterval);
		}

		function stopAutoRun(s) {
			console.log('AutoRun off');
			autoRunning = false;
			$('#pause-btn').attr('src', imagePath + 'play.png');
			$('.step-btn').fadeTo(400, 1);
			return true;
		}

		function initStepPlayer(s) {	/* Called Once after beaver slider has initialized */
			s.playerStop();
			initStepData(s);
			startStepAfterPause(s, s.stepIdx, s.stepInterval);
		}

		function initStepData(s) {
			s.stepIdx = 1;
			s.stepCnt = stepObjs.length;
			s.stepInterval = stepObjs[0].imgFade.interval;
			s.ghostClass = 'msgGhostClass' in stepObjs[0] ? stepObjs[0].msgGhostClass : false;
			s.msgCtnr = $('.message-container');
		}

		function stepPlayerPrev() {
			var curIdx = s.stepIdx;
			
		}

		function continueStep() {
			var step = stepObjs[s.stepIdx];
			hasCss(step) && setMsgCss(step);
			hasMsgSlide(step) && setMsgSlide(step.msgSlide);
			(hasImg(step) && s.playerNext()) || s.animateCurrent();
		}					/* passes control to beaver slider, which will call nextStep when it's done */

		function nextStep(s) {		/* Called directly by slider in it's afterSlide event } s = slider object */
										//				var logmsg = autoRunning ? 'autoRunning ON, calling initStepThenWait and starting step' : 'autoRunning OFF, stopping';
										//				console.log('st-%s nextStep called by bslider. ' + logmsg + ' | step = %s', s.stepIdx, JSON.stringify(stepObjs[s.stepIdx]));
			autoRunning && initStepThenWait(s);
		}

		function initStepThenWait(s) {
			s.stepIdx = getNextStepIdx(s, true);				//			console.log('st-%s START ===============================', s.stepIdx);
			hasImgFadeInterval() && setStepInterval();
			startStepAfterPause(s, s.stepIdx, s.stepInterval);
		}

		function startStepAfterPause(s, stepIdx, pauseDur) {
																		// console.log('startStepAfterPause started timer for %s ms', pauseDur);
			window.setTimeout(startStep, pauseDur, s, stepIdx);
		}

		function startStep(s, stepIdx) {				//			console.log('startStep passed stepIdx %s', stepIdx);
			var step = stepObjs[stepIdx];
			(hasGhostClass() && addGhost(step)) || visibleFade();
		}

		function addGhost(step) {
			var afterGhost = hasFadeClass(step) ? visibleFade : continueStep;
			var $ghost = getAndAppendGhost();
			$ghost.fadeTo(10, 1);
			s.msgCtnr.fadeTo(10, 0, afterGhost);
			return true;
		}

		function ghostCached() {
			return s.stepIdx in stepGhosts;
		}

		function getAndAppendGhost() {
												//		console.log('getAndAppendGhost and ghostCached returning %s', ghostCached());
			var $ghost = ghostCached() ? stepGhosts[s.stepIdx] : createGhost();
												//		console.log('getAndAppendGhost running and stepGhosts = %O', stepGhosts);
			$("#masthead").append($ghost);
			return $ghost;
		}

		function createGhost() {
			var thisMsg = s.settings.content.messages[s.currentMessage];
			var msgDivStyle = s.msgCtnr.attr("style");
			var $ghost = $('<div class="msg-ghost ' + s.ghostClass + '" style="' + msgDivStyle + '">' + thisMsg + '</div>');
			stepGhosts[s.stepIdx] = $ghost;
			return $ghost;
		}

		function visibleFade() {
			var step = stepObjs[s.stepIdx];
			var $sel = hasGhostClass() ? $(step.fadeGhostClass) : msgsToFade(step);
			var afterFade = hasFadeClass(step) ? detachGhosts : continueStep;
			$sel.fadeTo(1000, 0, afterFade);
		}	

		function msgsToFade(step) {
			return hasFadeClass(step) ? $(step.fadeGhostClass).add('.message-container') : $('.message-container');
		}

		function detachGhosts() {
			var idx = s.stepIdx;
			var step = stepObjs[idx];
			var $fadeGhosts = $(step.fadeGhostClass);
			fadesCached(idx) || cacheFadedGhosts(idx, $fadeGhosts)
			$fadeGhosts.detach();
														//					console.log('fadedGhosts = %O', fadedGhosts);
			continueStep(idx);
		}

		function fadesCached(idx) {
			return idx in fadedGhosts;
		}

		function cacheFadedGhosts(idx, $fadeGhosts) {
			fadedGhosts[idx] = $fadeGhosts;
		}

		function hasGhostClass() {
			return s.ghostClass;
		}

		function hasFadeClass(step) {
			return 'fadeGhostClass' in step;
		}

		function setMsgCss(step) {
			var cssObj = getCssObjs(step);
			s.msgCtnr.css(cssObj);
		}

		function getCssObjs(step) {
			return hasMsgPos(step) ? cssWithUpdatedPos(step) : step.msgCss;
		}

		function cssWithUpdatedPos(step) {
			var posCss = cssForUpdatedPos(step.msgPos);				console.log('st-%s posCss = %s', s.stepIdx, JSON.stringify(posCss));
			return hasCustomCss(step) ? $.extend(posCss, step.msgCss) : posCss;
		}

		function cssForUpdatedPos(msgPos) {
			var cssAry = $.map(msgPos, setConfigReturnCss);
																	console.log('st-%s msg config set | messages = %s', s.stepIdx, JSON.stringify(s.settings.structure.messages));
			return flattenCss(cssAry);
		}

		function flattenCss(cssAry) {
			var cssObj = cssAry.pop();
			return cssAry.length ? $.extend(cssObj, cssAry.pop()) : cssObj;
		}

		function setConfigReturnCss(attrVal, attrName) {
			setMsgPosConfig(attrVal, attrName);
			return getMsgCssObj(attrVal, attrName);
		}

		function setMsgPosConfig(attrVal, attrName) {
			s.settings.structure.messages[attrName] = attrVal;
			delete s.settings.structure.messages[rvers(attrName)];
																		console.log('st-%s setMsgPosConfig set %s = %s', s.stepIdx, attrName, attrVal);
		}

		function getMsgCssObj(attrVal, attrName) {
			var cssObj = {};
			cssObj[attrName] = attrVal + 'px';
			cssObj[rvers(attrName)] = 'auto';
			return cssObj;		
		}

		function rvers(str) {
			oppsits = {
				left: 'right',
				right: 'left',
				top: 'bottom',
				bottom: 'top'
				};
			return oppsits[str];
		}

		function hasCss(step) {
			return hasCustomCss(step) || hasMsgPos(step);
		}

		function hasCustomCss(step) {
			return 'msgCss' in step;
		}

		function hasMsgPos(step) {
			return 'msgPos' in step;
		}

		function hasMsgSlide(step) {
			return 'msgSlide' in step;
		}

		function setMsgSlide(msgSlide) {
			$.each(msgSlide, setMsgSlideAttr);
		}

		function setMsgSlideAttr(attrName, attrVal) {
			s.settings.animation[attrName] = attrVal;
		}

		function hasImg(step) {
			return 'newImg' in step;
		}

		function setStepInterval() {
			s.stepInterval = stepObjs[s.stepIdx].imgFade.interval;
		}

		function hasImgFadeInterval() {
			var stepHasImgFade = 'imgFade' in stepObjs[s.stepIdx];
			return stepHasImgFade && 'interval' in stepObjs[s.stepIdx].imgFade;		
		}

		function getNextStepIdx(s, reverse) {
			s.ghostClass = 'msgGhostClass' in stepObjs[s.stepIdx] ? stepObjs[s.stepIdx].msgGhostClass : false;
			var nxtIdx = s.stepIdx + 1;				console.log('st-%s getNextStepIdx returning new idx of %s', s.stepIdx, nxtIdx);
			return nxtIdx < s.stepCnt ? nxtIdx : 0;
		}

		function getSliderConfig(stepObjs, imagePath) {
			var firstStep = stepObjs[0];
			
			return {
				type: "slider",
				structure: {
					container: {
						id: "masthead",
						width: 1500,
						height: 423
					},
					messages: getMsgConfig(firstStep)
				},
				content: {
					images: getImgPaths(stepObjs, imagePath),
					messages: getMsgs(stepObjs)
				},
				animation: getAnimationConfig(firstStep),
				events: {
					afterInitialize: initStepPlayer,
					afterSlide: nextStep
				}
			};
		}
		
		function getAnimationConfig(firstStep) {
			var cfgObj = {
					waitAllImages: true,
					changeSameMessage: false,
					showMessages: "simple",
					changeMessagesAfter: 1
				};
			$.extend( cfgObj, firstStep.msgSlide, firstStep.imgFade );
			return cfgObj;
		}

		function getMsgConfig(firstStep) {
			var cfgObj = JSON.parse(JSON.stringify(firstStep.msgPos));
			cfgObj.containerClass = "message-container";
			return cfgObj;
		}

		function getImgPaths(stepObjs, imagePath) {
			var imgfiles = getColumn(stepsWithImg(stepObjs), 'newImg');
			return imgfiles.map(function(item) {
						return imagePath + item;
					});
		}

		function getMsgs(stepObjs) {
			return getColumn(stepObjs, 'msgTxt');
		}

		function getColumn(ary, key) {
			return ary.map(function(item) {
						return item[key];
					});		
		}

		function stepsWithImg(stepObjs) {
			return stepObjs.filter(function(step){ 
						return 'newImg' in step;
					})
		}			
	}
});
