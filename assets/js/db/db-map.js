/** 
 * This file is responsible for interactions with the google maps API.
 * Displays the map on the search database page.
 */
/**
 * Exports:
 *   initMap
 *   updateGeoJsonData
 */
import * as idb from 'idb-keyval'; //set, get, del, clear
import * as _util from '../misc/util.js';
import 'leaflet.markercluster';

let geoJson, map, showMap;

requireCss();
fixLeafletBug();
getGeoJsonData();

function requireCss() {
    require('../../../node_modules/leaflet/dist/leaflet.css');
    require('../../../node_modules/leaflet.markercluster/dist/MarkerCluster.css');
    require('../../../node_modules/leaflet.markercluster/dist/MarkerCluster.Default.css');
}
/** For more information on this fix: github.com/PaulLeCam/react-leaflet/issues/255 */
function fixLeafletBug() {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    });
}
function getGeoJsonData() {                                                     console.log('getGeoJsonData')
    idb.get('geoJson').then(storeGeoJson);
}
function storeGeoJson(geoData) {                                                console.log('storeGeoJson. geoData ? ', geoData !== undefined);
    if (geoData === undefined) { return downloadGeoJson(); }
    geoJson = geoData; 
    if (showMap) { console.log('showing map');initMap(); }
}
function storeServerGeoJson(data) {                                             console.log('server geoJson = %O', data.geoJson);
    idb.set('geoJson', data.geoJson);
    storeGeoJson(data.geoJson);
}
/**
 * Loops through the passed data object to parse the nested objects. This is 
 * because the data comes back from the server having been double JSON-encoded,
 * due to the 'serialize' library and the JSONResponse object. 
 */
function parseData(data) {
    for (var id in data) { data[id] = JSON.parse(data[id]); } 
    return data;
}
function downloadGeoJson() {                                                    console.log('downloading all geoJson data!');
    _util.sendAjaxQuery({}, 'ajax/geo-json', storeServerGeoJson);                     
}
export function updateGeoJsonData(argument) { //TODO: When db_sync checks for entity updates, send geoJson updates here
    // body...
}
/** Initializes the search database map using leaflet and mapbox. */
export function initMap() {                                                     console.log('attempting to initMap')
    if (!geoJson) { showMap = true; return }                                    console.log('initMap');
    map = L.map('map');
    map.setMaxBounds(getMapBounds());
    map.on('click', logLatLng);
    map.on('load', addCountryIntCounts);
    addMapTiles();
    map.setView([22,22], 2)
    
    function logLatLng(e) {
        console.log("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng)
    }
    function getMapBounds() {
        const southWest = L.latLng(-90, 180);
        const northEast = L.latLng(90, -180);
        return L.latLngBounds(southWest, northEast);
    }
    function addMapTiles() {
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            minZoom: 3, //Don't zoom out passed 
            maxZoom: 16,
            id: 'mapbox.run-bike-hike',
            accessToken: 'pk.eyJ1IjoiYmF0cGxhbnQiLCJhIjoiY2poNmw5ZGVsMDAxZzJ4cnpxY3V0bGprYSJ9.pbszY5VsvzGjHeNMx0Jokw'
        }).addTo(map);
    }
} /* End initMap */
/**
 * Adds a marker for each interaction within each country. The markers are placed
 * at the center of the country's polygon. A popup with the country's name is added.
 */
function addCountryIntCounts() {                                               
    const cntrys = getCountryLocs();                                            //console.log('countries = %O', cntrys);
    for (let id in cntrys) { 
        addMarkersForInts(cntrys[id]) 
    }

    function getCountryLocs() {
        let data = _util.getDataFromStorage(['location', 'countryNames']);
        return Object.values(data.countryNames).map(id => data.location[id]);
    }
    function addMarkersForInts(cntry) {
        const markerCoords = getCenterCoordsOfLoc(cntry);                       //console.log('markerCoords = ', markerCoords)
        if (!markerCoords || !cntry.totalInts) { return; }
        addMarkerForEachInteraction(cntry.totalInts, markerCoords, cntry);
    }        
    function getCenterCoordsOfLoc(loc) { 
        if (!loc.geoJsonId) { 
            return loc.interactions.length ? console.log('###### No geoJson for [%s] %O', loc.displayName, loc) : null; }  
        if (loc.displayName == 'United States') { return {lat: 39.8333333, lng: -98.585522}}
        const feature = buildPlaceGeoJson(loc, geoJson[loc.geoJsonId]);
        const polygon = L.geoJson(feature);//.addTo(map);
        return polygon.getBounds().getCenter(); 
    }
    function buildPlaceGeoJson(loc, geoData) {                                  //console.log('place geoData = %O', geoData);
        const place = JSON.parse(geoData);
        return {
                "type": "Feature",
                "geometry": {
                    "type": place.type,
                    "coordinates": JSON.parse(place.coordinates)
                },
                "properties": {
                    "name": place.displayName
                }
            };   
    }
    function addMarkerForEachInteraction(intCnt, coords, cntry) {               //console.log('adding [%s] markers at [%s]', intCnt, coords);
        if (intCnt === 1) { return addSingleMarker(coords, cntry); }
        const markers = L.markerClusterGroup();
        for (let i = 0; i < intCnt; i++) {  
            markers.addLayer(L.marker(coords));
        }
        map.addLayer(markers);
        addPopupToCluster(markers, cntry.displayName);
    }
    function addSingleMarker(coords, cntry) {
        L.marker(coords).bindPopup(cntry.displayName)
            .on('mouseover', function (e) { this.openPopup(); })
            .on('mouseout', function (e) { this.closePopup(); })
            .addTo(map);
    }
    function addPopupToCluster(markers, text) {
        markers.on('clustermouseover', createClusterPopup)
            .on('clustermouseout',function(c){ map.closePopup(); })
            .on('clusterclick',function(c){ map.closePopup(); }); 
        
        function createClusterPopup(c) {
            const popup = L.popup()
                .setLatLng(c.layer.getLatLng())
                .setContent(text)
                .openOn(map);
        }
    }
} /* End addCountryIntCounts */