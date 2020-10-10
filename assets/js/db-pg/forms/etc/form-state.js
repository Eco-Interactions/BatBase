/**
 * Central memory for all form-related code.
 *
 * Exports:
 *     getFormEntity
 *     initFormState
 *     addEntityFormState
 *
 * TOC
 *     INIT FORM MEMORY
 *     GETTERS
 *     SETTERS
 */
import { alertIssue } from '../forms-main.js';
import { _db, _u } from '../../db-main.js';

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
    const dataKeys = getDataKeysForEntityRootForm(action, entity);
    formState.init = true; //eliminates possibility of opening form multiple times.
    return _db('getData', [dataKeys]).then(data => {
        initMainState(data);
        addEntityFormState(entity, 'top', null, action);                        console.log("       #### Init formState = %O, curFormState = %O", _u('snapshot', [formState]), formState);
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
function getDataKeysForEntityRootForm(action, entity) {
    const map = {
        'author': {
            'edit': ['source', 'author']
        },
        'citation': {
            'edit': ['source', 'citation', 'author', 'publisher']
        },
        'interaction': {
            'create': ['author', 'citation', 'interactionType', 'location',
                'publication', 'publisher', 'source', 'taxon'],
            'edit': ['author', 'citation', 'interaction', 'interactionType',
                'location', 'publication', 'publisher', 'source', 'taxon'],
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
 * > Interaction create form: unchanged - exists after form submit and before any changes
 * > Location forms: geoJson - geoJson entity for this location, if it exists.
 * > Taxon forms: groupData - added to formState.forms (see props @initTaxonParams)
 */
export function addEntityFormState(entity, level, pSel, action) {
    formState.forms[entity] = level;
    formState.forms[level] = {
        action: action,
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
export function initGroupState(role, groupId, subGroupName) {
    return _db('getData', [['group', 'groupNames', 'levelNames']])
        .then(data => getGroupSubGroupNames(data))
        .then(data => setTxnState(data.group, data.groupNames, data.levelNames, data.subGroups));

    function getGroupSubGroupNames(data) {
        const groupName = data.group[groupId].displayName;
        return _db('getData', [groupName+'SubGroupNames'])
            .then(subGroups => {data.subGroups = subGroups; return data;})
    }

    function setTxnState(groups, groupNames, levels, subGroupNames) {
        const group = groups[groupId];

        formState.forms.groupData = {
            lvls: levels, //Object with each (k) level name and it's (v) id and order
            groupRanks: group.uiLevelsShown,
            groupName: group.displayName,
            groups: groupNames,
            subGroup: subGroupName || Object.keys(subGroupNames)[0].split(' ')[1],
            subGroups: group.taxa,
            subGroupNames: subGroupNames,
            role: role,
            oppositeRole: role === 'Subject' ? 'Object' : 'Subject',
        };                                                                      console.log('           /--taxon params = %O', formState.forms.groupData)
        return formState.forms.groupData;
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
    return formState.forms.groupData ? formState.forms.groupData[prop] : false;
}
export function getGroupState() {
    return formState.forms.groupData;
}
export function getFormFieldData(fLvl, field) {
    return formState.forms[fLvl].fieldData[field];
}
export function getEntityRcrds(entity) {
    if (!formState.records) { return; } //form closing
    return typeof entity == 'string' ? formState.records[entity] : buildRcrdsObj(entity);
}
function buildRcrdsObj(entities) {
    const rcrds = {};
    entities.forEach(ent => { rcrds[ent] = formState.records[entity]});
    return rcrds;
}/** Returns the record for the passed id and entity-type. */
export function getRcrd(entity, id) {
    if (!formState.records || !formState.records[entity]) { return; }
    return formState.records[entity][id] ?
        _u('snapshot', [formState.records[entity][id]]) :
        alertIssue('noRcrdFound', {id: id, entity: entity });
}
/* ---------------------------- Setters ------------------------------------- */
/**
 * Edge case: After form submit, the updated data is fetched and stored here, but
 * if the form is closed before the data is stored, cancel storing the data.
 */
export function addEntityRecords(entity, rcrds) {
    if (!formState.records) { return; } //See comment for explanation
    formState.records[entity] = rcrds;
}
export function addRequiredFieldInput(fLvl, input) {
    formState.forms[fLvl].reqElems.push(input);
}
export function addComboToFormState(fLvl, field) {                              //console.log('addComboTo[%s]Memory [%s]', fLvl, field);
    if (!formState.forms) { return; } //form was closed.
    formState.forms[fLvl].selElems.push(field);
}
export function setStateProp(prop, val) {
    formState[prop] = val;
}
export function setFormProp(fLvl, prop, val) {
    formState.forms[fLvl][prop] = val;
}
export function setGroupProp(prop, val) {
    return formState.forms.groupData[prop] = val;
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