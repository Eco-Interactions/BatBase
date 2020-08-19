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

let timeout, totalObjectRealmCnt;
/* ---------------------- INIT COMBOBOX ------------------------------------- */
export function initObjectRealmCombobox() {
    _u('getOptsFromStoredData', ['realmNames'])
    .then(setRealmCnt)
    .then(buildObjectRealmCombo)
    .then(finishRealmComboInit);
}
function setRealmCnt(realms) {
    totalObjectRealmCnt = realms.length - 1; //All but the Bat realm can be objects
    return realms;
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
    _u('initCombobox', ['Object Realm', filterTableByObjectRealm, {maxItems: null}])
}
/* ----------------------- APPLY FILTER ------------------------------------- */
/**
 * When viewing by publication, interactions can be filtered by the publication type.
 * Handles synchronizing with the tree-text filter.
 */
export function filterTableByObjectRealm(realmIds) {                            //console.log('filterTableByObjectRealm args = %O', arguments);
	_ui('fadeTable');
	if (!timeout) { timeout = setTimeout(filterByObjRealms, 1000); }
}
function filterByObjRealms() {
	timeout = null;
    const realmIds = _u('getSelVal', ['ObjRealm']);
    const filterObj = buildObjRealmFilterObj(realmIds);
    ifAllRealmsSelectedClearFilter(realmIds.length);
	fM.setFilterState('combo', filterObj, 'direct');
	fM.onFilterChangeUpdateRowData();
    _ui('showTable');

    function ifAllRealmsSelectedClearFilter(selectedRealmCnt) {                 //console.log('selectedRealmCnt [%s] !== totalObjectRealmCnt [%s]', selectedRealmCnt, totalObjectRealmCnt, selectedRealmCnt !== totalObjectRealmCnt)
        if (selectedRealmCnt !== totalObjectRealmCnt) { return; }
        filterObj['Object Realm'] = false;
        $('#selObjRealm')[0].selectize.clear();
    }
}
function buildObjRealmFilterObj(realmIds) {
    return { 'Object Realm': realmIds };
}