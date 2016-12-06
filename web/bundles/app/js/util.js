(function(){ 
    var eif = ECO_INT_FMWK;
    eif.util = {
        ucfirst: ucfirst, 
        createElem: createElem,
    };

    extendJquery();

    /*---------- Helpers -----------------------------------------------------*/
    function ucfirst(string) { 
        return string.charAt(0).toUpperCase() + string.slice(1); 
    }

    /*------------ HTML ------------------------------------------------------*/
    function createElem(tag, attrs) {                                           //console.log("createElem called. tag = %s. attrs = %O", tag, attrs);// attr = { id, class, name, type, value, text }
        var elem = document.createElement(tag);
        if (attrs) {
            elem.id = attrs.id || '';
            elem.className = attrs.class || '';   //Space separated classNames

            if (attrs.text) { $(elem).text(attrs.text); }

            if (attrs.name || attrs.type || attrs.value ) { 
                $(elem).attr({
                    name: attrs.name   || '', 
                    type: attrs.type   || '',
                    value: attrs.value || '',
                    placeholder: attrs.placeholder || '',
                }); 
            }
        }
        return elem;
    }
    /*--------------------------Jquery Extensions-----------------------------*/
        function extendJquery() {
            addOnEnterEvent();
        }
        function addOnEnterEvent() {
            $.fn.onEnter = function(func) {
                this.bind('keypress', function(e) {
                    if (e.keyCode == 13) func.apply(this, [e]);    
                });               
                return this; 
             };
        }
    
}());  /* End of namespacing anonymous function */