/**
 * Submitted Publications' Page: Manage submitted publication pdfs. [Admin+]
 * 
 * TOC:
 *    DELETE
 *    OPEN
 *    AJAX
 */
import { exitModal, showSaveModal } from '../misc/intro-core.js';

if (window.location.pathname.includes('pdfs')) {
    addPdfEvents();
}
function addPdfEvents() {
    $('input[name="delete-pdf').click(handleDeletePdf);
    $('input[name="view-pdf').click(handleOpenPdf);
}
/* ============================ DELETE ====================================== */
function handleDeletePdf() {
    const id = $(this).data('id');
    const confg = {
        html: '<center><h2>Are you sure you want to delete?</h2><br>',
        elem: 'input[data-id="'+id+'"]', dir: 'left', bttn: 'Confirm',
        submit: deletePdf.bind(null, id) 
    }
    showSaveModal(confg);
}
function deletePdf(id) {
    sendAjax('pub/'+id+'/delete', () => location.reload());
}
/* ============================ OPEN ======================================== */
/**
 * Clones hidden pdf object element and adds to the hidden page-popup elem. Then
 * the PDF is loaded in the iframe.
 * Note: Couldn't figure out how to get webpack to work with files users upload
 * on the server, so using twig to create the elems, rather than dynamically 
 * building them here. There is probably a better way to do this. 
 */
function handleOpenPdf () {
    const fileName = $(this).attr('data-filename'); //attr must be used to load the pdf
    $("#b-overlay-popup").html(clonePdfElem(fileName));
    setFilePopupStylesAndEscEvents(fileName);
    updateLastViewedBy($(this).data('id'));
}
/* -------------------- LOAD AND STYLE POPUP -------------------------------- */
function clonePdfElem(fileName) {
    const $pdf = $('.'+fileName).clone();
    $pdf.css('display', 'inherit');
    $pdf[0].id = fileName;
    return $pdf[0];
}
function setFilePopupStylesAndEscEvents (fileName) {
    $("#b-overlay-popup").addClass("pdf-popup");
    $('#b-overlay, #b-overlay-popup, #'+fileName).fadeIn(500);
    bindEscEvents();
}
function bindEscEvents() {
    $(document).on('keyup',function(evt) {
        if (evt.keyCode == 27) { closePdfPopup(); }
    });
    $("#b-overlay").click(closePdfPopup);
    $("#b-overlay-popup").click(function(e) { e.stopPropagation(); });
}
function closePdfPopup() {
    $("#b-overlay").css({ "display": "none" });
    unbindEscEvents();
    removePdfStyles();
}
function unbindEscEvents() {
    $(document).on('keyup',function(){});
    $("#b-overlay").click(function(){});
}
function removePdfStyles() {
    $("#b-overlay-popup").removeClass("pdf-popup");
    $("#b-overlay-popup").empty();
}
/* -------------------- UPDATE LAST VIEWED BY ------------------------------- */
function updateLastViewedBy(id) { 
    sendAjax('pub/'+id+'/update', updateTableViewedBy.bind(null, id));   
}
function updateTableViewedBy(id, username) {
    $('#'+id+'-viewed').text(username) 
}
/* ====================== AJAX ============================================== */
function sendAjax(url, onSuccess) {
    $.ajax({
        method: "POST",
        url: url, 
        success: onSuccess,
        error: ajaxError
    });
}
function ajaxError(jqXHR, textStatus, errorThrown) {
    console.log("ajaxError. responseText = [%O] - jqXHR:%O", jqXHR.responseText, jqXHR);
}