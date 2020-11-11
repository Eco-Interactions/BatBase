/**
 * Initializes the site header with the image slider, sticky menu, and data-counts
 * relevant to the current page, if any. A warning is shown if accessing the with
 * a non-Chrome browser.
 *
 * Export
 *     initHeaderAndNav
 *
 * TOC
 *     HEADER AND MAIN-NAV
 *     BROWSER WARNING
 */
import initSiteNav from './nav.js';
import initSlider from './img-slider.js';
import initHeaderStats from './site-stats.js';
/* -------------------- HEADER AND MAIN NAV --------------------------------- */
export default function initHeaderAndNav() {
    ifNonChromeBrowserShowWarning();
    initSiteNav();
    initSlider();
    initStickyHeader(); //Must load after image slider and the nav menus
    initHeaderStats();
    $('#pg-hdr').css('z-index', '0'); // Otherwise elem flashes under img-slider on page load
}
/* Header sticks when image header scrolls off screen. */
function initStickyHeader() {
    const hdrHeight = $('#img-slider').outerHeight() ||
     $('#slider-overlay').outerHeight() || $('#slider-logo').outerHeight();
    $(window).scroll(handleStickyNav.bind(null, hdrHeight));
    $(window).scroll();
};
function handleStickyNav(hdrHeight) {
    if ($(window).scrollTop() > hdrHeight) {
        $('#sticky-hdr').addClass("top-sticky");
    } else {
        $('#sticky-hdr').removeClass("top-sticky");
    }
}
/* ======================= BROWSER WARNING ================================== */
function ifNonChromeBrowserShowWarning() {
    const brwsr = getBrowserName();
    $('body').data('browser', brwsr);
    if (brwsr == 'Chrome') { return; }
    addMsgAboutChromeOptimization();
}
function getBrowserName() {
    return isOpera() || isIEedge() || isIphone() || isChrome() || isSafari();

    function isOpera() {
        return typeof window.opr !== "undefined" ? 'Opera' : false;
    }
    function isIEedge() {
        return window.navigator.userAgent.indexOf("Edge") > -1 ? 'IE' : false;
    }
    function isChrome() {
        const isChromium = window.chrome;
        const vendorName = window.navigator.vendor;
        const isIOSChrome = window.navigator.userAgent.match("CriOS");
        return isIOSChrome ? 'Chrome' :
                (isChromium !== null && typeof isChromium !== "undefined" &&
                vendorName === "Google Inc.") ? 'Chrome' : false;
    }
    function isSafari() {
        return window.safari ? 'Safari' : false;
    }
    function isIphone() {
        return /CriOS|iPad|iPhone|iPod/.test(navigator.platform) ? 'iPhone' : false;
    }
}
function addMsgAboutChromeOptimization() {
    const msg = buildMsgHtml();
    const logo = $('#slider-logo').detach();
    $(logo).addClass('overlay');
    $('#slider-overlay').css('padding', '2em');
    $('#slider-overlay').prepend([msg, logo]);
    window.setTimeout(() => {
        $('#sticky-hdr').css({
            'top': $('#slider-overlay').outerHeight(),
            'position': 'absolute'
        });
    }, 750);
}
function buildMsgHtml() {
    const div = document.createElement("div");
    div.id = 'chrome-opt-msg';
    div.innerHTML = `<b>This site is developed and tested with chrome.</b> If
        you encounter issues with other browsers, please log in and leave
        feedback to let us know.`;
    return div;
}