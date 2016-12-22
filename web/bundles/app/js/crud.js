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
    // eif.crud = {};    

    // window.addEventListener('message', searchPgMsgHandler, false);
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
/*-------------------- CRUD Communication Functions --------------------------*/
    /** Recieves messages from the Search pg and executes the sent tag's handler. */
    function searchPgMsgHandler(msg) {                                          console.log('--crud msg recieved. %O', msg);
        msgMap[msg.data.tag](msg.data.data);
    }
    // To Send:  contentWindow.postMessage(msgData, envUrl);
    
/*--------------------- SEARCH PAGE CRUD -------------------------------------*/
    /*---------- CRUD Window Funcs -------------------------------------------*/
    /** Adds a "New" button under the top grid focus options. */
    function buildSearchPgCrudUi() {
        var bttn = _util.buildElem('button', { 
                text: "New", name: 'createbttn', class: "adminbttn" });
        $(bttn).click(initEntityCrud);
        $("#opts-col1").append(bttn);
    }
    /**
     * Gets the selected grid focus, either taxa, locations, or sources, and loads
     * its 'create' form in the crud window popup @showEntityCrudPopup.
     */
    function initEntityCrud() {
        var entityName = getFocusEntityName();                                  console.log("***initEntityCrud for ", entityName)
        var initCrudViewMap = { "source": initSrcCrudView };                        
        showEntityCrudPopup("New", entityName);
        initCrudViewMap[entityName]();
    }
    function getFocusEntityName() {
        var nameMap = { "locs": "location", "srcs": "source", "taxa": "taxon" };
        var focus = $('#search-focus').val();
        return nameMap[focus];
    }
    /** Builds and shows the crud popup from @getCrudHtml */
    function showEntityCrudPopup(action, entityName) {
        var newEntityTitle = action + " " + _util.ucfirst(entityName); 
        $("#b-overlay-popup").addClass("crud-popup");
        $("#b-overlay").addClass("crud-ovrly");
        $("#b-overlay-popup").append(getCrudWindowElems(newEntityTitle));
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
        cntnr.append(getHeaderHtml(title));
        cntnr.append(_util.buildElem("div", { "id": "crud-main" }));        
        cntnr.append(_util.buildElem("footer"));
        return cntnr;        
    }

    function getHeaderHtml(title) {
        var hdrSect = _util.buildElem("header", { "id": "crud-hdr" });
        hdrSect.append(_util.buildElem("h1", { "text": title }));
        hdrSect.append(_util.buildElem("p"));
        return hdrSect;
    }
/*-------------------------------- Source Funcs ------------------------------*/
    /**
     * Resets and fills the global crudParams obj with the basic universal src 
     * params @buildBaicSrcCrudParams. Creates the source form @initCrudSrcForm.
     */
    function initSrcCrudView() {
        buildBasicSrcCrudParams("create");
        initSrcCrudForm();
    }       
    /**
     * Resets and fills the global crudParams obj with the src params necessary for
     * all source crud views.
     */
    function buildBasicSrcCrudParams(action) {
        crudParams = {};
        crudParams.view = "source";
        crudParams.action = action;
        crudParams.srcTypes = ["Author", "Citation", "Publication", "Publisher"];
        crudParams.srcFields = { "Display Name": "text", "Description": "textArea", 
            "Year": "text", "Doi": "text", "Link Text": "text", "Link Url": "text", 
            "Authors": "dynamic" };
    }     
    /**
     * Creates the source form with relevant fields for the selected source-type. 
     * On init, only the source-type select row is shown. Once selected, the source 
     * form is built @initSrcTypeForm. Note: The volatileFieldsContainer holds 
     * all source-type specific fields.
     */
    function initSrcCrudForm() {
        var formCntnr = buildCrudFormCntnr();
        var volatileFieldsContainer = _util.buildElem('div', {
            id: 'field-rows', class: "flex-col flex-wrap"}); 
        var srcTypeFieldRow = buildSrcTypeRow();
        var submit = initSubmitBttn();
        $(formCntnr).append([srcTypeFieldRow, volatileFieldsContainer, submit]);
        $('#crud-main').append(formCntnr);
    }
    function initSubmitBttn() {
        var submit = _util.buildElem("input", { id: "crud-submit", 
            class: "ag-fresh grid-bttn", type: "button", value: "Create Source"});
        $(submit).hide().click(valSrcCrud);
        return submit;
    }
    function enableSubmitBttn() {
        $("#crud-submit").css("display", "initial"); 
    }
    /** Builds the row for the source-type field. */
    function buildSrcTypeRow() {
        var selElem = buildSrcTypeSelect();
        $(selElem).val("placeholder");
        $(selElem).find('option[value="placeholder"]').hide();
        return buildFormRow("Source Type", selElem, true);
    }
    /** Creates the source-type select dropdown. */
    function buildSrcTypeSelect() {
        var srcOpts = _util.buildSimpleOpts(crudParams.srcTypes, "-- Select type --");     
        return _util.buildSelectElem(srcOpts, null, initSrcTypeForm)
    }
    /**
     * Shows crud ui, all related form fields in labeled rows, for selected source-type.
     */
    function initSrcTypeForm(e) {                                        
        var selectedType = crudParams.srcTypes[$(this).val()];                             console.log("--Init srcType (%s) view", selectedType);
        crudParams.type = {};
        $('#field-rows').empty().append(createSrcTypeFields(selectedType));
        initFirstDynmcRow();
        enableSubmitBttn();
    }
    /** If form view contains a dynamic row, init the first instance of the row. */
    function initFirstDynmcRow() {
        if (crudParams.type.dynmcFormRowFunc) { 
            crudParams.type.dynmcFormRowFunc();
        }
    }
    /** 
     * Builds all fields for selected source-type and returns the row elems.
     * Also adds the source-type form config obj to the global crudParams obj.
     */
    function createSrcTypeFields(srcType) {
        var typeFormConfg = getSrcTypeFieldConfig(srcType);                     //console.log("typeFormConfg = %O", typeFormConfg)
        crudParams.type.formConfg = typeFormConfg;
        return getFormFieldRows(srcType, typeFormConfg, crudParams.srcFields);
    }
    /**
     * Returns a config object for the form of the selected source-type with the 
     * fields to add to and exclude from the default source fields, the required
     * fields, and the final order of the fields.
     * Note: 'order' and 'required' arrays are used to matched the form elements' 
     * id, which has no spaces. 
     */
    function getSrcTypeFieldConfig(type) {
        var fieldMap = { 
            "Author": { 
                "add": { "First Name": "text", "Middle Name": "text", "Last Name": "text"}, 
                "exclude": ["display Name", "Year", "Doi", "Authors"],
                "required": ["Last Name"], 
                "order": [ "LastName", "FirstName", "MiddleName", "Description", 
                    "LinkUrl", "LinkText"]
            },
            "Citation": {
                "add": { "Publication": "text", "Volume": "text", "Issue": "text", 
                    "Pages": "text", "Tags": "checkbox", "Citation Text": "textArea"},
                "exclude": [], 
                "required": ["Display Name", "Publication", "Citation Text"],
                "order": ["DisplayName", "CitationText", "Publication", "Year", 
                    "Volume", "Issue", "Pages", "Doi", "LinkUrl", "LinkText", 
                    "Tags", "Authors" ]
            },
            "Publication": {
                "add": { "Publisher": "text", "Title" : "text"},
                "exclude": ["Display Name"],
                "required": ["Title"],
                "order": ["Title", "Description", "Publisher", "Year", "Doi", 
                    "LinkUrl", "LinkText", "Authors" ]
            },
            "Publisher": { 
                "add": [], 
                "exclude": ["Year", "Doi", "Authors"],
                "required": ["DisplayName"],
                "order": ["DisplayName", "Description", "LinkUrl", "LinkText"] }
        };
        return fieldMap[type];
    }
    /*----------------------- Validation ---------------------------------------------------------*/
    /**
     * Form submit handler calls @buildFormData to validate required fields have 
     * values and return a json-ready object of form data to send to the server 
     * @sendFormData.
     */
    function valSrcCrud(e) {                                                        
        var formData = buildSrcFormData();
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
        var detailType = _util.lcfirst(crudParams.srcTypes[$(formElems[0]).val()]);            //console.log("SourceType selected = ", type);
        var formData = {};
        var authors = [];
        formData[mainEntity] = {};
        formData[detailType] = {};
        /* skips source type select and submit button */
        for (var i = 1; i < formElems.length-1; i++) {     
            processFormElem(formElems[i]);
        }                                                                       console.log("***__dataObj = %O", formData);
        postProcessing();
        return formData;    
        /** Sends form elems to appropriate handler.  */
        function processFormElem(formElem) {
            if ($(formElem).data("noVal")) { return; } /* No validation for this elem */
            if ($(formElem).data("valType")) { processComplexInputs(formElem); 
            } else { processSimpleInputFields(formElem); }
        }
        /**
         * For form fields with complex processing, such as checkbox options or 
         * multi-input fields, the 'valType' data tag on the element triggers 
         * specific validation handlers for the field type.
         */
        function processComplexInputs(formElem) {                               console.log("!!!__processComplexInputs for formElem = %O", formElem);
            var fieldType = $(formElem).data("valType");
            var cmplxFieldHndlr = { 
                "checkbox": processCheckboxData, "multiInput": processMultiInputData 
            }; 
            cmplxFieldHndlr[fieldType](formElem);
        }
        /**
         * If this input elem has a value, the elem type is identified, e.g. author 
         * fields, and sent to be processed with the appropriate handler.
         */
        function processMultiInputData(formElem) {                              
            if (formElem.value !== "") {                                        console.log("processing MultiInputData for elem = %O, val = %s", formElem, formElem.value);
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
            authors[rowNum-1][dbField] =  formElem.value;
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
        function processSimpleInputFields(formElem) {                           console.log("processSimpleInputFields for formElem = %O", formElem);
            var fieldName = formElem.parentNode.innerText.trim();               
            var fieldVal = $(formElem).val();  
            if (fieldVal !== "") { addFieldData(formElem, fieldName, fieldVal);
            } else { ifIsEmptyRequiredField(formElem, fieldName); }
        }
        /**
         * Adds the field value, keyed under the server-ready field name, to the 
         * appropriate entity object in formData.
         */
        function addFieldData(formElem, fieldName, fieldVal) {                  //console.log("addFieldDataToObj called for field = %s, val = %s", fieldName, fieldVal)
            var dbField = _util.lcfirst(fieldName).split(' ').join('');         //console.log("  dbField = ", dbField);
            if (fieldName in crudParams.srcFields) { 
                addMainEntityFieldData(dbField, fieldVal); 
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
                    "publication": { "source": "parentSource"}
            }};
            if (detailType in fieldTransMap) {
                if (field in fieldTransMap[detailType]) {  
                    addToFormData(field, val, fieldTransMap[detailType][field]);
                }
            }
        }
        /** Set field and value into formData for each entity passed in the fieldTrans object. */
        function addToFormData(field, val, fieldTrans) {                        //console.log("addToFormData %s, val = %s. trans = %O", field, val, fieldTrans);
            for (var entity in fieldTrans) {            
                formData[entity][fieldTrans[entity]] = val;
            }
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
        if (crudParams.type.formConfg.required.indexOf(fieldName) !== -1) {
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
    /*------------------- Form Builders --------------------------------------*/
    /** Builds the form elem container. */
    function buildCrudFormCntnr() {
        var form = document.createElement("form");
        $(form).attr({"action": "", "method": "POST", "name": "crud"});
        form.className = "crud-form";
        return form;
    }
    /**
     * Builds all rows for the form according to the passed formConfig obj. 
     * Returns a container div with the rows ready to be appended to the form window.
     */
    function getFormFieldRows(entity, formCnfg, dfltFields) {                   //console.log("  Building Form rows");
        var buildFieldType = { "text": buildTextInput, "checkbox": buildCheckboxInput,
            "textArea": buildTextArea, "dynamic": buildDynamcFieldGenBttn };  
        var defaultRows = buildDefaultRows();
        var additionalRows = buildAdditionalRows();
        return orderRows(defaultRows.concat(additionalRows), formCnfg.order);

        /**
         * Builds a row for each default field not explicitly excluded. If exclude
         * is set to true, all default fields are excluded. 
         */
        function buildDefaultRows() {                                           //console.log("    Building default rows");
            var exclude = crudParams.type.formConfg.exclude;
            var rows = [];
            for (var field in dfltFields) {  
                if (exclude === true || exclude.indexOf(field) !== -1) { continue; }                //console.log("      field = ", field);
                rows.push(buildRow(field, dfltFields));
            }
            return rows;
        }
        function buildAdditionalRows() {                                        //console.log("    Building additional rows");
            var xtraFields = crudParams.type.formConfg.add;
            var rows = [];
            for (var field in xtraFields) {                                     //console.log("      field = ", field);
                rows.push(buildRow(field, xtraFields));
            }
            return rows;
        }
        /**
         * Builds field input @buildFieldType, stores whether field is required, 
         * and sends both to @buildFormRow, returning the completed row elem.
         */
        function buildRow(field, fieldsObj) {
            var fieldInput = buildFieldType[fieldsObj[field]](entity, field);      
            var reqFields = crudParams.type.formConfg.required;
            var isReq = reqFields.indexOf(field) !== -1;
            return buildFormRow(_util.ucfirst(field), fieldInput, isReq);
        }
    } /* End getFormFieldRows */
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
    function buildTextInput(entity, field) {                                           //console.log("            buildTextInput");
        return _util.buildElem("input", { "type": "text", class:"txt-input" });
    }
    function buildTextArea(entity, field) {                                            //console.log("            buildTextArea");
        return _util.buildElem("textarea");
    }
    /**
     * Returns a div containing a checkbox, span-wrapped with associated label, 
     * for each of the hard-coded tags in the opts-obj. NOTE: Only citations and 
     * interactions have tags currently. Eventually tags will be pulled from the server.
     */
    function buildCheckboxInput(entity) {                                       //console.log("            entity = %s buildCheckboxInput", entity);
        var opts = { "Citation": ["Secondary"] }; 
        var optCntnr = _util.buildElem("div", { "class": "flex-grow form-input" });
        opts[entity].forEach(function(opt) {
            $(optCntnr).append(buildOptsElem(opt));
        });
        return optCntnr;
    }
    /**
     * Builds the checkbox elem and it's label. Adds a valType data property for 
     * use during validation.
     */
    function buildOptsElem(opt) {
        var span = document.createElement("span");
        var input = _util.buildElem("input", { "type": "checkbox", id: opt+"_check"});
        var lbl = _util.buildElem("label", { "text": opt, "class": "checkbox-lbl" });
        $(input).data("valType", "checkbox");
        lbl.htmlFor = opt+"_check";
        $(span).append([input, lbl]);
        return span;
    }
    /**
     * Sets the dynamic field row generator method into the global prop that will 
     * later be used to init the first row. Builds and returns the add, '+', button
     * that will generate new field rows @creteFieldRowFunc[field] on click.  
     */
    function buildDynamcFieldGenBttn(entity, field) {                           //console.log("buildDynamcFieldGenBttn. entity = %s. field = %s.", entity, field);
        var createFieldRowFunc = {
            "Authors": { add: addAuthorFieldRow, rmv: removeAuthorFieldRow }
        };
        crudParams.type.dynmcFormRowFunc = createFieldRowFunc[field].add;
        return buildFieldGenBttns(field, createFieldRowFunc[field]); 
    }
    /**
     * Add '+' and '-' button next to field label bound to the field's passed 
     * generation and destruction functions.
     */
    function buildFieldGenBttns(field, dynmcFieldGenFuncs) {                    //console.log("buildFieldGenBttns. field = %s, funcs = %O", field, dynmcFieldGenFuncs);
        var cntnr =  _util.buildElem("div", { class: "flex-grow"});
        var addBttn = buildDynmcRowBttn("add", field, dynmcFieldGenFuncs.add);
        var rmvBttn = buildDynmcRowBttn("rmv", field, dynmcFieldGenFuncs.rmv);
        $(cntnr).append([addBttn, rmvBttn]);
        return cntnr;
    }
    /**
     * Builds a button to either add or remove a field row using the passed func.
     * Adds a 'noVal' data property so these elems are skipped during validation.
     */
    function buildDynmcRowBttn(action, field, func) {
        var text = action === "add" ? '+' : '-';
        var title = (action === "add" ? "Add" : "Remove") + ' ' + field;
        var bttn = _util.buildElem("button", { class: "grid-bttn dynmc-bttns", 
            id: field + "_"+ action, text: text, title: title, type: "button"});
        $(bttn).data("noVal", true);
        $(bttn).click(func);
        return bttn;
    }
    /**
     * Creates and appends a new author field row. Keeps tracks the number of author 
     * field rows in form using a 'cnt' data property on the field's parent container. 
     * Each name input field has a data property "valType" set for later validation.
     * rowDiv>(errorDiv, nameDiv>(first, middle, last, suffix))
     */
    function addAuthorFieldRow() {  
        var authRowCnt = ($('#Authors_row').data("cnt") || 0) + 1;              //console.log("addAuthorFieldRow #", authRowCnt);
        var rowDiv = _util.buildElem("div", { id: "auth-" + authRowCnt});
        var errorDiv = _util.buildElem("div", { class: "row-errors", id: "auth_"+authRowCnt+"_errs"});
        var nameDiv =  _util.buildElem("div", { class:"flex-row auth-fields" });
        var first = _util.buildElem("input", { type: "text", placeholder: '-First Name-'});
        var middle = _util.buildElem("input", { type: "text", placeholder: '-Middle Name-'});
        var last = _util.buildElem("input", { type: "text", placeholder: '-Last Name-*'});
        var sufx = _util.buildElem("input", { class:"auth-sufx", type: "text", placeholder: '-Suffix-'});
        $(nameDiv).append([first, middle, last, sufx]);
        $([first, middle, last, sufx]).data("valType", "multiInput");
        $(rowDiv).append([errorDiv, nameDiv]);
        $('#Authors_row').data("cnt", authRowCnt);
        $('#Authors_row').append(rowDiv);
    }
    function removeAuthorFieldRow() {
        var authRowCnt = $('#Authors_row').data("cnt");              //console.log("addAuthorFieldRow #", authRowCnt);
        $('#auth-'+authRowCnt).remove();
        $('#Authors_row').data("cnt", --authRowCnt);
    }
    /**
     * Each element is built, nested, and returned as a completed row. 
     * rowDiv>(errorDiv, fieldDiv>(fieldLabel, fieldInput))
     */
    function buildFormRow(fieldName, fieldInput, isReq) {
        var field = fieldName.split(' ').join('');
        var rowDiv = _util.buildElem("div", { class: "form-row", id: field + "_row"});
        var errorDiv = _util.buildElem("div", { class: "row-errors", id: field+"_errs"});
        var fieldRow = _util.buildElem("div", { class: "field-row flex-row"});
        var label = _util.buildElem("label", {text: _util.ucfirst(fieldName)});
        if (isReq) { $(label).addClass('required'); } //Adds "*" after the label (with css)
        $(fieldRow).append([label, fieldInput]);
        $(rowDiv).append([errorDiv, fieldRow]);
        return rowDiv;
    }
    /** Returns the full, contextual url for the passed entity and action.  */
    function getEntityUrl(entityName, action) {
        return envUrl + entityName + "/" + action;
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

}());  /* End of namespacing anonymous function */