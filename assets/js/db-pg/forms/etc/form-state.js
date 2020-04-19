/**
 * Central memory for all form-related code.
 *
 * Exports:             
 *     getFormEntity    
 *     initFormState   
 *     addEntityFormState     
 */
import * as _f from '../forms-main.js';

let formState = {}; //formState

export function clearState() {  
    formState = {};
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
 * > submit - Data used during form submission: fLvl, entity
 */
export function initFormState(action, entity, id) {  
    const entities = getDataKeysForEntityForm(action, entity);
    formState.init = true; //eliminates possibility of opening form multiple times.
    return _f.util('getData', [entities]).then(data => {
        initMainState(data);
        addEntityFormState(entity, 'top', null, action);                        console.log("       #### Init formState = %O, curFormState = %O", _f.util('snapshot', [formState]), formState);
        delete formState.init;
        return formState;
    });

    function initMainState(data) {
        formState = {
            action: action,
            editing: action === 'edit' ? { core: id || null, detail: null } : false,
            entity: entity,
            forms: {},
            formLevels: ['top', 'sub', 'sub2'],
            records: data,
        };
    }
}
function getDataKeysForEntityForm(action, entity) {
    const coreKeys = ['author', 'citation', 'interaction', 'interactionType', 
        'location', 'publication', 'publisher', 'source', 'taxon'];
    return entity === 'interaction' ? 
        getIntFormDataKeys() : getSubEntityFormDataKeys(entity, 'edit');

    function getIntFormDataKeys() {
        if (action === 'create') { coreKeys.splice(2, 1); }
        return coreKeys;
    }
}
function getSubEntityFormDataKeys(entity, action) {
    const map = {
        'author': {
            'edit': ['source', 'author']
        },
        'citation': {
            'edit': ['source', 'citation', 'author', 'publisher']
        },
        'location': {
            'edit': ['location']
        },
        'publication': {
            'edit': ['source', 'publication']
        },
        'publisher': {
            'edit': ['source', 'publisher']
        },
        'taxon': {
            'edit': ['taxon']
        }
    }
    return map[entity][action];
}
/**
 * Adds the properties and confg that will be used throughout the code for 
 * generating, validating, and submitting entity sub-forms. 
 * -- Property descriptions:
 * > action - create || edit
 * > confg - The form config object used during form building.
 * > expanded - show all fields (true) or show default.
 * > entity - Name of this form's entity.
 * > entityType - Sub-entity type. Eg, publication-types: Book, Journal, etc.
 * > onFormClose - Handles form exit/reset.
 * > fieldData - Obj with each form field (k) and it's (v) { value, fieldType }
 * > misc - Obj to hold the various special-case props
 * > pSelId - The id of the parent select of the form.
 * > reqElems - All required elements in the form.
 * > selElems - Contains all selElems until they are initialized with selectize.
 * --- Misc entity specific properties
 * > Citation forms: rcrds - { src: pubSrc, pub: pub } (parent publication)
 * > Location forms: geoJson - geoJson entity for this location, if it exists.
 * > Taxon forms: realmData - added to formState.forms (see props @initTaxonParams)
 */
export function addEntityFormState(entity, level, pSel, action) {    
    formState.forms[entity] = level;
    formState.forms[level] = {
        action: action, //
        expanded: false,
        fieldData: {},
        entity: entity,
        entityType: false,
        onFormClose: null,
        pSelId: pSel,
        reqElems: [],
        selElems: [], 
    };                                                                          //console.log("   /addEntityFormState. formState = %O, arguments = %O", formState, arguments)
}
/*------------- Taxon Params --------------------*/
export function initRealmState(role, realmId) { 
    return _f.util('getData', [['realm', 'realmNames', 'levelNames']])
        .then(data => setTxnState(data.realm, data.realmNames, data.levelNames));

    function setTxnState(realms, realmNames, levels) {   
        const realm = realms[realmId];
        const taxon = formState.records.taxon[realm.taxon];

        formState.forms.realmData = { 
            lvls: levels, //Object with each (k) level name and it's (v) id and order
            realmLvls: realm.uiLevelsShown,  
            realmName: realm.displayName, 
            realms: realmNames,
            realmTaxon: taxon,
            role: role,
            rootLvl: taxon.level.displayName,
        };                                                                      console.log('           /--taxon params = %O', formState.forms.realmData)
        return formState.forms.realmData; 
    }
} 
/* ---------------------------- Getters ------------------------------------- */
export function isEditForm() {
    return formState.action === 'edit';
}
export function getEditEntityId(type) {
    return formState.editing[type];
}
export function getFormState() {  
    return Object.keys(formState).length ? formState : false;
}
export function getStateProp(prop) {                                            //console.log('args = %O, memory = %O', arguments, formState); 
    return formState[prop];
}
export function getFormLvlState(fLvl) {
    return formState.forms[fLvl] ? formState.forms[fLvl] : false;
}
export function getFormProp(fLvl, prop) {                                       //console.log('args = %O, memory = %O', arguments, formState); 
    return formState.forms[fLvl] ? formState.forms[fLvl][prop] : false;
}
export function getFormEntity(fLvl) { 
    return formState.forms[fLvl] ? formState.forms[fLvl].entity : false;
}
export function getFormParentId(fLvl) {
    return formState.forms[fLvl] ? formState.forms[fLvl].pSelId : false;
}
export function getTaxonProp(prop) {  
    return formState.forms.realmData ? formState.forms.realmData[prop] : false;
}
export function getRealmState() {
    return formState.forms.realmData;
}
export function getFormFieldData(fLvl, field) {
    return formState.forms[fLvl].fieldData[field];
}
export function getEntityRcrds(entity) {
    return typeof entity == 'string' ? formState.records[entity] : buildRcrdsObj(entity);
}
function buildRcrdsObj(entities) {
    const rcrds = {};
    entities.forEach(ent => { rcrds[ent] = formState.records[entity]});
    return rcrds;
}/** Returns the record for the passed id and entity-type. */
export function getRcrd(entity, id) {                                           
    if (!formState.records[entity]) { return; }
    return formState.records[entity][id] ? 
        _f.util('snapshot', [formState.records[entity][id]]) :
        _f.alertIssue('noRcrdFound', {id: id, entity: entity });
}
/* ---------------------------- Setters ------------------------------------- */
export function addEntityRecords(entity, rcrds) {
    formState.records[entity] = rcrds;
}
export function addRequiredFieldInput(fLvl, input) {  
    formState.forms[fLvl].reqElems.push(input);
}
export function addComboToFormState(fLvl, field) {                              //console.log('addComboTo[%s]Memory [%s]', fLvl, field);
    formState.forms[fLvl].selElems.push(field);    
}
export function setStateProp(prop, val) {
    formState[prop] = val;
}
export function setFormProp(fLvl, prop, val) {
    formState.forms[fLvl][prop] = val;
}
export function setRealmProp(prop, val) {  
    return formState.forms.realmData[prop] = val;
}
export function setFormFieldData(fLvl, field, val, type) {                      //console.log('---setForm[%s]FieldData [%s] =? [%s]', fLvl, field, val);
    const fieldData = formState.forms[fLvl].fieldData;
    if (!fieldData[field]) { fieldData[field] = {} }
    if (type) { fieldData[field].type = type; }
    fieldData[field].val = val;             
}
export function setFormEntityType(fLvl, type) {
    formState.forms[fLvl].entityType = type;
}
export function setOnFormCloseHandler(fLvl, hndlr) { 
    formState.forms[fLvl].onFormClose = hndlr;
}