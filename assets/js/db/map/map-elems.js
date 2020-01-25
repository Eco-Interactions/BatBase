/**
 * Handles customized map element builds.
 *
 * EXPORTS (& TOC):
 *     addLocCountLegend
 *     addCountToLegend
 *     addNewLocBttn
 *     addClickToCreateLocBttn
 *     addDrawNewLocBoundaryBttn
 */
import * as _u from '../util/util.js';
import { getMapState, setMapState } from './map-main.js';
import { create as _create } from '../forms/forms-main.js';

/*--- Location Count Legend ---*/
export function addLocCountLegend(map) {
    const legend = L.control({position: 'topright'});
    legend.onAdd = addLocCountHtml;
    legend.addTo(map);
}
function addLocCountHtml() {
    return _u.buildElem('div', { id: 'cnt-legend', class: 'info legend flex-col'});
}
export function addCountToLegend(ttlLocs, noGpsDataCnt, prnt) {
    const noGpsDataHtml = noGpsDataCnt === 0 ? null : 
        `<span style="align-self: flex-end;">${noGpsDataCnt} without GPS data</span>`;
    const plural = ttlLocs === 1 ? '' : 's';    
    let name = getLocName(prnt.displayName);
    $('#cnt-legend').html(`
        <h3 title='${prnt.displayName}'>${ttlLocs} location${plural} in ${name}</h3>
        ${noGpsDataHtml ? noGpsDataHtml : ''}`);
}
function getLocName(name) {
    name = name.split('[')[0];                                
    return name.length < 22 ? name : name.substring(0, 19)+'...';
}
/*--- Create New Location Button ---*/
export function addNewLocBttn(map) {
    addNewLocControl();
    L.control.create({ position: 'topleft' }).addTo(map);
}
function addNewLocControl() {
    L.Control.Create = L.Control.extend({
        onAdd: map => {
            const bttn = createNewLocBttn();
            $(bttn).click(_create.bind(null, 'location', null));
            return bttn;
        },
        onRemove: map => {}
    });
    L.control.create = opts => new L.Control.Create(opts);
}
function createNewLocBttn() {
    const className = 'custom-icon leaflet-control-create',
        container = L.DomUtil.create('div', className),
        button = L.DomUtil.create('input', className + '-icon', container);
    button.type = 'button';
    $(container).attr('title', "Create New Location").append(button);
    return container;
}
/*--- Click To Create New Location Button ---*/
export function addClickToCreateLocBttn(map) {
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
    
    $(container).attr('title', "Click on map to select location position").append(button);
    return container;
}
/**
 * Sets a flag that will trigger reverse geocode of the coordinates of subsequent 
 * map clicks.
 */
function createNewLocHere(e) {                                                  //console.log('Create new location with click! %O', e)
    const bttnActive = isButtonActive();
    const $bttn = $('input.leaflet-control-click-create-icon');
    bttnActive ? $bttn.addClass('active-icon') : $bttn.removeClass('active-icon');
}
/* Returns true if button activated. Updates map state with button status. */
function isButtonActive() {
    const _s = getMapState();
    const isActive = _s.flags.onClickDropPin ? !_s.flags.onClickDropPin : true;
    _s.flags.onClickDropPin = isActive;
    setMapState(_s);
    return isActive;
}
/*--- Draw Location Boundary Bttn ---*/
export function addDrawNewLocBoundaryBttn(map) {
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