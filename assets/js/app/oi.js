/* ============================== MAIN JS =================================== */
requireStyles();
requireGlobalJquery();
initUi();
authDependantInit();  
clearFieldForPdfSubmissions();

let timeout;

/* ------------ Styles and Scripts ------------------*/
function requireStyles() {
    require('../../styles/ei-reset.styl');   
    require('../../styles/oi.styl');    
    require('../../css/oi.css');    
    require('../../css/lib/introjs.min.css');  
}
function requireGlobalJquery() { 
    global.$ = $;
    global.jQuery = $;
}
/* ---------------------------- UI ------------------------------------------ */
function initUi() {
    addWindowResizeEvent();
    initTos();
    initStickyHeader();
    initDataTable();
    ifNotChromeShowOptimizedMsg();
    initImageSlider();
}
function initTos() {
    require('./tos.js').init();
}
function initImageSlider() {    
    setSliderContainerStyles();
    setSlideInterval();
}
/* Sets container height and then adds bottom border to the main menu */
function setSliderContainerStyles() {
    setSliderAndContentSize();
    $('#hdrmenu, #pg-hdr').css('border-bottom', '1px solid Gray');
}
/**
 * Sets slider height based on absolute positioned child image. 
 * On mobile, sets the content blocks' tops value (header logo plus menu height)
 */
function setSliderAndContentSize() { 
    const imgHeight = $('#img-slider img:nth-child(1)').outerHeight();  
    const cntnrHeight = $('#slider-overlay').outerHeight();
    const logoHeight = $('#slider-logo').outerHeight();  
    const contentHeight = (cntnrHeight || logoHeight) + 86;
    $('#img-slider').css('height', imgHeight);
    if (!imgHeight) { //mobile devices
        $('#content-detail').css('top', contentHeight);
    }
}
function setSlideInterval() {
    let curSlide = 1,
        nxtSlide = 2;       

    window.setInterval(() => {
    $('#img-slider img:nth-child('+nxtSlide+')').css({opacity: 1}); 
        window.setTimeout(() => {   
            $('#img-slider img:nth-child('+curSlide+')').css({opacity: 0}); 
            curSlide = nxtSlide;
            nxtSlide = curSlide === 3 ? 1 : curSlide + 1;
        }, 1000)
    }, 10000);
}
function initStickyHeader() {
    const $stickyMenu = $('#sticky-hdr');
    const staticHdrHeight = $('#img-slider').outerHeight();
    $(window).scroll(function () {
        if ($(window).scrollTop() > staticHdrHeight) {
                $stickyMenu.addClass("top-sticky");
            } else {
                $stickyMenu.removeClass("top-sticky");
            }
    });
    $(window).scroll();
};
/**
 * Initiates tables and rearranges realted UI. Used on the feedback, pdf submission, and bilio pages.
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
function addWindowResizeEvent() {
    window.addEventListener('resize', resetSliderHeight);
}
function resetSliderHeight() {
    if (timeout) { return; }
    timeout = window.setTimeout(() => {
        setSliderAndContentSize();
        timeout = false;
    }, 2500);
}
/* ------------------ Auth Dependant --------------------- */
function authDependantInit() { 
    const userRole = $('body').data("user-role");                               //console.log("userRole = ", userRole);
    if (userRole === 'visitor') { return; }
    if (['admin', 'super'].indexOf(userRole) !== -1) { initEditContentUi(); }
    initFeedbackUi();     
    
    function initEditContentUi() {
        const wysiwyg = require('./wysiwyg.js');
        wysiwyg.init(userRole);
    }
}  /* End authDependantInit */
function initFeedbackUi() {
    const feedback = require('./feedback.js');
    feedback.init();
}
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
}
function buildMsgHtml() {
    const div = document.createElement("div");
    div.id = 'chrome-opt-msg';
    div.innerHTML = `<b>This site is developed and tested with chrome.</b> If 
        you encounter issues with other browsers, please log in and leave 
        feedback to let us know.`;
    return div;
}