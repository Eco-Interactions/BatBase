/**
 * Generalized Ajax Methods.
 *
 * Exports: 
 *     sendAjaxQuery
 *     logAjaxData
 */
/* ======================= DATA UTIL ======================================== */
export function sendAjaxQuery(dataPkg, url, successCb, errCb) {                 logAjaxData(dataPkg, arguments, 'sending');
    return $.ajax({
        method: "POST",
        url: url,
        success: successCb || logAjaxData,
        error: errCb || ajaxError,
        data: JSON.stringify(dataPkg)
    });
    function ajaxError(jqXHR, textStatus, errorThrown) {
        console.log("ajaxError. responseText = [%O] - jqXHR:%O", jqXHR.responseText, jqXHR);
    }
}
export function logAjaxData(dataPkg, args, sending) {
    const state = sending ? 'S' : 'R';
    if (['dev', 'test'].indexOf($('body').data('env') != -1)) { 
        console.log("           --[%s] Ajax data =%O arguments = %O", state, dataPkg, args);
    } else { console.log("          --[%s] Ajax data =%O", state, dataPkg); }
}