/*
 * Code related to the image slider site header. 
 *
 * Exports: 
 *     initSlider
 */
/* Present during window resizing. */
let timeout;

export default function initSlider() {    
    setSliderContainerStyles();
    setSlideInterval();
    window.addEventListener('resize', resetSliderHeight);
}
/* Sets container height and then adds bottom border to the main menu */
function setSliderContainerStyles() {
    setSliderAndContentSize();
}
/**
 * Sets slider height based on absolute positioned child image. 
 * On mobile, sets the content blocks' tops value (header logo plus menu height)
 */
function setSliderAndContentSize() { 
    const imgHeight = $('#img-slider img:nth-child(1)').outerHeight();  
    const top = !imgHeight ? getMobileTopValue() : imgHeight + 86;
    if (imgHeight) { //non-mobile devices
        $('#img-slider').css('height', imgHeight);
        $('#slider-logo').css('height', (imgHeight/2));
    }
    $('#content-detail').css('top', top);
}
/** Note: #slider-overlay used for non-chrome browsers. */
function getMobileTopValue() {
    const cntnrHeight = $('#slider-overlay').outerHeight();
    const logoHeight = $('#slider-logo').outerHeight();  
    return (cntnrHeight || logoHeight) + 86;
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
    if (timeout) { return; }
    timeout = window.setTimeout(() => {
        setSliderAndContentSize();
        timeout = false;
    }, 2100);
}