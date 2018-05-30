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
const dataKey = 'Live for justice!!!!!! <3';

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
    idb.get(dataKey).then(clearIdbCheck);
}
function clearIdbCheck(storedKey) { console.log('clearing Idb? ', storedKey === undefined);
    if (storedKey) { return getGeoJsonData(); } 
    idb.clear();  console.log('actually clearing');
    idb.set(dataKey, true);
    downloadGeoJson();
}
function getGeoJsonData() {                                                     console.log('getGeoJsonData')
    idb.get('geoJson').then(storeGeoJson);
}
function storeGeoJson(geoData) {                                                console.log('storeGeoJson. geoData ? ', geoData !== undefined);
    if (geoData === undefined) { return downloadGeoJson(); }
    geoJson = geoData; 
    if (showMap) { initMap(); }
}
function downloadGeoJson() {                                                    console.log('downloading all geoJson data!');
    _util.sendAjaxQuery({}, 'ajax/geo-json', storeServerGeoJson);                     
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
export function updateGeoJsonData(argument) { //TODO: When db_sync checks for entity updates, send geoJson updates here
    // body...
}
/** ======================= Init Map ======================================== */
/** Initializes the search database map using leaflet and mapbox. */
export function initMap() {                                                     console.log('attempting to initMap')
    if (!geoJson) { showMap = true; return }                                    console.log('  initializing');
    map = L.map('map');
    map.setMaxBounds(getMapBounds());
    map.on('click', logLatLng);
    map.on('load', addInteractionMarkersToMap);
    addMapTiles();
    map.setView([22,22], 2)
    
    function logLatLng(e) {
        console.log("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng)
    }
    function getMapBounds() {
        const southWest = L.latLng(-100, 190);
        const northEast = L.latLng(100, -190);
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
 * Adds a marker to the map for each interaction with any location data. Each 
 * marker has a popup with either the location name and the country, just the  
 * country or region name. Locations without gps data are added to markers at  
 * the country level with "Unspecified" as the location name.
 */
function addInteractionMarkersToMap() {
    const locations = _util.getDataFromStorage('location');
    const regions = getRegionLocs();
    for (let id in regions) { addMarkersForRegion(regions[id]) }; 

    function getRegionLocs() {
        const regionIds = _util.getDataFromStorage('topRegionNames');
        return Object.values(regionIds).map(id => locations[id]);
    }
    function addMarkersForRegion(region) {
        if (region.displayName === "Unspecified") { return; }
        addMarkersForLocAndChildren(region);
    }
    function addMarkersForLocAndChildren(loc) {                                 
        if (!loc.totalInts) { return; }                                         //console.log('addMarkersForLocAndChildren for [%s] = %O', loc.displayName, loc);
        let intCnt = loc.interactions.length; 
        buildMarkersForLocChildren(loc.children);
        if (intCnt) { buildLocationMarkers(intCnt, loc); }

        function buildMarkersForLocChildren(locs) {
            locs.forEach(id => {
                let loc = locations[id];
                if (loc.locationType.displayName == 'Country') { 
                    return addMarkersForLocAndChildren(loc, false); 
                }
                buildLocationIntMarkers(loc, loc.interactions.length);
            });
        }
        function buildLocationIntMarkers(loc, locIntCnt) {                      //console.log('buildLocationIntMarkers for [%s]', loc.displayName, loc);
            if (loc.children.length) { return addMarkersForLocAndChildren(loc); }
            if (!locIntCnt) { return; }
            buildLocationMarkers(locIntCnt, loc);
        }
        function buildLocationMarkers(intCnt, loc) {                            //console.log('   buildLocationMarkers for [%s] = %O', loc.displayName, loc);
            const markerCoords = getCenterCoordsOfLoc(loc);                     //console.log('        markerCoords = ', markerCoords)
            if (!markerCoords) { return; }
            addMarkerForEachInteraction(intCnt, markerCoords, loc);
        }
        function getCenterCoordsOfLoc(loc) { 
            if (!loc.geoJsonId) { return logNoGeoJsonError(); }                 //console.log('geoJson obj = %O', geoJson[loc.geoJsonId]);
            const locGeoJson = JSON.parse(geoJson[loc.geoJsonId]);              //console.log('        locGeoJson = %O', locGeoJson);
            return locGeoJson.centerPoint ? 
                formatPoint(locGeoJson.centerPoint) 
                : getLocCenterPoint();

            function logNoGeoJsonError() {
                if (!loc.interactions.length) { return null; }
                intCnt += loc.interactions.length;
                console.log('###### No geoJson for [%s] %O', loc.displayName, loc)
            }
            /** Return a leaflet LatLng object from the GeoJSON Long, Lat point */
            function formatPoint(point) {                                       //console.log('point = ', point)
                let array = JSON.parse(point); 
                return L.latLng(array[1], array[0]);
            }
            function getLocCenterPoint() {
                const feature = buildFeature(loc, locGeoJson);
                const polygon = L.geoJson(feature);//.addTo(map);
                console.log('### New Center Coordinates ### "%s" => ', loc.displayName, polygon.getBounds().getCenter());
                return polygon.getBounds().getCenter(); 
                    
                function buildFeature(loc, geoData) {                           //console.log('place geoData = %O', geoData);
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
            } /* End getLocCenterPoint */
        } /* End getCenterCoordsOfLoc */
        function addMarkerForEachInteraction(intCnt, coords, loc) {             //console.log('       adding [%s] markers at [%O]', intCnt, coords);
            return intCnt === 1 ? addMarker() : addCluster();

            function addMarker() {
                map.addLayer(addSingleMarker(coords, loc));
            }
            function addCluster() {
                let cluster = L.markerClusterGroup();
                for (let i = 0; i < intCnt; i++) {  
                    cluster.addLayer(L.marker(coords)); 
                }
                addPopupToCluster(cluster, getPopupText(loc));
                map.addLayer(cluster);
            }
        } /* End addMarkerForEachInteraction */
        function addSingleMarker(coords, loc) {
            return L.marker(coords).bindPopup(getPopupText(loc))
                .on('mouseover', function (e) { this.openPopup(); })
                .on('mouseout', function (e) { this.closePopup(); });
        }
        function addPopupToCluster(cluster, text) {
            cluster.on('clustermouseover', createClusterPopup)
                .on('clustermouseout',function(c){ map.closePopup(); })
                .on('clusterclick',function(c){ map.closePopup(); }); 
            
            function createClusterPopup(c) {
                const popup = L.popup()
                    .setLatLng(c.layer.getLatLng())
                    .setContent(text)
                    .openOn(map);
            }
        }  /* End addMarkersForLocation */
        function getPopupText(loc) {  
            let cntry = loc.country ? loc.country.displayName : 'Continent';
            const locName = loc.locationType.displayName === "Country" ?
                "Unspecified" : loc.displayName;
            return "<b>"+locName+"</b><br>"+cntry+'<input type="button" value="Show Summary">';
        }
    } /* End addMarkersForLocAndChildren */
} /* End addInteractionMarkersToMap */