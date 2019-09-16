/*
 * Code related to the image slider site header. 
 *
 * Exports:         Imported by: 
 *     initSlider           oi
 */
export function initSlider() {    
    setSliderContainerStyles();
    setSlideInterval();
    window.addEventListener('resize', resetSliderHeight);
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
function resetSliderHeight() {
    if (app.timeout) { return; }
    app.timeout = window.setTimeout(() => {
        setSliderAndContentSize();
        app.timeout = false;
    }, 2100);
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