/**
 * Main entry point for the core js used throughout the site.
 *
 * TOC:
 *    SENTRY ERROR TRACKING
 *    STYLES AND GLOBAL JQUERY
 *    UI INIT
 *      HEADER AND MAIN NAV
 *      TOS
 *      AUTH-DEPENDENT INIT
 *    PAGE SPECIFIC
 *      DATATABLES
 *      SUBMIT PDF
 *      PAGES THAT DON'T WORK ON MOBILE DEVICES
 *    BROWSER SPECIFIC
 */
import initTosPopup from './misc/tos.js';
import initSiteNav from './header/nav.js';
import initSlider from './header/img-slider.js';
import initHeaderStats from './header/site-stats.js';
import { initSentry } from './misc/alert-issue.js';

initPage();

function initPage() {
    initSentryIssueTracking();
    requireStyles();
    setGlobalJquery();                                                          //console.log('window width [%s]', window.outerWidth);
    initUi();
}
/* ================= SENTRY ERROR TRACKING ================================== */
function initSentryIssueTracking() {
    if ($('body').data('env') !== 'prod') { return; }
    initSentry();
}
/* ==================== STYLES & GLOBAL JQUERY ============================== */
function requireStyles() {
    require('../../styles/base/reset.styl');
    require('../../styles/oi.styl');
    require('../../styles/css/lib/introjs.min.css');
}
function setGlobalJquery() {
    global.$ = $;
    global.jQuery = $;
}
/* ========================== UI INIT ======================================= */
function initUi() {
    initHeaderAndNav();
    initTos();
    handlePageSpecificUiInit();
    authDependentInit();
    $('#b-overlay').hide(); // Hides loading overlay on mobile
    $('.popup').show();
}
/* -------------------- HEADER AND MAIN NAV --------------------------------- */
function initHeaderAndNav() {
    handleBrowserSpecificLoad();
    initNav();
    initImageSlider();
    initStickyHeader(); //Must load after image slider and the nav menus
    $('#pg-hdr').css('z-index', '0'); // Otherwise elem flashes under img-slider on page load
}
function initNav() {
    initSiteNav();
}
function initImageSlider() {
    initSlider();
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
}/* -------------------------- TOS ------------------------------------------ */
function initTos() {
    initTosPopup();
}
/* ------------------- AUTH-DEPENDENT INIT ---------------------------------- */
function authDependentInit() {
    const userRole = $('body').data("user-role");                               //console.log("userRole = ", userRole);
    if (userRole === 'visitor') { return; }
    initFeedbackUi();
    if (userRole === 'admin' && window.outerWidth > 550 || userRole === 'super') {
        initEditContentUi();
    }

    function initEditContentUi() {
        const wysiwyg = require('./misc/wysiwyg.js').default;
        wysiwyg(userRole);
    }
}  /* End authDependentInit */
function initFeedbackUi() {
    const feedback = require('./feedback/feedback.js');
    feedback.init();
}
/* ========================== PAGE SPECIFIC ================================= */
function handlePageSpecificUiInit() {
    loadSiteStatisticsHeader();
    initPageTable();
    clearFieldForPdfSubmissions();
    showOverlayOnMobile();
}
/* ----------------------- SITE STATISTICS HEADER --------------------------- */
function loadSiteStatisticsHeader() {
    const pg = window.location.pathname.split('/').pop();
    initHeaderStats(pg);
}
/* ----------------------- DATATABLES --------------------------------------- */
/**
 * Initiates tables and rearranges related UI.
 * Used on the feedback, pdf submission, and bibliography pages.
 */
function initPageTable() {
    const tableName = $('#pg-container').data("dt");
    if (tableName === false) { return; }
    require('../misc/oi-tables.js').init(tableName);
}
/* ------------------- SUBMIT PDF ------------------------------------------- */
/** Not quite sure how to show a success message and reload form, will loop back when there's more time. */
function clearFieldForPdfSubmissions() {
    if (window.location.pathname.includes('upload/publication')) {
        $("form[name='App_file_upload']:first-child div").css('justify-content', 'start');
        $('#App_file_upload_title, #App_file_upload_description').val(''); //Clears fields after form submit.
        $('.vich-image a').remove();
    }
}
/* ------------ PAGES THAT DON'T WORK ON MOBILE DEVICES --------------------- */
/*
 * For pages that are not able to be used on mobile devices, show a popup directing
 * users to view page on a computer.
 */
function showOverlayOnMobile() {
    const mblMsg = getMobileMsg();
    if (!mblMsg || $('body').data('env') == 'test') { return; }
    showMobilePopupMsg(mblMsg);
}
function getMobileMsg() {
    const map = { search: 1200, 'view-pdfs': 800, feedback: 800};
    const winWidth = Math.round(window.visualViewport ? window.visualViewport.width : window.innerWidth);
    const path = window.location.pathname;
    const pg = Object.keys(map).find(pg => path.includes(pg));
    if (!pg || isSearchPgOnApple(pg) || winWidth > map[pg])  { return false; }
    return getMobileMsgHtml(map[pg])

    /** Note: search page code doesn't load on mobile devices. */
    function isSearchPgOnApple(pg) {                                            //console.log('pg = %s, apple? ', pg, ['Safari', 'iPhone'].indexOf($('body').data('browser')) !== -1)
        if (pg == 'search' &&
            ['Safari', 'iPhone'].indexOf($('body').data('browser')) !== -1) {
            showBrowserWarningPopup();
            return true;
        };
        function showBrowserWarningPopup() {
            const overlay = $('<div></div>').addClass('mobile-opt-overlay');
            const popup = $('<div></div>').addClass('popup');
            $(popup).html(`<center><h2>This page not supported on Safari Browser currently.</h2>`);
            $(overlay).append(popup);
            $('#detail-block').prepend(overlay);
            $('.popup').fadeIn(500);
        }
    }
    function getMobileMsgHtml(minWidth) {
        return `<center><h2>Page must be viewed on screen at least ${minWidth} pixels wide.<h2>
            <br><p>This screen is ${winWidth} pixels wide.</p></center>`;
    }
}
function showMobilePopupMsg(mblMsg) {
    const overlay = $('<div></div>').addClass('mobile-opt-overlay');
    const popup = $('<div></div>').addClass('popup');
    $(popup).html(mblMsg);
    $(overlay).append(popup);
    $('#detail-block').prepend(overlay);
    $('#b-overlay-popup').fadeIn(500);
}
/* ======================= BROWSER SPECIFIC ================================= */
function handleBrowserSpecificLoad() {
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