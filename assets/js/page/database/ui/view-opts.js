/**
 * Fills the View combobox with the options for the selected focus: Source ->
 * Source Types, Location -> Region & Country, Taxon -> all groups with interactions.
 *
 * Exports:
 *     initLocViewOpts
 *     initSrcViewOpts
 *     initTxnViewOpts
 */
import { _cmbx, _db } from '~util';
import { _table } from '~db';
/* ---------------------------- LOCATION VIEW ----------------------------------------------------------------------- */
/**
 * Builds location view html and initializes table load. Either builds the table
 * data-tree view, by default, or loads the data-map view, if previously
 * selected.
 */
export function initLocViewOpts(view) {                             /*perm-log*/console.log("       --Init Location UI. view ? [%s]", view);
    loadLocationViewOpts();
    if (view) { setLocView(view);
    } else { _db('getData', ['curView']).then(setLocView); }
}
function loadLocationViewOpts() {
    if ($('#sel-View').data('focus') === 'locs') { return; }
    const opts = [{ text: 'Map Data', value: 'map'}, { text: 'Table Data', value: 'tree'}];
    _cmbx('replaceSelOpts', ['View', opts, _table.bind(null, 'onLocViewChange')]);
    $('#sel-View').data('focus', 'locs');
}
function setLocView(view) {
    _cmbx('setSelVal', ['View', view, 'silent']);
}
/* ---------------------------- SOURCE VIEW ------------------------------------------------------------------------- */
/**
 * If the source-realm combobox isn't displayed, build it @buildSrcViewHtml.
 * If no realm selected, set the default realm value. Start table build @buildSrcTree.
 */
export function initSrcViewOpts(view) {                             /*perm-log*/console.log("       --Init source UI. view ? [%s]", view);
    loadSourceViewOpts();
    setSrcView(view);
}
function loadSourceViewOpts() {
    if ($('#sel-View').data('focus') === 'srcs') { return ; }
    const opts = getSrcViewopts();
    _cmbx('replaceSelOpts', ['View', opts, _table.bind(null, 'onSrcViewChange')]);
    $('#sel-View').data('focus', 'srcs');
}
function getSrcViewopts() {
    return [
        { text: 'Authors', value: 'auths'},
        { text: 'Publications', value: 'pubs'},
        { text: 'Publishers', value: 'publ'}
    ];
}
/** Restores stored realm from previous session or sets the default 'Publications'. */
function setSrcView(view) {
    _table('tableState').set({'curView': view});
    if (!_cmbx('setSelVal', ['View'])) { _cmbx('setSelVal', ['View', view, 'silent']); }
}
/* ---------------------------- TAXON VIEW -------------------------------------------------------------------------- */
/** Loads the taxon view options and updates the data-view combobox. */
export function initTxnViewOpts(view) {
    _cmbx('getOptsFromStoredData', ['pluralGroupNames'])
    .then(loadTxnViewOpts)
    .then(() => setTaxonView(view));
}
function loadTxnViewOpts(opts) {
    _cmbx('replaceSelOpts', ['View', opts, _table.bind(null, 'onTxnViewChange')]);
    $('#sel-View').data('focus', 'taxa');
}
function getViewOpts(groups) {
    const taxa = _table('tableState').get('rcrdsById');
    const optsAry = [];
    Object.keys(groups).forEach(buildGroupOpt);
    return _cmbx('alphabetizeOpts', [optsAry]);

    function buildGroupOpt(id) {
        if (!ifGroupHasInts(groups[id].taxa)) { return; }
        optsAry.push({ text: groups[id].pluralName, value: id});
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
    if (!_cmbx('getSelVal', ['View'])) {
        const groupVal = view ? view : '1';
        _cmbx('setSelVal', ['View', groupVal, 'silent']);
    }
}