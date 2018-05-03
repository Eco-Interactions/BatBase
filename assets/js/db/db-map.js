/**
 * Exports:
 *   initMap
 */
import * as idb from 'idb-keyval'; //set, get, del, clear
import * as _util from '../misc/util.js';

downloadGeoJson();

function downloadGeoJson() {

}

/** This file is responsible for interactions with the google maps API. */
/** Displays the map on the search database page.*/
export function initMap(locCoordAry) {                                          console.log('initMap. locCoordAry = %O', locCoordAry)
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
