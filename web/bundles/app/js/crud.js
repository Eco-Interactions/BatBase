/**
 * When logged in as an 'admin' or 'super': 
 * >> On the database search page, multiple admin-ui elements are added that open 
 * a popup interface allowing the creating, updating and, soon, deleting of data.   
 * >> All Content Blocks will have an edit icon attached to the top left of their 
 * container. When clicked, a wysiwyg interface will encapsulate that block and 
 * allow editing and saving of the content within using the trumbowyg library.
 */
$(document).ready(function(){  
    var userRole, envUrl;
    var eif = ECO_INT_FMWK;
    var _util = eif.util;
    // eif.crud = {};    

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
     * Creates the source form with relevant fields for the Source entity and the
     * selected Source Type. On init, only the Source Type select row is shown.
     * Once selected, the full source form is initialized @initSrcTypeForm.
     */
    function initSrcCrudView() {
        var formCntnr = _util.buildElem("div", {class: "crud-form"});
        formCntnr.append(buildSrcTypeRow());
        $('#crud-main').append(formCntnr);
    }
    /** Builds the row for the Source Type field. */
    function buildSrcTypeRow() {
        var selElem = buildSrcTypeSelect();
        $(selElem).val("placeholder");
        $(selElem).find('option[value="placeholder"]').hide();
        return buildFormRow("Source Type", selElem);
    }
    /** Creates the Source Type select dropdown. */
    function buildSrcTypeSelect() {
        var srcTypes = ["Author", "Citation", "Publication", "Publisher"];
        var srcOpts = _util.buildSimpleOpts(srcTypes, "-- Select type --");     
        return _util.buildSelectElem(srcOpts, null, initSrcTypeForm)
    }
    /**
     * Shows crud ui for selected source type.
     * Note >> Citations are not technically a 'source type' but, as a detail table 
     * for Source, are handled very similarly. 
     */
    function initSrcTypeForm(e) {                                        
        var srcTypes = ["author", "citation", "publication", "publisher"];
        var selectedType = srcTypes[$(this).val()];                             console.log("--Init srcType (%s) view", selectedType);
        createSrcTypeFields(selectedType);

    }
    function createSrcTypeFields(srcType) {

    }









    /*----------------------- Helpers ----------------------------------------*/
    /** Returns the full, contextual url for the passed entity and action.  */
    function getEntityUrl(entityName, action) {
        return envUrl + entityName + "/" + action;
    }

    function buildFormRow(lblTxt, formInputElem) {
        var rowDiv = _util.buildElem("div", { class: "form-row flex-row"});
        var label = _util.buildElem("label", {text: "Source type"});
        $(rowDiv).append([label, formInputElem]);
        return rowDiv;
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
                                    var content = $('#' + blkId ).trumbowyg('html');            // console.log("blkId = ", blkId)
                                    $.ajax({
                                        method: "POST",
                                        url: "admin/contentblock/" + blkId + "/update",
                                        success: wysiwygSubmitSuccess,
                                        error: ajaxError,
                                        data: JSON.stringify({
                                            content: content
                                        })
                                    });
                                }
                            };
                            trumbowyg.addBtnDef('save', btnDef);
                        }
                    }
                }
            });
        })(jQuery);
    } /* End addButtons */
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
    /** Reloads the page on content block update success */
    function wysiwygSubmitSuccess(data, textStatus, jqXHR) { 
        console.log("Success is yours!! = %O", data);
        location.reload(true);
    }
    function ajaxError(jqXHR, textStatus, errorThrown) {
        console.log("ajaxError = %s - jqXHR:%O", errorThrown, jqXHR);
    }

}());  /* End of namespacing anonymous function */