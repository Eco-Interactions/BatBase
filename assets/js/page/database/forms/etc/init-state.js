/**
 * -- Property descriptions:
 * > action - ie, Create, Edit.
 * > editing - Container for the id(s) of the record(s) being edited. (Detail
        ids are added later). False if not editing.
 * > entity - Name of this form's entity
 * > forms - Container for form-specific params
 * > levels - An array of the form level names/tags/prefixes/etc.
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
 * @param  {str} p.action
 *
 * @param  {str} *p.name      Entity class
 * @param  {fnc} p.initCombos
 * @param  {fnc} p.onFormClose
 * @param  {fnc} p.submit
 *
 *
 * @return {obj}     Root form-state
 */
export function initFormState(p) {                                  /*temp-log*/console.log("    #--initFormState params[%O] entity[%s] id?[%s] action[%s] ", _u('snapshot', [p]), p.name, p.id, p.action);
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
        levels: ['top', 'sub', 'sub2'],
    };
}
function addRecordData(fS, data, p) {
    fS.records = data;
}
/* ======================= BUILD STATE ====================================== */
/* ----------------------- INIT --------------------------------------------- */
export function buildNewFormState(fS, p) {                          /*temp-log*/console.log("    #--buildNewFormState fS[%O] params[%O]", fS, _u('snapshot', [p]));
    fS.forms[p.name] = p.group;
    fS.forms[p.group] = getBaseFormState(fS, p);
    setFieldInitValues(fS.records, fS.forms[p.group]);
    return addEntityFormState(fS, fS.forms[p.group]);
}
function getBaseFormState(fS, p) {
    if (p.id) { p.editing = { core: p.id, detail: null }; }
    return { ...p, ...getEntityBaseConfg(p) };
}
function getEntityBaseConfg(p) {
    if (!p.confg) { return _confg('getBaseConfg', [p.action, p.name, p.type]); }
    delete p.confg.data;
    const confg = { ...p.confg };
    delete p.confg;
    return confg;
}
/* ------------------------ FORM VALUES ------------------------------------- */
function setFieldInitValues(data, f) {
    if (f.id) { return _form('setEditFieldValues', [data, f]); }
    if (!f.vals) { return; }
    setInitValues(f.fields, f.vals);
    delete f.vals;
}
function setInitValues(fields, vals) {                              /*dbug-log*///console.log('--setFieldInitValues fields[%O] vals?[%O]', fields, vals);
    Object.keys(vals).forEach(setFieldInitValue);

    function setFieldInitValue(fName) {
        fields[fName].value = vals[fName];
    }
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
function addEntityFormState(fS, f) {                                /*temp-log*/console.log("    #--addEntityFormState entity[%s] params[%O] forms[%O]", f.name, _u('snapshot', [f]), fS);
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
function finishEntityFormStateInit(fS, f) {                         /*dbug-log*/console.log("    --finishEntityFormStateInit form[%O]", _u('snapshot', [f]));
    _confg('finishFormStateInit', [f]);                             /*perm-log*/console.log('   >>> NEW FORM entity[%s][%O]', f.name, _u('snapshot', [f]));
    return f;
}
/* ___________________________ TAXON ________________________________________ */
export function initTaxonState(rcrds, f) {                          /*dbug-log*///console.log('   --initTaxonState rcrds[%O] f[%O]', rcrds, f);
    _state('setTaxonGroupState', [rcrds, f]);
}
/* ____________________________ SOURCE ______________________________________ */
function storeSourceData(rcrds, f) {                                /*dbug-log*///console.log('--storeSourceData rcrds[%O] f[%O]', rcrds, f);
    if (f.name !== 'Citation') { return; }
    initParentSourceFieldObj(f.fields);
    addPubDataToParentSourceField(rcrds, f, f.fields.ParentSource.value);
}
function initParentSourceFieldObj(fields) {
    if (!fields.ParentSource) { fields.ParentSource = {}; }
    fields.ParentSource.misc = {};
}
function addPubDataToParentSourceField(rcrds, f, pId) {
    const pSrc = rcrds.source[pId];                                 /*dbug-log*///console.log('--addPubDataToParentSourceField [%s][%O]', pId, pSrc);
    const pub = rcrds.publication[pSrc.publication];
    const data = { pub: pub, pubType: pub.publicationType, src: pSrc };/*dbug-log*///console.log('--pubData[%O]', data);
    f.fields.ParentSource.misc = data;
}