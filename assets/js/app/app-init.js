/**
 * Initializes the interface, libraries, and features used throughout the
 * Eco-Interactions website.
 *
 * TOC
 *    SENTRY ERROR TRACKING
 *    STYLES AND GLOBAL JQUERY
 *    UI INIT
 *      HEADER AND MAIN NAV
 *      TOS
 *      AUTH-DEPENDENT INIT
 *    PAGE SPECIFIC
 *      DATATABLES
 *      SUBMIT PDF
 *      PAGES THAT DON'T WORK ON MOBILE DEVICES
 *    BROWSER SPECIFIC
 */
import initTosPopup from './misc/tos.js';
import initHeaderAndNav from './header/header-main.js';
import initDataTable from './misc/ei-data-tables.js';
import initFeedbackUi from '../page/feedback/feedback.js';
import initWysiwyg from './misc/wysiwyg.js';
import { ExtraErrorData } from '@sentry/integrations';
import { initUtil } from '~util';

export function initSiteCore() {
    initSentryIssueTracking();
    requireStyles();
    setGlobalJquery();
    initUi();
    initUtil();
}
/* ==================== STYLES & GLOBAL JQUERY ============================== */
function requireStyles() {
    require('styles/base/reset.styl');
    require('styles/ei.styl');
    require('styles/css/lib/introjs.min.css');
}
function setGlobalJquery() {
    global.$ = $;
    global.jQuery = $;
}
/* ================= SENTRY ERROR TRACKING ================================== */
function initSentryIssueTracking() {
    if ($('body').data('env') !== 'prod') { return; }
    initSentry();
}

/* --------------------- INIT SENTRY ---------------------------------------- */
function initSentry () {
    Sentry.init({
        dsn: 'https://28ec22ce887145e9bc4b0a243b18f94f@o955163.ingest.sentry.io/5904448',
        integrations: [new ExtraErrorData()],
        blacklistUrls: ['copy.batbase.org', 'dev.batbase.org']
    });
    configureSentryUserData($('body').data('user-name'), $('body').data('user-role'));
}
function configureSentryUserData (userName, userRole) {
    Sentry.configureScope(scope => {
        scope.setUser({ username: userName, role: userRole });
    })
}
/* ========================== UI INIT ======================================= */
function initUi() {
    initHeaderAndNav();
    initTos();
    handlePageSpecificUiInit();
    authDependentInit();
    $('#b-overlay').hide(); // Hides loading overlay on mobile
    $('.popup').show();
}
/* -------------------------- TOS ------------------------------------------ */
function initTos() {
    initTosPopup();
}
/* ------------------- AUTH-DEPENDENT INIT ---------------------------------- */
function authDependentInit() {
    const userRole = $('body').data("user-role");
    if (userRole === 'visitor') { return; }
    initFeedbackUi();
    if (userRole === 'admin' && window.outerWidth > 550 || userRole === 'super') {
        initEditContentUi();
    }
    function initEditContentUi() {
        initWysiwyg(userRole);
    }
}
/* ========================== PAGE SPECIFIC ================================= */
function handlePageSpecificUiInit() {
    initPageTable();
    clearFieldForPdfSubmissions();
    showOverlayOnMobile();
}
/* ----------------------- DATATABLES --------------------------------------- */
/**
 * Initiates tables and rearranges related UI.
 * Used on the feedback, pdf submission, and bibliography pages.
 */
function initPageTable() {
    const tableName = $('#pg-container').data("dt");
    if (tableName === false) { return; }
    initDataTable(tableName);
}
/* ------------------- SUBMIT PDF ------------------------------------------- */
/** Not quite sure how to show a success message and reload form, will loop back when there's more time. */
function clearFieldForPdfSubmissions() {
    if (window.location.pathname.includes('upload/publication')) {
        $("form[name='App_file_upload']:first-child div").css('justify-content', 'start');
        $('#App_file_upload_title, #App_file_upload_description').val(''); //Clears fields after form submit.
        $('.vich-image a').remove();
    }
}
/* ------------ PAGES THAT DON'T WORK ON MOBILE DEVICES --------------------- */
/*
 * For pages that are not able to be used on mobile devices, show a popup directing
 * users to view page on a computer.
 */
function showOverlayOnMobile() {
    const mblMsg = getMobileMsg();
    if (!mblMsg || $('body').data('env') == 'test') { return; }
    showMobilePopupMsg(mblMsg);
}
function getMobileMsg() {
    const map = { search: 1200, 'view-pdfs': 800, feedback: 800};
    const winWidth = Math.round(window.visualViewport ? window.visualViewport.width : window.innerWidth);
    const path = window.location.pathname;
    const pg = Object.keys(map).find(pg => path.includes(pg));
    if (!pg || isSearchPgOnApple(pg) || winWidth > map[pg])  { return false; }
    return getMobileMsgHtml(map[pg])

    /** Note: search page code doesn't load on mobile devices. */
    function isSearchPgOnApple(pg) {                                /*dbug-log*///console.log('pg = %s, apple? ', pg, ['Safari', 'iPhone'].indexOf($('body').data('browser')) !== -1)
        if (pg == 'search' &&
            ['Safari', 'iPhone'].indexOf($('body').data('browser')) !== -1) {
            showBrowserWarningPopup();
            return true;
        };
        function showBrowserWarningPopup() {
            const overlay = $('<div></div>').addClass('mobile-opt-overlay');
            const popup = $('<div></div>').addClass('popup');
            $(popup).html(`<center><h2>This page not supported on Safari Browser currently.</h2>`);
            $(overlay).append(popup);
            $('#detail-block').prepend(overlay);
            $('.popup').fadeIn(500);
        }
    }
    function getMobileMsgHtml(minWidth) {
        return `<center><h2>Page must be viewed on screen at least ${minWidth} pixels wide.<h2>
            <br><p>This screen is ${winWidth} pixels wide.</p></center>`;
    }
}
function showMobilePopupMsg(mblMsg) {
    const overlay = $('<div></div>').addClass('mobile-opt-overlay');
    const popup = $('<div></div>').addClass('popup');
    $(popup).html(mblMsg);
    $(overlay).append(popup);
    $('#detail-block').prepend(overlay);
    $('#b-overlay-popup').fadeIn(500);
}