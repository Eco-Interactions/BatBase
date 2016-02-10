$(function(){									var zl = zartEzLogger();
	var self = this;
	
	$('#masthead').data('bslider', self);
	var imagePath = $('#masthead').data('img-path');
	var autoRunning = true;
	var stepObjs = batsOiBsSliderStepObjs;
														
	self.init =  function() {
		var dvdr = new Array(20).join('=');

		var autoRunning = true;
		var stepGhosts = [];
		var fadedGhosts = [];
		var bsliderConfig = ECO_INT_FMWK.bSliderCfg;
		bsliderConfig.events = {
				afterInitialize: initStepPlayer,
				afterSlide: nextStep
			}; 										//	zl.al(arguments, 'pre-bs init');
		var s = new BeaverSlider(bsliderConfig);	//	zl.al(arguments, 'post-bs init');
		ECO_INT_FMWK.slider = s;
		var frames = expandStepObjects(s.msgCtnr);			console.log('new frames:%O', frames);
		s.frame = frames[1];
		initStepPlayerCtrls();
//		startStepAfterPause(s.step, s.step.pauseMs);

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
		}

		function initStepData(s) {								//		zl.al(arguments, 'init');
			s.step = stepObjs[1];										
			s.stepCnt = stepObjs.length;
			s.msgCtnr = $('.message-container');

//			frames[0].actions[0]();
			//		zl.al(arguments, 'inspect frames', { framesObj: frames});		
		}


		function stepPlayerNext() {
			incStepThenWait(s);
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

		function continueStep() {								//		zl.al(arguments, 'step-' + s.step.idx);
			var step = s.step;
			step.combinedCss && s.msgCtnr.css(step.combinedCss);
			step.msgPos && $.each(step.msgPos, setMsgPosConfig);
			hasMsgSlide(step) && setMsgSlide(step.msgSlide);
			(hasImg(step) && s.playerNext()) || s.animateCurrent();
		}					/* passes control to beaver slider, which will call nextStep when it's done */

		function nextStep(s) {		/* Called directly by slider in it's afterSlide event } s = slider object */
//			autoRunning && incStepThenWait(s);
			if (autoRunning) { s.frame.play }
		}

		function incStepThenWait(s) {									
			var step = setNextStep(s);
			startStepAfterPause(step, step.pauseMs);
		}

		function setNextStep(s) {								//		zl.al(arguments, 'step-' + s.step.idx, { 'slider': s });
			var step = s.step;									//		zl.al(arguments, 'step-' + s.step.idx, { 's.step': s.step });
			s.step = step.nextStep;		
			s.frame = s.frame.nxtFm;
			return s.step;
		}

		function startStepAfterPause(step, pauseDur) {			//		zl.al(arguments, 'step-' + step.idx);
			window.setTimeout(step.start, pauseDur);
		}

		function setMsgPosConfig(attrName, attrVal) {			//		zl.al(arguments, 'step-' + s.step.idx);
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

		function showGhost(nextAction) {								
			s.step.ghost.fadeTo(10, 1);
			s.msgCtnr.fadeTo(10, 0, nextAction);
			return true;
		}

		function visibleFade() {								//		zl.al(arguments, 'step-' + s.step.idx, s.step);
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
		
		/* ========================================================== */
		/* ========== step expander and pre-processor =============== */
		/* ========================================================== */
		
		function expandStepObjects(msgCtnr) {
			var stepCnt = stepObjs.length;
			var ghostHtml = getGhostHtml(msgCtnr);
			var $allGhosts = $();
			var fadeGroupSelections = {};
			$.each(stepObjs, expandStep);
			$.each(stepObjs, applyGhostCss);
//			$("#masthead").append($allGhosts);								TODO add autorun check - add frame increment

			return initFrames()
	
			function initFrames() {					// zl.al(arguments, 'init', stepObjs );
				var reverse = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
				var style = msgCtnr.attr("style");
				var $ghosts = $();
				var $ghostGrps = {};
				var frameSet = ECO_INT_FMWK.frameSet;
				var defPause = frameSet.defaults.pause;
				var rawFrames = frameSet.frames;
				var frameCnt = rawFrames.length;
				var newFrames = [];
				$.each(rawFrames, initFrame);
				$.each(newFrames, completeFrame);
				$("#masthead").append($ghosts);
				msgCtnr.css(newFrames[0].css);		console.log('msgCtnr:%O', msgCtnr);
				return newFrames;
				
				function completeFrame(frameIdx, newFrame) {
					var nextIdx = (frameIdx + 1) < frameCnt ? (frameIdx + 1) : 0;
					var prevIdx = (frameIdx > 0 ? frameIdx : frameCnt) - 1;
					var rFm = rawFrames[frameIdx];
					newFrame.ghost = getGhost();
					newFrame.actions = getActions();
					newFrame.nxtFm = newFrames[nextIdx];

					function getActions() { /* Add actions last to first for the frame */
						actions = [];
						var nxtActn = 'newImg' in rFm ? s.playerNext : s.animateCurrent;
						actions.push(nxtActn);
						if ('msgMov' in rFm) { addAction(setAnimCfg, 'msgMov', rFm.msgMov); }
						if ('msgMovDur' in rFm) { addAction(setAnimCfg, 'msgMovDur', rFm.msgMovDur); }
						if ('msgPosV' in rFm) { addAction(setMsgPosCfg, 'msgPosV', rFm.msgPosV); }
						if ('msgPosH' in rFm) { addAction(setMsgPosCfg, 'msgPosH', rFm.msgPosH); }
						if (newFrame.css) { addAction(setMsgCtnrCss, newFrame.css); }
						if ('fadeGrp' in rFm) { addAction(fadeGhosts, rFm.fadeGrp); }
						if ('ghostGrp' in rFm) { addAction(showGhost); }
						addAction(pauseThen, defPause);
						newFrame.play = nxtActn;
						return actions;

						function addAction(doFunc, attrVal, attrName) {
							var action = doFunc.bind(undefined, nxtActn, attrVal, attrName);
							nxtActn = action;
							actions.push(nxtActn);							
						}

						function pauseThen(then, pause) {
							return window.setTimeout.bind(undefined, then, pause);
						}

						function showGhost(then) {
							newFrame.ghost.fadeTo(10, 1);
							msgCtnr.fadeTo(10, 0, then);							
						}

						function fadeGhosts(then) {
							newFrame.fades.fadeTo(1000, 0, then);
						}

						function setMsgCtnrCss(then, css) {
							s.msgCtnr.css(css);
							then();	
						}

						function setMsgPosCfg(then, attrVal, attrName) {			//		zl.al(arguments, 'step-' + s.step.idx);
							s.settings.structure.messages[attrName] = attrVal;
							delete s.settings.structure.messages[reverse[attrName]];
							then();		
						}

						function setAnimCfg(then, attrVal, attrName) {
							var attrNames = {
									msgMov: 	'messageAnimationDirection',
									msgMovDur:	'messageAnimationDuration'
								};
							s.settings.animation[attrNames[attrName]] = attrVal;
							then();
						}

						function setCfgThen(setting, value, then) {
							setting = value;
							then();
						}
						
					}/* end getActions def */

					function getGhost() {
						var prvRawFm = rawFrames[prevIdx];
						var css = newFrames[prevIdx].css;
						return ('ghostGrp' in prvRawFm) ? buildGhost(prvRawFm.ghostGrp, prvRawFm.msgTxt, css) : false;

						function buildGhost(grpName, msg, css) {
							var $elem = $('<div class="msg-ghost" style="' + css + 'opacity: 0.1;' + '">' + msg + '</div>');
							if (!(grpName in $ghostGrps)) { $ghostGrps[grpName] = $(); }
							$ghostGrps[grpName] = $ghostGrps[grpName].add($elem);
							return $elem;
						} 
					}/* end getGhost def */					
				}/* end completeFrame def */		
				
				
				function initFrame(frameIdx, rFm) {	// zl.al(arguments, 'init frame-' + frame.idx, { 'frames': frames });
					newFrames.push({
							msg: rFm.msgTxt,
							css: getCss()
						});

					function getCss() {
						if ('msgCss' in rFm) { msgCtnr.css(rFm.msgCss); }
						if ('msgPosH' in rFm) { msgCtnr.css(getPosCss(rFm.msgPosH)); }
						if ('msgPosV' in rFm) { msgCtnr.css(getPosCss(rFm.msgPosV)); }
						return msgCtnr.attr("style");
						
						function getPosCss(attr) {
							var attrName = Object.keys(attr)[0];		
							var reverseName = reverse[attrName];
							var obj = {};
							obj[attrName] = attr[attrName] + 'px';
							obj[reverseName] = 'auto';
							return obj;
						}
					}/* end getCss def */
				}/* end initFrame def */					
			}/* end initFrames def */




			function applyGhostCss(stepIdx, step) {
				var css = step.prevStep.combinedCss;				//	zl.al(arguments, 'init', {'css': css, 'ghostHtml': ghostHtml });
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
					return ('msgCss' in step || 'msgCss' in step) ? getCss(step) : false;

					function getCss(step) {
						return ('msgPos' in step) ? combineCss(step) : step.msgCss;
					}

					function combineCss(step) {
						var posCss = getPosCss(step);
						return ('msgCss' in step) ? $.extend(posCss, step.msgCss) : posCss;
						
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
					$newGhost.fadeTo(1, .1);							
					
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

			function getGhostHtml() {
				
				var msgDivStyle = msgCtnr.attr("style");
				var ghostHtml = '<div class="msg-ghost" style="' + msgDivStyle + '">shell msg placeholder</div>';
				return '<div class="msg-ghost" style="' + msgDivStyle + '">shell msg placeholder</div>';
			} 

		} /* end expandStepObjects def */
	}
});
