/**
 * @module app/util/elem/build
 * Builds an HTML element.
 */
/**
 * @ars {String} tag - Element type
 * @ars {Object} attrs - Element attributes and properties.
 * @return {Node} The HTML element.
 */
/* ------------------------ GET ELEM FULL ----------------------------------- */
export function getElem(tag, attrs) {                               /*dbug-log*///console.log("getElem [%s] attrs = %O", tag, attrs);// attr = { id, class, name, type, value, text }
    const elem = document.createElement(tag);
    if (attrs) { addAttributes(elem, attrs); }
    return elem;
}
function addAttributes(elem, attrs) {
    addElemProps(elem, attrs);
    addAttrProps(elem, attrs);
}
function addElemProps(elem, attrs) {
    const allProps = [ 'id', 'class', 'title', 'text', 'html'];
    const transProps = { class: 'className', text: 'textContent', html: 'innerHTML' };
    allProps.forEach(orgProp => {
        if (orgProp in attrs) {
            let prop = (orgProp in transProps) ? transProps[orgProp] : orgProp;
            elem[prop] = attrs[orgProp];
        }
    });
}
function addAttrProps(elem, attrs) {
    const allProps = [ 'name', 'type', 'value', 'placeholder', 'for' ];
    const attrsToAdd = {};
    allProps.forEach(prop => {
       if (prop in attrs) { attrsToAdd[prop] = attrs[prop]; }
    });
    $(elem).attr(attrsToAdd);
}
/**
 * Builds a select drop down with the options, attributes and change method
 * passed. Sets the selected option as the passed 'selected' or the default 'all'.
 */
export function getSelect(options, attrs, onChange, selected = false) {     /*dbug-log*/console.log('getSelect opts %O attr %O onChange %O selected ?[%s]', options, attrs, onChange, selected);
    const $selectElem = $(getElem('select', attrs));
    $selectElem.change(onChange);
    options.forEach(appendOption);
    setSelectedVal($selectElem, selected);
    return $selectElem[0];

    function appendOption(opt) {
        $selectElem.append(opt);
    }
}
function setSelectedVal($selectElem, selected) {
    selected = selected === false ? 'all' : selected;
    $selectElem.val(selected);
}