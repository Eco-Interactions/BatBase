/**
 * Generalized Ajax Methods.
 *
 * Export
 *     sendAjaxQuery
 *     logAjaxData
 */
/* ======================= DATA UTIL ======================================== */
export function sendAjaxQuery(dataPkg, url, successCb, errCb) {                 logAjaxData(true, dataPkg, arguments);
    const envUrl = $('body').data("base-url");
    return $.ajax({
        method: "POST",
        url: envUrl + url,
        success: successCb || logAjaxData.bind(null, false),
        error: errCb || ajaxError,
        data: JSON.stringify(dataPkg)
    });
}
export function logAjaxData(send, dataPkg, args) {
    const action = send ? 'S' : 'R';
    if (['dev', 'test'].indexOf($('body').data('env')) !== -1) {
        console.log("           --[%s] Ajax data =%O arguments = %O", action, dataPkg, args);
    } else {
        console.log("          --[%s] Ajax data =%O", action, dataPkg);
    }
}
function ajaxError(jqXHR, textStatus, errorThrown) {
    console.log("ajaxError. responseText = [%O] - jqXHR:%O", jqXHR.responseText, jqXHR);
}