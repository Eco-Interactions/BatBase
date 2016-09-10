/**
 * If 'admin', all Content Blocks will have an edit icon attached to the top left
 * of their container. When clicked, a wysiwyg interface will encapsulate that block 
 * and allow editing and saving of the content within.
 */
$(document).ready(function(){
    var userRole = $('body').data("user-role");
    if (userRole === "admin" || userRole === "super") { initWysiwyg(); }
    /**
     *  Adds edit icons to each content block, contained inside of a div with 
     *  the 'wysiwyg' class, on the page.
     */
    function initWysiwyg() {
        var contentBlocks = $('.wysiwyg');  console.log("contentBlocks = %O", contentBlocks);
        addEditPencils();
    } /* End initWysiwyg */
    /**
     * Extends the Trumbowyg library to include 'save' and 'cancel' buttons 
     * for the interface. The save button updates the content block in the 
     * database and then refreshes the page. The cancel button closes the 
     * wysiwyg editor without modifying the block.
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
                                // ico: 'save',
                                hasIcon: false,
                                fn: function() {                            // console.log("saving. trumbowyg = %O", trumbowyg );
                                    var blkId = trumbowyg.o.plugins.save.id;
                                    var content = $('#' + blkId ).trumbowyg('html');            // console.log("blkId = ", blkId)
                                    $.ajax({
                                        method: "POST",
                                        url: "admin/contentblock/" + blkId + "/update",
                                        success: dataSubmitSucess,
                                        error: ajaxError,
                                        data: JSON.stringify({
                                            content: content
                                        })
                                    });
                                }
                            };
                            trumbowyg.addBtnDef('save', btnDef);
                        }
                    },
                    cancel: {
                        init: function(trumbowyg) {
                            const btnDef = {
                                ico: 'close',
                                fn: function() { 
                                    var blkId = trumbowyg.o.plugins.save.id;                    // console.log("canceling. blkId = ", blkId); 
                                    $('#' + blkId ).trumbowyg('destroy'); 
                                    addEditPencils();   
                                },
                            };
                            trumbowyg.addBtnDef('cancel', btnDef);
                        }
                    }
                }
            });
        })(jQuery);
    } /* End addButtons */
    /** Returns the block container id by removing '-edit' from the passed editId */
    function getBlockContainerId(editId) {
        var elemIdAry = editId.split('-'); //
        elemIdAry.pop();
        return elemIdAry.join('-');
    }
    /** 
     * Adds edit pencil icons to the top left of every content block container,
     * any div with class 'wysiwyg', on the page.
     */
    function addEditPencils() {     
        var editIcoSrc = ($('body').data('env') === "dev" ? '../' : '') + 'bundles/app/images/eif.pencil.svg';  
        var contentBlocks = $('.wysiwyg');  console.log("contentBlocks = %O", contentBlocks);
        
        for (var i = 0; i < contentBlocks.length; i++) {
            var blkId = contentBlocks[i].id;  //console.log("blkId = ", blkId);
            var blkEditId = blkId + '-edit';
            $('#' + blkId).append('<img src="' + editIcoSrc + '" ' + 'id="' + blkEditId + '" ' +
            'class="wsywigEdit" title="Edit Content" alt="Edit Content">');
            addButtons(blkEditId, blkId);
        }
        $('.wsywigEdit').click(startWysiwyg);
        /** Starts the wysiwyg editor. If 'super' admin, includes additional buttons. */
        function startWysiwyg(e) {  console.log("starting! e.parent = %O", e.target)
            var containerElemId = getBlockContainerId(e.target.id); console.log("containerElemId = ", containerElemId)
            var bttns = [
                ['formatting'],
                'btnGrp-semantic',
                // ['superscript', 'subscript'],
                ['link'],
                ['insertImage'],
                'btnGrp-justify',
                'btnGrp-lists',
                ['horizontalRule'],
                ['save', 'cancel']
            ];
            removeEditPencils();
            //adds developer buttons
            if (userRole === "super") { bttns.splice(6, 0, ['viewHTML', 'removeformat']); }
            
            $('#' + containerElemId).trumbowyg({    
                btns: bttns,
                autogrow: false,
                plugins: {  // options object unique to each instance of the wysiwyg.
                    save: {
                        id: containerElemId
                    },
                    cancel: {
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
    function dataSubmitSucess(data, textStatus, jqXHR) { 
        console.log("Success is yours!! = %O", data);
        location.reload(true);
    }
    function ajaxError(jqXHR, textStatus, errorThrown) {
        console.log("ajaxError = %s - jqXHR:%O", errorThrown, jqXHR);
    }
});