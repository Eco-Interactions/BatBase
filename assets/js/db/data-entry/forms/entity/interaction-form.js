/**
 * Contains code used to specifically build the interaction form. 
 *
 * CODE SECTIONS
 *     CREATE FORM
 *         RESET CREATE FORM AFTER SUBMIT
 *     ON FORM INIT COMPLETE
 *     FORM FIELD HANDLERS
 *         PUBLICATION
 *         CITATION
 *         COUNTRY/REGION
 *         LOCATION
 *         TAXON ROLES
 *             SUBJECT
 *             OBJECT
 *             ROLE SHARED HELPERS
 *                 initTaxonSelectForm
 *                 resetTaxonSelectForm
 *                 onLevelSelection
 *                 selectRoleTaxon
 *         FIELD HELPERS
 *     EDIT FORM
 *         FILL INTERACTION DATA
 *
 * EXPORTS: 
 *     initCreateForm   
 *     getSelectedTaxon
 */
import * as _i from '../forms-main.js';

let mmry;
/** Inits comboboxes for the interaction form and the Subject/Object select forms. */
export function initFormCombos(entity, fLvl) {
    const events = getEntityComboEvents(entity);
    _i.cmbx('initFormCombos', [entity, fLvl, events]);
}
/** Note: 'subject', 'object', and 'realm' are passed for taxon. */
function getEntityComboEvents(entity) {
    const events = {
        'interaction': {
            'CitationTitle': { change: onCitSelection, add: create('citation', 'sub') },
            'Country-Region': { change: onCntryRegSelection },
            'InteractionType': { change: focusIntTypePin },
            'InteractionTags': { change: checkIntFieldsAndEnableSubmit },
            'Location': { change: onLocSelection, add: create('location', 'sub')},
            'Publication': { change: onPubSelection, add: create('publication', 'sub')},
            'Subject': { change: onTaxonRoleSelection.bind(null, 'Subject') },
            'Object': { change: onTaxonRoleSelection.bind(null, 'Object') },
        },
        'taxon': {
            'Class': { change: onLevelSelection, add: create('class') },
            'Family': { change: onLevelSelection, add: create('family') },
            'Genus': { change: onLevelSelection, add: create('genus') },
            'Order': { change: onLevelSelection, add: create('order') },
            'Realm': { change: onRealmSelection },
            'Species': { change: onLevelSelection, add: create('species') },
        }
    };
    return events[entity] || events.taxon;
}
function create(entity, fLvl) {
    return createSubEntity.bind(null, entity, fLvl);
}
function createTaxon(lvl) {
    return (val) => {
        createSubEntity(null, lvl, 'sub2')
        .then(() => _i.mmry('setonFormCloseHandler', ['sub2', enableTaxonLvls]))
        .then(() => enableTaxonLvls(false));
    }
}
function createSubEntity(entity, fLvl) {  
    if (ifFormAlreadyOpenAtLevel(fLvl)) { return throwAndCatchSubFormErr(entity, fLvl); }
    _i.create(entity);
}
function ifFormAlreadyOpenAtLevel(fLvl) {  
    return fLvl ? $('#'+fLvl+'-form').length !== 0 : false;
}
function openSubFormErr(ent, fLvl) {
    const entity = ent === 'citation' ? 'citationTitle' : ent;
    const ucEntity = _i.util('ucfirst', [entity]); 
    _i.err('openSubFormErr', [ucEntity, null, fLvl]); 
    return Promise.reject();
}
function throwAndCatchSubFormErr(entity, fLvl) {
    openSubFormErr(entity, fLvl)
    .catch(() => {});
}
/** ********************** CREATE FORM ************************************** */
/**
 * Inits the interaction form with all fields displayed and the first field, 
 * publication, in focus. From within many of the fields the user can create 
 * new entities of the field-type by selecting the 'add...' option from the 
 * field's combobox and completing the appended sub-form.
 */
export function initCreateForm(entity) {                                        console.log('   //Building New Interaction Form');
    _i.mmry('initFormMemory', ['create', 'interaction'])
    .then(mmry => getInteractionFormFields(mmry))
    .then(fields => _i.elems('buildAndAppendTopForm', [fields]))
    .then(() => finishInteractionFormBuild())
    .then(() => _i.mmry('setonFormCloseHandler', ['top', resetInteractionForm]))
    .catch(err => _i.util('alertErr', [err]));
}
/** Builds and returns all interaction-form elements. */
function getInteractionFormFields(params) {                                      
    mmry = params;          
    return _i.elems('getFormFieldRows', ['Interaction', {}, 'top', params]);                                          
    // return _i.elems('buildFormRows', ['Interaction', {}, 'top']);  
}
/** ------------- RESET CREATE FORM AFTER SUBMIT ---------------------------- */
/** 
 * Resets the interactions form leaving only the pinned values. Displays a 
 * success message. Disables submit button until any field is changed. 
 */
function resetInteractionForm() {
    const vals = getPinnedFieldVals();                                          //console.log("vals = %O", vals);
    _i.ui('showSuccessMsg', ['New Interaction successfully created.']);
    resetIntFields(vals); 
    resetFormUi();
    // initEntityFormMemory('Interaction', 'top', null, 'create');
    _i.mmry('setonFormCloseHandler', ['top', resetInteractionForm]);

    // _i.mmry('initFormMemory', ['create', 'interaction'])
    // .then(resetFormUi);

}
function resetFormUi() {
    $('#top-cancel').val(' Close ');  
    _i.ui('toggleSubmitBttn', ['#top-submit', false]);
    _i.mmry('setFormProp', ['top', 'unchanged', true]);
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

    function getFieldVal(fieldName) {                                           //console.log("fieldName = [%s]", fieldName)
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
function resetIntFields(vals) {                                                 console.log('resetIntFields. vals = %O', vals);
    _i.ui('toggleSubmitBttn', ["#top-submit", false]);
    _i.mmry('initEntityFormMemory', ['interaction', 'top', null, 'create']);
    resetUnpinnedFields(vals);
    fillPubDetailsIfPinned(vals.Publication);
}
function resetUnpinnedFields(vals) {
    for (let field in vals) {                                                   //console.log("field %s val %s", field, vals[field]);
        if (!vals[field]) { clearField(field, vals); }
        if (field === 'Publication') { fillPubDetailsIfPinned(vals[field]); }
    }
}
function clearField(field, vals) {
    clearFieldMemory(field);
    if (field === 'Note') { return $('#Note-txt').val(""); }
    _i.panel('clearFieldDetails', [field]);
    _i.cmbx('clearCombobox', ['#'+field+'-sel']);
    if (field === 'Location') { syncWithCountryField(vals['Country-Region']); }
}
function clearFieldMemory(field) {
    _i.mmry('setFormFieldData', ['top', field, null]);
    ifTaxonFieldClearData(field);
}
function ifTaxonFieldClearData(field) {  
    if (['Subject', 'Object'].indexOf(field) === -1) { return; }  
    $('#'+field+'-sel').data('selTaxon', false);
}
function syncWithCountryField(cntryId) { 
    fillLocationSelect(mmry.records.location[cntryId]);
}
function fillPubDetailsIfPinned(pub) {
    if (pub) { _i.panel('updateSrcDetails', ['pub']); 
    } else { _i.cmbx('enableCombobox', ['#CitationTitle-sel', false]); }
}
/** ------------------- ON FORM INIT COMPLETE ------------------------------- */
/**
 * Inits the selectize comboboxes, adds/modifies event listeners, and adds 
 * required field elems to the form's config object.  
 */
function finishInteractionFormBuild() {                                         //console.log('           --finishIntFormBuild');
    $('#Note-txt').change(focusPinAndEnableSubmitIfFormValid.bind(null, 'Note'));
    modifyFormDisplay();
    addLocationSelectionMethodsNote();
    finishComboboxInit();
}
function modifyFormDisplay() {
    $('#Note_row label')[0].innerText += 's';
    $('#Country-Region_row label')[0].innerText = 'Country/Region';
    $('.all-fields-cntnr').hide();
    _i.ui('setCoreRowStyles', ['#form-main', '.top-row']);
}
/** Adds a message above the location fields in interaction forms. */
function addLocationSelectionMethodsNote() {
    const cntnr = _i.util('buildElem', ['div', {id: 'loc-note', class: 'skipFormData'}]);
    const mapInfo = getMapInfoText();
    $(cntnr).append(mapInfo);
    $('#Country-Region_row')[0].parentNode.before(cntnr);
}
function getMapInfoText() {
    const text = `<span>Select or create a location using the fields below or </span>`;
    const link = getInfoLinkTextToOpenMap();
    return [ text, link ];
}
function getInfoLinkTextToOpenMap(argument) {
    const attr = {class:'map-link', text: 'click here to use the map interface.'};
    const span = _i.util('buildElem', ['span', attr]);
    $(span).click(showInteractionFormMap);
    return span;
}
/** Open popup with the map interface for location selection. */
function showInteractionFormMap() {                                             //console.log('showInteractionFormMap')
    if ($('#form-map').length) { return; }
    const pElem = $('#Location_row')[0].parentNode;
    _i.entity('addMapToLocForm', [$(pElem), 'int']);
    if (_i.cmbx('getSelVal', ['#Country-Region-sel'])) { return; }
    _i.cmbx('focusCombobox', ['#Country-Region-sel', true]);
}
function finishComboboxInit() {
    initFormCombos('interaction', 'top');
    _i.cmbx('enableCombobox', ['#CitationTitle-sel', false]);
    _i.cmbx('focusCombobox', ['#Publication-sel', true]);
    ['Subject', 'Object'].forEach(addTaxonFocusListener);
}
function focusIntTypePin() {
    focusPinAndEnableSubmitIfFormValid('InteractionType');
}
/** Displays the [Role] Taxon select form when the field gains focus. */ 
function addTaxonFocusListener(role) {
    const elem = '#'+role+'-sel + div div.selectize-input';
    const showSelectForm = role === 'Object' ? initObjectSelect : initSubjectSelect;
    $('#form-main').on('focus', elem, showSelectForm);
}
/** ********************** FORM FIELD HANDLERS ****************************** */
/*------------------ PUBLICATION ---------------------------------------------*/
/** 
 * When an existing publication is selected, the citation field is filled with 
 * all current citations for the publciation. When a publication is created, 
 * the citation form is automatically opened. 
 */
function onPubSelection(val) {                                                  console.log('       --onPubSelection[%s]', val); 
    if (val === 'create') { return createSubEntity('publication', 'sub'); }        
    if (val === '' || isNaN(parseInt(val)) ) { return onPubClear(); }                                
    fillCitationField(val);
    _i.panel('updateSrcDetails', ['pub']);
    if (!hasCitation(val)) { return createSubEntity('citation', 'sub'); }
    if (!mmry.editing) { $('#Publication_pin').focus(); }
}
function hasCitation(val) {
    return mmry.records.source[val].children.length;
}
function onPubClear() {
    _i.cmbx('clearCombobox', ['#CitationTitle-sel']);
    _i.cmbx('enableCombobox', ['#CitationTitle-sel', false]);
    _i.panel('clearDetailPanel', ['pub']);
}
/*------------------ CITATION ------------------------------------------------*/
/** Fills the citation combobox with all citations for the selected publication. */
export function fillCitationField(pubId) {                                            
    _i.cmbx('enableCombobox', ['#CitationTitle-sel']);
    _i.cmbx('updateComboboxOptions', ['#CitationTitle-sel', getPubCitationOpts(pubId)]);
}
/** Returns an array of option objects with citations for this publication.  */
function getPubCitationOpts(pubId) {
    const pubRcrd = mmry.records.source[pubId];  
    if (!pubRcrd) { return [{ value: 'create', text: 'Add a new Citation...'}]; }
    const opts = _i.elems('getRcrdOpts', [pubRcrd.children, mmry.records.source]);
    opts.unshift({ value: 'create', text: 'Add a new Citation...'});
    return opts;
}
/** 
 * When a Citation is selected, both 'top' location fields are initialized
 * and the publication combobox is reenabled. 
 */    
function onCitSelection(val) {                                                  console.log('       --onCitSelection [%s]', val);
    if (val === 'create') { return createSubEntity('citation', 'sub'); }
    if (val === '' || isNaN(parseInt(val))) { return _i.panel('clearDetailPanel', ['cit']); }          
    _i.panel('updateSrcDetails', ['cit']);
    _i.cmbx('enableCombobox', ['#Publication-sel']);
    focusPinAndEnableSubmitIfFormValid('CitationTitle')
}    
/*-------------- COUNTRY/REGION ------------------------------------------*/
/** 
 * When a country or region is selected, the location dropdown is repopulated 
 * with it's child-locations and, for regions, all habitat types. When cleared, 
 * the combobox is repopulated with all locations. 
 * If the map is open, the country is outlined and all existing locations within
 * are displayed @focusParentAndShowChildLocs
 */
function onCntryRegSelection(val) {                                             console.log("       --onCntryRegSelection [%s]", val);
    if (val === "" || isNaN(parseInt(val))) { return fillLocationSelect(null); }          
    const loc = mmry.records.location[val];
    fillLocationSelect(loc);
    if (!mmry.editing) { $('#Country-Region_pin').focus(); }
    if ($('#form-map').length) { showCountryDataOnMap(val); }    
}
function showCountryDataOnMap(val) {
    _i.entity('focusParentAndShowChildLocs', ['int', val]);
}
/*------------------ LOCATION ------------------------------------------------*/
/**
 * When a country/region is selected, the location combobox is repopulated with its 
 * child-locations and all habitat types. When cleared, the combobox is 
 * repopulated with all locations. 
 */ 
function fillLocationSelect(loc) {                                              
    const opts = loc ? getOptsForLoc(loc) : _i.elems('getLocationOpts');    
    _i.cmbx('updateComboboxOptions', ['#Location-sel', opts]);
}          
/** Returns an array of options for the locations of the passed country/region. */
function getOptsForLoc(loc) {
    let opts = getChildLocOpts(loc.children)
    opts.push({ value: loc.id, text: loc.displayName });
    opts = opts.sort((a, b) => _i.util('alphaOptionObjs', [a, b]));
    opts.unshift({ value: 'create', text: 'Add a new Location...'});
    return opts;
}
function getChildLocOpts(children) {
    return children.map(id => ({
        value: id, text: mmry.records.location[id].displayName 
    }));
}
export function selectLoc(id) {
    $('#sub-form').remove();
    _i.cmbx('setSelVal', ['#Location-sel', id]);
    enableCountryRegionField();
    _i.cmbx('enableCombobox', ['#Location-sel']);
}
/** When the Location sub-form is exited, the Country/Region combo is reenabled. */
export function enableCountryRegionField() {  
    _i.cmbx('enableCombobox', ['#Country-Region-sel']);
    $('#loc-note').fadeTo(400, 1);
}
/** 
 * When a location is selected, its country/region is selected in the top-form
 * combobox and the location record's data is added to the detail panel. If 
 * the location was cleared, the detail panel is cleared. 
 */     
function onLocSelection(val) {                                                  console.log('       --onLocSelection [%s]', val);
    if (val === 'create') { return createSubEntity('location', 'sub'); }
    if (val === '' || isNaN(parseInt(val))) { return _i.panel('clearDetailPanel', ['loc']); }   
    if ($('#form-map').length) { removeLocMap(); }
    const locRcrd = mmry.records.location[val];                                   
    const prntVal = locRcrd.parent ? locRcrd.parent : locRcrd.id;
    _i.cmbx('setSelVal', ['#Country-Region-sel', prntVal, 'silent']);
    _i.panel('fillLocDataInDetailPanel', [locRcrd]);
    focusPinAndEnableSubmitIfFormValid('Location');
}
function removeLocMap() {
    $('#form-map').fadeTo(400, 0, () => $('#form-map').remove());
}
/*--------------------- TAXON ROLES ------------------------------------------*/
/* -------------- SUBJECT ---------------------- */
/**
 * Shows a sub-form to 'Select <Role>' of the interaction with a combobox for
 * each level present in the realm, (eg: Bat - Family, Genus, and Species), filled 
 * with the taxa at that level. When one is selected, the remaining boxes
 * are repopulated with related taxa and the 'select' button is enabled.
 */
function initSubjectSelect() {                                                  console.log('       --initSubjectSelect (selected ? [%s])', $('#Subject-sel').val());
    return initTaxonSelectForm('Subject', 'Bat')
        .then(() => finishTaxonSelectBuild('Subject'))
        .catch(err => console.log('         --Error caught. %O', err));
}
/* -------------- OBJECT ---------------------- */
/** Note: The selected realm's level combos are built @onRealmSelection. */
function initObjectSelect() {                                                   console.log('       --initObjectSelect (selected ? [%s])', $('#Object-sel').val());
    const realm = getSelectedObjectRealm($('#Object-sel').val()); 
    return initTaxonSelectForm('Object', realm)
        .then(buildRealmFields)
        .catch(err => console.log('         --Error caught. %O', err));

    function buildRealmFields() {    
        const realmId = mmry.forms.taxonPs.realmTaxon.realm.id;       
        _i.cmbx('setSelVal', ['#Realm-sel', realmId, 'silent']);
        return onRealmSelection(realmId);
    }
} 
/** Returns the realm taxon's lower-case name for a selected object taxon. */
function getSelectedObjectRealm(id) {                                       
    if (!id) { return _i.mmry('getObjectRealm'); }
    return mmry.records.taxon[id].realm.displayName;
}
/**
 * Removes any previous realm comboboxes. Shows a combobox for each level present 
 * in the selected Taxon realm, plant (default) or arthropod, filled with the 
 * taxa at that level. 
 */
function onRealmSelection(val) {                                                //console.log("               --onRealmSelection. val = ", val)
    if (val === '' || isNaN(parseInt(val))) { return Promise.resolve(); }          
    if ($('#realm-lvls').length) { $('#realm-lvls').remove(); } 
    const fLvl = _i.getSubFormLvl('sub');
    return _i.util('getData', ['realm'])
        .then(setRealmTaxonParams)
        .then(buildAndAppendRealmRows);

    function setRealmTaxonParams(realms) {
        const realm = realms[val].slug;
        return setTaxonParams('Object', _i.util('ucfirst', [realm])).then(() => realm);
    }
    /** A row for each level present in the realm filled with the taxa at that level.  */
    function buildAndAppendRealmRows(realm) {  
        _i.elems('buildFormRows', [realm, {}, fLvl])
        .then(rows => appendRealmRowsAndFinishBuild(realm, rows, fLvl));
    }
    function appendRealmRowsAndFinishBuild(realm, rows, fLvl) {  
        const realmElems = _i.util('buildElem', ['div', { id: 'realm-lvls' }]);
        $(realmElems).append(rows);
        $('#Realm_row').append(realmElems);
        _i.mmry('setFormFieldData', [fLvl, 'Realm', null, 'select']);
        initFormCombos(realm, fLvl);
        finishTaxonSelectBuild('Object');          
    }
}
/* ------------------- ROLE SHARED HELPERS --------------- */
/* ------- initTaxonSelectForm --------- */
function initTaxonSelectForm(role, realm) {   console.log('data selTaxon = [%s]', $('#'+role+'-sel').data('selTaxon'));
    const fLvl = _i.getSubFormLvl('sub');
    if (ifFormAlreadyOpenAtLevel(fLvl)) { return openSubFormErr(role, fLvl); }
    return getRealmTaxon(realm)
        .then(rTaxon => buildTaxonSelectForm(role, realm, rTaxon, fLvl))
        .then(form => appendTxnFormAndInitCombos(role, fLvl, form))
}
/** Note: Taxon fields often fire their focus event twice. */
// function errIfSubFormOpen(role, fLvl) {
//     // if (mmry.forms.taxonPs.entity === _i.util('lcfirst', [role])) { return; }
//     _i.err('openSubFormErr', [role, null, fLvl]);
// }
function getRealmTaxon(realm) {
    const lvls = { 'Arthropod': 'Phylum', 'Bat': 'Order', 'Plant': 'Kingdom' };
    const realmName = realm || _i.mmry.getObjectRealm();
    const dataProp = realmName + lvls[realmName] + 'Names'; 
    return _i.util('getData', [dataProp]).then(returnRealmTaxon);
}
function returnRealmTaxon(realmRcrds) {                                        
    const realmId = realmRcrds[Object.keys(realmRcrds)[0]]
    return mmry.records.taxon[realmId];  
}
function buildTaxonSelectForm(role, realm, realmTaxon, fLvl) {                  //console.log('-------------buildTaxonSelectForm. args = %O', arguments);
    const lcRole = _i.util('lcfirst', [role]);
    _i.mmry('initEntityFormMemory', [lcRole, fLvl, '#'+role+'-sel', 'create']);
    return _i.mmry('initTaxonMemory', [role, realm, realmTaxon])
        .then(setScopeTaxonMemory)
        .then(() => _i.elems('initSubForm', [fLvl, 'sml-sub-form', {}, '#'+role+'-sel']));
}
function setScopeTaxonMemory(txnMmry) {
    mmry.forms.taxonPs = txnMmry;
    return Promise.resolve();
}
/**
 * Customizes the taxon-select form ui. Either re-sets the existing taxon selection
 * or brings the first level-combo into focus. Clears the [role]'s' combobox. 
 */
function finishTaxonSelectBuild(role) {                                     
    const fLvl = _i.getSubFormLvl('sub');
    const selCntnr = role === 'Subject' ? '#'+fLvl+'-form' : '#realm-lvls';
    customizeElemsForTaxonSelectForm(role);
    if (ifSelectingInitialTaxon(role)) { resetPrevTaxonSelection(role);
    } else { _i.cmbx('focusFirstCombobox', [selCntnr]); }
    _i.util('replaceSelOpts', ['#'+role+'-sel', []]);
}
function ifSelectingInitialTaxon(role) {
    return $('#'+role+'-sel').data('reset') || $('#'+role+'-sel').val();
}
function setTaxonParams(role, realmName, id) {                                 
    const tPs = mmry.forms.taxonPs;
    tPs.realm = realmName;
    return getRealmTaxon(realmName).then(updateTaxonParams);

    function updateTaxonParams(realmTaxon) {
        tPs.realmTaxon = realmTaxon;
        tPs.curRealmLvls = tPs.allRealmLvls[realmName];
        _i.mmry('setMemoryProp', ['taxonPs', tPs]);
    }
}
function appendTxnFormAndInitCombos(role, fLvl, form) {
    const lcRole = _i.util('lcfirst', [role]);
    $('#'+role+'_row').append(form);
    initFormCombos(lcRole, fLvl);
}
/** Adds a close button. Updates the Header and the submit/cancel buttons. */
function customizeElemsForTaxonSelectForm(role) {
    $('#sub-hdr')[0].innerHTML = "Select " + role + " Taxon";
    $('#sub-hdr').append(getTaxonExitButton(role));
    $('#sub-submit')[0].value = "Select Taxon";        
    $('#sub-cancel')[0].value = "Reset";
    $('#sub-submit').unbind("click").click(selectRoleTaxon);
    $('#sub-cancel').unbind("click").click(resetTaxonSelectForm.bind(null, role));
}
function getTaxonExitButton(role) {
    const bttn = _i.elems('getExitButton');
    bttn.id = 'exit-sub-form';
    $(bttn).unbind('click').click(exitTaxonSelectForm.bind(null, role));
    return bttn;
}
/** Exits sub form and restores any previous taxon selection. */
function exitTaxonSelectForm(role) {  
    _i.ui('exitForm', ['sub', false, enableTaxonCombos]);
    const prevTaxonId = $('#'+role+'-sel').data('selTaxon');
    if (!prevTaxonId) { return; }
    resetTaxonCombobox(role, prevTaxonId);
}
function resetTaxonCombobox(role, prevTaxonId) {
    const opt = { value: prevTaxonId, text: getTaxonym(prevTaxonId) };
    _i.cmbx('updateComboboxOptions', ['#'+role+'-sel', opt]);
    _i.cmbx('setSelVal', ['#'+role+'-sel', prevTaxonId]);
}
function getTaxonym(id) {
    return _i.getTaxonDisplayName(mmry.records.taxon[id]);
}
function enableTaxonLvls(enable = true) {
    $.each($('#sub-form select'), (i, sel) => {  console.log('id = [%s], enable = ', sel.id, enable);
        _i.cmbx('enableCombobox', ['#'+sel.id, enable])
    });
}
/* ------- resetTaxonSelectForm --------- */
/** Removes and replaces the taxon form. */
function resetTaxonSelectForm(role) {                                           
    const realm = mmry.forms.taxonPs.realm;
    const reset =  realm == 'Bat' ? initSubjectSelect : initObjectSelect;
    $('#'+role+'-sel').data('reset', true);
    $('#sub-form').remove();
    reset();
}
/** Resets the taxon to the one previously selected in the interaction form.  */
function resetPrevTaxonSelection(role) {                                       
    const id = $('#'+role+'-sel').data('selTaxon');                             
    const taxon = mmry.records.taxon[id];                                         
    if (ifSelectedTaxonIsRealmTaxon(taxon)) { return; }                         console.log('           --resetPrevTaxonSelection [%s] [%s] = %O', role, id, taxon);
    selectPrevTaxon(taxon, role);
}
function ifSelectedTaxonIsRealmTaxon(taxon) { 
    return mmry.forms.taxonPs.curRealmLvls[0] == taxon.level.displayName;
}
function selectPrevTaxon(taxon, role) {
    addTaxonOptToTaxonMemory(taxon);
    if (ifTaxonInDifferentRealm(taxon.realm)) { return selectTaxonRealm(taxon); }
    _i.cmbx('setSelVal', ['#'+taxon.level.displayName+'-sel', taxon.id]);
    window.setTimeout(() => { deleteResetFlag(role); }, 1000);
}
function addTaxonOptToTaxonMemory(taxon) {
    const displayName = _i.getTaxonDisplayName(taxon);
    _i.mmry('setTaxonProp', ['prevSel', {val: taxon.id, text: displayName }]);
}
function ifTaxonInDifferentRealm(realm) {  
    return realm.displayName !== 'Bat' && $('#Realm-sel').val() != realm.id;
}
function selectTaxonRealm(taxon) {
    _i.cmbx('setSelVal', ['#Realm-sel', taxon.realm.id]);
}
function deleteResetFlag(role) {
    $('#'+role+'-sel').removeData('reset');
}
 /* ------- OnLevelSelection --------- */
/**
 * When a taxon at a level is selected, all child level comboboxes are
 * repopulated with related taxa and the 'select' button is enabled. If the
 * combo was cleared, ensure the remaining dropdowns are in sync or, if they
 * are all empty, disable the 'select' button.
 */
function onLevelSelection(val) {                                                console.log("           --onLevelSelection. val = [%s] isNaN? [%s]", val, isNaN(parseInt(val)));
    const fLvl = _i.getSubFormLvl('sub');
    if (val === 'create') { return openTaxonCreateForm(this.$input[0], fLvl); }
    if (val === '' || isNaN(parseInt(val))) { return syncTaxonCombos(this.$input[0]); } 
    repopulateCombosWithRelatedTaxa(val);
    _i.ui('toggleSubmitBttn', ['#'+fLvl+'-submit', true]);             
}
function openTaxonCreateForm(selElem, fLvl) {                 
    const level = selElem.id.split('-sel')[0];
    if (level === 'Species' && !$('#Genus-sel').val()) {
        return _i.err('formInitErr', [level, 'noGenus', fLvl]);
    }
    selElem.selectize.createItem('create');
}
function syncTaxonCombos(elem) {                                                
    resetChildLevelCombos(getSelectedTaxon(elem.id.split('-sel')[0]));
}
function resetChildLevelCombos(selTxn) {                                        
    const lvlName = selTxn ? selTxn.level.displayName : getRealmTopLevel();
    if (lvlName == 'Species') { return; }
    getChildlevelOpts(lvlName)
    .then(opts => repopulateLevelCombos(opts, {}));
}
function getRealmTopLevel() {
    return mmry.forms.taxonPs.curRealmLvls[1];
}
function getChildlevelOpts(lvlName) { 
    const opts = {};
    const realm = mmry.forms.taxonPs.realm;
    return buildChildLvlOpts().then(() => opts);

    function buildChildLvlOpts() {
        const lvls = mmry.forms.taxonPs.lvls;
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
        return _i.elems('getTaxonOpts', [level, null, realm])
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
    const lvls = mmry.forms.taxonPs.lvls;  
    const taxon = mmry.records.taxon[selId];                                    //console.log("repopulateCombosWithRelatedTaxa. taxon = %O, opts = %O, selected = %O", taxon, opts, selected);
    const realm = mmry.forms.taxonPs.realm;

    taxon.children.forEach(addRelatedChild); 
    return buildUpdatedTaxonOpts()
        .then(repopulateLevelCombos.bind(null, opts, selected));

    function addRelatedChild(id) {                                              //console.log('addRelatedChild. id = ', id);
        const childTxn = mmry.records.taxon[id];  
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
        return _i.elems('getTaxonOpts', [taxon.level.displayName, null, realm])
            .then(o => {                                                        //console.log('getSiblingOpts. taxon = %O', taxon);
                opts[taxon.level.id] = o;
                selected[taxon.level.id] = taxon.id;
            });  
    }
    function getAncestorOpts(prntId) {                                          //console.log('getAncestorOpts. prntId = [%s]', prntId);
        const realmTaxa = [1, 2, 3, 4]; //animalia, chiroptera, plantae, arthropoda
        if (realmTaxa.indexOf(prntId) !== -1 ) { return Promise.resolve(); }
        const prntTaxon = _i.mmry('getRcrd', ['taxon', prntId]);
        selected[prntTaxon.level.id] = prntTaxon.id;                            
        return _i.elems('getTaxonOpts', [prntTaxon.level.displayName, null, realm])
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
        const topLvl = mmry.forms.taxonPs.realm === "Arthropod" ? 3 : 5;  
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
            proms.push(_i.elems('getTaxonOpts', [lvls[id-1], null, realm])
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
    const lvls = mmry.forms.taxonPs.lvls;
    Object.keys(optsObj).forEach(l => {                                         //console.log("lvl = %s, name = ", l, lvls[l-1]); 
        repopulateLevelCombo(optsObj[l], lvls[l-1], l, selected)
    });
}
/**
 * Replaces the options for the level combo. Selects the selected taxon and 
 * its direct ancestors.
 */
function repopulateLevelCombo(opts, lvlName, lvl, selected) {                   //console.log("repopulateLevelCombo for lvl = %s (%s)", lvl, lvlName);
    _i.util('replaceSelOpts', ['#'+lvlName+'-sel', opts, () => {}]);
    $('#'+lvlName+'-sel')[0].selectize.on('change', onLevelSelection);
    if (!lvl in selected) { return; }
    if (selected[lvl] == 'none') { return resetPlaceholer(lvlName); }
    _i.cmbx('setSelVal', ['#'+lvlName+'-sel', selected[lvl], 'silent']); 
}
function resetPlaceholer(lvlName) {
    _i.util('updatePlaceholderText', ['#'+lvlName+'-sel', null, 0]); 
}
/* ------- selectRoleTaxon --------- */
/** Adds the selected taxon to the interaction-form's [role]-taxon combobox. */
function selectRoleTaxon() {
    const role = mmry.forms.taxonPs.realm === 'Bat' ? 'Subject' : 'Object';
    const opt = getSelectedTaxonOption();
    $('#sub-form').remove();
    _i.cmbx('updateComboboxOptions', ['#'+role+'-sel', opt]);
    _i.cmbx('setSelVal', ['#'+role+'-sel', opt.value]);
}
/** Returns an option object for the most specific taxon selected. */
function getSelectedTaxonOption() {
    const taxon = getSelectedTaxon();                                           //console.log("selected Taxon = %O", taxon);
    return { value: taxon.id, text: _i.getTaxonDisplayName(taxon) };
}
/** Finds the most specific level with a selection and returns that taxon record. */
export function getSelectedTaxon(aboveLvl) {
    const selElems = $('#sub-form .selectized').toArray();  
    if (ifEditingTaxon()) { selElems.reverse(); } //Taxon parent edit form.
    const selected = selElems.find(isSelectedTaxon.bind(null, aboveLvl));                              //console.log("getSelectedTaxon. selElems = %O selected = %O", selElems, selected);
    return !selected ? false : _i.mmry('getRcrd', ['taxon', $(selected).val()]);
    
    function ifEditingTaxon() {
        const action = mmry ? mmry.action : _i.mmry('getMemoryProp', ['action']);
        const entity = mmry ? mmry.forms.top.entity : _i.mmry('getFormProp', ['top', 'entity']);
        return action == 'edit' && entity == 'taxon';
    }
}
function isSelectedTaxon(resetLvl, elem) { 
    if (!ifIsLevelComboElem(elem)) { return; }
    if (resetLvl && ifLevelChildOfResetLevel(resetLvl, elem)) { return; }
    return $(elem).val(); 
}  
function ifLevelChildOfResetLevel(resetLvl, elem) {
    const allLevels = mmry.forms.taxonPs.lvls;
    const level = elem.id.split('-sel')[0];
    return allLevels.indexOf(level) > allLevels.indexOf(resetLvl);
}
function ifIsLevelComboElem(elem) {
    return elem.id.includes('-sel') && !elem.id.includes('Realm');
 } 
/**
 * When complete, the select form is removed and the most specific taxon is displayed 
 * in the interaction-form <role> combobox. 
 */
function onTaxonRoleSelection(role, val) {                                      //console.log("       --onTaxonRoleSelection [%s] = ", role, val);
    if (val === "" || isNaN(parseInt(val))) { return; }         
    $('#'+_i.getSubFormLvl('sub')+'-form').remove();
    $('#'+role+'-sel').data('selTaxon', val);
    enableTaxonCombos();
    focusPinAndEnableSubmitIfFormValid(role);
}
function enableTaxonCombos() {
    _i.cmbx('enableCombobox', ['#Subject-sel']);
    _i.cmbx('enableCombobox', ['#Object-sel']);
}
/*--------------------- FIELD HELPERS ----------------------------------------*/
function focusPinAndEnableSubmitIfFormValid(field) {
    if (!mmry.editing) { $('#'+field+'_pin').focus(); }
    checkIntFieldsAndEnableSubmit();
}
/**
 * After the interaction form is submitted, the submit button is disabled to 
 * eliminate accidently creating duplicate interactions. This change event is
 * added to the non-required fields of the form to enable to submit as soon as 
 * any change happens in the form, if the required fields are filled. Also 
 * removes the success message from the form.
 */
function checkIntFieldsAndEnableSubmit() {
    if (_i.elems('ifAllRequiredFieldsFilled', ['top'])) { 
        _i.ui('toggleSubmitBttn', ['#top-submit', true]); 
    }
    resetIfFormWaitingOnChanges(); //After interaction form submit, the submit button is disabled until form data changes
}
/**
 * After an interaction is created, the form can not be submitted until changes
 * are made. This removes the change listeners from non-required elems and the 
 * flag tracking the state of the new interaction form.  
 */
function resetIfFormWaitingOnChanges() {  
    if (!_i.mmry('getFormProp', ['top', 'unchanged'])) { return; }
    _i.ui('exitSuccessMsg');
    _i.mmry('setFormProp', ['top', 'unchanged', false]);
}
/** ************************ EDIT FORM ************************************** */
export function finishEditFormBuild(entity) {
    finishInteractionFormBuild();
}