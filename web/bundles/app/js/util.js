(function(){ 
    var eif = ECO_INT_FMWK;
    eif.util = {
        buildElem: buildElem,
        buildSelectElem: buildSelectElem,
        buildSimpleOpts: buildSimpleOpts,
        ucfirst: ucfirst, 
    };

    extendJquery();

    /*---------- Helpers -----------------------------------------------------*/
    function ucfirst(string) { 
        return string.charAt(0).toUpperCase() + string.slice(1); 
    }

    /*------------ HTML ------------------------------------------------------*/
    /*------------ HTML Functions -------------------------------------------*/
    function buildElem(tag, attrs) {                                           //console.log("buildElem called. tag = %s. attrs = %O", tag, attrs);// attr = { id, class, name, type, value, text }
        var elem = document.createElement(tag);
        if (attrs) { addAttributes(elem, attrs); }
        return elem;
    }
    function addAttributes(elem, attrs) {
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
    /**
     * Builds a select drop down with the options, attributes and change method 
     * passed. Sets the selected option as the passed 'selected' or the default 'all'.
     */
    function buildSelectElem(options, attrs, changeFunc, selected) {
        var selectElem = buildElem('select', attrs); 
        var selected = selected || 'all';
        
        options.forEach(function(opts){
            $(selectElem).append($("<option/>", {
                value: opts.value,
                text: opts.text
            }));
        });

        if (attrs) { addAttributes(selectElem, attrs); }
        $(selectElem).val(selected);
        $(selectElem).change(changeFunc);
        return selectElem;
    }
    /**
     * Creates an opts obj for each 'item' in array with the index as the value and 
     * the 'item' as the text.
     */
    function buildSimpleOpts(optAry, placeholder) {   console.log("buildSimpleOpts(optAry= %O, placeholder= %s)", optAry, placeholder);
        var opts = []
        optAry.forEach(function(option, idx){
            opts.push({
                value: idx.toString(),
                text: option  });
        });
        if (placeholder) {
            opts.unshift({ value: "placeholder", text: placeholder });
        }
        return opts;
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