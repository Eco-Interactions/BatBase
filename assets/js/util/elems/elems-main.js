/**
 * Html element methods.
 *
 * Exports:
 *     getElem
 *     getDiv
 *
 * TOC:
 *    GET ELEMS
 *    GET ELEM FULL
 */
/* --------------------- GET ELEMS ------------------------------------------ */
export function getDiv (attrs) {
    return getElem('div', attrs);
}
export function getLabel (text, attrs = {}) {
    return getElem('label', Object.assign(attrs, { text: text }));
}
/* ------------------------ GET ELEM FULL ----------------------------------- */
export function getElem(tag, attrs) {                                           //console.log("getElem called. tag = %s. attrs = %O", tag, attrs);// attr = { id, class, name, type, value, text }
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
    });                                                                 //console.log("attrsToAdd = %O", attrsToAdd);
    $(elem).attr(attrsToAdd);
}