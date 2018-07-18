/**
 * When logged in as an 'admin' or 'super': 
 * >> On the database search page, multiple admin-ui elements are added that open 
 * a popup interface allowing the creating, updating and, soon, deleting of data.   
 * >> All Content Blocks will have an edit icon attached to the top left of their 
 * container. When clicked, a wysiwyg interface will encapsulate that block and 
 * allow editing and saving of the content within using the trumbowyg library.
 * Exports: 
 *     editEntity
 */
import * as _util from '../misc/util.js';
import * as db_sync from './db-sync.js';
import * as db_page from './db-page.js';
import * as idb from 'idb-keyval'; //set, get, del, clear

let fParams = {};

authDependentInit();    

function authDependentInit() {   
    const userRole = $('body').data("user-role");                               //console.log("crud.js role = ", userRole);
    if (['editor', 'admin', 'super'].indexOf(userRole) !== -1) {                //console.log("admin CRUD ACTIVATE!! ");
        if ($('body').data("this-url") === "/search") { buildSearchPgFormUi(); }
    }
}
/*--------------------- SEARCH PAGE CRUD-FORM ----------------------------------------------------*/
/** Adds a "New" button under the top grid focus options. */
function buildSearchPgFormUi() {
    var bttn = _util.buildElem('button', { 
            text: 'New', name: 'createbttn', class: 'adminbttn' });
    $(bttn).click(createEntity.bind(null, 'create', 'interaction'));
    $('#opts-col1').append(bttn);
}
/*-------------- Form HTML Methods -------------------------------------------*/
/** Builds and shows the popup form's structural elements. */
function showFormPopup(actionHdr, entity, id) {
    var title = actionHdr + " " + entity;
    $('#b-overlay-popup').addClass('form-popup');
    $('#b-overlay').addClass('form-ovrly');
    $('#b-overlay-popup').append(getFormWindowElems(entity, id, title));
    setFormSize(entity);
    $('#b-overlay, #b-overlay-popup').css({display: 'flex'});        
}
/** Adds the width to both the popup window and the form element for each entity. */
function setFormSize(entity) {
    var sizeConfgs = { 
        '1500': {
            'Interaction': { popup: '1510px', form: '999px' },
            'Publication': { popup: '72%', form: '999px' },
            'Publisher': { popup: '48%', form: '55%' },
            'Citation': { popup: '72%', form: '999px' },
            'Author': { popup: '48%', form: '55%' },
            'Location': { popup: '72%', form: '999px' },
            'Taxon': { popup: '808px', form: '60%' },
        },
        '1366': {
            'Interaction': { popup: '97%', form: '924px' },
            'Publication': { popup: '92%', form: '920px' },
            'Publisher': { popup: '58%', form: '460px' },
            'Citation': { popup: '92%', form: '920px' },
            'Author': { popup: '58%', form: '460px' },
            'Location': { popup: '92%', form: '920px' },
            'Taxon': { popup: '808px', form: '450px' },
    }};
    var wKey = $(window).width() > 1499 ? '1500' : '1366';
    var confg = sizeConfgs[wKey][entity];                                       //console.log("setFormSize [%s] confg = %O", entity, confg);
    $('.form-popup').css({'width': confg.popup});
    $('#form-main').css({'flex': '0 0 '+ confg.form});
}
function hideSearchFormPopup() {
    $('#b-overlay-popup, #b-overlay').css({display: 'none'});
}
/**
 * Returns the form window elements - the form and the detail panel.
 * section>(div#form-main(header, form), div#form-details(hdr, pub, cit, loc), footer)
 */
function getFormWindowElems(entity, id, title) {
    return [getExitButtonRow(), getFormHtml(entity, id, title)];
}
function getExitButtonRow() {
    var row = _util.buildElem('div', { class: 'exit-row' });
    $(row).append(getExitButton());
    return row;        
}
function getExitButton() {
    var bttn = _util.buildElem('input', {
       'id':'exit-form', 'class':'grid-bttn exit-bttn', 'type':'button', 'value':'X' });
    $(bttn).click(exitFormPopup);
    return bttn;
}
function getFormHtml(entity, id, title) {
    var cntnr = _util.buildElem('div', { class: 'flex-row' });
    $(cntnr).append([getMainFormHtml(title), getDetailPanelElems(entity, id)]);
    return cntnr;
}
function getMainFormHtml(title) {
    var formWin = _util.buildElem("div", { "id": "form-main" });
    $(formWin).append(getHeaderHtml(title));
    return formWin;
}
function getHeaderHtml(title) {
    return _util.buildElem("h1", { "id": "top-hdr", "text": title });
}
/** Returns popup and overlay to their original/default state. */
function exitFormPopup(e, skipReset) { 
    hideSearchFormPopup();
    if (!skipReset) { refocusGridIfFormWasSubmitted(); }
    $("#b-overlay").removeClass("form-ovrly");
    $("#b-overlay-popup").removeClass("form-popup");
    $("#b-overlay-popup").empty();
    fParams = {};
}
/**
 * If the form was not submitted the grid does not reload. Otherwise, if exiting 
 * the edit-forms, the grid will reload with the current focus; or, after creating 
 * an interaction, the grid will refocus into source-view. Exiting the interaction
 * forms also sets the 'int-updated-at' filter to 'today'.
 */
function refocusGridIfFormWasSubmitted() {                                      console.log('submitFocus = [%s]', fParams.submitFocus);
    if (!fParams.submitFocus) { return; }
    if (fParams.submitFocus == 'int') { return refocusAndShowUpdates(); }   
    db_page.initSearchGrid(fParams.submitFocus);
}
function refocusAndShowUpdates() {                                              //console.log('refocusAndShowUpdates.')
    var focus  = fParams.action === 'create' ? 'srcs' : null;
    db_page.showUpdates(focus);   
}
function getDetailPanelElems(entity, id) {                                      //console.log("getDetailPanelElems. action = %s, entity = %s", fParams.action, fParams.entity)
    var getDetailElemFunc = fParams.action === 'edit' && fParams.entity !== 'interaction' ?
        getSubEntityEditDetailElems : getInteractionDetailElems;
    var cntnr = _util.buildElem('div', { 'id': 'form-details' });
    var intIdStr = id ? 'Id:  ' + id : '';
    $(cntnr).append(_util.buildElem('h3', { 'text': entity + ' Details' }));
    $(cntnr).append(getDetailElemFunc(entity, id, cntnr));
    $(cntnr).append(_util.buildElem('p', { id: 'ent-id',  'text': intIdStr }));
    return cntnr;
}
function getInteractionDetailElems(entity, id, cntnr) {
    return ['src','loc'].map(en => initDetailDiv(en));
}
function initDetailDiv(ent) {
    var entities = {'src': 'Source', 'loc': 'Location'};
    var div = _util.buildElem('div', { 'id': ent+'-det', 'class': 'det-div' });
    $(div).append(_util.buildElem('h5', { 'text': entities[ent]+':' }));        
    $(div).append(_util.buildElem('div', { 'text': 'None selected.' }));
    return div;
}
/** Returns the elems that will display the count of references to the entity. */
function getSubEntityEditDetailElems(entity, id, cntnr) {                       //console.log("getSubEntityEditDetailElems for [%s]", entity);
    var refEnts = {
        'Author': [ 'cit', 'int' ],     'Citation': [ 'int' ],
        'Location': [ 'int' ],          'Publication': ['cit', 'int' ],
        'Taxon': [ 'ord', 'fam', 'gen', 'spc', 'int' ],   
        'Publisher': [ 'pub', 'int']  
    };
    var div = _util.buildElem('div', { 'id': 'det-cnt-cntnr' });
    $(div).append(_util.buildElem('span'));        
    $(div).append(refEnts[entity].map(en => initCountDiv(en)));
    return div;
}
function initCountDiv(ent) { 
    var entities = { 'cit': 'Citations', 'fam': 'Families', 'gen': 'Genera', 
        'int': 'Interactions', 'loc': 'Locations', 'ord': 'Orders',
        'pub': 'Publications', 'spc': 'Species', 'txn': 'Taxa', 
    };
    var div = _util.buildElem('div', { 'id': ent+'-det', 'class': 'cnt-div flex-row' });
    $(div).append(_util.buildElem('div', {'text': '0' }));
    $(div).append(_util.buildElem('span', {'text': entities[ent] }));
    return div;
}
/** Adds a count of references to the entity-being-edited, by entity, to the panel. */
function addDataToCntDetailPanel(refObj) {
    for (var ent in refObj) {
        $('#'+ent+'-det div')[0].innerText = refObj[ent];    
    }
}
/**
 * When the Publication, Citation, or Location fields are selected, their data 
 * is added to the side detail panel of the form. For other entity edit-forms: 
 * the total number of referencing records is added. 
 */
function addDataToIntDetailPanel(ent, propObj) {
    var html = getDataHtmlString(propObj);
    emptySidePanel(ent);
    $('#'+ent+'-det div').append(html);
}
function emptySidePanel(ent, reset) {
    if (ent === 'cit') { return updateSrcDetailPanel('cit'); }
    if (ent === 'pub') { ent = 'src'; }
    $('#'+ent+'-det div').empty();
    if (reset) { $('#'+ent+'-det div').append('None selected.') }
}
/** Returns a ul with an li for each data property */
function getDataHtmlString(props) {
    var html = [];
    for (var prop in props) {
        html.push('<li><b>'+prop+'</b>: '+ props[prop]+ '</li>');
    }
    return '<ul class="ul-reg">' + html.join('\n') + '</ul>';
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
 * Sets the global fParams obj with the params necessary throughout the form code. 
 * -- Property descriptions:
 * > action - ie, Create, Edit.
 * > editing - Container for the id(s) of the record(s) being edited. (Detail 
        ids are added later). False if not editing.
 * > entity - Name of this form's entity     
 * > forms - Container for form-specific params 
 *  >> expanded - Obj of form entities(k) and their showAll/showDefault fields state(v)
 * > formLevels - An array of the form level names/tags/prefixes/etc.
 * > records - An object of all records, with id keys, for each of the 
 *   root entities- Interaction, Location, Source and Taxa.
 * > submitFocus - Stores the grid-focus for the entity of the most recent 
        form submission. Will be used on form-exit.
 */
function initFormParams(action, entity, id) {   
    const prevSubmitFocus = fParams.submitFocus;
    const xpandedForms = fParams.forms ? fParams.forms.expanded : {};
    fParams = {
        action: action,
        editing: action === 'edit' ? { core: id || null, detail: null } : false,
        entity: entity,
        forms: { expanded: xpandedForms },
        formLevels: ['top', 'sub', 'sub2'],
        records: _util.getDataFromStorage(['source', 'location', 'taxon']),
        submitFocus: prevSubmitFocus || false
    };
    initFormLevelParamsObj(entity, 'top', null, getFormConfg(entity), action); console.log("####fPs = %O", fParams)
}
/**
 * Adds the properties and confg that will be used throughout the code for 
 * generating, validating, and submitting sub-form. 
 * -- Property descriptions:
 * > action - eg, Create, Edit.
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
 * > Taxon forms: taxonPs - added to fParams.forms (see props @initTaxonParams)
 * > Location forms: geoJson - geoJson entity for this location, if it exists.
 */
function initFormLevelParamsObj(entity, level, pSel, formConfg, action) {       //console.log("initLvlParams. fP = %O, arguments = %O", fParams, arguments)
    fParams.forms[entity] = level;
    fParams.forms[level] = {
        action: action,
        confg: formConfg,
        typeConfg: false,
        fieldConfg: { fields: {}, vals: {}, required: [] },
        entity: entity,
        exitHandler: getFormExitHandler(formConfg, action),
        misc: {},
        pSelId: pSel,
        reqElems: [],
        selElems: [], 
        typeConfg: false,
        vals: {}
    };                                                                          //console.log("fLvl params = %O", fParams.forms[level]);
}
/**
 * Returns the exitHandler stored in the form confg for the current action, or, 
 * if no handler is stored, edit forms have a default of @exitFormHandler
 * and create forms default to noOp.
 */
function getFormExitHandler(confg, action) {                                    //console.log('getFormExitHandler. action = %s, confg = %O', action, confg);
    return confg.exitHandler && confg.exitHandler[action] ? 
        confg.exitHandler[action] :
        action === 'edit' ? exitFormPopup : Function.prototype;
}
/*------------------- Form Functions -------------------------------------------------------------*/
/*--------------------------- Edit Form --------------------------------------*/
/** Shows the entity's edit form in a pop-up window on the search page. */
export function editEntity(id, entity) {                                        console.log("Editing [%s] [%s]", entity, id);  
    initFormParams("edit", entity, id);
    showFormPopup('Editing', _util.ucfirst(entity), id);
    initEditForm(id, entity);    
}
/** Inits the edit top-form, filled with all existing data for the record. */
function initEditForm(id, entity) {  
    const form = buildFormElem();  
    const formFields = getEditFormFields(id, entity);
    $(form).append(formFields);
    $('#form-main').append(form);     
    finishEditFormBuild(entity);
    fillExistingData(entity, id);
}   
function finishEditFormBuild(entity) {
    const hndlrs = {
        'interaction': finishIntFormBuild, 'taxon': finishTaxonEditFormBuild,
        'citation': finishCitEditFormBuild
    };
    if (entity in hndlrs) { hndlrs[entity]()  
    } else {
        initComboboxes(entity, 'top'); 
        $('#top-cancel').unbind('click').click(exitFormPopup);
        $('.all-fields-cntnr').hide();
    }
}
/** Returns the form fields for the passed entity.  */
function getEditFormFields(id, entity) {
    const rowCntnr = _util.buildElem('div', {
        id: entity+'_Rows', class: 'flex-row flex-wrap'});
    const edges = { 'citation': getSrcTypeFields, 'interaction': getIntFormFields, 
        'publication': getSrcTypeFields, 'taxon': getTaxonEditFields };
    const fieldBldr = entity in edges ? edges[entity] : buildEditFormFields;  
    fParams.forms.expanded[entity] = true;
    $(rowCntnr).append(fieldBldr(entity, id));                              
    return [rowCntnr, buildFormBttns(entity, 'top', 'edit')];
}   
function getIntFormFields(entity, id) {
    return buildIntFormFields('edit');
}
function getSrcTypeFields(entity, id) {
    const srcRcrd = getEntityRecord('source', id);
    const typeRcrd = getEntityRecord(entity, srcRcrd[entity]);
    const typeId = typeRcrd[entity+'Type'].id;
    return getSrcTypeRows(entity, typeId, 'top', typeRcrd[entity+'Type'].displayName)
}
/** Returns the passed entity's form fields. */
function buildEditFormFields(entity, id) {
    const formConfg = getFormConfg(entity);
    return getFormFieldRows(entity, formConfg, {}, 'top', false);
}
/*------------------- Fills Edit Form Fields -----------------------------*/
/** Fills form with existing data for the entity being edited. */
function fillExistingData(entity, id) {
    addDisplayNameToForm(entity, id);
    fillEntityData(entity, id); 
    if (ifAllRequiredFieldsFilled('top')) { enableSubmitBttn('#top-submit'); }
}
function addDisplayNameToForm(ent, id) {
    if (ent === 'interaction') { return; }
    var prnt = getParentEntity(ent);
    var entity = prnt || ent;
    var rcrd = getEntityRecord(entity, id);                                     console.log('[%s] rcrd = %O', entity, rcrd);
    $('#top-hdr')[0].innerText += ': ' + rcrd.displayName; 
    $('#det-cnt-cntnr span')[0].innerText = 'This ' + ent + ' is referenced by:';
}
function fillEntityData(ent, id) {
    const hndlrs = { "author": fillSrcData, "citation": fillSrcData,
        "location": fillLocData, "publication": fillSrcData, 
        "publisher": fillSrcData, "taxon": fillTaxonData, 
        "interaction": fillIntData };
    const rcrd = getEntityRecord(ent, id);                                      //console.log("fillEntityData [%s] [%s] = %O", ent, id, rcrd);
    hndlrs[ent](ent, id, rcrd);
}
function fillIntData(entity, id, rcrd) {  
    var fields = {
        "InteractionType": "select", "Location": "select", "Note": "textArea", 
        "Object": "taxon", "Source": "source", "Subject": "taxon", 
        "InteractionTags": "tags" };
    fillFields(rcrd, fields, true);
}
function fillLocData(entity, id, rcrd) {
    var fields = getCoreFieldDefs(entity);
    fillFields(rcrd, fields);
    addDataToCntDetailPanel({ 'int': rcrd.interactions.length });
    fParams.editing.detail = rcrd.geoJsonId || null;
    if (rcrd.geoJsonId) { idb.get('geoJson').then(storeLocGeoJson); }
    
    function storeLocGeoJson(geoJson) {
        fParams.forms.top.geoJson = JSON.parse(geoJson[rcrd.geoJsonId]);
    }
} /* End fillLocData */
function fillTaxonData(entity, id, rcrd) {                                      //console.log('fillTaxonData. rcrd = %O', rcrd)
    var refs = { 
        'int': getTtlIntCnt('taxon', rcrd, 'objectRoles') || 
            getTtlIntCnt('taxon', rcrd, 'subjectRoles')
    };
    getTaxonChildRefs(rcrd);  
    addDataToCntDetailPanel(refs);
    removeEmptyDetailPanelElems();

    function getTaxonChildRefs(txn) {
        txn.children.forEach(function(child) { addChildRefData(child); });
    }
    function addChildRefData(id) {
        var lvlKeys = {'Order':'ord','Family':'fam','Genus':'gen','Species':'spc'};
        var child = fParams.records.taxon[id];              
        var lvlK = lvlKeys[child.level.displayName];       
        if (!refs[lvlK]) { refs[lvlK] = 0; }
        refs[lvlK] += 1;
        getTaxonChildRefs(child);
    }
} /* End fillTaxonData */
function removeEmptyDetailPanelElems() {  
    var singular = { 'Orders': 'Order', 'Families': 'Family', 'Genera': 'Genus',
        'Species': 'Species', 'Interactions': 'Interaction' };                                       
    $.each($('[id$="-det"] div'), function(i, elem) {
        if (elem.innerText == 0) {  elem.parentElement.remove(); }
        if (elem.innerText == 1) {  elem.nextSibling.innerText = singular[elem.nextSibling.innerText]; }
    });
}
/** Fills all data for the source-type entity.  */
function fillSrcData(entity, id, rcrd) { 
    var src = getEntityRecord("source", id);
    var fields = getSourceFields(entity);  
    setSrcData();
    setDetailData();

    function setSrcData() {
        fillFields(src, fields.core);
        fillEditSrcDetails(entity, src);            
    }
    function setDetailData() {
        var detail = getEntityRecord(entity, src[entity]);                      //console.log("fillSrcData [%s] src = %O, [%s] = %O", id, src, entity, detail);
        fillFields(detail, fields.detail);
        setAdditionalFields(entity, src, detail);
        fParams.editing.detail = detail.id;
    }
} /* End fillSrcData */
function getSourceFields(entity) {
    return { core: getCoreFieldDefs(entity), detail: getFormConfg(entity).add };
}
/** Adds a count of all refences to the entity to the form's detail-panel. */
function fillEditSrcDetails(entity, srcRcrd) {                                  //console.log('fillEditSrcDetails. [%s]. srcRcrd = %O', entity, srcRcrd);
    var refObj = { 'int': getSrcIntCnt(entity, srcRcrd) };
    addAddtionalRefs();                                                         //console.log('refObj = %O', refObj);
    addDataToCntDetailPanel(refObj);

    function addAddtionalRefs() {
        if (entity === 'citation') { return; }
        const ref = entity === 'publisher' ? 'pub' : 'cit';
        refObj[ref] = srcRcrd.children.length || srcRcrd.contributions.length;
    }
} /* End fillEditSrcDetails */
function getSrcIntCnt(entity, rcrd) {                                       //console.log('getSrcIntCnt. rcrd = %O', rcrd);
    return entity === 'citation' ? 
        rcrd.interactions.length : getTtlIntCnt('source', rcrd, 'interactions'); 
}
/** ----------- Shared ---------------------------- */
function getTtlIntCnt(entity, rcrd, intProp) {                              //console.log('getTtlIntCnt. [%s] rcrd = %O', intProp, rcrd);
    var ints = rcrd[intProp].length;
    if (rcrd.children.length) { ints += getChildIntCnt(entity, rcrd.children, intProp);}
    if (rcrd.contributions) { ints += getChildIntCnt(entity, rcrd.contributions, intProp);}        
    return ints;
}
function getChildIntCnt(entity, children, intProp) {
    var ints = 0;
    children.forEach(function(child){ 
        child = fParams.records[entity][child];
        ints += getTtlIntCnt(entity, child, intProp); 
    });
    return ints;
}
function fillFields(rcrd, fields, shwAll) {                                 //console.log('rcrd = %O, fields = %O', rcrd, fields);
    const fieldHndlrs = {
        'text': setText, 'textArea': setTextArea, 'select': setSelect, 
        'fullTextArea': setTextArea, 'multiSelect': addToFormVals,
        'tags': setTagField, 'cntry': setCntry, 'source': addSource, 
        'taxon': addTaxon
    };
    for (let field in fields) {                                             //console.log('------- Setting field [%s]', field);
        if (!fieldIsDisplayed(field, 'top') && !shwAll) { continue; }       //console.log("field [%s] type = [%s] fields = [%O] fieldHndlr = %O", field, fields[field], fields, fieldHndlrs[fields[field]]);
        addDataToField(field, fieldHndlrs[fields[field]], rcrd);
    }  
}
function addDataToField(field, fieldHndlr, rcrd) {                          //console.log("addDataToField [%s] [%0] rcrd = %O", field, fieldHndlr, rcrd);
    var elemId = field.split(' ').join('');
    var prop = _util.lcfirst(elemId);
    fieldHndlr(elemId, prop, rcrd);
}
/** Adds multiSelect values to the form's val object. */
function addToFormVals(fieldId, prop, rcrd) {                               //console.log("addToFormVals [%s] [%s] rcrd = %O", fieldId, prop, rcrd);
    const vals = fParams.forms.top.fieldConfg.vals;
    vals[fieldId] = {type: 'multiSelect'};
    vals[fieldId].val = rcrd[prop]; 
    if (!$('#'+_util.ucfirst(prop)+'-sel-cntnr').length) { return; }
    selectExistingAuthors(_util.ucfirst(prop), rcrd[prop], 'top');
}
function setText(fieldId, prop, rcrd) {                                     //console.log("setTextField [%s] [%s] rcrd = %O", fieldId, prop, rcrd);
    $('#'+fieldId+'_row input').val(rcrd[prop]).change();   
}
function setTextArea(fieldId, prop, rcrd) {
    $('#'+fieldId+'_row textarea').val(rcrd[prop]).change();   
}
function setSelect(fieldId, prop, rcrd) {                                   //console.log("setSelect [%s] [%s] rcrd = %O", fieldId, prop, rcrd);
    var id = rcrd[prop] ? rcrd[prop].id ? rcrd[prop].id : rcrd[prop] : null;
    $('#'+fieldId+'-sel')[0].selectize.addItem(id);
}
function setTagField(fieldId, prop, rcrd) {                                 //console.log("setTagField. rcrd = %O", rcrd)
    var tags = rcrd[prop] || rcrd.tags;
    tags.forEach(function(tag) {  
        $('#'+fieldId+'-sel')[0].selectize.addItem(tag.id);
    });
}    
function setCntry(fieldId, prop, rcrd) {
    $('#Country-sel')[0].selectize.addItem(rcrd.country.id);
}
function setAdditionalFields(entity, srcRcrd, detail) {
    setTitleField(entity, srcRcrd);
    setPublisherField(entity, srcRcrd);
    setCitationEdgeCaseFields(entity, detail);
}
function setTitleField(entity, srcRcrd) {                                   //console.log("setTitleField [%s] rcrd = %O", entity, srcRcrd)
    if (["publication", "citation"].indexOf(entity) === -1) { return; }
    const name = entity === 'publication' ? 
        srcRcrd.displayName : getCitTitle(srcRcrd.citation);
    $('#Title_row input[type="text"]').val(name).change();
    function getCitTitle(citId) {
        return getEntityRecord('citation', citId).displayName;
    }
} /* End setTitleField */
function setPublisherField(entity, srcRcrd) { 
    if (entity !== 'publication' || !fieldIsDisplayed('Publisher', 'top')) { return; }
    $('#Publisher-sel')[0].selectize.addItem(srcRcrd.parent);
}
function setCitationEdgeCaseFields(entity, citRcrd) {
    if (entity !== 'citation') { return; }
    $('#CitationText_row textarea').val(citRcrd.fullText);
    $('#Issue_row input[type="text"]').val(citRcrd.publicationIssue);
    $('#Pages_row input[type="text"]').val(citRcrd.publicationPages);
    $('#Volume_row input[type="text"]').val(citRcrd.publicationVolume);
}
function addTaxon(fieldId, prop, rcrd) {                                    //console.log("addTaxon [%s] [%O] rcrd = %O", fieldId, prop, rcrd);
    var selApi = $('#'+ fieldId + '-sel')[0].selectize;
    var taxon = fParams.records.taxon[rcrd[prop]];                          
    selApi.addOption({ value: taxon.id, text: getTaxonDisplayName(taxon) });
    selApi.addItem(taxon.id);
}
function addSource(fieldId, prop, rcrd) {
    var citSrc = fParams.records.source[rcrd.source];  
    $('#Publication-sel')[0].selectize.addItem(citSrc.parent);
    $('#CitationTitle-sel')[0].selectize.addItem(rcrd.source);
}
/*--------------------------- Create Form --------------------------------------------------------*/
/**
 * Fills the global fParams obj with the basic form params @initFormParams. 
 * Init the create interaction form and append into the popup window @initCreateForm. 
 */
function createEntity(id, entity) {                                             //console.log('Creating [%s] [%s]', entity, id);  
    initFormParams('create', entity);
    showFormPopup('New', _util.ucfirst(entity), null);
    initCreateForm();
}
/**
 * Inits the interaction form with all fields displayed and the first field, 
 * publication, in focus. From within many of the fields the user can create 
 * new entities of the field-type by selecting the 'add...' option from the 
 * field's combobox and completing the appended sub-form.
 */
function initCreateForm() {
    const form = buildFormElem();
    const div = _util.buildElem('div', { id: 'interaction_Rows', class: 'flex-row flex-wrap' });
    $(div).append(buildIntFormFields('create'));                                //console.log("formFields = %O", formFields);
    $(form).append([div, buildFormBttns('interaction', 'top', 'create')]);
    $('#form-main').append(form);      
    finishIntFormBuild();
    finishCreateFormBuild();
}      
function finishCreateFormBuild() {
    focusCombobox('#Publication-sel');
    enableCombobox('#CitationTitle-sel', false);
}
/*------------------- Interaction Form Methods (Shared) ----------------------*/ 
/**
 * Inits the selectize comboboxes, adds/modifies event listeners, and adds 
 * required field elems to the form's config object.  
 */
function finishIntFormBuild() {
    initComboboxes('interaction', 'top');
    ['Subject', 'Object'].forEach(addTaxonFocusListener);
    $('#top-cancel').unbind('click').click(exitFormPopup);
    $('#Note_row label')[0].innerText += 's';
    $('#Country-Region_row label')[0].innerText = 'Country/Region';
    addReqElemsToConfg();    
    $('.all-fields-cntnr').hide();
    $('#Publication-sel')[0].selectize.focus();
}
/** Displays the [Role] Taxon select form when the field gains focus. */ 
function addTaxonFocusListener(role) {
    const func = { 'Subject': initSubjectSelect, 'Object': initObjectSelect };
    $(document).on('focus', '#'+role+'-sel + div div.selectize-input', func[role]);
}
function addReqElemsToConfg() {
    const reqFields = ["Publication", "CitationTitle", "Subject", "Object", 
        "InteractionType"];
    fParams.forms.top.reqElems = reqFields.map(function(field) {
        return $('#'+field+'-sel')[0];
    });
}
/*-------------- Form Builders -------------------------------------------------------------------*/
/** Builds and returns all interaction-form elements. */
function buildIntFormFields(action) { 
    const builders = [ buildPubFieldRow, buildCitFieldRow, buildCntryRegFieldRow,
        buildLocFieldRow, initSubjField, initObjField, buildIntTypeField,
        buildIntTagField, buildIntNoteField ];
    return builders.map(buildField);
}
function buildField(builder) {
    const field = builder();                                                //console.log("field = %O", field);
    ifSelectAddToInitAry(field);
    return field;
}
/** Select elems with be initialized into multi-functional comboboxes. */
function ifSelectAddToInitAry(field) {
    const fieldType = field.children[1].children[1].nodeName; 
    if (fieldType !== "SELECT") { return; }  
    const fieldName = field.id.split('_row')[0];
    fParams.forms.top.selElems.push(fieldName);
}
/*-------------- Publication ---------------------------------------------*/
/**
 * Returns a form row with a publication select dropdown populated with all 
 * current publication titles.
 */
function buildPubFieldRow() {
    const selElem = _util.buildSelectElem( getSrcOpts('pubSrcs'), 
        { id: 'Publication-sel', class: 'lrg-field' });
    return buildFormRow('Publication', selElem, 'top', true);
}
/** 
 * When an existing publication is selected, the citation field is filled with 
 * all current citations for the publciation. When a publication is created, 
 * the citation form is automatically opened. 
 */
function onPubSelection(val) { 
    if (val === 'create') { return openCreateForm('Publication'); }        
    if (val === '' || isNaN(parseInt(val)) ) { return onPubClear(); }                                
    fillCitationField(val);
    updateSrcDetailPanel('pub');
    if (!fParams.records.source[val].children.length) { return initCitForm(); }
    if (!fParams.editing) { $('#Publication_pin').focus(); }
}
function onPubClear() {
    clearCombobox('#CitationTitle-sel');
    enableCombobox('#CitationTitle-sel', false);
    emptySidePanel('pub', true);
}
/** Displays the selected publication's data in the side detail panel. */
function fillPubDetailPanel(id) {  
    var srcRcrd = fParams.records.source[id];  
    var propObj = getPubDetailDataObj(srcRcrd);
    addDataToIntDetailPanel('pub', propObj);
}
/** Returns an object with selected publication's data. */
function getPubDetailDataObj(srcRcrd) {  
    var pubRcrd = getEntityRecord('publication', srcRcrd.publication);      //console.log("srcRcrd = %O, pubRcrd = %O", srcRcrd, pubRcrd);
    return {
        'Title': srcRcrd.displayName, 'Description': srcRcrd.description || '',            
        'Publication Type': pubRcrd.publicationType ? pubRcrd.publicationType.displayName : '', 
        'Publisher': getPublisher(srcRcrd), 'Authors': getAuthorNames(srcRcrd),
        'Editors': getAuthorNames(srcRcrd, true)
    };
}
function getPublisher(srcRcrd) {
    if (!srcRcrd.parent) { return ''; }
    return fParams.records.source[srcRcrd.parent].displayName;
}
/**
 * When a user enters a new publication into the combobox, a create-publication
 * form is built and appended to the interaction form. An option object is 
 * returned to be selected in the interaction form's publication combobox.
 */
function initPubForm(value) {                                               //console.log("Adding new pub! val = %s", value);
    const fLvl = getSubFormLvl('sub');
    const val = value === 'create' ? '' : value;
    if ($('#'+fLvl+'-form').length !== 0) { return openSubFormErr('Publication', null, fLvl); }
    $('#CitationTitle_row').after(initSubForm(
        'publication', fLvl, 'flex-row med-form', {'Title': val}, '#Publication-sel'));
    initComboboxes('publication', 'sub');
    $('#Title_row input').focus();
    return { 'value': '', 'text': 'Creating Publication...' };
}
/**
 * Loads the deafult fields for the selected Publication Type. Clears any 
 * previous type-fields and initializes the selectized dropdowns.
 */
function loadPubTypeFields(typeId) { 
    loadSrcTypeFields('publication', typeId, this.$input[0]);
    ifBookAddAuthEdNote(typeId, this.$input[0]);
}
/** Shows the user a note above the author and editor elems. */
function ifBookAddAuthEdNote(id, typeElem) {                                
    const $typeElem = typeElem || $('#PublicationType-sel')[0];  
    const type = $typeElem.selectize.getItem(id).length ? 
        $typeElem.selectize.getItem(id)[0].innerText : false;
    if (type !== 'Book') { return; }
    const note = _util.buildElem('div', { class: 'skipFormData' });
    $(note).html('<i>Note: there must be at least one author OR editor ' +
        'selected for book publications.</i>')
    $(note).css({'margin': 'auto'});
    $('#Authors_row').before(note);
}
/*-------------- Citation ------------------------------------------------*/
/** Returns a form row with an empty citation select dropdown. */
function buildCitFieldRow() {
    const selElem = _util.buildSelectElem([], {id: 'CitationTitle-sel', class: 'lrg-field'});
    return buildFormRow('CitationTitle', selElem, 'top', true);
}
/** Fills the citation combobox with all citations for the selected publication. */
function fillCitationField(pubId) {                                         //console.log("initCitSelect for publication = ", pubId);
    enableCombobox('#CitationTitle-sel');
    updateComboboxOptions('#CitationTitle-sel', getPubCitationOpts(pubId));
}
/** Returns an array of option objects with citations for this publication.  */
function getPubCitationOpts(pubId) {
    const pubRcrd = fParams.records.source[pubId];  
    if (!pubRcrd) { return [{ value: 'create', text: 'Add a new Citation...'}]; }
    const opts = getRcrdOpts(pubRcrd.children, fParams.records.source);
    opts.unshift({ value: 'create', text: 'Add a new Citation...'});
    return opts;
}
/** 
 * When a Citation is selected, both 'top' location fields are initialized
 * and the publication combobox is reenabled. 
 */    
function onCitSelection(val) {  
    if (val === 'create') { return openCreateForm('CitationTitle'); }
    if (val === '' || isNaN(parseInt(val))) { return emptySidePanel('cit', true); }                     //console.log("cit selection = ", parseInt(val));                          
    updateSrcDetailPanel('cit');
    if (!fParams.editing) { $('#CitationTitle_pin').focus(); }
}    
/** Shows the Citation sub-form and disables the publication combobox. */
function initCitForm(value) {                                               //console.log("Adding new cit! val = %s", val);
    const fLvl = getSubFormLvl('sub');
    const val = value === 'create' ? '' : value;
    if ($('#'+fLvl+'-form').length !== 0) { return openSubFormErr('CitationTitle', '#CitationTitle-sel', fLvl); }
    $('#CitationTitle_row').after(initSubForm(
        'citation', fLvl, 'flex-row med-form', {'Title': val}, '#CitationTitle-sel'));
    initComboboxes('citation', 'sub');
    selectDefaultCitType(fLvl);
    enableCombobox('#Publication-sel', false);
    $('#Abstract_row textarea').focus();
    return { 'value': '', 'text': 'Creating Citation...' };
}
function selectDefaultCitType(fLvl) {
    const pubType = fParams.forms[fLvl].pub.pub.publicationType.displayName;
    const dfaults = {
        'Book': getBookDefault(pubType, fLvl), 'Journal': 'Article', 
        'Other': 'Other', 'Thesis/Dissertation': 'Ph.D. Dissertation' };
    const citTypes = _util.getDataFromStorage('citTypeNames');
    const dfaultType = dfaults[pubType];  
    $('#CitationType-sel')[0].selectize.addItem(citTypes[dfaultType]); 
}
/** refactor. */
function finishCitEditFormBuild() {
    initComboboxes('citaion', 'top'); 
    $('#top-cancel').unbind('click').click(exitFormPopup);
    $('.all-fields-cntnr').hide();
    selectDefaultCitType('top');
    handleSpecialCaseTypeUpdates($('#CitationType-sel')[0], 'top');
}
function getBookDefault(pubType, fLvl) {
    if (pubType !== 'Book') { return 'Book'; }
    const pubAuths = fParams.forms[fLvl].pub.src.authors;
    return pubAuths ? 'Book' : 'Chapter';
}
/**
 * Adds relevant data from the parent publication into formVals before 
 * loading the default fields for the selected Citation Type. If this is an 
 * edit form, skip loading pub data... 
 */
function loadCitTypeFields(typeId) {
    const fLvl = getSubFormLvl('sub');
    if (!fParams.editing) { handlePubData(typeId, this.$input[0], fLvl); }
    loadSrcTypeFields('citation', typeId, this.$input[0]);
    handleSpecialCaseTypeUpdates(this.$input[0], fLvl);
    handleCitText(fLvl);
}
/**
 * Shows/hides the author field depending on whether the publication has
 * authors already. Disables title field for citations that don't allow 
 * sub-titles.
 */
function handleSpecialCaseTypeUpdates(elem, fLvl) {
    const type = elem.innerText;    
    const hndlrs = { 
        'Book': updateBookFields, 'Chapter': updateBookFields,
        "Master's Thesis": disableTitleField, 'Other': disableFilledFields,
        'Ph.D. Dissertation': disableTitleField };
        if (Object.keys(hndlrs).indexOf(type) === -1) { return; }
    hndlrs[type](type, fLvl);

    function updateBookFields() {
        const params = fParams.forms[fLvl];                                 //console.log('params.pub.src = %O', JSON.parse(JSON.stringify(params.pub.src)));
        const pubAuths = params.pub.src.authors;      
        if (!pubAuths) { return showAuthorField(); }
        removeAuthorField();
        if (type === 'Book'){ disableTitleField()} else { enableTitleField()}

        function showAuthorField() {                                        //console.log('showing author field');
            if (!params.misc.authRow) { return; }
            $('#citation_Rows').append(params.misc.authRow);
            fParams.forms[fLvl].reqElems.push(params.misc.authElem);
            delete fParams.forms[fLvl].misc.authRow;
            delete fParams.forms[fLvl].misc.authElem;
        }
        function removeAuthorField() {                                      //console.log('removing author field');
            let reqElems = params.reqElems;
            fParams.forms[fLvl].misc.authRow = $('#Authors_row').detach();
            fParams.forms[fLvl].reqElems = reqElems.filter(removeAuthElem);  

            function removeAuthElem(elem) {
                if (!elem.id.includes('Authors')) { return true; }
                params.misc.authElem = elem;                                
                return false;
            }
        } /* End removeAuthorField */
    } /* End updateBookFields */
    function disableFilledFields() {
        //TODO. Also maybe add a seperate 'subTitle' field for this type.
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
    const vals = fParams.forms[fLvl].fieldConfg.vals;           
    const skip = ['Chapter']; 
    vals.Title = {};
    vals.Title.val = addTitle && skip.indexOf(type) === -1 ? 
        fParams.forms[fLvl].pub.src.displayName : '';  
}
function addPubYear(addYear, fLvl) {  
    const vals = fParams.forms[fLvl].fieldConfg.vals;                       
    vals.Year = {};
    vals.Year.val = addYear ? fParams.forms[fLvl].pub.src.year : '';
}
function addAuthorsToCitation(addAuths, fLvl, type) { 
    const vals = fParams.forms[fLvl].fieldConfg.vals;                       //console.log('addAuthorsToCitation ? %s, vals = %O', addAuths, vals);
    const pubAuths = fParams.forms[fLvl].pub.src.authors;  
    if (addAuths && pubAuths) { return addExistingPubContribs(fLvl, pubAuths); }
}
/**
 * If the parent publication has existing authors, they are added to the new 
 * citation form's author field(s). 
 */
function addExistingPubContribs(fLvl, auths) {  
    const vals = fParams.forms[fLvl].fieldConfg.vals;  
    vals.Authors = { type: "multiSelect" };
    vals.Authors.val = auths ? auths : (vals.length > 0 ? vals : null);
}
/**
 * Checks all required citation fields and sets the Citation Text field.
 * If all required fields are filled, the citation text is generated and 
 * displayed. If not, the default text is displayed in the disabled textarea.
 */
function handleCitText(formLvl) {                                               //console.log('handleCitText')
    const fLvl = formLvl || getSubFormLvl('sub');
    const $elem = $('#CitationText_row textarea');
    if (!$elem.val()) { initializeCitField(); } 
    const citText = getCitationFieldText();                                     //console.log('Citation field text = ', citText);
    if (!citText) { return; }
    $elem.val(citText).change();
    /** Returns the citation field text or false if there are no updates. */
    function getCitationFieldText() {
        const dfault = 'The citation will display here once all required fields '+
            'are filled.';
        return ifNoChildFormOpen(fLvl) && ifAllRequiredFieldsFilled(fLvl) ? 
            buildCitationText(fLvl) : $elem.val() === dfault ? false : dfault;
    }
    function initializeCitField() {
        $elem.prop('disabled', true).unbind('change').css({height: '6.6em'});
    }
    function ifNoChildFormOpen(fLvl) {  
        return $('#'+getNextFormLevel('child', fLvl)+'-form').length == 0; 
    }
} /* End handleCitText */
/**
 * Generates and displays the full citation text after all required fields 
 * are filled.
 */
function buildCitationText(fLvl) {
    const type = $('#CitationType-sel option:selected').text();             //console.log("type = ", type);
    const formVals = getFormValueData('citation', null, null);
    const getFullText = { 'Article': articleCit, 'Book': bookCit, 
        'Chapter': chapterCit, 'Ph.D. Dissertation': dissertThesisCit, 
        'Other': otherCit, 'Report': otherCit, 'Museum record': otherCit, 
        "Master's Thesis": dissertThesisCit };
    return getFullText[type](type);                                    
    /**
     * Articles, Museum records, etc.
     * Citation example with all data available: 
     *     1st Author [Last name, Initials.], 2nd+ Author(s) & Last Author 
     *     [Initials. Last]. Year. Title of article. Title of Journal 
     *     Volume (Issue): Pages.
     */
    function  articleCit(type) {                                      
        const athrs = getFormAuthors();
        const year = _util.stripString(formVals.year);
        const title = _util.stripString(formVals.title);
        const pub = getPublicationName();
        const vip = getVolumeIssueAndPages(); 
        let fullText = [athrs, year, title].map(addPunc).join(' ')+' '; 
        fullText += vip ? (pub+' '+vip) : pub;
        return fullText + '.';
    }
    /**
     * Citation example with all data available: 
     *     1st Author [Last name, Initials.], 2nd+ Author(s) & Last Author 
     *     [Initials. Last]. Year. Book Title (Editor 1 [initials, last name],
     *      & Editor X [initials, last name], eds.). Edition. Publisher Name, 
     *      City, Country.
     */
    function bookCit(type) {
        const athrs = getPubAuthors() || getFormAuthors();
        const year = getPubYear();
        const titlesAndEds = getTitlesAndEditors();
        const ed = formVals.edition;
        const pages = getBookPages();
        const publ = getPublisherData() ? getPublisherData() : '[NEEDS PUBLISHER DATA]';  
        const allFields = [athrs, year, titlesAndEds, ed, pages, publ];
        return allFields.filter(f=>f).map(addPunc).join(' ');
    }
    /** 
     * Citation example with all data available: 
     *     1st Author [Last name, Initials.], 2nd+ Author(s) & Last Author 
     *     [Initials. Last]. Year. Chapter Title. In: Book Title (Editor 1 
     *     [initials, last name], & Editor X [initials, last name], eds.). 
     *     pp. pages. Publisher Name, City, Country.
     */
    function chapterCit(type) {
        const athrs = getPubAuthors() || getFormAuthors();
        const year = getPubYear();
        const titlesAndEds = getTitlesAndEditors();
        const pages = getBookPages();
        const publ = getPublisherData() ? getPublisherData() : '[NEEDS PUBLISHER DATA]';
        const allFields = [athrs, year, titlesAndEds, pages, publ]; 
        return allFields.filter(f => f).join('. ')+'.';
    }
    /**
     * Citation example with all data available: 
     *     1st Author [Last name, Initials.], 2nd+ Author(s) & Last Author 
     *     [Initials. Last]. Year. Title.  Academic degree. Academic 
     *     Institution, City, Country.
     */
    function dissertThesisCit(type) {
        const athrs = getPubAuthors();
        const year = getPubYear();
        const title = _util.stripString(formVals.title);
        const degree = type === "Master's Thesis" ? 'M.S. Thesis' : type;
        const publ = getPublisherData() ? getPublisherData() : '[NEEDS PUBLISHER DATA]';
        return [athrs, year, title, degree, publ].join('. ')+'.';
    }
    /**
     * Citation example with all data available: 
     *     1st Author [Last name, Initials.], 2nd+ Author(s) & Last Author 
     *     [Initials. Last]. Year. Title. Volume (Issue): Pages. Publisher 
     *     Name, City, Country.
     */
    function otherCit(type) {
        const athrs = getFormAuthors() ? getFormAuthors() : getPubAuthors();
        const year = formVals.year ? _util.stripString(formVals.year) : getPubYear();
        const title = _util.stripString(formVals.title);
        const vip = getVolumeIssueAndPages();
        const publ = getPublisherData();
        return [athrs, year, title, vip, publ].filter(f=>f).join('. ') +'.';
    }
        /** ---------- citation full text helpers ----------------------- */
    function getPubYear() {
        return _util.stripString(fParams.forms[fLvl].pub.src.year);
    }
    function getPublicationName() {
        return _util.stripString(fParams.forms[fLvl].pub.src.displayName);
    }
    function getBookPages(argument) {
        if (!formVals.pages) { return false; }
        return 'pp. ' + _util.stripString(formVals.pages);
    }
    function getFormAuthors(eds) { 
        const auths = getSelectedVals($('#Authors-sel-cntnr')[0]);          //console.log('auths = %O', auths);
        if (!Object.keys(auths).length) { return false; }
        return getFormattedAuthorNames(auths, eds);
    }
    function getPubAuthors() {
        const auths = fParams.forms[fLvl].pub.src.authors;
        if (!auths) { return false; }
        return getFormattedAuthorNames(auths);
    }
    function getPubEditors() {
        const eds = fParams.forms[fLvl].pub.src.editors;  
        if (!eds) { return false }
        const names = getFormattedAuthorNames(eds, true);
        const edStr = Object.keys(eds).length > 1 ? ', eds.' : ', ed.';
        return '('+ names + edStr + ')';
    }
    /** Formats publisher data and returns the Name, City, Country. */
    function getPublisherData() {
        return buildPublString(fParams.forms[fLvl].pub.src);
    } 
    /**
     * Returns: Chapter title. In: Publication title [if there are editors,
     * they are added in parentheses here.]. 
     */
    function getTitlesAndEditors() { 
        const chap = formVals.chapterTitle ? 
            _util.stripString(formVals.chapterTitle) : false;
        const pub = _util.stripString(getPublicationName());
        const titles = chap ? (chap + '. In: ' + pub) : pub;
        const eds = getPubEditors();
        return eds ? (titles + ' ' + eds) : titles;
    }
    /** 
     * Formats volume, issue, and page range data and returns either: 
     *     Volume (Issue): pag-es || Volume (Issue) || Volume: pag-es || 
     *     Volume || (Issue): pag-es || Issue || pag-es || null
     * Note: all possible returns wrapped in parentheses.
     */
    function getVolumeIssueAndPages() {  
        const iss = formVals.issue ? '('+formVals.issue+')' : null;
        const vol = formVals.volume ? formVals.volume : null;
        const pgs = formVals.pages ? formVals.pages : null;
        return vol && iss && pgs ? (vol+' '+iss+': '+pgs) :
            vol && iss ? (vol+' '+iss) : vol && pgs ? (vol+': '+pgs) :
                vol ? (vol) : iss && pgs ? (iss+': '+pgs) : iss ? (iss) : 
                    pgs ? (pgs) : (null);
    }
} /* End buildCitationText */
/** Handles adding the punctuation for the data in the citation. */
function addPunc(data) {  
    return /[.!?,;:]$/.test(data) ? data : data+'.';
}
/** When the Citation sub-form is exited, the Publication combo is reenabled. */
function enablePubField() {
    enableCombobox('#Publication-sel');
    fillCitationField($('#Publication-sel').val());
}
/** Formats publisher data and returns the Name, City, Country. */
function buildPublString(pub) {
    const publ = getPublRcrd(pub);
    if (!publ) { return false; }
    const name = publ.displayName;
    const city = publ.city ? publ.city : '[ADD CITY]';
    const cntry = publ.country ? publ.country : '[ADD COUNTRY]';
    return [name, city, cntry].join(', ');

    function getPublRcrd(pub) {
        if (!pub.parent) { return false; }
        const publSrc = fParams.records.source[pub.parent];
        return getEntityRecord('publisher', publSrc.publisher);
    }
} /* End buildPublString */
/** ----- Publication and Citation Shared form helpers ------------ */
/** Adds source data to the interaction form's detail panel. */
function updateSrcDetailPanel(entity) {
    const data = {}; 
    buildSourceData();
    addDataToIntDetailPanel('src', data);

    function buildSourceData() {
        const pubSrc = fParams.records.source[$('#Publication-sel').val()];
        const pub = getEntityRecord('publication', pubSrc.publication);
        const pubType = getSrcType(pub, 'publication');  
        

        const citId = $('#CitationTitle-sel').val();
        const citSrc = citId ? fParams.records.source[citId] : false;
        const cit = citSrc ? getEntityRecord('citation', citSrc.citation) : false;
        const citType = cit ? getSrcType(cit, 'citation') : false; 
        
        addCitationText();
        addPubTitleData();
        addCitTitleData();
        addAuths();
        addEds();
        addYear();
        addAbstract();

        function addCitationText() {
            data['Citation'] = cit ? cit.fullText : '(Select Citation)';
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
            data.Authors = getAuthorNames(rcrdWithAuths);
        }
        function addEds() {  
            if (!pubSrc.editors) { return; }
            data.Editors =  getAuthorNames(pubSrc, true);
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
function loadSrcTypeFields(type, typeId, elem) {                            //console.log('loadSrcTypeFields. [%s] elem = %O', type, elem);
    const fLvl = getSubFormLvl('sub');
    resetOnFormTypeChange(type, typeId, fLvl);
    $('#'+type+'_Rows').append(getSrcTypeRows(type, typeId, fLvl));
    initComboboxes(type, fLvl);
    fillComplexFormFields(fLvl);
    checkReqFieldsAndToggleSubmitBttn(elem, fLvl);
    updateFieldLabelsForType(type, fLvl);
    focusFieldInput(type);
}
function resetOnFormTypeChange(type, typeId, fLvl) {  
    const capsType = _util.ucfirst(type);
    fParams.forms[fLvl].fieldConfg.vals[capsType+'Type'].val = typeId;
    fParams.forms[fLvl].reqElems = [];
    disableSubmitBttn('#'+fLvl+'-submit'); 
}
/**
 * Builds and return the form-field rows for the selected source type.
 * @return {ary} Form-field rows ordered according to the form config.
 */
function getSrcTypeRows(entity, typeId, fLvl, type) {
    const fVals = getCurrentFormFieldVals(fLvl);
    setSourceTypeConfg(entity, typeId, fLvl, type); 
    $('#'+entity+'_Rows').empty();     
    return getFormFieldRows(entity, getFormConfg(entity), fVals, fLvl);
}
/** Sets the type confg for the selected source type in form params. */
function setSourceTypeConfg(entity, id, fLvl, tName) {
    const typeElemId = '#'+_util.ucfirst(entity)+'Type-sel'; 
    const type = tName || $(typeElemId)[0].selectize.getItem(id)[0].innerText;
    fParams.forms[fLvl].typeConfg = getFormConfg(entity).types[type];       //console.log('srcTypeConfg for [%s] = [%O]', type, fParams.forms[fLvl].typeConfg);             
}
/**
 * Changes form-field labels to more specific and user-friendly labels for 
 * the selected type. 
 */
function updateFieldLabelsForType(entity, fLvl) {                           //console.log('--updating field labels.');
    const typeElemId = '#'+_util.ucfirst(entity)+'Type-sel'; 
    const type = $(typeElemId)[0].innerText;
    const trans = getLabelTrans();  
    const fId = '#'+fLvl+'-form';

    for (let field in trans) {                                              //console.log('updating field [%s] to [%s]', field, trans[field]);
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
            for (let $i = 0; $i < cntnrElem.children.length; $i++) {        //console.log('cntnr child = %O', cntnrElem.children[$i]);
                if (cntnrElem.children[$i].tagName !== 'SELECT') {continue}
                updatePlaceholderText(cntnrElem.children[$i], newTxt);   
            }
        }    
    } /* End updateComboboxText */
} /* End updateFieldLabelsForType */
function updatePlaceholderText(elem, newTxt) {                              //console.log('updating placeholder text to [%s] for elem = %O', newTxt, elem);
    elem.selectize.settings.placeholder = 'Select ' + newTxt;
    elem.selectize.updatePlaceholder();
}
function focusFieldInput(type) {
    if (!$('#Title_row input').val()) { $('#Title_row input').focus() 
    } else {
        $('#'+_util.ucfirst(type)+'Type-sel')[0].selectize.focus();
    }
}
/*-------------- Country/Region ------------------------------------------*/
/** Returns a form row with a combobox populated with all countries and regions. */
function buildCntryRegFieldRow() {  
    var opts = getCntryRegOpts();                                           //console.log("buildingCountryFieldRow. ");
    var selElem = _util.buildSelectElem(
        opts, {id: 'Country-Region-sel', class: 'lrg-field'});
    return buildFormRow('Country-Region', selElem, 'top', false);
}
/** Returns options for each country and region. */ 
function getCntryRegOpts() {
    var opts = getOptsFromStoredData('countryNames');                       
    return opts.concat(getOptsFromStoredData('regionNames'));
}
/** 
 * When a country or region is selected, the location dropdown is repopulated 
 * with it's child-locations and, for regions, all habitat types. When cleared, 
 * the combobox is repopulated with all locations. 
 */
function onCntryRegSelection(val) {                                         //console.log("country/region selected 'val' = ", val);
    if (val === "" || isNaN(parseInt(val))) { return fillLocationSelect(null); }          
    fillLocationSelect(fParams.records.location[val]);
    if (!fParams.editing) { $('#Country-Region_pin').focus(); }
}
/*-------------- Location ------------------------------------------------*/
/**
 * Returns a form row with a select dropdown populated with all available 
 * locations.
 */
function buildLocFieldRow() {                                               //console.log("buildingLocationFieldRow. ");
    var locOpts = getLocationOpts();                                        //console.log("locOpts = %O", locOpts);
    var selElem = _util.buildSelectElem(
        locOpts, {id: "Location-sel", class: "lrg-field"});
    return buildFormRow("Location", selElem, "top", false);
}
/** Returns an array of option objects with all unique locations.  */
function getLocationOpts() {
    let opts = [];
    for (var id in fParams.records.location) {
        opts.push({ 
            value: id, text: fParams.records.location[id].displayName });
    }
    opts = opts.sort(alphaOptionObjs);
    opts.unshift({ value: 'create', text: 'Add a new Location...'});
    return opts;
}
/**
 * When a country/region is selected, the location combobox is repopulated with its 
 * child-locations and all habitat types. When cleared, the combobox is 
 * repopulated with all locations. 
 */ 
function fillLocationSelect(loc) {                                          //console.log("fillLocationSelect for parent Loc = %O", loc);
    var opts = loc ? getOptsForLoc(loc) : getLocationOpts();    
    updateComboboxOptions('#Location-sel', opts);
}          
/** Returns an array of options for the locations of the passed country/region. */
function getOptsForLoc(loc) {
    let opts = loc.children.map(id => ({
        value: id, text: fParams.records.location[id].displayName}));
    opts = opts.concat([{ value: loc.id, text: loc.displayName }])
        .sort(alphaOptionObjs);
    opts.unshift({ value: 'create', text: 'Add a new Location...'});
    return opts;
}
/** 
 * When a location is selected, its country/region is selected in the top-form
 * combobox and the location record's data is added to the detail panel. If 
 * the location was cleared, the detail panel is cleared. 
 */     
function onLocSelection(val) {                                                  //console.log("location selected 'val' = '"+ val+"'");
    if (val === 'create') { return openCreateForm('Location'); }
    if (val === '' || isNaN(parseInt(val))) { return emptySidePanel('loc', true); }          
    var locRcrd = fParams.records.location[val];                                //console.log("location = %O", locRcrd);
    var prntVal = locRcrd.parent ? locRcrd.parent : locRcrd.id;
    $('#Country-Region-sel')[0].selectize.addItem(prntVal, true);
    fillEditLocDetails(val);
    if (!fParams.editing) { $('#Location_pin').focus(); }
}
/** Displays the selected location's data in the side detail panel. */
function fillEditLocDetails(id) {  
    var locRcrd = fParams.records.location[id];  
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
function initLocForm(val) {                                                     //console.log("Adding new loc! val = %s", val);
    const fLvl = getSubFormLvl("sub");
    if ($('#'+fLvl+'-form').length !== 0) { return openSubFormErr('Location', null, fLvl); }
    const vals = {
        'DisplayName': val === 'create' ? '' : val, //clears form trigger value
        'Country': $('#Country-Region-sel').val()
    }; 
    $('#Location_row').after(initSubForm(
        'location', fLvl, 'flex-row med-form', vals, '#Location-sel'));
    initComboboxes('location', 'sub');
    $('#Country-sel').change();
    enableCombobox('#Country-Region-sel', false);
    $('#DisplayName_row input').focus();
    clearCombobox('#Location-sel'); 
    return { 'value': '', 'text': 'Creating Location...' };
}
/** When the Location sub-form is exited, the Country/Region combo is reenabled. */
function enableCountryRegionField() {  
    enableCombobox('#Country-Region-sel');
}
/*------------------------------ Taxon ---------------------------------------*/
/** ----------------------- Params ------------------------------------- */
/**
 * Inits the taxon params object.
 * > lvls - All taxon levels
 * > realm - realm taxon display name
 * > realmLvls - All levels for the selected realm
 * > realmTaxon - realm taxon record
 * > prevSel - Taxon selected when form opened, or null.
 * > objectRealm - Object realm display name. (Added elsewhere.)
 */
function initTaxonParams(role, realmName, id) {                                 //console.log('###### INIT ######### role [%s], realm [%s], id [%s]', role, realmName, id);
    const selId = $('#'+role+'-sel').val();
    const realmLvls = {
        'Bat': ['Order', 'Family', 'Genus', 'Species'],
        'Arthropod': ['Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'],
        'Plant': ['Kingdom', 'Family', 'Genus', 'Species']
    };
    fParams.forms.taxonPs = { 
        lvls: ['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'],
        realm: realmName, 
        allRealmLvls: realmLvls, 
        curRealmLvls: realmLvls[realmName],
        realmTaxon: getRealmTaxon(realmName),
        prevSel: (selId ? 
            { val: selId, text: fParams.records.taxon[selId].displayName } :
            { val: null, text: null })
    };         
    if (role === 'Object') { 
        fParams.forms.taxonPs.objectRealm = realmName; 
    }                                                                           //console.log('taxon params = %O', fParams.forms.taxonPs)
}
function setTaxonParams(role, realmName, id) {                                  //console.log('setTaxonParams. args = %O', arguments)
    const tPs = fParams.forms.taxonPs;
    tPs.realm = realmName;
    tPs.realmTaxon = getRealmTaxon(realmName);
    tPs.curRealmLvls = tPs.allRealmLvls[realmName];
}
function getRealmTaxon(realm) {  
    const lvls = { 'Arthropod': 'Phylum', 'Bat': 'Order', 'Plant': 'Kingdom' };
    const realmName = realm || getObjectRealm();
    const dataProp = realmName + lvls[realmName] + 'Names'; 
    const realmRcrds = _util.getDataFromStorage(dataProp); 
    return fParams.records.taxon[realmRcrds[Object.keys(realmRcrds)[0]]];  
}    
/** Returns either the preivously selected object realm or the default. */
function getObjectRealm() {
    return !fParams.forms.taxonPs ? 'Plant' :
        fParams.forms.taxonPs.objectRealm || 'Plant';
}   
/** --------------------- Form Methods ---------------------------------- */
/** Builds the Subject combobox that will trigger the select form @initSubjectSelect. */
function initSubjField() {
    var subjElem = _util.buildSelectElem([], {id: "Subject-sel", class: "lrg-field"});
    return buildFormRow("Subject", subjElem, "top", true);
}
/** Builds the Object combobox that will trigger the select form @initObjectSelect. */
function initObjField() {
    var objElem =  _util.buildSelectElem([], {id: "Object-sel", class: "lrg-field"});
    return buildFormRow("Object", objElem, "top", true);
}
/**
 * Shows a sub-form to 'Select Subject' of the interaction with a combobox for
 * each level present in the Bat realm, (Family, Genus, and Species), filled 
 * with the taxa at that level. When one is selected, the remaining boxes
 * are repopulated with related taxa and the 'select' button is enabled.
 */
function initSubjectSelect() {                                                  //console.log("########### initSubjectSelect fieldVal = [%s]", $('#Subject-sel').val());
    const fLvl = getSubFormLvl('sub');
    if ($('#'+fLvl+'-form').length !== 0) { return errIfAnotherSubFormOpen('Subject', fLvl); }  
    initTaxonParams('Subject', 'Bat');
    $('#Subject_row').append(initSubForm(
        'subject', fLvl, 'sml-left sml-form', {}, '#Subject-sel'));
    initComboboxes('subject', fLvl);           
    finishTaxonSelectUi('Subject');  
    enableCombobox('#Object-sel', false);
}
/**
 * Shows a sub-form to 'Select Object' of the interaction with a combobox for
 * each level present in the selected Object realm, plant (default) or arthropod, 
 * filled with the taxa at that level. When one is selected, the remaining boxes
 * are repopulated with related taxa and the 'select' button is enabled. 
 * Note: The selected realm's level combos are built @onRealmSelection. 
 */
function initObjectSelect() {                                                   //console.log("########### initObjectSelect fieldVal = [%s]", $('#Object-sel').val());
    const fLvl = getSubFormLvl('sub');
    if ($('#'+fLvl+'-form').length !== 0) { return errIfAnotherSubFormOpen('Object', fLvl); }
    const realmName = getSelectedObjectRealm($('#Object-sel').val()); 
    initTaxonParams('Object', realmName);
    $('#Object_row').append(initSubForm(
        'object', fLvl, 'sml-right sml-form', {}, '#Object-sel'));
    initComboboxes('object', fLvl);             
    $('#Realm-sel')[0].selectize.addItem(fParams.forms.taxonPs.realmTaxon.realm.id);
    enableCombobox('#Subject-sel', false);
} 
/** Returns the realm taxon's lower-case name for a selected object taxon. */
function getSelectedObjectRealm(id) {                                       
    if (!id) { return getObjectRealm(); }
    return fParams.records.taxon[id].realm.displayName;
}
/** Note: Taxon fields often fire their focus event twice. */
function errIfAnotherSubFormOpen(role, fLvl) {
    if (fParams.forms[fLvl].entity === _util.lcfirst(role)) {return;}
    openSubFormErr(role, null, fLvl);
}
/**
 * When complete, the 'Select Subject' form is removed and the most specific 
 * taxonomic data is displayed in the interaction-form Subject combobox. 
 */
function onSubjectSelection(val) {                                              //console.log("subject selected = ", val);
    if (val === "" || isNaN(parseInt(val))) { return; }         
    $('#'+getSubFormLvl('sub')+'-form').remove();
    enableTaxonCombos();
    if (!fParams.editing) { $('#Subject_pin').focus(); }
}
/**
 * When complete, the 'Select Object' form is removed and the most specific 
 * taxonomic data is displayed in the interaction-form Object combobox. 
 */
function onObjectSelection(val) {                                               //console.log("object selected = ", val);
    if (val === "" || isNaN(parseInt(val))) { return; } 
    $('#'+getSubFormLvl('sub')+'-form').remove();
    enableTaxonCombos();
    if (!fParams.editing) { $('#Object_pin').focus(); }
}
/** When the taxon-select forms are exited, the top-combos are reenabled. */
function enableTaxonCombos() { 
    enableCombobox('#Subject-sel');
    enableCombobox('#Object-sel');
}
/**
 * Customizes the taxon-select form ui. Either re-sets the existing taxon selection
 * or brings the first level-combo into focus. Clears the [role]'s' combobox. 
 */
function finishTaxonSelectUi(role) {
    const fLvl = getSubFormLvl('sub');
    const selCntnr = role === 'Subject' ? '#'+fLvl+'-form' : '#realm-lvls';
    customizeElemsForTaxonSelectForm(role);
    if (!$('#'+role+'-sel').val()) { focusFirstCombobox(selCntnr);   
    } else { onLevelSelection($('#'+role+'-sel').val()); }
    updateComboboxOptions('#'+role+'-sel', []);
}
/** Shows a New Taxon form with the only field, displayName, filled and ready to submit. */
function initTaxonForm(value) { 
    const val = value === 'create' ? '' : value;
    const selLvl = this.$control_input[0].id.split('-sel-selectize')[0]; 
    const fLvl = fParams.forms.taxonPs.prntSubFormLvl || getSubFormLvl('sub2'); //refact
    if (selLvl === 'Species' && !$('#Genus-sel').val()) {
        return formInitErr(selLvl, 'noGenus', fLvl);
    }
    enableTxnCombos(false);
    return showNewTaxonForm(val, selLvl, fLvl);
} 
function showNewTaxonForm(val, selLvl, fLvl) {                                  //console.log("showNewTaxonForm. val, selVal, fLvl = %O", arguments)
    fParams.forms.taxonPs.formTaxonLvl = selLvl;
    buildTaxonForm();
    if (!val) { disableSubmitBttn('#sub2-submit'); }
    return { 'value': '', 'text': 'Creating '+selLvl+'...' };

    function buildTaxonForm() {
        $('#'+selLvl+'_row').append(initSubForm(
            'taxon', fLvl, 'sml-form', {'DisplayName': val}, '#'+selLvl+'-sel'));
        enableSubmitBttn('#'+fLvl+'-submit');
        $('#'+fLvl+'-hdr')[0].innerText += ' '+ selLvl;
    }
}  /* End showTaxonForm */
function onTaxonCreateFormExit() {
    enableTxnCombos(true);
}
function enableTxnCombos(enable) {  
    $.each($('#sub-form select'), function(i, sel){
        return enable ? $(sel)[0].selectize.enable() : $(sel)[0].selectize.disable();
    });
}
/**
 * Removes any previous realm comboboxes. Shows a combobox for each level present 
 * in the selected Taxon realm, plant (default) or arthropod, filled with the 
 * taxa at that level. 
 */
function onRealmSelection(val) {                                                //console.log("onRealmSelection. val = ", val)
    if (val === '' || isNaN(parseInt(val))) { return; }          
    if ($('#realm-lvls').length) { $('#realm-lvls').remove(); }  
    const realm = _util.getDataFromStorage('realm')[val].slug;
    const fLvl = getSubFormLvl('sub');
    setTaxonParams('Object', _util.ucfirst(realm)); 
    buildAndAppendRealmElems(realm, fLvl);
    initComboboxes(realm, fLvl);  
    finishTaxonSelectUi('Object');          
}
/**
 * Builds a combobox for each level present in the selected Taxon realm filled 
 * with the taxa at that level. 
 */
function buildAndAppendRealmElems(realm, fLvl) {
    const realmElems = _util.buildElem('div', { id: 'realm-lvls' });
    $(realmElems).append(buildFormRows(realm, {}, fLvl, null));
    $('#Realm_row').append(realmElems);
    fParams.forms[fLvl].fieldConfg.vals.Realm = { val: null, type: 'select' };
}
/** Adds a close button. Updates the Header and the submit/cancel buttons. */
function customizeElemsForTaxonSelectForm(role) {
    $('#sub-hdr')[0].innerHTML = "Select " + role + " Taxon";
    $('#sub-hdr').append(getTaxonExitButton(role));
    $('#sub-submit')[0].value = "Confirm";        
    $('#sub-cancel')[0].value = "Reset";
    $('#sub-submit').unbind("click").click(selectTaxon);
    $('#sub-cancel').unbind("click").click(resetTaxonSelectForm);
}
function getTaxonExitButton(role) {
    var bttn = getExitButton();
    bttn.id = "exit-sub-form";
    $(bttn).unbind("click").click(exitTaxonSelectForm.bind(null, role));
    return bttn;
}
/** Exits sub form and restores any previous taxon selection. */
function exitTaxonSelectForm(role) {
    exitForm('#sub-form', 'sub', false);
    const prevTaxon = fParams.forms.taxonPs.prevSel; 
    if (prevTaxon) {
        updateComboboxOptions('#'+role+'-sel', { 
            value: prevTaxon.val, text: prevTaxon.text });
        $('#'+role+'-sel')[0].selectize.addItem(prevTaxon.val);
    }
}
/** Removes and replaces the taxon form. */
function resetTaxonSelectForm() {                                           
    const prevTaxonId = fParams.forms.taxonPs.prevSel.val;
    const initTaxonSelectForm = fParams.forms.taxonPs.realm === 'Bat' ? 
        initSubjectSelect : initObjectSelect;
    $('#sub-form').remove();
    initTaxonSelectForm();
    resetPrevTaxonSelection(prevTaxonId);
}
/** Resets the taxon to the one previously selected in the interaction form.  */
function resetPrevTaxonSelection(id) { 
    if (id === null) { return; }
    const taxon = fParams.records.taxon[id];                                    //console.log('resetPrevTaxonSelection. taxon = %O. prevTaxonId = %s', taxon, id);
    ifObjectSelectRealm(taxon.realm);
    addPrevSelection(id, taxon);
    preventComboboxFocus(taxon.realm.displayName);
}
function ifObjectSelectRealm(realm) {  
    if ('Bat' === realm.displayName) { return; }  
    $('#Realm-sel')[0].selectize.addItem(realm.id);
}
function addPrevSelection(selId, taxon) {
    const lvl = taxon.level.displayName;  
    $('#'+lvl+'-sel')[0].selectize.addItem(selId);
    fParams.forms.taxonPs.prevSel = {val: taxon.id, text:taxon.displayName};    //console.log('taxon = %O. prevSel = %O', taxon, fParams.forms.taxonPs.prevSel);
}
function preventComboboxFocus(realm) {
    const role = realm === 'Bat' ? 'subject' : 'object';  
    const fLvl = fParams.forms[role];
    const selCntnr = realm === 'Bat' ? '#'+fLvl+'-form' : '#realm-lvls';        
    focusFirstCombobox(selCntnr, false);
}
/** Adds the selected taxon to the interaction-form's [role]-taxon combobox. */
function selectTaxon() {
    var role = fParams.forms.taxonPs.realm === 'Bat' ? 'Subject' : 'Object';
    var selApi = $('#'+role+'-sel')[0].selectize;
    var opt = getSelectedTaxonOption();
    $('#sub-form').remove();
    updateComboboxOptions('#'+role+'-sel', opt);
    selApi.addItem(opt.value);
    selApi.enable();
}
/** Returns an option object for the most specific taxon selected. */
function getSelectedTaxonOption() {
    var taxon = getSelectedTaxon();                                             //console.log("selected Taxon = %O", taxon);
    return { value: taxon.id, text: getTaxonDisplayName(taxon) };
}
function getTaxonDisplayName(taxon) { 
    return taxon.level.displayName === 'Species' ? 
        taxon.displayName : taxon.level.displayName +' '+ taxon.displayName;
}
/** Finds the most specific level with a selection and returns that taxon record. */
function getSelectedTaxon() {
    var selElems = $('#sub-form .selectized').toArray().reverse(); 
    var selected = selElems.find(isSelectedTaxon);                              //console.log("getSelectedTaxon. selElems = %O selected = %O", selElems, selected);
    return fParams.records.taxon[$(selected).val()];
}
function isSelectedTaxon(elem) {
    if (elem.id.includes('-sel')) { return $(elem).val(); }
}   
/**
 * When a taxon at a level is selected, all child level comboboxes are
 * repopulated with related taxa and the 'select' button is enabled. If the
 * combo was cleared, ensure the remaining dropdowns are in sync or, if they
 * are all empty, disable the 'select' button.
 * NOTE: Change event fires twice upon selection. Worked around using @captureSecondFire
 */
function onLevelSelection(val) {                                                //console.log("onLevelSelection. val = [%s] isNaN?", val, isNaN(parseInt(val)))
    if (val === 'create') { return openLevelCreateForm(this.$input[0]); }
    if (val === '' || isNaN(parseInt(val))) { return syncTaxonCombos(this.$input[0]); } 
    const fLvl = getSubFormLvl('sub');
    fParams.forms.taxonPs.recentChange = true;  // Flag used to filter out the second change event
    repopulateCombosWithRelatedTaxa(val);
    enableSubmitBttn('#'+fLvl+'-submit');             
}
function openLevelCreateForm(selElem) {
    openCreateForm(selElem.id.split('-sel')[0]);
}
function syncTaxonCombos(elem) {                                                //console.log("syncTaxonCombos. elem = %O", elem)
    if (fParams.forms.taxonPs.recentChange) { return captureSecondFire(); }
    resetChildLevelCombos(elem.id.split('-sel')[0]);
}
/*
 * Note: There is a closed issue for the library (#84) that seems to address
 * this second change-event fire, but it is still an issue here. Instead of 
 * figuring out the cause, this method captures that event and filters it out.
 */
function captureSecondFire() {                                                  //console.log("Capturing second fire.")
    delete fParams.forms.taxonPs.recentChange;
}
function resetChildLevelCombos(lvlName) {
    repopulateLevelCombos(getChildlevelOpts(lvlName), {});
}
function getChildlevelOpts(lvlName) { 
    var opts = {};
    var lvls = fParams.forms.taxonPs.lvls;
    var lvlIdx = lvls.indexOf(lvlName);
    for (var i = lvlIdx+1; i < 8; i++) { 
        opts[i] = getTaxonOpts(lvls[i-1]);                    
    }                                                                           //console.log("getChildlevelOpts. opts = %O", opts);
    return opts;
}
/**
 * Repopulates the comboboxes of child levels when a taxon is selected. Selected
 * and ancestor levels are populated with all taxa at the level and the direct 
 * ancestors selected. Child levels populate with only decendant taxa and
 * have no initial selection.
 * TODO: Fix bug with child taxa opt refill sometimes filling with all taxa.
 */
function repopulateCombosWithRelatedTaxa(selId) {
    var opts = {}, selected = {};                                               //console.log("repopulateCombosWithRelatedTaxa. opts = %O, selected = %O", opts, selected);
    var lvls = fParams.forms.taxonPs.lvls;  
    var taxon = fParams.records.taxon[selId];
    repopulateTaxonCombos();

    function repopulateTaxonCombos() {
        taxon.children.forEach(addRelatedChild);                                
        getSiblingAndAncestorTaxaOpts(taxon);
        buildOptsForEmptyLevels(taxon.level.id);
        addCreateOpts();
        repopulateLevelCombos(opts, selected);
    }
    /** Adds all taxa from the selected taxon's level up until the realm-taxon level. */
    function getSiblingAndAncestorTaxaOpts(taxon) {                                          
        var realmTaxa = [1, 2, 3, 4]; //animalia, chiroptera, plantae, arthropoda 
        var lvl = taxon.level.displayName;  
        if ( realmTaxa.indexOf(taxon.id) !== -1 ) { return; } 
        opts[taxon.level.id] = getTaxonOpts(lvl);  
        selected[taxon.level.id] = taxon.id;
        getSiblingAndAncestorTaxaOpts(fParams.records.taxon[taxon.parent]);
    }
    function addRelatedChild(id) {
        var taxon = fParams.records.taxon[id];
        var level = taxon.level.id;
        addOptToLevelAry(taxon, level);
        taxon.children.forEach(addRelatedChild);
    }
    function addOptToLevelAry(taxon, level) {
        if (!opts[level]) { opts[level] = []; }                                 //console.log("setting lvl = ", taxon.level)
        opts[level].push({ value: taxon.id, text: taxon.displayName });                                   
    }
    /**
     * Builds the opts for each level without taxa related to the selected taxon.
     * Ancestor levels are populated with all taxa at the level and will have 
     * the 'none' value selected.
     */
    function buildOptsForEmptyLevels(selLvl) {
        var topLvl = fParams.forms.taxonPs.realm === "Arthropod" ? 3 : 5; 
        for (var i = 7; i >= topLvl; i--) {
            if (opts[i]) { continue; }
            opts[i] = [{ value: "", text: "None" }];                    
            if (i < selLvl) {  
                opts[i] = opts[i].concat(getTaxonOpts(lvls[i-1]));                    
                selected[i] = "";
            }
        }
    }
    function addCreateOpts() {
        for (let lvl in opts) {                                                 //console.log("lvl = %s, name = ", lvl, lvls[lvl-1]);
            opts[lvl].unshift({ value: 'create', text: 'Add a new '+lvls[lvl-1]+'...'});
        }
    }
} /* End fillAncestorTaxa */    
function repopulateLevelCombos(optsObj, selected) {
    var lvls = fParams.forms.taxonPs.lvls;  
    for (var lvl in optsObj) {                                                  //console.log("lvl = %s, name = ", lvl, lvls[lvl-1])
        repopulateLevelCombo(optsObj[lvl], lvls[lvl-1], lvl, selected);
    }
}
/**
 * Replaces the options for the level combo. Selects the selected taxon and 
 * its direct ancestors.
 */
function repopulateLevelCombo(opts, lvlName, lvl, selected) {                   //console.log("repopulateLevelCombo for lvl = %s (%s)", lvl, lvlName)
    var selApi = $('#'+lvlName+'-sel')[0].selectize;
    updateComboboxOptions('#'+lvlName+'-sel', opts);
    if (lvl in selected) { selApi.addItem(selected[lvl], true); }
}
/*-------- Edit Taxon Methods ----------*/
/**
 * Returns the elements of the edit-taxon form. 
 * <div>Parent Taxon: [Level][Display-name]</> <bttnInput>"Edit Parent"</>
 * <select>[Taxon-level]</>    <input type="text">[Taxon Display-name]</>
 *     <button>Update Taxon</> <button>Cancel</>
 */
function getTaxonEditFields(entity, id) {
    const taxon = fParams.records.taxon[id];  
    const realm = taxon.realm.displayName;
    const role = realm === 'Bat' ? 'Subject' : 'Object';
    initTaxonParams(role, realm, id);                
    return buildTaxonEditFields(taxon);
}
function finishTaxonEditFormBuild() {
    $('#top-cancel').off('click').click(exitFormPopup);
    $('#top-submit').off('click').click(submitTaxonEdit);
    initTaxonEditCombo('txn-lvl', checkForTaxonLvlErrs); 
    $('.all-fields-cntnr').hide();
}
function buildTaxonEditFields(taxon) {
    const prntElems = getPrntTaxonElems(taxon);
    const taxonElems = getEditTaxonFields(taxon);
    return prntElems.concat(taxonElems);
}
function getPrntTaxonElems(taxon) {                                             //console.log("getPrntTaxonElems for %O", taxon);
    const prnt = fParams.records.taxon[taxon.parent]; 
    const elems = [ buildNameElem(prnt), buildEditPrntBttn(prnt) ];
    return [ buildTaxonEditFormRow('Parent', elems, 'top') ];
}
function buildNameElem(prnt) {
    var div = _util.buildElem('div', { id: 'txn-prnt' });
    setTaxonPrntNameElem(prnt, div);
    $(div).css({'padding-top': '4px'});
    return div;
}
function setTaxonPrntNameElem(prnt, elem, pText) {
    var div = elem || $('#txn-prnt')[0];
    var text = pText || getTaxonDisplayName(prnt);
    div.innerHTML = '<b>Taxon Parent</b>: &nbsp ' + text;
    if (prnt) { $(div).data('txn', prnt.id).data('lvl', prnt.level.id); }
}
function buildEditPrntBttn(prnt) {
    var bttn = _util.buildElem('input', { type: 'button', value: 'Change Parent', 
        id: 'chng-prnt', class: 'ag-fresh grid-bttn' });
    $(bttn).click(buildParentTaxonEditFields);
    return bttn;
}
function getEditTaxonFields(taxon) {                                            //console.log("getEditTaxonFields for [%s]", taxon.displayName);
    var input = _util.buildElem('input', { id: 'txn-name', type: 'text', value: taxon.displayName });
    var lvlSel = getlvlSel(taxon, 'top');
    $(lvlSel).data('txn', taxon.id).data('lvl', taxon.level.id);
    return [buildTaxonEditFormRow('Taxon', [lvlSel, input], 'top')];
}
function getlvlSel(taxon, fLvl) {
    var opts = getTaxonLvlOpts(taxon); 
    var sel = _util.buildSelectElem(opts, { id: 'txn-lvl' });
    $(sel).data('toSel', taxon.level.id);
    return sel;
}
/** Returns an array of options for the levels in the taxon's realm. */
function getTaxonLvlOpts(taxon) {
    const realmLvls = fParams.forms.taxonPs.curRealmLvls.map(lvl => lvl);
    const lvls = _util.getDataFromStorage('levelNames');  
    realmLvls.shift();  //Removes the realm-level
    for (var name in lvls) {
        if (realmLvls.indexOf(name) === -1) { delete lvls[name]; }
    }
    return buildOptsObj(lvls, Object.keys(lvls));
}
/**
 * Returns a level select with all levels in the taxon-parent's realm and a 
 * combobox with all taxa at the parent's level and the current parent selected.
 * Changing the level select repopulates the taxa with those at the new level.
 * Entering a taxon that does not already exists will open the 'create' form.
 */
function buildParentTaxonEditFields() {           
    buildAndAppendEditParentElems($('#txn-prnt').data('txn'));
    setTaxonPrntNameElem(null, null, " ");
    $('#chng-prnt').attr({'disabled': true}).css({'opacity': '.6'});
    disableSubmitBttn('#top-submit');
    $('#sub-submit')[0].value = 'Confirm';
}
function buildAndAppendEditParentElems(prntId) {
    var cntnr = _util.buildElem("div", { class: "sml-form flex-row pTaxon", id: "sub-form" });
    var elems = buildParentTaxonEditElems(prntId);
    $(cntnr).append(elems);
    $('#Parent_row').after(cntnr);
    finishEditParentFormBuild();
}
function buildParentTaxonEditElems(prntId) {
    var prnt = fParams.records.taxon[prntId];
    var hdr = [buildEditParentHdr()];
    var bttns = [buildFormBttns("parent", "sub", "edit", true)];
    var fields = getParentEditFields(prnt);
    return hdr.concat(fields, bttns);
}
function buildEditParentHdr() {
    var hdr = _util.buildElem("h3", { text: "Select New Taxon Parent", id:'sub-hdr' });
    return hdr;
}
function getParentEditFields(prnt) {  
    const realm = _util.lcfirst(prnt.realm.displayName);      
    const realmSelRow = getRealmLvlRow(prnt);
    const lvlSelRows = buildFormRows(realm, {}, 'sub', null, 'edit');
    $(lvlSelRows).css({ 'padding-left': '.7em' });
    fParams.forms.taxonPs.prntSubFormLvl = 'sub2';
    return [realmSelRow, lvlSelRows];
}
function getRealmLvlRow(taxon) { 
    const realmLvl = fParams.forms.taxonPs.curRealmLvls[0];
    const lbl = _util.buildElem('label', { text: realmLvl });
    const taxonym = _util.buildElem('span', { text: taxon.realm.displayName });
    $(taxonym).css({ 'padding-top': '.55em' });
    return buildTaxonEditFormRow(realmLvl, [lbl, taxonym], 'sub');
}
/**
 * Initializes the edit-parent form's comboboxes. Selects the current parent.
 * Hides the species row. Adds styles and modifies event listeners. 
 */
function finishEditParentFormBuild() {                                          //console.log("fParams = %O", fParams);    
    var realmLvl = fParams.forms.taxonPs.curRealmLvls[0];
    initComboboxes(null, 'sub');
    selectParentTaxon($('#txn-prnt').data('txn'), realmLvl);
    $('#Species_row').hide();
    $('#'+realmLvl+'_row .field-row')[0].className += ' realm-row';
    $('#sub-submit').attr('disabled', false).css('opacity', '1');
    $('#sub-submit').off('click').click(closePrntEdit);
    $('#sub-cancel').off('click').click(cancelPrntEdit);
}
function selectParentTaxon(prntId, realmLvl) {                                  //console.log('selectParentTaxon. prntId [%s], realmLvl [%s]', prntId, realmLvl);                 
    var parentLvl = fParams.records.taxon[prntId].level.displayName;  
    if (parentLvl == realmLvl) { return clearAllOtherLvls(); }
    clearAllOtherLvls();
    $('#'+parentLvl+'-sel')[0].selectize.addItem(prntId);
}
function clearAllOtherLvls() {
    $.each($('#sub-form select[id$="-sel"]'), function(i, elem){ 
        $(elem)[0].selectize.clear('silent');
    });
}
function closePrntEdit() {                                                  
    var prnt =  getSelectedTaxon() || fParams.forms.taxonPs.realmTaxon;         //console.log("closePrntEdit called. prnt = %O", prnt);
    exitPrntEdit(prnt);
}
function cancelPrntEdit() {                                                     //console.log("cancelPrntEdit called.");
    var prnt = fParams.records.taxon[$('#txn-prnt').data('txn')];
    exitPrntEdit(prnt);
}
function exitPrntEdit(prnt) {
    if (checkForParentLvlErrs(prnt.level.id)) { return; }
    resetAfterEditParentClose(prnt);
}
function resetAfterEditParentClose(prnt) {
    clearLvlErrs('#Parent_errs', 'sub');
    fParams.forms.taxonPs.prntSubFormLvl = null;
    $('#sub-form').remove();
    $('#chng-prnt').attr({'disabled': false}).css({'opacity': '1'});
    setTaxonPrntNameElem(prnt);
    enableSubmitBttn('#top-submit');
}
/**
 * Ensures that the new taxon-level is higher than its children, and that a 
 * species taxon being edited has a genus parent selected.
 */
function checkForTaxonLvlErrs(txnLvl) {  
    var prntLvl = $('#txn-prnt').data('lvl');                                   //console.log("checkForTaxonLvlErrs. taxon = %s. parent = %s", txnLvl, prntLvl);
    var errObj = {
        'isGenusPrnt': isGenusPrnt(),
        'needsHigherLvl': lvlIsLowerThanKidLvls(txnLvl),
    };
    for (var tag in errObj) {  
        if (errObj[tag]) { return sendTxnErrRprt(tag, 'Taxon'); }
    }
    clrNeedsHigherLvl(null, null, null, txnLvl);
    checkForParentLvlErrs(prntLvl);
}
/** Returns true if the taxon's original level is Genus and it has children. */
function isGenusPrnt() {
    var orgTxnLvl = $('#txn-lvl').data('lvl');
    var txnId = $('#txn-lvl').data('txn');
    return orgTxnLvl == 6 && getHighestChildLvl(txnId) < 8;
}
/** 
 * Returns true if the passed level is lower or equal to the highest level of 
 * the taxon-being-edited's children.  
 */
function lvlIsLowerThanKidLvls(txnLvl) {                                    
    var highLvl = getHighestChildLvl($('#txn-lvl').data('txn'));                //console.log('lvlIsLowerThanKidLvls. txnLvl = %s, childHigh = %s', txnLvl, highLvl)                  
    return txnLvl >= highLvl;
}
function getHighestChildLvl(taxonId) {
    var high = 8;
    fParams.records.taxon[taxonId].children.forEach(checkChildLvl);
    return high;

    function checkChildLvl(id) {
        var child = fParams.records.taxon[id]
        if (child.level.id < high) { high = child.level.id; }
    }
} /* End getHighestChildLvl */
/**
 * Ensures that the parent taxon has a higher taxon-level and that a species 
 * taxon being edited has a genus parent selected.
 */
function checkForParentLvlErrs(prnt) {
    var prntLvl = prnt || $('#txn-prnt').data('lvl'); 
    var txnLvl = $('#txn-lvl').val();                                           //console.log("checkForParentLvlErrs. taxon = %s. parent = %s", txnLvl, prntLvl);
    var errs = [
        { 'needsHigherLvlPrnt': txnLvl <= prntLvl },
        { 'needsGenusPrnt': txnLvl == 7 && prntLvl != 6 }];
    var hasErrs = !errs.every(checkForErr);                                     //console.log('hasErrs? ', hasErrs)
    if (!hasErrs) { clearLvlErrs('#Parent_errs', 'sub'); }
    return hasErrs;

    function checkForErr(errObj) {                                         
        for (var err in errObj) { 
            return errObj[err] ? sendTxnErrRprt(err, 'Parent') : true;
        }                                                                   
    }
} /* End checkForParentLvlErrs */
function sendTxnErrRprt(errTag, field) {                                              
    reportFormFieldErr(field, errTag, 'top');
    disableSubmitBttn('#top-submit');
    return false;
}
function clearLvlErrs(elemId, fLvl) {                                           //console.log('clearLvlErrs.')
    clearErrElemAndEnableSubmit($(elemId)[0], fLvl);
}
/** Inits a taxon select-elem with the selectize library. */
function initTaxonEditCombo(selId, chngFunc, createFunc) {                      //console.log("initTaxonEditCombo. selId = ", selId);
    var chng = chngFunc || Function.prototype;
    var create = createFunc || false;
    var options = { create: create, onChange: chng, placeholder: null }; 
    $('#'+selId).selectize(options);
    $('#'+selId)[0].selectize.addItem($('#'+selId).data('toSel'), true);
}
/**
 * Each element is built, nested, and returned as a completed row. 
 * rowDiv>(errorDiv, fieldDiv>inputElems)
 */
function buildTaxonEditFormRow(field, inputElems, fLvl) {
    var rowDiv = _util.buildElem('div', { class: fLvl + '-row', id: field + '_row'});
    var errorDiv = _util.buildElem('div', { id: field+'_errs'}); 
    var fieldCntnr = _util.buildElem('div', { class: 'field-row flex-row'});
    $(fieldCntnr).append(inputElems);
    $(rowDiv).append([errorDiv, fieldCntnr]);
    return rowDiv;
} 
function submitTaxonEdit() {
    var vals = {
        displayName: $('#Taxon_row > div.field-row.flex-row > input[type="text"]').val(),
        level: $('#Taxon_row select').text(),
        parentTaxon: $('#txn-prnt').data('txn')
    };                                                                          //console.log("taxon vals = %O", vals);
    buildFormDataAndSubmit('top', vals);
}
/*-------------- Interaction Detail Fields -------------------------------*/
function buildIntTypeField() {
    var opts = getOptsFromStoredData('intTypeNames');
    var selElem = _util.buildSelectElem(
        opts, {id: 'InteractionType-sel', class: 'lrg-field'});
    return buildFormRow('InteractionType', selElem, 'top', true);
}
function focusIntTypePin() {
    if (!fParams.editing) { $('#InteractionType_pin').focus(); }
}
function buildIntTagField() {
    const elem = buildTagsElem('interaction', 'InteractionTags', 'top');
    elem.className = 'lrg-field';
    $(elem).change(checkIntFieldsAndEnableSubmit);
    return buildFormRow('InteractionTags', elem, 'top', false);
}
function buildIntNoteField() {
    const txtElem = buildLongTextArea('interaction', 'Note', 'top');
    $(txtElem).change(checkIntFieldsAndEnableSubmit);
    return buildFormRow('Note', txtElem, 'top', false);
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
    if ($('#'+fLvl+'-form').length !== 0) { return openSubFormErr('Publisher', null, fLvl); }
    $('#Publisher_row').append(initSubForm(
        'publisher', fLvl, 'sml-right sml-form', {'DisplayName': val}, '#Publisher-sel'));
    disableSubmitBttn('#'+prntLvl+'-submit');
    $('#DisplayName_row input').focus();
    return { 'value': '', 'text': 'Creating Publisher...' };
}

/*-------------- Author --------------------------------------------------*/

/** Loops through author object and adds each author/editor to the form. */
function selectExistingAuthors(field, authObj, fLvl) {                          //console.log('reselectAuthors. field = [%s] auths = %O', field, authObj);
    for (let ord in authObj) { //ord(er)
        selectAuthor(ord, authObj[ord], field, fLvl);
    }
}
/** Selects the passed author and builds a new, empty author combobox. */
function selectAuthor(cnt, authId, field, fLvl) {
    const selId = '#'+field+'-sel'+ cnt;                                        //console.log('selId = ', selId)
    $(selId)[0].selectize.addItem(authId, true);
    buildNewAuthorSelect(++cnt, authId, fLvl, field);
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
    const fLvl = getSubFormLvl('sub');
    const authType = ed ? 'Editors' : 'Authors';
    let cnt = $('#'+authType+'-sel-cntnr').data('cnt') + 1;                          
    if (val === 'create') { return openCreateForm(authType, --cnt); }        
    if (val === '' || parseInt(val) === NaN) { return; }
    if (fParams.forms[fLvl].entity === 'citation') { handleCitText(fLvl); }
    if (lastAuthComboEmpty(cnt-1, authType)) { return; }
    buildNewAuthorSelect(cnt, val, fLvl, authType);
}
/** Stops the form from adding multiple empty combos to the end of the field. */
function lastAuthComboEmpty(cnt, authType) {  
    return $('#'+authType+'-sel'+cnt).val() === '';
}
/** Builds a new, empty author combobox */
function buildNewAuthorSelect(cnt, val, prntLvl, authType) {                    //console.log("buildNewAuthorSelect. cnt [%s] val [%s] type [%s]", cnt, val, authType)
    const parentFormEntity = fParams.forms[prntLvl].entity;
    const singular = authType.slice(0, -1);
    const change = authType === 'Editors' ? onEdSelection : onAuthSelection;
    const add = authType === 'Editors' ? initEdForm : initAuthForm;
    const selConfg = { name: singular, id: '#'+authType+'-sel'+cnt, 
        change: change, add: add.bind(null, cnt) };
    const sel = buildMultiSelectElems(null, authType, prntLvl, cnt);
    $('#'+authType+'-sel-cntnr').append(sel).data('cnt', cnt);
    initSelectCombobox(selConfg, prntLvl);
}
/** Removes the already selected authors from the new dropdown options. */
// function removeAllSelectedAuths(sel, fLvl, authType) { 
//     const auths = fParams.forms[fLvl].fieldConfg.vals[authType].val;   
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
    if ($('#'+fLvl+'-form').length !== 0) { return openSubFormErr(authType, parentSelId, fLvl); }
    $('#'+authType+'_row').append(initSubForm( _util.lcfirst(singular), 
        fLvl, 'sml-left sml-form', {'LastName': val}, parentSelId));
    handleSubmitBttns();
    $('#FirstName_row input').focus();
    return { 'value': '', 'text': 'Creating '+singular+'...' };

    function handleSubmitBttns() {
        const prntLvl = getNextFormLevel('parent', fLvl);
        disableSubmitBttn('#'+prntLvl+'-submit');  
        return ifAllRequiredFieldsFilled(fLvl) ? 
            enableSubmitBttn('#'+fLvl+'-submit') : disableSubmitBttn('#'+fLvl+'-submit');
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
    const auth = fParams.records.source[id];
    return auth.displayName;  
}
/** ------ Citation Text Helper -------------- */
/** 
 * Returns a string with all author names formatted with the first author
 * [Last, Initials.], all following authors as [Initials. Last], and each 
 * are seperated by commas until the final author, which is seperated 
 * with '&'. If the names are of editors, they are returned [Initials. Last].
 * If >= 4 authors, returns first author [Last, Initials.] + ', et al';  
 */
function getFormattedAuthorNames(auths, eds) {                              //console.log('getFormattedAuthorNames. auths = %O, eds = %s', JSON.parse(JSON.stringify(auths)), eds);
    if (Object.keys(auths).length > 3) { return getFirstEtAl(auths[1]); }
    let athrs = '';
    for (let ord in auths) {  
        let name = getFormattedName(ord, auths[ord]); 
        athrs += (ord == 1 ? name : (ord == Object.keys(auths).length ?
            ' & '+ name : ', '+ name));                 
    }
    return _util.stripString(athrs);

    function getFirstEtAl(authId) {
        const name = getFormattedName(1, authId);
        return name +', et al';
    }
    function getFormattedName(i, srcId) {                                       //console.log('getFormattedName cnt =%s, id = %s', i, srcId);        
        const src = fParams.records.source[srcId];                      
        const athrId = src[_util.lcfirst(src.sourceType.displayName)];  
        const athr = _util.getDataFromStorage('author')[athrId];        
        return getCitAuthName(i, athr, eds);
    }
    /**
     * Returns the last name and initials of the passed author. The first 
     * author is formatted [Last, Initials.] and all others [Initials. Last].
     * If editors (eds), [Initials. Last].
     */
    function getCitAuthName(cnt, a, eds) {                                      //console.log('getCitAuthName. cnt = [%s], auth = %O, eds = ', cnt, a, eds);
        const last = a.lastName;                     
        const initials = ["firstName", "middleName"].map(name => 
            a[name] ? a[name].charAt(0)+'.' : null).filter(i=>i).join(' '); //removes null values and joins
        return cnt > 1 || eds ? initials +' '+ last : last+', '+initials; 
    }
} /* End getFormattedAuthorNames */
/*------------------- Shared Form Builders ---------------------------------------------------*/
/** Returns the record for the passed id and entity-type. */
function getEntityRecord(entity, id) {
    const rcrds = _util.getDataFromStorage(entity);                             //console.log("[%s] id = %s, rcrds = %O", entity, id, rcrds)
    return rcrds[id];
}
/*------------------- Combobox (selectized) Methods ----------------------*/
/**
 * Inits the combobox, using 'selectize', according to the passed config.
 * Note: The 'selectize' library turns select dropdowns into input comboboxes
 * that allow users to search by typing and, when configured, add new options 
 * not in the list by triggering a sub-form for that entity.
 */
function initSelectCombobox(confg, fLvl) {                                      //console.log("initSelectCombobox. CONFG = %O. fLvl = ", confg, fLvl)
    var options = {
        create: confg.add,
        onChange: confg.change,
        placeholder: 'Select ' + confg.name
    };
    if (confg.options) { addAdditionalOptions(); }
    $(confg.id).selectize(options);  
    /** All non-standard options are added to this 'options' prop. */ 
    function addAdditionalOptions() {
        for (var opt in confg.options) {
            options[opt] = confg.options[opt];
        }
    }
} /* End initSelectCombobox */
/**
 * Inits 'selectize' for each select elem in the form's 'selElems' array
 * according to the 'selMap' config. Empties array after intializing.
 */
function initComboboxes(entity, formLvl) {                                      //console.log("initComboboxes. [%s] formLvl = [%s] fields = %O", entity, formLvl, fParams.forms[formLvl].selElems);
    const fLvl = formLvl || fParams.forms[entity];  
    const selMap = getSelConfgObjs();  
    fParams.forms[fLvl].selElems.forEach(selectizeElem);
    fParams.forms[fLvl].selElems = [];

    function selectizeElem(field) {                                             //console.log("Initializing --%s-- select", field);
        const confg = selMap[field];
        confg.id = confg.id || '#'+field+'-sel';
        initSelectCombobox(confg, fLvl);
    }
    function getSelConfgObjs() {
        return { 
            'Authors': { name: 'Authors', id: '#Authors-sel1', change: onAuthSelection, 
                add: initAuthForm.bind(null, 1) },
            'CitationType': { name: 'Citation Type', change: loadCitTypeFields, add: false },
            'CitationTitle': { name: 'Citation', change: onCitSelection, add: initCitForm },
            'Class': { name: 'Class', change: onLevelSelection, add: initTaxonForm },
            'Country-Region': { name: 'Country-Region', change: onCntryRegSelection, add: false },
            'Country': { name: 'Country', change: false, add: false },
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
} /* End initComboboxes */
function enableCombobox(selId, enable) {
    if (enable === false) { return $(selId)[0].selectize.disable(); }
    $(selId)[0].selectize.enable();
}
function focusCombobox(selId, focus) { 
    if (!focus) { return $(selId)[0].selectize.blur(); }
    $(selId)[0].selectize.focus();
}
function focusFirstCombobox(cntnrId, focus) {
    const selElems = $(cntnrId+' .selectized').toArray();                       //console.log("cntnr = %s, elems[0] = %O", cntnrId, selElems[0]);
    focusCombobox('#'+ selElems[0].id, focus);
}
function clearCombobox(selId) {                                                 //console.log("clearCombobox [%s]", selId);
    var selApi = $(selId)[0].selectize;
    selApi.clear(true);
    selApi.updatePlaceholder();
    selApi.removeOption("");
}    
/** Clears previous options and adds the new ones. Optionally focuses the combobox. */
function updateComboboxOptions(selId, opts, focus) {
    var selApi = $(selId)[0].selectize;
    selApi.clearOptions();
    selApi.addOption(opts);
    selApi.refreshOptions(false);
    if (focus === true) { selApi.focus(); }
}
/*------------------- Form Builders --------------------------------------*/    
/**
 * Builds and returns the subForm according to the passed params. Disables the 
 * select elem 'parent' of the sub-form. 
 * (container)DIV>[(header)P, (fields)DIV, (buttons)DIV]
 */
function initSubForm(formEntity, fLvl, formClasses, fVals, selId) {                 //console.log('initSubForm called. args = %O', arguments)
    const subFormContainer = _util.buildElem('div', {
        id: fLvl+'-form', class: formClasses + ' flex-wrap'}); 
    const hdr = _util.buildElem(
        'p', { 'text': 'New '+_util.ucfirst(formEntity), 'id': fLvl+'-hdr' });
    const fieldRows = buildFormRows(formEntity, fVals, fLvl, selId);
    const bttns = buildFormBttns(formEntity, fLvl, 'create');
    $(subFormContainer).append([hdr, fieldRows, bttns]);
    fParams.forms[fLvl].pSelId = selId; 
    enableCombobox(selId, false)
    return subFormContainer;
}
/** 
 * Builds and returns the default fields for entity sub-form and returns the 
 * row elems. Inits the params for the sub-form in the global fParams obj.
 */
function buildFormRows(entity, fVals, level, pSel, action) {                        //console.log('buildFormRows. args = %O', arguments)
    const rowCntnr = _util.buildElem('div', {
        id: entity+'_Rows', class: 'flex-row flex-wrap'});
    const formConfg = getFormConfg(entity);                                 
    initFormLevelParamsObj(entity, level, pSel, formConfg, (action || 'create'));        
    $(rowCntnr).append(getFormFieldRows(entity, formConfg, fVals, level, false));
    return rowCntnr;
}
/**
 * Returns a form-config object for the passed entity. 
 * -- Property descriptions:  
 * > add - Additonal fields for a detail-entity. E.g. Citation is a detail-entity
 *   of Source with a unique combination of fields from Source and itself.
 * > required - Required fields for the entity.
 * > suggested - Suggested fields for the entity.
 *   NOTE: The required and suggested fields will be the default shown in form. 
 * > optional - All remaining available fields for the entity.
 * > order - Order to display the fields in both the default and expanded forms. 
 * > exitHandler - optional Obj with handlers for exiting create/edit forms.
 */
function getFormConfg(entity) {
    const fieldMap = { 
        "arthropod": {
            "add": {},  
            "required": [],
            "suggested": ["Class", "Order", "Family", "Genus", "Species"],
            "optional": [],
            "order": {
                "sug": ["Class", "Order", "Family", "Genus", "Species"],
                "opt": false },
            "exitHandler": { create: enableTaxonCombos }
        },
        "author": { 
            "add": { "FirstName": "text", "MiddleName": "text", 
                "LastName": "text", "Suffix": "text"}, 
            "required": ["LastName"], 
            "suggested": ["FirstName", "MiddleName"],
            "optional": ["Suffix", "LinkUrl", "LinkDisplay"],
            "order": {
                "sug": ["FirstName", "MiddleName", "LastName"],
                "opt": ["FirstName", "MiddleName", "LastName", "Suffix", 
                    "LinkUrl", "LinkDisplay"]},
        },
        "bat": {
            "add": {},  
            "required": [],
            "suggested": ["Family", "Genus", "Species"],
            "optional": [],
            "order": {
                "sug": ["Family", "Genus", "Species"],
                "opt": false }, 
            //Because there is only one subject realm, the exithandler lives in the subject confg 
        },
        'citation': {
            'add': { 'Title': 'text', 'Volume': 'text', 'Abstract': 'fullTextArea',
                'Issue': 'text', 'Pages': 'text', 'CitationType': 'select', 
                'CitationText': 'fullTextArea'},
            'required': ['Title', 'CitationType'],  
            'suggested': ['CitationText'], 
            'optional': ['Abstract'],
            'order': {
                'sug': ['CitationText', 'Title', 'CitationType'], 
                'opt': ['CitationText', 'Abstract', 'Title', 'CitationType']},  
            'types': {
                'Article': {                        
                    'name': 'Article',
                    'required': ['Authors', 'Year'],
                    'suggested': ['Issue', 'Pages', 'Volume'],
                    'optional': ['Doi', 'LinkDisplay', 'LinkUrl'],
                    'order': {
                        'sug': ['Year', 'Pages', 'Volume', 'Issue', 'Authors'],
                        'opt': ['Year', 'Pages', 'Volume', 'Issue', 
                            'LinkDisplay', 'LinkUrl', 'Doi', 'Authors']},
                },
                'Book': {
                    'name': 'Book',
                    'required': ['Authors'],
                    'suggested': ['Volume', 'Pages'],
                    'optional': ['Doi', 'LinkDisplay', 'LinkUrl'],
                    'order': {
                        'sug': ['Volume', 'Pages', 'Authors'],
                        'opt': ['Volume', 'Doi', 'LinkDisplay', 'LinkUrl', 'Pages', 'Authors']},
                },
                'Chapter': {
                    'name': 'Chapter',
                    'required': ['Pages', 'Authors'],
                    'suggested': [],
                    'optional': ['Doi', 'LinkDisplay', 'LinkUrl'],
                    'order': {
                        'sug': ['Pages', 'Authors'],
                        'opt': ['Pages', 'Doi', 'LinkDisplay', 'LinkUrl', 
                            'Authors' ]},
                },
                "Master's Thesis": {
                    'name': "Master's Thesis",
                    'required': [],
                    'suggested': [],
                    'optional': ['Doi', 'LinkDisplay', 'LinkUrl'],
                    'order': {
                        'sug': [],
                        'opt': ['LinkDisplay', 'LinkUrl', 'Doi']},
                },
                'Museum record': {
                    'name': 'Museum record',
                    'required': [],
                    'suggested': ['Authors', 'Year', 'Pages'],
                    'optional': ['Doi', 'LinkDisplay', 'LinkUrl'],
                    'order': {
                        'sug': ['Year', 'Pages', 'Authors'],
                        'opt': ['Year', 'Pages', 'LinkDisplay', 'LinkUrl', 
                            'Doi', 'Authors']},
                },
                'Other': {
                    'name': 'Other',
                    'required': [],
                    'suggested': ['Authors', 'Year', 'Issue', 'Pages', 'Volume'],
                    'optional': ['Doi', 'LinkDisplay', 'LinkUrl'],
                    'order': {
                        'sug': ['Year', 'Pages', 'Volume', 'Issue', 'Authors'],
                        'opt': ['Year', 'Pages', 'Volume', 'Issue', 
                            'LinkDisplay', 'LinkUrl', 'Doi', 'Authors']},
                },
                'Ph.D. Dissertation': {
                    'name': 'Ph.D. Dissertation',
                    'required': [],
                    'suggested': [],
                    'optional': ['Doi', 'LinkDisplay', 'LinkUrl'],
                    'order': {
                        'sug': [],
                        'opt': ['LinkDisplay', 'LinkUrl', 'Doi']},
                },
                'Report': {
                    'name': 'Report',
                    'required': [],
                    'suggested': ['Authors', 'Year', 'Pages'],
                    'optional': ['Doi', 'LinkDisplay', 'LinkUrl'],
                    'order': {
                        'sug': ['Year', 'Pages', 'Volume', 'Issue', 'Authors'],
                        'opt': ['Year', 'Pages', 'Volume', 'Issue', 
                            'LinkDisplay', 'LinkUrl', 'Doi', 'Authors']},
                }
            },
            'exitHandler': { create: enablePubField }
        },    
        "editor": { 
            "add": { "FirstName": "text", "MiddleName": "text", 
                "LastName": "text", "Suffix": "text"}, 
            "required": ["LastName"], 
            "suggested": ["FirstName", "MiddleName"],
            "optional": ["Suffix", "LinkUrl", "LinkDisplay"],
            "order": {
                "sug": ["FirstName", "MiddleName", "LastName"],
                "opt": ["FirstName", "MiddleName", "LastName", "Suffix", 
                    "LinkUrl", "LinkDisplay"]},
        },                                  
        "interaction": {
            "add": {},  
            "required": ["InteractionType"],
            "suggested": ["InteractionTags", "Note"],
            "optional": [],
            "order": {
                "sug": ["InteractionType","InteractionTags", "Note"],
                "opt": false },
            "exitHandler": { create: resetInteractionForm }
        },
        "location": {
            "add": {},  
            "required": ["DisplayName", "Country"],
            "suggested": ["Description", "HabitatType", "Latitude", "Longitude",
                "Elevation", "ElevationMax"],
            "optional": [],
            "order": {
                "sug": ["DisplayName", "Description", "Country", "HabitatType", 
                    "Elevation", "ElevationMax", "Latitude", "Longitude"],
                "opt": false },
            "exitHandler": { create: enableCountryRegionField }
        },
        "object": {
            "add": {"Realm": "select"},  
            "required": [],
            "suggested": ["Realm"],
            "optional": [],
            "order": {
                "sug": ["Realm"],
                "opt": false }, 
        },
        "plant": {
            "add": {},  
            "required": [],
            "suggested": ["Family", "Genus", "Species"],
            "optional": [],
            "order": {
                "sug": ["Family", "Genus", "Species"],
                "opt": false},
            "exitHandler": { create: enableTaxonCombos }
        },
        "publication": {
            "add": { "Title" : "text", "PublicationType": "select", 
                "Publisher": "select"},  
            "required": ["PublicationType", "Title"],
            "suggested": [],
            "optional": [],
            "order": {
                "sug": ["Title", "PublicationType"],
                "opt": ["Title", "PublicationType"] },
            "types": {
                "Book": {
                    "name": 'Book',
                    "required": ["Authors", 'Editors', "Publisher", "Year"],
                    "suggested": [],
                    "optional": ["Description", "LinkDisplay", "LinkUrl", "Doi"],
                    "order": {
                        "sug": ["Year", "Publisher", "Authors", 'Editors'],
                        "opt": ["Year", "Doi", "LinkDisplay", "LinkUrl", 
                            "Description", "Publisher", "Authors", 'Editors']},
                },
                "Journal": {
                    "name": 'Journal',
                    "required": [],
                    "suggested": [],
                    "optional": ["Year", "Description", "LinkDisplay", "LinkUrl", 
                        "Doi", "Publisher", "Authors" ],
                    "order": {
                        "sug": [],
                        "opt": ["Year", "Doi", "LinkDisplay", "LinkUrl",
                        "Description", "Publisher", "Authors" ]},
                },
                "Other": {
                    "name": 'Other',
                    "required": ["Authors", 'Year'],
                    "suggested": ["Publisher"],
                    "optional": ["Description", "LinkDisplay", "LinkUrl", "Doi"],
                    "order":  {
                        "sug": ["Year", "Publisher", "Authors"],
                        "opt": ["Year", "Doi", "LinkDisplay", "LinkUrl", 
                            "Description", "Publisher", "Authors"]},
                },
                "Thesis/Dissertation": {
                    "name": 'Thesis/Dissertation',
                    "required": ["Authors", "Publisher", "Year"],
                    "suggested": [],
                    "optional": ["Description", "LinkDisplay", "LinkUrl", "Doi"],
                    "order":  {
                        "sug": ["Year", "Publisher", "Authors"],
                        "opt": ["Year", "Description", "LinkDisplay", 
                            "LinkUrl", "Doi", "Publisher", "Authors"]},
                },
            }
        },
        "publisher": { 
            "add": { "City": "text", "Country": "text"}, 
            "required": ["DisplayName", "City", "Country"],
            "suggested": [],
            "optional": ["Description", "LinkUrl", "LinkDisplay"],
            "order": {
                "sug": ["DisplayName", "City", "Country"],
                "opt": ["DisplayName", "City", "Country", "Description", 
                    "LinkUrl", "LinkDisplay"]},
        },
        "subject": {
            "add": {},  
            "required": [],
            "suggested": ["Family", "Genus", "Species"],
            "optional": [],
            "order": {
                "sug": ["Family", "Genus", "Species"],
                "opt": false },
            "exitHandler": { create: enableTaxonCombos }
        },
        "taxon": {
            "add": {},  
            "required": ["DisplayName"],
            "suggested": [],
            "optional": [],
            "order": {
                "sug": ["DisplayName"],
                "opt": false },
            "exitHandler": { create: onTaxonCreateFormExit }
        },
    };
    return fieldMap[entity];
}
/**
 * Returns an object of fields and field types for the passed entity.
 * Note: Source's have sub-entities that will return the core source fields.
 */
function getCoreFieldDefs(entity) {  
    const coreEntityMap = {
        "author": "source",         "citation": "source",
        "publication": "source",    "publisher": "source",
        "location": "location",     "subject": "taxonLvls",
        "object": "taxonLvls",      "plant": "taxonLvls",
        "arthropod": "taxonLvls",   "taxon": "taxon",
        "interaction": "interaction","bat": "taxonLvls",          
        'editor': 'source',
    };
    const fields = {
        "location": { "DisplayName": "text", "Description": "textArea", 
            "Elevation": "text", "ElevationMax": "text", "Longitude": "text", 
            "Latitude": "text", "HabitatType": "select", "Country": "select", 
        }, 
        "interaction": { "InteractionType": "select", "Note": "fullTextArea", 
            "InteractionTags": "tags"
        },
        "source": { "DisplayName": "text", "Description": "textArea", 
            "Year": "text", "Doi": "text", "LinkDisplay": "text", 
            "LinkUrl": "text", "Authors": "multiSelect", "Editors": "multiSelect"
        },
        "taxonLvls": {
            "Class": "select", "Order": "select", "Family": "select", 
            "Genus": "select", "Species": "select"
        },
        "taxon": { "DisplayName": "text" }
    };
    return fields[coreEntityMap[entity]];
}    
/** -------------------- Form Row Builders ------------------------------ */
/**
 * Toggles between displaying all fields for the entity and only showing the 
 * default (required and suggested) fields.
 */
function toggleShowAllFields(entity, fLvl) {                                    //console.log('--- Showing all Fields [%s] -------', this.checked);
    fParams.forms.expanded[entity] = this.checked;         
    const fVals = getCurrentFormFieldVals(fLvl); console.log('vals before fill = %O', JSON.parse(JSON.stringify(fVals)));
    const fConfg = fParams.forms[fLvl].confg;                                   //console.log('toggling optional fields. Show? [%s]', fParams.forms.expanded[entity]);
    $('#'+entity+'_Rows').empty();
    $('#'+entity+'_Rows').append(getFormFieldRows(entity, fConfg, fVals, fLvl));
    initComboboxes(entity, fLvl);
    fillComplexFormFields(fLvl);
    finishSrcForms();

    function finishSrcForms() {
        if (['citation', 'publication'].indexOf(entity) === -1) { return; }
        if (entity === 'publication') { ifBookAddAuthEdNote(fVals.PublicationType)}
        if (entity === 'citation') { 
            handleSpecialCaseTypeUpdates($('#CitationType-sel')[0], fLvl);
            handleCitText(fLvl);
        }
        updateFieldLabelsForType(entity, fLvl);
    }
} /* End toggleShowAllFields */
/**
 * Returns rows for the entity form fields. If the form is a source-type, 
 * the type-entity form config is used. 
 */
function getFormFieldRows(entity, fConfg, fVals, fLvl) {
    const typeConfg = fParams.forms[fLvl].typeConfg;
    const fObj = getFieldTypeObj(entity, fConfg, fLvl, typeConfg);
    const rows = buildRows(fObj, entity, fVals, fLvl);                          //console.log('[%s] form rows. confg = %O, rows = %O, order = %O', entity, fObj, rows, fConfg.order);
    return orderRows(rows, fObj.order);
}
/**
 * Returns an obj with the entity's field defs and all required fields.
 * @return {obj} .fields   Obj - k: fieldName, v: fieldType.
 *               .required Ary of required fields
 */
function getFieldTypeObj(entity, fConfg, fLvl, typeConfg) {                     //console.log('getFieldTypeObj for [%s] @ [%s] level. confg = %O typeConfg = %O', entity, fLvl, fConfg, typeConfg);
    const allFields = Object.assign(getCoreFieldDefs(entity), fConfg.add);
    const include = getFormFields(fConfg, typeConfg, entity);       
    const fieldConfg = fParams.forms[fLvl].fieldConfg;     
    fieldConfg.order = getFieldOrder(fConfg, typeConfg, entity);                     
    fieldConfg.required = typeConfg ? 
        typeConfg.required.concat(fConfg.required) : fConfg.required;
    fieldConfg.fields = {};
    include.forEach(field => fieldConfg.fields[field] = allFields[field]);    
    return fieldConfg;
}   
/**
 * Returns an array of fields to include in the form. If the form is a 
 * source-type, the type-entity form config is combined with the main-entity's.
 * Eg, Publication-type confgs are combined with publication's form confg.
 */
function getFormFields(fConfg, typeConfg, entity) {                             //console.log('getting form fields for fConfg = %O typeConfg = %O', fConfg, typeConfg);
    const shwAll = fParams.forms.expanded[entity];
    const dfault = shwAll ? 
        fConfg.required.concat(fConfg.suggested).concat(fConfg.optional) :
        fConfg.required.concat(fConfg.suggested); 
    const typeFields = typeConfg && shwAll ? 
        typeConfg.required.concat(typeConfg.suggested).concat(typeConfg.optional) :
        typeConfg ? typeConfg.required.concat(typeConfg.suggested) : []; 
    return dfault.concat(typeFields);
}
/** Returns the order the form fields should be displayed. */
function getFieldOrder(fConfg, typeConfg, entity) {
    const shwAll = fParams.forms.expanded[entity];
    const order = typeConfg && shwAll ? 
        fConfg.order.opt.concat(typeConfg.order.opt) : 
        typeConfg ? 
            fConfg.order.sug.concat(typeConfg.order.sug) : 
            shwAll && fConfg.order.opt ? fConfg.order.opt : fConfg.order.sug; 
    return order.map(field => field); //removes references to confg obj.
}
/** @return {ary} Rows for each field in the entity field obj. */
function buildRows(fieldObj, entity, fVals, fLvl) {                             //console.log("buildRows. fLvl = [%s] fields = [%O]", fLvl, fieldObj);
    const rows = [];
    for (let field in fieldObj.fields) {                                        //console.log("  field = ", field);
        rows.push(buildRow(field, fieldObj, entity, fVals, fLvl));
    }
    return rows;
}
/**
 * @return {div} Form field row with required-state and value (if passed) set.  
 */
function buildRow(field, fieldsObj, entity, fVals, fLvl) {                      //console.log("buildRow. field [%s], fLvl [%s], fVals = %O, fieldsObj = %O", field, fLvl, fVals, fieldsObj);
    const input = buildFieldInput(fieldsObj.fields[field], entity, field, fLvl);
    const isReq = isFieldRequried(field, fLvl, fieldsObj.required);    
    addFieldToFormFieldObj();
    fillFieldIfValuePassed();
    $(input).change(storeFieldValue.bind(null, input, field, fLvl, null));
    return buildFormRow(_util.ucfirst(field), input, fLvl, isReq, "");
    /** Adds the field, and it's type and value, to the form's field obj.  */
    function addFieldToFormFieldObj() {
        fParams.forms[fLvl].fieldConfg.vals[field] = {
            val: fVals[field], type: fieldsObj.fields[field]
        };
    }
    /** Sets the value for the field if it is in the passed 'fVals' obj. */
    function fillFieldIfValuePassed() {                                         //console.log('filling value in [%s]', field);
        if (field in fVals) { 
            if (fieldsObj.fields[field] === "multiSelect") { return; }          //console.log('---filling');
            $(input).val(fVals[field]); 
        }
    }
} /* End buildRow */ 
function buildFieldInput(fieldType, entity, field, fLvl) {                      //console.log('buildFieldInput. type [%s], entity [%s], field [%s], lvl [%s]', fieldType, entity, field, fLvl);
    const buildFieldType = { "text": buildTextInput, "tags": buildTagsElem, 
        "select": buildSelectCombo, "multiSelect": buildMultiSelectCntnr,  
        "textArea": buildTextArea, "fullTextArea": buildLongTextArea };
    return buildFieldType[fieldType](entity, field, fLvl);  
}
function getFieldClass(fLvl, fieldType) {  
    const classes = { 'top': 'lrg-field', 'sub': 'med-field', 'sub2': 'med-field' };
    return fieldType === 'long' ? (fLvl === 'top' ? 'xlrg-field top' :
        'xlrg-field') : classes[fLvl];
}
/** Returns true if field is in the required fields array. */
function isFieldRequried(field, fLvl, reqFields) {                              //console.log('isFieldRequried. fLvl = [%s], fParams = %O', fLvl, fParams);
    return reqFields.indexOf(field) !== -1;
}
/**
 * Adds field value to the form's confg object. Calls @handleCitText to check 
 * citation fields for any changes to the generated and displayed citation text.
 */
function storeFieldValue(elem, fieldName, fLvl, value) {            
    const val = value || $(elem).val();                             
    if (fieldName === 'Authors' || fieldName === 'Editors') { return; }
    if (fParams.forms[fLvl].entity === 'citation') { handleCitText(fLvl); }
    fParams.forms[fLvl].fieldConfg.vals[fieldName].val = val;
}
/** Stores value at index of the order on form, ie the cnt position. */
function storeMultiSelectValue(fLvl, cnt, field, e) {                           //console.log('storeMultiSelectValue. lvl = %s, cnt = %s, field = %s, e = %O', fLvl, cnt, field, e);
    if (e.target.value === "create") { return; }
    const vals = fParams.forms[fLvl].fieldConfg.vals;                           //console.log('getCurrentFormFieldVals. vals = %O', vals);
    const value = e.target.value || null;
    if (!vals[field].val) { vals[field].val = {}; }
    vals[field].val[cnt] = value;
    checkForBlanksInOrder(vals[field].val, field, fLvl);    
}
/**
 * Author/editor fields must have all fields filled continuously. There can 
 * be extra blanks on the end, but none at the beginning. If blanks are found,
 * an error is shown to the user, otherwise any active errors are cleared. 
 */
function checkForBlanksInOrder(vals, field, fLvl) {                             //console.log('checkForBlanksInOrder. [%s] vals = %O', field, vals);
    const map = { 'Authors': 'fillAuthBlanks', 'Editors': 'fillEdBlanks' };
    let blank = false;

    for (let ord in vals) {
        blank = vals[ord] && blank ? "found" :
            !vals[ord] && !blank ? "maybe" : blank;  
    } 
    if (blank === "found") { return reportFormFieldErr(field, map[field], fLvl); }
    if ($('#'+field+'_errs.'+fLvl+'-active-errs')) { clrContribFieldErr(field, fLvl); }
}
/** Reorders the rows into the order set in the form config obj. */
function orderRows(rows, order) {                                               //console.log("    ordering rows = %O, order = %O", rows, order);
    rows.sort((a, b) => {
        let x = order.indexOf(a.id.split("_row")[0]);  
        let y = order.indexOf(b.id.split("_row")[0]); 
        return x < y ? -1 : x > y ? 1 : 0;
    });
    return rows;
}
/*----------------------- Form Input Builders ----------------------------*/
function buildTextInput(entity, field, fLvl) { 
    return _util.buildElem('input', { 'type': 'text', class: getFieldClass(fLvl) });
}
function buildTextArea(entity, field, fLvl) {                                     
    return _util.buildElem('textarea', {class: getFieldClass(fLvl) });
}
function buildLongTextArea(entity, field, fLvl) {
    return _util.buildElem('textarea', 
        { class: getFieldClass(fLvl, 'long'), id:field+'-txt' });
}
/**
 * Creates and returns a select dropdown for the passed field. If it is one of 
 * a larger set of select elems, the current count is appended to the id. Adds 
 * the select's fieldName to the subForm config's 'selElem' array to later 
 * init the 'selectize' combobox. 
 */
function buildSelectCombo(entity, field, fLvl, cnt) {                           //console.log("buildSelectCombo [%s] field %s, fLvl [%s], cnt [%s]", entity, field, fLvl, cnt);                            
    const opts = getSelectOpts(field);                                          //console.log("entity = %s. field = %s, opts = %O ", entity, field, opts);
    const fieldId = cnt ? field + '-sel' + cnt : field + '-sel';
    const sel = _util.buildSelectElem(opts, { id: fieldId , class: getFieldClass(fLvl)});
    fParams.forms[fLvl].selElems.push(field);
    return sel;
}
/**
 * Creates a select dropdown field wrapped in a div container that will
 * be reaplced inline upon selection. Either with an existing Author's name, 
 * or the Author create form when the user enters a new Author's name. 
 */
function buildMultiSelectCntnr(entity, field, fLvl) {                           //console.log("entity = %s. field = ", entity, field);
    const cntnr = _util.buildElem('div', { id: field+'-sel-cntnr'});
    const elems = buildMultiSelectElems(entity, field, fLvl, 1)
    $(cntnr).data('inputType', 'multiSelect').data('cnt', 1);
    $(cntnr).append(elems);
    return cntnr;
}
function buildMultiSelectElems(entity, field, fLvl, cnt) {
    const wrapper = _util.buildElem('div', {class: 'flex-row'});
    const selElem = buildSelectCombo(entity, field, fLvl, cnt);
    const lbl = _util.buildElem('span', {text: getCntLabel(), class:'multi-span'});
    $(lbl).css({padding: '.75em .5em 0 0', width: '2.2em'});
    $(selElem).change(storeMultiSelectValue.bind(null, fLvl, cnt, field));
    $(wrapper).append([lbl, selElem]);
    return wrapper;

    function getCntLabel() {
        const map = {1: '1st: ', 2:'2nd: ', 3:'3rd: '};
        return cnt in map ? map[cnt] : cnt+'th: '; 
    }
} /* End buildMultiSelectElems */
/**
 * Creates and returns a select dropdown that will be initialized with 'selectize'
 * to allow multiple selections. A data property is added for use form submission.
 */
function buildTagsElem(entity, field, fLvl) {
    const opts = getSelectOpts(field);                                          //console.log("entity = %s. field = %s, opts = %O ", entity, field, opts);
    const tagSel = _util.buildSelectElem(opts, { id: field + '-sel', 
        class: getFieldClass(fLvl)});
    $(tagSel).data('inputType', 'tags');
    return tagSel;
}
/* ---------- Option Builders --------------------------------------------*/
/** Returns and array of options for the passed field type. */
function getSelectOpts(field) {                                                 //console.log("getSelectOpts. for %s", field);
    var optMap = {
        "Authors": [ getSrcOpts, 'authSrcs'],
        "CitationType": [ getCitTypeOpts, 'citTypeNames'],
        "Class": [ getTaxonOpts, 'Class' ],
        "Country": [ getOptsFromStoredData, 'countryNames' ],
        "Editors": [ getSrcOpts, 'authSrcs'],
        "Family": [ getTaxonOpts, 'Family' ],
        "Genus": [ getTaxonOpts, 'Genus' ],
        "HabitatType": [ getOptsFromStoredData, 'habTypeNames'],
        "InteractionTags": [ getTagOpts, 'interaction' ],
        "InteractionType": [ getOptsFromStoredData, 'intTypeNames' ],
        "Order": [ getTaxonOpts, 'Order' ],
        "PublicationType": [ getOptsFromStoredData, 'pubTypeNames'],
        "Publisher": [ getSrcOpts, 'publSrcs'],
        "Realm": [ getRealmOpts, null ],
        "Species": [ getTaxonOpts, 'Species' ],
        // "Tags": [ getTagOpts, 'source' ],
    };
    var getOpts = optMap[field][0];
    var fieldKey = optMap[field][1];
    return getOpts(fieldKey, field);
}
/** Sorts an array of options via sort method. */
function alphaOptionObjs(a, b) {
    var x = a.text.toLowerCase();
    var y = b.text.toLowerCase();
    return x<y ? -1 : x>y ? 1 : 0;
}
/** Builds options out of the passed ids and their entity records. */
function getRcrdOpts(ids, rcrds) {
    var idAry = ids || Object.keys(rcrds);
    return idAry.map(function(id) {
        let text = rcrds[id].displayName.includes('(citation)') ? 
            rcrds[id].displayName.split('(citation)')[0] : rcrds[id].displayName;
        return { value: id, text: text };
    });
}
function getOptsFromStoredRcrds(prop) {
    var rcrds = _util.getDataFromStorage(prop); 
    var opts = getRcrdOpts(null, rcrds);
    return opts.sort(alphaOptionObjs);
}
/** Builds options out of a stored entity-name object. */
function getOptsFromStoredData(prop) {                                          //console.log("prop = ", prop)
    var dataObj = _util.getDataFromStorage(prop);
    var sortedNameKeys = Object.keys(dataObj).sort();
    return buildOptsObj(dataObj, sortedNameKeys);
}
/** Builds options out of the entity-name  object, with id as 'value'. */
function buildOptsObj(entityObj, sortedKeys) {
    return sortedKeys.map(function(name) {
        return { value: entityObj[name], text: _util.ucfirst(name) }
    });    
}
/** Returns an array of options objects for tags of the passed entity. */
function getTagOpts(entity) {
    return getOptsFromStoredData(entity+"Tags");
}
/** Returns an array of source-type (prop) options objects. */
function getSrcOpts(prop, field) {
    const map = { 'pubSrcs': 'Publication', 'publSrcs': 'Publisher', 
        'authSrcs': field ? field.slice(0, -1) : 'Author' };
    const ids = _util.getDataFromStorage(prop);
    let opts = getRcrdOpts(ids, fParams.records.source);
    opts.unshift({ value: 'create', text: 'Add a new '+map[prop]+'...'});
    return opts;
}
/**
 * Return the citation type options available for the parent publication type.
 * Also adds the parent publication and source records to the fParams obj. 
 */
function getCitTypeOpts(prop) {
    const fLvl = getSubFormLvl('sub');
    const citTypesObj = _util.getDataFromStorage(prop);
    const curTypeNames = getCitTypeNames();                                     //console.log('curTypeNames = %O', curTypeNames);
    return buildOptsObj(citTypesObj, curTypeNames.sort());

    function getCitTypeNames() {
        const opts = {
            'Book': ['Book', 'Chapter'], 'Journal': ['Article'],
            'Other': ['Museum record', 'Other', 'Report'],
            'Thesis/Dissertation': ["Master's Thesis", 'Ph.D. Dissertation']
        };
        setPubInParams();                                                       //console.log('type = ', fParams.forms[fLvl].pub.pub.publicationType.displayName)
        return opts[fParams.forms[fLvl].pub.pub.publicationType.displayName];
    }
    function setPubInParams() {
        const pubSrc = getPubSrc();    
        const pub = getEntityRecord('publication', pubSrc.publication);
        fParams.forms[fLvl].pub = { src: pubSrc, pub: pub };
    }
    function getPubSrc() {
        const pubId = $('#Publication-sel').val() ? 
            $('#Publication-sel').val() : 
            getEntityRecord('source', fParams.editing.core).parent;
        return fParams.records.source[pubId];
    }
} /* End getCitTypeOpts */
/** Returns an array of taxonyms for the passed level and the form's realm. */
function getTaxonOpts(level) {
    let opts = getOptsFromStoredData(fParams.forms.taxonPs.realm+level+'Names');//console.log("taxon opts for [%s] = %O", fParams.forms.taxonPs.realm+level+"Names", opts)        
    opts.unshift({ value: 'create', text: 'Add a new '+level+'...'});
    return opts;
}
function getRealmOpts() {
    return getOptsFromStoredData('objectRealmNames');  
}
/* -----------------------------------------------------------------------*/
/**
 * Each element is built, nested, and returned as a completed row. 
 * rowDiv>(errorDiv, fieldDiv>(label, input, [pin]))
 */
function buildFormRow(field, input, fLvl, isReq, rowClss) {                     //console.log('building form row for [%s], req? [%s]', field, isReq);
    const fieldName = field.replace(/([A-Z])/g, ' $1'); //Adds space between pascal-cased words
    const rowDiv = _util.buildElem('div', { class: getRowClasses(), 
        id: field + '_row'});
    const errorDiv = _util.buildElem('div', { id: field+'_errs'}); 
    const fieldCntnr = _util.buildElem('div', { class: 'field-row flex-row'});
    const label = _util.buildElem('label', {text: _util.ucfirst(fieldName)});
    const pin = fLvl === 'top' ? getPinElem(field) : null;     
    if (isReq) { handleRequiredField(label, input, fLvl); } 
    $(fieldCntnr).append([label, input, pin]);
    $(rowDiv).append([errorDiv, fieldCntnr]);
    return rowDiv;
    /** Returns the style classes for the row. */
    function getRowClasses() { 
         var rowClass = input.className.includes('xlrg-field') ? 
            'full-row' : (fLvl + '-row') + (rowClss ? (' '+rowClss) : '');      //console.log("rowClass = ", rowClass)
        return rowClass; 
    }
} /* End buildFormRow */
function getPinElem(field) {
    var relFields = ["CitationTitle", "Country-Region", "Location", "Publication"];
    var pinClasses = 'top-pin' + (fParams.editing ? ' invis' : '');
    var pin = _util.buildElem("input", {type: "checkbox", id: field+"_pin", class: pinClasses});
    _util.addEnterKeypressClick(pin);
    if (relFields.indexOf(field) !== -1) { $(pin).click(checkConnectedFieldPin); }
    return pin;
}
/**
 * When a dependent field is pinned, the connected field will also be pinned.
 * If the connected field is unpinned, the dependant field is as well.
 */
function checkConnectedFieldPin() {
    var field = this.id.split("_pin")[0]; 
    var params = {
        "CitationTitle": { checked: true, relField: "Publication" },
        "Country-Region": { checked: false, relField: "Location" },
        "Location": { checked: true, relField: "Country-Region" },
        "Publication": { checked: false, relField: "CitationTitle" },
    }
    checkFieldPins(this, params[field].checked, params[field].relField);
}
function checkFieldPins(curPin, checkState, relField) {
    if (curPin.checked === checkState) {
        if ($('#'+relField+'_pin')[0].checked === checkState) { return; }
        $('#'+relField+'_pin')[0].checked = checkState;
    }
}
/**
 * Required field's have a 'required' class added which appends '*' to their 
 * label. Added to the input elem is a change event reponsible for enabling/
 * disabling the submit button and a form-level data property. The input elem
 * is added to the form param's reqElems property. 
 */
function handleRequiredField(label, input, fLvl) {
    $(label).addClass('required');  
    $(input).change(checkRequiredFields);
    $(input).data('fLvl', fLvl);
    fParams.forms[fLvl].reqElems.push(input);
}
/**
 * On a required field's change event, the submit button for the element's form 
 * is enabled if all of it's required fields have values and it has no open child forms. 
 */
function checkRequiredFields(e) {                                               //console.log('checkRequiredFields e = %O', e)
    const input = e.currentTarget;
    const fLvl = $(input).data('fLvl');  
    checkReqFieldsAndToggleSubmitBttn(input, fLvl);
    if (fParams.forms[fLvl].entity === 'citation') { handleCitText(fLvl); }  
}
function checkReqFieldsAndToggleSubmitBttn(input, fLvl) {                       //console.log('### checkingReqFields = %O, fLvl = ', input, fLvl);
    const subBttnId = '#'+fLvl+'-submit';
    if (!isRequiredFieldFilled(fLvl, input) || hasOpenSubForm(fLvl)) {          //console.log('     disabling submit');
        disableSubmitBttn(subBttnId); 
    } else if (ifAllRequiredFieldsFilled(fLvl)) {                               //console.log('     enabling submit');
        enableSubmitBttn(subBttnId);
    }
}
/**
 * After the interaction form is submitted, the submit button is disabled to 
 * eliminate accidently creating duplicate interactions. This change event is
 * added to the non-required fields of the form to enable to submit as soon as 
 * any change happens in the form, and the required fields are filled.
 */
function checkIntFieldsAndEnableSubmit() {
    if (ifAllRequiredFieldsFilled('top')) { enableSubmitBttn('#top-submit'); }
}
/** Returns true if all the required elements for the current form have a value. */
function ifAllRequiredFieldsFilled(fLvl) {                                      //console.log("->-> ifAllRequiredFieldsFilled... fLvl = %s. fPs = %O", fLvl, fParams)
    const reqElems = fParams.forms[fLvl].reqElems;                          
    return reqElems.every(isRequiredFieldFilled.bind(null, fLvl));
}
/** Note: checks the first input of multiSelect container elems.  */
function isRequiredFieldFilled(fLvl, elem) {                                    //console.log('   checking elem = %O, id = ', elem, elem.id);
    if ($('.'+fLvl+'-active-errs').length) { return false; }
    return elem.value ? true : 
        elem.id.includes('-cntnr') ? isCntnrFilled(elem) : false;  
}
/**
 * Returns true if the first field of the author/editor container has a value. 
 * For book publications, either authors or editors are required. If there is 
 * no author value, the first editor value is returned instead. 
 */
function isCntnrFilled(elem) {                                                  //console.log('isCntnrFilled? elem = %O', elem);
    const authVal = $('#Authors-sel-cntnr')[0].firstChild.children[1].value;
    const edVal = $('#Editors-sel-cntnr').length ? 
        $('#Editors-sel-cntnr')[0].firstChild.children[1].value : false;
    return authVal ? authVal : edVal;         
}
/** Returns true if the next sub-level form exists in the dom. */
function hasOpenSubForm(fLvl) {
    const childFormLvl = getNextFormLevel('child', fLvl);
    return $('#'+childFormLvl+'-form').length > 0;
}
/**
 * Returns a container with 'Create [Entity]' and 'Cancel' buttons bound to events
 * specific to their form container @getBttnEvents, and a left spacer that 
 * pushes the buttons to the bottom right of their form container.
 */
function buildFormBttns(entity, level, action, noShwFields) { 
    const cntnr = _util.buildElem("div", { class: "flex-row bttn-cntnr" });
    const shwFields = noShwFields ? null : buildAddFieldsCheckbox(entity, level);
    const spacer = $('<div></div>').css("flex-grow", 2);
    const submitBttns = buildSubmitAndCancelBttns(level, action, entity);
    $(cntnr).append([shwFields, spacer].concat(submitBttns));
    return cntnr;
}
/** 
 * Returns the html of a checkbox labeled 'Show all fields' that toggles the 
 * form fields displayed between the default fields and all available.
 * If there are no additional fields for the form, no checkbox is returned. 
 * @return {elem} Checkbox and label that will 'Show all fields'
 */
function buildAddFieldsCheckbox(entity, level) {  
    if (fParams.forms[level].confg.order.opt === false) { return; }
    const cntnr = _util.buildElem('div', {class: 'all-fields-cntnr'});
    const chckBox = _util.buildElem('input', { id: level+'-all-fields', 
        type: 'checkbox', value: 'Show all fields' }) 
    const lbl = _util.buildElem('label', { for: level+'-all-fields', 
        text: 'Show all fields.' }); 
    if (fParams.forms.expanded[entity]) { chckBox.checked = true; }
    $(chckBox).change(toggleShowAllFields.bind(chckBox, _util.lcfirst(entity), level));
    _util.addEnterKeypressClick(chckBox);
    $(cntnr).append([chckBox, lbl]);
    return cntnr;
}
/** Returns the buttons with the events bound. */
function buildSubmitAndCancelBttns(level, action, entity) {
    const bttn = { create: "Create", edit: "Update" };
    const events = getBttnEvents(entity, level);                                //console.log("events = %O", events);
    const submit = buildFormButton(
        'submit', level, bttn[action] + " " + _util.ucfirst(entity));
    const cancel = buildFormButton('cancel', level, 'Cancel');
    $(submit).attr("disabled", true).css("opacity", ".6").click(events.submit);
    $(cancel).css("cursor", "pointer").click(events.cancel);
    return [submit, cancel];
}
/** Returns a (submit or cancel) button for the form level. */
function buildFormButton(action, level, val) {
    return _util.buildElem("input", { id: level +'-'+action, 
        class: "ag-fresh grid-bttn", type: "button", value: val});
}
/**
 * Returns an object with 'submit' and 'cancel' events bound to the passed level's
 * form container.  
 */
function getBttnEvents(entity, level) {                                         //console.log("getBttnEvents for [%s] @ [%s]", entity, level);
    return { 
        submit: getFormValuesAndSubmit.bind(null, '#'+level+'-form', level, entity), 
        cancel: exitForm.bind(null, '#'+level+'-form', level, true) 
    };
}
/**
 * Removes the form container with the passed id, clears and enables the combobox,
 * and contextually enables to parent form's submit button. Calls the exit 
 * handler stored in the form's params object.
 */
function exitForm(formId, fLvl, focus, data) {                                  //console.log("Exiting form. id = %s, fLvl = %s, exitHandler = %O", formId, fLvl, fParams.forms[fLvl].exitHandler);      
    $(formId).remove();
    resetFormCombobox(fLvl, focus);
    if (fLvl !== 'top') { ifParentFormValidEnableSubmit(fLvl); }
    fParams.forms[fLvl].exitHandler(data);
}
/**
 * Clears and enables the parent combobox for the exited form. Removes any 
 * placeholder options and, optionally, brings it into focus.
 */
function resetFormCombobox(fLvl, focus) {        
    if (!fParams.forms[fLvl].pSelId) { return; }
    const combobox = $(fParams.forms[fLvl].pSelId)[0].selectize;   
    combobox.clear();
    combobox.enable();
    combobox.removeOption(''); //Removes the "Creating [entity]..." placeholder.
    if (focus) { combobox.focus(); 
    } else if (focus === false) { combobox.blur(); }
}
/** Returns the 'next' form level- either the parent or child. */
function getNextFormLevel(next, curLvl) {
    const fLvls = fParams.formLevels;
    const nextLvl = next === 'parent' ? 
        fLvls[fLvls.indexOf(curLvl) - 1] : 
        fLvls[fLvls.indexOf(curLvl) + 1] ;
    return nextLvl;
}
/** 
 * Returns the sub form's lvl. If the top form is not the interaction form,
 * the passed form lvl is reduced by one and returned. 
 */
function getSubFormLvl(intFormLvl) {  
    var fLvls = fParams.formLevels;
    return fParams.forms.top.entity === 'interaction' ? 
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
    const vals = fParams.forms[fLvl].fieldConfg.vals;                           //console.log('getCurrentFormFieldVals. vals = %O', JSON.parse(JSON.stringify(vals)));
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
    const vals = fParams.forms[fLvl].fieldConfg.vals;                           //console.log('fillComplexFormFields. vals = %O, curFields = %O', JSON.parse(JSON.stringify(vals)),fParams.forms[fLvl].fieldConfg.fields);
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
function fieldIsDisplayed(field, fLvl) {
    const curFields = fParams.forms[fLvl].fieldConfg.fields;                    //console.log('field [%s] is displayed? ', field, Object.keys(curFields).indexOf(field) !== -1);
    return Object.keys(curFields).indexOf(field) !== -1;
}
/*------------------ Form Submission Data-Prep Methods -------------------*/
/** Enables the parent form's submit button if all required fields have values. */
function ifParentFormValidEnableSubmit(fLvl) {
    const parentLvl = getNextFormLevel('parent', fLvl);
    if (ifAllRequiredFieldsFilled(parentLvl)) {
        enableSubmitBttn('#'+parentLvl+'-submit');
    }
}
/** Enables passed submit button */
function enableSubmitBttn(bttnId) {  
    $(bttnId).attr("disabled", false).css({"opacity": "1", "cursor": "pointer"}); 
}  
/** Enables passed submit button */
function disableSubmitBttn(bttnId) {                                            //console.log('disabling bttn = ', bttnId)
    $(bttnId).attr("disabled", true).css({"opacity": ".6", "cursor": "initial"}); 
}  
function toggleWaitOverlay(waiting) {                                           //console.log("toggling wait overlay")
    if (waiting) { appendWaitingOverlay();
    } else { $('#c-overlay').remove(); }  
}
function appendWaitingOverlay() {
    $('#b-overlay').append(_util.buildElem('div', { 
        class: 'overlay waiting', id: 'c-overlay'}));
    $('#c-overlay').css({'z-index': '1000', 'display': 'block'});
}
function getFormValuesAndSubmit(id, fLvl, entity) {                             //console.log("getFormValuesAndSubmit. id = %s, fLvl = %s, entity = %s", id, fLvl, entity);
    const formVals = getFormValueData(entity, fLvl, true);
    buildFormDataAndSubmit(fLvl, formVals);  
}
/**
 * Loops through all rows in the form with the passed id and returns an object 
 * of the form values. Entity data not contained in an input on the form is 
 * added @handleAdditionalEntityData.
 */
function getFormValueData(entity, fLvl, submitting) {
    const elems = $('#'+entity+'_Rows')[0].children;                            //console.log('getFormValueData. [%s] elems = %O', entity, elems);
    const formVals = {};
    for (let i = 0; i < elems.length; i++) { getInputData(elems[i]); }  
    handleAdditionalEntityData(entity);
    return formVals;
    /** Get's the value from the form elem and set it into formVals. */
    function getInputData(elem) {                                           
        if (elem.className === 'skipFormData') { return; }                      //console.log("elem = %O", elem)
        const fieldName = _util.lcfirst(elem.children[1].children[0].innerText.trim().split(" ").join("")); 
        const input = elem.children[1].children[1];                             //console.log("---------[%s] = %O", fieldName, input);
        
        formVals[fieldName] = $(input).data('inputType') ? 
            getInputVals(fieldName, input, $(input).data('inputType')) : 
            input.value.trim() || null;                                         //console.log('[%s] = [%s]', fieldName, formVals[fieldName]);
    }
    /** Edge case input type values are processed via their type handlers. */
    function getInputVals(fieldName, input, type) {
        const typeHandlers = {
            'multiSelect': getSelectedVals, 'tags': getTagVals
        };
        return typeHandlers[type](input, fieldName);
    }
    /** Adds an array of tag values. */
    function getTagVals(input, fieldName) {                                 
        const selId = '#'+_util.ucfirst(fieldName)+'-sel';
        return $(selId)[0].selectize.getValue();       
    }
    function handleAdditionalEntityData(entity) {
        if (!submitting) { return; }
        const dataHndlrs = {
            'author': [ getAuthFullName, getAuthDisplayName ],
            'editor': [ getAuthFullName, getAuthDisplayName ],
            'citation': [ getPublicationData, addCitDisplayName, ifFullWorkCited,
                addContributorData ], 
            'interaction': [ handleUnspecifiedLocs ],
            'location': [ addElevUnits, padLatLong, getLocType ], 
            'publication': [ addContributorData ],
            'taxon': [ getTaxonData ],
        };
        if (!dataHndlrs[entity]) { return; }
        dataHndlrs[entity].forEach(function(func) { func(); });
    }
    /** ---- Additional Author data ------ */
    /** Concatonates all Author name fields and adds it as 'fullName' in formVals. */ 
    function getAuthFullName() { 
        const nameFields = ['firstName', 'middleName', 'lastName', 'suffix'];
        const fullName = [];
        nameFields.forEach(function(field) {
            if (formVals[field]) { fullName.push(formVals[field]) };
        });
        formVals.fullName = fullName.join(" ");
    }
    /** Concats author Last, First Middle Suffix as the author display name.*/
    function getAuthDisplayName() {  
        let displayName = formVals.lastName + ',';
        ["firstName", "middleName", "suffix"].forEach(function(name){
            if (formVals[name]) { addToDisplayName(formVals[name]); };
        });
        formVals.displayName = displayName;

        function addToDisplayName(namePiece) {
            if (namePiece.length === 1) { namePiece += '.'; }
            displayName += ' '+namePiece; 
         } 
    } /* End getAuthDisplayName */
    /** ---- Additional Citation data ------ */
    function getPublicationData() {
        formVals.publication = fParams.editing ? 
            fParams.forms[fLvl].pub.src.id : $('#Publication-sel').val();
    }
    /** Adds 'displayName', which will be added to both the form data objects. */
    function addCitDisplayName() { 
        formVals.displayName = formVals.title ? formVals.title : formVals.chapterTitle;
    }
    /** 
     * Appends '(citation)' to citations that are attributed to entire books 
     * to maintain unique display names for both the publication and its citation.
     */
    function ifFullWorkCited() { 
        const type = $('#CitationType-sel option:selected').text();
        const fulls = ['Book', "Master's Thesis", 'Museum record', 'Other', 
            'Ph.D. Dissertation', 'Report' ];
        if (fulls.indexOf(type) === -1) { return; }
        const pubTitle = fParams.forms[fLvl].pub.src.displayName;
        if (formVals.displayName.includes('(citation)')) { return; }
        if (pubTitle != formVals.displayName) { return; }
        formVals.displayName += '(citation)';
    }
    function getTypeName(type, id) {            
        const types = _util.getDataFromStorage(type+'Names');               
        for (name in types) {
            if (types[name] === id) { return name; }
        }
    }
    /** ---- Additional Location data ------ */
    /** Adds the elevation unit abbrevation, meters, if an elevation was entered. */
    function addElevUnits() {
        if (formVals.elevation) { formVals.elevUnitAbbrv = 'm'; }
    }
    /** Pads each to the 13 scale set by the db. This eliminates false change flags. */
    function padLatLong() {
        if (formVals.latitude) {            
            formVals.latitude = parseFloat(formVals.latitude).toFixed(14); 
        }
        if (formVals.longitude) {            
            formVals.longitude = parseFloat(formVals.longitude).toFixed(14); 
        }
    }
    /** Returns the id of the Unspecified region. */
    function getUnspecifiedLocId() {
        const regions = _util.getDataFromStorage('topRegionNames');
        return regions['Unspecified'];
    }
    /**
     * Sets location type according to the most specific data entered. 
     * "Point": if there is lat/long data. "Area" otherwise.
     */
    function getLocType() {
        const locTypes = _util.getDataFromStorage('locTypeNames');
        const type = formVals.longitude || formVals.latitude ? 'Point' : 'Area';
        formVals.locationType = locTypes[type];  
    }
    /**
     * If no location is selected for an interaction record, the country field 
     * is checked for a value. If set, it is added as the interaction's location;
     * if not, the 'Unspecfied' location is added.
     */
    function handleUnspecifiedLocs(entity) {
        if (formVals.location) { return; }
        formVals.location = formVals.country || getUnspecifiedLocId();   
    }
    /** ---- Additional Publication data ------ */
    /**
     * Builds contributor object with all contributing authors and editors, 
     * distinguished by an isEditor flag.  
     */
    function addContributorData() {
        if (!formVals.contributor) { formVals.contributor = {}; } 
        if (formVals.editors) { addContribs(formVals.editors, true); }
        if (formVals.authors) { addContribs(formVals.authors, false); }  
        
        function addContribs(vals, isEd) {                                      //console.log('addContributorData. editors ? [%s] formVals = %O', isEd, vals)
            for (let ord in vals) {
                let id = vals[ord];
                formVals.contributor[id] = { isEditor: isEd, ord: ord };
            }
        }
    } /* End addContributorData */
    /** ---- Additional Taxon data ------ */
    function getTaxonData() {
        const formTaxonLvl = fParams.forms.taxonPs.formTaxonLvl;
        formVals.parentTaxon = getParentTaxon(formTaxonLvl);
        formVals.level = formTaxonLvl;
    }
    /** -------------------- Additional Taxon Data -----------------------*/ 
    /**
     * Checks each parent-level combo for a selected taxon. If none, the realm
     * taxon is added as the new Taxon's parent.
     */
    function getParentTaxon(lvl) {
        var lvls = fParams.forms.taxonPs.lvls;
        var parentLvl = lvls[lvls.indexOf(lvl)-1];
        if ($('#'+parentLvl+'-sel').length) { 
            return $('#'+parentLvl+'-sel').val() || getParentTaxon(parentLvl);
        } 
        return fParams.forms.taxonPs.realmTaxon.id;
    }
} /* End getFormValueData */
/** -------------- Form Data Helpers ------------ */
/** Returns an obj with the order (k) of the values (v) inside of the container. */
function getSelectedVals(cntnr, fieldName) {
    let vals = {};
    const elems = cntnr.children; 
    for (let i = 0; i <= elems.length-1; ++i) {                                 //console.log('getSelectedVals. elem = %O', elems[i]);
        let input = elems[i].children[1];
        if (input.value) { vals[i+1] = input.value; }
    }                                                                           //console.log('vals = %O', JSON.parse(JSON.stringify(vals)))
    return vals;
}
/**
 * Builds a form data object @buildFormData. Sends it to the server @submitFormData
 */
function buildFormDataAndSubmit(fLvl, formVals) {                        
    let entity = fParams.forms[fLvl].entity;                                    //console.log("Submitting [ %s ] [ %s ]-form with vals = %O", entity, fLvl, formVals);  
    if (entity === 'editor') { entity = 'author'; }
    const formData = buildFormData(entity, formVals);                           //console.log("formData = %O", formData);
    submitFormData(formData, fLvl, entity);
}                
/**
 * Returns an object with the entity names' as keys for their field-val objects, 
 * which are grouped into flat data and related-entity data objects. 
 */
function buildFormData(entity, formVals) { 
    var pEntity = getParentEntity(entity);                                  
    var parentFields = !pEntity || getParentFields(entity);                     //console.log("buildFormDataObj. pEntity = %s, formVals = %O, parentFields = %O", pEntity, formVals, parentFields);
    var fieldTrans = getFieldTranslations(entity); 
    var rels = getRelationshipFields(entity);
    var data = buildFormDataObj();

    for (var field in formVals) { getFormFieldData(field, formVals[field]); }
    if (pEntity === "source") { handleDetailTypeField(); }                      //console.log("formData = %O", data);
    if (entity === "location") { handleGeoJson(); }
    return data;

    function buildFormDataObj() {
        var data = {};
        data[pEntity] = { flat: {}, rel: {} };
        data[entity] = { flat: {}, rel: {} };
        return data;
    }
    /** 
     * Adds the field's value to the appropriate entity's form data-group object. 
     * Field name translations are handled @addTransFormData. 
     */
    function getFormFieldData(field, val) {
        var dataGroup = rels.indexOf(field) !== -1 ? 'rel' : 'flat';
        if (field in fieldTrans) { addTransFormData(); 
        } else { addFormData(); }
        /** Renames the field and stores the value for each entity in the map. */
        function addTransFormData() {  
            var transMap = fieldTrans[field];
            for (var ent in transMap) { 
                addTransFieldData(data[ent][dataGroup], transMap[ent]); 
            }
        }
        /** Adds the value to formData, if the newField name isn't false. */
        function addTransFieldData(formData, newField) {
            if (newField === false) { return; }
            if (Array.isArray(newField)) {
                newField.forEach(fieldName => formData[fieldName] = val);
            } else { formData[newField] = val; }
        }
        /** Adds the field and value to the appropriate entity data-type object. */
        function addFormData() { 
            var ent = (pEntity && parentFields.indexOf(field) !== -1) ? pEntity : entity;
            data[ent][dataGroup][field] = val;
        }
    } /* End getFormFieldData */
    /**
     * If the form entity is a detail entity for a 'parent' entity (e.g. as citation
     * or author are to Source), that entity is added as the 'type' of it's parent and 
     * 'hasDetail' is added to trigger detail entity processing on the server.
     * Note: currently, only sources have detail entities.
     */
    function handleDetailTypeField() { 
        if (pEntity) {
            data[pEntity].rel[pEntity+'Type'] = entity; 
            data[pEntity].hasDetail = true;
        } 
    }
    /**
     * If the location has GPS data, a geoJson detail entity is added to the 
     * form data. If the location already has geoJson, coordinates are only 
     * overwritten if the type is 'point'. Otherwise, (multi)polygon coords
     * would be overwritten. Once map editing is complete, this will be revised.
     */
    function handleGeoJson() {
        if (!formVals.latitude || !formVals.longitude) { return; }
        delete data.false;
        const displayPoint = JSON.stringify([ formVals.longitude, formVals.latitude ]);
        const geoJson = fParams.forms.top.geoJson
        const coords = !geoJson || geoJson.type === 'point' ? 
            displayPoint : fParams.forms[fLvl].geoJson.coordinates;
        data.geoJson = {
            flat: { 
                'centerPoint': displayPoint, 
                'coordinates': coords, 
                'type': 'point' },
            rel: {}
        };
        data.location.hasDetail = true;
    }
} /* End buildFormDataObj */
/** Returns the core entity. (eg, Source is returned for author, citation, etc.) */
function getCoreFormEntity(entity) {
    var coreEntities = {
        'author': 'source',         'citation': 'source', 
        'publication': 'source',    'publisher': 'source', 
        'location': 'location',     'taxon': 'taxon', 
        'interaction': 'interaction'
    };
    return coreEntities[entity];
}
function getParentEntity(entity) {                                          
    const details = ['author', 'citation', 'publication', 'publisher'];         //console.log("hasParentEntity? [%s]. Entity = %s", details.indexOf(entity) !== -1, entity);
    return details.indexOf(entity) !== -1 ? 'source' : false;
}
/** Returns an array of the parent entity's field names. */
function getParentFields(entity) {
    var parentFields = Object.keys(getCoreFieldDefs(entity));
    return  parentFields.map(function(field) {
        return _util.lcfirst(field.split(' ').join(''));
    });
}
/**
 * Returns the fields that need to be renamed and the entity they belong to. 
 * A "false" field will not be added to the final form data. An array of 
 * fields will add the form value to each field for the specified entity.
 */
function getFieldTranslations(entity) {                                         //console.log("entity = ", entity)
    var fieldTrans = {
        'author': {
            'displayName': { 'source': 'displayName', 'author': 'displayName' }
        },
        'citation': { 
            'authors': { 'source': false },
            'contributor': { 'source': 'contributor' },
            'citationText': { 'source': 'description', 'citation': 'fullText' }, 
            'publication': { 'source': 'parentSource' },
            'title': { 'source': 'displayName', 'citation': ['displayName', 'title'] },
            'chapterTitle': { 'source': 'displayName', 
                'citation': ['displayName', 'title'] },
            'volume': { 'citation': 'publicationVolume' },
            'edition': { 'citation': 'publicationVolume' },
            'issue': { 'citation': 'publicationIssue' },
            'pages': { 'citation': 'publicationPages' },
            'reportType': { 'citation': 'subType' }
            // "tags": { "source": "tags" }
        },
        'interaction': {
            'citationTitle': { 'interaction': 'source' },
            'country/Region': { 'interaction': false },
            'interactionTags': { 'interaction': 'tags' },
            'notes': { 'interaction': 'note' }, 
            'publication': { 'interaction': false }
        },
        'location': {
            'country': { 'location': 'parentLoc' }
        },
        'publication': { 
            'authors': { "source": false },
            'editors': { "source": false }, 
            'contributor': { 'source': 'contributor' },
            'publisher': { 'source': 'parentSource' }, 
            'description': { 'source': 'description', 'publication': 'description' },
            'title': { 'source': 'displayName', 'publication': 'displayName' },
            'publisher/University': { 'source': 'parentSource' }
        },
        'publisher': {
            'displayName': { 'source': 'displayName', 'publisher': 'displayName' }
        },
    };
    return fieldTrans[entity] || {};
}
/**
 * Returns an array of fields that are relationships with other entities. 
 * Note: use field names before field translations/renamings.
 */
function getRelationshipFields(entity) {
    var relationships = {
        'author': ['sourceType'], 
        'citation': ['citationType', 'contributor', 'publication'], 
        'location': ['locationType', 'habitatType', 'country'],
        'publication': ['publicationType', 'contributor', 'publisher', 
            'publisher/University'],
        'publisher': [],
        'taxon': ['level', 'parentTaxon'],
        'interaction': ['citationTitle', 'location', 'subject', 'object', 
            'interactionTags', 'interactionType' ]
    };
    return relationships[entity];
}
/*------------------ Form Submit Methods ---------------------------------*/
/** Sends the passed form data object via ajax to the appropriate controller. */
function submitFormData(formData, fLvl, entity) {                               console.log("submitFormData [ %s ]= %O", fLvl, formData);
    var coreEntity = getCoreFormEntity(entity);       
    var url = getEntityUrl(fParams.forms[fLvl].action);
    if (fParams.editing) { formData.ids = fParams.editing; }
    formData.coreEntity = coreEntity;
    storeParamsData(coreEntity, fLvl);
    toggleWaitOverlay(true);
    _util.sendAjaxQuery(formData, url, formSubmitSucess, formSubmitError);
}
/** Stores data relevant to the form submission that will be used later. */
function storeParamsData(entity, fLvl) {                                 
    var focuses = { 'source': 'srcs', 'location': 'locs', 'taxon': 'taxa', 
        'interaction': 'int' };
    fParams.ajaxFormLvl = fLvl;
    fParams.submitFocus = focuses[entity];
}
/** Returns the full url for the passed entity and action.  */
function getEntityUrl(action) {
    var envUrl = $('body').data("ajax-target-url");
    return envUrl + "crud/entity/" + action;
}
/*------------------ Form Success Methods --------------------------------*/
/**
 * Ajax success callback. Updates the stored data @db_sync.updateEditedData and 
 * the stored core records in the fParams object. Exit's the successfully submitted 
 * form @exitFormAndSelectNewEntity.  
 */
function formSubmitSucess(ajaxData, textStatus, jqXHR) {                        console.log("Ajax Success! data = %O, textStatus = %s, jqXHR = %O", ajaxData, textStatus, jqXHR);                   
    var data = parseData(ajaxData.results);
    storeData(data);
}
/** Calls the appropriate data storage method and updates fParams. */  
function storeData(data) {  
    db_sync.updateEditedData(data, onDataSynced);
}
/** afterStoredDataUpdated callback */
function onDataSynced(data, msg, errTag) {                                 //console.log('data update complete. args = %O', arguments);
    toggleWaitOverlay(false);
    if (errTag) { return errUpdatingData(msg, errTag); }
    if (data.citationUpdate) { return; }
    if (isEditForm() && data.core == 'source') { updateRelatedCitations(data); }
    if (isEditForm() && !hasChngs(data)) { 
        return showSuccessMsg("No changes detected."); }  
    updateStoredFormParamsData(data);
    handleFormComplete(data);

    function isEditForm() {
        return fParams.forms[fParams.ajaxFormLvl].action === 'edit'
    }
} /* End afterStoredDataUpdated */
/** Updates the core records in the global form params object. */
function updateStoredFormParamsData(data) {                                     //console.log('updateStoredFormParams. fPs = %O', fParams);
    fParams.records[data.core] = _util.getDataFromStorage(data.core);
}
/*------------------ Top-Form Success Methods --------------------*/
function handleFormComplete(data) {   
    var fLvl = fParams.ajaxFormLvl;                                             //console.log('handleFormComplete fLvl = ', fLvl);
    if (fLvl !== 'top') { return exitFormAndSelectNewEntity(data); }
    fParams.forms.top.exitHandler(data);
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
/** Resets the interactions form leaving only the pinned values. */
function resetInteractionForm() {
    var vals = getPinnedFieldVals();                                            //console.log("vals = %O", vals);
    showSuccessMsg("New Interaction successfully created.");
    initFormParams("create", "interaction");
    resetIntFields(vals);
    $('#top-cancel').val(" Close "); 
    disableSubmitBttn('#top-submit');
}
/** Shows a form-submit success message at the top of the interaction form. */
function showSuccessMsg(msg) {
    var p = _util.buildElem('p', { id: 'success', text: msg });
    $('#top-hdr').after(p);
    window.setTimeout(function() { $('#success').remove(); }, 3500);
}
/** Returns an obj with the form fields and either their pinned values or false. */
function getPinnedFieldVals(pins) {
    var pins = $('form[name="top"] [id$="_pin"]').toArray();                    //console.log("pins = %O", pins);
    var vals = {};
    pins.forEach(function(pin) {  
        if (pin.checked) { getFieldVal(pin.id.split("_pin")[0]); 
        } else { addFalseValue(pin.id.split("_pin")[0]); }
    });
    return vals;

    function getFieldVal(fieldName) {                                           //console.log("fieldName = %s", fieldName)
        var suffx = fieldName === 'Note' ? '-txt' : '-sel';
        vals[fieldName] = $('#'+fieldName+suffx).val();
    }
    function addFalseValue(fieldName) {
        vals[fieldName] = false;
    }
} /* End getPinnedValsObj */
/**
 * Resets the top-form in preparation for another entry. All fields without a pinned
 * value will be reset. checkRequiredFields is triggered to update the submit button.
 */
function resetIntFields(vals) {
    disableSubmitBttn("#top-submit");
    initInteractionParams();
    resetUnpinnedFields(vals);
    fillPubDetailsIfPinned(vals.Publication);
    $(fParams.forms.top.reqElems[0]).change();
}
function resetUnpinnedFields(vals) {
    for (var field in vals) {                                                   //console.log("field %s val %s", field, vals[field]);
        if (!vals[field]) { clearField(field); }
    }
}
function clearField(fieldName) {
    if (fieldName === 'Note') { return $('#Note-txt').val(""); }
    clearDetailPanel(fieldName);
    clearCombobox('#'+fieldName+'-sel');
}
function clearDetailPanel(field) {
    let detailFields = {
        'Location': 'loc', 'CitationTitle': 'src', 'Publication': 'src' };
    if (Object.keys(detailFields).indexOf(field) !== -1) {  
        emptySidePanel(detailFields[field], true);
    }
}
function fillPubDetailsIfPinned(pub) {
    if (pub) { updateSrcDetailPanel('pub'); }
}
/** Inits the necessary interaction form params after form reset. */
function initInteractionParams() {
    initFormLevelParamsObj(
        "interaction", "top", null, getFormConfg("interaction"), "create");
    addReqElemsToConfg();
}
/** ---------------- After Source Data Edited --------------------------- */
/**
 * Updates the full text of related citations for edited Authors, Publications 
 * or Publishers.
 */
function updateRelatedCitations(data) {                                         //console.log('updateRelatedCitations. data = %O', data);
    const srcData = data.coreEntity;
    const srcType = srcData.sourceType.displayName;
    const cites = srcType == 'Author' ? getChildCites(srcData.contributions) : 
        srcType == 'Publication' ? srcData.children : 
        srcType == 'Publisher' ? getChildCites(srcData.children) : false;
    if (!cites) { return; }
    updateCitations();

    function getChildCites(srcs) {  
        const cites = [];
        srcs.forEach(id => {
            const src = getEntityRecord('source', id); 
            if (src.citation) { return cites.push(id); }
            src.children.forEach(cId => cites.push(cId))
        });
        return cites;
    }
    function updateCitations() {                                                //console.log('updateCitations. cites = %O', cites);
        cites.forEach(id => updateCitText(id, srcData));
    }
    function updateCitText(id, chngdSrc) {
        const citSrc = getEntityRecord('source', id);
        const cit = getEntityRecord('citation', citSrc.citation);
        const citText = rebuildCitationText(citSrc, cit, chngdSrc);             //console.log('citation text = ', citText);
        updatedCitationData(citSrc, citText);
    }
} /* End updateRelatedCitations */
/** Sends ajax data to update citation and source entities. */
function updatedCitationData(citSrc, text) { 
    const data = { srcId: citSrc.id, text: text };
    _util.sendAjaxQuery(data, 'crud/citation/edit', formSubmitSucess, formSubmitError);
}
    /**
 * Generates and displays the full citation text after all required fields 
 * are filled.
 */
function rebuildCitationText(citSrc, cit) {
    const pubSrc = getEntityRecord('source', citSrc.parent);                    //console.log('rebuildCitationText. citSrc = %O, cit = %O, pub = %O', citSrc, cit, pubSrc);
    const type = cit.citationType.displayName;                                  //console.log("type = ", type);
    const getFullText = { 'Article': rbldArticleCit, 'Book': rbldBookCit, 
        'Chapter': rbldChapterCit, 'Ph.D. Dissertation': rbldDissertThesisCit, 
        'Other': rbldOtherCit, 'Report': rbldOtherCit, 
        "Master's Thesis": rbldDissertThesisCit, 'Museum record': rbldOtherCit };
    return getFullText[type](type);                                    
    /**
     * Articles, Museum records, etc.
     * Citation example with all data available: 
     *     1st Author [Last name, Initials.], 2nd+ Author(s) & Last Author 
     *     [Initials. Last]. Year. Title of article. Title of Journal 
     *     Volume (Issue): Pages.
     */
    function  rbldArticleCit(type) {                                      
        const athrs = getCitAuthors();                                      
        const year = _util.stripString(citSrc.year);
        const title = _util.stripString(cit.title);
        const pub = _util.stripString(pubSrc.displayName);
        const vip = getCiteVolumeIssueAndPages(); 
        let fullText = [athrs, year, title].map(addPunc).join(' ')+' '; 
        fullText += vip ? (pub+' '+vip) : pub;
        return fullText + '.';
    }
    /**
     * Citation example with all data available: 
     *     1st Author [Last name, Initials.], 2nd+ Author(s) & Last Author 
     *     [Initials. Last]. Year. Book Title (Editor 1 [initials, last name],
     *      & Editor X [initials, last name], eds.). Edition. Publisher Name, 
     *      City, Country.
     */
    function rbldBookCit(type) {
        const athrs = getPubSrcAuthors() || getCitAuthors();
        const year = pubSrc.year;
        const titlesAndEds = getCitTitlesAndEditors();
        const ed = citSrc.publicationVolume;
        const pages = getCitBookPages();
        const publ = buildPublString(pubSrc) || '[NEEDS PUBLISHER DATA]';  
        const allFields = [athrs, year, titlesAndEds, ed, pages, publ];
        return allFields.filter(f=>f).map(addPunc).join(' ');
    }
    /** 
     * Citation example with all data available: 
     *     1st Author [Last name, Initials.], 2nd+ Author(s) & Last Author 
     *     [Initials. Last]. Year. Chapter Title. In: Book Title (Editor 1 
     *     [initials, last name], & Editor X [initials, last name], eds.). 
     *     pp. pages. Publisher Name, City, Country.
     */
    function rbldChapterCit(type) {
        const athrs = getPubSrcAuthors() || getCitAuthors();
        const year = pubSrc.year;
        const titlesAndEds = getCitTitlesAndEditors();
        const pages = getCitBookPages();
        const publ = buildPublString(pubSrc) || '[NEEDS PUBLISHER DATA]';
        const allFields = [athrs, year, titlesAndEds, pages, publ]; 
        return allFields.filter(f => f).join('. ')+'.';
    }
    /**
     * Citation example with all data available: 
     *     1st Author [Last name, Initials.], 2nd+ Author(s) & Last Author 
     *     [Initials. Last]. Year. Title.  Academic degree. Academic 
     *     Institution, City, Country.
     */
    function rbldDissertThesisCit(type) {
        const athrs = getPubSrcAuthors();
        const year = pubSrc.year;
        const title = _util.stripString(cit.title);
        const degree = type === "Master's Thesis" ? 'M.S. Thesis' : type;
        const publ = buildPublString(pubSrc) || '[NEEDS PUBLISHER DATA]';
        return [athrs, year, title, degree, publ].join('. ')+'.';
    }
    /**
     * Citation example with all data available: 
     *     1st Author [Last name, Initials.], 2nd+ Author(s) & Last Author 
     *     [Initials. Last]. Year. Title. Volume (Issue): Pages. Publisher 
     *     Name, City, Country.
     */
    function rbldOtherCit(type) {
        const athrs = getCitAuthors() || getPubSrcAuthors();
        const year = citSrc.year ? _util.stripString(citSrc.year) : pubSrc.year;
        const title = _util.stripString(cit.title);
        const vip = getCiteVolumeIssueAndPages();
        const publ = buildPublString(pubSrc);
        return [athrs, year, title, vip, publ].filter(f=>f).join('. ') +'.';
    }
        /** ---------- citation full text helpers ----------------------- */
    function getCitBookPages(argument) {
        if (!cit.publicationPages) { return false; }
        return 'pp. ' + _util.stripString(cit.publicationPages);
    }
    function getCitAuthors() { 
        const auths = citSrc.authors;                                           //console.log('auths = %O', auths);
        if (!Object.keys(auths).length) { return false; }
        return getFormattedAuthorNames(auths);
    }
    function getPubSrcAuthors() {
        const auths = pubSrc.authors;
        if (!auths) { return false; }
        return getFormattedAuthorNames(auths);
    }
    function getPubEditors() {
        const eds = pubSrc.editors;  
        if (!eds) { return false }
        const names = getFormattedAuthorNames(eds, true);
        const edStr = Object.keys(eds).length > 1 ? ', eds.' : ', ed.';
        return '('+ names + edStr + ')';
    }
    /**
     * Returns: Chapter title. In: Publication title [if there are editors,
     * they are added in parentheses here.]. 
     */
    function getCitTitlesAndEditors() { 
        const chap = type === 'Chapter' ? _util.stripString(cit.title) : false;
        const pub = _util.stripString(pubSrc.displayName);
        const titles = chap ? (chap + '. In: ' + pub) : pub;
        const eds = getPubEditors();
        return eds ? (titles + ' ' + eds) : titles;
    }
    /** 
     * Formats volume, issue, and page range data and returns either: 
     *     Volume (Issue): pag-es || Volume (Issue) || Volume: pag-es || 
     *     Volume || (Issue): pag-es || Issue || pag-es || null
     * Note: all possible returns wrapped in parentheses.
     */
    function getCiteVolumeIssueAndPages() {  
        const iss = cit.publicationIssue ? '('+cit.publicationIssue+')' : null; 
        const vol = cit.publicationVolume ? cit.publicationVolume : null;  
        const pgs = cit.publicationPages ? cit.publicationPages : null;   
        return vol && iss && pgs ? (vol+' '+iss+': '+pgs) :
            vol && iss ? (vol+' '+iss) : vol && pgs ? (vol+': '+pgs) :
                vol ? (vol) : iss && pgs ? (iss+': '+pgs) : iss ? (iss) : 
                    pgs ? (pgs) : (null);
    }
} /* End rebuildCitationText */
/*------------------ After Sub-Entity Created ----------------------------*/
/**
 * Exits the successfully submitted form @exitForm. Adds and selects the new 
 * entity in the form's parent elem @addAndSelectEntity.
 */
function exitFormAndSelectNewEntity(data) {                                     //console.log('exitFormAndSelectNewEntity')
    const fLvl = fParams.ajaxFormLvl;           
    exitForm('#'+fLvl+'-form', fLvl, false, data); 
    if (fParams.forms[fLvl].pSelId) { addAndSelectEntity(data, fLvl); }
}
/** Adds and option for the new entity to the form's parent elem, and selects it. */
function addAndSelectEntity(data, fLvl) {
    const selApi = $(fParams.forms[fLvl].pSelId)[0].selectize;        
    selApi.addOption({ 
        'value': data.coreEntity.id, 'text': data.coreEntity.displayName 
    });
    selApi.addItem(data.coreEntity.id);
}
/** --------------- Helpers --------------------- */
/**
 * Parses the nested objects in the returned JSON data. This is because the 
 * data comes back from the server having been double JSON-encoded, due to the 
 * 'serialize' library and the JSONResponse object. 
 */
function parseData(data) {  
    data.coreEntity = JSON.parse(data.coreEntity);
    data.detailEntity = JSON.parse(data.detailEntity);
    return data;
}
/*------------------- Form Error Handlers --------------------------------*/
/**------------- Form Submit-Errors --------------*/
/** Builds and appends an error elem that displays the error to the user. */
function formSubmitError(jqXHR, textStatus, errorThrown) {                      //console.log("ajaxError. responseText = [%O] - jqXHR:%O", jqXHR.responseText, jqXHR);
    const fLvl = fParams.ajaxFormLvl;                                          
    const elem = getFormErrElem(fLvl);
    const errTag = getFormErrTag(JSON.parse(jqXHR.responseText));
    const msg = getFormErrMsg(errTag);
    toggleWaitOverlay(false);
    setErrElemAndExitBttn(elem, msg, errTag, fLvl);
    disableSubmitBttn('#'+fLvl+'-submit');
}
/**
 * Returns an error tag based on the server error text. Reports duplicated 
 * authors or editors, non-unique display names, or returns a generic 
 * form-error message.
 */
function getFormErrTag(errTxt) {                                                //console.log("errTxt = %O", errTxt) 
    return isDuplicateAuthorErr(errTxt) ?
        'dupAuth' : errTxt.DBALException.includes("Duplicate entry") ? 
        'dupEnt'  : 'genSubmitErr';
}
function isDuplicateAuthorErr(errTxt) {
    return errTxt.DBALException.includes("Duplicate entry") &&
        errTxt.DBALException.includes("contribution");
}
function getFormErrMsg(errTag) {
    var msg = {
        'dupAuth': 'An author is selected multiple times.',
        'dupEnt' : 'A record with this display name already exists.',
        'genSubmitErr': 'There was an error during form submission. Please note the ' + 
            'record ID and the changes attempted and send to the developer.'
    };
    return '<span>' + msg[errTag] + '</span>'; 
}
/**------------- Data Storage Errors --------------*/
function errUpdatingData(errMsg, errTag) {                                      //console.log('errUpdatingData. errMsg = [%s], errTag = [%s]', errMsg, errTag);
    var cntnr = _util.buildElem('div', { class: 'flex-col', id:'data_errs' });
    var msg = "<span>" + errMsg + "<br> Please report this error to the developer: <b>" 
        + errTag + "</b><br>This form will close and all stored data will be " +
        "redownloaded.</span>";
    var confirm = _util.buildElem('span', { class: 'flex-row', 
            'text': "Please click \"OK\" to continue." });
    var bttn = _util.buildElem('input', { type: 'button', value: 'OK', 
            class: 'grid-bttn exit-bttn' });
    $(confirm).append(bttn);
    $(cntnr).append([msg, confirm]);
    $('#top-hdr').after(cntnr);
    $(bttn).click(reloadAndRedownloadData);
}
function reloadAndRedownloadData() {                                            //console.log('reloadAndRedownloadData called. prevFocus = ', fParams.submitFocus);
    exitFormPopup(null, 'skipGridReset');
    db_sync.reset();
}
/**
 * When the user attempts to create an entity that uses the sub-form and there 
 * is already an instance using that form, show the user an error message and 
 * reset the select elem. 
 */
function openSubFormErr(field, id, fLvl) {                                      //console.log("selId = %s, fP = %O ", selId, fParams)
    var selId = id || '#'+field+'-sel';
    return formInitErr(field, 'openSubForm', fLvl, selId);
}
/** 
 * When an error prevents a form init, this method shows an error to the user
 * and resets the combobox that triggered the form. 
 */
function formInitErr(field, errTag, fLvl, id) {                                 console.log("formInitErr: [%s]. field = [%s] at [%s], id = %s", errTag, field, fLvl, id)
    const selId = id || '#'+field+'-sel';
    reportFormFieldErr(field, errTag, fLvl);
    window.setTimeout(function() {clearCombobox(selId)}, 10);
    return { 'value': '', 'text': 'Select ' + field };
}
/**
 * Shows the user an error message above the field row. The user can clear the 
 * error manually with the close button, or automatically by resolving the error.
 */
function reportFormFieldErr(fieldName, errTag, fLvl) {                          //console.log("###__formFieldError- '%s' for '%s' @ '%s'", errTag, fieldName, fLvl);
    const errMsgMap = {
        'isGenusPrnt': handleIsGenusPrnt,
        'needsGenusPrnt': handleNeedsGenusParent, 
        'noGenus': handleNoGenus,
        'needsHigherLvlPrnt': handleNeedsHigherLvlPrnt,
        'needsHigherLvl': handleNeedsHigherLvl,
        'openSubForm': handleOpenSubForm,
        'fillAuthBlanks': handleAuthBlanks,
        'fillEdBlanks': handleEdBlanks
    };
    const errElem = getFieldErrElem(fieldName, fLvl);
    errMsgMap[errTag](errElem, errTag, fLvl);
}
/* ----------- Field-Error Handlers --------------------------------------*/
/** Note: error for the edit-taxon form. */
function handleIsGenusPrnt(elem, errTag, fLvl) {  
    const msg = "<span>Genus' with species children must remain at genus.</span>";
    setErrElemAndExitBttn(elem, msg, errTag, 'top');
}
function clrIsGenusPrnt(elem, fLvl, e) {                                       
    $('#txn-lvl')[0].selectize.addItem($('#txn-lvl').data('lvl'));
    clearErrElemAndEnableSubmit(elem, 'top');
}
/** Note: error for the edit-taxon form. */
function handleNeedsGenusParent(elem, errTag, fLvl) {  
    const msg = '<span>Please select a genus parent for the species taxon.</span>';
    setErrElemAndExitBttn(elem, msg, errTag, 'top');
}
function clrNeedsGenusPrntErr(elem, fLvl, e) {                                       
    $('#txn-lvl')[0].selectize.addItem($('#txn-lvl').data('lvl'));
    clearErrElemAndEnableSubmit(elem, 'top');
}
/** Note: error for the create-taxon form. */
function handleNoGenus(elem, errTag, fLvl) {  
    const msg = '<span>Please select a genus before creating a species.</span>';
    setErrElemAndExitBttn(elem, msg, errTag, 'top');
    $('#Genus-sel').change(function(e){
        if (e.target.value) { clrNoGenusErr(elem); }
    });
}
function clrNoGenusErr(elem, fLvl, e) {                                            
    $('#Genus-sel').off('change');
    clearErrElemAndEnableSubmit(elem, fLvl);
}
/** Note: error for the edit-taxon form. */
function handleNeedsHigherLvlPrnt(elem, errTag, fLvl) { 
    const msg = '<span>The parent taxon must be at a higher taxonomic level.</span>';
    setErrElemAndExitBttn(elem, msg, errTag, fLvl);
}
/** Clears the cause, either the parent-selection process or the taxon's level. */
function clrNeedsHigherLvlPrnt(elem, fLvl, e) {                                    
    $('#txn-lvl')[0].selectize.addItem($('#txn-lvl').data('lvl'));
    clearErrElemAndEnableSubmit(elem, fLvl);
    if ($('#sub-form').length) { return selectParentTaxon(
        $('#txn-prnt').data('txn'), fParams.forms.taxonPs.curRealmLvls[0]); 
    }
    $('#txn-lvl').data('lvl', $('#txn-lvl').val());
}
/** Note: error for the edit-taxon form. */
function handleNeedsHigherLvl(elem, errTag, fLvl) {  
    var childLvl = getHighestChildLvl($('#txn-lvl').data('txn'));
    var lvlName = fParams.forms.taxonPs.lvls[childLvl-1];
    var msg = '<div>Taxon level must be higher than that of child taxa. &nbsp&nbsp&nbsp' +
        'Please select a level higher than '+lvlName+'</div>';
    $('#chng-prnt').attr({'disabled': true}).css({'opacity': '.6'});
    setErrElemAndExitBttn(elem, msg, errTag, fLvl);
}
function clrNeedsHigherLvl(elem, fLvl, e, taxonLvl) {    
    var txnLvl = taxonLvl || $('#txn-lvl').data('lvl'); 
    $('#txn-lvl')[0].selectize.addItem(txnLvl, 'silent');
    $('#txn-lvl').data('lvl', txnLvl);
    clearLvlErrs('#Taxon_errs', fLvl);
    enableChngPrntBtttn();
}
/** Enables the button if the change-parent form isn't already open. */
function enableChngPrntBtttn() {
    if ($('#sub-form').length ) { return; }
    $('#chng-prnt').attr({'disabled': false}).css({'opacity': '1'});
}
/** Note: error used for the publication form. */
function handleOpenSubForm(elem, errTag, fLvl) {  
    var subEntity = fParams.forms[fLvl] ? fParams.forms[fLvl].entity : '';
    var msg = '<p>Please finish the open '+ _util.ucfirst(subEntity) + ' form.</p>';
    setErrElemAndExitBttn(elem, msg, errTag, fLvl);
    setOnFormCloseListenerToClearErr(elem, fLvl);
}
/** Note: error used for the publication/citation form. */
function handleAuthBlanks(elem, errTag, fLvl) {  
    var subEntity = fParams.forms[fLvl] ? fParams.forms[fLvl].entity : '';
    var msg = '<p>Please fill the blank in the order of authors.</p>';
    setErrElemAndExitBttn(elem, msg, errTag, fLvl);
    setOnFormCloseListenerToClearErr(elem, fLvl);
}
/** Note: error used for the publication form. */
function handleEdBlanks(elem, errTag, fLvl) {  
    var subEntity = fParams.forms[fLvl] ? fParams.forms[fLvl].entity : '';
    var msg = '<p>Please fill the blank in the order of editors.</p>';
    setErrElemAndExitBttn(elem, msg, errTag, fLvl);
    setOnFormCloseListenerToClearErr(elem, fLvl);
}
function clrContribFieldErr(field, fLvl) {                                      //console.log('clrContribFieldErr.')
    const elem = $('#'+field+'_errs')[0];    
    clearErrElemAndEnableSubmit(elem, fLvl);
    if (ifAllRequiredFieldsFilled(fLvl)) { enableSubmitBttn('#sub-submit'); }
}
/* ----------- Error-Elem Methods -------------- */
function setOnFormCloseListenerToClearErr(elem, fLvl) {
    $('#'+fLvl+'-form').bind('destroyed', clrOpenSubForm.bind(null, elem, fLvl));
}
function clrOpenSubForm(elem, fLvl) {   
    clearLvlErrs(elem, fLvl);
}
/** Returns the error div for the passed field. */
function getFieldErrElem(fieldName, fLvl) {                                     //console.log("getFieldErrElem for %s", fieldName);
    var field = fieldName.split(' ').join('');
    var elem = $('#'+field+'_errs')[0];    
    $(elem).addClass(fLvl+'-active-errs');
    return elem;
}   
function getFormErrElem(fLvl) {
    const elem = _util.buildElem('div', { id: fLvl+'_errs', class: fLvl+'-active-errs' }); 
    $('#'+fLvl+'-hdr').after(elem);
    return elem;
}
function setErrElemAndExitBttn(elem, msg, errTag, fLvl) {                       //console.log('setErrElemAndExitBttn. args = %O', arguments)
    elem.innerHTML = msg;
    $(elem).append(getErrExitBttn(errTag, elem, fLvl));
    disableSubmitBttn('#'+fLvl+'-submit');
}
function getErrExitBttn(errTag, elem, fLvl) {
    const exitHdnlrs = {
        'isGenusPrnt': clrIsGenusPrnt, 'needsGenusPrnt': clrNeedsGenusPrntErr, 
        'noGenus': clrNoGenusErr, 'needsHigherLvl': clrNeedsHigherLvl, 
        'needsHigherLvlPrnt': clrNeedsHigherLvlPrnt, 'openSubForm': clrOpenSubForm,
        'dupAuth': clrFormLvlErr, 'dupEnt': clrFormLvlErr, 
        'genSubmitErr': clrFormLvlErr, 'fillAuthBlanks': false,
        'fillEdBlanks': false
    };
    if (!exitHdnlrs[errTag]) { return []; }
    const bttn = getExitButton();
    bttn.className += ' err-exit';
    $(bttn).off('click').click(exitHdnlrs[errTag].bind(null, elem, fLvl));
    return bttn;
}
function clrFormLvlErr(elem, fLvl) {
    const childFormLvl = getNextFormLevel('child', fLvl);
    $('#'+fLvl+'_errs').remove();
    if (!$('#'+childFormLvl+'-form').length && ifAllRequiredFieldsFilled(fLvl)) {
        enableSubmitBttn('#'+fLvl+'-submit');
    }
}
function clearErrElemAndEnableSubmit(elem, fLvl) {                              //console.log('clearErrElemAndEnableSubmit. [%O] innerHTML = [%s] bool? ', elem, elem.innerHTML, !!elem.innerHTML)
    clearErrElem(elem, fLvl);
    if (!$('#sub-form').length) { enableSubmitBttn('#top-submit'); }
    function clearErrElem(elem, fLvl) {
        if (!elem.innerHTML) { return; }
        elem.innerHTML = '';
        $(elem).removeClass(fLvl+'-active-errs');
    }
} /* End clearErrElemAndEnableSubmit */