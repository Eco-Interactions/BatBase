/**
 * Central memory for all form-related code.
 *
 * Exports:             
 *     getFormEntity    
 *     initFormMemory   
 *     initEntityFormMemory     
 */
import * as _i from '../forms-main.js';

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
 * > formLevels - An array of the form level names/tags/prefixes/etc.
 * > records - An object of all records, with id keys, for each of the 
 *   root entities - Location, Source and Taxa, and any sub entities as needed.
 * > submitFocus - Stores the table-focus for the entity of the most recent 
        form submission. Will be used on form-exit.
 */
export function initFormMemory(action, entity, id) {  
    const  entities = ['source', 'location', 'taxon', 'citation', 'publication', 
        'author', 'publisher'];
    if (ifEditingInteraction(action, entity)) { entities.push('interaction'); }

    return _i.util('getData', [entities]).then(data => {
        initMainMemory(data);
        initEntityFormMemory(entity, 'top', null, action);                      console.log("       #### Init formMemory = %O, curFormMemory = %O", _i.util('snapshot', [formMemory]), formMemory);
        return formMemory;
    });

    function initMainMemory(data) {
        formMemory = {
            action: action,
            editing: action === 'edit' ? { core: id || null, detail: null } : false,
            entity: entity,
            forms: {},  // expanded: xpandedForms 
            formLevels: ['top', 'sub', 'sub2'],
            records: data,
        };
    }
}
function ifEditingInteraction(action, entity) {
    return action === 'edit' && entity === 'interaction';
}
/**
 * Adds the properties and confg that will be used throughout the code for 
 * generating, validating, and submitting sub-form. 
 * -- Property descriptions:
 * > action - create || edit
 * > confg - The form config object used during form building.
 * > expanded - show all fields (true) or show default.
 * > entity - Name of this form's entity.
 * > entityType - Sub-entity type. Eg, publication-types: Book, Journal, etc.
 * > onFormClose - Handles form exit/reset.
 * > fieldData - Obj with each form field (k) and it's (v) { value, fieldType }}
 * > misc - object to hold the various special-case props
 * > pSelId - The id of the parent select of the form.
 * > reqElems - All required elements in the form.
 * > selElems - Contains all selElems until they are initialized with selectize.
 * --- Misc entity specific properties
 * > Citation forms: rcrds - { src: pubSrc, pub: pub } (parent publication)
 * > Location forms: geoJson - geoJson entity for this location, if it exists.
 * > Taxon forms: taxonPs - added to formMemory.forms (see props @initTaxonParams)
 */
export function initEntityFormMemory(entity, level, pSel, action) {       
    formMemory.forms[entity] = level;
    formMemory.forms[level] = {
        action: action,
        expanded: false,
        fieldData: {},
        entity: entity,
        entityType: false,
        onFormClose: null,
        pSelId: pSel,
        reqElems: [],
        selElems: [], 
    };                                                                          //console.log("   /initEntityFormMemory. formMemory = %O, arguments = %O", formMemory, arguments)
    return formMemory;                                                                       
}
/*------------- Taxon Params --------------------*/
export function initTaxonMemory(role, realmId) {                                //console.log('###### INIT ######### [%s] = id [%s]', role, realmId);
    return _i.util('getData', [['realm', 'realmNames', 'levelNames']])
        .then(data => setTxnMmry(data.realm, data.realmNames, data.levelNames));

    function setTxnMmry(realms, realmNames, levels) {   
        const realm = realms[realmId];
        const taxon = formMemory.records.taxon[realm.taxon];

        formMemory.forms.taxonPs = { 
            lvls: levels, //Object with each (k) level name and it's (v) id and order
            realmLvls: realm.uiLevelsShown,  
            realmName: realm.displayName, 
            realms: realmNames,
            realmTaxon: taxon,
            role: role,
            rootLvl: taxon.level.displayName,
        };                                                                      console.log('           /--taxon params = %O', formMemory.forms.taxonPs)
        return formMemory.forms.taxonPs;
    }
} 
/* ---------------------------- Getters ------------------------------------- */
export function isEditForm() {
    return formMemory.action === 'edit';
}
export function getEditEntityId(type) {
    return formMemory.editing[type];
}
export function getAllFormMemory() {  
    return formMemory;
}
export function getMemoryProp(prop) {                                           //console.log('args = %O, memory = %O', arguments, formMemory); 
    return formMemory[prop];
}
/* source-forms */
export function getFormMemory(fLvl) {
    return formMemory.forms[fLvl] ? formMemory.forms[fLvl] : false;
}
export function getFormProp(fLvl, prop) {                                       //console.log('args = %O, memory = %O', arguments, formMemory); 
    return formMemory.forms[fLvl] ? formMemory.forms[fLvl][prop] : false;
}
export function getFormEntity(fLvl) { 
    return formMemory.forms[fLvl] ? formMemory.forms[fLvl].entity : false;
}
export function getFormParentId(fLvl) {
    return formMemory.forms[fLvl] ? formMemory.forms[fLvl].pSelId : false;
}
export function getTaxonProp(prop) {  
    return formMemory.forms.taxonPs ? formMemory.forms.taxonPs[prop] : false;
}
export function getTaxonMemory() {
    return formMemory.forms.taxonPs;
}
export function getFormFieldData(fLvl, field) {
    return formMemory.forms[fLvl].fieldData[field];
}
export function getEntityRcrds(entity) {
    return typeof entity == 'string' ? formMemory.records[entity] : buildRcrdsObj(entity);
}
function buildRcrdsObj(entities) {
    const rcrds = {};
    entities.forEach(ent => { rcrds[ent] = formMemory.records[entity]});
    return rcrds;
}/** Returns the record for the passed id and entity-type. */
export function getRcrd(entity, id) {                                           
    if (!formMemory.records[entity]) { return; }
    const rcrd = formMemory.records[entity][id];
    if (!rcrd) { return console.log('!!!!!!!! No [%s] found in [%s] records = %O', id, entity, formMemory.records); console.trace() }
    return _i.util('snapshot', [formMemory.records[entity][id]]); 
}
/* ---------------------------- Setters ------------------------------------- */
export function addEntityRecords(entity, rcrds) {
    formMemory.records[entity] = rcrds;
}
export function addRequiredFieldInput(fLvl, input) {  
    formMemory.forms[fLvl].reqElems.push(input);
}
export function addComboToMemory(fLvl, field) {                                 //console.log('addComboTo[%s]Memory [%s]', fLvl, field);
    formMemory.forms[fLvl].selElems.push(field);    
}
export function setMemoryProp(prop, val) {
    formMemory[prop] = val;
}
export function setFormMemory(fLvl, params) {
    formMemory.forms[fLvl] = params;
}
export function setFormProp(fLvl, prop, val) {
    formMemory.forms[fLvl][prop] = val;
}
export function setTaxonProp(prop, val) {  
    return formMemory.forms.taxonPs[prop] = val;
}
export function setFormFieldData(fLvl, field, val, type) {
    const fieldData = formMemory.forms[fLvl].fieldData;
    if (!fieldData[field]) { fieldData[field] = {} }
    if (type) { fieldData[field].type = type; }
    fieldData[field].val = val;             
}
export function setFormEntityType(fLvl, type) {
    formMemory.forms[fLvl].entityType = type;
}
export function setonFormCloseHandler(fLvl, hndlr) { //fix capitalization
    formMemory.forms[fLvl].onFormClose = hndlr;
}