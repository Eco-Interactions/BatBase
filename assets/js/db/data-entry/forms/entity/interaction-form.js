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
// import * as _elems from '../ui/form-elems.js';
// import * as form_ui from '../ui/form-ui.js';
// import * as _cmbx from '../ui/combobox-util.js';
import * as db_forms from '../../db-forms.js';

let fP;
/** ====================== ALIAS HELPERS ==================================== */
// const _ui = _forms.ui;
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
export function getComboEvents() {
    return {
        'CitationTitle': { change: onCitSelection, add: _forms.create.bind(null, 'citation') },
        'Country-Region': { change: onCntryRegSelection },
        'InteractionType': { change: focusIntTypePin },
        'Location': { change: onLocSelection, add: _forms.create.bind(null, 'location')},
        'Publication': { change: onPubSelection, add: _forms.create.bind(null, 'publication')},
        'Subject': { change: onTaxonSelection.bind(null, 'Subject') },
        'Object': { change: onTaxonSelection.bind(null, 'Object') },
    };
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
    return Promise.resolve(builder(fP)).then(field => {
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
    if ($('#loc-map').length) { db_forms.focusParentAndShowChildLocs('int', val); }    
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
        value: id, text: fP.records.location[id].displayName }));
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
export function initSubjectSelect() {                                                  console.log('       --initSubjectSelect [%s]?', $('#Subject-sel').val());
    const fLvl = _forms.getSubFormLvl('sub');
    if ($('#'+fLvl+'-form').length !== 0) { return errIfSubFormOpen('Subject', fLvl); }  
    return getTaxonSelectForm('Subject', 'Bat', fLvl)
        .then(form => appendTxnFormAndInitCombos('Subject', fLvl, form))
        .then(() => finishTaxonSelectUi('Subject'));
}
/** Note: The selected realm's level combos are built @onRealmSelection. */
export function initObjectSelect() {                                                   console.log('       --initObjectSelect [%s]?', $('#Object-sel').val());
    const fLvl = _forms.getSubFormLvl('sub');
    if ($('#'+fLvl+'-form').length !== 0) { return errIfSubFormOpen('Object', fLvl); }
    const realmName = getSelectedObjectRealm($('#Object-sel').val()); 
    return getTaxonSelectForm('Object', realmName, fLvl)
        .then(form => appendTxnFormAndInitCombos('Object', fLvl, form))
        .then(buildRealmFields);

    function buildRealmFields() {    
        const realmId = _mmry('getTaxonProp', realmTaxon).realm.id;       
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
/** Note: Taxon fields often fire their focus event twice. */
function errIfSubFormOpen(role, fLvl) {
    if (fP.forms[fLvl].entity === _u.lcfirst(role)) { return; }
    _errs('openSubFormErr', [role, null, fLvl]);
}
/**
 * Shows a sub-form to 'Select <Role>' of the interaction with a combobox for
 * each level present in the realm, (eg: Bat - Family, Genus, and Species), filled 
 * with the taxa at that level. When one is selected, the remaining boxes
 * are repopulated with related taxa and the 'select' button is enabled.
 */
function getTaxonSelectForm(role, realm, fLvl) {
    const lcRole = _u('lcfirst', [role]);
    const formParams = [lcRole, fLvl, 'sml-sub-form', {}, '#'+role+'-sel'];
    return _forms.buildTaxonSelectForm(role, realm, fLvl);
}
function appendTxnFormAndInitCombos(role, fLvl, form) {
    const lcRole = _u('lcfirst', [role]);
    $('#'+role+'_row').append(form);
    _cmbx('initFormCombos', [lcRole, fLvl]);           
    _forms.finishTaxonSelectUi(role);  
}
/**
 * When complete, the select form is removed and the most specific taxon is displayed 
 * in the interaction-form <role> combobox. 
 */
function onTaxonSelection(role, val) {                                          //console.log("onTaxonSelection [%s] = ", role, val);
    if (val === "" || isNaN(parseInt(val))) { return; }         
    $('#'+_forms.getSubFormLvl('sub')+'-form').remove();
    enableTaxonCombos();
    if (!fP.editing) { $('#'+role+'_pin').focus(); }
}
export function enableTaxonCombos() {
    _cmbx.enableCombobox('#Subject-sel');
    _cmbx.enableCombobox('#Object-sel');
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
    _mmry('setOnSubmitSuccessHandler', ['top', resetInteractionForm]);
}
function modifyFormDisplay() {
    $('#top-cancel').unbind('click').click(_forms.exitFormPopup);
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
    db_forms.addMapToLocForm('#Location_row', 'int');
    if (_cmbx('getSelVal', ['#Country-Region-sel'])) { return; }
    _cmbx('focusCombobox', ['#Country-Region-sel', true]);
}
function finishComboboxInit() {
    _cmbx('initFormCombos', ['interaction', 'top']);
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
        db_forms.toggleSubmitBttn('#top-submit', false);
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
    if (_elems('ifAllRequiredFieldsFilled', ['top'])) { db_forms.toggleSubmitBttn('#top-submit', true); }
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