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
import { _confg, _state, alertFormIssue } from '~form';
/* ========================= INIT FORM-STATE ================================ */
/* ----------------------- STATE CORE --------------------------------------- */
export function initFormState(action, entity, id) {                 /*dbug-log*///console.log("    #--initFormState action[%s] entity[%s] id?[%s]", action, entity, id);
    const fS = getMainStateObj(entity);
    const dataKeys = getDataKeysForEntityRootForm(action, entity);
    return _db('getData', [dataKeys])
        .then(data => addRecordDataToState(fS, data))
        .then(() => addEntityFormState(fS, entity, 'top', null, action, { entity: id }))
        .then(() => returnFinishedFormState(fS));
}
function getMainStateObj(entity) {
    return {
        entity: entity,
        forms: {},
        formLevels: ['top', 'sub', 'sub2'],
        init: true, //eliminates possibility of opening form multiple times.
    };
}
function addRecordDataToState(fS, data) {  console.log('addRecordDataToState')
    fS.records = data;
}
function returnFinishedFormState(fS) {                              /*perm-log*/console.log("       ####initState[%O] curState[%O]", _u('snapshot', [fS]), fS);
    delete fS.init;
    return fS;
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
            'create': ['author', 'citation', 'group', 'interactionType', 'location', 'publication',
                'publisher', 'rankNames', 'source', 'tag', 'taxon', 'validInteraction'],
            'edit': ['author', 'citation', 'group', 'interaction', 'interactionType', 'location',
                'publication', 'publisher', 'rankNames', 'source', 'tag', 'taxon', 'validInteraction'],
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
            'edit': ['group', 'rankNames', 'taxon']
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
    fS.forms[fLvl] = getBaseFormState(pSel, action);
    return initEntityState(fS, entity, fLvl, vals)
        .then(() => initEntityFormConfg(fS, entity, fLvl, action, vals));
}
function getBaseFormState(pSel, action) {
    return {
        action: action,
        editing: action === 'edit' ? { core: vals.entity || null, detail: null } : false,
        onFormClose: null,
        pSelId: pSel,
    };
}
function initEntityState(fS, entity, fLvl, vals) {
    const map = {
        // Citation: addPubData,
        Subject: initTaxonState,
        Object: initTaxonState,
        Taxon: initTaxonState
    };
    return Promise.resolve(map[entity] ? map[entity](fS, fLvl, vals) : null);
}
function initEntityFormConfg(fS, entity, fLvl, action, vals) {
    let fVals = _state('getFieldValues', [fLvl]);
    fVals = Object.keys(fVals).length ? fVals : vals;
    const confg = _confg('getInitFormConfg', [entity, fLvl, action, fVals]);
    _confg('mergeIntoFormConfg', [confg, fS.forms[fLvl]]);
    fS.forms[fLvl] = confg;                                         /*dbug-log*///console.log("    #--finalEntityFormState [%O]", confg);
}
/* ___________________________ TAXON ________________________________________ */
export function initTaxonState(fS, fLvl, vals) {                    /*dbug-log*///console.log('   --initTaxonState fLvl[%s] vals[%O] fS[%O]', fLvl, vals, fS);
    fS.forms[fLvl].fields = {};
    return _state('setTaxonGroupState', [fS, fLvl, vals]);
}
/* ___________________________ CITATION _____________________________________ */
// function addParentPubToFormState(pId) {
//     const pSrc = _state('getRcrd', ['source', pId]);                /*dbug-log*///console.log('addParentPubToFormState  [%s][%O]', pId, pSrc);
//     const pub = _state('getRcrd', ['publication', pSrc.publication]);
//     const data = { pub: pub, pubType: pub.publicationType, src: pSrc };/*dbug-log*///console.log('addParentPubToFormState[%O]', data);
//     _state('setFieldState', ['sub', 'ParentSource', data, 'misc']);
// }