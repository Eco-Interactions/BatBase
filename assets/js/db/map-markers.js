import * as _util from '../misc/util.js';
import * as db_page from './db-page.js';
import 'leaflet.markercluster';

let locRcrds = null;

class Marker {
    constructor (latLng) {
        this.latLng = latLng;
        this._popup = L.popup().setLatLng(latLng);
        this.self = null;
        this.timeout = null;
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
    updateMouseout(func) {                                                      //console.log('updateMouseout this = %O', this)
        this.self.off('mouseout').on('mouseout', func);
    }
} /* End Marker Super Class */
export class LocMarker extends Marker {
    constructor (subLocCnt, latLng, loc, rcrds) {
        super(latLng);
        bindClassContextToMethods(this); 
        this.loc = loc;
        locRcrds = rcrds;
        this.subCnt = subLocCnt;
        this.popup.setContent(getLocNamePopupHtml(loc, this.buildSummaryPopup));
        this.self = L.marker(latLng, getCustomIcon())
            .bindPopup(this.popup)
            .on('mouseover', this.openPopup)
            .on('mouseenter', this.openPopup)
            .on('click', this.openPopupAndDelayAutoClose)
            .on('mouseout', this.delayPopupClose);
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
} /* End LocMarker Class */

export class IntMarker extends Marker {
    constructor (focus, latLng, intData) {
        super(latLng);
        bindClassContextToMethods(this); 
        this.data = intData;
        this.focus = focus;
        this.self = L.marker(latLng, getCustomIcon())
            .bindPopup(this.popup, {closeOnClick: false});
        this.addMarkerEvents();
    }
    addMarkerEvents() {
        this.self.on('mouseover', this.openPopup)
            .on('click', this.openAndFreezePopup)
            .on('mouseout', this.delayPopupClose);
    }
    removeMarkerEvents() {
        this.self.off('mouseover').off('click').off('mouseout');
    }
    /** --- Event Handlers --- */
    openPopup(e) {                       
        if (this.timeout) { clearMarkerTimeout(this.timeout); }
        if (!this.popup.getContent()) { 
            this.popup.setContent(getIntPopupHtml(this.focus, this.data));
        }
        this.self.openPopup();
    }
    openAndFreezePopup(c) {
        if (this.timeout) { clearMarkerTimeout(this.timeout); } 
        this.popup.options.autoClose = false;
        this.removeMarkerEvents();
        this.self.openPopup();
    }
    closePopup() { 
        this.popup.options.autoClose = true;
        this.self.closePopup();
        this.addMarkerEvents();
    }
    delayPopupClose(e) {  
        this.timeout = window.setTimeout(this.closePopup, 700);
    }
} /* End IntMarker Class */
export class LocCluster extends Marker {
    constructor (map, intCnt, subCnt, latLng, loc, rcrds) {
        super(latLng);
        bindClassContextToMethods(this); 
        this.map = map;
        this.loc = loc;
        locRcrds = rcrds;
        this.popup.setContent(getLocNamePopupHtml(loc, this.buildSummaryPopup));
        this.self = L.markerClusterGroup();
        this.addClusterEvents();
        this.addMarkersToCluser(intCnt);
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
        this.map.on('popupclose', this.closeLayerPopup);
        this.removeClusterEvents();
        this.map.openPopup(this.popup);
    }
    addClusterEvents() {
        this.self.on('clustermouseover', this.openClusterPopup)
            .on('clustermouseenter', this.openClusterPopup)
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
        clearTimeout(this.timeout); 
        this.timeout = null;  
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
} /* End LocCluster Class */
export class IntCluster extends Marker {
    constructor (map, intCnt, focus, latLng, data) {
        super(latLng);
        bindClassContextToMethods(this); 
        this.map = map;
        this.focus = focus,
        this.data = data
        this.popup.options.closeOnClick = false;
        this.self = L.markerClusterGroup();
        this.addClusterEvents();
        this.addMarkersToCluser(intCnt);
    }
    addClusterEvents() {
        this.self.on('clustermouseover', this.openClusterPopup)
            .on('clustermouseenter', this.openClusterPopup)
            .on('clustermouseout', this.delayClusterPopupClose)
            .on('clusterclick', this.openAndFreezeClusterPopup); 
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
        if (this.timeout) { clearMarkerTimeout(this.timeout); }
        if (!this.popup.getContent()) { 
            this.popup.setContent(getIntPopupHtml(this.focus, this.data));
        }
        this.map.openPopup(this.popup);
    }
    openAndFreezeClusterPopup(c) {
        if (this.timeout) { clearMarkerTimeout(this.timeout); } 
        c.layer.unspiderfy(); //Prevents the 'spiderfy' animation for contained markers
        this.popup.options.autoClose = false;
        this.map.on('popupclose', this.closeLayerPopup);
        this.removeClusterEvents();
        this.map.openPopup(this.popup);
    }
    /** Event fires before popup is fully closed. Restores after closed. */
    closeLayerPopup(e) {  
        if (e.popup._latlng === this.latLng) { 
            this.closePopup()
        }
    }
    closePopup(){
        this.map.closePopup();
        this.popup.options.autoClose = true;
        this.addClusterEvents();
    }
    delayClusterPopupClose(e) {
        this.timeout = window.setTimeout(this.closePopup.bind(this), 700);
    }
} /* End IntCluster Class */
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
/** ------- Shared Helpers --------- */
function getCustomIcon() {
    return {
        icon: L.divIcon({
            className: 'single-marker info',
            html: "1",
        })
    }
}
/** ---------------- Interaction Marker/Popup Helpers ----------------------  */
function getIntPopupHtml(focus, intData) {                                      //console.log('getIntPopupHtml. intData = %O', intData);
    const locHtml = getLocNameHtml(intData.locs[0]);
    const intHtml = getIntSummaryHtml(focus, intData.ints, intData.ttl);
    return `<div>${locHtml}${intHtml}</div>`;
}
function getIntSummaryHtml(focus, intObj, ttl) {  
    const bldrs = { locs: buildLocIntSummary, srcs: buildSrcIntSummary, 
        taxa: buildTaxaIntSummary };
    let summary = '';
    let intCnt = 1;

    for (let name in intObj) {
        if (intCnt > 4) { return truncateSummary(summary, ttl); }
        summary += bldrs[focus](name, intObj[name], focus);
        intCnt++;
    } 

    return summary;
}
function truncateSummary(summary, ttl) { 
    summary += `<br><b>${ttl} interactions total.</b>`;
    return summary;
}
function buildLocIntSummary(name, ints, focus) {                                //console.log('buildLocIntSummary. ints = %O', ints)
    const batStr = getTop3CitedBats(ints);  
    return buildIntSummary(name, batStr, ints.length);
}
function buildTaxaIntSummary(name, ints, focus) {                               //console.log('buildTaxaIntSummary. ints = %O', ints)
    const batStr = getTop3CitedBats(ints);  
    return buildIntSummary(name, batStr, ints.length);
}
function buildSrcIntSummary(name, ints, focus) {                                //console.log('buildSrcIntSummary. ints = %O', ints)
    if (!ints.length) { return ''; }
    const batStr = getTop3CitedBats(ints);  
    return buildIntSummary(name, batStr, ints.length, focus);
}
/** Build string of 3 most reported taxonyms and the count of remaining taxa reported. */
function getTop3CitedBats(ints) {    
    const taxa = _util.getDataFromStorage('taxon');
    const allBats = {};
    getAllBatsCited();
    const bats = getTopThreeReportStr(allBats, buildBatSummaryStr);
    return `Bat${Object.keys(allBats).length == 1 ? '' : 's'}: ${bats}`;
    
    function getAllBatsCited() {
        ints.forEach(int => trackBatInteraction(taxa[int.subject], allBats));
    }
} /* End getTop3CitedBats */
/**
 * Returns string with the names of top 3 reported taxa and total taxa count.
 * Formatted for the Interaction summary popups.
 */
function buildBatSummaryStr(sorted, ttl) {
    return ttl == 1 ? sorted[1][1] : formatBatString(sorted, ttl);
}
function formatBatString(sorted, ttl) {
    let str = concatBatNames(sorted);
    return getIntTop3ReportString(str, ttl);
}
function concatBatNames(sorted) {
    let str = '';
    for (let i = 1; i <= 3; i++) { str += formatBatName(sorted[i], i, sorted); }
    return str;
}
function formatBatName(bat, i, sorted) {  
    const name = !bat.length ? '' : (i === 1 ? '' : ', ') + bat[1];
    return name;
}
function getIntTop3ReportString(str, ttl) {
    if (ttl > 3) { str += `</b> (${ttl} total cited here.)`;}
    return str;
} /* ---- End Top 3 Cited Bats string build ---- */
/**
 * 
 * Cnt - Name (restrict char to one line, with tooltip)
 *     subjects (objects if in bat taxa view)
 */
function buildIntSummary(name, bats, intCnt, focus) { 
    return `<div class="flex-row flex-wrap"title="${name}"><div><b>${intCnt} 
        interactions - &nbsp;</b>${getName(name, focus)}</div></div>${bats}`;
}
function getName(name, focus) {  
    const lngth = focus !== 'srcs' ? 30 : 77;
    let nameStr = name.length > lngth ? name.substring(0, lngth) + `...)` : name;
    const namePieces = nameStr.split(' - (');
    modifyNameForDisplay()
    return `<b>${namePieces.join('')}`;

    function modifyNameForDisplay() {
        if (namePieces.length > 1) { modifyNameForAuthDisplay(); 
        } else { namePieces.push('</b>'); }
    }
    function modifyNameForAuthDisplay() {
        namePieces.splice(1, 0, '</b><i> - (');
        namePieces.push('</i>'); 
    }
}
/** ---------------- Location Marker/Popup Helpers -------------------------- */
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
        class:'ag-fresh tbl-bttn', value: 'Location Summary'});
    $(bttn).click(showSummaryFunc);
    $(bttn).css({'margin': '.5em 0 0 0'});
    return bttn;
}
/** Returns additional details (html) for interactions at the location. */
export function getLocationSummaryHtml(loc, subCnt, rcrds) {                 //console.log('loc = %O', loc);
    locRcrds = locRcrds || rcrds;
    return getLocSummaryPopup(loc, subCnt);
}
function getLocSummaryPopup(loc, subCnt) {
    const div = _util.buildElem('div');
    const html = buildLocDetailsHtml(loc, subCnt);
    const bttn = buildToTableButton(loc);
    $(div).append(html).append(bttn);
    return div;
}
function buildLocDetailsHtml(loc, subCnt) {
    const name = getLocNameHtml(loc);
    const cnt = ifCountryGetIntCnt(loc);
    const subs = null; //getSubLocsWithoutGpsData(subCnt);
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
        const str = getTopThreeReportStr(habitats, buildLocSummaryStr);
        return `Habitats: <b>&ensp; ${str}</b>`;
    }
}
/** --- Cited Bats --- */
/** Build string of 3 most reported taxonyms and the count of remaining taxa reported. */
function getBatsCitedHtml(loc) {    
    const rcrds = _util.getDataFromStorage(['interaction', 'taxon']);
    const allBats = {};
    getAllBatsWithin(loc.id);
    const bats = getTopThreeReportStr(allBats, buildLocSummaryStr);
    return `Cited bats: <b>${bats}</b>`;
    
    function getAllBatsWithin(id) {  
        const loc = locRcrds[id];
        if (loc.interactions.length) { addBats(loc.interactions); }
        if (loc.children.length) { loc.children.forEach(getAllBatsWithin); }
    }
    function addBats(interactions) {
        const ints = interactions.map(id => rcrds.interaction[id]);
        ints.forEach(int => trackBatInteraction(rcrds.taxon[int.subject], allBats));
    }
} /* End getBatsCitedHtml */
function trackBatInteraction(bat, allBats) {                                    //console.log('bat = %O', bat);
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
 * Callback builds a string with the three names with the highest count, and a 
 * total of all items (habitats/bats) counted.
 */
function getTopThreeReportStr(obj, cb) {
    const ttl = Object.keys(obj).length;                                       
    const sorted = { 1: [], 2: [], 3: [] };
    const posKeys = Object.keys(sorted);
    for (let name in obj) {
        sortItem(obj[name], name);
    }                                                                           //console.log('sorted habs = %O', sorted)
    return cb(sorted, ttl);

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
/**
 * Returns string with the names of top 3 reported taxa and total taxa count.
 * Formatted for the Map View  Location summary popups.
 */
function buildLocSummaryStr(sorted, ttl) {
    return ttl == 1 ? sorted[1][1] : formatString(sorted, ttl);
}
function formatString(sorted, ttl) {
    const tabs = '&emsp;&emsp;&emsp;&emsp;&emsp;';
    let str = concatNames(sorted, tabs);
    return finishLocTop3ReportString(str, ttl, tabs);
}
function concatNames(sorted, tabs) {
    let str = '';
    for (let i = 1; i <= 3; i++) { str += formatName(i, sorted, tabs); }
    return str;
}
function formatName(i, sorted, tabs) {
    return !sorted[i][1] ? '' : (i === 1 ? '': `,<br>${tabs}`) + sorted[i][1];
}
function finishLocTop3ReportString(str, ttl, tabs) {
    if (ttl > 3) { str += `<br></b>${tabs}(${ttl} total cited here.)`;}
    return str;
} /* ---- End Location Summary string build ---- */
/** --- Button to show interactions in the data-table --- */
function buildToTableButton(loc) {
    const bttn = _util.buildElem('input', {type: 'button',
        class:'ag-fresh tbl-bttn', value: 'Show Interactions In Data-Table'});
    $(bttn).click(showLocTableView.bind(null, loc));
    $(bttn).css({'margin': '.5em 0 0 -.4em'});
    return bttn;
}
function showLocTableView(loc) {
    console.log('Switch to table view and show location.');
    db_page.showLocInDataTable(loc);
}