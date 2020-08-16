/**
 * The table can be filtered by object realm when in Taxon->Bat view.
 *
 * Exports
 * 		initObjectRealmCombobox
 * 		filterTableByObjectRealm
 *
 * TOC
 * 		INIT COMBOBOX
 * 		APPLY FILTER
 */
import { _ui, _u, rebuildTxnTable, accessTableState as tState } from '../../db-main.js';
import * as fM from '../filters-main.js';

/* ---------------------- INIT COMBOBOX ------------------------------------- */
export function initObjectRealmCombobox() {
    _u('getOptsFromStoredData', ['realmNames'])
    .then(buildObjectRealmCombo)
    .then(finishRealmComboInit);
}
function buildObjectRealmCombo(realms) {
    const lbl = _u('buildElem', ['label', { class: 'sel-cntnr flex-row objLbl' }]);
    const span = _u('buildElem', ['span', { text: 'Realms: ' }]);
    const opts = realms.filter(r => r.text !== 'Bat');  						//console.log('realms = %O', realms)
    const sel = fM.newSel(opts, 'opts-box objSel', 'selObjRealm', 'ObjRealm');
    $(lbl).append([span, sel]);
    return lbl;
}
function finishRealmComboInit(filterEl) {
    $('#focus-filters').append(filterEl);
    _u('initCombobox', ['ObjRealm', filterTableByObjectRealm, {maxItems: null}])
}
/* ----------------------- APPLY FILTER ------------------------------------- */
export function filterTableByObjectRealm(realmIds) {                            //console.log('filterTableByObjectRealm args = %O', arguments);

}