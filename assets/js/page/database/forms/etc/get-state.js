/**
 * TODO: DOCUMENT
 *
 * Export
 *
 * TOC
 *     GET CORE-STATE
 *         ENTITY RECORDS
 *         EDIT FORM
 *    GET FORM-STATE
 *        FIELDS
 *        TAXON
 */
import { _db, _u } from '~util';
import { _confg, alertFormIssue } from '~form';

/* ============================ GET CORE-STATE ====================================================================== */
export function getStateProp(fS, prop) {                            /*dbug-log*///console.log('   --getStateProp  prop[%s], fS[%O]', prop, fS);
    return prop ? fS[prop] : fS;
}

/** Returns the 'next' form level- either the parent or child. */
export function getFormLevel(fS, next, current) {                   /*dbug-log*/console.log('   --getFormLevel next[%s] current[%s]', next, current);
    const curIdx = fS.levels.indexOf(current);
    return next === 'parent' ? fS.levels[curIdx-1] : fS.levels[curIdx+1];
}
/**
 * Returns the sub form's lvl. If the top form is not the interaction form,
 * the passed form lvl is reduced by one and returned.
 * TODO: REPLAVE WITH (GETFORMSTATE, ENTITY)
 */
export function getSubFormLvl(fS, lvl) {
    if (fS.forms.top.name === 'Interaction') { return lvl; }
    return fS.levels[fS.levels.indexOf(lvl)-1];
}
/* ----------------------- ENTITY RECORDS------------------------------------ */
export function getEntityRcrds(fS, entity) {                        /*dbug-log*///console.log('   --getEntityRcrds  entity[%O], fS[%O]', entity, fS);
    return typeof entity == 'string' ? fS.records[entity] : buildRcrdsObj(fS, entity);
}
function buildRcrdsObj(fS, entities) {
    const rcrds = {};
    entities.forEach(ent => { rcrds[ent] = fS.records[ent]});
    return rcrds;
}
/** Returns the record for the passed id and entity-type. */
export function getRcrd(fS, e, id) {                                /*dbug-log*///console.log('   --getRcrd  entity[%s][%s] fS[%O]', e, id, fS);
    const r = fS.records[e][id];                                     /*dbug-log*///console.log('   --getRcrd  rcrd%O]', r);
    return r ? _u('snapshot', [r]) : alertFormIssue('noRcrdFound', {id: id, entity: e });
}
/* ----------------------- EDIT FORM ---------------------------------------- */
export function getEditEntityId(fS, type) {
    return fS.top.editing[type];
}
/* ============================ GET FORM-STATE ====================================================================== */
export function getFormState(fState, prop = null) {                 /*dbug-log*///console.log('   --getFormState prop?[%s] [%O]', prop, fState);//console.trace();
    return prop ? fState[prop] : fState;
}
        //update throughout code
export function getFormEntity(fState, first = 'uc') {               /*dbug-log*///console.log('   --getFormEntity case[%s] [%O]', first, fState);//console.trace();
    return first === 'uc' ? fState.name : _u('lcfirst', [fState.name]);
}
/* -------------------------- FIELDS ---------------------------------------- */
export function getFieldState(fState, field, prop = 'value') {       /*dbug-log*///console.log('   --getFieldState field[%s] prop[%s] fConfg[%O] fState[%O]', field, prop, fState.fields[field], fState);//console.trace();
    return prop ? fState.fields[field][prop] : fState.fields[field];
}
export function getComboFields(fState) {                            /*dbug-log*///console.log('getComboFields [%O]', fState.fields);//console.trace();
    return Object.values(fState.fields).filter(f => f.combo);
}
/** Returns an object with field names(k) and values(v) of all form fields*/
// export function getFieldValues(fState) {
//     const vals = {};
//     for (let name in fState.fields) {
//         if (!fState.fields[name].value) { continue; }
//         vals[name] = fState.fields[name].value;
//     }                                                               /*dbug-log*///console.log('   --getFieldValues fields[%O] vals[%O]', name, vals);
//     return vals;
// }
/* --------------------- STATE PREDICATES ----------------------------------- */
export function isEditForm(fState) {
    return fState.action === 'edit';
}
/** [isFieldShown description] */
export function isFieldShown(fState, field) {                       /*dbug-log*///console.log('   --isFieldShown [%O][%O]', field, fState);
    if (Array.isArray(field)) { return areFieldsShown(fState, field); }
    return fState.fields[field].shown || false;
}
export function areFieldsShown(fState, fields) {
    return fields.map(f => isFieldShown(fState, f)).every(b=>b);
}