// CODE SECTIONS:
//  TOP CALLS
//  STYLES & SCRIPTS
//  UI INIT
//  PAGE SPECIFIC
//  BROWSER SPECIFIC
/* ======================== TOP CALLS ======================================= */
requireStyles();
setGlobalJquery();
initUi();
/* ==================== STYLES & SCRIPTS ==================================== */
function requireStyles() {
    require('../../styles/ei-reset.styl');   
    require('../../styles/oi.styl');    
    require('../../css/lib/introjs.min.css');  
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
}
function initHeaderAndNav() {
    ifNotChromeShowOptimizedMsg();
    initNavMenu();
    initImageSlider();
    initStickyHeader(); //Must load after image slider and the nav menus
}
function initNavMenu() {
    require('./nav.js').initMenu();
}
function initTos() {
    require('./tos.js').initTos();
}
function initImageSlider() {    
    require('./img-slider.js').initSlider();
}
/* Header sticks when image header scrolls off screen. */
function initStickyHeader() {
    const hdrHeight = $('#img-slider').outerHeight() || $('#slider-logo').outerHeight();  

    $(window).scroll(function () {
        if ($(window).scrollTop() > hdrHeight) {
                $('#sticky-hdr').addClass("top-sticky");
            } else {
                $('#sticky-hdr').removeClass("top-sticky");
            }
    });
    $(window).scroll();
};
/* ========================== PAGE SPECIFIC ================================= */
function handlePageSpecificUiInit() {
    initDataTable();
    clearFieldForPdfSubmissions();
    showOverlayOnMobile();
}
/**
 * Initiates tables and rearranges related UI. 
 * Used on the feedback, pdf submission, and bilio pages.
 */ 
function initDataTable() { 
    const tableName = $('#pg-container').data("dt"); 
    if (tableName === false) { return; } 
    require('../misc/oi-tables.js').init(tableName);  
} 
/** Not quite sure how to show a success message and reload form, will loop back when there's more time. */
function clearFieldForPdfSubmissions() {
    if (window.location.pathname.includes('upload/publication')) {
        $('textarea#appbundle_file_upload_description').val(''); //Clears field after form submit. 
    }
}
/*
 * For pages that are not able to be used on mobile devices, show a popup directing
 * users to view page on a computer.
 */
function showOverlayOnMobile() {
    if (isMobileFriendlyPage()) { return; } 
    showMobilePopupMsg();
}
function isMobileFriendlyPage() {
    const map = { search: 1200, 'view-pdfs': 800, feedback: 800};
    const path = window.location.pathname;  
    return !Object.keys(map).find(pg => { 
        return path.includes(pg) && window.innerWidth < map[pg];
    });
}
function showMobilePopupMsg() {
    const overlay = $('<div></div>').addClass('mobile-opt-overlay');
    const popup = $('<div></div>').addClass('popup');
    $(popup).html(getMobileMsgHtml());
    $(overlay).append(popup);
    $('#content-detail').prepend(overlay);
    $('#b-overlay-popup').fadeIn(500);
}
function getMobileMsgHtml() {
    return '<h2>This page can only be viewed on a computer.<h2>';
}
/* ========================= AUTH DEPENDENT ================================= */
function authDependentInit() { 
    const userRole = $('body').data("user-role");                               //console.log("userRole = ", userRole);
    if (userRole === 'visitor') { return; }
    initFeedbackUi();     
    if (userRole === 'admin' && window.innerWidth > 550 || userRole === 'super') { 
        initEditContentUi(); 
    } 
    
    function initEditContentUi() {
        const wysiwyg = require('./wysiwyg.js');
        wysiwyg.init(userRole);
    }
}  /* End authDependentInit */
function initFeedbackUi() {
    const feedback = require('./feedback.js');
    feedback.init();
}
/* ======================= BROWSER SPECIFIC ================================= */
function ifNotChromeShowOptimizedMsg() {
    const isChrome = checkIfChrome(); 
    if (isChrome) { return; }
    addMsgAboutChromeOptimization();
}
function checkIfChrome() {
    const isChromium = window.chrome;
    const winNav = window.navigator;
    const vendorName = winNav.vendor;
    const isOpera = typeof window.opr !== "undefined";
    const isIEedge = winNav.userAgent.indexOf("Edge") > -1;
    const isIOSChrome = winNav.userAgent.match("CriOS");

    return isIOSChrome ? true : 
            (isChromium !== null && typeof isChromium !== "undefined" &&
            vendorName === "Google Inc." && isOpera === false && 
            isIEedge === false) ? true : false;
}
function addMsgAboutChromeOptimization() {
    const msg = buildMsgHtml();
    const logo = $('#slider-logo').detach();
    $(logo).addClass('overlay');
    $('#slider-overlay').css('padding', '2em');
    $('#slider-overlay').prepend([msg, logo]);
    $('#sticky-hdr').css({
        'top': $('#slider-overlay').outerHeight(),
        'position': 'absolute'
    });
}
function buildMsgHtml() {
    const div = document.createElement("div");
    div.id = 'chrome-opt-msg';
    div.innerHTML = `<b>This site is developed and tested with chrome.</b> If 
        you encounter issues with other browsers, please log in and leave 
        feedback to let us know.`;
    return div;
}