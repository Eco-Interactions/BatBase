/**
 * Manages the table-state object.
 *
 * Exports:
 *     tableState
 *     resetCurTreeStorageProps
 *     resetTableParams
 *
 * TOC
 *     ACCESS
 *     GET
 *     SET
 *         RESET
 */
import { _db } from '~util';
/**
 * Stores table state params needed throughout the page.
 *
 * {obj} api            Ag-grid API (available after table-init complete)
 * {obj} columnApi      Ag-grid Column API (available after table-init complete)
 * {str} curFocus       Focus of the data in table: taxa, srcs, locs
 * {str} curView        Sub-sort of table data. Eg: bats, auths, etc
 * {obj} filters        Current filter state.
 * {obj} flags          allDataAvailable, tutorialActive
 * {ary} openRows       Array of entity ids whose table rows will be expanded on load.
 * {ary} rowData        Row data in table
 * {obj} rcrdsById      Focus records keyed by ID
 * {obj} selectedOpts   K: Combobox key V: value selected
 * {str} userRole       Stores the role of the user.
 *
 * In Taxon views:
 * {ary} allgroupRanks   Array of all ranks present in the current tree.
 * {obj} groups          Group records keyed by id.
 * {obj} subGroups       Sub-group taxa: name (k) {name, displayName, id} (v)
 * {obj} allRanks        All ranks (k) and id (v)
 * {str} groupName       Stores Taxon view Group name
 * {obj} taxaByRank      Taxon records in curTree organized by rank and keyed under their display name.
 */
let tState = { flags: {}};
/* -------------------------- ACCESS ---------------------------------------- */
export function tableState() {
    return {
        get: getTableState,
        set: setTableState
    };
}
/* ----------------------------- GET ---------------------------------------- */
/** Returns table state to requesting module. */
//Todo: remove the redundant second param
function getTableState(k, keys) {                                               //console.log('getTableState. params? ', arguments);
    return k && Array.isArray(k) ? getStateObj(k) : k ? tState[k] :
        keys ? getStateObj(keys) : tState;
}
function getStateObj(keys) {
    const obj = {};
    keys.forEach(k => obj[k] = tState[k] || null);                              //console.log('stateObj = %O', obj)
    return obj;
}
/* ----------------------------- SET ---------------------------------------- */
function setTableState(stateObj) {                                              //console.log('setTableState. stateObj = %O', stateObj);
    Object.keys(stateObj).forEach(k => { tState[k] = stateObj[k]; })
}
/* ------------ RESET -------------- */
/** Resets on focus change. */
export function resetTableParams(f, dataAvailableFlag) {
    if (f) { return Promise.resolve(resetTblParams(f)); }
    return Promise.resolve(_db('getData', ['curFocus']).then(resetTblParams));

    function resetTblParams(focus) {
        const prevApi = tState.api; //will be destroyed before new table loads. Visually jarring to remove before the new one is ready.
        const flags = tState.flags ? tState.flags : {};
        if (dataAvailableFlag !== undefined) { tState.flags.allDataAvailable = dataAvailableFlag }
        tState = {
            api: prevApi,
            curFocus: focus,
            flags: flags,
            openRows: [],
            selectedOpts: {},
            userRole: $('body').data("user-role")
        };
    }
}
export function resetCurTreeStorageProps() {
    delete tState.curTree;
    tState.selectedOpts = {};
}