/* ============================== MAIN JS =================================== */
requireCss();
requireGlobalJquery();
initUi();
authDependantInit();  
// registerServiceWorker();

/* ------------ Styles and Scripts ------------------*/
function requireCss() {
    require('../../css/ei-reset.css');   
    require('../../css/oi.css');    
}
function requireGlobalJquery() { 
    const $ = require('jquery');
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
    require('./oislider.js').init();
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
    var $stickyMenu = $('#sticky-hdr');
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


function registerServiceWorker() { //console.log('env = ', $)
     if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/batplant/web/build/service-worker.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                }).catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
}