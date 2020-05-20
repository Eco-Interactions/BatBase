/**
 * Submitted Publications' Page: Manage submitted publication pdfs. [Admin+]
 */
import { exitModal, showSaveModal } from '../misc/intro-core.js';

if (window.location.pathname.includes('pdfs')) {
    addPdfEvents();
}
function addPdfEvents() {
    $('input[name="delete-pdf').click(handleDeletePdf);
    $('input[name="view-pdf').click(handleOpenPdf);
}
function handleDeletePdf() {   console.log('delete pdf');
    const id = $(this).data('id');
    const confg = {
        html: '<center><h2>Are you sure you want to delete?</h2><br>',
        elem: 'input[data-id="'+id+'"]', dir: 'left', bttn: 'Confirm',
        submit: deletePdf.bind(null, id) 
    }
    showSaveModal(confg);
}
function deletePdf(id) {
    const url = 'pub/'+id+'/delete';
    $.ajax({
        method: "POST",
        url: url, 
        success: reloadPage,
        error: ajaxError
    });
}
function reloadPage() {
    location.reload();
}
function ajaxError(jqXHR, textStatus, errorThrown) {
    console.log("ajaxError. responseText = [%O] - jqXHR:%O", jqXHR.responseText, jqXHR);
}
function handleOpenPdf() {                                                      
    $("#b-overlay-popup").html(getPdfPreviewHtml($(this).attr('data-filename')));
    $("#b-overlay-popup").addClass("pdf-popup");
    bindEscEvents();
    $('#b-overlay, #b-overlay-popup').fadeIn(500);
}
/**
 * Clones hidden pdf object element and returns. 
 * Note: Couldn't figure out how to get webpack to work with files users upload
 * on the server, so using twig to create the elems, rather than dynamically 
 * building them here. There is probably a better way to do this. 
 */
function getPdfPreviewHtml(id) {  
    const $pdf = $('#'+id).clone();
    $pdf.css('display', 'inherit');  
    return $pdf[0];
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