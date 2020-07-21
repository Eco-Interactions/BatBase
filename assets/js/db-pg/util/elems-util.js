/**
 * Html element methods.
 *
 * Exports:
 *     buildElem
 *     buildSelectElem
 *     buildSimpleOpts
 *     alphaOptionObjs
 *     getOptsFromStoredData
 *     buildOptsObj
 *     addEnterKeypressClick
 */
import { _db, _u} from '../db-main.js';

export function buildElem(tag, attrs) {                                         //console.log("buildElem called. tag = %s. attrs = %O", tag, attrs);// attr = { id, class, name, type, value, text }
    const elem = document.createElement(tag);
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
            text: _u('ucfirst', [option])  });
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
export function getOptsFromStoredData(prop) {                                   //bp
    return _db('getData', [prop, true]).then(data => {                               //console.log('       --getOptsFromStoredData. [%s].', prop);
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
    return sortedKeys.map(name => {
        return typeof entityObj[name] === 'object' ?
            { group: entityObj[name].group,
              text: _u('ucfirst', [name]),
              value: entityObj[name].value
            } : { value: entityObj[name], text: _u('ucfirst', [name]) }
    });
}
/*---------- Keypress event Helpers --------------------------------------*/
export function addEnterKeypressClick(elem) {
    $(elem).keypress(function(e){ //Enter
        if((e.keyCode || e.which) == 13){ $(this).trigger('click'); }
    });
}