$(function() {
    ECO_INT_FMWK.menuMngr = {};
    var menuMngr = ECO_INT_FMWK.menuMngr;

    menuMngr.menuManager = function() {
        'use strict';
    	/* Timing pseudo-constants (in milliseconds)                                                                                                    */
    	var INTENT_TIME = 50;
    	var CLOSE_TIME = 600;
        /* Private Porperties                                                                                                                           */
        var mSelf = this;                   /*  self/this for menuManager                                                                               */
        var hWaiting = null;                /*  helper waiting to open - starts on raw IN, lasts until .open or canceled by reseting to null            */
        var hOpen = [];                     /*  add at .open call - remove after childClosed calls back - in array during fade in & out                 */
        var intentTimerId = null;           /*  timer ID for the (very short) anti-knee-jerk intent detecting timer                                     */
        var closeTimerId = null;            /*  timer ID for the (much longer) anti-needy-collapse exit detecting timer                                 */
        /* Public Porperties & Methods (API)                                                                                                            */
        this.menuName = 'Menu-Manager';
        this.childClosed = function() {		/*  msg lister for helpers to report that close fade OUT is complete                                        */
    			hOpen.pop();
    			handleExitsAndWaiting();
    		};
        this.childIn = function(hChild) {			/*  msg lister for helpers to report raw mouse IN events                                                    */
    			hWaiting = hChild;
    			waitForIntent(openChild, hChild);
    		};
        this.childOut = function(hChild) {		/*  msg lister for helpers to report raw mouse OUT events                                                   */
    			cancelIfIsWaiting(hChild) || waitForAbandonIfOpen(hChild);
    		};
        return this;

    	function waitForAbandonIfOpen(hChild) {
    		hChild.isOpened() && waitForIntent(waitForAbandon, hChild);
    	}

    	function cancelIfIsWaiting(hChild) {
    		return isWaiting(hChild) && cancelWaiting();
    	}

    	function cancelWaiting() {
    		hWaiting = null;
    		return true;
    	}

        function openChild(hChild) {
            isWaiting(hChild) && handleExitsAndWaiting();
        }

        function isWaiting(hChild) {
            return hChild === hWaiting;
        }

    	function handleExitsAndWaiting() {
    		closeLeafIfExited() || openWaitingIfClear();
    	}

    	function openWaitingIfClear() {
    		hWaiting !== null && isClearToOpen(hWaiting) && logAndOpenAnyWaiting();
    	}

    	function isClearToOpen(hChild) {
    		return !anyOpen() || noSiblingOpen(hChild);
    	}

        function noSiblingOpen(hChild) {
            return !(hChild.level in hOpen);
        }

        function closeLeafIfExited() {
            return leafIsExited() && closeOpenLeaf();
        }

        function leafIsExited() {
            return anyOpen() && openLeaf().isExited();
        }

        function anyOpen() {
            return hOpen.length !== 0;
        }

        function openLeaf() {
            return hOpen[hOpen.length-1];
        }

        function closeOpenLeaf() {
    		openLeaf().close();
            return true;
        }

        function logAndOpenAnyWaiting() {
            hWaiting === null || logAndOpenWaiting();
        }

        function logAndOpenWaiting() {
    		hOpen[hWaiting.level] = hWaiting;
    		hWaiting.open();
    		hWaiting = null;
        }

        function waitForAbandon(hChild) {
            window.clearTimeout(closeTimerId);
            closeTimerId = window.setTimeout(childAbandoned, CLOSE_TIME, hChild);
        }

        function childAbandoned() {
            leafIsExited() && closeOpenLeaf();
        }

        function waitForIntent(intentCallback, hChild) {
            window.clearTimeout(intentTimerId);
            intentTimerId = window.setTimeout(intentCallback, INTENT_TIME, hChild);
        }

    }
});