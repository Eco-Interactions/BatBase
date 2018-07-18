import * as _util from '../misc/util.js';
import * as db_page from './db-page.js';
import 'leaflet.markercluster';

let locRcrds = null;

class Marker {
    constructor (subLocCnt, latLng, loc, rcrds) {
        this.latLng = latLng;
        this.loc = loc;
        this._popup = L.popup().setLatLng(latLng);
        this.self = null;
        this.subCnt = subLocCnt;
        this.timeout = null;
        locRcrds = rcrds;
    }
    get layer() {
        return this.self;
    }
    get popup() {
        return this._popup;
    }
    set popup(val) {
       this._popup = val;
    }
    /**
     * Replaces original popup with more details on the interactions at this
     * location. Popup will remain open until manually closed, when the original
     * location name popup will be restored. 
     */
    buildSummaryPopup() {                                                       //console.log('buildLocSummaryPopup. SUPER this = %O', this);
        if (this.timeout) { clearMarkerTimeout(this.timeout); }
        this.popup.setContent(getLocationSummaryHtml(this.loc, this.subCnt));
        this.popup.options.autoClose = false;
        this.updateMouseout(Function.prototype);
        // reset onPopupClose
        // open popup 
    }
    updateMouseout(func) {                                                      //console.log('updateMouseout this = %O', this)
        this.self.off('mouseout').on('mouseout', func);
    }
} /* End Marker Super Class */
export class MapMarker extends Marker {
    constructor (subLocCnt, latLng, loc, rcrds) {
        super(subLocCnt, latLng, loc, rcrds);
        bindClassContextToMethods(this); 
        this.popup.setContent(getLocNamePopupHtml(loc, this.buildSummaryPopup));
        this.self = L.marker(latLng)
            .bindPopup(this.popup)
            .on('mouseover', this.openPopup)
            .on('click', this.openPopupAndDelayAutoClose)
            .on('mouseout', this.delayPopupClose);
    }
    buildSummaryPopup() {                                                       //console.log('buildLocSummaryPopup. this = %O', this);
        super.buildSummaryPopup();
        this.openPopup(); 
        this.self.on('popupclose', this.restoreLocNamePopup);
    }
    restoreLocNamePopup() {                                                     //console.log('restoring locName popup')                                        
        window.setTimeout(restoreOrgnlPopup.bind(this), 400);
        /** Event fires before popup is fully closed. Restores after closed. */
        function restoreOrgnlPopup() {
            this.updateMouseout(this.delayPopupClose);
            this.popup.setContent(
                getLocNamePopupHtml(this.loc, this.buildLocSummaryPopup));
            this.popup.options.autoClose = true;
            this.self.off('popupclose');
        }
    } /* End restoreLocNamePopup */
    /** --- Event Handlers --- */
    openPopup(e) {                                                              
        if (this.timeout) { clearMarkerTimeout(this.timeout); }
        this.self.openPopup();
    }
    /** 
     * Delays auto-close of popup if a nearby marker popup is opened while trying
     * to click the location summary button. 
     */
    openPopupAndDelayAutoClose(e) {                                             //console.log('openPopupAndDelayAutoClose')
        this.self.openPopup();
        this.popup.options.autoClose = false;
        window.setTimeout(() => this.popup.options.autoClose = true, 700);
    }
    closePopup() { 
        this.self.closePopup();
    }
    delayPopupClose(e) {  
        this.timeout = window.setTimeout(this.closePopup, 700);
    }
} /* End Marker Class */
export class MapCluster extends Marker {
    constructor (map, intCnt, subCnt, latLng, loc, rcrds) {
        super(subCnt, latLng, loc, rcrds);
        bindClassContextToMethods(this); 
        this.map = map;
        this.popup.setContent(getLocNamePopupHtml(loc, this.buildSummaryPopup));
        this.self = L.markerClusterGroup();
        this.addClusterEvents();
        this.addMarkersToCluser(intCnt);
    }
    buildSummaryPopup() {                                              //console.log('building cluster loc summary')
        super.buildSummaryPopup();
        this.map.on('popupclose', this.closeLayerPopup);
        this.removeClusterEvents();
        this.map.openPopup(this.popup);
    }
    addClusterEvents() {
        this.self.on('clustermouseover', this.openClusterPopup)
            .on('clustermouseout', this.delayClusterPopupClose)
            .on('clusterclick', this.openPopupAndDelayAutoClose); 
    }
    removeClusterEvents() {
        this.self.off('clustermouseover').off('clustermouseout').off('clusterclick'); 
    }
    addMarkersToCluser(intCnt) {  
        for (let i = 0; i < intCnt; i++) {  
            this.self.addLayer(L.marker(this.latLng)); 
        }
    }
    /** --- Event Handlers --- */
    openClusterPopup(c) {
        if (this.timeout) { clearTimeout(this.timeout); this.timeout = null; }  
        this.map.openPopup(this.popup);
    }
    /** Event fires before popup is fully closed. Restores after closed. */
    closeLayerPopup(e) {  
        if (e.popup._latlng === this.latLng) {
            window.setTimeout(this.restoreOrgnlPopup.bind(this), 400);
        }
    }
    restoreOrgnlPopup() {
        super.updateMouseout(this.delayClusterPopupClose);
        this.popup.setContent(getLocNamePopupHtml(this.loc, this.buildSummaryPopup));
        this.popup.options.autoClose = true;
        this.self.off('clusterpopupclose');
        this.addClusterEvents();
    }
    closePopup(){
        this.map.closePopup();
    }
    delayClusterPopupClose(e) {
        this.timeout = window.setTimeout(this.closePopup.bind(this), 700);
    }
    openPopupAndDelayAutoClose(c) {
        c.layer.unspiderfy(); //Prevents the 'spiderfy' animation for contained markers
        this.openClusterPopup(c);
        this.popup.options.autoClose = false;
        window.setTimeout(() => this.popup.options.autoClose = true, 400);
    }
} /* End Marker Cluster Class */
/** ------ Class Bind Methods ---------- */
/** Taken from the npm 'auto-bind' library */
function bindClassContextToMethods(self) {
    for (const key of Object.getOwnPropertyNames(self.constructor.prototype)) {
        const value = self[key];

        if (key !== 'constructor' && typeof value === 'function') {
            self[key] = value.bind(self);
        }
    }
}
/** ---------------- Marker/Popup Helpers ------------------------ */
/**
 * Builds the popup for each marker that shows location and region name. Adds a 
 * "Location Summary" button to the popup connected to @showLocDetailsPopup.
 */
function getLocNamePopupHtml(loc, summaryFunc) {                                //console.log('getLocNamePopupHtml. loc = %O', loc)
        const div = _util.buildElem('div');
        const text = getLocNameHtml(loc);
        const bttn = buildLocSummaryBttn(summaryFunc);
        $(div).append(text).append(bttn);
        return div;
}
function getLocNameHtml(loc) {  
    let parent = loc.locationType.displayName === 'Country' ? '' :
        loc.country ? loc.country.displayName : 'Region';
    const locName = loc.displayName;
    return '<div style="font-size:1.2em;"><b>' + locName + 
        '</b></div><div style="margin: 0 0 .5em 0;">'+parent+'</div>';
} 
function clearMarkerTimeout(timeout) { 
    clearTimeout(timeout); 
    timeout = null;                                                             //console.log('timout cleared')       
}
/** ------- Location Summary Popup ------------- */
function buildLocSummaryBttn(showSummaryFunc) {
    const bttn = _util.buildElem('input', {type: 'button',
        class:'ag-fresh grid-bttn', value: 'Location Summary'});
    $(bttn).click(showSummaryFunc);
    $(bttn).css({'margin': '.5em 0 0 0'});
    return bttn;
}
/** Returns additional details (html) for interactions at the location. */
function getLocationSummaryHtml(loc, subCnt) {                                  //console.log('loc = %O', loc);
    const div = _util.buildElem('div');
    const html = buildLocDetailsHtml(loc, subCnt);
    const bttn = buildToGridButton(loc);
    $(div).append(html).append(bttn);
    return div;
}
function buildLocDetailsHtml(loc, subCnt) {
    const name = getLocNameHtml(loc);
    const cnt = ifCountryGetIntCnt(loc);
    const subs = getSubLocsWithoutGpsData(subCnt);
    const pLocData = (cnt||subs) ? [cnt, subs].filter(el=>el).join('<br>')+'<br>' : false;
    const coords = getCoordsHtml(loc);
    const habType = getHabTypeHtml(loc);
    const bats = getBatsCitedHtml(loc);  
    return name + [pLocData, coords, habType, bats].filter(el => el).join('<br>');  
}
function isRegionOrCountry(loc) {
    const locType = loc.locationType.displayName;  
    return ['Region', 'Country'].indexOf(locType) !== -1;
}
function ifCountryGetIntCnt(loc) {
    const locType = loc.locationType.displayName;
    return ['Region', 'Country'].indexOf(locType) === -1 ? false : 
        `Interactions in ${locType}: <b> ${loc.totalInts}</b>`;
}
function getSubLocsWithoutGpsData(cnt) {
    if (!cnt) { return false; }
    return `Sub-Locations without GPS data: ${cnt}`; 
}
function getCoordsHtml(loc) {
    const geoData = _util.getGeoJsonEntity(loc.geoJsonId);                       //console.log('geoJson = %O', geoData); 
    if (geoData.type !== 'Point' || isRegionOrCountry(loc)) { return false; }
    let coords = JSON.parse(geoData.coordinates)
    coords = coords.map(c => Number(c).toFixed(6)); 
    return 'Coordinates: <b>' + coords.join(', ') +'</b>';
}
/** --- Habitat Types --- */
/** Build string of 3 most reported habitats and the count of remaining reported. */
function getHabTypeHtml(loc) {
    if (isRegionOrCountry(loc)) { return getAllHabitatsWithin(loc); }
    if (!loc.habitatType) { return 'Habitat Type:'; }
    return `Habitat: <b>${loc.habitatType.displayName}</b>`;
}
function getAllHabitatsWithin(loc) {                                            //console.log('getting habitats for = %O', loc);
    const habitats = {};
    addHabitatsForLocAndChildren(loc.id);
    return Object.keys(habitats).length ? buildHabHtml() : 'Habitat Types:'; 

    function addHabitatsForLocAndChildren(id) { 
        let loc = locRcrds[id]; 
        if (loc.interactions.length) { addLocHabitat(loc); }
        if (loc.children.length) { loc.children.forEach(addHabitatsForLocAndChildren); }        
    }
    function addLocHabitat(loc) {
        if (!loc.habitatType) { return; }
        const name = loc.habitatType.displayName;
        if (!habitats[name]) { habitats[name] = 0; }
        ++habitats[name];
    }
    function buildHabHtml() {  
        const str = getTopThreeReportStr(habitats);  console.log
        return `Habitats: <b>&ensp; ${str}</b>`;
    }
}
/** --- Cited Bats --- */
/** Build string of 3 most reported taxonyms and the count of remaining taxa reported. */
function getBatsCitedHtml(loc) {    
    const rcrds = _util.getDataFromStorage(['interaction', 'taxon']);
    const allBats = {};
    getAllBatsWithin(loc.id);
    const bats = getTopThreeReportStr(allBats);
    return `Cited bats: <b>${bats}</b>`;
    
    function getAllBatsWithin(id) {  
        const loc = locRcrds[id];
        if (loc.interactions.length) { addBats(loc.interactions); }
        if (loc.children.length) { loc.children.forEach(getAllBatsWithin); }
    }
    function addBats(interactions) {
        const ints = interactions.map(id => rcrds.interaction[id]);
        ints.forEach(int => trackBatInteraction(int, rcrds.taxon, allBats));
    }
} /* End getBatsCitedHtml */
function trackBatInteraction(int, rcrds, allBats) {
    let bat = rcrds[int.subject];                                               //console.log('bat = %O', bat);
    let name = buildBatName(bat);
    if (Object.keys(allBats).indexOf(name) === -1) { allBats[name] = 0; }
    ++allBats[name];
}
function buildBatName(bat) {
    let name = '';
    if (bat.level.displayName !== 'Species') { name += bat.level.displayName + ' '; }
    return name + bat.displayName;
}
/** ---- Habitat and Bat Helper ---- */
/**
 * Sorts an object with unique name keys and values with the number of time this
 * item was present in the cited records (habitats in locs or bats in interactions). 
 * Returns a string with the three names with the highest count, and a total of 
 * all items (habitats/bats) counted.
 */
function getTopThreeReportStr(obj) {
    const ttl = Object.keys(obj).length;                                       
    const sorted = { 1: [], 2: [], 3: [] };
    const posKeys = Object.keys(sorted);
    for (let name in obj) {
        sortItem(obj[name], name);
    }                                                                           //console.log('sorted habs = %O', sorted)
    return buildReportString(obj, sorted, ttl);

    function sortItem(count, name) {                                             
        posKeys.some((pos) => {
            if (count > sorted[pos][0] || !sorted[pos][0]) {                    
                replacePosition(count, name, pos); 
                return true;
            }
        });
    }
    function replacePosition(count, name, pos) {
        if (pos > ttl || !sorted[pos]) { return; }
        replacePosition(sorted[pos][0], sorted[pos][1], Number(pos) + 1);
        sorted[pos] = [ count, name ];
    }
} /* End getReportString */
/** Returns string with the names of top 3 reported taxa and total taxa count. */
function buildReportString(obj, sorted, ttl) {
    return ttl == 1 ? sorted[1][1] : formatString();

    function formatString() {
        const tabs = '&emsp;&emsp;&emsp;&emsp;&emsp;';
        let str = '';
        concatNames();
        return finishReportString();

        function concatNames() {
            for (let i = 1; i <= 3; i++) {
                str += i === 1 ? sorted[i][1] : //+ ` </b>(${sorted[i][0]})<b>`
                    !sorted[i].length ? '' : ',<br>' + tabs + sorted[i][1];
            }
        }
        function finishReportString() {
            if (ttl > 3) { str += ',<br></b>' + tabs + '(' + ttl + ' total cited here.)'}
            return str;
        } 
    }
}
/** --- Button to show interactions in the data-grid --- */
function buildToGridButton(loc) {
    const bttn = _util.buildElem('input', {type: 'button',
        class:'ag-fresh grid-bttn', value: 'Show Interactions In Data-Grid'});
    $(bttn).click(showLocGridView.bind(null, loc));
    $(bttn).css({'margin': '.5em 0 0 -.4em'});
    return bttn;
}
function showLocGridView(loc) {
    console.log('Switch to grid view and show location.');
    db_page.showLocInDataGrid(loc);
}
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