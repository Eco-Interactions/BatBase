/**
 * Dis/enables various features and buttons when entering and leaving map views.
 * 
 * Exports:
 *   showTableRecordsOnMap
 *   updateUiForMapView
 *   updateUiForTableView
 */
import { updateUiForTableView, updateUiForMapView } from './ui-main.js';
import { _u, accessTableState as tState } from '../db-main.js';
import { showInts } from '../map/map-main.js';

export function updateMapUiForMapView() {
    updateBttnToReturnRcrdsToTable();
    $('#tool-bar').fadeTo('fast', 1);
    $('#search-tbl').hide();  
    $('#map').show(); 
}
export function updateMapUiForTableView() {
    $('#search-tbl').fadeTo('fast', 1);
    $('#map, #filter-in-tbl-msg').hide();
    updateBttnToShowRcrdsOnMap(); 
}
export function showTableRecordsOnMap() {                                              console.log('       +--showTableRecordsOnMap');
    const tblState = tState().get(null, ['curFocus', 'rcrdsById']);
    $('#search-tbl').fadeTo('fast', 0.3, () => {
        updateUiForMapView();
        getLocRcrds().then( rcrds => {
            showInts(tblState.curFocus, tblState.rcrdsById, rcrds);
        });
    });

    function getLocRcrds() {
        return Promise.resolve(tblState.curFocus !== 'locs' ? 
            _u('getData', ['location']) : tblState.rcrdsById);  
    }
}
function updateBttnToReturnRcrdsToTable() {
    $('#shw-map').text('Return to Table');
    $('#shw-map').off('click').on('click', returnRcrdsToTable)
        .prop('title', 'Close map and reopen records in table.');
}
function updateBttnToShowRcrdsOnMap() {
    $('#shw-map').text('Map Interactions');
    $('#shw-map').off('click').on('click', showTableRecordsOnMap)
        .prop('title', 'Show interactions on a map.');
}
function returnRcrdsToTable() {                                                 console.log('       +--returnRcrdsToTable');
    updateUiForTableView();
    if (_u('getSelVal', ['View']) === 'map') { _u('setSelVal', ['View', 'tree']); }
}