(function(){  
    /** This file is responsible for interactions with the google maps API. */
    const eif = ECO_INT_FMWK;
    /**
     * initMap: Displays the map on the search database page.
     */
    eif.map = {
        initMap: initMap
    };

    function initMap(locCoordAry) {                                             console.log('initMap. locCoordAry = %O', locCoordAry)
        const map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: -34.397, lng: 150.644},
            zoom: 2,
            styles: hideBusinessRoadPoiNames()
        });

        function hideBusinessRoadPoiNames() {
            return [
                { featureType: 'poi.business',
                  stylers: [{visibility: 'off'}] },
                { featureType: 'transit',
                  elementType: 'labels.icon',
                  stylers: [{visibility: 'off'}] },
                { featureType: 'poi',
                  elementType: 'labels.icon',
                  stylers: [{visibility: 'off'}] }];
        }
    } /* End initMap */

    function drawOnMap(argument) {
        // map.data.add({geometry: new google.maps.Data.Polygon(coordArray)});
    }
}());