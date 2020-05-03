/*
 * Handles the focus-specific filters in the filter panel.  
 *      
 * Exports:
 *      loadLocFilterPanelUi
 *      loadSrcFilterPanelUi
 *      loadTxnFilterPanelUi
 *      newSelEl
 *      
 * TOC:
 *      LOCATION
 *      SOURCE
 *      TAXON
 *      SUB-UTIL
 */
import * as pM from '../../panels-main.js';
import * as fLoc from './loc-filters.js';
import * as fSrc from './src-filters.js';
import * as fTxn from './txn-filters.js';

/* ============================ LOCATION ==================================== */
export function loadLocFilterPanelUi(tblState) {                    
    return fLoc.loadLocFilterPanelUi(tblState);
}
export function updateLocSearch(val, selType) {                                 
    return fLoc.updateLocSearch(val, selType);
}
/* ============================= SOURCE ===================================== */
export function loadSrcFilterPanelUi(realm) {                       /*Perm-log*/console.log("       --Init Source Filter Panel UI. realm = [%s]", realm);
    return fSrc.loadSrcFilterPanelUi(realm);
}
export function updatePubSearch() {                                             console.log('       +-updatePubSearch.')
    return fSrc.updatePubSearch();
}
/* ============================ TAXON ======================================= */
export function loadTxnFilterPanelUi(tblState) {
    return fTxn.loadTxnFilterPanelUi(tblState);
}
export function updateTaxonSearch(val, selLvl) {                                        
    return fTxn.updateTaxonSearch(val, selLvl);
}
/* ========================= SUB-UTIL ======================================= */
export function newSelEl(opts, c, i, field) {                                   //console.log('newSelEl for [%s]. args = %O', field, arguments);
    const elem = pM.pgUtil('buildSelectElem', [opts, { class: c, id: i }]);
    $(elem).data('field', field);
    return elem;
}