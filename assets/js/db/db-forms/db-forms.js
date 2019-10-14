/*
 * When logged in as an 'admin' or 'super': 
 * >> On the database search page, multiple admin-ui elements are added that open 
 * a popup interface allowing the creating, updating and, soon, deleting of data.   
 * >> All Content Blocks will have an edit icon attached to the top left of their 
 * container. When clicked, a wysiwyg interface will encapsulate that block and 
 * allow editing and saving of the content within using the trumbowyg library.
 * 
 * Exports:             Imported by:
 *     addNewLocation
 *     editEntity
 *     initLocForm
 *     initNewDataForm          db-ui
 *     mergeLocs
 *     selectLoc
 *     locCoordErr
 */
import * as _u from '../util.js';
import * as db_sync from '../db-sync.js';
import * as db_page from '../db-page.js';
import { showTodaysUpdates } from '../db-table/db-filters.js';
import * as db_map from '../db-map/db-map.js';
import * as idb from 'idb-keyval'; //set, get, del, clear

let fP = {};
/*-------------- Form HTML Methods -------------------------------------------*/
/** Builds and shows the popup form's structural elements. */
function showFormPopup(actionHdr, entity, id) {
    const title = actionHdr + ' ' + entity;
    $('#b-overlay').addClass('form-ovrly');
    $('#b-overlay-popup').addClass('form-popup');
    $('#b-overlay-popup').append(getFormWindowElems(entity, id, title));
    addFormStyleClass(entity);
}
/** Adds the width to both the popup window and the form element for each entity. */
function addFormStyleClass(entity, remove) {
    const map = {
        'Interaction': 'lrg-form',  'Publication': 'med-form',
        'Publisher': 'sml-form',    'Citation': 'med-form',
        'Author': 'sml-form',       'Location': 'med-form',
        'Taxon': 'sml-form'
    };
    $('#form-main, .form-popup').removeClass(['lrg-form', 'med-form', 'sml-form']);
    $('#form-main, .form-popup').addClass(map[entity]);
}
function setCoreRowStyles(formId, rowClass) {
    const w = $(formId).innerWidth() / 2 - 3;  
    $(rowClass).css({'flex': '0 1 '+w+'px', 'max-width': w});
}
/**
 * Returns the form window elements - the form and the detail panel.
 * section>(div#form-main(header, form), div#form-details(hdr, pub, cit, loc), footer)
 */
function getFormWindowElems(entity, id, title) {
    return [getExitButtonRow(), getFormHtml(entity, id, title)];
}
function getExitButtonRow() {
    var row = _u.buildElem('div', { class: 'exit-row' });
    $(row).append(getExitButton());
    return row;        
}
function getExitButton() {
    const bttn = _u.buildElem('input', { 'id': 'exit-form', 
        'class': 'tbl-bttn exit-bttn', 'type': 'button', 'value': 'X' });
    $(bttn).click(exitFormPopup);
    return bttn;
}
function getFormHtml(entity, id, title) {
    const cntnr = _u.buildElem('div', { class: 'flex-row' });
    $(cntnr).append([getMainFormHtml(title), getDetailPanelElems(entity, id)]);
    return cntnr;
}
function getMainFormHtml(title) {
     const formWin = _u.buildElem('div', { id: 'form-main', class: fP.action });
    $(formWin).append(getHeaderHtml(title));
    return formWin;
}
function getHeaderHtml(title) {
    return _u.buildElem('h1', { 'id': 'top-hdr', 'text': title });
}
/** Returns popup and overlay to their original/default state. */
function exitFormPopup(e, skipReset) { 
    hideSearchFormPopup();
    if (!skipReset) { refocusTableIfFormWasSubmitted(); }
    $("#b-overlay").removeClass("form-ovrly");
    $("#b-overlay-popup").removeClass("form-popup");
    $("#b-overlay-popup").empty();
    fP = {};
    db_map.clearMemory();
}
function hideSearchFormPopup() {
    $('#b-overlay').css({display: 'none'});
}
/**
 * If the form was not submitted the table does not reload. Otherwise, if exiting 
 * the edit-forms, the table will reload with the current focus; or, after creating 
 * an interaction, the table will refocus into source-view. Exiting the interaction
 * forms also sets the 'int-updated-at' filter to 'today'.
 */
function refocusTableIfFormWasSubmitted() {                                     console.log('submitFocus = [%s]', fP.submitFocus);
    if (!fP.submitFocus) { return; }
    if (fP.submitFocus == 'int') { return refocusAndShowUpdates(); }   
    db_page.initDataTable(fP.submitFocus);
}
function refocusAndShowUpdates() {                                              //console.log('refocusAndShowUpdates.')
    var focus  = fP.action === 'create' ? 'srcs' : null;
    showTodaysUpdates(focus);   
}
function getDetailPanelElems(entity, id) {                                      //console.log("getDetailPanelElems. action = %s, entity = %s", fP.action, fP.entity)
    var getDetailElemFunc = fP.action === 'edit' && fP.entity !== 'interaction' ?
        getSubEntityEditDetailElems : getInteractionDetailElems;
    var cntnr = _u.buildElem('div', { 'id': 'form-details' });
    var intIdStr = id ? 'Id:  ' + id : '';
    $(cntnr).append(_u.buildElem('h3', { 'text': entity + ' Details' }));
    $(cntnr).append(getDetailElemFunc(entity, id, cntnr));
    $(cntnr).append(_u.buildElem('p', { id: 'ent-id',  'text': intIdStr }));
    return cntnr;
}
function getInteractionDetailElems(entity, id, cntnr) {
    return ['src','loc'].map(en => initDetailDiv(en));
}
function initDetailDiv(ent) {
    var entities = {'src': 'Source', 'loc': 'Location'};
    var div = _u.buildElem('div', { 'id': ent+'-det', 'class': 'det-div' });
    $(div).append(_u.buildElem('h5', { 'text': entities[ent]+':' }));        
    $(div).append(_u.buildElem('div', { 'text': 'None selected.' }));
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
    var div = _u.buildElem('div', { 'id': 'det-cnt-cntnr' });
    $(div).append(_u.buildElem('span'));        
    $(div).append(refEnts[entity].map(en => initCountDiv(en)));
    return div;
}
function initCountDiv(ent) { 
    var entities = { 'cit': 'Citations', 'fam': 'Families', 'gen': 'Genera', 
        'int': 'Interactions', 'loc': 'Locations', 'ord': 'Orders',
        'pub': 'Publications', 'spc': 'Species', 'txn': 'Taxa', 
    };
    var div = _u.buildElem('div', { 'id': ent+'-det', 'class': 'cnt-div flex-row' });
    $(div).append(_u.buildElem('div', {'text': '0' }));
    $(div).append(_u.buildElem('span', {'text': entities[ent] }));
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
 * is added se the side detail panel of the form. For other entity edit-forms: 
 * the total number of referencing records is added. 
 */
function addDataToIntDetailPanel(ent, propObj) {                                //console.log('ent = [%s], propObj = %O', ent, propObj);
    var html = getDataHtmlString(propObj);
    clearDetailPanel(ent)
    .then(() => $('#'+ent+'-det div').append(html));
}
/** Returns a ul with an li for each data property */
function getDataHtmlString(props) {
    var html = [];
    for (var prop in props) {
        html.push('<li><b>'+prop+'</b>: '+ props[prop]+ '</li>');
    }
    return '<ul class="ul-reg">' + html.join('\n') + '</ul>';
}
function clearDetailPanel(ent, reset) {                                         //console.log('clearDetailPanel for [%s]', ent)
    if (ent === 'cit') { return updateSrcDetailPanel('cit'); }
    if (ent === 'pub') { ent = 'src'; }
    $('#'+ent+'-det div').empty();
    if (reset) { $('#'+ent+'-det div').append('None selected.') }
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
        initFormLevelParamsObj(entity, 'top', null, getFormConfg(entity), action); console.log("#### Init fP = %O, curfP = %O", _u.snapshot(fP), fP);
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
function initFormLevelParamsObj(entity, level, pSel, formConfg, action) {       //console.log("initLvlParams. fP = %O, arguments = %O", fP, arguments)
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
    };                                                                          //console.log("fLvl params = %O", fP.forms[level]);
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
    initFormParams("edit", entity, id).then(() => {
        showFormPopup('Editing', _u.ucfirst(entity), id);
        initEditForm(id, entity).then(() => onEditFormLoadComplete(id, entity));    
    });
}
/** Inits the edit top-form, filled with all existing data for the record. */
function initEditForm(id, entity) {  
    const form = buildFormElem();  
    return getEditFormFields(id, entity).then(fields => {  
        $(form).append(fields);
        $('#form-main').append(form);     
        finishEditFormBuild(entity);
        if (entity !== 'interaction') { return fillExistingData(entity, id); }
        _u.getData('interaction').then(ints => {
            fP.records.interaction = ints;
            fillExistingData(entity, id);
        });
    });
}   
/** Returns the form fields for the passed entity.  */
function getEditFormFields(id, entity) {
    const rowCntnr = _u.buildElem('div', {
        id: entity+'_Rows', class: 'flex-row flex-wrap'});
    const edgeCase = { 'citation': getSrcTypeFields, 'interaction': getIntFormFields, 
        'publication': getSrcTypeFields, 'taxon': getTaxonEditFields };
    const fieldBldr = entity in edgeCase ? edgeCase[entity] : buildEditFormFields;  
    fP.forms.expanded[entity] = true;
    return fieldBldr(entity, id).then(fields => {
        $(rowCntnr).append(fields);                              
        return [rowCntnr, buildFormBttns(entity, 'top', 'edit')];
    });
}   
function getIntFormFields(entity, id) {
    return buildIntFormFields('edit');
}
function getSrcTypeFields(entity, id) {
    const srcRcrd = getRcrd('source', id);
    const type = getRcrd(entity, srcRcrd[entity]);
    const typeId = type[entity+'Type'].id;
    return getSrcTypeRows(entity, typeId, 'top', type[entity+'Type'].displayName);
}
/** Returns the passed entity's form fields. */
function buildEditFormFields(entity, id) {
    const formConfg = getFormConfg(entity);
    return getFormFieldRows(entity, formConfg, {}, 'top', false);
}
function finishEditFormBuild(entity) {
    const hndlrs = {
        'citation': finishCitEditFormBuild, 'interaction': finishIntFormBuild, 
        'location': finishLocEditFormBuild, 'taxon': finishTaxonEditFormBuild,
    };
    if (entity in hndlrs) { hndlrs[entity]()  
    } else {
        initComboboxes(entity, 'top'); 
        $('#top-cancel').unbind('click').click(exitFormPopup);
        $('.all-fields-cntnr').hide();
    }
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
    const prnt = getParentEntity(ent);
    const entity = prnt || ent;
    const rcrd = getRcrd(entity, id);                                   console.log('[%s] rcrd = %O', entity, rcrd);
    $('#top-hdr')[0].innerText += ': ' + rcrd.displayName; 
    $('#det-cnt-cntnr span')[0].innerText = 'This ' + ent + ' is referenced by:';
}
/** Note: Source types will get their record data at fillSrcData. */
function fillEntityData(ent, id) {  
    const hndlrs = { 'author': fillSrcData, 'citation': fillSrcData,
        'location': fillLocData, 'publication': fillSrcData, 
        'publisher': fillSrcData, 'taxon': fillTaxonData, 
        'interaction': fillIntData };
    const rcrd = getRcrd(ent, id);                                      //console.log("fillEntityData [%s] [%s] = %O", ent, id, rcrd);
    hndlrs[ent](ent, id, rcrd);
}
function fillIntData(entity, id, rcrd) {  
    const fields = {
        'InteractionType': 'select', 'Location': 'select', 'Note': 'textArea', 
        'Object': 'taxon', 'Source': 'source', 'Subject': 'taxon', 
        'InteractionTags': 'tags' };
    fillFields(rcrd, fields, true);
}
function fillLocData(entity, id, rcrd) {
    const fields = getCoreFieldDefs(entity);  
    handleLatLongFields();
    fillFields(rcrd, fields);
    addDataToCntDetailPanel({ 'int': rcrd.interactions.length });
    fP.editing.detail = rcrd.geoJsonId || null;
    if (rcrd.geoJsonId) { storeLocGeoJson(rcrd.geoJsonId); }
    /* Sets values without triggering each field's change method. */
    function handleLatLongFields() {
        delete fields.Latitude;
        delete fields.Longitude;
        delete fields.Country;
        $('#Latitude_row input').val(rcrd.latitude);
        $('#Longitude_row input').val(rcrd.longitude);
        setSelVal('#Country-sel', rcrd.country.id, 'silent');
    }
    function storeLocGeoJson(id) {                                              
        fP.forms.top.geoJson = _u.getData('geoJson').then(data => data[id]);
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
        var child = fP.records.taxon[id];              
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
    var src = getRcrd("source", id);                                            
    var detail = getRcrd(entity, src[entity]);                                  //console.log("fillSrcData [%s] src = %O, [%s] = %O", id, src, entity, detail);
    var fields = getSourceFields(entity);                                       //console.log('fields = %O', fields)
    setSrcType()
    .then(() => {
        setSrcData();
        setDetailData();
    });
    function setSrcType() {
        if (['citation', 'publication'].indexOf(entity) == -1) { return Promise.resolve(); }
        const typeProp = entity == 'citation' ? 'citationType' : 'publicationType';
        const typeId = detail[typeProp].id;
        const typeName = detail[typeProp].displayName;
        const typeElem = $('#'+_u.ucfirst(entity)+'Type-sel')[0];
        return loadSrcTypeFields(entity, typeId, typeElem, typeName);
    }
    function setSrcData() {
        fillFields(src, fields.core);
        fillSrcDataInDetailPanel(entity, src);            
    }
    function setDetailData() {
        fillFields(detail, fields.detail);
        setAdditionalFields(entity, src, detail);
        fP.editing.detail = detail.id;
    }
} /* End fillSrcData */
function getSourceFields(entity) {
    return { core: getCoreFieldDefs(entity), detail: getFormConfg(entity).add };
}
/** Adds a count of all refences to the entity to the form's detail-panel. */
function fillSrcDataInDetailPanel(entity, srcRcrd) {                            //console.log('fillSrcDataInDetailPanel. [%s]. srcRcrd = %O', entity, srcRcrd);
    var refObj = { 'int': getSrcIntCnt(entity, srcRcrd) };
    addAddtionalRefs();                                                         //console.log('refObj = %O', refObj);
    addDataToCntDetailPanel(refObj);

    function addAddtionalRefs() {
        if (entity === 'citation') { return; }
        const ref = entity === 'publisher' ? 'pub' : 'cit';
        refObj[ref] = srcRcrd.children.length || srcRcrd.contributions.length;
    }
} /* End fillSrcDataInDetailPanel */
function getSrcIntCnt(entity, rcrd) {                                           //console.log('getSrcIntCnt. rcrd = %O', rcrd);
    return entity === 'citation' ? 
        rcrd.interactions.length : getTtlIntCnt('source', rcrd, 'interactions'); 
}
/** ----------- Shared ---------------------------- */
function getTtlIntCnt(entity, rcrd, intProp) {                                  //console.log('getTtlIntCnt. [%s] rcrd = %O', intProp, rcrd);
    var ints = rcrd[intProp].length;
    if (rcrd.children.length) { ints += getChildIntCnt(entity, rcrd.children, intProp);}
    if (rcrd.contributions) { ints += getChildIntCnt(entity, rcrd.contributions, intProp);}        
    return ints;
}
function getChildIntCnt(entity, children, intProp) {
    var ints = 0;
    children.forEach(function(child){ 
        child = fP.records[entity][child];
        ints += getTtlIntCnt(entity, child, intProp); 
    });
    return ints;
}
function fillFields(rcrd, fields, shwAll) {                                     //console.log('rcrd = %O, fields = %O', rcrd, fields);
    const fieldHndlrs = {
        'text': setText, 'textArea': setTextArea, 'select': setSelect, 
        'fullTextArea': setTextArea, 'multiSelect': addToFormVals,
        'tags': setTagField, 'cntry': setCntry, 'source': addSource, 
        'taxon': addTaxon
    };
    for (let field in fields) {                                                 //console.log('------- Setting field [%s]', field);
        if (!fieldIsDisplayed(field, 'top') && !shwAll) { continue; }           //console.log("field [%s] type = [%s] fields = [%O] fieldHndlr = %O", field, fields[field], fields, fieldHndlrs[fields[field]]);
        addDataToField(field, fieldHndlrs[fields[field]], rcrd);
    }  
}
function addDataToField(field, fieldHndlr, rcrd) {                              //console.log("addDataToField [%s] [%0] rcrd = %O", field, fieldHndlr, rcrd);
    var elemId = field.split(' ').join('');
    var prop = _u.lcfirst(elemId);
    fieldHndlr(elemId, prop, rcrd);
}
/** Adds multiSelect values to the form's val object. */
function addToFormVals(fieldId, prop, rcrd) {                                   //console.log("addToFormVals [%s] [%s] rcrd = %O", fieldId, prop, rcrd);
    const vals = fP.forms.top.fieldConfg.vals;
    vals[fieldId] = {type: 'multiSelect'};
    vals[fieldId].val = rcrd[prop]; 
    if (!$('#'+_u.ucfirst(prop)+'-sel-cntnr').length) { return; }
    selectExistingAuthors(_u.ucfirst(prop), rcrd[prop], 'top');
}
function setText(fieldId, prop, rcrd) {                                         //console.log("setTextField [%s] [%s] rcrd = %O", fieldId, prop, rcrd);
    $('#'+fieldId+'_row input').val(rcrd[prop]).change();   
}
function setTextArea(fieldId, prop, rcrd) {
    $('#'+fieldId+'_row textarea').val(rcrd[prop]).change();   
}
function setSelect(fieldId, prop, rcrd) {                                       //console.log("setSelect [%s] [%s] rcrd = %O", fieldId, prop, rcrd);
    var id = rcrd[prop] ? rcrd[prop].id ? rcrd[prop].id : rcrd[prop] : null;
    setSelVal('#'+fieldId+'-sel', id);
}
function setTagField(fieldId, prop, rcrd) {                                     //console.log("setTagField. rcrd = %O", rcrd)
    var tags = rcrd[prop] || rcrd.tags;
    tags.forEach(tag => setSelVal('#'+fieldId+'-sel', tag.id));
}    
function setCntry(fieldId, prop, rcrd) {
    setSelVal('#Country-sel', rcrd.country.id);
}
function setAdditionalFields(entity, srcRcrd, detail) {
    setTitleField(entity, srcRcrd);
    setPublisherField(entity, srcRcrd);
    setCitationEdgeCaseFields(entity, detail);
}
function setTitleField(entity, srcRcrd) {                                       //console.log("setTitleField [%s] rcrd = %O", entity, srcRcrd)
    if (["publication", "citation"].indexOf(entity) === -1) { return; }
    const name = entity === 'publication' ? 
        srcRcrd.displayName : getCitTitle(srcRcrd.citation);
    $('#Title_row input[type="text"]').val(name).change();

    function getCitTitle(citId) {
        return getRcrd('citation', citId).displayName;
    }
} /* End setTitleField */
function setPublisherField(entity, srcRcrd) { 
    if (entity !== 'publication' || !fieldIsDisplayed('Publisher', 'top')) { return; }    
    setSelVal('#Publisher-sel', srcRcrd.parent);
}
function setCitationEdgeCaseFields(entity, citRcrd) {
    if (entity !== 'citation') { return; }
    $('#CitationText_row textarea').val(citRcrd.fullText);
    $('#Issue_row input[type="text"]').val(citRcrd.publicationIssue);
    $('#Pages_row input[type="text"]').val(citRcrd.publicationPages);
    $('#Volume_row input[type="text"]').val(citRcrd.publicationVolume);
}
function addTaxon(fieldId, prop, rcrd) {                                        //console.log("addTaxon [%s] [%O] rcrd = %O", fieldId, prop, rcrd);
    var selApi = $('#'+ fieldId + '-sel')[0].selectize;
    var taxon = fP.records.taxon[rcrd[prop]];                          
    selApi.addOption({ value: taxon.id, text: getTaxonDisplayName(taxon) });
    selApi.addItem(taxon.id);
}
function addSource(fieldId, prop, rcrd) {
    var citSrc = fP.records.source[rcrd.source];  
    setSelVal('#Publication-sel', citSrc.parent);
    setSelVal('#CitationTitle-sel', rcrd.source);
}
/* ---- On Form Fill Complete --- */
function onEditFormLoadComplete(id, entity) {                                       //console.log('onEditFormLoadComplete. entity = ', entity);
    const map = { 
        'citation': setSrcEditRowStyle, 'location': finishLocEditForm,
        'publication': setSrcEditRowStyle };
    if (!map[entity]) { return; }
    map[entity](id);
}
function setSrcEditRowStyle() {
    setCoreRowStyles('#form-main', '.top-row');
}
function finishLocEditForm(id) {
    addMapToLocForm('#location_Rows', 'edit');
    finishLocFormAfterMapLoad(id);
}
function finishLocFormAfterMapLoad(id) {
    if ($('#loc-map').data('loaded')) {
        setCoreRowStyles('#form-main', '.top-row');
        db_map.addVolatileMapPin(id, 'edit', getSelVal('#Country-sel'));
    } else {
        window.setTimeout(() => finishLocFormAfterMapLoad(id), 500);
    }
}
/*--------------------------- Create Form --------------------------------------------------------*/
/**
 * Fills the global fP obj with the basic form params @initFormParams. 
 * Init the create interaction form and append into the popup window @buildAndShowForm. 
 */
export function initNewDataForm() {                                             //console.log('Creating [%s] [%s]', entity, id);  
    initFormParams('create', 'interaction')
    .then(buildIntFormFields.bind(null, 'create'))
    .then(buildAndShowCreateForm)
    .catch(err => _u.alertErr(err));
}
/**
 * Inits the interaction form with all fields displayed and the first field, 
 * publication, in focus. From within many of the fields the user can create 
 * new entities of the field-type by selecting the 'add...' option from the 
 * field's combobox and completing the appended sub-form.
 */
function buildAndShowCreateForm(fields) {
    const form = buildCreateFormElems(fields);   
    showFormPopup('New', 'Interaction', null);
    $('#form-main').append(form);   
    finishIntFormBuild();
    finishCreateFormBuild();
}
function buildCreateFormElems(fields) {
    const form = buildFormElem();
    const div = _u.buildElem('div', { id: 'interaction_Rows', class: 'flex-row flex-wrap' });
    $(div).append(fields); 
    $(form).append([div, buildFormBttns('interaction', 'top', 'create')]);
    return form;
}
function finishCreateFormBuild() {
    setCoreRowStyles('#form-main', '.top-row');
    focusCombobox('#Publication-sel', false);
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
    addLocationSelectionMethodsNote();
    addReqElemsToConfg();    
    $('.all-fields-cntnr').hide();
    focusCombobox('#Publication-sel', true);
}
/** Displays the [Role] Taxon select form when the field gains focus. */ 
function addTaxonFocusListener(role) {
    const func = { 'Subject': initSubjectSelect, 'Object': initObjectSelect };
    $('#form-main').on('focus', '#'+role+'-sel + div div.selectize-input', func[role]);
}
function addReqElemsToConfg() {
    const reqFields = ["Publication", "CitationTitle", "Subject", "Object", 
        "InteractionType"];
    fP.forms.top.reqElems = reqFields.map(function(field) {
        return $('#'+field+'-sel')[0];
    });
}
/*-------------- Form Builders -------------------------------------------------------------------*/
/** Builds and returns all interaction-form elements. */
function buildIntFormFields(action) { 
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
function buildPubFieldRow() {
    return getSrcOpts('pubSrcs').then(buildPubRow);
}
function buildPubRow(opts) {
    const attr = { id: 'Publication-sel', class: 'lrg-field' };
    const selElem = _u.buildSelectElem(opts, attr);
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
    if (!fP.records.source[val].children.length) { return initCitForm(); }
    if (!fP.editing) { $('#Publication_pin').focus(); }
}
function onPubClear() {
    clearCombobox('#CitationTitle-sel');
    enableCombobox('#CitationTitle-sel', false);
    clearDetailPanel('pub', true);
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
    initSubForm('publication', fLvl, 'flex-row med-sub-form', {'Title': val}, 
        '#Publication-sel')
    .then(appendPubFormAndFinishBuild);
}
function appendPubFormAndFinishBuild(form) {
    $('#CitationTitle_row').after(form);
    initComboboxes('publication', 'sub');
    $('#Title_row input').focus();
    setCoreRowStyles('#publication_Rows', '.sub-row');
}
/**
 * Loads the deafult fields for the selected Publication Type. Clears any 
 * previous type-fields and initializes the selectized dropdowns.
 */
function loadPubTypeFields(typeId) { 
    const elem = this.$input[0];  
    return loadSrcTypeFields('publication', typeId, elem)
    .then(finishPubTypeFields);

    function finishPubTypeFields() {
        ifBookAddAuthEdNote();
        setCoreRowStyles('#publication_Rows', '.sub-row');
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
function buildCitFieldRow() {
    const selElem = _u.buildSelectElem([], {id: 'CitationTitle-sel', class: 'lrg-field'});
    return buildFormRow('CitationTitle', selElem, 'top', true);
}
/** Fills the citation combobox with all citations for the selected publication. */
function fillCitationField(pubId) {                                         //console.log("initCitSelect for publication = ", pubId);
    enableCombobox('#CitationTitle-sel');
    updateComboboxOptions('#CitationTitle-sel', getPubCitationOpts(pubId));
}
/** Returns an array of option objects with citations for this publication.  */
function getPubCitationOpts(pubId) {
    const pubRcrd = fP.records.source[pubId];  
    if (!pubRcrd) { return [{ value: 'create', text: 'Add a new Citation...'}]; }
    const opts = getRcrdOpts(pubRcrd.children, fP.records.source);
    opts.unshift({ value: 'create', text: 'Add a new Citation...'});
    return opts;
}
/** 
 * When a Citation is selected, both 'top' location fields are initialized
 * and the publication combobox is reenabled. 
 */    
function onCitSelection(val) {  
    if (val === 'create') { return openCreateForm('CitationTitle'); }
    if (val === '' || isNaN(parseInt(val))) { return clearDetailPanel('cit', true); }                     //console.log("cit selection = ", parseInt(val));                          
    updateSrcDetailPanel('cit');
    if (!fP.editing) { $('#CitationTitle_pin').focus(); }
}    
/** Shows the Citation sub-form and disables the publication combobox. */
function initCitForm(value) {                                                   //console.log("Adding new cit! val = %s", val);
    const fLvl = getSubFormLvl('sub');
    const val = value === 'create' ? '' : value;
    if ($('#'+fLvl+'-form').length !== 0) { return openSubFormErr('CitationTitle', '#CitationTitle-sel', fLvl); }
    initSubForm('citation', fLvl, 'flex-row med-sub-form', {'Title': val}, 
        '#CitationTitle-sel')
    .then(appendCitFormAndFinishBuild.bind(null, fLvl));
    _u.getData(['author', 'publication']).then(data => addSourceDataToMemory(data));
}
function appendCitFormAndFinishBuild(fLvl, form) {
    $('#CitationTitle_row').after(form);
    initComboboxes('citation', 'sub');
    selectDefaultCitType(fLvl).then(finishCitFormUiLoad);
}
function finishCitFormUiLoad() {
    enableCombobox('#Publication-sel', false);
    $('#Abstract_row textarea').focus();
    setCoreRowStyles('#citation_Rows', '.sub-row');
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
    setSelVal('#CitationType-sel', citTypes[dfaults[pubType]]);
}
function getBookDefault(pubType, fLvl) {
    if (pubType !== 'Book') { return 'Book'; }
    const pubAuths = fP.forms[fLvl].pub.src.authors;
    return pubAuths ? 'Book' : 'Chapter';
}
function finishCitEditFormBuild() {
    initComboboxes('citaion', 'top'); 
    $('#top-cancel').unbind('click').click(exitFormPopup);
    $('.all-fields-cntnr').hide();
    handleSpecialCaseTypeUpdates($('#CitationType-sel')[0], 'top');
}
/**
 * Adds relevant data from the parent publication into formVals before 
 * loading the default fields for the selected Citation Type. If this is an 
 * edit form, skip loading pub data... 
 */
function loadCitTypeFields(typeId) {
    const fLvl = getSubFormLvl('sub');
    const elem = this.$input[0];
    if (!fP.editing) { handlePubData(typeId, elem, fLvl); }
    return loadSrcTypeFields('citation', typeId, elem)
    .then(finishCitTypeFields);

    function finishCitTypeFields() {
        handleSpecialCaseTypeUpdates(elem, fLvl);
        handleCitText(fLvl);
        setCoreRowStyles('#citation_Rows', '.'+fLvl+'-row');
    }
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
        enableComboboxes($('#Authors-sel-cntnr select'), false);
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
 */
function handleCitText(formLvl) {                                               //console.log('handleCitText')
    const fLvl = formLvl || getSubFormLvl('sub');
    const $elem = $('#CitationText_row textarea');
    if (!$elem.val()) { initializeCitField($elem); } 
    getCitationFieldText($elem, fLvl)
    .then(updateCitField.bind(null, $elem));
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
    return Promise.resolve(ifNoChildFormOpen(fLvl) && ifAllRequiredFieldsFilled(fLvl) ? 
        buildCitationText(fLvl) : $elem.val() === dfault ? false : dfault);
}
function ifNoChildFormOpen(fLvl) {  
    return $('#'+getNextFormLevel('child', fLvl)+'-form').length == 0; 
}
/**
 * Generates and displays the full citation text after all required fields 
 * are filled.
 */
function buildCitationText(fLvl) {
    const type = $('#CitationType-sel option:selected').text();                 //console.log("type = ", type);
    return getFormValueData('citation', null, null).then(generateCitText);    
    function generateCitText(formVals) {
        const builder = { 'Article': articleCit, 'Book': bookCit, 
            'Chapter': chapterCit, 'Ph.D. Dissertation': dissertThesisCit, 
            'Other': otherCit, 'Report': otherCit, 'Museum record': otherCit, 
            "Master's Thesis": dissertThesisCit };
        return builder[type](type);                                
        /**
         * Articles, Museum records, etc.
         * Citation example with all data available: 
         *     1st Author [Last name, Initials.], 2nd+ Author(s) & Last Author 
         *     [Initials. Last]. Year. Title of article. Title of Journal 
         *     Volume (Issue): Pages.
         */
        function  articleCit(type) {                                      
            const athrs = getFormAuthors();
            const year = _u.stripString(formVals.year);
            const title = _u.stripString(formVals.title);
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
            const title = _u.stripString(formVals.title);
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
            const year = formVals.year ? _u.stripString(formVals.year) : getPubYear();
            const title = _u.stripString(formVals.title);
            const vip = getVolumeIssueAndPages();
            const publ = getPublisherData();
            return [athrs, year, title, vip, publ].filter(f=>f).join('. ') +'.';
        }
            /** ---------- citation full text helpers ----------------------- */
        function getPubYear() {
            return _u.stripString(fP.forms[fLvl].pub.src.year);
        }
        function getPublicationName() {
            return _u.stripString(fP.forms[fLvl].pub.src.displayName);
        }
        function getBookPages(argument) {
            if (!formVals.pages) { return false; }
            return 'pp. ' + _u.stripString(formVals.pages);
        }
        function getFormAuthors(eds) { 
            const auths = getSelectedVals($('#Authors-sel-cntnr')[0]);          console.log('auths = %O', auths);
            if (!Object.keys(auths).length) { return false; }
            return getFormattedAuthorNames(auths, eds);
        }
        function getPubAuthors() {
            const auths = fP.forms[fLvl].pub.src.authors;
            if (!auths) { return false; }
            return getFormattedAuthorNames(auths);
        }
        function getPubEditors() {
            const eds = fP.forms[fLvl].pub.src.editors;  
            if (!eds) { return false }
            const names = getFormattedAuthorNames(eds, true);
            const edStr = Object.keys(eds).length > 1 ? ', eds.' : ', ed.';
            return '('+ names + edStr + ')';
        }
        /** Formats publisher data and returns the Name, City, Country. */
        function getPublisherData() {
            return buildPublString(fP.forms[fLvl].pub.src);
        } 
        /**
         * Returns: Chapter title. In: Publication title [if there are editors,
         * they are added in parentheses here.]. 
         */
        function getTitlesAndEditors() { 
            const chap = formVals.chapterTitle ? 
                _u.stripString(formVals.chapterTitle) : false;
            const pub = _u.stripString(getPublicationName());
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
    } 
}/* End buildCitationText */
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
        const publSrc = fP.records.source[pub.parent];
        return getRcrd('publisher', publSrc.publisher);
    }
} /* End buildPublString */
/** ----- Publication and Citation Shared form helpers ------------ */
/** Adds source data to the interaction form's detail panel. */
function updateSrcDetailPanel(entity) {
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
function loadSrcTypeFields(subEntity, typeId, elem, typeName) {                 //console.log('loadSrcTypeFields. [%s] elem = %O', type, elem);
    const fLvl = getSubFormLvl('sub');
    resetOnFormTypeChange(subEntity, typeId, fLvl);
    return getSrcTypeRows(subEntity, typeId, fLvl, typeName)
    .then(finishSrcTypeFormBuild);
        
    function finishSrcTypeFormBuild(rows) {
        $('#'+subEntity+'_Rows').append(rows);
        initComboboxes(subEntity, fLvl);
        fillComplexFormFields(fLvl);
        checkReqFieldsAndToggleSubmitBttn(elem, fLvl);
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
function getSrcTypeRows(entity, typeId, fLvl, type) {                           //console.log('getSrcTypeRows. type = ', type);
    const fVals = getCurrentFormFieldVals(fLvl);
    setSourceTypeConfg(entity, typeId, fLvl, type); 
    $('#'+entity+'_Rows').empty();     
    return getFormFieldRows(entity, getFormConfg(entity), fVals, fLvl);
}
/** Sets the type confg for the selected source type in form params. */
function setSourceTypeConfg(entity, id, fLvl, tName) {
    const typeElemId = '#'+_u.ucfirst(entity)+'Type-sel'; 
    const type = tName || getSelTxt(typeElemId);
    fP.forms[fLvl].typeConfg = getFormConfg(entity).types[type];                //console.log('srcTypeConfg for [%s] = [%O]', type, fP.forms[fLvl].typeConfg);             
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
        focusCombobox('#'+_u.ucfirst(type)+'Type-sel', true);
    }
}
/*-------------- Country/Region ------------------------------------------*/
/** Returns a form row with a combobox populated with all countries and regions. */
function buildCntryRegFieldRow() {                                              //console.log("buildingCountryFieldRow. ");
    return getCntryRegOpts().then(buildCntryRegRow);
}
function buildCntryRegRow(opts) {
    const attr = {id: 'Country-Region-sel', class: 'lrg-field'};
    const selElem = _u.buildSelectElem(opts, attr);
    return buildFormRow('Country-Region', selElem, 'top', false);
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
function onCntryRegSelection(val) {                                             //console.log("country/region selected 'val' = ", val);
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
function buildLocFieldRow() {                                                   //console.log("buildingLocationFieldRow. ");
    const locOpts = getLocationOpts();                                          //console.log("locOpts = %O", locOpts);
    const selElem = _u.buildSelectElem(
        locOpts, {id: "Location-sel", class: "lrg-field"});
    return buildFormRow("Location", selElem, "top", false);
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
    updateComboboxOptions('#Location-sel', opts);
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
function onLocSelection(val) {                                                  //console.log("location selected 'val' = '"+ val+"'");
    if (val === 'create') { return openCreateForm('Location'); }
    if (val === '' || isNaN(parseInt(val))) { return clearDetailPanel('loc', true); }   
    if ($('#loc-map').length) { removeLocMap(); }
    var locRcrd = fP.records.location[val];                                     //console.log("location = %O", locRcrd);
    var prntVal = locRcrd.parent ? locRcrd.parent : locRcrd.id;
    setSelVal('#Country-Region-sel', prntVal, 'silent');
    fillLocDataInDetailPanel(val);
    if (!fP.editing) { $('#Location_pin').focus(); }
    checkIntFieldsAndEnableSubmit();
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
export function initLocForm(val) {                                              //console.log("Adding new loc! val = %s", val);
    const fLvl = getSubFormLvl("sub");
    if ($('#'+fLvl+'-form').length !== 0) { return openSubFormErr('Location', null, fLvl); }
    if ($('#loc-map').length !== 0) { $('#loc-map').remove(); }
    buildLocForm(val, fLvl)
    .then(onLocFormLoadComplete);
}
function buildLocForm(val, fLvl) {    
    const vals = {
        'DisplayName': val === 'create' ? '' : val, //clears form trigger value
        'Country': $('#Country-Region-sel').val() }; 
    return initSubForm('location', fLvl, 'flex-row med-sub-form', vals, '#Location-sel')
        .then(appendLocFormAndFinishBuild);

    function appendLocFormAndFinishBuild(form) {
        $('#Location_row').after(form);
        initComboboxes('location', 'sub');
        enableCombobox('#Country-Region-sel', false);
        $('#Latitude_row input').focus();
        $('#sub-submit').val('Create without GPS data');
        setCoreRowStyles('#location_Rows', '.sub-row');
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
function finishLocEditFormBuild() {  
    initComboboxes('Location', 'top'); 
    updateCountryChangeMethod();
    addListenerToGpsFields(
        db_map.addVolatileMapPin.bind(null, fP.editing.core, 'edit', false));
    $('#top-cancel').unbind('click').click(exitFormPopup);
    $('.all-fields-cntnr').hide();
}
function updateCountryChangeMethod() {
    $('#Country-sel')[0].selectize.off('change');
    $('#Country-sel')[0].selectize.on('change', 
        focusParentAndShowChildLocs.bind(null, 'edit'));
}
/** When the Location sub-form is exited, the Country/Region combo is reenabled. */
function enableCountryRegionField() {  
    enableCombobox('#Country-Region-sel');
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
/** Prevents the location form's submit button from enabling when GPS data entered.*/
function locHasGpsData(fLvl) {
    if (fP.forms[fLvl].entity !== 'location') { return false; }
    return ['Latitude', 'Longitude'].some(field => {
        return $(`#${field}_row input`).val();
    });
}
function addListenerToGpsFields(func) {
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
    setSelVal('#Location-sel', id);
    enableCountryRegionField();
    enableCombobox('#Location-sel');
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
    if (ifAllRequiredFieldsFilled(fLvl)) {
        getFormValuesAndSubmit('#'+fLvl+'-form',  fLvl, 'location');
    } else { showFillAllLocFieldsError(fLvl); }
}
function showFillAllLocFieldsError(fLvl) {
    reportFormFieldErr('Display Name', 'needsLocData', fLvl);
}
export function locCoordErr(field) {
    const fLvl = fP.forms['location'];
    reportFormFieldErr(field, 'invalidCoords', fLvl);
}
/*--------------- Map methods ---------------------------*/
/** Adds a message above the location fields in interaction forms. */
function addLocationSelectionMethodsNote() {
    const cntnr = _u.buildElem('div', {id: 'loc-note', class: 'skipFormData'});
    const mapText = _u.buildElem('span', {class:'map-link', 
        text: 'click here to use the map interface.'});
    $(mapText).click(showInteractionFormMap);
    const note = [`<span>Select or create a location using the fields below or </span>`,
        mapText];
    $(cntnr).append(note);
    $('#Country-Region_row').before(cntnr);
}
/** Open popup with the map interface for location selection. */
function showInteractionFormMap() {                                             //console.log('showInteractionFormMap')
    if ($('#loc-map').length) { return; }
    addMapToLocForm('#Location_row', 'int');
    if (!getSelVal('#Country-Region-sel')) {
        focusCombobox('#Country-Region-sel', true);
    }
}
function addMapToLocForm(elemId, type) {
    const map = _u.buildElem('div', { id: 'loc-map', class: 'skipFormData' }); 
    const prntId = $('#Country-Region-sel').val() || $('#Country-sel').val();
    $(elemId).after(map);
    db_map.initFormMap(prntId, fP.records.location, type);
}
function focusParentAndShowChildLocs(type, val) {                               //console.log('focusParentAndShowChildLocs - [%s]', val);
    if (!val) { return; }
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
function initTaxonParams(role, realmName, id) {                                 //console.log('###### INIT ######### role [%s], realm [%s], id [%s]', role, realmName, id);
    const realmLvls = {
        'Bat': ['Order', 'Family', 'Genus', 'Species'],
        'Arthropod': ['Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'],
        'Plant': ['Kingdom', 'Family', 'Genus', 'Species']
    };
    return getRealmTaxon(realmName).then(buildBaseTaxonParams);                 //console.log('taxon params = %O', fP.forms.taxonPs)

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
function initSubjField() {
    var subjElem = _u.buildSelectElem([], {id: "Subject-sel", class: "lrg-field"});
    return buildFormRow("Subject", subjElem, "top", true);
}
/** Builds the Object combobox that will trigger the select form @initObjectSelect. */
function initObjField() {
    var objElem =  _u.buildSelectElem([], {id: "Object-sel", class: "lrg-field"});
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
    return initTaxonParams('Subject', 'Bat')
    .then(initSubjForm)
    .then(appendSubjFormAndFinishBuild);

    function initSubjForm() {
        return initSubForm('subject', fLvl, 'sml-sub-form', {}, '#Subject-sel');
    }
    function appendSubjFormAndFinishBuild(form) {
        $('#Subject_row').append(form);
        initComboboxes('subject', fLvl);           
        finishTaxonSelectUi('Subject');  
        enableCombobox('#Object-sel', false);
    }
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
    return initTaxonParams('Object', realmName)
    .then(initObjForm)
    .then(appendObjFormAndFinishBuild);

    function initObjForm() {
        return initSubForm('object', fLvl, 'sml-sub-form', {}, '#Object-sel');
    }
    function appendObjFormAndFinishBuild(form) {
        $('#Object_row').append(form);
        initComboboxes('object', fLvl);             
        setSelVal('#Realm-sel', fP.forms.taxonPs.realmTaxon.realm.id, 'silent');
        enableCombobox('#Subject-sel', false);
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
/** When the taxon-select forms are exited, the top-combos are reenabled. */
function enableTaxonCombos() { 
    enableCombobox('#Subject-sel');
    enableCombobox('#Object-sel');
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
    } else { focusFirstCombobox(selCntnr); }
    _u.replaceSelOpts('#'+role+'-sel', []);
}
function ifResettingTxn(role) {  
    return $('#'+role+'-sel').val() || fP.forms.taxonPs.prevSel.reset;
}
/** Shows a New Taxon form with the only field, displayName, filled and ready to submit. */
function initTaxonForm(value) { 
    const val = value === 'create' ? '' : value;
    const selLvl = this.$control_input[0].id.split('-sel-selectize')[0]; 
    const fLvl = fP.forms.taxonPs.prntSubFormLvl || getSubFormLvl('sub2'); //refact
    if (selLvl === 'Species' && !$('#Genus-sel').val()) {
        return formInitErr(selLvl, 'noGenus', fLvl);
    }
    enableTxnCombos(false);
    showNewTaxonForm(val, selLvl, fLvl);
} 
function showNewTaxonForm(val, selLvl, fLvl) {                                  //console.log("showNewTaxonForm. val, selVal, fLvl = %O", arguments)
    fP.forms.taxonPs.formTaxonLvl = selLvl;
    buildTaxonForm().then(disableSubmitButtonIfEmpty.bind(null, '#sub2-submit', val));

    function buildTaxonForm() {
        return initSubForm('taxon', fLvl, 'sml-sub-form', {'DisplayName': val}, 
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
    if (nameNotCorrect()) { return reportFormFieldErr('Species', 'needsGenusName', fLvl); }
    getFormValuesAndSubmit('#'+fLvl+'-form',  fLvl, 'taxon');
    
    function nameNotCorrect() {
        const genus = getSelTxt('#Genus-sel');                                  //console.log('Genus = %s, Species = %s', genus, species);
        const speciesParts = species.split(' ');
        return genus !== speciesParts[0];
    }
}
function onTaxonCreateFormExit() {
    enableTxnCombos(true);
}
function enableTxnCombos(enable) {  
    $.each($('#sub-form select'), (i, sel) => enableCombobox('#'+sel.id, enable));
}
/**
 * Removes any previous realm comboboxes. Shows a combobox for each level present 
 * in the selected Taxon realm, plant (default) or arthropod, filled with the 
 * taxa at that level. 
 */
function onRealmSelection(val) {                                                console.log("onRealmSelection. val = ", val)
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
        buildFormRows(realm, {}, fLvl, null)
        .then(rows => appendRealmRowsAndFinishBuild(realm, rows, fLvl));
    }
    function appendRealmRowsAndFinishBuild(realm, rows, fLvl) {
        const realmElems = _u.buildElem('div', { id: 'realm-lvls' });
        $(realmElems).append(rows);
        $('#Realm_row').append(realmElems);
        fP.forms[fLvl].fieldConfg.vals.Realm = { val: null, type: 'select' };
        initComboboxes(realm, fLvl);  
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
    const bttn = getExitButton();
    bttn.id = 'exit-sub-form';
    $(bttn).unbind("click").click(exitTaxonSelectForm.bind(null, role));
    return bttn;
}
/** Exits sub form and restores any previous taxon selection. */
function exitTaxonSelectForm(role) {
    exitForm('#sub-form', 'sub', false);
    const prevTaxon = fP.forms.taxonPs.prevSel; 
    if (prevTaxon) {
        updateComboboxOptions('#'+role+'-sel', { 
            value: prevTaxon.val, text: prevTaxon.text });
        setSelVal('#'+role+'-sel', prevTaxon.val);
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
    const taxon = fP.records.taxon[id];                                         //console.log('resetPrevTaxonSelection. taxon = %O. prevTaxonId = %s', taxon, id);
    fP.forms.taxonPs.prevSel = {val: taxon.id, text: getTaxonDisplayName(taxon)};        
    if (ifRealmReset(taxon.realm)) { return setSelVal('#Realm-sel', taxon.realm.id); }
    setSelVal('#'+taxon.level.displayName+'-sel', id);
    window.setTimeout(() => { delete fP.forms.taxonPs.reset; }, 1000);
}
function ifRealmReset(realm) {  console.log('realm = %O. selRealmID = ', realm, $('#Realm-sel').val());
    return realm.displayName !== 'Bat' && $('#Realm-sel').val() != realm.id;
}
function preventComboboxFocus(realm) {
    const role = realm === 'Bat' ? 'subject' : 'object';  
    const fLvl = fP.forms[role];
    const selCntnr = realm === 'Bat' ? '#'+fLvl+'-form' : '#realm-lvls';        
    focusFirstCombobox(selCntnr, false);
}
/** Adds the selected taxon to the interaction-form's [role]-taxon combobox. */
function selectTaxon() {
    const role = fP.forms.taxonPs.realm === 'Bat' ? 'Subject' : 'Object';
    const opt = getSelectedTaxonOption();
    $('#sub-form').remove();
    updateComboboxOptions('#'+role+'-sel', opt);
    setSelVal('#'+role+'-sel', opt.value);
    enableCombobox('#'+role+'-sel', true);
}
/** Returns an option object for the most specific taxon selected. */
function getSelectedTaxonOption() {
    const taxon = getSelectedTaxon();                                           //console.log("selected Taxon = %O", taxon);
    return { value: taxon.id, text: getTaxonDisplayName(taxon) };
}
function getTaxonDisplayName(taxon) { 
    return taxon.level.displayName === 'Species' ? 
        taxon.displayName : taxon.level.displayName +' '+ taxon.displayName;
}
/** Finds the most specific level with a selection and returns that taxon record. */
function getSelectedTaxon(aboveLvl) {
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
 * NOTE: Change event fires twice upon selection. Worked around using @captureSecondFire
 */
function onLevelSelection(val) {                                                //console.log("onLevelSelection. val = [%s] isNaN? [%s]. recentChange? ", val, isNaN(parseInt(val)), fP.forms.taxonPs.recentChange);
    if (val === 'create') { return openLevelCreateForm(this.$input[0]); }
    if (val === '' || isNaN(parseInt(val))) { return syncTaxonCombos(this.$input[0]); } 
    fP.forms.taxonPs.recentChange = true;  // Flag used to filter out the second change event
    const fLvl = getSubFormLvl('sub');
    repopulateCombosWithRelatedTaxa(val);
    enableSubmitBttn('#'+fLvl+'-submit');             
}
function openLevelCreateForm(selElem) {
    openCreateForm(selElem.id.split('-sel')[0]);
}
/*
 * Note: Change event is fired when replacing select options, even though it should
 * not be. Capturing these false changes with the 'recent change' flag.
 */
function syncTaxonCombos(elem) {                                                
    if (fP.forms.taxonPs.recentChange) { return; }                              //console.log("syncTaxonCombos.");
    fP.forms.taxonPs.recentChange = true;  // Flag used to filter out the second change event
    resetChildLevelCombos(getSelectedTaxon(elem.id.split('-sel')[0]));
}
function resetChildLevelCombos(selTxn) {                                        //console.log("resetChildLevelCombos. selTxn = %O", selTxn)
    const lvlName = selTxn ? selTxn.level.displayName : getRealmTopLevel();
    if (lvlName == 'Species') { return; }
    getChildlevelOpts(lvlName)
    .then(opts => repopulateLevelCombos(opts, {}))
    .then(() => delete fP.forms.taxonPs.recentChange);
}
function getRealmTopLevel(realm) {
    return fP.forms.taxonPs.curRealmLvls[1];
}
function getChildlevelOpts(lvlName) { 
    var opts = {};
    var lvls = fP.forms.taxonPs.lvls;
    var lvlIdx = lvls.indexOf(lvlName)+2; //Skips selected level
    return buildChildLvlOpts().then(() => opts);

    function buildChildLvlOpts() {
        const proms = [];
        for (var i = lvlIdx; i <= 7; i++) { 
            proms.push(getTaxonOpts(lvls[i-1]).then(addToOpts.bind(null, i)));
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
    
    taxon.children.forEach(addRelatedChild); 
    return buildUpdatedTaxonOpts()
        .then(repopulateLevelCombos.bind(null, opts, selected))
        .then(() => delete fP.forms.taxonPs.recentChange);

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
        return getTaxonOpts(taxon.level.displayName).then(o => {                //console.log('getSiblingOpts. taxon = %O', taxon);
            opts[taxon.level.id] = o;
            selected[taxon.level.id] = taxon.id;
        });  
    }
    function getAncestorOpts(prntId) {                                          //console.log('getAncestorOpts. prntId = [%s]', prntId);
        var realmTaxa = [1, 2, 3, 4]; //animalia, chiroptera, plantae, arthropoda
        if (realmTaxa.indexOf(prntId) !== -1 ) { return Promise.resolve(); }
        const prntTaxon = getRcrd('taxon', prntId);
        selected[prntTaxon.level.id] = prntTaxon.id;                            
        return getTaxonOpts(prntTaxon.level.displayName)
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
            proms.push(getTaxonOpts(lvls[id-1])
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
    _u.replaceSelOpts('#'+lvlName+'-sel', opts);
    if (lvl in selected) { 
        if (selected[lvl] == 'none') { return _u.updatePlaceholderText('#'+lvlName+'-sel', null, 0); }
        setSelVal('#'+lvlName+'-sel', selected[lvl], 'silent'); 
    } 
}
/*-------- Edit Taxon Methods ----------*/
/**
 * Returns the elements of the edit-taxon form. 
 * <div>Parent Taxon: [Level][Display-name]</> <bttnInput>"Edit Parent"</>
 * <select>[Taxon-level]</>    <input type="text">[Taxon Display-name]</>
 *     <button>Update Taxon</> <button>Cancel</>
 */
function getTaxonEditFields(entity, id) {
    const taxon = fP.records.taxon[id];  
    const realm = taxon.realm.displayName;
    const role = realm === 'Bat' ? 'Subject' : 'Object';
    return initTaxonParams(role, realm, id)
        .then(buildTaxonEditFields.bind(null, taxon));
}
function finishTaxonEditFormBuild() {
    $('#top-cancel').off('click').click(exitFormPopup);
    $('#top-submit').off('click').click(submitTaxonEdit);
    initTaxonEditCombo('txn-lvl', checkForTaxonLvlErrs); 
    $('.all-fields-cntnr').hide();
}
function buildTaxonEditFields(taxon) {
    const prntElems = getPrntTaxonElems(taxon);
    const txnElems = getEditTaxonFields(taxon)
    return prntElems.concat(txnElems);
}
function getPrntTaxonElems(taxon) {                                             //console.log("getPrntTaxonElems for %O", taxon);
    const prnt = fP.records.taxon[taxon.parent]; 
    const elems = [ buildNameElem(prnt), buildEditPrntBttn(prnt) ];
    return [ buildTaxonEditFormRow('Parent', elems, 'top') ];
}
function buildNameElem(prnt) {
    var div = _u.buildElem('div', { id: 'txn-prnt' });
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
    var bttn = _u.buildElem('input', { type: 'button', value: 'Change Parent', 
        id: 'chng-prnt', class: 'ag-fresh tbl-bttn' });
    $(bttn).click(buildParentTaxonEditFields);
    return bttn;
}
function getEditTaxonFields(taxon) {                                            //console.log("getEditTaxonFields for [%s]", taxon.displayName);
    const input = _u.buildElem('input', { id: 'txn-name', type: 'text', value: taxon.displayName });
    const lvlSel = getlvlSel(taxon, 'top')
    return [buildTaxonEditFormRow('Taxon', [lvlSel, input], 'top')];
}
function getlvlSel(taxon, fLvl) {
    const opts = getTaxonLvlOpts(taxon); 
    const sel = _u.buildSelectElem(opts, { id: 'txn-lvl' });
    $(sel).data({ 'txn': taxon.id, 'lvl': taxon.level.id });
    return sel;
}
/** Returns an array of options for the levels in the taxon's realm. */
function getTaxonLvlOpts(taxon) {
    const opts = {};
    const realmLvls = fP.forms.taxonPs.curRealmLvls.map(lvl => lvl);  
    realmLvls.shift();  //Removes the realm-level
    buildLvlOptsObj();
    return _u.buildOptsObj(opts, Object.keys(opts));

    function buildLvlOptsObj() {
        const lvls = _u.snapshot(fP.forms.taxonPs.lvls);                            //console.log('realmLvls = %O, allLvls = %O', _u.snapshot(realmLvls), _u.snapshot(lvls));
        for (let i = lvls.length - 1; i >= 0; i--) {
            if (realmLvls.indexOf(lvls[i]) != -1) { opts[lvls[i]] = i+1; }
        }
    }
}
/**
 * Returns a level select with all levels in the taxon-parent's realm and a 
 * combobox with all taxa at the parent's level and the current parent selected.
 * Changing the level select repopulates the taxa with those at the new level.
 * Entering a taxon that does not already exists will open the 'create' form.
 */
function buildParentTaxonEditFields() {   
    buildParentTaxonEditElems($('#txn-prnt').data('txn'))        
    .then(appendPrntFormElems)
    .then(finishPrntFormBuild);
}
function appendPrntFormElems(elems) {
    const cntnr = _u.buildElem("div", { class: "sml-sub-form flex-row pTaxon", id: "sub-form" });
    $(cntnr).append(elems);
    $('#Parent_row').after(cntnr);
}
function buildParentTaxonEditElems(prntId) {
    var prnt = fP.records.taxon[prntId];
    var hdr = [buildEditParentHdr()];
    var bttns = [buildFormBttns("parent", "sub", "edit", true)];
    return getParentEditFields(prnt).then(fields => hdr.concat(fields, bttns));
}
function buildEditParentHdr() {
    var hdr = _u.buildElem("h3", { text: "Select New Taxon Parent", id:'sub-hdr' });
    return hdr;
}
function getParentEditFields(prnt) {  
    const realm = _u.lcfirst(prnt.realm.displayName);      
    const realmSelRow = getRealmLvlRow(prnt);
    return buildFormRows(realm, {}, 'sub', null, 'edit')
        .then(modifyAndReturnPrntRows);
    
    function modifyAndReturnPrntRows(rows) {
        $(rows).css({ 'padding-left': '.7em' });
        fP.forms.taxonPs.prntSubFormLvl = 'sub2';
        return [realmSelRow, rows];
    }
}
function getRealmLvlRow(taxon) { 
    const realmLvl = fP.forms.taxonPs.curRealmLvls[0];
    const lbl = _u.buildElem('label', { text: realmLvl });
    const taxonym = _u.buildElem('span', { text: taxon.realm.displayName });
    $(taxonym).css({ 'padding-top': '.55em' });
    return buildTaxonEditFormRow(realmLvl, [lbl, taxonym], 'sub');
}
/**
 * Initializes the edit-parent form's comboboxes. Selects the current parent.
 * Hides the species row. Adds styles and modifies event listeners. 
 */
function finishPrntFormBuild() {                                                //console.log("fP = %O", fP);    
    var realmLvl = fP.forms.taxonPs.curRealmLvls[0];
    initComboboxes(null, 'sub');
    selectParentTaxon($('#txn-prnt').data('txn'), realmLvl);
    $('#Species_row').hide();
    $('#'+realmLvl+'_row .field-row')[0].className += ' realm-row';
    $('#sub-submit').attr('disabled', false).css('opacity', '1');
    $('#sub-submit').off('click').click(closePrntEdit);
    $('#sub-cancel').off('click').click(cancelPrntEdit);
    setTaxonPrntNameElem(null, null, " ");
    $('#chng-prnt').attr({'disabled': true}).css({'opacity': '.6'});
    disableSubmitBttn('#top-submit');
    $('#sub-submit')[0].value = 'Select Taxon';
}
function selectParentTaxon(prntId, realmLvl) {                                  //console.log('selectParentTaxon. prntId [%s], realmLvl [%s]', prntId, realmLvl);                 
    var parentLvl = fP.records.taxon[prntId].level.displayName;  
    if (parentLvl == realmLvl) { return clearAllOtherLvls(); }
    clearAllOtherLvls();
    setSelVal('#'+parentLvl+'-sel', prntId);
}
function clearAllOtherLvls() {
    $.each($('#sub-form select[id$="-sel"]'), function(i, elem){ 
        $(elem)[0].selectize.clear('silent');
    });
}
function closePrntEdit() {                                                  
    var prnt =  getSelectedTaxon() || fP.forms.taxonPs.realmTaxon;              //console.log("closePrntEdit called. prnt = %O", prnt);
    exitPrntEdit(prnt);
}
function cancelPrntEdit() {                                                     //console.log("cancelPrntEdit called.");
    var prnt = fP.records.taxon[$('#txn-prnt').data('txn')];
    exitPrntEdit(prnt);
}
function exitPrntEdit(prnt) {
    if (checkForParentLvlErrs(prnt.level.id)) { return; }
    resetAfterEditParentClose(prnt);
}
function resetAfterEditParentClose(prnt) {
    clearLvlErrs('#Parent_errs', 'sub');
    fP.forms.taxonPs.prntSubFormLvl = null;
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
    if ($('.top-active-errs').length) { clrNeedsHigherLvl(null, null, null, txnLvl); }
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
    fP.records.taxon[taxonId].children.forEach(checkChildLvl);
    return high;

    function checkChildLvl(id) {
        var child = fP.records.taxon[id]
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
    if (!hasErrs && $('.top-active-errs').length) {
        clearLvlErrs('#Parent_errs', 'sub'); 
    }
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
    var options = { create: false, onChange: chng, placeholder: null }; 
    $('#'+selId).selectize(options);
    setSelVal('#'+selId, $('#'+selId).data('lvl'), 'silent');
}
/**
 * Each element is built, nested, and returned as a completed row. 
 * rowDiv>(errorDiv, fieldDiv>inputElems)
 */
function buildTaxonEditFormRow(field, inputElems, fLvl) {
    var rowDiv = _u.buildElem('div', { class: fLvl + '-row', id: field + '_row'});
    var errorDiv = _u.buildElem('div', { id: field+'_errs'}); 
    var fieldCntnr = _u.buildElem('div', { class: 'field-row flex-row'});
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
    return _u.getOptsFromStoredData('intTypeNames')
    .then(buildIntTypeRow);
}
function buildIntTypeRow(opts) {
    const attr = {id: 'InteractionType-sel', class: 'lrg-field'};
    const field = _u.buildSelectElem(opts, attr);
    return buildFormRow('InteractionType', field, 'top', true);
}
function focusIntTypePin() {
    if (!fP.editing) { $('#InteractionType_pin').focus(); }
}
function buildIntTagField() {
    return buildTagField('interaction', 'InteractionTags', 'top')
        .then(buildTagRow);
}
function buildTagRow(field) {
    field.className = 'lrg-field';
    $(field).change(checkIntFieldsAndEnableSubmit);
    return buildFormRow('InteractionTags', field, 'top', false);
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
    initSubForm('publisher', fLvl, 'sml-sub-form', {'DisplayName': val}, 
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
function selectExistingAuthors(field, authObj, fLvl) {                          //console.log('reselectAuthors. field = [%s] auths = %O', field, authObj);
    Object.keys(authObj).reduce((p, ord) => { //p(romise), ord(er)  
        const selNextAuth = selectAuthor.bind(null, ord, authObj[ord], field, fLvl);
        return p.then(selNextAuth);
    }, Promise.resolve());
}
/** Selects the passed author and builds a new, empty author combobox. */
function selectAuthor(cnt, authId, field, fLvl) {
    setSelVal('#'+field+'-sel'+ cnt, authId, 'silent');
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
    if (fP.forms[fLvl].entity === 'citation') { handleCitText(fLvl); }
    if (lastAuthComboEmpty(cnt-1, authType)) { return; }
    buildNewAuthorSelect(cnt, val, fLvl, authType);
}
/** Stops the form from adding multiple empty combos to the end of the field. */
function lastAuthComboEmpty(cnt, authType) {  
    return $('#'+authType+'-sel'+cnt).val() === '';
}
/** Builds a new, empty author combobox */
function buildNewAuthorSelect(cnt, val, prntLvl, authType) {                    //console.log("buildNewAuthorSelect. cnt [%s] val [%s] type [%s]", cnt, val, authType)
    return buildMultiSelectElems(null, authType, prntLvl, cnt)
    .then(appendNewAuthSelect);

    function appendNewAuthSelect(sel) {
        $('#'+authType+'-sel-cntnr').append(sel).data('cnt', cnt);
        initSelectCombobox(getAuthSelConfg(authType, cnt), prntLvl);
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
    if ($('#'+fLvl+'-form').length !== 0) { return openSubFormErr(authType, parentSelId, fLvl); }
    initSubForm( _u.lcfirst(singular), fLvl, 'sml-sub-form', {'LastName': val}, 
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
        return ifAllRequiredFieldsFilled(fLvl) ? 
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
/** ------ Citation Text Helper -------------- */
/** 
 * Returns a string with all author names formatted with the first author
 * [Last, Initials.], all following authors as [Initials. Last], and each 
 * are seperated by commas until the final author, which is seperated 
 * with '&'. If the names are of editors, they are returned [Initials. Last].
 * If >= 4 authors, returns first author [Last, Initials.] + ', et al';  
 */
function getFormattedAuthorNames(auths, eds) {                                  //console.log('getFormattedAuthorNames. auths = %O, eds = %s', JSON.parse(JSON.stringify(auths)), eds);
    if (Object.keys(auths).length > 3) { return getFirstEtAl(auths[1]); }
    let athrs = '';
    for (let ord in auths) {  
        let name = getFormattedName(ord, auths[ord]); 
        athrs += (ord == 1 ? name : (ord == Object.keys(auths).length ?
            ' & '+ name : ', '+ name));                 
    }
    return _u.stripString(athrs);

    function getFirstEtAl(authId) {
        const name = getFormattedName(1, authId);
        return name +', et al';
    }
    function getFormattedName(i, srcId) {                                       //console.log('getFormattedName cnt =%s, id = %s', i, srcId);        
        const src = fP.records.source[srcId];                      
        const athrId = src[_u.lcfirst(src.sourceType.displayName)];  
        const athr = fP.records.author[athrId];        
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
function getRcrd(entity, id) {                                                  //console.log('getRcrd [%s] id = [%s]. fP = %O', entity, id, fP);
    if (fP.records[entity]) { 
        const rcrd = fP.records[entity][id];
        if (!rcrd) { return console.log('!!!!!!!! No [%s] found in [%s] records = %O', id, entity, fP.records); console.trace() }
        return _u.snapshot(fP.records[entity][id]); }
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
function initComboboxes(entity, formLvl) {                                      //console.log("initComboboxes. [%s] formLvl = [%s] fields = %O", entity, formLvl, fP.forms[formLvl].selElems);
    const fLvl = formLvl || fP.forms[entity];  
    const selMap = getSelConfgObjs();  
    fP.forms[fLvl].selElems.forEach(selectizeElem);
    fP.forms[fLvl].selElems = [];

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
} /* End initComboboxes */
function enableCombobox(selId, enable) {
    if (enable === false) { return $(selId)[0].selectize.disable(); }
    $(selId)[0].selectize.enable();
}
function enableComboboxes($pElems, enable) {
    $pElems.each((i, elem) => { enableCombobox('#'+elem.id, enable)});
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
    const selApi = $(selId)[0].selectize;
    selApi.clear(true);
    selApi.updatePlaceholder();
    selApi.removeOption("");
}    
/**
 * Clears and enables the parent combobox for the exited form. Removes any 
 * placeholder options and, optionally, brings it into focus.
 */
function resetFormCombobox(fLvl, focus) {        
    if (!fP.forms[fLvl].pSelId) { return; }
    const combobox = $(fP.forms[fLvl].pSelId)[0].selectize;   
    combobox.clear();
    combobox.enable();
    combobox.removeOption(''); //Removes the "Creating [entity]..." placeholder.
    if (focus) { combobox.focus(); 
    } else if (focus === false) { combobox.blur(); }
}
/** Clears previous options and adds the new ones. Optionally focuses the combobox. */
function updateComboboxOptions(selId, opts, focus) {
    var selApi = $(selId)[0].selectize;
    selApi.clearOptions();
    selApi.addOption(opts);
    selApi.refreshOptions(false);
    if (focus === true) {  }
}
function getSelVal(id) {                                                        //console.log('getSelVal [%s]', id);
    return $(id)[0].selectize.getValue();  
}
function getSelTxt(id) {                                                        //console.log('getSelTxt. id = ', id);
    return $(id)[0].innerText;
}
function setSelVal(id, val, silent) {                                           //console.log('setSelVal [%s] = [%s]. silent ? ', id, val, silent);
    const $selApi = $(id)[0].selectize; 
    $selApi.addItem(val, silent); 
}
/*--------------- Shared Form Methods -------------------------------*/
/**
 * Toggles between displaying all fields for the entity and only showing the 
 * default (required and suggested) fields.
 */
function toggleShowAllFields(entity, fLvl) {                                    //console.log('--- Showing all Fields [%s] -------', this.checked);
    if (ifOpenSubForm(fLvl)) { return showOpenSubFormErr(fLvl); }
    fP.forms.expanded[entity] = this.checked;         
    const fVals = getCurrentFormFieldVals(fLvl);                                //console.log('vals before fill = %O', JSON.parse(JSON.stringify(fVals)));
    const fConfg = fP.forms[fLvl].confg;                                        //console.log('toggling optional fields. Show? [%s]', fP.forms.expanded[entity]);
    $('#'+entity+'_Rows').empty();
    fP.forms[fLvl].reqElems = [];
    getFormFieldRows(entity, fConfg, fVals, fLvl)
    .then(appendAndFinishRebuild);

    function appendAndFinishRebuild(rows) {
        $('#'+entity+'_Rows').append(rows);
        initComboboxes(entity, fLvl);
        fillComplexFormFields(fLvl);
        finishComplexForms();
    }
    function finishComplexForms() {
        if (['citation', 'publication', 'location'].indexOf(entity) === -1) { return; }
        if (entity === 'publication') { ifBookAddAuthEdNote(fVals.PublicationType)}
        if (entity === 'citation') { 
            handleSpecialCaseTypeUpdates($('#CitationType-sel')[0], fLvl);
            handleCitText(fLvl);
        }
        if (entity !== 'location') {
            updateFieldLabelsForType(entity, fLvl);
        }
        setCoreRowStyles('#'+entity+'_Rows', '.'+fLvl+'-row');
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
    openSubFormErr(entity, null, subLvl, true);   
    $('#sub-all-fields')[0].checked = !$('#sub-all-fields')[0].checked;
}
/*------------------- Form Builders --------------------------------------*/    
/**
 * Builds and returns the subForm according to the passed params. Disables the 
 * select elem 'parent' of the sub-form. 
 * (container)DIV>[(header)P, (fields)DIV, (buttons)DIV]
 */
function initSubForm(formEntity, fLvl, formClasses, fVals, selId) {             //console.log('initSubForm called. args = %O', arguments)
    return buildFormRows(formEntity, fVals, fLvl, selId)
        .then(buildFormContainer)

    function buildFormContainer(rows) {
        const subFormContainer = buildSubFormCntnr(); 
        const bttns = buildFormBttns(formEntity, fLvl, 'create');
        $(subFormContainer).append([buildFormHdr(), rows, bttns]);
        fP.forms[fLvl].pSelId = selId; 
        enableCombobox(selId, false)
        return subFormContainer;
    }
    function buildSubFormCntnr() {
        const attr = {id: fLvl+'-form', class: formClasses + ' flex-wrap'};
        return _u.buildElem('div', attr);
    }
    function buildFormHdr() {
        const attr = { text: 'New '+_u.ucfirst(formEntity), id: fLvl+'-hdr' };
        return _u.buildElem('p', attr);
    }
}
/** 
 * Builds and returns the default fields for entity sub-form and returns the 
 * row elems. Inits the params for the sub-form in the global fP obj.
 */
function buildFormRows(entity, fVals, level, pSel, action) {                    //console.log('buildFormRows. args = %O', arguments)
    const formConfg = getFormConfg(entity);                                 
    initFormLevelParamsObj(entity, level, pSel, formConfg, (action || 'create'));        
    return getFormFieldRows(entity, formConfg, fVals, level, false)
        .then(returnFinishedRows.bind(null, entity));
}
function returnFinishedRows(entity, rows) {
    const attr = { id: entity+'_Rows', class: 'flex-row flex-wrap'};
    const rowCntnr = _u.buildElem('div', attr);
    $(rowCntnr).append(rows);
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
function getFormConfg(entity) {                                                 //console.log('getFormConfg [%s]', entity);
    const fieldMap = { 
        "arthropod": {
            "add": {},  
            "required": [],
            "suggested": ["Class", "Order", "Family", "Genus", "Species"],
            "optional": [],
            "order": {
                "sug": ["Species", "Genus", "Family", "Order", "Class"],
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
        'editor': { 
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
        'interaction': {
            "add": {},  
            "required": ["InteractionType"],
            "suggested": ["InteractionTags", "Note"],
            "optional": [],
            "order": {
                "sug": ["InteractionType","InteractionTags", "Note"],
                "opt": false },
            "exitHandler": { create: resetInteractionForm }
        },
        'location': {
            'add': {},  
            'required': ['DisplayName', 'Country'],
            'suggested': ['Description', 'HabitatType', 'Latitude', 'Longitude',
                'Elevation', 'ElevationMax'],
            'optional': [],
            'order': {
                'sug': ['Latitude', 'Longitude', 'DisplayName', 'Description', 
                    'Country', 'HabitatType', 'Elevation', 'ElevationMax' ],
                'opt': false },
            'exitHandler': { create: enableCountryRegionField }
        },
        'object': {
            "add": {"Realm": "select"},  
            "required": [],
            "suggested": ["Realm"],
            "optional": [],
            "order": {
                "sug": ["Realm"],
                "opt": false }, 
        },
        'plant': {
            "add": {},  
            "required": [],
            "suggested": ["Family", "Genus", "Species"],
            "optional": [],
            "order": {
                "sug": ["Species", "Genus", "Family"],
                "opt": false},
            "exitHandler": { create: enableTaxonCombos }
        },
        'publication': {
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
        'publisher': { 
            "add": { "City": "text", "Country": "text"}, 
            "required": ["DisplayName", "City", "Country"],
            "suggested": [],
            "optional": ["Description", "LinkUrl", "LinkDisplay"],
            "order": {
                "sug": ["DisplayName", "City", "Country"],
                "opt": ["DisplayName", "City", "Country", "Description", 
                    "LinkUrl", "LinkDisplay"]},
        },
        'subject': {
            "add": {},  
            "required": [],
            "suggested": ["Family", "Genus", "Species"],
            "optional": [],
            "order": {
                "sug": ["Species", "Genus", "Family"],
                "opt": false },
            "exitHandler": { create: enableTaxonCombos }
        },
        'taxon': {
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
 * Returns rows for the entity form fields. If the form is a source-type, 
 * the type-entity form config is used. 
 */
function getFormFieldRows(entity, fConfg, fVals, fLvl) {
    const typeConfg = fP.forms[fLvl].typeConfg;
    const fObj = getFieldTypeObj(entity, fConfg, fLvl, typeConfg);
    return buildRows(fObj, entity, fVals, fLvl)
        .then(orderRows.bind(null, fObj.order));
}
/**
 * Returns an obj with the entity's field defs and all required fields.
 * @return {obj} .fields   Obj - k: fieldName, v: fieldType.
 *               .required Ary of required fields
 */
function getFieldTypeObj(entity, fConfg, fLvl, typeConfg) {                     //console.log('getFieldTypeObj for [%s] @ [%s] level. confg = %O typeConfg = %O', entity, fLvl, fConfg, typeConfg);
    const allFields = Object.assign(getCoreFieldDefs(entity), fConfg.add);
    const include = getFormFields(fConfg, typeConfg, entity);       
    const fieldConfg = fP.forms[fLvl].fieldConfg;     
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
    const shwAll = fP.forms.expanded[entity];
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
    const shwAll = fP.forms.expanded[entity];
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
    return Promise.all(rows);
}
/**
 * @return {div} Form field row with required-state and value (if passed) set.  
 */
function buildRow(field, fieldsObj, entity, fVals, fLvl) {                      //console.log("buildRow. field [%s], fLvl [%s], fVals = %O, fieldsObj = %O", field, fLvl, fVals, fieldsObj);
    return buildFieldInput(fieldsObj.fields[field], entity, field, fLvl)
        .then(buildFieldRow);

    function buildFieldRow(input) {                                             //console.log('input = %O', input);
        const isReq = isFieldRequried(field, fLvl, fieldsObj.required);    
        addFieldToFormFieldObj();
        fillFieldIfValuePassed(input);
        $(input).change(storeFieldValue.bind(null, input, field, fLvl, null));
        return buildFormRow(_u.ucfirst(field), input, fLvl, isReq, "");
    }
    /** Adds the field, and it's type and value, to the form's field obj.  */
    function addFieldToFormFieldObj() {
        fP.forms[fLvl].fieldConfg.vals[field] = {
            val: fVals[field], type: fieldsObj.fields[field]
        };
    }
    /** Sets the value for the field if it is in the passed 'fVals' obj. */
    function fillFieldIfValuePassed(input) {                                    //console.log('filling value in [%s]', field);
        if (field in fVals) { 
            if (fieldsObj.fields[field] === "multiSelect") { return; }          //console.log('---filling');
            $(input).val(fVals[field]); 
        }
    }
} /* End buildRow */ 
function buildFieldInput(fieldType, entity, field, fLvl) {                      //console.log('buildFieldInput. type [%s], entity [%s], field [%s], lvl [%s]', fieldType, entity, field, fLvl);
    const buildFieldType = { 'text': buildTextInput, 'tags': buildTagField, 
        'select': buildSelectCombo, 'multiSelect': buildMultiSelectCntnr,  
        'textArea': buildTextArea, 'fullTextArea': buildLongTextArea };
    return Promise.resolve(buildFieldType[fieldType](entity, field, fLvl));
}
function getFieldClass(fLvl, fieldType) {  
    const classes = { 'top': 'lrg-field', 'sub': 'med-field', 'sub2': 'med-field' };
    return fieldType === 'long' ? (fLvl === 'top' ? 'xlrg-field top' :
        'xlrg-field') : classes[fLvl];
}
/** Returns true if field is in the required fields array. */
function isFieldRequried(field, fLvl, reqFields) {                              //console.log('isFieldRequried. fLvl = [%s], fP = %O', fLvl, fP);
    return reqFields.indexOf(field) !== -1;
}
/**
 * Adds field value to the form's confg object. Calls @handleCitText to check 
 * citation fields for any changes to the generated and displayed citation text.
 */
function storeFieldValue(elem, fieldName, fLvl, value) {            
    const val = value || $(elem).val();                             
    if (fieldName === 'Authors' || fieldName === 'Editors') { return; }
    if (fP.forms[fLvl].entity === 'citation') { handleCitText(fLvl); }
    fP.forms[fLvl].fieldConfg.vals[fieldName].val = val;
}
/** Stores value at index of the order on form, ie the cnt position. */
function storeMultiSelectValue(fLvl, cnt, field, e) {                           //console.log('storeMultiSelectValue. lvl = %s, cnt = %s, field = %s, e = %O', fLvl, cnt, field, e);
    if (e.target.value === "create") { return; }
    const vals = fP.forms[fLvl].fieldConfg.vals;                                //console.log('getCurrentFormFieldVals. vals = %O', vals);
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
function orderRows(order, rows) {                                               //console.log("    ordering rows = %O, order = %O", rows, order);
    rows.sort((a, b) => {
        let x = order.indexOf(a.id.split("_row")[0]);  
        let y = order.indexOf(b.id.split("_row")[0]); 
        return x < y ? -1 : x > y ? 1 : 0;
    });
    return rows;
}
/*----------------------- Form Input Builders ----------------------------*/
function buildTextInput(entity, field, fLvl) { 
    return _u.buildElem('input', { 'type': 'text', class: getFieldClass(fLvl) });
}
function buildTextArea(entity, field, fLvl) {                                     
    return _u.buildElem('textarea', {class: getFieldClass(fLvl) });
}
function buildLongTextArea(entity, field, fLvl) {
    return _u.buildElem('textarea', 
        { class: getFieldClass(fLvl, 'long'), id:field+'-txt' });
}
/**
 * Creates and returns a select dropdown for the passed field. If it is one of 
 * a larger set of select elems, the current count is appended to the id. Adds 
 * the select's fieldName to the subForm config's 'selElem' array to later 
 * init the 'selectize' combobox. 
 */
function buildSelectCombo(entity, field, fLvl, cnt) {                           //console.log("buildSelectCombo [%s] field %s, fLvl [%s], cnt [%s]", entity, field, fLvl, cnt);                            
    return getSelectOpts(field).then(finishComboBuild);

    function finishComboBuild(opts) {
        const fieldId = cnt ? field + '-sel' + cnt : field + '-sel';
        const sel = _u.buildSelectElem(opts, { id: fieldId , class: getFieldClass(fLvl)});
        fP.forms[fLvl].selElems.push(field);                                    //console.log("entity = %s. field = %s, opts = %O ", entity, field, opts);
        return sel;
    }
}
/**
 * Creates a select dropdown field wrapped in a div container that will
 * be reaplced inline upon selection. Either with an existing Author's name, 
 * or the Author create form when the user enters a new Author's name. 
 */
function buildMultiSelectCntnr(entity, field, fLvl) {                           //console.log("entity = %s. field = ", entity, field);
    const cntnr = _u.buildElem('div', { id: field+'-sel-cntnr'});
    return buildMultiSelectElems(entity, field, fLvl, 1)
        .then(returnFinishedMultiSelectFields);

    function returnFinishedMultiSelectFields(fields) {
        $(cntnr).data('inputType', 'multiSelect').data('cnt', 1);
        $(cntnr).append(fields);
        return cntnr;
    }
}
function buildMultiSelectElems(entity, field, fLvl, cnt) {
    return buildSelectCombo(entity, field, fLvl, cnt)
        .then(returnFinishedMultiSelectField);

    function returnFinishedMultiSelectField(fieldElem) {
        const wrapper = _u.buildElem('div', {class: 'flex-row'});
        const lbl = buildMultiSelectLbl(cnt)
        $(fieldElem).change(storeMultiSelectValue.bind(null, fLvl, cnt, field));
        $(wrapper).append([lbl, fieldElem]);
        return wrapper;
    }

} /* End buildMultiSelectElems */
function buildMultiSelectLbl(cnt) {
    const lbl = _u.buildElem('span', {text: getCntLabel(cnt), class:'multi-span'});
    $(lbl).css({padding: '.2em .5em 0 0', width: '2.2em'});
}
function getCntLabel(cnt) {
    const map = {1: '1st: ', 2:'2nd: ', 3:'3rd: '};
    return cnt in map ? map[cnt] : cnt+'th: '; 
}
/**
 * Creates and returns a select dropdown that will be initialized with 'selectize'
 * to allow multiple selections. A data property is added for use form submission.
 */
function buildTagField(entity, field, fLvl) {
    return getSelectOpts(field).then(buildTagElem);

    function buildTagElem(opts) {
        const tagSel = _u.buildSelectElem(opts, { id: field + '-sel', 
            class: getFieldClass(fLvl)});
        $(tagSel).data('inputType', 'tags');
        return tagSel;
    }
}
/* ---------- Option Builders --------------------------------------------*/
/** Returns and array of options for the passed field type. */
function getSelectOpts(field) {                                                 //console.log("getSelectOpts. for %s", field);
    var optMap = {
        "Authors": [ getSrcOpts, 'authSrcs'],
        "CitationType": [ getCitTypeOpts, 'citTypeNames'],
        "Class": [ getTaxonOpts, 'Class' ],
        "Country": [ _u.getOptsFromStoredData, 'countryNames' ],
        "Editors": [ getSrcOpts, 'authSrcs'],
        "Family": [ getTaxonOpts, 'Family' ],
        "Genus": [ getTaxonOpts, 'Genus' ],
        "HabitatType": [ _u.getOptsFromStoredData, 'habTypeNames'],
        "InteractionTags": [ getTagOpts, 'interaction' ],
        "InteractionType": [ _u.getOptsFromStoredData, 'intTypeNames' ],
        "Order": [ getTaxonOpts, 'Order' ],
        "PublicationType": [ _u.getOptsFromStoredData, 'pubTypeNames'],
        "Publisher": [ getSrcOpts, 'publSrcs'],
        "Realm": [ getRealmOpts, null ],
        "Species": [ getTaxonOpts, 'Species' ],
        // "Tags": [ getTagOpts, 'source' ],
    };
    var getOpts = optMap[field][0];
    var fieldKey = optMap[field][1];
    return getOpts(fieldKey, field);
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
/** Returns an array of options objects for tags of the passed entity. */
function getTagOpts(entity) {
    return _u.getOptsFromStoredData(entity+"Tags");
}
/** Returns an array of source-type (prop) options objects. */
function getSrcOpts(prop, field) {
    const map = { 'pubSrcs': 'Publication', 'publSrcs': 'Publisher', 
        'authSrcs': field ? field.slice(0, -1) : 'Author' };
    return _u.getData(prop).then(buildSrcOpts);

    function buildSrcOpts(ids) {
        let opts = getRcrdOpts(ids, fP.records.source);
        opts.unshift({ value: 'create', text: 'Add a new '+map[prop]+'...'});
        return opts;
    }
}
/**
 * Return the citation type options available for the parent publication type.
 * Also adds the parent publication and source records to the fP obj. 
 */
function getCitTypeOpts(prop) {  
    const fLvl = getSubFormLvl('sub');
    return _u.getData(prop).then(buildCitTypeOpts);

    function buildCitTypeOpts(types) {
        return _u.buildOptsObj(types, getCitTypeNames().sort())
    }
    function getCitTypeNames() {
        const opts = {
            'Book': ['Book', 'Chapter'], 'Journal': ['Article'],
            'Other': ['Museum record', 'Other', 'Report'],
            'Thesis/Dissertation': ["Master's Thesis", 'Ph.D. Dissertation']
        };
        setPubInParams()
        return opts[fP.forms[fLvl].pub.pub.publicationType.displayName];
    }
    function setPubInParams() {
        const pubSrc = getSrcRcrd($('#Publication-sel').val());
        const pub = getRcrd('publication', pubSrc.publication);
        fP.forms[fLvl].pub = { pub: pub, src: pubSrc};
    }
    function getSrcRcrd(pubId) {
        if (pubId) { return fP.records.source[pubId]; } //When not editing citation record.
        const rcrd = getRcrd('source', fP.editing.core)
        return fP.records.source[rcrd.parent];
    }
} /* End getCitTypeOpts */
/** Returns an array of taxonyms for the passed level and the form's realm. */
function getTaxonOpts(level) {
    return _u.getOptsFromStoredData(fP.forms.taxonPs.realm+level+'Names')
        .then(buildTaxonOpts);

        function buildTaxonOpts(opts) {                                         //console.log("taxon opts for [%s] = %O", fP.forms.taxonPs.realm+level+"Names", opts)        
            opts.unshift({ value: 'create', text: 'Add a new '+level+'...'});
            return opts;
        }
}
function getRealmOpts() {
    return _u.getOptsFromStoredData('objectRealmNames');  
}
/* -----------------------------------------------------------------------*/
/**
 * Each element is built, nested, and returned as a completed row. 
 * rowDiv>(errorDiv, fieldDiv>(label, input, [pin]))
 */
function buildFormRow(field, input, fLvl, isReq, rowClss) {                     //console.log('building form row for [%s], req? [%s]', field, isReq);
    const fieldName = field.replace(/([A-Z])/g, ' $1'); //Adds space between pascal-cased words
    const rowDiv = _u.buildElem('div', { class: getRowClasses(), 
        id: field + '_row'});
    const errorDiv = _u.buildElem('div', { id: field+'_errs'}); 
    const fieldCntnr = _u.buildElem('div', { class: 'field-row flex-row'});
    const label = _u.buildElem('label', {text: _u.ucfirst(fieldName).trim(), id:field+'-lbl'});
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
    var pinClasses = 'top-pin' + (fP.editing ? ' invis' : '');
    var pin = _u.buildElem("input", {type: "checkbox", id: field+"_pin", class: pinClasses});
    _u.addEnterKeypressClick(pin);
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
    fP.forms[fLvl].reqElems.push(input);
}
/**
 * On a required field's change event, the submit button for the element's form 
 * is enabled if all of it's required fields have values and it has no open child 
 * forms. 
 */
function checkRequiredFields(e) {                                               //console.log('checkRequiredFields e = %O', e)
    const input = e.currentTarget;
    const fLvl = $(input).data('fLvl');  
    checkReqFieldsAndToggleSubmitBttn(input, fLvl);
    if (fP.forms[fLvl].entity === 'citation') { handleCitText(fLvl); }  
}
/**
 * Note: The 'unchanged' property exists only after the create interaction form 
 * has been submitted and before any changes have been made.
 */
function checkReqFieldsAndToggleSubmitBttn(input, fLvl) {                       //console.log('### checkingReqFields = %O, fLvl = %s, unchanged? ', input, fLvl, fP.forms.top.unchanged);
    const subBttnId = '#'+fLvl+'-submit';
    if (fP.forms.top.unchanged) { resetForNewForm(); }
    if (!isRequiredFieldFilled(fLvl, input) || hasOpenSubForm(fLvl)) {          //console.log('     disabling submit');
        disableSubmitBttn(subBttnId); 
    } else if (ifAllRequiredFieldsFilled(fLvl)) {                               //console.log('     enabling submit');
        if (locHasGpsData(fLvl)) { return; }
        enableSubmitBttn(subBttnId);
    }
}
/**
 * After the interaction form is submitted, the submit button is disabled to 
 * eliminate accidently creating duplicate interactions. This change event is
 * added to the non-required fields of the form to enable to submit as soon as 
 * any change happens in the form, if the required fields are filled. Also 
 * removes the success message from the form.
 */
function checkIntFieldsAndEnableSubmit() {
    if (ifAllRequiredFieldsFilled('top')) { enableSubmitBttn('#top-submit'); }
    if (fP.forms.top.unchanged) { resetForNewForm(); }
}
/** Returns true if all the required elements for the current form have a value. */
function ifAllRequiredFieldsFilled(fLvl) {                                      //console.log("->-> ifAllRequiredFieldsFilled... fLvl = %s. fP = %O", fLvl, fP)
    const reqElems = fP.forms[fLvl].reqElems;                                   //console.log('reqElems = %O', reqElems);          
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
    return isAFieldSelected('Authors') || isAFieldSelected('Editors');         
}
function isAFieldSelected(entity) {                                             //console.log('[%s] field = %O', entity, $('#'+entity+'-sel-cntnr')[0]);
    if (!$('#'+entity+'-sel-cntnr').length) { return false; } //When no editor select is loaded.
    const fields = $('#'+entity+'-sel-cntnr')[0].firstChild.children;           //console.log('fields = %O', fields);
    let isSelected = false;
    $.each(fields, (i, field) => { if ($(field).val()) { isSelected = true; } });
    return isSelected;
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
    const cntnr = _u.buildElem("div", { class: "flex-row bttn-cntnr" });
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
    if (fP.forms[level].confg.order.opt === false) { return; }
    const cntnr = _u.buildElem('div', {class: 'all-fields-cntnr'});
    const chckBox = _u.buildElem('input', { id: level+'-all-fields', 
        type: 'checkbox', value: 'Show all fields' }) 
    const lbl = _u.buildElem('label', { for: level+'-all-fields', 
        text: 'Show all fields.' }); 
    if (fP.forms.expanded[entity]) { chckBox.checked = true; }
    $(chckBox).change(toggleShowAllFields.bind(chckBox, _u.lcfirst(entity), level));
    _u.addEnterKeypressClick(chckBox);
    $(cntnr).append([chckBox, lbl]);
    return cntnr;
}
/** Returns the buttons with the events bound. */
function buildSubmitAndCancelBttns(level, action, entity) {
    const bttn = { create: "Create", edit: "Update" };
    const events = getBttnEvents(entity, level);                                //console.log("events = %O", events);
    const submit = buildFormButton(
        'submit', level, bttn[action] + " " + _u.ucfirst(entity));
    const cancel = buildFormButton('cancel', level, 'Cancel');
    $(submit).attr("disabled", true).css("opacity", ".6").click(events.submit);
    $(cancel).css("cursor", "pointer").click(events.cancel);
    return [submit, cancel];
}
/** Returns a (submit or cancel) button for the form level. */
function buildFormButton(action, level, val) {
    return _u.buildElem("input", { id: level +'-'+action, 
        class: "ag-fresh tbl-bttn", type: "button", value: val});
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
function exitForm(formId, fLvl, focus, data) {                                  //console.log("Exiting form. id = %s, fLvl = %s, exitHandler = %O", formId, fLvl, fP.forms[fLvl].exitHandler);      
    $(formId).remove();
    resetFormCombobox(fLvl, focus);
    if (fLvl !== 'top') { ifParentFormValidEnableSubmit(fLvl); }
    fP.forms[fLvl].exitHandler(data);
}
/** Returns the 'next' form level- either the parent or child. */
function getNextFormLevel(next, curLvl) {
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
function getSubFormLvl(intFormLvl) {  
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
function fieldIsDisplayed(field, fLvl) {
    const curFields = fP.forms[fLvl].fieldConfg.fields;                         //console.log('field [%s] is displayed? ', field, Object.keys(curFields).indexOf(field) !== -1);
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
function getFormValuesAndSubmit(id, fLvl, entity) {                             //console.log("getFormValuesAndSubmit. id = %s, fLvl = %s, entity = %s", id, fLvl, entity);
    getFormValueData(entity, fLvl, true)
        .then(submitFormIfNoErrors);

    function submitFormIfNoErrors(formVals) {
        if (formVals.err) { return; }
        buildFormDataAndSubmit(fLvl, formVals);  
    }
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
    return handleAdditionalEntityData(entity)
        .then(returnFormVals);

    /** Get's the value from the form elem and set it into formVals. */
    function getInputData(elem) {                                           
        if (elem.className.includes('skipFormData')) { return; }                //console.log("elem = %O", elem)
        const fieldName = _u.lcfirst(elem.children[1].children[0].innerText.trim().split(" ").join("")); 
        const input = elem.children[1].children[1];                             //console.log("---------[%s] = %O", fieldName, input);
        formVals[fieldName] = parseFieldData();                                 //console.log('[%s] = [%s]', fieldName, formVals[fieldName]);
        
        /** 
         * Returns the input value from specialized parsing methods or trims the 
         * field value and returns the value, with numbers parsed as integers. 
         */
        function parseFieldData() {
            const val = $(input).data('inputType') ? 
                getInputVals(fieldName, input, $(input).data('inputType')) : 
                input.value.trim() || null; 
            return Number.isInteger(val) ? parseInt(val) : val;                                         
        }
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
        return getSelVal('#'+_u.ucfirst(fieldName)+'-sel');
    }
    function handleAdditionalEntityData(entity) {
        if (!submitting) { return Promise.resolve(); }
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
        if (!dataHndlrs[entity]) { return Promise.resolve(); }
        return Promise.all(dataHndlrs[entity].map(func => Promise.resolve(func())));
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
        formVals.publication = fP.editing ? 
            fP.forms[fLvl].pub.src.id : $('#Publication-sel').val();
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
        const pubTitle = fP.forms[fLvl].pub.src.displayName;
        if (formVals.displayName.includes('(citation)')) { return; }
        if (pubTitle != formVals.displayName) { return; }
        formVals.displayName += '(citation)';
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
    /**
     * Sets location type according to the most specific data entered. 
     * "Point": if there is lat/long data. "Area" otherwise.
     */
    function getLocType() {
        return _u.getData('locTypeNames').then(locTypes => {
            const type = formVals.longitude || formVals.latitude ? 'Point' : 'Area';
            formVals.locationType = locTypes[type];  
        });
    }
    /**
     * If no location is selected for an interaction record, the country field 
     * is checked for a value. If set, it is added as the interaction's location;
     * if not, the 'Unspecfied' location is added.
     */
    function handleUnspecifiedLocs(entity) {
        if (formVals.location) { return; }
        if (formVals.country) { return getUnspecifiedLocId(); }
        formVals.location = formVals.country;
    }
    /** Returns the id of the Unspecified region. */
    function getUnspecifiedLocId() {
        return _u.getData('topRegionNames').then(regions => regions['Unspecified']);
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
        const formTaxonLvl = fP.forms.taxonPs.formTaxonLvl;
        formVals.parentTaxon = getParentTaxon(formTaxonLvl);
        formVals.level = formTaxonLvl;
    }
    /** -------------------- Additional Taxon Data -----------------------*/ 
    /**
     * Checks each parent-level combo for a selected taxon. If none, the realm
     * taxon is added as the new Taxon's parent.
     */
    function getParentTaxon(lvl) {
        var lvls = fP.forms.taxonPs.lvls;
        var parentLvl = lvls[lvls.indexOf(lvl)-1];
        if ($('#'+parentLvl+'-sel').length) { 
            return $('#'+parentLvl+'-sel').val() || getParentTaxon(parentLvl);
        } 
        return fP.forms.taxonPs.realmTaxon.id;
    }
    function returnFormVals() {
        checkForErrors(entity, formVals, fLvl);
        return formVals;
    }
} /* End getFormValueData */
function checkForErrors(entity, formVals, fLvl) {
    const errs = { author: checkDisplayNameForDups, editor: checkDisplayNameForDups };
    if (!errs[entity]) { return; }
    errs[entity](entity, formVals, fLvl);
}
/**
 * Checks to ensure the new author's name doesn't already exist in the database. 
 * If it does, a prompt is given to the user to check to ensure they are not 
 * creating a duplicate, and to add initials if they are sure this is a new author. 
 */
function checkDisplayNameForDups(entity, vals, fLvl) {                                //console.log('checkDisplayNameForDups [%s] vals = %O', entity, vals);
    if (fP.action === 'edit') { return; }
    const cntnr = $('#'+_u.ucfirst(entity)+'s-sel1')[0];
    const opts = cntnr.selectize.options;  
    const dup = checkForDuplicate(opts, vals.displayName);  
    if (!dup) { return; }
    reportFormFieldErr('FirstName', 'dupAuth', fLvl);
    vals.err = true;
}
function checkForDuplicate(opts, name) {  
    const newName = name.replace(/\./g,'').toLowerCase(); 
    const optKeys = Object.keys(opts);
    return optKeys.find(k => {
        let optName = opts[k].text.replace(/\./g,'').toLowerCase(); 
        return optName == newName
    });
}
/** -------------- Form Data Helpers ------------ */
/** Returns an obj with the order (k) of the values (v) inside of the container. */
function getSelectedVals(cntnr, fieldName) {
    let vals = {};
    $.each(cntnr.children, (i, elem) => getCntnrFieldValue(i+1, elem.children));              
    return vals;
        
    function getCntnrFieldValue(cnt, subElems) {                                     
        $.each(subElems, (i, subEl) => { 
            if (subEl.value) { vals[cnt] = subEl.value; }});  
    }                                                                   
}
/**
 * Builds a form data object @buildFormData. Sends it to the server @submitFormData
 */
function buildFormDataAndSubmit(fLvl, formVals) {                        
    let entity = fP.forms[fLvl].entity;                                         //console.log("Submitting [ %s ] [ %s ]-form with vals = %O", entity, fLvl, formVals);  
    if (entity === 'editor') { entity = 'author'; }
    const formData = buildFormData(entity, formVals, fLvl);                     //console.log("formData = %O", formData);
    submitFormData(formData, fLvl, entity);
}                
/**
 * Returns an object with the entity names' as keys for their field-val objects, 
 * which are grouped into flat data and related-entity data objects. 
 */
function buildFormData(entity, formVals, fLvl) { 
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
     * overwritten if the type is 'Point'. Otherwise, (multi)polygon coords
     * would be overwritten. Once map editing is complete, this will be revised.
     */
    function handleGeoJson() {
        if (!fP.editing && (!formVals.latitude || !formVals.longitude)) { return; }
        const displayPoint = JSON.stringify([ formVals.longitude, formVals.latitude ]);
        const geoJson = fP.forms.top.geoJson; 
        const coords = !geoJson || geoJson.type === 'Point' ? 
            displayPoint : fP.forms[fLvl].geoJson.coordinates;
        data.geoJson = {
            flat: { 
                'displayPoint': displayPoint, 
                'coordinates': coords, 
                'locationName': formVals.displayName,
                'type': 'Point' },
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
        return _u.lcfirst(field.split(' ').join(''));
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
    var url = getEntityUrl(fP.forms[fLvl].action);
    if (fP.editing) { formData.ids = fP.editing; }
    formData.coreEntity = coreEntity;
    storeParamsData(coreEntity, fLvl);
    toggleWaitOverlay(true);
    _u.sendAjaxQuery(formData, url, formSubmitSucess, formSubmitError);
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
function formSubmitSucess(ajaxData, textStatus, jqXHR) {                        console.log("Ajax Success! data = %O, textStatus = %s, jqXHR = %O", ajaxData, textStatus, jqXHR);                   
    var data = parseData(ajaxData.results);
    storeData(data);
}
/** Calls the appropriate data storage method and updates fP. */  
function storeData(data) {  
    db_sync.updateLocalDb(data).then(onDataSynced);
}
/** afterStoredDataUpdated callback */
function onDataSynced(data) {                                                   console.log('data update complete. data = %O', data);
    toggleWaitOverlay(false);
    if (data.errors) { return errUpdatingData(data.errors); }
    if (data.citationUpdate) { return; }
    if (isEditForm() && !hasChngs(data)) { 
        return showSuccessMsg('No changes detected.', 'red'); }  
    if (isEditForm() && data.core == 'source') { updateRelatedCitations(data); }
    addDataToStoredRcrds(data.core, data.detail)
    .then(handleFormComplete.bind(null, data));

    function isEditForm() {
        return fP.forms[fP.ajaxFormLvl].action === 'edit';
    }
} /* End afterStoredDataUpdated */
/** Updates the core records in the global form params object. */
function addDataToStoredRcrds(entity, detailEntity) {                           console.log('updateStoredFormParams. [%s] (detail ? [%s]) fP = %O', entity, detailEntity, fP);
    return _u.getData(entity).then(newData => {
        fP.records[entity] = newData;
        if (detailEntity) { return addDataToStoredRcrds(detailEntity); } //Source's detail entities: pub, cit, auth
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
function resetInteractionForm() {
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
    clearCombobox('#'+fieldName+'-sel');
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
    } else { enableCombobox('#CitationTitle-sel', false); }
}
/** Inits the necessary interaction form params after form reset. */
function initInteractionParams() {
    initFormLevelParamsObj(
        "interaction", "top", null, getFormConfg("interaction"), "create");
    addReqElemsToConfg();
}
/**
 * After an interaction is created, the form can not be submitted until changes
 * are made. This removes the change listeners from non-required elems and the 
 * flag tracking the state of the new interaction form.  
 */
function resetForNewForm() {  
    exitSuccessMsg();
    delete fP.forms.top.unchanged;
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
            const src = getRcrd('source', id); 
            if (src.citation) { return cites.push(id); }
            src.children.forEach(cId => cites.push(cId))
        });
        return cites;
    }
    function updateCitations() {                                                //console.log('updateCitations. cites = %O', cites);
        cites.forEach(id => updateCitText(id, srcData));
    }
    function updateCitText(id, chngdSrc) {
        const citSrc = getRcrd('source', id);
        const cit = getRcrd('citation', citSrc.citation);
        const citText = rebuildCitationText(citSrc, cit, chngdSrc);             //console.log('citation text = ', citText);
        updatedCitationData(citSrc, citText);
    }
} /* End updateRelatedCitations */
/** Sends ajax data to update citation and source entities. */
function updatedCitationData(citSrc, text) { 
    const data = { srcId: citSrc.id, text: text };
    _u.sendAjaxQuery(data, 'crud/citation/edit', formSubmitSucess, formSubmitError);
}
/**
 * Generates and displays the full citation text after all required fields 
 * are filled.
 */
function rebuildCitationText(citSrc, cit) {
    const pubSrc = getRcrd('source', citSrc.parent);                    //console.log('rebuildCitationText. citSrc = %O, cit = %O, pub = %O', citSrc, cit, pubSrc);
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
        const year = _u.stripString(citSrc.year);
        const title = _u.stripString(cit.title);
        const pub = _u.stripString(pubSrc.displayName);
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
        const title = _u.stripString(cit.title);
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
        const year = citSrc.year ? _u.stripString(citSrc.year) : pubSrc.year;
        const title = _u.stripString(cit.title);
        const vip = getCiteVolumeIssueAndPages();
        const publ = buildPublString(pubSrc);
        return [athrs, year, title, vip, publ].filter(f=>f).join('. ') +'.';
    }
        /** ---------- citation full text helpers ----------------------- */
    function getCitBookPages(argument) {
        if (!cit.publicationPages) { return false; }
        return 'pp. ' + _u.stripString(cit.publicationPages);
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
        const chap = type === 'Chapter' ? _u.stripString(cit.title) : false;
        const pub = _u.stripString(pubSrc.displayName);
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
    const fLvl = fP.ajaxFormLvl;           
    exitForm('#'+fLvl+'-form', fLvl, false, data); 
    if (fP.forms[fLvl].pSelId) { addAndSelectEntity(data, fLvl); }
}
/** Adds and option for the new entity to the form's parent elem, and selects it. */
function addAndSelectEntity(data, fLvl) {
    const selApi = $(fP.forms[fLvl].pSelId)[0].selectize;        
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
    const fLvl = fP.ajaxFormLvl;                                          
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
        'dupSelAuth' : errTxt.DBALException.includes("Duplicate entry") ? 
        'dupEnt'  : 'genSubmitErr';
}
function isDuplicateAuthorErr(errTxt) {
    return errTxt.DBALException.includes("Duplicate entry") &&
        errTxt.DBALException.includes("contribution");
}
function getFormErrMsg(errTag) {
    var msg = {
        'dupSelAuth': 'An author is selected multiple times.',
        'dupEnt' : 'A record with this display name already exists.',
        'genSubmitErr': 'There was an error during form submission. Please note the ' + 
            'record ID and the changes attempted and send to the developer.'
    };
    return '<span>' + msg[errTag] + '</span>'; 
}
/**------------- Data Storage Errors --------------*/
function errUpdatingData(data) {                                      //console.log('errUpdatingData. errMsg = [%s], errTag = [%s]', errMsg, errTag);
    const errMsg = data.msg;
    const errTag = data.tag;
    const cntnr = _u.buildElem('div', { class: 'flex-col', id:'data_errs' });
    const msg = `<span>${errMsg}<br><br>Please report this error to the developer: <b> 
        ${errTag}</b><br><br>This form will close and all stored data will be 
        redownloaded.</span>`;
    const confirm = _u.buildElem('span', { class: 'flex-row', 
            'text': `Please click "OK" to continue.` });
    const bttn = _u.buildElem('input', { type: 'button', value: 'OK', 
            class: 'tbl-bttn exit-bttn' });
    $(confirm).append(bttn);
    $(cntnr).append([msg, confirm]);
    $('#top-hdr').after(cntnr);
    $(bttn).click(reloadAndRedownloadData);
    $('#top-submit, #top-cancel, #exit-form').off('click')
        .css('disabled', 'disabled').fadeTo('400', 0.5);
}
function reloadAndRedownloadData() {                                            //console.log('reloadAndRedownloadData called. prevFocus = ', fP.submitFocus);
    exitFormPopup(null, 'skipTableReset');
    db_sync.resetStoredData();
}
/**
 * When the user attempts to create an entity that uses the sub-form and there 
 * is already an instance using that form, show the user an error message and 
 * reset the select elem. 
 */
function openSubFormErr(field, id, fLvl, skipClear) {                           //console.log("selId = %s, fP = %O ", selId, fP)
    var selId = id || '#'+field+'-sel';
    return formInitErr(field, 'openSubForm', fLvl, selId, skipClear);
}
/** 
 * When an error prevents a form init, this method shows an error to the user
 * and resets the combobox that triggered the form. 
 */
function formInitErr(field, errTag, fLvl, id, skipClear) {                      //console.log("formInitErr: [%s]. field = [%s] at [%s], id = %s", errTag, field, fLvl, id)
    const selId = id || '#'+field+'-sel';
    reportFormFieldErr(field, errTag, fLvl);
    if (skipClear) { return; }
    window.setTimeout(function() {clearCombobox(selId)}, 10);
    return { 'value': '', 'text': 'Select ' + field };
}
/**
 * Shows the user an error message above the field row. The user can clear the 
 * error manually with the close button, or automatically by resolving the error.
 */
function reportFormFieldErr(fieldName, errTag, fLvl) {                          //console.log("###__formFieldError- '%s' for '%s' @ '%s'", errTag, fieldName, fLvl);
    const errMsgMap = {
        'dupAuth': handleDupAuth,
        'fillAuthBlanks': handleAuthBlanks,
        'fillEdBlanks': handleEdBlanks,
        'isGenusPrnt': handleIsGenusPrnt,
        'invalidCoords': handleInvalidCoords,
        'needsGenusName': handleNeedsGenusName,
        'needsGenusPrnt': handleNeedsGenusParent, 
        'needsHigherLvlPrnt': handleNeedsHigherLvlPrnt,
        'needsHigherLvl': handleNeedsHigherLvl,
        'needsLocData': handleNeedsLocData,
        'noGenus': handleNoGenus,
        'openSubForm': handleOpenSubForm,
    };
    const errElem = getFieldErrElem(fieldName, fLvl);
    errMsgMap[errTag](errElem, errTag, fLvl, fieldName);
}
/* ----------- Field-Error Handlers --------------------------------------*/
function handleDupAuth(elem, errTag, fLvl, fieldName) {  
    const msg = `<span>An author with this name already exists in the database.\n
        If you are sure this is a new author, add initials or modify their name 
        and submit again. </span>`;
    setErrElemAndExitBttn(elem, msg, errTag, fLvl);
}
function clrDupAuth(elem, fLvl, e) { 
    clearErrElemAndEnableSubmit(elem, fLvl);
}
/** Note: error for the edit-taxon form. */
function handleIsGenusPrnt(elem, errTag, fLvl, fieldName) {  
    const msg = "<span>Genus' with species children must remain at genus.</span>";
    setErrElemAndExitBttn(elem, msg, errTag, 'top');
}
function clrIsGenusPrnt(elem, fLvl, e) { 
    setSelVal('#txn-lvl', $('#txn-lvl').data('lvl'));
    clearErrElemAndEnableSubmit(elem, 'top');
}
/** Note: error used for the location form. */
function handleInvalidCoords(elem, errTag, fLvl, fieldName) {
    const msg = `<span>Invalid coordinate format.</span>`;
    $(`#${fieldName}_row input[type="text"]`).on('input', 
        clrInvalidCoords.bind(null, elem, fLvl, null, fieldName)); 
    setErrElemAndExitBttn(elem, msg, errTag, fLvl);
    $('.err-exit').hide();
}
function clrInvalidCoords(elem, fLvl, e, fieldName) {
    clearErrElemAndEnableSubmit(elem, fLvl);
    if (fieldName) { $(`#${fieldName}_Row input[type="text"]`).off('input'); }
}
function handleNeedsGenusName(elem, errTag, fLvl, fieldName) {
    const genus = getSelTxt('#Genus-sel');
    const msg = `<span>Species must begin with the Genus name "${genus}".</span>`;
    $('#DisplayName_row input').change(clearErrElemAndEnableSubmit.bind(null, elem, fLvl));
    setErrElemAndExitBttn(elem, msg, errTag, fLvl);
}
function clrNeedsGenusName(elem, fLvl, e) {
    $('#DisplayName_row input')[0].value = '';
    clearErrElemAndEnableSubmit(elem, fLvl);
}
/** Note: error for the edit-taxon form. */
function handleNeedsGenusParent(elem, errTag, fLvl, fieldName) {  
    const msg = '<span>Please select a genus parent for the species taxon.</span>';
    setErrElemAndExitBttn(elem, msg, errTag, 'top');
}
function clrNeedsGenusPrntErr(elem, fLvl, e) {            
    setSelVal('#txn-lvl', $('#txn-lvl').data('lvl'));
    clearErrElemAndEnableSubmit(elem, 'top');
}
/** Note: error for the create-taxon form. */
function handleNoGenus(elem, errTag, fLvl, fieldName) {  
    const msg = '<span>Please select a genus before creating a species.</span>';
    setErrElemAndExitBttn(elem, msg, errTag, fLvl);
    $('#Genus-sel').change(function(e){
        if (e.target.value) { clrNoGenusErr(elem, fLvl); }
    });
}
function clrNoGenusErr(elem, fLvl, e) {                                            
    $('#Genus-sel').off('change');
    clearErrElemAndEnableSubmit(elem, fLvl);
}
/** Note: error for the edit-taxon form. */
function handleNeedsHigherLvlPrnt(elem, errTag, fLvl, fieldName) { 
    const msg = '<span>The parent taxon must be at a higher taxonomic level.</span>';
    setErrElemAndExitBttn(elem, msg, errTag, fLvl);
}
/** Clears the cause, either the parent-selection process or the taxon's level. */
function clrNeedsHigherLvlPrnt(elem, fLvl, e) {          
    setSelVal('#txn-lvl', $('#txn-lvl').data('lvl'));
    clearErrElemAndEnableSubmit(elem, fLvl);
    if ($('#sub-form').length) { return selectParentTaxon(
        $('#txn-prnt').data('txn'), fP.forms.taxonPs.curRealmLvls[0]); 
    }
    $('#txn-lvl').data('lvl', $('#txn-lvl').val());
}
/** Note: error for the edit-taxon form. */
function handleNeedsHigherLvl(elem, errTag, fLvl, fieldName) {  
    var childLvl = getHighestChildLvl($('#txn-lvl').data('txn'));
    var lvlName = fP.forms.taxonPs.lvls[childLvl-1];
    var msg = '<div>Taxon level must be higher than that of child taxa. &nbsp&nbsp&nbsp' +
        'Please select a level higher than '+lvlName+'</div>';
    $('#chng-prnt').attr({'disabled': true}).css({'opacity': '.6'});
    setErrElemAndExitBttn(elem, msg, errTag, fLvl);
}
function clrNeedsHigherLvl(elem, fLvl, e, taxonLvl) {    
    var txnLvl = taxonLvl || $('#txn-lvl').data('lvl'); 
    setSelVal('#txn-lvl', $('#txn-lvl').data('lvl'), 'silent');
    $('#txn-lvl').data('lvl', txnLvl);
    clearLvlErrs('#Taxon_errs', fLvl);
    enableChngPrntBtttn();
}
/** Enables the button if the change-parent form isn't already open. */
function enableChngPrntBtttn() {
    if ($('#sub-form').length ) { return; }
    $('#chng-prnt').attr({'disabled': false}).css({'opacity': '1'});
}
/** Note: error used for the location form when selecting new location from map. */
function handleNeedsLocData(elem, errTag, fLvl, fieldName) {
    const msg = `<div id='err'>Please fill required fields and submit again.</div>`;
    setErrElemAndExitBttn(elem, msg, errTag, fLvl);
    $('div.new-loc-popup').prepend(msg);
}
function clrNeedsLocData(elem, fLvl, e) {
    clearErrElemAndEnableSubmit(elem, fLvl);
    $('.new-loc-popup #err').remove();
}
/** Note: error used for the publication form. */
function handleOpenSubForm(elem, errTag, fLvl, fieldName) {  
    var subEntity = fP.forms[fLvl] ? fP.forms[fLvl].entity : '';
    var msg = '<p>Please finish the open '+ _u.ucfirst(subEntity) + ' form.</p>';
    setErrElemAndExitBttn(elem, msg, errTag, fLvl);
    setOnFormCloseListenerToClearErr(elem, fLvl);
}
/** Note: error used for the publication/citation form. */
function handleAuthBlanks(elem, errTag, fLvl, fieldName) {  
    var subEntity = fP.forms[fLvl] ? fP.forms[fLvl].entity : '';
    var msg = '<p>Please fill the blank in the order of authors.</p>';
    setErrElemAndExitBttn(elem, msg, errTag, fLvl);
    setOnFormCloseListenerToClearErr(elem, fLvl);
}
/** Note: error used for the publication form. */
function handleEdBlanks(elem, errTag, fLvl, fieldName) {  
    var subEntity = fP.forms[fLvl] ? fP.forms[fLvl].entity : '';
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
    const elem = _u.buildElem('div', { id: fLvl+'_errs', class: fLvl+'-active-errs' }); 
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
        'isGenusPrnt': clrIsGenusPrnt, 'invalidCoords': clrInvalidCoords,
        'needsGenusName': clrNeedsGenusName, 
        'needsGenusPrnt': clrNeedsGenusPrntErr, 'noGenus': clrNoGenusErr, 
        'needsHigherLvl': clrNeedsHigherLvl, 'needsHigherLvlPrnt': clrNeedsHigherLvlPrnt,
        'needsLocData': clrNeedsLocData, 'openSubForm': clrOpenSubForm, 
        'dupSelAuth': clrFormLvlErr, 'dupAuth': clrDupAuth,
        'dupEnt': clrFormLvlErr, 'genSubmitErr': clrFormLvlErr, 
        'fillAuthBlanks': false, 'fillEdBlanks': false
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
    const subLvl = getNextFormLevel('child', fLvl);
        $(elem).fadeTo(400, 0, clearErrElem);
    if (!$('#'+subLvl+'-form').length) { enableSubmitBttn('#'+fLvl+'-submit'); }

    function clearErrElem() {                                                   //console.log('fLvl = ', fLvl);
        $(elem).removeClass(fLvl+'-active-errs');
        if (elem.innerHTML) { elem.innerHTML = ''; }
        $(elem).fadeTo(0, 1);
    }
} /* End clearErrElemAndEnableSubmit */