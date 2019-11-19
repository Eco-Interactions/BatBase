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
import * as _forms from '../forms-main.js';
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
/*------------- Taxon --------------------*/
/**
 * Inits the taxon params object.
 * > lvls - All taxon levels
 * > realm - realm taxon display name
 * > realmLvls - All levels for the selected realm
 * > curRealmLvls - Levels present in selected realm.
 * > realmTaxon - realm taxon record
 * > prevSel - Taxon already selected when form opened, or null.
 * > objectRealm - Object realm display name. (Added elsewhere.)
 */
export function initTaxonMemory(role, realmName) {                                 //console.log('###### INIT ######### role [%s], realm [%s], id [%s]', role, realmName, id);
    const realmLvls = {
        'Bat': ['Order', 'Family', 'Genus', 'Species'],
        'Arthropod': ['Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'],
        'Plant': ['Kingdom', 'Family', 'Genus', 'Species']
    };
    return _forms.getRealmTaxon(realmName).then(buildBaseTaxonParams);                 console.log('       --taxon params = %O', fP.forms.taxonPs)

    function buildBaseTaxonParams(realmTaxon) {
        const prevSelectedTxnOpt = buildOptForPrevSelectedTaxon(role);
        const reset = fP.forms.taxonPs ? fP.forms.taxonPs.prevSel.reset : false;
        fP.forms.taxonPs = { 
            lvls: ['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'],
            realm: realmName, 
            allRealmLvls: realmLvls, 
            curRealmLvls: realmLvls[realmName],
            realmTaxon: realmTaxon,
            prevSel: prevSelectedTxnOpt
        };         
        if (reset) { fP.forms.taxonPs.prevSel.reset = true; } //removed once reset complete
        if (role === 'Object') { fP.forms.taxonPs.objectRealm = realmName; }
    }
}
function buildOptForPrevSelectedTaxon(role) {
    const id = $('#'+role+'-sel').val() || 
        (fP.forms.taxonPs ? fP.forms.taxonPs.prevSel.val : false);
    return id ? 
        { val: id, text: _forms.getTaxonDisplayName(fP.records.taxon[id]) } :
        { val: null, text: null };
}

/** Returns either the preivously selected object realm or the default. */
export function getObjectRealm() {
    return !fP.forms.taxonPs ? 'Plant' : (fP.forms.taxonPs.objectRealm || 'Plant');
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
export function getTaxonProp(prop) {
    return formMemory.forms.taxonPs[prop];
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
}/** Returns the record for the passed id and entity-type. */
export function getRcrd(entity, id) {                                                  //console.log('getRcrd [%s] id = [%s]. fP = %O', entity, id, fP);
    if (!formMemory.records[entity]) { return; }
    const rcrd = formMemory.records[entity][id];
    if (!rcrd) { return console.log('!!!!!!!! No [%s] found in [%s] records = %O', id, entity, formMemory.records); console.trace() }
    return _forms._util('snapshot', [formMemory.records[entity][id]]); 
}
/* ---------------------------- Setters ------------------------------------- */
export function addRequiredFieldInput(fLvl, input) {  
    formMemory.forms[fLvl].reqElems.push(input);
}
export function addComboToMemory(fLvl, field) {
    formMemory.forms[fLvl].selElems.push(field);    
}
export function setFormProp(fLvl, prop, val) {
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