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
 *         STATE PREDICATES
 *     SETTERS
 *         ENTITY FORM
 *             COMBOBOX
 *             TAXON
 */
import { _db, _u } from '~util';
import { _confg, alertFormIssue } from '~form';

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
            action: action,//
            editing: action === 'edit' ? { core: id || null, detail: null } : false,//
            entity: entity,//
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
 * > simple - All fields are shown unless simple default-display confg present
 * > entity - Name of this form's entity.
 * > onFormClose - Handles form exit/reset.
 * > misc - Obj to hold the various special-case props
 * > pSelId - The id of the parent select of the form.
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
export function addEntityFormState(entity, fLvl, pSel, action, vals) {/*dbug-log*/console.log("#### addEntityFormState entity[%s] lvl[%s] pSel?[%s] action[%s] vals[%O]", entity, fLvl, pSel, action, vals);
    fState.forms[entity] = fLvl;
    fState.forms[fLvl] = _confg('initFormConfg', [entity, fLvl, action, vals]);
    finishFormStateInit(pSel, action);

    function finishFormStateInit(pSel, action) {
        const p = {
            action: action,
            onFormClose: null,
            pSelId: pSel,
        };
        Object.assign(fState.forms[fLvl], p);                       /*dbug-log*/console.log('--finishFormStateInit FINAL [%s][%O]', fLvl, fState.forms[fLvl]);
    }
}
/* ___________________________ TAXON ________________________________________ */
export function initTaxonState(fLvl, groupId, subGroupId) {
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
        fState.forms.taxonData = data;                        /*perm-log*/console.log('       --[%s] stateData = %O', data.subGroups[data.subGroupId].name, data);
        // fState.forms[fLvl].taxonData = data;                        /*perm-log*/console.log('       --[%s] stateData = %O', data.subGroups[data.subGroupId].name, data);
        handleSubGroupFieldState(data.subGroupId, Object.keys(subGroups).length);
        return data;
    }
    function handleSubGroupFieldState(sGroupId, sGroupCnt) {
        const shwn = sGroupCnt === 1;
        fState.forms[fLvl].fields['Sub-group'].shown = shwn;
        fState.forms[fLvl].fields['Sub-group'].value = shwn ? sGroupId : null;
    }
}
/* ============================ GETTERS ===================================== */
export function getStateProp(prop) {                                /*dbug-log*///console.log('args = %O, memory = %O', arguments, fState);
    return fState[prop];
}
export function getFormParentId(fLvl) {
    return fState.forms[fLvl] ? fState.forms[fLvl].pSelId : false;
}
export function getFormComboFields(fLvl) {                          /*dbug-log*///console.log('getFormComboFields [%s]', fLvl);//console.trace();
    return Object.values(getFormFieldData(fLvl)).filter(f => f.combo);
}
export function getFormEntity(fLvl) {
    return fState.forms[fLvl] ? fState.forms[fLvl].entity : false;
}
export function getFormState(fLvl, prop = null) {
    if (!fState.forms || !fState.forms[fLvl]) { return false; }      /*dbug-log*/console.log('getFormState [%s] prop?[%s] [%O]', fLvl, prop, fState.forms[fLvl]);//console.trace();
    const fData = fState.forms[fLvl];
    return prop ? fData[prop] : fData;
}
export function getFormFieldData(fLvl, field, prop) {               /*dbug-log*///console.log('getFormFieldData [%s] field?[%s] prop?[%s] [%O]', fLvl, field, prop, fState.forms[fLvl]);//console.trace();
    if (!field) { return fState.forms[fLvl].fields; }
    const fData = fState.forms[fLvl].fields[field];
    return prop ? fData[prop] : fData;
}
export function getFormData(fLvl, field) {                          /*dbug-log*///console.log('getFormConfg [%s][%s] [%O]', fLvl, field, fState.forms[fLvl].confg.fields);
    if (!fState.forms) { return; } //form closing
    return fState.forms[fLvl].confg.fields[field].value;
}
/** Returns an object with field names(k) and values(v) of all form fields*/
export function getCurrentFormFieldVals(fLvl) {
    const fieldData = fState.forms[fLvl].fields;
    const vals = {};
    for (let field in fieldData) {
        vals[field] = fieldData[field].value;
    }                                                               /*dbug-log*///console.log('getCurrentFormFieldVals fields[%O] vals[%O]', fieldData, vals);
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
export function setFormState(fLvl, prop, val) {
    fState.forms[fLvl][prop] = val;
}
export function setFieldState(fLvl, field, val, prop = 'value') {   /*dbug-log*///console.log('---set[%s]FormFieldData [%s] =? [%s]', fLvl, field, val);
    let fData = fState.forms[fLvl].fields[field];
    if (!prop) { return fData = val; }
    fData[prop] = val;
}
export function setOnFormCloseHandler(fLvl, hndlr) {
    fState.forms[fLvl].onFormClose = hndlr;
}
export function addRequiredFieldInput(fLvl, input) {
    fState.forms[fLvl].reqElems.push(input);
}
/* ----------------- ON CHANGE UPDATE FIELD DISPLAY ------------------------- */
/** [onEntityTypeChangeUpdateConfg description] */
export function onEntityTypeChangeUpdateConfg(fLvl) {               /*dbug-log*///console.log('+--onTypeChangeUpdateStateConfgAndFields [%s]', fLvl);
    const vals = getCurrentFormFieldVals(fLvl);
    _confg('onEntityTypeChangeUpdateConfg', [fState.forms[fLvl], vals]);
}
/** [onFieldViewChangeUpdateConfg description] */
export function onFieldViewChangeUpdateConfg(fLvl) {
    const vals = getCurrentFormFieldVals(fLvl);
    _confg('onFieldViewChangeUpdateConfg', [fState.forms[fLvl], vals]);
}
/* _________________________ COMBOBOX _______________________________________ */
/* Note: Sub-group sel is removed from for single-root taxon groups (no subGroups). */
export function removeFieldFromComboInit(fLvl, fieldName) {
    const field = fState.forms[fLvl].fields[fieldName];
    field.combo = false;
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

/* ====================== STATE PREDICATES =================================== */
export function isEditForm() {
    return fState.action === 'edit';
}
/** [isFieldShown description] */
export function isFieldShown(fLvl, field) {                         /*dbug-log*///console.log('isFieldShown [%s][%O]', fLvl, field);
    if (Array.isArray(field)) { return areFieldsShown(fLvl, field); }
    const fConfg =  fState.forms[fLvl].fields[field]
    return fConfg ? fConfg.shown : false;
}
export function areFieldsShown(fLvl, fields) {
    return fields.map(f => isFieldShown(fLvl, f)).every(b=>b);
}