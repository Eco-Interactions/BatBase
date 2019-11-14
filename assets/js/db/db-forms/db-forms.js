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
 *     addDataToCntDetailPanel  ""
 *     loadSrcTypeFields        ""
 *     fieldIsDisplayed         ""
 *     selectExistingAuthors    ""
 *     getTaxonDisplayName      ""
 *     addMapToLocForm          ""
 *     initTaxonParams
 *     getSelectedTaxon
 *     initFormLevelParamsObj
 *     buildFormDataAndSubmit
 *     addListenerToGpsFields
 *     getNextFormLevel         f-errs, form-elems
 *     toggleSubmitBttn         edit-forms, f-errs
 *     focusParentAndShowChildLocs      edit-forms
 *     enableTaxonLvls          f-confg 
 *     enableCountryRegionField     f-confg
 *     enablePubField           f-confg
 *     resetInteractionForm     f-confg
 *     submitFormData               edit-forms
 *     citationFormNeedsCitTextUpdate       form-elems
 *     handleCitText                ""
 *     getSubFormLvl                ""
 *     resetIfFormWaitingOnChanges              ""
 *     disableSubmitBttn            ""
 *     enableSubmitBttn             "", [something else, didn't doc]
 *     addRequiredFieldInputToMemory            ""
 *     getFormEntity                ""
 *     setFormParam                 ""
 *     setFormFieldValueMemory
 *     setFormFieldConfg
 *     getFormReqElems              ""
 *     exitForm                save-exit-bttns
 *     getFormLevelParams           generate-citation
 */
import * as _u from '../util.js';
import * as _elems from './form-ui/form-elems.js';
import * as db_sync from '../db-sync.js';
import * as db_page from '../db-page.js';
import * as db_map from '../db-map/db-map.js';
import * as idb from 'idb-keyval'; //set, get, del, clear
import * as _errs from './f-errs.js';
import * as form_ui from './form-ui.js';
import * as _cmbx from './combobox-util.js';
import * as _fCnfg from './f-confg.js';
import { buildFormBttns } from './form-ui/save-exit-bttns.js';
import { showEntityEditForm } from './edit/edit-forms.js';
import { getFormValueData } from './get-form-data.js';
import { formatDataForServer } from './validate-data.js';
import { buildCitationText } from './generate-citation.js';

let fP = {};
/* ======= SORT ============= */
export function getSelConfgs() {
    return { 
        'Authors': { name: 'Authors', id: '#Authors-sel1', change: onAuthSelection, 
            add: initAuthForm.bind(null, 1) },
        'CitationType': { name: 'Citation Type', change: loadCitTypeFields, add: false },
        'CitationTitle': { name: 'Citation', change: onCitSelection, add: initCitForm },
        'Class': { name: 'Class', change: onLevelSelection, add: initTaxonForm },
        'Country-Region': { name: 'Country-Region', change: onCntryRegSelection, add: false },
        'Country': { name: 'Country', change: focusParentAndShowChildLocs.bind(null, 'create'), add: false },
        'Editors': { name: 'Editors', id: '#Editors-sel1', change: onEdSelection, 
            add: initEdForm.bind(null, 1) },
        'Family': { name: 'Family', change: onLevelSelection, add: initTaxonForm },
        'Genus': { name: 'Genus', change: onLevelSelection, add: initTaxonForm },
        'HabitatType':  { name: 'Habitat Type', change: false, add: false },
        'InteractionTags': { name: 'Interaction Tags', change: false, add: false , 
            options: { delimiter: ",", maxItems: null }},         
        'InteractionType': { name: 'Interaction Type', change: focusIntTypePin, add: false },
        'Location': { name: 'Location', change: onLocSelection, add: initLocForm },
        'Kingdom': { name: 'Kingdom', change: false, add: false },
        'Order': { name: 'Order', change: onLevelSelection, add: initTaxonForm },
        'Phylum': { name: 'Phylum', change: false, add: false },
        'PublicationType': { name: 'Publication Type', change: loadPubTypeFields, add: false },
        'Publisher': { name: 'Publisher', change: onPublSelection, add: initPublisherForm },
        'Realm': { name: 'Realm', change: onRealmSelection, add: false },
        'Species': { name: 'Species', change: onLevelSelection, add: initTaxonForm },
        'Publication': { name: 'Publication', change: onPubSelection, add: initPubForm },
        'Subject': { name: 'Subject', change: onSubjectSelection, add: false },
        'Object': { name: 'Object', change: onObjectSelection, add: false },
    };
}
/* ================== FORM "STATE" ========================================= */
export function clearFormMemory() {
    fP = {};
}
export function getFormParams() {
    return fP;
}

/** Adds a count of references to the entity-being-edited, by entity, to the panel. */
export function addDataToCntDetailPanel(refObj) {
    for (var ent in refObj) {
        $('#'+ent+'-det div')[0].innerText = refObj[ent];    
    }
}
/**
 * When the Publication, Citation, or Location fields are selected, their data 
 * is added se the side detail panel of the form. For other entity edit-forms: 
 * the total number of referencing records is added. 
 */
function addDataToIntDetailPanel(ent, propObj) {                                //console.log('ent = [%s], propObj = %O', ent, propObj);
    var html = getDataHtmlString(propObj);   
    clearDetailPanel(ent, false, html)   
}
/** Returns a ul with an li for each data property */
function getDataHtmlString(props) {
    var html = [];
    for (var prop in props) {
        html.push('<li><b>'+prop+'</b>: '+ props[prop]+ '</li>');
    }
    return '<ul class="ul-reg">' + html.join('\n') + '</ul>';
}
function clearDetailPanel(ent, reset, html) {                                   //console.log('clearDetailPanel for [%s]. html = ', ent, html)
    if (ent === 'cit') { return updateSrcDetailPanel('cit'); }
    if (ent === 'pub') { ent = 'src'; }
    const newDetails = reset ? 'None selected.' : html;
    $('#'+ent+'-det div').empty();
    $('#'+ent+'-det div').append(newDetails); 
    return Promise.resolve();
}
/** Builds the form elem container. */
function buildFormElem() {
    var form = document.createElement("form");
    $(form).attr({"action": "", "method": "POST", "name": "top"});
    form.className = "flex-row";
    form.id = "top-form";
    return form;
}
/*------------------- FORM Params Object -------------------------------------*/
/**
 * Sets the global fP obj with the params necessary throughout the form code. 
 * -- Property descriptions:
 * > action - ie, Create, Edit.
 * > editing - Container for the id(s) of the record(s) being edited. (Detail 
        ids are added later). False if not editing.
 * > entity - Name of this form's entity     
 * > forms - Container for form-specific params 
 *  >> expanded - Obj of form entities(k) and their showAll/showDefault fields state(v)
 * > formLevels - An array of the form level names/tags/prefixes/etc.
 * > records - An object of all records, with id keys, for each of the 
 *   root entities - Location, Source and Taxa, and any sub entities as needed.
 * > submitFocus - Stores the table-focus for the entity of the most recent 
        form submission. Will be used on form-exit.
 */
function initFormParams(action, entity, id) {  
    const  entities = ['source', 'location', 'taxon', 'citation', 'publication', 
        'author', 'publisher'];
    const prevSubmitFocus = fP.submitFocus;
    const xpandedForms = fP.forms ? fP.forms.expanded : {};
    return _u.getData(entities).then(data => {
        fP = {
            action: action,
            editing: action === 'edit' ? { core: id || null, detail: null } : false,
            entity: entity,
            forms: { expanded: xpandedForms },
            formLevels: ['top', 'sub', 'sub2'],
            records: data,
            submitFocus: prevSubmitFocus || false
        };
        initFormLevelParamsObj(entity, 'top', null, _fCnfg.getFormConfg(entity), action); console.log("#### Init fP = %O, curfP = %O", _u.snapshot(fP), fP);
    });
}
/**
 * Adds the properties and confg that will be used throughout the code for 
 * generating, validating, and submitting sub-form. 
 * -- Property descriptions:
 * > action - create || edit
 * > confg - The form config object used during form building.
 * > typeConfg - Form confg for sub-types of entity forms. Eg, publication-types.
 * > fieldConfg - Form fields and types, values entered, and the required fields.
 * > entity - Name of this form's entity.
 * > exitHandler - Form exit handler or noOp.
 * > fieldConfg - Form fields and types, values entered, and the required fields.
 * > misc - object to hold the various special-case props
 * > pSelId - The id of the parent select of the form.
 * > reqElems - All required elements in the form.
 * > selElems - Contains all selElems until they are initialized with selectize.
 * > typeConfg - Form confg for sub-types of entity forms. Eg, publication-types.
 * > vals - Stores all values entered in the form's fields.
 * --- Misc entity specific properties
 * > Citation forms: pub - { src: pubSrc, pub: pub } (parent publication)
 * > Location forms: geoJson - geoJson entity for this location, if it exists.
 * > Taxon forms: taxonPs - added to fP.forms (see props @initTaxonParams)
 */
export function initFormLevelParamsObj(entity, level, pSel, formConfg, action) {       //console.log("initLvlParams. fP = %O, arguments = %O", fP, arguments)
    fP.forms[entity] = level;
    fP.forms[level] = {
        action: action,
        confg: formConfg,
        fieldConfg: { fields: {}, vals: {}, required: [] },
        entity: entity,
        exitHandler: getFormExitHandler(formConfg, action),
        misc: {},
        pSelId: pSel,
        reqElems: [],
        selElems: [], 
        typeConfg: false,
        vals: {}
    };   
    return fP;                                                                       //console.log("fLvl params = %O", fP.forms[level]);
}
/**
 * Returns the exitHandler stored in the form confg for the current action, or, 
 * if no handler is stored, edit forms have a default of @exitFormHandler
 * and create forms default to noOp.
 */
function getFormExitHandler(confg, action) {                                    //console.log('getFormExitHandler. action = %s, confg = %O', action, confg);
    return confg.exitHandler && confg.exitHandler[action] ? 
        confg.exitHandler[action] :
        action === 'edit' ? form_ui.exitFormPopup : Function.prototype;
}
/* --- Getters --- */
export function getFormEntity(fLvl) {
    return fP.forms[fLvl].entity;
}
export function getFormLevelParams(fLvl) {
    return fP.forms[fLvl];
}
export function getFormReqElems(fLvl) {
    return fP.forms[fLvl].reqElems;
}
export function getFormFieldConfg(fLvl, field) {
    return fP.forms[fLvl].fieldConfg.vals[field];
}
export function getEntityRcrds(entity) {
    return typeof entity == 'string' ? fP.records[entity] : buildRcrdsObj(entity);
}
function buildRcrdsObj(entities) {
    const rcrds = {};
    entities.forEach(ent => { rcrds[ent] = fP.records[entity]});
    return rcrds;
}
/* --- Setters --- */
export function addRequiredFieldInputToMemory(fLvl, input) {
    fP.forms[fLvl].reqElems.push(input);
}
export function addComboToFormMemory(fLvl, field) {
    fP.forms[fLvl].selElems.push(field);    
}
export function setFormParam(fLvl, prop, val) {
    fP.forms[fLvl][prop] = val;
}
export function setFormFieldConfg(fLvl, field, confg) {
    fP.forms[fLvl].fieldConfg.vals[field] = confg
}
export function setFormFieldValueMemory(fLvl, field, val) {
    fP.forms[fLvl].fieldConfg.vals[field].val = val;
}
/*------------------- Form Functions -------------------------------------------------------------*/
// /*--------------------------- Edit Form --------------------------------------*/
// /** Shows the entity's edit form in a pop-up window on the search page. */
export function editEntity(id, entity) {                                        console.log("   //editEntity [%s] [%s]", entity, id);  
    initFormParams("edit", entity, id)
    .then(() => showEntityEditForm(id, entity, fP));
}   
/*--------------------------- Create Form --------------------------------------------------------*/
/**
 * Fills the global fP obj with the basic form params @initFormParams. 
 * Inits the interaction form with all fields displayed and the first field, 
 * publication, in focus. From within many of the fields the user can create 
 * new entities of the field-type by selecting the 'add...' option from the 
 * field's combobox and completing the appended sub-form.
 */
export function initNewDataForm() {                                             console.log('   //Building New Interaction Form');
    initFormParams('create', 'interaction')
    .then(() => buildIntFormFields('create'))
    .then(fields => form_ui.buildAndAppendForm(fP, 'top', fields))
    .then(() => form_ui.finishEntityFormBuild('interaction'))
    .then(form_ui.finishCreateFormBuild)
    .catch(err => _u.alertErr(err));
}
/*------------------- Interaction Form Methods (Shared) ----------------------*/ 

/*-------------- Form Builders -------------------------------------------------------------------*/
/** Builds and returns all interaction-form elements. */
export function buildIntFormFields(action) {                                           console.log('       --buildIntFormFields');
    const builders = [ buildPubFieldRow, buildCitFieldRow, buildCntryRegFieldRow,
        buildLocFieldRow, initSubjField, initObjField, buildIntTypeField,
        buildIntTagField, buildIntNoteField ];
    return Promise.all([...builders.map(buildField)]);
}
function buildField(builder) { 
    return Promise.resolve(builder()).then(field => {
        ifSelectAddToInitAry(field); 
        return field;
    });                                                
}
/** Select elems with be initialized into multi-functional comboboxes. */
function ifSelectAddToInitAry(field) {
    const fieldType = field.children[1].children[1].nodeName; 
    if (fieldType !== "SELECT") { return; }  
    const fieldName = field.id.split('_row')[0];
    fP.forms.top.selElems.push(fieldName);
}
/*-------------- Publication ---------------------------------------------*/
/**
 * Returns a form row with a publication select dropdown populated with all 
 * current publication titles.
 */
function buildPubFieldRow() {                                                   console.log('       --buildPubFieldRow');
    return _elems.getSrcOpts('pubSrcs', null, fP.records.source)
        .then(buildPubRow);
}
function buildPubRow(opts) {
    const attr = { id: 'Publication-sel', class: 'lrg-field' };
    const selElem = _u.buildSelectElem(opts, attr);
    return _elems.buildFormRow('Publication', selElem, 'top', true);
}
/** 
 * When an existing publication is selected, the citation field is filled with 
 * all current citations for the publciation. When a publication is created, 
 * the citation form is automatically opened. 
 */
function onPubSelection(val) {                                                  console.log('   --onPubSelection'); 
    if (val === 'create') { return openCreateForm('Publication'); }        
    if (val === '' || isNaN(parseInt(val)) ) { return onPubClear(); }                                
    fillCitationField(val);
    updateSrcDetailPanel('pub');
    if (!fP.records.source[val].children.length) { return initCitForm(); }
    if (!fP.editing) { $('#Publication_pin').focus(); }
}
function onPubClear() {
    _cmbx.clearCombobox('#CitationTitle-sel');
    _cmbx.enableCombobox('#CitationTitle-sel', false);
    clearDetailPanel('pub', true);
}
/**
 * When a user enters a new publication into the combobox, a create-publication
 * form is built and appended to the interaction form. An option object is 
 * returned to be selected in the interaction form's publication combobox.
 */
function initPubForm(value) {                                                   console.log('   --initPubForm [%s]', value); //console.log("Adding new pub! val = %s", value);
    const fLvl = getSubFormLvl('sub');
    const val = value === 'create' ? '' : value;
    if ($('#'+fLvl+'-form').length !== 0) { return _errs.openSubFormErr('Publication', null, fLvl); }
    initEntitySubForm('publication', fLvl, 'flex-row med-sub-form', {'Title': val}, 
        '#Publication-sel')
    .then(appendPubFormAndFinishBuild);
}
function appendPubFormAndFinishBuild(form) {
    $('#CitationTitle_row').after(form);
    _cmbx.initFormCombos('publication', 'sub', fP.forms.sub.selElems);
    $('#Title_row input').focus();
    form_ui.setCoreRowStyles('#publication_Rows', '.sub-row');
}
/**
 * Loads the deafult fields for the selected Publication Type. Clears any 
 * previous type-fields and initializes the selectized dropdowns.
 */
function loadPubTypeFields(typeId) {                                            console.log('           --loadPubTypeFields');
    const elem = this.$input[0];  
    return loadSrcTypeFields('publication', typeId, elem)
    .then(finishPubTypeFields);

    function finishPubTypeFields() {
        ifBookAddAuthEdNote();
        form_ui.setCoreRowStyles('#publication_Rows', '.sub-row');
    }
}
/** Shows the user a note above the author and editor elems. */
function ifBookAddAuthEdNote() {        
    if ($('#PublicationType-sel')[0].innerText !== 'Book') { return; }
    const note = _u.buildElem('div', { class: 'skipFormData' });
    $(note).html('<i>Note: there must be at least one author OR editor ' +
        'selected for book publications.</i>')
    $(note).css({'margin': 'auto'});
    $('#Authors_row').before(note);
}
/*-------------- Citation ------------------------------------------------*/
/** Returns a form row with an empty citation select dropdown. */
function buildCitFieldRow() {                                                   console.log('       --buildPubFieldRow');
    const selElem = _u.buildSelectElem([], {id: 'CitationTitle-sel', class: 'lrg-field'});
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
function onCitSelection(val) {                                                  console.log('       --onCitSelection [%s]', val);
    if (val === 'create') { return openCreateForm('CitationTitle'); }
    if (val === '' || isNaN(parseInt(val))) { return clearDetailPanel('cit', true); }                     //console.log("cit selection = ", parseInt(val));                          
    updateSrcDetailPanel('cit');
    if (!fP.editing) { $('#CitationTitle_pin').focus(); }
}    
/** Shows the Citation sub-form and disables the publication combobox. */
function initCitForm(v) {                                                       console.log("       --initCitForm [%s]", v);
    const fLvl = getSubFormLvl('sub');
    const val = v === 'create' ? '' : v;
    if ($('#'+fLvl+'-form').length !== 0) { return _errs.openSubFormErr('CitationTitle', '#CitationTitle-sel', fLvl); }
    initEntitySubForm('citation', fLvl, 'flex-row med-sub-form', {'Title': val}, 
        '#CitationTitle-sel')
    .then(appendCitFormAndFinishBuild.bind(null, fLvl));
    _u.getData(['author', 'publication']).then(data => addSourceDataToMemory(data));
}
function appendCitFormAndFinishBuild(fLvl, form) {                              console.log('           --appendCitFormAndFinishBuild');
    $('#CitationTitle_row').after(form);
    _cmbx.initFormCombos('citation', 'sub', fP.forms.sub.selElems);
    selectDefaultCitType(fLvl).then(finishCitFormUiLoad.bind(null, fLvl));
}
function finishCitFormUiLoad(fLvl) {
    _cmbx.enableCombobox('#Publication-sel', false);
    $('#Abstract_row textarea').focus();
    form_ui.setCoreRowStyles('#citation_Rows', '.sub-row');
    if (_elems.ifAllRequiredFieldsFilled(fLvl)) { enableSubmitBttn('#'+fLvl+'-submit'); }
}
function addSourceDataToMemory(data) {
    Object.keys(data).forEach(k => fP.records[k] = data[k]);
}
function selectDefaultCitType(fLvl) {
    return _u.getData('citTypeNames').then(setCitType.bind(null, fLvl));
}
function setCitType(fLvl, citTypes) {
    const pubType = fP.forms[fLvl].pub.pub.publicationType.displayName;
    const dfaults = {
        'Book': getBookDefault(pubType, fLvl), 'Journal': 'Article', 
        'Other': 'Other', 'Thesis/Dissertation': 'Ph.D. Dissertation' 
    };
    _cmbx.setSelVal('#CitationType-sel', citTypes[dfaults[pubType]]);
}
function getBookDefault(pubType, fLvl) {
    if (pubType !== 'Book') { return 'Book'; }
    const pubAuths = fP.forms[fLvl].pub.src.authors;
    return pubAuths ? 'Book' : 'Chapter';
}
/**
 * Adds relevant data from the parent publication into formVals before 
 * loading the default fields for the selected Citation Type. If this is an 
 * edit form, skip loading pub data... 
 */
function loadCitTypeFields(typeId) {                                            console.log('       --loadCitTypeFields');
    const fLvl = getSubFormLvl('sub');
    const elem = this.$input[0];
    if (!fP.editing) { handlePubData(typeId, elem, fLvl); }
    return loadSrcTypeFields('citation', typeId, elem)
    .then(finishCitTypeFields);

    function finishCitTypeFields() {
        handleSpecialCaseTypeUpdates(elem, fLvl);
        if (!fP.citTimeout) { handleCitText(fLvl); }
        form_ui.setCoreRowStyles('#citation_Rows', '.'+fLvl+'-row');
    }
}
/**
 * Shows/hides the author field depending on whether the publication has
 * authors already. Disables title field for citations that don't allow 
 * sub-titles.
 */
export function handleSpecialCaseTypeUpdates(elem, fLvl) {
    const type = elem.innerText;    
    const hndlrs = { 
        'Book': updateBookFields, 'Chapter': updateBookFields,
        "Master's Thesis": disableTitleField, 'Other': disableFilledFields,
        'Ph.D. Dissertation': disableTitleField };
        if (Object.keys(hndlrs).indexOf(type) === -1) { return; }
    hndlrs[type](type, fLvl);

    function updateBookFields() {
        const params = fP.forms[fLvl];                                          //console.log('params.pub.src = %O', JSON.parse(JSON.stringify(params.pub.src)));
        const pubAuths = params.pub.src.authors;      
        if (!pubAuths) { return showAuthorField(); }
        removeAuthorField();
        if (type === 'Book'){ disableTitleField()} else { enableTitleField()}

        function showAuthorField() {                                            //console.log('showing author field');
            if (!params.misc.authRow) { return; }
            $('#citation_Rows').append(params.misc.authRow);
            fP.forms[fLvl].reqElems.push(params.misc.authElem);
            delete fP.forms[fLvl].misc.authRow;
            delete fP.forms[fLvl].misc.authElem;
        }
        function removeAuthorField() {                                          //console.log('removing author field');
            let reqElems = params.reqElems;
            fP.forms[fLvl].misc.authRow = $('#Authors_row').detach();
            fP.forms[fLvl].reqElems = reqElems.filter(removeAuthElem);  

            function removeAuthElem(elem) {
                if (!elem.id.includes('Authors')) { return true; }
                params.misc.authElem = elem;                                
                return false;
            }
        } /* End removeAuthorField */
    } /* End updateBookFields */
    function disableFilledFields() {
        $('#Title_row input').prop('disabled', true);
        $('#Year_row input').prop('disabled', true);
        disableAuthorField();
    }
    function disableAuthorField() {
        $('#Authors-sel-cntnr')[0].lastChild.remove();
        _cmbx.enableComboboxes($('#Authors-sel-cntnr select'), false);
    }
    function disableTitleField() { 
        $('#Title_row input').prop('disabled', true);
    }
    function enableTitleField() {  
        $('#Title_row input').prop('disabled', false);
    }
} /* End handleSpecialCaseTypeUpdates */
/** Adds or removes publication data from the form's values, depending on type. */
function handlePubData(typeId, citTypeElem, fLvl) {
    const type = citTypeElem.innerText;                                     //console.log('citType = ', type);
    const copy = ['Book', "Master's Thesis", 'Museum record', 'Other', 
        'Ph.D. Dissertation', 'Report', 'Chapter' ];
    const addSameData = copy.indexOf(type) !== -1;
    addPubValues(fLvl, addSameData, type);
}
function addPubValues(fLvl, addValues, type) {
    addPubTitle(addValues, fLvl, type);
    addPubYear(addValues, fLvl);
    addAuthorsToCitation(addValues, fLvl, type);
}
/** 
 * Adds the pub title to the citations form vals, unless the type should 
 * be skipped, ie. have it's own title. (may not actually be needed. REFACTOR and check in later)
 */
function addPubTitle(addTitle, fLvl, type) {     
    const vals = fP.forms[fLvl].fieldConfg.vals;           
    const skip = ['Chapter']; 
    vals.Title = {};
    vals.Title.val = addTitle && skip.indexOf(type) === -1 ? 
        fP.forms[fLvl].pub.src.displayName : '';  
}
function addPubYear(addYear, fLvl) {  
    const vals = fP.forms[fLvl].fieldConfg.vals;                       
    vals.Year = {};
    vals.Year.val = addYear ? fP.forms[fLvl].pub.src.year : '';
}
function addAuthorsToCitation(addAuths, fLvl, type) { 
    const vals = fP.forms[fLvl].fieldConfg.vals;                                //console.log('addAuthorsToCitation ? %s, vals = %O', addAuths, vals);
    const pubAuths = fP.forms[fLvl].pub.src.authors;  
    if (addAuths && pubAuths) { return addExistingPubContribs(fLvl, pubAuths); }
}
/**
 * If the parent publication has existing authors, they are added to the new 
 * citation form's author field(s). 
 */
function addExistingPubContribs(fLvl, auths) {  
    const vals = fP.forms[fLvl].fieldConfg.vals;  
    vals.Authors = { type: "multiSelect" };
    vals.Authors.val = auths ? auths : (vals.length > 0 ? vals : null);
}
/**
 * Checks all required citation fields and sets the Citation Text field.
 * If all required fields are filled, the citation text is generated and 
 * displayed. If not, the default text is displayed in the disabled textarea.
 * Note: to prevent multiple rebuilds, a timeout is used.
 */
export function handleCitText(formLvl) {                                               //console.log('   --handleCitText')
    fP.citTimeout = window.setTimeout(buildCitTextAndUpdateField, 500);

    function buildCitTextAndUpdateField() {                                     console.log('           --buildCitTextAndUpdateField')
        const fLvl = formLvl || getSubFormLvl('sub');
        const $elem = $('#CitationText_row textarea');
        if (!$elem.val()) { initializeCitField($elem); } 
        delete fP.citTimeout;
        return getCitationFieldText($elem, fLvl)
        .then(updateCitField.bind(null, $elem));
    }
} 
function updateCitField($elem, citText) {  
    if (!citText) { return; }
    $elem.val(citText).change();
}                   
function initializeCitField($elem) {
    $elem.prop('disabled', true).unbind('change').css({height: '6.6em'});
}
/** Returns the citation field text or false if there are no updates. */
function getCitationFieldText($elem, fLvl) {
    const dfault = 'The citation will display here once all required fields '+
        'are filled.';
    return Promise.resolve(getCitationText());

    function getCitationText() {
        return ifNoChildFormOpen(fLvl) && _elems.ifAllRequiredFieldsFilled(fLvl) ? 
           buildCitationText(fP, fLvl) : ($elem.val() === dfault ? false : dfault);
    }
}
function ifNoChildFormOpen(fLvl) {  
    return $('#'+getNextFormLevel('child', fLvl)+'-form').length == 0; 
}
/** When the Citation sub-form is exited, the Publication combo is reenabled. */
export function enablePubField() {
    _cmbx.enableCombobox('#Publication-sel');
    fillCitationField($('#Publication-sel').val());
}
/** ----- Publication and Citation Shared form helpers ------------ */
/** Adds source data to the interaction form's detail panel. */
function updateSrcDetailPanel(entity) {                                         console.log('           --updateSrcDetailPanel');
    const data = {}; 
    buildSourceData();
    addDataToIntDetailPanel('src', data);

    function buildSourceData() {
        const pubSrc = fP.records.source[$('#Publication-sel').val()];
        const pub = getRcrd('publication', pubSrc.publication);
        const pubType = getSrcType(pub, 'publication');  
        const citId = $('#CitationTitle-sel').val();
        const citSrc = citId ? fP.records.source[citId] : false;  
        const cit = citSrc ? getRcrd('citation', citSrc.citation) : false;
        const citType = cit ? getSrcType(cit, 'citation') : false;   console.log('citation src [%s] = %O, details = %O', citId, citSrc, cit); 

        addCitationText();
        addPubTitleData();
        addCitTitleData();
        addAuths();
        addEds();
        addYear();
        addAbstract();

        function addCitationText() {
            data['Citation'] = cit ? cit.fullText : '(Select Citation)';  console.log('cit full text', cit.fullText)
        }
        function addPubTitleData() {
            const pubTitleField = pubType && pubType !== 'Other' ? 
                pubType + ' Title' : 'Publication Title';  
            data[pubTitleField] = pub.displayName;
            addDescription(pubSrc.description, pubType);

            function addDescription(desc, type) {
                if (!desc) { return; } 
                const prefix = type !== 'Other' ? type : 'Publication';
                data[prefix+' Description'] = desc;
            }
        } /* End addPubTitleData */
        function addCitTitleData() {
            const subTitle = getCitTitle();  
            if (!subTitle) { return; }
            const citTitleField = citType && citType !== 'Other' ? 
                citType + ' Title' : 'Citation Title';
            data[citTitleField] = subTitle;
            
            function getCitTitle() {  
                if (!cit) { return false; }
                return cit.displayName === pub.displayName ? false : cit.displayName;
            }
        } /* End addCitTitleData */
        function addAuths() {
            const rcrdWithAuths = pubSrc.authors ? pubSrc : 
                citSrc && citSrc.authors ? citSrc : false; 
            if (!rcrdWithAuths) { return; }
            const cnt = Object.keys(rcrdWithAuths.authors).length; 
            const prop = 'Author' + (cnt === 1 ? '' : 's'); 
            data[prop] = getAuthorNames(rcrdWithAuths);
        }
        function addEds() {  
            if (!pubSrc.editors) { return; }
            const cnt = Object.keys(pubSrc.editors).length;
            const prop = 'Editor' + (cnt === 1 ? '' : 's'); 
            data[prop] =  getAuthorNames(pubSrc, true);
        }
        function addYear() {
            const yr = pubSrc.year ? pubSrc.year : citSrc ? citSrc.year : false;
            if (!yr) { return; }
            data['Year'] = yr;
        }
        function addAbstract() {
            if (!cit || !cit.abstract) { return; }
            data.Abstract = cit.abstract;
        }
        function getSrcType(rcrd, entity) { 
            return rcrd[entity+'Type'] ? rcrd[entity+'Type'].displayName : false;
        }
    } /* End buildSourceData */
} /* End updateSrcDetailPanel */
/**
 * Loads the deafult fields for the selected Source Type's type. Clears any 
 * previous type-fields and initializes the selectized dropdowns. Updates 
 * any type-specific labels for fields.  
 * Eg, Pubs have Book, Journal, Dissertation and 'Other' field confgs.
 */
export function loadSrcTypeFields(subEntity, typeId, elem, typeName) {                 console.log('           --loadSrcTypeFields.');
    const fLvl = getSubFormLvl('sub');
    resetOnFormTypeChange(subEntity, typeId, fLvl);
    return getSrcTypeRows(subEntity, typeId, fLvl, typeName)
    .then(finishSrcTypeFormBuild);
        
    function finishSrcTypeFormBuild(rows) {
        $('#'+subEntity+'_Rows').append(rows);
        _cmbx.initFormCombos(subEntity, fLvl, fP.forms[fLvl].selElems);
        fillComplexFormFields(fLvl);
        _elems.checkReqFieldsAndToggleSubmitBttn(elem, fLvl);
        updateFieldLabelsForType(subEntity, fLvl);
        focusFieldInput(subEntity);
    }
}
function resetOnFormTypeChange(subEntity, typeId, fLvl) {  
    const capsType = _u.ucfirst(subEntity);   
    fP.forms[fLvl].fieldConfg.vals[capsType+'Type'].val = typeId;
    fP.forms[fLvl].reqElems = [];
    disableSubmitBttn('#'+fLvl+'-submit'); 
}
/**
 * Builds and return the form-field rows for the selected source type.
 * @return {ary} Form-field rows ordered according to the form config.
 */
export function getSrcTypeRows(entity, typeId, fLvl, type) {                           //console.log('getSrcTypeRows. type = ', type);
    const fVals = getCurrentFormFieldVals(fLvl);
    const fConfg = _fCnfg.getFormConfg(entity);
    const tConfg = setSourceTypeConfg(entity, typeId, fLvl, type); 
    $('#'+entity+'_Rows').empty();     
    return _elems.getFormFieldRows(entity, fConfg, tConfg, fVals, fLvl, fP);
}
/** Sets the type confg for the selected source type in form params. */
function setSourceTypeConfg(entity, id, fLvl, tName) {
    const typeElemId = '#'+_u.ucfirst(entity)+'Type-sel'; 
    const type = tName || _cmbx.getSelTxt(typeElemId);
    fP.forms[fLvl].typeConfg = _fCnfg.getFormConfg(entity).types[type]; 
    return fP.forms[fLvl].typeConfg;
}
/**
 * Changes form-field labels to more specific and user-friendly labels for 
 * the selected type. 
 */
function updateFieldLabelsForType(entity, fLvl) {                               //console.log('--updating field labels.');
    const typeElemId = '#'+_u.ucfirst(entity)+'Type-sel'; 
    const type = $(typeElemId)[0].innerText;
    const trans = getLabelTrans();  
    const fId = '#'+fLvl+'-form';

    for (let field in trans) {                                                  //console.log('updating field [%s] to [%s]', field, trans[field]);
        const $lbl = $(fId+' label:contains('+field+')'); 
        $lbl.text(trans[field]);
        if ($(fId+' [id^='+field+'-sel]').length) { 
            updateComboText($lbl[0], field, trans[field]); 
        }
    }
    function getLabelTrans() {
        const trans =  {
            'publication': {
                'Thesis/Dissertation': { 'Publisher': 'Publisher / University' }
            },
            'citation': {
                'Book': {'Volume': 'Edition'}, 
                'Chapter': {'Title': 'Chapter Title'},
            }
        };
        return trans[entity][type];  
    }
    function updateComboText(lblElem, fieldTxt, newTxt) { 
        return lblElem.nextSibling.id.includes('-cntnr') ?
            updateAllComboPlaceholders($('#'+fieldTxt+'-sel-cntnr')[0]) :
            updatePlaceholderText($('#'+fieldTxt+'-sel')[0], newTxt);

        function updateAllComboPlaceholders(cntnrElem) {
            for (let $i = 0; $i < cntnrElem.children.length; $i++) {            //console.log('cntnr child = %O', cntnrElem.children[$i]);
                if (cntnrElem.children[$i].tagName !== 'SELECT') {continue}
                updatePlaceholderText(cntnrElem.children[$i], newTxt);   
            }
        }    
    } /* End updateComboboxText */
} /* End updateFieldLabelsForType */
function updatePlaceholderText(elem, newTxt) {                                  //console.log('updating placeholder text to [%s] for elem = %O', newTxt, elem);
    elem.selectize.settings.placeholder = 'Select ' + newTxt;
    elem.selectize.updatePlaceholder();
}
function focusFieldInput(type) {
    if (!$('#Title_row input').val()) { $('#Title_row input').focus() 
    } else {
        _cmbx.focusCombobox('#'+_u.ucfirst(type)+'Type-sel', true);
    }
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
    if ($('#loc-map').length) { focusParentAndShowChildLocs('int', val); }    
}
/*-------------- Location ------------------------------------------------*/
/*--------------- Form methods ---------------------------*/
/**
 * Returns a form row with a select dropdown populated with all available 
 * locations.
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
    if (val === 'create') { return openCreateForm('Location'); }
    if (val === '' || isNaN(parseInt(val))) { return clearDetailPanel('loc', true); }   
    if ($('#loc-map').length) { removeLocMap(); }
    var locRcrd = fP.records.location[val];                                     //console.log("location = %O", locRcrd);
    var prntVal = locRcrd.parent ? locRcrd.parent : locRcrd.id;
    _cmbx.setSelVal('#Country-Region-sel', prntVal, 'silent');
    fillLocDataInDetailPanel(val);
    if (!fP.editing) { $('#Location_pin').focus(); }
    _elems.checkIntFieldsAndEnableSubmit();
}
/** Displays the selected location's data in the side detail panel. */
function fillLocDataInDetailPanel(id) {  
    var locRcrd = fP.records.location[id];  
    var propObj = getLocDetailDataObj(locRcrd);
    addDataToIntDetailPanel('loc', propObj);
}
/** Returns an object with selected location's data. */
function getLocDetailDataObj(locRcrd) {  
    const data = {};
    const allData = getAllLocData(locRcrd);

    for (let field in allData) {
        if (!allData[field]) { continue; }
        data[field] = allData[field];
    }
    return data;
}
function getAllLocData(locRcrd) {
    return {
        'Name': locRcrd.displayName, 
        'Description': locRcrd.description || '',            
        'Habitat Type': locRcrd.habitatType ? locRcrd.habitatType.displayName : '', 
        'Latitude': locRcrd.latitude || '',
        'Longitude': locRcrd.longitude || '',
        'Elevation': locRcrd.elevation || '',            
        'Elevation Max': locRcrd.elevationMax || '',       
    };
}
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
    disableTopFormLocNote();
    addMapToLocForm('#location_Rows', 'create');
    addNotesToForm();
    addListenerToGpsFields();
    scrollToLocFormWindow();
}
/** When the Location sub-form is exited, the Country/Region combo is reenabled. */
export function enableCountryRegionField() {  
    _cmbx.enableCombobox('#Country-Region-sel');
    $('#loc-note').fadeTo(400, 1);
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
export function selectLoc(id) {
    $('#sub-form').remove();
    _cmbx.setSelVal('#Location-sel', id);
    enableCountryRegionField();
    _cmbx.enableCombobox('#Location-sel');
    removeLocMap();
}
/** Location edit form: merges location being edited with another displayed on the map. */
export function mergeLocs(id) {                                                 console.log('Merge location being edited into this one = ', id);
    // body...
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
function removeLocMap() {
    $('#loc-map').fadeTo(400, 0, () => $('#loc-map').remove());
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
function getObjectRealm() {
    return !fP.forms.taxonPs ? 'Plant' : (fP.forms.taxonPs.objectRealm || 'Plant');
}   
/** --------------------- Form Methods ---------------------------------- */
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
    const fLvl = getSubFormLvl('sub');
    if ($('#'+fLvl+'-form').length !== 0) { return errIfAnotherSubFormOpen('Subject', fLvl); }  
    return initTaxonParams('Subject', 'Bat')
    .then(initSubjForm)
    .then(appendSubjFormAndFinishBuild);

    function initSubjForm() {
        return initEntitySubForm('subject', fLvl, 'sml-sub-form', {}, '#Subject-sel');
    }
    function appendSubjFormAndFinishBuild(form) {
        $('#Subject_row').append(form);
        _cmbx.initFormCombos('subject', fLvl, fP.forms[fLvl].selElems);           
        finishTaxonSelectUi('Subject');  
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
    const fLvl = getSubFormLvl('sub');
    if ($('#'+fLvl+'-form').length !== 0) { return errIfAnotherSubFormOpen('Object', fLvl); }
    const realmName = getSelectedObjectRealm($('#Object-sel').val()); 
    return initTaxonParams('Object', realmName)
    .then(initObjForm)
    .then(appendObjFormAndFinishBuild);

    function initObjForm() {
        return initEntitySubForm('object', fLvl, 'sml-sub-form', {}, '#Object-sel');
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
    if (!id) { return getObjectRealm(); }
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
    $('#'+getSubFormLvl('sub')+'-form').remove();
    enableTaxonCombos();
    if (!fP.editing) { $('#Subject_pin').focus(); }
}
/**
 * When complete, the 'Select Object' form is removed and the most specific 
 * taxonomic data is displayed in the interaction-form Object combobox. 
 */
function onObjectSelection(val) {                                               //console.log("object selected = ", val);
    if (val === "" || isNaN(parseInt(val))) { return; } 
    $('#'+getSubFormLvl('sub')+'-form').remove();
    enableTaxonCombos();
    if (!fP.editing) { $('#Object_pin').focus(); }
}
export function enableTaxonCombos() {
    _cmbx.enableCombobox('#Subject-sel');
    _cmbx.enableCombobox('#Object-sel');
}
/**
 * Customizes the taxon-select form ui. Either re-sets the existing taxon selection
 * or brings the first level-combo into focus. Clears the [role]'s' combobox. 
 */
function finishTaxonSelectUi(role) {                                            //console.log('finishTaxonSelectUi')
    const fLvl = getSubFormLvl('sub');
    const selCntnr = role === 'Subject' ? '#'+fLvl+'-form' : '#realm-lvls';
    customizeElemsForTaxonSelectForm(role);
    if (ifResettingTxn(role)) { resetPrevTaxonSelection($('#'+role+'-sel').val());
    } else { _cmbx.focusFirstCombobox(selCntnr); }
    _u.replaceSelOpts('#'+role+'-sel', []);
}
function ifResettingTxn(role) {  
    return $('#'+role+'-sel').val() || fP.forms.taxonPs.prevSel.reset;
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
        finishTaxonSelectUi('Object');          
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
    openCreateForm(selElem.id.split('-sel')[0]);
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
/*-------------- Sub Form Helpers ----------------------------------------------------------*/
/*-------------- Publisher -----------------------------------------------*/
function onPublSelection(val) {
    if (val === 'create') { return openCreateForm('Publisher'); }        
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
    if (val === 'create') { return openCreateForm(authType, --cnt); }        
    if (citationFormNeedsCitTextUpdate(fLvl)) { handleCitText(fLvl); }
    if (lastAuthComboEmpty(cnt-1, authType)) { return; }
    buildNewAuthorSelect(cnt, val, fLvl, authType);
}
export function citationFormNeedsCitTextUpdate(fLvl) {
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
/** Returns a comma seperated sting of all authors attributed to the source. */
function getAuthorNames(srcRcrd, editors) {
    const authStr = [];  
    const prop = editors ? 'editors' : 'authors'; 
    for (let ord in srcRcrd[prop]) {
        let authId = srcRcrd[prop][ord];
        authStr.push(getAuthName(authId));
    }
    return authStr.length ? authStr.join('. ')+'.' : authStr;
}
/** Returns the name of the author with the passed id. */
function getAuthName(id) {
    const auth = fP.records.source[id];
    return auth.displayName;  
}
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
    if (ifOpenSubForm(fLvl)) { return show_errs.openSubFormErr(fLvl); }
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
    const formConfg = _fCnfg.getFormConfg(entity);                                 
    initFormLevelParamsObj(entity, fLvl, pSel, formConfg, 'create');        
    return _elems.initSubForm(fP, fLvl, fClasses, fVals, pSel);
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
function openCreateForm(entity, cnt) {
    const selId = cnt ? '#'+entity+'-sel'+cnt : '#'+entity+'-sel';
     $(selId)[0].selectize.createItem('create'); 
}
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
export function getFormValuesAndSubmit(id, fLvl, entity) {                             console.log("       --getFormValuesAndSubmit. id = %s, fLvl = %s, entity = %s", id, fLvl, entity);
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
function addDataToStoredRcrds(entity, detailEntity) {                           console.log('updateStoredFormParams. [%s] (detail ? [%s]) fP = %O', entity, detailEntity, fP);
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
/** 
 * Resets the interactions form leaving only the pinned values. Displays a 
 * success message. Disables submit button until any field is changed. 
 */
export function resetInteractionForm() {
    const vals = getPinnedFieldVals();                                          //console.log("vals = %O", vals);
    showSuccessMsg('New Interaction successfully created.', 'green');
    initFormParams('create', 'interaction')
    .then(resetFormUi);

    function resetFormUi() {
        resetIntFields(vals); 
        $('#top-cancel').val(' Close ');  
        disableSubmitBttn("#top-submit");
        fP.forms.top.unchanged = true;
    }
}
/** Shows a form-submit success message at the top of the interaction form. */
function showSuccessMsg(msg, color) {
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
    disableSubmitBttn("#top-submit");
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
    clearFieldDetailPanel(fieldName);
    _cmbx.clearCombobox('#'+fieldName+'-sel');
}
function clearFieldDetailPanel(field) {
    let detailFields = {
        'Location': 'loc', 'CitationTitle': 'src', 'Publication': 'src' };
    if (Object.keys(detailFields).indexOf(field) !== -1) {  
        clearDetailPanel(detailFields[field], true);
    }
}
function fillPubDetailsIfPinned(pub) {
    if (pub) { updateSrcDetailPanel('pub'); 
    } else { _cmbx.enableCombobox('#CitationTitle-sel', false); }
}
/** Inits the necessary interaction form params after form reset. */
function initInteractionParams() {
    initFormLevelParamsObj(
        "interaction", "top", null, _fCnfg.getFormConfg("interaction"), "create");
    addReqElemsToConfg();
}
function addReqElemsToConfg() {
    const reqFields = ["Publication", "CitationTitle", "Subject", "Object", 
        "InteractionType"];
    fP.forms.top.reqElems = reqFields.map(field => $('#'+field+'-sel')[0]);
}
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
    exitForm('#'+fLvl+'-form', fLvl); 
    if (fP.forms[fLvl].pSelId) { addAndSelectEntity(data, fLvl); 
    } else { fP = {}; }
}
/** Adds and option for the new entity to the form's parent elem, and selects it. */
function addAndSelectEntity(data, fLvl) {
    const selApi = $(fP.forms[fLvl].pSelId)[0].selectize;        
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
