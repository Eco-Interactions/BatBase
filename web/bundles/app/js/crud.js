/**
 * When logged in as an 'admin' or 'super': 
 * >> On the database search page, multiple admin-ui elements are added that open 
 * a popup interface allowing the creating, updating and, soon, deleting of data.   
 * >> All Content Blocks will have an edit icon attached to the top left of their 
 * container. When clicked, a wysiwyg interface will encapsulate that block and 
 * allow editing and saving of the content within using the trumbowyg library.
 */
$(document).ready(function(){  
    var userRole, envUrl, crudParams = {};
    var eif = ECO_INT_FMWK;
    var _util = eif.util;

    document.addEventListener('DOMContentLoaded', onDOMContentLoaded); 
  
    function onDOMContentLoaded() { 
        userRole = $('body').data("user-role");                                 //console.log("crud.js role = ", userRole);                               console.log("----userRole =", userRole)
        envUrl = $('body').data("ajax-target-url");
        authDependentInit(); 
    }
    function authDependentInit() {   
        if (userRole === "admin" || userRole === "super") {                     //console.log("admin CRUD ACTIVATE!! ");
            if ($('body').data("this-url") === "/search") {
                buildSearchPgCrudUi();
            } 
            initWysiwyg();
        }
    }
/*--------------------- SEARCH PAGE CRUD -------------------------------------*/
    /*---------- CRUD Window Funcs -------------------------------------------*/
    /** Adds a "New" button under the top grid focus options. */
    function buildSearchPgCrudUi() {
        var bttn = _util.buildElem('button', { 
                text: "New", name: 'createbttn', class: "adminbttn" });
        $(bttn).click(initInteractionCrud);
        $("#opts-col1").append(bttn);
    }
    /**
     * Builds the crud window popup @showEntityCrudPopup and loads the form @initCrudView.
     */
    function initInteractionCrud() {                                            console.log("***initInteractionCrud***")
        showEntityCrudPopup();
        initCrudView();
    }
    /** Builds and shows the crud popup from @getCrudHtml */
    function showEntityCrudPopup() {
        $("#b-overlay-popup").addClass("crud-popup");
        $("#b-overlay").addClass("crud-ovrly");
        $("#b-overlay-popup").append(getCrudWindowElems("New Interaction"));
        setPopUpPos();
        $('#b-overlay-popup, #b-overlay').show();
    }
    /** Sets popup top using parent position. */
    function setPopUpPos() {
        var parentPos = $('#b-overlay').offset();  
        $('#b-overlay-popup').offset({ top: (parentPos.top + 88)});          
    }
    function hideSearchCrudPopup() {
        $('#b-overlay-popup, #b-overlay').hide();
    }
    /**
     * Builds the main crud window elements.
     * section>(header, div#crud-main, footer)
     */
    function getCrudWindowElems(title) {
        var cntnr = _util.buildElem("section");
        $(cntnr).append(getHeaderHtml(title));
        $(cntnr).append(_util.buildElem("div", { "id": "crud-main" }));
        $(cntnr).append(_util.buildElem("footer"));
        return cntnr;        
    }
    function getHeaderHtml(title) {
        var hdrSect = _util.buildElem("header", { "id": "crud-hdr" });
        $(hdrSect).append(_util.buildElem("h1", { "text": title }));
        $(hdrSect).append(_util.buildElem("p"));
        return hdrSect;
    }
/*------------------- Form Functions -------------------------------------------------------------*/
    /**
     * Fills the global crudParams obj with the basic crud params @initCrudParams. 
     * Init the crud form and append into the crud window @initCrudForm. 
     */
    function initCrudView() {
        initCrudParams("create");
        initCrudForm();
    }       
    /**
     * Resets and fills the global crudParams obj with the params necessary throughout
     * the crud form interface.
     */
    function initCrudParams(action) {
        crudParams = {};
        // crudParams.view = "source";
        crudParams.action = action;
        crudParams.srcFields = { "Display Name": "text", "Description": "textArea", 
            "Year": "text", "Doi": "text", "Link Text": "text", "Link Url": "text", 
            "Authors": "multiSelect" };
        crudParams.types = {
            "source": JSON.parse(localStorage.getItem('srcTypes')).sort(),
            "citation": JSON.parse(localStorage.getItem('citTypes')).sort(),
            "publication": JSON.parse(localStorage.getItem('pubTypes')).sort(),
        };
        crudParams.records = {
            "source": JSON.parse(localStorage.getItem('srcRcrds'))
        }
    }
    /**
     * Inits the interaction form with only two elements- a publication dropdown 
     * and a disabled citation title dropdown that will become active upon publication 
     * selection. Both dropdowns will display create forms when the user enters a title 
     * not currently in the database. Upon citation selection the form will continue 
     * to generate fields and sub-forms as the user's input indicates neccessary. 
     */
    function initCrudForm() {
        var formCntnr = buildCrudFormCntnr();
        var srcFields = buildSrcFields();
        $(formCntnr).append(srcFields);
        $('#crud-main').append(formCntnr);
        initSrcComboboxes();
    }      
    /** Builds the form elem container. */
    function buildCrudFormCntnr() {
        var form = document.createElement("form");
        $(form).attr({"action": "", "method": "POST", "name": "crud"});
        form.className = "crud-form flex-row";
        return form;
    }
    /** Inits the main source form fields: publication and citation. */
    function buildSrcFields() {
        var pubSel = buildPubField();
        var citSel = buildCitField();
        return [pubSel, citSel];
    }
    /*-------------- Publication Helpers -----------------------------------*/
    /**
     * Returns a form row with a publication select dropdown populated with all 
     * current publication titles.
     */
    function buildPubField() {
        var selElem;
        var pubObj = JSON.parse(localStorage.getItem('publications'));
        var opts = Object.keys(pubObj).sort().map(function(name) {
            return { value: pubObj[name].toString(), text: name };
        });  
        selElem = _util.buildSelectElem(opts, {id: "pub-sel", class: "lrg-crud-sel"});
        return buildFormRow("Publication", selElem, false, true);
    }
    /** When a publication is selected fill citation dropdown @initCitField.  */
    function onPubSelection(val) { 
        if (val === "" || parseInt(val) === NaN) { return; }                                
        initCitField(val);
    }
    /**
     * When a user enters a new publication into the combobox, a create-publication
     * form is built and appended to the publication field row. An option object is 
     * returned to be selected in the publication combobox
     */
    function initPubForm(val) {  console.log("Adding new pub! val = %s", val);
        var subFormContainer = _util.buildElem('div', {
            id: 'sub-form', class: 'flex-row flex-wrap'}); 
        var subForm = buildSubForm('publication', {"Title": val});
        subForm.push(buildSubFormBttns("Publication"));
        $(subFormContainer).append(subForm);
        $('form[name="crud"]').append(subFormContainer);
        initSubFormComboboxes();
        return { "value": "", "text": val };
    }
    /*-------------- Publisher Helpers -----------------------------------*/
    function addExistingPublisher(val) {  console.log("Add existing publisher = %s. args = %O", val, arguments);
        return { value: val, text: $(this)[0].options[val] };
    }
    function initPublisherForm (val) {        console.log("Adding new publisher! val = %s", val);

    }

    /*-------------- Author Helpers ----------------------------------------*/
    /**
     * When an author is selected, a new author combobox is initialized underneath
     * 'this' author combobox.
     */
    function onAuthSelection(val) {                                             //console.log("Add existing author = %s", val);
        var cnt = $("#Authors_sel-cntnr").data("cnt") + 1;                          
        var selConfg = { 
            name: "Author", id: "#Authors-sel"+cnt, 
            change: onAuthSelection, add: initAuthForm 
        };
        $("#Authors_sel-cntnr").append(
            buildSelectElem( crudParams.subForm.entity, "Authors", cnt ));   
        $("#Authors_sel-cntnr").data("cnt", cnt);
        initSelectCombobox(selConfg);
    }
    function initAuthForm (val) {        console.log("Adding new auth! val = %s", val);
    }
    /*-------------- Citation Helpers --------------------------------------*/
    /** Returns a form row with an empty and disabled citation select dropdown. */
    function buildCitField() {
        var selElem = _util.buildSelectElem(
            [], {id: "cit-sel", class: "lrg-crud-sel"}, onCitSelection)
        $(selElem).attr("disabled", true);
        return buildFormRow("Citation Title", selElem, false, true);
    }
    /**
     * Fills the citation field combobox with all citations for the selected publication.
     * Clears any previous options and enables the dropdown.
     */
    function initCitField(pubId) {                                              console.log("initCitSelect for publication = ", pubId);
        var pubRcrd = crudParams.records.source[pubId];  
        var citOpts = getPubCitationOpts(pubRcrd);  
        var sel = $('#cit-sel')[0].selectize;
        sel.clearOptions();
        sel.addOption(citOpts);
        sel.enable();
    }
    /** Returns an array of option objects with citations for this publication.  */
    function getPubCitationOpts(pubRcrd) {
        return pubRcrd.childSources.map(function(citId) {
            return { value: citId, text: crudParams.records.source[citId].displayName };
        });
    }
    function onCitSelection(val) {  
        if (val === "") { return; }  console.log("cit selection = ", parseInt(val));
    }
    function initCitForm(val) {  console.log("Adding new cit! val = %s", val);
        // body...
    }
    /*------------------- Shared Methods --------------------------------------*/
    /**
     * Uses the 'selectize' library to turn the select dropdowns into input comboboxes
     * that allow users to search by typing and add new options not in the list-
     * by triggering a sub-form for that entity.
     */
    function initSrcComboboxes() {
        var selMap = { 
            'pub': { name: 'Publication', id: '#pub-sel', change: onPubSelection, add: initPubForm },
            'cit': { name: 'Citation', id: '#cit-sel', change: onCitSelection, add: initCitForm }
        };
        for (var selType in selMap) { initSelectCombobox(selMap[selType]); }
    }
    /** Inits the combobox, using 'selectize', according to the passed conifg. */
    function initSelectCombobox(confg) {
        $(confg.id).selectize({
            create: confg.add,
            onChange: confg.change,
            placeholder: 'Select ' + confg.name
        });
    }
    /**
     * Inits 'selectize' for each select elem in the subForm's 'selElems' array
     * according to the 'selMap' config. Empties array after intializing.
     */
    function initSubFormComboboxes() {
        var confg;
        var selMap = { 
            "Publication_Type": { name: "Publication Type", change: false, add: false },
            "Authors": { name: "Authors", change: onAuthSelection, add: initAuthForm },
            "Publisher": { name: "Publisher", change: addExistingPublisher, add: initPublisherForm },
        };
        crudParams.subForm.selElems.forEach(function(field) {                   //console.log("Initializing --%s-- select", field);
            confg = selMap[field];
            confg.id = confg.id || '#'+field+'-sel';
            initSelectCombobox(confg);
        });
        crudParams.subForm.selElems = [];
    }
    /** 
     * Builds all fields for sub-form and returns the row elems.
     * Also adds the sub-form config obj to the global crudParams obj.
     */
    function buildSubForm(entity, fieldVals) {
        var formConfg = getSrcTypeFormConfg(entity);                     //console.log("typeFormConfg = %O", typeFormConfg)
        crudParams.subForm = {};
        crudParams.subForm.entity = entity;
        crudParams.subForm.selElems = []; 
        crudParams.subForm.confg = formConfg;
        return getFormFieldRows(entity, formConfg, crudParams.srcFields, fieldVals, true);
    }
    /**
     * Returns a container with 'Create Entity' and 'Cancel' buttons.
     * NOTE: Currently specific to sub-forms. 
     */
    function buildSubFormBttns(entity) {
        var cntnr = _util.buildElem("div", { class: "flex-row bttn-cntnr" })
        var submit = _util.buildElem("input", { id: "crud-submit", 
            class: "ag-fresh grid-bttn", type: "button", value: "Create "+entity});
        var cancel = _util.buildElem("input", { id: "crud-cancel", 
            class: "ag-fresh grid-bttn", type: "button", value: "Cancel"});
        $(submit).attr("disabled", true).css("opacity", ".6").click(Function.prototype);
        $(cancel).css("cursor", "pointer").click(exitSubForm);
        $(cntnr).append([submit, cancel]);
        return cntnr;
    }
    /** Removes the sub-form. */
    function exitSubForm() {
        $('#sub-form').remove();
    }
    /** Enables passed submit button */
    function enableSubmitBttn(bttnId) {
        $("#"+bttnId).attr("disabled", false).css({"opacity": "1", "cursor": "pointer"}); 
    }    
    /**
     * Returns a config object for the form of the selected source-type with the 
     * fields to add to and exclude from the default source fields, the required
     * fields, and the final order of the fields.
     * Notes: 
     * >> 'order' is used to matched the form elements' id, which has no spaces. 
     * >> The publisher form is currenty non-existant
     */
    function getSrcTypeFormConfg(type) {
        var fieldMap = { 
            "author": { 
                "add": { "First Name": "text", "Middle Name": "text", "Last Name": "text"}, 
                "exclude": ["Description", "Year", "Doi", "Authors"],
                "required": ["Last Name"], 
                "order": [ "DisplayName", "FirstName", "MiddleName", "LastName", 
                    "LinkUrl", "LinkText"]
            },
            "citation": {
                "add": { "Publication": "text", "Title": "text", "Volume": "text", 
                    "Issue": "text", "Pages": "text", "Tags": "checkbox", 
                    "Citation Text": "textArea", "Citation Type": "select"},
                "exclude": ["Display Name", "Description"], 
                "required": ["Publication", "Citation Text", "Citation Type"],
                "order": ["CitationType", "CitationText", "Publication", "Title",    
                    "Year", "Volume", "Issue", "Pages", "Doi", "LinkUrl", "LinkText", 
                    "Tags", "Authors" ]
            },
            "publication": {
                "add": { "Title" : "text", "Publication Type": "select", "Publisher": "select" },  
                "exclude": ["Display Name"],
                "required": ["Publication Type", "Title"],
                "order": ["Title", "Description", "PublicationType", "Year", "Doi",  
                    "LinkUrl", "LinkText", "Publisher", "Authors" ]
            },
            "publisher": { 
                "add": [], 
                "exclude": ["Year", "Doi", "Authors"],
                "required": ["DisplayName"],
                "order": ["DisplayName", "Description", "LinkUrl", "LinkText"] }
        };
        return fieldMap[type];
    }
    /**
     * Builds all rows for the sub-form according to the passed formConfig obj. 
     * Returns a container div with the rows ready to be appended to the form window.
     */
    function getFormFieldRows(entity, formCnfg, dfltFields, fieldVals, isSubForm) {                   //console.log("  Building Form rows. arguemnts = %O", arguments);
        var buildFieldType = { "text": buildTextInput, "textArea": buildTextArea, 
            "select": buildSelectElem, "checkbox": buildCheckboxInput, 
            "multiSelect": buildMultiSelectElem };
        var defaultRows = buildDefaultRows();
        var additionalRows = buildAdditionalRows();
        return orderRows(defaultRows.concat(additionalRows), formCnfg.order);

        /**
         * Builds a row for each default field not explicitly excluded. If exclude
         * is set to true, all default fields are excluded. 
         */
        function buildDefaultRows() {                                           //console.log("    Building default rows");
            var exclude = crudParams.subForm.confg.exclude;
            var rows = [];
            for (var field in dfltFields) {  
                if (exclude === true || exclude.indexOf(field) !== -1) { continue; }                //console.log("      field = ", field);
                rows.push(buildRow(field, dfltFields, isSubForm));
            }
            return rows;
        }
        function buildAdditionalRows() {                                        //console.log("    Building additional rows");
            var xtraFields = crudParams.subForm.confg.add;
            var rows = [];
            for (var field in xtraFields) {                                     //console.log("      field = ", field);
                rows.push(buildRow(field, xtraFields, isSubForm));
            }
            return rows;
        }
        /**
         * Builds field input @buildFieldType, stores whether field is required, 
         * and sends both to @buildFormRow, returning the completed row elem.
         * Sets the value for the field if it is in the passed 'fieldVals' obj. 
         */
        function buildRow(field, fieldsObj, isSubForm) {
            var fieldInput = buildFieldType[fieldsObj[field]](entity, field);      
            var reqFields = crudParams.subForm.confg.required;
            var isReq = reqFields.indexOf(field) !== -1;
            if (field in fieldVals) { $(fieldInput).val(fieldVals[field]); }
            return buildFormRow(_util.ucfirst(field), fieldInput, isSubForm, isReq);
        }
    } /* End getFormFieldRows */
    function buildTextInput(entity, field) {                                           //console.log("            buildTextInput");
        return _util.buildElem("input", { "type": "text", class:"txt-input" });
    }
    function buildTextArea(entity, field) {                                            //console.log("            buildTextArea");
        return _util.buildElem("textarea");
    }
    /**
     * Creates and returns a select dropdown for the passed field. If it is one of 
     * a larger set of select elems, the current count is appended to the id. Adds 
     * the sel's fieldName to the subForm's 'selElem' array to later init 'selectize' 
     * combobox. Adds a data property "valType" for use later during validation.
     */
    function buildSelectElem(entity, field, cnt) {                                   
        var fieldName = field.split(" ").join("_");
        var opts = getSelectOpts(entity, fieldName);                            //console.log("entity = %s. field = %s, opts = %O ", entity, field, opts);
        var fieldId = cnt ? fieldName+"-sel"+cnt : fieldName+"-sel";
        var sel = _util.buildSelectElem(opts, { id: fieldId , class: 'sml-crud-sel'});
        crudParams.subForm.selElems.push(fieldName);
        $(sel).data("valType", "select");
        return sel;
    }
    /** Returns and array of options for the passed field type. */
    function getSelectOpts(entity, field) {
        var optMap = {
            "publication": { 
                "Authors": buildOptsObj(JSON.parse(localStorage.getItem('authors'))),
                "Publication_Type": getTypeOpts('publication'),
                "Publisher": buildOptsObj(JSON.parse(localStorage.getItem('publishers'))) },
            "citation": { "Citation_Type": getTypeOpts('citation') },
        };
        return optMap[entity][field];
    }
    /** Builds options out of the entity's types array */
    function getTypeOpts(entityType) {
        var typeAry = crudParams.types[entityType];
        return _util.buildSimpleOpts(typeAry);
    }
    /** Builds options out of the entity object, with id as 'value'. */
    function buildOptsObj(entityObj) {
        var sortedNameKeys = Object.keys(entityObj).sort();
        return sortedNameKeys.map(function (name) {
            return { value: entityObj[name], text: name }
        });    
    }
    /**
     * Creates a select dropdown field wrapped in a div container that will
     * be reaplced inline upon selection. Either with an existing Author's name, 
     * or the Author create form when the user enters a new Author's name. 
     */
    function buildMultiSelectElem(entity, field) {                                   //console.log("entity = %s. field = ", entity, field);
       var cntnr = _util.buildElem("div", { id: field+"_sel-cntnr"});
       var selElem = buildSelectElem(entity, field);
       $(cntnr).data("cnt", 1);
       $(selElem).data("valType", "multiSelect");
       $(cntnr).append(selElem);
       return cntnr;
    }
    /**
     * Returns a div containing a checkbox, span-wrapped with associated label, 
     * for each of the hard-coded tags in the opts-obj. NOTE: Only citations and 
     * interactions have tags currently. Eventually tags will be pulled from the server.
     */
    function buildCheckboxInput(entity) {                                       //console.log("            entity = %s buildCheckboxInput", entity);
        // var opts = { "citation": ["Secondary"] }; 
        // var optCntnr = _util.buildElem("div", { "class": "flex-grow form-input" });
        // opts[entity].forEach(function(opt) {
        //     $(optCntnr).append(buildOptsElem(opt));
        // });
        // return optCntnr;
    }
    /**
     * Builds the checkbox elem and it's label. Adds a valType data property for 
     * use during validation.
     */
    // function buildOptsElem(opt) {
    //     var span = document.createElement("span");
    //     var input = _util.buildElem("input", { "type": "checkbox", id: opt+"_check"});
    //     var lbl = _util.buildElem("label", { "text": opt, "class": "checkbox-lbl" });
    //     $(input).data("valType", "checkbox");
    //     lbl.htmlFor = opt+"_check";
    //     $(span).append([input, lbl]);
    //     return span;
    // }
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





    // /** Returns the full, contextual url for the passed entity and action.  */
    // function getEntityUrl(entityName, action) {
    //     return envUrl + entityName + "/" + action;
    // }
    /*------------------- Form Builders --------------------------------------*/
    /**
     * Each element is built, nested, and returned as a completed row. 
     * rowDiv>(errorDiv, fieldDiv>(fieldLabel, fieldInput))
     */
    function buildFormRow(fieldName, fieldInput, isSubForm, isReq) {
        var field = fieldName.split(' ').join('');
        var rowClass = isSubForm ? 'sub-form-row' : 'form-row';
        var rowDiv = _util.buildElem("div", { class: rowClass, id: field + "_row"});
        var errorDiv = _util.buildElem("div", { class: "row-errors", id: field+"_errs"});
        var fieldRow = _util.buildElem("div", { class: "field-row flex-row"});
        var label = _util.buildElem("label", {text: _util.ucfirst(fieldName)});
        if (isReq) { $(label).addClass('required'); } //Adds "*" after the label (with css)
        $(fieldRow).append([label, fieldInput]);
        $(rowDiv).append([errorDiv, fieldRow]);
        return rowDiv;
    }
    /*----------------------- Validation ---------------------------------------------------------*/
    /**
     * Form submit handler calls @buildFormData to validate required fields have 
     * values and return a json-ready object of form data to send to the server 
     * @sendFormData.
     */
    function valSrcCrud(e) {           console.log("valSrcCrud called. NoOp.")                                             
        // var formData = buildSrcFormData();
        // sendFormData(formData);
    }
    function buildSrcFormData() {
        var formElems = $('form[name=crud]')[0].elements;                       console.log("formElems = %O", formElems);     
        return valAndProcessFormData(formElems, "source");
    }
    /**
     * If all required fields have values, an object is returned with a form data 
     * object for both the main entity fields and detail entity fields, if they exist.
     * eg: { source: { year: ####, displayName: XXXX}, publication: { displayName: XXXX }}
     */
    function valAndProcessFormData(formElems, mainEntity) {
        var detailEntity = _util.lcfirst(crudParams.types.source[$(formElems[0]).val()]);               //console.log("SourceType selected = ", type);
        var formData = {};
        var authors = [];
        formData[mainEntity] = {};
        formData[detailEntity] = {};
        /* skips source type select and submit button */
        for (var i = 1; i < formElems.length-1; i++) {     
            if ($(formElems[i]).data("noVal")) { continue; } /* No validation for this elem */
            processFormElem(formElems[i]);
        }                                                                       console.log("***__dataObj = %O", formData);
        postProcessing();
        return formData;    
        /** Sends form elems to appropriate handler.  */
        function processFormElem(formElem) {
            var fieldName = formElem.parentNode.innerText.trim();     
            var dbField = _util.lcfirst(fieldName.split(" ").join("")); 
            if ($(formElem).data("valType")) { 
                processComplexInputs(formElem, fieldName, dbField); 
            } else { 
                processSimpleInputFields(formElem, fieldName, dbField); }
        }
        /**
         * For form fields with complex processing, such as checkbox options or 
         * multi-input fields, the 'valType' data tag on the element triggers 
         * specific validation handlers for the field type.
         */
        function processComplexInputs(formElem, fieldName, dbField) {                               console.log("!!!__processComplexInputs for formElem = %O", formElem);
            var fieldType = $(formElem).data("valType");
            var cmplxFieldHndlr = { 
                "checkbox": processCheckboxData, "multiInput": processMultiInputData,
                "select": processSelectData
            }; 
            cmplxFieldHndlr[fieldType](formElem, fieldName, dbField);
        }
        function processSelectData(formElem, fieldName, dbField) {
            var selTypes = crudParams.types[detailEntity];
            var val = $(formElem).val();  console.log("val = ", val)
            if (val === "placeholder") { crudFieldErrorHandler(fieldName, "emptyRequiredField"); 
            } else {
                formData[detailEntity][dbField] = selTypes[val];
            }
        }
        /**
         * If this input elem has a value, the elem type is identified, e.g. author 
         * fields, and sent to be processed with the appropriate handler.
         */
        function processMultiInputData(formElem) {                              
            if ($(formElem).val() !== "") {                                        //console.log("processing MultiInputData for elem = %O, val = %s", formElem, formElem.value);
                if (formElem.parentElement.className.includes("auth-fields")) { 
                    processAuthorNameFields(formElem); 
                }
            }
        }
        /**
         * As authors can be dynamically added, the current row number is the unique 
         * identifier used for each author name row. After getting the row number,
         * the field name, and the entity proprty name (dbField), the field value is 
         * stored under the dbField name inside of an author object in the authors 
         * array at the index of [row number minus one]. Each author object will 
         * later be checked for invalid nulls and added to the formData object.
         */
        function processAuthorNameFields(formElem) {
            var rowNum = formElem.parentElement.parentElement.id.split("-").pop();              
            var fieldName = formElem.placeholder.split("-")[1]; 
            var dbField = _util.lcfirst(fieldName.split(" ").join("")); 
            if (!authors[rowNum-1]) { authors[rowNum-1] = {}; }
            authors[rowNum-1][dbField] = $(formElem).val();
        }
        /**
         * If option is checked, the form elem and the field name, @getCheckboxFieldName, 
         * are sent to handler to be added to the formData obj.
         */
        function processCheckboxData(formElem) {                                    //console.log("valCheckboxData called for elem = %O, val = %s", formElem, formElem.checked)
            var fieldName = getCheckboxFieldName(formElem);
            if (formElem.checked) {
                if (fieldName === "tags") { addTagsToFormData(formElem, fieldName); }
            }  
        }
        /** Returns the lower-cased field name from the option's field container id. */
        function getCheckboxFieldName(formElem) {
            var fieldCntnr = formElem.parentElement.parentElement.parentElement.parentElement;
            var fieldName = _util.lcfirst(fieldCntnr.id.split("_row")[0]);       //console.log("fieldName = ", fieldName); 
            return fieldName;
       }
        /** Adds the tag to a tag's array in the main entity obj of formData. */
        function addTagsToFormData(formElem, fieldName) {
            var tag = formElem.id.split("_check")[0];
            if (!formData[mainEntity][fieldName]) { formData[mainEntity][fieldName] = []; }
            formData[mainEntity][fieldName].push(tag);
        }
        /**
         * Processes fields where all that is required is to get the field name, 
         * from the parent label, and the field value. If the value is not empty 
         * @addFieldData is called to store the form data, else @isEmptyRequiredField
         * is checked for invalid nulls and, if so, an error is shown to the user.
         */
        function processSimpleInputFields(formElem, fieldName, dbField) {                           //console.log("processSimpleInputFields for formElem = %O", formElem);
            var fieldVal = $(formElem).val();  
            if (fieldVal !== "") { addFieldData(formElem, fieldName, dbField, fieldVal);
            } else { ifIsEmptyRequiredField(formElem, fieldName); }
        }
        /**
         * Adds the field value, keyed under the server-ready field name, to the 
         * appropriate entity object in formData.
         */
        function addFieldData(formElem, fieldName, dbField, fieldVal) {                  //console.log("addFieldDataToObj called for field = %s, val = %s", fieldName, fieldVal)
            if (fieldName in crudParams.srcFields) { 
                addFieldToFormData(dbField, fieldVal, mainEntity);
            } else {
                addDetailEntityFieldData(dbField, fieldVal); 
            }
        }
        function addMainEntityFieldData(field, val) {
            formData[mainEntity][field] = val;
        }
        /**
         * Stores data from the detail entity fields, translating them as needed 
         * into the correct properties for both entities, the main and the detail.
         */
        function addDetailEntityFieldData(field, val) {
            var fieldTransMap = {
                "publication": { 
                    "title": { "source": "displayName", "publication": "displayName" },
                    "publisher": { "source": "parentSource" }
                },
                "citation": { 
                    "publication": { "source": "parentSource" },
                    "citationText": { "source": "description", "citation": "fullText" },
                    "title": { "source": "displayName", "citation": "displayName",
                        "citation": "title" 
                    }
            }};
            if (detailEntity in fieldTransMap) {
                processFieldTranslation(field, val, fieldTransMap[detailEntity]);
            } else {
                addFieldToFormData(field, val, detailEntity);
            }
        }
        /**
         * If field is in translation map, @addTransFieldToFormData handles storing 
         * the data, otherwise @addFieldToFormData does.
         */
        function processFieldTranslation(field, val, fieldTrans) {
            if (field in fieldTrans) {  
                addTransFieldToFormData(field, val, fieldTrans[field]);
            } else {
                addFieldToFormData(field, val, detailEntity);
            }
        }
        /**
         * Adds the field data under the correct entity's property name(s) to formData.
         * Eg. 'citationText' becomes source's 'description' and citation's 'fullText'.
         */
        function addTransFieldToFormData(field, val, fieldTrans) {              //console.log("addToFormData %s, val = %s. trans = %O", field, val, fieldTrans);
            for (var entity in fieldTrans) {            
                formData[entity][fieldTrans[entity]] = val;
            }
        }
        function addFieldToFormData(field, val, entity) {
            formData[entity][field] = val;
        }
        /**
         * After all input elements in the form have been processed, special case
         * handling and post-processing of complex data can happen here. Ex: Authors,
         * i.e. multi-input fields, are checked for empty required fields and added 
         * to the form data object @valAuthorFields. 
         */
        function postProcessing() {
            if (authors.length) { valAuthorFields(); }
        }
        /**
         * For each author name row with data, checks to ensure the required field, 
         * last name, has a value. If not, an error is shown to the user. The authors
         * array is then added to the formData object.
         */
        function valAuthorFields() {
            authors.forEach(function(authObj, idx) {
                if (!authObj.lastName) {             
                    crudFieldErrorHandler("Last Name", "emptyRequiredField", $('#auth_'+(idx+1)+'_errs')[0]);
                }
            });
            formData[mainEntity].authors = authors;
        }
    } /* End valAndProcessFormData */
    /**
     * If field name is in the form config's required array, show an error on
     * that field to the user: "Please fill out [fieldName]."
     */
    function ifIsEmptyRequiredField(formElem, fieldName) {
        if (crudParams.subForm.confg.required.indexOf(fieldName) !== -1) {
            crudFieldErrorHandler(fieldName, "emptyRequiredField");
        }
    }
/*--------------------------- Helpers ----------------------------------------*/
    /*------------------- Error Handlers -------------------------------------*/
    /** Shows the user an error message above the field row. */
    function crudFieldErrorHandler(fieldName, errorTag, fieldErrElem) {         //console.log("###__crudFieldError- '%s' for '%s'. ErrElem = %O", fieldName, errorTag, fieldErrElem);
        var errMsgMap = {
            "emptyRequiredField" : "<p>Please fill in "+fieldName+".</p>"
        };
        var msg = errMsgMap[errorTag];
        var errElem = fieldErrElem || getErrElem(fieldName);
        errElem.innerHTML = msg;
    }
    /** Returns the error div for the passed field. */
    function getErrElem(fieldName) {                                            //console.log("getErrElem for %s", fieldName);
        var field = fieldName.split(' ').join('');
        return $('#'+field+'_errs')[0];    
    }
/*--------------------- Content Block WYSIWYG --------------------------------*/
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
    function sendAjaxQuery(dataPkg, url, successCb) {                           console.log("Sending Ajax data =%O arguments = %O", dataPkg, arguments)
        $.ajax({
            method: "POST",
            url: url,
            success: successCb || dataSubmitSucess,
            error: ajaxError,
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
        console.log("ajaxError = %s - jqXHR:%O", errorThrown, jqXHR);
    }

}());  // End of namespacing anonymous function 