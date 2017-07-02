/**
 * When logged in as an 'admin' or 'super': 
 * >> On the database search page, multiple admin-ui elements are added that open 
 * a popup interface allowing the creating, updating and, soon, deleting of data.   
 * >> All Content Blocks will have an edit icon attached to the top left of their 
 * container. When clicked, a wysiwyg interface will encapsulate that block and 
 * allow editing and saving of the content within using the trumbowyg library.
 */
$(document).ready(function(){  
    var userRole, fParams = {};
    var eif = ECO_INT_FMWK;
    var _util = eif.util;
    eif.form = {
        editEntity: editEntity
    };

    document.addEventListener('DOMContentLoaded', onDOMContentLoaded); 
  
    function onDOMContentLoaded() { 
        userRole = $('body').data("user-role");                                 //console.log("crud.js role = ", userRole);
        authDependentInit(); 
    }
    function authDependentInit() {   
        if (['editor', 'admin', 'super'].indexOf(userRole) !== -1) {            //console.log("admin CRUD ACTIVATE!! ");
            if ($('body').data("this-url") === "/search") { buildSearchPgFormUi(); }
            if (userRole !== 'editor') { initWysiwyg(); }
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
                'Citation': { popup: '72%', form: '999px' },
                'Author': { popup: '48%', form: '55%' },
                'Location': { popup: '72%', form: '999px' },
                'Taxon': { popup: '808px', form: '60%' },
            },
            '1366': {
                'Interaction': { popup: '97%', form: '71%' },
                'Publication': { popup: '97%', form: '71%' },
                'Citation': { popup: '97%', form: '71%' },
                'Author': { popup: '63%', form: '58%' },
                'Location': { popup: '97%', form: '71%' },
                'Taxon': { popup: '808px', form: '60%' },
        }};
        var wKey = $(window).width() > 1499 ? '1500' : '1366';
        var confg = sizeConfgs[wKey][entity];                                   //console.log("setFormSize [%s] confg = %O", entity, confg);
        $('.form-popup').css({'width': confg.popup});
        $('#form-main').css({'width': confg.form});
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
        var hdrSect = _util.buildElem("header", { "id": "form-hdr", "class":"flex-col" });
        $(hdrSect).append(_util.buildElem("h1", { "text": title }));
        $(hdrSect).append(_util.buildElem("p"));
        return hdrSect;
    }
    /** Returns popup and overlay to their original/default state. */
    function exitFormPopup() {
        hideSearchFormPopup();
        refocusGridIfFormWasSubmitted();
        $("#b-overlay").removeClass("form-ovrly");
        $("#b-overlay-popup").removeClass("form-popup");
        $("#b-overlay-popup").empty();
    }
    /**
     * If the form was not submitted the grid does not reload. Otherwise, if exiting 
     * the edit-forms, the grid will reload with the current focus; or, after creating 
     * an interaction, the grid will refocus into source-view. Exiting the interaction
     * forms also sets the 'int-updated-at' filter to 'today'.
     */
    function refocusGridIfFormWasSubmitted() {                                  //console.log('submitFocus = ', fParams.submitFocus)
        if (!fParams.submitted) { return; }
        if (fParams.submitFocus === 'int') { return refocusAndShowUpdates();}
        eif.search.initSearchGrid(fParams.submitFocus);
    }
    function refocusAndShowUpdates() { 
        var focus  = fParams.action === 'create' ? 'srcs': null;
        eif.search.showUpdates(focus);   
    }
    function getDetailPanelElems(entity, id) {                                  //console.log("getDetailPanelElems. action = %s, entity = %s", fParams.action, fParams.entity)
        var getDetailElemFunc = fParams.action === 'edit' && fParams.entity !== 'interaction' ?
            getSubEntityEditDetailElems : getInteractionDetailElems;
        var cntnr = _util.buildElem("div", { "id": "form-details" });
        var intIdStr = id ? "Id: " + id : '';
        $(cntnr).append(_util.buildElem("h3", { "text": entity + " Details" }));
        $(cntnr).append(_util.buildElem("p", { "text": intIdStr }));
        $(cntnr).append(getDetailElemFunc(entity, id, cntnr));
        return cntnr;
    }
    function getInteractionDetailElems(entity, id, cntnr) {
        return ['pub','cit','loc'].map(function(en){ return initDetailDiv(en)});
    }
    function initDetailDiv(ent) {
        var entities = {'pub': 'Publication', 'cit': 'Citation', 'loc': 'Location'};
        var div = _util.buildElem('div', { 'id': ent+'-det', 'class': 'det-div' });
        $(div).append(_util.buildElem('h5', { 'text': entities[ent]+':' }));        
        $(div).append(_util.buildElem('div', { 'text': 'None selected.' }));
        return div;
    }
    /** Returns the elems that will display the count of references to the entity. */
    function getSubEntityEditDetailElems(entity, id, cntnr) {                   //console.log("getSubEntityEditDetailElems.")
        var refEnts = {
            'Author': [ 'cit', 'int' ],     'Citation': [ 'int' ],
            'Location': [ 'int' ],          'Publication': ['cit', 'int' ],
            'Taxon': [ 'ord', 'fam', 'gen', 'spc', 'int' ],     
        };
        var div = _util.buildElem('div', { 'id': 'det-cnt-cntnr' });
        $(div).append(_util.buildElem('span'));        
        $(div).append(refEnts[entity].map(function(en){ return initCountDiv(en)}));
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
        $('#'+ent+'-det div').empty();
        if (reset) { $('#'+ent+'-det div').append('None selected.') }
    }
    /** Returns a ul with an li for each data property */
    function getDataHtmlString(props) {
        var html = [];
        for (var prop in props) {
            html.push('<li>'+prop+': <b>'+ props[prop]+ '</b></li>');
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
     * > formLevels - An array of the form level names/tags/prefixes/etc.
     * > records - An object of all records, with id keys, for each of the 
     *   root entities- Interaction, Location, Source and Taxa.
     * > submitFocus - Stores the grid-focus for the entity of the most recent 
            form submission. Will be used on form-exit.
     */
    function initFormParams(action, entity, id) {   
        var prevSubmitFocus = fParams.submitFocus;
        fParams = {
            action: action,
            editing: action === "edit" ? { core: id || null, detail: null } : false,
            entity: entity,
            forms: {},
            formLevels: ["top", "sub", "sub2"],
            records: _util.getDataFromStorage(["source", "location", "taxon"]),
            submitFocus: prevSubmitFocus || false
        };
        initFormLevelParamsObj(entity, "top", null, getFormConfg(entity), action); console.log("####fPs = %O", fParams)
    }
    /**
     * Adds the properties and confg that will be used throughout the code for 
     * generating, validating, and submitting sub-form. 
     * -- Property descriptions:
     * > action - eg, Create, Edit.
     * > confg - The form config object used during form building.
     * > entity - Name of this form's entity.
     * > exitHandler - Form exit handler or noOp.
     * > pSelId - The id of the parent select of the form.
     * > reqElems - All required elements in the form.
     * > selElems - Contains all selElems until they are initialized with selectize.
     */
    function initFormLevelParamsObj(entity, level, pSel, formConfg, action) {   //console.log("initLvlParams. fP = %O, arguments = %O", fParams, arguments)
        fParams.forms[entity] = level;
        fParams.forms[level] = {
            action: action,
            confg: formConfg,
            entity: entity,
            exitHandler: getFormExitHandler(formConfg, action),
            pSelId: pSel,
            reqElems: [],
            selElems: [], 
        };                                                                      //console.log("formLvl params = %O", fParams.forms[level]);
    }
    /**
     * Returns the exitHandler stored in the form confg for the current action, or, 
     * if no handler is stored, edit forms have a default of @showEditSuccessMsg
     * and create forms default to noOp.
     */
    function getFormExitHandler(confg, action) {  
        return confg.exitHandler && confg.exitHandler[action] ? 
            confg.exitHandler[action] :
            action === 'edit' ? 
                showEditSuccessMsg : Function.prototype;
    }
/*------------------- Form Functions -------------------------------------------------------------*/
/*--------------------------- Edit Form --------------------------------------*/
    /** Shows the entity's edit form in a pop-up window on the search page. */
    function editEntity(id, entity) {                                           console.log("Editing [%s] [%s]", entity, id);  
        initFormParams("edit", entity, id);
        showFormPopup('Editing', _util.ucfirst(entity), id);
        initEditForm(id, entity);    
    }
    /** Inits the edit top-form, filled with all existing data for the record. */
    function initEditForm(id, entity) {                                         //console.log("initEditForm");
        var form = buildFormElem();  
        var formFields = getFormFields(id, entity);
        $(form).append(formFields);
        $('#form-main').append(form);     
        if (entity === "interaction") { finishIntFormBuild(); 
        } else if (entity === "taxon") { finishTaxonEditFormBuild();
        } else {
            initComboboxes(entity); 
            $('#top-cancel').unbind('click').click(exitFormPopup);
        }
        fillExistingData(entity, id);
    }   
    /** Returns the form fields for the passed entity.  */
    function getFormFields(id, entity) {
        var edges = { "interaction": getIntFormFields, "taxon": getTaxonEditFields };
        var hndlr = entity in edges ? edges[entity] : buildEditFormFields;  
        var fields = hndlr(entity, id);                                         //console.log("fields = %O, hndlr = %O", fields, hndlr);     
        return fields;
    }   
    function getIntFormFields(entity, id) {
        return buildIntFormFields('edit');
    }
    /** Returns the passed entity's form fields. */
    function buildEditFormFields(entity) {
        var fields =  buildSubForm(entity, {}, "top", null, "edit");                            
        return fields.concat(buildFormBttns(_util.ucfirst(entity), "top", "edit"));
    }
    /*------------------- Fills Edit Form Fields -----------------------------*/
    /** Fills form with existing data for the entity being edited. */
    function fillExistingData(entity, id) {
        addDisplayNameToForm(entity, id);
        fillEntityData(entity, id); 
        if (ifRequiredFieldsFilled('top')) { enableSubmitBttn('#top-submit'); }
    }
    function addDisplayNameToForm(ent, id) {
        if (ent === 'interaction') { return; }
        var prnt = getParentEntity(ent);
        var entity = prnt || ent;
        var rcrd = getEntityRecord(entity, id);                                 
        $('#form-hdr h1')[0].innerText += ': ' + rcrd.displayName; 
        $('#det-cnt-cntnr span')[0].innerText = rcrd.displayName + ' is referenced by:';
    }
    function fillEntityData(entity, id) {
        var hndlrs = { "author": fillSrcData, "citation": fillSrcData,
            "location": fillLocData, "publication": fillSrcData, 
            "publisher": fillSrcData, "taxon": fillTaxonData, 
            "interaction": fillIntData };
        var rcrd = getEntityRecord(entity, id);                                 //console.log("fillEntityData [%s] [%s] = %O", entity, id, rcrd);
        hndlrs[entity](entity, id, rcrd);
    }
    function fillIntData(entity, id, rcrd) {
        var fields = {
            "InteractionType": "select", "Location": "select", "Note": "textArea", 
            "Object": "taxon", "Source": "source", "Subject": "taxon", 
            "InteractionTags": "tags" };
        fillFields(rcrd, fields, []);
    }
    function fillLocData(entity, id, rcrd) {
        var fields = getCoreFieldDefs(entity);
        delete fields.Country;
        fields["locCountry"] = "cntry";
        fillFields(rcrd, fields, []);
        addDataToCntDetailPanel({ 'int': rcrd.interactions.length });
    }
    function fillTaxonData(entity, id, rcrd) {                                  //console.log('fillTaxonData. rcrd = %O', rcrd)
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
        $.each($('[id$="-det"] div'), function(i, elem) {
            if (elem.innerText == 0) {  elem.parentElement.remove(); }
        });
    }
    function fillSrcData(entity, id, rcrd) {
        var src = getEntityRecord("source", id);
        var detail = getEntityRecord(entity, src[entity]);                      //console.log("fillSrcData [%s] src = %O,[%s] = %O", id, src, entity, detail);
        setSrcData();
        fParams.editing.detail = detail.id;

        function setSrcData() {
            var fields = getSourceFields(entity);
            fillFields(src, fields.core, fields.detail.exclude);
            fillFields(detail, fields.detail.add, []);
            setAdditionalFields(entity, src, detail);
            fillEditSrcDetails(entity, src);
        }
    } /* End fillSrcData */
    function getSourceFields(entity) {
        return { core: getCoreFieldDefs(entity), detail: getFormConfg(entity) };
    }
    /** Adds a count of all refences to the entity to the form's detail-panel. */
    function fillEditSrcDetails(entity, srcRcrd) {                              //console.log('fillEditSrcDetails. [%s]. srcRcrd = %O', entity, srcRcrd);
        var refObj = { 'int': getSrcIntCnt(entity, srcRcrd) };
        addAddtionalRefs();                                                     //console.log('refObj = %O', refObj);
        addDataToCntDetailPanel(refObj);

        function addAddtionalRefs() {
            if (entity === 'citation') { return; }
            refObj.cit = srcRcrd.children.length || srcRcrd.contributions.length;
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
    function fillFields(rcrd, fields, excluded) {
        var fieldHndlrs = {
            "text": setTextField, "textArea": setTextArea, "select": setSelect, 
            "fullTextArea": setTextField, "multiSelect": Function.prototype,
            "tags": setTagField, "cntry": setCntry, "source": addSource, 
            "taxon": addTaxon
        };
        for (var field in fields) {  
            if (excluded.indexOf(field) !== -1) { continue; }                   //console.log("field [%s] type = [%s] fields = [%O] fieldHndlr = %O", field, fields[field], fields, fieldHndlrs[fields[field]]);
            addDataToField(field, fieldHndlrs[fields[field]], rcrd);
        }
    }
    function addDataToField(field, fieldHndlr, rcrd) {                          //console.log("addDataToField [%s] [%0] rcrd = %O", field, fieldHndlr, rcrd);
        var elemId = field.split(' ').join('');
        var prop = _util.lcfirst(elemId);
        fieldHndlr(elemId, prop, rcrd);
    }
    function setTextField(fieldId, prop, rcrd) {                                //console.log("setTextField [%s] [%s] rcrd = %O", fieldId, prop, rcrd);
        $('#'+fieldId+'_row input[type="text"]').val(rcrd[prop]);
    }
    function setTextArea(fieldId, prop, rcrd) {
        $('#'+fieldId+'_row textarea').val(rcrd[prop]);   
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
        $('#locCountry-sel')[0].selectize.addItem(rcrd.country.id);
    }
    function setAdditionalFields(entity, srcRcrd, detail) {
        setTitleField(entity, srcRcrd);
        setPublisherField(entity, srcRcrd);
        setCitationFullText(entity, detail);
        addAuthors(entity, srcRcrd);
    }
    function setTitleField(entity, srcRcrd) {                                   //console.log("setTitleField [%s] rcrd = %O", entity, srcRcrd)
        if (["publication", "citation"].indexOf(entity) !== -1) {
            $('#Title_row input[type="text"]').val(srcRcrd.displayName);
        }
    }
    function setPublisherField(entity, srcRcrd) {
        if (entity !== 'publication') { return; }
        setSelect("Publisher", "parent", srcRcrd);
    }
    function setCitationFullText(entity, citRcrd) {  
        if (entity !== 'citation') { return; }
        $('#CitationText_row textarea')[0].innerText = citRcrd.fullText;
    }
    function addAuthors(entity, srcRcrd) {
        var cnt = 0;
        if (["publication", "citation"].indexOf(entity) !== -1) {
            srcRcrd.contributors.forEach(function(authId) {
                selectAuthor(cnt++, authId)
            });
        }
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
    function createEntity(id, entity) {                                         console.log('Editing [%s] [%s]', entity, id);  
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
        var form = buildFormElem();
        var formFields = buildIntFormFields('create');                          //console.log("formFields = %O", formFields);
        $(form).append(formFields);
        $('#form-main').append(form);      
        finishIntFormBuild();
        finishCreateFormBuild();
    }      
    function finishCreateFormBuild() {
        focusCombobox('#Publication-sel');
        enableCombobox('#CitationTitle-sel', false);
    }
/*------------------- Shared Interaction Form Methods ------------------------*/
    /**
     * Inits the selectize comboboxes, adds/modifies event listeners, and adds 
     * required field elems to the form's config object.  
     */
    function finishIntFormBuild() {
        initComboboxes("interaction");
        ['Subject', 'Object'].forEach(addTaxonFocusListener);
        $('#top-cancel').unbind('click').click(exitFormPopup);
        $('#Note_row label')[0].innerText += 's';
        addReqElemsToConfg();     
    }
    /** Displays the [Role] Taxon select form when the field gains focus. */ 
    function addTaxonFocusListener(role) {
        var func = { 'Subject': initSubjectSelect, 'Object': initObjectSelect };
        $(document).on('focus', '#'+role+'-sel + div div.selectize-input', func[role]);
    }
    function addReqElemsToConfg() {
        var reqFields = ["Publication", "CitationTitle", "Subject", "Object", 
            "InteractionType"];
        fParams.forms.top.reqElems = reqFields.map(function(field) {
            return $('#'+field+'-sel')[0];
        });
    }
/*-------------- Form Builders -------------------------------------------------------------------*/
    /** Builds and returns all interaction-form elements. */
    function buildIntFormFields(action) {
        var fieldBuilders = [ buildPubFieldRow, buildCitFieldRow, buildCountryFieldRow,
            buildLocationFieldRow, initSubjectField, initObjectField, buildIntTypeField,
            buildIntTagField, buildIntNoteField ]; 
        var fields = fieldBuilders.map(buildField);
        return fields.concat(buildFormBttns("Interaction", "top", action));
    }
    function buildField(builder) {
        var field = builder();                                                  //console.log("field = %O", field);
        var fieldType = field.children[1].children[1].nodeName; 
        if (fieldType === "SELECT") { addSelElemToInitAry(field); }
        return field;
    }
    /** Select elems with be initialized into multi-functional comboboxes. */
    function addSelElemToInitAry(field) {
        var fieldName = field.id.split('_row')[0];
        fParams.forms.top.selElems.push(fieldName);
    }
    /*-------------- Publication ---------------------------------------------*/
    /**
     * Returns a form row with a publication select dropdown populated with all 
     * current publication titles.
     */
    function buildPubFieldRow() {
        var selElem;
        var pubIds = _util.getDataFromStorage("pubSources");
        var opts = getRcrdOpts(pubIds, fParams.records.source);
        selElem = _util.buildSelectElem(opts, {id: "Publication-sel", class: "lrg-field"});
        return buildFormRow("Publication", selElem, "top", true);
    }
    /** When a publication is selected fill citation dropdown @fillCitationField.  */
    function onPubSelection(val) { 
        if (val === "" || isNaN(parseInt(val)) ) { return onPubClear(); }                                
        fillCitationField(val);
        fillPubDetailPanel(val);
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
    function initPubForm(val) {                                                 //console.log("Adding new pub! val = %s", val);
        var formLvl = getSubFormLvl("sub");
        if ($('#'+formLvl+'-form').length !== 0) { return openSubFormErr('Publication', null, formLvl); }
        $('#CitationTitle_row').after(initSubForm(
            "publication", formLvl, "flex-row med-form", {"Title": val}, "#Publication-sel"));
        initComboboxes("publication");
        $('#Title_row input').focus();
        return { "value": "", "text": "Creating Publication..." };
    }
    /*-------------- Citation ------------------------------------------------*/
    /** Returns a form row with an empty citation select dropdown. */
    function buildCitFieldRow() {
        var selElem = _util.buildSelectElem([], {id: "CitationTitle-sel", class: "lrg-field"});
        return buildFormRow("Citation Title", selElem, "top", true);
    }
    /** Fills the citation combobox with all citations for the selected publication. */
    function fillCitationField(pubId) {                                         //console.log("initCitSelect for publication = ", pubId);
        enableCombobox('#CitationTitle-sel');
        updateComboboxOptions('#CitationTitle-sel', getPubCitationOpts(pubId));
    }
    /** Returns an array of option objects with citations for this publication.  */
    function getPubCitationOpts(pubId) {
        var pubRcrd = fParams.records.source[pubId];  
        if (!pubRcrd) { return []; }
        return getRcrdOpts(pubRcrd.children, fParams.records.source);
    }
    /** 
     * When a Citation is selected, both 'top' location fields are initialized
     * and the publication combobox is reenabled. 
     */    
    function onCitSelection(val) {  
        if (val === "" || isNaN(parseInt(val))) { return emptySidePanel('cit', true); }                     //console.log("cit selection = ", parseInt(val));                          
        fillCitDetailPanel(val);
        if (!fParams.editing) { $('#CitationTitle_pin').focus(); }
    }    
    /** Displays the selected citation's data in the side detail panel. */
    function fillCitDetailPanel(id) {  
        var srcRcrd = fParams.records.source[id];  
        var propObj = getCitDetailDataObj(srcRcrd);
        addDataToIntDetailPanel('cit', propObj);
    }
    /** Returns an object with selected citation's data. */
    function getCitDetailDataObj(srcRcrd) {  
        var citRcrd = getEntityRecord('citation', srcRcrd.citation);            //console.log("srcRcrd = %O, citRcrd = %O", srcRcrd, citRcrd);
        return {
            'Title': citRcrd.title, 
            'Full Text': srcRcrd.description || '',            
            'Abstract': citRcrd.abstract || '',            
            'Citation Type': citRcrd.citationType ? citRcrd.citationType.displayName : '', 
            'Publication Vol': citRcrd.publicationVolume || '',            
            'Publication Issue': citRcrd.publicationIssue || '',            
            'Publication Pages': citRcrd.publicationPages || '',            
            'Tags': getTags(srcRcrd),
            'Authors': getAuthorNames(srcRcrd),
        };
    }
    function getTags(srcRcrd) {
        var str = [];
        if (srcRcrd.tags.length) {
            srcRcrd.tags.forEach(function(tag) { str.push(tag.displayName); });
        }
        return str.join(', ');
    }
    /** Shows the Citation sub-form and disables the publication combobox. */
    function initCitForm(val) {                                                 //console.log("Adding new cit! val = %s", val);
        var formLvl = getSubFormLvl("sub");
        if ($('#'+formLvl+'-form').length !== 0) { return openSubFormErr('CitationTitle', '#CitationTitle-sel', formLvl); }
        $('#CitationTitle_row').after(initSubForm(
            "citation", formLvl, "flex-row med-form", {"Title": val}, "#CitationTitle-sel"));
        initComboboxes("citation");
        enableCombobox('#Publication-sel', false);
        addExistingPubContribs();
        $('#CitationText_row textarea').focus();
        return { "value": "", "text": "Creating Citation..." };
    }
    /**
     * If the parent publication has existing contributors, add them to the new 
     * citation form's author field(s). 
     */
    function addExistingPubContribs(val) {  
        var pubRcrd = fParams.records.source[$('#Publication-sel').val()];      //console.log('pubRcrd = %O', pubRcrd) 
        if (pubRcrd.contributors.length > 0) {
            selectExistingAuthors(pubRcrd.contributors);
        }
    }
    /** Loops through author array and selects each author in the form */ 
    function selectExistingAuthors(authAry) {
        $.each(authAry, function(i, authId) {  
            selectAuthor(i, authId);
        });
    }
    /** Select the passed author and builds a new, empty author combobox. */
    function selectAuthor(cnt, authId) {
        var selId = '#Authors-sel'+ ++cnt;
        $(selId)[0].selectize.addItem(authId, true);
        buildNewAuthorSelect(++cnt, authId);
    }
    /** When the Citation sub-form is exited, the Publication combo is reenabled. */
    function enablePubField() {
        enableCombobox('#Publication-sel');
    }
    /*-------------- Country -------------------------------------------------*/
    /** Returns a form row with a country combobox populated with all countries. */
    function buildCountryFieldRow() {  
        var cntryOpts = getCntryOpts();                                         //console.log("buildingCountryFieldRow. ");
        var selElem = _util.buildSelectElem(
            cntryOpts, {id: "Country-sel", class: "lrg-field"});
        return buildFormRow("Country", selElem, "top", false);
    }
    /**
     * Adds an 'Unspecified' option with its region's id. This will populate the 
     * location drop-down with all habitat locations on selection.
     */ 
    function getCntryOpts() {
        var opts = getOptsFromStoredData("countryNames");                       
        opts.push({ value: 439, text: 'Unspecified' });
        return opts;
    }
    /** 
     * When a country is selected, the location dropdown is repopulated with it's 
     * child-locations. When cleared, the combobox is repopulated with all locations. 
     */
    function onCntrySelection(val) {                                            //console.log("country selected 'val' = ", val);
        if (val === "" || isNaN(parseInt(val))) { return fillLocationSelect(null); }          
        fillLocationSelect(fParams.records.location[val]);
        if (!fParams.editing) { $('#Country_pin').focus(); }
    }
    /*-------------- Location ------------------------------------------------*/
    /**
     * Returns a form row with a country select dropdown populated with all 
     * available countries.
     */
    function buildLocationFieldRow() {                                          //console.log("buildingLocationFieldRow. ");
        var locOpts = getLocationOpts();                                        //console.log("locOpts = %O", locOpts);
        var selElem = _util.buildSelectElem(
            locOpts, {id: "Location-sel", class: "lrg-field"});
        return buildFormRow("Location", selElem, "top", false);
    }
    /** Returns an array of option objects with all unique locations.  */
    function getLocationOpts() {
        var opts = [];
        for (var id in fParams.records.location) {
            opts.push({ 
                value: id, text: fParams.records.location[id].displayName });
        }
        return opts;
    }
    /**
     * When a country is selected, the location combobox is repopulated with its 
     * child-locations. When cleared, the combobox is repopulated with all locations. 
     */ 
    function fillLocationSelect(cntry) {                                        //console.log("fillLocationSelect for cntry = %O", cntry);
        var opts = cntry ? getChildLocOpts(cntry) : getLocationOpts();    
        updateComboboxOptions('#Location-sel', opts);
    }          
    /** Returns an array of options for the child-locations of the passed country. */
    function getChildLocOpts(cntry) {
        return cntry.children.map(function(id) {  
            return { value: id, text: fParams.records.location[id].displayName };
        });
    }
    /** 
     * When a location is selected, its country is selected in the country combobox, 
     * which is then disabled. If the location was cleared, the country combobox
     * is restored. Note: habitat locations select the 'unspecified', 439, country option.. 
     */
    function onLocSelection(val) {                                              //console.log("location selected 'val' = ", val);
        if (val === "" || isNaN(parseInt(val))) { return emptySidePanel('loc', true); }          
        var locRcrd = fParams.records.location[val];                            //console.log("location = %O", locRcrd);
        var cntryValue = locRcrd.country ? locRcrd.country.id : 439;
        $('#Country-sel')[0].selectize.addItem(cntryValue, true);
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
        return {
            'Name': locRcrd.displayName, 
            'Description': locRcrd.description || '',            
            'Habitat Type': locRcrd.habitatType ? locRcrd.habitatType.displayName : '', 
            'Latitude': locRcrd.latitude || '',
            'Longitude': locRcrd.longitude || '',
            'Elevation': locRcrd.elevation || '',            
            'Elevation Max': locRcrd.elevationMax || '',            
            // 'Elevation Units': locRcrd.elevUnitAbbrv || '',            
        };
    }
    /** Inits the location form and disables the country combobox. */
    function initLocForm(val) {                                                 //console.log("Adding new loc! val = %s", val);
        var formLvl = getSubFormLvl("sub");
        if ($('#'+formLvl+'-form').length !== 0) { return openSubFormErr('Location', null, formLvl); }
        $('#Location_row').after(initSubForm(
            "location", formLvl, "flex-row med-form", {"Display Name": val}, "#Location-sel"));
        initComboboxes("location");
        enableCombobox('#Country-sel', false);
        $('#DisplayName_row input').focus();
        enableSubmitBttn("#"+formLvl+"-submit");
        return { "value": "", "text": "Creating Location..." };
    }
    /** When the Location sub-form is exited, the Country combo is reenabled. */
    function enableCountryField() {  
        enableCombobox('#Country-sel');
    }
    /*-------------- Taxon ---------------------------------------------------*/
    /** Builds the Subject combobox that will trigger the select form @initSubjectSelect. */
    function initSubjectField() {
        var subjElem = _util.buildSelectElem([], {id: "Subject-sel", class: "lrg-field"});
        return buildFormRow("Subject", subjElem, "top", true);
    }
    /** Builds the Object combobox that will trigger the select form @initObjectSelect. */
    function initObjectField() {
        var objElem =  _util.buildSelectElem([], {id: "Object-sel", class: "lrg-field"});
        return buildFormRow("Object", objElem, "top", true);
    }
    /**
     * Shows a sub-form to 'Select Subject' of the interaction with a combobox for
     * each level present in the Bat realm, (Family, Genus, and Species), filled 
     * with the taxa at that level. When one is selected, the remaining boxes
     * are repopulated with related taxa and the 'select' button is enabled.
     */
    function initSubjectSelect() {                                              //console.log("initSubjectSelect val = %O", $('#Subject-sel').val())
        var formLvl = getSubFormLvl("sub");
        if ($('#'+formLvl+'-form').length !== 0) { return errIfAnotherSubFormOpen('Subject', formLvl); }  
        setTaxonParams('Subject', 2);
        $('#Subject_row').append(initSubForm(
            "subject", formLvl, "sml-left sml-form", {}, "#Subject-sel"));
        initComboboxes("subject");           
        finishTaxonSelectUi("Subject");  
        enableCombobox('#Object-sel', false);
    }
    /**
     * Shows a sub-form to 'Select Object' of the interaction with a combobox for
     * each level present in the selected Object realm, plant (default) or arthropod, 
     * filled with the taxa at that level. When one is selected, the remaining boxes
     * are repopulated with related taxa and the 'select' button is enabled. 
     * Note: The selected realm's level combos are built @onRealmSelection. 
     */
    function initObjectSelect() {                                               //console.log("initObjectSelect val = %O", $('#Object-sel').val())
        var formLvl = getSubFormLvl("sub");
        if ($('#'+formLvl+'-form').length !== 0) { return errIfAnotherSubFormOpen('Object', formLvl); }
        var id = getSelectedRealm($('#Object-sel').val()) || fParams.taxon ? 
            fParams.taxon.objectRealm || 3 : 3;
        setTaxonParams('Object', id);
        $('#Object_row').append(initSubForm(
            "object", formLvl, "sml-right sml-form", {}, "#Object-sel"));
        initComboboxes("object");             
        $('#Realm-sel')[0].selectize.addItem(fParams.taxon.realmId);
        enableCombobox('#Subject-sel', false);
    }
    /** 
     * Returns the realm taxon's id for a selected object taxon. Note: realm ids
     * are one less than their taxon's id. 
     */
    function getSelectedRealm(selVal) {
        if (!selVal) { return null; }
        var taxon = fParams.records.taxon[selVal];  
        return taxon.domain.id + 1;
    }
    /** Note: Taxon fields often fire their focus event twice. */
    function errIfAnotherSubFormOpen(role, formLvl) {
        if (fParams.forms[formLvl].entity === _util.lcfirst(role)) {return;}
        openSubFormErr(role, null, formLvl);
    }
    /**
     * When complete, the 'Select Subject' form is removed and the most specific 
     * taxonomic data is displayed in the interaction-form Subject combobox. 
     */
    function onSubjectSelection(val) {                                          //console.log("subject selected = ", val);
        if (val === "" || isNaN(parseInt(val))) { return; }         
        var formLvl = getSubFormLvl("sub");
        $('#'+formLvl+'-form').remove();
        enableObjField();
        if (!fParams.editing) { $('#Subject_pin').focus(); }
    }
    /**
     * When complete, the 'Select Object' form is removed and the most specific 
     * taxonomic data is displayed in the interaction-form Object combobox. 
     */
    function onObjectSelection(val) {                                           //console.log("object selected = ", val);
        if (val === "" || isNaN(parseInt(val))) { return; } 
        var formLvl = getSubFormLvl("sub");
        $('#'+formLvl+'-form').remove();
        enableSubjField();
        if (!fParams.editing) { $('#Object_pin').focus(); }
    }
    /** When the Subject select-form is exited, the combo is reenabled. */
    function enableSubjField() {
        enableCombobox('#Subject-sel');
    }
    /** When the Object select-form is exited, the combo is reenabled. */
    function enableObjField() { 
        enableCombobox('#Object-sel');
    }
    /** Adds the realm name and id, along with all taxon levels, to fParams. */
    function setTaxonParams(role, id) {  
        initTaxonParams(id);
        fParams.taxon.prevSel = !$('#'+role+'-sel').val() ? null : 
            { val: $('#'+role+'-sel').val(),
              text: $('#'+role+'-sel')[0].selectize.getItem($('#'+role+'-sel').val())[0].innerText
            }; 
    }
    function initTaxonParams(id) {
        var realmMap = { 2: "Bat", 3: "Plant", 4: "Arthropod" };
        var domainLvls = {
            'Bat': ["Order", "Family", "Genus", "Species"],
            'Arthropod': ["Phylum", "Class", "Order", "Family", "Genus", "Species"],
            'Plant': ["Kingdom", "Family", "Genus", "Species"]
        };
        fParams.taxon = { 
            realm: realmMap[id], 
            realmId: id,
            lvls: ["Kingdom", "Phylum", "Class", "Order", "Family", "Genus", "Species"],
            domainLvls: domainLvls[realmMap[id]]
        };                                                                      //console.log('taxon params = %O', fParams.taxon)
    }
    /**
     * Customizes the taxon-select form ui. Either re-sets the existing taxon selection
     * or brings the first level-combo into focus. Clears the [role]'s' combobox. 
     */
    function finishTaxonSelectUi(role) {
        var formLvl = getSubFormLvl("sub");
        var selCntnr = role === "Subject" ? "#"+formLvl+"-form" : "#realm-lvls";
        customizeElemsForTaxonSelectForm(role);
        if (!$('#'+role+'-sel').val()) { focusFirstCombobox(selCntnr);   
        } else { onLevelSelection($('#'+role+'-sel').val()); }
        updateComboboxOptions('#'+role+'-sel', []);
    }
    /** Shows a New Taxon form with the only field, displayName, filled and ready to submit. */
    function initTaxonForm(val) { 
        var selLvl = this.$control_input[0].id.split("-sel-selectize")[0]; 
        var formLvl = fParams.taxon.prntSubFormLvl || getSubFormLvl("sub2"); 
        if (selLvl === "Species" && !$('#Genus-sel').val()) {
            return formInitErr(selLvl, "noGenus", formLvl);
        }
        enableTxnCombos(false);
        return showNewTaxonForm(val, selLvl, formLvl);
    } 
    function enableTxnCombos(enable) {
        $.each($('#sub-form select'), function(i, sel){
            return enable ? $(sel)[0].selectize.enable() : $(sel)[0].selectize.disable();
        });
    }
    function showNewTaxonForm(val, selLvl, formLvl) {                           //console.log("showNewTaxonForm. val, selVal, formLvl = %O", arguments)
        fParams.taxon.formTaxonLvl = selLvl;
        buildTaxonForm();
        return { "value": "", "text": "Creating "+selLvl+"..." };

        function buildTaxonForm() {
            $('#'+selLvl+'_row').append(initSubForm(
                "taxon", formLvl, "sml-form", {"Display Name": val}, "#"+selLvl+"-sel"));
            enableSubmitBttn("#"+formLvl+"-submit");
            $('#'+formLvl+'-hdr')[0].innerText += ' '+ selLvl;
        }
    }  /* End showTaxonForm */
    function onTaxonCreateFormExit() {
        enableTxnCombos(true);
    }
    /**
     * Removes any previous realm comboboxes. Shows a combobox for each level present 
     * in the selected Taxon realm, plant (default) or arthropod, filled with the 
     * taxa at that level. 
     */
    function onRealmSelection(val) {                                            //console.log("onRealmSelection. val = ", val)
        if (val === "" || isNaN(parseInt(val))) { return; }          
        if ($('#realm-lvls').length) { $('#realm-lvls').remove(); }  
        var realms = { 3: "plant", 4: "arthropod" };
        setTaxonParams('Object', val);
        fParams.taxon.objectRealm = val;
        buildAndAppendRealmElems(realms[val]);
        initComboboxes(realms[val]);  
        finishTaxonSelectUi("Object");          
    }
    /**
     * Builds a combobox for each level present in the selected Taxon realm filled 
     * with the taxa at that level. 
     */
    function buildAndAppendRealmElems(realm) {
        var formLvl = getSubFormLvl("sub2");
        var realmElems = _util.buildElem("div", { id: "realm-lvls" });
        $(realmElems).append(buildSubForm(realm, {}, formLvl, null));
        $('#Realm_row').append(realmElems);
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
        if (fParams.taxon.prevSel) {
            updateComboboxOptions('#'+role+'-sel', { 
                value: fParams.taxon.prevSel.val, text: fParams.taxon.prevSel.text });
            $('#'+role+'-sel')[0].selectize.addItem(fParams.taxon.prevSel.val);
        }
    }
    /** Removes and replaces the taxon form. */
    function resetTaxonSelectForm() {                                           
        var initForm = fParams.taxon.realm === 'Bat' ? initSubjectSelect : initObjectSelect;
        $('#sub-form').remove();
        initForm();
    }
    /** Adds the selected taxon to the interaction-form's [role]-taxon combobox. */
    function selectTaxon() {
        var role = fParams.taxon.realm === 'Bat' ? 'Subject' : 'Object';
        var selApi = $('#'+role+'-sel')[0].selectize;
        var opt = getSelectedTaxonOption();
        $('#sub-form').remove();
        updateComboboxOptions('#'+role+'-sel', opt);
        selApi.addItem(opt.value);
        selApi.enable();
    }
    /** Returns an option object for the most specific taxon selected. */
    function getSelectedTaxonOption() {
        var taxon = getSelectedTaxon();                                         //console.log("selected Taxon = %O", taxon);
        return { value: taxon.id, text: getTaxonDisplayName(taxon) };
    }
    function getTaxonDisplayName(taxon) { 
        return taxon.level.id === 7 ? 
            taxon.displayName : taxon.level.displayName +' '+ taxon.displayName;
    }
    /** Finds the most specific level with a selection and returns that taxon record. */
    function getSelectedTaxon() {
        var selElems = $('#sub-form .selectized').toArray().reverse(); 
        var selected = selElems.find(isSelectedTaxon);                          //console.log("getSelectedTaxon. selElems = %O selected = %O", selElems, selected);
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
    function onLevelSelection(val) {                                            //console.log("onLevelSelection. val = [%s] isNaN?", val, isNaN(parseInt(val)))
        if (val === "" || isNaN(parseInt(val))) { return syncTaxonCombos(this.$input[0]); } 
        var formLvl = getSubFormLvl("sub");
        fParams.taxon.recentChange = true;  // Flag used to filter out the second change event
        repopulateCombosWithRelatedTaxa(val);
        enableSubmitBttn('#'+formLvl+'-submit');             
    }
    function syncTaxonCombos(elem) {                                            //console.log("syncTaxonCombos. elem = %O", elem)
        if (fParams.taxon.recentChange) { return captureSecondFire(); }
        resetChildLevelCombos(elem.id.split('-sel')[0]);
    }
    /*
     * Note: There is a closed issue for the library (#84) that seems to address
     * this second change-event fire, but it is still an issue here. Instead of figuring 
     * out the cause, this method captures that event and filters it out.
     */
    function captureSecondFire() {                                              //console.log("Capturing second fire.")
        delete fParams.taxon.recentChange;
    }
    function resetChildLevelCombos(lvlName) {
        repopulateLevelCombos(getChildlevelOpts(lvlName), {});
    }
    function getChildlevelOpts(lvlName) {  
        var opts = {};
        var lvls = fParams.taxon.lvls;
        var lvlIdx = lvls.indexOf(lvlName);
        for (var i = lvlIdx+1; i < 8; i++) { 
            opts[i] = getTaxonOpts(lvls[i-1]);                    
        }                                                                       //console.log("getChildlevelOpts. opts = %O", opts);
        return opts;
    }
    /**
     * Repopulates the comboboxes of child levels when a taxon is selected. Selected
     * and ancestor levels are populated with all taxa at the level and the direct 
     * ancestors selected. Child levels populate with only decendant taxa and
     * have no initial selection.
     */
    function repopulateCombosWithRelatedTaxa(selId) {
        var opts = {}, selected = {};                                           //console.log("repopulateCombosWithRelatedTaxa. opts = %O, selected = %O", opts, selected);
        var taxon = fParams.records.taxon[selId];
        repopulateTaxonCombos();

        function repopulateTaxonCombos() {
            taxon.children.forEach(addRelatedChild);                                
            getSiblingAndAncestorTaxaOpts(taxon);
            buildOptsForEmptyLevels(taxon.level.id);
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
            if (!opts[level]) { opts[level] = []; }                             //console.log("setting lvl = ", taxon.level)
            opts[level].push({ value: taxon.id, text: taxon.displayName });                                   
        }
        /**
         * Builds the opts for each level without taxa related to the selected taxon.
         * Ancestor levels are populated with all taxa at the level and will have 
         * the 'none' value selected.
         */
        function buildOptsForEmptyLevels(selLvl) {
            var lvls = fParams.taxon.lvls;  
            var topLvl = fParams.taxon.realm === "Arthropod" ? 3 : 5; 
            for (var i = 7; i >= topLvl; i--) {
                if (opts[i]) { continue; }
                opts[i] = [{ value: "", text: "None" }];                    
                if (i < selLvl) {  
                    opts[i] = opts[i].concat(getTaxonOpts(lvls[i-1]));                    
                    selected[i] = "";
                }
            }
        }
    } /* End fillAncestorTaxa */    
    function repopulateLevelCombos(optsObj, selected) {
        var lvls = fParams.taxon.lvls;  
        for (var lvl in optsObj) {                                              //console.log("lvl = %s, name = ", lvl, lvls[lvl-1])
            repopulateLevelCombo(optsObj[lvl], lvls[lvl-1], lvl, selected);
        }
    }
    /**
     * Replaces the options for the level combo. Selects the selected taxon and 
     * its direct ancestors.
     */
    function repopulateLevelCombo(opts, lvlName, lvl, selected) {               //console.log("repopulateLevelCombo for lvl = %s (%s)", lvl, lvlName)
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
        var taxon = fParams.records.taxon[id];  
        initTaxonParams(taxon.domain.id+1);                
        return buildTaxonEditFields(taxon);
    }
    function finishTaxonEditFormBuild() {
        $('#top-cancel').off('click').click(exitFormPopup);
        $('#top-submit').off('click').click(submitTaxonEdit);
        initTaxonEditCombo('txn-lvl', checkForTaxonLvlErrs); 
    }
    function buildTaxonEditFields(taxon) {
        var prntElems = getPrntTaxonElems(taxon);
        var taxonElems = getEditTaxonFields(taxon);
        return prntElems.concat(taxonElems, buildFormBttns('Taxon', 'top', 'edit'));
    }
    function getPrntTaxonElems(taxon) {                                         //console.log("getPrntTaxonElems for %O", taxon);
        var prnt = fParams.records.taxon[taxon.parent]; 
        var elems = [ buildNameElem(prnt), buildEditPrntBttn(prnt) ];
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
    function getEditTaxonFields(taxon) {                                        //console.log("getEditTaxonFields for [%s]", taxon.displayName);
        var input = _util.buildElem('input', { id: 'txn-name', type: 'text', value: taxon.displayName });
        var lvlSel = getlvlSel(taxon, 'top');
        $(lvlSel).data('txn', taxon.id).data('lvl', taxon.level.id);
        return [buildTaxonEditFormRow('Taxon', [lvlSel, input], 'top')];
    }
    function getlvlSel(taxon, formLvl) {
        var opts = getTaxonLvlOpts(taxon); 
        var sel = _util.buildSelectElem(opts, { id: 'txn-lvl' });
        $(sel).data('toSel', taxon.level.id);
        return sel;
    }
    /** Returns an array of options for the levels in the taxon's domain. */
    function getTaxonLvlOpts(taxon) {
        var domainLvls = fParams.taxon.domainLvls.map(function(lvl){return lvl;});
        var lvls = _util.getDataFromStorage('levelNames');  
        domainLvls.shift();  //Removes the domain-level
        for (var name in lvls) {
            if (domainLvls.indexOf(name) === -1) { delete lvls[name]; }
        }
        return buildOptsObj(lvls, Object.keys(lvls));
    }
    /**
     * Returns a level select with all levels in the taxon-parent's domain and a 
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
        var bttns = [buildFormBttns("Parent", "sub", "edit")];
        var fields = getParentEditFields(prnt);
        return hdr.concat(fields, bttns);
    }
    function buildEditParentHdr() {
        var hdr = _util.buildElem("h3", { text: "Select New Taxon Parent", id:'sub-form-hdr' });
        return hdr;
    }
    function getParentEditFields(prnt) {  
        var domain = _util.lcfirst(prnt.domain.displayName);      
        var lvlSelRows = buildSubForm(domain, {}, 'sub', null, 'edit');
        var domainSelRow = getDomainLvlRow(prnt);
        fParams.taxon.prntSubFormLvl = 'sub2';
        return domainSelRow.concat(lvlSelRows);
    }
    function getDomainLvlRow(taxon) {
        var domainLvl = fParams.taxon.domainLvls[0];
        var lbl = _util.buildElem('label', { text: domainLvl });
        var taxonym = _util.buildElem('span', { text: getDomainTaxon().displayName });
        $(taxonym).css({ 'padding-top': '.55em' });
        return [buildTaxonEditFormRow(domainLvl, [lbl, taxonym], 'sub')];
    }
    function getDomainTaxon() {
        return fParams.records.taxon[fParams.taxon.realmId];
    }
    /**
     * Initializes the edit-parent form's comboboxes. Selects the current parent.
     * Hides the species row. Adds styles and modifies event listeners. 
     */
    function finishEditParentFormBuild() {                                      //console.log("fParams = %O", fParams);    
        var domainLvl = fParams.taxon.domainLvls[0];
        initComboboxes(null, 'sub');
        selectParentTaxon($('#txn-prnt').data('txn'), domainLvl);
        $('#Species_row').hide();
        $('#'+domainLvl+'_row .field-row')[0].className += ' domain-row';
        $('#sub-submit').attr('disabled', false).css('opacity', '1');
        $('#sub-submit').off('click').click(closePrntEdit);
        $('#sub-cancel').off('click').click(cancelPrntEdit);
    }
    function selectParentTaxon(prntId, domainLvl) {                             //console.log('selectParentTaxon. prntId [%s], domainLvl [%s]', prntId, domainLvl);                 
        var parentLvl = fParams.records.taxon[prntId].level.displayName;  
        if (parentLvl == domainLvl) { return clearAllOtherLvls(); }
        clearAllOtherLvls();
        $('#'+parentLvl+'-sel')[0].selectize.addItem(prntId);
    }
    function clearAllOtherLvls() {
        $.each($('#sub-form select[id$="-sel"]'), function(i, elem){ 
            $(elem)[0].selectize.clear('silent');
        });
    }
    function closePrntEdit() {                                                  
        var prnt =  getSelectedTaxon() || getDomainTaxon();                     //console.log("closePrntEdit called. prnt = %O", prnt);
        exitPrntEdit(prnt);
    }
    function cancelPrntEdit() {                                                 //console.log("cancelPrntEdit called.");
        var prnt = fParams.records.taxon[$('#txn-prnt').data('txn')];
        exitPrntEdit(prnt);
    }
    function exitPrntEdit(prnt) {
        if (checkForParentLvlErrs(prnt.level.id)) { return; }
        resetAfterEditParentClose(prnt);
    }
    function resetAfterEditParentClose(prnt) {
        clearLvlErrs('#Parent_errs');
        fParams.taxon.prntSubFormLvl = null;
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
        var prntLvl = $('#txn-prnt').data('lvl');                               //console.log("checkForTaxonLvlErrs. taxon = %s. parent = %s", txnLvl, prntLvl);
        var errObj = {
            'isGenusPrnt': isGenusPrnt(),
            'needsHigherLvl': lvlIsLowerThanKidLvls(txnLvl),
        };
        for (var tag in errObj) {  
            if (errObj[tag]) { return sendTxnErrRprt(tag, 'Taxon'); }
        }
        clrNeedsHigherLvl(null, null, txnLvl);
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
        var highLvl = getHighestChildLvl($('#txn-lvl').data('txn'));            //console.log('lvlIsLowerThanKidLvls. txnLvl = %s, childHigh = %s', txnLvl, highLvl)                  
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
        var txnLvl = $('#txn-lvl').val();                                       //console.log("checkForParentLvlErrs. taxon = %s. parent = %s", txnLvl, prntLvl);
        var errs = [
            { 'needsHigherLvlPrnt': txnLvl <= prntLvl },
            { 'needsGenusPrnt': txnLvl == 7 && prntLvl != 6 }];
        var hasErrs = !errs.every(checkForErr);                                 //console.log('hasErrs? ', hasErrs)
        if (!hasErrs) { clearLvlErrs('#Parent_errs'); }
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
    function clearLvlErrs(elemId) {                                             //console.log('clearLvlErrs.')
        clearErrElemAndEnableSubmit($(elemId)[0]);
    }
    /** Inits a taxon select-elem with the selectize library. */
    function initTaxonEditCombo(selId, chngFunc, createFunc) {                  //console.log("initTaxonEditCombo. selId = ", selId);
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
    function buildTaxonEditFormRow(field, inputElems, formLvl) {
        var rowDiv = _util.buildElem('div', { class: formLvl + '-row', id: field + '_row'});
        var errorDiv = _util.buildElem('div', { class: 'row-errors', id: field+'_errs'});
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
        };                                                                      //console.log("taxon vals = %O", vals);
        buildFormDataAndSubmit('top', vals);
    }
    /*-------------- Interaction Detail Fields -------------------------------*/
    function buildIntTypeField() {
        var opts = getOptsFromStoredData('intTypeNames');
        var selElem = _util.buildSelectElem(
            opts, {id: 'InteractionType-sel', class: 'lrg-field'});
        return buildFormRow('Interaction Type', selElem, 'top', true);
    }
    function focusIntTypePin() {
        if (!fParams.editing) { $('#InteractionType_pin').focus(); }
    }
    function buildIntTagField() {
        var elem = buildTagsElem('interaction', 'Interaction Tags', 'top');
        elem.className = 'lrg-field';
        return buildFormRow("Interaction Tags", elem, "top", false);
    }
    function buildIntNoteField() {
        var txtElem = buildLongTextArea('interaction', 'Note', 'top');
        return buildFormRow('Note', txtElem, 'top', false);
    }
    /*-------------- Sub Form Helpers ----------------------------------------------------------*/
    /*-------------- Publisher -----------------------------------------------*/
    /**
     * When a user enters a new publisher into the combobox, a create-publisher
     * form is built, appended to the publisher field row and an option object is 
     * returned to be selected in the combobox. Unless there is already a sub2Form,
     * where a message will be shown telling the user to complete the open sub2 form
     * and the form init canceled.
     * Note: The publisher form inits with the submit button enabled, as display 
     *     name, aka val, is it's only required field.
     */
    function initPublisherForm (val) {                                          //console.log("Adding new publisher! val = %s", val);
        var formLvl = getSubFormLvl("sub2");
        var prntLvl = getNextFormLevel("parent", formLvl);
        if ($('#'+formLvl+'-form').length !== 0) { return openSubFormErr('Publisher', null, formLvl); }
        $('#Publisher_row').append(initSubForm(
            "publisher", formLvl, "sml-right sml-form", {"Display Name": val}, "#Publisher-sel"));
        enableSubmitBttn("#"+formLvl+"-submit");
        disableSubmitBttn("#"+prntLvl+"-submit");
        $('#DisplayName_row input').focus();
        return { "value": "", "text": "Creating Publisher..." };
    }

    /*-------------- Author --------------------------------------------------*/
    /**
     * When an author is selected, a new author combobox is initialized underneath
     * 'this' author combobox. The total count of authors is added to the new id.
     */
    function onAuthSelection(val) {                                             //console.log("Add existing author = %s", val);
        if (val === "" || parseInt(val) === NaN) { return clearUnusedAuthElems(); }
        var cnt = $("#Authors_sel-cntnr").data("cnt") + 1;                          
        buildNewAuthorSelect(cnt, val);
        focusCombobox('#Authors-sel'+cnt);
    }
    /** Builds a new, empty author combobox */
    function buildNewAuthorSelect(cnt, val) {                                   //console.log("buildNewAuthorSelect. cnt [%s] val [%s]", cnt, val)
        var prntLvl = getSubFormLvl("sub");
        var parentFormEntity = fParams.forms[prntLvl].entity;
        var selConfg = { name: "Author", id: "#Authors-sel"+cnt, 
                         change: onAuthSelection, add: initAuthForm };
        $("#Authors_sel-cntnr").append(
            buildSelectCombo( parentFormEntity, "Authors", prntLvl, cnt ));   
        $("#Authors_sel-cntnr").data("cnt", cnt);
        initSelectCombobox(selConfg, prntLvl);
        $("#Authors-sel"+cnt)[0].selectize.removeOption(val);
    }
    /**
     * When a user enters a new author into the combobox, a create-author form is 
     * built, appended to the author field row, and an option object is returned 
     * to be selected in the combobox. Unless there is already an open form at
     * this level , where a message will be shown telling the user to complete 
     * the open form and the form init will be canceled.
     */
    function initAuthForm (val) {                                               //console.log("Adding new auth! val = %s", val);
        var authCnt = $("#Authors_sel-cntnr").data("cnt");
        var parentSelId = "#Authors-sel"+authCnt;
        var formLvl = getSubFormLvl("sub2");
        var prntLvl = getNextFormLevel("parent", formLvl);
        if ($('#'+formLvl+'-form').length !== 0) { return openSubFormErr('Authors', parentSelId, formLvl); }
        $('#Authors_row').append(initSubForm(
            "author", formLvl, "sml-left sml-form", {"Display Name": val}, parentSelId));
        disableSubmitBttn("#"+prntLvl+"-submit");
        return { "value": "", "text": "Creating Author..." };
    }
    /**
     * When an author combobox is cleared, all empty author comboboxes are cleared
     * and an empty combobox is added/left at the bottom of the author comboboxes.
     */
    function clearUnusedAuthElems() {  
        // for (var i = 1; i < ($("#Authors_sel-cntnr").data("cnt") + 1); i++ ) { console.log("i = ", i);console.log("val = ", $("#Authors-sel"+i).val())
        //     if ($("#Authors-sel"+i).val() == "") { console.log("empty select for %O", $("#Authors-sel"+i));
        //         $("#Authors-sel"+i)[0].selectize._events = {change: []};
        //         $("#Authors-sel"+i)[0].selectize.destroy();
        //         // $("#Authors-sel"+i).remove();     
        //     }
        // }
    }

    /** Returns a comma seperated sting of all authors attributed to the source. */
    function getAuthorNames(srcRcrd) {
        var authStr = [];
        if (srcRcrd.contributors.length > 0) {
            srcRcrd.contributors.forEach(function(authId){
                authStr.push(getAuthName(authId));
            });
        }
        return authStr.join(', ');
    }
    /** Returns the name of the author with the passed id. */
    function getAuthName(id) {
        var auth = fParams.records.source[id];
        return auth.displayName;  
    }
    /*------------------- Shared Form Builders ---------------------------------------------------*/
    /** Returns the record for the passed id and entity-type. */
    function getEntityRecord(entity, id) {
        var rcrds = _util.getDataFromStorage(entity);                           //console.log("[%s] id = %s, rcrds = %O", entity, id, rcrds)
        return rcrds[id];
    }
    /*------------------- Combobox (selectized) Methods ----------------------*/
    /**
     * Inits the combobox, using 'selectize', according to the passed config.
     * Note: The 'selectize' library turns select dropdowns into input comboboxes
     * that allow users to search by typing and, when configured, add new options 
     * not in the list by triggering a sub-form for that entity.
     */
    function initSelectCombobox(confg, formLvl) {                               //console.log("initSelectCombobox. CONFG = %O. formLvl = ", confg, formLvl)
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
    function initComboboxes(entity, formLvl) {                                  //console.log("initComboboxes. [%s]", entity);
        var formLvl = formLvl || fParams.forms[entity];  
        var selMap = getSelConfgObjs();  
        fParams.forms[formLvl].selElems.forEach(selectizeElem);
        fParams.forms[formLvl].selElems = [];

        function selectizeElem(field) {                                         //console.log("Initializing --%s-- select", field);
            var confg = getSelConfg(field);
            confg.id = confg.id || '#'+field+'-sel';
            initSelectCombobox(confg, formLvl);
        }
        /** Handles the shared Country field between Location and Interaction forms. */
        function getSelConfg(field) {
            var fieldName = field === 'Country' && entity === 'location' ? 
                field + '-loc' : field;
            return selMap[fieldName];
        }
    } 
    function getSelConfgObjs() {
        return { 
            'Authors': { name: 'Authors', id: '#Authors-sel1', change: onAuthSelection, 
                add: initAuthForm },
            'CitationType': { name: 'Citation Type', change: false, add: false },
            'CitationTitle': { name: 'Citation', change: onCitSelection, add: initCitForm },
            'Class': { name: 'Class', change: onLevelSelection, add: initTaxonForm },
            'Country': { name: 'Country', change: onCntrySelection, add: false },
            'Country-loc': { name: 'Country', id: '#locCountry-sel', change: false, add: false },
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
            'PublicationType': { name: 'Publication Type', change: false, add: false },
            'Publisher': { name: 'Publisher', change: Function.prototype, add: initPublisherForm },
            'Realm': { name: 'Realm', change: onRealmSelection, add: false },
            'Species': { name: 'Species', change: onLevelSelection, add: initTaxonForm },
            'Tags':  { name: 'Tag', change: false, add: false, 
                'options': { 'delimiter': ',', 'maxItems': null, 'persist': false }},
            'Publication': { name: 'Publication', change: onPubSelection, add: initPubForm },
            'Subject': { name: 'Subject', change: onSubjectSelection, add: false },
            'Object': { name: 'Object', change: onObjectSelection, add: false },
        };
    }
    function enableCombobox(selId, enable) {
        if (enable === false) { return $(selId)[0].selectize.disable(); }
        $(selId)[0].selectize.enable();
    }
    function focusCombobox(selId) { 
        $(selId)[0].selectize.focus();
    }
    function focusFirstCombobox(cntnrId) {
        var selElems = $(cntnrId+' .selectized').toArray();                     //console.log("selElems[0] = %O", selElems[0].id);
        focusCombobox('#'+ selElems[0].id);
    }
    function clearCombobox(selId) {                                             //console.log("clearCombobox [%s]", selId);
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
    function initSubForm(formEntity, formLvl, formClasses, fieldVals, selId) {  //console.log('initSubForm called. args = %O', arguments)
        var subFormContainer = _util.buildElem('div', {
            id: formLvl+'-form', class: formClasses + ' flex-wrap'}); 
        var hdr = _util.buildElem(
            'p', { 'text': 'New '+_util.ucfirst(formEntity), 'id': formLvl+'-hdr' });
        var subForm = buildSubForm(formEntity, fieldVals, formLvl, selId);
        subForm.push(buildFormBttns(_util.ucfirst(formEntity), formLvl, 'create'));
        $(subFormContainer).append([hdr].concat(subForm));
        fParams.forms[formLvl].pSelId = selId; 
        enableCombobox(selId, false)
        return subFormContainer;
    }
    /** 
     * Builds all fields for sub-form and returns the completed row elems.
     * Also inits the params for the sub-form in the global fParams obj.
     */
    function buildSubForm(entity, fieldVals, level, pSel, action) {             //console.log('buildSubForm. args = %O', arguments)
        var formConfg = getFormConfg(entity);                                   //console.log('formConfg = %O', formConfg)
        initFormLevelParamsObj(entity, level, pSel, formConfg, (action || 'create'));
        return getFormFieldRows(entity, formConfg, fieldVals, level);
    }
    /**
     * Returns a form-config object for the passed entity. 
     * -- Property descriptions:  
     * > add - Additonal fields for a detail-entity. E.g. Citation is a detail-entity
     *   of Source with a unique combination of fields from Source and itself.
     * > exclude - Fields to exclude in a detail-entity form. E.g. Citation doesn't 
     *   use Source's 'displayName' field as it's 'title' is it's display name. 
     * > required - Required fields for the entity.
     * > order - Order of the fields in the form. This is matched to the field elems' 
     *   id, which has no spaces.
     * > exitHandler - optional Obj with handlers for exiting create/edit forms.
     */
    function getFormConfg(entity) {
        var fieldMap = { 
            "arthropod": {
                "add": {},  
                "exclude": [],
                "required": [],
                "order": ["Class", "Order", "Family", "Genus", "Species"],
            },
            "author": { 
                "add": { "First Name": "text", "Middle Name": "text", "Last Name": "text"}, 
                "exclude": ["Description", "Year", "Doi", "Authors", "Tags"],
                "required": ["Last Name"], 
                "order": [ "DisplayName", "FirstName", "MiddleName", "LastName", 
                    "LinkUrl", "LinkDisplay"],
            },
            "bat": {
                "add": {},  
                "exclude": ["Class", "Order"],
                "required": [],
                "order": ["Family", "Genus", "Species"],
            },
            "citation": {
                "add": { "Title": "text", "Volume": "text", "Abstract": "fullTextArea",
                    "Issue": "text", "Pages": "text", "Citation Text": "fullTextArea", 
                    "Citation Type": "select"},
                "exclude": ["Display Name", "Description"], 
                "required": ["Title", "Citation Text", "Citation Type"],
                "order": ["CitationText", "Abstract", "Title", "CitationType", "Year", 
                    "Volume", "Issue", "Pages", "LinkUrl", "LinkDisplay", "Doi", 
                    "Tags", "Authors" ],
                "exitHandler": { create: enablePubField }
            },                                      
            "interaction": {
                "add": {},  
                "exclude": [],
                "required": ["Interaction Type"],
                "order": ["InteractionType", "InteractionTags", "Note"],
                "exitHandler": { create: resetInteractionForm }
            },
            "location": {
                "add": {},  
                "exclude": [], 
                "required": ["Display Name"],
                "order": ["DisplayName", "Description", "Country", "HabitatType", 
                    "Elevation", "ElevationMax", "Latitude", "Longitude" ], //"ElevationUnits", 
                "exitHandler": { create: enableCountryField }
            },
            "object": {
                "add": {"Realm": "select"},  
                "exclude": ["Class", "Order", "Family", "Genus", "Species" ],
                "required": [],
                "order": [],
                "exitHandler": { create: enableSubjField }
            },
            "plant": {
                "add": {},  
                "exclude": ["Class", "Order"],
                "required": [],
                "order": ["Family", "Genus", "Species"],
            },
            "publication": {
                "add": { "Title" : "text", "Publication Type": "select", "Publisher": "select" },  
                "exclude": ["Display Name", "Tags"],
                "required": ["Publication Type", "Title"],
                "order": ["Title", "Description", "PublicationType", "Year",  
                    "LinkUrl", "LinkDisplay", "Doi", "Publisher", "Authors" ],
            },
            "publisher": { 
                "add": {}, 
                "exclude": ["Year", "Doi", "Authors", "Tags"],
                "required": ["Display Name"],
                "order": ["DisplayName", "Description", "LinkUrl", "LinkDisplay"] 
            },
            "subject": {
                "add": {},  
                "exclude": ["Class", "Order"],
                "required": [],
                "order": ["Family", "Genus", "Species"],
                "exitHandler": { create: enableObjField }
            },
            "taxon": {
                "add": {},  
                "exclude": [],
                "required": ["Display Name"],
                "order": ["DisplayName"],
                "exitHandler": { create: onTaxonCreateFormExit }
            },
        };
        return fieldMap[entity];
    }
    /**
     * Returns an object of core fields and field types for the passed entity.
     * Note: source's have sub-entities that will return the core source fields.
     */
    function getCoreFieldDefs(entity) {  
        var coreEntityMap = {
            "author": "source",         "citation": "source",
            "publication": "source",    "publisher": "source",
            "location": "location",     "subject": "taxonLvls",
            "object": "taxonLvls",      "plant": "taxonLvls",
            "arthropod": "taxonLvls",   "taxon": "taxon",
            "interaction": "interaction","bat": "taxonLvls",          
        };
        var fields = {
            "location": { "Display Name": "text", "Description": "textArea", 
                "Elevation": "text", "Elevation Max": "text", "Longitude": "text", 
                "Latitude": "text", "Habitat Type": "select", "Country": "edgeCase", 
            }, //"Elevation Units": "select",
            "interaction": { "Interaction Type": "select", "Note": "fullTextArea", 
                "Interaction Tags": "tags"
            },
            "source": { "Display Name": "text", "Description": "textArea", 
                "Year": "text", "Doi": "text", "Link Display": "text", "Link Url": "text", 
                "Authors": "multiSelect", "Tags": "tags" 
            },
            "taxonLvls": {
                "Class": "select", "Order": "select", "Family": "select", 
                "Genus": "select", "Species": "select"
            },
            "taxon": { "Display Name": "text" }
        };
        return fields[coreEntityMap[entity]];
    }
    /**
     * Builds all rows for the sub-form according to the passed formConfig obj. 
     * Returns a container div with the rows ready to be appended to the form window.
     */
    function getFormFieldRows(entity, formCnfg, fieldVals, formLvl) {           //console.log("  Building Form rows. arguemnts = %O", arguments);
        var buildFieldType = { "text": buildTextInput, "tags": buildTagsElem, 
            "select": buildSelectCombo, "multiSelect": buildMultiSelectElem,  
            "textArea": buildTextArea, "fullTextArea": buildLongTextArea,
            "edgeCase": buildEdgeCaseElem };
        var defaultRows = buildDefaultRows();
        var additionalRows = buildAdditionalRows();
        return orderRows(defaultRows.concat(additionalRows), formCnfg.order);
        /** Adds the form-entity's default fields, unless they are included in exclude. */
        function buildDefaultRows() {                                           //console.log("    Building default rows");
            var dfltFields = getCoreFieldDefs(entity);
            var exclude = fParams.forms[formLvl].confg.exclude;
            return buildRows(dfltFields, exclude);
        }
        /** Adds fields specific to a sub-entity. */
        function buildAdditionalRows() {                                        //console.log("    Building additional rows");
            var addedFields = fParams.forms[formLvl].confg.add;
            return buildRows(addedFields);
        }
        /**
         * Builds a row for each field not explicitly excluded from the fieldGroup. 
         * If exclude is set to true, all default fields are excluded. 
         */
        function buildRows(fieldGroup, exclude) {
            var rows = [];
            for (var field in fieldGroup) {                                     //console.log("      field = ", field);
                if (exclude && (exclude === true || exclude.indexOf(field) !== -1)) { continue; }                //console.log("      field = ", field);
                rows.push(buildRow(field, fieldGroup, formLvl));
            }
            return rows;
        }
        /** Builds and returns the form field's row html. */
        function buildRow(field, fieldsObj, formLvl) {                          //console.log("buildRow. field [%s], formLvl [%s], fieldsObj = %O", field, formLvl, fieldsObj);
            var input = buildFieldType[fieldsObj[field]](entity, field, formLvl);  
            var isReq = isFieldRequried(field, formLvl);    
            fillFieldIfValuePassed(field);
            return buildFormRow(_util.ucfirst(field), input, formLvl, isReq, "");
            
            /** Sets the value for the  field if it is in the passed 'fieldVals' obj. */
            function fillFieldIfValuePassed(field) {
                if (field in fieldVals) { $(input).val(fieldVals[field]); }
            }
        } /* End buildRow */ 
    } /* End getFormFieldRows */
    function getFieldClass(formLvl, fieldType) {  
        var classes = { "top": "lrg-field", "sub": "med-field", "sub2": "med-field" };
        return fieldType === "long" ? (formLvl === "top" ? "xlrg-field top" :
            "xlrg-field") : classes[formLvl];
    }
    /** Returns true if field is in the required fields array. */
    function isFieldRequried(field, formLvl) {
        var reqFields = fParams.forms[formLvl].confg.required;
        return reqFields.indexOf(field) !== -1;
    }
    /** Reorders the rows into the order set in the form config obj. */
    function orderRows(rows, order) {                                           //console.log("    ordering rows = %O, order = %O", rows, order);
        var field, idx;
        rows.forEach(function(row) {
            field = row.id.split("_row")[0];
            idx = order.indexOf(field);
            order.splice(idx, 1, row);
        });
        return order;
    }
    /*----------------------- Form Input Builders ----------------------------*/
    function buildTextInput(entity, field, formLvl) { 
        return _util.buildElem("input", { "type": "text", class: getFieldClass(formLvl) });
    }
    function buildTextArea(entity, field, formLvl) {                                     
        return _util.buildElem("textarea", {class: getFieldClass(formLvl) });
    }
    function buildLongTextArea(entity, field, formLvl) {
        return _util.buildElem("textarea", 
            { class: getFieldClass(formLvl, "long"), id:field+"-txt" });
    }
    /**
     * Creates and returns a select dropdown for the passed field. If it is one of 
     * a larger set of select elems, the current count is appended to the id. Adds 
     * the select's fieldName to the subForm config's 'selElem' array to later 
     * init the 'selectize' combobox. 
     */
    function buildSelectCombo(entity, field, formLvl, cnt) {                    //console.log("buildSelectCombo [%s] field %s, formLvl [%s], cnt [%s]", entity, field, formLvl, cnt);                            
        var fieldName = field.split(" ").join("");
        var opts = getSelectOpts(fieldName);                                    //console.log("entity = %s. field = %s, opts = %O ", entity, field, opts);
        var fieldId = cnt ? fieldName+"-sel"+cnt : fieldName+"-sel";
        var sel = _util.buildSelectElem(opts, { id: fieldId , class: getFieldClass(formLvl)});
        fParams.forms[formLvl].selElems.push(fieldName);
        return sel;
    }
    /**
     * Creates a select dropdown field wrapped in a div container that will
     * be reaplced inline upon selection. Either with an existing Author's name, 
     * or the Author create form when the user enters a new Author's name. 
     */
    function buildMultiSelectElem(entity, field, formLvl) {                     //console.log("entity = %s. field = ", entity, field);
       var cntnr = _util.buildElem("div", { id: field+"_sel-cntnr"});
       var selElem = buildSelectCombo(entity, field, formLvl, 1);
       $(cntnr).data("cnt", 1);
       $(cntnr).data("inputType", "multiSelect");
       $(cntnr).append(selElem);
       return cntnr;
    }
    /**
     * Creates and returns a select dropdown that will be initialized with 'selectize'
     * to allow multiple selections. A data property is added for use form submission.
     */
    function buildTagsElem(entity, field, formLvl) {
        var tagSel = buildSelectCombo(entity, field, formLvl);
        $(tagSel).data("inputType", "tags");
        return tagSel;
    }
    /** Routes edge case fields to their field-builder method. */
    function buildEdgeCaseElem(entity, field, formLvl) {
        var caseMap = { "Country": buildLocCountryElem };
        return caseMap[field](entity, field, formLvl);
    }
    /**
     * Modifies the Country combobox used in the location sub-form by giving it a 
     * unique id. If there is a selected value in the top-form country combobox, 
     * it is set in this sub-field. The top-form country combobox is disabled. 
     */
    function buildLocCountryElem(entity, field, formLvl) {
        var subCntrySel = buildSelectCombo(entity, field, formLvl);
        subCntrySel.id = "locCountry-sel";
        if ($('#Country-sel').length) { // when editing a location, there is no 'top' country field
            if ($('#Country-sel').val()) { $(subCntrySel).val($('#Country-sel').val()); }
            enableCombobox('#Country-sel', false);
        }
        return subCntrySel;
    }
    /* ---------- Option Builders ---------------------------------------------*/
    /** Returns and array of options for the passed field type. */
    function getSelectOpts(field) {                                             //console.log("getSelectOpts. for %s", field);
        var optMap = {
            "Authors": [ getAuthOpts, 'authSources'],
            "CitationType": [ getOptsFromStoredData, 'citTypeNames'],
            "Class": [ getTaxonOpts, 'Class' ],
            "Country": [ getOptsFromStoredData, 'countryNames' ],
            // "ElevationUnits": [ getElevUnitOpts, null ],
            "Family": [ getTaxonOpts, 'Family' ],
            "Genus": [ getTaxonOpts, 'Genus' ],
            "HabitatType": [ getOptsFromStoredData, 'habTypeNames'],
            "InteractionTags": [ getTagOpts, 'interaction' ],
            "InteractionType": [ getOptsFromStoredData, 'intTypeNames' ],
            "Order": [ getTaxonOpts, 'Order' ],
            "PublicationType": [ getOptsFromStoredData, 'pubTypeNames'],
            "Publisher": [ getOptsFromStoredData, 'publisherNames'],
            "Realm": [ getRealmOpts, null ],
            "Species": [ getTaxonOpts, 'Species' ],
            "Tags": [ getTagOpts, 'source' ],
        };
        var getOpts = optMap[field][0];
        var fieldKey = optMap[field][1];
        return getOpts(fieldKey);
    }
    /** Returns an array of elevation unit options objects. */
    // function getElevUnitOpts() {
    //     return [ { value: "ft", text: "Feet" }, 
    //              { value: "m", text: "Meters"} ];
    // }
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
            return { value: id, text: rcrds[id].displayName };
        });
    }
    function getOptsFromStoredRcrds(prop) {
        var rcrds = _util.getDataFromStorage(prop); 
        var opts = getRcrdOpts(null, rcrds);
        return opts.sort(alphaOptionObjs);
    }
    /** Builds options out of a stored entity-name object. */
    function getOptsFromStoredData(prop) {                                      //console.log("prop = ", prop)
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
    /** Returns an array of author-source options objects. */
    function getAuthOpts(prop) {
        var ids = _util.getDataFromStorage(prop);
        return getRcrdOpts(ids, fParams.records.source);
    }
    /** Returns an array of taxonyms for the passed level and the form's realm. */
    function getTaxonOpts(level) {
        var opts = getOptsFromStoredData(fParams.taxon.realm+level+"Names");    //console.log("taxon opts for [%s] = %O", fParams.taxon.realm+level+"Names", opts)
        return opts;
    }
    function getRealmOpts() {
        return [{ value: 3, text: "Plant" }, { value: 4, text: "Arthropod" }];  
    }
    /* -----------------------------------------------------------------------*/
    /**
     * Each element is built, nested, and returned as a completed row. 
     * rowDiv>(errorDiv, fieldDiv>(label, input, [pin]))
     */
    function buildFormRow(fieldName, input, formLvl, isReq, rowClss) {
        var field = fieldName.split(' ').join('');
        var rowDiv = _util.buildElem("div", { class: getRowClasses(), id: field + "_row"});
        var errorDiv = _util.buildElem("div", { class: "row-errors", id: field+"_errs"});
        var fieldCntnr = _util.buildElem("div", { class: "field-row flex-row"});
        var label = _util.buildElem("label", {text: _util.ucfirst(fieldName)});
        var pin = formLvl === "top" ? getPinElem(field) : null;     
        if (isReq) { handleRequiredField(label, input, formLvl); } 
        $(fieldCntnr).append([label, input, pin]);
        $(rowDiv).append([errorDiv, fieldCntnr]);
        return rowDiv;
        /** Returns the style classes for the row. */
        function getRowClasses() { 
             var rowClass = input.className.includes("xlrg-field") ? 
                "full-row" : (formLvl + '-row') + (rowClss ? (" "+rowClss) : "");  //console.log("rowClass = ", rowClass)
            return rowClass; 
        }
    } /* End buildFormRow */
    function getPinElem(field) {
        var relFields = ["CitationTitle", "Country", "Location", "Publication"];
        var pinClasses = 'top-pin' + (fParams.editing ? ' invis' : '');
        var pin = _util.buildElem("input", {type: "checkbox", id: field+"_pin", class: pinClasses});
        $(pin).keypress(function(e){ //Enter
            if((e.keyCode || e.which) == 13){ $(this).trigger('click'); }
        });
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
            "Country": { checked: false, relField: "Location" },
            "Location": { checked: true, relField: "Country" },
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
    function handleRequiredField(label, input, formLvl) {
        $(label).addClass('required');  
        $(input).change(checkRequiredFields);
        $(input).data("formLvl", formLvl);
        fParams.forms[formLvl].reqElems.push(input);
    }
    /**
     * On a required field's change event, the submit button for the element's form 
     * is enabled if all of it's required fields have values and it has no open child forms. 
     */
    function checkRequiredFields(e) {  
        var input = e.currentTarget;
        var formLvl = $(input).data("formLvl");  
        var subBttnId = '#'+formLvl+'-submit';
        if (!input.value || hasOpenSubForm(formLvl)) { 
            disableSubmitBttn(subBttnId); 
        } else if (ifRequiredFieldsFilled(formLvl)) { 
            enableSubmitBttn(subBttnId);
        }
    }
    /** Returns true if all the required elements for the current form have a value. */
    function ifRequiredFieldsFilled(formLvl) {                                  //console.log("formLvl = %s. fPs = %O", formLvl, fParams)
        var reqElems = fParams.forms[formLvl].reqElems;
        return reqElems.every(function(reqElem){ return reqElem.value; }); 
    }
    /** Returns true if the next sub-level form exists in the dom. */
    function hasOpenSubForm(formLvl) {
        var childFormLvl = getNextFormLevel('child', formLvl);
        return $('#'+childFormLvl+'-form').length > 0;
    }
    /**
     * Returns a container with 'Create [Entity]' and 'Cancel' buttons bound to events
     * specific to their form container @getBttnEvents, and a left spacer that 
     * pushes the buttons to the bottom right of their form container.
     */
    function buildFormBttns(entity, level, action) {
        var bttn = { create: "Create", edit: "Update" };
        var events = getBttnEvents(entity, level);                              //console.log("events = %O", events);
        var cntnr = _util.buildElem("div", { class: "flex-row bttn-cntnr" });
        var spacer = $('<div></div>').css("flex-grow", 2);
        var submit = _util.buildElem("input", { id: level + "-submit", 
            class: "ag-fresh grid-bttn", type: "button", value: bttn[action]+" "+entity});
        var cancel = _util.buildElem("input", { id: level +"-cancel", 
            class: "ag-fresh grid-bttn", type: "button", value: "Cancel"});
        $(submit).attr("disabled", true).css("opacity", ".6").click(events.submit);
        $(cancel).css("cursor", "pointer").click(events.cancel);
        $(cntnr).append([spacer, submit, cancel]);
        return cntnr;
    }
    /**
     * Returns an object with 'submit' and 'cancel' events bound to the passed level's
     * form container.  
     */
    function getBttnEvents(entity, level) {                                     //console.log("getBttnEvents for [%s] @ [%s]", entity, level);
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
    function exitForm(formId, formLvl, focus, data) {                           //console.log("id = %s, formLvl = %s", formId, formLvl)      
        $(formId).remove();
        resetFormCombobox(formLvl, focus);
        if (formLvl !== 'top') { ifParentFormValidEnableSubmit(formLvl); }
        fParams.forms[formLvl].exitHandler(data);
    }
    /**
     * Clears and enables the parent combobox for the exited form. Removes any 
     * placeholder options and, optionally, brings it into focus.
     */
    function resetFormCombobox(formLvl, focus) {        
        if (!fParams.forms[formLvl].pSelId) { return; }
        var combobox = $(fParams.forms[formLvl].pSelId)[0].selectize;   
        combobox.clear();
        combobox.enable();
        combobox.removeOption(""); //Removes the "Creating [entity]..." placeholder.
        if (focus) { combobox.focus(); 
        } else if (focus === false) { combobox.blur(); }
    }
    /** Returns the 'next' form level- either the parent or child. */
    function getNextFormLevel(nextLvl, curLvl) {
        var formLvls = fParams.formLevels;
        var nextLvl = nextLvl === "parent" ? 
            formLvls[formLvls.indexOf(curLvl) - 1] : 
            formLvls[formLvls.indexOf(curLvl) + 1] ;
        return nextLvl;
    }
    /** 
     * Returns the sub form's lvl. If the top form is not the interaction form,
     * the passed form lvl is reduced by one and returned. 
     */
    function getSubFormLvl(intFormLvl) {  
        var formLvls = fParams.formLevels;
        return fParams.forms.top.entity === "interaction" ? 
            intFormLvl : formLvls[formLvls.indexOf(intFormLvl) - 1];
    }
    /*------------------ Form Submission Data-Prep Methods -------------------*/
    /** Enables the parent form's submit button if all required fields have values. */
    function ifParentFormValidEnableSubmit(formLvl) {
        var parentLvl = getNextFormLevel('parent', formLvl);
        if (ifRequiredFieldsFilled(parentLvl)) {
            enableSubmitBttn('#'+parentLvl+'-submit');
        }
    }
    /** Enables passed submit button */
    function enableSubmitBttn(bttnId) {  
        $(bttnId).attr("disabled", false).css({"opacity": "1", "cursor": "pointer"}); 
    }  
    /** Enables passed submit button */
    function disableSubmitBttn(bttnId) {
        $(bttnId).attr("disabled", true).css({"opacity": ".6", "cursor": "initial"}); 
    }  
    function toggleWaitOverlay(waiting) {                                        //console.log("toggling wait overlay")
        if (waiting) { appendWaitingOverlay();
        } else { $('#c-overlay').remove(); }  
    }
    function appendWaitingOverlay() {
        $('#b-overlay').append(_util.buildElem('div', { 
            class: 'overlay waiting', id: 'c-overlay'}));
        $('#c-overlay').css({'z-index': '1000', 'display': 'block'});
    }
    function getFormValuesAndSubmit(id, formLvl, entity) {                      console.log("getFormValuesAndSubmit. id = %s, formLvl = %s, entity = %s", id, formLvl, entity);
        var formVals = getFormValueData(id, entity);
        buildFormDataAndSubmit(formLvl, formVals);  
    }
    /**
     * Loops through all rows in the form with the passed id and returns an object 
     * of the form values. Entity data not contained in an input on the form is 
     * added @handleAdditionalEntityData.
     */
    function getFormValueData(id, entity) {      
        var elems = $(id)[0].children;   
        var formVals = {};
        for (var i = 0; i < elems.length-1; i++) { getInputData(elems[i]); }  
        handleAdditionalEntityData(entity);
        return formVals;
        /** Get's the value from the form elem and set it into formVals. */
        function getInputData(elem) {                                           //console.log("elem = %O", elem)
            if (elem.id.includes('-hdr')) { return; }
            var fieldName = _util.lcfirst(elem.children[1].children[0].innerText.trim().split(" ").join("")); 
            var input = elem.children[1].children[1];                           //console.log("fieldName = ", fieldName)
            if ($(input).data("inputType")) { 
                getInputVals(fieldName, input, $(input).data("inputType")); 
            } else { formVals[fieldName] = input.value || null; }
        }
        /** Edge case input type values are processed via their type handlers. */
        function getInputVals(fieldName, input, type) {
            var typeHandlers = {
                "multiSelect": getMultiSelectVals, "tags": getTagVals
            };
            typeHandlers[type](fieldName, input);
        }
        /** Adds an array of selected values from the passed select container.*/
        function getMultiSelectVals(fieldName, cntnr) {
            var vals = [];
            var elems = cntnr.children;  
            for (var i = 0; i <= elems.length-1; i+= 2) { 
                if (elems[i].value) { vals.push(elems[i].value); }
            }
            formVals[fieldName] = vals;
        }
        /** Adds an array of tag values. */
        function getTagVals(fieldName, input) {                                 
            var selId = '#'+_util.ucfirst(fieldName)+'-sel';
            formVals[fieldName] = $(selId)[0].selectize.getValue();       
        }
        /**
         * Realted parent-form field values are added @ifHasParentFormVals.
         * Additional field values are added at @ifHasAdditionalFields.
         */
        function handleAdditionalEntityData(entity) {
            var dataHndlrs = {
                "Author": [ getAuthFullName ],
                "Citation": [ getPubFieldData, addCitDisplayName, ifBookType ],
                "Interaction": [ handleUnspecifiedLocs ],
                "Location": [ addElevUnits, padLatLong, checkParentLoc, getLocType ], 
                "Taxon": [ getTaxonData ],

            };
            if (!dataHndlrs[entity]) { return; }
            dataHndlrs[entity].forEach(function(func) { func(); });
        }
        /** Concatonates all Author name fields and adds it as 'fullName' in formVals. */ 
        function getAuthFullName() { 
            var nameFields = ["firstName", "middleName", "lastName"];
            var fullName = [];
            nameFields.forEach(function(field) {
                if (formVals[field]) { fullName.push(formVals[field]) };
            });
            formVals.fullName = fullName.join(" ");
        }
        function getPubFieldData() {
            formVals.publication = $('#Publication-sel').val();
        }
        /** Adds 'displayName', which will be added to both the form data objects. */
        function addCitDisplayName() {
            formVals.displayName = formVals.title;
        }
        /** 
         * Appends '-citation' to citations attributed to entire books to maintain
         * unique display names for both the publication and its citation.
         */
        function ifBookType() { 
            if (formVals.citationType == 4) { formVals.displayName += '-citation'; }
        }
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
        /** If no parent country is selected, the 'Unspecified' region is the parent. */
        function checkParentLoc() {
            if (!formVals.country) { formVals.country = 439; }
        }
        /**
         * Sets location type according to the most specific data entered. 
         * "Point": if there is lat/long data. "Area": if there is elev data. 
         * "Habitat": if habType selected. "Area": if there is no specific data entered.
         */
        function getLocType() {
            formVals.locationType = formVals.longitude || formVals.latitude ? 5 :
                formVals.elevation || formVals.elevationMax ? 4 :
                formVals.habitatType ? 3 : 4;   
        }
        /**
         * If no location is selected for an interaction record, the country field 
         * is checked for a value. If set, it is added as the interaction's location;
         * if not, the 'Unspecfied' location, id 439, is added.
         */
        function handleUnspecifiedLocs(entity) {
            if (formVals.location) { return; }
            formVals.location = formVals.country || 439;   
        }
        function getTaxonData() {
            formVals.parentTaxon = getParentTaxon(fParams.taxon.formTaxonLvl);
            formVals.level = fParams.taxon.formTaxonLvl;
        }
        /**
         * Checks each parent-level combo for a selected taxon. If none, the realm
         * taxon is added as the new Taxon's parent.
         */
        function getParentTaxon(lvl) {
            var lvls = fParams.taxon.lvls;
            var parentLvl = lvls[lvls.indexOf(lvl)-1];
            if ($('#'+parentLvl+'-sel').length) { 
                return $('#'+parentLvl+'-sel').val() || getParentTaxon(parentLvl);
            } 
            return fParams.taxon.realmId;
        }
    } /* End getFormValueData */
    /**
     * Builds a form data object @buildFormData. Sends it to the server @submitFormData
     */
    function buildFormDataAndSubmit(formLvl, formVals) {                        
        var entity = fParams.forms[formLvl].entity;                             //console.log("Submitting [ %s ] [ %s ]-form with vals = %O", entity, formLvl, formVals);  
        var formData = buildFormData(entity, formVals);                         //console.log("formData = %O", formData);
        submitFormData(formData, formLvl);
    }                
    /**
     * Returns an object with the entity names' as keys for their field-val objects, 
     * which are grouped into flat data and related-entity data objects. 
     */
    function buildFormData(entity, formVals) { 
        var pEntity = getParentEntity(entity);                                  
        var parentFields = !pEntity || getParentFields(entity);                 //console.log("buildFormDataObj. pEntity = %s, formVals = %O, parentFields = %O", pEntity, formVals, parentFields);
        var fieldTrans = getFieldTranslations(entity); 
        var rels = getRelationshipFields(entity);
        var data = buildFormDataObj();

        for (var field in formVals) { getFormFieldData(field, formVals[field]); }
        if (pEntity === "source") { handleDetailTypeField(); }                  //console.log("formData = %O", data);
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
                formData[newField] = val;
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
         */
        function handleDetailTypeField() {  
            var nonDetailEntities = ["publisher"];
            if (pEntity) { 
                data[pEntity].rel[pEntity+"Type"] = entity; 
                data[pEntity].hasDetail = nonDetailEntities.indexOf(entity) === -1;
            }    
        }
    } /* End buildFormDataObj */
    /** Returns the core entity. (eg, Source is returned for author, citation, etc.) */
    function getCoreFormEntity(entity) {
        var coreEntities = {
            "author": "source",         "citation": "source",
            "publication": "source",    "publisher": "source",
            "location": "location",     "taxon": "taxon",
            "interaction": "interaction"
        };
        return coreEntities[entity];
    }
    function getParentEntity(entity) {                                          //console.log("hasParentEntity. entity = %s", entity)
        var detailEntities = ["author", "citation", "publication", "publisher"];
        return detailEntities.indexOf(entity) !== -1 ? "source" : false;
    }
    /** Returns an array of the parent entity's field names. */
    function getParentFields(entity) {
        var parentFields = Object.keys(getCoreFieldDefs(entity));
        return  parentFields.map(function(field) {
            return _util.lcfirst(field.split(" ").join(""));
        });
    }
    /**
     * Returns the fields that need to be renamed and the entity they belong to. 
     * A "false" field will not be added to the final form data.   
     */
    function getFieldTranslations(entity) {                                     //console.log("entity = ", entity)
        var fieldTrans = {
            "author": {
                "displayName": { "source": "displayName", "author": "displayName" }
            },
            "citation": { 
                "authors": { "source": "contributor" },
                "citationText": { "source": "description", "citation": "fullText" },
                "publication": { "source": "parentSource" },
                "displayName": { "source": "displayName", "citation": "displayName" },
                "volume": { "citation": "publicationVolume" },
                "issue": { "citation": "publicationIssue" },
                "pages": { "citation": "publicationPages" },
                "tags": { "source": "tags" }
            },
            "interaction": {
                "citationTitle": { "interaction": "source" },
                "country": { "interaction": false },
                "interactionTags": { "interaction": "tags" },
                "notes": { "interaction": "note" }, 
                "publication": { "interaction": false }
            },
            "location": {
                "country": { "location": "parentLoc" },
            },
            "publication": { 
                "authors": { "source": "contributor" },
                "publisher": { "source": "parentSource" }, 
                "description": { "source": "description", "publication": "description" },
                "title": { "source": "displayName", "publication": "displayName" },
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
            "author": ["sourceType"], 
            "citation": ["citationType", "authors", "tags", "publication"], 
            "location": ["locationType", "habitatType", "country"],
            "publication": ["publicationType", "authors", "publisher"],
            "publisher": [],
            "taxon": ["level", "parentTaxon"],
            "interaction": ["citationTitle", "location", "subject", "object", 
                "interactionTags", "interactionType" ]
        };
        return relationships[entity];
    }
    /*------------------ Form Submit Methods ---------------------------------*/
    /** Sends the passed form data object via ajax to the appropriate controller. */
    function submitFormData(formData, formLvl) {                                //console.log("submitFormData [ %s ]= %O", formLvl, formData);
        var coreEntity = getCoreFormEntity(fParams.forms[formLvl].entity);      //console.log("entity = ", coreEntity);
        var url = getEntityUrl(coreEntity, fParams.forms[formLvl].action);
        if (fParams.editing) { formData.ids = fParams.editing; }
        formData.coreEntity = coreEntity;
        storeParamsData(coreEntity, formLvl);
        toggleWaitOverlay(true);
        sendAjaxQuery(formData, url, formSubmitSucess, formSubmitError);
    }
    /** Stores data relevant to the form submission that will be used later. */
    function storeParamsData(entity, formLvl) {                                 
        var focuses = { 'source': 'srcs', 'location': 'locs', 'taxon': 'taxa', 
            'interaction': 'int' };
        fParams.ajaxFormLvl = formLvl;
        fParams.submitted = true;
        fParams.submitFocus = focuses[entity];
    }
    /** Returns the full url for the passed entity and action.  */
    function getEntityUrl(entityName, action) {
        var envUrl = $('body').data("ajax-target-url");
        return envUrl + "crud/entity/" + action;
    }
    function formSubmitError(jqXHR, textStatus, errorThrown) {                  //console.log("ajaxError. responseText = [%O] - jqXHR:%O", jqXHR.responseText, jqXHR);
        var formLvl = fParams.ajaxFormLvl;                                          
        toggleWaitOverlay(false);
        $('#'+formLvl+'-hdr').after(getErrorMessage(JSON.parse(jqXHR.responseText)));
        window.setTimeout(function(){$('#'+formLvl+'-form')[0].children[1].remove() }, 3000);        
    }
    /**
     * Returns an error <p> based on the server error text. Reports duplicated 
     * authors, non-unique display names, or returns a generic form-error message.
     */
    function getErrorMessage(errTxt) {                                          console.log("errTxt = %O", errTxt) 
        var msg = '<p class="form-errors"">';
        if (isDuplicateAuthorErr(errTxt)) {
            msg += 'A selected author is a duplicate.';
        } else if (errTxt.DBALException.includes("Duplicate entry")){ 
            msg += 'A record with this display name already exists.'; 
        } else {
            msg += 'There was an error during form submission.'
        }
        return msg + '</p>'
    }
    function isDuplicateAuthorErr(errTxt) {
        return errTxt.DBALException.includes("Duplicate entry") &&
            errTxt.DBALException.includes("contribution");
    }
    /*------------------ Form Success Methods --------------------------------*/
    /**
     * Ajax success callback. Updates the stored data @eif.syncData.update and the 
     * stored core records in the fParams object. Exit's the successfully submitted 
     * form @exitFormAndSelectNewEntity.  
     */
    function formSubmitSucess(ajaxData, textStatus, jqXHR) {                    console.log("Ajax Success! data = %O, textStatus = %s, jqXHR = %O", ajaxData, textStatus, jqXHR);                   
        var data = parseData(ajaxData.results);
        storeData(data);
        handleFormComplete(data);
        toggleWaitOverlay(false);
    }
    /** Calls the appropriate data storage method and updates fParams. */  
    function storeData(data) {
        eif.syncData.update(data);
        updateStoredFormParamsData(data);
    }
    /** Updates the core records in the global form params object. */
    function updateStoredFormParamsData(data) {                                 //console.log("fParams after interaction created. %O", fParams);
        fParams.records[data.core] = _util.getDataFromStorage(data.core);
    }
    function handleFormComplete(data) {
        var formLvl = fParams.ajaxFormLvl;
        if (formLvl !== 'top') { return exitFormAndSelectNewEntity(data); }
        fParams.forms.top.exitHandler(data);
    }
    /*------------------ Top-Form Success Methods --------------------*/
    function showEditSuccessMsg(data) {
        var msg = hasChngs(data) ? "Update successful." : "No changes detected."; 
        showSuccessMsg(msg);
    }
    /** 
     * Returns true if there have been user-made changes to the entity. 
     * Note: The location elevUnitAbbrv is updated automatically for locations with
     * elevation data, and is ignored here. 
     */
    function hasChngs(data) {
        var chngs = Object.keys(data.coreEdits).length > 1 || 
            Object.keys(data.detailEdits).length > 1;
        if (chngs && data.core == 'location' && Object.keys(data.coreEdits).length == 2) {
            if ('elevUnitAbbrv' in data.coreEdits) { return false; }
        }
        return chngs;
    }
    /** Resets the interactions form leaving only the pinned values. */
    function resetInteractionForm() {
        var vals = getPinnedFieldVals();                                        //console.log("vals = %O", vals);
        showSuccessMsg("New Interaction successfully created.");
        initFormParams("create", "interaction");
        resetIntFields(vals);
    }
    /** Shows a form-submit success message at the top of the interaction form. */
    function showSuccessMsg(msg) {
        $('#form-hdr p')[0].innerHTML = msg;
        window.setTimeout(function() {
            if ($('#form-hdr p').length) {$('#form-hdr p')[0].innerHTML = ""}
        }, 2500);
    }
    /** Returns an obj with the form fields and either their pinned values or false. */
    function getPinnedFieldVals(pins) {
        var pins = $('form[name="top"] [id$="_pin"]').toArray();                //console.log("pins = %O", pins);
        var vals = {};
        pins.forEach(function(pin) {  
            if (pin.checked) { getFieldVal(pin.id.split("_pin")[0]); 
            } else { addFalseValue(pin.id.split("_pin")[0]); }
        });
        return vals;

        function getFieldVal(fieldName) {                                       //console.log("fieldName = %s", fieldName)
            var suffx = fieldName === 'Note' ? '-txt' : '-sel';
            vals[fieldName] = $('#'+fieldName+suffx).val();
        }
        function addFalseValue(fieldName) {
            vals[fieldName] = false;
        }
    } /* End getPinnedValsObj */
    /**
     * Resets the top-form in preparation for another entry. All fields without  
     * a pinned value will be reset. 
     */
    function resetIntFields(vals) {
        disableSubmitBttn("top-submit"); 
        initInteractionParams();
        resetUnpinnedFields(vals);
    }
    function resetUnpinnedFields(vals) {
        for (var field in vals) {                                               //console.log("field %s val %s", field, vals[field]);
            if (!vals[field]) { clearField(field); }
        }
    }
    function clearField(fieldName) {
        if (fieldName === 'Note') { return $('#Note-txt').val(""); }
        clearCombobox('#'+fieldName+'-sel');
    }
    /** Inits the necessary interaction form params after form reset. */
    function initInteractionParams() {
        initFormLevelParamsObj(
            "interaction", "top", null, getFormConfg("interaction"), "create");
        addReqElemsToConfg();
    }
    /*------------------ Sub-Form Success Methods ----------------------------*/
    /**
     * Exits the successfully submitted form @exitForm. Adds and selects the new 
     * entity in the form's parent elem @addAndSelectEntity.
     */
    function exitFormAndSelectNewEntity(data) {
        var formLvl = fParams.ajaxFormLvl;           
        exitForm("#"+formLvl+"-form", formLvl, false, data); 
        if (fParams.forms[formLvl].pSelId) { addAndSelectEntity(data, formLvl); }
    }
    /** Adds and option for the new entity to the form's parent elem, and selects it. */
    function addAndSelectEntity(data, formLvl) {
        var selApi = $(fParams.forms[formLvl].pSelId)[0].selectize;        
        selApi.addOption({ 
            "value": data.coreEntity.id, "text": data.coreEntity.displayName 
        });
        selApi.addItem(data.coreEntity.id);
    }
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
    /**
     * When the user attempts to create an entity that uses the sub-form and there 
     * is already an instance using that form, show the user an error message and 
     * reset the select elem. 
     */
    function openSubFormErr(field, id, formLvl) {                               //console.log("selId = %s, fP = %O ", selId, fParams)
        var selId = id || '#'+field+'-sel';
        return formInitErr(field, 'openSubForm', formLvl, selId);
    }
    /** 
     * When an error prevents a form init, this method shows an error to the user
     * and resets the combobox that triggered the form. 
     */
    function formInitErr(field, errTag, formLvl, id) {                          console.log("formInitErr: [%s]. field = [%s] at [%s], id = %s", errTag, field, formLvl, id)
        var selId = id || '#'+field+'-sel';
        reportFormFieldErr(field, errTag, formLvl);
        window.setTimeout(function() {clearCombobox(selId)}, 10);
        return { "value": "", "text": "Select " + field };
    }
    /**
     * Shows the user an error message above the field row. The user can clear the 
     * error manually with the close button, or automatically by resolving the error.
     */
    function reportFormFieldErr(fieldName, errTag, formLvl) {                   console.log("###__formFieldError- '%s' for '%s' @ '%s'", errTag, fieldName, formLvl);
        var errMsgMap = {
            'isGenusPrnt': handleIsGenusPrnt,
            'needsGenusPrnt': handleNeedsGenusParent, 
            'noGenus': handleNoGenus,
            'needsHigherLvlPrnt': handleNeedsHigherLvlPrnt,
            'needsHigherLvl': handleNeedsHigherLvl,
            'openSubForm': handleOpenSubForm,
        };
        var errElem = getErrElem(fieldName);
        errMsgMap[errTag](errElem, errTag, formLvl);
    }
    /* ----------- Field-Error Handlers --------------------------------------*/
    /** Note: error for the edit-taxon form. */
    function handleIsGenusPrnt(elem, errTag, formLvl) {  
        var msg = "<span>Genus' with species children must remain at genus.</span>";
        setErrElemAndAppend(elem, msg, errTag);
    }
    function clrIsGenusPrnt(elem, e) {                                       
        $('#txn-lvl')[0].selectize.addItem($('#txn-lvl').data('lvl'));
        clearErrElemAndEnableSubmit(elem);
    }
    /** Note: error for the edit-taxon form. */
    function handleNeedsGenusParent(elem, errTag, formLvl) {  
        var msg = '<span>Please select a genus parent for the species taxon.</span>';
        setErrElemAndAppend(elem, msg, errTag);
    }
    function clrNeedsGenusPrntErr(elem, e) {                                       
        $('#txn-lvl')[0].selectize.addItem($('#txn-lvl').data('lvl'));
        clearErrElemAndEnableSubmit(elem);
    }
    /** Note: error for the create-taxon form. */
    function handleNoGenus(elem, errTag, formLvl) {  
        var msg = '<span>Please select a genus before creating a species.</span>';
        setErrElemAndAppend(elem, msg, errTag)
        $('#Genus-sel').change(function(e){
            if (e.target.value) { clrNoGenusErr(elem); }
        });
    }
    function clrNoGenusErr(elem, e) {                                            
        $('#Genus-sel').off('change');
        clearErrElemAndEnableSubmit(elem);
    }
    /** Note: error for the edit-taxon form. */
    function handleNeedsHigherLvlPrnt(elem, errTag, formLvl) { 
        var msg = '<span>The parent taxon must be at a higher taxonomic level.</span>';
        setErrElemAndAppend(elem, msg, errTag);
    }
    /** Clears the cause, either the parent-selection process or the taxon's level. */
    function clrNeedsHigherLvlPrnt(elem, e) {                                    
        $('#txn-lvl')[0].selectize.addItem($('#txn-lvl').data('lvl'));
        clearErrElemAndEnableSubmit(elem);
        if ($('#sub-form').length) { return selectParentTaxon(
            $('#txn-prnt').data('txn'), fParams.taxon.domainLvls[0]); 
        }
        $('#txn-lvl').data('lvl', $('#txn-lvl').val());
    }
    /** Note: error for the edit-taxon form. */
    function handleNeedsHigherLvl(elem, errTag, formLvl) {  
        var childLvl = getHighestChildLvl($('#txn-lvl').data('txn'));
        var lvlName = fParams.taxon.lvls[childLvl-1];
        var msg = '<div>Taxon level must be higher than that of child taxa. &nbsp&nbsp&nbsp' +
            'Please select a level higher than '+lvlName+'</div>';
        $('#chng-prnt').attr({'disabled': true}).css({'opacity': '.6'});
        setErrElemAndAppend(elem, msg, errTag);
    }
    function clrNeedsHigherLvl(elem, e, taxonLvl) {    
        var txnLvl = taxonLvl || $('#txn-lvl').data('lvl'); 
        $('#txn-lvl')[0].selectize.addItem(txnLvl, 'silent');
        $('#txn-lvl').data('lvl', txnLvl);
        clearLvlErrs('#Taxon_errs');
        enableChngPrntBtttn();
    }
    /** Enables the button if the change-parent form isn't already open. */
    function enableChngPrntBtttn() {
        if ($('#sub-form').length ) { return; }
        $('#chng-prnt').attr({'disabled': false}).css({'opacity': '1'});
    }
    /** Note: error used for the publication form. */
    function handleOpenSubForm(elem, errTag, formLvl) {  
        var subEntity = fParams.forms[formLvl] ? fParams.forms[formLvl].entity : '';
        var msg = '<p>Please finish the open '+ _util.ucfirst(subEntity) + ' form.</p>';
        setErrElemAndAppend(elem, msg, errTag);
        $('#'+formLvl+'-form').bind('destroyed', clrOpenSubForm.bind(null, elem));
    }
    function clrOpenSubForm(elem, e) {   
        clearLvlErrs(elem);
    }
    /* ----------- Error-Elem Methods -------------- */
    /** Returns the error div for the passed field. */
    function getErrElem(fieldName) {                                            //console.log("getErrElem for %s", fieldName);
        var field = fieldName.split(' ').join('');
        var elem = $('#'+field+'_errs')[0];    
        elem.className += ' active-errs';
        return elem;
    }   
    function setErrElemAndAppend(elem, msg, errTag) {
        elem.innerHTML = msg;
        $(elem).append(getErrExitBttn(errTag, elem));
        disableSubmitBttn('#top-submit');
    }
    function getErrExitBttn(errTag, elem) {
        var exitHdnlrs = {
            isGenusPrnt: clrIsGenusPrnt, needsGenusPrnt: clrNeedsGenusPrntErr, 
            noGenus: clrNoGenusErr, needsHigherLvl: clrNeedsHigherLvl, 
            needsHigherLvlPrnt: clrNeedsHigherLvlPrnt, openSubForm: clrOpenSubForm
        };
        var bttn = getExitButton();
        bttn.className += ' err-exit';
        $(bttn).off('click').click(exitHdnlrs[errTag].bind(null, elem));
        return bttn;
    }
    function clearErrElemAndEnableSubmit(elem) {                                //console.log('clearErrElemAndEnableSubmit. [%O] innerHTML = [%s] bool? ', elem, elem.innerHTML, !!elem.innerHTML)
        clearErrElem(elem);
        if (!$('#sub-form').length) { enableSubmitBttn('#top-submit'); }
    }
    function clearErrElem(elem) {
        if (!elem.innerHTML) { return; }
        elem.innerHTML = '';
        elem.className = elem.className.split(' active-errs')[0];
    }









 
/*=================== Content Block WYSIWYG ======================================================*/
    /**
     *  Adds edit content button to the top of any page with editable content blocks.
     */
    function initWysiwyg() {
        var contentBlocks = $('.wysiwyg');                                      //console.log("contentBlocks = %O", contentBlocks);
        if (contentBlocks.length > 0) { addEditContentButton(); }
    } /* End initWysiwyg */
    function addEditContentButton() {
        var button = $('<button/>', {
            text: "Edit Content", 
            id: 'editContentBttn',
            class: 'adminbttn',
            click: toggleContentBlockEditing
        });  //console.log("button = %O", button)
        button.css({
            position: "absolute",
            top: "8px",         // We were using px for the 'batplant.org' just above this button...  
            right: "10px"       // in the interest of visual consistency, I am using px to style this as well.
        });
        $('#hdrtext').append(button);
        $('#editContentBttn').data('editing', false);  // tracks which content block contains the active editor, if any.
    }
    /**
     * Manages init and exit 'edit states' and related ui on the page.
     */
    function toggleContentBlockEditing() { 
        var editorElem = $('#editContentBttn').data('editing');      //   console.log("togggling.  editorElem = %O", editorElem)
        if (editorElem !== false) {
            $('#editContentBttn').text("Refreshing...");
            location.reload(true);
        } else {
            addEditPencils();
            $('#editContentBttn').data('editing', true)
            $('#editContentBttn').text("Cancel Edit");
        }
    }
    /**
     * Extends the Trumbowyg library to include 'save' and 'cancel' buttons 
     * for the interface. The save button updates the content block in the 
     * database and then refreshes the page. 
     */
    function addButtons() {
        (function($) {
            $.extend(true, $.trumbowyg, { 
                langs: {
                    en: {
                        save: 'Save',
                        cancel: 'Cancel'
                    },
                },
                plugins: {
                    save: { // plugin name
                        init: function(trumbowyg) { 
                            const btnDef = {
                                hasIcon: false,
                                fn: function() {                            // console.log("saving. trumbowyg = %O", trumbowyg );
                                    var blkId = trumbowyg.o.plugins.save.id;
                                    var data = { content: $('#' + blkId ).trumbowyg('html')};            // console.log("blkId = ", blkId)
                                    var url = "admin/contentblock/" + blkId + "/update";
                                    sendAjaxQuery(data, url, wysiwygSubmitSuccess);
                                    // $.ajax({
                                    //     method: "POST",
                                    //     url: "admin/contentblock/" + blkId + "/update",
                                    //     success: wysiwygSubmitSuccess,
                                    //     error: ajaxError,
                                    //     data: JSON.stringify()
                                    // });
                                }
                            };
                            trumbowyg.addBtnDef('save', btnDef);
                        }
                    }
                }
            });
        })(jQuery);
    } /* End addButtons */
    /** Reloads the page on content block update success */
    function wysiwygSubmitSuccess(data, textStatus, jqXHR) { 
        console.log("Success is yours!! = %O", data);
        location.reload(true);
    }
    /** Returns the block container id by removing '-edit' from the passed editId */
    function getBlockContainerId(editId) {
        var elemIdAry = editId.split('-'); 
        elemIdAry.pop();
        return elemIdAry.join('-');
    }
    /** 
     * Adds edit pencil icons to the top left of every content block container,
     * any div with class 'wysiwyg', on the page.
     */
    function addEditPencils() {     
        var editIcoSrc = ($('body').data('env') === "dev" ? '../' : '') + 'bundles/app/images/eif.pencil.svg';  
        var contentBlocks = $('.wysiwyg');  //console.log("contentBlocks = %O", contentBlocks);
        
        for (var i = 0; i < contentBlocks.length; i++) {
            var blkId = contentBlocks[i].id;  //console.log("blkId = ", blkId);
            var blkEditId = blkId + '-edit';
            $('#' + blkId).append('<img src="' + editIcoSrc + '" ' + 'id="' + blkEditId + '" ' +
            'class="wsywigEdit" title="Edit Content" alt="Edit Content">');
            addButtons(blkEditId, blkId);
        }
        $('.wsywigEdit').click(startWysiwyg);
        /** Starts the wysiwyg editor. If 'super' admin, includes additional buttons. */
        function startWysiwyg(e) { // console.log("starting! e.parent = %O", e.target)
            var containerElemId = getBlockContainerId(e.target.id); //console.log("containerElemId = ", containerElemId)
            var bttns = [
                ['formatting'],
                'btnGrp-semantic',
                // ['superscript', 'subscript'],
                ['link'],
                // ['insertImage'],
                'btnGrp-justify',
                'btnGrp-lists',
                ['horizontalRule'],
                ['save']
            ];
            $('#editContentBttn').data('editing', containerElemId); // tracks which content block contains the active editor
            removeEditPencils();   //adds developer buttons
            
            if (userRole === "super") { bttns.splice(6, 0, ['viewHTML', 'removeformat']); }
            
            $('#' + containerElemId).trumbowyg({    
                btns: bttns,
                autogrow: false,
                plugins: {  // options object unique to each instance of the wysiwyg.
                    save: {
                        id: containerElemId
                    }
                }
            });
        }
    } /* End addEditPencils */
    /** Removes every edit pencil icon on the page */
    function removeEditPencils() {
        $('.wsywigEdit').remove();  
    }
/*-----------------AJAX Callbacks---------------------------------------------*/
    function sendAjaxQuery(dataPkg, url, successCb, errCb) {                    console.log("Sending Ajax data =%O arguments = %O", dataPkg, arguments)
        $.ajax({
            method: "POST",
            url: url,
            success: successCb || dataSubmitSucess,
            error: errCb || ajaxError,
            data: JSON.stringify(dataPkg)
        });
    }
    /**
     * Stores reference objects for posted entities with each record's temporary 
     * reference id and the new database id.     
     * Interactions are sent in sets of 1000, so the returns are collected in an array.
     */
    function dataSubmitSucess(data, textStatus, jqXHR) { 
        console.log("Ajax Success! data = %O, textStatus = %s, jqXHR = %O", data, textStatus, jqXHR);
    }
    function ajaxError(jqXHR, textStatus, errorThrown) {
        console.log("ajaxError. responseText = [%O] - jqXHR:%O", jqXHR.responseText, jqXHR);
    }

}());  // End of namespacing anonymous function 