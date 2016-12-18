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
            "Author": "dynamicText" };
    }     
    /**
     * Creates the source form with relevant fields for the selected source-type. 
     * On init, only the source-type select row is shown. Once selected, the source 
     * form is built @initSrcTypeForm. Note: The volatileFieldsContainer holds 
     * all source-type specific fields.
     */
    function initSrcCrudForm() {
        var formCntnr = buildCrudFormCntnr();
        var volatileFieldsContainer = _util.buildElem('div', {id: 'field-rows'}); 
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
        $('#field-rows').empty().append(createSrcTypeFields(selectedType));
        enableSubmitBttn();
    }
    /** Builds all fields for selected source-type and returns the row elems. */
    function createSrcTypeFields(srcType) {
        var typeFormConfg = getSrcTypeFieldConfig(srcType);                         //console.log("formConfg = %O", formConfg)
        crudParams.typeFormConfg = formConfg;
        return getFormFieldRows(srcType, formConfg, srcFields);
    }
    /**
     * Returns a config object for the form of the selected source-type with the 
     * fields to add to and exclude from the default source fields, the required
     * fields, and the final order of the fields.
     */
    function getSrcTypeFieldConfig(type) {
        var fieldMap = { 
            "author": { 
                "add": { "First name": "text", "Middle name": "text", "Last name": "text"}, 
                "exclude": ["display name", "year", "doi", "author"],
                "required": ["Last name"], 
                "order": ["Last name", "First name", "Middle name", "Description", 
                    "Link url", "Link text"]
            },
            "citation": {
                "add": { "Publication": "text", "Volume": "text", "Issue": "text", 
                    "Pages": "text", "Tags": "checkbox", "Citation text": "textArea"},
                "exclude": true, //Refigure after source changes.
                "required": ["Publication", "Citation text"],
                "order": ["Citation text", "Publication", "Volume", "Issue", "Pages", "Tags"]
            },
            "publication": {
                "add": { "Publisher": "text", "Title" : "text"},
                "exclude": ["display name"],
                "required": ["Title"],
                "order": ["Title", "Description", "Publisher", "Year", "Doi", 
                    "Link url", "Link text"]
            },
            "publisher": { 
                "add": [], 
                "exclude": ["Year", "Doi", "author"],
                "required": ["display name"],
                "order": ["Display name", "Description", "Link url", "Link text"] }
        };
        return fieldMap[type];
    }
    /*----------------------- Validation -------------------------------------*/
    /**
     * Form submit handler executed after all required elements have passed html5
     * verification. Builds a form data object  @buildFormData and 
     * sends to the server @sendFormData.
     * 
     */
    function valSrcCrud(e) {  console.log("e = %O", e)
        var formData = buildJsonData();
    }
    function buildJsonData() {
        // body...
    }

    /*----------------------- Helpers ----------------------------------------*/
    /** Builds the form elem container. */
    function buildCrudFormCntnr() {
        var form = document.createElement("form");
        $(form).attr({"action": "", "method": "POST", name: "crud-form"});
        form.className = "crud-form";
        return form;
    }
    /**
     * Builds all rows for the form according to the passed formConfig obj. 
     * Returns a container div with the rows ready to be appended to the form window.
     */
    function getFormFieldRows(entity, formCnfg, dfltFields) {                   //console.log("  Building Form rows");
        var buildFieldType = { "text": buildTextInput, "checkbox": buildCheckboxInput,
            "textArea": buildTextArea };  
        var defaultRows = buildDefaultRows(formCnfg.exclude, formCnfg.required);
        var additionalRows = buildAdditionalRows(formCnfg.add, formCnfg.required, entity);
        return orderRows(defaultRows.concat(additionalRows), formCnfg.order);

        /**
         * Builds a row for each default field not explicitly excluded. If exclude
         * is set to true, all default fields are excluded. 
         */
        function buildDefaultRows(exclude, reqFields) {                         //console.log("    Building default rows");
            var fieldInput, rows = [];
            for (var field in dfltFields) {  
                if (exclude === true || exclude.indexOf(field) !== -1) { continue; }      //console.log("      field = ", field);
                fieldInput = buildFieldType[dfltFields[field]]();      
                isReq = ifRequiredField(field, fieldInput, reqFields);
                rows.push(buildFormRow(_util.ucfirst(field), fieldInput, isReq));
            }
            return rows;
        }
        function buildAdditionalRows(xtraFields, reqFields, entity) {           //console.log("    Building additional rows");
            var fieldInput, isReq, rows = [];
            for (var field in xtraFields) {                                     //console.log("      field = ", field);
                fieldInput = buildFieldType[xtraFields[field]](entity);      
                isReq = ifRequiredField(field, fieldInput, reqFields);
                rows.push(buildFormRow(_util.ucfirst(field), fieldInput, isReq));
            }
            return rows;
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
    /**
     * Returns true, and sets the fieldElem's required' property, if the field is 
     * in the array of required fields. 
     */
    function ifRequiredField(field, fieldElem, reqFields) {
        if (reqFields.indexOf(field) !== -1) {
            $(fieldElem).prop("required", "required");
            return true;
        } 
        return false;
    }
    function buildTextInput(entity) {                                           //console.log("            buildTextInput");
        return elem = _util.buildElem("input", { "type": "text", class:"txt-input" });
    }
    function buildTextArea(entity) {                                            //console.log("            buildTextArea");
        return _util.buildElem("textarea");
    }
    /**
     * Returns a div containing a checkbox, span-wrapped with associated label, 
     * for each of the hard-coded tags in the opts-obj. NOTE: Only citations and 
     * interactions have tags currently. Eventually tags will be pulled from the server.
     */
    function buildCheckboxInput(entity) {                                       //console.log("            entity = %s buildCheckboxInput", entity);
        var span, lbl;
        var opts = { "citation": ["Secondary"] }; 
        var divCntnr = document.createElement("div");
        opts[entity].forEach(function(opt) {
            span = document.createElement("span");
            span.append(_util.buildElem("input", { "type": "checkbox", id: opt+"_check"}));
            lbl = _util.buildElem("label", { "text": opt });
            lbl.htmlFor = opt+"_check";
            span.append(lbl);
            $(divCntnr).append(span);
        });
        return divCntnr;
    }
    /**
     * Each element is built, nested, and returned as a completed row. 
     * rowDiv>(errorDiv, fieldDiv>(fieldLabel, fieldInput))
     */
    function buildFormRow(lblTxt, fieldInput, isReq) {
        var rowDiv = _util.buildElem("div", { class: "form-row", id: lblTxt + "_row"});
        var errorDiv = _util.buildElem("div", { class: "row-errors", id: lblTxt+"_errs"});
        var fieldRow = _util.buildElem("div", { class: "field-row flex-row"});
        var label = _util.buildElem("label", {text: lblTxt});
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