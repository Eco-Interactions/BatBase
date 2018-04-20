$(document).ready(function() {
	requireCss();
	initImageSlider();
	initDataTable();
	initStickyHeader();
	// registerServiceWorker();

	function requireCss() {
		require('../../css/ei-reset.css');
		require('../../css/oi.css');	
	}
	function initImageSlider() {
		ECO_INT_FMWK.framePlayer.init();
	}
	/** Initiates tables and rearranges realted UI. REFACTOR. */
	function initDataTable() {
		const tableName = $('#pg-container').data("has-tbl");
		if (tableName === false) { return; }
		ECO_INT_FMWK.dTblMngr.initTables(tableName);
		ECO_INT_FMWK.dTblMngr.relocCtrls(tableName);
	}
	function initStickyHeader() {
		var $stickyMenu = $('#sticky-hdr');
		$(window).scroll(function () {
			if ($(window).scrollTop() > ECO_INT_FMWK.stickyOffset) {
					$stickyMenu.addClass("top-sticky");
				} else {
					$stickyMenu.removeClass("top-sticky");
				}
		});
	};
	// function registerServiceWorker() {
	// 	navigator.serviceWorker && navigator.serviceWorker.register('/web/bundles/app/js/sw.js').then(function(registration) {
	// 	    console.log('Excellent, registered with scope: ', registration.scope);
	// 	});
	// }

//	console.log('ECO_INT_FMWK:%O', ECO_INT_FMWK);
});


