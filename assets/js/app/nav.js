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
    breakpoint: 575
};

export function initMenu() {                                                    console.log('Initializing menu');
    addWindowResizeEvent();
    if (window.innerWidth < app.breakpoint) {
        initResponsiveNav();
    } else {
        $('#mobile-menu-bar').hide();
    }
}
function addWindowResizeEvent() {
    const hndlr = window.innerWidth > app.breakpoint ? collapseNav : expandNav;
    window.addEventListener('resize', hndlr);
}
function initResponsiveNav() {                                                  console.log('initResponsiveNav')
    $('#site-name').hide();
    $('#hdrmenu').addClass('vert');
    $('#oimenu').addClass('vert closed');
    $('.toggle').css('height', 'fit-content').click(toggleMenu);
    $('li.smtrigger').click(toggleSubMenu);
    $('li.smtrigger ul a').click((e) => e.stopPropagation());
    $('#oimenu ul').css('position', 'relative');
    $('nav').removeClass('invis');
}
function toggleMenu() {                             console.log('toggleMenu. display = %s, trans = %s', $('#oimenu').css('display'), $('#oimenu').css('transition'));
    if ($('#oimenu').hasClass('closed')) {                      console.log('showing menu')
        $('#oimenu').removeClass('closed'); 
    } else {                                                console.log('hiding menu')
        $('#oimenu').addClass('closed');
    }
}
function toggleSubMenu(e) {                                              console.log('this ? %O. e = %O', this, e);
    event.preventDefault();
    if ($(this).hasClass('closed')) {                                   
        $(this).removeClass('closed');                                
        this.scrollIntoView({behavior: "smooth", block: "nearest", inline: "nearest"});
    } else {
        $(this).addClass('closed');
    }
}
function collapseNav() {  
    if (window.innerWidth > app.breakpoint || app.timeout) { return; }          console.log('collapseNav')
    app.timeout = window.setTimeout(() => {
        initResponsiveNav();
        window.removeEventListener('resize', collapseNav);
        window.addEventListener('resize', expandNav);
        app.timeout = false;
    }, 500);
}
function expandNav() {  
    if (window.innerWidth < app.breakpoint || app.timeout) { return; }          console.log('expandNav')
    app.timeout = window.setTimeout(() => {
        removeResponsiveNav()
        window.removeEventListener('resize', expandNav);
        window.addEventListener('resize', collapseNav);
        app.timeout = false;
    }, 500);
}
function removeResponsiveNav() {
    $('#mobile-menu-bar').hide();
    $('#oimenu').removeClass('collapse');
    $('#oimenu ul').css('position', 'absolute');
    $('.toggle').css('display', 'none').off('click');
    $('.smtrigger .arrow .dropdown').off('click');
}
