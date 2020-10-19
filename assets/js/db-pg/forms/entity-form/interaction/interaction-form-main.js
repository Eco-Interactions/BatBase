/**
 * Contains code specific to the interaction form.
 *
 * EXPORTS:
 *     checkIntFieldsAndEnableSubmit
 *     focusPinAndEnableSubmitIfFormValid
 *     initCreateForm
 *     getSelectedTaxon
 *     onRankSelection
 *     onSubGroupSelection
 *
 * TOC
 *     CREATE FORM
 *         RESET CREATE FORM AFTER SUBMIT
 *     EDIT FORM
 *     ON FORM INIT COMPLETE
 *         REFERENCE GUIDE BUTTON
 *         LOCATION OPTIONS NOTE
 *         FORM COMBOBOXES
 *     FORM FIELD HANDLERS
 *         PUBLICATION
 *         CITATION
 *         COUNTRY/REGION
 *         LOCATION
 *         TAXON ROLES
 *             INIT
 *             onGroupSelection
 *             onRankSelection
 *             selectRoleTaxon
 *     HELPERS
 */
import { _modal, _u } from '../../../db-main.js';
import { _confg, _state, _elems, _panel, _cmbx, _form, _val, submitForm, getSubFormLvl } from '../../forms-main.js';
import referenceGuide from '../../../../../files/form-reference-guide.pdf';


import * as fields from './fields/int-fields-main.js';

/** ====================== CREATE FORM ====================================== */
/**
 * Inits the interaction form with all fields displayed and the first field,
 * publication, in focus. From within many of the fields the user can create
 * new entities of the field-type by selecting the 'add...' option from the
 * field's combobox and completing the appended sub-form.
 */
export function initCreateForm(entity) {                                        console.log('   //Building New Interaction Form');
    if (_state('getFormState')) { return; } //Form is already opened.
    return _state('initFormState', ['create', 'interaction'])
    .then(getInteractionFormFields)
    .then(fields => _elems('buildAndAppendForm', [fields]))
    .then(finishInteractionFormBuild)
    .then(addConfirmationBeforeSubmit)
    .then(() => _state('setOnFormCloseHandler', ['top', resetInteractionForm]));
}
/** Builds and returns all interaction-form elements. */
function getInteractionFormFields() {
    return _elems('getFormFieldRows', ['Interaction', {}, 'top']);
}
/** ------------- RESET CREATE FORM AFTER SUBMIT ---------------------------- */
/**
 * Resets the interactions form leaving only the pinned values. Displays a
 * success message. Disables submit button until any field is changed.
 */
function resetInteractionForm() {
    const vals = getPinnedFieldVals();                                          //console.log("vals = %O", vals);
    _elems('showSuccessMsg', ['New Interaction successfully created.']);
    resetIntFields(vals);
    resetFormUi();
    _state('setOnFormCloseHandler', ['top', resetInteractionForm]);
}
function resetFormUi() {
    $('#top-cancel').val(' Close ');
    _elems('toggleSubmitBttn', ['#top-submit', false]);
    _state('setFormProp', ['top', 'unchanged', true]);
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
}
/* -------------------- CLEAR/PERSIST FIELD DATA --------------- */
/**
 * Resets the top-form in preparation for another entry. Pinned field values are
 * persisted. All other fields will be reset.
 */
function resetIntFields(vals) {                                                 //console.log('           --resetIntFields. vals = %O', vals);
    _elems('toggleSubmitBttn', ['#top-submit', false]);
    handleFieldDataReset(vals);
}
function handleFieldDataReset(vals) {
    const persisted = [];
    handleFieldClearing();
    handlePersistedFields();

    function handleFieldClearing() {
        for (let field in vals) {                                               //console.log("field %s val %s", field, vals[field]);
            if (!vals[field]) { clearField(field, vals);
            } else { persisted.push(field); }
        }
    }
    function handlePersistedFields() {
        persisted.forEach(f => handePersistedField(f, vals[f]));
    }
}
/* ----------------- CLEAR FIELD DATA --------------- */
function clearField(field, vals) {
    _state('setFormFieldData', ['top', field, null]);
    if (field === 'Note') { return $('#Note-txt').val(""); }
    _panel('clearFieldDetails', [field]);
    _cmbx('clearCombobox', ['#'+field+'-sel']);
    handleClearedField(field, vals);
}
function handleClearedField(field, vals) {
    const map = {
        'Location': syncWithCountryField.bind(null, vals['Country-Region']),
        'Subject': clearTaxonField,
        'Object': clearTaxonField,
        'Publication': fields.onPubClear
    }
    if (!map[field]) { return; }
    map[field](field);
}
function clearTaxonField(field) {
    if (['Subject', 'Object'].indexOf(field) === -1) { return; }
    _cmbx('updateComboboxOptions', ['#'+field+'-sel', []]);
    $('#'+field+'-sel').data('selTaxon', false);
}
function syncWithCountryField(cntryId, field) {
    const cntry = cntryId ? getRcrd('location', cntryId) : null;
    fields.fillLocCombo(cntry);
}
/* ----------------- PERSIST FIELD DATA --------------- */
function handePersistedField(field, data) {
    const map = {
        'Publication': fillPubDetails,
        'InteractionType': setFieldInitVal,
        'InteractionTags': setFieldInitVal
    }
    if (!map[field]) { return; }
    map[field](field, data);
}
function fillPubDetails(pub) {
    if (pub) { _panel('updateSrcDetails', ['pub']);
    } else { _cmbx('enableCombobox', ['#CitationTitle-sel', false]); }
}
function setFieldInitVal(field, data) {
    $(`#${field}-sel`).data('init-val', data);
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
    $('#Subject-lbl').text('Subject (Bat)');
    _elems('setCoreRowStyles', ['#form-main', '.top-row']);
    addReferenceGuideButton();
}
/* ----------------------- REFERENCE GUIDE BUTTON --------------------------- */
function addReferenceGuideButton() {
    const attr = { class: 'ag-fresh', type: 'button', value: 'Reference Guide' };
    const bttn = _u('buildElem', ['input', attr]);
    $(bttn).click(openReferenceGuideInNewTab);
    $('#top-help').prepend(bttn);
}
function openReferenceGuideInNewTab() {
    return window.open(referenceGuide,'_blank');
}
/* ---------------------- LOCATION OPTIONS NOTE ----------------------------- */
/** Adds a message above the location fields in interaction forms. */
function addLocationSelectionMethodsNote() {
    const cntnr = _u('buildElem', ['div', {id: 'loc-note', class: 'skipFormData'}]);
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
    const span = _u('buildElem', ['span', attr]);
    $(span).click(showInteractionFormMap);
    return span;
}
/** Open popup with the map interface for location selection. */
function showInteractionFormMap() {                                             //console.log('showInteractionFormMap')
    if ($('#form-map').length) { return; }
    const pElem = $('#Location_row')[0].parentNode;
    _form('addMapToLocForm', ['int', $(pElem)]);
    if (_cmbx('getSelVal', ['#Country-Region-sel'])) { return; }
    _cmbx('focusCombobox', ['#Country-Region-sel', true]);
}
/* -------------------------- FORM COMBOBOXES ------------------------------- */
function finishComboboxInit() {
    initFormCombos('interaction', 'top');
    _cmbx('enableCombobox', ['#CitationTitle-sel', false]);
    ['Subject', 'Object'].forEach(addTaxonFocusListener);
    _cmbx('enableCombobox', ['#InteractionType-sel', false]);
    _cmbx('enableCombobox', ['#InteractionTags-sel', false]);
    focusPubFieldIfNewRecord();
}
/** Inits comboboxes for the interaction form and the Subject/Object select forms. */
export function initFormCombos(entity, fLvl) {
    const events = getEntityComboEvents(entity);
    _cmbx('initFormCombos', [entity, fLvl, events]);
}
/** Note: 'subject', 'object', and 'group' are passed for taxon. */
function getEntityComboEvents(entity) {
    const events = {
        'interaction': {
            'CitationTitle': { change: fields.onCitSelection, add: create('citation', 'sub') },
            'Country-Region': { change: fields.onCntryRegSelection },
            'InteractionType': { change: fields.onTypeSelectionInitTagField },
            'InteractionTags': { change: fields.onTagSelection },
            'Location': { change: fields.onLocSelection, add: create('location', 'sub')},
            'Publication': { change: fields.onPubSelection, add: create('publication', 'sub')},
            'Subject': { change: fields.onTaxonRoleSelection.bind(null, 'Subject') },
            'Object': { change: fields.onTaxonRoleSelection.bind(null, 'Object') },
        },
        'taxon': {
            'Class': { change: onRankSelection, add: create('class') },
            'Family': { change: onRankSelection, add: create('family') },
            'Genus': { change: onRankSelection, add: create('genus') },
            'Order': { change: onRankSelection, add: create('order') },
            'Group': { change: fields.onGroupSelection },
            'Sub-Group': { change: fields.onSubGroupSelection },
            'Species': { change: onRankSelection, add: create('species') },
        }
    };
    return events[entity] || events.taxon;
}
function create(entity, fLvl) {
    return createSubEntity.bind(null, entity, fLvl);
}
function createTaxon(rank) {
    return (val) => {
        createSubEntity(null, rank, 'sub2')
        .then(() => _state('setOnFormCloseHandler', ['sub2', enableTaxonRanks]))
        .then(() => enableTaxonRanks(false));
    }
}
export function onRankSelection() {
    fields.onRankSelection.bind(this)(...arguments);
}
export function initTypeField() {
    return fields.initTypeField(...arguments);
}
export function createSubEntity(entity, fLvl, val) {
    if (ifFormAlreadyOpenAtLevel(fLvl)) { return throwAndCatchSubFormErr(entity, fLvl); }
    _form('createEntity', [entity, val]);
}
export function ifFormAlreadyOpenAtLevel(fLvl) {
    return fLvl ? $('#'+fLvl+'-form').length !== 0 : false;
}
function focusPubFieldIfNewRecord() {
    const action = _state('getFormProp', ['top', 'action']);
    _cmbx('focusCombobox', ['#Publication-sel', action === 'create']);
}
function openSubFormErr(ent, fLvl) {
    const entity = ent === 'citation' ? 'citationTitle' : ent;
    const ucEntity = _u('ucfirst', [entity]);
    _val('openSubFormErr', [ucEntity, null, fLvl]);
    return Promise.reject();
}
export function throwAndCatchSubFormErr(entity, fLvl) {
    openSubFormErr(entity, fLvl)
    .catch(() => {});
}
/** Displays the [Role] Taxon select form when the field gains focus. */
function addTaxonFocusListener(role) {
    const elem = '#'+role+'-sel + div div.selectize-input';
    const showSelectForm = role === 'Object' ? fields.initObjectSelect : fields.initSubjectSelect;
    $('#form-main').on('focus', elem, showSelectForm);
}
/* -------------------- SUBMIT CONFIRMATION MODAL --------------------------- */
function addConfirmationBeforeSubmit() {
    $('#top-submit').off('click').click(showSubmitModal);
}
function showSubmitModal() {
    const modalConfg = {
        html: buildConfirmationModalHtml(),
        selector: '#top-submit',
        dir: 'left',
        submit: submitForm.bind(null, '#top-form', 'top', 'interaction'),
        bttn: 'SUBMIT INTERACTION'
    };
    _modal('showSaveModal', [ modalConfg ]);
    $('#top-submit').css({'opacity': .5, cursor: 'not-allowed'})
    window.setTimeout(() => $('.modal-msg').css({width: 'max-content'}), 500);
}
function buildConfirmationModalHtml() {
    const subj = $('#Subject-sel')[0].innerText;
    const obj = $('#Object-sel')[0].innerText;
    const typeVerb = getIntTypeVerbForm(_cmbx('getSelVal', ['#InteractionType-sel']));
    return `${subj} <i><b>${typeVerb}</b></i> ${obj}`;
}
function getIntTypeVerbForm(typeId) {
    const types = _state('getEntityRcrds', ['interactionType']);
    return types[typeId].activeForm;
}
/** ====================== FORM FIELD HANDLERS ============================== */
// /*------------------ CITATION ------------------------------------------------*/
// * Fills the citation combobox with all citations for the selected publication.
export function fillCitationCombo() {
    return fields.fillCitationCombo(...arguments);
}
/*------------------ LOCATION ------------------------------------------------*/
export function selectLoc() {
    return fields.selectLoc(...arguments);
}
/** When the Location sub-form is exited, the Country/Region combo is reenabled. */
export function enableCountryRegionField() {
    return fields.enableCountryRegionField(...arguments);
}
/*--------------------- TAXON ROLES ------------------------------------------*/
export function getSelectedTaxon() {
    return fields.getSelectedTaxon(...arguments);
}
export function onSubGroupSelection() {
    return fields.onSubGroupSelection(...arguments);
}
/* ========================== HELPERS ======================================= */
export function focusPinAndEnableSubmitIfFormValid(field) {
    const editing = _state('getFormProp', ['top', 'action']) === 'edit';
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
export function checkIntFieldsAndEnableSubmit() {
    _elems('checkReqFieldsAndToggleSubmitBttn', ['top']);
    resetIfFormWaitingOnChanges(); //After interaction form submit, the submit button is disabled until form data changes
}
/**
 * After an interaction is created, the form can not be submitted until changes
 * are made. This removes the change listeners from non-required elems and the
 * flag tracking the state of the new interaction form.
 */
function resetIfFormWaitingOnChanges() {
    if (!_state('getFormProp', ['top', 'unchanged'])) { return; }
    _elems('exitSuccessMsg');
    _state('setFormProp', ['top', 'unchanged', false]);
}
export function getRcrd(entity, id) {
    return _state('getRcrd', [entity, id]) || false;
}
export function getRcrds(entity) {
    return _state('getEntityRcrds', [entity]);
}
/* -------------------- MODULE INTERNAL USE --------------------------------- */

export function getTaxonData(prop) {
    return prop ? _state('getTaxonProp', [prop]) : _state('getGroupState');
}