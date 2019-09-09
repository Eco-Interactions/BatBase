const exports = module.exports = {};
/*=================== Content Block WYSIWYG ======================================================*/
require('../../libs/wysiwyg/trumbowyg.min.js');
require('../../libs/wysiwyg/ui/trumbowyg.min.css');

let userRole;                                        
/**
 *  Adds edit content button to the top of any page with editable content blocks.
 */
exports.init = function(role) { 
    userRole = role;
    var contentBlocks = $('.wysiwyg');                                          //console.log("contentBlocks = %O", contentBlocks);
    if (contentBlocks.length > 0) { addEditContentButton(); }
} /* End initWysiwyg */
function addEditContentButton() {
    var button = $('<button/>', {
        text: "Edit Content", 
        id: 'editContentBttn',
        class: 'adminbttn',
        title: 'Edit Content',
        click: toggleContentBlockEditing
    });  //console.log("button = %O", button)
    button.css({
        position: "absolute",
        top: "4px",         // We were using px for the 'batplant.org' just above this button...  
        right: "10px"       // in the interest of visual consistency, I am using px to style this as well.
    });
    $('#pg-hdr').append(button);
    $('#editContentBttn').data('editing', false);  // tracks which content block contains the active editor, if any.
}
/**
 * Manages init and exit 'edit states' and related ui on the page.
 */
function toggleContentBlockEditing() { 
    var editorElem = $('#editContentBttn').data('editing');                     //console.log("toggling.  editorElem = %O", editorElem)
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
                            fn: function() {                                    console.log("saving. trumbowyg = %O", trumbowyg);
                                var blkId = trumbowyg.o.plugins.save.id;
                                var data = { content: $('#' + blkId ).trumbowyg('html')};            //console.log("blkId = ", blkId)
                                var url = "admin/contentblock/" + blkId + "/update";
                                $.ajax({
                                    method: "POST",
                                    url: url,
                                    success: wysiwygSubmitSuccess,
                                    error: ajaxError,
                                    data: JSON.stringify(data)
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
/** Reloads the page on content block update success */
function wysiwygSubmitSuccess(data, textStatus, jqXHR) {                        console.log("Success is yours!! = %O", data);
    location.reload(true);
}
function ajaxError(jqXHR, textStatus, errorThrown) {
    console.log("ajaxError. responseText = [%O] - jqXHR:%O", jqXHR.responseText, jqXHR);
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
    var editIcoSrc = ($('body').data('env') === "dev" ? '../' : '') + 'build/images/eif.pencil.svg';  
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
    function startWysiwyg(e) { //console.log("starting! e.parent = %O", e.target)
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
            autogrow: false,
            btns: bttns,
            plugins: {  // options object unique to each instance of the wysiwyg.
                save: {
                    id: containerElemId
                }
            },
            svgPath: require('../../libs/wysiwyg/ui/icons.svg')
        });
    }
} /* End addEditPencils */
/** Removes every edit pencil icon on the page */
function removeEditPencils() {
    $('.wsywigEdit').remove();  
}
