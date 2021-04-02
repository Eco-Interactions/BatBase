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
import { _confg, _form, _state, alertFormIssue } from '~form';
/* ========================= INIT FORM-STATE ================================ */
/* ----------------------- STATE CORE --------------------------------------- */
/**
 * [initFormState description]
 * @param  {obj} p              Root-form params
 * @param  {str} p.action       Defaults to 'create'
 *
 * @param  {str} *p.name      Entity class
 * @param  {fnc} p.initCombos
 * @param  {fnc} p.onFormClose
 * @param  {fnc} p.submit
 *
 *
 * @return {obj}     Root form-state
 */
export function initFormState(p) {                                  /*dbug-log*///console.log("    #--initFormState params[%O] entity[%s] id?[%s] action[%s] ", p, p.name, p.id, (p.action || 'create'));
    const fS = getMainStateObj(p.name);
    p.confg = getEntityBaseConfg(p);
    return _db('getData', [p.confg.data[p.action]])
        .then(data => addRecordData(fS, data, p))
        .then(() => buildNewFormState(fS, p))
        .then(() => fS);
}
function getMainStateObj(entity) {
    return {
        forms: {},
        formLevels: ['top', 'sub', 'sub2'],
    };
}
function addRecordData(fS, data, p) {
    fS.records = data;
}
/* ======================= BUILD STATE ====================================== */
/* ----------------------- INIT --------------------------------------------- */
export function buildNewFormState(fS, p) {
    fS.forms[p.name] = p.group;
    fS.forms[p.group] = getBaseFormState(fS, p);
    return addEntityFormState(fS, fS.forms[p.group]);
}
function getBaseFormState(fS, p) {
    if (p.id) { data.editing = { core: p.id, detail: null }; }
    p.vals = p.id ? getEntityVals(fS, p) : (p.vals ? p.vals : {});
    return { ...p, ...getEntityBaseConfg(p) };
}
function getEntityBaseConfg(p) {
    if (!p.confg) { return _confg('getBaseConfg', [p.name, p.type]); }
    delete p.confg.data;
    const confg = { ...p.confg };
    delete p.confg;
    return confg;
}
/* ------------------------ EDIT FORM VALUES -------------------------------- */
function getEntityVals(fS, p) {
    return _form('getEditFieldValues', [fS.records, p.name, p.id, p.core]);
}
function getEntityData(data, name, id, cName) {
    const formEntity = cName ? cName : name
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
 * > combo - The field name of the form parent-combo.
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
 *     todo...
 */
function addEntityFormState(fS, f) {                                /*dbug-log*///console.log("    #--addEntityFormState entity[%s] params[%O] forms[%O]", f.name, f, fS);
    return initEntityState(fS, f)
        .then(() => finishEntityFormStateInit(fS, f));
}
function initEntityState(fS, f) {
    const map = {
        Citation: storeSourceData,
        Publication: storeSourceData,
        Subject: initTaxonState,
        Object: initTaxonState,
        Taxon: initTaxonState
    };
    if (!map[f.name]) { return Promise.resolve(); }
    return Promise.resolve(map[f.name](fS.records, f));
}
function finishEntityFormStateInit(fS, f) {                         /*dbug-log*///console.log("    --finishEntityFormStateInit form[%O]", f);
    f.vals = { ...f.vals, ..._state('getFieldValues', [f.group]) };
    const confg = _confg('buildInitConfg', [f]);
    delete f.vals;
    _confg('mergeIntoFormConfg', [confg, f]);
    f = confg;                                                      /*perm-log*/console.log('   >>> NEW FORM entity[%s][%O]', f.name, f);
    return f;
}
/* ___________________________ TAXON ________________________________________ */
export function initTaxonState(rcrds, f) {                          /*dbug-log*///console.log('   --initTaxonState rcrds[%O] f[%O]', rcrds, f);
    _state('setTaxonGroupState', [rcrds, f]);
}
/* ____________________________ SOURCE ______________________________________ */
function storeSourceData(rcrds, f) {                                /*dbug-log*///console.log('--storeSourceData rcrds[%O] f[%O]', rcrds, f);
    if (f.name !== 'Citation') { return; }
    if (!f.misc) { f.misc = {}; }
    initParentSourceFieldObj(f.fields);
    addPubDataToParentSourceField(rcrds, f, f.vals.ParentSource);
}
function initParentSourceFieldObj(fields) {
    fields.ParentSource = {};
    fields.ParentSource.misc = {};
}
function addPubDataToParentSourceField(rcrds, f, pId) {
    const pSrc = rcrds.source[pId];                                 /*dbug-log*///console.log('--addPubDataToParentSourceField [%s][%O]', pId, pSrc);
    const pub = rcrds.publication[pSrc.publication];
    const data = { pub: pub, pubType: pub.publicationType, src: pSrc };/*dbug-log*///console.log('--pubData[%O]', data);
    f.fields.ParentSource.misc = data;
}