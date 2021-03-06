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
 *
 *
 * Export
 *
 * TOC
 *
 */
import { _db, _u } from '~util';
import { _confg, alertFormIssue } from '~form';
/* ========================= INIT FORM-STATE ================================ */
/* ----------------------- STATE CORE --------------------------------------- */
export function initFormState(action, entity, id) {                 /*dbug-log*///console.log("    #--initFormState [%s][%s][%s]", action, entity, id);
    let fS = {}
    const dataKeys = getDataKeysForEntityRootForm(action, entity);
    fS.init = true; //eliminates possibility of opening form multiple times.
    return _db('getData', [dataKeys]).then(data => {
        initMainState(data);
        addEntityFormState(fS, entity, 'top', null, action);        /*perm-log*/console.log("       #### initFormState initState %O, curState %O", _u('snapshot', [fS]), fS);
        delete fS.init;
        return fS;
    });

    function initMainState(data) {
        fS = {
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
export function addEntityFormState(fS, entity, fLvl, pSel, action, vals) {/*dbug-log*///console.log("    #--addEntityFormState entity[%s] lvl[%s] pSel?[%s] action[%s] vals[%O] forms[%O]", entity, fLvl, pSel, action, vals, fS);
    fS.forms[entity] = fLvl;
    fS.forms[fLvl] = _confg('initFormConfg', [entity, fLvl, action, vals]);
    finishFormLevelInit(fS.forms[fLvl], pSel, action);              /*dbug-log*///console.log('   --finishFormLevelInit FINAL [%s][%O]', fLvl, fS);
}
function finishFormLevelInit(fState, pSel, action) {
    const p = {
        action: action,
        onFormClose: null,
        pSelId: pSel,
    };
    Object.assign(fState, p);
}
/* ___________________________ TAXON ________________________________________ */
export function initTaxonState(fState, fLvl, groupId, subGroupId) {
    return _db('getData', [['group', 'rankNames']])
        .then(data => setTxnState(data.group, data.rankNames));

    function setTxnState(groups, ranks) {
        const group = groups[groupId];                              /*dbug-log*///console.log('   #--initTaxonState subGroup[%s] group[%s] = %O ', subGroupId, groupId, group);
        const data = {
            groupName: group.displayName,
            groupId: groupId,
            groups: groups, // Used in edit form if new parent in different group
            subGroupId: subGroupId || Object.keys(group.subGroups)[0],
            subGroups: group.subGroups,
        };
        data.groupTaxon = taxa[group.subGroups[data.subGroupId].taxon];
        fState.misc = data;                                         /*perm-log*/console.log('       --[%s] stateData = %O', data.subGroups[data.subGroupId].name, data);
        handleSubGroupFieldState(data.subGroupId, Object.keys(subGroups).length);
        return data;
    }
    function handleSubGroupFieldState(sGroupId, sGroupCnt) {
        const shwn = sGroupCnt === 1;
        fState.fields['Sub-group'].shown = shwn;
        fState.fields['Sub-group'].value = shwn ? sGroupId : null;
    }
}
