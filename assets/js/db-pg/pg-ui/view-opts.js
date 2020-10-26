/**
 * Fills the View combobox with the options for the selected focus: Source ->
 * Source Types, Location -> Region & Country, Taxon -> all groups with interactions.
 *
 * Exports:
 *     initLocViewOpts
 *     initSrcViewOpts
 *     initTxnViewOpts
 */
import { _table, _u } from '../db-main.js';
/* ---------------------------- LOCATION VIEW ----------------------------------------------------------------------- */
/**
 * Builds location view html and initializes table load. Either builds the table
 * data-tree view, by default, or loads the data-map view, if previously
 * selected.
 */
export function initLocViewOpts(view) {                             /*Perm-log*/console.log("       --Init Location UI. view ? [%s]", view);
    loadLocationViewOpts();
    if (view) { setLocView(view);
    } else { _u('getData', ['curView']).then(setLocView); }
}
function loadLocationViewOpts() {
    if ($('#sel-View').data('focus') === 'locs') { return; }
    const opts = [{ value: 'map', text: 'Map Data' },
                { value: 'tree', text: 'Table Data' }];
    _u('replaceSelOpts', ['View', opts, _table.bind(null, 'onLocViewChange')]);
    $('#sel-View').data('focus', 'locs');
}
function setLocView(view) {
    _u('setSelVal', ['View', view, 'silent']);
}
/* ---------------------------- SOURCE VIEW ------------------------------------------------------------------------- */
/**
 * If the source-realm combobox isn't displayed, build it @buildSrcViewHtml.
 * If no realm selected, set the default realm value. Start table build @buildSrcTree.
 */
export function initSrcViewOpts(view) {                             /*Perm-log*/console.log("       --Init source UI. view ? [%s]", view);
    loadSourceViewOpts();
    setSrcView(view);
}
function loadSourceViewOpts() {
    if ($('#sel-View').data('focus') === 'srcs') { return ; }
    const opts = [{ value: "auths", text: "Authors" },
                  { value: "pubs", text: "Publications" },
                  { value: "publ", text: "Publishers" }];
    _u('replaceSelOpts', ['View', opts, _table.bind(null, 'onSrcViewChange')]);
    $('#sel-View').data('focus', 'srcs');
}
/** Restores stored realm from previous session or sets the default 'Publications'. */
function setSrcView(view) {
    _table('tableState').set({'curView': view});
    if (!_u('setSelVal', ['View'])) { _u('setSelVal', ['View', view, 'silent']); }
}
/* ---------------------------- TAXON VIEW -------------------------------------------------------------------------- */
/** Loads the taxon view options and updates the data-view combobox. */
export function initTxnViewOpts(view, reset) {
    loadTxnViewOpts(_table('tableState').get('groups'), reset);
    setTaxonView(view);
}
function loadTxnViewOpts(groups, reset) {
    if ($('#sel-View').data('focus') === 'taxa' && !reset) { return; }
    buildAndLoadTxnOpts(groups);
}
function buildAndLoadTxnOpts(groups) {
    const opts = getViewOpts(groups);
    _u('replaceSelOpts', ['View', opts, _table.bind(null, 'onTxnViewChange')]);
    $('#sel-View').data('focus', 'taxa');
}
function getViewOpts(groups) {
    const taxa = _table('tableState').get('rcrdsById');
    const optsAry = [];
    Object.keys(groups).forEach(buildGroupOpt);
    return _u('alphabetizeOpts', [optsAry]);

    function buildGroupOpt(id) {
        if (!ifGroupHasInts(groups[id].taxa)) { return; }
        optsAry.push({ value: id, text: groups[id].pluralName });
    }
    function ifGroupHasInts(rootTaxa) {
        return Object.values(rootTaxa).find(t => ifTxnHasInts(t.id));
    }
    function ifTxnHasInts(id){
        const taxon = taxa[id];
        const hasInts = !!taxon.subjectRoles.length || !!taxon.objectRoles.length;
        return hasInts || taxon.children.find(ifTxnHasInts);
    }
}
/** Restores stored group from previous session or sets the default 'Bats'. */
function setTaxonView(view) {
    if (!_u('getSelVal', ['View'])) {
        const groupVal = view ? view : '1';
        _u('setSelVal', ['View', groupVal, 'silent']);
    }
}