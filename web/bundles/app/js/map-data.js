(function(){  
    /** This file is responsible for interactions with the google maps API. */
    const eif = ECO_INT_FMWK;
    /**
     * initMap: Displays the map on the search database page.
     */
    eif.map = {
        initMap: initMap
    };

    function initMap() { 
        const map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: -34.397, lng: 150.644},
          zoom: 2
        });
    }
}());