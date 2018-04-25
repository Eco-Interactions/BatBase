const tableMngr = require('./oi-tables.js');                                    

requireCss();
requireGlobalJs();
initImageSlider();
initDataTable();
initStickyHeader();

function requireCss() {
    require('../../css/ei-reset.css');
    require('../../css/oi.css');    
}
function requireGlobalJs() {
    
}
/**
 * Initiates tables and rearranges realted UI. Used on feedback and bilio pages.
 * Refactor to use ag-grid.
 */ 
function initDataTable() { 
    const tableName = $('#pg-container').data("has-tbl"); 
    if (tableName === false) { return; } 
    tableMngr.initTables(tableName); 
    tableMngr.relocCtrls(tableName); 
} 
function initImageSlider() {                                                
    const imageSlider  =  require('./oislider.js'); 
    imageSlider.init();
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