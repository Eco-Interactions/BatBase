/**
 * Central memory for all form-related code.
 *
 * Export
 *     getFormEntity
 *     initFormState
 *     addEntityFormState
 *
 * TOC
 *     INIT FORM MEMORY
 *     GETTERS
 *     SETTERS
 */
import { _alert, _db, _u } from '~util';

let fState = {}; //formState

export function clearState() {
    fState = {};
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
    fState.init = true; //eliminates possibility of opening form multiple times.
    return _db('getData', [dataKeys]).then(data => {
        initMainState(data);
        addEntityFormState(entity, 'top', null, action);            /*perm-log*/console.log("       #### initFormState initState %O, curState %O", _u('snapshot', [fState]), fState);
        delete fState.init;
        return fState;
    });

    function initMainState(data) {
        fState = {
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
 * > Taxon forms: taxonData - added to fState.forms (see props @initTaxonParams)
 */
export function addEntityFormState(entity, level, pSel, action) {
    fState.forms[entity] = level;
    fState.forms[level] = {
        action: action,
        expanded: false,
        fieldData: {},
        entity: entity,
        entityType: false,
        onFormClose: null,
        pSelId: pSel,
        reqElems: [],
        selElems: [],
    };                                                              /*dbug-log*///console.log("   /addEntityFormState. fState = %O, arguments = %O", fState, arguments)
}
/*------------- Taxon Params --------------------*/
export function initTaxonState(role, groupId, subGroupName) {       /*dbug-log*///console.log('initTaxonState args = %O', arguments);
    return _db('getData', [['group', 'groupNames', 'rankNames']])
        .then(data => setTxnState(data.group, data.groupNames, data.rankNames));

    function setTxnState(groups, groupNames, ranks) {
        const group = groups[groupId];
        const data = {
            groupRanks: group.uiRanksShown,
            groupName: group.displayName,
            groups: groupNames,
            ranks: ranks, //Object with each (k) rank name and it's (v) id and order
            role: role,
            subGroup: subGroupName || Object.keys(group.taxa)[0],
            subGroups: group.taxa,
        };
        data.groupTaxon = fState.records.taxon[group.taxa[data.subGroup].id];
        fState.forms.taxonData = data;                              /*perm-log*/console.log('       --[%s] stateData = %O', data.subGroup, data);
        return data;
    }
}
/* ---------------------------- Getters ------------------------------------- */
export function isEditForm() {
    return fState.action === 'edit';
}
export function getEditEntityId(type) {
    return fState.editing[type];
}
export function getFormState() {
    return Object.keys(fState).length ? fState : false;
}
export function getStateProp(prop) {                                /*dbug-log*///console.log('args = %O, memory = %O', arguments, fState);
    return fState[prop];
}
export function getFormLvlState(fLvl) {
    return fState.forms[fLvl] ? fState.forms[fLvl] : false;
}
export function getFormProp(fLvl, prop) {                           /*dbug-log*///console.log('args = %O, memory = %O', arguments, fState);
    return fState.forms[fLvl] ? fState.forms[fLvl][prop] : false;
}
export function getFormEntity(fLvl) {
    return fState.forms[fLvl] ? fState.forms[fLvl].entity : false;
}
export function getFormParentId(fLvl) {
    return fState.forms[fLvl] ? fState.forms[fLvl].pSelId : false;
}
export function getTaxonProp(prop) {
    return fState.forms.taxonData ? fState.forms.taxonData[prop] : false;
}
export function getGroupState() {
    return fState.forms.taxonData;
}
export function getFormFieldData(fLvl, field) {
    return fState.forms[fLvl].fieldData[field];
}
export function getEntityRcrds(entity) {
    if (!fState.records) { return; } //form closing
    return typeof entity == 'string' ? fState.records[entity] : buildRcrdsObj(entity);
}
function buildRcrdsObj(entities) {
    const rcrds = {};
    entities.forEach(ent => { rcrds[ent] = fState.records[ent]});
    return rcrds;
}/** Returns the record for the passed id and entity-type. */
export function getRcrd(entity, id) {
    if (!fState.records || !fState.records[entity]) { return; }
    const rcrd = fState.records[entity][id] ?
        _u('snapshot', [fState.records[entity][id]]) :
        _alert('alertIssue', ['noRcrdFound', {id: id, entity: entity }]);
    return rcrd ? rcrd : false;
}
/* ---------------------------- Setters ------------------------------------- */
/**
 * Edge case: After form submit, the updated data is fetched and stored here, but
 * if the form is closed before the data is stored, cancel storing the data.
 */
export function addEntityRecords(entity, rcrds) {
    if (!fState.records) { return; } //See comment for explanation
    fState.records[entity] = rcrds;
}
export function addRequiredFieldInput(fLvl, input) {
    fState.forms[fLvl].reqElems.push(input);
}
export function addComboToFormState(fLvl, field) {                  /*dbug-log*///console.log('addComboTo[%s]Memory [%s]', fLvl, field);
    if (!fState.forms) { return; } //form was closed.
    fState.forms[fLvl].selElems.push(field);
}
export function setStateProp(prop, val) {
    fState[prop] = val;
}
export function setFormProp(fLvl, prop, val) {
    fState.forms[fLvl][prop] = val;
}
export function setTaxonProp(prop, val) {
    if (!fState.forms.taxonData) { fState.forms.taxonData = {}; } //Edit-forms need specific props
    return fState.forms.taxonData[prop] = val;
}
export function setFormFieldData(fLvl, field, val, type) {          /*dbug-log*///console.log('---setForm[%s]FieldData [%s] =? [%s]', fLvl, field, val);
    const fieldData = fState.forms[fLvl].fieldData;
    if (!fieldData[field]) { fieldData[field] = {} }
    if (type) { fieldData[field].type = type; }
    fieldData[field].val = val;
}
export function setFormEntityType(fLvl, type) {
    fState.forms[fLvl].entityType = type;
}
export function setOnFormCloseHandler(fLvl, hndlr) {
    fState.forms[fLvl].onFormClose = hndlr;
}
/* Note: Sub-group sel is removed from Object form for single-root realms. */
export function removeSelFromStateMemory(fLvl, fieldName) {
    const idx = fState.forms[fLvl].selElems.indexOf(fieldName);
    fState.forms[fLvl].selElems.splice(idx, 1);
}