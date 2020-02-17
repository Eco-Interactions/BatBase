/**
 * Contains code specific to the interaction form.
 *
 * EXPORTS: 
 *     initCreateForm   
 *     getSelectedTaxon
 *     onLevelSelection
 *
 * TOC
 *     CREATE FORM
 *         RESET CREATE FORM AFTER SUBMIT
 *     EDIT FORM
 *     ON FORM INIT COMPLETE
 *         FORM COMBOBOXES
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
 *         INTERACTION TYPE & TAGS
 *     HELPERS
 */
import * as _f from '../../forms-main.js';

/** ====================== CREATE FORM ====================================== */
/**
 * Inits the interaction form with all fields displayed and the first field, 
 * publication, in focus. From within many of the fields the user can create 
 * new entities of the field-type by selecting the 'add...' option from the 
 * field's combobox and completing the appended sub-form.
 */
export function initCreateForm(entity) {                                        console.log('   //Building New Interaction Form');
    _f.state('initFormState', ['create', 'interaction'])
    .then(getInteractionFormFields)
    .then(fields => _f.elems('buildAndAppendForm', [fields]))
    .then(finishInteractionFormBuild)
    .then(() => _f.state('setOnFormCloseHandler', ['top', resetInteractionForm]))
}
/** Builds and returns all interaction-form elements. */
function getInteractionFormFields() {  
    return _f.elems('getFormFieldRows', ['Interaction', {}, 'top']);                                          
}
/** ------------- RESET CREATE FORM AFTER SUBMIT ---------------------------- */
/** 
 * Resets the interactions form leaving only the pinned values. Displays a 
 * success message. Disables submit button until any field is changed. 
 */
function resetInteractionForm() {
    const vals = getPinnedFieldVals();                                          //console.log("vals = %O", vals);
    _f.elems('showSuccessMsg', ['New Interaction successfully created.']);
    resetIntFields(vals); 
    resetFormUi();
    _f.state('setOnFormCloseHandler', ['top', resetInteractionForm]);
}
function resetFormUi() {
    $('#top-cancel').val(' Close ');  
    _f.elems('toggleSubmitBttn', ['#top-submit', false]);
    _f.state('setFormProp', ['top', 'unchanged', true]);
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
function resetIntFields(vals) {                                                 console.log('           --resetIntFields. vals = %O', vals);
    _f.elems('toggleSubmitBttn', ["#top-submit", false]);
    _f.state('addEntityFormState', ['interaction', 'top', null, 'create']);
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
    _f.panel('clearFieldDetails', [field]);
    _f.cmbx('clearCombobox', ['#'+field+'-sel']);
    if (field === 'Location') { syncWithCountryField(vals['Country-Region']); }
}
function clearFieldMemory(field) {
    _f.state('setFormFieldData', ['top', field, null]);
    ifTaxonFieldClearData(field);
}
function ifTaxonFieldClearData(field) {  
    if (['Subject', 'Object'].indexOf(field) === -1) { return; }  
    $('#'+field+'-sel').data('selTaxon', false);
}
function syncWithCountryField(cntryId) { 
    fillLocationSelect(getRcrd('location', cntryId));
}
function fillPubDetailsIfPinned(pub) {
    if (pub) { _f.panel('updateSrcDetails', ['pub']); 
    } else { _f.cmbx('enableCombobox', ['#CitationTitle-sel', false]); }
}
/** ======================== EDIT FORM ====================================== */
export function finishEditFormBuild(entity) {
    finishInteractionFormBuild();
}
/** =================== ON FORM INIT COMPLETE =============================== */
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
    _f.elems('setCoreRowStyles', ['#form-main', '.top-row']);
}
/** Adds a message above the location fields in interaction forms. */
function addLocationSelectionMethodsNote() {
    const cntnr = _f.util('buildElem', ['div', {id: 'loc-note', class: 'skipFormData'}]);
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
    const span = _f.util('buildElem', ['span', attr]);
    $(span).click(showInteractionFormMap);
    return span;
}
/** Open popup with the map interface for location selection. */
function showInteractionFormMap() {                                             //console.log('showInteractionFormMap')
    if ($('#form-map').length) { return; }
    const pElem = $('#Location_row')[0].parentNode;
    _f.forms('addMapToLocForm', [$(pElem), 'int']);
    if (_f.cmbx('getSelVal', ['#Country-Region-sel'])) { return; }
    _f.cmbx('focusCombobox', ['#Country-Region-sel', true]);
}
/* -------------------------- FORM COMBOBOXES ------------------------------- */
function finishComboboxInit() {
    initFormCombos('interaction', 'top');  
    _f.cmbx('enableCombobox', ['#CitationTitle-sel', false]);
    ['Subject', 'Object'].forEach(addTaxonFocusListener);
    _f.cmbx('enableCombobox', ['#InteractionTags-sel', false]);
}
/** Inits comboboxes for the interaction form and the Subject/Object select forms. */
export function initFormCombos(entity, fLvl) {
    const events = getEntityComboEvents(entity);
    _f.cmbx('initFormCombos', [entity, fLvl, events]);
}
/** Note: 'subject', 'object', and 'realm' are passed for taxon. */
function getEntityComboEvents(entity) {
    const events = {
        'interaction': {
            'CitationTitle': { change: onCitSelection, add: create('citation', 'sub') },
            'Country-Region': { change: onCntryRegSelection },
            'InteractionType': { change: onInteractionTypeSelection },
            'InteractionTags': { change: validateIntTagsAndEnableSubmit },
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
        .then(() => _f.state('setOnFormCloseHandler', ['sub2', enableTaxonLvls]))
        .then(() => enableTaxonLvls(false));
    }
}
function createSubEntity(entity, fLvl, val) {  
    if (ifFormAlreadyOpenAtLevel(fLvl)) { return throwAndCatchSubFormErr(entity, fLvl); }
    _f.create(entity, val);
}
function ifFormAlreadyOpenAtLevel(fLvl) {  
    return fLvl ? $('#'+fLvl+'-form').length !== 0 : false;
}
function focusPubFieldIfNewRecord() {
    const action = _f.state('getFormProp', ['top', 'action']);
    _f.cmbx('focusCombobox', ['#Publication-sel', action === 'create']);
}
function openSubFormErr(ent, fLvl) {
    const entity = ent === 'citation' ? 'citationTitle' : ent;
    const ucEntity = _f.util('ucfirst', [entity]); 
    _f.val('openSubFormErr', [ucEntity, null, fLvl]); 
    return Promise.reject();
}
function throwAndCatchSubFormErr(entity, fLvl) {
    openSubFormErr(entity, fLvl)
    .catch(() => {});
}
/** Displays the [Role] Taxon select form when the field gains focus. */ 
function addTaxonFocusListener(role) {
    const elem = '#'+role+'-sel + div div.selectize-input';
    const showSelectForm = role === 'Object' ? initObjectSelect : initSubjectSelect;
    $('#form-main').on('focus', elem, showSelectForm);
}
/** ====================== FORM FIELD HANDLERS ============================== */
/*------------------ PUBLICATION ---------------------------------------------*/
/** 
 * When an existing publication is selected, the citation field is filled with 
 * all current citations for the publciation. When a publication is created, 
 * the citation form is automatically opened. 
 */
function onPubSelection(val) {                                                  console.log('       +--onPubSelection[%s]', val); 
    if (val === 'create') { return createSubEntity('publication', 'sub'); }        
    if (val === '' || isNaN(parseInt(val)) ) { return onPubClear(); }                                
    fillCitationField(val);
    _f.panel('updateSrcDetails', ['pub']);
    if (!hasCitation(val)) { return createSubEntity('citation', 'sub'); }
    focusPinAndEnableSubmitIfFormValid('Publication');
}
function hasCitation(val) {
    return getRcrd('source', val).children.length;
}
function onPubClear() {
    _f.cmbx('clearCombobox', ['#CitationTitle-sel']);
    _f.cmbx('enableCombobox', ['#CitationTitle-sel', false]);
    _f.panel('clearDetailPanel', ['pub']);
}
/*------------------ CITATION ------------------------------------------------*/
/** Fills the citation combobox with all citations for the selected publication. */
export function fillCitationField(pubId) {                                            
    _f.cmbx('enableCombobox', ['#CitationTitle-sel']);
    _f.cmbx('updateComboboxOptions', ['#CitationTitle-sel', getPubCitationOpts(pubId)]);
}
/** Returns an array of option objects with citations for this publication.  */
function getPubCitationOpts(pubId) {
    const pubRcrd = getRcrd('source', pubId);  
    if (!pubRcrd) { return [{ value: 'create', text: 'Add a new Citation...'}]; }
    const opts = _f.elems('getRcrdOpts', [pubRcrd.children, getRcrds('source')]);
    opts.unshift({ value: 'create', text: 'Add a new Citation...'});
    return opts;
}
/** 
 * When a Citation is selected, both 'top' location fields are initialized
 * and the publication combobox is reenabled. 
 */    
function onCitSelection(val) {                                                  console.log('       +--onCitSelection [%s]', val);
    if (val === 'create') { return createSubEntity('citation', 'sub'); }
    if (val === '' || isNaN(parseInt(val))) { return _f.panel('clearDetailPanel', ['cit']); }          
    _f.panel('updateSrcDetails', ['cit']);
    _f.cmbx('enableCombobox', ['#Publication-sel']);
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
function onCntryRegSelection(val) {                                             console.log("       +--onCntryRegSelection [%s]", val);
    if (val === "" || isNaN(parseInt(val))) { return fillLocationSelect(null); }          
    const loc = getRcrd('location', val);
    fillLocationSelect(loc);
    focusPinAndEnableSubmitIfFormValid('Country-Region');
    if ($('#form-map').length) { showCountryDataOnMap(val); }    
}
function showCountryDataOnMap(val) {
    _f.forms('focusParentAndShowChildLocs', ['int', val]);
}
/*------------------ LOCATION ------------------------------------------------*/
/**
 * When a country/region is selected, the location combobox is repopulated with its 
 * child-locations and all habitat types. When cleared, the combobox is 
 * repopulated with all locations. 
 */ 
function fillLocationSelect(loc) {                                              
    const opts = loc ? getOptsForLoc(loc) : _f.elems('getLocationOpts');    
    _f.cmbx('updateComboboxOptions', ['#Location-sel', opts]);
}          
/** Returns an array of options for the locations of the passed country/region. */
function getOptsForLoc(loc) {
    let opts = getChildLocOpts(loc.children)
    opts.push({ value: loc.id, text: loc.displayName });
    opts = opts.sort((a, b) => _f.util('alphaOptionObjs', [a, b]));
    opts.unshift({ value: 'create', text: 'Add a new Location...'});
    return opts;
}
function getChildLocOpts(children) {
    return children.map(id => ({
        value: id, text: getRcrd('location', id).displayName 
    }));
}
export function selectLoc(id) {
    $('#sub-form').remove();
    _f.cmbx('setSelVal', ['#Location-sel', id]);
    enableCountryRegionField();
    _f.cmbx('enableCombobox', ['#Location-sel']);
}
/** When the Location sub-form is exited, the Country/Region combo is reenabled. */
export function enableCountryRegionField() {  
    _f.cmbx('enableCombobox', ['#Country-Region-sel']);
    $('#loc-note').fadeTo(400, 1);
}
/** 
 * When a location is selected, its country/region is selected in the top-form
 * combobox and the location record's data is added to the detail panel. If 
 * the location was cleared, the detail panel is cleared. 
 */     
function onLocSelection(val) {                                                  console.log('       +--onLocSelection [%s]', val);
    if (val === 'create') { return createSubEntity('location', 'sub'); }
    if (val === '' || isNaN(parseInt(val))) { return _f.panel('clearDetailPanel', ['loc']); }   
    if ($('#form-map').length) { removeLocMap(); }
    const locRcrd = getRcrd('location', val);
    const prntVal = locRcrd.parent ? locRcrd.parent : locRcrd.id;
    _f.cmbx('setSelVal', ['#Country-Region-sel', prntVal, 'silent']);
    _f.panel('fillLocDataInDetailPanel', [locRcrd]);
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
function initSubjectSelect() {                                                  console.log('       +--initSubjectSelect (selected ? [%s])', $('#Subject-sel').val());
    return initTaxonSelectForm('Subject', 1);
}
/* -------------- OBJECT ---------------------- */
/** Note: The selected realm's level combos are built @onRealmSelection. */
function initObjectSelect() {                                                   console.log('       +--initObjectSelect (selected ? [%s])', $('#Object-sel').val());
    return initTaxonSelectForm('Object', getObjectRealm());
} 
function getObjectRealm() { 
    const prevSelectedId = $('#Object-sel').data('selTaxon');
    if (!prevSelectedId) { return 2; } //default: Plants (2)
    return getRcrd('taxon', prevSelectedId).realm.id;
}
/**
 * Removes any previous realm comboboxes. Shows a combobox for each level present 
 * in the selected Taxon realm filled with the taxa at that level. 
 */
function onRealmSelection(val) {                                                //console.log("               --onRealmSelection. val = ", val)
    if (val === '' || isNaN(parseInt(val))) { return; }
    clearPreviousRealmLevelCombos();
    _f.state('initRealmState', ['Object', val])
    .then(buildAndAppendRealmRows);
    /** A row for each level present in the realm filled with the taxa at that level.  */
    function buildAndAppendRealmRows() {  
        _f.elems('buildFormRows', ['object', {}, 'sub'])
        .then(appendRealmRowsAndFinishBuild);
    }
    function appendRealmRowsAndFinishBuild(rows) {  
        $('#Realm_row').after(rows);
        _f.state('setFormFieldData', ['sub', 'Realm', null, 'select']);
        initFormCombos('taxon', 'sub');
    }
}
function clearPreviousRealmLevelCombos() {
    $('#object_Rows>div').each(ifLevelComboRemoveCombo);
}
function ifLevelComboRemoveCombo(i, elem) {
    if (i !== 0) { elem.remove(); }
}
/* ------------------- ROLE SHARED HELPERS --------------- */
/* ------- initTaxonSelectForm --------- */
function initTaxonSelectForm(role, realmId) {                                     
    if (ifFormAlreadyOpenAtLevel('sub')) { return openSubFormErr(role, 'sub'); }
    return buildTaxonSelectForm(role, realmId)
        .then(form => appendTxnFormAndInitCombos(role, form))
        .then(() => finishTaxonSelectBuild(role));
}
function buildTaxonSelectForm(role, realmId) {                                  //console.log('-------------buildTaxonSelectForm. args = %O', arguments);
    addNewFormState(role);
    return _f.state('initRealmState', [role, realmId])
        .then(() => _f.elems('initSubForm', 
            ['sub', 'sml-sub-form', {Realm: realmId}, '#'+role+'-sel']));
}
function addNewFormState(role) {
    const lcRole = _f.util('lcfirst', [role]);
    _f.state('addEntityFormState', [lcRole, 'sub', '#'+role+'-sel', 'create']);
}
/**
 * Customizes the taxon-select form ui. Either re-sets the existing taxon selection
 * or brings the first level-combo into focus. Clears the [role]'s' combobox. 
 */
function finishTaxonSelectBuild(role) {
    customizeElemsForTaxonSelectForm(role);
    selectInitTaxonOrFocusFirstCombo(role);
    _f.util('replaceSelOpts', ['#'+role+'-sel', []]);
}
/**
 * Restores a previously selected taxon on initial load, or when reseting the select
 * form. When the select form loads without a previous selection or when the realm 
 * is changed by the user, the first combobox of the realm is brought into focus.
 */
function selectInitTaxonOrFocusFirstCombo(role) {
    const selId = getPrevSelId(role); 
    if (selId) { resetPrevTaxonSelection(selId, role);
    } else { focusFirstLevelCombobox(_f.util('lcfirst', [role])); }
}
function getPrevSelId(role) {
    return $('#'+role+'-sel').val() || $('#'+role+'-sel').data('reset') ? 
        $('#'+role+'-sel').data('selTaxon') : null;
}
function focusFirstLevelCombobox(lcRole) {
    _f.cmbx('focusFirstCombobox', ['#'+lcRole+'_Rows']);
}
function appendTxnFormAndInitCombos(role, form) {
    const lcRole = _f.util('lcfirst', [role]);
    $('#'+role+'_row').append(form);
    initFormCombos('taxon', 'sub');
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
    const bttn = _f.elems('getExitButton');
    bttn.id = 'exit-sub-form';
    $(bttn).unbind('click').click(exitTaxonSelectForm.bind(null, role));
    return bttn;
}
/** Exits sub form and restores any previous taxon selection. */
function exitTaxonSelectForm(role) {  
    _f.elems('exitSubForm', ['sub', false, enableTaxonCombos]);
    const prevTaxonId = $('#'+role+'-sel').data('selTaxon');
    if (!prevTaxonId) { return; }
    resetTaxonCombobox(role, prevTaxonId);
}
function resetTaxonCombobox(role, prevTaxonId) {
    const opt = { value: prevTaxonId, text: getTaxonym(prevTaxonId) };
    _f.cmbx('updateComboboxOptions', ['#'+role+'-sel', opt]);
    _f.cmbx('setSelVal', ['#'+role+'-sel', prevTaxonId]);
}
function getTaxonym(id) {
    return getRcrd('taxon', id).displayName;
}
function enableTaxonLvls(enable = true) {
    $.each($('#sub-form select'), (i, sel) => {  
        _f.cmbx('enableCombobox', ['#'+sel.id, enable])
    });
}
/* ------- resetTaxonSelectForm --------- */
/** Removes and replaces the taxon form. */
function resetTaxonSelectForm(role) {                                           
    const realm = getRealmData('realmName');
    const reset =  realm == 'Bat' ? initSubjectSelect : initObjectSelect;
    $('#'+role+'-sel').data('reset', true);
    $('#sub-form').remove();
    reset();
}
/** Resets the taxon to the one previously selected in the interaction form.  */
function resetPrevTaxonSelection(id, role) {                                       
    const taxon = getRcrd('taxon', id);   
    if (ifSelectedTaxonIsRealmTaxon(taxon)) { return; }                         console.log('           --resetPrevTaxonSelection [%s] [%s] = %O', role, id, taxon);
    selectPrevTaxon(taxon, role);
}
function ifSelectedTaxonIsRealmTaxon(taxon) { 
    return getRealmData('rootLvl') == taxon.level.displayName;
}
function selectPrevTaxon(taxon, role) {
    addTaxonOptToTaxonMemory(taxon);
    if (ifTaxonInDifferentRealm(taxon.realm)) { return selectTaxonRealm(taxon); }
    _f.cmbx('setSelVal', ['#'+taxon.level.displayName+'-sel', taxon.id]);
    window.setTimeout(() => { deleteResetFlag(role); }, 1000);
}
function addTaxonOptToTaxonMemory(taxon) {
    _f.state('setRealmProp', ['prevSel', {val: taxon.id, text: taxon.displayName }]);
}
function ifTaxonInDifferentRealm(realm) {  
    return realm.displayName !== 'Bat' && $('#Realm-sel').val() != realm.id;
}
function selectTaxonRealm(taxon) {
    _f.cmbx('setSelVal', ['#Realm-sel', taxon.realm.id]);
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
export function onLevelSelection(val) {                                         console.log("           --onLevelSelection. val = [%s] isNaN? [%s]", val, isNaN(parseInt(val)));
    const fLvl = _f.getSubFormLvl('sub');
    if (val === 'create') { return openTaxonCreateForm(this.$input[0], fLvl); }
    if (val === '' || isNaN(parseInt(val))) { return syncTaxonCombos(this.$input[0]); } 
    repopulateCombosWithRelatedTaxa(val);
    _f.elems('toggleSubmitBttn', ['#'+fLvl+'-submit', true]);             
}
function openTaxonCreateForm(selElem, fLvl) {                 
    const level = selElem.id.split('-sel')[0];
    if (level === 'Species' && !$('#Genus-sel').val()) {
        return _f.val('formInitErr', [level, 'noGenus', fLvl]);
    }
    selElem.selectize.createItem('create');
}
function syncTaxonCombos(elem) {                                                
    resetChildLevelCombos(getSelectedTaxon(elem.id.split('-sel')[0]));
}
function resetChildLevelCombos(selTxn) {                                        
    const lvlName = selTxn ? selTxn.level.displayName : getRealmTopSubLevel();
    if (lvlName == 'Species') { return; }
    getChildlevelOpts(lvlName)
    .then(opts => repopulateLevelCombos(opts, {}));
}
function getRealmTopSubLevel() {
    return getRealmData('realmLvls').map(l => l).pop();
}
function getChildlevelOpts(lvlName) { 
    const opts = {};
    return buildChildLvlOpts().then(() => opts);

    function buildChildLvlOpts() {
        const lvls = getChildLvls();
        const optProms = lvls.map(lvl => getTaxonOpts(lvl))
        return Promise.all(optProms);
    }
    function getChildLvls() {
        const lvls = getRealmData('realmLvls');
        return lvls.slice(0, lvls.indexOf(lvlName));
    }
    function getTaxonOpts(level) {
        return _f.elems('getTaxonOpts', [level, null, getRealmData('realmName')])
            .then(lvlOpts => opts[level] = lvlOpts);
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
    const taxon = getRcrd('taxon', selId);                                      //console.log("repopulateCombosWithRelatedTaxa. taxon = %O, opts = %O, selected = %O", taxon, opts, selected);
    const realm = getRealmData('realmName');

    taxon.children.forEach(addRelatedChild); 
    return buildUpdatedTaxonOpts()
        .then(repopulateLevelCombos.bind(null, opts, selected));

    function addRelatedChild(id) {                                              //console.log('addRelatedChild. id = ', id);
        const childTxn = getRcrd('taxon', id);  
        const level = childTxn.level.displayName;
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
        return _f.elems('getTaxonOpts', [taxon.level.displayName, null, realm])
            .then(o => {                                                        //console.log('getSiblingOpts. taxon = %O', taxon);
                opts[taxon.level.displayName] = o;
                selected[taxon.level.displayName] = taxon.id;
            });  
    }
    function getAncestorOpts(prntId) {                                          //console.log('getAncestorOpts. prntId = [%s]', prntId);
        const prntTaxon = getRcrd('taxon', prntId);
        if (prntTaxon.isRealm) { return Promise.resolve();}
        selected[prntTaxon.level.displayName] = prntTaxon.id;                            
        return buildAncestorOpts(prntTaxon);
    }
    function buildAncestorOpts(prntTaxon) {
        return _f.elems('getTaxonOpts', [prntTaxon.level.displayName, null, realm])
            .then(o => {                                                        //console.log("--getAncestorOpts - setting lvl = ", prntTaxon.level)
                opts[prntTaxon.level.displayName] = o;
                return getAncestorOpts(prntTaxon.parent);
            });
    }
    /**
     * Builds the opts for each level without taxa related to the selected taxon.
     * Ancestor levels are populated with all taxa at the level and will have 
     * the 'none' value selected.
     */
    function buildOptsForEmptyLevels() {
        const lvls = getRealmData('realmLvls');
        const proms = [];
        fillOptsForEmptyLevels();  
        return Promise.all(proms);

        function fillOptsForEmptyLevels() { 
            lvls.forEach(lvl => {
                if (opts[lvl] || lvl == taxon.level.displayName) { return; }
                buildAncestorOpts(lvl);
            });
        }
        function buildAncestorOpts(lvl) {
            selected[lvl] = 'none';
            proms.push(_f.elems('getTaxonOpts', [lvl, null, realm])
                .then(o => opts[lvl] = o ));
        }
    }
    function addCreateOpts() {                      
        for (let lvl in opts) {                                                 //console.log("lvl = %s, name = ", lvl, lvls[lvl-1]);
            opts[lvl].unshift({ value: 'create', text: 'Add a new '+lvl+'...'});
        }
        return Promise.resolve();
    }
} /* End fillAncestorTaxa */    
function repopulateLevelCombos(optsObj, selected) {                             //console.log('repopulateLevelCombos. optsObj = %O, selected = %O', optsObj, selected); //console.trace();
    Object.keys(optsObj).forEach(lvl => {                                       //console.log("lvl = %s, name = ", l, lvls[l-1]); 
        repopulateLevelCombo(optsObj[lvl], lvl, selected)
    });
}
/**
 * Replaces the options for the level combo. Selects the selected taxon and 
 * its direct ancestors.
 */
function repopulateLevelCombo(opts, lvl, selected) {                            //console.log("repopulateLevelCombo for lvl = %s (%s)", lvl, lvlName);
    updateComboOpts(lvl, opts);
    if (!lvl in selected) { return; }
    if (selected[lvl] == 'none') { return resetPlaceholer(lvl); }
    _f.cmbx('setSelVal', ['#'+lvl+'-sel', selected[lvl], 'silent']); 
}
/**
 * Change event is fired when options are replaced, so the event is removed and 
 * restored after the options are updated. 
 */
function updateComboOpts(lvl, opts) {
    _f.util('replaceSelOpts', ['#'+lvl+'-sel', opts, () => {}]);
    $('#'+lvl+'-sel')[0].selectize.on('change', onLevelSelection);
}
function resetPlaceholer(lvl) {
    _f.util('updatePlaceholderText', ['#'+lvl+'-sel', null, 0]); 
}
/* ------- selectRoleTaxon --------- */
/** Adds the selected taxon to the interaction-form's [role]-taxon combobox. */
function selectRoleTaxon() {  
    const role = getRealmData('realmName') === 'Bat' ? 'Subject' : 'Object';
    const opt = getSelectedTaxonOption();
    $('#sub-form').remove();
    _f.cmbx('updateComboboxOptions', ['#'+role+'-sel', opt]);
    _f.cmbx('setSelVal', ['#'+role+'-sel', opt.value]);
}
/** Returns an option object for the most specific taxon selected. */
function getSelectedTaxonOption() {
    const taxon = getSelectedTaxon();                                           //console.log("selected Taxon = %O", taxon);
    return { value: taxon.id, text:taxon.displayName };
}
/** Finds the most specific level with a selection and returns that taxon record. */
export function getSelectedTaxon(aboveLvl) {
    const selElems = $('#sub-form .selectized').toArray();  
    if (ifEditingTaxon()) { selElems.reverse(); } //Taxon parent edit form.
    const selected = selElems.find(isSelectedTaxon.bind(null, aboveLvl));                              //console.log("getSelectedTaxon. selElems = %O selected = %O", selElems, selected);
    return !selected ? false : _f.state('getRcrd', ['taxon', $(selected).val()]);
    
    function ifEditingTaxon() {
        const action = _f.state('getFormProp', ['top', 'action']);
        const entity = _f.state('getFormProp', ['top', 'entity']);
        return action == 'edit' && entity == 'taxon';
    }
}
function isSelectedTaxon(resetLvl, elem) { 
    if (!ifIsLevelComboElem(elem)) { return false; }
    if (resetLvl && isLevelChildOfResetLevel(resetLvl, elem)) { return false; }
    return $(elem).val(); 
}  
function isLevelChildOfResetLevel(resetLvl, elem) {
    const allLevels = getRealmData('realmLvls');
    const level = elem.id.split('-sel')[0];
    return allLevels.indexOf(level) < allLevels.indexOf(resetLvl);
}
function ifIsLevelComboElem(elem) {
    return elem.id.includes('-sel') && !elem.id.includes('Realm');
 } 
/**
 * When complete, the select form is removed and the most specific taxon is displayed 
 * in the interaction-form <role> combobox. 
 */
function onTaxonRoleSelection(role, val) {                                      console.log("       +--onTaxonRoleSelection [%s] = ", role, val);
    if (val === "" || isNaN(parseInt(val))) { return; }         
    $('#'+_f.getSubFormLvl('sub')+'-form').remove();
    $('#'+role+'-sel').data('selTaxon', val);
    enableTaxonCombos(); 
    focusPinAndEnableSubmitIfFormValid(role);
}
function enableTaxonCombos() {
    _f.cmbx('enableCombobox', ['#Subject-sel']);
    _f.cmbx('enableCombobox', ['#Object-sel']);
}
function getRealmData(prop) {
    return prop ? _f.state('getTaxonProp', [prop]) : _f.state('getRealmState');
}
/* ------------------- INTERACTION TYPE & TAGS ------------------------------ */
function onInteractionTypeSelection(val) {
    fillAndEnableTags(val);
    focusPinAndEnableSubmitIfFormValid('InteractionType');
}
function fillAndEnableTags(id) {
    const tagOpts = buildTagOpts(id);
    _f.cmbx('updateComboboxOptions', ['#InteractionTags-sel', tagOpts]);
    _f.cmbx('enableCombobox', ['#InteractionTags-sel', true]);
    handleRequiredTagForType(tagOpts);
}
function buildTagOpts(id) { 
    const type = getRcrd('interactionType', id);
    return type.tags.map(t => { return {value: t.id, text: t.displayName}; })
}
function handleRequiredTagForType(tagOpts) {
    if (tagOpts.length !== 2) { return $('#InteractionTags-sel').data('default', false); }
    const defaultTagId = getDefaultTag(tagOpts);
    _f.cmbx('setSelVal', ['#InteractionTags-sel', defaultTagId]);
    $('#InteractionTags-sel').data('default', defaultTagId);
}
function getDefaultTag(tags) {
    const tag = tags.find(t => t.text !== 'Secondary');
    return tag.value;
}
function validateIntTagsAndEnableSubmit(tags) {                          
    validateIntTags(tags);
    checkIntFieldsAndEnableSubmit();
}
function validateIntTags(tags) {
    const defaultTagId = $('#InteractionTags-sel').data('default');
    if (!defaultTagId || tags.indexOf(defaultTagId) !== -1 ) { return; }
    _f.cmbx('setSelVal', ['#InteractionTags-sel', defaultTagId, 'silent']);
}
/* ========================== HELPERS ======================================= */
function focusPinAndEnableSubmitIfFormValid(field) {
    const editing = _f.state('getFormProp', ['top', 'action']) === 'edit';
    if (!editing) { $('#'+field+'_pin').focus(); }
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
    _f.elems('checkReqFieldsAndToggleSubmitBttn', ['top']);
    resetIfFormWaitingOnChanges(); //After interaction form submit, the submit button is disabled until form data changes
}
/**
 * After an interaction is created, the form can not be submitted until changes
 * are made. This removes the change listeners from non-required elems and the 
 * flag tracking the state of the new interaction form.  
 */
function resetIfFormWaitingOnChanges() {  
    if (!_f.state('getFormProp', ['top', 'unchanged'])) { return; }
    _f.elems('exitSuccessMsg');
    _f.state('setFormProp', ['top', 'unchanged', false]);
}
function getRcrd(entity, id) {
    return _f.state('getRcrd', [entity, id]);
}
function getRcrds(entity) {
    return _f.state('getEntityRcrds', [entity]);
}