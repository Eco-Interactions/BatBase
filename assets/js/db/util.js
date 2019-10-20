
import * as _db from './idb-util';
import * as db_filters from './db-table/db-filters.js';
import * as db_page from './db-page.js';
import { addNewDataToStorage, initStoredData, replaceUserData } from './db-sync.js';
import { showLoadingDataPopUp, showPopUpMsg } from './db-ui.js';
import { newIntList, selIntList } from './panels/save-ints.js';
import { newFilterSet, selFilterSet } from './panels/save-fltrs.js';
/* 
 * Exports:                     Imported by:
 *     (IDB Storage Methods)
 *         downloadFullDb           db-sync
 *         getData
 *         setData
 *   addEnterKeypressClick
 *   alphaOptionObjs
 *   buildElem
 *   buildSelectElem
 *   buildSimpleOpts
 *   buildOptsObj
 *   getDataFromStorage
 *   getDetachedRcrd
 *   getOptsFromStoredData
 *   getSelVal
 *   initCombobox
 *   initComboboxes
 *   init_db
 *   lcfirst 
 *   replaceSelOpts
 *   sendAjaxQuery
 *   setSelVal
 *   stripString
 *   snapshot
 *   triggerComboChangeReturnPromise
 *   ucfirst 
*/
extendPrototypes();
/*------------------------ IDB Storage Methods -----------------------------------------------------------------------*/
export function downloadFullDb() {
    _db.downloadFullDb();
}
/**
 * Gets data from data storage for each storage property passed. If an array
 * is passed, an object with each prop as the key for it's data is returned. 
 * If a property is not found, false is returned. 
 */
export function getData(props, returnUndefined) {
    return _db.getData(props, returnUndefined);
}
export function setData(k, v) {
    return _db.setData(k, v);
}
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
/*---------- Object Helpers ----------------------------------------------*/
export function snapshot(obj) {
    return JSON.parse(JSON.stringify(obj));
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
/** ------- Options Methods --------- */
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
export function alphaOptionObjs(a, b) {
    var x = a.text.toLowerCase();
    var y = b.text.toLowerCase();
    return x<y ? -1 : x>y ? 1 : 0;
}  
/** Builds options out of a stored entity-name object. */
export function getOptsFromStoredData(prop) {                                   
    return _db.getData(prop, true).then(data => {                               //console.log('       --getOptsFromStoredData. [%s].', prop);
        if (!data) { console.log('NO STORED DATA for [%s]', prop);return []; }
        return buildOptsObj(data, Object.keys(data).sort());
    });
}
/** 
 * Builds options out of the entity-name  object. Name (k) ID (v). If an option 
 * group is passed, an additional 'group' key is added that will serve as a category 
 * for the options in the group.
 */
export function buildOptsObj(entityObj, sortedKeys) {                           //console.log('buildOpts from obj = %O, order = %O', entityObj, sortedKeys);
    return sortedKeys.map(function(name) {
        return typeof entityObj[name] === 'object' ? 
            { group: entityObj[name].group, 
              text: ucfirst(name),
              value: entityObj[name].value } :
            { value: entityObj[name], text: ucfirst(name) }
    });    
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
/*-----------------AJAX Callbacks---------------------------------------------*/
export function sendAjaxQuery(dataPkg, url, successCb, errCb) {                 logAjaxData(dataPkg, arguments);
    return $.ajax({
        method: "POST",
        url: url,
        success: successCb || dataSubmitSucess,
        error: errCb || ajaxError,
        data: JSON.stringify(dataPkg)
    });
    
    function dataSubmitSucess(data, textStatus, jqXHR) { 
        if (['dev', 'test'].indexOf($('body').data('env') != -1)) { 
            console.log("Ajax Success! data = %O, textStatus = %s, jqXHR = %O", data, textStatus, jqXHR); }
    }
    function ajaxError(jqXHR, textStatus, errorThrown) {
        console.log("ajaxError. responseText = [%O] - jqXHR:%O", jqXHR.responseText, jqXHR);
    }
}
function logAjaxData(dataPkg, args) {
    if (['dev', 'test'].indexOf($('body').data('env') != -1)) { console.log("           --Sending Ajax data =%O arguments = %O", dataPkg, args);
    } else { console.log("          --Sending Ajax data =%O", dataPkg); }
}
export function alertErr(err) {                                                 console.log('err = %O', err);console.trace();
    if ($('body').data('env') === 'test') { return; }
    alert(`ERROR. Try reloading the page. If error persists, ${getErrMsgForUserRole()}`);
}
export function getErrMsgForUserRole() {
    const userRole = $('body').data('user-role');
    const msgs = { visitor: getVisitorErrMsg, user: getUserErrMsg };
    return msgs[userRole] ? msgs[userRole]() : getEditorErrMsg();
}
function getVisitorErrMsg() {
    return `please contact us at info@batplant.org and let us know about the issue you are experiencing.`;
}
function getUserErrMsg() {
    return `please contact us by Leaving Feedback on this page (from the user menu) and let us know about the issue you are experiencing.`;
}
function getEditorErrMsg() {
    return `please follow these steps and email Kelly or Sarah. 
> Open the browser logs: Open Chrome menu -> "More Tools" -> "Developer Tools".
> Once the panel loads and the "console" tab is displayed, take a screenshot.
> Email a description of the steps to reproduce this error and any additional information or screenshots that might help. Thanks!`;
}
/* ------------- Data Util -------------------------------------------------- */
/**  Returns a copy of the record detached from the original. */
export function getDetachedRcrd(rcrdKey, rcrds) {                               //console.log("getDetachedRcrd. key = %s, rcrds = %O", rcrdKey, rcrds);
    try {
       return snapshot(rcrds[rcrdKey]);
    }
    catch (e) { 
       // console.log("#########-ERROR- couldn't get record [%s] from %O", rcrdKey, rcrds);
    }
}
export function getTaxonName(taxon) {                                           
    const lvl = taxon.level.displayName;  
    return lvl === "Species" ? taxon.displayName : lvl+' '+taxon.displayName;
}  
/* ------------- Selectize Library Helpers ---------------------------------- */
/**
 * Inits 'selectize' for each select elem in the form's 'selElems' array
 * according to the 'selMap' config. Empties array after intializing.
 */
export function initCombobox(field, options, change) {                          //console.log("initCombobox [%s] args = %O", field, arguments);
    const confg = getSelConfgObj(field); 
    initSelectCombobox(confg, options, change);  
} /* End initComboboxes */
export function initComboboxes(fieldAry) {
    fieldAry.forEach(field => initCombobox(field));
}
function getSelConfgObj(field) {  
    const confgs = { 
        // Search Page Filter/Focus Comboboxes that Affect UI & Table Directly
        'Focus' : { name: field, id: '#search-focus', change: db_page.selectSearchFocus, blur: true },
        'Class' : { name: field, id: '#sel'+field, change: db_filters.updateTaxonSearch, blur: true },
        'Country' : { name: field, id: '#sel'+field, change: db_filters.updateLocSearch, blur: true },
        'Family' : { name: field, id: '#sel'+field, change: db_filters.updateTaxonSearch, blur: true },
        'Genus' : { name: field, id: '#sel'+field, change: db_filters.updateTaxonSearch, blur: true },
        'Order' : { name: field, id: '#sel'+field, change: db_filters.updateTaxonSearch, blur: true },
        'Publication Type' : {name: field, id: '#selPubType', change: db_filters.updatePubSearch, blur: true },
        'Region' : { name: field, id: '#sel'+field, change: db_filters.updateLocSearch, blur: true },
        'Species' : { name: field, id: '#sel'+field, change: db_filters.updateTaxonSearch, blur: true },
        'Time Filter': { name: 'Filter', id: '#selTimeFilter' },
        'View': { name: 'View', id: '#sel-view', change: false, blur: true },
        // Search Page Comboboxes with Create Options and Sub-panels
        'Int-lists': { name: 'Interaction List', id: '#selIntList', add: newIntList, change: selIntList },
        'Saved Filter Set': {name: field, id: '#selSavedFilters', add: newFilterSet, change: selFilterSet },
    };
    return confgs[field];
}
/**
 * Inits the combobox, using 'selectize', according to the passed config.
 * Note: The 'selectize' library turns select dropdowns into input comboboxes
 * that allow users to search by typing.
 */
function initSelectCombobox(confg, opts, change) {                              //console.log("initSelectCombobox. CONFG = %O", confg)
    const options = {
        create: confg.add || false,
        onChange: change || confg.change,
        onBlur: confg.blur ? saveOrRestoreSelection : null,
        placeholder: getPlaceholer(confg.id, confg.name, confg.add)
    };
    if (opts) { addAdditionalOptions(); }                                       //console.log('options = %O', options);
    $(confg.id).selectize(options);  
    /** All non-standard options are added to this 'options' prop. */ 
    function addAdditionalOptions() {
        for (var opt in opts) {  
            options[opt] = opts[opt];
        }
    }
} /* End initSelectCombobox */
function getPlaceholer(id, name, add, empty) {
    const optCnt = empty ? 0 : $(id + ' > option').length;  
    const placeholder = 'Select ' + name
    return optCnt || add ? placeholder : '- None -';
}
export function getSelVal(field) {                                              //console.log('getSelVal [%s]', field);
    const confg = getSelConfgObj(field);                                        //console.log('getSelVal [%s] = [%s]', field, $(confg.id)[0].selectize.getValue());
    return $(confg.id)[0].selectize.getValue();  
}
// function getSelTxt(field) {
//     const confg = getSelConfgObj(field);
//     const $selApi = $(confg.id)[0].selectize; 
//     return $selApi.getItem(id).length ? $selApi.getItem(id)[0].innerText : false;
// }
export function setSelVal(field, val, silent) {                                 //console.log('setSelVal [%s] = [%s]', field, val);
    const confg = getSelConfgObj(field);
    const $selApi = $(confg.id)[0].selectize; 
    $selApi.addItem(val, silent); 
    saveSelVal($(confg.id), val);
}
/**
 * For comboboxes on the database page that must remain filled for the UI to stay synced.
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
export function updatePlaceholderText(id, newTxt, optCnt) {                     //console.log('updating placeholder text to [%s] for elem = %O', newTxt, elem);
    const emptySel = optCnt === 0;
    $(id)[0].selectize.settings.placeholder = getPlaceholer(id, newTxt, false, emptySel);
    $(id)[0].selectize.updatePlaceholder();
}
// export function enableComboboxes($pElems, enable) {   console.log('############ enableComboboxes used')
//     $pElems.each((i, elem) => { enableCombobox(enable, '#'+elem.id) });
// }
// function enableCombobox(enable, selId) {
//     if (enable === false) { return $(selId)[0].selectize.disable(); }
//     $(selId)[0].selectize.enable();
// }
export function replaceSelOpts(selId, opts, changeHndlr, name) {                //console.log('replaceSelOpts. args = %O', arguments)
    const $selApi = $(selId)[0].selectize;
    if (!opts) { return clearCombobox($selApi); }
    if (name) { updatePlaceholderText(selId, name, opts.length); }    
    if (changeHndlr) { 
        $selApi.off('change');
        $selApi.on('change', changeHndlr); 
    }  
    $selApi.clearOptions(); 
    $selApi.addOption(opts);
    $selApi.refreshOptions(false);
}
function clearCombobox($selApi) {
    $selApi.off('change');
    $selApi.clearOptions();
}
export function triggerComboChangeReturnPromise(field, val) {                   //console.log('triggerComboChange [%s] = [%s]', field, val);
    const confg = getSelConfgObj(field);
    const $selApi = $(confg.id)[0].selectize; 
    const change = confg.change;
    $selApi.addItem(val, 'silent');
    return change(val);
}
/* ------------- Unused ----------------------------------------------------- */
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