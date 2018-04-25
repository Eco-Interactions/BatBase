const tableMngr = require('./oi-tables.js');                                    

requireCss();
requireGlobalJs();
initUi();
authDependantInit();  

function requireCss() {
    require('../../css/ei-reset.css');
    require('../../css/oi.css');    
}
function requireGlobalJs() {
    
}
/** ---------------------------- UI ----------------------------------------- */
function initUi() {
    initImageSlider();
    initDataTable();
    initStickyHeader();
}
function initImageSlider() {                                                
    const imageSlider  =  require('./oislider.js'); 
    imageSlider.init();
}
/**
 * Initiates tables and rearranges realted UI. Used on the feedback and bilio pages.
 * TODO: Refactor to use ag-grid.
 */ 
function initDataTable() { 
    const tableName = $('#pg-container').data("has-tbl"); 
    if (tableName === false) { return; } 
    tableMngr.initTables(tableName); 
    tableMngr.relocCtrls(tableName); 
} 
function initStickyHeader() {
    var $stickyMenu = $('#sticky-hdr');
    $(window).scroll(function () {
        if ($(window).scrollTop() > tableMngr.stickyOffset) {
                $stickyMenu.addClass("top-sticky");
            } else {
                $stickyMenu.removeClass("top-sticky");
            }
    });
};
/** ------------------ Auth Dependant --------------------- */
function authDependantInit() { 
    const userRole = $('body').data("user-role");                               //console.log("userRole = ", userRole);
    if (['admin', 'super'].indexOf(userRole) !== -1) { initEditContentUi(); }
    
    function initEditContentUi() {
        const wysiwyg = require('./wysiwyg.js');
        wysiwyg.init(userRole);
    }
}  /* End authDependantInit */