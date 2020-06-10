/*
 * Responsive site navigation.
 *
 * Exports:          Imported by:
 *     initMenu             oi
 */

/*
 * breakpoint - between collapsed and expanded navigation
 * timeout - present when window is being resized.
 */
const app = {
    breakpoint: 748
};

export function initMenu() {                                                    //console.log('Initializing menu for screen width = [%s]', window.outerWidth);
    addEvents();
    if (window.outerWidth < app.breakpoint) { initResponsiveNav(); }
}
function addEvents() {
    const hndlr = window.outerWidth > app.breakpoint ? collapseNav : expandNav;
    window.addEventListener('resize', hndlr);
    window.addEventListener("orientationchange", hndlr);
}
function initResponsiveNav() {                                                  //console.log('initResponsiveNav')
    updateMenuStylesForMobile();
    addClickEvents();
}
function updateMenuStylesForMobile() {
    $('nav').removeClass('flex-row');
    $('#site-name').hide();
    $('#mobile-menu-bar').css('display', 'flex');
    $('#hdrmenu').addClass('vert');
    $('#oimenu').addClass('vert closed');
    $('.toggle').css('height', 'fit-content');
    $('#oimenu ul').css('position', 'relative');
}
function addClickEvents() {
    $('.toggle').click(toggleMenu);
    $('li.smtrigger').click(toggleSubMenu);
    $('li.smtrigger ul a').click((e) => e.stopPropagation());
}
function toggleMenu() {                                                         //console.log('toggleMenu. display = %s, trans = %s', $('#oimenu').css('display'), $('#oimenu').css('transition'));
    if ($('#oimenu').hasClass('closed')) { showMobileMenu();
    } else { hideMobileMenu(); }
}
function showMobileMenu() {
    $('#oimenu').removeClass('closed'); 
    $('#content-detail').addClass('content-overlay').click(toggleMenu);
    $('#pg-hdr').css('background', 'rgba(0,0,0,.8)');
    if ($('body').data('browser') === 'Chrome') {
        $('#content-detail').css('position', 'unset');  //"fixes" bug with mobile menu in chrome
    }
}
function hideMobileMenu() {   
    $('#oimenu').addClass('closed');
    $('#content-detail').removeClass('content-overlay').off('click', toggleMenu);
    $('#pg-hdr').css('background', '#fff');
    if ($('body').data('browser') === 'Chrome') {
        $('#content-detail').css('position', 'absolute'); //"fixes" bug with mobile menu in chrome
    }
}
function toggleSubMenu(e) {                                                     //console.log('this ? %O. e = %O', this, e);
    event.preventDefault();
    if ($(this).hasClass('closed')) {                                   
        $('li.smtrigger').addClass('closed'); // closes all open sub-menus
        $(this).removeClass('closed');                                
        this.scrollIntoView({behavior: "smooth", block: "nearest", inline: "nearest"});
    } else {
        $(this).addClass('closed');
    }
}
function collapseNav() {  
    if (window.innerWidth > app.breakpoint || app.timeout) { return; }          //console.log('collapseNav')
    app.timeout = window.setTimeout(() => {
        initResponsiveNav();
        window.removeEventListener('resize', collapseNav);
        window.addEventListener('resize', expandNav);
        app.timeout = false;
    }, 500);
}
function expandNav() {  
    if (window.innerWidth < app.breakpoint || app.timeout) { return; }          //console.log('expandNav')
    app.timeout = window.setTimeout(() => {
        removeResponsiveNav()
        window.removeEventListener('resize', expandNav);
        window.addEventListener('resize', collapseNav);
        app.timeout = false;
    }, 500);
}
function removeResponsiveNav() {
    $('#mobile-menu-bar').hide();
    $('#site-name').show();
    $('nav').addClass('flex-row');
    $('#oimenu').addClass('flex-row');
    $('#oimenu').removeClass('vert closed');
    $('#hdrmenu').removeClass('vert');
    $('#oimenu ul').css('position', 'absolute');
    $('.toggle').css('height', '0').off('click', toggleMenu);
    $('li.smtrigger').off('click', toggleSubMenu);
}
