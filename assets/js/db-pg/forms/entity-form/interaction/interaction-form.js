/**
 * Contains code specific to the interaction form.
 *
 * EXPORTS:
 *     checkIntFieldsAndEnableSubmit
 *     focusPinAndEnableSubmitIfFormValid
 *     initCreateForm
 *     getSelectedTaxon
 *     onRankSelection
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
 *             SUBJECT
 *             OBJECT
 *             ROLE SHARED HELPERS
 *                 initTaxonSelectForm
 *                 resetTaxonSelectForm
 *                 onRankSelection
 *                 selectRoleTaxon
 *         INTERACTION TYPE & TAGS
 *     HELPERS
 */
import { _modal, _u } from '../../../db-main.js';
import { _confg, _state, _elems, _panel, _cmbx, _form, _val, submitForm, getSubFormLvl } from '../../forms-main.js';
import { initTypeField, onTagSelection, onTypeSelectionInitTagField } from './int-type-tag-fields.js';
import referenceGuide from '../../../../../files/form-reference-guide.pdf';

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
        'Object': clearTaxonField
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
    fillLocationSelect(cntry);
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
            'CitationTitle': { change: onCitSelection, add: create('citation', 'sub') },
            'Country-Region': { change: onCntryRegSelection },
            'InteractionType': { change: onTypeSelectionInitTagField },
            'InteractionTags': { change: onTagSelection },
            'Location': { change: onLocSelection, add: create('location', 'sub')},
            'Publication': { change: onPubSelection, add: create('publication', 'sub')},
            'Subject': { change: onTaxonRoleSelection.bind(null, 'Subject') },
            'Object': { change: onTaxonRoleSelection.bind(null, 'Object') },
        },
        'taxon': {
            'Class': { change: onRankSelection, add: create('class') },
            'Family': { change: onRankSelection, add: create('family') },
            'Genus': { change: onRankSelection, add: create('genus') },
            'Order': { change: onRankSelection, add: create('order') },
            'Group': { change: onGroupSelection },
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
function createSubEntity(entity, fLvl, val) {
    if (ifFormAlreadyOpenAtLevel(fLvl)) { return throwAndCatchSubFormErr(entity, fLvl); }
    _form('createEntity', [entity, val]);
}
function ifFormAlreadyOpenAtLevel(fLvl) {
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
        bttn: 'Submit Interaction'
    };
    _modal('showSaveModal', [ modalConfg ]);
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
    _panel('updateSrcDetails', ['pub']);
    if (!hasCitation(val)) { return createSubEntity('citation', 'sub'); }
    focusPinAndEnableSubmitIfFormValid('Publication');
}
function hasCitation(val) {
    const pub = getRcrd('source', val);
    return pub ? pub.children.length : null; //If no pub found, the issue was alerted to developer and editor
}
function onPubClear() {
    _cmbx('clearCombobox', ['#CitationTitle-sel']);
    _cmbx('enableCombobox', ['#CitationTitle-sel', false]);
    _panel('clearDetailPanel', ['pub']);
}
/*------------------ CITATION ------------------------------------------------*/
/** Fills the citation combobox with all citations for the selected publication. */
export function fillCitationField(pubId) {
    _cmbx('enableCombobox', ['#CitationTitle-sel']);
    _cmbx('updateComboboxOptions', ['#CitationTitle-sel', getPubCitationOpts(pubId)]);
}
/** Returns an array of option objects with citations for this publication.  */
function getPubCitationOpts(pubId) {
    const pubRcrd = getRcrd('source', pubId);
    if (!pubRcrd) { return [{ value: 'create', text: 'Add a new Citation...'}]; }
    const opts = _cmbx('getRcrdOpts', [pubRcrd.children, getRcrds('source')]);
    opts.unshift({ value: 'create', text: 'Add a new Citation...'});
    return opts;
}
/**
 * When a Citation is selected, both 'top' location fields are initialized
 * and the publication combobox is reenabled.
 */
function onCitSelection(val) {                                                  console.log('       +--onCitSelection [%s]', val);
    if (val === 'create') { return createSubEntity('citation', 'sub'); }
    if (val === '' || isNaN(parseInt(val))) { return _panel('clearDetailPanel', ['cit']); }
    _panel('updateSrcDetails', ['cit']);
    _cmbx('enableCombobox', ['#Publication-sel']);
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
    _form('focusParentAndShowChildLocs', ['int', val]);
}
/*------------------ LOCATION ------------------------------------------------*/
/**
 * When a country/region is selected, the location combobox is repopulated with its
 * child-locations and all habitat types. When cleared, the combobox is
 * repopulated with all locations.
 */
function fillLocationSelect(loc) {
    const opts = loc ? getOptsForLoc(loc) : _cmbx('getLocationOpts');
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
    return children.map(id => {
        const loc = getRcrd('location', id);  //error alerted to developer and editor
        return loc ? { value: id, text: loc.displayName } : null
    }).filter(l => l);
}
export function selectLoc(id) {
    $('#sub-form').remove();
    _cmbx('setSelVal', ['#Location-sel', id]);
    enableCountryRegionField();
    _cmbx('enableCombobox', ['#Location-sel']);
}
/** When the Location sub-form is exited, the Country/Region combo is reenabled. */
export function enableCountryRegionField() {
    _cmbx('enableCombobox', ['#Country-Region-sel']);
    $('#loc-note').fadeTo(400, 1);
}
/**
 * When a location is selected, its country/region is selected in the top-form
 * combobox and the location record's data is added to the detail panel. If
 * the location was cleared, the detail panel is cleared.
 */
function onLocSelection(val) {                                                  console.log('       +--onLocSelection [%s]', val);
    if (val === 'create') { return createSubEntity('location', 'sub'); }
    if (val === '' || isNaN(parseInt(val))) { return _panel('clearDetailPanel', ['loc']); }
    if ($('#form-map').length) { removeLocMap(); }
    const locRcrd = getRcrd('location', val);
    if (!locRcrd) { return; } //error alerted to developer and editor
    const prntVal = locRcrd.parent ? locRcrd.parent : locRcrd.id;
    _cmbx('setSelVal', ['#Country-Region-sel', prntVal, 'silent']);
    _panel('fillLocDataInDetailPanel', [locRcrd]);
    focusPinAndEnableSubmitIfFormValid('Location');
}
function removeLocMap() {
    $('#form-map').fadeTo(400, 0, () => $('#form-map').remove());
}
/*--------------------- TAXON ROLES ------------------------------------------*/
/* -------------- SUBJECT ---------------------- */
/**
 * Shows a sub-form to 'Select <Role>' of the interaction with a combobox for
 * each rank present in the group, (eg: Bat - Family, Genus, and Species), filled
 * with the taxa at that rank. When one is selected, the remaining boxes
 * are repopulated with related taxa and the 'select' button is enabled.
 */
function initSubjectSelect() {                                                  console.log('       +--initSubjectSelect (selected ? [%s])', $('#Subject-sel').val());
    initTaxonSelectForm('Subject', 1);
}
/* -------------- OBJECT ---------------------- */
/** Note: The selected group's rank combos are built @onGroupSelection. */
function initObjectSelect() {                                                   console.log('       +--initObjectSelect (selected ? [%s])', $('#Object-sel').val());
    initTaxonSelectForm('Object', getObjectGroup())
    .then(ifNoSubGroupsRemoveCombo);
}
function getObjectGroup(prop = 'id') {
    const prevSelectedId = $('#Object-sel').data('selTaxon');
    if (!prevSelectedId) { return 2; } //default: Plants (2)
    return getRcrd('taxon', prevSelectedId).group[prop];
}
/**
 * Removes any previous group comboboxes. Shows a combobox for each rank present
 * in the selected Taxon group filled with the taxa at that rank.
 */
function onGroupSelection(val) {                                                //console.log("               --onGroupSelection. val = ", val)
    if (val === '' || isNaN(parseInt(val))) { return; }
    clearPreviousGroupRankCombos();
    _state('initGroupState', ['Object', val])
    .then(buildAndAppendGroupRows);
    /** A row for each rank present in the group filled with the taxa at that rank.  */
    function buildAndAppendGroupRows() {
        _elems('buildFormRows', ['object', {}, 'sub'])
        .then(appendGroupRowsAndFinishBuild);
    }
    function appendGroupRowsAndFinishBuild(rows) {
        ifNoSubGroupsRemoveCombo(rows);
        $('#Group_row').after(rows);
        _state('setFormFieldData', ['sub', 'Group', null, 'select']);
        initFormCombos('taxon', 'sub');
        _elems('toggleSubmitBttn', ['#sub-submit', false]);
        /* Binds the current group to the 'Select Unspecified' button */
        $('#select-group').off('click');
        $('#select-group').click(selectRoleTaxon.bind(null, null, getTaxonData('groupTaxon')));
    }
}
function ifNoSubGroupsRemoveCombo(rows = false) {
    const subGroups = Object.keys(getTaxonData('subGroups'));                   //console.log('ifNoSubGroupsRemoveCombo. subGroups = %O, rows = %O', subGroups, rows)
    if (subGroups.length > 1) { return; }
    if (!rows) {
        $('#Sub-Group_row').remove();
    } else {
        $(rows)[0].removeChild($(rows)[0].childNodes[0]); //removes Sub-Group row
    }
}
function clearPreviousGroupRankCombos() {
    $('#object_Rows>div').each(ifRankComboRemoveCombo);
}
function ifRankComboRemoveCombo(i, elem) {
    if (i !== 0) { elem.remove(); }
}
/* ------------------- ROLE SHARED HELPERS --------------- */
/* ------- initTaxonSelectForm --------- */
function initTaxonSelectForm(role, groupId) {
    if (ifSubFormAlreadyInUse(role)) { return throwAndCatchSubFormErr(role, 'sub'); }
    $('#'+role+'-sel').data('loading', true);
    return buildTaxonSelectForm(role, groupId)
        .then(form => appendTxnFormAndInitCombos(role, form))
        .then(() => finishTaxonSelectBuild(role));
}
function ifSubFormAlreadyInUse(role) {
    return ifFormAlreadyOpenAtLevel('sub') || ifOppositeRoleFormLoading(role);
}
function ifOppositeRoleFormLoading(role) {
    const oppRole = role === 'Subject' ? 'Object' : 'Subject';
    return $('#'+oppRole+'-sel').data('loading');
}
function buildTaxonSelectForm(role, groupId) {                                  //console.log('-------------buildTaxonSelectForm. args = %O', arguments);
    addNewFormState(role);
    return _state('initGroupState', [role, groupId])
        .then(() => _elems('initSubForm',
            ['sub', 'sml-sub-form', {Group: groupId}, '#'+role+'-sel']));
}
function addNewFormState(role) {
    const lcRole = _u('lcfirst', [role]);
    _state('addEntityFormState', [lcRole, 'sub', '#'+role+'-sel', 'create']);
}
/**
 * Customizes the taxon-select form ui. Either re-sets the existing taxon selection
 * or brings the first rank-combo into focus. Clears the [role]'s' combobox.
 */
function finishTaxonSelectBuild(role) {
    addSelectGroupBttn();
    customizeElemsForTaxonSelectForm(role);
    selectInitTaxonOrFocusFirstCombo(role);
    _u('replaceSelOpts', ['#'+role+'-sel', []]);
    $('#'+role+'-sel').data('loading', false);
}
/* --------- SELECT UNSPECIFIED BUTTON -------------- */
function addSelectGroupBttn() {
    const bttn = buildSelectUnspecifedBttn();
    $('#sub-form .bttn-cntnr').prepend(bttn);
}
function buildSelectUnspecifedBttn() {
    const attr = { id: 'select-group', class: 'ag-fresh', type: 'button', value: 'Select Unspecified' }
    const bttn = _u('buildElem', ['input', attr]);
    $(bttn).click(selectRoleTaxon.bind(null, null, getTaxonData('groupTaxon')));
    return bttn;
}
/* --------- SELECT PREVIOUS TAXON OR FOCUS COMBO -------------- */
/**
 * Restores a previously selected taxon on initial load, or when reseting the select
 * form. When the select form loads without a previous selection or when the group
 * is changed by the user, the first combobox of the group is brought into focus.
 */
function selectInitTaxonOrFocusFirstCombo(role) {
    const selId = getPrevSelId(role);
    if (selId) { resetPrevTaxonSelection(selId, role);
    } else { focusFirstRankCombobox(_u('lcfirst', [role])); }
}
function getPrevSelId(role) {
    return $('#'+role+'-sel').val() || $('#'+role+'-sel').data('reset') ?
        $('#'+role+'-sel').data('selTaxon') : null;
}
function focusFirstRankCombobox(lcRole) {
    _cmbx('focusFirstCombobox', ['#'+lcRole+'_Rows']);
}
function appendTxnFormAndInitCombos(role, form) {
    const lcRole = _u('lcfirst', [role]);
    $('#'+role+'_row').append(form);
    initFormCombos('taxon', 'sub');
}
/* --------- CUSTOMIZE ELEMS FOR TAXON SELECT FORM -------------- */
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
    const bttn = _elems('getExitButton');
    bttn.id = 'exit-sub-form';
    $(bttn).unbind('click').click(exitTaxonSelectForm.bind(null, role));
    return bttn;
}
/** Exits sub form and restores any previous taxon selection. */
function exitTaxonSelectForm(role) {
    _elems('exitSubForm', ['sub', false, enableTaxonCombos]);
    const prevTaxonId = $('#'+role+'-sel').data('selTaxon');
    if (!prevTaxonId) { return; }
    resetTaxonCombobox(role, prevTaxonId);
}
function resetTaxonCombobox(role, prevTaxonId) {
    const opt = { value: prevTaxonId, text: getTaxonym(prevTaxonId) };
    _cmbx('updateComboboxOptions', ['#'+role+'-sel', opt]);
    _cmbx('setSelVal', ['#'+role+'-sel', prevTaxonId]);
}
function getTaxonym(id) {
    return getRcrd('taxon', id).displayName;
}
function enableTaxonRanks(enable = true) {
    $.each($('#sub-form select'), (i, sel) => {
        _cmbx('enableCombobox', ['#'+sel.id, enable])
    });
}
/* ------- resetTaxonSelectForm --------- */
/** Removes and replaces the taxon form. */
function resetTaxonSelectForm(role) {
    const group = getTaxonData('groupName');
    const reset =  group == 'Bat' ? initSubjectSelect : initObjectSelect;
    $('#'+role+'-sel').data('reset', true);
    $('#sub-form').remove();
    reset();
}
/** Resets the taxon to the one previously selected in the interaction form.  */
function resetPrevTaxonSelection(id, role) {
    const taxon = getRcrd('taxon', id);
    if (taxon.isRoot) { return; }                                               console.log('           --resetPrevTaxonSelection [%s] [%s] = %O', role, id, taxon);
    selectPrevTaxon(taxon, role);
}
function selectPrevTaxon(taxon, role) {
    addTaxonOptToTaxonMemory(taxon);
    if (ifTaxonInDifferentGroup(taxon.group)) { return selectTaxonGroup(taxon); }
    _cmbx('setSelVal', ['#'+taxon.rank.displayName+'-sel', taxon.id]);
    window.setTimeout(() => { deleteResetFlag(role); }, 1000);
}
function addTaxonOptToTaxonMemory(taxon) {
    _state('setGroupProp', ['prevSel', {val: taxon.id, text: taxon.displayName }]);
}
function ifTaxonInDifferentGroup(group) {
    return group.displayName !== 'Bat' && $('#Group-sel').val() != group.id;
}
function selectTaxonGroup(taxon) {
    _cmbx('setSelVal', ['#Group-sel', taxon.group.id]);
}
function deleteResetFlag(role) {
    $('#'+role+'-sel').removeData('reset');
}
 /* ------- OnRankSelection --------- */
/**
 * When a taxon at a rank is selected, all child rank comboboxes are
 * repopulated with related taxa and the 'select' button is enabled. If the
 * combo was cleared, ensure the remaining dropdowns are in sync or, if they
 * are all empty, disable the 'select' button.
 */
export function onRankSelection(val, input) {                                  console.log("           --onRankSelection. val = [%s] isNaN? [%s]", val, isNaN(parseInt(val)));
    const fLvl = getSubFormLvl('sub');
    const elem = input || this.$input[0];
    if (val === 'create') { return openTaxonCreateForm(elem, fLvl); }
    if (val === '' || isNaN(parseInt(val))) { return syncTaxonCombos(elem); }
    repopulateCombosWithRelatedTaxa(val);
    _elems('toggleSubmitBttn', ['#'+fLvl+'-submit', true]);
}
function openTaxonCreateForm(selElem, fLvl) {
    const rank = selElem.id.split('-sel')[0];
    if (rank === 'Species' && !$('#Genus-sel').val()) {
        return _val('formInitErr', [rank, 'noGenus', fLvl]);
    } else if (rank === 'Genus' && !$('#Family-sel').val()) {
        return _val('formInitErr', [rank, 'noFamily', fLvl]);
    }
    selElem.selectize.createItem('create');
}
function syncTaxonCombos(elem) {
    resetChildRankCombos(getSelectedTaxon(elem.id.split('-sel')[0]));
}
function resetChildRankCombos(selTxn) {
    const rankName = selTxn ? selTxn.rank.displayName : getGroupTopSubRank();
    if (rankName == 'Species') { return; }
    getChildRankOpts(rankName, selTxn.group.subGroup)
    .then(opts => repopulateRankCombos(opts, {}));
}
function getGroupTopSubRank() {
    return getTaxonData('groupRanks').map(l => l).pop();
}
function getChildRankOpts(rankName, subGroup) {
    const opts = {};
    return buildChildRankOpts().then(() => opts);

    function buildChildRankOpts() {
        const ranks = getChildRanks();
        const optProms = ranks.map(rank => getTaxonOpts(rank))
        return Promise.all(optProms);
    }
    function getChildRanks() {
        const ranks = getTaxonData('groupRanks');
        return ranks.slice(0, ranks.indexOf(rankName));
    }
    function getTaxonOpts(rank) {
        return _cmbx('getTaxonOpts', [rank, null, getTaxonData('groupName'), subGroup])
            .then(rankOpts => opts[rank] = rankOpts);
    }
}
/**
 * Repopulates the comboboxes of child ranks when a taxon is selected. Selected
 * and ancestor ranks are populated with all taxa at the rank and the direct
 * ancestors selected. Child ranks populate with only decendant taxa and
 * have no initial selection.
 * TODO: Fix bug with child taxa opt refill sometimes filling with all taxa.
 */
function repopulateCombosWithRelatedTaxa(selId) {
    const opts = {}, selected = {};
    const taxon = getRcrd('taxon', selId);                                      //console.log("repopulateCombosWithRelatedTaxa. taxon = %O, opts = %O, selected = %O", taxon, opts, selected);
    const group = getTaxonData('groupName');
    const subGroup = taxon.group.subGroup;
    if (!taxon) { return; } //issue alerted to developer and editor
    taxon.children.forEach(addRelatedChild);
    return buildUpdatedTaxonOpts()
        .then(repopulateRankCombos.bind(null, opts, selected));

    function addRelatedChild(id) {                                              //console.log('addRelatedChild. id = ', id);
        const childTxn = getRcrd('taxon', id);
        if (!childTxn) { return; } //issue alerted to developer and editor
        const rank = childTxn.rank.displayName;
        addOptToRankAry(childTxn, rank);
        childTxn.children.forEach(addRelatedChild);
    }
    function addOptToRankAry(childTxn, rank) {
        if (!opts[rank]) { opts[rank] = []; }                                 //console.log("setting rank = ", taxon.rank)
        opts[rank].push({ value: childTxn.id, text: childTxn.name });
    }
    function buildUpdatedTaxonOpts() {
        return Promise.all([getSiblingOpts(taxon), getAncestorOpts(taxon.parent)])
        .then(buildOptsForEmptyRanks)
        .then(addCreateOpts);
    }
    function getSiblingOpts(taxon) {
        const rank = taxon.rank.displayName;
        return _cmbx('getTaxonOpts', [rank, null, group, subGroup])
            .then(o => {                                                        //console.log('getSiblingOpts. taxon = %O', taxon);
                opts[taxon.rank.displayName] = o;
                selected[taxon.rank.displayName] = taxon.id;
            });
    }
    function getAncestorOpts(prntId) {                                          //console.log('getAncestorOpts. prntId = [%s]', prntId);
        const prntTaxon = getRcrd('taxon', prntId);
        if (prntTaxon.isRoot) { return Promise.resolve();}
        selected[prntTaxon.rank.displayName] = prntTaxon.id;
        return buildAncestorOpts(prntTaxon);
    }
    function buildAncestorOpts(prntTaxon) {
        const rank = prntTaxon.rank.displayName;
        return _cmbx('getTaxonOpts', [rank, null, group, subGroup])
            .then(o => {                                                        //console.log("--getAncestorOpts - setting rank = ", prntTaxon.rank)
                opts[prntTaxon.rank.displayName] = o;
                return getAncestorOpts(prntTaxon.parent);
            });
    }
    /**
     * Builds the opts for each rank without taxa related to the selected taxon.
     * Ancestor ranks are populated with all taxa at the rank and will have
     * the 'none' value selected.
     */
    function buildOptsForEmptyRanks() {
        const ranks = getTaxonData('groupRanks');
        const proms = [];
        fillOptsForEmptyRanks();
        return Promise.all(proms);

        function fillOptsForEmptyRanks() {
            ranks.forEach(rank => {
                if (opts[rank] || rank == taxon.rank.displayName) { return; }
                buildAncestorOpts(rank);
            });
        }
        function buildAncestorOpts(rank) {
            selected[rank] = 'none';
            proms.push(_cmbx('getTaxonOpts', [rank, null, group, subGroup])
                .then(o => opts[rank] = o ));
        }
    }
    function addCreateOpts() {
        for (let rank in opts) {                                                 //console.log("rank = %s, name = ", rank, ranks[rank-1]);
            opts[rank].unshift({ value: 'create', text: 'Add a new '+rank+'...'});
        }
        return Promise.resolve();
    }
} /* End fillAncestorTaxa */
function repopulateRankCombos(optsObj, selected) {                             //console.log('repopulateRankCombos. optsObj = %O, selected = %O', optsObj, selected); //console.trace();
    Object.keys(optsObj).forEach(rank => {                                       //console.log("rank = %s, name = ", l, ranks[l-1]);
        repopulateRankCombo(optsObj[rank], rank, selected)
    });
}
/**
 * Replaces the options for the rank combo. Selects the selected taxon and
 * its direct ancestors.
 */
function repopulateRankCombo(opts, rank, selected) {                            //console.log("repopulateRankCombo for rank = %s (%s)", rank, rankName);
    updateComboOpts(rank, opts);
    if (!rank in selected) { return; }
    if (selected[rank] == 'none') { return resetPlaceholer(rank); }
    _cmbx('setSelVal', ['#'+rank+'-sel', selected[rank], 'silent']);
}
/**
 * Change event is fired when options are replaced, so the event is removed and
 * restored after the options are updated.
 */
function updateComboOpts(rank, opts) {
    _u('replaceSelOpts', ['#'+rank+'-sel', opts, () => {}]);
    $('#'+rank+'-sel')[0].selectize.on('change', onRankSelection);
}
function resetPlaceholer(rank) {
    _u('updatePlaceholderText', ['#'+rank+'-sel', null, 0]);
}
/* ------- selectRoleTaxon --------- */
/** Adds the selected taxon to the interaction-form's [role]-taxon combobox. */
function selectRoleTaxon(e, groupTaxon) {
    const role = getTaxonData('groupName') === 'Bat' ? 'Subject' : 'Object';
    const opt = getSelectedTaxonOption(groupTaxon);
    $('#sub-form').remove();
    if (!opt) { return; } //issue alerted to developer and editor
    _cmbx('updateComboboxOptions', ['#'+role+'-sel', opt]);
    _cmbx('setSelVal', ['#'+role+'-sel', opt.value]);
}
/** Returns an option object for the most specific taxon selected. */
function getSelectedTaxonOption(groupTaxon) {
    const taxon = groupTaxon || getSelectedTaxon();                             //console.log("selected Taxon = %O", taxon);
    if (!taxon) { return; } //issue alerted to developer and editor
    return { value: taxon.id, text:taxon.displayName };
}
/** Finds the most specific rank with a selection and returns that taxon record. */
export function getSelectedTaxon(aboveRank) {
    const selElems = $('#sub-form .selectized').toArray();
    if (ifEditingTaxon()) { selElems.reverse(); } //Taxon parent edit form.
    const selected = selElems.find(isSelectedTaxon.bind(null, aboveRank));                              //console.log("getSelectedTaxon. selElems = %O selected = %O", selElems, selected);
    return !selected ? false : _state('getRcrd', ['taxon', $(selected).val()]);

    function ifEditingTaxon() {
        const action = _state('getFormProp', ['top', 'action']);
        const entity = _state('getFormProp', ['top', 'entity']);
        return action == 'edit' && entity == 'taxon';
    }
}
function isSelectedTaxon(resetRank, elem) {
    if (!ifIsRankComboElem(elem)) { return false; }
    if (resetRank && isRankChildOfResetRank(resetRank, elem)) { return false; }
    return $(elem).val();
}
function isRankChildOfResetRank(resetRank, elem) {
    const allRanks = getTaxonData('groupRanks');
    const rank = elem.id.split('-sel')[0];
    return allRanks.indexOf(rank) < allRanks.indexOf(resetRank);
}
function ifIsRankComboElem(elem) {
    return elem.id.includes('-sel') && !elem.id.includes('Group');
 }
/**
 * When complete, the select form is removed and the most specific taxon is displayed
 * in the interaction-form <role> combobox.
 */
function onTaxonRoleSelection(role, val) {                                      console.log("       +--onTaxonRoleSelection [%s] = ", role, val);
    if (val === "" || isNaN(parseInt(val))) { return; }
    $('#'+getSubFormLvl('sub')+'-form').remove();
    $('#'+role+'-sel').data('selTaxon', val);
    enableTaxonCombos();
    if (role === 'Object') { initTypeField(getObjectGroup('displayName')); }
    focusPinAndEnableSubmitIfFormValid(role);
}
function enableTaxonCombos() {
    _cmbx('enableCombobox', ['#Subject-sel']);
    _cmbx('enableCombobox', ['#Object-sel']);
}
function getTaxonData(prop) {
    return prop ? _state('getTaxonProp', [prop]) : _state('getGroupState');
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
function getRcrd(entity, id) {
    return _state('getRcrd', [entity, id]) || false;
}
function getRcrds(entity) {
    return _state('getEntityRcrds', [entity]);
}