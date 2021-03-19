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
/**
 * [initFormState description]
 * @param  {obj} p              Root-form params
 * @param  {obj} p.action       Defaults to 'create'
 * @param  {str} *p.entity      Entity class
 * @param  {fnc} p.initCombos
 * @param  {fnc} p.onFormClose
 * @param  {fnc} p.submit
 *
 *
 * @return {obj}     Root form-state
 */
export function initFormState(p) {                                  /*dbug-log*///console.log("    #--initFormState params[%O] entity[%s] id?[%s] action[%s] ", p, p.entity, p.id, (p.action || 'create'));
    const fS = getMainStateObj(p.entity);
    const dataKeys = getDataKeysForEntityRootForm(p.entity, p.action);
    p.fLvl = 'top';
    return _db('getData', [dataKeys])
        .then(data => fS.records = data)
        .then(() => addEntityFormState(fS, p))
        .then(() => fS);
}
function getMainStateObj(entity) {
    return {
        // entity: entity,
        forms: {},
        formLevels: ['top', 'sub', 'sub2'],
    };
}
/* ----------------------- FORM DATA ---------------------------------------- */
function getDataKeysForEntityRootForm(entity, action = 'create') {
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
    return map[_u('lcfirst', [entity])][action];
}
/* ----------------------- ENTITY FORM -------------------------------------- */
/**
 * Adds the properties and confg that will be used throughout the code for
 * generating, validating, and submitting entity sub-forms.
 *
 * -- Property descriptions: TODO: UPDATE
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
export function addEntityFormState(fS, p) {                         /*dbug-log*///console.log("    #--addEntityFormState entity[%s] params[%O] forms[%O]", p.entity, p, fS);
    fS.forms[p.entity] = p.fLvl;
    fS.forms[p.fLvl] = getBaseFormState(p);
    p.vals = p.vals ? p.vals : {};
    return initEntityState(fS, p.entity, p.fLvl, p.vals)
        .then(() => initEntityFormConfg(fS, p));
}
function getBaseFormState(p) {
    return {
        action: p.action ? p.action : 'create',
        editing: p.id ? { core: p.id, detail: null } : false,
        onFormClose: p.onFormClose,
        initCombos: p.initCombos,
        pSelId: p.pSel,
    };
}
function initEntityState(fS, entity, fLvl, vals = {}) {
    const map = {
        // Citation: addPubData,
        Subject: initTaxonState,
        Object: initTaxonState,
        Taxon: initTaxonState
    };
    return Promise.resolve(map[entity] ? map[entity](fS, fLvl, vals) : null);
}
function initEntityFormConfg(fS, p) {
    Object.assign(p.vals, _state('getFieldValues', [p.fLvl]));
    const confg = _confg('getInitFormConfg', [p.entity, p.fLvl, p.action, p.vals]);
    _confg('mergeIntoFormConfg', [confg, fS.forms[p.fLvl]]);
    fS.forms[p.fLvl] = confg;
    return confg;
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