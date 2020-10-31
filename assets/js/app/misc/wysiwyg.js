/**
 * Handles all wysiwyg related code. If user is editor or above, an 'edit content'
 * button is added to the top of any page with editable content blocks.
 *
 * Exports:
 *     initWysiwyg
 */
import { sendAjaxQuery } from '~util';

export default function initWysiwyg(role) {
    requireStyles();
    if ($('.wysiwyg').length > 0) { addEditContentButton(role); }
}
function requireStyles () {
    require('libs/wysiwyg/trumbowyg.min.js');
    require('libs/wysiwyg/ui/trumbowyg.min.css');
}
function addEditContentButton(userRole) {
    const button = $('<button/>', {
        text: "Edit Content",
        id: 'editContentBttn',
        class: 'adminbttn',
        title: 'Edit Content',
        click: toggleContentBlockEditing.bind(null, userRole)
    });
    responsivelyAttachEditButton(button, userRole, window.outerWidth);
    $('#editContentBttn').data('editing', false);  // tracks which content block contains the active editor, if any.
}
function responsivelyAttachEditButton(button, userRole, pgWidth) {
    $('#headln-txt').append(button);
}
/**
 * Manages init and exit 'edit states' and related ui on the page.
 */
function toggleContentBlockEditing(userRole) {
    var editorElem = $('#editContentBttn').data('editing');                     //console.log("toggling.  editorElem = %O", editorElem)
    if (editorElem !== false) {
        $('#editContentBttn').text("Refreshing...");
        location.reload(true);
    } else {
        addEditPencils(userRole);
        $('#editContentBttn').css({'opacity': 1});
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
                            fn: function() {                                    console.log("Saving WYSIWYG. trumbowyg = %O", trumbowyg);
                                var blkId = trumbowyg.o.plugins.save.id;
                                var data = { content: $('#' + blkId ).trumbowyg('html')};    //console.log("blkId = ", blkId)
                                var url = 'admin/contentblock/' + blkId + '/update';
                                sendAjaxQuery(data, url, wysiwygSubmitSuccess);
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
function wysiwygSubmitSuccess(data, textStatus, jqXHR) {                        //console.log("Success is yours!! = %O", data);
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
function addEditPencils(userRole) {
    const icoSrc = require('images/icons/eif.pencil.svg').default;
    var contentBlocks = $('.wysiwyg');

    for (var i = 0; i < contentBlocks.length; i++) {
        var blkId = contentBlocks[i].id;  //console.log("blkId = ", blkId);
        var blkEditId = blkId + '-edit';
        $('#' + blkId).append(`<img src="${icoSrc}" id="${blkEditId}" class="wsywigEdit"
            title="Edit Content" alt="Edit Content">`);
        addButtons(blkEditId, blkId);
    }
    $('.wsywigEdit').click(startWysiwyg);
    /** Starts the wysiwyg editor. If 'super' admin, includes additional buttons. */
    function startWysiwyg(e) {
        var containerElemId = getBlockContainerId(e.target.id);
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
            svgPath: require('libs/wysiwyg/ui/icons.svg').default
        });
    }
} /* End addEditPencils */
/** Removes every edit pencil icon on the page */
function removeEditPencils() {
    $('.wsywigEdit').remove();
}
