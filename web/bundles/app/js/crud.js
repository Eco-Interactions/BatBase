(function(){
    var eif = ECO_INT_FMWK;
    // eif.crud = {};
    document.addEventListener('DOMContentLoaded', onDOMContentLoaded); 

    function onDOMContentLoaded() {
        authDependentInit();
    }

    function authDependentInit() {
        var userRole = $('body').data("user-role");                             //console.log("----userRole === visitor ", userRole === "visitor")
        if (userRole === "admin" || userRole === "super") {
            buildSearchPgCrudUi();
        } 
    }
    function buildSearchPgCrudUi() {                                            console.log("updateCrudUi");
        buildCreateBttn();   
    }
    function buildCreateBttn() {
        var bttn = eif.util.createElem('button', { 
                text: "New", name: 'createbttn', class: "adminbttn" });
        $("#opts-col1").append(bttn);
    }


































}());  /* End of namespacing anonymous function */