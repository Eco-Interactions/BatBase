/**
 * Stores data about system-wide state in properties on the global object ECO_INT_FMWK. 
 * Currently only run on the Search page. 
 */
(function(){
    var eif = ECO_INT_FMWK;

    getServerDataLastUpdatedTimes();
    /** Gets an object will the lastUpdated datetimes for the system and each entity.*/
    function getServerDataLastUpdatedTimes() {
        sendAjaxQuery({}, "ajax/data-state", storeDataUpdatedTimes);
    }
    /** Stores the datetime object in the global ECO_ECO_INT_FMWK object. */
    function storeDataUpdatedTimes(ajaxData) {
        eif.data_state = ajaxData.dataState;                                    //console.log("dataState = %O", eif.data_state);
    }
    /*----------------- AJAX -------------------------------------------------*/
    function sendAjaxQuery(dataPkg, url, successCb) {                           //console.log("Sending Ajax data =%O arguments = %O", dataPkg, arguments)
        $.ajax({
            method: "POST",
            url: url,
            success: successCb,
            error: ajaxError,
            data: JSON.stringify(dataPkg)
        });
    }
    function ajaxError(jqXHR, textStatus, errorThrown) {
        console.log("ajaxError. responseText = [%O] - jqXHR:%O", jqXHR.responseText, jqXHR);
    }
}());