/**
 * All form state data for the core form and any sub-forms.
 *
 * Export
 *     getFormEntity
 *     initFormState
 *     addEntityFormState
 *
 * TOC
 *     INIT FORM MEMORY
 *         STATE CORE
 *         FORM DATA
 *         ENTITY FORM
 *             TAXON
 *     GETTERS
 *         ENTITY RECORDS
 *         EDIT FORM
 *         TAXON
 *     SETTERS
 *         ENTITY FORM
 *             COMBOBOX
 *             TAXON
 */
import { _db, _u } from '~util';
import { alertFormIssue } from '~form';

let fState = {};

export function clearState() {
    fState = {};
}
/* ========================= INIT FORM-STATE ================================ */
/* ----------------------- STATE CORE --------------------------------------- */
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
/* ----------------------- FORM DATA ---------------------------------------- */
function getDataKeysForEntityRootForm(action, entity) {
    const map = {
        'author': {
            'edit': ['source', 'author']
        },
        'citation': {
            'edit': ['source', 'citation', 'author', 'publisher']
        },
        'interaction': {
            'create': ['author', 'citation', 'interactionType', 'location', 'publication',
                'publisher', 'source', 'tag', 'taxon', 'validInteraction'],
            'edit': ['author', 'citation', 'interaction', 'interactionType', 'location',
                'publication', 'publisher', 'source', 'tag', 'taxon', 'validInteraction'],
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
/* ----------------------- ENTITY FORM -------------------------------------- */
/**
 * Adds the properties and confg that will be used throughout the code for
 * generating, validating, and submitting entity sub-forms.
 *
 * -- Property descriptions:
 * > action - create || edit
 * > confg - The form config. See file for details.
 * > simple - All fields are shown unless simple default-display confg present
 * > entity - Name of this form's entity.
 * > onFormClose - Handles form exit/reset.
// * > fieldData - Obj with each form field (k) and it's (v) { value, fieldType }
 * > misc - Obj to hold the various special-case props
 * > pSelId - The id of the parent select of the form.
 * > reqElems - All required elements in the form.
 * > selElems - Contains all selElems until they are initialized with selectize.
 *
 * --- Entity-specific properties
 * > Citation forms:
 *         rcrds - { src: pubSrc, pub: pub } (parent publication)
 * > Interaction create form:
 *         unchanged - exists after form submit and before any changes
 *         valData - ValidInteraction data for the selected subject and object groups
 *             [{id, subjectSubGroup(id), objectSubGroup(id), interactionType(id), tags(id array)}]
 * > Location forms:
 *         geoJson - geoJson entity for this location, if it exists.
 * > Taxon forms:
 *         taxonData - added to fState.forms (see props @initTaxonParams)
 */
export function addEntityFormState(entity, level, pSel, action) {   /*dbug-log*/console.log("       #### addEntityFormState entity[%s] lvl[%s] pSel?[%s] action[%s]", entity, level, pSel, action);
    fState.forms[entity] = level;
    fState.forms[level] = {
        action: action,
        confg: {},
        entity: entity,
        onFormClose: null,
        pSelId: pSel,
        reqElems: [],
        selElems: [],
    };
}
/* ___________________________ TAXON ________________________________________ */
export function initTaxonState(groupId, subGroupId) {
    return _db('getData', [['group', 'rankNames']])
        .then(data => setTxnState(data.group, data.rankNames));

    function setTxnState(groups, ranks) {
        const group = groups[groupId];                              /*dbug-log*///console.log('initTaxonState subGroup[%s] group[%s] = %O ', subGroupId, groupId, group);
        const data = {
            groupName: group.displayName,
            groupId: groupId,
            groups: groups, // Used in edit form if new parent in different group
            subGroupId: subGroupId || Object.keys(group.subGroups)[0],
            subGroups: group.subGroups,
        };
        data.groupTaxon = fState.records.taxon[group.subGroups[data.subGroupId].taxon];
        fState.forms.taxonData = data;                              /*perm-log*/console.log('       --[%s] stateData = %O', data.subGroups[data.subGroupId].name, data);
        return data;
    }
}
/* ============================ GETTERS ===================================== */
export function getFormState() {
    return Object.keys(fState).length ? fState : false;
}
export function getStateProp(prop) {                                /*dbug-log*///console.log('args = %O, memory = %O', arguments, fState);
    return fState[prop];
}
export function getFormLvlState(fLvl) {
    return fState.forms[fLvl] ? fState.forms[fLvl] : false;
}
export function getFormParentId(fLvl) {
    return fState.forms[fLvl] ? fState.forms[fLvl].pSelId : false;
}
export function getFormEntity(fLvl) {
    return fState.forms[fLvl] ? fState.forms[fLvl].entity : false;
}
export function getFormProp(fLvl, prop) {                           /*dbug-log*///console.log('args = %O, memory = %O', arguments, fState);
    return fState.forms[fLvl] ? fState.forms[fLvl][prop] : false;
}
export function getFormConfg(fLvl, prop = null) {                   /*dbug-log*/console.log('getFormConfg [%s] prop?[%s] [%O]', fLvl, prop, fState.forms[fLvl].confg);
    if (!fState.forms[fLvl]) { return false; }
    const fConfg = fState.forms[fLvl].confg
    return prop ? fConfg[prop] : fConfg;
}
export function getFormFieldData(fLvl, field, prop) {
    const fData = fState.forms[fLvl].confg[field];
    return prop ? fData[prop] : fData;
}
export function getFormData(fLvl, field) {                          /*dbug-log*/console.log('getFormConfg [%s][%s] [%O]', fLvl, field, fState.forms[fLvl].confg.fields);
    if (!fState.forms) { return; } //form closing
    return fState.forms[fLvl].confg.fields[field].value;
}
/** Returns an object with field names(k) and values(v) of all form fields*/
export function getCurrentFormFieldVals(fLvl) {
    const fieldData = fState.forms[fLvl].fields;
    const vals = {};
    for (let field in fieldData) {
        vals[field] = fieldData[field].value;
    }                                                               /*dbug-log*/console.log('getCurrentFormFieldVals fields[%O] vals[%O]', fieldData, vals);
    return vals;
}
/* ----------------------- ENTITY RECORDS------------------------------------ */
export function getEntityRcrds(entity) {
    if (!fState.records) { return; } //form closing
    return typeof entity == 'string' ? fState.records[entity] : buildRcrdsObj(entity);
}
function buildRcrdsObj(entities) {
    const rcrds = {};
    entities.forEach(ent => { rcrds[ent] = fState.records[ent]});
    return rcrds;
}
/** Returns the record for the passed id and entity-type. */
export function getRcrd(entity, id) {
    if (!fState.records || !fState.records[entity]) { return; }
    const rcrd = fState.records[entity][id] ?
        _u('snapshot', [fState.records[entity][id]]) :
        alertFormIssue('noRcrdFound', {id: id, entity: entity });
    return rcrd ? rcrd : false;
}
/* ----------------------- EDIT FORM ---------------------------------------- */
export function isEditForm() {
    return fState.action === 'edit';
}
export function getEditEntityId(type) {
    return fState.editing[type];
}
/* --------------------------- TAXON ---------------------------------------- */
export function getGroupState() {
    return fState.forms.taxonData;
}
export function getTaxonProp(prop) {
    if (!fState.forms.taxonData) { return false; } //Form closed.
    const edge = {
        'subGroup': getSubGroupEntity
    };
    return prop in edge ? edge[prop]() : fState.forms.taxonData[prop];
}
function getSubGroupEntity() {
    return fState.forms.taxonData.subGroups[fState.forms.taxonData.subGroupId];
}
/* ============================ SETTERS ===================================== */
export function setStateProp(prop, val) {
    fState[prop] = val;
}
/**
 * Edge case: After form submit, the updated data is fetched and stored here, but
 * if the form is closed before the data is stored, cancel storing the data.
 */
export function addEntityRecords(entity, rcrds) {
    if (!fState.records) { return; } //See comment for explanation
    fState.records[entity] = rcrds;
}
/* ----------------------- ENTITY FORM -------------------------------------- */
export function setFormProp(fLvl, prop, val) {
    fState.forms[fLvl][prop] = val;
}
export function setFormConfg(fLvl, val, prop = null) {
    let fConfg = fState.forms[fLvl].confg;
    if (prop) { return fConfg[prop] = val; }
    fConfg = val;
}
export function setFieldState(fLvl, field, val, prop = null) {      /*dbug-log*/console.log('---set[%s]FormFieldData [%s] =? [%s]', fLvl, field, val);
    let fData = fState.forms[fLvl].confg.fields[field];
    if (prop) { return fData[prop] = val; }
    fData = val;
}
export function setOnFormCloseHandler(fLvl, hndlr) {
    fState.forms[fLvl].onFormClose = hndlr;
}
export function addRequiredFieldInput(fLvl, input) {
    fState.forms[fLvl].reqElems.push(input);
}
/* _________________________ COMBOBOX _______________________________________ */
export function addComboToFormState(fLvl, field) {                  /*dbug-log*/console.log('addComboTo[%s]Memory [%s]', fLvl, field);
    if (!fState.forms) { return; } //form was closed.
    fState.forms[fLvl].selElems.push(field);
}
/* Note: Sub-group sel is removed from for single-root taxon groups (no subGroups). */
export function removeSelFromStateMemory(fLvl, fieldName) {
    const idx = fState.forms[fLvl].selElems.indexOf(fieldName);
    fState.forms[fLvl].selElems.splice(idx, 1);
}
/* ___________________________ TAXON ________________________________________ */
export function setTaxonProp(prop, val) {
    if (!fState.forms.taxonData) { fState.forms.taxonData = {}; } //Edit-forms need specific props
    return fState.forms.taxonData[prop] = val;
}
/** When a new taxon parent is selected in the taxon edit-form, groups data is updated. */
export function setTaxonGroupData(taxon) {
    const txnData = fState.forms.taxonData;
    const group = txnData.groups[taxon.group.id];
    txnData.groupName = group.displayName;
    txnData.subGroupId = taxon.group.subGroup.id;
    txnData.subGroups = group.subGroups;
    txnData.groupTaxon = taxon;
}