$(function(){					var zl = zartEzLogger();
	var self = this;
	$('#masthead').data('bslider', self);
	var imagePath = $('#masthead').data('img-path');
	var fadeDur = 3500;
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
			ghostClass: 'site-name',
			msgCss: { 'font-size': '60px'},
			newImg: 'twobats.jpg',
			imgFade: {
					effects: oiFadeSet,
					initialInterval: 3500,					
					interval: 3500
				},
			msgPos:	{ top: 20, left: hMsgPad },
			msgSlide: {
						messageAnimationDirection: 'left',
						messageAnimationDuration:	800,
						messageAnimationMaxHorLength: 1000,
						messageAnimationMaxVerLength: 350
					}
		}, {	/* Step Two - array index 1 */
			msgTxt: 'An Online Database of<br>Bat Eco-Interactions',
			msgCss: { 'font-size': '36px', 'text-align': 'right'},
			ghostClass: 'site-desc',
			msgPos:	{ top: vMsgPad, right: hMsgPad },
			msgSlide: { messageAnimationDirection: 'right' }
		}, {	/* Step Three - array index 2 */
			msgTxt: 'This new image slider<br />has animated captions 3BLg',
			ghostClass: 'intro',
			imgFade: { interval: 3000 },
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
			ghostClass: 'bot-right',
			imgFade: { interval: 1000 }
		}, {	/* Step */
			msgTxt: '7BL',
			msgPos:	{ left: hMsgPad },
			fadeGhostClass: '.intro',
			fadeGroupNames: 'intro'
		}, {	/* Step */
			msgTxt: 'The image may change with the text 8BR',
			msgPos:	{ right: hMsgPad },
			newImg: 'cactusbat.jpg',
			imgFade: { interval: 2000 },
			fadeGhostClass: '.bot-right',
			fadeGroupNames: 'bot-right'
		}, {	/* Step */
			msgTxt: 'The image may chage while the text stays the same 9BRg',
			msgCss: { 'font-size': '24px' },
			ghostClass: 'bot-right'
		}, {	/* Step */
			msgTxt: '10BL',
			msgPos:	{ left: hMsgPad },
			newImg: 'inflower.jpg'
		}, {	/* Step */
			msgTxt: 'All the text can be removed and just images cycled 11BR',
			msgPos:	{ right: hMsgPad },
			fadeGhostClass: '.bot-right,.site-name,.site-desc',
			fadeGroupNames: 'bot-right, site-name, site-desc'
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
			ghostClass: 'top-left',
		},{	/* Step */
			msgTxt: '...or down from the top 16BR',
			msgPos:	{ bottom: vMsgPad, right: hMsgPad, 'text-align': 'right' },
			msgSlide: { messageAnimationDirection: 'down' }
		}, {	/* Step */
			msgTxt: '17BR',
			fadeGhostClass: '.top-left',
			fadeGroupNames: 'top-left',
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
		var dvdr = new Array(20).join('=');

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
			$('.step-btn').fadeTo(10, 0);			
		}

		function initStepPlayer(s) {	/* Called Once after beaver slider has initialized */
			s.playerStop();
			initStepData(s);											
			startStepAfterPause(s.step, s.step.pauseMs);
		}

		function initStepData(s) {										zl.al(arguments, 'init');
			s.step = stepObjs[1];										
			s.stepCnt = stepObjs.length;
			s.msgCtnr = $('.message-container');
			expandStepObjects(s.msgCtnr);					//			console.log('stepObjs = %O', stepObjs);
															//			console.table(stepObjs)
																		
		}


		function stepPlayerNext() {
			initStepThenWait(s);
		}

		function toggleAutoRun() {
			(autoRunning && stopAutoRun(s)) || startAutoRun(s);
		}

		function startAutoRun(s) {
			autoRunning = true;
			$('.step-btn').fadeTo(400, 0);
			$('#pause-btn').attr('src', imagePath + 'pause.png');
			startStepAfterPause(s.step, s.step.pauseMs);
		}

		function stopAutoRun(s) {										
			autoRunning = false;
			$('#pause-btn').attr('src', imagePath + 'play.png');
			$('.step-btn').fadeTo(400, 1);
			return true;
		}

		function stepPlayerPrev() {
			
		}

		function continueStep() {										zl.al(arguments, 'step-' + s.step.idx);
			var step = s.step;
			step.combinedCss && s.msgCtnr.css(step.combinedCss);
			step.msgPos && $.each(step.msgPos, setMsgPosConfig);
			hasMsgSlide(step) && setMsgSlide(step.msgSlide);
			(hasImg(step) && s.playerNext()) || s.animateCurrent();
		}					/* passes control to beaver slider, which will call nextStep when it's done */


		function setMsgPosConfig(attrName, attrVal) {					zl.al(arguments, 'step-' + s.step.idx);
			s.settings.structure.messages[attrName] = attrVal;
			delete s.settings.structure.messages[rvers(attrName)];		
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

		function nextStep(s) {		/* Called directly by slider in it's afterSlide event } s = slider object */
																		
			autoRunning && initStepThenWait(s);
		}

		function initStepThenWait(s) {									
			var step = setNextStep(s);
			startStepAfterPause(step, step.pauseMs);
		}

		function setNextStep(s) {										zl.al(arguments, 'step-' + s.step.idx, { 'slider': s });
			var step = s.step;											zl.al(arguments, 'step-' + s.step.idx, { 's.step': s.step });
			s.step = step.nextStep;									
			return s.step;
		}

		function startStepAfterPause(step, pauseDur) {					zl.al(arguments, 'step-' + step.idx);
			window.setTimeout(step.start, pauseDur);
		}

		function showGhost(nextAction) {								
			s.step.ghost.fadeTo(10, 1);
			s.msgCtnr.fadeTo(10, 0, nextAction);
			return true;
		}

		function visibleFade() {										zl.al(arguments, 'step-' + s.step.idx, s.step);
			s.step.fades.fadeTo(1000, 0, continueStep);
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

		function getSliderConfig(stepObjs, imagePath) {					zl.al(arguments, 'init');
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
			};/*  return obj literal									*/	

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
				function stepsWithImg(stepObjs) {
					return stepObjs.filter(function(step){ 
								return 'newImg' in step;
							})
				}
			}/*  getImgPaths 											*/

			function getColumn(ary, key) {
				return ary.map(function(item) {
							return item[key];
						});		
			}


			function getMsgs(stepObjs) {
				return getColumn(stepObjs, 'msgTxt');
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
			}/*  getAnimationConfig 									*/

		}/*  getSliderConfig 											*/
		










		
		function expandStepObjects(msgCtnr) {
			var stepCnt = stepObjs.length;
			var ghostHtml = getGhostHtml(msgCtnr);
			var $allGhosts = $();
			var fadeGroupSelections = {};
			$.each(stepObjs, expandStep);
			$.each(stepObjs, applyGhostCss);
			$allGhosts.fadeTo(5, .1, appendGhosts);

			function appendGhosts() {									zl.al(arguments, 'init');
				$("#masthead").append($allGhosts);
			}

			function applyGhostCss(stepIdx, step) {
				var css = step.prevStep.combinedCss;						zl.al(arguments, 'init', {'css': css, 'ghostHtml': ghostHtml });
				step.ghost && css && step.ghost.css(css);
			}
			
			function expandStep(stepIdx, step) {
				var nextIdx = (stepIdx + 1) < stepCnt ? (stepIdx + 1) : 0;
				var prevIdx = (stepIdx > 0 ? stepIdx : stepCnt) - 1;
				step.idx = stepIdx;
				step.nextStep = stepObjs[nextIdx];
				step.prevStep =  stepObjs[prevIdx];
				step.pauseMs = getPause(step);
				step.combinedCss = getCombinedMsgCss(step);
				step.ghost = getGhost(step);
				step.gFades = getGhostFades(step);
				step.fades = getFades(step);
				step.start = getStartFunc(step);

				function getStartFunc(step) {
					return step.ghost ? showGhost.bind(null, nextAction(step)) : nextAction(step);
				}

				function nextAction(step) {
					return step.fades ? visibleFade : continueStep;
				}

				function getPause(step) {
					return ('imgFade' in step && 'interval' in step) && step.imgFade.interval;
				}

				function getFades(step) {
					var $msgCtnrToFade = step.ghost ? false : $('.message-container');
					var $sel = $();
					$msgCtnrToFade && $sel.add($msgCtnrToFade);
					step.gFades && $sel.add(step.gFades);
					$sel.length === 0 && ($sel = false);
					return $sel;
				}

				function getCombinedMsgCss(step) {
					return hasEither(step) ? getCss(step) : false;

					function getCss(step) {
						return hasKey(step, 'msgPos') ? combineCss(step) : step.msgCss;
					}

					function combineCss(step) {
						var posCss = getPosCss(step);
						return  hasKey(step, 'msgCss') ? $.extend(posCss, step.msgCss) : posCss;
						
						function getPosCss(step) {
							var cssObj = {};
							$.each(step.msgPos, addCss);
							return cssObj;
							
							function addCss(attrName, attrVal) {
								cssObj[attrName] = attrVal + 'px';
								cssObj[rvers(attrName)] = 'auto';
							}
						}
					}
					
					function hasEither(step) {
						return hasKey(step, 'msgCss') || hasKey(step, 'msgPos');
					}
				}

				function getGhostFades(step) {
					return hasKey(step, 'fadeGroupNames') ? selectFades(step) : false;
				}

				function selectFades(step) {		 
					var fadeGroupNameAry = step.fadeGroupNames.split(',');
					return combineFades(fadeGroupNameAry) ;
					
					function combineFades(fadeGroupNameAry) {
						var $fadeSel = $();
						$.each(fadeGroupNameAry, addFade);
						return $fadeSel;
						
						function addFade(idx, fadeGroupName) {
							var $curSel = $fadeSel;
							var groupname = fadeGroupName.trim();
							var $newSel = fadeGroupSelections[groupname];
							fadeGroupSelections[groupname] = $();
							$fadeSel = $curSel.add($newSel);
						}						
					} /* end combineFades def */
				} /* end selectFades def */

				

				function getGhost(step) {
					return hasKey(step.prevStep, 'ghostClass') ? buildGhost(step.prevStep) : false;
				}

				function buildGhost(prevStep) {
					var msg = prevStep.msgTxt;
					var elem = $(ghostHtml);	
					var $newGhost = elem.html(msg);
					addToFadeGroup($newGhost, prevStep.ghostClass);			// TODO - Rename ghostClass to ghostGroup throughout
					$allGhosts = $allGhosts.add($newGhost);
					return $newGhost;
				}

				function addToFadeGroup($ghost, groupName) {
					hasKey(fadeGroupSelections, groupName) || addGroup(groupName);
					var $grpSelection = fadeGroupSelections[groupName];
					fadeGroupSelections[groupName] = $grpSelection.add($ghost);
				}

				function addGroup(groupName) {
					fadeGroupSelections[groupName] = $();
				}

				function hasKey(obj, key) {
					return key in obj;
				}

			} /* end expandStep def */

			function getGhostHtml(msgCtnr) {
				var msgDivStyle = msgCtnr.attr("style");
				return '<div class="msg-ghost" style="' + msgDivStyle + '">shell msg placeholder</div>';
			} 
		} /* end expandStepObjects def */
	}
});
