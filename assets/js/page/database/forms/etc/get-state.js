/**
 * TODO: DOCUMENT
 *
 * Export
 *
 * TOC
 *     GET CORE STATE
 *         ENTITY RECORDS
 *         EDIT FORM
 *    GET FORM STATE
 *        FIELDS
 *        TAXON
 */
import { _db, _u } from '~util';
import { _confg, alertFormIssue } from '~form';

/* ============================ GET CORE STATE ============================== */
export function getStateProp(fS, prop) {                            /*dbug-log*///console.log('   --getStateProp  prop[%s], fS[%O]', prop, fS);
    return fS[prop];
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
    const r = fS.records[entity][id];
    return r ? _u('snapshot', [r]) : alertFormIssue('noRcrdFound', {id: id, entity: e });
}
/* ----------------------- EDIT FORM ---------------------------------------- */
export function getEditEntityId(fS, type) {
    return fS.editing[type];
}
/* ============================ GET FORM STATE ============================== */
export function getFormState(fState, prop = null) {                 /*dbug-log*///console.log('   --getFormState prop?[%s] [%O]', prop, fState);//console.trace();
    return prop ? fState[prop] : fState;
}
        //update throughout code
export function getFormEntity(fState, first = 'uc') {               /*dbug-log*///console.log('   --getFormEntity case[%s] [%O]', first, fState);//console.trace();
    return first === 'uc' ? fState.name : _u('lcfirst', [fState.name]);
}
/* -------------------------- FIELDS ---------------------------------------- */
export function getFieldData(fState, field, prop = 'value') {       /*dbug-log*///console.log('   --getFieldData field[%s] prop[%s] [%O]', field, prop, fState);//console.trace();
    return prop ? fState.fields[field][prop] : fState.fields[field];
}
export function getComboFields(fState) {                            /*dbug-log*///console.log('getComboFields [%O]', fState.fields);//console.trace();
    return Object.values(fState.fields).filter(f => f.combo);
}
/** Returns an object with field names(k) and values(v) of all form fields*/
export function getFieldValues(fState) {
    const vals = {};
    for (let name in fState.fields) {
        vals[name] = fState.fields[name].value;
    }                                                               /*dbug-log*///console.log('   --getFieldValues fields[%O] vals[%O]', name, vals);
    return vals;
}
/* --------------------------- TAXON ---------------------------------------- */
export function getGroupState(fState) {
    return fState.misc;
}
export function getTaxonProp(fState, prop) {
    const edge = {
        'subGroup': getSubGroupEntity
    };
    return prop in edge ? edge[prop](fState) : fState.misc[prop];
}
function getSubGroupEntity(fState) {
    return fState.misc.subGroups[fState.misc.subGroupId];
}