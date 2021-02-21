/**
 * This file is responsible for interactions with the google maps API.
 * Displays the map on the search database page.
 */
/**
 * Exports:
 *   addVolatileMapPin
 *   clearMemory
 *   initFormMap
 *   showInts
 *   showLocOnMap
 *   buildLocMap
 */
import { _cmbx, _db, _el } from '~util';
import { _table, _ui } from '~db';
import * as MM from './map-markers.js';
import * as mapEl from './map-elems.js';
import buildMapDataObj from './map-data.js';

let app;

requireCss();
fixLeafletBug();
initMapState();
/**
 * Added on init and removed from memory on map close
 *     data - (k) entity, (v) all entity data
 *         locs, ints, geo, taxa
 *     geoCoder - used for reverse geocode
 *     map - leaflet map instance
 *     popups - (k) location name, (v) popup api
 *     volatile - container for volatile map objects:
 *         loc -
 *         markers -
 *         pin - dropped on click in location forms
 *         poly - country oulined with search results and when clicking on map
 *         prevLoc -
 *         prnt -
 */
function initMapState() {
    app = {
        data: {},
        flags: {/*
            onClickDropPin
        */},
        geocoder: null,
        map: null,
        popups: {},
        volatile: {}
    };
}
export function clearMemory() {                                                 //console.log('clearing map memory')
    initMapState();
}
export function getMapState() {
    return app;
}
export function setMapState(data, k) {
    if (k) { return app[k] = data; }
    app = data;
}
/** =================== Init Methods ======================================== */
function requireCss() {
    require('leaflet/dist/leaflet.css');
    require('leaflet.markercluster/dist/MarkerCluster.Default.css');
    require('leaflet.markercluster/dist/MarkerCluster.css');
    require('leaflet-control-geocoder/dist/Control.Geocoder.css');
}
/** For more information on this fix: github.com/PaulLeCam/react-leaflet/issues/255 */
function fixLeafletBug() {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
      iconUrl: require('leaflet/dist/images/marker-icon.png').default,
      shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
    });
}
/*=========================== Shared Methods =================================*/
function downloadDataAndBuildMap(loadFunc, mapId, type) {
    const map = { geoJson: 'geo', interaction: 'ints', taxon: 'taxa' };
    return _db('getData', [Object.keys(map)]).then(data => {
        Object.keys(data).forEach(k => {app.data[map[k]] = data[k]});
        buildAndShowMap(loadFunc, mapId, type);
    });
}
/** Initializes the map using leaflet and mapbox. */
function buildAndShowMap(loadFunc, mapId, type) {                               //console.log('buildAndShowMap. loadFunc = %O mapId = %s', loadFunc, mapId);
    app.map = getMapInstance(mapId);
    app.map.setMaxBounds(getMapBounds());
    app.map.on('click', onMapClick.bind(null, type));
    app.map.on('load', loadFunc.bind(null, mapId));
    addMapTiles(mapId);
    addGeoCoderToMap(mapId);
    addTipsLegend();
    if (mapId !== 'form-map') { buildSrchPgMap(); }
    L.control.scale({position: 'bottomright'}).addTo(app.map);
    app.map.setView([22,22], 2);                                                //console.log('map built.')
}
function getMapInstance(mapId) {
    if (app.map) { app.map.remove(); }
    $(mapId).empty();
    app.popups = {};
    return L.map(mapId);
}
/**
 * Either displays coordinates at click location; or drops a new map pin and updates
 * the form.
 */
function onMapClick(type, e) {
    if (ifClickOnMapTool(e)) { return; }
    showLatLngPopup(type, e);
}
/** Catches clicks on map buttons or tools. */
function ifClickOnMapTool(e) {                                                  //console.log('e = %O', e)
    let elemClass = getClickedElemClass(e.originalEvent.target);
    return typeof elemClass === 'string' && elemClass.includes('leaflet-control');
}
function getClickedElemClass(elem) {
    return elem.className ? elem.className :
        elem._container ? elem._container.className : '';
}
function showLatLngPopup(type, e) {
    if (['create', 'edit'].indexOf(type) === -1) { return showCoordPopup(e); }
    return geocodeAndShowPopup(type, e);
}
function showCoordPopup(e) {
    const latLngTxt = `Lat, Lon: ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
    new L.Popup().setLatLng(e.latlng).setContent(latLngTxt).openOn(app.map);
}
function geocodeAndShowPopup(type, e) {
    $('#form-map').css('cursor', 'progress');
    app.geoCoder.reverse(
        e.latlng, 1, updateUiAfterFormGeocode.bind(null, e.latlng, type), null);
}
function getMapBounds() {
    const southWest = L.latLng(-100, 200);
    const northEast = L.latLng(100, -200);
    return L.latLngBounds(southWest, northEast);
}
function addMapTiles(mapId) {
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        minZoom: mapId === 'form-map' ? 1 : 3, //Don't zoom out passed
        maxZoom: 16,
        tileSize: 512,
        id: 'mapbox/satellite-streets-v11',
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoieXF1ZXNlcmFzYXJhaCIsImEiOiJja2ZteWVxMXAxazZ3MnNvMGluZ283aWp3In0.X0eZqTze66E9PI5y8FBmmg',
        // accessToken: 'pk.eyJ1IjoiYmF0cGxhbnQiLCJhIjoiY2poNmw5ZGVsMDAxZzJ4cnpxY3V0bGprYSJ9.pbszY5VsvzGjHeNMx0Jokw'
    }).addTo(app.map);
}
/** A Map Tips legend in the bottom left of the map. Tips toggle open on click. */
function addTipsLegend() {
    const legend = L.control({position: 'bottomleft'});
    legend.onAdd = addViewTips;
    legend.addTo(app.map);
}
function addViewTips(map) {
    const attr = { id: 'tips-legend', class: 'info legend flex-col'};
    const div = _el('getElem', ['div', attr]);
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
function addGeoCoderToMap(mapId) {
    const opts = getGeocoderOptions();
    L.Control.geocoder(opts).on(
        'markgeocode', drawPolygonAndUpdateUi.bind(null, mapId)).addTo(app.map);
    $('.leaflet-control-geocoder').attr('title', `Search by name or coordinates`);
}
function getGeocoderOptions() {
    app.geoCoder = L.Control.Geocoder.nominatim();
    return {
        defaultMarkGeocode: false,
        position: 'topleft',
        geocoder: app.geoCoder
    };
}
function drawPolygonAndUpdateUi(mapId, e) {                                     console.log("       --geocoding results = %O", e);
    drawPolygon(e.geocode.bbox, e.geocode.properties.address);
    if (mapId == 'form-map') {
        showNearbyLocationsAndUpdateForm(e.geocode.properties);
    }
}
function drawPolygon(bbox, address) {
    if (app.volatile.poly) { removePreviousPoly(); }
    if (ifCntryResult(address)) { return; }
    app.volatile.poly = L.polygon([
        bbox.getSouthEast(),
        bbox.getNorthEast(),
        bbox.getNorthWest(),
        bbox.getSouthWest()
    ]).addTo(app.map);
    app.map.fitBounds(app.volatile.poly.getBounds(), { padding: [10, 10] });
}
function removePreviousPoly() {
    app.map.removeLayer(app.volatile.poly);
    app.volatile.poly = null;
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
    _ui('hidePopupMsg');
}
function addMarkerLegend() {
    const legend = L.control({position: 'bottomright'});
    legend.onAdd = addMarkerLegendHtml;
    legend.addTo(app.map);
}
function addMarkerLegendHtml(map) {
    const div = _el('getElem', ['div', { class: 'info legend flex-col'}]);
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
    legend.addTo(app.map);
}
function addIntCntLegendHtml(map) {
    const attr = { id: 'int-legend', class: 'info legend flex-col'};
    const div = _el('getElem', ['div', attr]);
    return div;
}
function fillIntCntLegend(shown, notShown) {
    const legend = $('#int-legend')[0];
    legend.innerHTML = `<h4>${shown + notShown} Interactions Total </h4>`;
    legend.innerHTML += `<span><b>${shown} shown on map</b></span><span>
        ${notShown} without GPS data</span>`;
}
/** ---------------- Show Location on Map ----------------------------------- */
/** Centers the map on the location and zooms according to type of location. */
function showLoc(id, zoom, data) {
    app.data.locs = data;
    downloadDataAndBuildMap(showLocInMap, 'map');

    function showLocInMap() {
        const loc = app.data.locs[id];                                          console.log('               --show loc = %O, zoom = %s', loc, zoom)
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
    const popup = app.popups[loc.displayName] || buildLocPopup(loc, latLng);
    popup.setContent(MM.getLocationSummaryHtml(loc, app.data));
    popup.options.autoClose = false;
    app.map.openPopup(popup);
    app.map.setView(latLng, zoom, {animate: true});
}
function buildLocPopup(loc, latLng) {
    const popup = L.popup().setLatLng(latLng).setContent('');
    app.popups[loc.displayName] = popup;
    return popup;
}
/* --- Show All Interaction Markers --- */
/**
 * Default Location "Map View":
 * Adds a marker to the map for each interaction with any location data. Each
 * marker has a popup with either the location name and the country, just the
 * country or region name. Locations without gps data are added to markers at
 * the country level with "Unspecified" as the location name. Inside the app.popups
 * is a "Location" button that will replace the name popup with a
 * summary of the interactions at the location.
 */
function addAllIntMrkrsToMap() {
    let ttlShown = 0,
    ttlNotShown = 0,
    regions;

    getRegionLocs().then(locs => {
        regions = locs;
        addMapMarkers();
        fillIntCntLegend(ttlShown, ttlNotShown);
    });

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
    return Promise.resolve(_db('getData', ['topRegionNames']).then(data => {
        return Object.values(data).map(id => app.data.locs[id]);
    }));
}
function addMarkersForRegion(region) {
    if (region.displayName === "Unspecified") { return; }
    addMarkersForLocAndChildren(region);
}
function addMarkersForLocAndChildren(topLoc, fltrdSet) {
    if (!topLoc.totalInts) { return; }                                          //console.log('addMarkersForLocAndChildren for [%s] = %O', topLoc.displayName, topLoc);
    let intCnt = topLoc.interactions.length;
    buildMarkersForLocChildren(topLoc.children);
    if (intCnt) { buildLocationMarkers(intCnt, topLoc); }
    /**
     * When displaying a user-made set "list" of interactions focused on locations in
     * "Map Data" view, the locations displayed on the map are only those in the set
     * and their popup data reflects the data of the set.
     */
    function buildMarkersForLocChildren(locs) {
        locs.forEach(l => {
            let loc = typeof l === 'object' ? l : app.data.locs[l];
            if (loc.locationType.displayName == 'Country') {
                return addMarkersForLocAndChildren(loc);
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
/**
 * When the table is filtered to display a set of interactions created by the user,
 * that set is displayed when the loc view "Map Data" is selected.
 */
function addMrkrsInSet(tree) {                                                  //console.log('addMrkrsInSet. tree = %O', tree)
    let ttlShown = 0,
    ttlNotShown = 0;
    addMarkersInTree();
    fillIntCntLegend(ttlShown, ttlNotShown);

    function addMarkersInTree() {
        for (let branch in tree) {
            trackBranchIntCnt(tree[branch]);
            addMarkersForLocAndChildren(tree[branch]);
        }
    }
    function trackBranchIntCnt(branch) {
        if (branch.displayName === "Unspecified") {
            return ttlNotShown += branch.totalInts;
        }
        ttlShown += branch.totalInts;
    }
}
/**----------------- Show Interaction Sets on Map --------------------------- */
/** Shows the interactions displayed in the data-table on the map. */
export function showInts(focus, viewRcrds, locRcrds) {              /*perm-log*/console.log('----------- showIntsOnMap. focus [%s], viewRcrds [%O], locRcrds = [%O]', focus, viewRcrds, app.data.locRcrds);
    app.data.locs = locRcrds;
    downloadDataAndBuildMap(showIntsOnMap, 'map');

    function showIntsOnMap() {
        const tableData = buildMapDataObj(viewRcrds, app.data);                 //console.log('showIntsOnMap! data = %O', tableData);
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
    if (!app) { return; } //map closed
    const latLng = getCoords(geoId, data);
    const intCnt = data.ttl;
    const MapMarker = buildIntMarker(focus, intCnt, latLng, data);              //console.log('buildAndAddIntMarkers. intCnt = [%s] data = %O MapMarker = %O', intCnt, data, MapMarker);
    app.map.addLayer(MapMarker.layer);
}
function buildIntMarker(focus, intCnt, latLng, intData) {
    const params = {
        focus: focus, intData: intData, latLng: latLng, rcrds: app.data
    };
     return intCnt > 1 ?
        new MM.IntCluster(app.map, intCnt, params) : new MM.IntMarker(params);
}
function getCoords(geoId, intData) {
    return getLatLngObj(intData.locs[0], app.data.geo[geoId]);
}
function zoomIfAllInSameRegion(data) {
    let region, latLng;
    getRegionData();
    zoomIfSharedRegion();

    function getRegionData() {
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
        if (region) { app.map.setView(latLng, 3, {animate: true}); }
    }
}
/* -------------- Helpers ------------------------------------------------ */
function getCenterCoordsOfLoc(loc, geoId) {
    if (!geoId) { return false; }                                               //console.log('geoJson obj = %O', app.data.geo[geoId]);
    return getLatLngObj(loc, app.data.geo[geoId]);
}
/** Return a leaflet LatLng object from the GeoJSON Long, Lat point */
function getLatLngObj(loc, locGeoJson) {                                        //console.log('getLatLngObj for = %O, geoJson = %O', loc, locGeoJson)
    if (!locGeoJson.displayPoint) { return getLocCenterPoint(loc, locGeoJson); }
    let array = JSON.parse(locGeoJson.displayPoint);
    return L.latLng(array[1], array[0]);
}
function getLocCenterPoint(loc, locGeoJson) {                                   //console.log('       getLocCenterPoint. loc = %O, locGeoJson = %O', loc, locGeoJson);
    if (!loc || !locGeoJson) { return false; }
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
function addMarkerForEachInteraction(intCnt, latLng, loc) {                     //console.log('adding [%s] markers at [%O]', intCnt, latLng);
    const params = { loc: loc, latLng: latLng, rcrds: app.data };
    const MapMarker = intCnt > 1 ?
        new MM.LocCluster(app.map, intCnt, params) : new MM.LocMarker(params);
    app.popups[loc.displayName] = MapMarker.popup;                              //console.log('MapMarker = %O, params = %O', MapMarker, params);
    app.map.addLayer(MapMarker.layer);
}
/*===================== Location Form Methods ================================*/
/** Shows all location in containing country and selects the country in the form. */
function showNearbyLocationsAndUpdateForm(results) {                            //console.log('showNearbyLocationsAndUpdateForm = %O', results);
    if (!results) { return; }
    const cntryCode = results.address.country_code ?
        results.address.country_code.toUpperCase() : null;
    if (!cntryCode) { return; } //console.log('########## No country found!!! Data = %O, Code = [%s]', data, data.country_code);
    _db('getData', ['countryCodes']).then(codes => loadCountryAndSubLocs(codes[cntryCode]));
}
function loadCountryAndSubLocs(cntryId) {
    app.volatile.prnt = cntryId;
    if (app.map._container.id === 'map') { return addParentLocDataToMap(cntryId, null, 'map'); }
    $('#sel-Country-Region')[0].selectize.addItem(cntryId, 'silent');
    addParentLocDataToMap(cntryId, app.volatile.poly);
}
export function addVolatileMapPin(val, type, cntryId) {                         //console.log('           --addVolatileMapPin')
    if (!val) { return removePreviousMapPin(); }
    const latLng = getMapPinCoords();
    if (type === 'edit') { addEditFormMapData(latLng, val, cntryId);
    } else { addNewLocPinAndFillCoordFields(latLng); }
    $('#cnt-legend').html('');
}
function getMapPinCoords() {                                                    //console.log('Lat: [%s], Lng: [%s]', $('#Latitude_f input').val(), $('#Longitude_f input').val())
    return L.latLng($('#Latitude_f input').val(), $('#Longitude_f input').val());
}
function addEditFormMapData(latLng, locId, cntryId) {
    if (latLng) { geocodeCoordinates(latLng); }
    if (!cntryId) { return; }
    addParentLocDataToMap(cntryId, 'skipZoom', 'edit', locId);
    app.map.setView(latLng, 10, {animate: true});
}
function geocodeCoordinates(latLng) {
    app.geoCoder.reverse(
        latLng, 1, updateUiAfterFormGeocode.bind(null, latLng, 'edit'), null);
}
function addNewLocPinAndFillCoordFields(latLng) {
    app.geoCoder.reverse(
        latLng, 1, updateUiAfterFormGeocode.bind(null, latLng, false), null);
    fillCoordFields(latLng);
}
function fillCoordFields(latLng) {                                              //console.log('fillCoordFields latLng = %O', latLng);
    $('#Latitude_f input').val(latLng.lat.toFixed(5));
    $('#Longitude_f input').val(latLng.lng.toFixed(5));
}
/* ---- Update Form UI After Reverse Geocode Success ---- */
/**
 * Draws containing polygon on map, shows all locations in containing country,
 * and adds a map pin for the entered coodinates.
 */
function updateUiAfterFormGeocode(latLng, zoomFlag, results) {                  console.log('           --updateUiAfterFormGeocode. zoomFlag? [%s] point = %O results = %O', zoomFlag, latLng, results);
    if (!app.map) { return; } //form cloesd before geocode results returned.
    if (!results.length) { return updateMapPin(latLng, null, zoomFlag); }
    updateMapPin(latLng, results[0], zoomFlag)
    .then(() => app.volatile.marker.openPopup());
}
function updateMapPin(latLng, results, zoomFlag) {                              //console.log('updateMapPin. point = %O name = %O', latLng, name);
    if (!results) { return replaceMapPin(latLng, null, zoomFlag); }
    return _db('getData', ['countryCodes']).then(cntrys => {
        const loc = results ? buildLocData(latLng, results, cntrys) : null;
        replaceMapPin(latLng, loc, zoomFlag);
        $('#'+app.map._container.id).css('cursor', 'default');
        if (zoomFlag === 'edit') { $('#'+app.map._container.id).data('loaded'); }
    });
}
function buildLocData(latLng, results, cntrys) {                                //console.log('buildLocData. latLng = %O results = %O', latLng, results);
    return {
        cntryId: getCountryId(cntrys, results.properties.address),
        lat: latLng.lat,
        lng: latLng.lng,
        name: results.name,
    };
}
function getCountryId(cntrys, address) {
    if (address.state === 'French Guiana') { return 210; }
    if (!address.country_code) { return null; }
    return cntrys[address.country_code.toUpperCase()];
}
/** Note: MarkerType triggers the marker's popup build method.  */
function replaceMapPin(latLng, loc, zoomFlag) {
    const params = { latLng: latLng, loc: loc, rcrds: app.data };
    const markerType = (zoomFlag === 'edit' ? 'edit' : '') + 'form-loc';
    const marker = new MM.LocMarker(params, markerType);
    removePreviousMapPin(loc);
    if (loc && zoomFlag !== 'edit') {                                           //console.log('Adding parent data for [%s] cntryId = %s', loc.name, loc.cntryId);
        $('#sel-Country')[0].selectize.addItem(loc.cntryId, 'silent');
        $('#location_fields #DisplayName_f input[type="text"]').change(); //Required fields handle submit button enabling
        addParentLocDataToMap(loc.cntryId); //, zoomFlag === 'create'
    }
    addPinToMap(latLng, marker, zoomFlag);
}
function removePreviousMapPin(loc) {
    if (!app.volatile.pin) { return app.volatile.loc = loc; }
    app.map.removeLayer(app.volatile.pin);
    resetPinLoc(loc);
}
function resetPinLoc(loc) {
    app.volatile.prevLoc = app.volatile.loc;
    app.volatile.loc = loc;
}
function addPinToMap(latLng, marker, zoomFlag) {
    const zoom = zoomFlag ? app.map.getZoom() : 8;
    app.volatile.marker = marker;
    app.volatile.pin = marker.layer;
    app.map.addLayer(marker.layer);
    app.map.setView(latLng, zoom, {animate:true});
}
/**
 * Types: create, edit, int
 */
export function initFormMap(parent, rcrds, type) {                              console.log('           /--initFormMap type = [%s]', type);
    app.data.locs = app.data.locs || rcrds;
    // if (!type && app.volatile.prnt && parent == app.volatile.prnt) { return; }
    downloadDataAndBuildMap(finishFormMap.bind(null, parent, type), 'form-map', type);
}
function finishFormMap(parentId, type) {                                        //console.log('finishFormMap. pId [%s], type [%s]', parentId, type);
    mapEl.addLocCountLegend(app.map);
    if (type === 'int') {
        mapEl.addNewLocBttn(app.map);
    }
    if (!parentId) { return; }
    addParentLocDataToMap(parentId, null, type);
    $('#form-map').data('loaded', true);
}
/**
 * Draws containing country polygon on map and displays all locations within.
 * If editing location, locId will be passed to skip the child loc's marker.
 */
function addParentLocDataToMap(id, skipZoom, type, locId) {
    const loc = app.data.locs[id];
    if (!loc) { return console.log('No country data matched in geocode results'); }
    const geoJson = loc.geoJsonId ? app.data.geo[loc.geoJsonId] : false;
    drawLocPolygon(loc, geoJson, skipZoom);
    if (type === 'map') { return; }
    const zoomLvl = app.volatile.poly || skipZoom ? false :
        loc.locationType.displayName === 'Region' ? 3 : 8;
    showChildLocs(id, zoomLvl, type, locId);
}
/** Draws polygon on map and zooms unless skipZoom is a truthy value. */
function drawLocPolygon(loc, geoJson, skipZoom) {                               //console.log('drawing country on map. args = %O', arguments);
    if (app.volatile.poly) { removePolyLayer() }
    if (!geoJson || geoJson.type == 'Point') { return; }
    let feature = buildFeature(loc, geoJson);
    app.volatile.poly = L.geoJSON(feature);
    app.volatile.poly.addTo(app.map);
    if (skipZoom) { return; }
    app.map.fitBounds(app.volatile.poly.getBounds(), { padding: [10, 10] });
}
function removePolyLayer() {
    app.map.removeLayer(app.volatile.poly);
    delete app.volatile.poly;
}
/**
 * Adds all child locations to map and zooms according to passed zoomLvl.
 * If editing location, locId will be passed to skip the child loc's marker.
 */
function showChildLocs(pId, zoomLvl, type, locId) {
    const prnt = app.data.locs[pId];
    const prntLatLng = getCenterCoordsOfLoc(prnt, prnt.geoJsonId);
    clearPreviousMarkers();
    addChildLocsToMap(prnt, prntLatLng, type, locId);
    if (!zoomLvl || !prntLatLng) { return; }
    app.map.setView(prntLatLng, zoomLvl, {animate: true});
}
function clearPreviousMarkers() {
    if (!app.volatile.markers) { return app.volatile.markers = []; }
    app.volatile.markers.forEach(m => app.map.removeLayer(m));
    app.volatile.markers = [];
}
/** If editing location, locId will be passed to skip it's marker. */
function addChildLocsToMap(prnt, coords, type, locId) {
    const noGpsLocs = [];
    const locs = getChildLocData(prnt);
    addLocsWithGpsDataToMap();
    mapEl.addCountToLegend(locs.length, noGpsLocs.length, prnt);
    if (noGpsLocs.length) { addLocsWithoutGpsDataToMap(noGpsLocs.length); }

    function addLocsWithGpsDataToMap() {
        locs.forEach(loc => {
            if (loc.id === locId) { return; }
            const latLng = getGpsData(loc);
            if (!latLng) { return noGpsLocs.push(loc); }
            buildLocMarker(loc, latLng);
        });
    }
    function getGpsData(loc) {
        return prnt.geoJsonId != loc.geoJsonId ?
            getCenterCoordsOfLoc(loc, loc.geoJsonId) : false;
    }
    function buildLocMarker(loc, latLng) {
        const params = { latLng: latLng, loc: loc, rcrds: app.data };
        const tag = getMarkerType(loc, latLng);
        const Marker = new MM.LocMarker(params, tag);
        app.map.addLayer(Marker.layer);
        app.volatile.markers.push(Marker.layer);
    }
    function getMarkerType(loc, latLng) {
        return (type === 'edit' ? 'edit' : '') +
            'form'+ (loc.locationType.displayName === 'Country' ? '-c' : '');
    }
    function addLocsWithoutGpsDataToMap(cnt) {
        if (!coords) { return; }
        const params = { latLng: coords, loc: noGpsLocs, rcrds: app.data };
        const Marker = cnt === 1 ?
            new MM.LocMarker(params, 'form-noGps') :
            new MM.LocCluster(app.map, cnt, params, 'form-noGps');
        app.map.addLayer(Marker.layer);
        app.volatile.markers.push(Marker.layer);
    }
}
/** Return all sub-locs, except country-habitat locations with no interactions.*/
function getChildLocData(prnt) {
    return prnt.children.map(id => app.data.locs[id]).filter(loc => {
        return loc.locationType.displayName !== 'Habitat' || loc.totalInts > 0;
    });
}
/** Initializes the google map in the data table. */
export function buildLocMap() {
    _ui('updateUiForMapView');
    app.data.locs = _table('tableState').get('rcrdsById');
    return downloadDataAndBuildMap(addAllIntMrkrsToMap, 'map');
}
/** Switches to map view and centeres map on selected location. */
export function showLocOnMap(locId, zoom) {                          /*perm-log*/console.log("       --Showing Location on Map");
    if ($('#shw-map').prop('loading')) { return; }
    _ui('updateUiForMapView');
    _cmbx('setSelVal', ['View', 'map', 'silent']);
    showLoc(locId, zoom, _table('tableState').get('rcrdsById'));
    $('#filter-status').html('No Active Filters.');
}
export function showTableRecordsOnMap() {                                       console.log('       +--showTableRecordsOnMap');
    const tblState = _table('tableState').get(null, ['curFocus', 'rcrdsById']);
    $('#search-tbl').fadeTo('fast', 0.3, () => {
        _ui('updateUiForMapView');
        getLocRcrds().then( rcrds => {
            showInts(tblState.curFocus, tblState.rcrdsById, rcrds);
        });
    });

    function getLocRcrds() {
        return Promise.resolve(tblState.curFocus !== 'locs' ?
            _db('getData', ['location']) : tblState.rcrdsById);
    }
}