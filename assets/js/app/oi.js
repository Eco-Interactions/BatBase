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
function initStickyHeader() {
    const staticHdrHeight = $('#img-slider').outerHeight();
    $(window).scroll(function () {
        if ($(window).scrollTop() > staticHdrHeight) {
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
/* ========================= AUTH DEPENDENT ================================= */
function authDependentInit() { 
    const userRole = $('body').data("user-role");                               //console.log("userRole = ", userRole);
    if (userRole === 'visitor') { return; }
    initFeedbackUi();     
    if (userRole === 'admin' && window.innerWidth > 750 || userRole === 'super') { 
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