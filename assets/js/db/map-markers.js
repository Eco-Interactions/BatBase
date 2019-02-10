import * as _u from './util.js';
import * as db_page from './db-page.js';
import * as db_forms from './db-forms.js';
import 'leaflet.markercluster';

let locRcrds;

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
    constructor (latLng, loc, rcrds, formMarker) { 
        super(latLng);
        bindClassContextToMethods(this); 
        this.loc = loc;
        locRcrds = rcrds;
        this.formMarker = formMarker;
        this.self = L.marker(latLng, getCustomIcon(formMarker))
            .bindPopup(this.popup, {closeOnClick: false})
            .on('mouseover', this.openPopup);
        this.self.on('popupclose', this.onPopupClose);
        this.addMarkerEvents();
    }
    addMarkerEvents() {  
        this.self
            .on('mouseover', this.openPopup)
            .on('mouseenter', this.openPopup)
            .on('click', this.openAndFreezePopup)
            .on('mouseout', this.delayPopupClose);
    }
    removeMarkerEvents() {
        this.self.off('mouseover').off('click').off('mouseout');
    }
    /** --- Event Handlers --- */
    openPopup(e) {                         
        const map = {
            'form': getLocDetailsHtml, 'form-c': getCountryDetailsHtml, 
            'form-noGps': getNoGpsLocDetailsHtml, 'new-loc': getNewLocHtml 
        };                 
        if (!map[this.formMarker]) { return; }
        if (this.timeout) { clearMarkerTimeout(this.timeout); }
        if (!this.popup.getContent()) { 
            const content = this.formMarker ? 
                map[this.formMarker](this.loc) : getLocationSummaryHtml(this.loc);                
            this.popup.setContent(content);
        }
        this.self.openPopup();
    }
    /** 
     * Delays auto-close of popup if a nearby marker popup is opened while trying
     * to click the location summary button. 
     */
    openAndFreezePopup(e) {                                                     //console.log('openPopupAndDelayAutoClose')
        this.self.openPopup();
        this.popup.options.autoClose = false;
        this.removeMarkerEvents();
    }
    onPopupClose() {
        this.popup.options.autoClose = true;
        this.addMarkerEvents();
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
        this.self.on('popupclose', this.onPopupClose);
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
    onPopupClose() {
        this.popup.options.autoClose = true;
        this.addMarkerEvents();
    }
    closePopup() { 
        this.self.closePopup();
    }
    delayPopupClose(e) {  
        this.timeout = window.setTimeout(this.closePopup, 700);
    }
} /* End IntMarker Class */
export class LocCluster extends Marker {
    constructor (map, intCnt, latLng, loc, rcrds, formMarker) {  
        super(latLng);   
        bindClassContextToMethods(this); 
        this.map = map;
        this.loc = loc;
        this.formMarker = formMarker;
        locRcrds = rcrds;
        this.popup.options.closeOnClick = false;
        const opts = !formMarker ? false : {
            iconCreateFunction: () => L.divIcon({ 
                html: intCnt, className: 'form-noGps', iconSize: L.point(32, 32)})
        }; 
        this.self = opts ? L.markerClusterGroup(opts) : L.markerClusterGroup();
        this.addClusterEvents();
        this.addMarkersToCluser(intCnt);
        this.map.on('popupclose', this.closeLayerPopup);
    }
    addClusterEvents() {
        this.self.on('clustermouseover', this.openClusterPopup)
            .on('clustermouseenter', this.openClusterPopup)
            .on('clustermouseout', this.delayClusterPopupClose)
            .on('clusterclick', this.openAndFreezePopup); 
    }
    removeClusterEvents() {
        this.self.off('clustermouseover').off('clustermouseout').off('clusterclick'); 
    }
    addMarkersToCluser(intCnt) {  
        for (let i = 0; i < intCnt; i++) {  
            this.self.addLayer(L.marker(this.latLng)); 
        }
    }
    setDefaultPopupHtml() {
        const content = this.formMarker ? getNoGpsLocDetailsHtml(this.loc) : 
            getLocationSummaryHtml(this.loc);
        this.popup.setContent(content);
    }
    /** --- Event Handlers --- */
    openClusterPopup(c) {
        if (this.timeout) { clearMarkerTimeout(this.timeout); }
        if (!this.popup.getContent()) { this.setDefaultPopupHtml(); }
        this.map.openPopup(this.popup);
    }
    closeLayerPopup(e) {  
        if (e.popup._latlng === this.latLng) { 
            this.addClusterEvents();
        }
    }
    closePopup(){
        this.map.closePopup();
    }
    delayClusterPopupClose(e) {
        this.timeout = window.setTimeout(this.closePopup.bind(this), 700);
    }
    openAndFreezePopup(c) {  
        c.layer.unspiderfy(); //Prevents the 'spiderfy' animation for contained markers
        this.popup.options.autoClose = false;
        this.openClusterPopup(c);
        this.removeClusterEvents();
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
        this.map.on('popupclose', this.closeLayerPopup);
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
        this.removeClusterEvents();
        this.map.openPopup(this.popup);
    }
    /** Event fires before popup is fully closed. Restores after closed. */
    closeLayerPopup(e) {  
        if (e.popup._latlng === this.latLng) { 
            this.addClusterEvents();
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
function getCustomIcon(iconType) {                                              //console.log('iconType = ', iconType)
    if (!iconType) { return getGreenCircleMarker(); }
    if (iconType && iconType.includes('form')) { return null; }  //!iconType ||   //console.log('returning custom icon');
    return iconType === 'edit-loc' ? getTealPinMarker() : getGreenCircleMarker();
    /** Used for the edit-location forms to display the location being edited. */
    function getTealPinMarker() {
        return { 
            icon:  L.icon({
                iconUrl: require('./../../css/images/teal-marker-icon.png'),
                iconSize: [29, 43],
                iconAnchor: [16, 42],
                popupAnchor: [0, -39],
                shadowUrl: require('./../../css/images/marker-shadow.png'),
                shadowSize: [33, 45],
                shadowAnchor: [10, 44]
            })
        };
    }
    /** Displays single interactions on map as a green circle to match marker-clusters. */
    function getGreenCircleMarker() {  
        const classes = iconType || 'single-marker info';
        return {
            icon: L.divIcon({
                className: 'single-marker info',
                html: iconType === 'new-loc' ? '' : 1,
            })
        }
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
    summary += `<br><b>... ${ttl} interactions total.</b>`;
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
    const taxa = _u.getDataFromStorage('taxon');
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
function clearMarkerTimeout(timeout) { 
    clearTimeout(timeout); 
    timeout = null;                                                             //console.log('timout cleared')       
}
function getLocNameHtml(loc) {  
    let parent = loc.locationType.displayName === 'Country' ? '' :
        loc.country ? loc.country.displayName : 'Region';
    const locName = loc.displayName;
    return '<div style="font-size:1.2em;"><b>' + locName + 
        '</b></div><div style="margin: 0 0 .5em 0;">'+parent+'</div>';
} 
function getDescHtml(loc, strLngth) {
    if (!loc.description) { return; }
    const desc = loc.description.length < strLngth ? loc.description : 
        loc.description.substring(0, strLngth) + '...';
    return `<span title="${loc.description.replace(/"/g, '&quot;')}">Description: 
        <b>${desc}</b></span>`;
}
function getHabTypeHtml(loc, leaveBlank) {
    if (isRegionOrCountry(loc)) { return getAllHabitatsWithin(loc); }
    if (!loc.habitatType) { return leaveBlank ? '' : 'Habitat Type:'; }
    return `Habitat: <b>${loc.habitatType.displayName}</b>`;
}
function getCoordsHtml(loc) {
    const geoData = _u.getGeoJsonEntity(loc.geoJsonId);                       //console.log('geoJson = %O', geoData); 
    if (geoData.type !== 'Point' || isRegionOrCountry(loc)) { return false; }
    let coords = JSON.parse(geoData.displayPoint)
    coords = coords.map(c => Number(c).toFixed(6)); 
    return 'Coordinates: <b>' + [coords[1], coords[0]].join(', ') +'</b>';
}
function getSelectLocationBttn(loc) {
    const bttn = _u.buildElem('input', {type: 'button',
        class:'ag-fresh tbl-bttn popup-bttn', value: 'Select Existing Location'});
    $(bttn).click(db_forms.selectLoc.bind(null, loc.id));
    $(bttn).css({'margin-top': '.5em'});
    return bttn;
}
/** ========== Location Summary Popup ============== */
/** 
 * Returns additional details (html) for interactions at the location. 
 * Used when displaying interactions by location on the search page.
*/
export function getLocationSummaryHtml(loc, rcrds) {                            //console.log('loc = %O rcrds = %O', loc, rcrds);
    locRcrds = locRcrds || rcrds;
    return getLocSummaryPopup(loc);
}
function getLocSummaryPopup(loc) {
    const div = document.createElement('div');
    const html = buildSummaryHtml(loc);
    const bttn = buildToTableButton(loc);
    $(div).append(html).append(bttn);
    return div;
}
function buildSummaryHtml(loc) {
    const name = getLocNameHtml(loc);
    const cnt = ifCountryGetIntCnt(loc) || false;
    const desc = getDescHtml(loc, 99);
    const coords = getCoordsHtml(loc);
    const habType = getHabTypeHtml(loc);
    const bats = getBatsCitedHtml(loc);  
    return name + [cnt, desc, coords, habType, bats].filter(el => el).join('<br>');  
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
/** --- Habitat Types --- */
/** Build string of 3 most reported habitats and the count of remaining reported. */
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
    const rcrds = _u.getDataFromStorage(['interaction', 'taxon']);
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
    const bttn = _u.buildElem('input', {type: 'button',
        class:'ag-fresh tbl-bttn', value: 'Show Interactions In Data-Table'});
    $(bttn).click(showLocTableView.bind(null, loc));
    $(bttn).css({'margin': '.5em 0 0 -.4em'});
    return bttn;
}
function showLocTableView(loc) {
    db_page.showLocInDataTable(loc);
}
/* ============ Location Details Popup ================== */
/* Used for Countries displayed in forms. */
function getCountryDetailsHtml(loc) {
    return getLocDetailsHtml(loc, buldCntryDetailsHtml);
}
function buldCntryDetailsHtml(loc) {
    return `<div style="font-size:1.2em; margin-bottom: .5em;"><b>
        ${loc.displayName}</b></div>`;
}
/* Used for locations displayed in forms. */
function getLocDetailsHtml(loc, htmlFunc) {
    const div = _u.buildElem('div', { class: 'flex-col' });
    const html = htmlFunc ? htmlFunc(loc) : buildDetailsHtml(loc);
    const bttn = getSelectLocationBttn(loc);
    $(div).append([html, bttn]);
    return div;
}
function buildDetailsHtml(loc) {                                                //console.log('buildDetailsHtml loc = %O', loc);
    const name = `<div style="font-size:1.2em; margin-bottom: .5em;"><b>
        ${loc.displayName}</b></div>`;
    const cntnr = document.createElement('div');
    const habType = getHabTypeHtml(loc);
    const elev = getElevHtml(loc);
    const coords = getCoordsHtml(loc);
    const desc = getDescHtml(loc, 88);
    $(cntnr).append([name , [habType, elev, coords, desc].filter(e => e).join('<br>')]);   
    return cntnr;
}
function getElevHtml(loc) {
    if (!loc.elevation) { return; }
    const elev = `Elevation: <b>${loc.elevation}</b>`;
    const elevMax = loc.elevationMax ? 
        `&nbsp; Elevation Max: <b>${loc.elevationMax}</b>` : null;
    return [elev, elevMax].filter(e => e);
}
/* --- No Gps Loc Details ---*/
/** Locations without GPS data are clustered together on the location form map. */
function getNoGpsLocDetailsHtml(locs) {                                         //console.log('getNoGpsLocDetailsHtml. locs = %O', locs);
    const div = document.createElement('div');
    const hdr = getNoGpsHdr(locs.length);
    const locHtml = locs.map(loc => buildLocDetailHtml(loc));
    $(div).append([hdr, ...locHtml]);
    return div;
}
function getNoGpsHdr(cnt) {
    return `<div style="font-size:1.2em;"><b>${cnt} location with no GPS data.</b>
        </div><span>Hover over a location name to see the location data.</span><br>`;
}
function buildLocDetailHtml(loc) {  
    const cntnr = _u.buildElem('div', {class: 'info-tooltip'});
    const locDetails = _u.buildElem('div', {class: 'tip'});
    const bttn = getSelectLocationBttn(loc);
    $(locDetails).append([buildLocDetails(loc), '<br>', bttn]);
    $(cntnr).append([loc.displayName, locDetails]);
    return cntnr;
}
function buildLocDetails(loc) {
    const name = `<span style="font-size:1.1em; margin-bottom: .5em;"><b>
        ${loc.displayName}</b></span>`;
    const habType = getHabTypeHtml(loc, 'leaveBlank');
    const elev = getElevHtml(loc);
    const desc = getDescHtml(loc, 88);
    return [name, habType, elev, desc].filter(e => e).join('<br>'); 
}
/* ============ New Location Popup ============== */
/** Used when displaying a potential new location on the form. */
function getNewLocHtml(loc) {                                                   console.log('buildingNewLocationPopup')
    const cntnr = _u.buildElem('div', {class: 'flex-col new-loc-popup'});
    const text = getNewLocText(loc);
    const bttn = getCreateLocBttn();
    $(cntnr).append([text, bttn]);
    return cntnr;
}
function getNewLocText(loc) {
    const name = !loc ? 'No geo-data found. Please double-check coordinates.' : 
        'Near: <b>'+ loc.name;
    const html = `<div style="font-size:1.2em;">${name}</b></div>`;
    return `${html}After confirming that this location is unique, please fill in 
        all available data and click "Create Location" to submit.`;
}
function getCreateLocBttn() {
    const bttn = _u.buildElem('input', {type: 'button',
        class:'ag-fresh tbl-bttn', value: 'Create Location'});
    $(bttn).click(db_forms.addNewLocation);
    $(bttn).css({'margin': '.5em 0 0 -.4em'});
    return bttn;
}