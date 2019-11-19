/**
 *
 *
 *
 * Exports:             Imported by:
 *     getFormEntity            forms-main
 *     initFormMemory           forms-main
 *     initEntityFormMemory     
 */
import { getData, snapshot } from '../../../util.js';

let formMemory = {};

export function clearMemory() {
    formMemory = {};
}
/*--------------------- INIT FORM MEMORY -------------------------------------*/
/**
 * -- Property descriptions:
 * > action - ie, Create, Edit.
 * > editing - Container for the id(s) of the record(s) being edited. (Detail 
        ids are added later). False if not editing.
 * > entity - Name of this form's entity     
 * > forms - Container for form-specific params 
 *  >> expanded - Obj of form entities(k) and their showAll/showDefault fields state(v)
 * > formLevels - An array of the form level names/tags/prefixes/etc.
 * > records - An object of all records, with id keys, for each of the 
 *   root entities - Location, Source and Taxa, and any sub entities as needed.
 * > submitFocus - Stores the table-focus for the entity of the most recent 
        form submission. Will be used on form-exit.
 */
export function initFormMemory(action, entity, id) {  
    const  entities = ['source', 'location', 'taxon', 'citation', 'publication', 
        'author', 'publisher'];
    const prevSubmitFocus = formMemory.submitFocus;
    const xpandedForms = formMemory.forms ? formMemory.forms.expanded : {};
    return getData(entities).then(data => {
        initMainMemory(data);
        initEntityFormMemory(entity, 'top', null, action); console.log("#### Init formMemory = %O, curFormMemory = %O", snapshot(formMemory), formMemory);
        return formMemory;
    });

    function initMainMemory(data) {
        formMemory = {
            action: action,
            editing: action === 'edit' ? { core: id || null, detail: null } : false,
            entity: entity,
            forms: { expanded: xpandedForms },
            formLevels: ['top', 'sub', 'sub2'],
            records: data,
            submitFocus: prevSubmitFocus || false
        };
    }
}
/**
 * Adds the properties and confg that will be used throughout the code for 
 * generating, validating, and submitting sub-form. 
 * -- Property descriptions:
 * > action - create || edit
 * > confg - The form config object used during form building.
 * > fieldConfg - Form fields and types, values entered, and the required fields.
 * > entity - Name of this form's entity.
 * > entityType - Sub-entity type. Eg, publication-types: Book, Journal, etc.
 * > onSubmitSuccess - Handles form exit/reset.
 * > fieldConfg - Form fields and types, values entered, and the required fields.
 * > misc - object to hold the various special-case props
 * > pSelId - The id of the parent select of the form.
 * > reqElems - All required elements in the form.
 * > selElems - Contains all selElems until they are initialized with selectize.
 * > vals - Stores all values entered in the form's fields.
 * --- Misc entity specific properties
 * > Citation forms: pub - { src: pubSrc, pub: pub } (parent publication)
 * > Location forms: geoJson - geoJson entity for this location, if it exists.
 * > Taxon forms: taxonPs - added to formMemory.forms (see props @initTaxonParams)
 */
export function initEntityFormMemory(entity, level, pSel, action) {       //console.log("initLvlParams. formMemory = %O, arguments = %O", formMemory, arguments)
    formMemory.forms[entity] = level;
    formMemory.forms[level] = {
        action: action,
        fieldConfg: { fields: {}, vals: {}, required: [] },
        entity: entity,
        entityType: false,
        onSubmitSuccess: null,
        // exitHandler: getFormExitHandler(formConfg, action),
        misc: {},
        pSelId: pSel,
        reqElems: [],
        selElems: [], 
        // typeConfg: false,
        vals: {}
    };   
    return formMemory;                                                                       //console.log("fLvl params = %O", formMemory.forms[level]);
}
// /* ---------------------------- Getters ------------------------------------- */
export function getAllFormMemory() {
    return formMemory;
}
export function getFormMemory(argument) {
    // body...
}
export function getFormProp(prop, fLvl) {
    return formMemory.forms[fLvl][prop];
}
export function getFormEntity(fLvl) {
    return formMemory.forms[fLvl].entity;
}
export function getFormParentId(fLvl) {
    return formMemory.forms[fLvl].pSelId;
}
// export function getFormLevelParams(fLvl) {
//     return formMemory.forms[fLvl];
// }
export function getFormFieldConfg(fLvl, field) {
    return formMemory.forms[fLvl].fieldConfg.vals[field];
}
export function getEntityRcrds(entity) {
    return typeof entity == 'string' ? formMemory.records[entity] : buildRcrdsObj(entity);
}
function buildRcrdsObj(entities) {
    const rcrds = {};
    entities.forEach(ent => { rcrds[ent] = formMemory.records[entity]});
    return rcrds;
}
/* ---------------------------- Setters ------------------------------------- */
export function addRequiredFieldInput(fLvl, input) {  
    formMemory.forms[fLvl].reqElems.push(input);
}
export function addComboToMemory(fLvl, field) {
    formMemory.forms[fLvl].selElems.push(field);    
}
export function setFormMemory(fLvl, prop, val) {
    formMemory.forms[fLvl][prop] = val;
}
export function setFormFieldConfg(fLvl, field, confg) {
    formMemory.forms[fLvl].fieldConfg.vals[field] = confg
}
export function setFormFieldValueMemory(fLvl, field, val) {
    formMemory.forms[fLvl].fieldConfg.vals[field].val = val;
}
export function setFormEntityType(fLvl, type) {
    formMemory.forms[fLvl].entityType = type;
}
export function setOnSubmitSuccessHandler(fLvl, hndlr) {
    formMemory.forms[fLvl].onSubmitSuccess = hndlr;
}