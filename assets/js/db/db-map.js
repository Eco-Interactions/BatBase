/** 
 * This file is responsible for interactions with the google maps API.
 * Displays the map on the search database page.
 */
/**
 * Exports:
 *   initMap
 *   showLoc
 *   showInts
 */
import * as _util from '../misc/util.js';
import * as db_page from './db-page.js';
import * as MM from './map-markers.js'; 

let locRcrds, map, popups = {};

initDb();
requireCss();
fixLeafletBug();

/** =================== Init Methods ======================================== */
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
/** ------------------ Stored Data Methods ---------------------------------- */
/**
 * Checks whether the dataKey exists in indexDB cache. 
 * If it is, the stored geoJson is fetched and stored in the global variable. 
 * If not, the db is cleared and geoJson is redownloaded. 
 */
function initDb() {
    _util.initGeoJsonData();
}
function geoJsonDataAvailable() {
    return _util.isGeoJsonDataAvailable();
}
/** ======================= Init Map ======================================== */
/** Initializes the search database map using leaflet and mapbox. */
function buildAndShowMap(loadFunc) {                                            console.log('buildAndShowMap. loadFunc = %O', loadFunc);
    locRcrds = locRcrds || _util.getDataFromStorage('location');
    map = L.map('map');
    map.setMaxBounds(getMapBounds());
    map.on('click', logLatLng);
    map.on('load', loadFunc);
    addMapTiles();
    map.setView([22,22], 2); console.log('map built.')
}
function logLatLng(e) {
    console.log("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng)
}
function getMapBounds() {
    const southWest = L.latLng(-100, 200);
    const northEast = L.latLng(100, -200);
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
export function initMap() {                                                     console.log('attempting to initMap')
    waitForStorageAndLoadMap();                                                 
}
function waitForStorageAndLoadMap() {
    return geoJsonDataAvailable() ? 
    buildAndShowMap(addAllIntMrkrsToMap) : 
    window.setTimeout(waitForStorageAndLoadMap, 500);
}
/** ================= Show Interaction Sets on Map ========================== */
/** Shows the interactions displayed in the data-grid on the map. */
export function showInts(gridData) {                                            //console.log('----------- showInts. gridData = %O', gridData);
    buildAndShowMap(showIntsOnMap.bind(null, gridData));
} 
function showIntsOnMap(data) {                                                  console.log('showIntsOnMap! data = %O', data);
    const sortedData = sortDataByGeoJson(data);                                 console.log('sortedData = %O', sortedData);
    addIntMarkersToMap(sortedData)
}
/** Sorts interaction data by geoJsonId, ie map-marker location. */
function sortDataByGeoJson(data) {                                              console.log('sort(ing)DataByGeoJson');
    const sorted = {/* geoJsonId: {loc: loc, ints: [{name: , intCnt:}] */};
    data.forEach(sortIntData);
    return sorted;

    function sortIntData(entity) {                                              
        for (let id in entity.locs) {
            addGeoData(entity, entity.locs[id], entity.locs[id].loc.geoJsonId);
        }
    }
    function addGeoData(entity, locObj, geoId) {                                //console.log('addGeoData. [%s] entity = %O, locObj = %O', geoId, entity, locObj);
        if (!sorted[geoId]) { sorted[geoId] = { locs:[], ints:[] }; }
        addIfNewLoc(locObj.loc, geoId);
        sorted[geoId].ints.push({
            name: entity.name, intCnt: locObj.intCnt});
    }
    /** Some locations share geoJson with their parent, eg habitats. */
    function addIfNewLoc(newLoc, geoId) {
        const exists = sorted[geoId].locs.find(
            loc => loc.displayName === newLoc.displayName); 
        if (exists) { return; }  
        sorted[geoId].locs.push(newLoc);
    }
}
function addIntMarkersToMap(intData) {                                          console.log('addMarkersToMap. intData = %O', intData);
    
}
/** ======================= Show Location on Map ============================ */
/** Centers the map on the location and zooms according to type of location. */
export function showLoc(id, zoom) {                                             
    buildAndShowMap(showLocInMap.bind(null, id, zoom));
    addAllIntMrkrsToMap();
}
function showLocInMap(id, zoom) {
    const loc = locRcrds[id];                                                   console.log('show loc = %O, zoom = %s', loc, zoom)
    const latLng = getCenterCoordsOfLoc(loc, loc.geoJsonId);                    //console.log('point = %s', point);
    if (!latLng) { return noGeoDataErr(); }
    const popup = popups[loc.displayName] || buildLocPopup(loc, latLng);
    popup.setContent(getLocationSummaryHtml(loc, null));  
    popup.options.autoClose = false;
    map.openPopup(popup); 
    map.setView(latLng, zoom, {animate: true});  

    function noGeoDataErr() {
        // const geoData = JSON.parse(geoJson[id]);                             console.log('geoData = %O', geoData);
        console.log('###### No geoJson found for geoJson [%s] ###########', id);
    }
}
function buildLocPopup(loc, latLng) {  
    const popup = L.popup().setLatLng(latLng).setContent('');
    popups[loc.displayName] = popup;  
    return popup;
}
/** ================= Show All Interaction Markers ========================== */
/**
 * Default Location "Map View":
 * Adds a marker to the map for each interaction with any location data. Each 
 * marker has a popup with either the location name and the country, just the  
 * country or region name. Locations without gps data are added to markers at  
 * the country level with "Unspecified" as the location name. Inside the popups
 * is a "Location" button that will replace the name popup with a 
 * summary of the interactions at the location.
 */
function addAllIntMrkrsToMap() {  
    const regions = getRegionLocs();
    for (let id in regions) { addMarkersForRegion(regions[id]) }; 
} /* End addAllIntMrkrsToMap */
function getRegionLocs() {
    const regionIds = _util.getDataFromStorage('topRegionNames');
    return Object.values(regionIds).map(id => locRcrds[id]);
}
function addMarkersForRegion(region) {
    if (region.displayName === "Unspecified") { return; }
    addMarkersForLocAndChildren(region);
}
function addMarkersForLocAndChildren(topLoc) {                                 
    if (!topLoc.totalInts) { return; }                                      //console.log('addMarkersForLocAndChildren for [%s] = %O', loc.displayName, loc);
    let intCnt = topLoc.interactions.length; 
    let subCnt = 0;
    buildMarkersForLocChildren(topLoc.children);                               
    if (intCnt || subCnt) { buildLocationMarkers(intCnt, subCnt, topLoc); }

    function buildMarkersForLocChildren(locs) {
        locs.forEach(id => {
            let loc = locRcrds[id];
            if (loc.locationType.displayName == 'Country') { 
                return addMarkersForLocAndChildren(loc, false); 
            }
            buildLocationIntMarkers(loc, loc.interactions.length);
        });
    }
    function buildLocationIntMarkers(loc, locIntCnt) {                      //console.log('buildLocationIntMarkers for [%s]', loc.displayName, loc);
        if (loc.children.length) { return addMarkersForLocAndChildren(loc); }
        if (!locIntCnt) { return; }
        buildLocationMarkers(locIntCnt, null, loc);
    }
    function buildLocationMarkers(intCnt, subCnt, loc) {                    //console.log('   buildLocationMarkers for [%s] = %O', loc.displayName, loc);
        const latLng = getCenterCoordsOfLoc(loc, loc.geoJsonId);            //console.log('        latLng = ', latLng)
        if (!latLng) { return logNoGeoJsonError(loc); }
        addMarkerForEachInteraction(intCnt, subCnt, latLng, loc);
    }
    function logNoGeoJsonError(loc) {
        if (!loc.interactions.length) { return null; }
        intCnt += loc.interactions.length;  
        if (locIsHabitatOfTopLoc(loc)) { return; }
        ++subCnt;
        // console.log('###### No geoJson for [%s] %O', loc.displayName, loc)
    }
    function locIsHabitatOfTopLoc(loc) {
        const subName = loc.displayName.split('-')[0];
        const topName = topLoc.displayName;  
        return topName.indexOf(subName) !== -1;
    }
} /* End addMarkersForLocAndChildren */
function getCenterCoordsOfLoc(loc, geoJsonId) { 
    if (!geoJsonId) { return false; }                                           //console.log('geoJson obj = %O', geoJson[geoJsonId]);
    const locGeoJson = _util.getGeoJsonEntity(geoJsonId);
    return locGeoJson.centerPoint ? 
        formatPoint(locGeoJson.centerPoint) 
        : getLocCenterPoint(loc, locGeoJson);
} 
/** Return a leaflet LatLng object from the GeoJSON Long, Lat point */
function formatPoint(point) {                                                   //console.log('point = ', point)
    let array = JSON.parse(point); 
    return L.latLng(array[1], array[0]);
}
function getLocCenterPoint(loc, locGeoJson) {
    const feature = buildFeature(loc, locGeoJson);
    const polygon = L.geoJson(feature);
    console.log('### New Center Coordinates ### "%s" => ', loc.displayName, polygon.getBounds().getCenter());
    return polygon.getBounds().getCenter(); 
} /* End getLocCenterPoint */
function buildFeature(loc, geoData) {                                           //console.log('place geoData = %O', geoData);
    return {
            "type": "Feature",
            "geometry": {
                "type": geoData.type,
                "coordinates": JSON.parse(geoData.coordinates)
            },
            "properties": {
                "name": loc.displayName
            }
        };   
}
function addMarkerForEachInteraction(intCnt, subCnt, latLng, loc) {             //console.log('       adding [%s] markers at [%O]', intCnt, latLng);
    return intCnt === 1 ? addMarker() : addCluster();

    function addMarker() {  
        let Marker = new MM.LocMarker(subCnt, latLng, loc, locRcrds);
        popups[loc.displayName] = Marker.popup;  
        map.addLayer(Marker.layer);
    }
    function addCluster() {
        let Cluster = new MM.LocCluster(map, intCnt, subCnt, latLng, loc, locRcrds);
        popups[loc.displayName] = Cluster.popup;  
        map.addLayer(Cluster.layer);
    }
} /* End addMarkerForEachInteraction */
/* --- Grid Popup --- */
function showPopUpMsg(msg) {                                                    //console.log("showPopUpMsg. msg = ", msg)
    const popUpMsg = msg || 'Loading...';
    $('#grid-popup').text(popUpMsg);
    $('#grid-popup').addClass('loading'); //used in testing
    $('#grid-popup, #grid-overlay').show();
    fadeGrid();
}
function hidePopUpMsg() {
    $('#grid-popup, #grid-overlay').hide();
    $('#grid-popup').removeClass('loading'); //used in testing
    showGrid();
}
function fadeGrid() {
    $('#borderLayout_eRootPanel, #grid-tools, #grid-opts').fadeTo(100, .3);
}
function showGrid() {
    $('#borderLayout_eRootPanel, #grid-tools, #grid-opts').fadeTo(100, 1);
}