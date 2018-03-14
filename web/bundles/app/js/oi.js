$(document).ready(function() {
	var tableName = $('#pg-container').data("has-tbl");
	ECO_INT_FMWK.framePlayer.init();
	ECO_INT_FMWK.menuMngr.initMenus('#oimenu');
	
	/** Initiates tables and rearranges realted UI. */
	if (tableName !== false) {
		ECO_INT_FMWK.dTblMngr.initTables(tableName);
		ECO_INT_FMWK.dTblMngr.relocCtrls(tableName);
	}
	stickyHeader();

	function stickyHeader() {
		var $stickyMenu = $('#sticky-hdr');
		$(window).scroll(function () {
			if ($(window).scrollTop() > ECO_INT_FMWK.stickyOffset) {
					$stickyMenu.addClass("top-sticky");
				} else {
					$stickyMenu.removeClass("top-sticky");
				}
		});
	};

//	console.log('ECO_INT_FMWK:%O', ECO_INT_FMWK);
});


