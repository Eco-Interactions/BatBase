$(function() {
    var menuMngr = ECO_INT_FMWK.menuMngr;

	menuMngr.menuHelper = function(initData) {
	    'use strict';
		/* Timing pseudo-constants (in milliseconds)                                                                          */
		var SHOW_TIME = 350;
		var FADE_TIME = 150;
	    /* Private Porperties                                                                                         */
	    var hSelf = this;                               /*  this instance of menuHelper                               */
	    var mgr = initData.mgr;                         /*  pointer to the menu manager instance for this whole menu  */
	    var exited = false;
	    var opened = false;
	    var thisUl = initData.ul;                       /*  pointer to the ul/sub-menu DOM element                    */
	    var rptMsIn = mgr.childIn.bind(hSelf, hSelf);
	    var rptMsOut = mgr.childOut.bind(hSelf, hSelf);
		var setToOpen = setState.bind(hSelf, getStateVals('opened'));
		var setToOpening = setState.bind(hSelf, getStateVals('opening'));
		var setToClosing = setState.bind(hSelf, getStateVals('closing'));
		var setToClosed = setState.bind(hSelf, getStateVals('closed'));
		var setToExited = setState.bind(hSelf, getStateVals('exited'));
		var nextIn = rptMsIn;
		var nextOut = rptMsOut;
	    /* Public Porperties & Methods (API)                                                                          */
	    hSelf.menuName = initData.menuName;             /* stores menu name to be accesible for console logging       */
	    hSelf.level = initData.level;
	    hSelf.isExited = function() { return exited; }; /* simple getter for the private exited property              */
	    hSelf.isOpened = function() { return opened; };	/* simple getter for the private opened property              */
	    hSelf.isWaiting = false;
	    hSelf.msIn = function() { nextIn(); };          /* msIn is bound to mouseenter                                */
	    hSelf.msOut = function() { nextOut(); };        /* msOut is bound to mouseleave	                              */
	    hSelf.open = function() { 						/* called by manager (after 1st closing siblings if needed)   */
				thisUl.stop();
				setToOpening();
				$(thisUl).fadeIn(SHOW_TIME);
			};
	    hSelf.close = function() {
				thisUl.stop();
				setToClosing();
				$(thisUl).fadeOut(FADE_TIME, closeComplete);
			};
	    return hSelf;

	    function processExit() {    					/* call on mouse out when open */
	        setToExited();
	        rptMsOut();
	    }

	    function processReentry() {     				/* call on mouse in when closing */
	        hSelf.open();
	        setToOpen();
	    }

	    function closeComplete() {
	        setToClosed();
	        mgr.childClosed(hSelf);
	    }

		function setState(stateVals) {
	        exited = stateVals['exitedVal'];
	        opened = stateVals['openedVal'];
	        nextOut = stateVals['outFunc'];
	        nextIn = stateVals['inFunc'];
		}

		function getStateVals(stateKey) {
			var mnuStates = {
				/* 		  exitedVal	openedVal outFunc	   inFunc 		  */
				exited: [ true,		true,	  rptMsOut,    setToOpen	  ],
				opened:	[ false,	true,	  processExit, rptMsIn		  ],
				opening:[ false,	true,	  processExit, rptMsIn		  ],
				closing:[ false, 	true,	  rptMsOut,	   processReentry ],
				closed:	[ false,	false,	  rptMsOut,	   rptMsIn		  ]
				};
			return {
				exitedVal:	mnuStates[stateKey][0],
				openedVal:	mnuStates[stateKey][1],
				outFunc:	mnuStates[stateKey][2],
				inFunc:		mnuStates[stateKey][3]
			};
		}

	}
});