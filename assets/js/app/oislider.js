const exports = module.exports = {};  /*framePlayer init*/  
const frameSet = buildFrameSet(); 
const allFrames = buildFrames();  
const confg = buildSliderConfig();

function buildFrameSet() {
    var FADE_DUR = 4000;    /* default fade duration in milliseconds                                        */
    var PAUSE_DUR = 3000;   /* default pause duration in milliseconds                                       */
    return {
        defaults: { pause: PAUSE_DUR },
        animCfg: {
            effects: [
                {name:"fade",duration:1000},
                {name:"chessBoardLeftUp",duration:FADE_DUR,size:20,steps:50},
                {name:"chessBoardLeftDown",duration:FADE_DUR,size:20,steps:50},
                {name:"chessBoardRightUp",duration:FADE_DUR,size:20,steps:50},
                {name:"chessBoardRightDown",duration:FADE_DUR,size:20,steps:50},
                {name:"jalousieLeft",duration:FADE_DUR,size:20,steps:50},
                {name:"jalousieRight",duration:FADE_DUR,size:20,steps:50},  
                {name:"jalousieUp",duration:FADE_DUR,size:20,steps:50},
                {name:"jalousieDown",duration:FADE_DUR,size:20,steps:50}
            ],
            initialInterval: PAUSE_DUR,                 
            interval: PAUSE_DUR,
            messageAnimationDirection: 'left',
            messageAnimationDuration:   FADE_DUR,
            messageAnimationMaxHorLength: 1000,
            messageAnimationMaxVerLength: 350       
        }
    };
}
function buildFrames() {
    var MSG_PAD_VERT = 40;  /* default vertical px spacing of message from top or bottom edge of slider     */
    var MSG_PAD_HORZ = 58;  /* default horizontal px spacing of message from left or right edge of slider   */
    return [
        {   msgPosV: { edge: 'top', px: MSG_PAD_VERT }, //positions neccessary for init
            msgPosH: { edge: 'left', px: MSG_PAD_HORZ },
            newImg: 'twobats.jpg' },
        {   newImg: 'cactusbat.jpg' },
        {   newImg: 'inflower.jpg' }]; 
}
function getImagePath() {
    var imageUrl = $('#masthead').data('img-path') ? 
        $('#masthead').data('img-path').split("/") : [];        
    var cacheQuery = imageUrl.splice(imageUrl.length-1, 1);
    return imageUrl.join('/') + '/';
}
function buildSliderConfig() {
    var imagePath = getImagePath();

    return {
        type: "slider",
        structure: {
            container: {
                id: "masthead",
                width: getWidth(),
                height: 423
            },
            messages: getMsgPos()
        },
        content: {
            images: getImgPaths(),
            messages: getMsgs()
        },
        animation: getAnimationConfig()
    };

    function getWidth() { 
        return $(window).width() > 1500 ? 1500 : 1313;
    }
    function getMsgPos() {
        var frstFm = allFrames[0];
        var obj = { containerClass: "message-container" };
        obj[frstFm.msgPosV.edge] = frstFm.msgPosV.px;
        obj[frstFm.msgPosH.edge] = frstFm.msgPosH.px;
        return obj;
    }
    
    function getImgPaths() {
        var imgfiles = getColumn(framesWithImg(), 'newImg');    
        return imgfiles.map(function(item) { 
                    return imagePath + item;
                });
        function framesWithImg() {
            return allFrames.filter(function(frame){ 
                        return 'newImg' in frame;
                    })
        }
    }/*  getImgPaths */

    function getColumn(ary, key) {
        return ary.map(function(item) {
                    return item[key];
                });     
    }

    function getMsgs() {
        return allFrames.map(function(frame) {
                return 'msgTxt' in frame ? frame.msgTxt : '';
            });         
    }

    function getAnimationConfig() {
        var cfg = { waitAllImages: true,
                    changeSameMessage: false,
                    showMessages: "simple",
                    changeMessagesAfter: 1 };
        return $.extend(frameSet.animCfg, cfg);
    } /* getAnimationConfig */
} /* End buildSliderConfig */

    // player.init = initPlayer; console.log('player = %O', player);
    // return player;

exports.init = function() {
    var player = {};
    player.curFrame = null;
    var hideSlider = $('#masthead').data('hide-slider') ? true : false;
    if (!hideSlider) { 
        var imagePath = getImagePath();  
        var autoRunning = true;
        var bSlider = new BeaverSlider(getSliderCfg());                 
        var $msgContainer = $('.message-container');
        var frames = initFrames();                                      
        initFramePlayerCtrls();
        nextFrame();
    }
    function getImagePath() {
        var imageUrl = $('#masthead').data('img-path').split("/");
        var cacheQuery = imageUrl.splice(imageUrl.length-1, 1);
        return imageUrl.join('/') + '/';
    }
    function getSliderCfg() {   
        confg.events = {};
        confg.events.afterInitialize = initFramePlayer; 
        confg.events.afterSlide = autoNextFrame; 
        return confg;
    }

    function initFramePlayerCtrls() {
        $('#pause-btn').on("click", toggleAutoRun);
        $('#next-btn').on("click", nextFrame);
        $('#prev-btn').on("click", prevFrame);
        $('.step-btn').fadeTo(10, 0);
    }

    function initFramePlayer(slider) {  /* Called Once after beaver slider has initialized */
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

    function autoNextFrame() {      /* Called directly by slider in it's afterSlide event } s = slider object */
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
        var defPause = frameSet.defaults.pause;
        var frameCnt = allFrames.length;
        var newFrames = [];
        $.each(allFrames, expandRawFrame);
        $.each(allFrames, createGhost);  // console.log('allFrames:%O', allFrames);
        $.each(allFrames, createNewFrame);
        player.curFrame = newFrames[1]; 
        $.each(newFrames, completeFrame);
        $("#masthead").append($ghosts);
        return newFrames;

        function completeFrame(frameIdx, newFrame) {
            var rFm = allFrames[frameIdx];
            var prvRawFm = allFrames[rFm.prevIdx];
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
                function msgCtnrCss(css) {  //  console.log('css=%s and newFrame=%O', JSON.stringify(css), newFrame);
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
            var prevFm = allFrames[rFm.prevIdx];
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
            var showsGhostOfPrevBeforeDisplay = ('ghostGrp' in allFrames[prevFmIdx]) ? true : false;
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
    // }/* end player.init def */
} /* End init */