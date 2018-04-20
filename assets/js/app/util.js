$(document).ready(function(){  
    var eif = ECO_INT_FMWK;
    var dataStorage;
    eif.util = {
        addEnterKeypressClick: addEnterKeypressClick,
        buildElem: buildElem,
        buildSelectElem: buildSelectElem,
        buildSimpleOpts: buildSimpleOpts,
        getDataFromStorage: getDataFromStorage,
        lcfirst: lcfirst, 
        getDataStorage: getDataStorage,
        populateStorage: populateStorage,
        removeFromStorage: removeFromStorage,
        stripString: stripString,
        sendAjaxQuery: sendAjaxQuery,
        ucfirst: ucfirst, 
    };

    extendPrototypes();

    /*---------- Keypress event Helpers --------------------------------------*/
    function addEnterKeypressClick(elem) {
        $(elem).keypress(function(e){ //Enter
            if((e.keyCode || e.which) == 13){ $(this).trigger('click'); }
        });
    }
    /*---------- String Helpers ----------------------------------------------*/
    function ucfirst(str) { 
        return str.charAt(0).toUpperCase() + str.slice(1); 
    }
    function lcfirst(str) {
        var f = str.charAt(0).toLowerCase();
        return f + str.substr(1);
    }
    /** Removes white space at beginning and end, and any ending period. */
    function stripString(text) {
        let str = text.trim();
        return str.charAt(str.length-1) === '.' ? str.slice(0, -1) : str;
    }
    /*---------- Object Helpers ----------------------------------------------*/
    function sortProperties(obj) {
        var sortable=[];
        var returnObj = {};

        for(var key in obj) {                   // convert object into array
            if(obj.hasOwnProperty(key))
                sortable.push([key, obj[key]]); // each item is an array in format [key, value]
        }
        
        sortable.sort(function(a, b) {          // sort items by value
            var x=a[1].toLowerCase(),
                y=b[1].toLowerCase();
            return x<y ? -1 : x>y ? 1 : 0;
        });
        sortable.forEach(rebuildObj); // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]

        return returnObj;

        function rebuildObj(keyValAry) {
            var key = keyValAry[0];
            var val = keyValAry[1];
            returnObj[key] = val;
        }
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
            var attrProps = [ "name", "type", "value", "placeholder", "for" ];
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
    /*--------------------- Extend Prototypes/Libraries ----------------------*/
    function extendPrototypes() {
        extendDate();
        extendJquery();
    }
    function extendDate() {
        /** Y-m-d  */
        Date.prototype.today = function () { 
            return this.getFullYear() +"-"+
                (((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"-"+ 
                ((this.getDate() < 10)?"0":"") + this.getDate() ;
        }
        /** H:i:s */
        Date.prototype.timeNow = function () {
             return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ 
             ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ 
             ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
        }
    }
    function extendJquery() {
        addOnEnterEvent();
        addOnDestroyedEvent();
    }
    function addOnEnterEvent() {
        $.fn.onEnter = function(func) {
            this.bind('keypress', function(e) {
                if (e.keyCode == 13) func.apply(this, [e]);    
            });               
            return this; 
         };
    }
    /** A 'post-remove' event listener. Use: $('.elem').bind('destroyed', cb); */
    function addOnDestroyedEvent() { //Note: this will fire after .off('destroy')
        $.event.special.destroyed = {
            remove: function(o) {
              if (o.handler) {  // (&& o.type !== 'destroyed') <- something similar to this should fix the off() firing.g
                o.handler();
              }
            }
          }
    }
    /*--------------------------Storage Methods-------------------------------*/

    /**
     * Gets data from data storage for each storage property passed. If an array
     * is passed, an object with each prop as the key for it's data is returned. 
     * If a property is not found, false is returned. 
     */
    function getDataFromStorage(props) {
        if (!Array.isArray(props)) { return getStoredData(); }
        return getStoredDataObj();

        function getStoredData() {
            var data = dataStorage.getItem(props);  if (!data) { console.log("no stored data for [%s]", props); console.trace(); }
            return data ? JSON.parse(data) : false;
        }
        function getStoredDataObj() {
            var data = {};
            var allFound = props.every(function(prop){                          //console.log("getting [%s] data", prop)
                return getPropData(prop);                             
            });  
            return allFound ? data : false;
            function getPropData(prop) {
                    var jsonData = dataStorage.getItem(prop) || false;                              
                    if (!jsonData) { console.log("no stored data for [%s]", prop);return false; }
                    data[prop] = JSON.parse(jsonData);                          //console.log("data for %s - %O", entity, data[entity]);
                    return true;   
            }
        } /* End getDataObj */
    } /* End getDataFromStorage */
    function getDataStorage() {
        const env = $('body').data('env');
        const storageType = env === 'test' ? 'sessionStorage' : 'localStorage'; //console.log('storageType = %s, env = %s', storageType, $('body').data('env'));
        if (!storageAvailable(storageType)) { return false; } 
        dataStorage = window[storageType]; 
        if (env === 'test') { dataStorage.clear(); }
        return dataStorage;  
        
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
    } /* End getDataStorage */
    function populateStorage(key, val) {
        if (dataStorage) {                                                      //console.log("dataStorage active.");
            dataStorage.setItem(key, val);
        } else { console.log("####__ No Local Storage Available__####"); }
    }
    function removeFromStorage(key) {
        dataStorage.removeItem(key);
    }
    function getRemainingStorageSpace() {
         var limit = 1024 * 1024 * 5; // 5 MB
         return limit - unescape(encodeURIComponent(JSON.stringify(dataStorage))).length;
    }
/*-----------------AJAX Callbacks---------------------------------------------*/
    function sendAjaxQuery(dataPkg, url, successCb, errCb) {                    console.log("Sending Ajax data =%O arguments = %O", dataPkg, arguments)
        $.ajax({
            method: "POST",
            url: url,
            success: successCb || dataSubmitSucess,
            error: errCb || ajaxError,
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
        console.log("ajaxError. responseText = [%O] - jqXHR:%O", jqXHR.responseText, jqXHR);
    }
}());  /* End of namespacing anonymous function */