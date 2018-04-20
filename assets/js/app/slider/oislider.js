$(function(){	/* framePlayer object */								//			var zl = zartEzLogger();
	var player = {};  
	ECO_INT_FMWK.framePlayer = player;
	player.init =  function() {
		player.curFrame = null;
		var hideSlider = $('#masthead').data('hide-slider') ? true : false;
		if (!hideSlider) {
			var imagePath = getImagePath();  
			var autoRunning = true;
			var bSlider = new BeaverSlider(getSliderCfg());					//	zl.al(arguments, 'post-bs init');
			var $msgContainer = $('.message-container');
			var frames = initFrames();										//	console.log('new frames:%O', frames);
			ECO_INT_FMWK.slider = bSlider;									//	console.log('player.curFrame:%O', player.curFrame);
			initFramePlayerCtrls();
			nextFrame();
		}
		function getImagePath() {
			var imageUrl = $('#masthead').data('img-path').split("/");
			var cacheQuery = imageUrl.splice(imageUrl.length-1, 1);
			return imageUrl.join('/') + '/';
		}
		function getSliderCfg() {	/* Function Defs are in this scope so Pointers are passed to events from here */
			var bSliderConfig = ECO_INT_FMWK.bSliderCfg; 
			bSliderConfig.events = {};
			bSliderConfig.events.afterInitialize = initFramePlayer;	/* initFramePlayer is internal function of framePlayer */
			bSliderConfig.events.afterSlide = autoNextFrame; /* autoNextFrame is internal function of framePlayer */
			return bSliderConfig;
		}

		function initFramePlayerCtrls() {
			$('#pause-btn').on("click", toggleAutoRun);
			$('#next-btn').on("click", nextFrame);
			$('#prev-btn').on("click", prevFrame);
			$('.step-btn').fadeTo(10, 0);
		}

		function initFramePlayer(slider) {	/* Called Once after beaver slider has initialized */
			slider.playerStop();
		}

		function toggleAutoRun() {
			if (autoRunning) {
				setAutoRun(false, 1, 'play.png');
			} else {
				setAutoRun(true, 0, 'pause.png');
			}
		}

		function setAutoRun(isOn, btnOpaq, img) {
			autoRunning = isOn;
			$('.step-btn').fadeTo(400, btnOpaq);
			$('#pause-btn').attr('src', imagePath + img);
			nextFrame();
		}

		function autoNextFrame() {		/* Called directly by slider in it's afterSlide event } s = slider object */
			if (autoRunning) { nextFrame(); }
		}

		function nextFrame() { player.curFrame.play(); }

		function prevFrame() { player.curFrame.rwind(); }

		/* ========================================================== */
		/* ========== step expander and pre-processor =============== */
		/* ========================================================== */

		function initFrames() {
			var reverse = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
			var style = $msgContainer.attr("style");
			var $ghostTemplate = $('<div style="' + style + '">never displays</div>');
			var $ghosts = $();
			var $ghostGrps = {};
			var frameSet = ECO_INT_FMWK.frameSet;
			var defPause = frameSet.defaults.pause;
			var rawFrames = frameSet.frames;
			var frameCnt = rawFrames.length;
			var newFrames = [];
			$.each(rawFrames, expandRawFrame);
			$.each(rawFrames, createGhost);	 //	console.log('rawFrames:%O', rawFrames);
			$.each(rawFrames, createNewFrame);
			player.curFrame = newFrames[1];
			$.each(newFrames, completeFrame);
			$("#masthead").append($ghosts);
			return newFrames;

			function completeFrame(frameIdx, newFrame) {
				var rFm = rawFrames[frameIdx];
				var prvRawFm = rawFrames[rFm.prevIdx];
				newFrame.nxtFm = newFrames[rFm.nextIdx];
				var actions = getActionChains();
				newFrame.play = actions.play;
				newFrame.rwind = actions.rwind;

				function getActionChains() { /* Add actions (last to first) for the frame */
					var showNextImg = bSlider.playerNext.bind(bSlider);
					var showPrevImg = bSlider.playerPrev.bind(bSlider);
					var showNextMsg = bSlider.animateCurrent.bind(bSlider);
					/* init action chains */
					var playAction = null;
					var nxtActn = 'newImg' in rFm ? showNextImg : showNextMsg;
					var prvActn = 'XXXXXX' in rFm ? null : showPrevImg;
					/* Build next frame action chain */
					if ('msgCss' in rFm) {
						addAction(thenDo, msgCtnrCss, rFm.msgCss);
					}
					if ('msgMov' in rFm) {
						addAction(thenDo, msgMov, rFm.msgMov);
					}
					if ('msgMovDur' in rFm) {
						addAction(thenDo, msgMovDur, rFm.msgMovDur);
					}
					if (rFm.hasVisFade) {
						addAction(wCallback, doVisFade, rFm.visFadeSel);
					}
					if (rFm.showsGhst) {
						addAction(wCallback, showGhost);
					}
					if ('msgPosV' in rFm) {
						addAction(thenDo, msgPosCfg, rFm.msgPosV.px, rFm.msgPosV.edge);
					}
					if ('msgPosH' in rFm) {
						addAction(thenDo, msgPosCfg, rFm.msgPosH.px, rFm.msgPosH.edge);
					}
					if ('pause' in rFm) {
						defPause = rFm.pause;
					}
					nxtActn = pauseNow(defPause);
					addAction(thenDo, newCurFrame, newFrame.nxtFm);
					playAction = nxtActn;
					nxtActn = null;
					/* Build prev frame action chain */
					addAction(wCallback, doVisFade, $msgContainer);
					return { play: playAction, rwind: nxtActn };

					function addAction(bindFunc, setFunc, attrVal, attrName) {
						nxtActn = bindFunc(setFunc, attrVal, attrName);
					}
					function wCallback(doFunc, val) {
						return doFunc.bind(null, nxtActn, val);
					}
					function thenDo(setFunc, attrVal, attrName) {
						return setAttrThen.bind(null, setFunc, nxtActn, attrVal, attrName);
					}
					function pauseNow(pauseDur) {
						return window.setTimeout.bind(null, nxtActn, pauseDur);
					}
					/* bound by wCallback to create actions that pass next action as a callback */
					function showGhost(callbackFunc) {
						rFm.ghostOfPrev.fadeTo(10, 1);
						$msgContainer.fadeTo(10, 0, callbackFunc);
					}
					function doVisFade(callbackFunc, sel) {
						sel.fadeTo(1000, 0, callbackFunc);
					}
					/* bound by thenDo to create actions that execute the next action immediately */
					function setAttrThen(setFunc, then, attrVal, attrName) {
						setFunc(attrVal, attrName);
						then();
					}
					function msgPosCfg(attrVal, attrName) {
						bSlider.settings.structure.messages[attrName] = attrVal;
						delete bSlider.settings.structure.messages[reverse[attrName]];
					}
					function msgCtnrCss(css) {	//	console.log('css=%s and newFrame=%O', JSON.stringify(css), newFrame);
						$('.message-container').css(css);
					}
					function msgMov(attrVal) {
						bSlider.settings.animation.messageAnimationDirection = attrVal;
					}
					function msgMovDur(attrVal) {
						bSlider.settings.animation.messageAnimationDuration = attrVal;
					}
					function newCurFrame(newFrame) {
						player.curFrame = newFrame;
					}
				}/* end getActions def */
			}/* end completeFrame def */
			function createNewFrame(frameIdx, rFm) {
				newFrames.push({
						msg: rFm.msgTxt,
						allCss: getCssObj(rFm.msgAllCss)
					});
				function getCssObj(msgStyle) {
					var obj = {};
					var cssAttrAry = msgStyle.split(';');
					cssAttrAry.forEach(addAttr);
					return obj;
					function addAttr(item) {
						var parts = item.split(':');
						var attrName = parts[0].trim();
						var attrVal = parts[1];
						if (attrName !== '') {
							obj[attrName] = attrVal.trim();
						}
					}
				}
			}/* end createNewFrame def */
			function createGhost(frameIdx, rFm) {
				var prevFm = rawFrames[rFm.prevIdx];
				if (rFm.showsGhst) {
					rFm.ghostOfPrev = buildGhost(prevFm.ghostGrp, prevFm.msgTxt, prevFm.msgAllCss);
				}
				if (rFm.hasVisFade) {
					rFm.visFadeSel = getVisFadeSel();
				}
				function getVisFadeSel() {
					var $sel = $();
					if (!(rFm.showsGhst)) {
						$sel = $sel.add($msgContainer);
					}
					if ('fadeGrp' in rFm) {
						$sel = $sel.add(getFadeGrpSel(rFm.fadeGrp));
					}
					return $sel;
					function getFadeGrpSel(fadeGrpStr) {
						var grpAry = fadeGrpStr.split(',');
						var $fadeSel = $();
						grpAry.forEach(addGroupSel);
						$fadeSel = $fadeSel.add($ghostGrps[rFm.fadeGrp]);
						delete $ghostGrps[rFm.fadeGrp];
						return $fadeSel;

						function addGroupSel(groupName) {
							$fadeSel = $fadeSel.add($ghostGrps[groupName.trim()]);
						}
					}/* end getFadeGrpSel def */
				}/* end getVisFadeSel def */
				function buildGhost(grpName, msg, allCss) {
					var $elem = $('<div class="msg-ghost" style="' + allCss + 'opacity: 0;' + '">' + msg + '</div>');
					if (!(grpName in $ghostGrps)) { $ghostGrps[grpName] = $(); }
					$ghosts = $ghosts.add($elem);
					$ghostGrps[grpName] = $ghostGrps[grpName].add($elem);
					return $elem;
				}
			}/* end createGhost def */
			function expandRawFrame(frameIdx, rFm) {
				var prevFmIdx = (frameIdx > 0 ? frameIdx : frameCnt) - 1;
				var showsGhostOfPrevBeforeDisplay = ('ghostGrp' in rawFrames[prevFmIdx]) ? true : false;
				var allCss = getCss();
				rFm.idx = frameIdx;
				rFm.prevIdx = prevFmIdx;
				rFm.nextIdx = (frameIdx + 1) < frameCnt ? (frameIdx + 1) : 0;
				rFm.msgAllCss = allCss;
				rFm.showsGhst = showsGhostOfPrevBeforeDisplay;
				rFm.hasVisFade = !showsGhostOfPrevBeforeDisplay || ('fadeGrp' in rFm);
				function getCss() {
					if ('msgCss' in rFm) { $ghostTemplate.css(rFm.msgCss); }
					if ('msgPosH' in rFm) { $ghostTemplate.css(getPosCss(rFm.msgPosH)); }
					if ('msgPosV' in rFm) { $ghostTemplate.css(getPosCss(rFm.msgPosV)); }
					return $ghostTemplate.attr("style");
					function getPosCss(msgPosObj) {
						var obj = {};
						obj[msgPosObj.edge] = msgPosObj.px + 'px';
						obj[reverse[msgPosObj.edge]] = 'auto';
						return obj;
					}
				}/* end getCss def */
			}/* end expandRawFrame def */
		}/* end initFrames def */
	}/* end player.init def */
});
