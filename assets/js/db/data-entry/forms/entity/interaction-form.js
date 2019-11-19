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
import * as _u from '../../../util.js';
import * as _forms from '../forms-main.js';
import * as _elems from '../ui/form-elems.js';
import * as form_ui from '../ui/form-ui.js';
import * as _cmbx from '../ui/combobox-util.js';
import * as db_forms from '../../db-forms.js';

let fP;
/** ====================== ALIAS HELPERS ==================================== */
// const _ui = _forms.ui;
const _combos = _forms.uiCombos;
const _panel = _forms.uiPanel;
const _mmry = _forms.memory;

/** ================ INIT INTERACTION FORM ================================== *//**
 * Fills the global fP obj with the basic form params @_forms.initFormMemory. 
 * Inits the interaction form with all fields displayed and the first field, 
 * publication, in focus. From within many of the fields the user can create 
 * new entities of the field-type by selecting the 'add...' option from the 
 * field's combobox and completing the appended sub-form.
 */
export function initNewInteractionForm() {                                             console.log('   //Building New Interaction Form');
    _forms.initFormMemory('create', 'interaction')
    .then(fP => _forms.getFormFields('interaction', fP))
    .then(fields => form_ui.buildAndAppendForm('top', fields))
    .then(() => form_ui.finishEntityFormBuild('interaction'))
    .then(form_ui.finishCreateFormBuild)
    .catch(err => _u.alertErr(err));
}
export function getComboboxEvents() {
    return {
        'CitationTitle': { add: false, change: onCitSelection },
        'Country-Region': { change: onCntryRegSelection },
        'InteractionType': { change: focusIntTypePin },
        'Location': { change: onLocSelection, add: _forms.getFormFunc('location', 'initLocForm')},
        'Publication': { change: _src.onPubSelection, add: _forms.getFormFunc('publication', 'initPubForm')},
        'Subject': { change: onSubjectSelection },
        'Object': { change: onObjectSelection },
    };
}
/** ==================== INIT FORM FIELDS =================================== */
/** Builds and returns all interaction-form elements. */
export function getIntFormFields(params) {                                      
    fP = params;                                                                console.log('       --buildIntFormFields. fP = %O', fP);
    const builders = [ _src.buildPubFieldRow, _src.buildCitFieldRow, buildCntryRegFieldRow,
        buildLocFieldRow, initSubjField, initObjField, buildIntTypeField,
        buildIntTagField, buildIntNoteField ];
    return Promise.all([...builders.map(buildField)]);
}
function buildField(builder) { 
    return Promise.resolve(builder(fP)).then(field => {
        ifSelectElemAddToComboboxInitAry(field); 
        return field;
    });                                                
}
function ifSelectElemAddToComboboxInitAry(field) {
    const fieldType = field.children[1].children[1].nodeName; 
    if (fieldType !== "SELECT") { return; }  
    const fieldName = field.id.split('_row')[0];
    fP.forms.top.selElems.push(fieldName);
}
/*------------------ Publication ---------------------------------------------*/
/**
 * Returns a form row with a publication select dropdown populated with all 
 * current publication titles.
 */
export function buildPubFieldRow(fP) {                                          console.log('       --buildPubFieldRow');
    return _forms.uiElems('getSrcOpts', ['pubSrcs', null, fP.records.source])
        .then(buildPubRow);
}
function buildPubRow(opts) {
    const attr = { id: 'Publication-sel', class: 'lrg-field' };
    const selElem = _forms.pgUtil('buildSelectElem', [opts, attr]);
    return _forms.uiElems('buildFormRow', ['Publication', selElem, 'top', true]);
}
/** 
 * When an existing publication is selected, the citation field is filled with 
 * all current citations for the publciation. When a publication is created, 
 * the citation form is automatically opened. 
 */
export function onPubSelection(val) {                                                  console.log('   --onPubSelection'); 
    if (val === 'create') { return _forms.createSubEntity('Publication'); }        
    if (val === '' || isNaN(parseInt(val)) ) { return onPubClear(); }                                
    const srcRcrds = _mmry('getEntityRcrds', ['source']); 
    fillCitationField(val);
    _panel('updateSrcDetails', ['pub']);
    if (!fP.records.source[val].children.length) { return _forms.newCitation(); }
    if (!fP.editing) { $('#Publication_pin').focus(); }
}
function onPubClear() {
    _combos('clearCombobox', ['#CitationTitle-sel']);
    _combos('enableCombobox', ['#CitationTitle-sel', false]);
    _panel('clearDetailPanel', ['pub']);
}
/** When the Citation sub-form is exited, the Publication combo is reenabled. */
function enablePubField() {
    _combos('enableCombobox', ['#Publication-sel']);
    fillCitationField($('#Publication-sel').val());
}
/*------------------ Citation ------------------------------------------------*/
/** Returns a form row with an empty citation select dropdown. */
export function buildCitFieldRow() {                                                   console.log('       --buildCitFieldRow');
    const attr = {id: 'CitationTitle-sel', class: 'lrg-field'};
    const selElem = _forms.pgUtil('buildSelectElem', [ [], attr]);
    return _elems.buildFormRow('CitationTitle', selElem, 'top', true);
}
/** Fills the citation combobox with all citations for the selected publication. */
function fillCitationField(pubId) {                                             //console.log("initCitSelect for publication = ", pubId);
    _cmbx.enableCombobox('#CitationTitle-sel');
    _cmbx.updateComboboxOptions('#CitationTitle-sel', getPubCitationOpts(pubId));
}
/** Returns an array of option objects with citations for this publication.  */
function getPubCitationOpts(pubId) {
    const pubRcrd = fP.records.source[pubId];  
    if (!pubRcrd) { return [{ value: 'create', text: 'Add a new Citation...'}]; }
    const opts = _elems.getRcrdOpts(pubRcrd.children, fP.records.source);
    opts.unshift({ value: 'create', text: 'Add a new Citation...'});
    return opts;
}
/** 
 * When a Citation is selected, both 'top' location fields are initialized
 * and the publication combobox is reenabled. 
 */    
export function onCitSelection(val) {                                                  console.log('       --onCitSelection [%s]', val);
    if (val === 'create') { return _forms.createSubEntity('Citation'); }
    if (val === '' || isNaN(parseInt(val))) { return _panel('clearDetailPanel', ['cit']); }                     //console.log("cit selection = ", parseInt(val));                          
    _panel('updateSrcDetails', ['cit']);
    _cmbx.enableCombobox('#Publication-sel');
    if (!fP.editing) { $('#CitationTitle_pin').focus(); }
}    
/*-------------- Country/Region ------------------------------------------*/
/** Returns a form row with a combobox populated with all countries and regions. */
function buildCntryRegFieldRow() {                                              console.log('       --buildCntryRegFieldRow');
    return getCntryRegOpts().then(buildCntryRegRow);
}
function buildCntryRegRow(opts) {
    const attr = {id: 'Country-Region-sel', class: 'lrg-field'};
    const selElem = _u.buildSelectElem(opts, attr);
    return _elems.buildFormRow('Country-Region', selElem, 'top', false);
}
/** Returns options for each country and region. */ 
function getCntryRegOpts() {
    const proms = ['countryNames', 'regionNames'].map(k => _u.getOptsFromStoredData(k));
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
    if ($('#loc-map').length) { db_forms.focusParentAndShowChildLocs('int', val); }    
}
/*------------------ Location ------------------------------------------------*/
/**
 * Returns a form row with a select dropdown populated with all available locations.
 */
function buildLocFieldRow() {                                                   console.log('       --buildLocFieldRow');
    const locOpts = getLocationOpts();                                          //console.log("locOpts = %O", locOpts);
    const selElem = _u.buildSelectElem(
        locOpts, {id: "Location-sel", class: "lrg-field"});
    return _elems.buildFormRow("Location", selElem, "top", false);
}
/** Returns an array of option objects with all unique locations.  */
function getLocationOpts() {
    let opts = [];
    for (var id in fP.records.location) {
        opts.push({ 
            value: id, text: fP.records.location[id].displayName });
    }
    opts = opts.sort(_u.alphaOptionObjs);
    opts.unshift({ value: 'create', text: 'Add a new Location...'});
    return opts;
}
/**
 * When a country/region is selected, the location combobox is repopulated with its 
 * child-locations and all habitat types. When cleared, the combobox is 
 * repopulated with all locations. 
 */ 
function fillLocationSelect(loc) {                                              //console.log("fillLocationSelect for parent Loc = %O", loc);
    var opts = loc ? getOptsForLoc(loc) : getLocationOpts();    
    _cmbx.updateComboboxOptions('#Location-sel', opts);
}          
/** Returns an array of options for the locations of the passed country/region. */
function getOptsForLoc(loc) {
    let opts = loc.children.map(id => ({
        value: id, text: fP.records.location[id].displayName}));
    opts = opts.concat([{ value: loc.id, text: loc.displayName }])
        .sort(_u.alphaOptionObjs);
    opts.unshift({ value: 'create', text: 'Add a new Location...'});
    return opts;
}
/** 
 * When a location is selected, its country/region is selected in the top-form
 * combobox and the location record's data is added to the detail panel. If 
 * the location was cleared, the detail panel is cleared. 
 */     
function onLocSelection(val) {                                                  console.log('           --onLocSelection [%s]', val);
    if (val === 'create') { return _forms.createSubEntity('Location'); }
    if (val === '' || isNaN(parseInt(val))) { return _panel('clearDetailPanel', ['loc']); }   
    if ($('#loc-map').length) { removeLocMap(); }
    const locRcrd = _mmry('getEntityRcrds', ['location'])[val];         //console.log("location = %O", locRcrd);
    const prntVal = locRcrd.parent ? locRcrd.parent : locRcrd.id;
    _cmbx.setSelVal('#Country-Region-sel', prntVal, 'silent');
    _forms.uiPanel('fillLocDataInDetailPanel', locRcrd);
    if (!fP.editing) { $('#Location_pin').focus(); }
    _elems.checkIntFieldsAndEnableSubmit();
}
function removeLocMap() {
    $('#loc-map').fadeTo(400, 0, () => $('#loc-map').remove());
}
export function selectLoc(id) {
    $('#sub-form').remove();
    _cmbx.setSelVal('#Location-sel', id);
    enableCountryRegionField();
    _cmbx.enableCombobox('#Location-sel');
    removeLocMap();
}
/** When the Location sub-form is exited, the Country/Region combo is reenabled. */
export function enableCountryRegionField() {  
    _cmbx.enableCombobox('#Country-Region-sel');
    $('#loc-note').fadeTo(400, 1);
}
/*--------------------- Taxon ------------------------------------------------*/
/** Builds the Subject combobox that will trigger the select form @initSubjectSelect. */
function initSubjField() {                                                      console.log('       --initSubjField');
    var subjElem = _u.buildSelectElem([], {id: "Subject-sel", class: "lrg-field"});
    return _elems.buildFormRow("Subject", subjElem, "top", true);
}
/** Builds the Object combobox that will trigger the select form @initObjectSelect. */
function initObjField() {                                                       console.log('       --initObjField');
    var objElem =  _u.buildSelectElem([], {id: "Object-sel", class: "lrg-field"});
    return _elems.buildFormRow("Object", objElem, "top", true);
}
/**
 * Shows a sub-form to 'Select Subject' of the interaction with a combobox for
 * each level present in the Bat realm, (Family, Genus, and Species), filled 
 * with the taxa at that level. When one is selected, the remaining boxes
 * are repopulated with related taxa and the 'select' button is enabled.
 */
export function initSubjectSelect() {                                                  console.log('       --initSubjectSelect [%s]?', $('#Subject-sel').val());
    const fLvl = _forms.getSubFormLvl('sub');
    if ($('#'+fLvl+'-form').length !== 0) { return errIfAnotherSubFormOpen('Subject', fLvl); }  
    return db_forms.initTaxonParams('Subject', 'Bat')
    .then(initSubjForm)
    .then(appendSubjFormAndFinishBuild);

    function initSubjForm() {
        return initEntitySubForm('subject', fLvl, 'sml-sub-form', {}, '#Subject-sel');
    }
    function appendSubjFormAndFinishBuild(form) {
        $('#Subject_row').append(form);
        _cmbx.initFormCombos('subject', fLvl, fP.forms[fLvl].selElems);           
        _forms.finishTaxonSelectUi('Subject');  
        _cmbx.enableCombobox('#Object-sel', false);
    }
}
/**
 * Shows a sub-form to 'Select Object' of the interaction with a combobox for
 * each level present in the selected Object realm, plant (default) or arthropod, 
 * filled with the taxa at that level. When one is selected, the remaining boxes
 * are repopulated with related taxa and the 'select' button is enabled. 
 * Note: The selected realm's level combos are built @onRealmSelection. 
 */
export function initObjectSelect() {                                                   console.log('       --initObjectSelect [%s]?', $('#Object-sel').val());
    const fLvl = _forms.getSubFormLvl('sub');
    if ($('#'+fLvl+'-form').length !== 0) { return errIfAnotherSubFormOpen('Object', fLvl); }
    const realmName = getSelectedObjectRealm($('#Object-sel').val()); 
    return db_forms.initTaxonParams('Object', realmName)
    .then(initObjForm)
    .then(appendObjFormAndFinishBuild);

    function initObjForm() {
        return _forms.initEntitySubForm('object', fLvl, 'sml-sub-form', {}, '#Object-sel');
    }
    function appendObjFormAndFinishBuild(form) {
        $('#Object_row').append(form);
        _cmbx.initFormCombos('object', fLvl, fP.forms[fLvl].selElems);             
        _cmbx.setSelVal('#Realm-sel', fP.forms.taxonPs.realmTaxon.realm.id, 'silent');
        _cmbx.enableCombobox('#Subject-sel', false);
        return onRealmSelection(fP.forms.taxonPs.realmTaxon.realm.id);
    }
} 
/** Returns the realm taxon's lower-case name for a selected object taxon. */
function getSelectedObjectRealm(id) {                                       
    if (!id) { return db_forms.getObjectRealm(); }
    return fP.records.taxon[id].realm.displayName;
}
/** Note: Taxon fields often fire their focus event twice. */
function errIfAnotherSubFormOpen(role, fLvl) {
    if (fP.forms[fLvl].entity === _u.lcfirst(role)) { return; }
    _errs.openSubFormErr(role, null, fLvl);
}
/**
 * When complete, the 'Select Subject' form is removed and the most specific 
 * taxonomic data is displayed in the interaction-form Subject combobox. 
 */
function onSubjectSelection(val) {                                              //console.log("subject selected = ", val);
    if (val === "" || isNaN(parseInt(val))) { return; }         
    $('#'+_forms.getSubFormLvl('sub')+'-form').remove();
    enableTaxonCombos();
    if (!fP.editing) { $('#Subject_pin').focus(); }
}
/**
 * When complete, the 'Select Object' form is removed and the most specific 
 * taxonomic data is displayed in the interaction-form Object combobox. 
 */
function onObjectSelection(val) {                                               //console.log("object selected = ", val);
    if (val === "" || isNaN(parseInt(val))) { return; } 
    $('#'+_forms.getSubFormLvl('sub')+'-form').remove();
    enableTaxonCombos();
    if (!fP.editing) { $('#Object_pin').focus(); }
}
export function enableTaxonCombos() {
    _cmbx.enableCombobox('#Subject-sel');
    _cmbx.enableCombobox('#Object-sel');
}
/*-------------- Interaction Detail Fields -------------------------------*/
function buildIntTypeField() {                                                  console.log('       --buildIntTypeField');
    return _u.getOptsFromStoredData('intTypeNames')
    .then(buildIntTypeRow);
}
function buildIntTypeRow(opts) {
    const attr = {id: 'InteractionType-sel', class: 'lrg-field'};
    const field = _u.buildSelectElem(opts, attr);
    return _elems.buildFormRow('InteractionType', field, 'top', true);
}
function focusIntTypePin() {
    if (!fP.editing) { $('#InteractionType_pin').focus(); }
}
function buildIntTagField() {                                                   console.log('       --buildIntTagField');
    return _elems.buildTagField('interaction', 'InteractionTags', 'top')
        .then(buildTagRow);
}
function buildTagRow(field) {
    field.className = 'lrg-field';
    $(field).change(_elems.checkIntFieldsAndEnableSubmit);
    return _elems.buildFormRow('InteractionTags', field, 'top', false);
}
function buildIntNoteField() {                                                  console.log('       --buildIntNoteField');
    const txtElem = _elems.buildLongTextArea('interaction', 'Note', 'top');
    $(txtElem).change(_elems.checkIntFieldsAndEnableSubmit);
    return _elems.buildFormRow('Note', txtElem, 'top', false);
}
/** =================== ON FORM INIT COMPLETE =============================== */
export function onInitComplete() {
    _forms.setOnSubmitSuccessHandler('top', resetInteractionForm);
    ['Subject', 'Object'].forEach(addTaxonFocusListener);
    addReqElemsToConfg();    
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
    db_forms.showSuccessMsg('New Interaction successfully created.', 'green');
    _forms.initFormMemory('create', 'interaction')
    .then(resetFormUi);

    function resetFormUi() {
        resetIntFields(vals); 
        $('#top-cancel').val(' Close ');  
        db_forms.toggleSubmitBttn("#top-submit", false);
        _forms.memory('setFormMemory', ['top', 'unchanged', true]);
    }
}
/** Returns an obj with the form fields and either their pinned values or false. */
function getPinnedFieldVals() {
    const pins = $('form[name="top"] [id$="_pin"]').toArray();                  //console.log("pins = %O", pins);
    const vals = {};
    pins.forEach(function(pin) {  
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
    db_forms.toggleSubmitBttn("#top-submit", false);
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
}
function fillPubDetailsIfPinned(pub) {
    if (pub) { _forms.uiPanel('updateSrcDetails', ['pub']); 
    } else { _forms.uiCombos('enableCombobox', ['#CitationTitle-sel', false]); }
}
/** Inits the necessary interaction form params after form reset. */
function initInteractionParams() {
    _forms.initEntityFormMemory("interaction", "top", null,"create");
    addReqElemsToConfg();
}
function addReqElemsToConfg() {
    const reqFields = ["Publication", "CitationTitle", "Subject", "Object", 
        "InteractionType"];
    const elems = reqFields.map(field => $('#'+field+'-sel')[0]);
    _forms.memory('setFormMemory', ['top', 'reqElems', elems]);
}