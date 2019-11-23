/**
 * Contains code used to specifically build the interaction form. 
 *
 * CODE SECTIONS
 *
 *
 * Exports:             Imported by:
 *     getIntFormFields         forms-main
 *     selectLoc                forms-main
 */
// import * as _u from '../../../util.js';
import * as _forms from '../forms-main.js';

let fP;
/** ====================== ALIAS HELPERS ==================================== */
const _cmbx = _forms.uiCombos;
const _elems = _forms.uiElems;
const _panel = _forms.uiPanel;
const _mmry = _forms.memory;
const _u = _forms._util;
/** ================ INIT INTERACTION FORM ================================== *//**
 * Fills the global fP obj with the basic form params @_forms.initFormMemory. 
 * Inits the interaction form with all fields displayed and the first field, 
 * publication, in focus. From within many of the fields the user can create 
 * new entities of the field-type by selecting the 'add...' option from the 
 * field's combobox and completing the appended sub-form.
 */
export function initCreateForm(entity) {                                        console.log('   //Building New Interaction Form');
    _mmry('initFormMemory', ['create', 'interaction'])
    .then(fP => getInteractionFormFields(fP))
    .then(fields => _elems('buildAndAppendForm', ['top', fields]))
    .then(() => finishInteractionFormBuild())
    .catch(err => _u('alertErr', [err]));
}
export function getComboEvents(entity) {
    return entity === 'interaction' ? getInteractionEvents() : getTaxonEvents();
}
function getInteractionEvents() {
    return {
        'CitationTitle': { change: onCitSelection, add: create('Citation') },
        'Country-Region': { change: onCntryRegSelection },
        'InteractionType': { change: focusIntTypePin },
        'Location': { change: onLocSelection, add: create('Location')},
        'Publication': { change: onPubSelection, add: create('Publication')},
        'Subject': { change: onTaxonSelection.bind(null, 'Subject') },
        'Object': { change: onTaxonSelection.bind(null, 'Object') },
    };
}
function getTaxonEvents() {
    return {
        'Species': { change: onLevelSelection, add: create('Species') },
        'Genus': { change: onLevelSelection, add: create('Genus') },
        'Family': { change: onLevelSelection, add: create('Family') },
        'Order': { change: onLevelSelection, add: create('Order') },
        'Class': { change: onLevelSelection, add: create('Class') },
        'Realm': { change: onRealmSelection }
    };
}
function create(entity) {
    return _forms.createSubEntity.bind(null, entity);
}
/** ==================== INIT FORM FIELDS =================================== */
/** Builds and returns all interaction-form elements. */
export function getInteractionFormFields(params) {                                      
    fP = params;                                                                console.log('       --buildIntFormFields. fP = %O', fP);
    const builders = [ buildPubFieldRow, buildCitFieldRow, buildCntryRegFieldRow,
        buildLocFieldRow, initSubjField, initObjField, buildIntTypeField,
        buildIntTagField, buildIntNoteField ];
    return Promise.all([...builders.map(buildField)]);
}
function buildField(builder) { 
    return Promise.resolve(builder()).then(field => {
        ifSelectElemAddToComboboxInitAry(field); 
        return field;
    });                                                
}
function ifSelectElemAddToComboboxInitAry(field) {
    const fieldType = field.children[1].children[1].nodeName; 
    if (fieldType !== "SELECT") { return; }  
    _mmry('addComboToMemory', ['top', field.id.split('_row')[0]]);
}
/*------------------ Publication ---------------------------------------------*/
/**
 * Returns a form row with a publication select dropdown populated with all 
 * current publication titles.
 */
function buildPubFieldRow() {                                                 console.log('       --buildPubFieldRow');
    return _elems('getSrcOpts', ['pubSrcs', null, fP.records.source])
        .then(buildPubRow);
}
function buildPubRow(opts) {
    const attr = { id: 'Publication-sel', class: 'lrg-field' };
    const selElem = _u('buildSelectElem', [opts, attr]);
    return _elems('buildFormRow', ['Publication', selElem, 'top', true]);
}
/** 
 * When an existing publication is selected, the citation field is filled with 
 * all current citations for the publciation. When a publication is created, 
 * the citation form is automatically opened. 
 */
function onPubSelection(val) {                                                  console.log('   --onPubSelection'); 
    if (val === 'create') { return _forms.create('publication'); }        
    if (val === '' || isNaN(parseInt(val)) ) { return onPubClear(); }                                
    fillCitationField(val);
    _panel('updateSrcDetails', ['pub']);
    if (!hasCitation(val)) { return _forms.create('citation'); }
    if (!fP.editing) { $('#Publication_pin').focus(); }
}
function hasCitation(val) {
    return fP.records.source[val].children.length;
}
function onPubClear() {
    _cmbx('clearCombobox', ['#CitationTitle-sel']);
    _cmbx('enableCombobox', ['#CitationTitle-sel', false]);
    _panel('clearDetailPanel', ['pub']);
}
/** When the Citation sub-form is exited, the Publication combo is reenabled. */
function enablePubField() {
    _cmbx('enableCombobox', ['#Publication-sel']);
    fillCitationField($('#Publication-sel').val());
}
/*------------------ Citation ------------------------------------------------*/
/** Returns a form row with an empty citation select dropdown. */
function buildCitFieldRow() {                                                   console.log('       --buildCitFieldRow');
    const attr = {id: 'CitationTitle-sel', class: 'lrg-field'};
    const selElem = _u('buildSelectElem', [ [], attr]);
    return _elems('buildFormRow', ['CitationTitle', selElem, 'top', true]);
}
/** Fills the citation combobox with all citations for the selected publication. */
function fillCitationField(pubId) {                                             //console.log("initCitSelect for publication = ", pubId);
    _cmbx('enableCombobox', ['#CitationTitle-sel']);
    _cmbx('updateComboboxOptions', ['#CitationTitle-sel', getPubCitationOpts(pubId)]);
}
/** Returns an array of option objects with citations for this publication.  */
function getPubCitationOpts(pubId) {
    const pubRcrd = fP.records.source[pubId];  
    if (!pubRcrd) { return [{ value: 'create', text: 'Add a new Citation...'}]; }
    const opts = _elems('getRcrdOpts', [pubRcrd.children, fP.records.source]);
    opts.unshift({ value: 'create', text: 'Add a new Citation...'});
    return opts;
}
/** 
 * When a Citation is selected, both 'top' location fields are initialized
 * and the publication combobox is reenabled. 
 */    
function onCitSelection(val) {                                                  console.log('       --onCitSelection [%s]', val);
    if (val === 'create') { return _forms.create('citation'); }
    if (val === '' || isNaN(parseInt(val))) { return _panel('clearDetailPanel', ['cit']); }                     //console.log("cit selection = ", parseInt(val));                          
    _panel('updateSrcDetails', ['cit']);
    _cmbx('enableCombobox', ['#Publication-sel']);
    if (!fP.editing) { $('#CitationTitle_pin').focus(); }
}    
/*-------------- Country/Region ------------------------------------------*/
/** Returns a form row with a combobox populated with all countries and regions. */
function buildCntryRegFieldRow() {                                              console.log('       --buildCntryRegFieldRow');
    return getCntryRegOpts().then(buildCntryRegRow);
}
function buildCntryRegRow(opts) {
    const attr = {id: 'Country-Region-sel', class: 'lrg-field'};
    const selElem = _u('buildSelectElem', [opts, attr]);
    return _elems('buildFormRow', ['Country-Region', selElem, 'top', false]);
}
/** Returns options for each country and region. */ 
function getCntryRegOpts() {
    const proms = ['countryNames', 'regionNames'].map(k => _u('getOptsFromStoredData', [k]));
    return Promise.all(proms).then(data => data[0].concat(data[1]));
}
/** 
 * When a country or region is selected, the location dropdown is repopulated 
 * with it's child-locations and, for regions, all habitat types. When cleared, 
 * the combobox is repopulated with all locations. 
 * If the map is open, the country is outlined and all existing locations within
 * are displayed @focusParentAndShowChildLocs
 */
function onCntryRegSelection(val) {                                             console.log("       --onCntryRegSelection [%s]", val);
    if (val === "" || isNaN(parseInt(val))) { return fillLocationSelect(null); }          
    const loc = fP.records.location[val];
    fillLocationSelect(loc);
    if (!fP.editing) { $('#Country-Region_pin').focus(); }
    if ($('#loc-map').length) { _forms.focusParentAndShowChildLocs('int', val); }    
}
/*------------------ Location ------------------------------------------------*/
/**
 * Returns a form row with a select dropdown populated with all available locations.
 */
function buildLocFieldRow() {                                                   console.log('       --buildLocFieldRow');
    const locOpts = getLocationOpts();                                          //console.log("locOpts = %O", locOpts);
    const attr = {id: 'Location-sel', class: 'lrg-field'};
    const selElem = _u('buildSelectElem', [locOpts, attr]);
    return _elems('buildFormRow', ['Location', selElem, 'top', false]);
}
/** Returns an array of option objects with all unique locations.  */
function getLocationOpts() {
    const rcrds = fP.records.location;
    let opts = Object.keys(rcrds).map(buildLocOpt);
    opts = opts.sort((a, b) => _u('alphaOptionObjs', [a, b]));
    opts.unshift({ value: 'create', text: 'Add a new Location...'});
    return opts;
    
    function buildLocOpt(id) {
        return { value: id, text: rcrds[id].displayName };
    }
}
/**
 * When a country/region is selected, the location combobox is repopulated with its 
 * child-locations and all habitat types. When cleared, the combobox is 
 * repopulated with all locations. 
 */ 
function fillLocationSelect(loc) {                                              //console.log("fillLocationSelect for parent Loc = %O", loc);
    const opts = loc ? getOptsForLoc(loc) : getLocationOpts();    
    _cmbx('updateComboboxOptions', ['#Location-sel', opts]);
}          
/** Returns an array of options for the locations of the passed country/region. */
function getOptsForLoc(loc) {
    let opts = getChildLocOpts(loc.children)
    opts.push({ value: loc.id, text: loc.displayName });
    opts = opts.sort((a, b) => _u('alphaOptionObjs', [a, b]));
    opts.unshift({ value: 'create', text: 'Add a new Location...'});
    return opts;
}
function getChildLocOpts(children) {
    return children.map(id => ({
        value: id, text: fP.records.location[id].displayName 
    }));
}
/** 
 * When a location is selected, its country/region is selected in the top-form
 * combobox and the location record's data is added to the detail panel. If 
 * the location was cleared, the detail panel is cleared. 
 */     
function onLocSelection(val) {                                                  console.log('           --onLocSelection [%s]', val);
    if (val === 'create') { return _forms.create('Location'); }
    if (val === '' || isNaN(parseInt(val))) { return _panel('clearDetailPanel', ['loc']); }   
    if ($('#loc-map').length) { removeLocMap(); }
    const locRcrd = fP.records.location[val];                                   //console.log("location = %O", locRcrd);
    const prntVal = locRcrd.parent ? locRcrd.parent : locRcrd.id;
    _cmbx('setSelVal', ['#Country-Region-sel', prntVal, 'silent']);
    _panel('fillLocDataInDetailPanel', [locRcrd]);
    if (!fP.editing) { $('#Location_pin').focus(); }
    checkIntFieldsAndEnableSubmit();
}
function removeLocMap() {
    $('#loc-map').fadeTo(400, 0, () => $('#loc-map').remove());
}
export function selectLoc(id) {
    $('#sub-form').remove();
    _cmbx('setSelVal', ['#Location-sel', id]);
    enableCountryRegionField();
    _cmbx('enableCombobox', ['#Location-sel']);
    removeLocMap();
}
/** When the Location sub-form is exited, the Country/Region combo is reenabled. */
export function enableCountryRegionField() {  
    _cmbx('enableCombobox', ['#Country-Region-sel']);
    $('#loc-note').fadeTo(400, 1);
}
/*--------------------- Taxon ------------------------------------------------*/
/** Builds the Subject combobox that will trigger the select form @initSubjectSelect. */
function initSubjField() {                                                      console.log('       --initSubjField');
    return buildTaxonField('Subject');
}
/** Builds the Object combobox that will trigger the select form @initObjectSelect. */
function initObjField() {                                                       console.log('       --initObjField');
    return buildTaxonField('Object');
}
function buildTaxonField(role) {
    const attr = {id: role + '-sel', class: 'lrg-field'};
    const sel = _u('buildSelectElem', [ [], attr]);
    return _elems('buildFormRow', [ role, sel, 'top', true]);
}
/**
 * Shows a sub-form to 'Select <Role>' of the interaction with a combobox for
 * each level present in the realm, (eg: Bat - Family, Genus, and Species), filled 
 * with the taxa at that level. When one is selected, the remaining boxes
 * are repopulated with related taxa and the 'select' button is enabled.
 */
export function initSubjectSelect() {                                           console.log('       --initSubjectSelect [%s]?', $('#Subject-sel').val());
    return initTaxonSelect('Subject', 'Bat')
        .then(() => finishTaxonSelectBuild('Subject'));
}
/** Note: The selected realm's level combos are built @onRealmSelection. */
export function initObjectSelect() {                                            console.log('       --initObjectSelect [%s]?', $('#Object-sel').val());
    const realm = getSelectedObjectRealm($('#Object-sel').val()); 
    return initTaxonSelect('Object', realm)
        .then(buildRealmFields);

    function buildRealmFields() {    
        const realmId = fP.forms.taxonPs.realmTaxon.realm.id;       
        _cmbx('setSelVal', ['#Realm-sel', realmId, 'silent']);
        return onRealmSelection(realmId);
    }
} 
/** Returns the realm taxon's lower-case name for a selected object taxon. */
function getSelectedObjectRealm(id) {                                       
    if (!id) { return _mmry('getObjectRealm'); }
    return fP.records.taxon[id].realm.displayName;
}
/* -------- SHARED TAXON SELECT FORM INIT METHODS --------- */
function initTaxonSelect(role, realm) {
    const fLvl = _forms.getSubFormLvl('sub');
    if ($('#'+fLvl+'-form').length !== 0) { return errIfSubFormOpen(role, fLvl); }
    return getRealmTaxon(realm)
        .then(rTaxon => _forms.buildTaxonSelectForm(role, realm, rTaxon, fLvl))
        .then(form => appendTxnFormAndInitCombos(role, fLvl, form))
}
/** Note: Taxon fields often fire their focus event twice. */
function errIfSubFormOpen(role, fLvl) {
    if (fP.forms.taxonPs.entity === _u('lcfirst', [role])) { return; }
    _forms.err('openSubFormErr', [role, null, fLvl]);
}
function appendTxnFormAndInitCombos(role, fLvl, form) {
    const lcRole = _u('lcfirst', [role]);
    $('#'+role+'_row').append(form);
    _cmbx('initFormCombos', [lcRole, fLvl, getTaxonEvents()]);           
}
/**
 * When complete, the select form is removed and the most specific taxon is displayed 
 * in the interaction-form <role> combobox. 
 */
function onTaxonSelection(role, val) {                                          //console.log("onTaxonSelection [%s] = ", role, val);
    if (val === "" || isNaN(parseInt(val))) { return; }         
    $('#'+_forms.getSubFormLvl('sub')+'-form').remove();
    $('#'+role+'-sel').data('selTaxon', $('#'+role+'-sel').val());
    enableTaxonCombos();
    if (!fP.editing) { $('#'+role+'_pin').focus(); }
}
export function enableTaxonCombos() {
    _cmbx('enableCombobox', ['#Subject-sel']);
    _cmbx('enableCombobox', ['#Object-sel']);
}
/**
 * Removes any previous realm comboboxes. Shows a combobox for each level present 
 * in the selected Taxon realm, plant (default) or arthropod, filled with the 
 * taxa at that level. 
 */
function onRealmSelection(val) {                                                console.log("               --onRealmSelection. val = ", val)
    if (val === '' || isNaN(parseInt(val))) { return Promise.resolve(); }          
    if ($('#realm-lvls').length) { $('#realm-lvls').remove(); } 
    const fLvl = _forms.getSubFormLvl('sub');
    return _u('getData', ['realm'])
        .then(setRealmTaxonParams)
        .then(buildAndAppendRealmRows);

    function setRealmTaxonParams(realms) {
        const realm = realms[val].slug;
        return setTaxonParams('Object', _u('ucfirst', [realm])).then(() => realm);
    }
    /** A row for each level present in the realm filled with the taxa at that level.  */
    function buildAndAppendRealmRows(realm) {  
        _elems('buildFormRows', [realm, {}, fLvl])
        .then(rows => appendRealmRowsAndFinishBuild(realm, rows, fLvl));
    }
    function appendRealmRowsAndFinishBuild(realm, rows, fLvl) {  
        const realmElems = _u('buildElem', ['div', { id: 'realm-lvls' }]);
        $(realmElems).append(rows);
        $('#Realm_row').append(realmElems);
        _mmry('setFormFieldConfg', [fLvl, 'Realm', { val: null, type: 'select' }]);
        _cmbx('initFormCombos', [realm, fLvl, getTaxonEvents()]);  
        finishTaxonSelectBuild('Object');          
    }
}
/**
 * Customizes the taxon-select form ui. Either re-sets the existing taxon selection
 * or brings the first level-combo into focus. Clears the [role]'s' combobox. 
 */
export function finishTaxonSelectBuild(role) {                                     //console.log('finishTaxonSelectBuild')
    const fLvl = _forms.getSubFormLvl('sub');
    const selCntnr = role === 'Subject' ? '#'+fLvl+'-form' : '#realm-lvls';
    fP.forms.taxonPs = _mmry('getTaxonMemory');
    customizeElemsForTaxonSelectForm(role);
    if (ifSelectingTaxonInForm(role)) { resetPrevTaxonSelection(role);
    } else { _cmbx('focusFirstCombobox', [selCntnr]); }
    _u('replaceSelOpts', ['#'+role+'-sel', []]);
}
function ifSelectingTaxonInForm(role) {
    return $('#'+role+'-sel').data('reset') || $('#'+role+'-sel').val();
}
export function enableTaxonLvls(disable) {
    const enable = disable == undefined ? true : false;
    $.each($('#sub-form select'), (i, sel) => _cmbx('enableCombobox', ['#'+sel.id, enable]));
}

function setTaxonParams(role, realmName, id) {                                  //console.log('setTaxonParams. args = %O', arguments)
    const tPs = fP.forms.taxonPs;
    tPs.realm = realmName;
    return getRealmTaxon(realmName).then(updateTaxonParams);

    function updateTaxonParams(realmTaxon) {
        tPs.realmTaxon = realmTaxon;
        tPs.curRealmLvls = tPs.allRealmLvls[realmName];
        _mmry('setMemoryProp', ['taxonPs', tPs]);
    }
}
function getRealmTaxon(realm) {
    const lvls = { 'Arthropod': 'Phylum', 'Bat': 'Order', 'Plant': 'Kingdom' };
    const realmName = realm || _mmry.getObjectRealm();
    const dataProp = realmName + lvls[realmName] + 'Names'; 
    return _u('getData', [dataProp]).then(returnRealmTaxon);
}
function returnRealmTaxon(realmRcrds) {                                         //console.log('---realmTaxonRcrds = %O', realmRcrds);
    const realmId = realmRcrds[Object.keys(realmRcrds)[0]]
    return fP.records.taxon[realmId];  
}
/** Adds a close button. Updates the Header and the submit/cancel buttons. */
function customizeElemsForTaxonSelectForm(role) {
    $('#sub-hdr')[0].innerHTML = "Select " + role + " Taxon";
    $('#sub-hdr').append(getTaxonExitButton(role));
    $('#sub-submit')[0].value = "Select Taxon";        
    $('#sub-cancel')[0].value = "Reset";
    $('#sub-submit').unbind("click").click(selectTaxon);
    $('#sub-cancel').unbind("click").click(resetTaxonSelectForm.bind(null, role));
}
function getTaxonExitButton(role) {
    const bttn = _elems('getExitButton');
    bttn.id = 'exit-sub-form';
    $(bttn).unbind('click').click(exitTaxonSelectForm.bind(null, role));
    return bttn;
}
/** Exits sub form and restores any previous taxon selection. */
function exitTaxonSelectForm(role) {
    _forms.ui('exitForm', ['#sub-form', 'sub', false, enableTaxonCombos]);
    const prevTaxonId = $('#'+role+'-sel').data('selTaxon');
    if (!prevTaxonId) { return; }
    resetTaxonCombobox(role, prevTaxonId);
}
function resetTaxonCombobox(role, prevTaxonId) {
    const opt = { value: prevTaxonId, text: getTaxonym(prevTaxonId) };
    _cmbx('updateComboboxOptions', ['#'+role+'-sel', opt]);
    _cmbx('setSelVal', ['#'+role+'-sel', prevTaxon.val]);
}
function getTaxonym(id) {
    return _forms.getTaxonDisplayName(fP.records.taxon[id]);
}
/** Removes and replaces the taxon form. */
function resetTaxonSelectForm(role) {                                           console.log('resetTaxonSelectForm')                                     
    const realm = fP.forms.taxonPs.realm;
    const reset =  realm == 'Bat' ? initSubjectSelect : initObjectSelect;
    $('#'+role+'-sel').data('reset', true);
    $('#sub-form').remove();
    reset();
}
/** Resets the taxon to the one previously selected in the interaction form.  */
function resetPrevTaxonSelection(role) {                                       
    const id = $('#'+role+'-sel').data('selTaxon');                             
    const taxon = fP.records.taxon[id];                                         
    if (ifSelectedTaxonIsRealmTaxon(taxon)) { return; }                         console.log('           --resetPrevTaxonSelection. [%s] = %O', id, taxon);
    selectPrevTaxon(taxon, role);
}
function ifSelectedTaxonIsRealmTaxon(taxon) { 
    return fP.forms.taxonPs.curRealmLvls[0] == taxon.level.displayName;
}
function selectPrevTaxon(taxon, role) {
    addTaxonOptToTaxonMemory(taxon);
    if (ifTaxonInDifferentRealm(taxon.realm)) { return selectTaxonRealm(taxon); }
    _cmbx('setSelVal', ['#'+taxon.level.displayName+'-sel', taxon.id]);
    window.setTimeout(() => { deleteResetFlag(role); }, 1000);   //refactor
}
function addTaxonOptToTaxonMemory(taxon) {
    const displayName = _forms.getTaxonDisplayName(taxon);
    _mmry('setTaxonProp', ['prevSel', {val: taxon.id, text: displayName }]);
}
function ifTaxonInDifferentRealm(realm) {  
    return realm.displayName !== 'Bat' && $('#Realm-sel').val() != realm.id;
}
function selectTaxonRealm(taxon) {
    _cmbx('setSelVal', ['#Realm-sel', taxon.realm.id]);
}
function deleteResetFlag(role) {
    $('#'+role+'-sel').removeData('reset');
}
// function preventComboboxFocus(realm) {
//     const role = realm === 'Bat' ? 'subject' : 'object';  
//     const fLvl = fP.forms[role];
//     const selCntnr = realm === 'Bat' ? '#'+fLvl+'-form' : '#realm-lvls';        
//     _cmbx('focusFirstCombobox', [selCntnr, false]);
// }
/** Adds the selected taxon to the interaction-form's [role]-taxon combobox. */
function selectTaxon() {
    const role = fP.forms.taxonPs.realm === 'Bat' ? 'Subject' : 'Object';
    const opt = getSelectedTaxonOption();
    $('#sub-form').remove();
    _cmbx('updateComboboxOptions', ['#'+role+'-sel', opt]);
    _cmbx('setSelVal', ['#'+role+'-sel', opt.value]);
}
/** Returns an option object for the most specific taxon selected. */
function getSelectedTaxonOption() {
    const taxon = getSelectedTaxon();                                           //console.log("selected Taxon = %O", taxon);
    return { value: taxon.id, text: _forms.getTaxonDisplayName(taxon) };
}
/** Finds the most specific level with a selection and returns that taxon record. */
export function getSelectedTaxon(aboveLvl) {
    // fP = fP || _mmry('getAllFormMemory');
    const selElems = $('#sub-form .selectized').toArray();  
    if (ifEditingTaxon()) { selElems.reverse(); } //Taxon parent edit form.
    const selected = selElems.find(isSelectedTaxon.bind(null, aboveLvl));                              //console.log("getSelectedTaxon. selElems = %O selected = %O", selElems, selected);
    return !selected ? false : fP.records.taxon[$(selected).val()];
    
    function ifEditingTaxon() {
        return fP.action == 'edit' && fP.forms.top.entity == 'taxon';
    }
}
function isSelectedTaxon(resetLvl, elem) { 
    if (!ifIsLevelComboElem(elem)) { return; }
    if (resetLvl && ifLevelChildOfResetLevel(resetLvl, elem)) { return; }
    return $(elem).val(); 
}  
function ifLevelChildOfResetLevel() {
    const allLevels = fP.forms.taxonPs.lvls;
    const level = elem.id.split('-sel')[0];
    return allLevels.indexOf(level) > allLevels.indexOf(level);
}
function ifIsLevelComboElem(elem) {
    return elem.id.includes('-sel') && !elem.id.includes('Realm');
 } 
/**
 * When a taxon at a level is selected, all child level comboboxes are
 * repopulated with related taxa and the 'select' button is enabled. If the
 * combo was cleared, ensure the remaining dropdowns are in sync or, if they
 * are all empty, disable the 'select' button.
 */
function onLevelSelection(val) {                                                console.log("           --onLevelSelection. val = [%s] isNaN? [%s]", val, isNaN(parseInt(val)));
    if (val === 'create') { return openLevelCreateForm(this.$input[0]); }
    if (val === '' || isNaN(parseInt(val))) { return syncTaxonCombos(this.$input[0]); } 
    const fLvl = _forms.getSubFormLvl('sub');
    repopulateCombosWithRelatedTaxa(val);
    _forms.ui('toggleSubmitBttn', ['#'+fLvl+'-submit', true]);             
}
function openLevelCreateForm(selElem) {
    _forms.createSubEntity(selElem.id.split('-sel')[0]);
}
function syncTaxonCombos(elem) {                                                
    resetChildLevelCombos(getSelectedTaxon(elem.id.split('-sel')[0]));
}
function resetChildLevelCombos(selTxn) {                                        //console.log("resetChildLevelCombos. selTxn = %O", selTxn)
    const lvlName = selTxn ? selTxn.level.displayName : getRealmTopLevel();
    if (lvlName == 'Species') { return; }
    getChildlevelOpts(lvlName)
    .then(opts => repopulateLevelCombos(opts, {}));
}
function getRealmTopLevel() {
    return fP.forms.taxonPs.curRealmLvls[1];
}
function getChildlevelOpts(lvlName) { 
    const opts = {};
    const realm = fP.forms.taxonPs.realm;
    return buildChildLvlOpts().then(() => opts);

    function buildChildLvlOpts() {
        const lvls = fP.forms.taxonPs.lvls;
        const lvlIdx = lvls.indexOf(lvlName)+2; //Skips selected level
        const optProms = [];
        return getAllChildTaxonOpts();

        function getAllChildTaxonOpts() {
            for (var i = lvlIdx; i <= 7; i++) { 
                optProms.push(getTaxonOpts(i, lvls[i-1], realm));
            }
            return Promise.all(optProms);
        }
    }
    function getTaxonOpts(idx, level, realm) {
        return _elems('getTaxonOpts', [level, null, realm])
        .then(addToOpts.bind(null, idx));
    }
    function addToOpts(i, o) {  
        opts[i] = o;
    }
}
/**
 * Repopulates the comboboxes of child levels when a taxon is selected. Selected
 * and ancestor levels are populated with all taxa at the level and the direct 
 * ancestors selected. Child levels populate with only decendant taxa and
 * have no initial selection.
 * TODO: Fix bug with child taxa opt refill sometimes filling with all taxa.
 */
function repopulateCombosWithRelatedTaxa(selId) {
    const opts = {}, selected = {};                                               
    const lvls = fP.forms.taxonPs.lvls;  
    const taxon = fP.records.taxon[selId];                                      //console.log("repopulateCombosWithRelatedTaxa. taxon = %O, opts = %O, selected = %O", taxon, opts, selected);
    const realm = fP.forms.taxonPs.realm;

    taxon.children.forEach(addRelatedChild); 
    return buildUpdatedTaxonOpts()
        .then(repopulateLevelCombos.bind(null, opts, selected));

    function addRelatedChild(id) {                                              //console.log('addRelatedChild. id = ', id);
        const childTxn = fP.records.taxon[id];  
        const level = childTxn.level.id;
        addOptToLevelAry(childTxn, level);
        childTxn.children.forEach(addRelatedChild);
    }
    function addOptToLevelAry(childTxn, level) {
        if (!opts[level]) { opts[level] = []; }                                 //console.log("setting lvl = ", taxon.level)
        opts[level].push({ value: childTxn.id, text: childTxn.displayName });                                   
    }
    function buildUpdatedTaxonOpts() {
        return Promise.all([getSiblingOpts(taxon), getAncestorOpts(taxon.parent)])
        .then(buildOptsForEmptyLevels)
        .then(addCreateOpts);
    }
    function getSiblingOpts(taxon) {                                            
        return _elems('getTaxonOpts', [taxon.level.displayName, null, realm])
            .then(o => {                                                        //console.log('getSiblingOpts. taxon = %O', taxon);
                opts[taxon.level.id] = o;
                selected[taxon.level.id] = taxon.id;
            });  
    }
    function getAncestorOpts(prntId) {                                          //console.log('getAncestorOpts. prntId = [%s]', prntId);
        const realmTaxa = [1, 2, 3, 4]; //animalia, chiroptera, plantae, arthropoda
        if (realmTaxa.indexOf(prntId) !== -1 ) { return Promise.resolve(); }
        const prntTaxon = _mmry('getRcrd', ['taxon', prntId]);
        selected[prntTaxon.level.id] = prntTaxon.id;                            
        return _elems('getTaxonOpts', [prntTaxon.level.displayName, null, realm])
            .then(o => {                                                        //console.log("--getAncestorOpts - setting lvl = ", prntTaxon.level)
                opts[prntTaxon.level.id] = o;
                return getAncestorOpts(prntTaxon.parent);
            });
    }
    /**
     * Builds the opts for each level without taxa related to the selected taxon.
     * Ancestor levels are populated with all taxa at the level and will have 
     * the 'none' value selected.
     */
    function buildOptsForEmptyLevels() {                                        
        const topLvl = fP.forms.taxonPs.realm === "Arthropod" ? 3 : 5;  
        const proms = [];
        fillOptsForEmptyLevels();  
        return Promise.all(proms);

        function fillOptsForEmptyLevels() {             
            for (let i = 7; i >= topLvl; i--) {                                 //console.log('fillOptsForEmptyLevels. lvl = ', i);
                if (opts[i]) { continue; } 
                if (i > taxon.level.id) { opts[i] = []; continue; }
                buildAncestorOpts(i);
            }
        }
        function buildAncestorOpts(id) {
            selected[id] = 'none';
            proms.push(_elems('getTaxonOpts', [lvls[id-1], null, realm])
                .then(o => opts[id] = o ));
        }
    }
    function addCreateOpts() {                      
        for (let lvl in opts) {                                                 //console.log("lvl = %s, name = ", lvl, lvls[lvl-1]);
            opts[lvl].unshift({ value: 'create', text: 'Add a new '+lvls[lvl-1]+'...'});
        }
        return Promise.resolve();
    }
} /* End fillAncestorTaxa */    
function repopulateLevelCombos(optsObj, selected) {                             //console.log('repopulateLevelCombos. optsObj = %O, selected = %O', optsObj, selected); //console.trace();
    const lvls = fP.forms.taxonPs.lvls;
    Object.keys(optsObj).forEach(l => {                                         //console.log("lvl = %s, name = ", l, lvls[l-1]); 
        repopulateLevelCombo(optsObj[l], lvls[l-1], l, selected)
    });
}
/**
 * Replaces the options for the level combo. Selects the selected taxon and 
 * its direct ancestors.
 */
function repopulateLevelCombo(opts, lvlName, lvl, selected) {                   //console.log("repopulateLevelCombo for lvl = %s (%s)", lvl, lvlName);
    _u('replaceSelOpts', ['#'+lvlName+'-sel', opts, () => {}]);
    $('#'+lvlName+'-sel')[0].selectize.on('change', onLevelSelection);
    if (!lvl in selected) { return; }
    if (selected[lvl] == 'none') { return resetPlaceholer(lvlName); }
    _cmbx('setSelVal', ['#'+lvlName+'-sel', selected[lvl], 'silent']); 
}
function resetPlaceholer(lvlName) {
    _u('updatePlaceholderText', ['#'+lvlName+'-sel', null, 0]); 
}
/*-------------- Interaction Detail Fields -------------------------------*/
function buildIntTypeField() {                                                  console.log('       --buildIntTypeField');
    return _u('getOptsFromStoredData', ['intTypeNames'])
    .then(buildIntTypeRow);
}
function buildIntTypeRow(opts) {
    const attr = {id: 'InteractionType-sel', class: 'lrg-field'};
    const field = _u('buildSelectElem', [opts, attr]);
    return _elems('buildFormRow', ['InteractionType', field, 'top', true]);
}
function focusIntTypePin() {
    if (!fP.editing) { $('#InteractionType_pin').focus(); }
}
function buildIntTagField() {                                                   console.log('       --buildIntTagField');
    return _elems('buildTagField', ['interaction', 'InteractionTags', 'top'])
        .then(buildTagRow);
}
function buildTagRow(field) {
    field.className = 'lrg-field';
    $(field).change(checkIntFieldsAndEnableSubmit);
    return _elems('buildFormRow', ['InteractionTags', field, 'top', false]);
}
function buildIntNoteField() {                                                  console.log('       --buildIntNoteField');
    const txtElem = _elems('buildLongTextArea', ['interaction', 'Note', 'top']);
    $(txtElem).change(checkIntFieldsAndEnableSubmit);
    return _elems('buildFormRow', ['Note', txtElem, 'top', false]);
}
/** =================== ON FORM INIT COMPLETE =============================== */
/**
 * Inits the selectize comboboxes, adds/modifies event listeners, and adds 
 * required field elems to the form's config object.  
 */
function finishInteractionFormBuild() {                                         console.log('           --finishIntFormBuild');
    modifyFormDisplay();
    addLocationSelectionMethodsNote();
    finishComboboxInit();
    addReqElemsToConfg();    
    _mmry('setonFormCloseHandler', ['top', resetInteractionForm]);
}
function modifyFormDisplay() {
    //$('#top-cancel').unbind('click').click(_forms.exitFormPopup);
    $('#Note_row label')[0].innerText += 's';
    $('#Country-Region_row label')[0].innerText = 'Country/Region';
    $('.all-fields-cntnr').hide();
    _forms.ui('setCoreRowStyles', ['#form-main', '.top-row']);
}
/** Adds a message above the location fields in interaction forms. */
function addLocationSelectionMethodsNote() {
    const cntnr = _u('buildElem', ['div', {id: 'loc-note', class: 'skipFormData'}]);
    const mapInfo = getMapInfoText();
    $(cntnr).append(mapInfo);
    $('#Country-Region_row').before(cntnr);
}
function getMapInfoText() {
    const text = `<span>Select or create a location using the fields below or </span>`;
    const link = getInfoLinkTextToOpenMap();
    return [ text, link ];
}
function getInfoLinkTextToOpenMap(argument) {
    const attr = {class:'map-link', text: 'click here to use the map interface.'};
    const span = _u('buildElem', ['span', attr]);
    $(span).click(showInteractionFormMap);
    return span;
}
/** Open popup with the map interface for location selection. */
function showInteractionFormMap() {                                             //console.log('showInteractionFormMap')
    if ($('#loc-map').length) { return; }
    _forms.addMapToLocForm('#Location_row', 'int');
    if (_cmbx('getSelVal', ['#Country-Region-sel'])) { return; }
    _cmbx('focusCombobox', ['#Country-Region-sel', true]);
}
function finishComboboxInit() {
    _cmbx('initFormCombos', ['interaction', 'top', getInteractionEvents()]);
    _cmbx('enableCombobox', ['#CitationTitle-sel', false]);
    _cmbx('focusCombobox', ['#Publication-sel', true]);
    ['Subject', 'Object'].forEach(addTaxonFocusListener);
}
/** Displays the [Role] Taxon select form when the field gains focus. */ 
function addTaxonFocusListener(role) {
    const elem = '#'+role+'-sel + div div.selectize-input';
    const showSelectForm = role === 'Object' ? initObjectSelect : initSubjectSelect;
    $('#form-main').on('focus', elem, showSelectForm);
}
/** ============= RESET FORM AFTER SUBMIT =================================== */
/** 
 * Resets the interactions form leaving only the pinned values. Displays a 
 * success message. Disables submit button until any field is changed. 
 */
function resetInteractionForm() {
    const vals = getPinnedFieldVals();                                          //console.log("vals = %O", vals);
    _forms.ui('showSuccessMsg', ['New Interaction successfully created.']);
    _mmry('initFormMemory', ['create', 'interaction'])
    .then(resetFormUi);

    function resetFormUi() {
        resetIntFields(vals); 
        $('#top-cancel').val(' Close ');  
        _forms.ui('toggleSubmitBttn', ['#top-submit', false]);
        _mmry('setFormProp', ['top', 'unchanged', true]);
    }
}
/** Returns an obj with the form fields and either their pinned values or false. */
function getPinnedFieldVals() {
    const pins = $('form[name="top"] [id$="_pin"]').toArray();                  //console.log("pins = %O", pins);
    const vals = {};
    pins.forEach(pin => {  
        if (pin.checked) { getFieldVal(pin.id.split("_pin")[0]); 
        } else { addFalseValue(pin.id.split("_pin")[0]); }
    });
    return vals;

    function getFieldVal(fieldName) {                                           //console.log("fieldName = %s", fieldName)
        const suffx = fieldName === 'Note' ? '-txt' : '-sel';
        vals[fieldName] = $('#'+fieldName+suffx).val();
    }
    function addFalseValue(fieldName) {
        vals[fieldName] = false;
    }
} /* End getPinnedValsObj */
/**
 * Resets the top-form in preparation for another entry. Pinned field values are 
 * persisted. All other fields will be reset. 
 */
function resetIntFields(vals) {                                                 //console.log('resetIntFields. vals = %O', vals);
    _forms.ui('toggleSubmitBttn', ["#top-submit", false]);
    initInteractionParams();
    resetUnpinnedFields(vals);
    fillPubDetailsIfPinned(vals.Publication);
}
function resetUnpinnedFields(vals) {
    for (var field in vals) {                                                   //console.log("field %s val %s", field, vals[field]);
        if (!vals[field]) { clearField(field); }
    }
}
function clearField(fieldName) {
    if (fieldName === 'Note') { return $('#Note-txt').val(""); }
    _forms.uiPanel('clearFieldDetails', [fieldName]);
    _forms.uiCombos('clearCombobox', ['#'+fieldName+'-sel']);
    ifTaxonFieldClearData(fieldName);
}
function ifTaxonFieldClearData(field) {
    if (!['Subject', 'Object'].indexOf(fieldName) !== -1) { return; }
    $('#'+field+'-sel').removeData('selTaxon');
}
function fillPubDetailsIfPinned(pub) {
    if (pub) { _forms.uiPanel('updateSrcDetails', ['pub']); 
    } else { _forms.uiCombos('enableCombobox', ['#CitationTitle-sel', false]); }
}
/** Inits the necessary interaction form params after form reset. */
function initInteractionParams() {
    _mmry('initEntityFormMemory', ['interaction', 'top', null, 'create']);
    addReqElemsToConfg();
}
function addReqElemsToConfg() {
    const reqFields = ['Publication', 'CitationTitle', 'Subject', 'Object', 'InteractionType'];
    const elems = reqFields.map(field => $('#'+field+'-sel')[0]);
    _mmry('setFormProp', ['top', 'reqElems', elems]);
}
/** ================== SHARED HELPERS ======================================= */
/**
 * After the interaction form is submitted, the submit button is disabled to 
 * eliminate accidently creating duplicate interactions. This change event is
 * added to the non-required fields of the form to enable to submit as soon as 
 * any change happens in the form, if the required fields are filled. Also 
 * removes the success message from the form.
 */
function checkIntFieldsAndEnableSubmit() {
    if (_elems('ifAllRequiredFieldsFilled', ['top'])) { 
        _forms.ui('toggleSubmitBttn', ['#top-submit', true]); 
    }
    resetIfFormWaitingOnChanges(); //After interaction form submit, the submit button is disabled until form data changes
}
/**
 * After an interaction is created, the form can not be submitted until changes
 * are made. This removes the change listeners from non-required elems and the 
 * flag tracking the state of the new interaction form.  
 */
export function resetIfFormWaitingOnChanges() {  
    if (!_mmry('getFormProp', ['unchanged', 'top'])) { return; }
    _forms.ui('exitSuccessMsg');
    _mmry('setFormProp', ['top', 'unchanged', false]);
}


/** ================== EDIT FORM CODE ======================================= */
export function finishCita(argument) {
    // body...
}