/**
 * Submitted Publications' Page: Manage submitted publication pdfs. [Admin+]
 */

addPdfEvents();

function addPdfEvents() {
    $('input[name="delete-pdf').click(handleDeletePdf);
    $('input[name="view-pdf').click(handleOpenPdf);
}
function handleDeletePdf() {   console.log('delete pdf');
    const url = 'pub/'+$(this).data('id')+'/delete';
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
function handleOpenPdf() {                                                      //console.log('preview pdf');
    $("#b-overlay-popup").html(getPdfPreviewHtml($(this).data('filename')));
    $("#b-overlay-popup").addClass("pdf-popup");
    bindEscEvents();
    $('#b-overlay, #b-overlay-popup').fadeIn(500);
}
function getPdfPreviewHtml(filename) {
    const src = "../../../web/uploads/publications/"+filename;
    return '<object data='+src+' width="100%" height="100%"></object>';
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