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
import * as _u from './util.js';
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
    _u.initGeoJsonData();
}
function geoJsonDataAvailable() {
    return _u.isGeoJsonDataAvailable();
}
/** ======================= Init Map ======================================== */
/** Initializes the search database map using leaflet and mapbox. */
function buildAndShowMap(loadFunc) {                                            console.log('buildAndShowMap. loadFunc = %O', loadFunc);
    locRcrds = locRcrds || _u.getDataFromStorage('location');
    map = getMapInstance();
    map.setMaxBounds(getMapBounds());
    map.on('click', logLatLng);
    map.on('load', loadFunc);
    addMapTiles();
    addMarkerLegend();
    addIntCountLegend();
    addTipsLegend();
    map.setView([22,22], 2); console.log('map built.')
    hidePopUpMsg();
}
function getMapInstance() {
    if (map) { map.remove(); }
    popups = {};
    return L.map('map'); 
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
function addMarkerLegend() {
    const legend = L.control({position: 'bottomright'});
    legend.onAdd = addMarkerLegendHtml;
    legend.addTo(map);
}
function addMarkerLegendHtml(map) {
    const div = _u.buildElem('div', { class: 'info legend flex-col'});
    div.innerHTML += `<h4> Interaction Density </h4>`;
    addDensityHtml()
    return div;
    
    function addDensityHtml() {    
        const densities = ['Light', 'Medium', 'Heavy'];
        const colors = ['110, 204, 57', '240, 194, 12', '241, 128, 23'];

        for (var i = 0; i < densities.length; i++) {
            div.innerHTML +=
                `<span><i style="background: rgba(${colors[i]}, .9);"></i> 
                    ${densities[i]}</span>`;
        }
    }
};
function addIntCountLegend() {
    const legend = L.control({position: 'topright'});
    legend.onAdd = addIntCntLegendHtml;
    legend.addTo(map);
}
function addIntCntLegendHtml(map) {
    const div = _u.buildElem('div', { id: 'int-legend', class: 'info legend flex-col'});
    return div;
}
function fillIntCntLegend(shown, notShown) {
    const legend = $('#int-legend')[0];
    legend.innerHTML = `<h4>${shown + notShown} Interactions Total </h4>`;
    legend.innerHTML += `<span><b>${shown} shown on map</b></span><span>
        ${notShown} without GPS data</span>`;
}
function addTipsLegend() {
    const legend = L.control({position: 'bottomleft'});
    legend.onAdd = addViewTips;
    legend.addTo(map);
}
function addViewTips(map) {
    const div = _u.buildElem('div', { id: 'tips-legend', class: 'info legend flex-col'});
    $(div).css({'text-align': 'center'});
    div.innerHTML = `<b>- Map Tips -</b>
        - Click on a marker to keep popup open.`;
    return div;
}
export function initMap(rcrds) {                                                console.log('attempting to initMap')
    locRcrds = rcrds;
    waitForStorageAndLoadMap(addAllIntMrkrsToMap);                                                 
}
function waitForStorageAndLoadMap(onLoad) {                                     console.log('waiting for geojson');
    return geoJsonDataAvailable() ? 
        buildAndShowMap(onLoad) : 
        window.setTimeout(waitForStorageAndLoadMap.bind(null, onLoad), 500);
}
/** ================= Show Interaction Sets on Map ========================== */
/** Shows the interactions displayed in the data-table on the map. */
export function showInts(focus, tableData, rcrds) {                             //console.log('----------- showInts. tableData = %O', tableData);
    locRcrds = rcrds;
    waitForStorageAndLoadMap(showIntsOnMap.bind(null, focus, tableData));
} 
function showIntsOnMap(focus, data) {                                           console.log('showIntsOnMap! data = %O', data);
    const keys = Object.keys(data);                                     
    addIntCntsToLegend(data);
    addIntMarkersToMap(focus, data);
    zoomIfAllInSameRegion(data);
}
function addIntCntsToLegend(data) {
    let shwn = 0, notShwn = 0;
    Object.keys(data).forEach(trackIntCnts);
    fillIntCntLegend(shwn, notShwn);

    function trackIntCnts(geoId) {  
        if (geoId === 'none') { notShwn += data[geoId].ttl; 
        } else { shwn += data[geoId].ttl; }
    }
}
function addIntMarkersToMap(focus, data) {                                      //console.log('addMarkersToMap. data = %O', data);
    for (let geoId in data) {
        if (geoId === 'none') { continue; }
        buildAndAddIntMarker(focus, geoId, data[geoId]);
    }
}
function buildAndAddIntMarker(focus, geoId, data) {  
    const coords = getCoords(geoId);
    const intCnt = data.ttl;
    const MapMarker = buildIntMarker(focus, intCnt, coords, data);              //console.log('buildAndAddIntMarkers. intCnt = [%s] data = %O', intCnt, data);
    map.addLayer(MapMarker.layer);
}
function buildIntMarker(focus, intCnt, coords, data) {  
     return intCnt === 1 ? 
        new MM.IntMarker(focus, coords, data) : 
        new MM.IntCluster(map, intCnt, focus, coords, data);
}
function getCoords(geoId) {
    const geoJson = _u.getGeoJsonEntity(geoId);                         
    return getLatLngObj(geoJson.centerPoint);
}
function zoomIfAllInSameRegion(data) {  
    let region, latLng;
    getRegionData();
    zoomIfSharedRegion();

    function getRegionData() {
        locRcrds = _u.getDataFromStorage('location');
        for (let geoId in data) {
            if (geoId === 'none') { continue; }
            if (region === false) { return; }
            getRegion(data[geoId], geoId);
        }
    }
    function getRegion(geoData, geoId) {
        geoData.locs.forEach(loc => {  
            if (!latLng) { latLng = getCenterCoordsOfLoc(loc, geoId); }
            const regionName = getRegionName(loc);
            region = regionName == region || !region ? regionName : false;  
        });
    }
    function getRegionName(loc) {
        return loc.region ? loc.region.displayName : loc.displayName;  
    }
    function zoomIfSharedRegion() {  
        if (region) { map.setView(latLng, 3, {animate: true}); }
    }
}
/** ======================= Show Location on Map ============================ */
/** Centers the map on the location and zooms according to type of location. */
export function showLoc(id, zoom, rcrds) {                 
    locRcrds = rcrds;        
    waitForStorageAndLoadMap(showLocInMap.bind(null, id, zoom));
    addAllIntMrkrsToMap();
}
function showLocInMap(id, zoom) {
    const loc = locRcrds[id];                                                   console.log('show loc = %O, zoom = %s', loc, zoom)
    const latLng = getCenterCoordsOfLoc(loc, loc.geoJsonId);                    //console.log('point = %s', point);
    if (!latLng) { return noGeoDataErr(); }
    const popup = popups[loc.displayName] || buildLocPopup(loc, latLng);
    popup.setContent(MM.getLocationSummaryHtml(loc, null, locRcrds));  
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
    let ttlShown = 0, 
    ttlNotShown = 0;
    const regions = getRegionLocs();
    addMapMarkers();
    fillIntCntLegend(ttlShown, ttlNotShown);

    function addMapMarkers() {
        for (let id in regions) { 
            trackIntCnt(regions[id]);
            addMarkersForRegion(regions[id]) 
        };
    }
    function trackIntCnt(region) {
        if (region.displayName === "Unspecified") { 
            return ttlNotShown += region.totalInts; 
        }
        ttlShown += region.totalInts;
    }
} 
function getRegionLocs() {
    const regionIds = _u.getDataFromStorage('topRegionNames');
    return Object.values(regionIds).map(id => locRcrds[id]);
}
function addMarkersForRegion(region) {
    if (region.displayName === "Unspecified") { return; }
    addMarkersForLocAndChildren(region);
}
function addMarkersForLocAndChildren(topLoc) {                                 
    if (!topLoc.totalInts) { return; }                                          //console.log('addMarkersForLocAndChildren for [%s] = %O', topLoc.displayName, topLoc);
    let intCnt = topLoc.totalInts; 
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
    function buildLocationIntMarkers(loc, locIntCnt) {                          //console.log('buildLocationIntMarkers for [%s]', loc.displayName, loc);
        if (loc.children.length) { return addMarkersForLocAndChildren(loc); }
        if (!locIntCnt) { return; }
        buildLocationMarkers(locIntCnt, null, loc);
    }
    function buildLocationMarkers(intCnt, subCnt, loc) {                        //console.log('   buildLocationMarkers for [%s] = %O', loc.displayName, loc);
        const latLng = getCenterCoordsOfLoc(loc, loc.geoJsonId);                //console.log('        latLng = ', latLng)
        if (!latLng) { return logNoGeoJsonError(loc); }
        addMarkerForEachInteraction(intCnt, subCnt, latLng, loc);
    }
    function logNoGeoJsonError(loc) {
        if (!loc.interactions.length) { return null; }
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
/* -------------- Helpers ------------------------------------------------ */
function getCenterCoordsOfLoc(loc, geoJsonId) { 
    if (!geoJsonId) { return false; }                                           //console.log('geoJson obj = %O', geoJson[geoJsonId]);
    const locGeoJson = _u.getGeoJsonEntity(geoJsonId);
    return locGeoJson.centerPoint ? 
        getLatLngObj(locGeoJson.centerPoint) 
        : getLocCenterPoint(loc, locGeoJson);
} 
/** Return a leaflet LatLng object from the GeoJSON Long, Lat point */
function getLatLngObj(point) {                                                  //console.log('point = ', point)
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
    const MapMarker = intCnt === 1 ? 
        new MM.LocMarker(subCnt, latLng, loc, locRcrds) :
        new MM.LocCluster(map, intCnt, subCnt, latLng, loc, locRcrds);
    popups[loc.displayName] = MapMarker.popup;  
    map.addLayer(MapMarker.layer);
} /* End addMarkerForEachInteraction */
/* --- Table Popup --- */
// function showPopUpMsg(msg) {                                                    //console.log("showPopUpMsg. msg = ", msg)
//     const popUpMsg = msg || 'Loading...';
//     $('#db-popup').text(popUpMsg);
//     $('#db-popup').addClass('loading'); //used in testing
//     $('#db-popup, #db-overlay').show();
//     fadeTable();
// }
function hidePopUpMsg() {
    $('#db-popup, #db-overlay').hide();
    $('#db-popup').removeClass('loading'); //used in testing
    showTable();
}
// function fadeTable() {
//     $('#borderLayout_eRootPanel, #tbl-tools, #tbl-opts').fadeTo(100, .3);
// }
function showTable() {
    $('#borderLayout_eRootPanel, #tbl-tools, #tbl-opts').fadeTo(100, 1);
}