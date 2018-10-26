/** 
 * This file is responsible for interactions with the google maps API.
 * Displays the map on the search database page.
 */
/**
 * Exports:
 *   addVolatileMapPin
 *   initFormMap
 *   initMap
 *   showInts
 *   showLoc
 */
import * as _u from './util.js';
import * as db_page from './db-page.js';
import * as db_forms from './db-forms.js';
import * as MM from './map-markers.js'; 

let locRcrds, map, geoCoder, volatile = {}, popups = {};

initDb();
requireCss();
fixLeafletBug();

/** =================== Init Methods ======================================== */
function requireCss() {
    require('../../../node_modules/leaflet/dist/leaflet.css');
    require('../../../node_modules/leaflet.markercluster/dist/MarkerCluster.Default.css');
    require('../../../node_modules/leaflet.markercluster/dist/MarkerCluster.css');
    require('../../../node_modules/leaflet-control-geocoder/dist/Control.Geocoder.css');
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
/*=========================== Shared Methods =================================*/
// Test for when geoJsonData is erroring and then redownload the data
function waitForDataThenContinue(cb) {                                          console.log('waiting for geojson');
    return geoJsonDataAvailable() ? cb() : 
        window.setTimeout(waitForDataThenContinue.bind(null, cb), 500);
}
/** Initializes the map using leaflet and mapbox. */
function buildAndShowMap(loadFunc, mapId, type) {                               console.log('buildAndShowMap. loadFunc = %O mapId = %s', loadFunc, mapId);
    map = getMapInstance(mapId);
    map.setMaxBounds(getMapBounds());
    map.on('click', showLatLngPopup.bind(null, type));
    map.on('load', loadFunc);
    addMapTiles(mapId);
    addGeoCoderToMap();
    addTipsLegend();
    if (mapId !== 'loc-map') { buildSrchPgMap(); }
    L.control.scale({position: 'bottomright'}).addTo(map);
    map.setView([22,22], 2);                                                    console.log('map built.')
}
function getMapInstance(mapId) {
    if (map) { map.remove(); }
    popups = {};
    return L.map(mapId); 
}
function showLatLngPopup(type, e) {
    const latLng = `Lat, Lon: ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
    if (type !== 'create') { return console.log(latLng); }
    new L.Popup().setLatLng(e.latlng).setContent(latLng).openOn(map);
}
function getMapBounds() {
    const southWest = L.latLng(-100, 200);
    const northEast = L.latLng(100, -200);
    return L.latLngBounds(southWest, northEast);
}
function addMapTiles(mapId) {
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        minZoom: mapId === 'loc-map' ? 1 : 3, //Don't zoom out passed 
        maxZoom: 16,
        id: 'mapbox.run-bike-hike',
        accessToken: 'pk.eyJ1IjoiYmF0cGxhbnQiLCJhIjoiY2poNmw5ZGVsMDAxZzJ4cnpxY3V0bGprYSJ9.pbszY5VsvzGjHeNMx0Jokw'
    }).addTo(map);
}
/** A Map Tips legend in the bottom left of the map. Tips toggle open on click. */
function addTipsLegend() {
    const legend = L.control({position: 'bottomleft'});
    legend.onAdd = addViewTips;
    legend.addTo(map);
}
function addViewTips(map) {
    const div = _u.buildElem('div', { id: 'tips-legend', class: 'info legend flex-col'});
    div.innerHTML = getDefaultTipTxt();
    $(div).click(toggleTips)
    return div;
}
function getDefaultTipTxt() {
    return `<b>- (Click to Expand Map Tips) -</b>`;
}
function setExpandedTipText() {
    $('#tips-legend').html(`
        <b><center>- (Click to Collapse Map Tips) -</center>
        - Click on a marker to keep its popup open.<br>
        - Hover over truncated(...) text to show full text.`);
    $('#tips-legend').data('expanded', true);
}
function setDefaultTipText() {
    $('#tips-legend').html(getDefaultTipTxt());
    $('#tips-legend').data('expanded', false);
}
function toggleTips() {
    return $('#tips-legend').data('expanded') ? 
        setDefaultTipText() : setExpandedTipText();
}
function addGeoCoderToMap() {
    const opts = getGeocoderOptions();
    L.Control.geocoder(opts).on('markgeocode', drawPolygonAndUpdateUi).addTo(map);  
    $('.leaflet-control-geocoder').attr('title', `Search by name or coordinates`);
}
function getGeocoderOptions() {
    geoCoder = L.Control.Geocoder.nominatim(); 
    return {
        defaultMarkGeocode: false,
        position: 'topleft',
        geocoder: geoCoder
    };
}
function drawPolygonAndUpdateUi(e) {                                            console.log("geocoding results = %O", e);
    drawPolygon(e.geocode.bbox, e.geocode.properties.address);
    showNearbyLocationsAndUpdateForm(e.geocode.properties);
}
function drawPolygon(bbox, address) {
    if (volatile.poly) { removePreviousPoly(); }
    if (ifCntryResult(address)) { return; } 
    volatile.poly = L.polygon([
        bbox.getSouthEast(),
        bbox.getNorthEast(),
        bbox.getNorthWest(),
        bbox.getSouthWest()
    ]).addTo(map);
    map.fitBounds(volatile.poly.getBounds(), { padding: [10, 10] });
}
function removePreviousPoly() {
    map.removeLayer(volatile.poly); 
    volatile.poly = null;
}
/** Returns true if the only data returned is Country data. */
function ifCntryResult(address) {  
    return Object.keys(address).every(k => {  
        return ['country', 'country_code'].indexOf(k) !== -1
    });
}
/*============== Search Database Page Methods ================================*/
/** Initializes the legends used for the search page map. */
function buildSrchPgMap() {
    addMarkerLegend();
    addIntCountLegend();
    hidePopUpMsg();
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
/** ---------------- Init Map ----------------------------------------------- */
export function initMap(rcrds) {                                                console.log('attempting to initMap')
    locRcrds = rcrds;
    waitForDataThenContinue(buildAndShowMap.bind(null, addAllIntMrkrsToMap, 'map'));                                                 
}
/** ---------------- Show Location on Map ----------------------------------- */
/** Centers the map on the location and zooms according to type of location. */
export function showLoc(id, zoom, rcrds) {                 
    locRcrds = rcrds;        
    waitForDataThenContinue(buildAndShowMap.bind(null, showLocInMap, 'map'));
    
    function showLocInMap() {
        const loc = locRcrds[id];                                               console.log('show loc = %O, zoom = %s', loc, zoom)
        const latLng = getCenterCoordsOfLoc(loc, loc.geoJsonId); 
        if (!latLng) { return noGeoDataErr(); }
        zoomToLocAndShowPopup(loc, latLng, zoom);
        addAllIntMrkrsToMap();

        function noGeoDataErr() {
            console.log('###### No geoJson found for geoJson [%s] ###########', id);
        }
    }
}
function zoomToLocAndShowPopup(loc, latLng, zoom) {
    const popup = popups[loc.displayName] || buildLocPopup(loc, latLng);
    popup.setContent(MM.getLocationSummaryHtml(loc, locRcrds));  
    popup.options.autoClose = false;
    map.openPopup(popup); 
    map.setView(latLng, zoom, {animate: true});  
}
function buildLocPopup(loc, latLng) {  
    const popup = L.popup().setLatLng(latLng).setContent('');
    popups[loc.displayName] = popup;  
    return popup;
}
/* --- Show All Interaction Markers --- */
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
    buildMarkersForLocChildren(topLoc.children);                               
    if (intCnt) { buildLocationMarkers(intCnt, topLoc); }

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
        buildLocationMarkers(locIntCnt, loc);
    }
    function buildLocationMarkers(intCnt, loc) {                                //console.log('   buildLocationMarkers for [%s] = %O', loc.displayName, loc);
        const latLng = getCenterCoordsOfLoc(loc, loc.geoJsonId);                //console.log('        latLng = ', latLng)
        if (!latLng) { return logNoGeoJsonError(loc); }
        addMarkerForEachInteraction(intCnt, latLng, loc);
    }
    function logNoGeoJsonError(loc) {
        if (!loc.interactions.length) { return null; }
        if (locIsHabitatOfTopLoc(loc)) { return; }
        // console.log('###### No geoJson for [%s] %O', loc.displayName, loc)
    }
    function locIsHabitatOfTopLoc(loc) {
        const subName = loc.displayName.split('-')[0];
        const topName = topLoc.displayName;  
        return topName.indexOf(subName) !== -1;
    }
} /* End addMarkersForLocAndChildren */
/**----------------- Show Interaction Sets on Map --------------------------- */
/** Shows the interactions displayed in the data-table on the map. */
export function showInts(focus, tableData, rcrds) {                             //console.log('----------- showInts. tableData = %O', tableData);
    locRcrds = rcrds;
    waitForDataThenContinue(buildAndShowMap.bind(null, showIntsOnMap, 'map'));                                                 
    
    function showIntsOnMap() {                                                  console.log('showIntsOnMap! data = %O', tableData);
        const keys = Object.keys(tableData);                                     
        addIntCntsToLegend(tableData);
        addIntMarkersToMap(focus, tableData);
        zoomIfAllInSameRegion(tableData);
    }
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
    return getLatLngObj(geoJson.displayPoint);
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
/* -------------- Helpers ------------------------------------------------ */
function getCenterCoordsOfLoc(loc, geoJsonId) { 
    if (!geoJsonId) { return false; }                                           //console.log('geoJson obj = %O', geoJson[geoJsonId]);
    const locGeoJson = _u.getGeoJsonEntity(geoJsonId);  
    return getLatLngObj(locGeoJson.displayPoint); 
} 
/** Return a leaflet LatLng object from the GeoJSON Long, Lat point */
function getLatLngObj(point) {  
    if (!point) { return getLocCenterPoint(loc, locGeoJson); }                  //console.log('point = ', point)
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
function addMarkerForEachInteraction(intCnt, latLng, loc) {                     //console.log('       adding [%s] markers at [%O]', intCnt, latLng);
    const MapMarker = intCnt === 1 ? 
        new MM.LocMarker(latLng, loc, locRcrds) :
        new MM.LocCluster(map, intCnt, latLng, loc, locRcrds);
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
/*===================== Location Form Methods ================================*/
/** Shows all location in containing country and selects the country in the form. */
function showNearbyLocationsAndUpdateForm(results) {                            //console.log('showNearbyLocationsAndUpdateForm = %O', results);
    if (map._container.id !== 'loc-map' || !results) { return; }
    const cntryCode = results.address.country_code ? 
        results.address.country_code.toUpperCase() : null;
    if (!cntryCode) { return; console.log('########## No country found!!! Data = %O, Code = [%s]', data, data.country_code); }
    const cntryId = _u.getDataFromStorage('countryCodes')[cntryCode];           //console.log('cntryId = ', cntryId);
    volatile.prnt = cntryId; 
    $('#Country-Region-sel')[0].selectize.addItem(cntryId, 'silent');
    addParentLocDataToMap(cntryId, volatile.poly);
}
export function addVolatileMapPin(val, type) {                                  //console.log('addVolatileMapPin')
    if (!val || !gpsFieldsFilled()) { return removePreviousMapPin(); }
    const latLng = getMapPinCoords();
    if (!latLng) { return; }                                                    
    if (type === 'edit') { addEditFormMapPin(latLng); 
    } else {
        geoCoder.reverse(
            latLng, 1, updateUiAfterFormGeocode.bind(null, latLng), null);
    }
    clearLocCountLegend();
}
function addEditFormMapPin(latLng) {                                            //console.log('addEditFormMapPin. pin = %O', volatile.pin)
    if (volatile.pin) { map.removeLayer(volatile.pin.layer); }
    volatile.pin = new MM.LocMarker(latLng, null, null, 'edit-form');
    map.addLayer(volatile.pin.layer);
}
/* ---- Get GPS Field Values or Report Field Err ---- */
function gpsFieldsFilled() {
    return ['Latitude', 'Longitude'].every(field => {
        return $(`#${field}_row input`).val();
    });
}
function getMapPinCoords() {
    if (ifCoordFieldHasErr()) { return false; }
    return L.latLng($('#Latitude_row input').val(), $('#Longitude_row input').val());
}
function ifCoordFieldHasErr() {  
    const errField = coordHasErr('Latitude') ? 'Latitude' : 
        coordHasErr('Longitude') ? 'Longitude' : false;
    if (!errField) { return false; }
    db_forms.locCoordErr(errField);
    return true;
}
function coordHasErr(field) {
    const coord = $(`#${field}_row input`).val();
    const max = field === 'Latitude' ? 90 : 180;
    return isNaN(coord) ? true : coord > max ? true : false;    
}
/* ---- Update Form UI After Reverse Geocode Success ---- */
/** 
 * Draws containing polygon on map, shows all locations in containing country,
 * and adds a map pin for the entered coodinates. 
 */
function updateUiAfterFormGeocode(latLng, results) {                            //console.log('updateUiAfterFormGeocode. point = %O results = %O', latLng, results);
    if (!results.length) { return updateMapPin(latLng, null); }
    updateMapPin(latLng, results[0]);
}
function drawResultingPolygon(bbox) {
    for (var j = 0; j < 4; j++) bbox[j] = parseFloat(bbox[j]);
    drawPolygon(L.latLngBounds([bbox[0], bbox[2]], [bbox[1], bbox[3]]));
}
function updateMapPin(latLng, results) {                                        //console.log('updateMapPin. point = %O name = %O', latLng, name);
    const loc = results ? buildLocData(results.properties, results.name) : null;
    replaceMapPin(latLng, loc);  
}
function buildLocData(data, name) {                                             //console.log('buildLocData. data = %O', data);
    return {
        cntryId: _u.getDataFromStorage('countryCodes')[data.address.country_code.toUpperCase()],
        name: name
    };
}
function replaceMapPin(latLng, loc) {
    const marker = new MM.LocMarker(latLng, loc, null, 'new-loc');
    removePreviousMapPin(loc);
    if (loc) { 
        $('#Country-sel')[0].selectize.addItem(loc.cntryId, 'silent'); 
        showChildLocs(loc.cntryId, null);
    }
    addPinToMap(latLng, marker.layer);   
}
function removePreviousMapPin(loc) { 
    if (!volatile.pin) { return volatile.loc = loc; }  
    map.removeLayer(volatile.pin);
    resetPinLoc(loc);
}
function resetPinLoc(loc) {
    volatile.prevLoc = volatile.loc; 
    volatile.loc = loc;
}
function addPinToMap(latLng, pin) {
    volatile.pin = pin;
    map.addLayer(pin);
    map.setView(latLng, 8, {animate:true});
}
export function initFormMap(parent, rcrds, type) {                              console.log('attempting to initMap. type = ', type);
    locRcrds = locRcrds || rcrds;  
    if (!type && volatile.prnt && parent == volatile.prnt) { return; }
    waitForDataThenContinue(
        buildAndShowMap.bind(null, finishFormMap.bind(null, parent, type), 'loc-map', type));  
} 
function finishFormMap(parentId, type) {
    addLocCountLegend();
    if (type !== 'create') {
        addNewLocBttn();
    } else {
        addClickToCreateLocBttn();
        addDrawNewLocBoundaryBttn();
        addMarkerDragBttn();
    }
    if (!parentId) { return; }
    addParentLocDataToMap(parentId, null, type);
}
/** Draws containing country polygon on map and displays all locations within. */
function addParentLocDataToMap(id, skipZoom, type) {  
    const loc = locRcrds[id];
    const geoJson = loc.geoJsonId ? _u.getGeoJsonEntity(loc.geoJsonId) : false;
    const hasPolyData = geoJson && geoJson.type !== 'Point';
    if (hasPolyData) { drawLocPolygon(loc, geoJson, skipZoom); }
    const zoomLvl = hasPolyData || skipZoom ? false : 
        loc.locationType.displayName === 'Region' ? 3 : 8;
    if (type === 'edit') { return; }
    showChildLocs(id, zoomLvl);
}
/** Draws polygon on map and zooms unless skipZoom is a truthy value. */
function drawLocPolygon(loc, geoJson, skipZoom) {                               //console.log('drawing country on map');
    let feature = buildFeature(loc, geoJson);
    volatile.poly = L.geoJSON(feature);                                         
    volatile.poly.addTo(map);
    if (skipZoom) { return; }
    map.fitBounds(volatile.poly.getBounds(), { padding: [10, 10] });
}
/** Adds all child locations to map and zooms according to passed zoomLvl. */
function showChildLocs(id, zoomLvl) {  
    const prnt = locRcrds[id];
    const prntLatLng = getCenterCoordsOfLoc(prnt, prnt.geoJsonId);
    clearPreviousMarkers();
    addChildLocsToMap(prnt, prntLatLng);
    if (!zoomLvl || !prntLatLng) { return; }
    map.setView(prntLatLng, zoomLvl, {animate: true});  
}
function clearPreviousMarkers() {
    if (!volatile.markers) { return volatile.markers = []; } 
    volatile.markers.forEach(m => map.removeLayer(m)); 
    volatile.markers = [];
}
function addChildLocsToMap(prnt, coords) {
    const noGpsLocs = [];
    const locs = getChildLocData(prnt);   
    addLocsWithGpsDataToMap();
    addCountToLegend(locs.length, noGpsLocs.length, prnt);
    if (noGpsLocs.length) { addLocsWithoutGpsDataToMap(noGpsLocs.length); }

    function addLocsWithGpsDataToMap() {
        locs.forEach(loc => {
            if (prnt.geoJsonId == loc.geoJsonId) { return noGpsLocs.push(loc); }
            const latLng = getCenterCoordsOfLoc(loc, loc.geoJsonId);
            if (!latLng) { return noGpsLocs.push(loc); }
            const tag = 'form'+ (loc.locationType.displayName === 'Country' ? '-c' : '');
            const Marker = new MM.LocMarker(latLng, loc, locRcrds, tag);
            map.addLayer(Marker.layer);
            volatile.markers.push(Marker.layer);
        });
    }
    function addLocsWithoutGpsDataToMap(cnt) {  
        if (!coords) { return; }
        const Marker = cnt === 1 ? 
            new MM.LocMarker(coords, noGpsLocs, locRcrds, 'form-noGps') : 
            new MM.LocCluster(map, cnt, coords, noGpsLocs, locRcrds, 'form-noGps');
        map.addLayer(Marker.layer);
        volatile.markers.push(Marker.layer);
    }
}
/** Return all sub-locs, except country-habitat locations with no interactions.*/
function getChildLocData(prnt) {                                               
    return prnt.children.map(id => locRcrds[id]).filter(loc => {
        return loc.locationType.displayName !== 'Habitat' || loc.totalInts > 0;        
    });
}
/*--- Location Count Legend ---*/
function addLocCountLegend() {
    const legend = L.control({position: 'topright'});
    legend.onAdd = addLocCountHtml;
    legend.addTo(map);
}
function addLocCountHtml() {
    return _u.buildElem('div', { id: 'cnt-legend', class: 'info legend flex-col'});
}
function addCountToLegend(ttlLocs, noGpsDataCnt, prnt) {
    const noGpsDataHtml = noGpsDataCnt === 0 ? null : 
        `<span style="align-self: flex-end;">${noGpsDataCnt} without GPS data</span>`;
    const plural = ttlLocs === 1 ? '' : 's';    
    let name = getLocName(prnt.displayName);
    $('#cnt-legend').html(`
        <h3 title='${prnt.displayName}'>${ttlLocs} location${plural} in ${name}</h3>
        ${noGpsDataHtml ? noGpsDataHtml : ''}`);
}
function clearLocCountLegend() {
    $('#cnt-legend').html('');
}
function getLocName(name) {
    name = name.split('[')[0];                                
    return name.length < 22 ? name : name.substring(0, 19)+'...';
}
/*--- Create New Location Button ---*/
function addNewLocBttn() {
    addNewLocControl();
    L.control.create({ position: 'topleft' }).addTo(map);
}
function addNewLocControl() {
    L.Control.Create = L.Control.extend({
        onAdd: function(map) {
            const bttn = createNewLocBttn();
            L.DomEvent.on(bttn, 'click', createNewLoc);
            return bttn;
        },
        onRemove: function(map) {}
    });
    L.control.create = function(opts) {return new L.Control.Create(opts);}
}
function createNewLocBttn() {
    const className = 'custom-icon leaflet-control-create',
        container = L.DomUtil.create('div', className),
        button = L.DomUtil.create('input', className + '-icon', container);
    button.type = 'button';
    $(container).attr('title', "Create New Location").append(button);
    return container;
}
function createNewLoc() {                                                       console.log('Create new location!')
    db_forms.initLocForm('create');
}
/*--- Click To Create New Location Button ---*/
function addClickToCreateLocBttn() {
    addNewLocHereControl();
    L.control.createHere({ position: 'topleft' }).addTo(map);
}
function addNewLocHereControl() {
    L.Control.CreateHere = L.Control.extend({
        onAdd: function(map) {
            const bttn = createNewLocHereBttn();
            L.DomEvent.on(bttn, 'click', createNewLocHere);
            return bttn;
        },
        onRemove: function(map) {}
    });
    L.control.createHere = function(opts) {return new L.Control.CreateHere(opts);}
}
function createNewLocHereBttn() {
    const className = 'custom-icon leaflet-control-click-create',
        container = L.DomUtil.create('div', className),
        button = L.DomUtil.create('input', className + '-icon', container);
    button.type = 'button';
    
    $(button).attr('disabled', 'disabled').css('opacity', '.666');
    $(container).attr('title', "Click on map to select location position").append(button);
    return container;
}
function createNewLocHere() {                                                   console.log('Create new location with click!')

}
/*--- Draw Location Boundary Bttn ---*/
function addDrawNewLocBoundaryBttn() {
    addDrawLocBoundsCountrol();
    L.control.draw({ position: 'topleft' }).addTo(map);
}
function addDrawLocBoundsCountrol() {
    L.Control.Draw = L.Control.extend({
        onAdd: function(map) {
            const bttn = createDrawLocBttn();
            L.DomEvent.on(bttn, 'click', drawNewLocBounds);
            return bttn;
        },
        onRemove: function(map) {}
    });
    L.control.draw = function(opts) {return new L.Control.Draw(opts);}
}
function createDrawLocBttn() {
    const className = 'custom-icon leaflet-control-draw',
        container = L.DomUtil.create('div', className),
        button = L.DomUtil.create('input', className + '-icon', container);
    button.type = 'button';
    
    $(button).attr('disabled', 'disabled').css('opacity', '.666');
    $(container).attr('title', "Draw new location boundary on map").append(button);
    return container;
}
function drawNewLocBounds() {                                                   console.log('Draw new location boundary!')

}
/*--- Drag Marker Bttn ---*/
function addMarkerDragBttn() {
    addDragControl();
    L.control.drag({ position: 'topleft' }).addTo(map);
}
function addDragControl() {
    L.Control.Drag = L.Control.extend({
        onAdd: function(map) {
            const bttn = createDragBttn();
            L.DomEvent.on(bttn, 'click', enableDrag);
            return bttn;
        },
        onRemove: function(map) {}
    });
    L.control.drag = function(opts) {return new L.Control.Drag(opts);}
}
function createDragBttn() {
    const className = 'custom-icon leaflet-control-drag',
        container = L.DomUtil.create('div', className),
        button = L.DomUtil.create('input', className + '-icon', container);
    button.type = 'button';
    
    $(button).attr('disabled', 'disabled').css('opacity', '.666');
    $(container).attr('title', "Drag a new location's map pin").append(button);
    return container;
}
function enableDrag() {                                                         console.log('drag enabled!')

}