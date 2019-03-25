
import * as idb from 'idb-keyval'; //set, get, del, clear
import exportCsvData from './db-table/csv-data.js';
import * as db_filters from './db-table/db-filters.js';
import * as db_page from './db-page.js';

/* 
 * Exports:
 *   addEnterKeypressClick
 *   buildElem
 *   buildSelectElem
 *   buildSimpleOpts
 *   getDataFromStorage
 *   lcfirst 
 *   getDataStorage
 *   getDetachedRcrd
 *   getGeoJsonEntity
 *   initGeoJsonData
 *   populateStorage
 *   removeFromStorage
 *   sendAjaxQuery
 *   stripString
 *   snapshot
 *   ucfirst 
*/
let dataStorage, geoJson;
const geoJsonKey = 'A life without cause is a life without effect!!';  

extendPrototypes();
initGeoJsonData();

/*---------- Keypress event Helpers --------------------------------------*/
export function addEnterKeypressClick(elem) {
    $(elem).keypress(function(e){ //Enter
        if((e.keyCode || e.which) == 13){ $(this).trigger('click'); }
    });
}
/*---------- String Helpers ----------------------------------------------*/
export function ucfirst(str) { 
    return str.charAt(0).toUpperCase() + str.slice(1); 
}
export function lcfirst(str) {
    var f = str.charAt(0).toLowerCase();
    return f + str.substr(1);
}
/** Removes white space at beginning and end, and any ending period. */
export function stripString(text) {
    let str = text.trim();
    return str.charAt(str.length-1) === '.' ? str.slice(0, -1) : str;
}
/*-------- - HTML Helpers ------------------------------------------------*/
export function buildElem(tag, attrs) {                                         //console.log("buildElem called. tag = %s. attrs = %O", tag, attrs);// attr = { id, class, name, type, value, text }
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
                let prop = (orgProp in transProps) ? transProps[orgProp] : orgProp;
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
export function buildSelectElem(options, attrs, changeFunc, selected) {
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
    
    function hidePlaceholder(selectElem) {
        if ($(selectElem).find("option[value='placeholder']")) {
            $(selectElem).find("option[value='placeholder']").hide();
        }
    }
}
/**
 * Creates an opts obj for each 'item' in array with the index as the value and 
 * the 'item' as the text.
 */
export function buildSimpleOpts(optAry, placeholder) {                          //console.log("buildSimpleOpts(optAry= %O, placeholder= %s)", optAry, placeholder);
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
/*--------------------- Selectize Combobox Methods -----------------------*/

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
/** --------- Local Storage --------------- */
/**
 * Gets data from data storage for each storage property passed. If an array
 * is passed, an object with each prop as the key for it's data is returned. 
 * If a property is not found, false is returned. 
 */
export function getDataFromStorage(props) {
    if (!Array.isArray(props)) { return getStoredData(); }
    return getStoredDataObj();

    function getStoredData() {
        var data = dataStorage.getItem(props);  if (!data) { console.log("no stored data for [%s]", props); console.trace(); }
        return data ? JSON.parse(data) : false;
    }
    function getStoredDataObj() {
        var data = {};
        var allFound = props.every(function(prop){                              //console.log("getting [%s] data", prop)
            return getPropData(prop);                             
        });  
        return allFound ? data : false;
        function getPropData(prop) {
                var jsonData = dataStorage.getItem(prop) || false;                              
                if (!jsonData) { console.log("no stored data for [%s]", prop);return false; }
                data[prop] = JSON.parse(jsonData);                              //console.log("data for %s - %O", entity, data[entity]);
                return true;   
        }
    } /* End getDataObj */
} /* End getDataFromStorage */
export function getDataStorage() {
    const env = $('body').data('env');
    const storageType = env === 'test' ? 'sessionStorage' : 'localStorage';     //console.log('storageType = %s, env = %s', storageType, $('body').data('env'));
    if (!storageAvailable(storageType)) {console.log("####__ No Local Storage Available__####"); 
        return false; 
    } 
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
export function populateStorage(key, val) {
    if (dataStorage) {                                                          //console.log("dataStorage active.");
        dataStorage.setItem(key, val);
    } else { console.log("####__ No Local Storage Available__####"); }
}
export function removeFromStorage(key) {
    dataStorage.removeItem(key);
}
/** --------- IDB Storage --------------- */
/** 
 * Checks whether the dataKey exists in indexDB cache. 
 * If it is, the stored geoJson is fetched and stored in the global variable. 
 * If not, the db is cleared and geoJson is redownloaded. 
 */
export function initGeoJsonData() {  
    idb.get(geoJsonKey).then(clearIdbCheck);
}
function clearIdbCheck(storedKey) {                                             console.log('clearing Idb? ', storedKey === undefined);
    if (storedKey) { return getGeoJsonData(); } 
    idb.clear();                                                                //console.log('actually clearing');
    downloadGeoJson();
}
function getGeoJsonData() {                                                     //console.log('getGeoJsonData')
    idb.get('geoJson').then(storeGeoJson);
}
function storeGeoJson(geoData) {                                                //console.log('stor(ing)GeoJson. geoData ? ', !geoData);
    if (!geoData) { return downloadGeoJson(); }
    geoJson = geoData; 
}
function downloadGeoJson(cb) {                                                  
    return dataStorage.getItem('interaction') ?
        downloadGeoJsonAfterLocalDbInit(cb) :
        window.setTimeout(downloadGeoJson, 800);   
}
function downloadGeoJsonAfterLocalDbInit(cb) {                                  console.log('downloading all geoJson data!');
    sendAjaxQuery({}, 'ajax/geo-json', storeServerGeoJson);                     
    
    function storeServerGeoJson(data) {                                         //console.log('server geoJson = %O', data.geoJson);
        idb.set('geoJson', data.geoJson);
        storeGeoJson(data.geoJson);
        idb.set(geoJsonKey, true);
        if (cb) { cb(); }
    }
}
export function isGeoJsonDataAvailable() {
    return geoJson;
}
export function updateGeoJsonData(cb) {                                         //console.log('------ updateGeoJsonData')
    geoJson = false;
    downloadGeoJson(cb);
}
export function getGeoJsonEntity(id) {                                          //console.log('        geoJson = %O', geoJson);
    return isGeoJsonDataAvailable() ?  JSON.parse(geoJson[id]) :
        updateGeoJsonData(getGeoJsonEntity.bind(null, id));
}
/*-----------------AJAX Callbacks---------------------------------------------*/
export function sendAjaxQuery(dataPkg, url, successCb, errCb) {                 console.log("Sending Ajax data =%O arguments = %O", dataPkg, arguments)
    return $.ajax({
        method: "POST",
        url: url,
        success: successCb || dataSubmitSucess,
        error: errCb || ajaxError,
        data: JSON.stringify(dataPkg)
    });
    
    function dataSubmitSucess(data, textStatus, jqXHR) { 
        console.log("Ajax Success! data = %O, textStatus = %s, jqXHR = %O", data, textStatus, jqXHR);
    }
    function ajaxError(jqXHR, textStatus, errorThrown) {
        console.log("ajaxError. responseText = [%O] - jqXHR:%O", jqXHR.responseText, jqXHR);
    }
}

/*---------- Object Helpers ----------------------------------------------*/
export function snapshot(obj) {
    return JSON.parse(JSON.stringify(obj));
}
// function alphaProperties(obj) {
//     var sortable=[];
//     var returnObj = {};

//     for(var key in obj) {                   // convert object into array
//         if(obj.hasOwnProperty(key))
//             sortable.push([key, obj[key]]); // each item is an array in format [key, value]
//     }
    
//     sortable.sort(function(a, b) {          // sort items by value
//         var x=a[1].toLowerCase(),
//             y=b[1].toLowerCase();
//         return x<y ? -1 : x>y ? 1 : 0;
//     });
//     sortable.forEach(rebuildObj); // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]

//     return returnObj;

//     function rebuildObj(keyValAry) {
//         var key = keyValAry[0];
//         var val = keyValAry[1];
//         returnObj[key] = val;
//     }
// }
/*-------- - CSS Helpers ------------------------------------------------*/
// function addOrRemoveCssClass(element, className, add) {
//     if (add) { addCssClass(element, className);
//     } else { removeCssClass(element, className); }
// }
// function removeCssClass(element, className) {
//     if (element.className && element.className.length > 0) {
//         var cssClasses = element.className.split(' ');
//         var index = cssClasses.indexOf(className);
//         if (index >= 0) {
//             cssClasses.splice(index, 1);
//             element.className = cssClasses.join(' ');
//         }
//     }
// };
// function addCssClass(element, className) {
//     if (element.className && element.className.length > 0) {
//         var cssClasses = element.className.split(' ');
//         if (cssClasses.indexOf(className) < 0) {
//             cssClasses.push(className);
//             element.className = cssClasses.join(' ');
//         }
//     }
//     else { element.className = className; }
// };


/*-------------------------------------- TO SORT ------------------------------------------------*/
/**
 * REFACT:: UI-UTIL OR SOMETHING
 */
export function authDependentInit(userRole) {
    if (userRole === "visitor") {
        $('button[name="csv"]').prop('disabled', true);
        $('button[name="csv"]').prop('title', "Register to download.");
        $('button[name="csv"]').css({'opacity': '.8', 'cursor': 'not-allowed' });
    } else { $('button[name="csv"]').click(exportCsvData); }
}
/**  Returns a copy of the record detached from the original. */
export function getDetachedRcrd(rcrdKey, rcrds) {                               //console.log("getDetachedRcrd. key = %s, rcrds = %O", rcrdKey, orgnlRcrds);
    try {
       return snapshot(rcrds[rcrdKey]);
    }
    catch (e) { 
       console.log("#########-ERROR- couldn't get record [%s] from %O", rcrdKey, rcrds);
    }
}
/**
 * REFACT:: UI-UTIL OR SOMETHING
 */
export function enableTableButtons() {  
    $('.tbl-tools button, .tbl-tools input, button[name="futureDevBttn"]')
        .attr('disabled', false).css('cursor', 'pointer');
    $('button[name="show-hide-col"]').css('cursor', 'not-allowed');
    $('.tbl-tools').fadeTo(100, 1);
    $('button[name="futureDevBttn"]').fadeTo(100, .7);    
    authDependentInit(); 
}
/**
 * REFACT:: UI-UTIL OR SOMETHING
 */
export function disableTableButtons() {
    $(`.tbl-tools button, .tbl-tools input, button[name="futureDevBttn"]`)
        .attr('disabled', 'disabled').css('cursor', 'default');
    $('.tbl-tools, button[name="futureDevBttn"]').fadeTo(100, .3); 
}
/* ------------- Selectize Library -------------------------------------- */
/**
 * Inits 'selectize' for each select elem in the form's 'selElems' array
 * according to the 'selMap' config. Empties array after intializing.
 *
 * REFACT NOTE:: data-filters.js || util-combobox
 */
export function initCombobox(field) {                                           //console.log("initCombobox [%s]", field);
    const confg = getSelConfgObj(field); 
    initSelectCombobox(confg);  
} /* End initComboboxes */
export function initComboboxes(fieldAry) {
    fieldAry.forEach(field => initCombobox(field));
}
function getSelConfgObj(field) {
    const updateTaxonSearch = db_filters.updateTaxonSearch;
    const updateLocSearch = db_filters.updateLocSearch;
    const updatePubSearch = db_filters.updatePubSearch;
    const confgs = { 
        'Focus' : { name: field, id: '#search-focus', change: db_page.selectSearchFocus },
        'Class' : { name: field, id: '#sel'+field, change: updateTaxonSearch },
        'Country' : { name: field, id: '#sel'+field, change: updateLocSearch },
        'Family' : { name: field, id: '#sel'+field, change: updateTaxonSearch },
        'Genus' : { name: field, id: '#sel'+field, change: updateTaxonSearch },
        'Order' : { name: field, id: '#sel'+field, change: updateTaxonSearch },
        'Publication Type' : {name: field, id: '#selPubType', change: updatePubSearch },
        'Loc View' : {name: field, id: '#sel-realm', change: db_page.onLocViewChange },
        'Source Type': { name: field, id: '#sel-realm', change: db_page.onSrcRealmChange },
        'Species' : { name: field, id: '#sel'+field, change: updateTaxonSearch },
        'Taxon Realm' : { name: 'Realm', id: '#sel-realm', change: db_page.onTaxonRealmChange },
        'Region' : { name: field, id: '#sel'+field, change: updateLocSearch },
    };
    return confgs[field];
}
/**
 * Inits the combobox, using 'selectize', according to the passed config.
 * Note: The 'selectize' library turns select dropdowns into input comboboxes
 * that allow users to search by typing.
 */
function initSelectCombobox(confg) {                                            //console.log("initSelectCombobox. CONFG = %O", confg)
    const options = {
        create: false,
        onChange: confg.change,
        onBlur: saveOrRestoreSelection,
        placeholder: getPlaceholer(confg.id)
    };
    const sel = $(confg.id).selectize(options); 

    function getPlaceholer(id) {
        const optCnt = $(id + ' > option').length;  
        const placeholder = 'Select ' + confg.name
        return optCnt ? 'Select ' + confg.name : '- None -';
    }
} /* End initSelectCombobox */
export function getSelVal(field) {                                              //console.log('getSelVal [%s]', field);
    const confg = getSelConfgObj(field);                                        //console.log('getSelVal [%s] = [%s]', field, $(confg.id)[0].selectize.getValue());
    return $(confg.id)[0].selectize.getValue();  
}
// function getSelTxt(field) {
//     const confg = getSelConfgObj(field);
//     const $selApi = $(confg.id)[0].selectize; 
//     return $selApi.getItem(id).length ? $selApi.getItem(id)[0].innerText : false;
// }
export function setSelVal(field, val, silent) {                                        //console.log('setSelVal [%s] = [%s]', field, val);
    const confg = getSelConfgObj(field);
    const $selApi = $(confg.id)[0].selectize; 
    $selApi.addItem(val, silent); 
    saveSelVal($(confg.id), val);
}
/**
 * onBlur: the elem is checked for a value. If one is selected, it is saved. 
 * If none, the previous is restored. 
 */
function saveOrRestoreSelection() {                                             //console.log('----------- saveOrRestoreSelection')
    const $elem = this.$input;  
    const field = $elem.data('field'); 
    const prevVal = $elem.data('val');          
    const curVal = getSelVal(field);                                 
    return curVal ? saveSelVal($elem, curVal) : setSelVal(field, prevVal, 'silent');
} 

function saveSelVal($elem, val) {
    $elem.data('val', val);
}
// function updatePlaceholderText(elem, newTxt) {                               //console.log('updating placeholder text to [%s] for elem = %O', newTxt, elem);
//     elem.selectize.settings.placeholder = 'Select ' + newTxt;
//     elem.selectize.updatePlaceholder();
// }

export function enableComboboxes($pElems, enable) {
    $pElems.each((i, elem) => { enableCombobox(enable, '#'+elem.id) });
}
function enableCombobox(enable, selId) {
    if (enable === false) { return $(selId)[0].selectize.disable(); }
    $(selId)[0].selectize.enable();
}

/* -------------------------------------------------------------------------- */
export function fadeTable() {  
    $('#borderLayout_eRootPanel, #tool-bar').fadeTo(100, .3);
}


export function showPopUpMsg(msg) {                                                    //console.log("showPopUpMsg. msg = ", msg)
    const popUpMsg = msg || 'Loading...';
    $('#db-popup').text(popUpMsg);
    $('#db-popup').addClass('loading'); //used in testing
    $('#db-popup, #db-overlay').show();
    fadeTable();
}
/** May only be needed in db0map */
export function getTaxonName(taxon) {                                           
    const lvl = taxon.level.displayName;  
    return lvl === "Species" ? taxon.displayName : lvl+' '+taxon.displayName;
}  

export function clearCol2() {
    $('#opts-col2').empty();
}

export function alphaOptionObjs(a, b) {
    var x = a.text.toLowerCase();
    var y = b.text.toLowerCase();
    return x<y ? -1 : x>y ? 1 : 0;
}

