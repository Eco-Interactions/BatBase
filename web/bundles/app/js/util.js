(function(){ 
    var eif = ECO_INT_FMWK;
    eif.util = {
        buildElem: buildElem,
        buildSelectElem: buildSelectElem,
        buildSimpleOpts: buildSimpleOpts,
        lcfirst: lcfirst, 
        setlocalStorage: setlocalStorage,
        populateStorage: populateStorage,
        removeFromStorage: removeFromStorage,
        ucfirst: ucfirst, 
    };

    extendJquery();

    /*---------- String Helpers ----------------------------------------------*/
    function ucfirst(str) { 
        return str.charAt(0).toUpperCase() + str.slice(1); 
    }
    function lcfirst(str) {
        var f = str.charAt(0).toLowerCase();
        return f + str.substr(1);
    }
    /*-------- - HTML Helpers ------------------------------------------------*/
    function buildElem(tag, attrs) {                                           //console.log("buildElem called. tag = %s. attrs = %O", tag, attrs);// attr = { id, class, name, type, value, text }
        var elem = document.createElement(tag);
        if (attrs) { addAttributes(elem, attrs); }
        return elem;
    }
    function addAttributes(elem, attrs) {
        addElemProps();
        addAttrProps();
        
        function addElemProps() {
            var elemProps = [ "id", "class", "title", "text"];
            var transProps = { "class": "className", "text": "textContent" };
            elemProps.forEach(function(orgProp) {
                if (orgProp in attrs) { 
                    prop = (orgProp in transProps) ? transProps[orgProp] : orgProp;
                    elem[prop] = attrs[orgProp]; 
                } 
            });
        }
        function addAttrProps() {
            var attrProps = [ "name", "type", "value", "placeholder" ];
            var attrsToAdd = {};
            attrProps.forEach(function(prop) {
               if (prop in attrs) { attrsToAdd[prop] = attrs[prop]; } 
            });                                                                 //console.log("attrsToAdd = %O", attrsToAdd);
            $(elem).attr(attrsToAdd);
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
        hidePlaceholder(selectElem);
        return selectElem;
    }
    function hidePlaceholder(selectElem) {
        if ($(selectElem).find("option[value='placeholder']")) {
            $(selectElem).find("option[value='placeholder']").hide();
        }
    }
    /**
     * Creates an opts obj for each 'item' in array with the index as the value and 
     * the 'item' as the text.
     */
    function buildSimpleOpts(optAry, placeholder) {                             //console.log("buildSimpleOpts(optAry= %O, placeholder= %s)", optAry, placeholder);
        var opts = []
        optAry.forEach(function(option, idx){
            opts.push({
                value: idx.toString(),
                text: ucfirst(option)  });
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

    /*--------------------------Storage Methods-------------------------------*/
    function setlocalStorage() {
        if (storageAvailable('localStorage')) { 
            return window['localStorage'];                                      //console.log("Storage available. Setting now. localStorage = %O", localStorage);
        } else { 
            return false;                                                       //console.log("No Local Storage Available"); 
        }
    }
    function storageAvailable(type) {
        try {
            var storage = window[type];
            var x = '__storage_test__';

            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        }
        catch(e) {
            return false;
        }
    }
    function populateStorage(key, val) {
        if (localStorage) {                                                     //console.log("localStorage active.");
            localStorage.setItem(key, val);
        } else { console.log("No Local Storage Available"); }
    }
    function removeFromStorage(key) {
        localStorage.removeItem(key);
    }
    function getRemainingStorageSpace() {
         var limit = 1024 * 1024 * 5; // 5 MB
         return limit - unescape(encodeURIComponent(JSON.stringify(localStorage))).length;
    }
    
}());  /* End of namespacing anonymous function */