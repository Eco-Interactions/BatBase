requireCss();
requireGlobalJs();
initImageSlider();
initStickyHeader();

function requireCss() {
	require('../../css/ei-reset.css');
	require('../../css/oi.css');	
}
function requireGlobalJs() {
	eif.util = require('./util.js');
}

function initImageSlider() { 												
	const imageSlider  =  require('./oislider.js'); 
	imageSlider.init();
}
function initStickyHeader() {
	var $stickyMenu = $('#sticky-hdr');
	$(window).scroll(function () {
		if ($(window).scrollTop() > eif.stickyOffset) {
				$stickyMenu.addClass("top-sticky");
			} else {
				$stickyMenu.removeClass("top-sticky");
			}
	});
};