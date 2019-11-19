/*
 * When logged in as an 'admin' or 'super': 
 * >> On the database search page, multiple admin-ui elements are added that open 
 * a popup interface allowing the creating, updating and, soon, deleting of data.   
 * >> All Content Blocks will have an edit icon attached to the top left of their 
 * container. When clicked, a wysiwyg interface will encapsulate that block and 
 * allow editing and saving of the content within using the trumbowyg library.
 * 
 * Exports:             Imported by:
 *     accessFormState          form_ui
 *     addNewLocation
 *     clearForMemory          form-ui
 *     editEntity
 *     initLocForm
 *     initNewDataForm          db-ui
 *     mergeLocs
 *     selectLoc
 *     locCoordErr
 *
 *     getFormParams            f-errs, 
 *     getFormValuesAndSubmit
 *     ifParentFormValidEnableSubmit
 *     buildIntFormFields
 *     getRcrd                  edit-forms, generate-citation, form-elems
 *     getSrcTypeRows           edit-forms
 *     loadSrcTypeFields        ""
 *     fieldIsDisplayed         ""
 *     selectExistingAuthors    ""
 *     getTaxonDisplayName      ""
 *     addMapToLocForm          ""
 *     initTaxonParams          "", interaction-form
 *     getSelectedTaxon
 *     buildFormDataAndSubmit
 *     addListenerToGpsFields
 *     toggleSubmitBttn         edit-forms, f-errs
 *     focusParentAndShowChildLocs      edit-forms, interaction-form
 *     enableTaxonLvls          f-confg 
 *     enablePubField           f-confg
 *     submitFormData               edit-forms
 *     handleCitText                ""
 *     getSubFormLvl                ""
 *     resetIfFormWaitingOnChanges              ""
 *     disableSubmitBttn            ""
 *     enableSubmitBttn             "", [something else, didn't doc]
 *     exitForm                save-exit-bttns
 *     getFormLevelParams           generate-citation
 *     getObjectRealm               interaction-form
 *     showSuccessMsg               interaction-form
 */
import * as _u from '../util.js';
import * as _elems from './forms/ui/form-elems.js';
import * as _forms from './forms/forms-main.js';
import * as db_sync from '../db-sync.js';
import * as db_page from '../db-page.js';
import * as db_map from '../db-map/db-map.js';
import * as idb from 'idb-keyval'; //set, get, del, clear
import * as _errs from './forms/validation/f-errs.js';
import * as form_ui from './forms/ui/form-ui.js';
import * as _cmbx from './forms/ui/combobox-util.js';
import * as _fCnfg from './forms/etc/form-config.js';
import { showEntityEditForm } from './forms/edit/edit-forms.js';
import { getFormValueData } from './forms/validation/get-form-data.js';
import { formatDataForServer } from './forms/validation/validate-data.js';
import { buildCitationText } from './forms/features/generate-citation.js';

let fP = {};
/* ================== FORM "STATE" ========================================= */
export function clearFormMemory() {
    fP = {};
}
export function getFormParams() {
    return fP;
}
/*------------------- Form Functions -------------------------------------------------------------*/
// /*--------------------------- Edit Form --------------------------------------*/
// /** Shows the entity's edit form in a pop-up window on the search page. */
export function editEntity(id, entity) {                                        console.log("   //editEntity [%s] [%s]", entity, id);  
    _forms.initFormMemory("edit", entity, id)
    .then(() => showEntityEditForm(id, entity, fP));
}   
/*--------------------------- Create Form --------------------------------------------------------*/
/**
 * Fills the global fP obj with the basic form params @_forms.initFormMemory. 
 * Inits the interaction form with all fields displayed and the first field, 
 * publication, in focus. From within many of the fields the user can create 
 * new entities of the field-type by selecting the 'add...' option from the 
 * field's combobox and completing the appended sub-form.
 */
export function initNewDataForm() {                                             console.log('   //Building New Interaction Form');
    _forms.initFormMemory('create', 'interaction')
    .then(fP => _forms.getFormFields('interaction', fP))
    .then(fields => form_ui.buildAndAppendForm('top', fields))
    .then(() => form_ui.finishEntityFormBuild('interaction'))
    .then(form_ui.finishCreateFormBuild)
    .catch(err => _u.alertErr(err));
}
/*------------------- Interaction Form Methods (Shared) ----------------------*/ 

/*-------------- Form Builders -------------------------------------------------------------------*/

/*-------------- Country/Region ------------------------------------------*/

/*-------------- Location ------------------------------------------------*/
/** Inits the location form and disables the country/region combobox. */
export function initLocForm(val) {                                              console.log("       --initLocForm [%s]", val);
    const fLvl = getSubFormLvl("sub");
    if ($('#'+fLvl+'-form').length !== 0) { return _errs.openSubFormErr('Location', null, fLvl); }
    if ($('#loc-map').length !== 0) { $('#loc-map').remove(); }
    buildLocForm(val, fLvl)
    .then(onLocFormLoadComplete);
}
function buildLocForm(val, fLvl) {    
    const vals = {
        'DisplayName': val === 'create' ? '' : val, //clears form trigger value
        'Country': $('#Country-Region-sel').val() }; 
    return initEntitySubForm('location', fLvl, 'flex-row med-sub-form', vals, '#Location-sel')
        .then(appendLocFormAndFinishBuild);

    function appendLocFormAndFinishBuild(form) {
        $('#Location_row').after(form);
        _cmbx.initFormCombos('location', 'sub', fP.forms.sub.selElems);
        _cmbx.enableCombobox('#Country-Region-sel', false);
        $('#Latitude_row input').focus();
        $('#sub-submit').val('Create without GPS data');
        form_ui.setCoreRowStyles('#location_Rows', '.sub-row');
        if (vals.DisplayName && vals.Country) { enableSubmitBttn('#sub-submit'); }
    }
}
function onLocFormLoadComplete() {
    const fLvl = getSubFormLvl("sub");
    disableTopFormLocNote();
    addMapToLocForm('#location_Rows', 'create');
    addNotesToForm();
    addListenerToGpsFields();
    scrollToLocFormWindow();
    _forms.setOnSubmitSuccessHandler('location', fLvl);
}
function disableTopFormLocNote() {
    $('#loc-note').fadeTo(400, .3);
}
function scrollToLocFormWindow() {
    $('#form-main')[0].scrollTo(0, 150); 
}
function addNotesToForm() {
    $('#Latitude_row').before(getHowToCreateLocWithGpsDataNote());
    $('#DisplayName_row').before(getHowToCreateLocWithoutGpsDataNote());
}
function getHowToCreateLocWithGpsDataNote(argument) {
    return `<p class="loc-gps-note skipFormData" style="margin-top: 5px;">GPS 
        data? Enter all data and see the added green pin's popup for name 
        suggestions and the "Create" button.</p>`;
}
function getHowToCreateLocWithoutGpsDataNote() {
    return `<p class="loc-gps-note skipFormData">No GPS data? Fill 
        in available data and click "Create without GPS data" at the bottom of 
        the form.</p>`;
}
export function addListenerToGpsFields(func) {
    const method = func || db_map.addVolatileMapPin;
    $('#Latitude_row input, #Longitude_row input').change(
        toggleNoGpsSubmitBttn.bind(null, method));
}
function toggleNoGpsSubmitBttn(addMapPinFunc) {
    const lat = $('#Latitude_row input').val();  
    const lng = $('#Longitude_row input').val();  
    const toggleMethod = lat || lng ? disableSubmitBttn : enableSubmitBttn;
    toggleMethod('#sub-submit');
    addMapPinFunc(true);
}
/**
 * New locations with GPS data are created by clicking a "Create Location" button
 * in a the new location's green map pin's popup on the map in the form.
 */
export function addNewLocation() {
    const fLvl = fP.forms['location'];
    if (_elems.ifAllRequiredFieldsFilled(fLvl)) {
        getFormValuesAndSubmit('#'+fLvl+'-form',  fLvl, 'location');
    } else { showFillAllLocFieldsError(fLvl); }
}
function showFillAllLocFieldsError(fLvl) {
    _errs.reportFormFieldErr('Display Name', 'needsLocData', fLvl);
}
export function locCoordErr(field) {
    const fLvl = fP.forms['location'];
    _errs.reportFormFieldErr(field, 'invalidCoords', fLvl);
}
/*--------------- Map methods ---------------------------*/
/** Open popup with the map interface for location selection. */
export function showInteractionFormMap() {                                             //console.log('showInteractionFormMap')
    if ($('#loc-map').length) { return; }
    addMapToLocForm('#Location_row', 'int');
    if (!_cmbx.getSelVal('#Country-Region-sel')) {
        _cmbx.focusCombobox('#Country-Region-sel', true);
    }
}
export function addMapToLocForm(elemId, type) {                                        console.log('           --addMapToLocForm');
    const map = _u.buildElem('div', { id: 'loc-map', class: 'skipFormData' }); 
    const prntId = $('#Country-Region-sel').val() || $('#Country-sel').val();
    $(elemId).after(map);
    db_map.initFormMap(prntId, fP.records.location, type);
}
export function focusParentAndShowChildLocs(type, val) {                               
    if (!val) { return; }                                                       console.log('           --focusParentAndShowChildLocs [%s] [%s]', type, val);
    db_map.initFormMap(val, fP.records.location, type);
}
/*------------------------------ Taxon ---------------------------------------*/
/** ----------------------- Params ------------------------------------- */
/**
 * Inits the taxon params object.
 * > lvls - All taxon levels
 * > realm - realm taxon display name
 * > realmLvls - All levels for the selected realm
 * > realmTaxon - realm taxon record
 * > prevSel - Taxon already selected when form opened, or null.
 * > objectRealm - Object realm display name. (Added elsewhere.)
 */
export function initTaxonParams(role, realmName, id) {                                 //console.log('###### INIT ######### role [%s], realm [%s], id [%s]', role, realmName, id);
    const realmLvls = {
        'Bat': ['Order', 'Family', 'Genus', 'Species'],
        'Arthropod': ['Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'],
        'Plant': ['Kingdom', 'Family', 'Genus', 'Species']
    };
    return getRealmTaxon(realmName).then(buildBaseTaxonParams);                 console.log('       --taxon params = %O', fP.forms.taxonPs)

    function buildBaseTaxonParams(realmTaxon) {
        const prevSel = getPrevSelId(role);
        const reset = fP.forms.taxonPs ? fP.forms.taxonPs.prevSel.reset : false;
        fP.forms.taxonPs = { 
            lvls: ['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'],
            realm: realmName, 
            allRealmLvls: realmLvls, 
            curRealmLvls: realmLvls[realmName],
            realmTaxon: realmTaxon,
            prevSel: (prevSel ? 
                { val: prevSel, text: getTaxonDisplayName(fP.records.taxon[prevSel]) } :
                { val: null, text: null })
        };         
        if (reset) { fP.forms.taxonPs.prevSel.reset = true; } //removed once reset complete
        if (role === 'Object') { fP.forms.taxonPs.objectRealm = realmName; }
    }
}
function getPrevSelId(role) {
    return $('#'+role+'-sel').val() || 
        (fP.forms.taxonPs ? fP.forms.taxonPs.prevSel.val : false);
}
function setTaxonParams(role, realmName, id) {                                  //console.log('setTaxonParams. args = %O', arguments)
    const tPs = fP.forms.taxonPs;
    tPs.realm = realmName;
    return getRealmTaxon(realmName).then(updateTaxonParams);

    function updateTaxonParams(realmTaxon) {
        tPs.realmTaxon = realmTaxon;
        tPs.curRealmLvls = tPs.allRealmLvls[realmName];
    }
}
function getRealmTaxon(realm) {  
    const lvls = { 'Arthropod': 'Phylum', 'Bat': 'Order', 'Plant': 'Kingdom' };
    const realmName = realm || getObjectRealm();
    const dataProp = realmName + lvls[realmName] + 'Names'; 
    return _u.getData(dataProp).then(returnRealmTaxon);
}
function returnRealmTaxon(realmRcrds) {
    return fP.records.taxon[realmRcrds[Object.keys(realmRcrds)[0]]];  
}
/** Returns either the preivously selected object realm or the default. */
export function getObjectRealm() {
    return !fP.forms.taxonPs ? 'Plant' : (fP.forms.taxonPs.objectRealm || 'Plant');
}   
/** Shows a New Taxon form with the only field, displayName, filled and ready to submit. */
function initTaxonForm(value) {                                                 console.log('           --initTaxonForm [%s]', value);
    const val = value === 'create' ? '' : value;
    const selLvl = this.$control_input[0].id.split('-sel-selectize')[0]; 
    const fLvl = fP.forms.taxonPs.prntSubFormLvl || getSubFormLvl('sub2'); //refact
    if (selLvl === 'Species' && !$('#Genus-sel').val()) {
        return _errs.formInitErr(selLvl, 'noGenus', fLvl);
    }
    enableTaxonLvls(false);
    showNewTaxonForm(val, selLvl, fLvl);
} 
function showNewTaxonForm(val, selLvl, fLvl) {                                  //console.log("showNewTaxonForm. val, selVal, fLvl = %O", arguments)
    fP.forms.taxonPs.formTaxonLvl = selLvl;
    buildTaxonForm().then(disableSubmitButtonIfEmpty.bind(null, '#sub2-submit', val));

    function buildTaxonForm() {
        return initEntitySubForm('taxon', fLvl, 'sml-sub-form', {'DisplayName': val}, 
            '#'+selLvl+'-sel')
            .then(appendTxnFormAndFinishBuild);
    }
    function appendTxnFormAndFinishBuild(form) {
        $('#'+selLvl+'_row').append(form);
        enableSubmitBttn('#'+fLvl+'-submit');
        $('#'+fLvl+'-hdr')[0].innerText += ' '+ selLvl;
        $('#DisplayName_row input').focus();
        if (selLvl == 'Species') { updateSpeciesSubmitBttn(fLvl); }
    }
}  /* End showTaxonForm */
function updateSpeciesSubmitBttn(fLvl) {
    $('#'+fLvl+'-submit').off('click').click(submitSpecies.bind(null, fLvl));
}
function submitSpecies(fLvl) {                                                  //console.log('submitSpecies. fLvl = %s', fLvl);
    const species = $('#DisplayName_row input')[0].value;
    if (nameNotCorrect()) { return _errs.reportFormFieldErr('Species', 'needsGenusName', fLvl); }
    getFormValuesAndSubmit('#'+fLvl+'-form',  fLvl, 'taxon');
    
    function nameNotCorrect() {
        const genus = _cmbx.getSelTxt('#Genus-sel');                                  //console.log('Genus = %s, Species = %s', genus, species);
        const speciesParts = species.split(' ');
        return genus !== speciesParts[0];
    }
}
export function enableTaxonLvls(disable) {
    const enable = disable == undefined ? true : false;
    $.each($('#sub-form select'), (i, sel) => _cmbx.enableCombobox('#'+sel.id, enable));
}
/**
 * Removes any previous realm comboboxes. Shows a combobox for each level present 
 * in the selected Taxon realm, plant (default) or arthropod, filled with the 
 * taxa at that level. 
 */
function onRealmSelection(val) {                                                console.log("               --onRealmSelection. val = ", val)
    if (val === '' || isNaN(parseInt(val))) { return Promise.resolve(); }          
    if ($('#realm-lvls').length) { $('#realm-lvls').remove(); } 
    const fLvl = getSubFormLvl('sub');
    return _u.getData('realm')
    .then(setRealmTaxonParams)
    .then(buildAndAppendRealmRows);

    function setRealmTaxonParams(realms) {
        const realm = realms[val].slug;
        return setTaxonParams('Object', _u.ucfirst(realm)).then(() => realm);
    }
    /** A row for each level present in the realm filled with the taxa at that level.  */
    function buildAndAppendRealmRows(realm) {  
        _elems.buildFormRows(realm, {}, fLvl, fP)
        .then(rows => appendRealmRowsAndFinishBuild(realm, rows, fLvl));
    }
    function appendRealmRowsAndFinishBuild(realm, rows, fLvl) {  
        const realmElems = _u.buildElem('div', { id: 'realm-lvls' });
        $(realmElems).append(rows);
        $('#Realm_row').append(realmElems);
        fP.forms[fLvl].fieldConfg.vals.Realm = { val: null, type: 'select' };
        _cmbx.initFormCombos(realm, fLvl, fP.forms[fLvl].selElems);  
        _forms.finishTaxonSelectUi('Object');          
    }
}
/** Adds a close button. Updates the Header and the submit/cancel buttons. */
function customizeElemsForTaxonSelectForm(role) {
    $('#sub-hdr')[0].innerHTML = "Select " + role + " Taxon";
    $('#sub-hdr').append(getTaxonExitButton(role));
    $('#sub-submit')[0].value = "Select Taxon";        
    $('#sub-cancel')[0].value = "Reset";
    $('#sub-submit').unbind("click").click(selectTaxon);
    $('#sub-cancel').unbind("click").click(resetTaxonSelectForm);
}
function getTaxonExitButton(role) {
    const bttn = form_ui.getExitButton();
    bttn.id = 'exit-sub-form';
    $(bttn).unbind("click").click(exitTaxonSelectForm.bind(null, role));
    return bttn;
}
/** Exits sub form and restores any previous taxon selection. */
function exitTaxonSelectForm(role) {
    exitForm('#sub-form', 'sub', false);
    const prevTaxon = fP.forms.taxonPs.prevSel; 
    if (prevTaxon) {
        _cmbx.updateComboboxOptions('#'+role+'-sel', { 
            value: prevTaxon.val, text: prevTaxon.text });
        _cmbx.setSelVal('#'+role+'-sel', prevTaxon.val);
    }
}
/** Removes and replaces the taxon form. */
function resetTaxonSelectForm() {                                               //console.log('resetTaxonSelectForm')                                     
    const prevTaxonId = fP.forms.taxonPs.prevSel.val;
    const initTaxonSelectForm = fP.forms.taxonPs.realm === 'Bat' ? 
        initSubjectSelect : initObjectSelect;
    fP.forms.taxonPs.prevSel.reset = true;
    $('#sub-form').remove();
    initTaxonSelectForm();
}
/** Resets the taxon to the one previously selected in the interaction form.  */
function resetPrevTaxonSelection(selId) {                                       //console.log('seId = %s, prevSel = %O', selId, fP.forms.taxonPs.prevSel);
    const id = selId || fP.forms.taxonPs.prevSel.val; 
    if (!id) { return; }
    const taxon = fP.records.taxon[id];                                         
    if (realmTaxonPrevSelected(taxon)) { return; }                              console.log('           --resetPrevTaxonSelection. [%s] = %O', id, taxon);
    selectPrevTaxon(taxon);
}
function realmTaxonPrevSelected(taxon) { 
    return fP.forms.taxonPs.curRealmLvls[0] == taxon.level.displayName;
}
function selectPrevTaxon(taxon) {
    fP.forms.taxonPs.prevSel = {val: taxon.id, text: getTaxonDisplayName(taxon)};        
    if (ifRealmReset(taxon.realm)) { return _cmbx.setSelVal('#Realm-sel', taxon.realm.id); }
    _cmbx.setSelVal('#'+taxon.level.displayName+'-sel', taxon.id);
    window.setTimeout(() => { delete fP.forms.taxonPs.reset; }, 1000);
}
function ifRealmReset(realm) {  
    return realm.displayName !== 'Bat' && $('#Realm-sel').val() != realm.id;
}
function preventComboboxFocus(realm) {
    const role = realm === 'Bat' ? 'subject' : 'object';  
    const fLvl = fP.forms[role];
    const selCntnr = realm === 'Bat' ? '#'+fLvl+'-form' : '#realm-lvls';        
    _cmbx.focusFirstCombobox(selCntnr, false);
}
/** Adds the selected taxon to the interaction-form's [role]-taxon combobox. */
function selectTaxon() {
    const role = fP.forms.taxonPs.realm === 'Bat' ? 'Subject' : 'Object';
    const opt = getSelectedTaxonOption();
    $('#sub-form').remove();
    _cmbx.updateComboboxOptions('#'+role+'-sel', opt);
    _cmbx.setSelVal('#'+role+'-sel', opt.value);
    _cmbx.enableCombobox('#'+role+'-sel', true);
}
/** Returns an option object for the most specific taxon selected. */
function getSelectedTaxonOption() {
    const taxon = getSelectedTaxon();                                           //console.log("selected Taxon = %O", taxon);
    return { value: taxon.id, text: getTaxonDisplayName(taxon) };
}
export function getTaxonDisplayName(taxon) { 
    return taxon.level.displayName === 'Species' ? 
        taxon.displayName : taxon.level.displayName +' '+ taxon.displayName;
}
/** Finds the most specific level with a selection and returns that taxon record. */
export function getSelectedTaxon(aboveLvl) {
    var selElems = $('#sub-form .selectized').toArray();  
    if (fP.action == 'edit' && fP.forms.top.entity == 'taxon') { selElems.reverse(); } //Taxon parent edit form.
    var selected = selElems.find(isSelectedTaxon.bind(null, aboveLvl));                              //console.log("getSelectedTaxon. selElems = %O selected = %O", selElems, selected);
    return !selected ? false : fP.records.taxon[$(selected).val()];
}
function isSelectedTaxon(clrdLvl, elem) { 
    if (elem.id.includes('-sel') && !elem.id.includes('Realm')) { 
        if (clrdLvl && lvlIsChildOfClearedLvl(elem.id.split('-sel')[0])) { return; }
        return $(elem).val(); 
    }

    function lvlIsChildOfClearedLvl(lvlName) {
        var lvls = fP.forms.taxonPs.lvls;  
        return lvls.indexOf(lvlName) > lvls.indexOf(clrdLvl);
    }
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
    const fLvl = getSubFormLvl('sub');
    repopulateCombosWithRelatedTaxa(val);
    enableSubmitBttn('#'+fLvl+'-submit');             
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
    var opts = {};
    var lvls = fP.forms.taxonPs.lvls;
    var lvlIdx = lvls.indexOf(lvlName)+2; //Skips selected level
    const realm = fP.forms.taxonPs.realm;

    return buildChildLvlOpts().then(() => opts);

    function buildChildLvlOpts() {
        const proms = [];
        for (var i = lvlIdx; i <= 7; i++) { 
            let p = _elems.getTaxonOpts(lvls[i-1], null, realm)
                .then(addToOpts.bind(null, i));
            proms.push(p);
        }                                                                       //console.log("getChildlevelOpts. opts = %O", opts);
        return Promise.all(proms);
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
    var opts = {}, selected = {};                                               
    var lvls = fP.forms.taxonPs.lvls;  
    var taxon = fP.records.taxon[selId];                                        //console.log("repopulateCombosWithRelatedTaxa. taxon = %O, opts = %O, selected = %O", taxon, opts, selected);
    const realm = fP.forms.taxonPs.realm;

    taxon.children.forEach(addRelatedChild); 
    return buildUpdatedTaxonOpts()
        .then(repopulateLevelCombos.bind(null, opts, selected));

    function addRelatedChild(id) {                                              //console.log('addRelatedChild. id = ', id);
        var childTxn = fP.records.taxon[id];  
        var level = childTxn.level.id;
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
        return _elems.getTaxonOpts(taxon.level.displayName, null, realm).then(o => {                //console.log('getSiblingOpts. taxon = %O', taxon);
            opts[taxon.level.id] = o;
            selected[taxon.level.id] = taxon.id;
        });  
    }
    function getAncestorOpts(prntId) {                                          //console.log('getAncestorOpts. prntId = [%s]', prntId);
        var realmTaxa = [1, 2, 3, 4]; //animalia, chiroptera, plantae, arthropoda
        if (realmTaxa.indexOf(prntId) !== -1 ) { return Promise.resolve(); }
        const prntTaxon = getRcrd('taxon', prntId);
        selected[prntTaxon.level.id] = prntTaxon.id;                            
        return _elems.getTaxonOpts(prntTaxon.level.displayName, null, realm)
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
    function buildOptsForEmptyLevels() {                                        //console.log('buildOptsForEmptyLevels. opts = %O', _u.snapshot(opts));
        const topLvl = fP.forms.taxonPs.realm === "Arthropod" ? 3 : 5;  
        const proms = [];
        fillOptsForEmptyLevels();  
        return Promise.all(proms);

        function fillOptsForEmptyLevels() {             
            for (var i = 7; i >= topLvl; i--) {                                 //console.log('fillOptsForEmptyLevels. lvl = ', i);
                if (opts[i]) { continue; } 
                if (i > taxon.level.id) { opts[i] = []; continue; }
                buildAncestorOpts(i);
            }
        }
        function buildAncestorOpts(id) {
            selected[id] = 'none';
            proms.push(_elems.getTaxonOpts(lvls[id-1], null, realm)
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
    var lvls = fP.forms.taxonPs.lvls;  
    Object.keys(optsObj).forEach(l => {                                         //console.log("lvl = %s, name = ", l, lvls[l-1]); 
        repopulateLevelCombo(optsObj[l], lvls[l-1], l, selected)
    });
}
/**
 * Replaces the options for the level combo. Selects the selected taxon and 
 * its direct ancestors.
 */
function repopulateLevelCombo(opts, lvlName, lvl, selected) {                   //console.log("repopulateLevelCombo for lvl = %s (%s)", lvl, lvlName);
    _u.replaceSelOpts('#'+lvlName+'-sel', opts, () => {});
    $('#'+lvlName+'-sel')[0].selectize.on('change', onLevelSelection);
    if (lvl in selected) { 
        if (selected[lvl] == 'none') { return _u.updatePlaceholderText('#'+lvlName+'-sel', null, 0); }
        _cmbx.setSelVal('#'+lvlName+'-sel', selected[lvl], 'silent'); 
    } 
}
/*-------------- Sub Form Helpers ----------------------------------------------------------*/
/*-------------- Publisher -----------------------------------------------*/
function onPublSelection(val) {
    if (val === 'create') { return _forms.createSubEntity('Publisher'); }        
}
/**
 * When a user enters a new publisher into the combobox, a create-publisher
 * form is built, appended to the publisher field row and an option object is 
 * returned to be selected in the combobox. Unless there is already a sub2Form,
 * where a message will be shown telling the user to complete the open sub2 form
 * and the form init canceled.
 * Note: The publisher form inits with the submit button enabled, as display 
 *     name, aka val, is it's only required field.
 */
function initPublisherForm (value) {                                            //console.log("Adding new publisher! val = %s", val);
    const val = value === 'create' ? '' : value;
    const fLvl = getSubFormLvl('sub2');
    const prntLvl = getNextFormLevel('parent', fLvl);
    if ($('#'+fLvl+'-form').length !== 0) { return _errs.openSubFormErr('Publisher', null, fLvl); }
    initEntitySubForm('publisher', fLvl, 'sml-sub-form', {'DisplayName': val}, 
        '#Publisher-sel')
    .then(appendPublFormAndFinishBuild);

    function appendPublFormAndFinishBuild(form) {
        $('#Publisher_row').append(form);
        disableSubmitBttn('#'+prntLvl+'-submit');
        $('#DisplayName_row input').focus();
    }
}
/*-------------- Author --------------------------------------------------*/
/** Loops through author object and adds each author/editor to the form. */
export function selectExistingAuthors(field, authObj, fLvl) {       
    if (!authObj || !$('#'+field+'-sel-cntnr').length) { return Promise.resolve(); }                                 //console.log('reselectAuthors. field = [%s] auths = %O', field, authObj);
    Object.keys(authObj).reduce((p, ord) => { //p(romise), ord(er)  
        const selNextAuth = selectAuthor.bind(null, ord, authObj[ord], field, fLvl);
        return p.then(selNextAuth);
    }, Promise.resolve());
}
/** Selects the passed author and builds a new, empty author combobox. */
function selectAuthor(cnt, authId, field, fLvl) {
    if (!$('#'+field+'-sel'+ cnt).length) { return; }
    _cmbx.setSelVal('#'+field+'-sel'+ cnt, authId, 'silent');
    return buildNewAuthorSelect(++cnt, authId, fLvl, field);
}
/**
 * When an author is selected, a new author combobox is initialized underneath
 * the last author combobox, unless the last is empty. The total count of 
 * authors is added to the new id.
 */
function onAuthSelection(val, ed) {                                             //console.log("Add existing author = %s", val);
    handleAuthSelect(val);
}
function onEdSelection(val) {                                                   //console.log("Add existing author = %s", val);
    handleAuthSelect(val, 'editor');
}
function handleAuthSelect(val, ed) {                                            
    if (val === '' || parseInt(val) === NaN) { return; }
    const authType = ed ? 'Editors' : 'Authors';                                
    const fLvl = getSubFormLvl('sub');
    let cnt = $('#'+authType+'-sel-cntnr').data('cnt') + 1;                          
    if (val === 'create') { return _forms.createSubEntity(authType, --cnt); } 
    _forms.handleCitText(fLvl);       
    // if (citationFormNeedsCitTextUpdate(fLvl)) { handleCitText(fLvl); }
    if (lastAuthComboEmpty(cnt-1, authType)) { return; }
    buildNewAuthorSelect(cnt, val, fLvl, authType);
}
function citationFormNeedsCitTextUpdate(fLvl) {
    return fP.forms[fLvl].entity === 'citation' && !fP.citTimeout;
}
/** Stops the form from adding multiple empty combos to the end of the field. */
function lastAuthComboEmpty(cnt, authType) {  
    return $('#'+authType+'-sel'+cnt).val() === '';
}
/** Builds a new, empty author combobox */
function buildNewAuthorSelect(cnt, val, prntLvl, authType) {                    //console.log("buildNewAuthorSelect. cnt [%s] val [%s] type [%s]", cnt, val, authType)
    return _elems.buildMultiSelectElems(null, authType, prntLvl, cnt)
    .then(appendNewAuthSelect);

    function appendNewAuthSelect(sel) {
        $('#'+authType+'-sel-cntnr').append(sel).data('cnt', cnt);
        _cmbx.initSingle(getAuthSelConfg(authType, cnt), prntLvl);
    }
}
function getAuthSelConfg(authType, cnt) {
    return { 
        add: getAuthAddFunc(authType, cnt), change: getAuthChngFnc(authType),
        id: '#'+authType+'-sel'+cnt,        name: authType.slice(0, -1) //removes 's' for singular type
    };
}
function getAuthChngFnc(authType) {
    return authType === 'Editors' ? onEdSelection : onAuthSelection;
}
function getAuthAddFunc(authType, cnt) {
    const add = authType === 'Editors' ? initEdForm : initAuthForm;
    return add.bind(null, cnt);
}
/** Removes the already selected authors from the new dropdown options. */
// function removeAllSelectedAuths(sel, fLvl, authType) { 
//     const auths = fP.forms[fLvl].fieldConfg.vals[authType].val;   
//     const $selApi = $(sel).data('selectize');                          
//     if (auths) { auths.forEach(id => $selApi.removeOption(id)); } 
// }
function initAuthForm(selCnt, val) {                                            //console.log("Adding new auth! val = %s, e ? ", val, arguments);      
    handleNewAuthForm(selCnt, val, 'Authors');
}
function initEdForm(selCnt, val) {                                              //console.log("Adding new editor! val = %s, e ? ", val, arguments);      
    handleNewAuthForm(selCnt, val, 'Editors');
}
/**
 * When a user enters a new author (or editor) into the combobox, a create 
 * form is built and appended to the field row. An option object is returned 
 * to be selected in the combobox. If there is already an open form at
 * this level , a message will be shown telling the user to complete the open 
 * form and the form init will be canceled.
 */
function handleNewAuthForm(authCnt, value, authType) {  
    const parentSelId = '#'+authType+'-sel'+authCnt; 
    const fLvl = getSubFormLvl('sub2');
    const singular = authType.slice(0, -1);
    const val = value === 'create' ? '' : value;
    if ($('#'+fLvl+'-form').length !== 0) { return _errs.openSubFormErr(authType, parentSelId, fLvl); }
    initEntitySubForm( _u.lcfirst(singular), fLvl, 'sml-sub-form', {'LastName': val}, 
        parentSelId)
    .then(appendAuthFormAndFinishBuild);

    function appendAuthFormAndFinishBuild(form) {        
        $('#'+authType+'_row').append(form);
        handleSubmitBttns();
        $('#FirstName_row input').focus();
    }
    function handleSubmitBttns() {
        const prntLvl = getNextFormLevel('parent', fLvl);
        disableSubmitBttn('#'+prntLvl+'-submit');  
        return _elems.ifAllRequiredFieldsFilled(fLvl) ? 
            enableSubmitBttn('#'+fLvl+'-submit') : 
            disableSubmitBttn('#'+fLvl+'-submit');
    }
} /* End handleNewAuthForm */
/*------------------- Shared Form Builders ---------------------------------------------------*/
/** Returns the record for the passed id and entity-type. */
export function getRcrd(entity, id) {                                                  //console.log('getRcrd [%s] id = [%s]. fP = %O', entity, id, fP);
    if (fP.records[entity]) { 
        const rcrd = fP.records[entity][id];
        if (!rcrd) { return console.log('!!!!!!!! No [%s] found in [%s] records = %O', id, entity, fP.records); console.trace() }
        return _u.snapshot(fP.records[entity][id]); }
}
/*--------------- Shared Form Methods -------------------------------*/
/**
 * Toggles between displaying all fields for the entity and only showing the 
 * default (required and suggested) fields.
 */
export function toggleShowAllFields(entity, fLvl) {                             //console.log('--- Showing all Fields [%s] -------', this.checked);
    if (ifOpenSubForm(fLvl)) { return showOpenSubFormErr(fLvl); }
    fP.forms.expanded[entity] = this.checked;         
    const fVals = getCurrentFormFieldVals(fLvl);                                //console.log('vals before fill = %O', JSON.parse(JSON.stringify(fVals)));
    const fConfg = _fCnfg.getFormConfg(entity);                                 
    const tConfg = fP.forms[fLvl].typeConfg;
    $('#'+entity+'_Rows').empty();
    fP.forms[fLvl].reqElems = [];
    _elems.getFormFieldRows(entity, fConfg, tConfg, fVals, fLvl, fP)
    .then(appendAndFinishRebuild);

    function appendAndFinishRebuild(rows) {
        $('#'+entity+'_Rows').append(rows);
        _cmbx.initFormCombos(entity, fLvl, fP.forms[fLvl].selElems);
        fillComplexFormFields(fLvl);
        finishComplexForms();
    }
    function finishComplexForms() {
        if (['citation', 'publication', 'location'].indexOf(entity) === -1) { return; }
        if (entity === 'publication') { ifBookAddAuthEdNote(fVals.PublicationType)}
        if (entity === 'citation') { 
            handleSpecialCaseTypeUpdates($('#CitationType-sel')[0], fLvl);
            if (!fP.citTimeout) { handleCitText(fLvl); }
        }
        if (entity !== 'location') {
            updateFieldLabelsForType(entity, fLvl);
        }
        form_ui.setCoreRowStyles('#'+entity+'_Rows', '.'+fLvl+'-row');
    }
} /* End toggleShowAllFields */
function ifOpenSubForm(fLvl) {
    const subLvl = getNextFormLevel('child', fLvl);
    return $('#'+subLvl+'-form').length !== 0;
}
function showOpenSubFormErr(fLvl) {
    const subLvl = getNextFormLevel('child', fLvl);
    let entity = _u.ucfirst(fP.forms[subLvl].entity);
    if (entity === 'Author' || entity === 'Editor') { entity += 's'; }
    _errs.openSubFormErr(entity, null, subLvl, true);   
    $('#sub-all-fields')[0].checked = !$('#sub-all-fields')[0].checked;
}
/*------------------- Form Builders --------------------------------------*/    
function initEntitySubForm(entity, fLvl, fClasses, fVals, pSel) {
    return _forms.initEntitySubForm(entity, fLvl, fClasses, fVals, pSel);
}
/** Returns the 'next' form level- either the parent or child. */
export function getNextFormLevel(next, curLvl) {
    const fLvls = fP.formLevels;
    const nextLvl = next === 'parent' ? 
        fLvls[fLvls.indexOf(curLvl) - 1] : 
        fLvls[fLvls.indexOf(curLvl) + 1] ;
    return nextLvl;
}
/** 
 * Returns the sub form's lvl. If the top form is not the interaction form,
 * the passed form lvl is reduced by one and returned. 
 */
export function getSubFormLvl(intFormLvl) {  
    var fLvls = fP.formLevels;
    return fP.forms.top.entity === 'interaction' ? 
        intFormLvl : fLvls[fLvls.indexOf(intFormLvl) - 1];
}
/*--------------------------- Misc Form Helpers ------------------------------*/
/*--------------------------- Fill Form Fields -------------------------------*/
/** Returns an object with field names(k) and values(v) of all form fields*/
function getCurrentFormFieldVals(fLvl) {
    const vals = fP.forms[fLvl].fieldConfg.vals;                                //console.log('getCurrentFormFieldVals. vals = %O', JSON.parse(JSON.stringify(vals)));
    const valObj = {};
    for (let field in vals) {
        valObj[field] = vals[field].val;
    }
    return valObj;
}
/**
 * When either source-type fields are regenerated or the form fields are toggled 
 * between all available fields and the default shown, the fields that can 
 * not be reset as easily as simply setting a value in the form input during 
 * reinitiation are handled here.
 */
function fillComplexFormFields(fLvl) {
    const vals = fP.forms[fLvl].fieldConfg.vals;                                //console.log('fillComplexFormFields. vals = %O, curFields = %O', JSON.parse(JSON.stringify(vals)),fP.forms[fLvl].fieldConfg.fields);
    const fieldHndlrs = { 'multiSelect': selectExistingAuthors };

    for (let field in vals) {                                                   //console.log('field = [%s] type = [%s], types = %O', field, vals[field].type, Object.keys(fieldHndlrs));
        if (!vals[field].val) { continue; } 
        if (Object.keys(fieldHndlrs).indexOf(vals[field].type) == -1) {continue;}
        addValueIfFieldShown(field, vals[field].val, fLvl);
    }
    function addValueIfFieldShown(field, val, fLvl) {                           //console.log('addValueIfFieldShown [%s] field, val = %O', field, val);
        if (!fieldIsDisplayed(field, fLvl)) { return; }
        fieldHndlrs[vals[field].type](field, val, fLvl);        
    }
} /* End fillComplexFormFields */
export function fieldIsDisplayed(field, fLvl) {
    const curFields = fP.forms[fLvl].fieldConfg.fields;                         //console.log('field [%s] is displayed? ', field, Object.keys(curFields).indexOf(field) !== -1);
    return Object.keys(curFields).indexOf(field) !== -1;
}
/*------------------ Form Submission Data-Prep Methods -------------------*/
/** Enables the parent form's submit button if all required fields have values. */
export function ifParentFormValidEnableSubmit(fLvl) {
    const parentLvl = getNextFormLevel('parent', fLvl);
    if (_elems.ifAllRequiredFieldsFilled(parentLvl)) {
        enableSubmitBttn('#'+parentLvl+'-submit');
    }
}
export function toggleSubmitBttn(bttnId, enable) {
    return enable ? enableSubmitBttn(bttnId) : disableSubmitBttn(bttnId);
}
/** Enables passed submit button */
export function enableSubmitBttn(bttnId) {  
    $(bttnId).attr("disabled", false).css({"opacity": "1", "cursor": "pointer"}); 
}  
/** Enables passed submit button */
export function disableSubmitBttn(bttnId) {                                            //console.log('disabling bttn = ', bttnId)
    $(bttnId).attr("disabled", true).css({"opacity": ".6", "cursor": "initial"}); 
}  
function disableSubmitButtonIfEmpty(bttnId, val) {
        if (!val) { disableSubmitBttn(bttnId); }
    }
function toggleWaitOverlay(waiting) {                                           //console.log("toggling wait overlay")
    if (waiting) { appendWaitingOverlay();
    } else { $('#c-overlay').remove(); }  
}
function appendWaitingOverlay() {
    $('#b-overlay').append(_u.buildElem('div', { 
        class: 'overlay waiting', id: 'c-overlay'}));
    $('#c-overlay').css({'z-index': '1000', 'display': 'block'});
}
export function getFormValuesAndSubmit(formId, fLvl, entity) {                             console.log("       --getFormValuesAndSubmit. formId = %s, fLvl = %s, entity = %s", formId, fLvl, entity);
    getFormValueData(fP, entity, fLvl, true)
        .then(buildFormDataAndSubmit.bind(null, entity, fLvl))
        .catch(() => {}); //Err caught in validation process and handled elsewhere.
}
export  function buildFormDataAndSubmit(entity, fLvl, formVals) {
    const data = formatDataForServer(fP, fLvl, formVals)
    submitFormData(data, fLvl, entity);
}
/*------------------ Form Submit Methods ---------------------------------*/
/** Sends the passed form data object via ajax to the appropriate controller. */
export function submitFormData(formData, fLvl, entity) {                               console.log("   --submitFormData [ %s ]= %O", fLvl, formData);
    var coreEntity = _fCnfg.getCoreFormEntity(entity);       
    var url = getEntityUrl(fP.forms[fLvl].action);
    if (fP.editing) { formData.ids = fP.editing; }
    formData.coreEntity = coreEntity;
    storeParamsData(coreEntity, fLvl);
    toggleWaitOverlay(true);
    _u.sendAjaxQuery(formData, url, formSubmitSucess, _errs.formSubmitError);
}
/** Stores data relevant to the form submission that will be used later. */
function storeParamsData(entity, fLvl) {                                 
    var focuses = { 'source': 'srcs', 'location': 'locs', 'taxon': 'taxa', 
        'interaction': 'int' };
    fP.ajaxFormLvl = fLvl;
    fP.submitFocus = focuses[entity];
}
/** Returns the full url for the passed entity and action.  */
function getEntityUrl(action) {
    var envUrl = $('body').data("ajax-target-url");
    return envUrl + "crud/entity/" + action;
}
/*------------------ Form Success Methods --------------------------------*/
/**
 * Ajax success callback. Updates the stored data @db_sync.updateLocalDb and 
 * the stored core records in the fP object. Exit's the successfully submitted 
 * form @exitFormAndSelectNewEntity.  
 */
function formSubmitSucess(data, textStatus, jqXHR) {                            console.log("       --Ajax Success! data = %O, textStatus = %s, jqXHR = %O", data, textStatus, jqXHR);                   
    db_sync.updateLocalDb(data.results).then(onDataSynced);
}
function onDataSynced(data) {                                                   console.log('       --Data update complete. data = %O', data);
    toggleWaitOverlay(false);
    if (data.errors) { return _errs.errUpdatingData(data.errors); }
    if (noDataChanges()) { return showSuccessMsg('No changes detected.', 'red'); }  
    addDataToStoredRcrds(data.core, data.detail)
    .then(handleFormComplete.bind(null, data));

    function noDataChanges() {
        return fP.forms[fP.ajaxFormLvl].action === 'edit'  && !hasChngs(data);
    }
}
/** Updates the core records in the global form params object. */
function addDataToStoredRcrds(entity, detailEntity) {                           //console.log('updateStoredFormParams. [%s] (detail ? [%s]) fP = %O', entity, detailEntity, fP);
    return _u.getData(entity).then(newData => {
        fP.records[entity] = newData;
        if (detailEntity) { return addDataToStoredRcrds(detailEntity); } //Source & Location's detail entities: publications, citations, authors, geojson
    });
}
/*------------------ Top-Form Success Methods --------------------*/
function handleFormComplete(data) {   
    var fLvl = fP.ajaxFormLvl;                                                  //console.log('handleFormComplete fLvl = ', fLvl);
    if (fLvl !== 'top') { return exitFormAndSelectNewEntity(data); }
    fP.forms.top.exitHandler(data);
}
/** 
 * Returns true if there have been user-made changes to the entity. 
 * Note: The location elevUnitAbbrv is updated automatically for locations with
 * elevation data, and is ignored here. 
 */
function hasChngs(data) {   
    const chngs = Object.keys(data.coreEdits).length > 0 || 
        Object.keys(data.detailEdits).length > 0;
    if (chngs && data.core == 'location' && 
        Object.keys(data.coreEdits).length == 2 && 
        'elevUnitAbbrv' in data.coreEdits) { return false; }
    return chngs;
}
/** ---------------- After Interaction Created -------------------------- */

// /** 
//  * Resets the interactions form leaving only the pinned values. Displays a 
//  * success message. Disables submit button until any field is changed. 
//  */
// export function resetInteractionForm() {
//     const vals = getPinnedFieldVals();                                          //console.log("vals = %O", vals);
//     showSuccessMsg('New Interaction successfully created.', 'green');
//     _forms.initFormMemory('create', 'interaction')
//     .then(resetFormUi);

//     function resetFormUi() {
//         resetIntFields(vals); 
//         $('#top-cancel').val(' Close ');  
//         disableSubmitBttn("#top-submit");
//         fP.forms.top.unchanged = true;
//     }
// }
// /** Returns an obj with the form fields and either their pinned values or false. */
// function getPinnedFieldVals() {
//     const pins = $('form[name="top"] [id$="_pin"]').toArray();                  //console.log("pins = %O", pins);
//     const vals = {};
//     pins.forEach(function(pin) {  
//         if (pin.checked) { getFieldVal(pin.id.split("_pin")[0]); 
//         } else { addFalseValue(pin.id.split("_pin")[0]); }
//     });
//     return vals;

//     function getFieldVal(fieldName) {                                           //console.log("fieldName = %s", fieldName)
//         const suffx = fieldName === 'Note' ? '-txt' : '-sel';
//         vals[fieldName] = $('#'+fieldName+suffx).val();
//     }
//     function addFalseValue(fieldName) {
//         vals[fieldName] = false;
//     }
// } /* End getPinnedValsObj */
// /**
//  * Resets the top-form in preparation for another entry. Pinned field values are 
//  * persisted. All other fields will be reset. 
//  */
// function resetIntFields(vals) {                                                 //console.log('resetIntFields. vals = %O', vals);
//     disableSubmitBttn("#top-submit");
//     initInteractionParams();
//     resetUnpinnedFields(vals);
//     fillPubDetailsIfPinned(vals.Publication);
// }
// function resetUnpinnedFields(vals) {
//     for (var field in vals) {                                                   //console.log("field %s val %s", field, vals[field]);
//         if (!vals[field]) { clearField(field); }
//     }
// }
// function clearField(fieldName) {
//     if (fieldName === 'Note') { return $('#Note-txt').val(""); }
//    form_ui.clearFieldDetailPanel(fieldName);
//     _cmbx.clearCombobox('#'+fieldName+'-sel');
// }
// function fillPubDetailsIfPinned(pub) {
//     if (pub) { form_ui.updateSrcDetailPanel('pub', fP.records.source); 
//     } else { _cmbx.enableCombobox('#CitationTitle-sel', false); }
// }
// /** Inits the necessary interaction form params after form reset. */
// function initInteractionParams() {
//     initFormLevelParamsObj(
//         "interaction", "top", null, _fCnfg.getFormConfg("interaction"), "create");
//     addReqElemsToConfg();
// }
// function addReqElemsToConfg() {
//     const reqFields = ["Publication", "CitationTitle", "Subject", "Object", 
//         "InteractionType"];
//     fP.forms.top.reqElems = reqFields.map(field => $('#'+field+'-sel')[0]);
// }
/**
 * After an interaction is created, the form can not be submitted until changes
 * are made. This removes the change listeners from non-required elems and the 
 * flag tracking the state of the new interaction form.  
 */
export function resetIfFormWaitingOnChanges() {  
    if (!fP.forms.top.unchanged) { return; }
    exitSuccessMsg();
    delete fP.forms.top.unchanged;
}
/*------------------ After Sub-Entity Created ----------------------------*/
/**
 * Exits the successfully submitted form @exitForm. Adds and selects the new 
 * entity in the form's parent elem @addAndSelectEntity.
 */
function exitFormAndSelectNewEntity(data) {                                     console.log('           --exitFormAndSelectNewEntity. data = %O', data);
    const fLvl = fP.ajaxFormLvl;  
    const formParent = _forms.memory('getFormParentId', [fLvl]);         
    exitForm('#'+fLvl+'-form', fLvl); 
    if (formParent) { addAndSelectEntity(data, formParent); 
    } else { _forms.memory('clearMemory'); }
}
/** Adds and option for the new entity to the form's parent elem, and selects it. */
function addAndSelectEntity(data, formParent) {
    const selApi = $(formParent)[0].selectize;        
    selApi.addOption({ 
        'value': data.coreEntity.id, 'text': data.coreEntity.displayName 
    });
    selApi.addItem(data.coreEntity.id);
}
/**
 * Removes the form container with the passed id, clears and enables the combobox,
 * and contextually enables to parent form's submit button. Calls the exit 
 * handler stored in the form's params object.
 */
export function exitForm(formId, fLvl, focus, onExit, data) {                                  //console.log("               --exitForm id = %s, fLvl = %s, exitHandler = %O", formId, fLvl, fP.forms[fLvl].exitHandler);      
    const exitFunc = onExit || fP.forms[fLvl].exitHandler;
    $(formId).remove();  
    _cmbx.resetFormCombobox(fLvl, focus);
    if (fLvl !== 'top') { ifParentFormValidEnableSubmit(fLvl); }
    if (exitFunc) { exitFunc(data); }
}



/** Shows a form-submit success message at the top of the interaction form. */
export function showSuccessMsg(msg, color) {
    const cntnr = _u.buildElem('div', { id: 'success' });
    const div = _u.buildElem('div', { class: 'flex-row' });
    const p = _u.buildElem('p', { text: msg });
    const bttn = getSuccessMsgExitBttn();
    div.append(p, bttn);
    cntnr.append(div);
    $(cntnr).css('border-color', color);
    $('#top-hdr').after(cntnr); 
    $(cntnr).fadeTo('400', .8);
}
function getSuccessMsgExitBttn() {
    const bttn = _u.buildElem('input', { 'id': 'sucess-exit', 
        'class': 'tbl-bttn exit-bttn', 'type': 'button', 'value': 'X' });
    $(bttn).click(exitSuccessMsg);
    return bttn;
}
function exitSuccessMsg() {
    $('#success').fadeTo('400', 0, () => $('#success').remove());
}