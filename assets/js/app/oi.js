/* ============================== MAIN JS =================================== */
requireCss();
requireGlobalJquery();
initUi();
authDependantInit();  
ifNotChromeShowOptimizedMsg();
// registerServiceWorker();

/* ------------ Styles and Scripts ------------------*/
function requireCss() {
    require('../../css/ei-reset.css');   
    require('../../css/oi.css');    
}
function requireGlobalJquery() { 
    global.$ = $;
    global.jQuery = $;
}
/* ---------------------------- UI ------------------------------------------ */
function initUi() {
    initTos();
    initImageSlider();
    initStickyHeaderAndDataTable();
}
function initTos() {
    require('./tos.js').init();
}
function initImageSlider() {    
    let curSlide = 1,
        nxtSlide = 2;         
  
    window.setInterval(() => { 
    $('#img-slider div:nth-child('+nxtSlide+')').css({opacity: 1}); 
        window.setTimeout(() => {   
            $('#img-slider div:nth-child('+curSlide+')').css({opacity: 0}); 
            curSlide = nxtSlide;
            nxtSlide = curSlide === 3 ? 1 : curSlide + 1;
        }, 1000)
    }, 10000);
}
/**
 * Initiates tables and rearranges realted UI. Used on the feedback and bilio pages.
 * TODO: Refactor to use ag-grid.
 */ 
function initStickyHeaderAndDataTable() { 
    const tableMngr = require('../misc/oi-tables.js');                                    
    const tableName = $('#pg-container').data("has-tbl"); 
    if (tableName === false) { return initStickyHeader(tableMngr); } 
    tableMngr.init(tableName); 
    initStickyHeader(tableMngr);
} 
function initStickyHeader(tableMngr) {
    const $stickyMenu = $('#sticky-hdr');
    $(window).scroll(function () {
        if ($(window).scrollTop() > tableMngr.stickyOffset) {
                $stickyMenu.addClass("top-sticky");
            } else {
                $stickyMenu.removeClass("top-sticky");
            }
    });
};
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
    const div = document.createElement("div");
    div.id = 'chrome-opt-msg';
    div.innerHTML = `<b>This site is developed and tested with chrome.</b> If 
        you encounter issues with other browsers, please log in and leave 
        feedback to let us know.`;
    $('#slider-overlay').prepend(div);
}
// function registerServiceWorker() { //console.log('env = ', $)
//      if ('serviceWorker' in navigator) {
//         window.addEventListener('load', () => {
//             navigator.serviceWorker.register('/batplant/web/build/service-worker.js')
//                 .then(registration => {
//                     console.log('SW registered: ', registration);
//                 }).catch(registrationError => {
//                     console.log('SW registration failed: ', registrationError);
//                 });
//         });
//     }
// }