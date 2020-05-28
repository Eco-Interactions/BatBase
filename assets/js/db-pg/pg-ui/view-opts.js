/**
 * Fills the View combobox with the options for the selected focus: Source ->
 * Source Types, Location -> Region & Country, Taxon -> all realms with interactions.
 * 
 * Exports:
 *     initLocViewOpts
 *     initSrcViewOpts
 *     initTxnViewOpts
 */
import * as pg from '../db-main.js';
/* ---------------------------- LOCATION VIEW ----------------------------------------------------------------------- */
/**
 * Builds location view html and initializes table load. Either builds the table 
 * data-tree view, by default, or loads the data-map view, if previously 
 * selected. 
 */ 
export function initLocViewOpts(view) {                             /*Perm-log*/console.log("       --Init Location UI. view ? [%s]", view);        
    loadLocationViewOpts();
    if (view) { setLocView(view); 
    } else { pg._u('getData', ['curView']).then(setLocView); }
} 
function loadLocationViewOpts() {
    if ($('#sel-view').data('focus') === 'locs') { return; }
    const opts = [{ value: 'map', text: 'Map Data' },
                { value: 'tree', text: 'Table Data' }];
    pg._u('replaceSelOpts', ['#sel-view', opts, pg.onLocViewChange]);
    $('#sel-view').data('focus', 'locs');
}
function setLocView(view) {
    pg._u('setSelVal', ['View', view, 'silent']);
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
    if ($('#sel-view').data('focus') === 'srcs') { return ; }
    const opts = [{ value: "auths", text: "Authors" },
                  { value: "pubs", text: "Publications" },
                  { value: "publ", text: "Publishers" }];
    pg._u('replaceSelOpts', ['#sel-view', opts, pg.onSrcViewChange]);
    $('#sel-view').data('focus', 'srcs');
} 
/** Restores stored realm from previous session or sets the default 'Publications'. */
function setSrcView(view) {
    pg.accessTableState().set({'curView': view});
    if (!pg._u('setSelVal', ['View'])) { pg._u('setSelVal', ['View', view, 'silent']); } 
}

/* ---------------------------- TAXON VIEW -------------------------------------------------------------------------- */
/** Loads the taxon view options and updates the data-view combobox. */
export function initTxnViewOpts(view, reset) {                             //console.log("initTxnViewOpts. realms = %O", realms);
    pg._u('getData', ['realm']).then( realms => {                                       //console.log('--initTxnViewOpts. realms = %O', realms)
        loadTxnViewOpts(realms, reset);
        setTaxonView(view); 
    });
}
function loadTxnViewOpts(realms, reset) {
    if ($('#sel-view').data('focus') === 'taxa' && !reset) { return; }
    buildAndLoadTxnOpts(realms);
}
function buildAndLoadTxnOpts(realms) {
    const opts = getViewOpts(realms);
    pg._u('replaceSelOpts', ['#sel-view', opts, pg.onTxnViewChange]);
    $('#sel-view').data('focus', 'taxa');
}
function getViewOpts(realms) { 
    const taxa = pg.accessTableState().get('rcrdsById');
    const optsAry = [];
    Object.keys(realms).forEach(buildRealmOpt);
    return optsAry;
    
    function buildRealmOpt(id) {  
        const rootTxn = taxa[realms[id].taxon];  
        const val = rootTxn ? rootTxn.id : id+'temp';                           //console.log('realm = %O rootTxn = %O', realms[id], rootTxn);
        if (Number.isInteger(val) && !ifTxnHasInts(rootTxn.id)) { return; }
        optsAry.push({ value: val, text: realms[id].pluralName });
    }
    function ifTxnHasInts(id) {
        const taxon = taxa[id];
        const hasInts = !!taxon.subjectRoles.length || !!taxon.objectRoles.length;
        return hasInts || taxon.children.find(ifTxnHasInts);
    }
}
/** Restores stored realm from previous session or sets the default 'Bats'. */
function setTaxonView(view) {
    if (!pg._u('getSelVal', ['View'])) { 
        const realmVal = view ? view : '2';  
        pg._u('setSelVal', ['View', realmVal, 'silent']);
    }
}